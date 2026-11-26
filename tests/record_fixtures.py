"""Re-record the ingestion test cassettes against the live services (needs the network and the dev database; writes
nothing to it: everything runs in a transaction that is rolled back). Not part of the test suite:

    uv run python tests/record_fixtures.py [scenario …]

Responses are trimmed (fewer items) so the cassettes stay small; key parameters are masked in the recorded URLs.
"""

import json
import os
import sys
from collections import Counter
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django  # noqa: E402

django.setup()

from django.db import transaction  # noqa: E402
from django.utils import timezone  # noqa: E402

from ingest import lookup, sources_news, sources_wiki, wikidata  # noqa: E402
from ingest.http import Fetcher  # noqa: E402
from ingest.jobs import Context  # noqa: E402
from ingest.models import Entity, Feed, FetchRun  # noqa: E402
from tests.cassette import RecordingTransport, _key  # noqa: E402

import httpx  # noqa: E402


class Preset(RecordingTransport):
    """Serve some requests from edited records, record the rest live."""

    def __init__(self, preset=None):
        super().__init__()
        self.preset = preset or {}

    def handle_request(self, request):
        k = _key(request)
        if k in self.preset:
            self.data[k] = self.preset[k]
            rec = self.preset[k]
            return httpx.Response(rec["status"], headers=rec["headers"], content=rec["body"].encode(), request=request)
        return super().handle_request(request)


class Rollback(Exception):
    pass


def ctx(fetcher, feed_url=None, **options):
    feed = Feed.objects.get(url=feed_url) if feed_url else None
    run = FetchRun.objects.create(job="record", feed=feed, started_at=timezone.now())
    return Context(job="record", run=run, fetcher=fetcher, feed=feed, options=options, counts=Counter())


def trim_json(rec, path, n):
    data = json.loads(rec["body"])
    cur = data
    for p in path[:-1]:
        cur = cur[p]
    cur[path[-1]] = cur[path[-1]][:n]
    rec["body"] = json.dumps(data, ensure_ascii=False)
    return rec


def first_pass(fn):
    t = RecordingTransport()
    f = Fetcher(transport=t)
    fn(f)
    return t.data


def scenario_portal():
    d = date(2026, 11, 20)
    raw = first_pass(lambda f: sources_wiki.fetch_pages(f, [sources_wiki.portal_title(d)]))
    (k, rec), = raw.items()
    data = json.loads(rec["body"])
    page = data["query"]["pages"][0]
    txt = page["revisions"][0]["slots"]["main"]["content"]
    import re

    cut = [m.start() for m in re.finditer(r"^'''", txt, re.M)]
    page["revisions"][0]["slots"]["main"]["content"] = txt[: cut[3]] if len(cut) > 3 else txt
    rec["body"] = json.dumps(data, ensure_ascii=False)
    t = Preset({k: rec})
    sources_wiki.run_portal(ctx(Fetcher(transport=t), "https://en.wikipedia.org/wiki/Portal:Current_events", today="2026-11-20", days=1))
    t.save("portal.json")


def scenario_year_page():
    titles = ["2026 in Senegal", "2026 in the Senegal"]
    raw = first_pass(lambda f: sources_wiki.fetch_pages(f, titles, pageprops=True))
    (k, rec), = raw.items()
    data = json.loads(rec["body"])
    for p in data["query"]["pages"]:
        if p.get("revisions"):
            t = p["revisions"][0]["slots"]["main"]["content"]
            p["revisions"][0]["slots"]["main"]["content"] = t[: t.find("=== March")] + "\n==Deaths==\n* 1 March – Someone dies.\n"
    rec["body"] = json.dumps(data, ensure_ascii=False)
    t = Preset({k: rec})
    sources_wiki.run_year_pages(ctx(Fetcher(transport=t), "https://en.wikipedia.org/w/api.php#year-in-country", branches="senegal", year=2026))
    t.save("year_page.json")


def scenario_feeds():
    t = RecordingTransport()
    f = Fetcher(transport=t)
    jobs = [("https://www.who.int/api/news/diseaseoutbreaknews", sources_news.run_who_don),
            ("https://www.federalregister.gov/api/v1/documents.json", sources_news.run_federal_register),
            ("https://www.thegazette.co.uk/all-notices/notice/data.feed", sources_news.run_gazette),
            ("https://api.nobelprize.org/2.1/nobelPrizes", sources_news.run_nobel)]
    for url, fn in jobs:
        c = ctx(f, url, max_age_days=4000, year=2025)
        fn(c)
    for k, rec in t.data.items():  # trim
        if k.endswith("/robots.txt") or rec["status"] != 200:
            continue
        if "rss.xml" in k:
            body = rec["body"]
            items = body.split("<item>")
            rec["body"] = "<item>".join(items[:4]) + ("</channel></rss>" if len(items) > 4 else "")
            rec["body"] = rec["body"].replace("</item>\n            </channel>", "</item></channel>")
        elif "diseaseoutbreaknews" in k:
            trim_json(rec, ["value"], 3)
        elif "federalregister" in k:
            trim_json(rec, ["results"], 3)
        elif "nobelPrizes" in k:
            trim_json(rec, ["nobelPrizes"], 3)
    t.save("feeds.json")


def scenario_historian():
    t = RecordingTransport()
    sources_news.run_historian_sync(ctx(Fetcher(transport=t), "https://github.com/HistoryAtState/milestones", chapters=["1861-1865"]))
    t.save("historian.json")


def scenario_lookups():
    t = RecordingTransport()
    f = Fetcher(transport=t)
    sn = Entity(qid="Q1041", label="Senegal", kind="polity", facts={"P297": "SN"})
    queries = {
        "openalex": lookup.Query("Battle of Hastings", year=1066), "crossref": lookup.Query("Battle of Hastings", year=1066),
        "loc": lookup.Query("Gettysburg Address", year=1863), "chronicling_america": lookup.Query("Gettysburg Address", year=1863),
        "smithsonian": lookup.Query("Apollo 11 lunar landing", year=1969),
        "worldbank": lookup.Query("Senegal population passes 16 million", text="population", year=2020, entities=[sn]),
        "nobel": lookup.Query("Omar Yaghi wins the Nobel Prize in Chemistry", year=2025),
    }
    for name, q in queries.items():
        try:
            hits = lookup.BY_NAME[name].search(f, q)
            print(name, len(hits), [h.title[:50] for h in hits[:2]])
        except Exception as e:
            print(name, "ERROR", e)
    for k, rec in t.data.items():
        if k.endswith("/robots.txt") or rec["status"] != 200:
            continue
        if "openalex" in k:
            trim_json(rec, ["results"], 5)
        elif "crossref" in k:
            trim_json(rec, ["message", "items"], 5)
        elif "loc.gov" in k and "robots" not in k:
            trim_json(rec, ["results"], 5)
        elif "api.si.edu" in k:
            trim_json(rec, ["response", "rows"], 4)
    t.save("lookups.json")


def scenario_link_health():
    from evidence.models import Citation, Publisher

    from ingest import linkhealth

    t = RecordingTransport()
    f = Fetcher(transport=t)
    wp = Publisher(domain="wikipedia.org")
    wiki = [Citation(pk=1, url="https://en.wikipedia.org/wiki/Battle_of_Hastings", publisher=wp),
            Citation(pk=2, url="https://en.wikipedia.org/wiki/Hastings_battle_that_never_was_xyz", publisher=wp),
            Citation(pk=3, url="https://en.wikipedia.org/wiki/Battle_Of_Hastings", publisher=wp)]
    print(linkhealth.check_wikipedia(f, wiki))
    ag = Publisher(domain="archives.gov")
    for c in [Citation(pk=4, url="https://www.archives.gov/founding-docs/declaration", publisher=ag),
              Citation(pk=5, url="https://www.archives.gov/founding-docs/this-page-does-not-exist-xyz", publisher=ag)]:
        print(c.url, linkhealth.check_url(f, c, None))
    print(linkhealth.wayback(f, "https://www.archives.gov/founding-docs/this-page-does-not-exist-xyz"))
    t.save("link_health.json")


SCENARIOS = {k[len("scenario_"):]: v for k, v in globals().items() if k.startswith("scenario_")}

if __name__ == "__main__":
    for name in sys.argv[1:] or SCENARIOS:
        try:
            with transaction.atomic():
                wikidata_fresh = wikidata._fresh
                wikidata._fresh = lambda ts, days: False  # bypass caches: record every request the code would make
                try:
                    SCENARIOS[name]()
                finally:
                    wikidata._fresh = wikidata_fresh
                raise Rollback
        except Rollback:
            print(f"recorded {name}")
