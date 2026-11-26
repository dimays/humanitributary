"""`make check-adr`: the decision records in docs/adr/ agree with each other.

- Each is NNNN-words.md, its title "# NNNN — …" with the same number, and no
  number is taken twice (sessions working at once each reach for the next
  one: the second to merge renumbers).
- Each has a `**Status:**` line starting accepted, proposed, superseded or
  deprecated.
- An ADR whose Status says it amends, supersedes or refines another names it
  with a link, and that other's Status names it back ("amended by [0008](…)"),
  so someone reading the older one knows it has been changed.
- Every link to an ADR, in any ADR or in the index, is to a file that's there.
- docs/adr/README.md's index lists every ADR, with its title and status, in
  order. `--write` regenerates it (`make adr-index`).

Standard library only, so it runs without Django or a database.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ADR_DIR = ROOT / "docs" / "adr"
README = "README.md"
START, END = "<!-- index:start -->", "<!-- index:end -->"
STATUSES = ("accepted", "proposed", "superseded", "deprecated")
VERBS = re.compile(r"\b(amends|supersedes|refines)\b", re.I)
LINK = re.compile(r"\]\((?:\.\./adr/|docs/adr/)?(\d{4}-[a-z0-9-]+\.md)(?:#[^)]*)?\)")


@dataclass
class Adr:
    number: str
    file: str
    title: str
    status: str
    text: str


def load(adr_dir: Path = ADR_DIR) -> tuple[dict[str, Adr], list[str]]:
    """(the ADRs by number, the problems found reading them)."""
    problems: list[str] = []
    adrs: dict[str, Adr] = {}
    for path in sorted(adr_dir.glob("*.md")):
        if path.name == README:
            continue
        m = re.fullmatch(r"(\d{4})-[a-z0-9-]+\.md", path.name)
        if not m:
            problems.append(f"{path.name}: name it NNNN-words.md (lower case, hyphens)")
            continue
        n = m.group(1)
        text = path.read_text(encoding="utf-8")
        if n in adrs:
            problems.append(f"{path.name}: {n} is taken by {adrs[n].file}; renumber the later one")
            continue
        title = re.search(r"^# (\d{4}) — (.+)$", text, re.M)
        if not title or title.group(1) != n:
            problems.append(f'{path.name}: its title should start "# {n} — "')
        status = re.search(r"^\*\*Status:\*\*(.*)$", text, re.M)
        if status is None:
            problems.append(f"{path.name}: no **Status:** line")
        elif not re.match(rf"\s*({'|'.join(STATUSES)})\b", status.group(1), re.I):
            problems.append(f"{path.name}: its Status should start {', '.join(STATUSES[:-1])} or {STATUSES[-1]}")
        adrs[n] = Adr(n, path.name, title.group(2).strip() if title else "", (status.group(1) if status else "").strip(), text)
    return adrs, problems


def cross_check(adrs: dict[str, Adr]) -> list[str]:
    problems = []
    names = {a.file for a in adrs.values()}
    for a in adrs.values():
        for target in LINK.findall(a.text):
            if target not in names:
                problems.append(f"{a.file}: links to {target}, which isn't there")
        # Each clause of the Status line: "amends [0007](…); refines [0004](…)".
        for clause in re.split(r";|\.\s", a.status):
            verb = VERBS.search(clause)
            if not verb:
                continue
            after = clause[verb.start():]
            linked = re.findall(r"\[(\d{4})\]\(", after)
            if not linked:
                problems.append(f"{a.file}: its Status says it {verb.group(1).lower()} another ADR; name it with a link ([NNNN](NNNN-words.md))")
            for y in linked:
                other = adrs.get(y)
                if other is None:
                    continue
                if f"[{a.number}]" not in other.status:
                    past = {"amends": "amended", "supersedes": "superseded", "refines": "refined"}[verb.group(1).lower()]
                    problems.append(f'{other.file}: its Status should name {a.number}, which {verb.group(1).lower()} it ("{past} by [{a.number}]({a.file})")')
    return problems


def status_word(a: Adr) -> str:
    m = re.match(rf"\s*({'|'.join(STATUSES)})\b", a.status, re.I)
    return m.group(1).lower() if m else "?"


def index(adrs: dict[str, Adr]) -> str:
    rows = ["| ADR | Decision | Status |", "|---|---|---|"]
    rows += [f"| [{a.number}]({a.file}) | {a.title} | {status_word(a)} |" for a in sorted(adrs.values(), key=lambda a: a.number)]
    return "\n".join(rows)


def readme_problems(adrs: dict[str, Adr], adr_dir: Path = ADR_DIR, write: bool = False) -> list[str]:
    path = adr_dir / README
    if not path.exists():
        return [f"{README}: missing (the index and the template)"]
    text = path.read_text(encoding="utf-8")
    if START not in text or END not in text:
        return [f"{README}: no {START} … {END} block for the index"]
    head, rest = text.split(START, 1)
    _, tail = rest.split(END, 1)
    want = f"{head}{START}\n{index(adrs)}\n{END}{tail}"
    if want == text:
        return []
    if write:
        path.write_text(want, encoding="utf-8")
        return []
    return [f"{README}: the index is out of date (a new, renamed or retitled ADR, or a changed status): run make adr-index"]


def run(adr_dir: Path = ADR_DIR, write: bool = False) -> tuple[int, list[str]]:
    adrs, problems = load(adr_dir)
    problems += cross_check(adrs)
    problems += readme_problems(adrs, adr_dir, write=write)
    return len(adrs), problems


def main(argv: list[str]) -> int:
    count, problems = run(write="--write" in argv)
    if "--write" in argv:
        print(f"Wrote the index in docs/adr/{README}.")
    if problems:
        print(f"✖ {len(problems)} problem{'s' if len(problems) != 1 else ''} in docs/adr/:", file=sys.stderr)
        print("\n".join(f"  {p}" for p in problems), file=sys.stderr)
        return 1
    print(f"ADRs: {count} records, numbered once each, every amendment named both ways, the index complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
