"""The worker's side of the console's actions (ADR 0028): `pick_up()` runs the pending OpsActions that must not run in
a web request (a job run, publish --check, publish, rollback).

`ingest.jobs.loop()` (the `worker` process) calls it between jobs and once a tick, through `ingest.jobs.BETWEEN_JOBS`
(registered in `opsconsole.apps`), so it runs only in the one worker holding the scheduler lock, inside `run_due`
under the runner's lock: an action never overlaps a job, and a `run_job` action's own `run_named` takes the same
(re-entrant) lock. Actions run oldest first, at most PER_PICK_UP at a time so the jobs are not held up.
"""

from django.db import transaction
from django.utils import timezone

from .actions import run_now
from .models import OpsAction

PER_PICK_UP = 5


def close_interrupted() -> int:
    """Worker actions left "running" by a worker that died (only one worker picks up, so none is really running)."""
    return OpsAction.objects.filter(runs_in=OpsAction.RunsIn.WORKER, status=OpsAction.Status.RUNNING).update(
        status=OpsAction.Status.FAILED, finished_at=timezone.now(), error="interrupted (the worker exited before finishing)")


def take() -> OpsAction | None:
    """The oldest pending worker action, marked running (FOR UPDATE SKIP LOCKED, so a second taker gets another)."""
    with transaction.atomic():
        a = (OpsAction.objects.select_for_update(skip_locked=True)
             .filter(runs_in=OpsAction.RunsIn.WORKER, status=OpsAction.Status.PENDING).order_by("created_at", "id").first())
        if a is None:
            return None
        a.status, a.started_at = OpsAction.Status.RUNNING, timezone.now()
        a.save(update_fields=["status", "started_at"])
        return a


def pick_up(*, log=print, limit: int = PER_PICK_UP) -> list[OpsAction]:
    """Run up to `limit` pending worker actions. → the actions run."""
    close_interrupted()
    done = []
    while len(done) < limit:
        a = take()
        if a is None:
            break
        log(f"ops action #{a.pk} {a.kind} {a.target} by {a.requested_by}")
        run_now(a, log=log)
        log(f"ops action #{a.pk}: {a.status}" + (f": {a.error.splitlines()[0][:200]}" if a.error else ""))
        done.append(a)
    return done
