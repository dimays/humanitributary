from django.contrib import admin

from .models import AgentTask


@admin.register(AgentTask)
class AgentTaskAdmin(admin.ModelAdmin):
    list_display = ["id", "kind", "status", "priority", "target_entry", "claimed_by", "lease_until", "attempts", "created_by", "created_at"]
    list_filter = ["status", "kind", "created_by", "claimed_by"]
    search_fields = ["target_entry__slug", "target_ref", "dedupe_key", "error"]
    raw_id_fields = ["target_entry", "target_claim", "target_candidate", "target_proposal"]
    date_hierarchy = "created_at"
