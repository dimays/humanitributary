from django.contrib import admin

from .models import BranchEntity, Candidate, Document, DocumentEntity, DocumentVersion, Entity, Feed, FetchRun, JobState, LinkCheck, SuggestedSource, UnratedLookup, WikiTitle


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
    list_display = ["job", "feed", "started_at", "finished_at", "status", "counts", "http_status"]
    list_filter = ["status", "job", "feed"]
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
    list_display = ["qid", "label", "kind", "enwiki_title", "pageviews_30d", "lat", "lon", "resolved_at"]
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
    search_fields = ["title", "summary", "cluster_key", "source_key"]
    raw_id_fields = ["top_branch", "target_entry", "duplicate_of", "result_entry"]
    filter_horizontal = ["documents", "entities"]


@admin.register(WikiTitle)
class WikiTitleAdmin(admin.ModelAdmin):
    list_display = ["title", "target", "qid", "missing", "resolved_at"]
    search_fields = ["title", "qid"]


@admin.register(LinkCheck)
class LinkCheckAdmin(admin.ModelAdmin):
    list_display = ["citation", "checked_at", "method", "http_status", "outcome", "archive_url"]
    list_filter = ["outcome", "method"]
    search_fields = ["citation__url", "final_url"]
    raw_id_fields = ["citation"]
    date_hierarchy = "checked_at"


@admin.register(SuggestedSource)
class SuggestedSourceAdmin(admin.ModelAdmin):
    list_display = ["adapter", "title", "url", "score", "status", "claim", "candidate", "created_at"]
    list_filter = ["adapter", "status", "kind"]
    search_fields = ["title", "url"]
    raw_id_fields = ["claim", "candidate"]


@admin.register(JobState)
class JobStateAdmin(admin.ModelAdmin):
    list_display = ["name", "updated_at"]


@admin.register(UnratedLookup)
class UnratedLookupAdmin(admin.ModelAdmin):
    """The unrated domains agents asked GET policy about (ADR 0045): rate the frequent ones (Publisher), terms first."""

    list_display = ["domain", "lookups", "first_seen", "last_seen", "last_actor", "example_url"]
    search_fields = ["domain"]
    readonly_fields = ["domain", "lookups", "first_seen", "last_seen", "example_url", "last_actor"]
