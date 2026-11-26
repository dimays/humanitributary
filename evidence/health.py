"""The fact base's health: `manage.py facts report` and the digest's "Fact base" section (docs/fact-checking.md).

Shares of record claims (the "as written", "why" and "origin" claims the page publishes from) by status, by era and
by region, plus what is due, broken, contested or blocking publication. Read-only.
"""

from collections import Counter, defaultdict
from datetime import date, timedelta

from timeline.models import Branch, Entry, Event, Status

from . import policy
from .confidence import EVIDENCE_FIELDS, wikipedia_only
from .models import Citation, Claim, Evidence

STATUSES = ["corroborated", "single_source", "contested", "stale", "unverified"]
ERAS = [(-1e12, "deep time"), (-3000, "ancient"), (500, "medieval"), (1500, "early modern"), (1800, "modern"), (1945, "since 1945")]


def era_of(y: float | None) -> str:
    name = ERAS[0][1]
    for start, label in ERAS:
        if y is not None and y >= start:
            name = label
    return name


def collect(today: date | None = None) -> dict:
    today = today or date.today()
    ev_y = dict(Event.objects.values_list("pk", "y"))
    ev_branch = dict(Event.objects.values_list("pk", "branch_id"))
    br = {pk: (start, region) for pk, start, region in Branch.objects.values_list("pk", "start", "region__slug")}
    published = set(Entry.objects.filter(status=Status.PUBLISHED).values_list("pk", flat=True))

    def place(entry_id):
        if entry_id in ev_y:
            return era_of(ev_y[entry_id]), br[ev_branch[entry_id]][1]
        start, region = br.get(entry_id, (None, "?"))
        return era_of(start), region

    total, by_era, by_region, atomic = Counter(), defaultdict(Counter), defaultdict(Counter), Counter()
    for entry_id, field, parent_id, status in Claim.objects.filter(entry_id__in=published).values_list("entry_id", "field", "parent_id", "status"):
        if parent_id is not None:
            atomic[(field, status)] += 1
            continue
        if field not in ("as_written", "why", "origin"):
            continue
        era, region = place(entry_id)
        total[status] += 1
        by_era[era][status] += 1
        by_region[region][status] += 1

    rows, claim_entry = defaultdict(list), {}
    for row in Evidence.objects.filter(claim__field="as_written", claim__key="", claim__entry_id__in=published).values_list("claim_id", "claim__entry_id", *EVIDENCE_FIELDS):
        rows[row[0]].append(row[2:])
        claim_entry[row[0]] = row[1]
    wiki_only = sum(1 for r in rows.values() if wikipedia_only(r))
    wiki_only_events = sum(1 for c, r in rows.items() if claim_entry[c] in ev_y and wikipedia_only(r))
    from .publishing import says_sources_differ

    contested_silent = 0
    for entry_id, text in Entry.objects.filter(pk__in=published, claims__parent__isnull=True, claims__status="contested").distinct().values_list("pk", "text"):
        if not says_sources_differ(text):
            contested_silent += 1
    due = Claim.objects.filter(entry_id__in=published, recheck_after__isnull=False)
    dead = policy.get("dead_http_status")
    from work.models import AgentTask

    return {
        "today": today.isoformat(), "rules_version": policy.RULES_VERSION, "total": total, "by_era": by_era, "by_region": by_region, "atomic": atomic,
        "wikipedia_only": wiki_only, "as_written": len(rows), "wikipedia_only_events": wiki_only_events, "contested_silent": contested_silent,
        "due_now": due.filter(recheck_after__lte=today).count(),
        "due_30": due.filter(recheck_after__gt=today, recheck_after__lte=today + timedelta(days=30)).count(),
        "due_365": due.filter(recheck_after__gt=today, recheck_after__lte=today + timedelta(days=365)).count(),
        "dead_citations": Citation.objects.filter(http_status__gte=dead).count(),
        "checked_citations": Citation.objects.filter(last_checked_at__isnull=False).count(),
        "citations": Citation.objects.count(),
        "open_verify_tasks": AgentTask.objects.filter(kind="verify_claim", status__in=["queued", "claimed"]).count(),
    }


def _pct(n, d):
    return f"{100 * n / d:.1f}%" if d else "–"


def _row(label, c: Counter) -> str:
    n = sum(c.values())
    return f"| {label} | {n} | " + " | ".join(_pct(c[s], n) for s in STATUSES) + " |"


def markdown(data: dict | None = None, *, detail: bool = True) -> str:
    d = data or collect()
    t = d["total"]
    n = sum(t.values())
    out = [f"## Fact base ({d['today']}, {d['rules_version']})", ""]
    out.append(
        f"{n} record claims on published entries: " + ", ".join(f"{t[s]} {s.replace('_', ' ')} ({_pct(t[s], n)})" for s in STATUSES) + "."
    )
    out.append(f"{d['wikipedia_only']} of {d['as_written']} entries ({_pct(d['wikipedia_only'], d['as_written'])}) rest on Wikipedia alone.")
    out.append(
        f"Publishing rule: {d['wikipedia_only_events']} published events have no non-Wikipedia source and {d['contested_silent']} entries are "
        "contested without saying the sources differ (published before the rule; the sweep queues tasks for them)."
    )
    out.append(
        f"Rechecks: {d['due_now']} due now, {d['due_30']} more within 30 days, {d['due_365']} within a year. "
        f"Citations: {d['checked_citations']} of {d['citations']} link-checked, {d['dead_citations']} dead. "
        f"Open verify_claim tasks: {d['open_verify_tasks']}."
    )
    a = d["atomic"]
    if a:
        fields = sorted({f for f, _ in a})
        parts = ", ".join(f"{sum(v for (f2, _), v in a.items() if f2 == f)} {f}" for f in fields)
        checked = sum(v for (f, s), v in a.items() if s != "unverified")
        out.append(f"Atomic claims: {sum(a.values())} ({parts}); {checked} have evidence of their own.")
    if detail:
        head = "| | claims | " + " | ".join(s.replace("_", " ") for s in STATUSES) + " |"
        sep = "|---|---:|" + "---:|" * len(STATUSES)
        out += ["", "By era:", "", head, sep]
        out += [_row(era, d["by_era"][era]) for _, era in ERAS if era in d["by_era"]]
        out += ["", "By region:", "", head, sep]
        out += [_row(r, d["by_region"][r]) for r in sorted(d["by_region"], key=lambda r: -sum(d["by_region"][r].values()))]
    return "\n".join(out) + "\n"


def digest_section() -> str:
    """The compact version for `manage.py digest`."""
    return markdown(detail=False)
