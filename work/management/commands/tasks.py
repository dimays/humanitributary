"""The agents' door to the queue. Every subcommand prints JSON, so an agent can read it back.

    manage.py tasks next --kind verify_claim --claim --agent agent:claude-1   # lease the best task (or print null)
    manage.py tasks complete 42 --result result.json --agent agent:claude-1
    manage.py tasks fail 42 --error "page gone" --agent agent:claude-1
    manage.py tasks release 42 --agent agent:claude-1 [--reason "…"] [--defer-minutes 60] [--needs browser|owner]
    manage.py tasks extend 42 --minutes 30 --agent agent:claude-1
    manage.py tasks list [--status queued] [--kind …]
    manage.py tasks add verify_claim --entry me-hastings --payload '{"field": "date"}' --by human:david
"""

import json
import os
import sys
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from revisions.context import ACTOR_RE
from timeline.models import Entry
from work import queue
from work.models import AgentTask


def _agent(value: str) -> str:
    agent = value or os.getenv("HUMANITRIBUTARY_AGENT", "")
    if not ACTOR_RE.match(agent):
        raise CommandError('name yourself with --agent "agent:<name>" (or HUMANITRIBUTARY_AGENT)')
    return agent


class Command(BaseCommand):
    help = "Claim, complete, fail, release, extend, list and add agent tasks (prints JSON)."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest="action", required=True)
        p = sub.add_parser("next")
        p.add_argument("--kind", action="append", help="Only these kinds (repeatable).")
        p.add_argument("--claim", action="store_true", help="Lease it (otherwise just show it).")
        p.add_argument("--agent", default="")
        p.add_argument("--lease", type=int, help="Lease minutes (default TASK_LEASE_MINUTES).")
        for name in ("complete", "fail", "release", "extend"):
            p = sub.add_parser(name)
            p.add_argument("id", type=int)
            p.add_argument("--agent", default="")
            if name == "complete":
                p.add_argument("--result", required=True, help="A JSON file ('-' for stdin).")
            if name == "fail":
                p.add_argument("--error", required=True)
                p.add_argument("--no-retry", action="store_true")
            if name == "extend":
                p.add_argument("--minutes", type=int)
            if name == "release":  # deferred (ADR 0042): not offered again for --defer-minutes
                p.add_argument("--reason", default="")
                p.add_argument("--defer-minutes", type=int, help=f"0 to {queue.MAX_DEFER_MINUTES} (default {queue.DEFAULT_DEFER_MINUTES}; {queue.NEEDS_DEFER_MINUTES} with --needs).")
                p.add_argument("--needs", choices=queue.NEEDS, default="", help="A person must act first: a browser read, or the owner's decision.")
        p = sub.add_parser("list")
        p.add_argument("--status", default="")
        p.add_argument("--kind", default="")
        p.add_argument("--limit", type=int, default=50)
        p = sub.add_parser("add")
        p.add_argument("kind", choices=AgentTask.Kind.values)
        p.add_argument("--entry", help="Target entry slug.")
        p.add_argument("--ref", default="")
        p.add_argument("--payload", default="{}")
        p.add_argument("--priority", type=int, default=0)
        p.add_argument("--dedupe", default="")
        p.add_argument("--by", required=True, help='Who queues it: "human:<name>", "job:<name>" or "agent:<name>".')

    def out(self, obj):
        self.stdout.write(json.dumps(obj, indent=1, ensure_ascii=False))

    def handle(self, *args, action, **o):
        try:
            if action == "next":
                agent = _agent(o["agent"]) if o["claim"] else (o["agent"] or "")
                task = queue.next_task(agent=agent, kinds=o["kind"], claim=o["claim"], lease_minutes=o["lease"])
                self.out(queue.as_json(task) if task else None)
            elif action == "complete":
                src = sys.stdin.read() if o["result"] == "-" else Path(o["result"]).read_text()
                self.out(queue.as_json(queue.complete(o["id"], agent=_agent(o["agent"]), result=json.loads(src))))
            elif action == "fail":
                self.out(queue.as_json(queue.fail(o["id"], agent=_agent(o["agent"]), error=o["error"], retry=not o["no_retry"])))
            elif action == "release":
                self.out(queue.as_json(queue.release(o["id"], agent=_agent(o["agent"]), reason=o["reason"], defer_minutes=o["defer_minutes"], needs=o["needs"])))
            elif action == "extend":
                self.out(queue.as_json(queue.extend(o["id"], agent=_agent(o["agent"]), minutes=o["minutes"])))
            elif action == "list":
                qs = AgentTask.objects.select_related("target_entry")
                if o["status"]:
                    qs = qs.filter(status=o["status"])
                if o["kind"]:
                    qs = qs.filter(kind=o["kind"])
                self.out([queue.as_json(t) for t in qs[: o["limit"]]])
            elif action == "add":
                if not ACTOR_RE.match(o["by"]):
                    raise CommandError("--by must look like human:<name>, job:<name> or agent:<name>")
                targets = {"target_entry": Entry.objects.get(slug=o["entry"])} if o["entry"] else {}
                task, created = queue.enqueue(o["kind"], created_by=o["by"], dedupe_key=o["dedupe"], priority=o["priority"],
                                              payload=json.loads(o["payload"]), target_ref=o["ref"], **targets)
                self.out({**queue.as_json(task), "created": created})
        except (queue.TaskError, Entry.DoesNotExist, json.JSONDecodeError, FileNotFoundError) as e:
            raise CommandError(str(e)) from e
