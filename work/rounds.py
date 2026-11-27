"""Agent rounds (docs/adr/0035-automated-daily-rounds.md): the round settings operators change from the console, the
preflight a round passes before it starts, and what the console and the API show about rounds.

A round is a session of Claude agents: role agents work the queue, independent reviewers write an edit file, the
edit file is applied, and a release is published when every gate passes. The daily cloud routine follows the
`run-round` skill and records each run as a `Round` (work/models.py) over the agent API. The console never calls
Anthropic's services: it only changes the settings below, which the routine reads (`GET rounds/settings`) and which
`start()` enforces when the routine asks to start.

The settings live in one `JobState` row (`STATE`), like the paused jobs and the active content wave:

    paused      {"by", "at", "reason"} or null: scheduled rounds don't start (a round started by hand still may)
    skip_next   {"by", "at", "reason"} or null: the next scheduled round is recorded as skipped, and the flag clears
    size        {"agents": {role: n}, "tasks_per_agent": {role: n}}: how many agents of each role, how many tasks each
    carry_over  {"slugs": [...], "by", "at", "reason"} or null: held drafts the next round's reviewers must include
"""

import re
from datetime import datetime, timedelta
from datetime import timezone as dt_timezone

from django.conf import settings
from django.db import transaction
from django.db.models import CharField, Exists, OuterRef
from django.db.models.functions import Cast
from django.utils import timezone

from .models import Round

STATE = "agent_rounds"
ROLES = {  # role → (the task kind it works, the skill it follows)
    "writer": ("write_event", "drain-write-events"),
    "filler": ("fill_gap", "fill-gaps"),
    "verifier": ("verify_claim", "verify-claims"),
    "mapper": ("map_branch_entities", "map-branch-entities"),
}
FED_BY = {  # task kind → the jobs that queue it (the console's Jobs ↔ Work cross-links and GET queue)
    "write_event": ["process"], "verify_claim": ["facts_sweep", "second_source"], "review_branch_proposal": ["branches_review"],
    "audit": ["branches_review"], "map_branch_entities": ["seed_branch_entities"], "fill_gap": ["gap_waves"],
}
KIND_ROLE = {kind: role for role, (kind, _) in ROLES.items()}
DEFAULT_SIZE = {"agents": {"writer": 2, "filler": 2, "verifier": 1, "mapper": 1},
                "tasks_per_agent": {"writer": 5, "filler": 3, "verifier": 8, "mapper": 10}}
MAX_AGENTS_PER_ROLE = 4      # an operator may set 0 to this many agents of one role
MAX_AGENTS = 10              # … and this many in all
MAX_TASKS_PER_AGENT = 12     # each agent takes 1 to this many tasks
DRAFTS_PER_REVIEWER = 40     # an independent reviewer reads at most this many drafts
STALE_HOURS = 12             # an open round older than this was interrupted: it is closed as failed
MAX_CARRY_OVER = 200         # held drafts one "send to the next review" may carry


class RoundRefused(Exception):
    def __init__(self, message: str, *, code: str, **extra):
        super().__init__(message)
        self.code, self.extra = code, extra


# ── settings ──────────────────────────────────────────────────────────────────────────────────────────────────────

def _state() -> dict:
    from ingest.models import JobState

    return JobState.objects.filter(name=STATE).values_list("state", flat=True).first() or {}


def size_of(st: dict | None = None) -> dict:
    """The round size, the defaults filled in for any role the stored size lacks."""
    stored = (st if st is not None else _state()).get("size") or {}
    return {k: {role: int((stored.get(k) or {}).get(role, DEFAULT_SIZE[k][role])) for role in ROLES} for k in DEFAULT_SIZE}


def current() -> dict:
    """Everything the routine and the console need to know before a round: the flags, the size, what it would take,
    the schedule in words and the next time it comes due."""
    st = _state()
    sched = settings.ROUND_SCHEDULE
    return {"paused": st.get("paused"), "skip_next": st.get("skip_next"), "size": size_of(st), "size_set": st.get("size_set"),
            "carry_over": st.get("carry_over"), "drafts_per_reviewer": DRAFTS_PER_REVIEWER,
            "schedule": sched, "schedule_words": schedule_words(sched), "next_at": next_at(sched, timezone.now()),
            "routine": settings.ROUND_ROUTINE}


def validate_size(data) -> dict:
    """A size from a form or JSON → the size, or ValueError saying what is out of bounds."""
    out = {"agents": {}, "tasks_per_agent": {}}
    for role in ROLES:
        for k, lo, hi in (("agents", 0, MAX_AGENTS_PER_ROLE), ("tasks_per_agent", 1, MAX_TASKS_PER_AGENT)):
            raw = data.get(f"{k}.{role}") if hasattr(data, "get") and f"{k}.{role}" in data else (data.get(k) or {}).get(role)
            try:
                n = int(raw)
            except (TypeError, ValueError):
                raise ValueError(f"{k.replace('_', ' ')} for {role}s must be a number") from None
            if not lo <= n <= hi:
                raise ValueError(f"{k.replace('_', ' ')} for {role}s must be {lo} to {hi} (got {n})")
            out[k][role] = n
    total = sum(out["agents"].values())
    if total > MAX_AGENTS:
        raise ValueError(f"{total} agents in all: at most {MAX_AGENTS}")
    return out


def change(*, by: str, reason: str, **fields) -> dict:
    """Set fields of the settings (paused, skip_next, size, carry_over: a value, or None to clear) under a row lock.
    Each set value is stamped with who and why. → the settings after."""
    from ingest.models import JobState

    stamp = {"by": by, "at": timezone.now().isoformat(timespec="seconds"), "reason": reason}
    with transaction.atomic():
        row, _ = JobState.objects.select_for_update().get_or_create(name=STATE, defaults={"state": {}})
        st = dict(row.state or {})
        for k, v in fields.items():
            if k == "size":
                st["size"], st["size_set"] = v, stamp
            elif v is None or v is False:
                st[k] = None
            else:
                st[k] = {**(v if isinstance(v, dict) else {}), **stamp}
        row.state = st
        row.save(update_fields=["state", "updated_at"])
    return current()


def capacity(size: dict, waiting: dict[str, int]) -> dict[str, int]:
    """How many tasks of each kind the next round would take: its agents times their tasks, at most what waits."""
    return {kind: min(waiting.get(kind, 0), size["agents"][role] * size["tasks_per_agent"][role]) for kind, role in KIND_ROLE.items()}


# ── the schedule ──────────────────────────────────────────────────────────────────────────────────────────────────

DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"]
CRON = re.compile(r"^\s*(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+(\*|[0-6](?:,[0-6])*)\s*$")


def _parse(cron: str):
    m = CRON.match(cron or "")
    if not m:
        return None
    minute, hour = int(m.group(1)), int(m.group(2))
    if minute > 59 or hour > 23:
        return None
    days = None if m.group(3) == "*" else sorted({int(d) for d in m.group(3).split(",")})
    return minute, hour, days


def schedule_words(cron: str) -> str:
    """"0 6 * * *" → "daily at 06:00 UTC"; "30 5 * * 1,4" → "Mondays and Thursdays at 05:30 UTC". The routine's
    cron is the owner's (set where the routine is made); ROUND_SCHEDULE repeats it here so the console can show it.
    Only minute-hour-daily/weekday forms are put in words; anything else is shown as it is."""
    p = _parse(cron)
    if p is None:
        return f"cron {cron}" if cron else "not scheduled"
    minute, hour, days = p
    when = f"{hour:02d}:{minute:02d} UTC"
    if days is None:
        return f"daily at {when}"
    names = [DAYS[d] for d in days]
    return f"{', '.join(names[:-1]) + ' and ' + names[-1] if len(names) > 1 else names[0]} at {when}"


def next_at(cron: str, now: datetime) -> datetime | None:
    p = _parse(cron)
    if p is None:
        return None
    minute, hour, days = p
    now = now.astimezone(dt_timezone.utc)
    t = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    for _ in range(8):
        cron_day = (t.weekday() + 1) % 7  # cron counts Sunday as 0
        if t > now and (days is None or cron_day in days):
            return t
        t += timedelta(days=1)
    return None


# ── held drafts ───────────────────────────────────────────────────────────────────────────────────────────────────

ENTRY_TABLES = ("timeline_entry", "timeline_branch", "timeline_event")


def held_drafts():
    """Entries in review that a reviewer's edit file already touched and left there (HOLD): the slugs, oldest first."""
    from revisions.models import Revision
    from timeline.models import Entry

    by_review = Revision.objects.filter(table_name__in=ENTRY_TABLES, row_pk=Cast(OuterRef("pk"), CharField()), reason__startswith="apply_edits")
    return Entry.objects.filter(status="review").filter(Exists(by_review)).order_by("created_at", "id").values_list("slug", flat=True)


# ── starting and recording rounds ─────────────────────────────────────────────────────────────────────────────────

def note(r: Round, by: str, what: str):
    r.history = list(r.history or []) + [{"at": timezone.now().isoformat(timespec="seconds"), "by": by, "what": what[:500], "status": r.status}]


def close_stale(now=None) -> int:
    """Open rounds older than STALE_HOURS were interrupted (the session ended without saying so): failed."""
    now = now or timezone.now()
    n = 0
    for r in Round.objects.select_for_update().filter(status__in=Round.OPEN, started_at__lt=now - timedelta(hours=STALE_HOURS)):
        r.status, r.finished_at = Round.Status.FAILED, now
        note(r, "job:rounds", f"closed: still {r.status} after {STALE_HOURS} hours (the session was interrupted)")
        r.save(update_fields=["status", "finished_at", "history", "updated_at"])
        n += 1
    return n


def start(*, trigger: str, by: str, plan: dict | None = None, agents: list | None = None, notes: str = "", key: str | None = None) -> tuple[Round, bool]:
    """The preflight and the new round, in one transaction under the settings' row lock. → (round, proceed).

    Refuses (RoundRefused) a scheduled round while rounds are paused (nothing is recorded: the routine exits
    cleanly), and any round while another is open. A scheduled round with `skip_next` set is recorded as skipped,
    the flag clears, and proceed is False. Otherwise the held drafts an operator sent on (`carry_over`) move into the
    round's plan, for its reviewers, and the setting clears."""
    from ingest.models import JobState

    now = timezone.now()
    with transaction.atomic():
        row, _ = JobState.objects.select_for_update().get_or_create(name=STATE, defaults={"state": {}})
        st = dict(row.state or {})
        close_stale(now)
        if trigger == Round.Trigger.SCHEDULE and st.get("paused"):
            p = st["paused"]
            raise RoundRefused(f"scheduled rounds are paused (by {p.get('by')}: {p.get('reason')}); nothing to do", code="paused", paused=p)
        other = Round.objects.filter(status__in=Round.OPEN).order_by("-started_at").first()
        if other is not None:
            raise RoundRefused(f"round #{other.pk} is still {other.status} (started {other.started_at:%Y-%m-%d %H:%M} UTC)", code="busy", round=other.pk)
        r = Round(started_at=now, trigger=trigger, started_by=by, plan=dict(plan or {}), agents=list(agents or []), notes=notes, idempotency_key=key)
        if trigger == Round.Trigger.SCHEDULE and st.get("skip_next"):
            s = st["skip_next"]
            r.status, r.finished_at, r.summary = Round.Status.SKIPPED, now, f"Skipped by {s.get('by')}: {s.get('reason')}"
            note(r, by, f"skipped: {s.get('by')} asked to skip the next round ({s.get('reason')})")
            st["skip_next"] = None
            proceed = False
        else:
            carry = st.get("carry_over") or {}
            slugs = list(carry.get("slugs") or [])
            if slugs:
                from timeline.models import Entry

                still = set(Entry.objects.filter(slug__in=slugs, status="review").values_list("slug", flat=True))
                r.plan["carry_over"] = [s for s in slugs if s in still]
                r.plan["carry_over_by"] = {"by": carry.get("by"), "reason": carry.get("reason")}
                st["carry_over"] = None
            r.plan.setdefault("size", size_of(st))
            note(r, by, f"started ({trigger})")
            proceed = True
        r.save()
        row.state = st
        row.save(update_fields=["state", "updated_at"])
    return r, proceed


PATCHABLE = {"status", "plan", "agents", "tasks", "drafts", "verdicts", "summary", "notes"}
AGENT_STATUSES = {Round.Status.RUNNING, Round.Status.REVIEWING, Round.Status.RELEASE_READY, Round.Status.HELD, Round.Status.FINISHED, Round.Status.FAILED}
VERDICTS = ("approve", "approve_with_edits", "hold", "reject")


def _counts(v, what: str) -> dict:
    if not isinstance(v, dict) or not all(isinstance(k, str) and isinstance(n, int) and n >= 0 for k, n in v.items()):
        raise ValueError(f"{what} must be an object of non-negative counts")
    return v


def validate_patch(r: Round, data: dict) -> dict:
    """What a PATCH may change, checked. → the fields to set. Raises ValueError."""
    unknown = set(data) - PATCHABLE - {"finish"}
    if unknown:
        raise ValueError(f"unknown fields {sorted(unknown)}: send any of {sorted(PATCHABLE | {'finish'})}")
    out = {}
    if r.status in Round.TERMINAL and set(data) - {"summary", "notes"}:
        raise ValueError(f"round #{r.pk} is {r.status}: only its summary and notes can change now")
    if "status" in data:
        if data["status"] not in AGENT_STATUSES:
            raise ValueError(f"status must be one of {sorted(AGENT_STATUSES)} (published is set by releases/publish)")
        out["status"] = data["status"]
    for k in ("plan",):
        if k in data:
            if not isinstance(data[k], dict):
                raise ValueError(f"{k} must be an object")
            out[k] = data[k]
    if "agents" in data:
        a = data["agents"]
        if not isinstance(a, list) or len(a) > 50 or not all(isinstance(x, dict) and isinstance(x.get("name"), str) for x in a):
            raise ValueError('agents must be a list of at most 50 objects, each with a "name"')
        out["agents"] = a
    if "tasks" in data:
        t = data["tasks"]
        if not isinstance(t, dict):
            raise ValueError("tasks must be an object: {kind: {claimed, completed, failed, released}}")
        for kind, c in t.items():
            _counts(c, f"tasks.{kind}")
        out["tasks"] = t
    if "drafts" in data:
        d = data["drafts"]
        if not isinstance(d, list) or len(d) > 1000 or not all(isinstance(s, str) and len(s) <= 120 for s in d):
            raise ValueError("drafts must be a list of at most 1,000 slugs")
        out["drafts"] = d
    if "verdicts" in data:
        v = _counts(data["verdicts"], "verdicts")
        if set(v) - set(VERDICTS):
            raise ValueError(f"verdicts are {', '.join(VERDICTS)}")
        out["verdicts"] = v
    for k, most in (("summary", 4000), ("notes", 20000)):
        if k in data:
            if not isinstance(data[k], str) or len(data[k]) > most:
                raise ValueError(f"{k} must be text of at most {most} characters")
            out[k] = data[k]
    if data.get("finish"):
        st = out.get("status", r.status)
        if st not in Round.TERMINAL:
            raise ValueError("finish needs a final status: held, finished or failed (or a round that releases/publish published)")
        out["finished_at"] = timezone.now()
    elif out.get("status") in Round.TERMINAL:
        out["finished_at"] = timezone.now()
    return out


def stages(r: Round, actions=None) -> list[dict]:
    """The round's stages for its page: plan → agents → review → apply → publish, each done, current, failed,
    skipped or still to come, with when it happened."""
    from opsconsole.models import OpsAction

    hist = r.history or []

    def first(status):
        return next((h["at"] for h in hist if h.get("status") == status), None)

    actions = list(actions if actions is not None else r.actions.all())
    applies = [a for a in actions if a.kind == OpsAction.Kind.EDITS_APPLY]
    applied = next((a for a in applies if a.status == "done"), None)
    order = ["running", "reviewing", "release_ready", "published"]
    reached = order.index(r.status) if r.status in order else None
    done_all = r.status in Round.TERMINAL
    out = [{"key": "plan", "label": "Plan", "at": r.started_at.isoformat(timespec="seconds"), "status": "done",
            "note": ", ".join(f"{k} {v}" for k, v in (r.plan.get("mix") or {}).items()) or "no mix recorded"}]
    agents_done = reached is not None and reached >= 1 or (done_all and bool(r.tasks or r.drafts))
    out.append({"key": "agents", "label": "Agents", "at": first("running"), "status": "done" if agents_done else ("current" if r.status == "running" else "skipped"),
                "note": f"{len(r.agents)} agents · {len(r.drafts)} drafts"})
    review_done = bool(r.verdicts) or (reached is not None and reached >= 2)
    out.append({"key": "review", "label": "Review", "at": first("reviewing"),
                "status": "done" if review_done else ("current" if r.status == "reviewing" else "skipped" if done_all else "todo"),
                "note": ", ".join(f"{k.replace('_', ' ')} {v}" for k, v in r.verdicts.items()) or ""})
    out.append({"key": "apply", "label": "Apply", "at": applied.finished_at.isoformat(timespec="seconds") if applied and applied.finished_at else None,
                "status": "done" if applied or r.edit_ops else ("failed" if applies else ("skipped" if done_all else "todo")),
                "note": ", ".join(f"{k} {v}" for k, v in r.edit_ops.items()) or ("refused: " + applies[0].error[:120] if applies and not applied else "")})
    pub = "done" if r.release_id else ("current" if r.status == "release_ready" else ("skipped" if done_all else "todo"))
    if r.status == Round.Status.HELD:
        pub = "failed"
    out.append({"key": "publish", "label": "Publish", "at": r.release.created_at.isoformat(timespec="seconds") if r.release_id else None,
                "status": pub, "note": r.release.version if r.release_id else {"held": "held for the owner", "finished": "nothing to publish"}.get(r.status, "")})
    return out


def as_json(r: Round) -> dict:
    return {
        "id": r.pk, "status": r.status, "status_label": r.get_status_display(), "trigger": r.trigger, "started_by": r.started_by,
        "started_at": r.started_at.isoformat(timespec="seconds"), "finished_at": r.finished_at.isoformat(timespec="seconds") if r.finished_at else None,
        "plan": r.plan, "agents": r.agents, "tasks": r.tasks, "drafts": r.drafts, "verdicts": r.verdicts, "edit_ops": r.edit_ops,
        "release": r.release.version if r.release_id else None, "summary": r.summary, "notes": r.notes, "history": r.history[-50:],
    }
