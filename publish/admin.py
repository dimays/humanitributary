from django.contrib import admin

from .models import Release


@admin.register(Release)
class ReleaseAdmin(admin.ModelAdmin):
    list_display = ["version", "created_at", "created_by", "content_hash", "counts", "revision_high_water"]
    search_fields = ["version", "content_hash", "notes"]
    readonly_fields = [f.name for f in Release._meta.fields]
