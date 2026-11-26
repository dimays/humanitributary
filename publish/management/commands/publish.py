from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from publish import gates, release as releases


class Command(BaseCommand):
    help = ("Publish the published content as an immutable release in the releases store (content.json, manifest, change "
            "report, built page) and point releases/latest.json at it; refuses unless every release gate passes. "
            "--rollback <version> repoints latest instead.")

    def add_arguments(self, parser):
        parser.add_argument("--notes", default="")
        parser.add_argument("--actor", default="job:publish")
        parser.add_argument("--force", action="store_true", help="Make a new release even if content is unchanged.")
        parser.add_argument("--legacy", default="", help="A legacy dump the snapshot must equal on every legacy key (until the cutover: var/legacy.json).")
        parser.add_argument("--check", action="store_true", help="Run the gates and write nothing.")
        parser.add_argument("--rollback", metavar="VERSION", default="", help="Point latest at an earlier release.")

    def handle(self, *args, notes, actor, force, legacy, check, rollback, **opts):
        if rollback:
            try:
                r = releases.rollback(rollback, actor=actor)
            except ValueError as e:
                raise CommandError(str(e)) from e
            self.stdout.write(self.style.SUCCESS(f"latest → {r.version} (sha256 {r.content_hash[:12]}…). Mirror it with `make release-pull`."))
            return
        try:
            release, created = releases.publish(actor=actor, notes=notes, force=force, legacy=Path(legacy) if legacy else None, check_only=check)
        except gates.PublishRefused as e:
            raise CommandError(str(e)) from e
        if check:
            self.stdout.write(self.style.SUCCESS("Every release gate passes (nothing written)."))
            return
        if not created:
            self.stdout.write(f"Unchanged since {release.version}: releases:{release.snapshot_path}")
            return
        c = release.counts
        self.stdout.write(self.style.SUCCESS(f"Release {release.version}: {c['branches']} branches, {c['events']} events, {c['citations']} citations, "
                                             f"{c.get('single_source_events', 0)} single-source events"))
        self.stdout.write(f"  releases:{release.snapshot_path}\n  sha256 {release.content_hash}\n  latest → {release.version}")
