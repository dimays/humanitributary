"""The public page, served by the web process until a CDN serves the releases bucket (docs/adr/0024-the-app-serves-the-page.md).

`/` is the latest release's built page (`releases/<version>/timeline.html`, written by `publish` after its gates), read
from the releases store and kept in memory by version: the pointer is re-read at most every POINTER_TTL seconds, so a
publish (or a rollback) reaches readers within a minute without a deploy, and the database is never in the page's
path (ADR 0001). The page loads `images/…` and `outlines.js` next to itself; those are inputs kept in the repository
(`site/`), so they are served from the slug. Responses carry Cache-Control, so a CDN put in front later caches them.
"""

import threading
import time

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotModified, HttpResponsePermanentRedirect
from django.views.decorators.http import require_safe
from django.views.static import serve

from . import storage

POINTER_TTL = 60  # seconds between reads of releases/latest.json
PAGE_MAX_AGE = 300  # browsers and a CDN may keep the page this long
ASSET_MAX_AGE = 86400  # images and outlines.js change only with a deploy

_lock = threading.Lock()
_cache: dict = {}


def reset():
    """Forget the cached page (tests)."""
    with _lock:
        _cache.clear()


def latest_page() -> tuple[str | None, bytes | None]:
    """(version, page) of the release `latest` points at, or (None, None) before the first publish. A store that
    can't be read keeps serving the page already in memory."""
    now = time.monotonic()
    with _lock:
        if _cache.get("page") is not None and now - _cache["checked"] < POINTER_TTL:
            return _cache["version"], _cache["page"]
        version, page = _cache.get("version"), _cache.get("page")
    try:
        pointer = storage.read_pointer()
        if not pointer:
            return None, None
        if pointer["version"] != version or page is None:
            version = pointer["version"]
            page = storage.read(storage.RELEASES, storage.release_key(version, "timeline.html"))
    except Exception:  # noqa: BLE001 — a store hiccup must not take the page down
        if page is None:
            raise
    with _lock:
        _cache.update(checked=now, version=version, page=page)
    return version, page


@require_safe
def home(request):
    version, page = latest_page()
    if page is None:
        return HttpResponse("Nothing is published yet.", status=503, content_type="text/plain; charset=utf-8")
    etag = f'"{version}"'
    if request.headers.get("If-None-Match") == etag:
        response = HttpResponseNotModified()
    else:
        response = HttpResponse(page, content_type="text/html; charset=utf-8")
    response["ETag"] = etag
    response["Cache-Control"] = f"public, max-age={PAGE_MAX_AGE}"
    response["X-Release"] = version
    return response


def _asset(request, path, root):
    response = serve(request, path, document_root=root)  # refuses paths outside root
    response["Cache-Control"] = f"public, max-age={ASSET_MAX_AGE}"
    return response


@require_safe
def image(request, path):
    return _asset(request, path, settings.SITE_DIR / "images")


@require_safe
def outlines(request):
    return _asset(request, "outlines.js", settings.SITE_DIR)


class WwwRedirect:
    """www.<host> → https://<host>, permanently, when both are allowed hosts (one name for the page)."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(":")[0]
        if host.startswith("www.") and host[4:] in settings.ALLOWED_HOSTS:
            return HttpResponsePermanentRedirect(f"https://{host[4:]}{request.get_full_path()}")
        return self.get_response(request)
