"""Collection (docs/adr/0003): scheduled, deterministic jobs read feeds into documents, resolve the entities they
mention, and propose candidates for the timeline. No LLM calls here: agents pick candidates up from the work queue.

    Feed ─< FetchRun
    Feed ─< Document ─< DocumentVersion
    Document >─< Entity (DocumentEntity, with salience)
    timeline.Branch >─< Entity (BranchEntity: routes new material to branches)
    Candidate >─< Document, Entity;  Candidate → possible duplicate timeline.Event

Not canonical: these tables are working state and change without Revisions. Raw bytes live in the `raw` object
store by content hash (infra/storage.py, ADR 0016), never in the database or in git.
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

    feed = models.ForeignKey(Feed, null=True, blank=True, on_delete=models.CASCADE, related_name="runs", help_text="Empty for a job that reads no feed (link health, processing).")
    job = models.CharField(max_length=60, blank=True, db_index=True, help_text="The job registry name (ingest/jobs.py) that ran.")
    started_at = models.DateTimeField(db_index=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.RUNNING)
    counts = models.JSONField(default=dict, blank=True, help_text='{"fetched": …, "new": …, "changed": …, "unchanged": …, "errors": …}')
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    error = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]
        constraints = [models.CheckConstraint(condition=Q(status__in=["running", "ok", "partial", "failed"]), name="fetchrun_status_valid")]
        # A job's newest runs (the console's history strips and job pages): one index scan per job.
        indexes = [models.Index(fields=["job", "-started_at"], name="fetchrun_job_started_idx")]

    def __str__(self):
        return f"{self.job or self.feed} {self.started_at:%Y-%m-%d %H:%M} {self.status}"


class RunLog(models.Model):
    """A job run's log lines (INFO and above, secrets masked, capped), captured by ingest/runlog.py while it ran
    (ADR 0030). Its own table, so listing runs never reads logs; deleted after runlog.KEEP_DAYS."""

    run = models.OneToOneField(FetchRun, primary_key=True, on_delete=models.CASCADE, related_name="log")
    lines = models.JSONField(default=list, help_text='[[time (ISO, UTC), level, logger, message], …], oldest first.')
    line_count = models.PositiveIntegerField(default=0, help_text="Lines the run logged, kept or not.")
    dropped = models.PositiveIntegerField(default=0, help_text="Lines left out between the head and the tail (the caps).")
    bytes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"log of run #{self.run_id} ({len(self.lines)} lines)"


class Document(models.Model):
    """A fetched page or API record, by canonical URL: its latest version here, every version in DocumentVersion."""

    canonical_url = models.URLField(max_length=1000, unique=True)
    url = models.URLField(max_length=1000, help_text="As fetched.")
    feed = models.ForeignKey(Feed, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents")
    publisher = models.ForeignKey("evidence.Publisher", null=True, blank=True, on_delete=models.PROTECT, related_name="documents")
    fetched_at = models.DateTimeField(db_index=True)
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    content_hash = models.CharField(max_length=64, db_index=True, help_text="sha256 of the raw bytes; they are stored at raw/<hash[:2]>/<hash> in the raw object store.")
    raw_path = models.CharField(max_length=300, blank=True, help_text="The key in the raw object store: raw/<hash[:2]>/<hash> (ADR 0016).")
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
    enwiki_title = models.CharField(max_length=300, blank=True, help_text="The English Wikipedia article, when there is one.")
    facts = models.JSONField(default=dict, blank=True, help_text='The Wikidata statements routing uses: {"P31": [QIDs], "P17": […], "P131": […], "P27": […], "P585": "2026-11-20", "P580": …, "P582": …}.')
    pageviews_30d = models.PositiveIntegerField(null=True, blank=True, help_text="English Wikipedia views over the last 30 days (Wikimedia REST API): a significance hint.")
    pageviews_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True, help_text="When the Wikidata facts were last read; re-read after ENTITY_TTL_DAYS.")
    relations = models.JSONField(default=dict, blank=True, help_text='Read only for possible new branches (ingest/branchable.py): {"P361": [QIDs] part of, "P155": follows, "P1365": replaces, "P279": subclass of, "is_a": [Q10864048 first-level division, Q7278 political party: classes it is an instance of, through P31/P279*]}.')
    relations_at = models.DateTimeField(null=True, blank=True, help_text="When `relations` were last read (the entity_relations job).")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "entities"
        ordering = ["label"]
        indexes = [GinIndex(fields=["aliases"], name="entity_aliases_gin")]
        constraints = [models.CheckConstraint(condition=Q(qid__regex=r"^Q[0-9]+$"), name="entity_qid_format")]

    def __str__(self):
        return f"{self.label} ({self.qid})"


class WikiTitle(models.Model):
    """English Wikipedia title → Wikidata QID, cached (redirects followed). An empty qid means the page is missing or
    has no item; such rows are retried after the TTL like any other."""

    title = models.CharField(max_length=300, unique=True, help_text="As linked, with underscores as spaces and the first letter upper-cased.")
    target = models.CharField(max_length=300, blank=True, help_text="Where it redirects (or the title itself).")
    qid = models.CharField(max_length=20, blank=True, db_index=True)
    missing = models.BooleanField(default=False)
    resolved_at = models.DateTimeField()

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} → {self.qid or '∅'}"


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
    source_key = models.CharField(max_length=200, blank=True, help_text='Where it came from, stable across re-fetches: "portal:2026-11-20:<hash>", "rss:<url>", "signal:Q123".')
    details = models.JSONField(default=dict, blank=True, help_text="What the job read: category, topics, source links, routing hits, duplicate checks, priority parts.")
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
            models.UniqueConstraint(fields=["source_key"], condition=~Q(source_key=""), name="candidate_source_key_unique"),
        ]

    def __str__(self):
        return self.title


class LinkCheck(models.Model):
    """One re-check of a cited URL by the link-health job (docs/adr/0012-ingestion.md). The Citation row keeps the
    latest result (through the revisions service layer); this table keeps the history, so "dead twice in a row" and
    "blocked by this host lately" are queries."""

    class Outcome(models.TextChoices):
        OK = "ok"
        CHANGED = "changed", "content changed"
        REDIRECTED = "redirected", "moved to another URL"
        DEAD = "dead"
        ERROR = "error", "failed (network, 5xx); retried next round"
        BLOCKED = "blocked", "refused automated readers (403, CAPTCHA, robots.txt)"
        SKIPPED = "skipped", "not fetched: the publisher's fetch policy"

    citation = models.ForeignKey("evidence.Citation", on_delete=models.CASCADE, related_name="link_checks")
    checked_at = models.DateTimeField(db_index=True)
    method = models.CharField(max_length=10, help_text='"api" (MediaWiki), "head", "get" or "none".')
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    final_url = models.URLField(max_length=1000, blank=True)
    content_hash = models.CharField(max_length=64, blank=True, help_text="sha256 of the extracted main text (or the page revision for Wikipedia).")
    outcome = models.CharField(max_length=12, choices=Outcome.choices)
    etag = models.CharField(max_length=300, blank=True)
    last_modified = models.CharField(max_length=100, blank=True)
    archive_url = models.URLField(max_length=1000, blank=True)
    error = models.TextField(blank=True)
    elapsed_ms = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-checked_at"]
        indexes = [models.Index(fields=["citation", "-checked_at"], name="linkcheck_citation_idx")]
        constraints = [
            models.CheckConstraint(condition=Q(outcome__in=["ok", "changed", "redirected", "dead", "error", "blocked", "skipped"]), name="linkcheck_outcome_valid"),
        ]

    def __str__(self):
        return f"{self.citation_id} {self.checked_at:%Y-%m-%d} {self.outcome}"


class SuggestedSource(models.Model):
    """A page a lookup adapter found that may support a claim or a candidate: a suggestion, never evidence.

    Kept here rather than as `evidence.Evidence` rows because (a) no stance is known until an agent reads the page,
    and (b) the loader (`import_legacy`) makes each record claim's evidence match the file it loads, so extra rows
    there would be removed if one were loaded again. An agent that reads the page and finds it supports the claim writes the
    Evidence (method agent_read) itself and marks the suggestion accepted.
    """

    class Status(models.TextChoices):
        SUGGESTED = "suggested"
        ACCEPTED = "accepted", "an agent read it and added it as evidence"
        REJECTED = "rejected", "an agent read it: it does not support the claim"

    claim = models.ForeignKey("evidence.Claim", null=True, blank=True, on_delete=models.CASCADE, related_name="suggested_sources")
    candidate = models.ForeignKey(Candidate, null=True, blank=True, on_delete=models.CASCADE, related_name="suggested_sources")
    adapter = models.CharField(max_length=40, help_text="ingest/lookup.py adapter name (openalex, crossref, loc …).")
    url = models.URLField(max_length=1000)
    title = models.CharField(max_length=500)
    publisher_domain = models.CharField(max_length=200, blank=True)
    date_text = models.CharField(max_length=60, blank=True)
    snippet = models.CharField(max_length=400, blank=True, help_text="≤ 25 words from the record (title, abstract or description).")
    kind = models.CharField(max_length=16, blank=True)
    ids = models.JSONField(default=dict, blank=True)
    score = models.FloatField(default=0.0, help_text="Keyword relevance 0–1 (ingest/lookup.py).")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SUGGESTED)
    created_by = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_by = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-score", "id"]
        constraints = [
            models.UniqueConstraint(fields=["claim", "url"], condition=Q(claim__isnull=False), name="suggestedsource_claim_url_unique"),
            models.UniqueConstraint(fields=["candidate", "url"], condition=Q(candidate__isnull=False), name="suggestedsource_candidate_url_unique"),
            models.CheckConstraint(condition=Q(status__in=["suggested", "accepted", "rejected"]), name="suggestedsource_status_valid"),
        ]

    def __str__(self):
        return f"{self.adapter}: {self.url}"


class JobState(models.Model):
    """A job's own bookmark between runs (e.g. how far the second-source walk got)."""

    name = models.CharField(max_length=60, unique=True)
    state = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
