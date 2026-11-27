"""Small formatting helpers for the operations console's templates: state badges, durations, ages, schedules, the
ten-run history strip and readable before/after diffs. No libraries: the strip is a few links."""

import difflib
import json
import uuid
from datetime import timedelta

from django import template
from django.utils import timezone
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe

register = template.Library()

STATUS_CLASS = {"ok": "ok", "partial": "warn", "failed": "bad", "running": "info", "queued": "muted", "claimed": "info",
                "done": "ok", "cancelled": "muted", "pending": "muted", "stale": "warn"}
STATE_LABEL = {"scheduled": "Scheduled", "pending": "Pending", "running": "Running", "completed": "Completed", "failed": "Failed",
               "cancelled": "Cancelled", "paused": "Paused", "stuck": "Stuck", "waiting": "Waiting", "in_progress": "In progress",
               "done": "Done"}
# A task's or an action's status in the console's state words.
TASK_STATE = {"queued": "waiting", "claimed": "in_progress", "done": "completed", "failed": "failed", "cancelled": "cancelled"}
ACTION_STATE = {"pending": "pending", "running": "running", "done": "completed", "failed": "failed", "cancelled": "cancelled"}


@register.filter
def status_class(status) -> str:
    return STATUS_CLASS.get(status or "", "muted")


@register.simple_tag
def badge(state, label=None, title=""):
    """A state badge: a colored dot and the state's word (Completed, Failed, Running, Scheduled, Paused …)."""
    state = state or "scheduled"
    return format_html('<span class="badge s-{}"{}><i></i>{}</span>', state,
                       format_html(' title="{}"', title) if title else "", label or STATE_LABEL.get(state, str(state).capitalize()))


@register.filter
def task_state(task) -> str:
    """A task's state: stuck when its lease ran out."""
    if task.status == "claimed" and task.lease_until and task.lease_until < timezone.now():
        return "stuck"
    return TASK_STATE.get(task.status, task.status)


@register.filter
def action_state(status) -> str:
    return ACTION_STATE.get(status, status)


@register.filter
def level_class(level) -> str:
    return {"DEBUG": "debug", "INFO": "info", "WARNING": "warn", "ERROR": "error", "CRITICAL": "error"}.get(str(level).upper(), "info")


@register.filter
def logtime(iso) -> str:
    """A log line's ISO time as HH:MM:SS.mmm (UTC)."""
    s = str(iso or "")
    return s[11:23] if len(s) >= 23 else s


@register.simple_tag
def history_strip(runs, n=10):
    """The job's last runs as small squares, oldest first, each its state's color and a link to the run; empty slots
    when it has run fewer than `n` times."""
    from django.urls import reverse

    cells = []
    for r in runs[-n:]:
        tip = f"{timezone.localtime(r['started']):%b %d %H:%M} · {STATE_LABEL.get(r['state'], r['state'])}" + \
            (f" · {seconds(r['seconds'])}" if r.get("seconds") is not None else "") + (f" · {r['feed']}" if r.get("feed") else "") + \
            (" · with errors" if r.get("status") == "partial" else "")
        cells.append(format_html('<a class="cell s-{}{}" href="{}" title="{}" aria-label="{}"></a>', r["state"],
                                 " partial" if r.get("status") == "partial" else "", reverse("opsconsole:run", args=[r["id"]]), tip, tip))
    cells = ['<span class="cell empty"></span>'] * (n - len(cells)) + cells
    return mark_safe('<span class="strip">' + "".join(str(c) for c in cells) + "</span>")


@register.filter
def seconds(s) -> str:
    """12.3 → "12.3 s", 4000 → "1 h 6 m"."""
    if s is None or s == "":
        return "–"
    s = float(s)
    if s < 60:
        return f"{s:.1f} s"
    if s < 3600:
        return f"{int(s // 60)} m {int(s % 60)} s"
    return f"{int(s // 3600)} h {int(s % 3600 // 60)} m"


@register.filter
def span(td) -> str:
    """A timedelta (or seconds) as a short age: "45 s", "12 min", "3 h", "2 d"."""
    if td is None or td == "":
        return "–"
    s = td.total_seconds() if isinstance(td, timedelta) else float(td)
    neg, s = s < 0, abs(s)
    if s < 90:
        out = f"{int(s)} s"
    elif s < 5400:
        out = f"{int(s // 60)} min"
    elif s < 172800:
        out = f"{s / 3600:.0f} h"
    else:
        out = f"{s / 86400:.0f} d"
    return f"in {out}" if neg else out


@register.filter
def every(m) -> str:
    """An interval in minutes in words: "every 15 minutes", "every hour", "every day"."""
    from opsconsole.queries import every as words

    return words(m)


@register.filter
def minutes(m) -> str:
    """An interval in minutes: 15 → "15 m", 1440 → "1 d", 10080 → "7 d"."""
    if m is None or m == "":
        return "–"
    m = int(m)
    if m % 1440 == 0:
        return f"{m // 1440} d"
    if m % 60 == 0:
        return f"{m // 60} h"
    return f"{m} m"


@register.filter
def ago(dt) -> str:
    """A datetime as "12 min ago" / "in 3 h"."""
    if not dt:
        return "–"
    d = timezone.now() - dt
    return span(d) if d.total_seconds() < 0 else f"{span(d)} ago"


@register.filter
def words(key) -> str:
    """A key as words: "single_source_events" → "single source events"."""
    return str(key).replace("_", " ")


@register.filter
def masked(text) -> str:
    """Secrets out of text shown on a page (configured keys, key-like parameters, tokens, passwords)."""
    from ingest.runlog import mask

    return mask(text or "")


@register.filter
def pct(x) -> str:
    return "–" if x is None else f"{100 * x:.1f}%"


@register.filter
def pretty(value) -> str:
    return json.dumps(value, indent=1, ensure_ascii=False, sort_keys=True, default=str)


@register.filter
def get(d, key):
    return (d or {}).get(key)


def _short(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, str):
        return v
    return json.dumps(v, ensure_ascii=False, sort_keys=True, default=str)


def _word_diff(a: str, b: str) -> str:
    """Words removed in <del>, added in <ins>, the rest as they were (escaped)."""
    aw, bw = a.split(" "), b.split(" ")
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, aw, bw, autojunk=False).get_opcodes():
        if op == "equal":
            out.append(escape(" ".join(aw[i1:i2])))
        if op in ("delete", "replace"):
            out.append(f"<del>{escape(' '.join(aw[i1:i2]))}</del>")
        if op in ("insert", "replace"):
            out.append(f"<ins>{escape(' '.join(bw[j1:j2]))}</ins>")
    return " ".join(out)


def field_diffs(rev) -> list[dict]:
    """The columns a Revision touched, each with its value before and after, and a word diff for long text."""
    before, after = rev.before or {}, rev.after or {}
    if rev.action == "update":
        fields = rev.changed or sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))
    else:
        fields = sorted(after or before)
    out = []
    for f in fields:
        b, a = before.get(f), after.get(f)
        row = {"field": f, "before": _short(b) if rev.action != "insert" else "", "after": _short(a) if rev.action != "delete" else ""}
        if rev.action == "update" and isinstance(a, str) and isinstance(b, str) and max(len(a), len(b)) > 60:
            row["html"] = mark_safe(_word_diff(b, a))
        out.append(row)
    return out


@register.filter
def diffs(rev):
    return field_diffs(rev)


@register.simple_tag(takes_context=True)
def act(context, action_name, label, css="", **fields):
    """A one-button POST form that starts an action (step 1: the confirmation page). Rendered only for operators
    (`can_act`); everyone else gets nothing. Carries the CSRF token and a fresh key (used by actions that skip the
    confirmation, so a double click acts once). The action's name is `action_name`, not `kind`: a form field may be
    called `kind` (the Work page's batch buttons pass the task kind as `kind=…`)."""
    from django.middleware.csrf import get_token
    from django.urls import reverse

    if not context.get("can_act"):
        return ""
    request = context["request"]
    hidden = "".join(format_html('<input type="hidden" name="{}" value="{}">', k, v) for k, v in fields.items() if v not in (None, ""))
    return format_html(
        '<form class="act" method="post" action="{}"><input type="hidden" name="csrfmiddlewaretoken" value="{}">'
        '<input type="hidden" name="key" value="{}">{}<button type="submit" class="btn {}">{}</button></form>',
        reverse("opsconsole:act", args=[action_name]), get_token(request), uuid.uuid4().hex, mark_safe(hidden), css, label)


@register.filter
def took(action) -> str:
    """How long an action (or anything with started_at and finished_at) ran: "3.2 s", "4 m 10 s", or "–"."""
    if not getattr(action, "started_at", None) or not getattr(action, "finished_at", None):
        return "–"
    return seconds((action.finished_at - action.started_at).total_seconds())
