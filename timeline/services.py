"""The service layer for canonical content: every write to a timeline or evidence table goes through here, inside
`revisions.revising()` (AGENTS.md rule 2). The database enforces the second half (its audit trigger refuses a write
outside revising()); these functions add the first: derived fields kept in step, and only real changes written, so
re-applying the same content changes nothing and leaves no Revision.

    from revisions import revising
    from timeline import services

    with revising("agent:claude-writer", reason="write_event from candidate 412", task=task):
        ev = services.save_event("ww2-dday", branch="world-war-ii", y=1944.43, when="June 6, 1944",
                                 title="D-Day landings in Normandy", text="…", imp=1, status="review")
"""

from django.db import connection, models

from revisions import require_revising

from . import ordering
from .dates import parse_when
from .models import Branch, Entry, Event, Region, Status


def apply_changes(obj: models.Model, values: dict) -> str:
    """Set `values` on `obj` and save only what changed. Returns "created", "updated" or "unchanged"."""
    require_revising()
    if obj.pk is None:
        for k, v in values.items():
            setattr(obj, k, v)
        obj.save()
        return "created"
    changed = [k for k, v in values.items() if getattr(obj, k) != v]
    if not changed:
        return "unchanged"
    for k in changed:
        setattr(obj, k, values[k])
    if any(f.name == "updated_at" for f in obj._meta.concrete_fields):
        changed.append("updated_at")
    obj.save(update_fields=changed)
    return "updated"


def delete(obj: models.Model) -> None:
    require_revising()
    obj.delete()


def branch_date_fields(start_when: str, end_when: str | None) -> dict:
    s, e = parse_when(start_when), parse_when(end_when) if end_when else None
    return {
        "start_precision": s.precision,
        "start_approximate": s.approximate,
        "start_date": s.date,
        "end_precision": e.precision if e else None,
        "end_approximate": e.approximate if e else False,
        "end_date": (e.end_date or e.date) if e else None,
    }


def event_date_fields(when: str) -> dict:
    d = parse_when(when)
    return {"precision": d.precision, "approximate": d.approximate, "date": d.date, "end_date": d.end_date}


ORDER_LOCK = 0x4854  # the advisory-lock namespace for the snapshot order (the other key is the kind's hash)


def _order_lock(kind: str) -> None:
    """Hold the order of `kind` until this transaction ends, so two writers never pick the same sort key.

    `entry_sort_key_unique` is deferred (a reorder may pass through a shared key), so without this lock two
    transactions that each append an entry read the same last key, write the same new key, and the second fails only
    at COMMIT (an IntegrityError there: the agent API's 500 when two agents completed tasks at once). The lock is
    transaction-scoped (`pg_advisory_xact_lock`): the second writer waits for the first to commit, and under READ
    COMMITTED its next query sees the first one's key."""
    with connection.cursor() as c:
        c.execute("SELECT pg_advisory_xact_lock(%s, hashtext(%s))", [ORDER_LOCK, kind])


def _last_key(kind: str) -> str | None:
    _order_lock(kind)
    return Entry.objects.filter(kind=kind).order_by("-sort_key").values_list("sort_key", flat=True).first()


def place(entry: Entry, *, after: str | None = None, before: str | None = None) -> str:
    """Move an entry in the snapshot order (within its kind): just after the entry `after` or just before `before`
    (slugs). Writes this entry's sort key only; no other entry moves."""
    require_revising()
    kind = entry.kind
    _order_lock(kind)
    keys = Entry.objects.filter(kind=kind).exclude(pk=entry.pk).order_by("sort_key")
    if after is not None:
        lo = Entry.objects.get(slug=after, kind=kind).sort_key
        hi = keys.filter(sort_key__gt=lo).values_list("sort_key", flat=True).first()
    elif before is not None:
        hi = Entry.objects.get(slug=before, kind=kind).sort_key
        lo = keys.filter(sort_key__lt=hi).order_by("-sort_key").values_list("sort_key", flat=True).first()
    else:
        raise ValueError("place() needs after= or before=")
    return apply_changes(entry, {"sort_key": ordering.between(lo, hi)})


def save_branch(slug: str, *, region: str | Region | None = None, **fields) -> tuple[Branch, str]:
    """Create or update a branch by slug. Date-derived fields follow start_when/end_when."""
    require_revising()
    branch = Branch.objects.filter(slug=slug).first() or Branch(slug=slug, sort_key=ordering.between(_last_key("branch"), None))
    if region is not None:
        fields["region"] = region if isinstance(region, Region) else Region.objects.get(slug=region)
    start_when = fields.get("start_when", branch.start_when if branch.pk else "")
    end_when = fields.get("end_when", branch.end_when if branch.pk else None)
    fields.update(branch_date_fields(start_when, end_when))
    return branch, apply_changes(branch, fields)


def save_event(slug: str, *, branch: str | Branch | None = None, **fields) -> tuple[Event, str]:
    """Create or update an event by slug. Date-derived fields follow `when`."""
    require_revising()
    event = Event.objects.filter(slug=slug).first() or Event(slug=slug, sort_key=ordering.between(_last_key("event"), None))
    if branch is not None:
        fields["branch"] = branch if isinstance(branch, Branch) else Branch.objects.get(slug=branch)
    fields.update(event_date_fields(fields.get("when", event.when if event.pk else "")))
    return event, apply_changes(event, fields)


def set_status(slug: str, status: str) -> str:
    if status not in Status.values:
        raise ValueError(f"status must be one of {Status.values}")
    return apply_changes(Entry.objects.get(slug=slug).concrete, {"status": status})
