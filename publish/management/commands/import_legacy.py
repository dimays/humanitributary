"""`manage.py import_legacy`: load content in the snapshot shape into Postgres, leaving Revisions.

Since the cutover (ADR 0020) Postgres is the only source of truth and nothing imports the legacy files routinely.
Two uses remain, both explicit:

    manage.py import_legacy --archive            the frozen legacy files (archive/site-data/), dumped by
                                                 `node site/build.mjs --archive --dump-json`: what the cutover's
                                                 final import ran, and what CI loads as a realistic corpus
    manage.py import_legacy <content.json>       a dump or a release snapshot (a fresh database from a release)

Either one overwrites Postgres' content fields with the file's on every entry the file has (review state is kept:
AGENTS.md rule 7), so on a database where people and agents have edited content, run it with --dry-run first.
"""

import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from publish.legacy import ARCHIVE_DIR, changes, import_content


class Rollback(Exception):
    pass


def dump_archive(archive: Path = ARCHIVE_DIR) -> bytes:
    """The frozen legacy files, resolved by the site's own reader into the snapshot shape."""
    node = shutil.which("node")
    if not node:
        raise CommandError("Node is needed to read the archive (site/build.mjs --archive)")
    with tempfile.TemporaryDirectory(prefix="archive-") as tmp:
        out = Path(tmp) / "archive.json"
        r = subprocess.run([node, str(settings.SITE_DIR / "build.mjs"), "--archive", str(archive), "--dump-json", str(out)], capture_output=True, text=True)
        if r.returncode != 0:
            raise CommandError(f"site/build.mjs --archive failed:\n{(r.stdout + r.stderr)[-2000:]}")
        return out.read_bytes()


class Command(BaseCommand):
    help = ("Load content in the snapshot shape into Postgres, leaving Revisions: --archive for the frozen legacy files "
            "(archive/site-data/), or a content file (a dump or a release's content.json). Idempotent.")

    def add_arguments(self, parser):
        parser.add_argument("dump", nargs="?", default="", help="A content file (a release's content.json, or a dump); omit with --archive")
        parser.add_argument("--archive", action="store_true", help="Read the frozen legacy files in archive/site-data/ (via node site/build.mjs --archive).")
        parser.add_argument("--globe", default=str(settings.SITE_DIR / "globe-assets.json"), help="globe-assets.json, for the paleo pins ('' to skip)")
        parser.add_argument("--retract-missing", action="store_true", help="Retract published entries that the file does not have (everything written in Postgres alone, after the cutover).")
        parser.add_argument("--dry-run", action="store_true", help="Report what would change, then roll back.")

    def handle(self, *args, dump, archive, globe, retract_missing, dry_run, **opts):
        if bool(dump) == archive:
            raise CommandError("name one source: a content file, or --archive for the frozen legacy files")
        raw = dump_archive() if archive else Path(dump).read_bytes()
        name = "archive/site-data" if archive else Path(dump).name
        data = json.loads(raw)
        if not isinstance(data, dict) or "branches" not in data or "events" not in data:
            raise CommandError(f"{name} is not content (expected branches and events)")
        globe_data = json.loads(Path(globe).read_text()) if globe and Path(globe).exists() else None
        reason = f"import_legacy {name} sha256:{hashlib.sha256(raw).hexdigest()[:12]}"
        try:
            with transaction.atomic():
                stats = import_content(data, reason=reason, globe=globe_data, retract_missing=retract_missing)
                if dry_run:
                    raise Rollback
        except Rollback:
            pass
        for k in sorted(stats):
            if stats[k]:
                self.stdout.write(f"  {k:28} {stats[k]}")
        n = changes(stats)
        verb = "would write" if dry_run else "wrote"
        self.stdout.write(self.style.SUCCESS(f"{len(data['branches'])} branches, {len(data['events'])} events: {verb} {n} rows"))
        if stats["entry.not_in_dump"]:
            self.stdout.write(self.style.WARNING(f"{stats['entry.not_in_dump']} published entries are not in {name} (--retract-missing retracts them)"))
