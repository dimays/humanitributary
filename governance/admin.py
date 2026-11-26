from django.contrib import admin

from .models import BranchMetric, BranchProposal


@admin.register(BranchMetric)
class BranchMetricAdmin(admin.ModelAdmin):
    list_display = ["branch", "computed_at", "rules_version"]
    list_filter = ["rules_version", "branch__region"]
    search_fields = ["branch__slug"]
    raw_id_fields = ["branch"]
    date_hierarchy = "computed_at"


@admin.register(BranchProposal)
class BranchProposalAdmin(admin.ModelAdmin):
    list_display = ["kind", "branch", "rule_id", "status", "created_by", "created_at", "decided_by"]
    list_filter = ["kind", "status", "rule_id"]
    search_fields = ["branch__slug", "summary", "rule_id"]
    raw_id_fields = ["branch"]
    filter_horizontal = ["other_branches"]
