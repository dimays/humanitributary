"""Agent tokens for the API (docs/adr/0017-agent-api.md). The owner's command; agents never run it.

    manage.py agent_token create claude-writer --scope write_event --scope audit
    manage.py agent_token create claude-verifier --scope verify_claim
    manage.py agent_token create claude-all --scope '*'
    manage.py agent_token create round-reviewer --scope review      # edits/check, edits/apply (ADR 0035)
    manage.py agent_token create round-publisher --scope publish    # releases/check, releases/publish
    manage.py agent_token create round-recorder --scope round       # POST rounds, PATCH rounds/<id>
    manage.py agent_token list
    manage.py agent_token revoke claude-writer

`create` prints the token once (it is stored only as a hash): put it in the agent's environment as
HUMANITRIBUTARY_API_TOKEN, beside HUMANITRIBUTARY_API (the base URL, e.g. http://127.0.0.1:8000/api/agent).
"""

import getpass
import json

from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError

from agentapi.auth import create_token, revoke
from agentapi.models import OPERATION_SCOPES, AgentToken
from agentapi.schemas import RESULTS


class Command(BaseCommand):
    help = "Create, list and revoke agent API tokens (shown once; stored hashed)."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest="action", required=True)
        p = sub.add_parser("create")
        p.add_argument("name", help='The agent\'s name: it acts as "agent:<name>".')
        p.add_argument("--scope", action="append", default=[], help=f"A task kind it may claim ({', '.join(sorted(RESULTS))}), or '*'; or an operation scope "
                       f"({', '.join(OPERATION_SCOPES)}), which '*' never includes. Repeatable.")
        p.add_argument("--by", default="", help='Who makes it (default human:<your login>).')
        sub.add_parser("list")
        p = sub.add_parser("revoke")
        p.add_argument("name")

    def handle(self, *args, action, **o):
        if action == "create":
            scopes = o["scope"] or []
            bad = [s for s in scopes if s != "*" and s not in RESULTS and s not in OPERATION_SCOPES]
            if bad or not scopes:
                raise CommandError(f"--scope must be one or more of {', '.join(sorted(RESULTS))}, '*', or {', '.join(OPERATION_SCOPES)} "
                                   f"(got {bad or 'none'})")
            by = o["by"] or f"human:{getpass.getuser()}"
            try:
                row, token = create_token(o["name"], scopes, created_by=by)
            except IntegrityError as e:
                raise CommandError(f"a token named {o['name']!r} exists (revoke it first) or the name is not valid") from e
            self.stdout.write(f"agent:{row.name}, scopes {row.scopes}. The token (shown once; it is stored only as a hash):\n")
            self.stdout.write(token)
            self.stdout.write("\nSet HUMANITRIBUTARY_API_TOKEN to it in the agent's environment.")
        elif action == "list":
            rows = [{"name": t.name, "prefix": t.prefix, "scopes": t.scopes, "created_by": t.created_by, "created_at": t.created_at.isoformat(timespec="seconds"),
                     "last_used_at": t.last_used_at.isoformat(timespec="seconds") if t.last_used_at else None, "revoked": bool(t.revoked_at)}
                    for t in AgentToken.objects.all()]
            self.stdout.write(json.dumps(rows, indent=1))
        else:
            if not revoke(o["name"]):
                raise CommandError(f"no live token named {o['name']!r}")
            self.stdout.write(f"revoked agent:{o['name']}")
