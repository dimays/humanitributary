"""The domains queued and claimed tasks point at that have no rating, with counts: the evidence-pack job never
fetches them (docs/adr/0036-evidence-packs.md), so a source-discovery round reads their terms and rates them in the
admin (tier, fetch_policy, access_notes). No requests.

    manage.py unrated_domains                  # a table, most tasks first
    manage.py unrated_domains --json --limit 0 # every one, as JSON
"""

import json as jsonlib

from django.core.management.base import BaseCommand

from ingest import coverage


class Command(BaseCommand):
    help = "List the unrated domains that queued tasks cite or suggest, with task and URL counts (what to rate next)."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=50, help="How many rows (0: all).")
        parser.add_argument("--json", action="store_true")

    def handle(self, *args, limit, json: bool = False, **o):
        rows = coverage.unrated()
        rows = rows[:limit] if limit else rows
        if json:
            self.stdout.write(_dumps(rows))
            return
        self.stdout.write(f"{len(rows)} unrated domains (no Publisher row, or a row without a tier); the job fetches none of them.\n")
        self.stdout.write(f"{'tasks':>5} {'urls':>5}  {'row':<11} domain / example")
        for r in rows:
            self.stdout.write(f"{r['tasks']:>5} {r['urls']:>5}  {r['row']:<11} {r['domain']}  {r['example'][:100]}")


def _dumps(rows) -> str:
    return jsonlib.dumps(rows, indent=1, ensure_ascii=False)
