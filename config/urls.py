"""The only web surface is the admin, the owner's review screen. The public timeline is a static snapshot (ADR 0001)."""

from django.conf import settings
from django.contrib import admin
from django.urls import path

admin.site.site_header = f"{settings.SITE_NAME} — data"
admin.site.site_title = settings.SITE_NAME
admin.site.index_title = "Canonical content, evidence, ingest and the agent queue"

urlpatterns = [
    path("admin/", admin.site.urls),
]
