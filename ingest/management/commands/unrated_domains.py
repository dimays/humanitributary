"""The unrated domains, two ways, with counts: what a source-discovery round rates next (in the admin: tier,
fetch_policy, access_notes), terms first. No requests.

- Cited by tasks: the domains queued and claimed tasks point at that have no rating. The evidence-pack job never
  fetches them (docs/adr/0036-evidence-packs.md).
- Asked by agents: the domains agents asked `GET /api/agent/policy?url=` about and were refused as unrated, most
  lookups first, with first and last seen and the latest URL (ingest.UnratedLookup, ADR 0045). Domains rated since
  are left out.

    manage.py unrated_domains                  # both tables
    manage.py unrated_domains --json --limit 0 # every one, as JSON: {"cited_by_tasks": [...], "asked_by_agents": [...]}
"""

import json as jsonlib

from django.core.management.base import BaseCommand

from agentapi.policy import unrated_lookups
from ingest import coverage


class Command(BaseCommand):
    help = "List the unrated domains that queued tasks cite and that agents asked GET policy about, with counts (what to rate next)."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=50, help="How many rows in each list (0: all).")
        parser.add_argument("--json", action="store_true")

    def handle(self, *args, limit, json: bool = False, **o):
        rows = coverage.unrated()
        rows = rows[:limit] if limit else rows
        asked = unrated_lookups(limit or None)
        if json:
            self.stdout.write(_dumps({"cited_by_tasks": rows, "asked_by_agents": asked}))
            return
        self.stdout.write(f"{len(rows)} unrated domains cited by queued tasks (no Publisher row, or a row without a tier); the job fetches none of them.\n")
        self.stdout.write(f"{'tasks':>5} {'urls':>5}  {'row':<11} domain / example")
        for r in rows:
            self.stdout.write(f"{r['tasks']:>5} {r['urls']:>5}  {r['row']:<11} {r['domain']}  {r['example'][:100]}")
        self.stdout.write(f"\n{len(asked)} unrated domains agents asked GET policy about and were refused, most asked first.\n")
        self.stdout.write(f"{'asked':>5}  {'first seen':<10} {'last seen':<16} domain / latest URL")
        for r in asked:
            self.stdout.write(f"{r['lookups']:>5}  {r['first_seen'][:10]:<10} {r['last_seen'][:16].replace('T', ' '):<16} {r['domain']}  {r['example'][:100]}")


def _dumps(rows) -> str:
    return jsonlib.dumps(rows, indent=1, ensure_ascii=False)
