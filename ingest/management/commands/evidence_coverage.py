"""How many queued tasks have a non-Wikipedia source pre-fetched, by kind, region and era, and which hosts and
reasons leave pages to read by hand (ingest/coverage.py, docs/adr/0036-evidence-packs.md). No requests.

    manage.py evidence_coverage                 # Markdown to stdout
    manage.py evidence_coverage --out var/      # also var/evidence-coverage-<date>.md and .json
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from ingest import coverage


class Command(BaseCommand):
    help = "Report evidence-pack coverage of the queued tasks (by kind, region, era) and the unreadable hosts and reasons."

    def add_arguments(self, parser):
        parser.add_argument("--out", default="", help="A directory to write evidence-coverage-<date>.md and .json into (var/ is gitignored).")

    def handle(self, *args, out, **o):
        r = coverage.report()
        md = coverage.markdown(r)
        self.stdout.write(md)
        if out:
            d = Path(out)
            d.mkdir(parents=True, exist_ok=True)
            stem = d / f"evidence-coverage-{timezone.now():%Y-%m-%d}"
            stem.with_suffix(".md").write_text(md + "\n")
            stem.with_suffix(".json").write_text(json.dumps(r, indent=1, ensure_ascii=False, default=str) + "\n")
            self.stderr.write(f"wrote {stem}.md and .json")
