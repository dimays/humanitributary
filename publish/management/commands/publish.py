from django.core.management.base import BaseCommand, CommandError

import json

from infra import storage
from publish import gates, release as releases
from publish.changes import page_summary


class Command(BaseCommand):
    help = ("Publish the published content as an immutable release in the releases store (content.json, manifest, change "
            "report, built page) and point releases/latest.json at it; refuses unless every release gate passes. "
            "--rollback <version> repoints latest instead.")

    def add_arguments(self, parser):
        parser.add_argument("--notes", default="")
        parser.add_argument("--actor", default="job:publish")
        parser.add_argument("--force", action="store_true", help="Make a new release even if content and page are unchanged.")
        parser.add_argument("--check", action="store_true", help="Run the gates (deterministic, build, contested) and show the change report a release would carry; write nothing.")
        parser.add_argument("--rollback", metavar="VERSION", default="", help="Point latest at an earlier release.")

    def handle(self, *args, notes, actor, force, check, rollback, **opts):
        if rollback:
            try:
                r = releases.rollback(rollback, actor=actor)
            except ValueError as e:
                raise CommandError(str(e)) from e
            self.stdout.write(self.style.SUCCESS(f"latest → {r.version} (sha256 {r.content_hash[:12]}…). Mirror it with `make release-pull`."))
            return
        try:
            if check:
                report = releases.check()
            else:
                release, created = releases.publish(actor=actor, notes=notes, force=force)
        except gates.PublishRefused as e:
            raise CommandError(str(e)) from e
        if check:
            t = report["total"]
            self.stdout.write(self.style.SUCCESS(f"Every release gate passes ({', '.join(gates.GATES)}; nothing written). "
                                                 f"Against {report['from'] or 'no release yet'}: {t['added']} added, {t['changed']} changed, {t['retracted']} retracted; "
                                                 f"{page_summary(report)}."))
            return
        if not created:
            self.stdout.write(f"Unchanged since {release.version} (content and page): releases:{release.snapshot_path}")
            return
        try:
            summary = page_summary(json.loads(storage.read(storage.RELEASES, storage.release_key(release.version, "changes.json"))))
        except (FileNotFoundError, OSError, ValueError):
            summary = ""
        c = release.counts
        self.stdout.write(self.style.SUCCESS(f"Release {release.version}: {c['branches']} branches, {c['events']} events, {c['citations']} citations, "
                                             f"{c.get('single_source_events', 0)} single-source events" + (f"; {summary}" if summary else "")))
        self.stdout.write(f"  releases:{release.snapshot_path}\n  sha256 {release.content_hash}\n  latest → {release.version}")
