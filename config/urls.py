"""The web surface: the admin (the owner's review screen), the agents' API and the health check. The public timeline is
a static snapshot that never touches this server (ADR 0001)."""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from infra.health import healthz

admin.site.site_header = f"{settings.SITE_NAME} — data"
admin.site.site_title = settings.SITE_NAME
admin.site.index_title = "Canonical content, evidence, ingest and the agent queue"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/agent/", include("agentapi.urls")),
    path("healthz", healthz),
]
