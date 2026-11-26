"""Release gates: what must hold before `manage.py publish` writes a release (docs/adr/0019-processes-and-release-
gates.md, amended at the cutover by docs/adr/0020-the-cutover.md). Each gate returns a list of problems; publish
refuses while any is non-empty.

1. **deterministic**: exporting the same rows twice gives the same bytes (publish/export.py reads rows alone, in a
   fixed order), so a release's hash says whether anything changed.
2. **build**: the site's own build accepts the snapshot (`node site/build.mjs --from-json … --check` finds no
   errors), reads it back byte for byte (`--dump-json` of it equals it: site/canonical.mjs and publish/content.py
   agree) and builds the page from it.
3. **contested**: no published entry has a contested record claim unless its text says the sources differ
   (evidence.publishing.unflagged_contested, the publishing rule's first half, ADR 0010).
4. **report**: the change report against the release readers have (publish/changes.py) is computed with the gates
   (so `--check` shows it) and written next to the snapshot; publish checks it is in the store before it moves the
   `latest` pointer (release.py), so a release without its report is never what readers get.

Before the cutover a fifth gate compared the snapshot with a dump of the legacy files; Postgres is the only source
now, so there is nothing to compare it with (ADR 0020).
"""

import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

from django.conf import settings

from evidence.publishing import unflagged_contested
from timeline.models import Entry

from .content import dumps

GATES = ("deterministic", "build", "contested", "report")


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


def _errors(r: subprocess.CompletedProcess) -> list[str]:
    lines = [ln for ln in r.stdout.splitlines() + r.stderr.splitlines() if ln.startswith("✗") or "Not dumping" in ln or "Not building" in ln]
    return lines[:50] or [r.stderr.strip()[-500:] or f"build.mjs exited {r.returncode}"]


def node_build(body: bytes, built: str) -> Build:
    """Check, read back and build the page from a snapshot with the site's own build (needs Node)."""
    node = shutil.which("node")
    if not node:
        return Build(False, ["Node is not installed: the site's build can't check the snapshot"])
    script = str(settings.SITE_DIR / "build.mjs")
    with tempfile.TemporaryDirectory(prefix="publish-") as tmp:
        t = Path(tmp)
        snap = str(t / "content.json")
        (t / "content.json").write_bytes(body)
        check = subprocess.run([node, script, "--from-json", snap, "--check"], capture_output=True, text=True)
        if check.returncode != 0:
            return Build(False, _errors(check))
        dump = subprocess.run([node, script, "--from-json", snap, "--dump-json", str(t / "redump.json")], capture_output=True, text=True)
        if dump.returncode != 0:
            return Build(False, _errors(dump))
        redump = (t / "redump.json").read_bytes()
        if redump != body:
            return Build(False, ["the site's build does not read the snapshot back byte for byte (site/canonical.mjs and publish/content.py KEYS differ?)"])
        page = subprocess.run([node, script, "--from-json", snap, "--built", built, "--out", str(t / "timeline.html")], capture_output=True, text=True)
        if page.returncode != 0:
            return Build(False, _errors(page))
        return Build(True, [], (t / "timeline.html").read_bytes(), redump)


def deterministic(body: bytes, again: bytes) -> list[str]:
    if body == again:
        return []
    a, b = body.decode().splitlines(), again.decode().splitlines()
    first = next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))
    return [f"two exports of the same rows differ (first at line {first + 1}): the export must read rows alone, in a fixed order"]


def contested(content: dict) -> list[str]:
    ids = [x["id"] for x in content["branches"] + content["events"]]
    out = []
    for entry in Entry.objects.filter(slug__in=ids, claims__parent__isnull=True, claims__status="contested").distinct().order_by("slug"):
        out += [f"{entry.slug}: {p}" for p in unflagged_contested(entry)]
    return out


def check(content: dict, body: bytes, *, built: str, again: bytes | None = None, skip: tuple[str, ...] = ()) -> tuple[dict[str, list[str]], Build]:
    """Run the gates that need no store (deterministic, build, contested). `again` is a second export of the same
    rows (publish makes it). → ({gate: problems} for the gates that failed, the build)"""
    build = node_build(body, built) if "build" not in skip else Build(True, [], b"", body)
    found = {
        "deterministic": [] if "deterministic" in skip or again is None else deterministic(body, again),
        "build": [] if "build" in skip else build.problems,
        "contested": [] if "contested" in skip else contested(content),
    }
    return {k: v for k, v in found.items() if v}, build
