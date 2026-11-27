"""Small formatting helpers for the operations console's templates: durations, ages, inline SVG sparklines and
readable before/after diffs. No libraries: the SVG is a few rectangles."""

import difflib
import json
from datetime import timedelta

from django import template
from django.utils import timezone
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe

register = template.Library()

STATUS_CLASS = {"ok": "ok", "partial": "warn", "failed": "bad", "running": "info", "queued": "info", "claimed": "info",
                "done": "ok", "cancelled": "muted"}


@register.filter
def status_class(status) -> str:
    return STATUS_CLASS.get(status or "", "muted")


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
    """A timedelta (or seconds) as a short age: "45 s", "12 m", "3 h", "2 d"."""
    if td is None or td == "":
        return "–"
    s = td.total_seconds() if isinstance(td, timedelta) else float(td)
    neg, s = s < 0, abs(s)
    if s < 90:
        out = f"{int(s)} s"
    elif s < 5400:
        out = f"{int(s // 60)} m"
    elif s < 172800:
        out = f"{s / 3600:.0f} h"
    else:
        out = f"{s / 86400:.0f} d"
    return f"in {out}" if neg else out


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
    """A datetime as "12 m ago" / "in 3 h"."""
    if not dt:
        return "–"
    d = timezone.now() - dt
    return span(d) if d.total_seconds() < 0 else f"{span(d)} ago"


@register.filter
def pct(x) -> str:
    return "–" if x is None else f"{100 * x:.1f}%"


@register.filter
def pretty(value) -> str:
    return json.dumps(value, indent=1, ensure_ascii=False, sort_keys=True, default=str)


@register.filter
def get(d, key):
    return (d or {}).get(key)


@register.simple_tag
def sparkline(runs, width=240, height=28):
    """Inline SVG: one bar per run, its height the run's duration against the longest shown, colored by status (a
    failed run is a full-height bar, so failures stand out however short they were)."""
    if not runs:
        return mark_safe('<span class="muted">no runs</span>')
    n = len(runs)
    peak = max(r["seconds"] for r in runs) or 1.0
    bw = width / max(n, 1)
    bars = []
    for i, r in enumerate(runs):
        h = height if r["status"] == "failed" else max(2.0, height * r["seconds"] / peak)
        bars.append(format_html('<rect x="{}" y="{}" width="{}" height="{}" class="b-{}"><title>{} {} {}</title></rect>',
                                f"{i * bw:.1f}", f"{height - h:.1f}", f"{max(bw - 1, 1):.1f}", f"{h:.1f}", status_class(r["status"]),
                                timezone.localtime(r["started"]).strftime("%b %d %H:%M"), r["status"], seconds(r["seconds"])))
    failed = sum(r["status"] == "failed" for r in runs)
    label = f"{n} runs, {failed} failed, longest {seconds(peak)}"
    return format_html('<svg class="spark" viewBox="0 0 {} {}" width="{}" height="{}" role="img" aria-label="{}">{}</svg>',
                       width, height, width, height, label, mark_safe("".join(bars)))


@register.simple_tag
def bar(n, peak, width=120):
    """A plain horizontal bar for a daily count."""
    w = 0 if not peak else max(1.0, width * n / peak) if n else 0
    return format_html('<svg class="hbar" width="{}" height="10" aria-hidden="true"><rect width="{}" height="10"></rect></svg>', width, f"{w:.1f}")


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
