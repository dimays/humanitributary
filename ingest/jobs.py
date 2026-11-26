"""The job registry and runner behind `manage.py run_jobs` / `run_job` (docs/adr/0008-ingest-design.md).

- A job is a function `fn(ctx)` registered with a name, an interval and, for feed jobs, the Feed kind it reads:
  a feed job runs once per enabled Feed whose `config["job"]` names it, when that feed's `next_run_at` has come;
  any other job runs when its interval has passed since its last FetchRun.
- `run_due()` runs whatever is due, in registry order (sources, then entities, then processing, then upkeep),
  under a Postgres advisory lock: a second runner finds the lock taken and exits at once, and the lock dies with
  the process, so a crash never leaves it stuck. Runs left "running" by a crashed process are closed as failed.
- Every run is a FetchRun (job, feed, timings, status, counts, error). A failing job never stops the others.

No LLM calls anywhere in jobs (AGENTS.md rule 3).
"""

import json
import traceback
from collections import Counter
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Callable

from django.db import connection
from django.utils import timezone

from .http import Fetcher
from .policy import mask_secrets
from .models import Feed, FetchRun

LOCK_KEY = 7_302_118_015  # pg advisory lock id for the job runner (any constant; only this module uses it)


@dataclass
class Job:
    name: str
    fn: Callable
    interval: int  # minutes
    feed: bool = False
    doc: str = ""


REGISTRY: dict[str, Job] = {}


def job(name: str, *, interval: int, feed: bool = False):
    def wrap(fn):
        REGISTRY[name] = Job(name, fn, interval, feed, (fn.__doc__ or "").strip().split("\n")[0])
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


def try_lock() -> bool:
    with connection.cursor() as c:
        c.execute("SELECT pg_try_advisory_lock(%s)", [LOCK_KEY])
        return c.fetchone()[0]


def unlock():
    with connection.cursor() as c:
        c.execute("SELECT pg_advisory_unlock(%s)", [LOCK_KEY])


def _load_registry():
    # Importing the job modules registers them (in this order: the order run_due runs them).
    from . import job_defs  # noqa: F401


def feeds_for(name: str, *, enabled_only=True):
    qs = Feed.objects.filter(config__job=name)
    return qs.filter(enabled=True) if enabled_only else qs


def is_due(j: Job, now, feed: Feed | None = None) -> bool:
    if j.feed:
        return feed is not None and feed.enabled and (feed.next_run_at is None or feed.next_run_at <= now)
    last = FetchRun.objects.filter(job=j.name, feed__isnull=True).exclude(status=FetchRun.Status.RUNNING).order_by("-started_at").first()
    return last is None or last.started_at + timedelta(minutes=j.interval) <= now


def run_one(j: Job, *, feed: Feed | None = None, options: dict | None = None, fetcher: Fetcher | None = None, log=print) -> FetchRun:
    now = timezone.now()
    run = FetchRun.objects.create(job=j.name, feed=feed, started_at=now)
    own_fetcher = fetcher is None
    fetcher = fetcher or Fetcher()
    ctx = Context(job=j.name, run=run, fetcher=fetcher, feed=feed, options=options or {}, log=log)
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
    if feed is not None:
        feed.last_run_at = now
        feed.next_run_at = now + timedelta(minutes=feed.interval_minutes or j.interval)
        feed.save(update_fields=["last_run_at", "next_run_at"])
    log(mask_secrets(f"{j.name}{' [' + feed.name + ']' if feed else ''}: {run.status} {json.dumps(run.counts)} ({(run.finished_at - now).total_seconds():.1f}s)"))
    return run


def close_interrupted():
    """Runs a crashed process left "running" (we hold the lock, so nobody else is running)."""
    return FetchRun.objects.filter(status=FetchRun.Status.RUNNING).update(status=FetchRun.Status.FAILED, finished_at=timezone.now(), error="interrupted (the runner exited before finishing)")


def run_due(*, only: list[str] | None = None, log=print, fetcher_factory=Fetcher, now=None) -> list[FetchRun] | None:
    """Run every due job once, in registry order. None when another runner holds the lock."""
    _load_registry()
    if not try_lock():
        log("another run_jobs holds the lock; exiting")
        return None
    runs = []
    try:
        close_interrupted()
        for j in REGISTRY.values():
            if only and j.name not in only:
                continue
            now_ = now or timezone.now()
            if j.feed:
                for feed in feeds_for(j.name).order_by("name"):
                    if is_due(j, now_, feed):
                        runs.append(run_one(j, feed=feed, fetcher=fetcher_factory() if fetcher_factory is not Fetcher else None, log=log))
            elif is_due(j, now_):
                runs.append(run_one(j, fetcher=fetcher_factory() if fetcher_factory is not Fetcher else None, log=log))
    finally:
        unlock()
    return runs


def run_named(name: str, *, feed: str | None = None, options: dict | None = None, log=print, fetcher=None) -> list[FetchRun] | None:
    """Run one job now, due or not (every enabled feed of a feed job, or the one named)."""
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
            return [run_one(j, feed=f, options=options, fetcher=fetcher, log=log) for f in qs.order_by("name")]
        return [run_one(j, options=options, fetcher=fetcher, log=log)]
    finally:
        unlock()
