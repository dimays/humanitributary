"""Agent tokens (docs/adr/0017-agent-api.md). Agents reach the queue and the read endpoints over HTTP with a
bearer token; they never hold database credentials. A token belongs to one agent name (its actor is
`agent:<name>`), is stored only as a sha256 hash, and is scoped to the task kinds it may claim, and to the operation scopes
(`review`, `publish`, `round`: ADR 0035) it was given by name.

Not canonical: tokens are access control, not content (no audit trigger; `created_by` says who made one).
"""

from django.db import models
from django.db.models import Q

# Scopes that are not task kinds (ADR 0035): what a round's own tokens may do besides claiming tasks. `*` never
# grants them; each must be named when the token is made.
OPERATION_SCOPES = {
    "review": "check and apply an edit file (POST edits/check, edits/apply)",
    "publish": "run the release gates and publish (POST releases/check, releases/publish)",
    "round": "record agent rounds (POST rounds, PATCH rounds/<id>)",
}


class AgentToken(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text='The agent\'s name: its actor is "agent:<name>".')
    prefix = models.CharField(max_length=16, help_text="The token's first characters, to recognize it in a list (not secret).")
    token_hash = models.CharField(max_length=64, unique=True, help_text="sha256 of the token. The token itself is shown once, when made.")
    scopes = models.JSONField(default=list, help_text='Task kinds it may claim and complete, or ["*"] for all; and operation scopes (review, publish, round), named. Every token may read.')
    created_by = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    # The rate limit's fixed window (agentapi/auth.py updates both in one statement, so it holds across processes).
    window_start = models.DateTimeField(null=True, blank=True)
    window_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["name"]
        constraints = [models.CheckConstraint(condition=Q(name__regex=r"^[\w.@+-]{1,100}$"), name="agenttoken_name_valid")]

    def __str__(self):
        return f"agent:{self.name} ({self.prefix}…){' revoked' if self.revoked_at else ''}"

    @property
    def actor(self) -> str:
        return f"agent:{self.name}"

    def may(self, kind: str) -> bool:
        """May this token claim and complete tasks of `kind`? (`*`: every kind with a result schema.)"""
        return kind not in OPERATION_SCOPES and ("*" in self.scopes or kind in self.scopes)

    def has(self, scope: str) -> bool:
        """An operation scope (OPERATION_SCOPES): only when named, never through `*`."""
        return scope in OPERATION_SCOPES and scope in self.scopes
