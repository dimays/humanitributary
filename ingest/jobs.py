"""The job registry and runner behind `manage.py run_jobs` / `run_job` (docs/adr/0012-ingestion.md).

- A job is a function `fn(ctx)` registered with a name, an interval and, for feed jobs, the Feed kind it reads:
  a feed job runs once per enabled Feed whose `config["job"]` names it, when that feed's `next_run_at` has come;
  any other job runs when its interval has passed since its last FetchRun.
- `run_due()` runs whatever is due, in registry order (sources, then entities, then processing, then upkeep),
  under a Postgres advisory lock: a second runner finds the lock taken and exits at once, and the lock dies with
  the process, so a crash never leaves it stuck. Runs left "running" by a crashed process are closed as failed.
- Every run is a FetchRun (job, feed, timings, status, counts, error) that says what started it (ADR 0032): the
  scheduler (with `scheduled_for`, when it became due), a console run or retry (the OpsAction's id, who asked, the
  failed run it retries and the attempt number), or `run_job` from the shell. A failing job never stops the others; one
  that fails ALERT_AFTER_FAILURES runs in a row sends one alert (infra/alerts.py).
- `loop()` is the worker process (Procfile `worker`: `run_jobs --loop`): it holds a second advisory lock, the
  scheduler lock, for its whole life, so only one worker schedules at a time (a second waits as a standby), and runs
  `run_due()` every WORKER_TICK_SECONDS. SIGTERM (Heroku's shutdown, honcho's Ctrl-C) lets the job that is running
  finish, then stops before the next one. Between jobs (and once a tick when nothing is due) it calls the hooks in
  `BETWEEN_JOBS`: the operations console's queued actions run there, under both locks (opsconsole/worker.py).
- A job can be paused (`set_paused`, from the console): the JobState "paused_jobs" names it, and `run_due` skips it
  until it is resumed. `run_named` (`manage.py run_job`) still runs it: naming a job is the owner's explicit choice.
- `Job.not_idempotent` says why a job is not safe to run twice back to back (ADR 0028): the console refuses to run
  such a job again within its interval.
- `Job.tags` sorts jobs for the console (ADR 0031): a fixed set, `TAGS`, each job naming one or more; an unknown tag
  fails at import. `Job.doc` is the first sentence of the job's docstring, the console's one-line description.
- Every run's log (INFO and above, secrets masked, capped) is captured while it runs and kept as a `RunLog`
  (ingest/runlog.py): the job's `logging` calls, the fetcher's requests, `ctx.log` and `ctx.error` lines, the
  traceback of a failure, the start and the finish.

No LLM calls anywhere in jobs (AGENTS.md rule 3).
"""

import json
import logging
import re
import traceback
from collections import Counter
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Callable

from django.db import connection
from django.utils import timezone

from . import runlog
from .http import Fetcher
from .policy import mask_secrets
from .models import Feed, FetchRun, JobState

logger = logging.getLogger(__name__)

LOCK_KEY = 7_302_118_015  # pg advisory lock id for the job runner (any constant; only this module uses it)
SCHEDULER_LOCK_KEY = 7_302_118_016  # held by the one `run_jobs --loop` worker for its lifetime


# The jobs' tags (ADR 0031): what kind of work a job does, for the console's filters. Fixed and documented here and
# in docs/guide/operations-console.md; the console adds "paused" to a paused job. A new tag is a change to this list.
TAGS = {
    "collect": "fetches material from an outside source (a feed job runs once per enabled feed)",
    "process": "turns collected material into candidates, priorities and agent tasks",
    "fact-check": "checks citations and claims, and queues verify_claim tasks",
    "governance": "branch structure: the metrics, the rules and their proposals",
    "waves": "content waves: gaps in each branch's windows and fill_gap tasks",
    "maintenance": "set-up and upkeep: seeding sources and branches, refreshing cached facts",
}


@dataclass
class Job:
    name: str
    fn: Callable
    interval: int  # minutes
    feed: bool = False
    doc: str = ""
    not_idempotent: str = ""  # why a second run straight after the first is not "again" (empty: it is)
    tags: tuple[str, ...] = ()


REGISTRY: dict[str, Job] = {}
BETWEEN_JOBS: list[Callable] = []  # hooks `loop()` calls between jobs, each `fn(log=…)` (opsconsole registers one)
PAUSED = "paused_jobs"  # the JobState naming paused jobs: {"jobs": {name: {"by", "at", "reason"}}}


def first_sentence(doc: str) -> str:
    """A docstring's first sentence, on one line: the job's description."""
    text = " ".join((doc or "").split())
    m = re.match(r"(.+?[.!?])(?=\s+[A-Z(`\"]|$)", text)
    return m.group(1) if m else text


def job(name: str, *, interval: int, feed: bool = False, not_idempotent: str = "", tags: tuple[str, ...] | str = ()):
    tags = (tags,) if isinstance(tags, str) else tuple(tags)
    unknown = [t for t in tags if t not in TAGS]
    if unknown:
        raise ValueError(f"job {name}: unknown tag(s) {', '.join(unknown)}; known: {', '.join(TAGS)}")

    def wrap(fn):
        REGISTRY[name] = Job(name, fn, interval, feed, first_sentence(fn.__doc__ or ""), not_idempotent, tags)
        return fn
    return wrap


@dataclass
class Context:
    job: str
    run: FetchRun
    fetcher: Fetcher
    feed: Feed | None = None
    options: dict = field(default_factory=dict)
    counts: Counter = field(default_factory=Counter)
    errors: list = field(default_factory=list)
    log: Callable = print
    capture: "runlog.Capture | None" = None  # the run's log (run_one sets it)

    @property
    def actor(self) -> str:
        return f"job:{self.job}"

    def opt(self, key, default=None):
        if key in self.options:
            return self.options[key]
        if self.feed and key in (self.feed.config or {}):
            return self.feed.config[key]
        return default

    def error(self, msg: str):
        self.errors.append(mask_secrets(msg)[:2000])
        self.counts["errors"] += 1
        if self.capture is not None:
            self.capture.add("ERROR", msg, logger=f"job.{self.job}")


def try_lock(key: int = LOCK_KEY) -> bool:
    with connection.cursor() as c:
        c.execute("SELECT pg_try_advisory_lock(%s)", [key])
        return c.fetchone()[0]


def unlock(key: int = LOCK_KEY):
    with connection.cursor() as c:
        c.execute("SELECT pg_advisory_unlock(%s)", [key])


def _load_registry():
    # Importing the job modules registers them (in this order: the order run_due runs them).
    from . import job_defs  # noqa: F401


def feeds_for(name: str, *, enabled_only=True):
    qs = Feed.objects.filter(config__job=name)
    return qs.filter(enabled=True) if enabled_only else qs


def paused_jobs() -> dict[str, dict]:
    """The paused jobs: {name: {"by", "at", "reason"}}. Reads the JobState without creating it."""
    st = JobState.objects.filter(name=PAUSED).values_list("state", flat=True).first() or {}
    return dict(st.get("jobs") or {})


def set_paused(name: str, paused: bool, *, by: str, reason: str) -> dict[str, dict]:
    """Pause or resume a job (the console's action; the caller records who and why). → the paused jobs after."""
    from django.db import transaction

    _load_registry()
    if name not in REGISTRY:
        raise KeyError(f"no job {name!r}")
    with transaction.atomic():
        st, _ = JobState.objects.select_for_update().get_or_create(name=PAUSED, defaults={"state": {"jobs": {}}})
        jobs = dict(st.state.get("jobs") or {})
        if paused:
            jobs[name] = {"by": by, "at": timezone.now().isoformat(timespec="seconds"), "reason": reason}
        else:
            jobs.pop(name, None)
        st.state = {**st.state, "jobs": jobs}
        st.save(update_fields=["state", "updated_at"])
    return jobs


def due_at(j: Job, feed: Feed | None = None):
    """When the job (a feed job: the feed) became due: a plain job's last start plus its interval, a feed's
    `next_run_at`. None when it never ran (due at once). The run records it as `scheduled_for` (ADR 0032)."""
    if j.feed:
        return feed.next_run_at if feed is not None else None
    last = (FetchRun.objects.filter(job=j.name, feed__isnull=True).exclude(status=FetchRun.Status.RUNNING)
            .order_by("-started_at").values_list("started_at", flat=True).first())
    return last + timedelta(minutes=j.interval) if last else None


def _due(j: Job, now, feed: Feed | None, paused: dict) -> tuple[bool, object]:
    """(due?, when it became due)."""
    if j.name in paused or (j.feed and (feed is None or not feed.enabled)):
        return False, None
    at = due_at(j, feed)
    return at is None or at <= now, at


def is_due(j: Job, now, feed: Feed | None = None, *, paused: dict | None = None) -> bool:
    return _due(j, now, feed, paused_jobs() if paused is None else paused)[0]


def run_one(j: Job, *, feed: Feed | None = None, options: dict | None = None, fetcher: Fetcher | None = None, log=print,
            trigger: str = FetchRun.Trigger.SCHEDULE, triggered_by: str = "", ops_action: int | None = None,
            retry_of: FetchRun | None = None, scheduled_for=None) -> FetchRun:
    """Run one job (one feed of a feed job) now and record it as a FetchRun, with what started it (ADR 0032): the
    scheduler (`scheduled_for`: when it became due), an operator's run or retry (`ops_action`, `triggered_by`), or
    the shell."""
    now = timezone.now()
    run = FetchRun.objects.create(job=j.name, feed=feed, started_at=now, trigger=trigger, triggered_by=triggered_by[:200],
                                  ops_action=ops_action, retry_of=retry_of, attempt=(retry_of.attempt + 1) if retry_of else 1,
                                  scheduled_for=scheduled_for if trigger == FetchRun.Trigger.SCHEDULE else None)
    label = j.name + (f" [{feed.name}]" if feed else "")
    with runlog.capture(run) as cap:
        cap.add("INFO", f"{label} started" + (f" with {json.dumps(options, sort_keys=True, default=str)}" if options else ""), logger="ingest.jobs")

        def ctx_log(msg):  # what the job prints: into its log, and to the runner's output as before
            cap.add("INFO", msg, logger=f"job.{j.name}")
            log(msg)

        own_fetcher = fetcher is None
        fetcher = fetcher or Fetcher()
        ctx = Context(job=j.name, run=run, fetcher=fetcher, feed=feed, options=options or {}, log=ctx_log, capture=cap)
        try:
            j.fn(ctx)
            run.status = FetchRun.Status.PARTIAL if ctx.errors else FetchRun.Status.OK
        except Exception as e:  # a failing job is recorded and never stops the next one
            ctx.error(f"{type(e).__name__}: {e}\n{traceback.format_exc()[-3000:]}")
            run.status = FetchRun.Status.FAILED
        finally:
            if own_fetcher:
                ctx.counts["requests"] += fetcher.requests
                fetcher.close()
    run.finished_at = timezone.now()
    run.counts = dict(sorted(ctx.counts.items()))
    run.error = mask_secrets("\n".join(ctx.errors))[:20000]
    run.save()
    took = (run.finished_at - now).total_seconds()
    cap.add("ERROR" if run.status == FetchRun.Status.FAILED else "WARNING" if run.status == FetchRun.Status.PARTIAL else "INFO",
            f"{label} finished: {run.status} in {took:.1f} s" + (f"; {len(ctx.errors)} error(s)" if ctx.errors else "")
            + (f"; counts {json.dumps(run.counts)}" if run.counts else ""), logger="ingest.jobs")
    cap.save()
    if feed is not None:
        feed.last_run_at = now
        feed.next_run_at = now + timedelta(minutes=feed.interval_minutes or j.interval)
        feed.save(update_fields=["last_run_at", "next_run_at"])
    if run.status == FetchRun.Status.FAILED:
        from infra.alerts import after_failure

        after_failure(run, log=log)
    log(mask_secrets(f"{label}: {run.status} {json.dumps(run.counts)} ({took:.1f}s)"))
    return run


def close_interrupted():
    """Runs a crashed process left "running" (we hold the lock, so nobody else is running)."""
    return FetchRun.objects.filter(status=FetchRun.Status.RUNNING).update(status=FetchRun.Status.FAILED, finished_at=timezone.now(), error="interrupted (the runner exited before finishing)")


def run_due(*, only: list[str] | None = None, log=print, fetcher_factory=Fetcher, now=None, stopping: Callable[[], bool] = lambda: False,
            between: Callable | None = None) -> list[FetchRun] | None:
    """Run every due job once, in registry order, skipping paused ones. None when another runner holds the lock.
    `stopping()` is asked before each job: once it says True, the jobs not yet started wait for the next run.
    `between(log=…)`, when given (the worker's hooks), runs before each due job and once at the end, under the lock."""
    _load_registry()
    if not try_lock():
        log("another run_jobs holds the lock; exiting")
        return None
    runs = []

    def gap():
        if between is not None and not stopping():
            between(log=log)

    try:
        close_interrupted()
        try:
            runlog.prune()
        except Exception as e:  # noqa: BLE001 — old logs can wait for the next pass
            logger.warning("pruning run logs failed: %s", type(e).__name__)
        paused = paused_jobs()
        for j in REGISTRY.values():
            if only and j.name not in only:
                continue
            now_ = now or timezone.now()
            if j.feed:
                for feed in feeds_for(j.name).order_by("name"):
                    if stopping():
                        return runs
                    due, at = _due(j, now_, feed, paused)
                    if due:
                        gap()
                        runs.append(run_one(j, feed=feed, fetcher=fetcher_factory() if fetcher_factory is not Fetcher else None, log=log,
                                            scheduled_for=at))
            else:
                if stopping():
                    return runs
                due, at = _due(j, now_, None, paused)
                if due:
                    gap()
                    runs.append(run_one(j, fetcher=fetcher_factory() if fetcher_factory is not Fetcher else None, log=log, scheduled_for=at))
        gap()
    finally:
        unlock()
    return runs


def between_jobs(*, log=print):
    """Run the BETWEEN_JOBS hooks (the worker's), each in its own try: a failing hook never stops the jobs."""
    for fn in BETWEEN_JOBS:
        try:
            fn(log=log)
        except Exception as e:  # noqa: BLE001
            log(mask_secrets(f"between-jobs hook {getattr(fn, '__qualname__', fn)} failed: {type(e).__name__}: {e}"))


class Stop:
    """Set by SIGTERM / SIGINT; the loop and run_due check it between jobs."""

    def __init__(self):
        self.requested = False

    def __call__(self) -> bool:
        return self.requested

    def request(self, *_):
        self.requested = True


def loop(*, tick: int | None = None, log=print, stop: Stop | None = None, max_ticks: int | None = None, sleep=None, only=None) -> int:
    """The worker: hold the scheduler lock, run what's due every `tick` seconds until stopped. → ticks run.

    A second worker finds the scheduler lock taken and waits as a standby, trying again each tick, so a deploy that
    briefly runs two workers never schedules twice (and the per-run lock still keeps a launchd `run_jobs` out).
    """
    import signal
    import time

    from django.conf import settings
    from django.db import close_old_connections, connection

    tick = tick or settings.WORKER_TICK_SECONDS
    own = stop is None
    stop = stop or Stop()
    sleep = sleep or time.sleep
    if own:  # the real process: Heroku sends SIGTERM and waits 30 s before SIGKILL
        signal.signal(signal.SIGTERM, stop.request)
        signal.signal(signal.SIGINT, stop.request)
    ticks, holding = 0, False
    try:
        while not stop():
            if not connection.in_atomic_block:  # (always, except inside a test's transaction)
                close_old_connections()
            if not holding:
                holding = try_lock(SCHEDULER_LOCK_KEY)
                if not holding:
                    log("another worker holds the scheduler lock; standing by")
            if holding:
                runs = run_due(log=log, stopping=stop, only=only, between=between_jobs)
                if runs:
                    log(f"tick: {len(runs)} run(s), {sum(r.status == 'failed' for r in runs)} failed")
            ticks += 1
            if max_ticks is not None and ticks >= max_ticks:
                break
            waited = 0.0
            while waited < tick and not stop():
                sleep(min(1.0, tick - waited))
                waited += 1.0
    finally:
        if holding:
            try:
                unlock(SCHEDULER_LOCK_KEY)
            except Exception:  # noqa: BLE001 — the lock dies with the connection anyway
                pass
    log("worker stopped")
    return ticks


def run_named(name: str, *, feed: str | None = None, options: dict | None = None, log=print, fetcher=None,
              trigger: str = FetchRun.Trigger.MANUAL, triggered_by: str = "shell", ops_action: int | None = None,
              retry_of: FetchRun | None = None) -> list[FetchRun] | None:
    """Run one job now, due or not, paused or not (every enabled feed of a feed job, or the one named). Its runs are
    `manual` by "shell" unless the console says otherwise (a run or a retry, with its OpsAction's id and who asked)."""
    _load_registry()
    if name not in REGISTRY:
        raise KeyError(f"no job {name!r}; known: {', '.join(REGISTRY)}")
    j = REGISTRY[name]
    if not try_lock():
        log("another run_jobs holds the lock; exiting")
        return None
    try:
        close_interrupted()
        if j.feed:
            qs = feeds_for(name, enabled_only=feed is None)
            if feed:
                qs = qs.filter(pk=int(feed)) if feed.isdigit() else qs.filter(name=feed)
            how = dict(trigger=trigger, triggered_by=triggered_by, ops_action=ops_action)
            return [run_one(j, feed=f, options=options, fetcher=fetcher, log=log, **how,
                            retry_of=retry_of if retry_of is not None and retry_of.feed_id == f.pk else None) for f in qs.order_by("name")]
        return [run_one(j, options=options, fetcher=fetcher, log=log, trigger=trigger, triggered_by=triggered_by, ops_action=ops_action,
                        retry_of=retry_of)]
    finally:
        unlock()
