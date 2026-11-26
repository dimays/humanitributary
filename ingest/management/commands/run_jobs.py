"""Run every due ingestion job once (docs/adr/0012-ingestion.md). The scheduler's one entry point:

    manage.py run_jobs                  # what's due, in registry order, under the runner lock
    manage.py run_jobs --only portal,process
    manage.py run_jobs --list           # the registry, with each job's interval and when it's next due
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from ingest import jobs


class Command(BaseCommand):
    help = "Run whatever ingestion jobs are due (lock: one runner at a time). Every run is a FetchRun."

    def add_arguments(self, parser):
        parser.add_argument("--only", default="", help="Comma-separated job names.")
        parser.add_argument("--list", action="store_true")

    def handle(self, *args, only, list, **o):
        jobs._load_registry()
        if list:
            now = timezone.now()
            for j in jobs.REGISTRY.values():
                if j.feed:
                    for f in jobs.feeds_for(j.name, enabled_only=False).order_by("name"):
                        due = "due" if jobs.is_due(j, now, f) else (f"next {f.next_run_at:%Y-%m-%d %H:%M}" if f.next_run_at else (f.config or {}).get("disabled_reason", "disabled")[:40])
                        self.stdout.write(f"{j.name:22} {f.interval_minutes:>6}m  {'on ' if f.enabled else 'off'}  {due:22} {f.name}")
                else:
                    self.stdout.write(f"{j.name:22} {j.interval:>6}m  on   {'due' if jobs.is_due(j, now) else 'not due':22} {j.doc}")
            return
        runs = jobs.run_due(only=[s for s in only.split(",") if s] or None, log=self.stdout.write)
        if runs is None:
            return
        failed = [r for r in runs if r.status == "failed"]
        self.stdout.write(f"{len(runs)} run(s), {len(failed)} failed")
