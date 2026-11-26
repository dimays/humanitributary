"""`manage.py publish`: write the published content to var/releases/<version>/content.json and record a Release."""

import hashlib
import json
from datetime import date
from pathlib import Path

from django.conf import settings
from django.db import transaction

from revisions.models import Revision

from .content import dumps
from .export import build_content
from .models import Release


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
    }


def _next_version(today: date) -> str:
    prefix = today.strftime("%Y.%m.%d")
    n = Release.objects.filter(version__startswith=prefix + ".").count() + 1
    return f"{prefix}.{n}"


def publish(*, actor: str, notes: str = "", force: bool = False, today: date | None = None) -> tuple[Release, bool]:
    """Returns (release, created). Unchanged content makes no new release unless forced."""
    content = build_content()
    body = dumps(content).encode()
    digest = hashlib.sha256(body).hexdigest()
    last = Release.objects.order_by("-created_at", "-id").first()
    if last and last.content_hash == digest and not force:
        return last, False
    with transaction.atomic():
        version = _next_version(today or date.today())
        rel_dir = Path("releases") / version
        out = settings.VAR_DIR / rel_dir
        out.mkdir(parents=True, exist_ok=False)
        (out / "content.json").write_bytes(body)
        high = Revision.objects.order_by("-id").values_list("id", flat=True).first() or 0
        release = Release.objects.create(
            version=version, created_by=actor, content_hash=digest, snapshot_path=str(rel_dir / "content.json"),
            counts=counts(content), revision_high_water=high, notes=notes,
        )
        manifest = {"version": version, "content_hash": digest, "created_at": release.created_at.isoformat(), "counts": release.counts,
                    "revision_high_water": high, "site_name": settings.SITE_NAME, "notes": notes}
        (out / "manifest.json").write_text(json.dumps(manifest, indent=1) + "\n")
        latest = settings.VAR_DIR / "releases" / "latest"
        if latest.is_symlink() or latest.exists():
            latest.unlink()
        latest.symlink_to(version)
    return release, True
