"""Wikipedia titles → Wikidata items → `Entity` rows, cached; plus Wikimedia pageviews and entity search.

- Titles resolve through the MediaWiki API (`prop=pageprops`, redirects followed, 50 a request) into `WikiTitle`
  rows: exact, no guessing.
- An item's facts come from the Wikidata Query Service in one long-form query per 100 items (only the statements
  routing needs: P31 instance of, P17 country, P131 located in, P27 citizenship, P625 coordinates, P585 point in
  time, P580/P582 start/end, P571/P576 inception/dissolved, plus the English label, description, aliases and
  article). Cached on `Entity` for ENTITY_TTL_DAYS.
- `kind_of()` classifies an item from its P31 classes and facts by a fixed table: deterministic.

All requests go through ingest.http.Fetcher (User-Agent, one at a time, backoff, maxlag on the MediaWiki API).
"""

import re
from datetime import date, timedelta
from urllib.parse import quote, unquote, urlsplit

from django.utils import timezone

from .models import Entity, WikiTitle
from .wikitext import normalize_title

API = "https://en.wikipedia.org/w/api.php"
WD_API = "https://www.wikidata.org/w/api.php"
SPARQL = "https://query.wikidata.org/sparql"
PAGEVIEWS = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{title}/daily/{start}/{end}"

ENTITY_TTL_DAYS = 30
MISSING_TTL_DAYS = 7
PAGEVIEWS_TTL_DAYS = 3
PROPS = ["P31", "P17", "P131", "P27", "P625", "P585", "P580", "P582", "P571", "P576", "P297"]

# P31 classes → kind. Anything unlisted falls back on the facts (see kind_of).
KIND_CLASSES = {
    "person": {"Q5"},
    "polity": {
        "Q6256", "Q3624078", "Q7275", "Q3024240", "Q15634554", "Q1048835", "Q46395", "Q161243", "Q107390", "Q35657",
        "Q10864048", "Q112099", "Q48349", "Q1250464", "Q1763527", "Q28171280", "Q164142", "Q417175", "Q133442",
        "Q1520223", "Q512187", "Q849866", "Q1489259", "Q6726158", "Q859563", "Q20181813", "Q842112",
    },
    "place": {
        "Q515", "Q1549591", "Q5119", "Q486972", "Q532", "Q3957", "Q1637706", "Q82794", "Q23442", "Q8502", "Q4022",
        "Q23397", "Q165", "Q123705", "Q15284", "Q13220204", "Q5107", "Q1620908", "Q200250", "Q1093829", "Q15661340",
        "Q174844", "Q12323", "Q35666", "Q839954", "Q41176", "Q1248784", "Q44782", "Q483110", "Q16917", "Q33506",
    },
    "org": {
        "Q43229", "Q7278", "Q4830453", "Q891723", "Q484652", "Q245065", "Q17127659", "Q17149090", "Q15911314",
        "Q2659904", "Q327333", "Q163740", "Q31855", "Q3918", "Q476028", "Q4438121", "Q6979593", "Q847017",
        "Q11691", "Q2385804", "Q1530022", "Q7210356", "Q49773", "Q1752346", "Q1331793", "Q1194093", "Q215380",
        "Q7188", "Q1616075", "Q11422536", "Q192350", "Q1785733", "Q1802587", "Q624057",
    },
    "event": {
        "Q1190554", "Q1656682", "Q198", "Q178561", "Q180684", "Q350604", "Q8065", "Q7944", "Q8068", "Q168983",
        "Q3839081", "Q40231", "Q858439", "Q15275719", "Q27020041", "Q13406554", "Q744913", "Q906512", "Q2223653",
        "Q273120", "Q124757", "Q45382", "Q625994", "Q2761147", "Q645883", "Q103495", "Q8465", "Q124734",
        "Q1371150", "Q3002772", "Q891854", "Q18669875", "Q1079023", "Q3001412", "Q11514315", "Q2334719",
        "Q1520311", "Q17317604", "Q1172284", "Q25906438", "Q47566", "Q5386", "Q46190676", "Q1361229", "Q177626",
    },
    "work": {"Q47461344", "Q7725634", "Q11424", "Q5398426", "Q482994", "Q134556", "Q7366", "Q838948", "Q7889", "Q571", "Q1002697", "Q41298", "Q11032", "Q105543609"},
}
KIND_ORDER = ["person", "polity", "event", "org", "work", "place"]
# Classes that make a concept a movement or phenomenon (a possible branch), used by the new-branch signal.
MOVEMENT_CLASSES = {"Q49773", "Q2198855", "Q1792379", "Q12909644", "Q7257", "Q9174", "Q4392985", "Q10737", "Q12124693", "Q3329412"}


def kind_of(classes: list[str], facts: dict) -> str:
    cs = set(classes)
    for kind in KIND_ORDER:
        if cs & KIND_CLASSES[kind]:
            return kind
    if facts.get("P27"):
        return "person"
    if facts.get("P585") or facts.get("P580"):
        return "event"
    if facts.get("P625"):
        return "place"
    return "concept"


def title_from_url(url: str) -> str:
    """https://en.wikipedia.org/wiki/Battle_of_Hastings → "Battle of Hastings" ("" for other URLs)."""
    p = urlsplit(url)
    if not (p.hostname or "").endswith("wikipedia.org") or not p.path.startswith("/wiki/"):
        return ""
    return normalize_title(unquote(p.path[len("/wiki/"):]))


def article_url(title: str) -> str:
    return "https://en.wikipedia.org/wiki/" + quote(title.replace(" ", "_"), safe="()_,'!:-.")


RETRYABLE_API_ERRORS = ("maxlag", "too-busy", "ratelimited", "readonly", "internal_api_error")


def api_get(fetcher, params: dict, url: str = API, retries: int = 4) -> dict:
    """A MediaWiki API GET with JSON, formatversion 2 and maxlag; retries lag / busy errors with backoff."""
    p = {"format": "json", "formatversion": "2", "maxlag": "5", **params}
    for attempt in range(retries + 1):
        r = fetcher.get(url, params=p)
        if not r.ok:
            raise RuntimeError(f"{url} answered HTTP {r.status}")
        data = r.json()
        err = data.get("error")
        if not err:
            return data
        code = err.get("code", "")
        if attempt < retries and any(x in code for x in RETRYABLE_API_ERRORS):
            fetcher.sleep(min(5 * 2 ** attempt, 60))
            continue
        raise RuntimeError(f"MediaWiki API error: {code}: {err.get('info')}")


def _fresh(ts, days) -> bool:
    return ts is not None and ts > timezone.now() - timedelta(days=days)


def resolve_titles(fetcher, titles, *, counts=None) -> dict[str, str]:
    """{title: qid or ""} for Wikipedia titles, from the WikiTitle cache or the API (50 a request)."""
    want = sorted({normalize_title(t) for t in titles if t})
    want = [t for t in want if t]
    cached = {w.title: w for w in WikiTitle.objects.filter(title__in=want)}
    out, todo = {}, []
    for t in want:
        w = cached.get(t)
        if w and _fresh(w.resolved_at, ENTITY_TTL_DAYS if w.qid else MISSING_TTL_DAYS):
            out[t] = w.qid
        else:
            todo.append(t)
    now = timezone.now()
    for i in range(0, len(todo), 50):
        batch = todo[i:i + 50]
        data = api_get(fetcher, {"action": "query", "prop": "pageprops", "ppprop": "wikibase_item", "redirects": "1", "titles": "|".join(batch)})
        q = data.get("query", {})
        norm = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            target = norm.get(t, t)
            target = redir.get(target, target)
            page = pages.get(target, {})
            qid = (page.get("pageprops") or {}).get("wikibase_item", "")
            if not re.match(r"^Q\d+$", qid or ""):
                qid = ""
            WikiTitle.objects.update_or_create(title=t, defaults=dict(target=target[:300], qid=qid, missing=bool(page.get("missing")) or not page, resolved_at=now))
            out[t] = qid
        if counts is not None:
            counts["titles_resolved"] += len(batch)
    return out


def _blank():
    return {"facts": {}, "aliases": [], "label": "", "description": "", "enwiki": "", "coord": None}


def parse_facts(rows, out: dict) -> dict:
    """Long-form (?item ?p ?v) bindings → out[qid]["facts"], ["coord"]."""
    for b in rows:
        item = b["item"]["value"].rsplit("/", 1)[-1]
        pid = b["p"]["value"].rsplit("/", 1)[-1]
        v = b["v"]
        f = out.setdefault(item, _blank())
        if pid == "P625":
            m = re.match(r"\s*Point\(([-\d.eE]+) ([-\d.eE]+)\)", v["value"])
            if m and f["coord"] is None and not v["value"].startswith("<"):  # Earth coordinates only (no globe IRI)
                f["coord"] = (float(m.group(2)), float(m.group(1)))
        elif pid in ("P585", "P580", "P582", "P571", "P576"):
            f["facts"].setdefault(pid, v["value"][:10].lstrip("+"))
        elif pid == "P297":  # ISO 3166-1 alpha-2 (World Bank lookups)
            f["facts"].setdefault(pid, v["value"])
        elif v.get("type") == "uri" and "/entity/Q" in v["value"]:
            vals = f["facts"].setdefault(pid, [])
            q = v["value"].rsplit("/", 1)[-1]
            if q not in vals and len(vals) < 20:
                vals.append(q)
    return out


def parse_labels(rows, out: dict) -> dict:
    for b in rows:
        item = b["item"]["value"].rsplit("/", 1)[-1]
        f = out.setdefault(item, _blank())
        if "label" in b:
            f["label"] = b["label"]["value"]
        if "desc" in b:
            f["description"] = b["desc"]["value"]
        if "art" in b:
            f["enwiki"] = title_from_url(b["art"]["value"])
        if "alias" in b and b["alias"]["value"] not in f["aliases"] and len(f["aliases"]) < 12:
            f["aliases"].append(b["alias"]["value"])
    return out


def sparql_queries(qids: list[str]) -> list[str]:
    """Three small queries per batch: one combined query (labels in every language, filtered) is ~30× slower."""
    values = " ".join(f"wd:{q}" for q in qids)
    props = " ".join(f"wdt:{p}" for p in PROPS)
    return [
        f"SELECT ?item ?p ?v WHERE {{ VALUES ?item {{ {values} }} VALUES ?p {{ {props} }} ?item ?p ?v . }}",
        f"SELECT ?item ?label ?desc ?art WHERE {{ VALUES ?item {{ {values} }}"
        f' OPTIONAL {{ ?item rdfs:label ?label FILTER(lang(?label) = "en") }}'
        f' OPTIONAL {{ ?item schema:description ?desc FILTER(lang(?desc) = "en") }}'
        f" OPTIONAL {{ ?art schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }} }}",
        f'SELECT ?item ?alias WHERE {{ VALUES ?item {{ {values} }} ?item skos:altLabel ?alias FILTER(lang(?alias) = "en") }}',
    ]


def _sparql(fetcher, query: str) -> list:
    r = fetcher.get(SPARQL, params={"query": query, "format": "json"}, headers={"Accept": "application/sparql-results+json"})
    if not r.ok:
        raise RuntimeError(f"Wikidata Query Service answered HTTP {r.status}")
    return r.json()["results"]["bindings"]


def fetch_entities(fetcher, qids, *, refresh=False, counts=None, titles: dict | None = None) -> dict[str, Entity]:
    """Entity rows for `qids`, reading Wikidata for any missing or older than ENTITY_TTL_DAYS. titles: {qid: enwiki title}."""
    qids = sorted({q for q in qids if q and re.match(r"^Q\d+$", q)}, key=lambda q: int(q[1:]))
    have = {e.qid: e for e in Entity.objects.filter(qid__in=qids)}
    todo = [q for q in qids if refresh or q not in have or not _fresh(have[q].resolved_at, ENTITY_TTL_DAYS)]
    now = timezone.now()
    for i in range(0, len(todo), 100):
        batch = todo[i:i + 100]
        facts_q, labels_q, aliases_q = sparql_queries(batch)
        info: dict = {}
        parse_facts(_sparql(fetcher, facts_q), info)
        parse_labels(_sparql(fetcher, labels_q), info)
        parse_labels(_sparql(fetcher, aliases_q), info)
        for q in batch:
            f = info.get(q, _blank())
            lat, lon = f["coord"] if f["coord"] else (None, None)
            enwiki = f["enwiki"] or (titles or {}).get(q, "")
            values = dict(label=(f["label"] or enwiki or q)[:300], description=f["description"][:500], aliases=f["aliases"],
                          kind=kind_of(f["facts"].get("P31", []), f["facts"]), lat=lat, lon=lon, facts=f["facts"],
                          enwiki_title=enwiki[:300], resolved_at=now)
            e, _ = Entity.objects.update_or_create(qid=q, defaults=values)
            have[q] = e
        if counts is not None:
            counts["entities_fetched"] += len(batch)
    return {q: have[q] for q in qids if q in have}


def resolve(fetcher, titles, *, counts=None) -> dict[str, Entity]:
    """{title: Entity} for every title that has a Wikidata item."""
    t2q = resolve_titles(fetcher, titles, counts=counts)
    q2t = {}
    for t, q in t2q.items():
        if q:
            q2t.setdefault(q, WikiTitle.objects.filter(title=t).values_list("target", flat=True).first() or t)
    ents = fetch_entities(fetcher, list(q2t), counts=counts, titles=q2t)
    return {t: ents[q] for t, q in t2q.items() if q and q in ents}


def search(fetcher, text: str, limit: int = 10) -> list[dict]:
    """wbsearchentities: [{"id", "label", "description", "match": {"type", "text"}}]."""
    data = api_get(fetcher, {"action": "wbsearchentities", "search": text, "language": "en", "uselang": "en", "type": "item", "limit": str(limit)}, url=WD_API)
    return data.get("search", [])


def pageviews(fetcher, title: str, *, days: int = 30, today: date | None = None) -> int | None:
    """English Wikipedia user views of `title` over the last `days` full days (None when the API has no data)."""
    end = (today or timezone.now().date()) - timedelta(days=1)
    start = end - timedelta(days=days - 1)
    url = PAGEVIEWS.format(title=quote(title.replace(" ", "_"), safe=""), start=start.strftime("%Y%m%d"), end=end.strftime("%Y%m%d"))
    r = fetcher.get(url)
    if r.status == 404:
        return None
    if not r.ok:
        raise RuntimeError(f"pageviews answered HTTP {r.status}")
    return sum(int(i.get("views", 0)) for i in r.json().get("items", []))


def refresh_pageviews(fetcher, entities, *, counts=None, limit=400):
    """Fill `pageviews_30d` for entities with an English article and no fresh count (at most `limit` requests)."""
    n = 0
    for e in entities:
        if n >= limit:
            break
        if not e.enwiki_title or _fresh(e.pageviews_at, PAGEVIEWS_TTL_DAYS):
            continue
        views = pageviews(fetcher, e.enwiki_title)
        e.pageviews_30d, e.pageviews_at = views, timezone.now()
        e.save(update_fields=["pageviews_30d", "pageviews_at", "updated_at"])
        n += 1
    if counts is not None:
        counts["pageviews"] += n
    return n
