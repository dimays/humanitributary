"""Branch governance (tables only for now, docs/adr/0003): deterministic jobs measure every branch and, by fixed
rules, propose splits, merges, renames, new branches and endings; an agent or the owner decides each proposal.

Not canonical: a proposal changes nothing until it is applied through the timeline's services (which leave Revisions).
"""

from django.db import models
from django.db.models import Q


class BranchMetric(models.Model):
    """A snapshot of one branch's shape, computed by a job (counts per time window, density, spread, link degree)."""

    branch = models.ForeignKey("timeline.Branch", on_delete=models.CASCADE, related_name="metrics")
    computed_at = models.DateTimeField(db_index=True)
    rules_version = models.CharField(max_length=40, blank=True, help_text="Which version of the metric code produced it.")
    metrics = models.JSONField(
        default=dict,
        help_text='e.g. {"events": 42, "per_window": {"1925-1930": 2, …}, "density": …, "region_spread": …, "degree": {"in": 3, "out": 1}}',
    )

    class Meta:
        ordering = ["-computed_at"]
        indexes = [models.Index(fields=["branch", "-computed_at"], name="branchmetric_latest_idx")]

    def __str__(self):
        return f"{self.branch.slug} @ {self.computed_at:%Y-%m-%d}"


class BranchProposal(models.Model):
    class Kind(models.TextChoices):
        SPLIT = "split"
        MERGE = "merge"
        RENAME = "rename"
        NEW = "new"
        END = "end"

    class Status(models.TextChoices):
        PROPOSED = "proposed"
        ACCEPTED = "accepted"
        REJECTED = "rejected"
        APPLIED = "applied"
        WITHDRAWN = "withdrawn"

    kind = models.CharField(max_length=10, choices=Kind.choices)
    branch = models.ForeignKey("timeline.Branch", null=True, blank=True, on_delete=models.CASCADE, related_name="proposals", help_text="The branch it concerns (empty for a new branch).")
    other_branches = models.ManyToManyField("timeline.Branch", blank=True, related_name="proposals_involving", help_text="For a merge: the others.")
    rule_id = models.CharField(max_length=80, db_index=True, help_text='The rule that fired, e.g. "dense-subcluster-v1".')
    summary = models.TextField(blank=True)
    evidence = models.JSONField(default=dict, blank=True, help_text="What the rule saw: metrics, event ids, candidate ids.")
    payload = models.JSONField(default=dict, blank=True, help_text="The change proposed: a new name, dates, which events move.")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PROPOSED, db_index=True)
    created_by = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_by = models.CharField(max_length=200, blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    decision_note = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(condition=Q(kind__in=["split", "merge", "rename", "new", "end"]), name="branchproposal_kind_valid"),
            models.CheckConstraint(condition=Q(status__in=["proposed", "accepted", "rejected", "applied", "withdrawn"]), name="branchproposal_status_valid"),
            models.CheckConstraint(condition=Q(kind="new") | Q(branch__isnull=False), name="branchproposal_branch_unless_new"),
        ]

    def __str__(self):
        return f"{self.kind} {self.branch.slug if self.branch_id else '(new)'} [{self.status}]"
