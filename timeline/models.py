"""Canonical content: what the timeline says (docs/data-model.md).

An Entry is anything with an id on the timeline: a Branch (a society, polity, lineage, faith, idea or era) or an Event
on one. Branches and events share one id namespace (`slug`, the legacy `id`: kebab-case, globally unique), so
claims, locations, images and connections point at an Entry whichever kind it is.

Every table here is canonical: writes only inside `revisions.revising()`, each leaving a Revision (AGENTS.md rule 2).
Dates are calendar years as double-precision numbers, exactly as SCHEMA.md writes them (`y`, `start`, `end`:
positive CE, negative BCE / years ago, fractions for modern dates), with the human-readable text beside them. The
precision, approximate flag and exact `date` are derived from that text (timeline/dates.py) for querying; the
snapshot is built from the numbers and text, never from the derived fields.
"""

from django.contrib.postgres.indexes import GinIndex, OpClass
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower

SLUG_RE = r"^[a-z0-9][a-z0-9-]*$"
slug_validator = RegexValidator(SLUG_RE, "kebab-case: lowercase letters, digits and hyphens")


class Status(models.TextChoices):
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"
    RETRACTED = "retracted"


class Precision(models.TextChoices):
    """How finely a date is known, from its text ("c. 4.54 billion years ago" … "July 20, 1969")."""

    BILLION_YEARS = "billion_years"
    MILLION_YEARS = "million_years"
    THOUSAND_YEARS = "thousand_years"
    MILLENNIUM = "millennium"
    CENTURY = "century"
    DECADE = "decade"
    YEAR = "year"
    MONTH = "month"
    DAY = "day"


class Region(models.Model):
    """A lane group on the timeline (cosmos, life, humans, global, faiths, culture, europe, …)."""

    slug = models.CharField(max_length=40, unique=True, validators=[slug_validator])
    name = models.CharField(max_length=120)
    position = models.PositiveSmallIntegerField(default=0, help_text="Order of the lanes on the page.")

    class Meta:
        ordering = ["position", "slug"]

    def __str__(self):
        return self.name


class Entry(models.Model):
    """The shared part of a branch or an event: its id, status, text and "why it matters" paragraph."""

    class Kind(models.TextChoices):
        BRANCH = "branch"
        EVENT = "event"

    slug = models.CharField(max_length=120, unique=True, validators=[slug_validator], help_text="The stable id (legacy `id`).")
    kind = models.CharField(max_length=10, choices=Kind.choices, editable=False)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT, db_index=True)
    text = models.TextField(help_text="One or two sentences, every claim supported by the entry's citations.")
    why = models.TextField(blank=True, help_text='"Why it matters" (TL.enrich), ≤ 700 chars; blank = not enriched.')
    sort_key = models.CharField(
        max_length=255,
        db_collation="C",
        help_text="Order within its kind in the snapshot, which the page breaks sort ties by: a fractional index, so "
        "inserting or removing an entry moves no other, until a gap is used up and its neighbours are respaced in the "
        "same order (timeline/ordering.py, ADR 0045). Kept to 16 characters; the column's 255 is a backstop.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "entries"
        ordering = ["kind", "sort_key", "slug"]
        constraints = [
            # Deferred, so a reorder can pass through a moment where two rows share a key inside one transaction.
            models.UniqueConstraint(fields=["kind", "sort_key"], name="entry_sort_key_unique", deferrable=models.Deferrable.DEFERRED),
            models.CheckConstraint(condition=Q(slug__regex=SLUG_RE), name="entry_slug_kebab"),
            models.CheckConstraint(condition=Q(kind__in=["branch", "event"]), name="entry_kind_valid"),
            models.CheckConstraint(condition=Q(status__in=Status.values), name="entry_status_valid"),
        ]

    def __str__(self):
        return self.slug

    @property
    def concrete(self):
        return self.as_branch if self.kind == "branch" else self.as_event


class Branch(Entry):
    entry_ptr = models.OneToOneField(Entry, parent_link=True, primary_key=True, on_delete=models.CASCADE, related_name="as_branch")
    name = models.CharField(max_length=200)
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name="branches")
    start = models.FloatField(help_text="Calendar year it begins (negative = BCE / years ago).")
    end = models.FloatField(null=True, blank=True, help_text="Calendar year it ends; empty = continues to today.")
    start_when = models.CharField(max_length=300, help_text='As the source supports it: "509 BCE".')
    end_when = models.CharField(max_length=300, null=True, blank=True, help_text="Empty string and null are kept apart (the snapshot keeps both).")
    start_precision = models.CharField(max_length=16, choices=Precision.choices, default=Precision.YEAR)
    end_precision = models.CharField(max_length=16, choices=Precision.choices, null=True, blank=True)
    start_approximate = models.BooleanField(default=False)
    end_approximate = models.BooleanField(default=False)
    start_date = models.DateField(null=True, blank=True, help_text="Exact CE date, when the text gives a day.")
    end_date = models.DateField(null=True, blank=True)
    origin_note = models.TextField(null=True, blank=True, help_text="Where it came from (TL.origin), ≤ 340 chars; null = no origin.")

    class Meta:
        verbose_name_plural = "branches"
        ordering = ["sort_key", "slug"]
        indexes = [GinIndex(OpClass(Lower("name"), name="gin_trgm_ops"), name="branch_name_trgm")]
        constraints = [
            models.CheckConstraint(condition=Q(end__isnull=True) | Q(end__gt=F("start")), name="branch_end_after_start"),
            models.CheckConstraint(condition=Q(start_precision__in=Precision.values), name="branch_start_precision_valid"),
        ]

    def save(self, *args, **kwargs):
        self.kind = Entry.Kind.BRANCH
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.slug})"


class Event(Entry):
    entry_ptr = models.OneToOneField(Entry, parent_link=True, primary_key=True, on_delete=models.CASCADE, related_name="as_event")
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="events")
    title = models.CharField(max_length=200, help_text="≤ 60 characters by the style rules.")
    y = models.FloatField(help_text="Calendar year (negative = BCE / years ago).")
    end = models.FloatField(null=True, blank=True, help_text="For an event with duration (a war, a reign).")
    when = models.CharField(max_length=300, help_text='As the source supports it: "15 March 44 BCE".')
    precision = models.CharField(max_length=16, choices=Precision.choices, default=Precision.YEAR)
    approximate = models.BooleanField(default=False)
    date = models.DateField(null=True, blank=True, help_text="Exact CE date, when the text gives a day.")
    end_date = models.DateField(null=True, blank=True)
    imp = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(3)],
        help_text="1 = landmark (shown at wide zoom), 2 = notable, 3 = detail.",
    )
    linked_branches = models.ManyToManyField(Branch, through="EventLink", related_name="linked_events", blank=True)

    class Meta:
        ordering = ["sort_key", "slug"]
        indexes = [
            models.Index(fields=["branch", "y"], name="event_branch_y_idx"),
            # Duplicate matching: candidates' titles against events' (`title % …`, similarity()).
            GinIndex(OpClass(Lower("title"), name="gin_trgm_ops"), name="event_title_trgm"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(imp__gte=1, imp__lte=3), name="event_imp_1_to_3"),
            models.CheckConstraint(condition=Q(end__isnull=True) | Q(end__gt=F("y")), name="event_end_after_y"),
            models.CheckConstraint(condition=Q(precision__in=Precision.values), name="event_precision_valid"),
        ]

    def save(self, *args, **kwargs):
        self.kind = Entry.Kind.EVENT
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.slug})"


HOWS = ["independence", "split", "successor", "merger", "conquest", "peoples", "context", "ideas", "reaction"]


class BranchLink(models.Model):
    """One branch's link to another: a parent it split from or grew out of, or what it became (`into`).

    An origin link (TL.origin) is a parent link with `origin_position` set, the kind of link (`how`) and a note.
    """

    class Relation(models.TextChoices):
        PARENT = "parent"
        INTO = "into"

    class How(models.TextChoices):
        INDEPENDENCE = "independence", "won independence from"
        SPLIT = "split", "broke away from"
        SUCCESSOR = "successor", "the state it replaced"
        MERGER = "merger", "formed by uniting with"
        CONQUEST = "conquest"
        PEOPLES = "peoples", "the peoples or cultures it came from"
        CONTEXT = "context", "grew out of an era or crisis"
        IDEAS = "ideas", "intellectual or religious roots"
        REACTION = "reaction", "arose in opposition to"

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="links")
    target = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="links_in")
    relation = models.CharField(max_length=10, choices=Relation.choices)
    position = models.PositiveSmallIntegerField(default=0, help_text="Order in the branch's `parents` / `into` list.")
    origin_position = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Order in the origin's links; null = not an origin link.")
    how = models.CharField(max_length=16, choices=How.choices, blank=True)
    note = models.CharField(max_length=300, blank=True, help_text="≤ 100 chars: the origin link's note.")

    class Meta:
        ordering = ["branch", "relation", "position"]
        constraints = [
            models.UniqueConstraint(fields=["branch", "target", "relation"], name="branchlink_unique"),
            models.CheckConstraint(condition=~Q(branch=F("target")), name="branchlink_not_self"),
            models.CheckConstraint(condition=Q(relation__in=["parent", "into"]), name="branchlink_relation_valid"),
            models.CheckConstraint(condition=Q(how="") | Q(how__in=HOWS), name="branchlink_how_valid"),
            models.CheckConstraint(condition=Q(origin_position__isnull=True) | Q(relation="parent", how__gt=""), name="branchlink_origin_is_parent_with_how"),
        ]

    def __str__(self):
        return f"{self.branch.slug} → {self.relation} {self.target.slug}"


class EventLink(models.Model):
    """An event's contact, blending or conflict with another branch at that moment (legacy `link`, a dashed connector).

    The page draws one per event: the snapshot writes the first by position.
    """

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event_links")
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="event_links")
    position = models.PositiveSmallIntegerField(default=0)
    note = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["event", "position"]
        constraints = [models.UniqueConstraint(fields=["event", "branch"], name="eventlink_unique")]

    def __str__(self):
        return f"{self.event.slug} ↔ {self.branch.slug}"


class Connection(models.Model):
    """A sourced link from one entry to another (TL.enrich connections): "how the two are linked", ≤ 90 chars."""

    source = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="connections_out")
    target = models.ForeignKey(Entry, on_delete=models.PROTECT, related_name="connections_in")
    position = models.PositiveSmallIntegerField(default=0)
    note = models.CharField(max_length=300)

    class Meta:
        ordering = ["source", "position"]
        constraints = [
            models.UniqueConstraint(fields=["source", "position"], name="connection_position_unique"),
            models.CheckConstraint(condition=~Q(source=F("target")), name="connection_not_self"),
        ]

    def __str__(self):
        return f"{self.source.slug} → {self.target.slug}"


class Location(models.Model):
    """Where an entry happened, for the globe (TL.geo)."""

    class Scope(models.TextChoices):
        PLACE = "place", "place (a city, site or battlefield)"
        REGION = "region", "region (a country, empire, sea or basin)"
        GLOBAL = "global", "worldwide"
        COSMIC = "cosmic", "before Earth or beyond it"

    class Scale(models.TextChoices):
        SOLAR_SYSTEM = "solar-system"
        GALAXY = "galaxy"
        UNIVERSE = "universe"

    entry = models.OneToOneField(Entry, on_delete=models.CASCADE, related_name="location")
    scope = models.CharField(max_length=10, choices=Scope.choices)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    radius_km = models.FloatField(null=True, blank=True, help_text="`r`: 30–150 km for a place; roughly covering a region.")
    label = models.CharField(max_length=300, null=True, blank=True)
    src = models.URLField(max_length=1000, null=True, blank=True, help_text="A page whose own coordinates are the place meant.")
    scale = models.CharField(max_length=16, choices=Scale.choices, null=True, blank=True, help_text="Cosmic scope only.")

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(scope__in=["place", "region", "global", "cosmic"]), name="location_scope_valid"),
            models.CheckConstraint(condition=Q(lat__isnull=True) | Q(lat__gte=-90, lat__lte=90), name="location_lat_range"),
            models.CheckConstraint(condition=Q(lon__isnull=True) | Q(lon__gte=-180, lon__lte=180), name="location_lon_range"),
            models.CheckConstraint(condition=Q(radius_km__isnull=True) | Q(radius_km__gt=0, radius_km__lte=6000), name="location_radius_range"),
            models.CheckConstraint(condition=Q(scale__isnull=True) | Q(scope="cosmic"), name="location_scale_cosmic_only"),
            models.CheckConstraint(
                condition=~Q(scope__in=["place", "region"]) | Q(lat__isnull=False, lon__isnull=False, radius_km__isnull=False, label__isnull=False, label__gt="", src__isnull=False, src__startswith="https://"),
                name="location_place_complete",
            ),
        ]

    def __str__(self):
        return f"{self.entry.slug}: {self.label or self.scope}"


class PaleoPin(models.Model):
    """Where a present-day coordinate lay at a PaleoDEM slice's age, reconstructed with the PALEOMAP plate model
    through the GPlates Web Service (`build-paleo-points.mjs`). Locations at (present_lat, present_lon) use these."""

    present_lat = models.FloatField()
    present_lon = models.FloatField()
    slice_ma = models.PositiveIntegerField(help_text="Millions of years ago: 20, 35, 50, … 540.")
    lat = models.FloatField()
    lon = models.FloatField()
    model = models.CharField(max_length=40, default="PALEOMAP")

    class Meta:
        ordering = ["slice_ma", "present_lat", "present_lon"]
        constraints = [models.UniqueConstraint(fields=["model", "slice_ma", "present_lat", "present_lon"], name="paleopin_unique")]

    def __str__(self):
        return f"({self.present_lat}, {self.present_lon}) at {self.slice_ma} Ma → ({self.lat}, {self.lon})"


class Image(models.Model):
    """A picture on an entry (TL.image), public domain or openly licensed. Either a file kept in site/images/ (the
    legacy set, `src` "images/…") or, since ADR 0048, a reference to the source's own copy (`src` an https URL: a
    Wikimedia thumbnail, a museum's delivery URL), never re-hosted or altered. Attached by the image_search job or
    the owner's Review page (ingest/images.py); `sensitive` blurs it on the page until the viewer chooses to see it."""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="images")
    position = models.PositiveSmallIntegerField(default=0)
    src = models.CharField(max_length=1000, help_text='Path relative to site/ ("images/me-hastings.jpg") or the source\'s https URL (ADR 0048).')
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    title = models.TextField()
    alt = models.TextField(blank=True, help_text="What the picture shows, for screen readers; empty: the title is used.")
    credit = models.TextField()
    license = models.CharField(max_length=200, help_text="Public domain, No known restrictions (the Library of Congress's rights advisory), CC0, CC BY or CC BY-SA (ADR 0048).")
    license_url = models.URLField(max_length=500, blank=True, help_text="The license's deed; required for CC BY and CC BY-SA.")
    page = models.URLField(max_length=1000, help_text="Its file page at the source (Wikimedia Commons, the museum's record).")
    sensitive = models.BooleanField(default=False, help_text="Likely to disturb (war dead, atrocities, executions, victims, graphic medicine): blurred until the viewer asks.")

    class Meta:
        ordering = ["entry", "position"]
        constraints = [
            models.UniqueConstraint(fields=["entry", "position"], name="image_position_unique"),
            models.CheckConstraint(condition=Q(license__iregex=r"^(PD|Public domain|No known restrictions|CC0|CC BY [0-9]|CC BY-SA [0-9])"), name="image_license_open"),
            # An attribution license is honored on the page: the author and the license's link travel with the picture.
            models.CheckConstraint(condition=~Q(license__iregex=r"^CC BY") | (~Q(credit="") & ~Q(license_url="")), name="image_attribution_complete"),
            models.CheckConstraint(condition=Q(src__startswith="images/") | Q(src__startswith="https://"), name="image_src_local_or_https"),
        ]

    def __str__(self):
        return self.src
