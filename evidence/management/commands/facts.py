"""The fact base's jobs and the agents' door to evidence (docs/fact-checking.md).

    manage.py facts sweep [--today YYYY-MM-DD] [--dry-run] [--no-split] [--no-tasks]   # the self-healing loop (job)
    manage.py facts sweep --junk-actors --dry-run [--sample 20]                        # report junk actor claims; writes nothing
    manage.py facts report [--today …] [--brief]                                        # health, as Markdown
    manage.py facts check <slug>                                                         # may this entry be published?
    manage.py facts record --claim 812 --url https://… --stance supports --excerpt "…" --agent agent:me [--task 42]
    manage.py facts publish <slug> --agent agent:me [--task 42] [--override "why"]       # publish under the rule
"""

import json
from datetime import date

from django.core.management.base import BaseCommand, CommandError

from revisions import revising
from revisions.context import ACTOR_RE
from timeline.models import Entry

from evidence import health, publishing, sweep
from evidence.models import Claim
from evidence.services import STANCES, record_evidence


def _date(s):
    return date.fromisoformat(s) if s else None


class Command(BaseCommand):
    help = "Sweep the fact base (recompute, schedule rechecks, queue tasks), report its health, record evidence."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest="action", required=True)
        p = sub.add_parser("sweep")
        p.add_argument("--today", help="Run as of this date (default: today).")
        p.add_argument("--dry-run", action="store_true", help="Compute everything, then roll back.")
        p.add_argument("--no-split", action="store_true", help="Skip deriving atomic claims.")
        p.add_argument("--no-tasks", action="store_true", help="Skip queueing verify_claim tasks.")
        p.add_argument("--junk-actors", action="store_true",
                       help="Only report the actor claims the splitter now rejects (count by reason, a sample); needs --dry-run, writes nothing.")
        p.add_argument("--sample", type=int, default=20, help="With --junk-actors: how many junk claims without evidence to list.")
        p = sub.add_parser("report")
        p.add_argument("--today")
        p.add_argument("--brief", action="store_true", help="Without the era and region tables.")
        p = sub.add_parser("check")
        p.add_argument("slug")
        p = sub.add_parser("record")
        p.add_argument("--claim", type=int, required=True)
        p.add_argument("--url", required=True)
        p.add_argument("--stance", choices=STANCES, required=True)
        p.add_argument("--excerpt", default="")
        p.add_argument("--title", default="")
        p.add_argument("--method", default="agent_read", choices=["agent_read", "browser_read", "human", "fetch_match"])
        p.add_argument("--found", help='What the source says, as JSON (e.g. {"y": 1951.3}).')
        p.add_argument("--agent", required=True)
        p.add_argument("--task", type=int)
        p = sub.add_parser("publish")
        p.add_argument("slug")
        p.add_argument("--agent", required=True)
        p.add_argument("--task", type=int)
        p.add_argument("--override", default="", help="Publish despite the rule, with this reason (recorded in the Revision).")

    def handle(self, *args, action, **o):
        if action == "sweep" and o["junk_actors"]:
            if not o["dry_run"]:
                raise CommandError("--junk-actors is a report: add --dry-run (it never deletes; removing junk claims is the owner's decision)")
            self.stdout.write(json.dumps(sweep.junk_actors(o["sample"]), indent=1, ensure_ascii=False))
        elif action == "sweep":
            out = sweep.sweep(_date(o["today"]), split=not o["no_split"], tasks=not o["no_tasks"], dry_run=o["dry_run"])
            self.stdout.write(json.dumps(out, indent=1, sort_keys=True))
        elif action == "report":
            self.stdout.write(health.markdown(health.collect(_date(o["today"])), detail=not o["brief"]))
        elif action == "check":
            entry = Entry.objects.filter(slug=o["slug"]).first() or self._fail(f"no entry {o['slug']}")
            self.stdout.write(json.dumps({"slug": entry.slug, "status": entry.status, "problems": publishing.problems(entry)}, indent=1))
        elif action == "record":
            agent = self._agent(o["agent"])
            claim = Claim.objects.filter(pk=o["claim"]).first() or self._fail(f"no claim {o['claim']}")
            with revising(agent, reason=f"facts record: claim {claim.pk} {o['stance']}", task=o["task"]):
                ev = record_evidence(claim, url=o["url"], stance=o["stance"], excerpt=o["excerpt"], title=o["title"], method=o["method"],
                                     checked_by=agent, found_value=json.loads(o["found"]) if o["found"] else None)
            claim.refresh_from_db()
            self.stdout.write(json.dumps({"evidence": ev.pk, "claim": claim.pk, "status": claim.status, "confidence": claim.confidence}))
        elif action == "publish":
            agent = self._agent(o["agent"])
            try:
                with revising(agent, reason=f"publish {o['slug']}", task=o["task"]):
                    r = publishing.publish_entry(o["slug"], override=o["override"])
            except publishing.PublishBlocked as e:
                raise CommandError(f"not published: {e}") from e
            self.stdout.write(json.dumps({"slug": o["slug"], "result": r}))

    def _agent(self, a):
        if not ACTOR_RE.match(a):
            raise CommandError('--agent must look like "agent:<name>" or "human:<username>"')
        return a

    def _fail(self, msg):
        raise CommandError(msg)
