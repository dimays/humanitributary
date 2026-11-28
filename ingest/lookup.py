"""Lookup adapters: given an event or claim (a title, a date, entities), search an open source for material that may
support it. Deterministic: fixed queries, a fixed relevance score, fixed thresholds; no LLM (AGENTS.md rule 3).

A hit is only ever a *suggestion* (`SuggestedSource`, and a task payload): an agent must read the page and decide.
Nothing here writes Evidence or changes a claim's status (docs/adr/0013-source-policy.md).

Relevance = share of the query's keywords found in the hit's title and snippet (keywords: content words of the
query title, and of the entities' labels), plus 0.15 when the hit's date falls within the query's window; a hit
counts at ≥ MIN_SCORE with at least two keywords matched. Adapters run in ADAPTERS order (specialist first) and a
search stops after MAX_HITS accepted hits.
"""

import re
from dataclasses import dataclass, field

from django.conf import settings

from .extract import excerpt
from .models import Feed

MIN_SCORE = 0.5
MAX_HITS = 3
STOP = set("""a an and are as at be by for from has have in into is it its of on or that the their this to was were with
which who whom what when where after before during between about over under than then there these those also among
via per new first last second third its his her they them he she we our your not no""".split())
WORD = re.compile(r"[^\W_]+", re.U)


def keywords(*texts) -> list[str]:
    out = []
    for t in texts:
        for w in WORD.findall((t or "").lower()):
            if len(w) >= 3 and w not in STOP and not w.isdigit() and w not in out:
                out.append(w)
    return out


@dataclass
class Query:
    title: str
    text: str = ""
    year: float | None = None
    entities: list = field(default_factory=list)  # Entity rows
    window: float = 2.0  # years either side for date-filtered sources

    @property
    def keywords(self) -> list[str]:
        return keywords(self.title, *[e.label for e in self.entities[:3]])[:12]

    @property
    def search_text(self) -> str:
        return " ".join(keywords(self.title)[:8]) or self.title


@dataclass
class Hit:
    adapter: str
    url: str
    title: str
    publisher: str
    date: str = ""
    snippet: str = ""
    kind: str = ""
    ids: dict = field(default_factory=dict)
    score: float = 0.0

    def as_json(self):
        return {"adapter": self.adapter, "url": self.url, "title": self.title, "publisher": self.publisher, "date": self.date,
                "snippet": excerpt(self.snippet, 25), "kind": self.kind, "ids": self.ids, "score": self.score}


def score(q: Query, title: str, snippet: str = "", year: int | None = None) -> tuple[float, int]:
    kw = q.keywords
    if not kw:
        return 0.0, 0
    words = set(keywords(title, snippet))
    n = sum(1 for k in kw if k in words)
    s = n / len(kw)
    if year is not None and q.year is not None and abs(year - q.year) <= q.window:
        s += 0.15
    return round(min(s, 1.0), 3), n


def _year(value) -> int | None:
    m = re.search(r"-?\d{3,4}", str(value or ""))
    return int(m.group(0)) if m else None


class Adapter:
    name = ""
    publisher = ""
    kind = ""
    key_setting = ""

    def enabled(self) -> bool:
        if self.key_setting and not getattr(settings, self.key_setting, ""):
            return False
        feed = Feed.objects.filter(config__job="lookup", config__adapter=self.name).first()
        return feed is None or feed.enabled

    def applies(self, q: Query) -> bool:
        return True

    def search(self, fetcher, q: Query) -> list[Hit]:
        raise NotImplementedError

    def accept(self, q: Query, hits: list[Hit]) -> list[Hit]:
        return [h for h in hits if h.score >= MIN_SCORE]

    def _hit(self, q, *, url, title, snippet="", date="", year=None, ids=None, kind=None) -> Hit | None:
        s, n = score(q, title, snippet, year if year is not None else _year(date))
        if n < 2:
            return None
        return Hit(self.name, url, title[:500], self.publisher, str(date or ""), snippet, kind or self.kind, ids or {}, s)


class OpenAlex(Adapter):
    name, publisher, kind = "openalex", "openalex.org", "paper"

    def search(self, fetcher, q):
        r = fetcher.get("https://api.openalex.org/works", params={"search": q.search_text, "per_page": "8",
                        "select": "id,doi,display_name,publication_year,primary_location,type,cited_by_count"})
        if not r.ok:
            raise RuntimeError(f"OpenAlex HTTP {r.status}")
        out = []
        for w in r.json().get("results", []):
            venue = (((w.get("primary_location") or {}).get("source")) or {}).get("display_name") or ""
            url = w.get("doi") or w.get("id")
            if url and url.startswith("http://"):
                url = "https://" + url[7:]
            h = self._hit(q, url=url, title=w.get("display_name") or "", snippet=f"{w.get('display_name') or ''}. {venue}", date=w.get("publication_year"),
                          year=-99999, ids={"openalex": w.get("id"), "doi": w.get("doi"), "cited_by": w.get("cited_by_count")})
            if h:
                out.append(h)
        return out


class Crossref(Adapter):
    name, publisher, kind = "crossref", "crossref.org", "paper"

    def search(self, fetcher, q):
        r = fetcher.get("https://api.crossref.org/works", params={"query.bibliographic": q.search_text, "rows": "8",
                        "select": "DOI,title,issued,container-title,type,publisher"})
        if not r.ok:
            raise RuntimeError(f"Crossref HTTP {r.status}")
        out = []
        for w in r.json().get("message", {}).get("items", []):
            title = " ".join(w.get("title") or [])
            venue = " ".join(w.get("container-title") or [])
            year = ((w.get("issued") or {}).get("date-parts") or [[None]])[0][0]
            h = self._hit(q, url=f"https://doi.org/{w['DOI']}", title=title, snippet=f"{title}. {venue}", date=year, year=-99999,
                          ids={"doi": w["DOI"], "type": w.get("type"), "publisher": w.get("publisher")})
            if h:
                out.append(h)
        return out


class LoC(Adapter):
    """Library of Congress JSON API on an allowed path (/search is disallowed by robots.txt)."""

    name, publisher, kind = "loc", "loc.gov", "archive"
    path = "https://www.loc.gov/manuscripts/"

    def applies(self, q):
        return q.year is not None and 1400 <= q.year <= 2000

    def params(self, q):
        y = int(q.year)
        return {"q": q.search_text, "fo": "json", "c": "8", "at": "results", "dates": f"{y - int(q.window)}/{y + int(q.window)}"}

    def search(self, fetcher, q):
        r = fetcher.get(self.path, params=self.params(q), timeout=90)
        if not r.ok:
            raise RuntimeError(f"LoC HTTP {r.status}")
        out = []
        for it in r.json().get("results", []):
            desc = " ".join(it.get("description") or []) if isinstance(it.get("description"), list) else str(it.get("description") or "")
            url = it.get("url") or it.get("id") or ""
            if url.startswith("http://"):
                url = "https://" + url[7:]
            h = self._hit(q, url=url, title=str(it.get("title") or ""), snippet=desc, date=it.get("date"), ids={"loc": it.get("id")})
            if h:
                out.append(h)
        return out


class ChroniclingAmerica(LoC):
    name, kind = "chronicling_america", "primary"
    path = "https://www.loc.gov/collections/chronicling-america/"

    def applies(self, q):
        return q.year is not None and 1770 <= q.year <= 1963

    def params(self, q):
        y = int(q.year)
        return {"q": q.search_text, "fo": "json", "c": "8", "at": "results", "dates": f"{y}/{y + 1}"}


class Smithsonian(Adapter):
    name, publisher, kind, key_setting = "smithsonian", "si.edu", "museum", "SMITHSONIAN_API_KEY"

    def search(self, fetcher, q):
        # The key goes in api.data.gov's X-Api-Key header, never the query string: URLs reach logs (httpx logs every
        # request at INFO) and error messages.
        r = fetcher.get("https://api.si.edu/openaccess/api/v1.0/search", params={"q": q.search_text, "rows": "8"},
                        headers={"X-Api-Key": settings.SMITHSONIAN_API_KEY})
        if not r.ok:
            raise RuntimeError(f"Smithsonian HTTP {r.status}")
        out = []
        for row in (r.json().get("response") or {}).get("rows", []):
            dnr = ((row.get("content") or {}).get("descriptiveNonRepeating") or {})
            url = dnr.get("record_link") or (dnr.get("guid") or "")
            h = self._hit(q, url=url, title=row.get("title", ""), snippet=row.get("title", ""), ids={"si": row.get("id")})
            if h and url.startswith("https://"):
                out.append(h)
        return out


class Europeana(Adapter):
    name, publisher, kind, key_setting = "europeana", "europeana.eu", "archive", "EUROPEANA_API_KEY"

    def search(self, fetcher, q):
        # The key goes in the X-Api-Key header (Europeana deprecated the wskey parameter: keys in URLs leak into logs).
        r = fetcher.get("https://api.europeana.eu/record/v2/search.json", params={"query": q.search_text, "rows": "8"},
                        headers={"X-Api-Key": settings.EUROPEANA_API_KEY})
        if not r.ok:
            raise RuntimeError(f"Europeana HTTP {r.status}")
        out = []
        for it in r.json().get("items", []):
            title = " ".join(it.get("title") or [])
            url = (it.get("guid") or "").split("?")[0]
            h = self._hit(q, url=url, title=title, snippet=" ".join(it.get("dcDescription") or [])[:500], date=(it.get("year") or [""])[0],
                          ids={"europeana": it.get("id"), "provider": (it.get("dataProvider") or [""])[0]})
            if h and url.startswith("https://"):
                out.append(h)
        return out


class WorldBank(Adapter):
    """Numbers, not prose: population or GDP of a country in a year, when the text talks about them."""

    name, publisher, kind = "worldbank", "worldbank.org", "data"
    INDICATORS = {"population": ("SP.POP.TOTL", "Population, total"), "gdp": ("NY.GDP.MKTP.CD", "GDP (current US$)"),
                  "economy": ("NY.GDP.MKTP.CD", "GDP (current US$)")}

    def applies(self, q):
        return q.year is not None and 1960 <= q.year and any(w in (q.title + " " + q.text).lower() for w in self.INDICATORS) \
            and any((e.facts or {}).get("P297") for e in q.entities)

    def search(self, fetcher, q):
        out = []
        words = (q.title + " " + q.text).lower()
        country = next(e for e in q.entities if (e.facts or {}).get("P297"))
        iso = country.facts["P297"]
        for word, (code, label) in self.INDICATORS.items():
            if word not in words or any(h.ids.get("indicator") == code for h in out):
                continue
            y = int(q.year)
            r = fetcher.get(f"https://api.worldbank.org/v2/country/{iso}/indicator/{code}", params={"format": "json", "date": str(y)})
            if not r.ok:
                raise RuntimeError(f"World Bank HTTP {r.status}")
            data = r.json()
            rows = data[1] if isinstance(data, list) and len(data) > 1 and data[1] else []
            for row in rows:
                if row.get("value") is None:
                    continue
                out.append(Hit(self.name, f"https://data.worldbank.org/indicator/{code}?locations={iso}", f"{label}: {country.label}, {row['date']}",
                               self.publisher, str(row["date"]), f"{label}, {country.label}, {row['date']}: {row['value']:,.0f}", self.kind,
                               {"indicator": code, "iso2": iso, "value": row["value"]}, 1.0))
        return out


class Nobel(Adapter):
    name, publisher, kind = "nobel", "api.nobelprize.org", "primary"

    def applies(self, q):
        return q.year is not None and q.year >= 1901 and "nobel" in (q.title + " " + q.text).lower()

    def search(self, fetcher, q):
        y = int(q.year)
        r = fetcher.get("https://api.nobelprize.org/2.1/nobelPrizes", params={"nobelPrizeYear": str(y), "limit": "20"})
        if not r.ok:
            raise RuntimeError(f"Nobel API HTTP {r.status}")
        text = (q.title + " " + q.text).lower()
        out = []
        for p in r.json().get("nobelPrizes", []):
            cat = (p.get("categoryFullName") or {}).get("en", "")
            for l in p.get("laureates", []):
                name = (l.get("knownName") or l.get("orgName") or {}).get("en", "")
                last = name.split()[-1].lower() if name else ""
                if last and last in text:
                    slug = {"Economic Sciences": "economic-sciences"}.get(p["category"]["en"], p["category"]["en"].lower().replace(" ", "-"))
                    out.append(Hit(self.name, f"https://www.nobelprize.org/prizes/{slug}/{y}/summary/", f"{cat} {y}: {name}", self.publisher,
                                   p.get("dateAwarded", str(y)), f"{name}, {(l.get('motivation') or {}).get('en', '')}", self.kind,
                                   {"api": (l.get("links") or [{}])[0].get("href", ""), "note": "nobelprize.org is browser_only: a person reads it in their own browser, never an agent (ADR 0046)"}, 1.0))
        return out


class Historian(Adapter):
    """Office of the Historian Milestones, from the Documents historian_sync stored (no request at lookup time)."""

    name, publisher, kind = "historian", "history.state.gov", "primary"

    def applies(self, q):
        return q.year is not None and 1750 <= q.year <= 2000

    def search(self, fetcher, q):
        from .sources_news import historian_documents

        out = []
        for d in historian_documents().only("url", "title", "extracted_text", "metadata"):
            ch = d.metadata.get("chapter", "")
            m = re.match(r"(\d{4})-(\d{4})", ch)
            if m and not (int(m.group(1)) - q.window <= q.year <= int(m.group(2)) + q.window):
                continue
            h = self._hit(q, url=d.url, title=d.title, snippet=d.extracted_text[:600], year=int(q.year) if m else None, ids={"chapter": ch})
            if h:
                out.append(h)
        return sorted(out, key=lambda h: (-h.score, h.url))[:5]


ADAPTERS = [Nobel(), WorldBank(), Historian(), ChroniclingAmerica(), LoC(), Smithsonian(), Europeana(), OpenAlex(), Crossref()]
BY_NAME = {a.name: a for a in ADAPTERS}


def lookup(fetcher, q: Query, *, counts=None, adapters=None, max_hits=MAX_HITS) -> list[Hit]:
    """Run the applicable, enabled adapters in order; the best `max_hits` hits overall (score, then adapter order)."""
    found = []
    for a in adapters or ADAPTERS:
        if len(found) >= max_hits:
            break
        if not a.applies(q):
            continue
        if not a.enabled():
            if counts is not None:
                counts[f"{a.name}_disabled"] += 1
            continue
        try:
            hits = a.accept(q, a.search(fetcher, q))
        except Exception as e:  # one source failing never stops the others
            if counts is not None:
                counts[f"{a.name}_errors"] += 1
                counts["errors"] += 1
            continue
        if counts is not None:
            counts[f"{a.name}_queries"] += 1
            counts[f"{a.name}_hits"] += len(hits)
        found += sorted(hits, key=lambda h: (-h.score, h.url))[:max_hits]
    order = {a.name: i for i, a in enumerate(ADAPTERS)}
    seen, out = set(), []
    for h in sorted(found, key=lambda h: (-h.score, order.get(h.adapter, 99), h.url)):
        if h.url not in seen:
            seen.add(h.url)
            out.append(h)
    return out[:max_hits]
