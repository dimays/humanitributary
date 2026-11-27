"""Passages: a stored page's clean text split into sentences and ranked against a task, deterministically
(docs/adr/0036-evidence-packs.md). No network, no model: the same text and task always give the same passages.

- `normalize` is the one comparison rule for excerpts: Unicode NFC and runs of whitespace collapsed to one space,
  nothing else (no case folding, no quote or dash mapping). `contains(text, excerpt)` is "verbatim" under it.
- `split` cuts text into paragraphs (lines) and sentences, skipping abbreviations ("U.S.", "Jan.", "Dr."), and cuts a
  sentence longer than `MAX_WORDS` into consecutive pieces. Every passage is an exact slice of the normalized text,
  so a passage, or any run of words inside one, is a verbatim excerpt by construction.
- `Terms` are what a task is about: dates ("June 6", "6 June"), years (or a window of years), numbers, entity labels
  with their QIDs, and title words. `rank` scores each passage by what it matches (3 a date, 2 a year, a number or an
  entity, 1 a title word), keeps those scoring at least `MIN_SCORE`, best first (ties: earlier in the page), and
  annotates each with its matches ("date:June 6", "year:1944", "entity:Normandy (Q8205)", "word:landings").
- `closest` finds the passage nearest an excerpt that isn't on the page, for the 422 that says so.
"""

import difflib
import re
import unicodedata
from dataclasses import dataclass, field

MAX_WORDS = 50      # a longer sentence is cut into pieces of at most this many words
MIN_WORDS = 5       # shorter lines (headings, captions) are not passages
MIN_SCORE = 2
WEIGHTS = {"date": 3, "year": 2, "number": 2, "entity": 2, "word": 1}

MONTHS = ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")
MONTH_RE = "|".join(MONTHS)
ABBREV = {"mr", "mrs", "ms", "dr", "st", "jr", "sr", "gen", "gov", "sen", "rep", "lt", "col", "capt", "sgt", "maj", "adm", "rev", "prof",
          "inc", "corp", "co", "ltd", "no", "nos", "vs", "etc", "e.g", "i.e", "approx", "est", "fig", "vol", "pp", "ca", "c",
          "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec", "u.s", "u.k", "u.n", "d.c", "a.d", "b.c"}
STOPWORDS = {"the", "and", "for", "with", "from", "that", "this", "were", "was", "are", "has", "have", "had", "his", "her", "their", "its",
             "into", "after", "before", "over", "under", "about", "than", "then", "they", "them", "which", "while", "when", "where", "who",
             "will", "would", "been", "being", "also", "more", "most", "such", "other", "some", "said", "says", "says", "amid", "against",
             "between", "during", "since", "until", "upon", "within", "without", "first", "last", "year", "years", "new"}

WS_RE = re.compile(r"\s+")
END_RE = re.compile(r"[.!?…][\"”’)\]]*\s+")
WORD_RE = re.compile(r"\S+")
YEAR_RE = re.compile(r"\b(\d{3,4})(?:\s*(BCE|BC|CE|AD))?\b")
NUMBER_RE = re.compile(r"(?<![\w.])(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(?![\w])")
TOKEN_RE = re.compile(r"[^\W\d_][\w'’-]*", re.U)


def normalize(text: str) -> str:
    """NFC, whitespace collapsed: the only difference an excerpt may have from the page (ADR 0036)."""
    return WS_RE.sub(" ", unicodedata.normalize("NFC", text or "")).strip()


def contains(text: str, excerpt: str) -> bool:
    x = normalize(excerpt)
    return bool(x) and x in normalize(text)


def words(text: str) -> int:
    return len(WORD_RE.findall(text or ""))


@dataclass
class Passage:
    text: str
    position: int  # its order in the page
    score: int = 0
    matches: list = field(default_factory=list)

    def as_json(self) -> dict:
        return {"text": self.text, "score": self.score, "matches": self.matches}


def _sentences(par: str) -> list[str]:
    out, start = [], 0
    for m in END_RE.finditer(par):
        before = par[start:m.start() + 1].rsplit(" ", 1)[-1].rstrip(".").lower().lstrip("(\"“")
        nxt = par[m.end():m.end() + 1]
        if before in ABBREV or (len(before) == 1 and before.isalpha()) or (nxt and not (nxt.isupper() or nxt.isdigit() or nxt in "\"“‘(")):
            continue
        out.append(par[start:m.end()].strip())
        start = m.end()
    if par[start:].strip():
        out.append(par[start:].strip())
    return out


def split(text: str) -> list[Passage]:
    """The page's passages, in order: sentences of each paragraph, long ones cut into pieces, short ones skipped."""
    out = []
    for raw in (text or "").splitlines():
        par = normalize(raw)
        if not par:
            continue
        for s in _sentences(par):
            w = s.split(" ")
            if len(w) < MIN_WORDS:
                continue
            for i in range(0, len(w), MAX_WORDS):
                piece = " ".join(w[i:i + MAX_WORDS])
                if i and len(w) - i < MIN_WORDS:
                    break
                out.append(Passage(piece, len(out)))
    return out


def _num(s: str) -> str:
    return s.replace(",", "").rstrip("0").rstrip(".") if "." in s else s.replace(",", "")


@dataclass
class Terms:
    """What a task is about, for ranking. Built by ingest.prefetch.terms_for(task)."""

    dates: set = field(default_factory=set)      # (month, day)
    years: set = field(default_factory=set)      # ints, BCE negative
    year_range: tuple | None = None              # [from, to) of a content wave's window
    numbers: set = field(default_factory=set)    # normalized digits, not years
    entities: list = field(default_factory=list)  # (label, qid or "")
    words: set = field(default_factory=set)      # lower-case title words

    def add_text_dates(self, text: str):
        """Dates, years and numbers named in a text ("June 6, 1944", "6 June 1944", "37 people")."""
        for m in re.finditer(rf"\b({MONTH_RE})\s+(\d{{1,2}})\b", text or ""):
            self.dates.add((m.group(1), int(m.group(2))))
        for m in re.finditer(rf"\b(\d{{1,2}})\s+({MONTH_RE})\b", text or ""):
            self.dates.add((m.group(2), int(m.group(1))))
        for m in YEAR_RE.finditer(text or ""):
            y = int(m.group(1))
            if m.group(2) in ("BC", "BCE"):
                self.years.add(-y)
            elif 1000 <= y <= 2100 or m.group(2):
                self.years.add(y)
        for m in NUMBER_RE.finditer(text or ""):
            n = _num(m.group(1))
            if not (len(n) == 4 and n.isdigit() and 1000 <= int(n) <= 2100) and n not in ("0", "1") and len(n) >= 2:
                self.numbers.add(n)

    def add_iso(self, iso: str | None):
        m = re.match(r"(-?\d{1,4})-(\d{2})-(\d{2})", iso or "")
        if m:
            self.years.add(int(m.group(1)))
            if m.group(2) != "00" and m.group(3) != "00":
                self.dates.add((MONTHS[int(m.group(2)) - 1], int(m.group(3))))

    def add_words(self, text: str, limit: int = 20):
        for t in TOKEN_RE.findall(text or ""):
            w = t.lower().strip("'’-")
            if len(w) >= 4 and w not in STOPWORDS and len(self.words) < limit:
                self.words.add(w)

    def add_entity(self, label: str, qid: str = ""):
        label = (label or "").strip()
        if len(label) >= 3 and all(label.lower() != e[0].lower() for e in self.entities):
            self.entities.append((label, qid))

    def empty(self) -> bool:
        return not (self.dates or self.years or self.year_range or self.numbers or self.entities or self.words)


def annotate(p: Passage, t: Terms) -> Passage:
    found = []
    text = p.text
    for month, day in sorted(t.dates, key=lambda d: (MONTHS.index(d[0]), d[1])):
        if re.search(rf"\b{month}\s+{day}\b|\b{day}\s+{month}\b", text):
            found.append(("date", f"{month} {day}"))
    seen_years = set()
    for m in YEAR_RE.finditer(text):
        y = int(m.group(1)) * (-1 if m.group(2) in ("BC", "BCE") else 1)
        hit = y in t.years or (t.year_range is not None and t.year_range[0] <= y < t.year_range[1])
        if hit and y not in seen_years:
            seen_years.add(y)
            found.append(("year", f"{abs(y)} BCE" if y < 0 else str(y)))
    nums = {_num(m.group(1)) for m in NUMBER_RE.finditer(text)}
    for n in sorted(nums & t.numbers):
        found.append(("number", n))
    low = text.lower()
    for label, qid in t.entities:
        if re.search(rf"(?<!\w){re.escape(label.lower())}(?!\w)", low):
            found.append(("entity", f"{label} ({qid})" if qid else label))
    toks = {w.lower().strip("'’-") for w in TOKEN_RE.findall(text)}
    for w in sorted(t.words):
        if w in toks or (w.endswith("s") and w[:-1] in toks) or (w + "s") in toks:
            found.append(("word", w))
    p.matches = [f"{k}:{v}" for k, v in found]
    p.score = sum(WEIGHTS[k] for k, _ in found)
    return p


def rank(text: str, terms: Terms, n: int = 5) -> list[Passage]:
    """The `n` best passages of `text` for `terms` (score ≥ MIN_SCORE), best first, ties by position."""
    scored = [annotate(p, terms) for p in split(text)]
    keep = [p for p in scored if p.score >= MIN_SCORE]
    return sorted(keep, key=lambda p: (-p.score, p.position))[:n]


def closest(text: str, excerpt: str, *, max_words: int = 60) -> str:
    """The passage (or two adjacent ones) most like `excerpt`, by word sequence: shown when an excerpt isn't on
    the page, so the agent can copy the real sentence."""
    target = normalize(excerpt).lower().split(" ")
    ps = [p.text for p in split(text)] or [normalize(text)]
    cands = ps + [f"{a} {b}" for a, b in zip(ps, ps[1:])]
    best, best_r = "", -1.0
    for c in cands:
        r = difflib.SequenceMatcher(None, target, c.lower().split(" "), autojunk=False).ratio()
        if r > best_r:
            best, best_r = c, r
    w = best.split(" ")
    return " ".join(w[:max_words]) + (" …" if len(w) > max_words else "")
