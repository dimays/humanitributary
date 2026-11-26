from django.contrib import admin

from .models import BranchEntity, Candidate, Document, DocumentEntity, DocumentVersion, Entity, Feed, FetchRun


class FetchRunInline(admin.TabularInline):
    model = FetchRun
    extra = 0
    fields = ["started_at", "finished_at", "status", "counts", "error"]
    readonly_fields = fields
    ordering = ["-started_at"]
    max_num = 0


@admin.register(Feed)
class FeedAdmin(admin.ModelAdmin):
    list_display = ["name", "publisher", "kind", "interval_minutes", "enabled", "last_run_at", "next_run_at"]
    list_filter = ["kind", "enabled", "publisher__fetch_policy"]
    search_fields = ["name", "url"]
    raw_id_fields = ["publisher"]
    inlines = [FetchRunInline]


@admin.register(FetchRun)
class FetchRunAdmin(admin.ModelAdmin):
    list_display = ["feed", "started_at", "finished_at", "status", "counts", "http_status"]
    list_filter = ["status", "feed"]
    date_hierarchy = "started_at"


class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 0
    max_num = 0
    readonly_fields = ["version", "content_hash", "fetched_at", "http_status", "raw_path", "title"]


class DocumentEntityInline(admin.TabularInline):
    model = DocumentEntity
    extra = 0
    raw_id_fields = ["entity"]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "canonical_url", "publisher", "fetched_at", "http_status", "version", "language"]
    list_filter = ["http_status", "language", "feed", "publisher"]
    search_fields = ["title", "canonical_url", "content_hash"]
    raw_id_fields = ["feed", "publisher"]
    date_hierarchy = "fetched_at"
    inlines = [DocumentVersionInline, DocumentEntityInline]


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ["document", "version", "content_hash", "fetched_at", "http_status"]
    raw_id_fields = ["document"]


@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    list_display = ["qid", "label", "kind", "lat", "lon"]
    list_filter = ["kind"]
    search_fields = ["qid", "label", "description"]


@admin.register(DocumentEntity)
class DocumentEntityAdmin(admin.ModelAdmin):
    list_display = ["document", "entity", "salience", "mentions"]
    raw_id_fields = ["document", "entity"]


@admin.register(BranchEntity)
class BranchEntityAdmin(admin.ModelAdmin):
    list_display = ["branch", "entity", "role", "weight", "created_by"]
    list_filter = ["role", "branch__region"]
    search_fields = ["branch__slug", "entity__qid", "entity__label"]
    raw_id_fields = ["branch", "entity"]


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ["title", "kind", "when_text", "top_branch", "duplicate_of", "similarity", "priority", "status", "created_at"]
    list_filter = ["status", "kind", "precision", ("duplicate_of", admin.EmptyFieldListFilter), "top_branch__region"]
    search_fields = ["title", "summary", "cluster_key"]
    raw_id_fields = ["top_branch", "target_entry", "duplicate_of", "result_entry"]
    filter_horizontal = ["documents", "entities"]
