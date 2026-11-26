import hashlib
import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from publish.legacy import changes, import_content


class Rollback(Exception):
    pass


class Command(BaseCommand):
    help = "Upsert the static site's resolved content (node site/build.mjs --dump-json) into Postgres, leaving Revisions."

    def add_arguments(self, parser):
        parser.add_argument("dump", help="JSON written by `node site/build.mjs --dump-json <file>`")
        parser.add_argument("--globe", default=str(settings.SITE_DIR / "globe-assets.json"), help="globe-assets.json, for the paleo pins ('' to skip)")
        parser.add_argument("--retract-missing", action="store_true", help="Retract published entries that the dump no longer has.")
        parser.add_argument("--dry-run", action="store_true", help="Report what would change, then roll back.")

    def handle(self, *args, dump, globe, retract_missing, dry_run, **opts):
        raw = Path(dump).read_bytes()
        data = json.loads(raw)
        if not isinstance(data, dict) or "branches" not in data or "events" not in data:
            raise CommandError(f"{dump} is not a content dump (expected branches and events)")
        globe_data = json.loads(Path(globe).read_text()) if globe and Path(globe).exists() else None
        reason = f"import_legacy {Path(dump).name} sha256:{hashlib.sha256(raw).hexdigest()[:12]}"
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
            self.stdout.write(self.style.WARNING(f"{stats['entry.not_in_dump']} published entries are not in the dump (--retract-missing retracts them)"))
