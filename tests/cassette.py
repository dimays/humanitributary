"""Recorded HTTP for the ingestion tests: no network in tests.

A cassette is a JSON file of real responses, keyed by "METHOD URL" (the full URL with its query string, exactly as
httpx sends it). `replay(name)` gives a Fetcher whose transport answers from the cassette and fails loudly on any
request that isn't in it; unknown robots.txt requests answer 404 (allow all), so policy checks stay offline too.

Cassettes are recorded once against the live services (`RecordingTransport`, see tests/record_fixtures.py) and
trimmed; they hold no keys (key parameters are masked in the recorded URLs and matched masked).
"""

import base64
import json
import re
from pathlib import Path

import httpx

from ingest.http import Fetcher

DIR = Path(__file__).parent / "fixtures" / "ingest"
KEY_RE = re.compile(r"((?:api[_-]?key|wskey)=)[^&]+", re.I)


def _key(request: httpx.Request) -> str:
    return f"{request.method} " + KEY_RE.sub(lambda m: m.group(1) + "***", str(request.url))


class ReplayTransport(httpx.BaseTransport):
    def __init__(self, data: dict, extra: dict | None = None):
        self.data = {**data, **(extra or {})}
        self.seen = []

    def handle_request(self, request):
        k = _key(request)
        self.seen.append(k)
        rec = self.data.get(k)
        if rec is None:
            if request.url.path == "/robots.txt":
                return httpx.Response(404, request=request)
            raise AssertionError(f"request not in cassette: {k}")
        body = base64.b64decode(rec["b64"]) if "b64" in rec else rec.get("body", "").encode()
        return httpx.Response(rec["status"], headers=rec.get("headers", {}), content=body, request=request)


class RecordingTransport(httpx.BaseTransport):
    def __init__(self):
        self.inner = httpx.HTTPTransport()
        self.data = {}

    def handle_request(self, request):
        resp = self.inner.handle_request(request)
        resp.read()
        rec = {"status": resp.status_code, "headers": {k: v for k, v in resp.headers.items() if k.lower() in ("content-type", "etag", "last-modified", "location", "retry-after")}}
        try:
            rec["body"] = resp.content.decode("utf-8")
        except UnicodeDecodeError:
            rec["b64"] = base64.b64encode(resp.content).decode()
        self.data[_key(request)] = rec
        headers = [(k, v) for k, v in resp.headers.items() if k.lower() not in ("content-encoding", "content-length", "transfer-encoding")]
        return httpx.Response(resp.status_code, headers=headers, content=resp.content, request=request)

    def save(self, name: str):
        (DIR / name).write_text(json.dumps(self.data, ensure_ascii=False, indent=1, sort_keys=True))


def load(name: str) -> dict:
    return json.loads((DIR / name).read_text())


def replay(*names: str, extra: dict | None = None) -> Fetcher:
    data = {}
    for n in names:
        data.update(load(n))
    return Fetcher(transport=ReplayTransport(data, extra), sleep=lambda s: None)


def response(status=200, body="", content_type="text/html; charset=utf-8", **headers) -> dict:
    """A hand-made cassette entry (for edge cases no live service would reliably show: 404s, CAPTCHAs, 503s)."""
    return {"status": status, "body": body, "headers": {"content-type": content_type, **headers}}
