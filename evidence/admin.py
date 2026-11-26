from django.contrib import admin

from revisions.admin_mixins import RevisedAdmin

from .models import Citation, Claim, Evidence, Publisher


@admin.register(Publisher)
class PublisherAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["domain", "name", "tier", "fetch_policy", "license", "citation_count"]
    list_filter = ["tier", "fetch_policy"]
    list_editable = ["tier", "fetch_policy"]
    search_fields = ["domain", "name", "access_notes"]

    def get_queryset(self, request):
        from django.db.models import Count

        return super().get_queryset(request).annotate(n=Count("citations"))

    @admin.display(ordering="n", description="citations")
    def citation_count(self, obj):
        return obj.n


class EvidenceInline(admin.TabularInline):
    model = Evidence
    extra = 0
    raw_id_fields = ["citation"]
    fields = ["position", "citation", "cited_title", "stance", "excerpt", "method", "checked_by", "checked_at"]


@admin.register(Citation)
class CitationAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["url", "title", "publisher", "kind", "http_status", "last_checked_at"]
    list_filter = ["kind", "publisher__tier", "http_status", ("last_checked_at", admin.EmptyFieldListFilter)]
    search_fields = ["url", "title", "publisher__domain"]
    raw_id_fields = ["publisher"]


@admin.register(Claim)
class ClaimAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["entry", "field", "key", "status", "confidence", "recheck_after", "updated_at"]
    list_filter = ["status", "field", "entry__kind", ("recheck_after", admin.EmptyFieldListFilter)]
    search_fields = ["entry__slug"]
    raw_id_fields = ["entry"]
    readonly_fields = ["status", "confidence"]
    inlines = [EvidenceInline]


@admin.register(Evidence)
class EvidenceAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["claim", "citation", "stance", "method", "checked_by", "checked_at"]
    list_filter = ["stance", "method", "citation__publisher__tier", ("checked_at", admin.EmptyFieldListFilter)]
    search_fields = ["claim__entry__slug", "citation__url", "excerpt"]
    raw_id_fields = ["claim", "citation"]
