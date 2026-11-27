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
        FILL_GAP = "fill_gap", "fill a branch's gap in a content wave's window"

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


class Round(models.Model):
    """One agent round: a session of agents working the queue, an independent review, its edit file applied, and the
    release that carried it (docs/adr/0035-automated-daily-rounds.md). The daily cloud routine (the `run-round`
    skill) records each run here over the agent API (`POST rounds`, `PATCH rounds/<id>`); the console's Work page
    shows them. Not canonical: a round is a record of work, like a task. What it changed is in the Revisions its edit
    file wrote (the `edits_apply` OpsAction linked to it names their transaction) and in the release."""

    class Trigger(models.TextChoices):
        SCHEDULE = "schedule", "scheduled"
        MANUAL = "manual", "started by hand"

    class Status(models.TextChoices):
        RUNNING = "running", "Running"              # agents at work
        REVIEWING = "reviewing", "Reviewing"        # independent reviewers at work
        RELEASE_READY = "release_ready", "Release ready"  # the edit file is applied and every release gate passes
        PUBLISHED = "published", "Published"        # a release carries it (releases/publish sets this)
        HELD = "held", "Held for review"            # finished without a release: something needs the owner
        FINISHED = "finished", "Completed"          # finished; nothing to publish
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"              # an operator skipped this scheduled round

    OPEN = (Status.RUNNING, Status.REVIEWING, Status.RELEASE_READY)
    TERMINAL = (Status.PUBLISHED, Status.HELD, Status.FINISHED, Status.FAILED, Status.SKIPPED)

    started_at = models.DateTimeField(db_index=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    trigger = models.CharField(max_length=10, choices=Trigger.choices)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.RUNNING)
    started_by = models.CharField(max_length=200, help_text='The round token\'s actor, "agent:<name>".')
    plan = models.JSONField(default=dict, blank=True, help_text='The planned mix: {"mix": {kind: tasks}, "roles": {role: agents}, …}.')
    agents = models.JSONField(default=list, blank=True, help_text='[{"name", "role", "kinds", "claimed", "completed", "failed", "released"}]')
    tasks = models.JSONField(default=dict, blank=True, help_text='{kind: {"claimed", "completed", "failed", "released"}}')
    drafts = models.JSONField(default=list, blank=True, help_text="The slugs the agents drafted (in review).")
    verdicts = models.JSONField(default=dict, blank=True, help_text='{"approve", "approve_with_edits", "hold", "reject"}: the reviewers\' counts.')
    edit_ops = models.JSONField(default=dict, blank=True, help_text="{op: count} applied by edits/apply.")
    release = models.ForeignKey("publish.Release", null=True, blank=True, on_delete=models.SET_NULL, related_name="rounds")
    summary = models.TextField(blank=True, help_text="The short summary the routine posts at the end.")
    notes = models.TextField(blank=True)
    history = models.JSONField(default=list, blank=True, help_text='Every change: [{"at", "by", "what", "status"}].')
    idempotency_key = models.CharField(max_length=64, null=True, blank=True, unique=True, help_text="sha256 of the actor and the client's key.")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-started_at", "-id"]
        constraints = [
            models.CheckConstraint(condition=Q(trigger__in=["schedule", "manual"]), name="round_trigger_valid"),
            models.CheckConstraint(condition=Q(status__in=["running", "reviewing", "release_ready", "published", "held", "finished", "failed", "skipped"]),
                                   name="round_status_valid"),
            models.CheckConstraint(condition=Q(started_by__regex=r"^(agent|human):"), name="round_by_agent_or_human"),
        ]

    def __str__(self):
        return f"round #{self.pk} {self.started_at:%Y-%m-%d} [{self.status}]"

    @property
    def open(self) -> bool:
        return self.status in self.OPEN

    @property
    def duration(self):
        return (self.finished_at - self.started_at) if self.finished_at else None
