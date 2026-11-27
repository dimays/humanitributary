"""`make check-manual`: the Maintainer's Manual (`docs/manual/`) reads as ASD-STE100 Simplified Technical English.

    python3 scripts/check_ste.py            check every Markdown file under docs/manual/
    python3 scripts/check_ste.py FILE...    check these files only

The rules are a subset of ASD-STE100 Issue 9 that a program can check (docs/manual/README.md states them all):

- A sentence in a numbered list (a procedural step) has at most 20 words; any other sentence, at most 25.
- A paragraph (or one list item, or one table cell) has at most 6 sentences.
- No likely passive voice: a form of "be" followed by a past participle ("is written", "are kept").
- No "-ing" words, except the few in ING_ALLOW (words that are not "-ing" forms, and technical names).
- No future or conditional verbs ("will", "would", "shall"): STE text uses the present tense.
- Each file starts with a "# Title" line and then a "Purpose:" line.
- Every relative link lands on a file.
- Each Mermaid block starts with a known diagram type, has balanced brackets and quotes, and closes every
  `subgraph` (flowcharts) or `loop` / `alt` / `opt` / `par` / `rect` / `critical` / `break` / `box`
  (sequence diagrams) with an `end`.

Code blocks, inline code (`like this`), URLs and HTML comments are skipped, so code identifiers stay unchanged; a
table cell that holds only code is skipped. A technical name with a word the rules flag goes in ING_ALLOW or
PASSIVE_ALLOW, with a comment that says why.

Standard library only, like scripts/check_adr.py: it needs no database.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANUAL = ROOT / "docs" / "manual"

STEP_LIMIT = 20    # words in a procedural sentence (a numbered step)
PROSE_LIMIT = 25   # words in a descriptive sentence
PARAGRAPH_LIMIT = 6  # sentences in a paragraph

# Words that end in "-ing" but are not "-ing" forms, and the technical names the manual must use.
ING_ALLOW = {
    "thing", "things", "nothing", "something", "anything", "everything", "string", "strings", "during",
    "bring", "king", "ring", "sing", "spring", "wing", "morning", "evening",
    "warning",          # the STE safety label "WARNING:"
    "staging",          # the Heroku app `humanitributary-staging` and ENVIRONMENT=staging: a technical name
    "troubleshooting",  # the manual's section and file name (troubleshooting.md)
}

# Past participles that are adjectives (a state, not an action) in the manual's technical names.
PASSIVE_ALLOW = {
    "closed",  # STE approved adjective
}

# Words that end in "-ed" but are not past participles.
NOT_PARTICIPLE = {"red", "bed", "need", "needed", "seed", "feed", "speed", "hundred", "shed", "embed", "bred"}

IRREGULAR_PARTICIPLES = {
    "begun", "bound", "broken", "brought", "built", "bought", "caught", "chosen", "done", "drawn", "driven", "eaten",
    "fallen", "fed", "felt", "forbidden", "forgotten", "found", "frozen", "given", "gone", "grown", "held", "hidden",
    "hung", "kept", "known", "laid", "led", "left", "lent", "lost", "made", "meant", "met", "overwritten", "paid",
    "rewritten", "ridden", "risen", "said", "seen", "sent", "shown", "shut", "sold", "sought", "spent", "split",
    "spoken", "stolen", "stood", "struck", "sworn", "taken", "taught", "thrown", "told", "thought", "understood",
    "withdrawn", "won", "worn", "written", "undone", "rebuilt", "redone", "rerun", "set", "put", "run", "cut",
}

BE = r"(?:am|is|are|was|were|be|been|being)"
ADVERB = r"(?:not|also|then|now|only|always|never|still|already|often|usually|all|both|each|\w+ly)"
PASSIVE_RE = re.compile(rf"\b{BE}\s+(?:{ADVERB}\s+)*([a-z]+)\b")
ING_RE = re.compile(r"\b([A-Za-z]+ings?)\b")
FUTURE_RE = re.compile(r"\b(will|would|shall)\b", re.I)

FENCE_RE = re.compile(r"^(\s*)(`{3,}|~{3,})\s*([\w-]*)")
HEADING_RE = re.compile(r"^#{1,6}\s+(.*)$")
STEP_RE = re.compile(r"^(\s*)\d+[.)]\s+(.*)$")
BULLET_RE = re.compile(r"^(\s*)[-*+]\s+(.*)$")
QUOTE_RE = re.compile(r"^\s*>\s?(.*)$")
TABLE_SEP_RE = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$")
LINK_RE = re.compile(r"!?\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
CODE_RE = re.compile(r"(`+)(.+?)\1")
SENTENCE_END_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"'(]|CODE)")

MERMAID_TYPES = {
    "flowchart", "graph", "sequenceDiagram", "erDiagram", "classDiagram", "stateDiagram", "stateDiagram-v2",
    "gantt", "pie", "journey", "gitGraph", "mindmap", "timeline", "quadrantChart", "requirementDiagram",
    "C4Context", "C4Container", "C4Component", "C4Dynamic", "C4Deployment",
    "sankey-beta", "xychart-beta", "block-beta", "architecture-beta",
}
FLOW_DIRECTIONS = {"TB", "TD", "BT", "RL", "LR"}
SEQUENCE_BLOCKS = ("loop", "alt", "opt", "par", "rect", "critical", "break", "box")
ER_CARDINALITY_RE = re.compile(r"(\|o|\|\||\}o|\}\|)(--|\.\.)(o\||\|\||o\{|\|\{)")
SEQ_ARROW_RE = re.compile(r"--?(>>|>|x|\))")
PAIRS = {")": "(", "]": "[", "}": "{"}


@dataclass
class Block:
    """A run of prose the rules count as one paragraph: a paragraph, one list item's part, or a table cell."""
    kind: str  # "step" (numbered list), "prose" (everything else)
    line: int
    parts: list[str] = field(default_factory=list)


def clean(text: str) -> str:
    """Prose without what the rules skip: inline code becomes one word, links their text, URLs and markup go."""
    text = re.sub(r"<!--.*?-->", " ", text)
    text = CODE_RE.sub(" CODE ", text)
    text = LINK_RE.sub(lambda m: m.group(1), text)
    text = re.sub(r"<https?://[^>]+>", " LINK ", text)
    text = re.sub(r"https?://\S+", " LINK ", text)
    text = re.sub(r"</?[a-zA-Z][^>]*>", " ", text)
    text = text.replace("**", "").replace("__", "")
    text = re.sub(r"(?<!\w)\*(?!\s)|(?<!\s)\*(?!\w)", "", text)
    return re.sub(r"\s+", " ", text).strip()


def sentences(text: str) -> list[str]:
    return [s for s in SENTENCE_END_RE.split(text) if words(s)]


def words(sentence: str) -> list[str]:
    return [w for w in sentence.split() if re.search(r"[A-Za-z0-9]", w)]


def word_problems(text: str) -> list[str]:
    """-ing forms, likely passives and future verbs in cleaned text."""
    out = []
    for m in ING_RE.finditer(text):
        w = m.group(1)
        if w.lower() not in ING_ALLOW and w != "CODE":
            out.append(f'"-ing" word "{w}" (STE: no -ing forms; reword, or put a code name in backticks)')
    for m in PASSIVE_RE.finditer(text.lower()):
        p = m.group(1)
        if p in PASSIVE_ALLOW or p in NOT_PARTICIPLE:
            continue
        if (p.endswith("ed") and len(p) > 3) or p in IRREGULAR_PARTICIPLES:
            out.append(f'likely passive voice "{m.group(0)}" (STE: use the active voice)')
    for m in FUTURE_RE.finditer(text):
        out.append(f'future or conditional verb "{m.group(1)}" (STE: use the present tense)')
    return out


def check_block(block: Block, path: str) -> list[str]:
    text = clean(" ".join(block.parts))
    if not text:
        return []
    out = []
    limit = STEP_LIMIT if block.kind == "step" else PROSE_LIMIT
    found = sentences(text)
    for s in found:
        n = len(words(s))
        if n > limit:
            what = "procedural sentence (a numbered step)" if block.kind == "step" else "sentence"
            out.append(f"{path}:{block.line}: {what} has {n} words (limit {limit}): \"{' '.join(s.split()[:8])} …\"")
    if len(found) > PARAGRAPH_LIMIT:
        out.append(f"{path}:{block.line}: paragraph has {len(found)} sentences (limit {PARAGRAPH_LIMIT})")
    out += [f"{path}:{block.line}: {p}" for p in word_problems(text)]
    return out


def table_cells(line: str) -> list[str]:
    """A table row's cells; a `|` inside inline code is not a cell edge."""
    shielded = CODE_RE.sub(lambda m: m.group(0).replace("|", "\0"), line.strip())
    cells = shielded.strip("|").split("|")
    return [c.replace("\0", "|").strip() for c in cells]


def check_mermaid(lines: list[str], start: int, path: str) -> list[str]:
    """A basic sanity check: a known diagram type, balanced brackets and quotes, and every block closed."""
    out = []
    body = [(start + i, ln) for i, ln in enumerate(lines) if ln.strip() and not ln.strip().startswith("%%")]
    if not body:
        return [f"{path}:{start}: Mermaid block is empty"]
    first_no, first = body[0]
    head = first.split()
    kind = head[0]
    if kind not in MERMAID_TYPES:
        return [f"{path}:{first_no}: Mermaid block starts with {kind!r}, not a known diagram type"]
    if kind in ("flowchart", "graph") and len(head) > 1 and head[1] not in FLOW_DIRECTIONS:
        out.append(f"{path}:{first_no}: flowchart direction {head[1]!r} is not one of {', '.join(sorted(FLOW_DIRECTIONS))}")
    opened = 0
    stack: list[tuple[str, int, str]] = []  # open brackets: an erDiagram entity's { … } spans lines
    for no, ln in body[1:]:
        text = ln
        if kind == "erDiagram":
            text = ER_CARDINALITY_RE.sub(" ", text)
        if kind == "sequenceDiagram":
            text = SEQ_ARROW_RE.sub(" ", text)
        if text.count('"') % 2:
            out.append(f"{path}:{no}: unbalanced double quote in a Mermaid line")
            continue
        outside = re.sub(r'"[^"]*"', '""', text)
        for ch in outside:
            if ch in "([{":
                stack.append((ch, no, ln))
            elif ch in ")]}":
                if not stack or stack[-1][0] != PAIRS[ch]:
                    out.append(f"{path}:{no}: unbalanced brackets in a Mermaid line: {ln.strip()[:60]}")
                    stack.clear()
                    break
                stack.pop()
        word = ln.strip().split()[0] if ln.strip() else ""
        if (kind in ("flowchart", "graph") and word == "subgraph") or (kind == "sequenceDiagram" and word in SEQUENCE_BLOCKS):
            opened += 1
        elif word == "end" and kind in ("flowchart", "graph", "sequenceDiagram"):
            opened -= 1
            if opened < 0:
                out.append(f"{path}:{no}: `end` without an open block in a Mermaid diagram")
                opened = 0
    for _, no, ln in stack[:1]:
        out.append(f"{path}:{no}: unbalanced brackets in a Mermaid line: {ln.strip()[:60]}")
    if opened > 0:
        out.append(f"{path}:{start}: {opened} Mermaid block(s) not closed with `end`")
    return out


def check_text(text: str, path: str = "<text>", base: Path | None = None) -> tuple[int, list[str]]:
    """→ (sentences counted, problems) for one Markdown file's text. `base`: the folder relative links start from."""
    lines = text.splitlines()
    problems: list[str] = []
    counted = 0
    block: Block | None = None
    list_kind: str | None = None  # the kind of the list the next indented line belongs to
    fence: tuple[str, str, int, list[str]] | None = None  # (marker, language, first line, lines)
    in_comment = False

    def flush():
        nonlocal block, counted
        if block is not None:
            counted += len(sentences(clean(" ".join(block.parts))))
            problems.extend(check_block(block, path))
        block = None

    nonblank = [(i, ln) for i, ln in enumerate(lines, 1) if ln.strip()]
    if not nonblank or not re.match(r"^#\s+\S", nonblank[0][1]):
        problems.append(f"{path}:1: the file must start with a '# Title' line")
    elif len(nonblank) < 2 or not re.match(r"^(\*\*)?Purpose:(\*\*)?\s+\S", nonblank[1][1]):
        problems.append(f"{path}:{nonblank[0][0]}: the line after the title must be the file's purpose ('Purpose: …')")

    for no, raw in enumerate(lines, 1):
        if fence is not None:
            m = FENCE_RE.match(raw)
            if m and m.group(2)[0] == fence[0][0] and len(m.group(2)) >= len(fence[0]) and not m.group(3):
                if fence[1] == "mermaid":
                    problems.extend(check_mermaid(fence[3], fence[2] + 1, path))
                fence = None
            else:
                fence[3].append(raw)
            continue
        if in_comment:
            if "-->" in raw:
                in_comment = False
            continue
        if raw.strip().startswith("<!--") and "-->" not in raw:
            in_comment = True
            continue
        m = FENCE_RE.match(raw)
        if m:
            fence = (m.group(2), m.group(3), no, [])
            continue
        for lm in LINK_RE.finditer(CODE_RE.sub("", raw)):
            target = lm.group(2)
            if base is not None and not re.match(r"^(https?:|mailto:|#)", target):
                if not (base / target.split("#")[0]).exists():
                    problems.append(f"{path}:{no}: link to {target!r} does not land on a file")
        line = raw.rstrip()
        if not line.strip():
            flush()
            continue
        if HEADING_RE.match(line):
            flush()
            list_kind = None
            problems.extend(f"{path}:{no}: {p}" for p in word_problems(clean(HEADING_RE.match(line).group(1))))
            continue
        if line.lstrip().startswith("|"):
            flush()
            if TABLE_SEP_RE.match(line):
                continue
            for cell in table_cells(line):
                b = Block("prose", no, [cell])
                counted += len(sentences(clean(cell)))
                problems.extend(check_block(b, path))
            continue
        q = QUOTE_RE.match(line)
        if q:
            if block is None or block.kind != "prose" or not block.parts:
                flush()
                block = Block("prose", no)
            if not q.group(1).strip():
                flush()
                continue
            block.parts.append(q.group(1))
            continue
        s = STEP_RE.match(line)
        b = BULLET_RE.match(line)
        if s or b:
            flush()
            kind = "step" if s else "prose"
            if not line.startswith((" ", "\t")):
                list_kind = kind
            block = Block(kind, no, [(s or b).group(2)])
            continue
        indented = line.startswith(("  ", "\t"))
        if block is not None:
            block.parts.append(line.strip())
            continue
        if indented and list_kind:
            block = Block(list_kind, no, [line.strip()])
            continue
        list_kind = None
        block = Block("prose", no, [line.strip()])
    flush()
    if fence is not None:
        problems.append(f"{path}:{fence[2]}: code block is not closed")
    return counted, problems


def files_under(root: Path) -> list[Path]:
    return sorted(root.rglob("*.md"))


def run(paths: list[Path] | None = None, root: Path = MANUAL) -> tuple[int, int, list[str]]:
    """→ (files, sentences, problems)."""
    paths = paths if paths is not None else files_under(root)
    problems, counted = [], 0
    for p in paths:
        try:
            rel = p.resolve().relative_to(ROOT).as_posix()
        except ValueError:
            rel = p.as_posix()
        n, found = check_text(p.read_text(encoding="utf-8"), rel, base=p.parent)
        counted += n
        problems += found
    return len(paths), counted, problems


def main(argv: list[str]) -> int:
    paths = [Path(a) for a in argv] if argv else None
    if paths is None and not MANUAL.is_dir():
        print(f"✖ {MANUAL.relative_to(ROOT)} is missing", file=sys.stderr)
        return 1
    n, counted, problems = run(paths)
    for p in problems:
        print(f"✖ {p}")
    if problems:
        print(f"\n✖ {len(problems)} problem(s) in the manual's STE (docs/manual/README.md states the rules).", file=sys.stderr)
        return 1
    print(f"✔ The manual reads as STE: {n} files, {counted} sentences.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
