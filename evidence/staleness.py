"""When a claim should be re-read (docs/fact-checking.md, "Staleness").

Two sources of staleness, both deterministic:

1. **Schedule.** `recheck_after = last check + interval`, where the last check is the newest evidence checked here
   (`Evidence.checked_at`), or the claim's creation for evidence never re-read (legacy), and the interval comes from
   `policy.recheck_days[field]` by how recent the entry is (a medieval battle's date: ten years; a death toll from
   this year: a week).
2. **Link health.** Ingestion's link-health job records each citation's last check (`Citation.last_checked_at`,
   `http_status`, `content_hash`). A dead link (status ≥ 400), or a page whose content hash differs from the one the
   evidence was checked against (`Evidence.content_hash`), pulls `recheck_after` to today until someone re-reads
   the page (evidence checked after the citation's last check). Evidence first seen with no hash takes the
   citation's current hash as its baseline (we cannot tell whether a page changed before we first hashed it).

Respecting other writers: a job may pull a claim's `recheck_after` earlier itself (say, to today). The sweep keeps an
earlier date unless a check newer than that date exists; it never pushes a pending recheck later.
"""

import re
from datetime import date, timedelta

from . import policy

COLUMNS = ("current", "last2", "since1945", "since1800", "before1800")


def era_column(latest_year: float | None, ongoing: bool, today: date) -> str:
    if ongoing or latest_year is None or latest_year >= today.year:
        return "current"
    if latest_year >= today.year - 2:
        return "last2"
    if latest_year >= 1945:
        return "since1945"
    if latest_year >= 1800:
        return "since1800"
    return "before1800"


def interval_days(field: str, latest_year: float | None, ongoing: bool, today: date) -> int:
    table = policy.get("recheck_days")
    row = table.get(field) or table["as_written"]
    return row[COLUMNS.index(era_column(latest_year, ongoing, today))]


def entry_profile(entry, today: date) -> tuple[float | None, bool, str | None]:
    """(latest year, ongoing?, precision) of an entry, for its claims' intervals and date tolerance."""
    x = entry.concrete
    ongoing_re = re.compile(policy.get("ongoing_words"), re.I)
    if x.kind == "event":
        latest = max(x.y, x.end) if x.end is not None else x.y
        return latest, bool(ongoing_re.search(x.when or "")), x.precision
    # A branch: as recent as its end, or (if it continues) as its latest event; ongoing if it continues to this year.
    if x.end is not None:
        return x.end, bool(ongoing_re.search(x.end_when or "")), x.end_precision or x.start_precision
    last = x.events.order_by("-y").values_list("y", flat=True).first()
    return (last if last is not None else x.start), False, x.start_precision


def tolerance(precision: str | None) -> float | None:
    return policy.get("date_tolerance_years").get(precision or "")


def assess_kwargs(claim, today: date | None = None, profile=None) -> dict:
    """The confidence inputs that depend on the claim and its entry (evidence/confidence.py)."""
    today = today or date.today()
    latest, ongoing, precision = profile or entry_profile(claim.entry, today)
    kw = {"interval_days": interval_days(claim.field, latest, ongoing, today)}
    if claim.field == "date" and isinstance(claim.value, dict) and isinstance(claim.value.get("y"), (int, float)):
        kw |= {"claim_y": claim.value["y"], "tolerance": tolerance(precision)}
    return kw


def schedule(*, existing: date | None, requested_at=None, last_check=None, created: date, interval: int) -> tuple[date, bool]:
    """The next recheck date: last check (or creation) + interval, unless someone asked for an earlier one that no
    check has answered yet. last_check: datetime of the newest real check, or None. → (date, kept the request?)"""
    scheduled = (last_check.date() if last_check else created) + timedelta(days=interval)
    if existing is None or existing >= scheduled:
        return scheduled, False
    if last_check is None:
        answered = False
    elif requested_at is not None:
        answered = last_check >= requested_at
    else:
        answered = last_check.date() >= existing
    return (scheduled, False) if answered else (existing, True)


def link_problem(ev: dict, dead_status: int) -> str | None:
    """"dead_link", "content_changed" or None, for one evidence row joined to its citation (a dict, see sweep)."""
    checked_since = ev["checked_at"] is not None and ev["cit_checked_at"] is not None and ev["checked_at"] >= ev["cit_checked_at"]
    if checked_since:
        return None
    if ev["http_status"] is not None and ev["http_status"] >= dead_status and ev["http_status"] not in policy.get("blocked_http_statuses"):
        return "dead_link"  # 401/403/429 refuse automated readers: the page may be fine (link health records "blocked")
    if ev["content_hash"] and ev["cit_hash"] and ev["content_hash"] != ev["cit_hash"]:
        return "content_changed"
    return None
