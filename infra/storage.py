"""The one door to object storage (docs/adr/0016-object-storage.md).

Two Django storages, configured in settings by environment (MinIO locally, S3 or R2 in production, a directory
with STORAGE_BACKEND=local, temporary directories in tests):

- `raw`: fetched documents by content hash, `raw/<hash[:2]>/<hash>` (the key is what `Document.raw_path` holds).
- `releases`: `releases/<version>/{content.json, manifest.json, changes.json, changes.md, timeline.html}`, written
  once and never overwritten, and `releases/latest.json`, the one object that moves (publish, rollback).

Everything goes through these functions, so nothing else knows whether a key is a file or an object, and the
write-once rule lives in one place.
"""

import hashlib
import json

from django.core.files.base import ContentFile
from django.core.files.storage import storages

RAW, RELEASES = "raw", "releases"
POINTER = "releases/latest.json"


class Immutable(Exception):
    """A write to a key that already holds different bytes (raw documents and release files are write-once)."""


def storage(alias: str):
    return storages[alias]


def exists(alias: str, key: str) -> bool:
    return storage(alias).exists(key)


def read(alias: str, key: str) -> bytes:
    with storage(alias).open(key, "rb") as f:
        return f.read()


def write(alias: str, key: str, data: bytes, *, once: bool = True) -> bool:
    """Store `data` at `key`. → True if written, False if the same bytes were already there.

    once=True (everything but the pointer): an existing key must already hold exactly these bytes, else Immutable.
    """
    s = storage(alias)
    if s.exists(key):
        if not once:
            s.delete(key)
        else:
            if hashlib.sha256(read(alias, key)).digest() == hashlib.sha256(data).digest():
                return False
            raise Immutable(f"{alias}:{key} already exists with different content")
    saved = s.save(key, ContentFile(data))
    if saved != key:  # a backend that renames on collision would break content addressing
        raise RuntimeError(f"{alias}: saved {key!r} as {saved!r}")
    return True


def delete(alias: str, key: str):
    storage(alias).delete(key)


def listdir(alias: str, prefix: str) -> tuple[list[str], list[str]]:
    return storage(alias).listdir(prefix)


# ── Releases ─────────────────────────────────────────────────────────────────────────────────────────────────────

def release_key(version: str, name: str) -> str:
    return f"releases/{version}/{name}"


def read_pointer() -> dict | None:
    if not exists(RELEASES, POINTER):
        return None
    return json.loads(read(RELEASES, POINTER))


def write_pointer(pointer: dict):
    write(RELEASES, POINTER, (json.dumps(pointer, indent=1, sort_keys=True) + "\n").encode(), once=False)


# ── Health ───────────────────────────────────────────────────────────────────────────────────────────────────────

def reachable(alias: str) -> tuple[bool, str]:
    """Can we talk to the store? (A listing of the bucket root: no write, cheap, and fails fast on bad credentials.)"""
    try:
        storage(alias).listdir("")
        return True, ""
    except FileNotFoundError:
        return True, ""  # an empty local directory that hasn't been created yet
    except Exception as e:  # noqa: BLE001 — health reports any failure, it never raises
        return False, f"{type(e).__name__}: {str(e)[:200]}"
