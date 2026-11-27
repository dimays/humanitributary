"""OpsAction in the admin: read-only, since it is an audit record (ADR 0028)."""

from django.contrib import admin

from .models import OpsAction


@admin.register(OpsAction)
class OpsActionAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "kind", "target", "status", "requested_by", "runs_in")
    list_filter = ("kind", "status", "runs_in")
    search_fields = ("target", "reason", "requested_by", "idempotency_key")
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
