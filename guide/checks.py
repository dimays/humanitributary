"""`make check-guide`: the technical guide is whole and true to the code
(docs/guide/README.md, ADR 0014).

1. Every chapter's front matter reads (`title`, `summary`, `order`, `covers`),
   and every `covers` pattern matches a file.
2. Every relative link lands: a file or folder that exists, and, for a link
   to a chapter (or to a heading in the same one), a heading that's there.
3. Every repository path written in backticks exists.
4. The README's chapter list is every chapter, in order.
5. Every chapter's stamp in `stamps.json` is the hash of its covered code as
   it is now, and `stamps.json` names no chapter that's gone. When covered
   code changes, the chapter fails, naming the files and the diff to read,
   until someone reviews it, updates it and runs `make guide-stamp CHAPTER=…`.
"""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

from . import coverage
from .chapters import GUIDE_DIR, ROOT, Chapter, FrontMatterError, files as chapter_files, load, read_stamps

README = GUIDE_DIR / "README.md"
START, END = "<!-- chapters:start -->", "<!-- chapters:end -->"
# A backticked word that may be a path: these endings, or a slash in it.
PATH_LIKE = re.compile(r"^\.?[\w.-]+(/[\w.@-]*)*/?$")
EXTENSIONS = {"py", "mjs", "js", "md", "sh", "json", "html", "plist", "toml", "yml", "yaml", "txt", "css", "lock", "sql", "cfg"}


@dataclass
class Report:
    chapters: list[Chapter] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)
    stale: list[str] = field(default_factory=list)  # slugs

    @property
    def ok(self) -> bool:
        return not self.problems


# ── Markdown, as GitHub reads it ─────────────────────────────────────────


def prose(text: str) -> list[tuple[int, str]]:
    """(line number, line) for every line outside fenced code blocks."""
    out, fence = [], None
    for n, line in enumerate(text.split("\n"), start=1):
        m = re.match(r"^\s*(```+|~~~+)", line)
        if m:
            if fence is None:
                fence = m.group(1)[0] * 3
            elif line.strip().startswith(fence):
                fence = None
            continue
        if fence is None:
            out.append((n, line))
    return out


def anchor(heading: str) -> str:
    """A heading's id as GitHub makes it: lower case, punctuation dropped, spaces to hyphens."""
    text = re.sub(r"`|\*\*|__", "", heading.strip()).lower()
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[^\w\- ]", "", text)
    return text.replace(" ", "-")


def anchors(text: str) -> set[str]:
    seen: dict[str, int] = {}
    out = set()
    for _, line in prose(text):
        m = re.match(r"^#{1,6}\s+(.*?)\s*#*\s*$", line)
        if not m:
            continue
        a = anchor(m.group(1))
        n = seen.get(a, 0)
        out.add(a if n == 0 else f"{a}-{n}")
        seen[a] = n + 1
    return out


def _without_code(line: str) -> str:
    return re.sub(r"`[^`]*`", "", line)


def links(text: str) -> list[tuple[int, str]]:
    """(line, target) of every inline Markdown link outside code."""
    out = []
    for n, line in prose(text):
        for m in re.finditer(r"\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)", _without_code(line)):
            out.append((n, m.group(1)))
    return out


def code_paths(text: str) -> list[tuple[int, str]]:
    """(line, path) of every backticked word outside fences that looks like a repository path."""
    out = []
    for n, line in prose(text):
        for m in re.finditer(r"`([^`\n]+)`", line):
            word = re.sub(r":\d+(-\d+)?$", "", m.group(1).strip())
            if not PATH_LIKE.match(word) or word.startswith(("var/", "./", "../")):
                continue
            if "/" not in word and word.rsplit(".", 1)[-1] not in EXTENSIONS:
                continue
            out.append((n, word))
    return out


# ── the checks ───────────────────────────────────────────────────────────


def _ignored(paths: list[str], root: Path) -> set[str]:
    """Of these paths, the ones git ignores (generated: `site/timeline.html`)."""
    if not paths:
        return set()
    try:
        r = subprocess.run(["git", "check-ignore", "--no-index", "--stdin"], cwd=root, input="\n".join(paths), capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return set()
    return {p.strip() for p in r.stdout.split("\n") if p.strip()}


def check_links(ch: Chapter, by_slug: dict[str, Chapter], files: list[str], root: Path) -> list[str]:
    problems = []
    text = ch.path.read_text(encoding="utf-8")
    known = set(files)
    dirs = {"/".join(f.split("/")[:i]) for f in files for i in range(1, f.count("/") + 1)}
    for n, href in links(text):
        if re.match(r"^[a-z][a-z0-9+.-]*:", href, re.I):  # https:, mailto:
            continue
        target, _, frag = href.partition("#")
        if not target:
            if frag and frag not in anchors(text):
                problems.append(f"✖ {ch.rel}:{n} links to #{frag}, but it has no such heading")
            continue
        path = (ch.path.parent / target).resolve()
        try:
            rel = path.relative_to(root.resolve()).as_posix()
        except ValueError:
            problems.append(f"✖ {ch.rel}:{n} links to {href}, outside the repository")
            continue
        if rel not in known and rel.rstrip("/") not in dirs and not path.exists():
            problems.append(f"✖ {ch.rel}:{n} links to {href}, which isn't there")
            continue
        if frag and path.parent == GUIDE_DIR.resolve() and path.suffix == ".md":
            other = by_slug.get(path.stem)
            if other is not None and frag not in anchors(other.path.read_text(encoding="utf-8")):
                problems.append(f"✖ {ch.rel}:{n} links to {href}, but {other.slug} has no heading #{frag}")
    return problems


def check_paths(ch: Chapter, files: list[str], root: Path) -> list[str]:
    known = set(files)
    dirs = {"/".join(f.split("/")[:i]) for f in files for i in range(1, f.count("/") + 1)}
    top = {f.split("/")[0] for f in files}
    missing = []
    for n, word in code_paths(ch.path.read_text(encoding="utf-8")):
        if word.split("/")[0] not in top:
            continue  # not rooted at the repository (`content.json`, `fetch/parse`)
        if word in known or word.rstrip("/") in dirs or (root / word).exists():
            continue
        missing.append((n, word))
    ignored = _ignored([w for _, w in missing], root)
    return [f"✖ {ch.rel}:{n} names `{w}`, which isn't in the repository" for n, w in missing if w not in ignored]


def chapter_list(chapters: list[Chapter]) -> str:
    return "\n".join(f"{i}. [{c.title}]({c.slug}.md): {c.summary}" for i, c in enumerate(chapters, start=1))


def readme_problem(chapters: list[Chapter], write: bool = False) -> str | None:
    if not README.exists():
        return f"✖ {README.relative_to(ROOT)}: missing"
    text = README.read_text(encoding="utf-8")
    if START not in text or END not in text:
        return f"✖ {README.relative_to(ROOT)}: no {START} … {END} block for the chapter list"
    head, rest = text.split(START, 1)
    tail = rest.split(END, 1)[1]
    want = f"{head}{START}\n{chapter_list(chapters)}\n{END}{tail}"
    if want == text:
        return None
    if write:
        README.write_text(want, encoding="utf-8")
        return None
    return f"✖ {README.relative_to(ROOT)}: the chapter list is out of date (a chapter added, renamed, reordered or resummarized): run make guide-index"


def stale_message(fresh: coverage.Freshness) -> str:
    ch = fresh.chapter
    commit, changes = coverage.changed_since(fresh)
    width = max((len(p) for p, _ in changes), default=0)
    lines = [f"✖ {ch.slug} ({ch.rel}) covers files that changed since it was reviewed"
             + (f" on {fresh.reviewed_on}:" if fresh.stamp else " (it has never been stamped):")]
    shown = changes[:40]
    lines += [f"      {p.ljust(width)}  {how}" for p, how in shown]
    if len(changes) > len(shown):
        lines.append(f"      … and {len(changes) - len(shown)} more")
    paths = " ".join(p for p, how in changes if how != "covered")
    if commit and paths:
        lines.append(f"    What changed: git diff {commit[:10]} -- {paths}")
    elif not fresh.stamp:
        lines.append("    Read the chapter against these files.")
    else:
        some = " ".join(fresh.files[:8]) + (" …" if len(fresh.files) > 8 else "")
        lines.append(f"    (the stamp isn't in git's history yet, so every covered file is listed; git diff HEAD -- {some} shows what's uncommitted)")
    lines.append(f"    Review the chapter, update it, then run: make guide-stamp CHAPTER={ch.slug}")
    return "\n".join(lines)


def run(freshness: bool = True, write_index: bool = False, root: Path = ROOT) -> Report:
    report = Report()
    for path in chapter_files():
        try:
            report.chapters.append(load(path))
        except FrontMatterError as e:
            report.problems.append(f"✖ {path.relative_to(ROOT)}: {e}")
    chapters = sorted(report.chapters, key=lambda c: (c.order, c.slug))
    by_slug = {c.slug: c for c in chapters}
    files = coverage.repo_files(root)
    stamps = read_stamps()

    orders: dict[int, str] = {}
    for ch in chapters:
        if ch.order in orders:
            report.problems.append(f"✖ {ch.rel}: order {ch.order} is taken by {orders[ch.order]}")
        orders[ch.order] = ch.slug
        report.problems += check_links(ch, by_slug, files, root)
        report.problems += check_paths(ch, files, root)

    problem = readme_problem(chapters, write=write_index)
    if problem:
        report.problems.append(problem)
    for slug in sorted(set(stamps) - set(by_slug)):
        report.problems.append(f"✖ docs/guide/stamps.json: stamps {slug!r}, which isn't a chapter: remove its line")

    for ch in chapters:
        fresh = coverage.freshness(ch, files, stamps, root)
        if fresh.empty:
            report.problems.append(f"✖ {ch.rel}: covers {', '.join(fresh.empty)}, which match no files")
        if not ch.covers:
            report.problems.append(f"✖ {ch.rel}: a chapter says what code it covers (`covers:`)")
        elif freshness and not fresh.fresh:
            report.stale.append(ch.slug)
            report.problems.append(stale_message(fresh))
    return report


def summary(report: Report) -> str:
    return f"Guide: {len(report.chapters)} chapters, each reviewed against the code it covers; every link and path resolves."
