from django.contrib import admin

from .models import AgentToken


@admin.register(AgentToken)
class AgentTokenAdmin(admin.ModelAdmin):
    """Read-only here: tokens are made with `manage.py agent_token create` (the token is shown once, never stored)."""

    list_display = ["name", "prefix", "scopes", "created_by", "created_at", "last_used_at", "revoked_at"]
    readonly_fields = ["name", "prefix", "token_hash", "scopes", "created_by", "created_at", "last_used_at", "revoked_at", "window_start", "window_count"]

    def has_add_permission(self, request):
        return False
