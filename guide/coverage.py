"""Which code a chapter covers, and whether it changed since the chapter was
reviewed (docs/guide/README.md, ADR 0020).

A chapter's `covers` are paths and globs (`ingest/**`, `ingest/*.py`, a
directory, `!pattern` to leave something out). The files they match are
hashed as git hashes them (a blob's SHA-1), and the chapter's hash is a
SHA-256 of every matched path and blob, so it changes when any covered file
is added, removed, renamed or edited, and never otherwise (not on a commit
elsewhere, not on a rebase). The stamp in `docs/guide/stamps.json` holds the
date and that hash; `make check-guide` fails while they differ, naming the
files that changed and the `git diff` to read.

The files are the ones git would commit (tracked, plus new ones it doesn't
ignore), so a stamp made before `git add` matches CI.
"""

from __future__ import annotations

import hashlib
import os
import re
import subprocess
from dataclasses import dataclass
from datetime import date
from functools import lru_cache
from pathlib import Path

from .chapters import ROOT, STAMPS, Chapter, read_stamps, write_stamps

SKIP_DIRS = {".git", ".venv", "node_modules", "__pycache__", "staticfiles", "var"}


def _git(*args: str, root: Path = ROOT) -> str | None:
    try:
        out = subprocess.run(["git", *args], cwd=root, capture_output=True, check=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.decode("utf-8", "replace")


def repo_files(root: Path = ROOT) -> list[str]:
    """Every file git would commit (or, without git, every file but the usual build output)."""
    out = _git("ls-files", "-z", "--cached", "--others", "--exclude-standard", root=root)
    if out is not None:
        names = {f for f in out.split("\0") if f}
        return sorted(f for f in names if (root / f).is_file() and not set(f.split("/")) & SKIP_DIRS)
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.endswith(".pyc") or name in (".env", ".DS_Store"):
                continue
            found.append(os.path.relpath(os.path.join(dirpath, name), root).replace(os.sep, "/"))
    return sorted(found)


@lru_cache(maxsize=512)
def _glob(pattern: str) -> re.Pattern:
    out, i = "", 0
    while i < len(pattern):
        if pattern.startswith("**/", i):
            out += "(?:.*/)?"
            i += 3
        elif pattern.startswith("**", i):
            out += ".*"
            i += 2
        elif pattern[i] == "*":
            out += "[^/]*"
            i += 1
        elif pattern[i] == "?":
            out += "[^/]"
            i += 1
        else:
            out += re.escape(pattern[i])
            i += 1
    return re.compile(out + r"\Z")


def matches(pattern: str, path: str) -> bool:
    """Whether a `covers` pattern takes a path: a glob, a file, or a directory (everything in it)."""
    pattern = pattern.strip().rstrip("/")
    if _glob(pattern).match(path):
        return True
    return not any(ch in pattern for ch in "*?") and path.startswith(pattern + "/")


def covered(chapter: Chapter, files: list[str] | None = None) -> tuple[list[str], list[str]]:
    """(the files a chapter covers, the patterns that match nothing)."""
    files = repo_files() if files is None else files
    take = [p for p in chapter.covers if not p.startswith("!")]
    leave = [p[1:] for p in chapter.covers if p.startswith("!")]
    chosen: set[str] = set()
    empty = []
    for p in take:
        hit = {f for f in files if matches(p, f)}
        if not hit:
            empty.append(p)
        chosen |= hit
    chosen = {f for f in chosen if not any(matches(p, f) for p in leave)}
    return sorted(chosen), empty


def blob(path: str, root: Path = ROOT) -> str:
    data = (root / path).read_bytes()
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def fingerprint(paths: list[str], root: Path = ROOT) -> str:
    h = hashlib.sha256()
    for p in paths:
        h.update(f"{blob(p, root)} {p}\n".encode())
    return h.hexdigest()[:12]


@dataclass
class Freshness:
    chapter: Chapter
    files: list[str]
    empty: list[str]
    current: str
    stamp: dict | None  # {"reviewed": …, "hash": …}, or None if never stamped

    @property
    def fresh(self) -> bool:
        return bool(self.stamp) and self.stamp.get("hash") == self.current

    @property
    def reviewed_on(self) -> str:
        return (self.stamp or {}).get("reviewed", "")


def freshness(chapter: Chapter, files: list[str] | None = None, stamps: dict | None = None, root: Path = ROOT) -> Freshness:
    paths, empty = covered(chapter, files)
    stamps = read_stamps() if stamps is None else stamps
    return Freshness(chapter, paths, empty, fingerprint(paths, root), stamps.get(chapter.slug))


def stamped_at(fresh: Freshness, root: Path = ROOT) -> str | None:
    """The commit that recorded the chapter's current stamp, if it's been committed
    (git's pickaxe: the last commit that added or removed that hash in stamps.json)."""
    if not fresh.stamp:
        return None
    rel = STAMPS.relative_to(ROOT).as_posix()
    out = _git("log", "-1", "--format=%H", f"-S{fresh.stamp['hash']}", "--", rel, root=root)
    return (out or "").strip() or None


def changed_since(fresh: Freshness, root: Path = ROOT) -> tuple[str | None, list[tuple[str, str]]]:
    """(the commit to diff from, [(path, how)]): what changed in the covered files
    since the stamp was committed. Without such a commit (a stamp not yet committed,
    a shallow clone, never stamped), every covered file is listed as "covered"."""
    commit = stamped_at(fresh, root)
    if commit:
        then = _git("ls-tree", "-r", "--name-only", commit, root=root) or ""
        before = set(covered(fresh.chapter, [f for f in then.split("\n") if f])[0])
        now = set(fresh.files)
        both = sorted(before & now)
        diff = _git("diff", "--name-only", commit, "--", *both, root=root) if both else ""
        out = [(f, "changed") for f in sorted(x for x in (diff or "").split("\n") if x)]
        out += [(f, "new") for f in sorted(now - before)]
        out += [(f, "removed") for f in sorted(before - now)]
        if out:
            return commit, out
    return commit, [(f, "covered") for f in fresh.files]


def stamp(chapter: Chapter, today: date | None = None) -> dict:
    """Record that the chapter was reviewed against the code as it is now."""
    fresh = freshness(chapter)
    if fresh.empty:
        raise ValueError(f"{chapter.slug}: covers {', '.join(fresh.empty)}, which match no files")
    stamps = read_stamps()
    stamps[chapter.slug] = {"reviewed": (today or date.today()).isoformat(), "hash": fresh.current}
    write_stamps(stamps)
    return stamps[chapter.slug]
