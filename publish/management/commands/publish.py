from django.conf import settings
from django.core.management.base import BaseCommand

from publish.release import publish


class Command(BaseCommand):
    help = "Export published content to var/releases/<version>/content.json (and releases/latest) and record a Release."

    def add_arguments(self, parser):
        parser.add_argument("--notes", default="")
        parser.add_argument("--actor", default="job:publish")
        parser.add_argument("--force", action="store_true", help="Make a new release even if content is unchanged.")

    def handle(self, *args, notes, actor, force, **opts):
        release, created = publish(actor=actor, notes=notes, force=force)
        path = settings.VAR_DIR / release.snapshot_path
        if not created:
            self.stdout.write(f"Unchanged since {release.version}: {path}")
            return
        c = release.counts
        self.stdout.write(self.style.SUCCESS(f"Release {release.version}: {c['branches']} branches, {c['events']} events, {c['citations']} citations"))
        self.stdout.write(f"  {path}\n  sha256 {release.content_hash}")
