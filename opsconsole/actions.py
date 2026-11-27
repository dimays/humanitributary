"""The console's interventions (ADR 0028, phase 2): what each action checks, what its confirmation page shows, and
what it does. The views (opsconsole/views.py) handle the two steps, the permission, the token and the rate limit;
the worker (opsconsole/worker.py) runs the long ones.

Each action is an `Action` with:

- `prepare(data, actor)` → a `Plan`: it validates the form's fields against the database *now*, raises `Refused`
  with the reason when the action may not run (a non-idempotent job inside its cooldown, a lease that changed hands,
  more tasks than the cap …), and returns the exact parameters, a one-line summary and the dry run, check or preview
  the confirmation page shows (stored on the OpsAction as `check_output`).
- `execute(action, log)` → a result dict: it runs the existing code (`ingest.jobs.run_named`, `work.queue`,
  `governance.waves.set_active`, `publish.release`), re-checking what may have changed since the confirmation, and
  raises `Refused` (the action fails with that error) if it no longer holds.

Quick actions (`runs_in="request"`) execute in the confirming request, in one transaction; the others are queued for
the worker. Nothing here writes canonical rows: the queue, job runs, the release pointer and `JobState` are working
state. A job run from here writes content the way the job always does, as `job:<name>` inside its own `revising()`;
the action's result records the Revisions it made.
"""

import hashlib
import json
from contextlib import nullcontext
from dataclasses import dataclass, field
from datetime import timedelta

from django.db import transaction
from django.db.models import Max, Q as DQ
from django.utils import timezone

from ingest.models import Feed, FetchRun, JobState
from ingest.policy import mask_secrets
from publish.models import Release
from work import queue
from work.models import AgentTask

from .models import OpsAction

A = OpsAction.Kind
FEED_COOLDOWN_MINUTES = 60   # a feed is fetched again from here at most once an hour (ADR 0028: "yes for rows, not for cost")
CHECK_FRESH_MINUTES = 30     # a publish confirms a check at most this old
MAX_TASKS = queue.MAX_BATCH  # tasks one requeue or cancel may touch
RATE_LIMIT = 10              # actions per user …
RATE_WINDOW_MINUTES = 10     # … per this many minutes
EXCLUSIVE = (A.PUBLISH, A.ROLLBACK)  # one of these at a time, across all users


class Refused(Exception):
    """The action may not run (now): the message says why, for the operator."""


@dataclass
class Plan:
    kind: str
    target: str
    params: dict
    summary: str
    check_output: str = ""
    rows: list = field(default_factory=list)       # (label, value) pairs shown on the confirmation page
    table: dict | None = None                      # {"head": [...], "rows": [[...], ...]} shown below them
    warnings: list = field(default_factory=list)
    fields: list = field(default_factory=list)     # extra inputs on the confirmation form: "notes", "force"


def _registry():
    from ingest.jobs import REGISTRY, _load_registry

    _load_registry()
    return REGISTRY


def _int(value, what: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise Refused(f"{what} must be a number") from None


def _ago(t) -> str:
    s = (timezone.now() - t).total_seconds()
    return f"{int(s // 60)} min" if s < 5400 else f"{s / 3600:.1f} h"


def _open_actions(kind_in, target: str | None = None):
    qs = OpsAction.objects.filter(kind__in=kind_in, status__in=[OpsAction.Status.PENDING, OpsAction.Status.RUNNING])
    return qs.filter(target=target) if target else qs


def _revision_high() -> int:
    from revisions.models import Revision

    return Revision.objects.aggregate(m=Max("id"))["m"] or 0


# ── jobs: run now, retry a failed run ─────────────────────────────────────────────────────────────────────────────

def job_refusal(name: str, feed_ids: list[int] | None = None, *, now=None, exclude_action: int | None = None) -> str:
    """Why `name` may not be run from the console now ("" when it may)."""
    from ingest.jobs import paused_jobs

    now = now or timezone.now()
    reg = _registry()
    if name not in reg:
        return f"no job {name!r}"
    j = reg[name]
    p = paused_jobs().get(name)
    if p:
        return f"{name} is paused (by {p.get('by')}: {p.get('reason')}); resume it first"
    if FetchRun.objects.filter(job=name, status=FetchRun.Status.RUNNING).exists():
        return f"{name} is running now"
    pending = _open_actions([A.RUN_JOB, A.RETRY_RUN], f"job:{name}")
    if exclude_action:
        pending = pending.exclude(pk=exclude_action)
    if (other := pending.first()) is not None:
        return f"{name} is already queued to run (action #{other.pk}, {other.status})"
    if j.not_idempotent:
        last = FetchRun.objects.filter(job=name).order_by("-started_at").first()
        if last and last.started_at + timedelta(minutes=j.interval) > now:
            again = last.started_at + timedelta(minutes=j.interval)
            return (f"{name} ran {_ago(last.started_at)} ago and is not idempotent back to back: {j.not_idempotent}. "
                    f"It may be run from here again after {again:%Y-%m-%d %H:%M} UTC, or it waits for its schedule")
    return ""


def _feeds_to_run(name: str, feed_ids: list[int] | None, now) -> tuple[list[Feed], list[str]]:
    """The feeds a feed job's run would fetch (the named ones, or every enabled one), less those fetched within the
    feed cooldown. → (feeds, notes on the ones left out)"""
    qs = Feed.objects.filter(config__job=name).order_by("name")
    qs = qs.filter(pk__in=feed_ids) if feed_ids else qs.filter(enabled=True)
    feeds, notes = [], []
    recent = {r["feed_id"]: r["m"] for r in FetchRun.objects.filter(job=name, feed__in=qs, started_at__gte=now - timedelta(minutes=FEED_COOLDOWN_MINUTES))
              .values("feed_id").annotate(m=Max("started_at"))}
    for f in qs:
        if f.pk in recent:
            notes.append(f"{f.name}: fetched {_ago(recent[f.pk])} ago (at most once every {FEED_COOLDOWN_MINUTES} min from here)")
        else:
            feeds.append(f)
    return feeds, notes


def _recent_runs_table(name: str, feed_ids=None) -> dict:
    qs = FetchRun.objects.filter(job=name).select_related("feed").order_by("-started_at")
    if feed_ids:
        qs = qs.filter(feed_id__in=feed_ids)
    rows = []
    for r in qs[:5]:
        took = f"{(r.finished_at - r.started_at).total_seconds():.1f} s" if r.finished_at else "–"
        rows.append([f"#{r.pk}", r.started_at.strftime("%Y-%m-%d %H:%M"), r.feed.name if r.feed_id else "", r.status, took,
                     json.dumps(r.counts, sort_keys=True)[:120]])
    return {"head": ["Run", "Started (UTC)", "Feed", "Status", "Took", "Counts"], "rows": rows}


def _job_plan(kind: str, name: str, feed_ids: list[int] | None, *, run: FetchRun | None = None) -> Plan:
    now = timezone.now()
    why = job_refusal(name, feed_ids, now=now)
    if why:
        raise Refused(why)
    j = _registry()[name]
    rows = [("Job", f"{name}: {j.doc}"), ("Every", f"{j.interval} min" if not j.feed else "per feed"),
            ("Idempotent", "no: " + j.not_idempotent if j.not_idempotent else "yes: a second run straight after the first leaves the same rows")]
    warnings = []
    params = {"job": name}
    if j.feed:
        feeds, notes = _feeds_to_run(name, feed_ids, now)
        if not feeds:
            raise Refused(f"no feed of {name} to run now" + (": " + "; ".join(notes) if notes else " (none enabled)"))
        params["feeds"] = [f.pk for f in feeds]
        rows.append(("Feeds", ", ".join(f.name for f in feeds)))
        warnings += [f"left out: {n}" for n in notes]
    if run is not None:
        params["run"] = run.pk
        rows.insert(0, ("Failed run", f"#{run.pk} at {run.started_at:%Y-%m-%d %H:%M} UTC: {mask_secrets(run.error).splitlines()[0][:300] if run.error else '(no error text)'}"))
    rows.append(("Runs in", "the worker, between jobs (under the runner's lock); this page follows it"))
    target = f"job:{name}"
    summary = (f"Retry {name}" if run else f"Run {name} now") + (f" ({len(params['feeds'])} feed{'s' if len(params['feeds']) != 1 else ''})" if j.feed else "")
    check = "\n".join(f"{k}: {v}" for k, v in rows)
    return Plan(kind, target, params, summary, check_output=check, rows=rows, table=_recent_runs_table(name, feed_ids), warnings=warnings)


def prepare_run_job(data, actor):
    name = (data.get("job") or "").strip()
    feed = data.get("feed")
    return _job_plan(A.RUN_JOB, name, [_int(feed, "feed")] if feed else None)


def prepare_retry_run(data, actor):
    run = FetchRun.objects.filter(pk=_int(data.get("run"), "run")).select_related("feed").first()
    if run is None:
        raise Refused("no such run")
    if run.status != FetchRun.Status.FAILED:
        raise Refused(f"run #{run.pk} is {run.status}, not failed")
    later = FetchRun.objects.filter(job=run.job, feed=run.feed, started_at__gt=run.started_at, status__in=["ok", "partial"]).order_by("started_at").first()
    if later:
        raise Refused(f"a later run of {run.job} succeeded (#{later.pk}, {later.status} at {later.started_at:%Y-%m-%d %H:%M} UTC): nothing to retry")
    return _job_plan(A.RETRY_RUN, run.job, [run.feed_id] if run.feed_id else None, run=run)


def execute_job(action: OpsAction, log) -> dict:
    from ingest.jobs import run_named

    name = action.params["job"]
    why = job_refusal(name, action.params.get("feeds"), exclude_action=action.pk)
    if why:
        raise Refused(why)
    before = _revision_high()
    runs = []
    if action.params.get("feeds"):
        for fid in action.params["feeds"]:
            got = run_named(name, feed=str(fid), log=log)
            if got is None:
                raise Refused("another runner holds the lock")
            runs += got
    else:
        got = run_named(name, log=log)
        if got is None:
            raise Refused("another runner holds the lock")
        runs += got
    from revisions.models import Revision

    revs = Revision.objects.filter(id__gt=before, actor__startswith="job:")
    out = {"runs": [{"id": r.pk, "feed": r.feed_id, "status": r.status, "counts": r.counts} for r in runs],
           "revisions": revs.count(), "revisions_after": before}
    failed = [r for r in runs if r.status == FetchRun.Status.FAILED]
    if failed:
        out["error"] = f"run #{failed[0].pk} failed: " + (failed[0].error.splitlines()[0][:500] if failed[0].error else "")
    return out


# ── leases ────────────────────────────────────────────────────────────────────────────────────────────────────────

def _claimed(data) -> tuple[AgentTask, str]:
    task = AgentTask.objects.filter(pk=_int(data.get("task"), "task")).first()
    holder = (data.get("holder") or "").strip()
    if task is None:
        raise Refused("no such task")
    if task.status != AgentTask.Status.CLAIMED or task.claimed_by != holder:
        raise Refused(f"task #{task.pk} is {task.status}" + (f", claimed by {task.claimed_by}" if task.claimed_by else "") + f", not the lease held by {holder or '?'} the page showed")
    return task, holder


def _lease_rows(task):
    now = timezone.now()
    state = "expired " + _ago(task.lease_until) + " ago" if task.lease_until < now else "live for another " + str(int((task.lease_until - now).total_seconds() // 60)) + " min"
    return [("Task", f"#{task.pk} {task.kind} (priority {task.priority})"), ("Holder", task.claimed_by),
            ("Claimed", f"{task.claimed_at:%Y-%m-%d %H:%M} UTC" if task.claimed_at else "–"),
            ("Lease", f"until {task.lease_until:%Y-%m-%d %H:%M} UTC ({state})"), ("Attempts", f"{task.attempts} of {task.max_attempts}")]


def prepare_release_lease(data, actor):
    task, holder = _claimed(data)
    rows = _lease_rows(task) + [("Then", "back in the queue for any agent; the attempt stays counted; a note goes in its error")]
    warnings = []
    if task.lease_until >= timezone.now():
        warnings.append(f"the lease is still live: if {holder} is still working, its result will be refused once another agent claims the task")
    return Plan(A.RELEASE_LEASE, f"task:{task.pk}", {"task": task.pk, "holder": holder}, f"Release {holder}'s lease on task #{task.pk}",
                check_output="\n".join(f"{k}: {v}" for k, v in rows), rows=rows, warnings=warnings)


def prepare_extend_lease(data, actor):
    task, holder = _claimed(data)
    minutes = _int(data.get("minutes") or 60, "minutes")
    if not 1 <= minutes <= 24 * 60:
        raise Refused("extend by 1 to 1440 minutes")
    start = max(timezone.now(), task.lease_until)
    rows = _lease_rows(task) + [("Then", f"the lease runs to {start + timedelta(minutes=minutes):%Y-%m-%d %H:%M} UTC (+{minutes} min)")]
    return Plan(A.EXTEND_LEASE, f"task:{task.pk}", {"task": task.pk, "holder": holder, "minutes": minutes},
                f"Extend {holder}'s lease on task #{task.pk} by {minutes} min", check_output="\n".join(f"{k}: {v}" for k, v in rows), rows=rows)


def execute_release_lease(action, log):
    p = action.params
    try:
        t = queue.release_stuck(p["task"], holder=p["holder"], by=action.requested_by, reason=action.reason)
    except queue.TaskError as e:
        raise Refused(str(e)) from e
    return {"task": t.pk, "status": t.status}


def execute_extend_lease(action, log):
    p = action.params
    try:
        t = queue.extend_for(p["task"], holder=p["holder"], by=action.requested_by, minutes=p["minutes"], reason=action.reason)
    except queue.TaskError as e:
        raise Refused(str(e)) from e
    return {"task": t.pk, "lease_until": t.lease_until.isoformat(timespec="seconds")}


# ── requeue, cancel ───────────────────────────────────────────────────────────────────────────────────────────────

TASK_FILTERS = ("kind", "status", "agent", "q")


def _eligible(kind: str, qs, now):
    if kind == A.REQUEUE_TASKS:
        return qs.filter(status__in=queue.REQUEUEABLE)
    return qs.filter(DQ(status=AgentTask.Status.QUEUED) | DQ(status=AgentTask.Status.CLAIMED, lease_until__lt=now))


def _tasks_plan(kind: str, data) -> Plan:
    from . import queries as Q

    now = timezone.now()
    raw = data.getlist("task") if hasattr(data, "getlist") else data.get("task") or []
    ids = [i for i in ([raw] if isinstance(raw, (str, int)) else raw) if str(i).strip()]
    f = {k: (data.get(k) or "").strip() for k in TASK_FILTERS}
    if ids:
        qs = AgentTask.objects.filter(pk__in=[_int(i, "task") for i in ids])
        how = f"{len(ids)} selected task{'s' if len(ids) != 1 else ''}"
    else:
        if not any(f.values()):
            raise Refused("choose tasks, or filter the list first (a batch needs at least one filter)")
        qs = Q.tasks(**f)
        how = "the tasks matching " + ", ".join(f"{k}={v}" for k, v in f.items() if v)
    eligible = _eligible(kind, qs, now)
    total = eligible.count()
    if not total:
        verb = "requeue (failed or cancelled)" if kind == A.REQUEUE_TASKS else "cancel (queued, or claimed with an expired lease)"
        raise Refused(f"none of {how} can be {verb.split(' (')[0]}d: only tasks to {verb}")
    pick = list(eligible.order_by("-priority", "created_at", "id").only("id", "kind", "status", "priority", "created_at", "dedupe_key", "claimed_by")[:MAX_TASKS])
    verb = "Requeue" if kind == A.REQUEUE_TASKS else "Cancel"
    rows = [("Selection", how), ("Eligible", f"{total}" + (f": this acts on the first {MAX_TASKS} (priority, then age); run it again for the rest" if total > MAX_TASKS else "")),
            ("Then", "back to queued with attempts reset to 0" if kind == A.REQUEUE_TASKS else "cancelled; agents will not be offered them"),
            ("Note", "each task's error gets a line: who, and the reason")]
    warnings = [f"{total} tasks match; the cap is {MAX_TASKS} at once"] if total > MAX_TASKS else []
    table = {"head": ["Task", "Kind", "Status", "Priority", "Created (UTC)", "Dedupe key"],
             "rows": [[f"#{t.pk}", t.kind, t.status + (f" by {t.claimed_by}" if t.claimed_by else ""), t.priority, t.created_at.strftime("%Y-%m-%d %H:%M"), t.dedupe_key[:60]] for t in pick]}
    check = "\n".join(f"{k}: {v}" for k, v in rows) + "\n" + "tasks: " + ", ".join(str(t.pk) for t in pick)
    return Plan(kind, f"tasks:{len(pick)}", {"ids": [t.pk for t in pick], "filters": {k: v for k, v in f.items() if v}, "eligible": total},
                f"{verb} {len(pick)} task{'s' if len(pick) != 1 else ''}", check_output=check, rows=rows, table=table, warnings=warnings)


def prepare_requeue(data, actor):
    return _tasks_plan(A.REQUEUE_TASKS, data)


def prepare_cancel(data, actor):
    return _tasks_plan(A.CANCEL_TASKS, data)


def execute_requeue(action, log):
    try:
        return queue.requeue(action.params["ids"], by=action.requested_by, reason=action.reason)
    except queue.TaskError as e:
        raise Refused(str(e)) from e


def execute_cancel(action, log):
    try:
        return queue.cancel(action.params["ids"], by=action.requested_by, reason=action.reason)
    except queue.TaskError as e:
        raise Refused(str(e)) from e


# ── content waves ─────────────────────────────────────────────────────────────────────────────────────────────────

def prepare_advance_wave(data, actor):
    from governance import waves

    names = [w["name"] for w in waves.waves()]
    st = JobState.objects.filter(name=waves.STATE).values_list("state", flat=True).first() or {}
    active = st.get("active") if st.get("active") in names else names[0]
    to = (data.get("to") or "").strip()
    if not to:
        i = names.index(active)
        if i + 1 >= len(names):
            raise Refused(f"{active} is the last wave")
        to = names[i + 1]
    if to not in names:
        raise Refused(f"no wave {to!r} (waves: {', '.join(names)})")
    if to == active:
        raise Refused(f"{to} is already the active wave")
    last = st.get("last_run") or {}
    cov = (last.get("coverage") or {}).get(active) or {}
    c = last.get("counts") or {}
    open_in = sum(1 for p in AgentTask.objects.filter(kind=waves.KIND, status__in=waves.OPEN).values_list("payload", flat=True)
                  if (p or {}).get("wave", {}).get("name") == active)
    rows = [("Active now", active), ("Becomes active", to),
            (f"{active} at the last gap_waves run", (f"{last['at'][:16]}: {cov.get('share_covered', 0) or 0:.0%} of {cov.get('pairs', 0)} branch-windows covered; "
             f"{(last.get('gaps') or {}).get(active, 0)} gaps ({cov.get('empty', 0)} empty, {cov.get('sparse', 0)} sparse); held by the cap {c.get(f'{active}.held_cap', 0)}, by branch {c.get(f'{active}.held_branch', 0)}")
             if last.get("at") else "no gap_waves run yet"),
            (f"Open fill_gap tasks in {active}", str(open_in)),
            ("Then", f"gap_waves queues gaps in every wave up to {to}; open tasks are not touched")]
    # The dry run: what the next gap_waves would queue with the new wave active (rolled back, nothing kept).
    with transaction.atomic():
        waves.set_active(to, by=actor, reason="dry run")
        out = waves.run(dry_run=True)
        transaction.set_rollback(True)
    would = out["queued"]
    rows.append(("gap_waves would queue", f"{len(would)} now (cap {out['per_day']}/day)" + (f"; it would then advance to {', '.join(out['advanced_to'])}" if out["advanced_to"] else "")))
    table = {"head": ["Priority", "Wave", "Branch", "Window", "Kind"], "rows": [[r["priority"], r["wave"], r["branch"], r["window"], r["kind"]] for r in would[:20]]}
    check = "\n".join(f"{k}: {v}" for k, v in rows) + "\n" + "\n".join(f"  {r['priority']:>3} {r['wave']} {r['branch']} {r['window']} {r['kind']}" for r in would[:20])
    return Plan(A.ADVANCE_WAVE, f"wave:{to}", {"from": active, "to": to}, f"Make {to} the active wave (from {active})",
                check_output=check, rows=rows, table=table)


def execute_advance_wave(action, log):
    from governance import waves

    names = [w["name"] for w in waves.waves()]
    current = names[waves.active_index()]
    if current != action.params["from"]:
        raise Refused(f"the active wave is {current} now, not {action.params['from']} as the confirmation showed")
    old, new = waves.set_active(action.params["to"], by=action.requested_by, reason=action.reason)
    return {"from": old, "to": new}


# ── publish, rollback ─────────────────────────────────────────────────────────────────────────────────────────────

def exclusive_refusal(exclude_action: int | None = None) -> str:
    qs = _open_actions(EXCLUSIVE)
    if exclude_action:
        qs = qs.exclude(pk=exclude_action)
    other = qs.first()
    return f"a {other.kind} is already {other.status} (action #{other.pk}): one publish or rollback at a time" if other else ""


def prepare_publish_check(data, actor):
    return Plan(A.PUBLISH_CHECK, "release:check", {}, "Run publish --check (the release gates and the change report; writes nothing)",
                rows=[("Runs in", "the worker; the result page is the publish confirmation")])


def execute_publish_check(action, log):
    from publish import changes, gates, release

    try:
        p = release.preview()
    except gates.PublishRefused as e:
        raise Refused(str(e)) from e
    rep = p["report"]
    action.output = changes.to_markdown(rep).decode()
    return {"content_hash": p["content_hash"], "page_hash": p["page_hash"], "unchanged_since": p["unchanged_since"],
            "from": rep["from"], "total": rep["total"], "page": rep.get("page"), "summary": changes.page_summary(rep), "gates": list(gates.GATES)}


def publish_check_refusal(check: OpsAction | None) -> str:
    if check is None or check.kind != A.PUBLISH_CHECK:
        return "no such check"
    if check.status != OpsAction.Status.DONE:
        return f"check #{check.pk} is {check.status}"
    if check.finished_at and check.finished_at < timezone.now() - timedelta(minutes=CHECK_FRESH_MINUTES):
        return f"check #{check.pk} is older than {CHECK_FRESH_MINUTES} minutes: run it again"
    if OpsAction.objects.filter(kind=A.PUBLISH, params__check=check.pk).exists():
        return f"check #{check.pk} has already been used for a publish"
    return exclusive_refusal()


def prepare_publish(data, actor):
    check = OpsAction.objects.filter(pk=_int(data.get("check"), "check")).first()
    why = publish_check_refusal(check)
    if why:
        raise Refused(why)
    r = check.result or {}
    t = r.get("total", {})
    rows = [("Check", f"#{check.pk}, {check.finished_at:%Y-%m-%d %H:%M} UTC, by {check.requested_by}: every gate passed ({', '.join(r.get('gates', []))})"),
            ("Against", r.get("from") or "no release yet"),
            ("Changes", f"{t.get('added', 0)} added, {t.get('changed', 0)} changed, {t.get('retracted', 0)} retracted; {r.get('summary', '')}"),
            ("Hashes", f"content {r.get('content_hash', '')[:12]}…, page {(r.get('page_hash') or '')[:12]}…"),
            ("Runs in", "the worker: it checks the content and page still hash as checked, runs the gates again, writes the release and moves latest")]
    warnings = []
    if r.get("unchanged_since"):
        warnings.append(f"content and page are unchanged since {r['unchanged_since']}: no release is made unless you force it")
    return Plan(A.PUBLISH, "release:new", {"check": check.pk, "content_hash": r.get("content_hash"), "page_hash": r.get("page_hash")},
                "Publish a release from check #%d" % check.pk, check_output=check.output, rows=rows, warnings=warnings, fields=["notes", "force"])


def _current_hashes() -> tuple[str, str]:
    from publish.content import dumps
    from publish.export import build_content
    from publish.release import page_hash

    return hashlib.sha256(dumps(build_content()).encode()).hexdigest(), page_hash()


def execute_publish(action, log):
    from publish import changes, gates, release
    from infra import storage

    if why := exclusive_refusal(exclude_action=action.pk):
        raise Refused(why)
    p = action.params
    content, page = _current_hashes()
    if (content, page) != (p.get("content_hash"), p.get("page_hash")):
        what = "content" if content != p.get("content_hash") else "page"
        raise Refused(f"the {what} changed since check #{p.get('check')}: run the check again and confirm what it shows")
    try:
        rel, created = release.publish(actor=action.requested_by, notes=p.get("notes", ""), force=bool(p.get("force")))
    except gates.PublishRefused as e:
        raise Refused(str(e)) from e
    if not created:
        return {"created": False, "version": rel.version, "summary": f"unchanged since {rel.version} (content and page): nothing written"}
    rep = json.loads(storage.read(storage.RELEASES, storage.release_key(rel.version, "changes.json")))
    log(f"release {rel.version}: {changes.page_summary(rep)}; latest → {rel.version}")
    return {"created": True, "version": rel.version, "counts": rel.counts, "total": rep["total"], "summary": changes.page_summary(rep)}


def prepare_rollback(data, actor):
    from infra import storage

    from . import queries as Q

    version = (data.get("version") or "").strip()
    rel = Release.objects.filter(version=version).first()
    if rel is None:
        raise Refused(f"no release {version!r}")
    try:
        pointer = storage.read_pointer() or {}
    except Exception as e:  # noqa: BLE001
        raise Refused(f"the releases store can't be read: {type(e).__name__}") from e
    if pointer.get("version") == version:
        raise Refused(f"{version} is already live")
    try:
        body = storage.read(storage.RELEASES, rel.snapshot_path)
    except (FileNotFoundError, OSError):
        raise Refused(f"{rel.snapshot_path} is not in the releases store") from None
    if hashlib.sha256(body).hexdigest() != rel.content_hash:
        raise Refused(f"{rel.snapshot_path} does not match the hash recorded for {version}")
    if why := exclusive_refusal():
        raise Refused(why)
    live = Release.objects.filter(version=pointer.get("version")).first()
    c = rel.counts or {}
    rows = [("Live now", f"{pointer.get('version') or 'nothing'}" + (f" ({live.counts.get('events')} events, made {live.created_at:%Y-%m-%d %H:%M} UTC by {live.created_by})" if live else "")
             + (f"; pointed by {pointer.get('updated_by')} ({pointer.get('reason')})" if pointer else "")),
            ("Would point at", f"{version}: {c.get('branches')} branches, {c.get('events')} events, made {rel.created_at:%Y-%m-%d %H:%M} UTC by {rel.created_by}; snapshot hash verified"),
            ("Its changes", json.dumps((Q.manifest(version) or {}).get("changes") or {}, sort_keys=True)),
            ("Then", "readers get that release; Postgres is not touched, so the next publish of changed content moves on from it")]
    return Plan(A.ROLLBACK, f"release:{version}", {"version": version, "from": pointer.get("version")}, f"Roll back: point latest at {version}",
                check_output="\n".join(f"{k}: {v}" for k, v in rows), rows=rows)


def execute_rollback(action, log):
    from publish import release

    if why := exclusive_refusal(exclude_action=action.pk):
        raise Refused(why)
    try:
        rel = release.rollback(action.params["version"], actor=action.requested_by)
    except ValueError as e:
        raise Refused(str(e)) from e
    log(f"latest → {rel.version}")
    return {"version": rel.version, "from": action.params.get("from")}


# ── pause, resume ─────────────────────────────────────────────────────────────────────────────────────────────────

def _pause_plan(kind, data):
    from ingest.jobs import paused_jobs

    name = (data.get("job") or "").strip()
    if name not in _registry():
        raise Refused(f"no job {name!r}")
    paused = paused_jobs()
    if kind == A.PAUSE_JOB and name in paused:
        raise Refused(f"{name} is already paused (by {paused[name].get('by')})")
    if kind == A.RESUME_JOB and name not in paused:
        raise Refused(f"{name} is not paused")
    rows = [("Job", f"{name}: {_registry()[name].doc}")]
    if kind == A.PAUSE_JOB:
        rows.append(("Then", "the scheduler skips it until it is resumed (a run in progress finishes); `manage.py run_job` can still run it; the Jobs page shows who paused it and why"))
    else:
        p = paused[name]
        rows += [("Paused", f"by {p.get('by')} at {p.get('at', '')[:16]}: {p.get('reason')}"), ("Then", "it runs when next due")]
    return Plan(kind, f"job:{name}", {"job": name}, f"{'Pause' if kind == A.PAUSE_JOB else 'Resume'} {name}",
                check_output="\n".join(f"{k}: {v}" for k, v in rows), rows=rows)


def execute_pause(action, log):
    from ingest.jobs import set_paused

    return {"paused": sorted(set_paused(action.params["job"], action.kind == A.PAUSE_JOB, by=action.requested_by, reason=action.reason))}


# ── the registry ──────────────────────────────────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class Action:
    kind: str
    runs_in: str
    prepare: callable
    execute: callable
    direct: bool = False  # no confirmation step: it writes nothing (publish --check)


W, R = OpsAction.RunsIn.WORKER, OpsAction.RunsIn.REQUEST
ACTIONS = {a.kind: a for a in [
    Action(A.RUN_JOB, W, prepare_run_job, execute_job),
    Action(A.RETRY_RUN, W, prepare_retry_run, execute_job),
    Action(A.RELEASE_LEASE, R, prepare_release_lease, execute_release_lease),
    Action(A.EXTEND_LEASE, R, prepare_extend_lease, execute_extend_lease),
    Action(A.REQUEUE_TASKS, R, prepare_requeue, execute_requeue),
    Action(A.CANCEL_TASKS, R, prepare_cancel, execute_cancel),
    Action(A.ADVANCE_WAVE, R, prepare_advance_wave, execute_advance_wave),
    Action(A.PUBLISH_CHECK, W, prepare_publish_check, execute_publish_check, direct=True),
    Action(A.PUBLISH, W, prepare_publish, execute_publish),
    Action(A.ROLLBACK, W, prepare_rollback, execute_rollback),
    Action(A.PAUSE_JOB, R, lambda d, a: _pause_plan(A.PAUSE_JOB, d), execute_pause),
    Action(A.RESUME_JOB, R, lambda d, a: _pause_plan(A.RESUME_JOB, d), execute_pause),
]}


def rate_refusal(actor: str, *, now=None) -> str:
    """At most RATE_LIMIT actions per user per RATE_WINDOW_MINUTES (one query, like the agent API's limit)."""
    now = now or timezone.now()
    n = OpsAction.objects.filter(requested_by=actor, created_at__gte=now - timedelta(minutes=RATE_WINDOW_MINUTES)).count()
    return f"{n} actions in the last {RATE_WINDOW_MINUTES} minutes: at most {RATE_LIMIT}; wait a little" if n >= RATE_LIMIT else ""


def run_now(action: OpsAction, *, log=None) -> OpsAction:
    """Execute an action and record how it went (status, output, result, error). For a request action this is the
    request's transaction; for a worker action the worker calls it after taking the row."""
    lines = []

    def capture(msg):
        lines.append(mask_secrets(str(msg)))
        if log:
            log(msg)

    spec = ACTIONS[action.kind]
    action.status, action.started_at = OpsAction.Status.RUNNING, action.started_at or timezone.now()
    action.save(update_fields=["status", "started_at"])
    try:
        # A quick action is one transaction; a worker action is not wrapped (a job manages its own transactions).
        with transaction.atomic() if spec.runs_in == OpsAction.RunsIn.REQUEST else nullcontext():
            result = spec.execute(action, capture)
        action.result = result
        action.status = OpsAction.Status.FAILED if (result or {}).get("error") else OpsAction.Status.DONE
        action.error = mask_secrets((result or {}).get("error", ""))
    except Refused as e:
        action.status, action.error = OpsAction.Status.FAILED, mask_secrets(str(e))[:20000]
    except Exception as e:  # noqa: BLE001 — recorded on the row; the worker carries on
        import traceback

        action.status, action.error = OpsAction.Status.FAILED, mask_secrets(f"{type(e).__name__}: {e}\n{traceback.format_exc()[-3000:]}")[:20000]
    action.output = (action.output + "\n" if action.output else "") + "\n".join(lines)
    action.output = mask_secrets(action.output)[:100000]
    action.finished_at = timezone.now()
    action.save(update_fields=["status", "result", "error", "output", "finished_at"])
    return action
