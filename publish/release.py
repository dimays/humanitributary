"""`manage.py publish`: write the published content as an immutable, versioned release in the `releases` object
store and point `latest` at it (docs/adr/0001, 0016, 0019).

    releases/<version>/content.json    the snapshot (ADR 0007's shape; additive keys per ADR 0018)
    releases/<version>/manifest.json   version, hash, counts, the revision high-water mark
    releases/<version>/changes.json    the change report against the release readers had (publish/changes.py)
    releases/<version>/changes.md      the same, for people
    releases/<version>/timeline.html   the page built from the snapshot (site/build.mjs --from-json)
    releases/latest.json               the pointer: which version readers get. The only object that is ever rewritten.

A release's identity is its content hash and its page hash (`page_hash()`: the files the build reads to make the page
from a snapshot), so a change to the template or the build publishes like a content change, and its change report
says "page changed; content unchanged".

Nothing under releases/<version>/ is overwritten. Rollback is repointing (`publish --rollback <version>`); a new
publish never reuses a version, even one whose files a failed run left behind. `pull_release()` mirrors a release
into var/releases/<version>/ (and var/releases/latest) for the local site build.
"""

import hashlib
import json
import os
from datetime import date
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from infra import storage
from revisions.models import Revision

from . import changes, gates
from .content import dumps
from .export import build_content
from .models import Release

FILES = ("content.json", "manifest.json", "changes.json", "changes.md", "timeline.html")
# What `node site/build.mjs --from-json` reads besides the snapshot, relative to SITE_DIR: the build and the modules it
# imports, the template it fills, and the globe data it inlines. Change one and the page changes with the same content.
PAGE_INPUTS = ("build.mjs", "canonical.mjs", "restructure.mjs", "template.html", "globe-assets.json")


def page_hash(site_dir: Path | None = None) -> str:
    """sha256 over the page's inputs, each as its name, a NUL, its bytes and a NUL (a missing optional file as its
    name and "-"), in PAGE_INPUTS order: the same files give the same hash on any machine."""
    site_dir = Path(site_dir or settings.SITE_DIR)
    h = hashlib.sha256()
    for name in PAGE_INPUTS:
        f = site_dir / name
        h.update(name.encode() + b"\0")
        h.update(f.read_bytes() if f.exists() else b"-")
        h.update(b"\0")
    return h.hexdigest()


def counts(content: dict) -> dict:
    entries = content["branches"] + content["events"]
    return {
        "branches": len(content["branches"]),
        "events": len(content["events"]),
        "citations": sum(len(x.get("cites", [])) + len(x.get("whyCites", [])) + len((x.get("origin") or {}).get("cites", [])) for x in entries),
        "distinct_urls": len({c["u"] for x in entries for c in x.get("cites", []) + x.get("whyCites", []) + (x.get("origin") or {}).get("cites", [])}),
        "locations": sum("geo" in x for x in entries),
        "images": sum(len(x.get("images", [])) for x in entries),
        "connections": sum(len(x.get("connections", [])) for x in entries),
        "origins": sum("origin" in x for x in content["branches"]),
        "single_source_events": sum(bool(e.get("singleSource")) for e in content["events"]),
    }


def _next_version(today: date) -> str:
    """The date, then the release of the day; skipping any number a failed run left files under."""
    prefix = today.strftime("%Y.%m.%d")
    n = Release.objects.filter(version__startswith=prefix + ".").count() + 1
    while Release.objects.filter(version=f"{prefix}.{n}").exists() or storage.exists(storage.RELEASES, storage.release_key(f"{prefix}.{n}", "content.json")):
        n += 1
    return f"{prefix}.{n}"


def live_release() -> tuple[str | None, str | None]:
    """What readers get now: (version, snapshot key) from the pointer, else (before the first pointer) the newest Release."""
    p = storage.read_pointer()
    if p and p.get("version"):
        return p["version"], p.get("snapshot") or storage.release_key(p["version"], "content.json")
    r = Release.objects.order_by("-created_at", "-id").first()
    return (r.version, r.snapshot_path) if r else (None, None)


def _content_at(key: str | None) -> dict | None:
    if not key:
        return None
    try:
        return json.loads(storage.read(storage.RELEASES, key))
    except (FileNotFoundError, OSError):
        return None


def _point(release: Release, *, actor: str, reason: str, previous: str | None):
    storage.write_pointer({
        "version": release.version, "content_hash": release.content_hash, "snapshot": release.snapshot_path,
        "updated_at": timezone.now().isoformat(timespec="seconds"), "updated_by": actor, "reason": reason, "previous": previous,
    })


def _prepare(today: date, skip_gates: tuple[str, ...] = ()) -> dict:
    """Export, run the gates, and build the change report against the live release. Raises gates.PublishRefused."""
    content = build_content()
    body = dumps(content).encode()
    again = dumps(build_content()).encode() if "deterministic" not in skip_gates else None
    problems, build = gates.check(content, body, built=today.isoformat(), again=again, skip=skip_gates)
    if problems:
        raise gates.PublishRefused(problems)
    live, live_key = live_release()
    live_page = Release.objects.filter(version=live).values_list("page_hash", flat=True).first() if live else None
    return {"content": content, "body": body, "digest": hashlib.sha256(body).hexdigest(), "build": build, "live": live,
            "previous": _content_at(live_key), "page_hash": page_hash(), "live_page_hash": live_page or None}


def _unchanged(last: Release | None, digest: str, page: str) -> bool:
    return bool(last and last.content_hash == digest and last.page_hash == page)


def preview(*, today: date | None = None, skip_gates: tuple[str, ...] = ()) -> dict:
    """What `publish` would do now, writing nothing: the gates, the change report against the live release, the two
    hashes, and whether a release would be made (`unchanged_since`: the newest release, when content and page are
    both the same as its). The console shows this before a publish. Raises gates.PublishRefused."""
    today = today or date.today()
    p = _prepare(today, skip_gates)
    last = Release.objects.order_by("-created_at", "-id").first()
    report = changes.report(p["previous"], p["content"], from_version=p["live"], to_version="(unpublished)",
                            page=(p["live_page_hash"], p["page_hash"]))
    return {"report": report, "content_hash": p["digest"], "page_hash": p["page_hash"],
            "unchanged_since": last.version if _unchanged(last, p["digest"], p["page_hash"]) else None}


def check(*, today: date | None = None, skip_gates: tuple[str, ...] = ()) -> dict:
    """`publish --check`: every gate that needs no store, and the change report a release would carry, without
    writing anything. → the report (publish/changes.py). Raises gates.PublishRefused."""
    return preview(today=today, skip_gates=skip_gates)["report"]


def publish(*, actor: str, notes: str = "", force: bool = False, today: date | None = None,
            check_only: bool = False, skip_gates: tuple[str, ...] = ()) -> tuple[Release | None, bool]:
    """Returns (release, created). Unchanged content and an unchanged page (the newest release's two hashes) make no
    new release unless forced; a page-only change is a new release. Raises
    gates.PublishRefused when a gate fails (nothing is written). check_only runs the gates and writes nothing.
    `skip_gates` is for tests that exercise one gate at a time."""
    today = today or date.today()
    if check_only:
        check(today=today, skip_gates=skip_gates)
        return None, False
    content = build_content()
    digest = hashlib.sha256(dumps(content).encode()).hexdigest()
    last = Release.objects.order_by("-created_at", "-id").first()
    if _unchanged(last, digest, page_hash()) and not force:
        return last, False
    p = _prepare(today, skip_gates)
    content, body, digest, build, live, page = p["content"], p["body"], p["digest"], p["build"], p["live"], p["page_hash"]

    version = _next_version(today)
    report = changes.report(p["previous"], content, from_version=live, to_version=version, page=(p["live_page_hash"], page))
    high = Revision.objects.order_by("-id").values_list("id", flat=True).first() or 0
    created_at = timezone.now()
    manifest = {"version": version, "content_hash": digest, "page_hash": page, "created_at": created_at.isoformat(timespec="seconds"), "counts": counts(content),
                "revision_high_water": high, "site_name": settings.SITE_NAME, "notes": notes, "previous": live,
                "changes": report["total"], "files": list(FILES)}
    files = {
        "content.json": body,
        "manifest.json": (json.dumps(manifest, indent=1) + "\n").encode(),
        "changes.json": changes.to_json(report),
        "changes.md": changes.to_markdown(report),
        "timeline.html": build.page,
    }
    for name, data in files.items():
        if name == "timeline.html" and not data:
            continue  # only when the build gate was skipped (tests)
        storage.write(storage.RELEASES, storage.release_key(version, name), data)
    # Gate 4 (report): the report must be beside the snapshot before readers can get it.
    if not storage.exists(storage.RELEASES, storage.release_key(version, "changes.json")):
        raise gates.PublishRefused({"report": [f"changes.json for {version} is not in the store"]})
    with transaction.atomic():
        release = Release.objects.create(
            version=version, created_by=actor, content_hash=digest, page_hash=page, snapshot_path=storage.release_key(version, "content.json"),
            counts=manifest["counts"], revision_high_water=high, notes=notes,
        )
    _point(release, actor=actor, reason="publish", previous=live)
    return release, True


def rollback(version: str, *, actor: str) -> Release:
    """Point `latest` at an earlier release (after checking its snapshot is in the store, unchanged)."""
    release = Release.objects.filter(version=version).first()
    if release is None:
        raise ValueError(f"no release {version}")
    try:
        body = storage.read(storage.RELEASES, release.snapshot_path)
    except (FileNotFoundError, OSError) as e:
        raise ValueError(f"{release.snapshot_path} is not in the releases store") from e
    if hashlib.sha256(body).hexdigest() != release.content_hash:
        raise ValueError(f"{release.snapshot_path} does not match the hash recorded for {version}")
    live = storage.read_pointer()
    _point(release, actor=actor, reason="rollback", previous=(live or {}).get("version"))
    return release


def pull_release(version: str | None = None, dest: Path | None = None) -> tuple[str, Path]:
    """Mirror a release (default: the pointer's) into dest/<version>/ and repoint dest/latest. → (version, its dir)"""
    dest = Path(dest or settings.RELEASES_MIRROR_DIR)
    if version is None:
        p = storage.read_pointer()
        if not p:
            raise ValueError("no releases/latest.json in the store yet: run `manage.py publish` (or `storage migrate_local`)")
        version = p["version"]
    out = dest / version
    out.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        key = storage.release_key(version, name)
        if storage.exists(storage.RELEASES, key):
            data = storage.read(storage.RELEASES, key)
            if not (out / name).exists() or (out / name).read_bytes() != data:
                tmp = out / f".{name}.tmp"
                tmp.write_bytes(data)
                os.replace(tmp, out / name)
    if not (out / "content.json").exists():
        raise ValueError(f"release {version} has no content.json in the store")
    latest = dest / "latest"
    if latest.is_symlink() or latest.exists():
        latest.unlink()
    latest.symlink_to(version)
    return version, out
