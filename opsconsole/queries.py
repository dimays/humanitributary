"""What the operations console reads (docs/guide/operations-console.md; ADR 0028, redesigned by ADR 0031).

Read-only: every function here only selects. Totals are computed by Postgres (GROUP BY, FILTER, DISTINCT ON,
LATERAL), never by loading rows into Python to count them, so a page makes the same handful of queries however many
runs, tasks or Revisions there are. Nothing here calls a function that writes as a side effect
(`governance.waves.state()` creates its JobState row, so the waves are read straight from `JobState`).

The console speaks in run *states*, Prefect's words for what the runner records (`STATES`): a FetchRun is Running,
Completed (ok, or partial: completed with errors) or Failed; a run asked for from the console and not yet taken by
the worker is Pending, or Cancelled if it was withdrawn; a job's next due time is Scheduled, or Paused.
"""

import json
from collections import defaultdict
from datetime import datetime, timedelta

from django.conf import settings
from django.db import connection
from django.db.models import Count, Max, Min, Q
from django.db.models.fields.json import KT
from django.utils import timezone

from infra import storage
from ingest.models import Candidate, Document, Feed, FetchRun, JobState
from ingest.policy import mask_secrets
from ingest.prefetch import KINDS as PREFETCH_KINDS
from work.models import AgentTask
from work.rounds import FED_BY

# ── States, tags, schedules ─────────────────────────────────────────────────────────────────────────────────────

STATES = {  # state → (label, what it means)
    "scheduled": ("Scheduled", "the job's next run, when it is due"),
    "pending": ("Pending", "asked for from the console; waiting for the worker"),
    "running": ("Running", "running now"),
    "completed": ("Completed", "finished; a partial run completed with errors"),
    "failed": ("Failed", "raised, or was interrupted"),
    "cancelled": ("Cancelled", "a console run withdrawn before the worker took it"),
    "paused": ("Paused", "the scheduler skips the job until it is resumed"),
}
RUN_STATE = {"running": "running", "ok": "completed", "partial": "completed", "failed": "failed"}
STATE_STATUSES = {"running": ["running"], "completed": ["ok", "partial"], "failed": ["failed"]}  # filter → FetchRun.status
HISTORY_RUNS = 10       # runs in a job's history strip
TIMELINE_HOURS = 24
OVERDUE = timedelta(minutes=30)
# The daily caps shown against today's new tasks: (kind, the job that queues it, the setting).
CAPS = [("write_event", "job:process", "WRITE_EVENT_TASKS_PER_DAY"), ("fill_gap", "job:gap_waves", "FILL_GAP_TASKS_PER_DAY")]


def run_state(status: str) -> str:
    return RUN_STATE.get(status or "", "scheduled")


def every(minutes: int | None) -> str:
    """An interval in words: 15 → "every 15 minutes", 60 → "every hour", 1440 → "every day"."""
    if not minutes:
        return "–"
    m = int(minutes)
    for unit, size in (("week", 10080), ("day", 1440), ("hour", 60)):
        if m % size == 0:
            n = m // size
            return f"every {unit}" if n == 1 else f"every {n} {unit}s"
    return f"every {m} minutes"


def midnight(now):
    """Local midnight: where the jobs' daily caps start counting (ingest/process.py, governance/waves.py)."""
    return timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)


def first_line(text: str, n: int = 160) -> str:
    line = (mask_secrets(text or "").strip().splitlines() or [""])[0]
    return line if len(line) <= n else line[: n - 1] + "…"


def counts_summary(counts: dict, n: int = 3) -> str:
    """The largest few numbers of a run's counts, "errors" first when there are any."""
    items = [(k, v) for k, v in (counts or {}).items() if isinstance(v, (int, float)) and v]
    items.sort(key=lambda kv: (kv[0] != "errors", -kv[1], kv[0]))
    shown = ", ".join(f"{k} {v:g}" for k, v in items[:n])
    return shown + (f" (+{len(items) - n})" if len(items) > n else "")


def _registry():
    from ingest.jobs import REGISTRY, _load_registry

    _load_registry()
    return REGISTRY


def tag_set() -> dict[str, str]:
    """The documented tags (ingest.jobs.TAGS) and "paused"."""
    from ingest.jobs import TAGS

    return {**TAGS, "paused": "paused from the console: the scheduler skips it"}


def jobs_with_tag(tag: str) -> list[str]:
    from ingest.jobs import paused_jobs

    if tag == "paused":
        return sorted(paused_jobs())
    return [n for n, j in _registry().items() if tag in j.tags]


# ── Health ──────────────────────────────────────────────────────────────────────────────────────────────────────

def _lock_held(key: int) -> bool:
    """Is a Postgres advisory lock with this bigint key held by any session? (pg_locks splits a bigint key into
    classid, the high 32 bits, and objid, the low 32, with objsubid 1.) pg_locks is readable by every role."""
    with connection.cursor() as c:
        c.execute(
            "SELECT EXISTS (SELECT 1 FROM pg_locks WHERE locktype = 'advisory' AND granted AND objsubid = 1"
            " AND ((classid::bigint << 32) | objid::bigint) = %s)", [key])
        return c.fetchone()[0]


def worker_holds_lock() -> bool:
    from ingest.jobs import SCHEDULER_LOCK_KEY

    return _lock_held(SCHEDULER_LOCK_KEY)


def health(now) -> dict:
    """The stores, the release pointer, the worker (the scheduler lock, and whether any run started lately)."""
    from ingest.jobs import LOCK_KEY

    out = {"storage": {}, "storage_backend": settings.STORAGE_BACKEND}
    for alias in (storage.RAW, storage.RELEASES):
        ok, err = storage.reachable(alias)
        out["storage"][alias] = {"ok": ok, "error": err}
    try:
        out["pointer"] = storage.read_pointer() if out["storage"][storage.RELEASES]["ok"] else None
    except Exception as e:  # noqa: BLE001 — the console reports, it never raises on a store hiccup
        out["pointer"], out["pointer_error"] = None, f"{type(e).__name__}"
    out["worker"] = worker_holds_lock()
    out["runner"] = _lock_held(LOCK_KEY)
    out["last_run_started"] = FetchRun.objects.aggregate(m=Max("started_at"))["m"]
    # The worker ticks every WORKER_TICK_SECONDS and `process` is due every 15 minutes, so a live worker starts a run
    # at least every ~16 minutes; quiet for longer than this means no worker (or launchd) is running jobs.
    out["quiet"] = out["last_run_started"] is None or now - out["last_run_started"] > timedelta(minutes=30)
    return out


# ── Jobs ────────────────────────────────────────────────────────────────────────────────────────────────────────

FAILURE_STREAKS_SQL = """
SELECT r.job, r.feed_id, count(*)
FROM ingest_fetchrun r
LEFT JOIN (SELECT job, feed_id, max(started_at) AS ok_at FROM ingest_fetchrun
           WHERE status IN ('ok', 'partial') GROUP BY job, feed_id) o
       ON o.job = r.job AND o.feed_id IS NOT DISTINCT FROM r.feed_id
WHERE r.status = 'failed' AND (o.ok_at IS NULL OR r.started_at > o.ok_at)
GROUP BY r.job, r.feed_id
"""

# Each job's newest runs, through the (job, started_at DESC) index: one short scan per job, whatever the table's size.
HISTORY_SQL = """
SELECT j.name, r.id, r.status, r.started_at, r.finished_at, f.name
FROM unnest(%s::text[]) AS j(name)
CROSS JOIN LATERAL (SELECT id, status, started_at, finished_at, feed_id FROM ingest_fetchrun
                    WHERE job = j.name ORDER BY started_at DESC, id DESC LIMIT %s) r
LEFT JOIN ingest_feed f ON f.id = r.feed_id
ORDER BY j.name, r.started_at, r.id
"""


def failure_streaks() -> dict[tuple[str, int | None], int]:
    """(job, feed id) → failed runs since its last ok or partial one: infra/alerts.py's count, for every job at once."""
    with connection.cursor() as c:
        c.execute(FAILURE_STREAKS_SQL)
        return {(job, feed): n for job, feed, n in c.fetchall()}


def histories(names: list[str], n: int = HISTORY_RUNS) -> dict[str, list[dict]]:
    """name → its last `n` runs, oldest first (one query)."""
    out = defaultdict(list)
    with connection.cursor() as c:
        c.execute(HISTORY_SQL, [list(names), n])
        for name, pk, status, started, finished, feed in c.fetchall():
            out[name].append({"id": pk, "status": status, "state": run_state(status), "started": started, "feed": feed,
                              "seconds": (finished - started).total_seconds() if finished else None})
    return dict(out)


def pending_runs() -> dict[str, list]:
    """Console runs not yet finished by the worker, by job (one query)."""
    from .models import OpsAction

    out = defaultdict(list)
    for a in (OpsAction.objects.filter(kind__in=["run_job", "retry_run"], status__in=["pending", "running"])
              .only("id", "kind", "target", "params", "status", "created_at", "requested_by").order_by("created_at")):
        out[a.target.removeprefix("job:")].append(a)
    return dict(out)


RECOVERY_LABEL = {"queued": "Retry queued", "running": "Retrying"}


def _covers(action, run) -> bool:
    """Does this console run (or retry) run the failed run's job and feed again?"""
    p = action.params or {}
    if action.kind == "retry_run" and p.get("run") == run.pk:
        return True
    feeds = p.get("feeds")
    return not feeds or run.feed_id in feeds


def recoveries(failed: list, pending: dict[str, list] | None = None) -> dict[int, dict]:
    """failed run id → how it is being recovered, for the failed runs that are (the others are left out): a run of the
    same job and feed that started after it and is running now ("running", with that run and the action that started
    it, if any: a scheduled run counts too), else a console retry of it, or a run of its job and feed, waiting for the
    worker ("queued") or just taken by it ("running"), with the action. Its row in Needs attention shows this instead
    of Retry and Dismiss; once that run finishes it is the job's last run, so an ok one takes the row off the card and
    a failed one replaces it. One query (and `pending_runs()`'s when not given)."""
    if not failed:
        return {}
    pending = pending_runs() if pending is None else pending
    running = list(FetchRun.objects.filter(status="running", job__in={r.job for r in failed})
                   .only("id", "job", "feed_id", "started_at", "ops_action").order_by("started_at", "id"))
    out = {}
    for r in failed:
        now_running = next((x for x in running if x.job == r.job and x.feed_id == r.feed_id and x.started_at >= r.started_at), None)
        if now_running is not None:
            out[r.pk] = {"state": "running", "label": RECOVERY_LABEL["running"], "run": now_running.pk, "action": now_running.ops_action}
            continue
        a = next((a for a in pending.get(r.job, []) if _covers(a, r)), None)
        if a is not None:
            state = "queued" if a.status == "pending" else "running"
            out[r.pk] = {"state": state, "label": RECOVERY_LABEL[state], "run": None, "action": a.pk}
    return out


def jobs(now, *, history: bool = True) -> list[dict]:
    """One row per registered job, in run order: tags, schedule, its last finished run (the newest across its feeds),
    failures in a row (the worst feed's), the next due time, whether it is paused (by whom, why; a paused job has no
    failing runs to attend to and never alerts), console runs waiting for the worker, and the last HISTORY_RUNS runs.
    A feed whose last run failed and was dismissed (ADR 0039) is not failing: it is out of `failing`, `failures` and
    `alerting`, and listed in `dismissed` (its count in `dismissed_failures`) until a newer run replaces it. Each
    failing run that is being retried is in `recoveries` (`recoveries()`). Seven queries."""
    from ingest.jobs import paused_jobs

    reg = _registry()
    paused = paused_jobs()
    last = {}
    for r in (FetchRun.objects.exclude(status="running").select_related("feed")
              .only("id", "job", "feed_id", "feed__name", "status", "started_at", "finished_at", "counts", "error", "dismissed_at", "dismissed_by", "dismiss_action")
              .order_by("job", "feed_id", "-started_at", "-id").distinct("job", "feed_id")):
        last[(r.job, r.feed_id)] = r
    streaks = failure_streaks()
    feeds = defaultdict(lambda: {"total": 0, "enabled": 0, "next": None, "names": {}, "intervals": set()})
    for f in Feed.objects.annotate(job=KT("config__job")).values("id", "name", "job", "enabled", "next_run_at", "interval_minutes"):
        d = feeds[f["job"]]
        d["total"] += 1
        d["names"][f["id"]] = f["name"]
        if f["enabled"]:
            d["enabled"] += 1
            d["intervals"].add(f["interval_minutes"])
            due = f["next_run_at"] or now
            d["next"] = due if d["next"] is None else min(d["next"], due)
    hist = histories(list(reg)) if history else {}
    pending = pending_runs()
    alert_after = settings.ALERT_AFTER_FAILURES
    rows = []
    for name, j in reg.items():
        mine = sorted((r for (job, _), r in last.items() if job == name), key=lambda r: (r.started_at, r.pk), reverse=True)
        if not j.feed:
            mine = [r for r in mine if r.feed_id is None]
        run = mine[0] if mine else None
        worst_feed, worst, worst_dismissed = None, 0, 0
        for (job, feed_id), n in streaks.items():
            if job != name:
                continue
            if getattr(last.get((job, feed_id)), "dismissed_at", None):  # its last run failed and was dismissed
                worst_dismissed = max(worst_dismissed, n)
            elif n > worst:
                worst, worst_feed = n, feed_id
        if j.feed:
            f = feeds[name]
            ivs = sorted({i or j.interval for i in f["intervals"]}) or [j.interval]
            schedule = every(ivs[0]) if len(ivs) == 1 else f"{every(ivs[0])} to {every(ivs[-1]).removeprefix('every ')}"
            schedule_note = f"per feed · {f['enabled']} of {f['total']} on"
            next_due = f["next"]
        else:
            schedule, schedule_note = every(j.interval), ""
            next_due = (run.started_at + timedelta(minutes=j.interval)) if run else now
        tags = list(j.tags) + (["paused"] if name in paused else [])
        # Its feeds' (or its own) last runs that failed: what "needs attention" lists, with a Retry and a Dismiss each,
        # except those an operator dismissed (ADR 0039).
        failed = sorted((r for (job, feed_id), r in last.items() if job == name and r.status == "failed" and (feed_id is not None) == j.feed),
                        key=lambda r: r.started_at, reverse=True)
        failing = [r for r in failed if r.dismissed_at is None]
        rows.append({
            "name": name, "doc": j.doc, "interval": j.interval, "feed": j.feed, "tags": tags, "schedule": schedule, "schedule_note": schedule_note,
            "feeds_enabled": feeds[name]["enabled"] if j.feed else None, "feeds_total": feeds[name]["total"] if j.feed else None,
            "run": run, "state": run_state(run.status) if run else None, "partial": bool(run and run.status == "partial"),
            "duration": (run.finished_at - run.started_at).total_seconds() if run and run.finished_at else None,
            "counts": counts_summary(run.counts) if run else "",
            "error": first_line(run.error) if run and run.status in ("failed", "partial") else "",
            "failures": worst, "worst_feed": feeds[name]["names"].get(worst_feed) if worst_feed else None,
            # A paused job isn't failing (what it did before the pause stays in its history and in `failures`): it is
            # left out of "needs attention" and never alerting; resuming it brings both back.
            "failing": [] if name in paused else failing, "alerting": name not in paused and worst >= alert_after, "next_due": next_due,
            "dismissed": [r for r in failed if r.dismissed_at], "dismissed_failures": worst_dismissed,
            "overdue": name not in paused and bool(next_due and next_due < now - OVERDUE),
            "paused": paused.get(name), "not_idempotent": j.not_idempotent,
            "history": hist.get(name, []), "pending": pending.get(name, []),
            "creates": [kind for kind, by in FED_BY.items() if name in by],
        })
    rec = recoveries([run for row in rows for run in row["failing"]], pending)
    for row in rows:
        row["recoveries"] = {run.pk: rec[run.pk] for run in row["failing"] if run.pk in rec}
    return rows


def upcoming(job_rows: list[dict], now, limit: int = 8) -> list[dict]:
    """What runs next: console runs waiting for the worker first, then each job's next due time, soonest first;
    paused jobs last."""
    out = []
    for r in job_rows:
        for a in r["pending"]:
            out.append({"job": r["name"], "state": "pending", "at": a.created_at, "action": a, "sort": (0, a.created_at)})
    for r in job_rows:
        if r["paused"]:
            out.append({"job": r["name"], "state": "paused", "at": None, "paused": r["paused"], "sort": (2, now)})
        elif r["next_due"]:
            out.append({"job": r["name"], "state": "scheduled", "at": r["next_due"], "overdue": r["overdue"], "sort": (1, r["next_due"])})
    out.sort(key=lambda x: x["sort"])
    return out[:limit] if limit else out


def timeline(now, hours: int = TIMELINE_HOURS) -> dict:
    """The run graph: every run that started in the last `hours`, one row per job (in run order), each bar placed by
    its start and sized by its duration as shares of the window (one query)."""
    start = now - timedelta(hours=hours)
    span = hours * 3600.0
    by_job = defaultdict(list)
    for r in (FetchRun.objects.filter(started_at__gte=start).values("id", "job", "status", "started_at", "finished_at", "feed__name")
              .order_by("started_at", "id")):
        end = r["finished_at"] or now
        secs = max((end - r["started_at"]).total_seconds(), 0.0)
        by_job[r["job"]].append({
            "id": r["id"], "state": run_state(r["status"]), "partial": r["status"] == "partial", "feed": r["feed__name"],
            "started": r["started_at"], "seconds": secs if r["finished_at"] else None,
            "left": round(100 * (r["started_at"] - start).total_seconds() / span, 3),
            "width": round(min(100 * secs / span, 100.0), 3),
        })
    order = list(_registry())
    names = [j for j in order if by_job.get(j)] + sorted(j for j in by_job if j not in order)
    rows = [{"job": j, "runs": by_job[j], "failed": sum(x["state"] == "failed" for x in by_job[j])} for j in names]
    ticks = []
    t = (start + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    while t <= now:
        ticks.append({"at": t, "left": round(100 * (t - start).total_seconds() / span, 3), "label": timezone.localtime(t).hour % 6 == 0})
        t += timedelta(hours=1)
    return {"rows": rows, "ticks": ticks, "start": start, "end": now, "hours": hours,
            "quiet": [j for j in order if not by_job.get(j)], "total": sum(len(v) for v in by_job.values())}


# ── Run cards: what the hover card over a run shows (ADR 0032) ─────────────────────────────────────────────────────

USUAL_RUNS = 30      # a job's usual runtime: the median and p90 of its last this many completed runs
USUAL_MIN = 5        # fewer completed runs than this: too few to compare against
SLOW_RATIO = 1.5     # slow: at least this many times the median, and longer than the p90
EARLIER_SHOWN = 3    # earlier attempts of a retry drawn in its card
CARD_COUNTS = 4      # numbers from a run's counts in its card

# The visible runs with their feed, the action that started them, each job's usual runtime and each retry's earlier
# attempts (following retry_of, nearest last): one query, whatever the runs are.
RUN_CARDS_SQL = """
WITH RECURSIVE
v AS (SELECT id, job, feed_id, status, started_at, finished_at, scheduled_for, trigger, triggered_by, ops_action,
             attempt, retry_of_id, counts, left(split_part(error, E'\\n', 1), 400) AS error
      FROM ingest_fetchrun WHERE id = ANY(%s)),
usual AS (SELECT j.job, count(*) AS n, percentile_cont(0.5) WITHIN GROUP (ORDER BY r.s) AS p50,
                 percentile_cont(0.9) WITHIN GROUP (ORDER BY r.s) AS p90
          FROM (SELECT DISTINCT job FROM v) j
          CROSS JOIN LATERAL (SELECT extract(epoch FROM finished_at - started_at)::float AS s FROM ingest_fetchrun
                              WHERE job = j.job AND status IN ('ok', 'partial') AND finished_at IS NOT NULL
                              ORDER BY started_at DESC, id DESC LIMIT %s) r
          GROUP BY j.job),
chain(run_id, prev_id, depth) AS (
    SELECT id, retry_of_id, 1 FROM v WHERE retry_of_id IS NOT NULL
  UNION ALL
    SELECT c.run_id, r.retry_of_id, c.depth + 1 FROM chain c JOIN ingest_fetchrun r ON r.id = c.prev_id
    WHERE r.retry_of_id IS NOT NULL AND c.depth < %s),
earlier AS (SELECT c.run_id, json_agg(json_build_object('id', r.id, 'status', r.status, 'started', r.started_at, 'finished', r.finished_at,
                                                         'attempt', r.attempt, 'requested', ea.created_at) ORDER BY c.depth DESC) AS runs
            FROM chain c JOIN ingest_fetchrun r ON r.id = c.prev_id LEFT JOIN opsconsole_opsaction ea ON ea.id = r.ops_action
            GROUP BY c.run_id)
SELECT v.id, v.job, f.name, v.status, v.started_at, v.finished_at, v.scheduled_for, v.trigger, v.triggered_by, v.ops_action,
       v.attempt, v.retry_of_id, v.counts, v.error, u.n, u.p50, u.p90, a.created_at, a.started_at, e.runs
FROM v LEFT JOIN ingest_feed f ON f.id = v.feed_id
       LEFT JOIN usual u ON u.job = v.job
       LEFT JOIN opsconsole_opsaction a ON a.id = v.ops_action
       LEFT JOIN earlier e ON e.run_id = v.id
"""


def _secs(a, b) -> float | None:
    return None if a is None or b is None else round(max((b - a).total_seconds(), 0.0), 1)


def _epoch(t) -> int | None:
    return round(t.timestamp()) if t else None


def stages(run: dict, now, earlier: list[dict] = ()) -> tuple[list[dict], list[str]]:
    """A run's mini-timeline, oldest first: for a retry its earlier attempts (each its run, then the gap until the next
    attempt was asked for), then the wait (a scheduled run: from when it became due to its start; a console run: from
    the request to its start, the worker's pick-up in between), then the run itself (to now while it runs).
    → (segments, the stages not recorded). Each segment: {"k": attempt | gap | wait | run, "s": seconds, ...}."""
    segs, missing = [], []
    wait_from = run["scheduled_for"] if run["trigger"] == "schedule" else run["requested"]
    chain = list(earlier)
    for i, e in enumerate(chain):
        end = e["finished"] or e["started"]
        segs.append({"k": "attempt", "s": _secs(e["started"], end), "state": run_state(e["status"]), "n": e["attempt"], "id": e["id"]})
        nxt = (chain[i + 1]["requested"] or chain[i + 1]["started"]) if i + 1 < len(chain) else (wait_from or run["started"])
        segs.append({"k": "gap", "s": _secs(end, nxt)})
    if wait_from is not None:
        seg = {"k": "wait", "s": _secs(min(wait_from, run["started"]), run["started"])}
        if run["trigger"] != "schedule" and run["picked"]:
            seg["picked"] = _secs(min(wait_from, run["picked"]), run["picked"])  # requested → the worker took it
        segs.append(seg)
    elif run["trigger"] == "schedule" or run["ops_action"]:
        missing.append("wait")  # older runs, a first run: never recorded, never guessed
    segs.append({"k": "run", "s": _secs(run["started"], run["finished"] or now)})  # its color: the card's state
    return segs, missing


def usual(seconds: float | None, n: int | None, p50: float | None, p90: float | None) -> dict:
    """How a runtime compares with its job's usual one (the median and p90 of its last USUAL_RUNS completed runs):
    {"ratio": runtime / median, "slow": at least SLOW_RATIO times the median and over the p90}. Empty below USUAL_MIN
    completed runs or without a runtime: too few to compare."""
    if not n or n < USUAL_MIN or seconds is None or not p50:
        return {}
    return {"ratio": round(seconds / p50, 1), "slow": seconds >= SLOW_RATIO * p50 and seconds > p90}


def key_counts(counts: dict, n: int = CARD_COUNTS) -> list[list]:
    """A card's few numbers: errors first, then the largest, without "requests" (shown on its own)."""
    items = [(k, v) for k, v in (counts or {}).items() if isinstance(v, (int, float)) and v and k != "requests"]
    items.sort(key=lambda kv: (kv[0] != "errors", -kv[1], kv[0]))
    return [[k.replace("_", " "), v] for k, v in items[:n]]


def run_cards(ids, now) -> dict:
    """The hover cards of the runs on a page (the Dashboard's run graph, the history strips), as compact JSON the page
    embeds and a small script draws (ADR 0032). One query (RUN_CARDS_SQL) for the runs, their feeds, the actions that
    started them, each job's usual runtime and each retry's earlier attempts. Times are epoch seconds (the browser
    shows them in its own time zone); optional keys are left out when empty, to keep the page small."""
    from django.urls import reverse

    ids = sorted({int(i) for i in ids})
    out = {"url": reverse("opsconsole:run", args=[0]), "action_url": reverse("opsconsole:action", args=[0]), "jobs": {}, "runs": {}}
    if not ids:
        return out
    with connection.cursor() as c:
        c.execute(RUN_CARDS_SQL, [ids, USUAL_RUNS, EARLIER_SHOWN])
        rows = c.fetchall()
    cols = ("id", "job", "feed", "status", "started", "finished", "scheduled_for", "trigger", "by", "ops_action", "attempt",
            "retry_of", "counts", "error", "n", "p50", "p90", "requested", "picked", "earlier")
    runs = [dict(zip(cols, r)) for r in rows]
    reg = _registry()
    for r in runs:
        if isinstance(r["counts"], str):  # a raw cursor may hand jsonb back as text
            r["counts"] = json.loads(r["counts"] or "{}")
        earlier = json.loads(r["earlier"]) if isinstance(r["earlier"], str) else (r["earlier"] or [])
        for e in earlier:  # json_agg's times are ISO text
            for k in ("started", "finished", "requested"):
                e[k] = datetime.fromisoformat(e[k]) if e.get(k) else None
        if r["job"] not in out["jobs"]:
            j = reg.get(r["job"])
            out["jobs"][r["job"]] = {"tags": list(j.tags) if j else [], "n": r["n"] or 0,
                                     **({"p50": round(r["p50"], 1), "p90": round(r["p90"], 1)} if r["n"] else {})}
        secs = _secs(r["started"], r["finished"] or now)
        segs, missing = stages(r, now, earlier)
        card = {"job": r["job"], "state": run_state(r["status"]), "trigger": r["trigger"], "attempt": r["attempt"],
                "t0": _epoch(r["started"]), "t1": _epoch(r["finished"]), "s": secs, "stages": segs,
                "counts": key_counts(r["counts"])}
        optional = {"feed": r["feed"], "partial": r["status"] == "partial", "by": r["by"], "action": r["ops_action"],
                    "retry_of": r["retry_of"], "requests": (r["counts"] or {}).get("requests"), "missing": missing,
                    **usual(secs, r["n"], r["p50"], r["p90"]),
                    "error": first_line(r["error"]) if r["status"] in ("failed", "partial") else "",
                    "requested": _epoch(r["requested"]), "due": _epoch(r["scheduled_for"])}
        card.update({k: v for k, v in optional.items() if v not in (None, "", [], False)})
        out["runs"][str(r["id"])] = card
    return out


def fetch_runs(*, job="", state="", tag="", feed=None):
    """FetchRuns, newest first, by job, state (running, completed, failed) and tag. A dismissed failed run is still
    here (and still Failed), marked by its `dismissed_at`."""
    qs = (FetchRun.objects.select_related("feed")
          .only("id", "job", "feed_id", "feed__name", "status", "started_at", "finished_at", "counts", "error", "dismissed_at", "dismissed_by")
          .order_by("-started_at", "-id"))
    if job:
        qs = qs.filter(job=job)
    if state in STATE_STATUSES:
        qs = qs.filter(status__in=STATE_STATUSES[state])
    if tag:
        qs = qs.filter(job__in=jobs_with_tag(tag))
    if feed:
        qs = qs.filter(feed_id=feed)
    return qs


def console_runs(*, job="", status="", tag="", limit: int = 50):
    """Runs asked for from the console, by status (pending or cancelled), newest first (one query)."""
    from .models import OpsAction

    qs = OpsAction.objects.filter(kind__in=["run_job", "retry_run"]).defer("check_output", "output", "result")
    if status:
        qs = qs.filter(status=status)
    if job:
        qs = qs.filter(target=f"job:{job}")
    if tag:
        qs = qs.filter(target__in=[f"job:{n}" for n in jobs_with_tag(tag)])
    return list(qs.order_by("-created_at", "-id")[:limit])


def run_revisions(run, limit: int = 20) -> dict:
    """The content the run wrote: Revisions by `job:<name>` while it ran (two queries on the `at` index)."""
    from revisions.models import Revision

    end = run.finished_at or timezone.now()
    qs = Revision.objects.filter(actor=f"job:{run.job}", at__gte=run.started_at, at__lte=end).defer("before", "after").order_by("id")
    return {"count": qs.count(), "rows": list(qs[:limit])}


def open_actions(limit: int = 10) -> list:
    """Console actions pending or running, oldest first (one query)."""
    from .models import OpsAction

    return list(OpsAction.objects.filter(status__in=["pending", "running"]).defer("check_output", "output", "result").order_by("created_at", "id")[:limit])


def recent_actions(limit: int = 5) -> list:
    from .models import OpsAction

    return list(OpsAction.objects.defer("check_output", "output", "result", "params").order_by("-created_at", "-id")[:limit])


# ── The queue ───────────────────────────────────────────────────────────────────────────────────────────────────

def queue(now) -> list[dict]:
    """Per task kind: waiting (queued), in progress (claimed, lease live), stuck (claimed, lease expired), done and
    failed today, done in the last seven days, today's new tasks against the daily cap where there is one, the oldest waiting task (two queries)."""
    mid = midnight(now)
    rows = {r["kind"]: r for r in AgentTask.objects.values("kind").annotate(
        waiting=Count("id", filter=Q(status="queued")),
        in_progress=Count("id", filter=Q(status="claimed", lease_until__gte=now)),
        stuck=Count("id", filter=Q(status="claimed", lease_until__lt=now)),
        done_today=Count("id", filter=Q(status="done", completed_at__gte=mid)),
        done_7d=Count("id", filter=Q(status="done", completed_at__gte=now - timedelta(days=7))),
        failed_today=Count("id", filter=Q(status="failed", completed_at__gte=mid)),
        failed=Count("id", filter=Q(status="failed")),
        oldest_waiting=Min("created_at", filter=Q(status="queued")),
        # Evidence packs (ingest/prefetch.py, ADR 0036): waiting tasks with a pack, and with ≥ 1 non-Wikipedia page stored.
        packed=Count("id", filter=Q(status="queued", payload__has_key="evidence_pack")),
        evidence_ready=Count("id", filter=Q(status="queued", payload__evidence_ready=True)),
    )}
    made = {(r["kind"], r["created_by"]): r["n"] for r in
            AgentTask.objects.filter(created_at__gte=mid, kind__in=[k for k, _, _ in CAPS]).values("kind", "created_by").annotate(n=Count("id"))}
    caps = {kind: {"made": made.get((kind, by), 0), "cap": getattr(settings, setting), "setting": setting} for kind, by, setting in CAPS}
    out = []
    for kind, label in AgentTask.Kind.choices:
        r = rows.get(kind) or {"kind": kind, "waiting": 0, "in_progress": 0, "stuck": 0, "done_today": 0, "done_7d": 0, "failed_today": 0, "failed": 0,
                               "oldest_waiting": None, "packed": 0, "evidence_ready": 0}
        r["prefetched"] = kind in PREFETCH_KINDS
        r["ready_share"] = (r["evidence_ready"] / r["waiting"]) if r["prefetched"] and r["waiting"] else None
        r["label"] = label
        r["oldest_age"] = (now - r["oldest_waiting"]) if r["oldest_waiting"] else None
        r["cap"] = caps.get(kind)
        r["fed_by"] = FED_BY.get(kind, [])
        r["active"] = any(r[k] for k in ("waiting", "in_progress", "stuck", "done_today", "failed_today", "failed"))
        out.append(r)
    return out


def stuck_leases(now, limit: int = 20) -> list:
    """Claimed tasks whose lease ran out, the longest-expired first (one query)."""
    return list(AgentTask.objects.filter(status="claimed", lease_until__lt=now).defer("payload", "result")
                .order_by("lease_until", "id")[:limit])


# The Work page's tabs → the `status` filter `tasks()` and the batch actions take.
TABS = [("waiting", "Waiting", "queued"), ("in_progress", "In progress", "live"), ("stuck", "Stuck", "stale"),
        ("done", "Done", "done"), ("failed", "Failed", "failed"), ("cancelled", "Cancelled", "cancelled")]


def tasks(*, kind="", status="", agent="", q=""):
    """Tasks, newest first, by kind, status (queued, claimed, done, failed, cancelled; `stale`: claimed with an
    expired lease; `live`: claimed with a live one), agent and a text match. The batch actions use the same filters."""
    qs = AgentTask.objects.defer("payload", "result").annotate(
        decision=KT("result__decision"), note=KT("result__note"), result_entry=KT("result__entry"))
    if kind:
        qs = qs.filter(kind=kind)
    if status == "stale":
        qs = qs.filter(status="claimed", lease_until__lt=timezone.now())
    elif status == "live":
        qs = qs.filter(status="claimed", lease_until__gte=timezone.now())
    elif status:
        qs = qs.filter(status=status)
    if agent:
        qs = qs.filter(claimed_by=agent)
    if q:
        qs = qs.filter(Q(dedupe_key__icontains=q) | Q(target_ref__icontains=q) | Q(created_by__icontains=q))
    return qs.order_by("-created_at", "-id")


def kind_counts(kind: str, now) -> dict:
    """One kind's tasks per tab (one query)."""
    return AgentTask.objects.filter(kind=kind).aggregate(
        waiting=Count("id", filter=Q(status="queued")),
        in_progress=Count("id", filter=Q(status="claimed", lease_until__gte=now)),
        stuck=Count("id", filter=Q(status="claimed", lease_until__lt=now)),
        done=Count("id", filter=Q(status="done")),
        failed=Count("id", filter=Q(status="failed")),
        cancelled=Count("id", filter=Q(status="cancelled")),
    )


def result_summary(t) -> str:
    """A task's outcome in a few words (from annotations, so the result JSON itself isn't loaded for a list)."""
    bits = [b for b in (getattr(t, "decision", None), getattr(t, "result_entry", None)) if b]
    note = getattr(t, "note", None)
    if note:
        bits.append(note if len(note) <= 90 else note[:89] + "…")
    return " · ".join(bits)


def task_subject(t) -> str:
    """What a task is about, in a few words: its target or dedupe key."""
    for v in (t.target_ref, t.dedupe_key):
        if v:
            return v if len(v) <= 70 else v[:69] + "…"
    for f, label in (("target_entry_id", "entry"), ("target_candidate_id", "candidate"), ("target_claim_id", "claim"), ("target_proposal_id", "proposal")):
        if getattr(t, f, None):
            return f"{label} #{getattr(t, f)}"
    return ""


# ── Today, waves ────────────────────────────────────────────────────────────────────────────────────────────────

def today(now) -> dict:
    """Today's intake: documents fetched (new, changed) and candidates made since midnight (two queries)."""
    mid = midnight(now)
    docs = Document.objects.filter(fetched_at__gte=mid).aggregate(  # fetched_at is indexed and ≥ first_seen_at
        fetched=Count("id"), new=Count("id", filter=Q(first_seen_at__gte=mid)), changed=Count("id", filter=Q(changed_at__gte=mid)))
    cands = Candidate.objects.filter(created_at__gte=mid).aggregate(total=Count("id"), events=Count("id", filter=Q(kind="new_event")))
    return {"since": mid, "documents": docs, "candidates": cands}


def wave(now) -> dict:
    """The active content wave and its last gap_waves numbers (one query on JobState, no row created)."""
    from governance import waves as gw

    st = JobState.objects.filter(name=gw.STATE).values_list("state", flat=True).first() or {}
    ws = gw.waves()
    names = [w["name"] for w in ws]
    active = st.get("active") if st.get("active") in names else names[0]
    i = names.index(active)
    w = ws[i]
    last = st.get("last_run") or {}
    cov = (last.get("coverage") or {}).get(active) or {}
    c = last.get("counts") or {}
    return {"active": active, "span": gw.label(w["start"], w["end"] if w.get("end") is not None else timezone.localtime(now).year),
            "next": names[i + 1] if i + 1 < len(names) else None, "share": cov.get("share_covered"), "pairs": cov.get("pairs"),
            "gaps": (last.get("gaps") or {}).get(active), "held_cap": c.get(f"{active}.held_cap", 0), "last_at": last.get("at")}


# ── Releases ────────────────────────────────────────────────────────────────────────────────────────────────────

def manifest(version: str) -> dict | None:
    """A release's manifest.json from the store, kept in the process's cache: release files never change
    (infra/storage.py refuses to overwrite them), so one read per version per process is enough."""
    from django.core.cache import cache

    key = f"opsconsole:manifest:{version}"
    hit = cache.get(key)
    if hit is not None:
        return hit or None
    try:
        import json

        data = json.loads(storage.read(storage.RELEASES, storage.release_key(version, "manifest.json")))
    except Exception:  # noqa: BLE001 — a missing or unreadable manifest is shown as such
        data = {}
    cache.set(key, data, None if data else 60)
    return data or None


def change_report(version: str) -> str | None:
    try:
        return storage.read(storage.RELEASES, storage.release_key(version, "changes.md")).decode()
    except Exception:  # noqa: BLE001
        return None


def pointer():
    try:
        return storage.read_pointer()
    except Exception:  # noqa: BLE001 — shown as "unknown"
        return None


def annotate_releases(rels: list, before=None, live: str | None = None):
    """Each release's change totals (its manifest), whether it is live, and whether it changed only the page: nothing
    added, changed or retracted, and a page hash unlike the release before it. `before` is the release just older
    than the list's last."""
    for i, r in enumerate(rels):
        m = manifest(r.version) or {}
        r.totals = m.get("changes")
        r.live = bool(live and live == r.version)
        prev = rels[i + 1] if i + 1 < len(rels) else before
        content_same = r.totals is not None and not any((r.totals or {}).values())
        r.page_only = bool(content_same and prev is not None and (r.page_hash or "") != (prev.page_hash or ""))
    return rels


def revisions_between(low: int, high: int | None):
    """Revisions after `low` and up to `high` (everything after `low` when None): what a release carries, or what is
    not released yet. Newest first, without the before and after JSON."""
    from revisions.models import Revision

    qs = Revision.objects.filter(id__gt=low).defer("before", "after").order_by("-id")
    return qs.filter(id__lte=high) if high is not None else qs


def by_actor_kind(qs) -> dict:
    return {r["actor_kind"]: r["n"] for r in qs.order_by().values("actor_kind").annotate(n=Count("id"))}


def fact_base() -> dict:
    """Record claims on published entries by status: the shares `facts report` gives (one query)."""
    from evidence.models import Claim
    from timeline.models import Status

    by = {r["status"]: r["n"] for r in Claim.objects.filter(entry__status=Status.PUBLISHED, parent__isnull=True, field__in=["as_written", "why", "origin"])
          .values("status").annotate(n=Count("id"))}
    total = sum(by.values())
    return {"total": total, "by": by, "corroborated": by.get("corroborated", 0) / total if total else None}


# ── Revisions (reached from a task, a run or a release) ─────────────────────────────────────────────────────────

ENTRY_TABLES = ("timeline_entry", "timeline_branch", "timeline_event")  # one primary key shared by all three


def row_history(rev, limit: int = 100):
    """Every Revision of the same row (for an entry, of all three tables that share its key), newest first."""
    from revisions.models import Revision

    tables = ENTRY_TABLES if rev.table_name in ENTRY_TABLES else (rev.table_name,)
    return Revision.objects.filter(table_name__in=tables, row_pk=rev.row_pk).defer("before", "after").order_by("-id")[:limit]


def row_label(rev) -> str:
    """A name for the row: its slug or title when the row has one."""
    row = rev.after or rev.before or {}
    for k in ("slug", "title", "name", "url", "field"):
        if row.get(k):
            return str(row[k])
    if rev.table_name in ENTRY_TABLES:
        from timeline.models import Entry

        slug = Entry.objects.filter(pk=rev.row_pk).values_list("slug", flat=True).first()
        if slug:
            return slug
    return ""


# ── Rounds (ADR 0035) ───────────────────────────────────────────────────────────────────────────────────────────

ROUND_STATE = {  # Round.status → the badge's state class (base.html's s-* colors) and its label
    "running": ("running", "Running"), "reviewing": ("running", "Reviewing"), "release_ready": ("approved", "Release ready"),
    "published": ("completed", "Published"), "held": ("paused", "Held for review"), "finished": ("completed", "Completed"),
    "failed": ("failed", "Failed"), "skipped": ("cancelled", "Skipped"),
}
ROUND_HISTORY = 10


def round_card(r) -> dict:
    """What a round's square in the history strip shows on hover, and its page's header."""
    state, label = ROUND_STATE.get(r.status, ("pending", r.status))
    if r.status == "published" and r.release_id:
        label = f"Published release {r.release.version}"
    tasks = {k: (v or {}).get("completed", 0) for k, v in (r.tasks or {}).items()}
    return {"id": r.pk, "state": state, "label": label, "status": r.status, "trigger": r.get_trigger_display(), "started": r.started_at,
            "seconds": r.duration.total_seconds() if r.duration else None, "mix": (r.plan or {}).get("mix") or {}, "tasks": tasks,
            "drafts": len(r.drafts or []), "verdicts": r.verdicts or {}, "ops": sum((r.edit_ops or {}).values()), "edit_ops": r.edit_ops or {},
            "release": r.release.version if r.release_id else None, "summary": r.summary}


def rounds_overview(now, queue_rows: list[dict]) -> dict:
    """The Work page's round strip: the settings, what the next round would take per kind, the last round and the
    last ten (three queries)."""
    from work import rounds as WR
    from work.models import Round

    st = WR.current()
    recent = list(Round.objects.select_related("release").order_by("-started_at", "-id")[:ROUND_HISTORY])
    takes = WR.capacity(st["size"], {k["kind"]: k["waiting"] for k in queue_rows})
    return {"settings": st, "takes": takes, "latest": round_card(recent[0]) if recent else None,
            "history": [round_card(r) for r in reversed(recent)], "pad": list(range(ROUND_HISTORY - len(recent))), "held": WR.held_drafts().count(),
            "roles": [{"role": role, "kind": kind, "skill": skill, "agents": st["size"]["agents"][role], "each": st["size"]["tasks_per_agent"][role]}
                      for role, (kind, skill) in WR.ROLES.items()]}


# A round's progress bar, left to right (ADR 0040): what is finished, what is being worked, what came back, and what
# the plan still expects. (key, label, the bar's color class.)
PROGRESS_SEGMENTS = [("done", "done"), ("working", "in progress"), ("stuck", "stuck (lease ran out)"), ("failed", "failed"),
                     ("released", "released back to the queue"), ("left", "planned, not claimed yet")]


def progress_rows(progress: dict[str, dict]) -> list[dict]:
    """A round's per-kind counts (work.rounds.progress) → one bar per kind: its counts and its segments' widths, in
    percent of the larger of what was planned and what was claimed."""
    out = []
    for kind, c in progress.items():
        left = max(0, c["planned"] - c["claimed"])
        n = {"done": c["done"], "working": c["in_progress"] - c["stuck"], "stuck": c["stuck"], "failed": c["failed"],
             "released": c["released"], "left": left}
        total = sum(n.values()) or 1
        out.append({"kind": kind, **c, "left": left,
                    "segs": [{"key": k, "label": label, "n": n[k], "pct": round(100 * n[k] / total, 2)} for k, label in PROGRESS_SEGMENTS if n[k]]})
    return out


def live_round(now, r=None) -> dict | None:
    """The Work page's live strip: the open round (or `r`, for its own page), how long it has run, its stage, and a
    bar per task kind (two queries). None when no round is open."""
    from work import rounds as WR

    r = r if r is not None else WR.open_round(now)
    if r is None:
        return None
    progress = WR.progress(r, now)
    stage = next((s for s in WR.stages(r) if s["status"] == "current"), None)
    end = r.finished_at or now
    return {"round": r, "card": round_card(r), "open": r.open, "seconds": (end - r.started_at).total_seconds(),
            "stage": stage["label"] if stage else r.get_status_display(), "progress": progress, "rows": progress_rows(progress),
            "segments": [(k, label) for k, label in PROGRESS_SEGMENTS],
            **{k: sum(c[k] for c in progress.values()) for k in ("planned", "claimed", "done")}}


def round_tasks(r, limit: int = 300) -> list[dict]:
    """The tasks a round's role agents claimed (the task → round link, ADR 0040), by the agent holding them: tasks
    no one holds now (released, or failed) are grouped as handed back, since a hand-back clears the holder (one query)."""
    rows = list(AgentTask.objects.filter(round=r).defer("payload", "result").order_by("kind", "id")[:limit])
    by: dict[str, list] = {}
    for t in rows:
        t.subject = task_subject(t)
        by.setdefault(t.claimed_by or "", []).append(t)
    return [{"agent": a or None, "tasks": ts} for a, ts in sorted(by.items(), key=lambda x: (x[0] == "", x[0]))]


def round_agents(r) -> list[dict]:
    """What the queue says each of the round's agents did while the round ran (claimed_by and completed_at in its
    window), beside what the round recorded: a check on the record (one query)."""
    names = [f"agent:{a['name']}" if not str(a.get("name", "")).startswith("agent:") else a["name"] for a in (r.agents or [])]
    if not names:
        return []
    end = r.finished_at or timezone.now()
    rows = AgentTask.objects.filter(claimed_by__in=names, claimed_at__gte=r.started_at, claimed_at__lte=end).values("claimed_by", "kind").annotate(
        done=Count("id", filter=Q(status="done")), failed=Count("id", filter=Q(status="failed")),
        open=Count("id", filter=Q(status__in=["claimed", "queued"])))
    by = {}
    for x in rows:
        by.setdefault(x["claimed_by"], []).append(x)
    out = []
    for a, actor in zip(r.agents or [], names):
        out.append({**a, "actor": actor, "queue": by.get(actor, [])})
    return out


def evidence_pack(t) -> dict | None:
    """A task's evidence pack for its page (ADR 0036): the pages fetched, with their top passages, and the ones left
    to read by hand; None for a kind the prefetch_sources job doesn't serve."""
    p = t.payload or {}
    if t.kind not in PREFETCH_KINDS:
        return None
    pack = p.get("evidence_pack") or []
    unreadable = p.get("unreadable") or []
    reasons = defaultdict(int)
    for u in unreadable:
        reasons[u.get("reason", "")] += 1
    return {"built": "evidence_pack" in p, "at": p.get("evidence_pack_at"), "ready": bool(p.get("evidence_ready")), "pages": pack,
            "unreadable": unreadable, "reasons": dict(sorted(reasons.items())), "browser": [u for u in unreadable if u.get("reason") == "browser_only"],
            "passages": sum(len(e.get("passages") or []) for e in pack)}
