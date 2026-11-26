"""The audit log: one Revision per changed row in a canonical table (timeline and evidence), written by a Postgres
trigger, never by application code (docs/adr/0006).

A canonical write is only accepted inside `revisions.revising(actor, reason, task)`, which sets the transaction's
actor; the trigger refuses any insert, update or delete without one, then records the row before and after. So the
log is complete by construction: the admin, the import, an agent's shell session and raw SQL all leave a Revision or
fail. Revisions are append-only (a second trigger refuses updates and deletes).
"""

from django.contrib.postgres.fields import ArrayField
from django.db import models

ACTOR_KINDS = [("agent", "Agent"), ("human", "Human"), ("job", "Job")]


class Revision(models.Model):
    class Action(models.TextChoices):
        INSERT = "insert"
        UPDATE = "update"
        DELETE = "delete"

    at = models.DateTimeField(db_index=True, help_text="Transaction time of the change.")
    txid = models.BigIntegerField(db_index=True, help_text="Postgres transaction id: every row changed together shares it.")
    actor = models.CharField(max_length=200, db_index=True, help_text='Who: "agent:<name>", "human:<username>" or "job:<command>".')
    actor_kind = models.CharField(max_length=10, choices=ACTOR_KINDS)
    table_name = models.CharField(max_length=100, db_index=True)
    row_pk = models.CharField(max_length=100, db_index=True)
    action = models.CharField(max_length=10, choices=Action.choices)
    before = models.JSONField(null=True, blank=True)
    after = models.JSONField(null=True, blank=True)
    changed = ArrayField(models.CharField(max_length=100), default=list, blank=True, help_text="Columns an update changed.")
    reason = models.TextField(blank=True)
    # No FK constraint: tasks may be archived, and a revision must never be rewritten or blocked by one.
    task = models.ForeignKey("work.AgentTask", null=True, blank=True, on_delete=models.DO_NOTHING, db_constraint=False, related_name="revisions")

    class Meta:
        ordering = ["-id"]
        indexes = [models.Index(fields=["table_name", "row_pk", "-id"], name="revision_row_idx")]
        constraints = [
            models.CheckConstraint(condition=models.Q(actor_kind__in=["agent", "human", "job"]), name="revision_actor_kind_valid"),
            models.CheckConstraint(condition=models.Q(action__in=["insert", "update", "delete"]), name="revision_action_valid"),
        ]

    def __str__(self):
        return f"{self.at:%Y-%m-%d %H:%M} {self.actor} {self.action} {self.table_name}#{self.row_pk}"
