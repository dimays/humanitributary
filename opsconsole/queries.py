"""What the operations console reads (docs/guide/operations-console.md, docs/adr/0028-operations-console.md).

Read-only: every function here only selects. Totals are computed by Postgres (GROUP BY, FILTER, DISTINCT ON, window
functions), never by loading rows into Python, so a page makes the same handful of queries however many runs, tasks
or Revisions there are. Nothing here calls a function that writes as a side effect (`governance.waves.state()`
creates its JobState row, so the waves are read straight from `JobState`).
"""

from collections import defaultdict
from datetime import timedelta

from django.conf import settings
from django.db import connection
from django.db.models import Avg, Count, F, Max, Min, Q
from django.db.models.fields.json import KT
from django.db.models.functions import TruncDate
from django.utils import timezone

from infra import storage
from ingest.models import Candidate, Document, Feed, FetchRun, JobState
from ingest.policy import mask_secrets
from work.models import AgentTask

OPEN = ("queued", "claimed")
# The daily caps the console shows against today's new tasks: (kind, the job that queues it, the setting).
CAPS = [("write_event", "job:process", "WRITE_EVENT_TASKS_PER_DAY"), ("fill_gap", "job:gap_waves", "FILL_GAP_TASKS_PER_DAY")]
SPARK_RUNS = 40  # runs per job in the job-runs page's history
SPARK_DAYS = 30
THROUGHPUT_DAYS = 14
BATCH_DAYS = 30


def midnight(now):
    """Local midnight: where the jobs' daily caps start counting (ingest/process.py, governance/waves.py)."""
    return timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)


def first_line(text: str, n: int = 160) -> str:
    line = (mask_secrets(text or "").strip().splitlines() or [""])[0]
    return line if len(line) <= n else line[: n - 1] + "…"


def counts_summary(counts: dict, n: int = 4) -> str:
    """The largest few numbers of a run's counts, "errors" first when there are any."""
    items = [(k, v) for k, v in (counts or {}).items() if isinstance(v, (int, float)) and v]
    items.sort(key=lambda kv: (kv[0] != "errors", -kv[1], kv[0]))
    shown = ", ".join(f"{k} {v:g}" for k, v in items[:n])
    return shown + (f" (+{len(items) - n})" if len(items) > n else "")


def _registry():
    from ingest.jobs import REGISTRY, _load_registry

    _load_registry()
    return REGISTRY


# ── Health ──────────────────────────────────────────────────────────────────────────────────────────────────────

def _lock_held(key: int) -> bool:
    """Is a Postgres advisory lock with this bigint key held by any session? (pg_locks splits a bigint key into
    classid, the high 32 bits, and objid, the low 32, with objsubid 1.) pg_locks is readable by every role."""
    with connection.cursor() as c:
        c.execute(
            "SELECT EXISTS (SELECT 1 FROM pg_locks WHERE locktype = 'advisory' AND granted AND objsubid = 1"
            " AND ((classid::bigint << 32) | objid::bigint) = %s)", [key])
        return c.fetchone()[0]


def health(now) -> dict:
    from ingest.jobs import LOCK_KEY, SCHEDULER_LOCK_KEY

    out = {"storage": {}, "storage_backend": settings.STORAGE_BACKEND}
    with connection.cursor() as c:
        c.execute("SELECT 1")
        c.fetchone()
    out["db"] = True  # (a page that got this far reached the database)
    for alias in (storage.RAW, storage.RELEASES):
        ok, err = storage.reachable(alias)
        out["storage"][alias] = {"ok": ok, "error": err}
    try:
        out["pointer"] = storage.read_pointer() if out["storage"][storage.RELEASES]["ok"] else None
    except Exception as e:  # noqa: BLE001 — the console reports, it never raises on a store hiccup
        out["pointer"], out["pointer_error"] = None, f"{type(e).__name__}"
    out["worker_holds_lock"] = _lock_held(SCHEDULER_LOCK_KEY)
    out["runner_holds_lock"] = _lock_held(LOCK_KEY)
    agg = FetchRun.objects.aggregate(last_start=Max("started_at"), last_finish=Max("finished_at"))
    out["last_run_started"], out["last_run_finished"] = agg["last_start"], agg["last_finish"]
    out["running"] = list(FetchRun.objects.filter(status="running").order_by("started_at").values("id", "job", "feed__name", "started_at"))
    # The worker ticks every WORKER_TICK_SECONDS and `process` is due every 15 minutes, so a live worker starts a run
    # at least every ~16 minutes; quiet for longer than this means no worker (or launchd) is running jobs.
    quiet = timedelta(minutes=30)
    out["quiet"] = agg["last_start"] is None or now - agg["last_start"] > quiet
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


def failure_streaks() -> dict[tuple[str, int | None], int]:
    """(job, feed id) → failed runs since its last ok or partial one: infra/alerts.py's count, for every job at once."""
    with connection.cursor() as c:
        c.execute(FAILURE_STREAKS_SQL)
        return {(job, feed): n for job, feed, n in c.fetchall()}


def jobs(now) -> list[dict]:
    """One row per registered job, in run order: its last run (the newest across its feeds, for a feed job), status,
    duration, counts, failures in a row (the worst feed's), and when it is next due. Four queries."""
    reg = _registry()
    last = {}
    for r in (FetchRun.objects.exclude(status="running").select_related("feed").defer("feed__cursor", "feed__config")
              .order_by("job", "feed_id", "-started_at", "-id").distinct("job", "feed_id")):
        last[(r.job, r.feed_id)] = r
    streaks = failure_streaks()
    feeds = defaultdict(lambda: {"total": 0, "enabled": 0, "next": None, "names": {}})
    for f in Feed.objects.annotate(job=KT("config__job")).values("id", "name", "job", "enabled", "next_run_at"):
        d = feeds[f["job"]]
        d["total"] += 1
        d["names"][f["id"]] = f["name"]
        if f["enabled"]:
            d["enabled"] += 1
            due = f["next_run_at"] or now
            d["next"] = due if d["next"] is None else min(d["next"], due)
    alert_after = settings.ALERT_AFTER_FAILURES
    rows = []
    for name, j in reg.items():
        mine = sorted((r for (job, _), r in last.items() if job == name), key=lambda r: (r.started_at, r.pk), reverse=True)
        if not j.feed:
            mine = [r for r in mine if r.feed_id is None]
        run = mine[0] if mine else None
        worst_feed, worst = None, 0
        for (job, feed_id), n in streaks.items():
            if job == name and n > worst:
                worst, worst_feed = n, feed_id
        if j.feed:
            next_due = feeds[name]["next"]
        else:
            next_due = (run.started_at + timedelta(minutes=j.interval)) if run else now
        rows.append({
            "name": name, "doc": j.doc, "interval": j.interval, "feed": j.feed,
            "feeds_enabled": feeds[name]["enabled"] if j.feed else None, "feeds_total": feeds[name]["total"] if j.feed else None,
            "run": run, "status": run.status if run else None,
            "duration": (run.finished_at - run.started_at).total_seconds() if run and run.finished_at else None,
            "counts": counts_summary(run.counts) if run else "",
            "error": first_line(run.error) if run and run.status in ("failed", "partial") else "",
            "failures": worst, "worst_feed": feeds[name]["names"].get(worst_feed) if worst_feed else None,
            "alerting": worst >= alert_after, "next_due": next_due, "overdue": bool(next_due and next_due < now - timedelta(minutes=30)),
        })
    return rows


def alerts(job_rows: list[dict]) -> dict:
    """Whether an alert can reach anyone (recipients are counted, never shown) and which jobs are at the threshold."""
    return {
        "after": settings.ALERT_AFTER_FAILURES,
        "recipients": len(settings.ALERT_EMAILS) or len(getattr(settings, "ADMINS", []) or []),
        "via": "ALERT_EMAILS" if settings.ALERT_EMAILS else ("ADMINS" if getattr(settings, "ADMINS", None) else None),
        "backend": settings.EMAIL_BACKEND.rsplit(".", 2)[-2],
        "firing": [r for r in job_rows if r["alerting"]],
        "failing": [r for r in job_rows if 0 < r["failures"] < settings.ALERT_AFTER_FAILURES],
    }


def run_history(*, job: str | None = None, now=None) -> dict[str, list[dict]]:
    """The last SPARK_RUNS finished runs of each job in the last SPARK_DAYS days, oldest first (one query)."""
    now = now or timezone.now()
    sql = (
        "SELECT job, started_at, finished_at, status FROM ("
        " SELECT job, started_at, finished_at, status,"
        "        row_number() OVER (PARTITION BY job ORDER BY started_at DESC, id DESC) AS n"
        " FROM ingest_fetchrun WHERE status <> 'running' AND started_at >= %s" + (" AND job = %s" if job else "") +
        ") s WHERE n <= %s ORDER BY job, started_at"
    )
    params = [now - timedelta(days=SPARK_DAYS), *([job] if job else []), SPARK_RUNS]
    out = defaultdict(list)
    with connection.cursor() as c:
        c.execute(sql, params)
        for name, started, finished, status in c.fetchall():
            out[name].append({"started": started, "seconds": (finished - started).total_seconds() if finished else 0.0, "status": status})
    return dict(out)


def fetch_runs(*, job="", status="", since=None, until=None):
    qs = FetchRun.objects.select_related("feed").defer("feed__cursor", "feed__config").order_by("-started_at", "-id")
    if job:
        qs = qs.filter(job=job)
    if status:
        qs = qs.filter(status=status)
    if since:
        qs = qs.filter(started_at__date__gte=since)
    if until:
        qs = qs.filter(started_at__date__lte=until)
    return qs


# ── The queue ───────────────────────────────────────────────────────────────────────────────────────────────────

def queue(now) -> list[dict]:
    """Per task kind: queued, claimed, stale leases, done and failed today, the oldest queued task's age (one query)."""
    mid = midnight(now)
    rows = {r["kind"]: r for r in AgentTask.objects.values("kind").annotate(
        queued=Count("id", filter=Q(status="queued")),
        claimed=Count("id", filter=Q(status="claimed")),
        stale=Count("id", filter=Q(status="claimed", lease_until__lt=now)),
        done_today=Count("id", filter=Q(status="done", completed_at__gte=mid)),
        failed_today=Count("id", filter=Q(status="failed", completed_at__gte=mid)),
        created_today=Count("id", filter=Q(created_at__gte=mid)),
        oldest_queued=Min("created_at", filter=Q(status="queued")),
    )}
    out = []
    for kind, label in AgentTask.Kind.choices:
        r = rows.get(kind) or {"kind": kind, "queued": 0, "claimed": 0, "stale": 0, "done_today": 0, "failed_today": 0, "created_today": 0, "oldest_queued": None}
        r["label"] = label
        r["oldest_age"] = (now - r["oldest_queued"]) if r["oldest_queued"] else None
        out.append(r)
    return out


def tasks(*, kind="", status="", agent="", q=""):
    qs = AgentTask.objects.defer("payload", "result").annotate(
        decision=KT("result__decision"), note=KT("result__note"), result_entry=KT("result__entry"))
    if kind:
        qs = qs.filter(kind=kind)
    if status == "stale":
        qs = qs.filter(status="claimed", lease_until__lt=timezone.now())
    elif status:
        qs = qs.filter(status=status)
    if agent:
        qs = qs.filter(claimed_by=agent)
    if q:
        qs = qs.filter(Q(dedupe_key__icontains=q) | Q(target_ref__icontains=q) | Q(created_by__icontains=q))
    return qs.order_by("-created_at", "-id")


def agents() -> list[str]:
    return list(AgentTask.objects.exclude(claimed_by="").order_by("claimed_by").values_list("claimed_by", flat=True).distinct())


def throughput(now, days: int = THROUGHPUT_DAYS) -> dict:
    """Tasks finished per agent per day over the last `days` days, and the mean time from claim to done (one query).
    The time is the last attempt's: a re-claim moves claimed_at."""
    start = midnight(now) - timedelta(days=days - 1)
    day_list = [(start + timedelta(days=i)).date() for i in range(days)]
    cells = defaultdict(dict)
    totals = defaultdict(lambda: {"n": 0, "seconds": 0.0, "timed": 0})
    for r in (AgentTask.objects.filter(status="done", completed_at__gte=start).exclude(claimed_by="")
              .values("claimed_by", day=TruncDate("completed_at"))
              .annotate(n=Count("id"), mean=Avg(F("completed_at") - F("claimed_at")), timed=Count("id", filter=Q(claimed_at__isnull=False)))):
        cells[r["claimed_by"]][r["day"]] = r["n"]
        t = totals[r["claimed_by"]]
        t["n"] += r["n"]
        if r["mean"] is not None:
            t["seconds"] += r["mean"].total_seconds() * r["timed"]
            t["timed"] += r["timed"]
    rows = []
    for agent in sorted(cells, key=lambda a: -totals[a]["n"]):
        t = totals[agent]
        rows.append({"agent": agent, "days": [cells[agent].get(d, 0) for d in day_list], "total": t["n"],
                     "mean_minutes": t["seconds"] / t["timed"] / 60 if t["timed"] else None})
    return {"days": day_list, "rows": rows}


def result_summary(t) -> str:
    """A task's outcome in a few words (from annotations, so the result JSON itself isn't loaded for a list)."""
    bits = [b for b in (getattr(t, "decision", None), getattr(t, "result_entry", None)) if b]
    note = getattr(t, "note", None)
    if note:
        bits.append(note if len(note) <= 90 else note[:89] + "…")
    return " · ".join(bits)


# ── Today's intake ──────────────────────────────────────────────────────────────────────────────────────────────

def intake(now) -> dict:
    mid = midnight(now)
    docs = Document.objects.filter(fetched_at__gte=mid).aggregate(  # fetched_at is indexed and ≥ first_seen_at
        fetched=Count("id"), new=Count("id", filter=Q(first_seen_at__gte=mid)), changed=Count("id", filter=Q(changed_at__gte=mid)))
    cands = Candidate.objects.filter(created_at__gte=mid).aggregate(
        total=Count("id"), events=Count("id", filter=Q(kind="new_event")), signals=Count("id", filter=Q(kind="new_branch_signal")))
    proc = FetchRun.objects.filter(job="process").exclude(status="running").order_by("-started_at", "-id").only("counts", "started_at").first()
    made = {(r["kind"], r["created_by"]): r["n"] for r in AgentTask.objects.filter(created_at__gte=mid).values("kind", "created_by").annotate(n=Count("id"))}
    caps = [{"kind": kind, "by": by, "made": made.get((kind, by), 0), "cap": getattr(settings, setting), "setting": setting} for kind, by, setting in CAPS]
    by_kind = defaultdict(int)
    for (kind, _), n in made.items():
        by_kind[kind] += n
    return {"since": mid, "documents": docs, "candidates": cands, "process": proc,
            "clusters": (proc.counts or {}).get("clusters") if proc else None,
            "over_threshold": (proc.counts or {}).get("clusters_over_threshold") if proc else None,
            "held_by_cap": (proc.counts or {}).get("tasks_held_by_daily_cap") if proc else None,
            "caps": caps, "tasks_by_kind": dict(sorted(by_kind.items()))}


# ── Changes (Revisions) ─────────────────────────────────────────────────────────────────────────────────────────

ENTRY_TABLES = ("timeline_entry", "timeline_branch", "timeline_event")  # one primary key shared by all three


def revisions(*, actor_kind="", table="", action="", actor="", reason="", task="", since=None, until=None):
    from revisions.models import Revision

    qs = Revision.objects.defer("before", "after").order_by("-id")
    if actor_kind:
        qs = qs.filter(actor_kind=actor_kind)
    if table:
        qs = qs.filter(table_name=table)
    if action:
        qs = qs.filter(action=action)
    if actor:
        qs = qs.filter(actor=actor)
    if reason:
        qs = qs.filter(reason__icontains=reason)
    if task:
        qs = qs.filter(task_id=int(task))
    if since:
        qs = qs.filter(at__gte=since)
    if until:
        qs = qs.filter(at__lt=until)
    return qs


def revision_tables() -> list[str]:
    """The audited tables (from the trigger's own list, so it costs no scan of the log)."""
    with connection.cursor() as c:
        c.execute("SELECT DISTINCT event_object_table FROM information_schema.triggers WHERE trigger_name LIKE %s ORDER BY 1", ["%audit%"])
        return [r[0] for r in c.fetchall()]


def revision_daily(now, days: int = THROUGHPUT_DAYS) -> dict:
    """Revisions per day by actor kind over the last `days` days (one query on the `at` index)."""
    from revisions.models import Revision

    start = midnight(now) - timedelta(days=days - 1)
    day_list = [(start + timedelta(days=i)).date() for i in range(days)]
    cells = defaultdict(lambda: defaultdict(int))
    for r in Revision.objects.filter(at__gte=start).values("actor_kind", day=TruncDate("at")).annotate(n=Count("id")):
        cells[r["day"]][r["actor_kind"]] = r["n"]
    rows = [{"day": d, "agent": cells[d]["agent"], "human": cells[d]["human"], "job": cells[d]["job"],
             "total": sum(cells[d].values())} for d in reversed(day_list)]
    peak = max((r["total"] for r in rows), default=0)
    return {"rows": rows, "peak": peak}


# A batch is the reason up to its first " #", ":" or " (": "apply_edits round-3 #12 retract …: …" → "apply_edits round-3",
# "write_event #212 (agent API)" → "write_event", "facts sweep 2026-11-26 (facts-v1)" → "facts sweep 2026-11-26".
BATCH_SQL = r"""
SELECT btrim(regexp_replace(reason, '( #|:| \().*$', '')) AS batch,
       count(*) AS n, count(DISTINCT txid) AS changes, count(DISTINCT task_id) AS tasks,
       min(at) AS first_at, max(at) AS last_at, array_agg(DISTINCT actor) AS actors,
       count(*) FILTER (WHERE action = 'insert') AS inserts, count(*) FILTER (WHERE action = 'update') AS updates,
       count(*) FILTER (WHERE action = 'delete') AS deletes
FROM revisions_revision
WHERE at >= %s
GROUP BY 1
ORDER BY max(at) DESC
LIMIT %s
"""


def batches(now, *, days: int = BATCH_DAYS, limit: int = 15) -> list[dict]:
    """Recent batches of Revisions, grouped by the reason's prefix (one query over the last `days` days)."""
    with connection.cursor() as c:
        c.execute(BATCH_SQL, [now - timedelta(days=days), limit])
        cols = [d[0] for d in c.description]
        return [dict(zip(cols, row)) for row in c.fetchall()]


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


# ── Content programs ────────────────────────────────────────────────────────────────────────────────────────────

def waves_overview(now) -> dict:
    """The content waves: the active one, and per wave the last gap_waves run's gaps and coverage beside the queue's
    fill_gap tasks by status (one query on JobState, one on the queue)."""
    from governance import waves as gw

    st = JobState.objects.filter(name=gw.STATE).first()
    state = (st.state if st else {}) or {}
    names = [w["name"] for w in gw.waves()]
    active = state.get("active") if state.get("active") in names else names[0]
    last = state.get("last_run") or {}
    c = last.get("counts") or {}
    tally = defaultdict(lambda: defaultdict(int))
    for r in (AgentTask.objects.filter(kind=gw.KIND).values(w=KT("payload__wave__name"), s=F("status"), d=KT("result__decision"))
              .annotate(n=Count("id"))):
        t = tally[r["w"]]
        t[r["s"]] += r["n"]
        if r["s"] == "done":
            t["done_" + (r["d"] or "written")] += r["n"]
    rows = []
    for w in gw.waves():
        n = w["name"]
        cov = (last.get("coverage") or {}).get(n) or {}
        t = tally[n]
        rows.append({
            "name": n, "span": gw.label(w["start"], w["end"] if w.get("end") is not None else timezone.localtime(now).year),
            "window": w["window"], "active": n == active,
            "gaps": (last.get("gaps") or {}).get(n, 0), "by_kind": (last.get("gaps_by_kind") or {}).get(n, {}),
            "share": cov.get("share_covered"), "pairs": cov.get("pairs"),
            "queued": t["queued"], "claimed": t["claimed"], "done_written": t["done_written"], "done_nothing": t["done_nothing_notable"],
            "failed": t["failed"], "cancelled": t["cancelled"],
            "held_cap": c.get(f"{n}.held_cap", 0), "held_branch": c.get(f"{n}.held_branch", 0),
            "recent": sum(v for k, v in c.items() if k.startswith(f"{n}.recent_")),
        })
    return {"active": active, "last_run": last, "rows": rows, "history": list(reversed(state.get("history", [])))[:5],
            "per_day": settings.FILL_GAP_TASKS_PER_DAY}


def pipeline(now) -> dict:
    """Current events from candidates to events: candidates by status, open stories (clusters), the last process
    run's clusters over the threshold, and write_event tasks by status and decision."""
    cand = {(r["kind"], r["status"]): r["n"] for r in Candidate.objects.values("kind", "status").annotate(n=Count("id"))}
    open_clusters = (Candidate.objects.filter(kind="new_event", status__in=OPEN).exclude(cluster_key="")
                     .aggregate(n=Count("cluster_key", distinct=True))["n"])
    tasks_ = defaultdict(int)
    for r in AgentTask.objects.filter(kind="write_event").values("status", d=KT("result__decision")).annotate(n=Count("id")):
        tasks_[r["status"] if r["status"] != "done" else "done_" + (r["d"] or "written")] += r["n"]
    statuses = [s for s, _ in Candidate.Status.choices]
    return {
        "candidates": [{"status": s, "events": cand.get(("new_event", s), 0), "updates": cand.get(("update", s), 0),
                        "signals": cand.get(("new_branch_signal", s), 0)} for s in statuses],
        "open_clusters": open_clusters, "intake": intake(now), "tasks": dict(tasks_),
        "threshold": float(getattr(settings, "WRITE_EVENT_THRESHOLD", 70)),
    }


def fact_base(now) -> dict:
    """Record claims on published entries by status (the shares `facts report` gives), and rechecks due (two queries)."""
    from evidence.health import STATUSES
    from evidence.models import Claim
    from timeline.models import Status

    published = Claim.objects.filter(entry__status=Status.PUBLISHED)
    by = {r["status"]: r["n"] for r in published.filter(parent__isnull=True, field__in=["as_written", "why", "origin"]).values("status").annotate(n=Count("id"))}
    total = sum(by.values())
    today = timezone.localtime(now).date()
    due = published.filter(recheck_after__isnull=False).aggregate(
        now=Count("id", filter=Q(recheck_after__lte=today)),
        d30=Count("id", filter=Q(recheck_after__gt=today, recheck_after__lte=today + timedelta(days=30))))
    return {"total": total, "rows": [{"status": s, "n": by.get(s, 0), "share": by.get(s, 0) / total if total else None} for s in STATUSES],
            "due_now": due["now"], "due_30": due["d30"]}


def proposals(limit: int = 30) -> dict:
    from governance.models import BranchProposal

    open_ = BranchProposal.objects.filter(status__in=["proposed", "accepted"])
    by = list(open_.values("kind", "status").annotate(n=Count("id")).order_by("kind", "status"))
    rows = list(open_.select_related("branch").defer("evidence", "payload").order_by("-created_at", "-id")[:limit])
    return {"by": by, "rows": rows, "total": sum(r["n"] for r in by)}
