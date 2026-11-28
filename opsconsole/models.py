"""The operations console's one table: `OpsAction`, the audit row of every intervention made from /ops/ (ADR 0028).

None of the console's actions writes a canonical row itself (the queue, job runs, the release pointer and `JobState`
are working state, outside the Revision log), so this table is their record: who asked, for what, why, what the
confirmation page showed, and what happened. Rows are only ever added and moved along their status; the admin shows
them read-only.

Since ADR 0035 the agent API records its operations here too (an edit file checked or applied, a release checked or
published), as `agent:<name>` with `runs_in="api"`, so one log and one publish lock cover both doors.

The `ops_operator` permission lives here: staff see the console, only holders of it (and superusers) act.
"""

from django.db import models
from django.db.models import Q


class OpsAction(models.Model):
    class Kind(models.TextChoices):
        RUN_JOB = "run_job", "run a job now"
        RETRY_RUN = "retry_run", "retry a failed job run"
        RELEASE_LEASE = "release_lease", "release a stuck lease"
        EXTEND_LEASE = "extend_lease", "extend a lease"
        REQUEUE_TASKS = "requeue_tasks", "requeue tasks"
        CANCEL_TASKS = "cancel_tasks", "cancel tasks"
        ADVANCE_WAVE = "advance_wave", "advance the content wave"
        PUBLISH_CHECK = "publish_check", "publish --check"
        PUBLISH = "publish", "publish a release"
        ROLLBACK = "rollback", "roll back to an earlier release"
        PAUSE_JOB = "pause_job", "pause a job"
        RESUME_JOB = "resume_job", "resume a job"
        PAUSE_ROUNDS = "pause_rounds", "pause the scheduled rounds"
        RESUME_ROUNDS = "resume_rounds", "resume the scheduled rounds"
        SKIP_ROUND = "skip_round", "skip the next scheduled round"
        ROUND_SIZE = "round_size", "set the round size"
        REVIEW_HELD = "review_held", "send held drafts to the next review"
        EDITS_CHECK = "edits_check", "check an edit file (agent API)"
        EDITS_APPLY = "edits_apply", "apply an edit file (agent API)"
        DISMISS_RUN = "dismiss_run", "dismiss a failed run from Needs attention"

    class Status(models.TextChoices):
        PENDING = "pending"      # waiting for the worker
        RUNNING = "running"
        DONE = "done"
        FAILED = "failed"        # refused or raised: `error` says why
        CANCELLED = "cancelled"  # withdrawn before the worker took it

    class RunsIn(models.TextChoices):
        REQUEST = "request"  # quick, single-transaction changes, done in the web request
        WORKER = "worker"    # long or heavy ones, picked up by the worker between jobs (opsconsole/worker.py)
        API = "api"          # an agent's call to the agent API (edits, releases: ADR 0035), done in that request

    kind = models.CharField(max_length=30, choices=Kind.choices, db_index=True)
    target = models.CharField(max_length=300, blank=True, help_text='What it acts on: "job:link_health", "task:412", "release:2026.11.26.2" …')
    params = models.JSONField(default=dict, blank=True, help_text="Everything the confirmation page showed and the action uses.")
    reason = models.TextField(help_text="Why, in the operator's words (required).")
    requested_by = models.CharField(max_length=200, db_index=True, help_text='"human:<username>".')
    idempotency_key = models.CharField(max_length=64, unique=True, help_text="Minted by the confirmation page: a second submit finds this row.")
    runs_in = models.CharField(max_length=10, choices=RunsIn.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    check_output = models.TextField(blank=True, help_text="The dry run, check or preview the confirmation page showed.")
    output = models.TextField(blank=True, help_text="What the action printed while it ran (secrets masked).")
    result = models.JSONField(null=True, blank=True)
    error = models.TextField(blank=True)
    round = models.ForeignKey("work.Round", null=True, blank=True, on_delete=models.SET_NULL, related_name="actions",
                              help_text="The agent round this action belongs to (agent API calls that name one).")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        permissions = [("ops_operator", "Can act from the operations console (run jobs, free leases, publish, roll back …)")]
        indexes = [models.Index(fields=["created_at"], condition=Q(status__in=["pending", "running"]), name="opsaction_open_idx")]
        constraints = [
            models.CheckConstraint(condition=Q(status__in=["pending", "running", "done", "failed", "cancelled"]), name="opsaction_status_valid"),
            models.CheckConstraint(condition=~Q(reason=""), name="opsaction_reason_required"),
            # A person from the console, or an agent through the agent API (ADR 0035): never a job.
            models.CheckConstraint(condition=Q(requested_by__startswith="human:") | Q(requested_by__startswith="agent:"), name="opsaction_by_a_human_or_agent"),
        ]

    def __str__(self):
        return f"#{self.pk} {self.kind} {self.target} ({self.status})"

    @property
    def open(self) -> bool:
        return self.status in (self.Status.PENDING, self.Status.RUNNING)
