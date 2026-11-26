"""Pointers for fill_gap tasks: the `gap_pointers` job (docs/guide/content-waves.md, ADR 0026).

Cheap, deterministic lookups that tell an agent where to start reading for a branch's gap. Never evidence: they go in
the task's payload under `pointers`, marked unread, and an agent cites only what it reads and finds explicit support
in (AGENTS.md rule 5).

- **Wikipedia sections.** The branch's "History of X", "Timeline of X" and "Timeline of X history" pages (and its own
  article), where they exist: one MediaWiki API query for which exist (50 titles a request), then each page's
  section list (`action=parse&prop=sections`), keeping the headings whose years overlap the window ("Military rule
  (1966–1979)", "1920s", "19th century", "c. 500 BC – 200 AD").
- **Lookup hits** from the open-API adapters (`ingest/lookup.py`: LoC, Smithsonian, Europeana, OpenAlex) for
  "History of <branch>" around the window, scored as every lookup is.

Every request goes through `ingest.http.Fetcher` (the source policy, ADR 0013); the API hosts are Wikimedia's.
"""

import re

from django.utils import timezone

from ingest import lookup, wikidata
from work.models import AgentTask

from .waves import KIND

ADAPTERS = ("loc", "smithsonian", "europeana", "openalex")
MAX_SECTIONS = 8
NOTE = ("Unread suggestions from deterministic lookups, not evidence: read a page before citing it, and cite it only "
        "for what it explicitly says.")

TAG = re.compile(r"<[^>]+>")
ERA = r"(BCE|BC|CE|AD)"
RANGE = re.compile(r"(?:c\.\s*)?(\d{1,4})\s*" + ERA + r"?\s*(?:–|—|-|to)\s*(?:c\.\s*)?(\d{1,4}|present)\s*" + ERA + r"?", re.I)
CENTURY = re.compile(r"(\d{1,2})(?:st|nd|rd|th)(?:\s*(?:and|–|-|to)\s*(\d{1,2})(?:st|nd|rd|th))?[\s-]+centur(?:y|ies)(?:\s*" + ERA + r")?", re.I)
DECADE = re.compile(r"\b(\d{2,3}0)s\b(?:\s*" + ERA + r")?", re.I)
YEAR = re.compile(r"\b(\d{1,4})\s*" + ERA + r"\b|\b(\d{3,4})\b", re.I)


def _bc(era: str | None) -> bool:
    return bool(era) and era.upper() in ("BC", "BCE")


def heading_spans(text: str, *, present: float = 9999) -> list[tuple[float, float]]:
    """The year spans a section heading names, as [from, to) pairs (BCE negative). Ranges first, then centuries,
    decades and single years in what is left."""
    t = TAG.sub("", text or "")
    out = []

    def cut(m):
        return t[: m.start()] + " " * (m.end() - m.start()) + t[m.end():]

    for m in list(RANGE.finditer(t)):
        a, ea, b, eb = m.group(1), m.group(2), m.group(3), m.group(4)
        if b.lower() == "present":
            hi = present
        else:
            if len(b) < len(a) and not eb and not _bc(ea):  # "1914–18"
                b = a[: len(a) - len(b)] + b
            hi = float(b)
        lo = float(a)
        if len(a) < 3 and not (ea or eb):
            continue  # "1–2", a numbered list, not years
        if _bc(eb) and not (ea and not _bc(ea)):
            lo, hi = -lo, -hi
        elif _bc(ea):
            lo = -lo
        if hi < lo:
            lo, hi = hi, lo
        out.append((lo, hi + 1))
        t = cut(m)
    for m in list(CENTURY.finditer(t)):
        n1, n2, era = int(m.group(1)), int(m.group(2) or m.group(1)), m.group(3)
        if _bc(era):
            out.append((-max(n1, n2) * 100, -(min(n1, n2) - 1) * 100))
        else:
            out.append(((min(n1, n2) - 1) * 100, max(n1, n2) * 100))
        t = cut(m)
    for m in list(DECADE.finditer(t)):
        d = int(m.group(1))
        out.append((-d - 10, -d) if _bc(m.group(2)) else (d, d + 10))
        t = cut(m)
    for m in YEAR.finditer(t):
        if m.group(1):
            y = int(m.group(1))
            out.append((-y, -y + 1) if _bc(m.group(2)) else (y, y + 1))
        else:
            y = int(m.group(3))
            out.append((y, y + 1))
    return out


def overlaps(spans, ws: float, we: float) -> list[tuple[float, float]]:
    return [(a, b) for a, b in spans if a < we and b > ws]


def candidate_pages(article: str, name: str = "") -> list[str]:
    """The pages to look in: "History of X", "Timeline of X history", "Timeline of X" for the branch's article and
    its name (they differ: "Kingdom of Portugal" vs "Portugal"), then the article itself."""
    out = []
    for a in dict.fromkeys(x.strip() for x in (article, name) if x and x.strip()):
        out += [f"History of {a}", f"Timeline of {a} history", f"Timeline of {a}"]
    return list(dict.fromkeys(out + [article.strip()] if article.strip() else out))


def existing(fetcher, titles: list[str]) -> dict[str, str]:
    """requested title → the page it resolves to, for the titles that exist (50 a request)."""
    out = {}
    titles = list(dict.fromkeys(titles))
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        q = wikidata.api_get(fetcher, {"action": "query", "redirects": "1", "titles": "|".join(batch)}).get("query", {})
        norm = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            target = redir.get(norm.get(t, t), norm.get(t, t))
            p = pages.get(target)
            if p and not p.get("missing") and not p.get("invalid"):
                out[t] = target
    return out


def sections(fetcher, page: str) -> list[dict]:
    data = wikidata.api_get(fetcher, {"action": "parse", "page": page, "prop": "sections", "redirects": "1"})
    return [{"line": TAG.sub("", s.get("line", "")), "anchor": s.get("anchor", ""), "level": s.get("level")} for s in (data.get("parse") or {}).get("sections", [])]


def wikipedia_sections(fetcher, pages: list[str], ws: float, we: float, cache: dict, *, present: float) -> list[dict]:
    out = []
    for page in pages:
        if page not in cache:
            cache[page] = sections(fetcher, page)
        for s in cache[page]:
            hit = overlaps(heading_spans(s["line"], present=present), ws, we)
            if hit:
                out.append({"page": page, "section": s["line"], "url": f"https://en.wikipedia.org/wiki/{page.replace(' ', '_')}#{s['anchor']}",
                            "years": [round(min(a for a, _ in hit)), round(max(b for _, b in hit))]})
    return out[:MAX_SECTIONS]


def lookups(fetcher, name: str, ws: float, we: float, counts=None) -> list[dict]:
    q = lookup.Query(title=f"History of {name}", year=(ws + we) / 2, window=max(1.0, (we - ws) / 2))
    hits = lookup.lookup(fetcher, q, counts=counts, adapters=[lookup.BY_NAME[a] for a in ADAPTERS if a in lookup.BY_NAME])
    return [h.as_json() for h in hits]


def run(ctx) -> None:
    """Queued fill_gap tasks without pointers, best first (`limit` a run, default 20): add `pointers` to each."""
    limit = int(ctx.opt("limit", 20))
    tasks = list(AgentTask.objects.filter(kind=KIND, status="queued").exclude(payload__has_key="pointers").order_by("-priority", "created_at", "id")[:limit])
    if not tasks:
        return
    present = timezone.now().year + 1
    wanted = {}
    for t in tasks:
        b = t.payload.get("branch") or {}
        wanted[t.pk] = candidate_pages(b.get("article") or b.get("name", ""), b.get("name", ""))
    try:
        found = existing(ctx.fetcher, [p for ps in wanted.values() for p in ps])
    except Exception as e:  # Wikipedia down: lookups still run
        ctx.error(f"existence query: {type(e).__name__}: {e}")
        found = {}
    cache = {}
    for t in tasks:
        p = t.payload
        ws, we = p["window"]["from"], p["window"]["to"]
        pages = list(dict.fromkeys(found[x] for x in wanted[t.pk] if x in found))
        errors = []
        try:
            secs = wikipedia_sections(ctx.fetcher, pages, ws, we, cache, present=present)
        except Exception as e:
            errors.append(f"wikipedia: {type(e).__name__}")
            secs = []
        try:
            hits = lookups(ctx.fetcher, p["branch"]["name"], ws, we, counts=ctx.counts)
        except Exception as e:
            errors.append(f"lookups: {type(e).__name__}")
            hits = []
        t.payload = {**p, "pointers": {"note": NOTE, "at": timezone.now().isoformat(timespec="seconds"), "pages": pages,
                                       "wikipedia_sections": secs, "lookups": hits, "errors": errors}}
        t.save(update_fields=["payload"])
        ctx.counts["tasks"] += 1
        ctx.counts["sections"] += len(secs)
        ctx.counts["lookup_hits"] += len(hits)
        if errors:
            ctx.counts["task_errors"] += 1
