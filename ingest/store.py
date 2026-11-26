"""Documents: raw bytes under `var/raw/<hash[:2]>/<hash>` (never in git or the database), the latest version of each
canonical URL in `Document`, every distinct content hash in `DocumentVersion`."""

import hashlib
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Document, DocumentVersion


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_raw(data: bytes) -> tuple[str, str]:
    """Store raw bytes by content hash (once). → (hash, path relative to VAR_DIR)"""
    h = sha256(data)
    rel = Path("raw") / h[:2] / h
    path = Path(settings.VAR_DIR) / rel
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        tmp.write_bytes(data)
        tmp.replace(path)
    return h, str(rel)


def read_raw(rel: str) -> bytes:
    return (Path(settings.VAR_DIR) / rel).read_bytes()


def save_document(*, canonical_url: str, url: str, raw: bytes, feed=None, publisher=None, http_status: int | None = 200,
                  title: str = "", published_at=None, language: str = "", license: str = "", extracted_text: str = "",
                  metadata: dict | None = None, fetched_at=None) -> tuple[Document, str]:
    """Create or update the Document for `canonical_url`. → (document, "new" | "changed" | "unchanged")

    The content hash decides: unchanged bytes only touch `fetched_at`; changed bytes bump `version` and add a
    DocumentVersion. The derived fields (title, text, metadata …) are rewritten either way, so a parser fix shows
    up on the next run without a content change.
    """
    now = fetched_at or timezone.now()
    h, rel = write_raw(raw)
    fields = dict(url=url, feed=feed, publisher=publisher, fetched_at=now, http_status=http_status, title=title[:500],
                  published_at=published_at, language=language[:20], license=license[:200], extracted_text=extracted_text,
                  metadata=metadata or {})
    with transaction.atomic():
        doc = Document.objects.select_for_update().filter(canonical_url=canonical_url).first()
        if doc is None:
            doc = Document.objects.create(canonical_url=canonical_url, content_hash=h, raw_path=rel, **fields)
            DocumentVersion.objects.create(document=doc, version=1, content_hash=h, fetched_at=now, http_status=http_status, raw_path=rel, title=title[:500])
            return doc, "new"
        state = "unchanged"
        if doc.content_hash != h:
            state = "changed"
            doc.version += 1
            doc.content_hash, doc.raw_path, doc.changed_at = h, rel, now
            DocumentVersion.objects.create(document=doc, version=doc.version, content_hash=h, fetched_at=now, http_status=http_status, raw_path=rel, title=title[:500])
        for k, v in fields.items():
            setattr(doc, k, v)
        doc.save()
        return doc, state


def touch_document(canonical_url: str, *, http_status: int = 304):
    """A conditional request came back 304: the document was seen again, unchanged."""
    Document.objects.filter(canonical_url=canonical_url).update(fetched_at=timezone.now())
