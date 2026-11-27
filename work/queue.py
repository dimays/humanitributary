"""Claiming, completing and releasing agent tasks (docs/adr/0003).

Leases: `next_task(claim=True)` takes the best available task under `SELECT … FOR UPDATE SKIP LOCKED`, so two agents
asking at once get different tasks, and holds it until `lease_until`. A task whose lease ran out is available again
(its next claim counts another attempt); past `max_attempts` it fails instead of being offered. Only the agent holding
a claim may complete, fail, release or extend it, and only while no one else has taken it over.

Operators (the console, ADR 0028) have their own versions, each naming who acts and why, appended to the task's
`error` as `human:<username>: …`: `release_stuck` and `extend_for` (checked against the holder the operator saw, so
a lease that changed hands in the meantime is refused), `requeue` (failed or cancelled tasks back to the queue, their
attempts reset) and `cancel` (queued tasks, or claimed ones whose lease ran out), at most MAX_BATCH at once.
"""

from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import AgentTask

S = AgentTask.Status


class TaskError(Exception):
    pass


def enqueue(kind: str, *, created_by: str, dedupe_key: str = "", priority: int = 0, payload: dict | None = None, **targets) -> tuple[AgentTask, bool]:
    """Queue a task; with a dedupe_key, an open task with the same (kind, key) is returned instead. → (task, created)"""
    with transaction.atomic():
        if dedupe_key:
            open_task = AgentTask.objects.filter(kind=kind, dedupe_key=dedupe_key, status__in=[S.QUEUED, S.CLAIMED]).first()
            if open_task:
                return open_task, False
        task = AgentTask.objects.create(kind=kind, created_by=created_by, dedupe_key=dedupe_key, priority=priority, payload=payload or {}, **targets)
        return task, True


def _available(now):
    return (Q(status=S.QUEUED) | Q(status=S.CLAIMED, lease_until__lt=now)) & (Q(not_before__isnull=True) | Q(not_before__lte=now))


def next_task(*, agent: str, kinds: list[str] | None = None, claim: bool = False, lease_minutes: int | None = None) -> AgentTask | None:
    """The best available task (highest priority, then oldest). With claim=True, lease it to `agent`."""
    now = timezone.now()
    with transaction.atomic():
        qs = AgentTask.objects.filter(_available(now))
        if kinds:
            qs = qs.filter(kind__in=kinds)
        qs = qs.order_by("-priority", "created_at", "id")
        if not claim:
            return qs.first()
        while True:
            task = qs.select_for_update(skip_locked=True).first()
            if task is None:
                return None
            if task.attempts >= task.max_attempts:
                task.status, task.error = S.FAILED, (task.error + "\n" if task.error else "") + f"lease expired after {task.attempts} attempts"
                task.claimed_by, task.lease_until, task.completed_at = "", None, now
                task.save(update_fields=["status", "error", "claimed_by", "lease_until", "completed_at"])
                continue
            task.status, task.claimed_by, task.claimed_at = S.CLAIMED, agent, now
            task.lease_until = now + timedelta(minutes=lease_minutes or settings.TASK_LEASE_MINUTES)
            task.attempts += 1
            task.save(update_fields=["status", "claimed_by", "claimed_at", "lease_until", "attempts"])
            return task


def _held(task_id: int, agent: str) -> AgentTask:
    task = AgentTask.objects.select_for_update().filter(pk=task_id).first()
    if task is None:
        raise TaskError(f"no task #{task_id}")
    if task.status != S.CLAIMED or task.claimed_by != agent:
        raise TaskError(f"task #{task_id} is {task.status}" + (f", claimed by {task.claimed_by}" if task.claimed_by else "") + f", not held by {agent}")
    return task


def complete(task_id: int, *, agent: str, result: dict) -> AgentTask:
    with transaction.atomic():
        task = _held(task_id, agent)
        task.status, task.result, task.completed_at, task.lease_until = S.DONE, result, timezone.now(), None
        task.save(update_fields=["status", "result", "completed_at", "lease_until"])
        return task


def fail(task_id: int, *, agent: str, error: str, retry: bool = True) -> AgentTask:
    """Give up on a task: back to the queue while attempts remain (and retry is True), else failed."""
    with transaction.atomic():
        task = _held(task_id, agent)
        task.error = (task.error + "\n" if task.error else "") + f"{agent}: {error}"
        if retry and task.attempts < task.max_attempts:
            task.status = S.QUEUED
        else:
            task.status, task.completed_at = S.FAILED, timezone.now()
        task.claimed_by, task.lease_until = "", None
        task.save(update_fields=["status", "error", "claimed_by", "lease_until", "completed_at"])
        return task


def release(task_id: int, *, agent: str) -> AgentTask:
    """Hand a claimed task back untouched (the attempt is not counted against it)."""
    with transaction.atomic():
        task = _held(task_id, agent)
        task.status, task.claimed_by, task.lease_until = S.QUEUED, "", None
        task.attempts = max(0, task.attempts - 1)
        task.save(update_fields=["status", "claimed_by", "lease_until", "attempts"])
        return task


def extend(task_id: int, *, agent: str, minutes: int | None = None) -> AgentTask:
    with transaction.atomic():
        task = _held(task_id, agent)
        task.lease_until = timezone.now() + timedelta(minutes=minutes or settings.TASK_LEASE_MINUTES)
        task.save(update_fields=["lease_until"])
        return task


# ── operators' versions (the console) ──

MAX_BATCH = 50
REQUEUEABLE = (S.FAILED, S.CANCELLED)


def _note(task: AgentTask, by: str, text: str):
    task.error = (task.error + "\n" if task.error else "") + f"{by}: {text}"


def _stuck(task_id: int, holder: str) -> AgentTask:
    task = AgentTask.objects.select_for_update().filter(pk=task_id).first()
    if task is None:
        raise TaskError(f"no task #{task_id}")
    if task.status != S.CLAIMED or task.claimed_by != holder:
        raise TaskError(f"task #{task_id} is {task.status}" + (f", claimed by {task.claimed_by}" if task.claimed_by else "")
                        + f": no longer the lease held by {holder} that the page showed")
    return task


def release_stuck(task_id: int, *, holder: str, by: str, reason: str) -> AgentTask:
    """An operator frees a lease `holder` still has (a crashed or stuck agent): back to the queue. The attempt stays
    counted (the agent did try), unlike an agent's own `release`."""
    with transaction.atomic():
        task = _stuck(task_id, holder)
        _note(task, by, f"released the lease held by {holder}: {reason}")
        task.status, task.claimed_by, task.lease_until = S.QUEUED, "", None
        task.save(update_fields=["status", "claimed_by", "lease_until", "error"])
        return task


def extend_for(task_id: int, *, holder: str, by: str, minutes: int, reason: str) -> AgentTask:
    """An operator gives `holder` more time: the lease runs `minutes` from now (or from its end, if later)."""
    if not 1 <= minutes <= 24 * 60:
        raise TaskError("extend by 1 to 1440 minutes")
    with transaction.atomic():
        task = _stuck(task_id, holder)
        start = max(timezone.now(), task.lease_until or timezone.now())
        task.lease_until = start + timedelta(minutes=minutes)
        _note(task, by, f"extended {holder}'s lease by {minutes} min to {task.lease_until:%Y-%m-%d %H:%M} UTC: {reason}")
        task.save(update_fields=["lease_until", "error"])
        return task


def _batch(ids) -> list[int]:
    ids = sorted({int(i) for i in ids})
    if not ids:
        raise TaskError("no tasks selected")
    if len(ids) > MAX_BATCH:
        raise TaskError(f"{len(ids)} tasks selected; at most {MAX_BATCH} at once")
    return ids


def requeue(ids, *, by: str, reason: str) -> dict:
    """Failed or cancelled tasks back to the queue with their attempts reset. Others are skipped. → {"done": [ids],
    "skipped": {id: why}}"""
    ids = _batch(ids)
    out = {"done": [], "skipped": {}}
    with transaction.atomic():
        tasks = {t.pk: t for t in AgentTask.objects.select_for_update().filter(pk__in=ids)}
        opened = set()
        for i in ids:
            t = tasks.get(i)
            if t is None or t.status not in REQUEUEABLE:
                out["skipped"][i] = "gone" if t is None else f"is {t.status}"
                continue
            if t.dedupe_key and (t.kind, t.dedupe_key) in opened:
                out["skipped"][i] = "another selected task has its dedupe key"
                continue
            if t.dedupe_key and AgentTask.objects.filter(kind=t.kind, dedupe_key=t.dedupe_key, status__in=[S.QUEUED, S.CLAIMED]).exclude(pk=t.pk).exists():
                out["skipped"][i] = "another open task has its dedupe key"
                continue
            _note(t, by, f"requeued (was {t.status}, {t.attempts} attempts): {reason}")
            t.status, t.attempts, t.claimed_by, t.lease_until, t.completed_at = S.QUEUED, 0, "", None, None
            t.save(update_fields=["status", "attempts", "claimed_by", "lease_until", "completed_at", "error"])
            opened.add((t.kind, t.dedupe_key))
            out["done"].append(i)
    return out


def cancel(ids, *, by: str, reason: str) -> dict:
    """Queued tasks, or claimed ones whose lease has run out, cancelled (a live lease is the agent's: release it
    first). → {"done": [ids], "skipped": {id: why}}"""
    ids = _batch(ids)
    now = timezone.now()
    out = {"done": [], "skipped": {}}
    with transaction.atomic():
        tasks = {t.pk: t for t in AgentTask.objects.select_for_update().filter(pk__in=ids)}
        for i in ids:
            t = tasks.get(i)
            live = t is not None and t.status == S.CLAIMED and t.lease_until and t.lease_until >= now
            if t is None or live or t.status not in (S.QUEUED, S.CLAIMED):
                out["skipped"][i] = "gone" if t is None else ("its lease is live" if live else f"is {t.status}")
                continue
            _note(t, by, f"cancelled (was {t.status}): {reason}")
            t.status, t.claimed_by, t.lease_until, t.completed_at = S.CANCELLED, "", None, now
            t.save(update_fields=["status", "claimed_by", "lease_until", "completed_at", "error"])
            out["done"].append(i)
    return out


def as_json(task: AgentTask) -> dict:
    return {
        "id": task.pk, "kind": task.kind, "status": task.status, "priority": task.priority,
        "target": {
            "entry": task.target_entry.slug if task.target_entry_id else None,
            "claim": task.target_claim_id, "candidate": task.target_candidate_id, "proposal": task.target_proposal_id,
            "ref": task.target_ref or None,
        },
        "payload": task.payload, "claimed_by": task.claimed_by or None,
        "lease_until": task.lease_until.isoformat() if task.lease_until else None,
        "attempts": task.attempts, "max_attempts": task.max_attempts, "created_by": task.created_by,
        "result": task.result, "error": task.error or None,
    }
