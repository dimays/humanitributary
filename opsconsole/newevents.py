"""What the New events page reads (docs/guide/operations-console.md, "New events"; ADR 0033).

The page is a feed of the content the platform makes, newest activity first, each item with its lifecycle as five
steps: Fetched → Queued → Drafted → Reviewed → Published. Nothing is stored for it: every state is derived, in SQL,
from rows that already record it.

| An item is | Its rows |
|---|---|
| a current event | a `write_event` task (`job:process` made it from a cluster of candidates), and the event the agent wrote, if any |
| a history-wave event | a `fill_gap` task (`job:gap_waves`, a branch's gap in a wave's window), one item per event it wrote (1–3), or one for the task when it wrote none |
| a branch addition | an entry an edit file added (`add_branch`, `add_event`): its insert Revision, by `apply_edits`, with no task |

| Step | Where it comes from |
|---|---|
| Fetched | a current event: its cluster's first candidate (`payload.items`); a gap: when `gap_waves` found and queued it |
| Queued | the task's `created_at` |
| Drafted | the task's `completed_at` (the API applies a result and completes the task in one transaction); for a branch addition, its insert Revision. A task that wrote nothing ends here: rejected, duplicate or nothing notable (its result's `decision`), failed or cancelled |
| Reviewed | the entry's Revisions by `apply_edits`: the first that publishes it (approved, "with edits" when an edit came first or the reason says so), the last that retracts it (rejected, or duplicate when the reason says so), else the first edit (held: still in review); a status change by anyone else counts the same way |
| Published | the first release whose `revision_high_water` covers the Revision that published it; "live" when that is at or below the live release's |

An entry is found from its task through the insert Revision linked to the task (`Revision.task_id`), never through
the slug in the result, so a later rename keeps the link. Two statements carry the page whatever the tables hold:
`counts_and_pulse` (the tab and state counts under the filters, and the 14-day pulse) and `page` (one page of items,
ordered and cut in SQL); `details` then reads the shown items' titles, branches, sources, notes and reasons in one
more. No payload is read for the list, only for the shown items (a `write_event` payload carries up to 12 stories).
"""

import re
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.db import connection
from django.urls import reverse
from django.utils import timezone

from evidence.independence import witness

PAGE_SIZE = 25
PULSE_DAYS = 14
RANGES = {"today": ("Today", 0), "7d": ("7 days", 7), "30d": ("30 days", 30), "all": ("Any time", None)}
DEFAULT_RANGE = "7d"

# Tabs: (key, label, the SQL predicate on the derived rows). The predicates are constants, never built from input.
TABS = [
    ("all", "All", "TRUE"),
    ("current", "Current events", "d.source = 'current'"),
    ("waves", "History waves", "d.source = 'wave'"),
    ("branches", "Branch additions", "d.source = 'branch'"),
    ("rejected", "Rejected & duplicates", "d.state IN ('declined', 'rejected', 'duplicate', 'retracted')"),
    ("waiting", "Waiting", "d.state IN ('queued', 'writing')"),
]
TAB_SOURCES = {"current": "current", "waves": "wave", "branches": "branch"}
REJECTED = {"declined", "rejected", "duplicate", "retracted"}
WAITING = {"queued", "writing"}

# state → (label, badge class, what it means). The order is the filter's.
STATES = {
    "queued": ("Queued", "waiting", "a task waits for an agent"),
    "writing": ("Being written", "in_progress", "an agent holds the task"),
    "review": ("In review", "running", "drafted; no reviewer has acted on it"),
    "held": ("Held", "paused", "a reviewer edited it and left it in review"),
    "approved": ("Approved", "approved", "published by a reviewer; no release carries it yet"),
    "published": ("Published", "completed", "in a release"),
    "declined": ("Rejected by the agent", "failed", "the agent decided it is not an event for the timeline"),
    "duplicate": ("Duplicate", "failed", "an event already covers it (the agent's or the reviewer's verdict)"),
    "rejected": ("Rejected", "failed", "a reviewer retracted the draft"),
    "retracted": ("Retracted", "failed", "retracted after a release carried it"),
    "nothing_notable": ("Nothing notable", "cancelled", "the agent found nothing notable and sourceable in the window"),
    "failed": ("Task failed", "failed", "the task failed after its attempts"),
    "cancelled": ("Cancelled", "cancelled", "the task was cancelled before it was written"),
}
SOURCES = {"current": "Current event", "wave": "History wave", "branch": "Branch addition"}

# Every content item and its derived state. %(...)s are parameters; `%%` is a literal percent sign.
ITEMS_CTE = """
WITH
t AS (
  SELECT id, kind, status, created_at, claimed_at, completed_at, claimed_by, target_candidate_id, dedupe_key,
         result->>'decision' AS decision
  FROM work_agenttask WHERE kind IN ('write_event', 'fill_gap')
),
made AS (  -- entries a task wrote: the insert Revision the agent API linked to the task
  SELECT r.task_id, r.row_pk::bigint AS entry_id, r.id AS ins_rev, r.reason AS ins_reason, r.at AS ins_at, r.actor AS ins_by
  FROM t JOIN revisions_revision r ON r.task_id = t.id AND r.table_name = 'timeline_entry' AND r.action = 'insert'
),
items AS (
  SELECT CASE WHEN t.kind = 'write_event' THEN 'current' ELSE 'wave' END AS source, t.id AS task_id,
         m.entry_id, m.ins_rev, m.ins_reason, CASE WHEN m.entry_id IS NOT NULL THEN coalesce(t.completed_at, m.ins_at) END AS drafted_at,
         t.status AS task_status, t.decision, t.created_at AS queued_at, t.claimed_at, t.completed_at,
         CASE WHEN t.kind = 'write_event' THEN c.top_branch_id ELSE gb.id END AS task_branch
  FROM t LEFT JOIN made m ON m.task_id = t.id
         LEFT JOIN ingest_candidate c ON c.id = t.target_candidate_id
         LEFT JOIN timeline_entry gb ON t.kind = 'fill_gap' AND gb.slug = split_part(t.dedupe_key, ':', 2) AND gb.kind = 'branch'
  UNION ALL
  SELECT 'branch', NULL, r.row_pk::bigint, r.id, r.reason, r.at, NULL, NULL, NULL, NULL, NULL, NULL  -- an edit file's add_branch / add_event
  FROM revisions_revision r
  WHERE r.table_name = 'timeline_entry' AND r.action = 'insert' AND r.task_id IS NULL AND r.reason LIKE 'apply_edits %%'
),
f AS (
  SELECT i.*, e.id AS e_id, e.kind AS e_kind, e.status AS e_status,
         coalesce(ev.branch_id, CASE WHEN e.kind = 'branch' THEN e.id END, i.task_branch) AS branch_id,
         x.pub_rev, x.ret_rev, x.edit_rev
  FROM items i
  LEFT JOIN timeline_entry e ON e.id = i.entry_id
  LEFT JOIN timeline_event ev ON ev.entry_ptr_id = i.entry_id
  LEFT JOIN LATERAL (
    SELECT min(r.id) FILTER (WHERE r.table_name = 'timeline_entry' AND r.after->>'status' = 'published'
                               AND (r.action = 'insert' OR 'status' = ANY(r.changed))) AS pub_rev,
           max(r.id) FILTER (WHERE r.table_name = 'timeline_entry' AND r.action = 'update' AND 'status' = ANY(r.changed)
                               AND r.after->>'status' = 'retracted') AS ret_rev,
           min(r.id) FILTER (WHERE r.reason <> i.ins_reason AND r.reason LIKE 'apply_edits %%'
                               AND NOT (r.table_name = 'timeline_entry' AND 'status' = ANY(r.changed))) AS edit_rev
    FROM revisions_revision r
    WHERE i.entry_id IS NOT NULL AND r.table_name IN ('timeline_entry', 'timeline_event', 'timeline_branch') AND r.row_pk = i.entry_id::text
  ) x ON TRUE
),
d AS (
  SELECT f.*, pr.at AS pub_at, rr.at AS ret_at, er.at AS edit_at, rel.version AS release, rel.created_at AS release_at,
    CASE
      WHEN f.entry_id IS NULL THEN CASE
        WHEN f.task_status = 'queued' THEN 'queued'
        WHEN f.task_status = 'claimed' THEN 'writing'
        WHEN f.task_status = 'failed' THEN 'failed'
        WHEN f.task_status = 'cancelled' THEN 'cancelled'
        WHEN f.decision = 'duplicate' THEN 'duplicate'
        WHEN f.decision = 'nothing_notable' THEN 'nothing_notable'
        ELSE 'declined' END
      WHEN f.e_id IS NULL THEN 'rejected'
      WHEN f.e_status = 'retracted' THEN CASE
        WHEN rr.reason ILIKE '%%duplicate%%' THEN 'duplicate'
        WHEN rel.version IS NOT NULL THEN 'retracted'
        ELSE 'rejected' END
      WHEN f.e_status = 'published' THEN CASE WHEN rel.version IS NOT NULL THEN 'published' ELSE 'approved' END
      WHEN f.edit_rev IS NOT NULL THEN 'held'
      ELSE 'review'
    END AS state,
    CASE WHEN f.entry_id IS NULL AND f.decision IN ('rejected', 'duplicate') THEN f.completed_at
         WHEN f.e_status = 'retracted' THEN rr.at END AS rejected_at,
    greatest(f.queued_at, f.claimed_at, f.completed_at, f.drafted_at, er.at, pr.at, rr.at, rel.created_at) AS last_at
  FROM f
  LEFT JOIN revisions_revision pr ON pr.id = f.pub_rev
  LEFT JOIN revisions_revision rr ON rr.id = f.ret_rev
  LEFT JOIN revisions_revision er ON er.id = f.edit_rev
  LEFT JOIN LATERAL (SELECT version, created_at FROM publish_release WHERE revision_high_water >= f.pub_rev
                     ORDER BY revision_high_water, id LIMIT 1) rel ON f.pub_rev IS NOT NULL
)
"""

# The filters every statement shares (the date range and the branch: primary or linked).
FILTERS = """
(%(since)s::timestamptz IS NULL OR d.last_at >= %(since)s)
AND (%(branch)s::bigint IS NULL OR d.branch_id = %(branch)s
     OR EXISTS (SELECT 1 FROM timeline_eventlink l WHERE l.event_id = d.entry_id AND l.branch_id = %(branch)s))
"""

COUNTS_SQL = ITEMS_CTE + """,
days AS (SELECT generate_series(%(day0)s::date, %(today)s::date, interval '1 day')::date AS day),
local AS (SELECT (d.queued_at AT TIME ZONE %(tz)s)::date AS queued, (d.drafted_at AT TIME ZONE %(tz)s)::date AS drafted,
                 (d.release_at AT TIME ZONE %(tz)s)::date AS released, (d.rejected_at AT TIME ZONE %(tz)s)::date AS rejected, d.task_id
          FROM d WHERE d.last_at >= %(pulse_since)s),
pulse AS (
  SELECT days.day,
         (SELECT count(*) FROM ingest_candidate c WHERE c.created_at >= %(pulse_since)s AND (c.created_at AT TIME ZONE %(tz)s)::date = days.day) AS fetched,
         (SELECT count(DISTINCT task_id) FROM local WHERE queued = days.day) AS queued,
         (SELECT count(*) FROM local WHERE drafted = days.day) AS drafted,
         (SELECT count(*) FROM local WHERE released = days.day) AS published,
         (SELECT count(*) FROM local WHERE rejected = days.day) AS rejected
  FROM days
)
SELECT (SELECT coalesce(json_agg(json_build_object('source', source, 'state', state, 'n', n)), '[]')
        FROM (SELECT d.source, d.state, count(*) AS n FROM d WHERE """ + FILTERS + """ GROUP BY 1, 2) g) AS counts,
       (SELECT json_agg(json_build_object('day', day, 'fetched', fetched, 'queued', queued, 'drafted', drafted,
                                          'published', published, 'rejected', rejected) ORDER BY day) FROM pulse) AS pulse
"""

PAGE_SQL = ITEMS_CTE + """
SELECT d.source, d.task_id, d.entry_id, d.ins_rev, d.state, d.task_status, d.decision, d.queued_at, d.claimed_at, d.completed_at,
       d.drafted_at, d.pub_rev, d.pub_at, d.ret_rev, d.ret_at, d.edit_rev, d.edit_at, d.release, d.release_at, d.last_at, d.branch_id
FROM d WHERE {tab} AND {state} AND """ + FILTERS + """
ORDER BY d.last_at DESC, d.source, d.task_id DESC NULLS LAST, d.entry_id DESC NULLS LAST
LIMIT %(limit)s OFFSET %(offset)s
"""

# The shown items' words: entry, branches, sources, task payload bits, candidates, the review Revisions' reasons.
DETAILS_SQL = """
WITH s AS (SELECT * FROM jsonb_to_recordset(%(items)s::jsonb)
           AS s(k int, task_id bigint, entry_id bigint, ins_rev bigint, pub_rev bigint, ret_rev bigint, edit_rev bigint, branch_id bigint))
SELECT s.k,
       e.slug, e.kind, e.status, coalesce(ev.title, br.name) AS title, coalesce(ev.when, br.start_when) AS when_text,
       coalesce(ev.imp, 0) AS imp,
       (SELECT json_agg(json_build_object('slug', b.slug, 'name', bb.name) ORDER BY o.pos)
        FROM (SELECT s.branch_id AS id, -1 AS pos UNION ALL
              SELECT l.branch_id, l.position FROM timeline_eventlink l WHERE l.event_id = s.entry_id
              UNION ALL SELECT bl.target_id, 100 + bl.position FROM timeline_branchlink bl
              WHERE bl.branch_id = s.entry_id AND bl.relation = 'parent') o
        JOIN timeline_entry b ON b.id = o.id JOIN timeline_branch bb ON bb.entry_ptr_id = o.id) AS branches,
       (SELECT json_agg(DISTINCT jsonb_build_array(cit.id, coalesce(p.domain, '')))
        FROM evidence_claim cl JOIN evidence_evidence x ON x.claim_id = cl.id AND x.stance IN ('supports', 'partial')
        JOIN evidence_citation cit ON cit.id = x.citation_id LEFT JOIN evidence_publisher p ON p.id = cit.publisher_id
        WHERE cl.entry_id = s.entry_id) AS cites,
       t.kind AS task_kind, t.claimed_by, t.attempts, t.priority, left(t.result->>'note', 400) AS note, t.result->>'entry' AS result_entry,
       t.payload->'suggested'->>'title_hint' AS title_hint, (t.payload->>'items_total')::int AS stories,
       t.payload->'wave'->>'name' AS wave, t.payload->'window'->>'label' AS window, t.payload->'branch'->>'name' AS gap_branch,
       t.payload->'gap'->>'kind' AS gap_kind, t.payload->'pointers'->>'at' AS pointers_at, left(t.error, 300) AS error,
       c.id AS candidate, c.title AS candidate_title,
       (SELECT min(cc.created_at) FROM ingest_candidate cc
        WHERE cc.id IN (SELECT (it->>'candidate')::bigint FROM jsonb_array_elements(coalesce(t.payload->'items', '[]')) it)) AS fetched_at,
       ir.actor AS drafted_by, left(ir.reason, 400) AS drafted_reason,
       pr.actor AS pub_by, left(pr.reason, 400) AS pub_reason,
       rr.actor AS ret_by, left(rr.reason, 400) AS ret_reason,
       er.actor AS edit_by, left(er.reason, 400) AS edit_reason,
       (s.edit_rev IS NOT NULL AND s.edit_rev < s.pub_rev) OR pr.reason ILIKE '%%with edits%%'
         OR EXISTS (SELECT 1 FROM revisions_revision sib WHERE sib.txid = pr.txid AND pr.reason LIKE 'apply_edits %%'
                    AND sib.reason LIKE 'apply_edits %% edit ' || e.slug || ':%%') AS with_edits,
       (s.pub_rev IS NOT NULL AND s.pub_rev <= %(live_hw)s AND e.status = 'published') AS live
FROM s
LEFT JOIN timeline_entry e ON e.id = s.entry_id
LEFT JOIN timeline_event ev ON ev.entry_ptr_id = s.entry_id
LEFT JOIN timeline_branch br ON br.entry_ptr_id = s.entry_id
LEFT JOIN work_agenttask t ON t.id = s.task_id
LEFT JOIN ingest_candidate c ON c.id = t.target_candidate_id
LEFT JOIN revisions_revision ir ON ir.id = s.ins_rev
LEFT JOIN revisions_revision pr ON pr.id = s.pub_rev
LEFT JOIN revisions_revision rr ON rr.id = s.ret_rev
LEFT JOIN revisions_revision er ON er.id = s.edit_rev
"""

EDIT_REASON = re.compile(r"^apply_edits (?P<file>\S+) #\d+ (?P<op>\S+) \S+: (?P<why>.*)$", re.S)


@dataclass
class Filters:
    tab: str = "all"
    state: str = ""
    range: str = DEFAULT_RANGE
    branch: str = ""          # a branch slug, as typed
    branch_id: int | None = None

    def params(self, now) -> dict:
        days = RANGES[self.range][1]
        since = None if days is None else (midnight(now) - timedelta(days=days) if days else midnight(now))
        return {"since": since, "branch": self.branch_id}


def midnight(now):
    return timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)


def parse(get) -> Filters:
    """The page's query string → filters, each checked against its fixed set (anything else falls back)."""
    from timeline.models import Branch

    f = Filters(tab=get.get("tab", "all"), state=get.get("state", ""), range=get.get("range", DEFAULT_RANGE), branch=get.get("branch", "").strip())
    if f.tab not in {k for k, _, _ in TABS}:
        f.tab = "all"
    if f.state not in STATES:
        f.state = ""
    if f.range not in RANGES:
        f.range = DEFAULT_RANGE
    if f.branch:
        f.branch_id = Branch.objects.filter(slug=f.branch).values_list("entry_ptr_id", flat=True).first()
        if f.branch_id is None:
            f.branch = ""
    return f


def _fetch(sql: str, params: dict) -> list[dict]:
    with connection.cursor() as c:
        c.execute(sql, params)
        cols = [x.name for x in c.description]
        return [dict(zip(cols, row)) for row in c.fetchall()]


def counts_and_pulse(f: Filters, now) -> dict:
    """One statement: the items per (source, state) under the date and branch filters, and the last PULSE_DAYS days'
    numbers (candidates fetched, tasks queued, drafts written, items published, items rejected), oldest first."""
    import json

    today = midnight(now)
    day0 = today - timedelta(days=PULSE_DAYS - 1)
    params = {**f.params(now), "tz": timezone.get_current_timezone_name(), "day0": day0.date(), "today": today.date(), "pulse_since": day0}
    row = _fetch(COUNTS_SQL, params)[0]
    counts = json.loads(row["counts"]) if isinstance(row["counts"], str) else row["counts"]
    pulse = json.loads(row["pulse"]) if isinstance(row["pulse"], str) else row["pulse"]
    by_tab = {k: 0 for k, _, _ in TABS}
    by_state = {}
    for c in counts:
        for key, _, _ in TABS:
            if _in_tab(key, c["source"], c["state"]):
                by_tab[key] += c["n"]
        if _in_tab(f.tab, c["source"], c["state"]):
            by_state[c["state"]] = by_state.get(c["state"], 0) + c["n"]
    total = by_state.get(f.state, 0) if f.state else by_tab[f.tab]
    return {"tabs": by_tab, "states": by_state, "total": total, "pulse": _pulse(pulse or [])}


def _in_tab(tab: str, source: str, state: str) -> bool:
    """The Python side of TABS' predicates (for the counts the statement returns by source and state)."""
    if tab in TAB_SOURCES:
        return source == TAB_SOURCES[tab]
    if tab == "rejected":
        return state in REJECTED
    if tab == "waiting":
        return state in WAITING
    return True


PULSE_SERIES = [("fetched", "Candidates fetched"), ("queued", "Tasks queued"), ("drafted", "Drafts written"),
                ("published", "Published"), ("rejected", "Rejected")]


BAR_STEP, BAR_W, BAR_H = 10, 7, 30   # the pulse's SVG: a bar every 10 units, 7 wide, at most 30 tall (viewBox 0 0 140 32)


def _pulse(rows: list[dict]) -> dict:
    """The pulse's days and, per series, its bars: each scaled to the series' own largest day (small multiples, one
    row a series, so a busy row never flattens a quiet one), drawn in a 140 × 32 viewBox."""
    from datetime import date

    for r in rows:
        if isinstance(r["day"], str):
            r["day"] = date.fromisoformat(r["day"][:10])
    series = []
    for key, label in PULSE_SERIES:
        values = [r[key] for r in rows]
        top = max(values, default=0)
        bars = []
        for i, (v, r) in enumerate(zip(values, rows)):
            h = round(BAR_H * v / top, 2) if top and v else 0
            bars.append({"n": v, "day": r["day"], "x": i * BAR_STEP + 1.5, "h": max(h, 1.5) if v else 0, "y": 31 - (max(h, 1.5) if v else 0)})
        series.append({"key": key, "label": label, "today": values[-1] if values else 0, "total": sum(values), "max": top, "bars": bars})
    return {"days": [r["day"] for r in rows], "series": series, "width": BAR_STEP * len(rows), "bar_w": BAR_W}


class Items:
    """A page of items for Django's Paginator: the total comes from counts_and_pulse, a slice runs PAGE_SQL."""

    def __init__(self, f: Filters, now, total: int):
        self.f, self.now, self.total = f, now, total

    def count(self):
        return self.total

    def __len__(self):
        return self.total

    def __getitem__(self, s: slice):
        tab = dict((k, p) for k, _, p in TABS)[self.f.tab]
        state = "d.state = %(state)s" if self.f.state else "TRUE"
        params = {**self.f.params(self.now), "state": self.f.state, "limit": s.stop - s.start, "offset": s.start}
        rows = _fetch(PAGE_SQL.format(tab=tab, state=state), params)
        return details(rows, self.now)


def live_high_water() -> int:
    """The live release's revision_high_water (the pointer's version; the newest release when the store can't say)."""
    from publish.models import Release

    from . import queries as Q

    version = (Q.pointer() or {}).get("version")
    qs = Release.objects.filter(version=version) if version else Release.objects.order_by("-created_at", "-id")
    return qs.values_list("revision_high_water", flat=True).first() or 0


def _review_reason(reason: str | None) -> dict:
    """An apply_edits Revision's reason → {file, op, why}; anything else → {why}."""
    if not reason:
        return {}
    m = EDIT_REASON.match(reason)
    if m:
        return {"file": m["file"], "op": m["op"], "why": m["why"].strip()}
    return {"why": reason.strip()}


def details(rows: list[dict], now, live_hw: int | None = None) -> list[dict]:
    """The shown items with their words and their five steps (one statement for all of them)."""
    import json

    if not rows:
        return []
    live_hw = live_high_water() if live_hw is None else live_hw
    keys = ("task_id", "entry_id", "ins_rev", "pub_rev", "ret_rev", "edit_rev", "branch_id")
    payload = json.dumps([{"k": i, **{k: r[k] for k in keys}} for i, r in enumerate(rows)])
    extra = {x["k"]: x for x in _fetch(DETAILS_SQL, {"items": payload, "live_hw": live_hw})}
    out = []
    for i, r in enumerate(rows):
        x = extra.get(i, {})
        out.append(_item(r, x, now))
    return out


def _sources(cites) -> dict:
    if isinstance(cites, str):
        import json

        cites = json.loads(cites)
    cites = cites or []
    witnesses = {witness(domain) for _, domain in cites}
    non_wiki = sum(1 for _, domain in cites if witness(domain) != "wikipedia.org")
    return {"total": len(cites), "non_wikipedia": non_wiki, "witnesses": len(witnesses), "single": len(witnesses) == 1}


def _item(r: dict, x: dict, now) -> dict:
    """One feed item: what it is, its five steps, its verdict, its links."""
    import json

    state = r["state"]
    source = r["source"]
    branches = x.get("branches")
    branches = (json.loads(branches) if isinstance(branches, str) else branches) or []
    seen, chips = set(), []
    for b in branches:
        if b["slug"] not in seen:
            seen.add(b["slug"])
            chips.append(b)
    slug = x.get("slug")
    pub = _review_reason(x.get("pub_reason"))
    ret = _review_reason(x.get("ret_reason"))
    edit = _review_reason(x.get("edit_reason"))
    drafted = _review_reason(x.get("drafted_reason")) if source == "branch" else {}
    title = x.get("title") or x.get("title_hint") or x.get("candidate_title") or x.get("gap_branch") or "(untitled)"
    if state == "duplicate":
        verdict, verdict_by, verdict_why = "Duplicate", (x.get("ret_by") or x.get("claimed_by")), (ret.get("why") or x.get("note"))
    elif state in ("rejected", "retracted"):
        verdict, verdict_by, verdict_why = STATES[state][0], x.get("ret_by"), ret.get("why")
    elif state in ("approved", "published") or (r["pub_rev"] and state not in REJECTED):
        verdict = "Approved with edits" if x.get("with_edits") else "Approved"
        if source == "branch" and x.get("pub_reason") and x.get("pub_reason") == x.get("drafted_reason"):
            verdict = "Added as published"
        verdict_by, verdict_why = x.get("pub_by"), pub.get("why")
    elif state == "held":
        verdict, verdict_by, verdict_why = "Held", x.get("edit_by"), edit.get("why")
    else:
        verdict = verdict_by = verdict_why = None
    reviewed_at = r["ret_at"] if state in ("duplicate", "rejected", "retracted") and r["ret_at"] else (
        r["pub_at"] if r["pub_rev"] else (r["edit_at"] if state == "held" else None))
    agent = x.get("drafted_by") if source != "branch" and x.get("drafted_by") else x.get("claimed_by")
    item = {
        "key": f"{source}-{r['task_id'] or 0}-{r['entry_id'] or 0}", "source": source, "source_label": SOURCES[source],
        "state": state, "state_label": STATES[state][0], "state_class": STATES[state][1], "state_doc": STATES[state][2],
        "title": title, "drafted": bool(slug), "slug": slug, "kind": x.get("kind"), "when": x.get("when_text"), "imp": x.get("imp"),
        "branches": chips, "sources": _sources(x.get("cites")) if slug else None,
        "agent": agent, "verdict": verdict, "verdict_by": verdict_by, "verdict_why": verdict_why,
        "note": x.get("note"), "error": x.get("error"), "duplicate_of": x.get("result_entry") if r.get("decision") == "duplicate" else None,
        "task": r["task_id"], "task_kind": x.get("task_kind"), "attempts": x.get("attempts"), "priority": x.get("priority"),
        "candidate": x.get("candidate"), "stories": x.get("stories"),
        "wave": x.get("wave"), "window": x.get("window"), "gap_kind": x.get("gap_kind"),
        "edit_file": drafted.get("file"), "edit_op": drafted.get("op"),
        "release": r["release"], "live": bool(x.get("live")), "last_at": r["last_at"],
        "revision": r["ins_rev"],
        "public_url": f"{settings.PUBLIC_SITE_URL}/#{slug}" if slug and x.get("live") else None,
    }
    item["steps"] = steps(r, x, item, reviewed_at, now)
    item["links"] = links(item)
    return item


def _step(key, label, *, at=None, status="pending", note=""):
    return {"key": key, "label": label, "at": at, "status": status, "note": note}


def steps(r: dict, x: dict, item: dict, reviewed_at, now) -> list[dict]:
    """The five steps: each done, current (where the item is now), failed (where it stopped), skipped (not part of
    its path) or pending, with its time and a few words."""
    state, source = r["state"], r["source"]
    out = []
    if source == "branch":
        out.append(_step("fetched", "Fetched", status="skipped", note="from a review"))
        out.append(_step("queued", "Queued", status="skipped", note="no task"))
        out.append(_step("drafted", "Drafted", at=r["drafted_at"], status="done",
                         note=f"{item['edit_op'] or 'added'} · {item['edit_file']}" if item["edit_file"] else "in an edit file"))
    else:
        if source == "current":
            fetched = x.get("fetched_at") or r["queued_at"]
            n = item["stories"]
            out.append(_step("fetched", "Fetched", at=fetched, status="done", note=f"{n} stor{'y' if n == 1 else 'ies'}" if n else "candidate"))
        else:
            out.append(_step("fetched", "Gap found", at=r["queued_at"], status="done",
                             note=" · ".join(b for b in (x.get("wave"), x.get("window")) if b)))
        out.append(_step("queued", "Queued", at=r["queued_at"], status="current" if state == "queued" else "done",
                         note=f"priority {x.get('priority')}" if x.get("priority") is not None else ""))
        if state == "writing":
            out.append(_step("drafted", "Drafting", at=r["claimed_at"], status="current", note=x.get("claimed_by") or ""))
        elif state == "queued":
            out.append(_step("drafted", "Drafted"))
        elif r["entry_id"] is None:
            word = {"duplicate": "Duplicate", "nothing_notable": "Nothing notable", "failed": "Task failed",
                    "cancelled": "Cancelled"}.get(state, "Rejected")
            out.append(_step("drafted", word, at=r["completed_at"], status="failed" if state != "nothing_notable" else "skipped",
                             note=x.get("claimed_by") or ""))
        else:
            out.append(_step("drafted", "Drafted", at=r["drafted_at"], status="done", note=item["agent"] or ""))
    # Reviewed
    if not item["drafted"]:
        out.append(_step("reviewed", "Reviewed", status="skipped" if state not in WAITING else "pending"))
    elif item["verdict"]:
        failed = state in REJECTED
        status = "failed" if failed else ("current" if state == "held" else "done")
        out.append(_step("reviewed", item["verdict"] if item["verdict"] != "Added as published" else "Reviewed", at=reviewed_at,
                         status=status, note=item["verdict_by"] or ""))
    else:
        out.append(_step("reviewed", "Reviewed", status="current", note="waiting for review"))
    # Published
    if r["release"]:
        out.append(_step("published", "Published", at=r["release_at"], status="failed" if state == "retracted" else "done",
                         note=r["release"] + (" · live" if item["live"] else "")))
    elif state == "approved":
        out.append(_step("published", "Published", status="current", note="next release"))
    elif not item["drafted"] or state in REJECTED:
        out.append(_step("published", "Published", status="skipped"))
    else:
        out.append(_step("published", "Published"))
    for s in out:
        s["ago"] = (now - s["at"]) if s["at"] else None
    return out


def card(item: dict) -> dict:
    """The item's hover card (the page embeds these; ADR 0033): its steps' times as epoch seconds, the time between
    them, and the words the card shows that the row doesn't (the reviewer's and the agent's reasons, the wave)."""
    st = [{"label": s["label"], "status": s["status"], "t": round(s["at"].timestamp()) if s["at"] else None, "note": s["note"]} for s in item["steps"]]
    out = {"title": item["title"], "source": item["source_label"], "state": item["state_label"], "cls": item["state_class"], "doc": item["state_doc"], "steps": st}
    optional = {"why": item["verdict_why"], "by": item["verdict_by"], "verdict": item["verdict"], "note": item["note"], "error": item["error"],
                "wave": item["wave"], "window": item["window"], "gap": item["gap_kind"], "agent": item["agent"], "attempts": item["attempts"],
                "file": item["edit_file"]}
    out.update({k: v for k, v in optional.items() if v not in (None, "", 0)})
    return out


def links(item: dict) -> list[tuple[str, str]]:
    """The item's links: the page, the task, the revisions, the release, the candidate (admin)."""
    out = []
    if item["public_url"]:
        out.append(("On the page", item["public_url"]))
    if item["task"]:
        out.append((f"Task #{item['task']}", reverse("opsconsole:task", args=[item["task"]])))
    if item["revision"]:
        out.append(("Revisions", reverse("opsconsole:revision", args=[item["revision"]])))
    if item["release"]:
        out.append((item["release"], reverse("opsconsole:release", args=[item["release"]])))
    if item["candidate"]:
        out.append(("Candidate", reverse("admin:ingest_candidate_change", args=[item["candidate"]])))
    return out
