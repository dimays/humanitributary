"""The sources jobs read: a Publisher (canonical, so written in revising()) and a Feed for each, with tier, license and
access notes. Idempotent: existing Publisher rows keep their rating and policy (review state, AGENTS.md rule 7);
existing Feeds keep their `enabled` flag and state, and only gain config keys they lack.

The source policy behind each entry: docs/adr/0013-source-policy.md.
"""

from django.conf import settings

from evidence.models import Publisher
from evidence.publishers import defaults_for
from revisions import revising

from .models import Feed

CHECKED = "Terms check 2026-11-26"

# domain → defaults for a Publisher created here (never applied to an existing row).
PUBLISHERS = {
    "wikipedia.org": {},
    "wikidata.org": dict(name="Wikidata", tier=3, license="CC0 1.0"),
    "who.int": {},
    "federalregister.gov": dict(name="Federal Register (US)", tier=1, license="public domain (US government work)"),
    "sec.gov": dict(name="US Securities and Exchange Commission (EDGAR)", tier=1, license="public domain (US government work); filings are the filers'"),
    "thegazette.co.uk": dict(name="The Gazette (UK)", tier=1, license="Open Government Licence v3.0"),
    "api.nobelprize.org": dict(name="Nobel Prize API", tier=1, license="CC0 1.0 (data)", fetch_policy="allowed"),
    "history.state.gov": {},
    "raw.githubusercontent.com": dict(name="GitHub raw files", tier=None, license="per repository"),
    "openalex.org": dict(name="OpenAlex", tier=2, license="CC0 1.0 (metadata)"),
    "crossref.org": dict(name="Crossref", tier=2, license="metadata: facts, no rights reserved"),
    "doi.org": dict(name="DOI resolver", tier=2, license="per publisher"),
    "loc.gov": {},
    "si.edu": {},
    "europeana.eu": dict(name="Europeana", tier=2, license="metadata CC0; media per item (edm:rights)"),
    "worldbank.org": dict(name="World Bank Open Data", tier=1, license="CC BY 4.0"),
    "theguardian.com": dict(name="The Guardian", tier=3, license="all rights reserved"),
    "bbc.com": dict(name="BBC News", tier=3, license="all rights reserved"),
    "npr.org": dict(name="NPR", tier=3, license="all rights reserved"),
    "aljazeera.com": dict(name="Al Jazeera English", tier=3, license="all rights reserved"),
    "apnews.com": dict(name="Associated Press", tier=3, license="all rights reserved"),
    "olympedia.org": dict(name="Olympedia", tier=None, license="© OlyMADMen"),
}

# The terms check (docs/adr/0013-source-policy.md): domain → (fetch_policy to set or None to leave, access note).
# Applied once (JobState "terms_verdicts_v1") through revising(); later edits in the admin are the owner's and stay.
VERDICTS = {
    "theguardian.com": ("browser_only", "Citation only. No automated access of any kind (OP terms 6(g), 5): agents verify manually in a browser."),
    "bbc.co.uk": ("browser_only", "DROP for jobs: terms of use §15 \"not allowed to pluck metadata from our content or RSS feeds\"; robots.txt bans TDM/AI. Links only; agents read in a browser."),
    "bbc.com": ("browser_only", "DROP for jobs: BBC terms of use §15 (no metadata from content or RSS feeds). Links only; agents read in a browser."),
    "npr.org": ("browser_only", "DROP for jobs: feed copyright \"For Personal Use Only\"; other uses need NPR's permission. Links only; agents read in a browser."),
    "aljazeera.com": ("browser_only", "DROP for jobs: robots.txt notice forbids scraping and text/data mining without written permission. Links only."),
    "apnews.com": ("browser_only", "DROP for jobs: robots.txt disallows /*.rss and /api/v2/feed/; no public feed or API. Links only."),
    "news.un.org": (None, "Headline + date + link only, if ever enabled (un.org terms: personal, non-commercial use, no right to compile); Crawl-delay 10. Feed disabled while browser_only."),
    "press.un.org": (None, "Headline + date + link only, if ever enabled (un.org terms of use); Crawl-delay 10. Feed disabled while browser_only."),
    "whc.unesco.org": (None, "Headline + link only, if ever enabled: robots Content-Signal ai-train=no, use=reference; tdmrep.json tdm-reservation 1. Feed disabled while browser_only."),
    "who.int": (None, "ALLOW (non-commercial): DON API metadata and a short summary, acknowledging WHO with the URL (who.int terms of use; CC BY-NC-SA 3.0 IGO)."),
    "federalregister.gov": (None, "ALLOW: documented public API, US government work; robots.txt blocks search and auth paths only."),
    "sec.gov": (None, "ALLOW (checked 2026-11-27, ADR 0036): EDGAR \"Accessing EDGAR Data\": at most 10 requests/second, declare the user agent, no crawling; "
                "the submissions API (data.sec.gov) and single filings under /Archives/edgar/data (robots.txt allows it; /cgi-bin is disallowed). "
                "sec.gov privacy page: public information, may be copied without permission; cite the SEC."),
    "thegazette.co.uk": (None, "ALLOW: Open Government Licence v3.0 (\"Contains public sector information licensed under the OGL v3.0\"); Crawl-delay 10; state notices only (no personal-data notices)."),
    "api.nobelprize.org": ("allowed", "ALLOW: API data CC0 (nobelprize.org terms for api.nobelprize.org); cache locally, don't alter or imply endorsement. The website itself is browser_only."),
    "history.state.gov": (None, "ALLOW: Milestones TEI on GitHub is CC0 / US public domain; fetched weekly at most. The site's /search is robots-disallowed (Crawl-delay 20)."),
    "raw.githubusercontent.com": (None, "ALLOW for the Office of the Historian's public-domain TEI; weekly at most (GitHub AUP: no excessive bulk activity)."),
    "openalex.org": (None, "ALLOW: CC0 metadata, keyless (10 req/s, small daily budget); no mailto (no personal email); descriptive User-Agent."),
    "crossref.org": (None, "ALLOW: public pool, 1 request a second, one at a time; titles as snippets (not abstracts); descriptive User-Agent."),
    "loc.gov": (None, "ALLOW: loc.gov/legal, no more than 10 requests a minute; robots Crawl-delay 5 and /search disallowed: uses /collections/ and /manuscripts/ ?fo=json."),
    "si.edu": (None, "ALLOW: Open Access API (api.data.gov key, SMITHSONIAN_API_KEY), CC0 metadata; store metadata only."),
    "europeana.eu": (None, "ALLOW: Search API, key in the X-Api-Key header (EUROPEANA_API_KEY); metadata CC0, media per edm:rights. Personal key = non-production only; request a Project key (one per service) before production/hosted scheduling."),
    "worldbank.org": (None, "ALLOW: Indicators API, CC BY 4.0; attribute \"The World Bank: <dataset>: <source>\"; reasonable volume."),
    "olympedia.org": (None, "Links and names only: no published terms for automated reuse; no job fetches it (robots Crawl-delay 10)."),
    "wikipedia.org": (None, "ALLOW via the MediaWiki API: serial requests, descriptive User-Agent with contact (Wikimedia UA policy); CC BY-SA 4.0 attribution."),
    "wikidata.org": (None, "ALLOW: query service and API, CC0; serial requests, descriptive User-Agent with contact."),
}

PUBLISHER_FOR_HOST = {"api.openalex.org": "openalex.org", "api.crossref.org": "crossref.org", "api.worldbank.org": "worldbank.org",
                      "api.si.edu": "si.edu", "api.europeana.eu": "europeana.eu"}

KEYS = {"smithsonian": "SMITHSONIAN_API_KEY", "europeana": "EUROPEANA_API_KEY"}

# name, url, kind, publisher domain, interval (minutes), enabled, config
FEEDS = [
    ("Wikipedia: Current events portal", "https://en.wikipedia.org/wiki/Portal:Current_events", "api", "wikipedia.org", 60, True,
     {"job": "portal", "days_back": 3, "license": "CC BY-SA 4.0"}),
    ("Wikipedia: <year> in <country> pages", "https://en.wikipedia.org/w/api.php#year-in-country", "api", "wikipedia.org", 1440, True,
     {"job": "year_pages", "per_run": 25, "license": "CC BY-SA 4.0"}),
    ("Wikidata (entity facts refresh)", "https://query.wikidata.org/sparql", "api", "wikidata.org", 1440, True, {"job": "refresh_entities", "per_run": 2000}),
    ("UN News: all", "https://news.un.org/feed/subscribe/en/news/all/rss.xml", "rss", "news.un.org", 60, False,
     {"job": "rss", "headline_only": True, "disabled_reason": "publisher news.un.org is browser_only; enable only if the owner sets it to allowed"}),
    ("UN press releases", "https://press.un.org/en/rss.xml", "rss", "press.un.org", 120, False,
     {"job": "rss", "headline_only": True, "disabled_reason": "un.org publishers are browser_only; enable only if the owner allows press.un.org"}),
    ("WHO: Disease Outbreak News", "https://www.who.int/api/news/diseaseoutbreaknews", "api", "who.int", 360, True, {"job": "who_don", "max_age_days": 30}),
    ("Federal Register: presidential documents", "https://www.federalregister.gov/api/v1/documents.json", "api", "federalregister.gov", 360, True,
     {"job": "federal_register", "type": "PRESDOCU", "max_age_days": 14}),
    ("The Gazette (UK): state notices", "https://www.thegazette.co.uk/all-notices/notice/data.feed", "rss", "thegazette.co.uk", 720, True,
     {"job": "gazette", "notice_code_prefixes": ["11"], "page_size": 100}),
    ("Nobel Prize announcements", "https://api.nobelprize.org/2.1/nobelPrizes", "api", "api.nobelprize.org", 1440, True, {"job": "nobel"}),
    ("UNESCO World Heritage list (RSS)", "https://whc.unesco.org/en/list/rss/", "rss", "whc.unesco.org", 10080, False,
     {"job": "rss", "headline_only": True, "disabled_reason": "publisher whc.unesco.org is browser_only (often blocks automated readers)"}),
    ("Office of the Historian: Milestones (TEI, GitHub)", "https://github.com/HistoryAtState/milestones", "api", "history.state.gov", 10080, True,
     {"job": "historian_sync", "raw_base": "https://raw.githubusercontent.com/HistoryAtState/milestones/master/chapters/"}),
    # Lookup adapters (ingest/lookup.py): not scheduled themselves; the second-source and task-enrichment jobs call them.
    ("Lookup: OpenAlex works", "https://api.openalex.org/works", "api", "openalex.org", 1440, True, {"job": "lookup", "adapter": "openalex"}),
    ("Lookup: Crossref works", "https://api.crossref.org/works", "api", "crossref.org", 1440, True, {"job": "lookup", "adapter": "crossref"}),
    ("Lookup: Library of Congress", "https://www.loc.gov/collections/", "api", "loc.gov", 1440, True,
     {"job": "lookup", "adapter": "loc", "note": "/search is disallowed by robots.txt; uses /collections/…?fo=json, Crawl-delay 5"}),
    ("Lookup: Chronicling America (LoC)", "https://www.loc.gov/collections/chronicling-america/", "api", "loc.gov", 1440, True, {"job": "lookup", "adapter": "chronicling_america"}),
    ("Lookup: Smithsonian Open Access", "https://api.si.edu/openaccess/api/v1.0/search", "api", "si.edu", 1440, True, {"job": "lookup", "adapter": "smithsonian", "key": "SMITHSONIAN_API_KEY"}),
    ("Lookup: Europeana", "https://api.europeana.eu/record/v2/search.json", "api", "europeana.eu", 1440, True, {"job": "lookup", "adapter": "europeana", "key": "EUROPEANA_API_KEY"}),
    ("Lookup: World Bank indicators", "https://api.worldbank.org/v2/", "api", "worldbank.org", 1440, True, {"job": "lookup", "adapter": "worldbank"}),
    ("Lookup: Nobel Prize API", "https://api.nobelprize.org/2.1/laureates", "api", "api.nobelprize.org", 1440, True, {"job": "lookup", "adapter": "nobel"}),
    ("Lookup: Office of the Historian milestones", "https://history.state.gov/milestones", "api", "history.state.gov", 1440, True, {"job": "lookup", "adapter": "historian"}),
]

# Considered and not wired, with why (also in the source-policy ADR and `digest --sources`).
SKIPPED = {
    "The Guardian (Open Platform)": "terms 6(g) ban TDM, aggregation, AI/ML synthesis and any automated program; 5: delete within 24h",
    "BBC News RSS": "terms of use §15: no metadata from content or RSS feeds; robots.txt bans TDM and AI use",
    "NPR RSS": "feed copyright: for personal use only",
    "Al Jazeera RSS": "robots.txt notice forbids scraping and text/data mining without written permission",
    "AP News": "no public RSS feed or open API; robots.txt disallows /*.rss and /api/v2/feed/",
    "Olympedia": "no API and no published terms for automated reuse: links and names only, no lookup",
    "Library of Congress new items": "no current-events value (newly digitized archive material); LoC is used as a lookup instead",
    "history.state.gov search": "robots.txt disallows /search (Crawl-delay 20): the TEI data on GitHub is used instead",
}


def key_configured(feed_config: dict) -> bool:
    name = feed_config.get("key")
    return not name or bool(getattr(settings, name, "") or __import__("os").getenv(name, ""))


def apply_verdicts(actor="job:seed_sources") -> int:
    """Write the terms-check verdicts into Publisher access notes (and the fetch policy where a source was dropped), once."""
    from timeline.services import apply_changes

    from .models import JobState

    state, _ = JobState.objects.get_or_create(name="terms_verdicts_v1")
    if state.state.get("applied"):
        return 0
    n = 0
    with revising(actor, reason=f"{CHECKED}: source terms verdicts (docs/adr/0013-source-policy.md)"):
        for domain, (fetch_policy, note) in VERDICTS.items():
            p = Publisher.objects.filter(domain=domain).first()
            if p is None:
                p = Publisher.objects.create(domain=domain, **{**defaults_for(domain), **PUBLISHERS.get(domain, {})})
            values = {"access_notes": f"{CHECKED}: {note}"}
            if fetch_policy and p.fetch_policy != "forbidden":
                values["fetch_policy"] = fetch_policy
            if apply_changes(p, values) != "unchanged":
                n += 1
    state.state = {"applied": True, "publishers": n}
    state.save()
    return n


def seed(actor="job:seed_sources") -> dict:
    counts = {"publishers_created": 0, "feeds_created": 0, "feeds_updated": 0}
    with revising(actor, reason="seed ingestion sources"):
        for domain in sorted({f[3] for f in FEEDS} | set(PUBLISHERS)):
            if not Publisher.objects.filter(domain=domain).exists():
                Publisher.objects.create(domain=domain, **{**defaults_for(domain), **PUBLISHERS.get(domain, {})})
                counts["publishers_created"] += 1
    counts["verdicts_applied"] = apply_verdicts(actor)
    for name, url, kind, domain, interval, enabled, config in FEEDS:
        pub = Publisher.objects.get(domain=domain)
        feed = Feed.objects.filter(url=url).first()
        if feed is None:
            # A feed that needs a key is enabled here and gated at run time: with no key it skips cleanly
            # ("skipped_no_key" / "<adapter>_disabled"), and starts working as soon as the key is in .env.
            Feed.objects.create(name=name, url=url, kind=kind, publisher=pub, interval_minutes=interval, enabled=enabled, config=config)
            counts["feeds_created"] += 1
            continue
        merged = {**config, **(feed.config or {})}
        if merged != feed.config:
            feed.config = merged
            feed.save(update_fields=["config"])
            counts["feeds_updated"] += 1
    return counts
