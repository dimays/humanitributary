"""Release gates: what must hold before `manage.py publish` writes a release (docs/adr/0019-processes-and-
release-gates.md). Each gate returns a list of problems; publish refuses while any is non-empty.

1. **build**: the site's own build accepts the snapshot (`node site/build.mjs --from-json … --check` finds no
   errors) and builds the page from it.
2. **contested**: no published entry has a contested record claim unless its text says the sources differ
   (evidence.publishing.unflagged_contested, the publishing rule's first half, ADR 0010).
3. **roundtrip**: the site reads the snapshot back byte for byte (`--from-json` → `--dump-json` gives the same
   bytes), and, given the legacy dump (before the cutover, `make publish` passes var/legacy.json), the snapshot
   minus its additive keys equals the dump exactly (ADR 0007 as amended by ADR 0018).
4. **report**: the change report is written next to the snapshot; publish checks it is there before it moves the
   `latest` pointer (release.py), so a release without its report is never what readers get.
"""

import json
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from django.conf import settings

from evidence.publishing import unflagged_contested
from timeline.models import Entry

from .compare import differences
from .content import dumps, legacy_view


class PublishRefused(Exception):
    def __init__(self, problems: dict[str, list[str]]):
        self.problems = problems
        lines = [f"{gate}: {p}" for gate, ps in problems.items() for p in ps[:20]]
        super().__init__("publish refused:\n  " + "\n  ".join(lines))


@dataclass
class Build:
    ok: bool
    problems: list[str] = field(default_factory=list)
    page: bytes = b""
    redump: bytes = b""


def node_build(body: bytes, built: str) -> Build:
    """Check, re-dump and build the page from a snapshot with the site's own build (needs Node)."""
    node = shutil.which("node")
    if not node:
        return Build(False, ["Node is not installed: the site's build can't check the snapshot"])
    script = str(settings.SITE_DIR / "build.mjs")
    with tempfile.TemporaryDirectory(prefix="publish-") as tmp:
        t = Path(tmp)
        (t / "content.json").write_bytes(body)
        dump = subprocess.run([node, script, "--from-json", str(t / "content.json"), "--dump-json", str(t / "redump.json")], capture_output=True, text=True)
        if dump.returncode != 0:
            errors = [ln for ln in dump.stdout.splitlines() + dump.stderr.splitlines() if ln.startswith("✗") or "Not dumping" in ln]
            return Build(False, errors[:50] or [dump.stderr.strip()[-500:] or f"build.mjs exited {dump.returncode}"])
        page = subprocess.run([node, script, "--from-json", str(t / "content.json"), "--built", built, "--out", str(t / "timeline.html")], capture_output=True, text=True)
        if page.returncode != 0:
            return Build(False, [page.stderr.strip()[-500:] or f"build.mjs exited {page.returncode}"])
        return Build(True, [], (t / "timeline.html").read_bytes(), (t / "redump.json").read_bytes())


def contested(content: dict) -> list[str]:
    ids = [x["id"] for x in content["branches"] + content["events"]]
    out = []
    for entry in Entry.objects.filter(slug__in=ids, claims__parent__isnull=True, claims__status="contested").distinct().order_by("slug"):
        out += [f"{entry.slug}: {p}" for p in unflagged_contested(entry)]
    return out


def roundtrip(content: dict, body: bytes, build: Build, legacy: Path | None) -> list[str]:
    out = []
    if build.ok and build.redump != body:
        out.append("the site's build does not read the snapshot back byte for byte (site/canonical.mjs and publish/content.py KEYS differ?)")
    if legacy is not None:
        if not legacy.exists():
            return out + [f"{legacy} does not exist (make dump)"]
        raw = legacy.read_bytes()
        view = legacy_view(content)
        diffs = differences(json.loads(raw), view)
        if diffs:
            out += [f"differs from {legacy.name}: {d}" for d in diffs[:10]] + ([f"… {len(diffs) - 10} more"] if len(diffs) > 10 else [])
            out.append("run `make import` (it re-dumps data/*.js) before publishing, or publish without --legacy after the cutover")
        elif dumps(view).encode() != raw:
            out.append(f"equal to {legacy.name} after normalizing, but not byte for byte")
    return out


def check(content: dict, body: bytes, *, built: str, legacy: Path | None = None, skip: tuple[str, ...] = ()) -> tuple[dict[str, list[str]], Build]:
    """Run every gate. → ({gate: problems} for the gates that failed, the build)"""
    build = node_build(body, built) if "build" not in skip else Build(True, [], b"", body)
    found = {
        "build": [] if "build" in skip else build.problems,
        "contested": [] if "contested" in skip else contested(content),
        "roundtrip": [] if "roundtrip" in skip else roundtrip(content, body, build, legacy),
    }
    return {k: v for k, v in found.items() if v}, build
