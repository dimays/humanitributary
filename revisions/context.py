"""`revising()`: the only way to write a canonical row (docs/adr/0006).

    from revisions import revising

    with revising("agent:claude-writer", reason="write_event from candidate 412", task=task):
        timeline.services.save_event(...)

It opens a transaction and sets three transaction-local Postgres settings that the audit trigger reads:
`tributaries.actor`, `tributaries.reason` and `tributaries.task_id`. Outside it, the trigger rejects the write.
Nesting is allowed (an inner block may name a different actor or reason; the outer one is restored on exit).
"""

import re
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass

from django.db import connection, transaction

ACTOR_RE = re.compile(r"^(agent|human|job):[\w.@:+-]{1,180}$")


@dataclass(frozen=True)
class Revising:
    actor: str
    reason: str
    task_id: int | None


_current: ContextVar[Revising | None] = ContextVar("revising", default=None)


def current() -> Revising | None:
    """The active revising() block, if any (for code that wants to fail early with a clear message)."""
    return _current.get()


def _set(cursor, actor: str, reason: str, task_id: str):
    cursor.execute(
        "SELECT set_config('tributaries.actor', %s, true), set_config('tributaries.reason', %s, true),"
        " set_config('tributaries.task_id', %s, true)",
        [actor, reason, task_id],
    )


@contextmanager
def revising(actor: str, reason: str = "", task=None):
    if not ACTOR_RE.match(actor or ""):
        raise ValueError(f'actor must look like "agent:<name>", "human:<username>" or "job:<command>" (got {actor!r})')
    task_id = getattr(task, "pk", task)
    ctx = Revising(actor, reason[:2000], int(task_id) if task_id else None)
    with transaction.atomic():
        with connection.cursor() as c:
            c.execute(
                "SELECT current_setting('tributaries.actor', true), current_setting('tributaries.reason', true),"
                " current_setting('tributaries.task_id', true)"
            )
            prev = [v or "" for v in c.fetchone()]
            _set(c, ctx.actor, ctx.reason, str(ctx.task_id or ""))
        token = _current.set(ctx)
        try:
            yield ctx
        finally:
            _current.reset(token)
        # On an exception the transaction (or savepoint) rolls back, which restores the settings by itself.
        with connection.cursor() as c:
            _set(c, *prev)


def require_revising():
    if _current.get() is None:
        raise RuntimeError("Canonical writes must happen inside revisions.revising(actor, reason): see AGENTS.md rule 2.")
