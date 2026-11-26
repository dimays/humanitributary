"""Move what used to live under var/ into object storage (docs/adr/0016-object-storage.md).

`manage.py storage migrate_local [--var-dir DIR] [--dry-run]` copies

- `<var>/raw/<hh>/<hash>` → raw store `raw/<hh>/<hash>` (the key `Document.raw_path` already holds), after checking
  each file's sha256 is its name;
- `<var>/releases/<version>/*` → releases store `releases/<version>/*` (the key `Release.snapshot_path` holds);
- `<var>/releases/latest` (a symlink) → `releases/latest.json`, unless the store already has a pointer.

It is idempotent (an object already there with the same bytes is skipped; different bytes are an error, never
overwritten), never deletes or moves a local file, and ends by listing what the database refers to that the store
still lacks. Delete the local copies yourself once that list is empty.
"""

import hashlib
import json
import re
from collections import Counter
from pathlib import Path

from django.utils import timezone

from . import storage

HEX64 = re.compile(r"^[0-9a-f]{64}$")
VERSION = re.compile(r"^\d{4}\.\d{2}\.\d{2}\.\d+$")


def _put(alias: str, key: str, data: bytes, stats: Counter, label: str, dry_run: bool, problems: list):
    if storage.exists(alias, key):
        if hashlib.sha256(storage.read(alias, key)).digest() == hashlib.sha256(data).digest():
            stats[f"{label}.present"] += 1
        else:
            stats[f"{label}.conflict"] += 1
            problems.append(f"{alias}:{key} already holds different bytes (left as it is)")
        return
    if not dry_run:
        storage.write(alias, key, data)
    stats[f"{label}.copied"] += 1


def migrate(var_dir: Path, *, dry_run: bool = False, log=print) -> tuple[Counter, list[str]]:
    stats, problems = Counter(), []
    raw = var_dir / "raw"
    if raw.is_dir():
        for path in sorted(raw.glob("*/*")):
            if not path.is_file() or path.suffix == ".tmp":
                continue
            h = path.name
            if not HEX64.match(h) or path.parent.name != h[:2]:
                stats["raw.skipped"] += 1
                continue
            data = path.read_bytes()
            if hashlib.sha256(data).hexdigest() != h:
                stats["raw.bad_hash"] += 1
                problems.append(f"{path}: its sha256 is not its name (not copied)")
                continue
            _put(storage.RAW, f"raw/{h[:2]}/{h}", data, stats, "raw", dry_run, problems)
    rel = var_dir / "releases"
    if rel.is_dir():
        for d in sorted(p for p in rel.iterdir() if p.is_dir() and not p.is_symlink() and VERSION.match(p.name)):
            for f in sorted(p for p in d.iterdir() if p.is_file() and not p.name.startswith(".")):
                _put(storage.RELEASES, storage.release_key(d.name, f.name), f.read_bytes(), stats, "releases", dry_run, problems)
        latest = rel / "latest"
        if latest.is_symlink() and storage.read_pointer() is None:
            version = Path(latest.readlink()).name
            snap = rel / version / "content.json"
            if VERSION.match(version) and snap.exists():
                pointer = {"version": version, "content_hash": hashlib.sha256(snap.read_bytes()).hexdigest(),
                           "snapshot": storage.release_key(version, "content.json"), "updated_at": timezone.now().isoformat(timespec="seconds"),
                           "updated_by": "job:storage_migrate_local", "reason": "migrate_local", "previous": None}
                if not dry_run:
                    storage.write_pointer(pointer)
                stats["pointer.written"] += 1
                log(f"latest → {version}")
    missing = verify(log=log)
    stats["db.missing_raw"], stats["db.missing_snapshots"] = missing
    return stats, problems


def verify(*, log=print, show: int = 10) -> tuple[int, int]:
    """What the database refers to that the store doesn't have. → (raw keys, release snapshots)"""
    from ingest.models import Document, DocumentVersion
    from publish.models import Release

    keys = set(Document.objects.exclude(raw_path="").values_list("raw_path", flat=True)) | set(DocumentVersion.objects.exclude(raw_path="").values_list("raw_path", flat=True))
    missing_raw = sorted(k for k in keys if not storage.exists(storage.RAW, k))
    missing_rel = sorted(r for r in Release.objects.values_list("snapshot_path", flat=True) if not storage.exists(storage.RELEASES, r))
    for k in missing_raw[:show]:
        log(f"  missing raw:{k}")
    for k in missing_rel[:show]:
        log(f"  missing releases:{k}")
    return len(missing_raw), len(missing_rel)


def summary(stats: Counter) -> str:
    return json.dumps(dict(sorted(stats.items())))
