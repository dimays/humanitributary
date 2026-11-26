"""The agents' queue (docs/adr/0003). Deterministic jobs enqueue tasks; Claude agents claim them when they run, do
the judgment work (write an event, verify a claim, review a proposal) and complete them with a result.

A claim is a lease: `claimed_by` holds it until `lease_until`, after which another agent may take the task over.
Claiming uses `SELECT … FOR UPDATE SKIP LOCKED` (work/queue.py), so any number of agents can drain the queue at once
without taking the same task.
"""

from django.contrib.postgres.indexes import GinIndex
from django.db import models
from django.db.models import Q


class AgentTask(models.Model):
    class Kind(models.TextChoices):
        WRITE_EVENT = "write_event", "write an event from a candidate"
        VERIFY_CLAIM = "verify_claim", "verify a claim against its citations"
        ENRICH = "enrich", "write why it matters and connections"
        AUDIT = "audit", "audit an entry end to end"
        REVIEW_BRANCH_PROPOSAL = "review_branch_proposal", "review a branch proposal"
        RECHECK_CITATION = "recheck_citation", "re-read a citation whose page changed or broke"
        MAP_BRANCH_ENTITIES = "map_branch_entities", "find a branch's Wikidata items (routing)"

    class Status(models.TextChoices):
        QUEUED = "queued"
        CLAIMED = "claimed"
        DONE = "done"
        FAILED = "failed"
        CANCELLED = "cancelled"

    kind = models.CharField(max_length=30, choices=Kind.choices, db_index=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.QUEUED)
    priority = models.IntegerField(default=0, help_text="Higher runs first.")
    # What it is about: at most one of these is usually set; target_ref holds anything else (a URL, a QID).
    target_entry = models.ForeignKey("timeline.Entry", null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks")
    target_claim = models.ForeignKey("evidence.Claim", null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks")
    target_candidate = models.ForeignKey("ingest.Candidate", null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks")
    target_proposal = models.ForeignKey("governance.BranchProposal", null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks")
    target_ref = models.CharField(max_length=1000, blank=True)
    payload = models.JSONField(default=dict, blank=True, help_text="Everything the agent needs that isn't in the target.")
    dedupe_key = models.CharField(max_length=300, blank=True, help_text="A job's key for the task: at most one open task per (kind, key).")
    not_before = models.DateTimeField(null=True, blank=True, help_text="Not offered before this time.")
    claimed_by = models.CharField(max_length=200, blank=True, help_text='"agent:<name>".')
    claimed_at = models.DateTimeField(null=True, blank=True)
    lease_until = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0, help_text="Times claimed.")
    max_attempts = models.PositiveSmallIntegerField(default=3)
    result = models.JSONField(null=True, blank=True)
    error = models.TextField(blank=True)
    created_by = models.CharField(max_length=200, help_text='The job (or person) that queued it: "job:<name>".')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-priority", "created_at", "id"]
        indexes = [
            models.Index(fields=["kind", "-priority", "created_at"], condition=Q(status="queued"), name="task_queued_idx"),
            models.Index(fields=["lease_until"], condition=Q(status="claimed"), name="task_lease_idx"),
            GinIndex(fields=["payload"], name="task_payload_gin"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(status__in=["queued", "claimed", "done", "failed", "cancelled"]), name="task_status_valid"),
            models.CheckConstraint(
                condition=~Q(status="claimed") | (Q(claimed_by__gt="") & Q(lease_until__isnull=False)),
                name="task_claimed_has_lease",
            ),
            models.UniqueConstraint(
                fields=["kind", "dedupe_key"],
                condition=Q(status__in=["queued", "claimed"]) & ~Q(dedupe_key=""),
                name="task_one_open_per_dedupe_key",
            ),
        ]

    def __str__(self):
        return f"#{self.pk} {self.kind} [{self.status}]"
