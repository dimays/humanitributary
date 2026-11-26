"""Branch governance (docs/branch-rules.md). Jobs: `metrics` and `review` (deterministic, no LLM). Decisions: `apply`,
`reject`, `revert` (an agent or the owner, after reading the proposal's review_branch_proposal task).

    manage.py branches metrics [--today YYYY-MM-DD]          # a BranchMetric snapshot per branch (when changed)
    manage.py branches review [--today …] [--dry-run]        # run the rules; create / refresh proposals and tasks
    manage.py branches list [--status proposed]              # proposals
    manage.py branches show 12                               # one proposal, with its operations
    manage.py branches apply 12 --agent agent:me [--ops final-ops.json] [--task 40]
    manage.py branches reject 12 --agent agent:me --note "why"
    manage.py branches revert 12 --agent agent:me [--force]
"""

import json
from datetime import date
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from governance import operations, review
from governance.models import BranchProposal
from revisions.context import ACTOR_RE


def _date(s):
    return date.fromisoformat(s) if s else None


class Command(BaseCommand):
    help = "Branch metrics, the branch rules' proposals, and applying or reverting them."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest="action", required=True)
        p = sub.add_parser("metrics")
        p.add_argument("--today")
        p = sub.add_parser("review")
        p.add_argument("--today")
        p.add_argument("--dry-run", action="store_true")
        p.add_argument("--json", action="store_true", help="Print the whole result as JSON.")
        p = sub.add_parser("list")
        p.add_argument("--status")
        p = sub.add_parser("show")
        p.add_argument("id", type=int)
        for name in ("apply", "reject", "revert"):
            p = sub.add_parser(name)
            p.add_argument("id", type=int)
            p.add_argument("--agent", required=True, help='"agent:<name>" or "human:<username>"')
            p.add_argument("--task", type=int)
            p.add_argument("--note", default="")
            if name == "apply":
                p.add_argument("--ops", help="The final operations (JSON list), with the fields the proposal left to the agent written in.")
            if name == "revert":
                p.add_argument("--force", action="store_true", help="Even if rows it changed have changed since.")

    def handle(self, *args, action, **o):
        if action == "metrics":
            self.stdout.write(json.dumps(review.snapshot(_date(o["today"]))))
        elif action == "review":
            out = review.review(_date(o["today"]), dry_run=o["dry_run"])
            if o["json"]:
                self.stdout.write(json.dumps(out, indent=1))
            else:
                self.stdout.write(f"{out['rules_version']} ({out['today']}): {out['counts']}{' (dry run)' if out['dry_run'] else ''}")
                for f in out["findings"]:
                    self.stdout.write(f"  {f['rule']:<18} {f['result']:<16} {f['summary']}")
        elif action == "list":
            qs = BranchProposal.objects.all()
            if o["status"]:
                qs = qs.filter(status=o["status"])
            for p in qs.order_by("id"):
                self.stdout.write(f"#{p.pk:<4} {p.status:<9} {p.rule_id:<18} {p.branch.slug if p.branch_id else '(new)':<28} {p.summary[:110]}")
        elif action == "show":
            p = self._get(o["id"])
            self.stdout.write(json.dumps({"id": p.pk, "kind": p.kind, "status": p.status, "rule": p.rule_id, "branch": p.branch.slug if p.branch_id else None,
                                          "others": [b.slug for b in p.other_branches.all()], "summary": p.summary, "payload": p.payload,
                                          "evidence": p.evidence, "decided_by": p.decided_by, "decision_note": p.decision_note}, indent=1, default=str))
        else:
            agent = o["agent"]
            if not ACTOR_RE.match(agent) or agent.startswith("job:"):
                raise CommandError('--agent must be "agent:<name>" or "human:<username>": decisions are not made by jobs')
            p = self._get(o["id"])
            try:
                if action == "apply":
                    ops = json.loads(Path(o["ops"]).read_text()) if o["ops"] else None
                    out = operations.apply(p, ops, actor=agent, task=o["task"], note=o["note"])
                    self.stdout.write(json.dumps({k: v for k, v in out.items() if k != "operations"}))
                elif action == "reject":
                    if p.status not in ("proposed", "accepted"):  # an agent's accepted operations may still be turned down
                        raise CommandError(f"proposal {p.pk} is {p.status}")
                    p.status, p.decided_by, p.decided_at, p.decision_note = "rejected", agent, timezone.now(), o["note"]
                    p.save(update_fields=["status", "decided_by", "decided_at", "decision_note"])
                    self.stdout.write(json.dumps({"id": p.pk, "status": p.status}))
                else:
                    out = operations.revert(p, actor=agent, task=o["task"], force=o["force"])
                    self.stdout.write(json.dumps(out))
            except operations.OperationError as e:
                raise CommandError(str(e)) from e

    def _get(self, pk):
        p = BranchProposal.objects.filter(pk=pk).first()
        if p is None:
            raise CommandError(f"no proposal #{pk}")
        return p
