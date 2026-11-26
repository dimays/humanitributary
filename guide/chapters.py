"""The technical guide's chapters, read from `docs/guide/` (docs/guide/README.md).

A chapter is a Markdown file with front matter between `---` lines:

    ---
    title: Ingestion
    summary: One line for the index.
    order: 30
    covers:
      - ingest/**
      - "!ingest/migrations/**"
    ---

Its name is the file name without `.md`. Its stamp (the date it was last
reviewed and the hash of its covered code) lives in `docs/guide/stamps.json`,
keyed by that name, written only by `manage.py guide stamp`. The front matter
is a small subset of YAML, read here, so the guide needs no YAML library.

Standard library only: the hooks and the tests use it without a database.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDE_DIR = ROOT / "docs" / "guide"
STAMPS = GUIDE_DIR / "stamps.json"

# Markdown in docs/guide/ that isn't a chapter: the writers' guide and index.
NOT_CHAPTERS = {"README.md"}
REQUIRED = ("title", "summary", "order", "covers")


class FrontMatterError(ValueError):
    pass


@dataclass(frozen=True)
class Chapter:
    slug: str  # "ingestion"
    path: Path
    title: str
    summary: str
    order: int
    body: str
    covers: tuple[str, ...] = ()
    body_line: int = 1  # where the body starts in the file, for messages

    @property
    def rel(self) -> str:
        return self.path.relative_to(ROOT).as_posix()


def parse_front_matter(text: str) -> tuple[dict, str, int]:
    """(fields, body, the body's first line). Scalars are `key: value`;
    a list is `key:` followed by `  - item` lines."""
    if not text.startswith("---\n"):
        raise FrontMatterError("a chapter starts with front matter between --- lines")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise FrontMatterError("the front matter has no closing ---")
    head, body = text[4:end], text[end + 5:]
    fields: dict = {}
    key = None
    for n, line in enumerate(head.split("\n"), start=2):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        item = re.match(r"^\s+-\s+(.*)$", line)
        if item:
            if key is None or not isinstance(fields.get(key), list):
                raise FrontMatterError(f"line {n}: a list item outside a list")
            fields[key].append(_scalar(item.group(1)))
            continue
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if not m:
            raise FrontMatterError(f"line {n}: expected `key: value`, got {line!r}")
        key, value = m.group(1), m.group(2).strip()
        fields[key] = [] if value == "" else _scalar(value)
    return fields, body, head.count("\n") + 3


def _scalar(value: str) -> str:
    value = re.sub(r"\s+#.*$", "", value.strip()) if not value.strip().startswith(("'", '"')) else value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def load(path: Path, guide_dir: Path = GUIDE_DIR) -> Chapter:
    fields, body, line = parse_front_matter(path.read_text(encoding="utf-8"))
    for required in REQUIRED:
        if required not in fields:
            raise FrontMatterError(f"front matter needs `{required}`")
    if "reviewed" in fields:
        raise FrontMatterError("no `reviewed:` here: the stamp lives in docs/guide/stamps.json (manage.py guide stamp)")
    try:
        order = int(fields["order"])
    except ValueError:
        raise FrontMatterError("`order` must be a whole number") from None
    covers = fields["covers"]
    if isinstance(covers, str):
        covers = [covers]
    return Chapter(
        slug=path.relative_to(guide_dir).with_suffix("").as_posix(),
        path=path,
        title=fields["title"],
        summary=fields["summary"],
        order=order,
        body=body,
        covers=tuple(covers),
        body_line=line,
    )


def files(guide_dir: Path = GUIDE_DIR) -> list[Path]:
    return sorted(p for p in guide_dir.glob("*.md") if p.name not in NOT_CHAPTERS)


def all_chapters(guide_dir: Path = GUIDE_DIR) -> list[Chapter]:
    """Every chapter that reads, in reading order (unreadable ones are the check's to report)."""
    out = []
    for p in files(guide_dir):
        try:
            out.append(load(p, guide_dir))
        except FrontMatterError:
            continue
    return sorted(out, key=lambda c: (c.order, c.slug))


def find(name: str, guide_dir: Path = GUIDE_DIR) -> Chapter | None:
    """A chapter by name ("ingestion") or path ("docs/guide/ingestion.md")."""
    name = name.strip().removeprefix("docs/guide/").removesuffix(".md").strip("/")
    return next((c for c in all_chapters(guide_dir) if c.slug == name), None)


# ── stamps ───────────────────────────────────────────────────────────────


def read_stamps(path: Path = STAMPS) -> dict[str, dict]:
    """{chapter: {"reviewed": "YYYY-MM-DD", "hash": "…12 hex…"}}; {} when there's no file yet."""
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def write_stamps(stamps: dict[str, dict], path: Path = STAMPS) -> None:
    """One chapter a line, sorted, so a stamp changes one line of the diff (and a merge conflict
    here is resolved by re-stamping the chapters both sides touched)."""
    lines = [f"  {json.dumps(k)}: {json.dumps({'reviewed': v['reviewed'], 'hash': v['hash']})}" for k, v in sorted(stamps.items())]
    path.write_text("{\n" + ",\n".join(lines) + "\n}\n", encoding="utf-8")
