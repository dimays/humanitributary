"""The fact-checking backbone (docs/adr/0004): who publishes a page, the pages we cite, the atomic claims the
timeline makes, and the evidence tying each claim to its citations.

    Publisher ─< Citation ─< Evidence >─ Claim >─ timeline.Entry

Every table here is canonical (writes only inside `revisions.revising()`). A claim's `status` and `confidence` are
computed from its evidence by `evidence.confidence` (never typed in by hand), so they can be recomputed at any time.
"""

from django.db import models
from django.db.models import Q

OPENSTAX_RE = r"^https?://([a-z0-9-]+\.)*openstax\.org(/|$)"


class Publisher(models.Model):
    """A site we cite, by domain (www. stripped), with how far it can be trusted and how we may read it."""

    class Fetch(models.TextChoices):
        ALLOWED = "allowed", "automated fetching allowed"
        API_ONLY = "api_only", "jobs only through its API (api_base), and only with a key where one is needed"
        BROWSER_ONLY = "browser_only", "blocks automated readers: read in a browser"
        CITATION_ONLY = "citation_only", "cite the link; never fetched by a job (an agent may read it in a browser)"
        FORBIDDEN = "forbidden", "never fetch or cite (terms forbid it)"

    domain = models.CharField(max_length=200, unique=True)
    name = models.CharField(max_length=200)
    tier = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Reliability: 1 primary/official/peer-reviewed, 2 scholarly or institutional reference (museums, "
        "universities, Britannica), 3 general reference (Wikipedia, World History Encyclopedia), 4 weak (blogs, "
        "aggregators). Empty = not yet rated.",
    )
    license = models.CharField(max_length=200, blank=True, help_text='e.g. "CC BY-SA 4.0", "all rights reserved".')
    fetch_policy = models.CharField(max_length=16, choices=Fetch.choices, default=Fetch.ALLOWED)
    access_notes = models.TextField(blank=True, help_text='e.g. "no automated fetching (ToS)".')
    # For `api_only` (ADR 0037): the only URLs a job may request, and whether that needs a key.
    api_base = models.CharField(max_length=500, blank=True, help_text='api_only: the URL prefix a job may request, optionally with a required query parameter after a space ("https://www.loc.gov/ ?fo=json"). Several, separated by " | ".')
    api_needs_key = models.BooleanField(default=False, help_text="api_only: the API needs a key; a job uses it only when api_key_setting names a setting that is set.")
    api_key_setting = models.CharField(max_length=60, blank=True, help_text='The setting holding the key (e.g. "SMITHSONIAN_API_KEY"); empty: no key exists, so the API stays off.')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["domain"]
        constraints = [
            models.CheckConstraint(condition=Q(tier__isnull=True) | Q(tier__gte=1, tier__lte=4), name="publisher_tier_1_to_4"),
            models.CheckConstraint(condition=Q(fetch_policy__in=["allowed", "api_only", "browser_only", "citation_only", "forbidden"]), name="publisher_fetch_policy_valid"),
            models.CheckConstraint(condition=~Q(domain__regex=r"(^|\.)openstax\.org$") | Q(fetch_policy="forbidden"), name="publisher_openstax_forbidden"),
        ]

    def __str__(self):
        return self.domain

    @property
    def is_wikipedia(self):
        return self.domain == "wikipedia.org" or self.domain.endswith(".wikipedia.org")


class Citation(models.Model):
    """One cited page, by URL. Shared by every claim that cites it."""

    class Kind(models.TextChoices):
        PRIMARY = "primary"
        TEXTBOOK = "textbook"
        PAPER = "paper"
        MUSEUM = "museum"
        ARCHIVE = "archive"
        REFERENCE = "reference"
        ENCYCLOPEDIA = "encyclopedia"
        NEWS = "news"
        DATA = "data"

    url = models.URLField(max_length=1000, unique=True, help_text="As cited: https only, the most specific stable URL.")
    canonical_url = models.URLField(max_length=1000, blank=True, db_index=True, help_text="After redirects / rel=canonical, when checked.")
    title = models.CharField(max_length=500, help_text="The page's title as first cited (each use keeps its own wording on Evidence).")
    publisher = models.ForeignKey(Publisher, on_delete=models.PROTECT, related_name="citations")
    kind = models.CharField(max_length=16, choices=Kind.choices, blank=True)
    last_checked_at = models.DateTimeField(null=True, blank=True)
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    content_hash = models.CharField(max_length=64, blank=True, help_text="sha256 of the extracted text when last checked.")
    archive_url = models.URLField(max_length=1000, blank=True, help_text="A Wayback Machine or other archived copy.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["url"]
        constraints = [
            models.CheckConstraint(condition=Q(url__startswith="https://"), name="citation_url_https"),
            models.CheckConstraint(condition=~Q(url__iregex=OPENSTAX_RE), name="citation_never_openstax"),
            models.CheckConstraint(condition=Q(kind="") | Q(kind__in=["primary", "textbook", "paper", "museum", "archive", "reference", "encyclopedia", "news", "data"]), name="citation_kind_valid"),
        ]

    def __str__(self):
        return self.url


class Claim(models.Model):
    """One atomic statement the timeline makes about an entry, and how well it is supported.

    `field` says which part of the entry it covers. Legacy content arrives as one "as written" claim per entry (its
    date, title and text together, cited by the entry's `cites`), plus a "why" claim (TL.enrich) and an "origin"
    claim (TL.origin) where those exist. A deterministic splitter (evidence/claims.py) derives atomic claims from
    each entry (its dates, place, numbers and named actors) as children of the "as written" claim (`parent`), so
    evidence can attach to the part it supports.
    """

    class Field(models.TextChoices):
        AS_WRITTEN = "as_written", "as written (the whole record)"
        DATE = "date"
        TITLE = "title"
        TEXT = "text"
        LOCATION = "location"
        ORIGIN = "origin"
        WHY = "why", "why it matters (and its connections)"
        CONNECTION = "connection"
        LINK = "link"
        NUMBER = "number", "a number in the text (count, magnitude, percentage)"
        ACTOR = "actor", "a named actor (person, state, group) in the text"

    class Status(models.TextChoices):
        UNVERIFIED = "unverified"
        SINGLE_SOURCE = "single_source", "single source"
        CORROBORATED = "corroborated"
        CONTESTED = "contested"
        STALE = "stale"

    entry = models.ForeignKey("timeline.Entry", on_delete=models.CASCADE, related_name="claims")
    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="children",
        help_text="For an atomic claim (evidence/claims.py): the \"as written\" claim it was split from.",
    )
    field = models.CharField(max_length=16, choices=Field.choices)
    key = models.CharField(max_length=100, blank=True, default="", help_text="Tells apart several claims on one field (e.g. a sentence number).")
    value = models.JSONField(default=dict, help_text="What is claimed, e.g. {\"when\": …, \"title\": …, \"text\": …}.")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.UNVERIFIED, db_index=True)
    confidence = models.FloatField(default=0.0, help_text="0–1, computed from the evidence (evidence/confidence.py).")
    recheck_after = models.DateField(null=True, blank=True, db_index=True, help_text="From this date the claim is stale until re-checked (set by `facts sweep`; a job may pull it earlier).")
    recheck_requested_at = models.DateTimeField(null=True, blank=True, help_text="When an earlier recheck was asked for (value changed, conflict …): a check after this time answers it.")
    recheck_reason = models.CharField(max_length=40, blank=True, help_text='Why recheck_after is what it is: "scheduled", "dead_link", "content_changed", "value_changed", "conflict", or a job\'s own reason.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["entry", "field", "key"]
        constraints = [
            models.UniqueConstraint(fields=["entry", "field", "key"], name="claim_unique_per_entry_field_key"),
            models.CheckConstraint(condition=Q(field__in=["as_written", "date", "title", "text", "location", "origin", "why", "connection", "link", "number", "actor"]), name="claim_field_valid"),
            models.CheckConstraint(condition=Q(status__in=["unverified", "single_source", "corroborated", "contested", "stale"]), name="claim_status_valid"),
            models.CheckConstraint(condition=Q(confidence__gte=0, confidence__lte=1), name="claim_confidence_0_to_1"),
        ]

    def __str__(self):
        return f"{self.entry.slug} · {self.field}{(' ' + self.key) if self.key else ''}"


class Evidence(models.Model):
    """A citation's bearing on a claim: does the page support it, and how do we know."""

    class Stance(models.TextChoices):
        SUPPORTS = "supports"
        PARTIAL = "partial"
        CONFLICTS = "conflicts"
        UNRELATED = "unrelated"

    class Method(models.TextChoices):
        LEGACY = "legacy", "cited by the static site's author (read in their session; not re-checked here)"
        FETCH_MATCH = "fetch_match", "a job found the excerpt in the fetched page"
        AGENT_READ = "agent_read", "an agent fetched and read the page"
        BROWSER_READ = "browser_read", "read in a browser (the site blocks automated readers)"
        HUMAN = "human", "checked by a person"

    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name="evidence")
    citation = models.ForeignKey(Citation, on_delete=models.PROTECT, related_name="evidence")
    position = models.PositiveSmallIntegerField(default=0, help_text="Order in the entry's cites list.")
    stance = models.CharField(max_length=10, choices=Stance.choices, default=Stance.SUPPORTS)
    excerpt = models.CharField(max_length=400, blank=True, help_text="The passage that bears on the claim, ≤ 25 words.")
    checked_at = models.DateTimeField(null=True, blank=True, help_text="When the page was last read against the claim; empty = never here.")
    checked_by = models.CharField(max_length=200, blank=True, help_text='"agent:<name>", "human:<username>" or "job:<command>".')
    method = models.CharField(max_length=16, choices=Method.choices, default=Method.LEGACY)
    cited_title = models.CharField(max_length=500, help_text="The citation's title as this entry writes it (`t`).")
    cited_kind = models.CharField(max_length=16, blank=True, help_text="The citation kind as this entry writes it (`k`).")
    found_value = models.JSONField(null=True, blank=True, help_text='What the source itself says, when it differs or is worth keeping: e.g. {"y": 1951.3, "when": "April 1951"} or {"value": 5000}.')
    content_hash = models.CharField(max_length=64, blank=True, help_text="The citation's content hash when this evidence was checked (or first seen by the sweep): a later change means re-read.")

    class Meta:
        verbose_name_plural = "evidence"
        ordering = ["claim", "position"]
        constraints = [
            models.UniqueConstraint(fields=["claim", "position"], name="evidence_position_unique"),
            models.CheckConstraint(condition=Q(stance__in=["supports", "partial", "conflicts", "unrelated"]), name="evidence_stance_valid"),
            models.CheckConstraint(condition=Q(checked_by="") | Q(checked_by__regex=r"^(agent|human|job):"), name="evidence_checked_by_actor"),
            # ≤ 25 words: short enough to quote under fair use, long enough to find again.
            models.CheckConstraint(condition=Q(excerpt="") | Q(excerpt__regex=r"^\s*(\S+\s+){0,24}\S+\s*$"), name="evidence_excerpt_25_words"),
            models.CheckConstraint(condition=Q(cited_kind="") | Q(cited_kind__in=["primary", "textbook", "paper", "museum", "archive", "reference", "encyclopedia", "news", "data"]), name="evidence_cited_kind_valid"),
        ]

    def __str__(self):
        return f"{self.claim} ← {self.citation.url} ({self.stance})"
