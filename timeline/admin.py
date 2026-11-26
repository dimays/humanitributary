from django.contrib import admin

from evidence.models import Claim
from revisions.admin_mixins import RevisedAdmin

from .models import Branch, BranchLink, Connection, Entry, Event, EventLink, Image, Location, PaleoPin, Region


class LocationInline(admin.StackedInline):
    model = Location
    extra = 0


class ImageInline(admin.TabularInline):
    model = Image
    extra = 0


class ConnectionInline(admin.TabularInline):
    model = Connection
    fk_name = "source"
    extra = 0
    raw_id_fields = ["target"]


class ClaimInline(admin.TabularInline):
    model = Claim
    extra = 0
    fields = ["field", "key", "status", "confidence", "recheck_after"]
    readonly_fields = ["status", "confidence"]
    show_change_link = True


class BranchLinkInline(admin.TabularInline):
    model = BranchLink
    fk_name = "branch"
    extra = 0
    raw_id_fields = ["target"]


class EventLinkInline(admin.TabularInline):
    model = EventLink
    extra = 0
    raw_id_fields = ["branch"]


@admin.register(Region)
class RegionAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["slug", "name", "position"]
    list_editable = ["position"]


@admin.register(Entry)
class EntryAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["slug", "kind", "status", "updated_at"]
    list_filter = ["kind", "status"]
    search_fields = ["slug", "text"]
    readonly_fields = ["kind"]


@admin.register(Branch)
class BranchAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["slug", "name", "region", "start_when", "end_when", "status", "position"]
    list_filter = ["status", "region", "start_precision", ("origin_note", admin.EmptyFieldListFilter)]
    search_fields = ["slug", "name", "text"]
    readonly_fields = ["kind", "start_precision", "end_precision", "start_approximate", "end_approximate", "start_date", "end_date"]
    inlines = [BranchLinkInline, LocationInline, ImageInline, ConnectionInline, ClaimInline]


@admin.register(Event)
class EventAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["slug", "title", "branch", "when", "imp", "precision", "status"]
    list_filter = ["status", "imp", "precision", "approximate", "branch__region", ("why", admin.EmptyFieldListFilter)]
    search_fields = ["slug", "title", "text", "when"]
    raw_id_fields = ["branch"]
    readonly_fields = ["kind", "precision", "approximate", "date", "end_date"]
    inlines = [EventLinkInline, LocationInline, ImageInline, ConnectionInline, ClaimInline]


@admin.register(BranchLink)
class BranchLinkAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["branch", "relation", "target", "how", "note"]
    list_filter = ["relation", "how"]
    search_fields = ["branch__slug", "target__slug", "note"]
    raw_id_fields = ["branch", "target"]


@admin.register(EventLink)
class EventLinkAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["event", "branch", "position", "note"]
    search_fields = ["event__slug", "branch__slug"]
    raw_id_fields = ["event", "branch"]


@admin.register(Connection)
class ConnectionAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["source", "target", "note"]
    list_filter = ["source__kind", "target__kind"]
    search_fields = ["source__slug", "target__slug", "note"]
    raw_id_fields = ["source", "target"]


@admin.register(Location)
class LocationAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["entry", "scope", "label", "lat", "lon", "radius_km"]
    list_filter = ["scope", "scale", "entry__kind"]
    search_fields = ["entry__slug", "label", "src"]
    raw_id_fields = ["entry"]


@admin.register(PaleoPin)
class PaleoPinAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["present_lat", "present_lon", "slice_ma", "lat", "lon", "model"]
    list_filter = ["slice_ma", "model"]


@admin.register(Image)
class ImageAdmin(RevisedAdmin, admin.ModelAdmin):
    list_display = ["entry", "src", "license", "credit"]
    list_filter = ["license", "entry__kind"]
    search_fields = ["entry__slug", "title", "credit", "page"]
    raw_id_fields = ["entry"]
