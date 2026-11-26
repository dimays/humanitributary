"""Claiming, completing and releasing agent tasks (docs/adr/0003).

Leases: `next_task(claim=True)` takes the best available task under `SELECT … FOR UPDATE SKIP LOCKED`, so two agents
asking at once get different tasks, and holds it until `lease_until`. A task whose lease ran out is available again
(its next claim counts another attempt); past `max_attempts` it fails instead of being offered. Only the agent holding
a claim may complete, fail, release or extend it, and only while no one else has taken it over.
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
