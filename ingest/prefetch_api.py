"""Official APIs for the pages whose human web pages refuse a job (docs/adr/0036-evidence-packs.md).

The lookup adapters (ingest/lookup.py) point at catalog pages: an OpenAlex work page, a DOI, a Library of Congress
item, a Smithsonian record (siris-libraries.si.edu, an n2t.net ARK, repository.si.edu), a Europeana item. Their
robots.txt or bot walls refuse scripts, but each has a published API whose terms allow what we do. `route()` maps
such a URL (and the lookup hit's ids, when the task has them) to that API; `render()` turns its JSON into the text
the pack stores: what the API returns and its terms allow, never more. The page stored is marked `via: api`: it is
the record, not the page, so `complete` doesn't refuse an excerpt that isn't in it (the page itself may say more).

| API | For | Stored | Terms relied on (ingest/seed.py VERDICTS, ADR 0013) |
|---|---|---|---|
| api.openalex.org | openalex.org works; DOIs (doi.org) first | title, venue, year, authors, the abstract, the open-access link | "ALLOW: CC0 metadata, keyless …; descriptive User-Agent" |
| api.crossref.org | DOIs OpenAlex doesn't have | title, venue, date, publisher, type (no abstract) | "ALLOW: public pool, 1 request a second …; titles as snippets (not abstracts)" |
| www.loc.gov `?fo=json` | loc.gov item and resource pages | title, date, contributors, summary, description, notes, subjects | "ALLOW: loc.gov/legal, no more than 10 requests a minute …; uses … ?fo=json" |
| api.si.edu (key) | Smithsonian records (the hit's EDAN id) | title, the record's free-text fields (notes, dates, names, physical description) | "ALLOW: Open Access API (api.data.gov key …), CC0 metadata; store metadata only" |
| api.europeana.eu (key) | Europeana items | title, description, date, creator, provider | "ALLOW: … key in the X-Api-Key header …; metadata CC0, media per edm:rights" |

Keys go in headers (never URLs), as the adapters send them. Without its key a route is skipped (`api_key_missing`).
"""

import re
from dataclasses import dataclass, field
from urllib.parse import quote, urlsplit

from django.conf import settings

CLAUSES = {
    "openalex": "openalex.org verdict: ALLOW, CC0 metadata, keyless; descriptive User-Agent",
    "crossref": "crossref.org verdict: ALLOW, public pool, 1 request a second; titles as snippets, not abstracts",
    "loc": "loc.gov verdict: ALLOW (loc.gov/legal), at most 10 requests a minute, ?fo=json",
    "smithsonian": "si.edu verdict: ALLOW, Open Access API with an api.data.gov key, CC0 metadata, metadata only",
    "europeana": "europeana.eu verdict: ALLOW, key in the X-Api-Key header, metadata CC0",
}
DOI_RE = re.compile(r"^(?:https?://(?:dx\.)?doi\.org/|doi:)(10\.\d{4,9}/\S+)$", re.I)
OPENALEX_RE = re.compile(r"^https?://(?:api\.)?openalex\.org/(?:works/)?(W\d+)", re.I)
LOC_RE = re.compile(r"^https?://(?:www\.)?loc\.gov/(item|resource)/[^?#]+", re.I)
EUROPEANA_RE = re.compile(r"^https?://(?:www\.)?europeana\.eu/(?:[a-z]{2}/)?item(/\d+/[^?#/]+)", re.I)


@dataclass
class Route:
    name: str            # openalex, crossref, loc, smithsonian, europeana
    api_url: str
    headers: dict = field(default_factory=dict)
    fallback: "Route | None" = None

    @property
    def clause(self) -> str:
        return CLAUSES[self.name]


def _key(setting: str) -> dict | None:
    v = getattr(settings, setting, "")
    return {"X-Api-Key": v} if v else None


def route(url: str, hit: dict | None = None) -> Route | None | str:
    """The API for a catalog page, None when there is none, or "api_key_missing"."""
    hit = hit or {}
    ids = hit.get("ids") or {}
    adapter = hit.get("adapter", "")
    m = OPENALEX_RE.match(url) or (OPENALEX_RE.match(ids.get("openalex") or "") if adapter == "openalex" else None)
    if m:
        return Route("openalex", f"https://api.openalex.org/works/{m.group(1)}")
    doi = DOI_RE.match(url)
    doi = doi.group(1) if doi else (ids.get("doi") or "").split("doi.org/")[-1] if adapter in ("crossref", "openalex") and ids.get("doi") else ""
    if doi:
        q = quote(doi, safe="/:.()-_;")
        return Route("openalex", f"https://api.openalex.org/works/doi:{q}", fallback=Route("crossref", f"https://api.crossref.org/works/{q}"))
    if LOC_RE.match(url):
        return Route("loc", LOC_RE.match(url).group(0).replace("http://", "https://") + "?fo=json")
    host = (urlsplit(url).hostname or "").lower()
    if adapter == "smithsonian" or host.endswith("si.edu") or host == "n2t.net":
        if not ids.get("si"):
            return None
        h = _key("SMITHSONIAN_API_KEY")
        return Route("smithsonian", f"https://api.si.edu/openaccess/api/v1.0/content/{quote(ids['si'], safe=':-_.')}", h) if h else "api_key_missing"
    m = EUROPEANA_RE.match(url)
    rid = m.group(1) if m else (ids.get("europeana") if adapter == "europeana" else "")
    if rid:
        h = _key("EUROPEANA_API_KEY")
        return Route("europeana", f"https://api.europeana.eu/record/v2{rid}.json", h) if h else "api_key_missing"
    return None


# ── rendering: the API's JSON → (title, text) ────────────────────────────────────────────────────────────────────

def _s(v) -> str:
    if v is None:
        return ""
    if isinstance(v, list):
        return "; ".join(x for x in (_s(i) for i in v) if x)
    if isinstance(v, dict):
        for k in ("def", "en", "content", "display_name", "name", "label", "value"):
            if k in v:
                return _s(v[k])
        return "; ".join(x for x in (_s(i) for i in v.values()) if x)
    return " ".join(str(v).split())


def abstract(inverted: dict | None) -> str:
    """OpenAlex keeps abstracts as an inverted index (word → positions): back to text."""
    if not inverted:
        return ""
    pos = sorted((p, w) for w, ps in inverted.items() for p in ps)
    return " ".join(w for _, w in pos)


def _lines(title: str, rows: list[tuple[str, str]], body: list[str]) -> str:
    out = [title] if title else []
    out += [f"{k}: {v}" for k, v in rows if v]
    out += [b for b in body if b]
    return "\n".join(out)


def render(name: str, data: dict) -> tuple[str, str]:
    if name == "openalex":
        title = _s(data.get("display_name") or data.get("title"))
        loc = data.get("primary_location") or {}
        venue = _s((loc.get("source") or {}).get("display_name"))
        authors = ", ".join(_s((a.get("author") or {}).get("display_name")) for a in (data.get("authorships") or [])[:6])
        oa = _s((data.get("open_access") or {}).get("oa_url"))
        rows = [("Published", " ".join(x for x in (venue, str(data.get("publication_year") or "")) if x)), ("Authors", authors),
                ("DOI", _s(data.get("doi"))), ("Open access", oa)]
        return title, _lines(title, rows, [abstract(data.get("abstract_inverted_index"))])
    if name == "crossref":
        m = data.get("message") or data
        title = _s((m.get("title") or [""])[0] if isinstance(m.get("title"), list) else m.get("title"))
        parts = ((m.get("issued") or {}).get("date-parts") or [[None]])[0]
        date = "-".join(str(p) for p in parts if p)
        rows = [("Published in", _s((m.get("container-title") or [""])[0] if isinstance(m.get("container-title"), list) else m.get("container-title"))),
                ("Date", date), ("Publisher", _s(m.get("publisher"))), ("Type", _s(m.get("type"))), ("DOI", _s(m.get("DOI")))]
        return title, _lines(title, rows, [])
    if name == "loc":
        it = data.get("item") or {}
        title = _s(it.get("title"))
        rows = [("Date", _s(it.get("date"))), ("Contributors", _s(it.get("contributor_names"))), ("Subjects", _s(it.get("subject_headings")))]
        return title, _lines(title, rows, [_s(it.get("summary")), _s(it.get("description")), _s(it.get("notes"))])
    if name == "smithsonian":
        r = data.get("response") or {}
        c = r.get("content") or {}
        title = _s(r.get("title") or (c.get("descriptiveNonRepeating") or {}).get("title"))
        ft = c.get("freetext") or {}
        rows = [(lbl.capitalize(), _s([x.get("content") for x in ft.get(k, []) if isinstance(x, dict)]))
                for k, lbl in (("date", "date"), ("name", "names"), ("place", "place"), ("publisher", "publisher"), ("physicalDescription", "physical description"))]
        notes = [_s(x.get("content")) for x in ft.get("notes", []) if isinstance(x, dict)]
        return title, _lines(title, rows, notes)
    if name == "europeana":
        o = data.get("object") or {}
        proxies = o.get("proxies") or [{}]
        p = next((x for x in proxies if x.get("dcTitle")), proxies[0])
        title = _s(p.get("dcTitle") or o.get("title"))
        rows = [("Date", _s(p.get("dcDate") or p.get("dctermsCreated"))), ("Creator", _s(p.get("dcCreator"))),
                ("Provider", _s([a.get("edmDataProvider") for a in (o.get("aggregations") or [])]))]
        return title, _lines(title, rows, [_s(p.get("dcDescription"))])
    raise ValueError(f"no renderer for {name}")
