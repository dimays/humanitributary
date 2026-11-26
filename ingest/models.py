"""Collection (docs/adr/0003): scheduled, deterministic jobs read feeds into documents, resolve the entities they
mention, and propose candidates for the timeline. No LLM calls here: agents pick candidates up from the work queue.

    Feed ─< FetchRun
    Feed ─< Document ─< DocumentVersion
    Document >─< Entity (DocumentEntity, with salience)
    timeline.Branch >─< Entity (BranchEntity: routes new material to branches)
    Candidate >─< Document, Entity;  Candidate → possible duplicate timeline.Event

Not canonical: these tables are working state and change without Revisions. Raw bytes live under `var/raw/` by
content hash, never in the database or in git.
"""

from django.contrib.postgres.indexes import GinIndex, OpClass
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower

from timeline.models import Precision


class Feed(models.Model):
    class Kind(models.TextChoices):
        API = "api"
        RSS = "rss"
        SITEMAP = "sitemap"
        HTML = "html"

    publisher = models.ForeignKey("evidence.Publisher", on_delete=models.PROTECT, related_name="feeds")
    name = models.CharField(max_length=200)
    url = models.URLField(max_length=1000, unique=True)
    kind = models.CharField(max_length=10, choices=Kind.choices)
    interval_minutes = models.PositiveIntegerField(default=1440, help_text="How often the scheduler runs it.")
    enabled = models.BooleanField(default=True)
    config = models.JSONField(default=dict, blank=True, help_text="Kind-specific settings (query, selectors, page size …).")
    etag = models.CharField(max_length=300, blank=True)
    last_modified = models.CharField(max_length=100, blank=True, help_text="The Last-Modified header, as sent back in If-Modified-Since.")
    cursor = models.JSONField(default=dict, blank=True, help_text="Where the last run stopped (API continuation token, last item date …).")
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        constraints = [models.CheckConstraint(condition=Q(kind__in=["api", "rss", "sitemap", "html"]), name="feed_kind_valid")]

    def __str__(self):
        return self.name


class FetchRun(models.Model):
    class Status(models.TextChoices):
        RUNNING = "running"
        OK = "ok"
        PARTIAL = "partial"
        FAILED = "failed"

    feed = models.ForeignKey(Feed, on_delete=models.CASCADE, related_name="runs")
    started_at = models.DateTimeField(db_index=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.RUNNING)
    counts = models.JSONField(default=dict, blank=True, help_text='{"fetched": …, "new": …, "changed": …, "unchanged": …, "errors": …}')
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    error = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]
        constraints = [models.CheckConstraint(condition=Q(status__in=["running", "ok", "partial", "failed"]), name="fetchrun_status_valid")]

    def __str__(self):
        return f"{self.feed} {self.started_at:%Y-%m-%d %H:%M} {self.status}"


class Document(models.Model):
    """A fetched page or API record, by canonical URL: its latest version here, every version in DocumentVersion."""

    canonical_url = models.URLField(max_length=1000, unique=True)
    url = models.URLField(max_length=1000, help_text="As fetched.")
    feed = models.ForeignKey(Feed, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents")
    publisher = models.ForeignKey("evidence.Publisher", null=True, blank=True, on_delete=models.PROTECT, related_name="documents")
    fetched_at = models.DateTimeField(db_index=True)
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    content_hash = models.CharField(max_length=64, db_index=True, help_text="sha256 of the raw bytes; the raw file is var/raw/<hash[:2]>/<hash>.")
    raw_path = models.CharField(max_length=300, blank=True, help_text="Relative to VAR_DIR.")
    title = models.CharField(max_length=500, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    language = models.CharField(max_length=20, blank=True)
    license = models.CharField(max_length=200, blank=True)
    extracted_text = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True, help_text="wikilinks, categories, og: tags, Wikidata QID …")
    version = models.PositiveIntegerField(default=1, help_text="Bumped each time the content hash changes.")
    first_seen_at = models.DateTimeField(auto_now_add=True)
    changed_at = models.DateTimeField(null=True, blank=True, help_text="When the content last changed (version > 1).")
    entities = models.ManyToManyField("Entity", through="DocumentEntity", related_name="documents", blank=True)

    class Meta:
        ordering = ["-fetched_at"]
        indexes = [GinIndex(fields=["metadata"], name="document_metadata_gin")]

    def __str__(self):
        return self.title or self.canonical_url


class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="versions")
    version = models.PositiveIntegerField()
    content_hash = models.CharField(max_length=64)
    fetched_at = models.DateTimeField()
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    raw_path = models.CharField(max_length=300, blank=True)
    title = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ["document", "-version"]
        constraints = [models.UniqueConstraint(fields=["document", "version"], name="documentversion_unique")]

    def __str__(self):
        return f"{self.document_id} v{self.version}"


class Entity(models.Model):
    """A Wikidata item: the shared key that routes documents to branches."""

    class Kind(models.TextChoices):
        PERSON = "person"
        PLACE = "place"
        POLITY = "polity"
        ORG = "org", "organization"
        WORK = "work"
        EVENT = "event"
        CONCEPT = "concept"
        OTHER = "other"

    qid = models.CharField(max_length=20, unique=True, help_text='Wikidata id, e.g. "Q1048".')
    label = models.CharField(max_length=300)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.OTHER)
    description = models.CharField(max_length=500, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    aliases = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "entities"
        ordering = ["label"]
        indexes = [GinIndex(fields=["aliases"], name="entity_aliases_gin")]
        constraints = [models.CheckConstraint(condition=Q(qid__regex=r"^Q[0-9]+$"), name="entity_qid_format")]

    def __str__(self):
        return f"{self.label} ({self.qid})"


class DocumentEntity(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    salience = models.FloatField(default=0.0, help_text="0–1: how central the entity is to the document.")
    mentions = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name_plural = "document entities"
        constraints = [
            models.UniqueConstraint(fields=["document", "entity"], name="documententity_unique"),
            models.CheckConstraint(condition=Q(salience__gte=0, salience__lte=1), name="documententity_salience_0_to_1"),
        ]


class BranchEntity(models.Model):
    """Which Wikidata items belong to a branch (its polity, capital, founders …), so new documents that mention them
    are routed to it deterministically. Routing config, owned by humans and agents, not canonical content."""

    branch = models.ForeignKey("timeline.Branch", on_delete=models.CASCADE, related_name="entities")
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="branches")
    role = models.CharField(max_length=40, blank=True, help_text='e.g. "polity", "capital", "founder", "faith".')
    weight = models.FloatField(default=1.0, help_text="How strongly a mention routes to this branch.")
    note = models.CharField(max_length=300, blank=True)
    created_by = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "branch entities"
        constraints = [models.UniqueConstraint(fields=["branch", "entity"], name="branchentity_unique")]

    def __str__(self):
        return f"{self.branch.slug} ← {self.entity.qid}"


class Candidate(models.Model):
    """A proposed timeline item from one or more documents, waiting for an agent (a `write_event` task)."""

    class Kind(models.TextChoices):
        NEW_EVENT = "new_event"
        UPDATE = "update", "update to an existing entry"
        NEW_BRANCH_SIGNAL = "new_branch_signal", "signal for a new branch"

    class Status(models.TextChoices):
        QUEUED = "queued"
        CLAIMED = "claimed"
        ACCEPTED = "accepted"
        REJECTED = "rejected"
        MERGED = "merged", "merged into another candidate or entry"

    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.NEW_EVENT)
    title = models.CharField(max_length=300)
    summary = models.TextField(blank=True)
    when_text = models.CharField(max_length=300, blank=True, help_text="The date as the documents give it.")
    y_guess = models.FloatField(null=True, blank=True, help_text="Calendar year (as timeline.Event.y).")
    end_guess = models.FloatField(null=True, blank=True)
    precision = models.CharField(max_length=16, choices=Precision.choices, blank=True)
    documents = models.ManyToManyField(Document, related_name="candidates", blank=True)
    entities = models.ManyToManyField(Entity, related_name="candidates", blank=True)
    branch_scores = models.JSONField(default=dict, blank=True, help_text='{"roman-republic": 0.82, …}, from BranchEntity routing.')
    top_branch = models.ForeignKey("timeline.Branch", null=True, blank=True, on_delete=models.SET_NULL, related_name="candidates")
    target_entry = models.ForeignKey("timeline.Entry", null=True, blank=True, on_delete=models.SET_NULL, related_name="update_candidates", help_text="For an update: the entry it would change.")
    duplicate_of = models.ForeignKey("timeline.Event", null=True, blank=True, on_delete=models.SET_NULL, related_name="duplicate_candidates")
    similarity = models.FloatField(null=True, blank=True, help_text="Trigram similarity of the title to duplicate_of's.")
    cluster_key = models.CharField(max_length=200, blank=True, db_index=True, help_text="Candidates about the same happening share it.")
    priority = models.FloatField(default=0.0, db_index=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.QUEUED, db_index=True)
    created_by = models.CharField(max_length=200, blank=True, help_text='The job that proposed it: "job:<name>".')
    created_at = models.DateTimeField(auto_now_add=True)
    decided_by = models.CharField(max_length=200, blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    result_entry = models.ForeignKey("timeline.Entry", null=True, blank=True, on_delete=models.SET_NULL, related_name="from_candidates", help_text="The entry written from it, once accepted.")

    class Meta:
        ordering = ["-priority", "created_at"]
        indexes = [
            GinIndex(OpClass(Lower("title"), name="gin_trgm_ops"), name="candidate_title_trgm"),
            GinIndex(fields=["branch_scores"], name="candidate_branch_scores_gin"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(kind__in=["new_event", "update", "new_branch_signal"]), name="candidate_kind_valid"),
            models.CheckConstraint(condition=Q(status__in=["queued", "claimed", "accepted", "rejected", "merged"]), name="candidate_status_valid"),
            models.CheckConstraint(condition=Q(similarity__isnull=True) | Q(similarity__gte=0, similarity__lte=1), name="candidate_similarity_0_to_1"),
        ]

    def __str__(self):
        return self.title
