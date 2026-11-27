"""The web surface: the public page (the latest release, from the releases store: infra/site.py, ADR 0024) and the brand
files at the root of every host (site/brand/: ADR 0034), the admin (the
owner's review screen), the staff's read-only operations console (/ops/, ADR 0028), the agents' API and the health check. The page never touches the database (ADR 0001)."""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path

from infra import site
from infra.health import healthz

admin.site.site_header = f"{settings.SITE_NAME} — data"
admin.site.site_title = f"{settings.SITE_NAME} administration"  # tabs read "<page> · <name> administration"
admin.site.index_title = "Canonical content, evidence, ingest and the agent queue"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("ops/", include("opsconsole.urls")),
    path("api/agent/", include("agentapi.urls")),
    path("healthz", healthz),
    path("", site.home),
    re_path(r"^images/(?P<path>.+)$", site.image),
    path("outlines.js", site.outlines),
    *[path(name, site.brand, {"name": name}) for name in site.BRAND_FILES],  # favicons, icons, manifest (site/brand/)
]
