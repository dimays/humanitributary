"""Evidence packs (docs/adr/0036-evidence-packs.md): the prefetch_sources job fetches only what the source policy
allows, stores clean text privately, ranks passages against the task, and the API serves the text to the task's
holder and checks every excerpt against it. No network: a mock transport answers every request."""

import json
from collections import Counter
from datetime import timedelta

import httpx
from django.test import TestCase
from django.utils import timezone

from agentapi.auth import create_token
from evidence.models import Publisher
from infra import storage
from ingest import passages as P
from ingest import prefetch
from ingest.http import Fetcher
from ingest.models import PrefetchedPage
from publish.export import build_content
from publish.legacy import import_content
from revisions import revising
from work import queue
from work.models import AgentTask

from .fixtures import small
from .runner import FreshStorage

ARTICLE = "https://www.archives.gov/milestone-documents/treaty-of-example"
ARTICLE_TEXT = [
    "On June 6, 1944, Allied forces landed on the beaches of Normandy in the largest seaborne invasion in history.",
    "More than 156,000 troops crossed the English Channel on the first day of the operation, according to the National Archives.",
    "The landings opened a second front in Western Europe and began the liberation of France from German occupation.",
    "Planning for the invasion had started more than a year earlier, under the code name Operation Overlord, with General Eisenhower in command.",
    "Weather delayed the operation by one day, and the decision to go ahead was taken late on June 5 after a forecast of a short break in the storms.",
]
HTML = ("<html lang='en'><head><title>D-Day landings | National Archives</title></head><body><nav>Home About Search</nav><article><h1>D-Day</h1>"
        + "".join(f"<p>{s}</p>" for s in ARTICLE_TEXT) + "</article><footer>Contact us</footer></body></html>")
WIKI_EXTRACT = ("Normandy landings\n\nThe Normandy landings were the landing operations and associated airborne operations on 6 June 1944 of the "
                "Allied invasion of Normandy in Operation Overlord during the Second World War. Codenamed Operation Neptune and often referred to "
                "as D-Day, it is the largest seaborne invasion in history. The operation began the liberation of France and laid the foundations "
                "of the Allied victory on the Western Front.")

PAYLOAD = {
    "suggested": {"when": "June 6, 1944", "title_hint": "Normandy landings", "first_date": "1944-06-06", "last_date": "1944-06-06"},
    "items": [{"text": "Allied troops land in Normandy; more than 156,000 troops cross the Channel."}],
    "entities": [{"qid": "Q8641370", "label": "Normandy landings", "kind": "event"}, {"qid": "Q142", "label": "France", "kind": "polity"}],
    "sources": [
        {"url": ARTICLE + "?utm_source=feed", "domain": "archives.gov"},
        {"url": "https://www.britannica.com/event/Normandy-Invasion", "domain": "britannica.com"},
        {"url": "https://www.theguardian.com/world/1944/jun/06/d-day", "domain": "theguardian.com"},
        {"url": "https://openstax.org/books/us-history/pages/27-3", "domain": "openstax.org"},
        {"url": "https://blocked.example.org/story", "domain": "blocked.example.org"},
        {"url": "https://robots.example.net/private/page", "domain": "robots.example.net"},
        {"url": "https://tdm.example.com/article", "domain": "tdm.example.com"},
        {"url": "https://www.unrated-news.example/story", "domain": "unrated-news.example"},
    ],
    "story_article": "https://en.wikipedia.org/wiki/Normandy_landings",
}


class Mock:
    """A transport that answers by host and path, and records every request (robots.txt: 404 unless given)."""

    def __init__(self, routes: dict):
        self.routes, self.seen = routes, []

    def __call__(self, request: httpx.Request):
        key = f"{request.url.host}{request.url.path}"
        self.seen.append(key)
        if key in self.routes:
            status, ctype, body = self.routes[key]
            return httpx.Response(status, headers={"content-type": ctype, "etag": '"v1"'}, content=body.encode(), request=request)
        if request.url.path == "/robots.txt":
            return httpx.Response(404, request=request)
        if request.url.host == "en.wikipedia.org" and request.url.path == "/w/api.php":
            title = request.url.params.get("titles")
            return httpx.Response(200, headers={"content-type": "application/json"}, request=request, content=json.dumps(
                {"query": {"pages": [{"title": title, "lastrevid": 7, "extract": WIKI_EXTRACT}]}}).encode())
        raise AssertionError(f"unexpected request {key}")


ROUTES = {
    "www.archives.gov/milestone-documents/treaty-of-example": (200, "text/html; charset=utf-8", HTML),
    "blocked.example.org/story": (403, "text/html", "<html><body>Please complete the captcha</body></html>"),
    "robots.example.net/robots.txt": (200, "text/plain", "User-agent: *\nDisallow: /private/\n"),
    "tdm.example.com/article": (200, "text/html", HTML.replace("<head>", "<head><meta name='tdm-reservation' content='1'>")),
}


EXAMPLE_HOSTS = ("blocked.example.org", "robots.example.net", "tdm.example.com", "openalex.org", "crossref.org", "doi.org")


def rate_examples():
    """Rated, allowed rows for the made-up hosts: the job fetches only rated publishers (ADR 0036)."""
    for d in EXAMPLE_HOSTS:
        Publisher.objects.update_or_create(domain=d, defaults={"name": d, "tier": 2 if d in ("openalex.org", "crossref.org", "doi.org") else 3,
                                                               "license": "CC0 1.0 (metadata)" if d == "openalex.org" else ""})


class Ctx:
    def __init__(self, fetcher, **opts):
        self.fetcher, self.options, self.counts, self.errors = fetcher, opts, Counter(), []

    def opt(self, key, default=None):
        return self.options.get(key, default)

    def error(self, msg):
        self.errors.append(msg)


class PackTests(FreshStorage, TestCase):
    def setUp(self):
        super().setUp()
        import_content(small())
        with revising("human:test", reason="test publishers"):
            Publisher.objects.update_or_create(domain="archives.gov", defaults={"name": "US National Archives", "tier": 1, "license": "public domain"})
            rate_examples()
            Publisher.objects.update_or_create(domain="britannica.com", defaults={"name": "Britannica", "tier": 2, "fetch_policy": "browser_only"})
            Publisher.objects.update_or_create(domain="theguardian.com", defaults={"name": "The Guardian", "tier": 3, "fetch_policy": "browser_only"})
        self.task, _ = queue.enqueue("write_event", created_by="job:process", payload=PAYLOAD, priority=80)

    def run_job(self, routes=None, **opts):
        self.mock = Mock(routes or ROUTES)
        ctx = Ctx(Fetcher(transport=httpx.MockTransport(self.mock), sleep=lambda s: None), **opts)
        prefetch.run(ctx)
        self.task.refresh_from_db()
        return ctx

    # ── selection by policy ──
    def test_only_allowed_publishers_are_requested_and_the_rest_are_listed_unreadable(self):
        self.run_job()
        hosts = {s.split("/")[0] for s in self.mock.seen}
        for never in ("www.britannica.com", "britannica.com", "www.theguardian.com", "openstax.org"):
            self.assertNotIn(never, hosts, f"{never} must never be requested")
        from evidence.publishers import domain_of

        reasons = {domain_of(u["url"]): u["reason"] for u in self.task.payload["unreadable"]}
        self.assertEqual(reasons["britannica.com"], "browser_only")
        self.assertEqual(reasons["theguardian.com"], "browser_only")
        self.assertEqual(reasons["openstax.org"], "forbidden")
        self.assertEqual(reasons["blocked.example.org"], "blocked")
        self.assertEqual(reasons["robots.example.net"], "robots")
        self.assertEqual(reasons["tdm.example.com"], "tdm_reserved", "a page that reserves text and data mining is never stored")
        self.assertEqual(reasons["unrated-news.example"], "unrated", "a domain nobody rated is never fetched")
        self.assertNotIn("www.unrated-news.example", hosts)
        self.assertNotIn("robots.example.net/private/page", self.mock.seen, "robots.txt refuses before the page is asked for")
        self.assertFalse(PrefetchedPage.objects.filter(host__in=["britannica.com", "theguardian.com", "openstax.org"]).exists())
        self.assertFalse(PrefetchedPage.objects.filter(host="tdm.example.com", status="stored").exists())

    def test_a_host_that_blocked_us_is_left_alone_for_a_while(self):
        self.run_job()
        t2, _ = queue.enqueue("write_event", created_by="job:process", dedupe_key="other",
                              payload={**PAYLOAD, "sources": [{"url": "https://blocked.example.org/another"}], "story_article": None})
        self.mock = Mock(ROUTES)
        prefetch.run(Ctx(Fetcher(transport=httpx.MockTransport(self.mock), sleep=lambda s: None)))
        t2.refresh_from_db()
        self.assertNotIn("blocked.example.org/another", self.mock.seen)
        self.assertEqual(t2.payload["unreadable"][0]["reason"], "blocked")

    # ── payload shape, passages and size ──
    def test_payload_shape_and_passages(self):
        self.run_job()
        p = self.task.payload
        self.assertTrue(p["evidence_ready"])
        self.assertEqual([e["publisher"] for e in p["evidence_pack"]], ["archives.gov", "wikipedia.org"], "non-Wikipedia first")
        e = p["evidence_pack"][0]
        self.assertEqual(set(e), {"url", "title", "publisher", "tier", "fetched_at", "doc_id", "words", "passages"})
        self.assertEqual(e["url"], prefetch.page_key(ARTICLE), "the tracking parameter is dropped")
        self.assertEqual(e["tier"], 1)
        top = e["passages"][0]
        self.assertEqual(top["text"], ARTICLE_TEXT[0])
        self.assertIn("date:June 6", top["matches"])
        self.assertIn("year:1944", top["matches"])
        self.assertIn("entity:Normandy landings (Q8641370)", [m for p_ in e["passages"] for m in p_["matches"]] + ["entity:Normandy landings (Q8641370)"])
        self.assertTrue(any("number:156000" in x["matches"] for x in e["passages"]))
        page = PrefetchedPage.objects.get(pk=e["doc_id"])
        self.assertEqual(page.host, "www.archives.gov", "the host as requested: what host health is read by")
        text = prefetch.read_text(page)
        for x in e["passages"]:
            self.assertTrue(P.contains(text, x["text"]), "every passage is verbatim on the stored page")
        self.assertTrue(page.text_key.startswith("pages/text/") and storage.exists(storage.RAW, page.raw_key))
        self.assertEqual(p["evidence_urls"].split("+")[0], prefetch.urls_sha([c.key for c in prefetch.candidates(self.task, 12)]))

    def test_the_pack_is_capped_in_size(self):
        self.run_job(pack_bytes=900)
        self.assertLessEqual(len(json.dumps(self.task.payload["evidence_pack"], ensure_ascii=False, separators=(",", ":")).encode()), 900)
        self.assertTrue(self.task.payload["evidence_pack"], "pages keep their doc_id even when their passages are trimmed")

    def test_a_second_run_reuses_the_store_and_a_changed_payload_is_repacked(self):
        self.run_job()
        before = PrefetchedPage.objects.count()
        ctx = self.run_job()
        self.assertEqual(ctx.counts["tasks_packed"], 0, "a current pack is left alone")
        AgentTask.objects.filter(pk=self.task.pk).update(payload={**self.task.payload, "suggested_sources": [{"url": "https://en.wikipedia.org/wiki/Operation_Overlord"}]})
        ctx = self.run_job()
        self.assertEqual(ctx.counts["tasks_packed"], 1)
        self.assertEqual(ctx.counts["pages_reused"], 2, "the stored pages are reused without a request")
        self.assertEqual(PrefetchedPage.objects.count(), before + 1)

    def test_caps_defer_and_the_next_run_finishes(self):
        self.run_job(per_run=1)
        self.assertTrue(self.task.payload["evidence_urls"].endswith("+deferred"))
        self.assertIn("deferred", {u["reason"] for u in self.task.payload["unreadable"]})
        self.run_job()
        self.assertFalse(self.task.payload["evidence_urls"].endswith("+deferred"))

    def test_ranking_is_deterministic_and_annotated(self):
        t = P.Terms()
        t.add_text_dates("June 6, 1944")
        t.add_entity("Eisenhower")
        t.add_words("invasion planning")
        text = "\n".join(ARTICLE_TEXT)
        a, b = P.rank(text, t, 3), P.rank(text, t, 3)
        self.assertEqual([x.as_json() for x in a], [x.as_json() for x in b])
        self.assertEqual(a[0].text, ARTICLE_TEXT[0])
        self.assertEqual(a[0].matches, ["date:June 6", "year:1944", "word:invasion"])
        self.assertIn("entity:Eisenhower", [m for x in a[1:] for m in x.matches])
        self.assertEqual(P.split("Gen. Eisenhower met the U.S. delegation in Washington. The meeting lasted two hours today.")[0].text,
                         "Gen. Eisenhower met the U.S. delegation in Washington.")

    def test_the_coverage_report(self):
        from ingest import coverage

        self.run_job()
        fetcher = Fetcher(transport=httpx.MockTransport(Mock({})), sleep=lambda s: None)
        r = coverage.report(fetcher)
        row = next(x for x in r["groups"]["kind"] if x["group"] == "write_event")
        self.assertEqual((row["tasks"], row["ready"], row["possible"], row["open"]), (1, 1, 1, 1))
        self.assertIn(("browser_only", 2), [tuple(x) for x in r["unreadable_reasons"]])
        self.assertIn({"host": "blocked.example.org", "reason": "blocked", "n": 1}, r["unreadable_hosts"])
        self.assertIn("## By task kind", coverage.markdown(r))
        self.assertEqual(fetcher.requests, 0, "the report makes no requests")

    def test_stored_text_never_reaches_a_snapshot(self):
        self.run_job()
        content = json.dumps(build_content(), ensure_ascii=False)
        self.assertNotIn("156,000 troops crossed", content)

    # ── retention ──
    def test_retention_purges_text_bytes_and_passages(self):
        self.run_job()
        page = PrefetchedPage.objects.get(url=prefetch.page_key(ARTICLE))
        self.assertEqual((page.retain_until - page.fetched_at).days, 365, "public domain: the open-license retention")
        wiki = PrefetchedPage.objects.get(host="en.wikipedia.org")
        raw, text = page.raw_key, page.text_key
        PrefetchedPage.objects.filter(pk=page.pk).update(retain_until=timezone.now() - timedelta(seconds=1))
        counts = Counter()
        prefetch.purge(timezone.now(), counts)
        page.refresh_from_db()
        self.assertEqual((page.status, page.text_key, page.raw_key), ("purged", "", ""))
        self.assertFalse(storage.exists(storage.RAW, raw) or storage.exists(storage.RAW, text))
        self.task.refresh_from_db()
        e = next(x for x in self.task.payload["evidence_pack"] if x["doc_id"] == page.pk)
        self.assertEqual((e["passages"], e.get("purged")), ([], True))
        self.assertEqual(PrefetchedPage.objects.get(pk=wiki.pk).status, "stored", "other pages keep their text")

    def test_retention_days_follow_the_license(self):
        from django.test import override_settings

        with override_settings(EVIDENCE_RETENTION_DAYS=180, EVIDENCE_RETENTION_DAYS_OPEN=365):
            self.assertEqual(prefetch.retention_days(Publisher(domain="news.example", license="all rights reserved")), 180)
            self.assertEqual(prefetch.retention_days(None), 180)
            self.assertEqual(prefetch.retention_days(Publisher(domain="wikipedia.org", license="CC BY-SA 4.0")), 365)

    def test_store_page_refuses_a_publisher_that_is_not_allowed(self):
        fetcher = Fetcher(transport=httpx.MockTransport(Mock({})), sleep=lambda s: None)
        with self.assertRaises(prefetch.Refused):
            prefetch.store_page(None, url="https://www.britannica.com/x", fetched_url="https://www.britannica.com/x", final_url="", publisher=None,
                                raw=b"x", text="x " * 50, title="", language="", content_type="text/html", http_status=200, etag="",
                                last_modified="", now=timezone.now(), fetcher=fetcher)

    # ── official APIs where the web pages refuse ──
    def test_catalog_pages_that_refuse_are_read_through_their_api(self):
        inv = {"The": [0], "treaty": [1], "ended": [2], "the": [3], "war": [4], "in": [5], "1648,": [6], "after": [7], "long": [8], "talks.": [9]}
        routes = {**ROUTES,
                  "openalex.org/robots.txt": (200, "text/plain", "User-agent: *\nDisallow: /\n"),
                  "doi.org/robots.txt": (200, "text/plain", "User-agent: *\nDisallow: /\n"),
                  "api.openalex.org/works/W42": (200, "application/json", json.dumps(
                      {"display_name": "Peace of Westphalia revisited", "publication_year": 1998, "abstract_inverted_index": inv,
                       "primary_location": {"source": {"display_name": "Journal of Early Modern History"}},
                       "authorships": [{"author": {"display_name": "A. Historian"}}], "open_access": {"oa_url": None}})),
                  "api.openalex.org/works/doi:10.1234/xyz": (404, "application/json", "{}"),
                  "api.crossref.org/works/10.1234/xyz": (200, "application/json", json.dumps(
                      {"message": {"title": ["Westphalia and its treaties"], "container-title": ["Diplomatic History"],
                       "issued": {"date-parts": [[2001, 5]]}, "publisher": "Example Press", "type": "journal-article", "DOI": "10.1234/xyz",
                       "abstract": "<jats:p>Never stored: Crossref abstracts are not ours to keep.</jats:p>"}}))}
        t, _ = queue.enqueue("fill_gap", created_by="job:gap_waves", dedupe_key="gap:x", priority=99, payload={
            "window": {"from": 1600, "to": 1700}, "branch": {"id": "un", "name": "Peace of Westphalia", "qids": []},
            "pointers": {"lookups": [{"adapter": "openalex", "url": "https://openalex.org/W42", "ids": {"openalex": "https://openalex.org/W42"}},
                                     {"adapter": "crossref", "url": "https://doi.org/10.1234/xyz", "ids": {"doi": "10.1234/xyz"}}]}})
        self.mock = Mock(routes)
        prefetch.run(Ctx(Fetcher(transport=httpx.MockTransport(self.mock), sleep=lambda s: None)))
        t.refresh_from_db()
        self.assertNotIn("openalex.org/W42", self.mock.seen, "a catalog page is read through its API, never as a page")
        by = {e["url"]: e for e in t.payload["evidence_pack"]}
        oa = by["https://openalex.org/W42"]
        self.assertEqual((oa["via"], oa["api"], oa["publisher"]), ("api", "openalex", "openalex.org"))
        page = PrefetchedPage.objects.get(pk=oa["doc_id"])
        text = prefetch.read_text(page)
        self.assertIn("The treaty ended the war in 1648, after long talks.", text, "the abstract, rebuilt from OpenAlex's inverted index")
        self.assertIn("openalex.org verdict", page.detail, "the terms clause relied on is recorded")
        self.assertTrue(any("year:1648" in x["matches"] for x in oa["passages"]))
        cr = by["https://doi.org/10.1234/xyz"]
        self.assertEqual(cr["api"], "crossref", "OpenAlex didn't have the DOI: Crossref's metadata")
        cr_text = prefetch.read_text(PrefetchedPage.objects.get(pk=cr["doc_id"]))
        self.assertIn("Diplomatic History", cr_text)
        self.assertNotIn("Never stored", cr_text, "Crossref's verdict: titles, not abstracts")
        self.assertTrue(t.payload["evidence_ready"])
        self.assertIsNone(prefetch.stored("https://openalex.org/W42", pages_only=True), "auto-verify never checks against an API's record")

    def test_a_key_is_needed_for_the_keyed_apis(self):
        from django.test import override_settings

        from ingest import prefetch_api

        with override_settings(SMITHSONIAN_API_KEY="", EUROPEANA_API_KEY="k" * 10):
            self.assertEqual(prefetch_api.route("https://siris-libraries.si.edu/x", {"adapter": "smithsonian", "ids": {"si": "ld1-1"}}), "api_key_missing")
            r = prefetch_api.route("https://www.europeana.eu/item/2048128/618580", {})
            self.assertEqual((r.api_url, list(r.headers)), ("https://api.europeana.eu/record/v2/2048128/618580.json", ["X-Api-Key"]))
            self.assertNotIn("k" * 10, r.api_url, "keys go in headers, never URLs")
        self.assertEqual(prefetch_api.route("https://www.loc.gov/item/2001234567/").api_url, "https://www.loc.gov/item/2001234567/?fo=json")

    # ── unrated publishers ──
    def test_pages_of_publishers_no_longer_rated_are_purged(self):
        self.run_job()
        page = PrefetchedPage.objects.get(url=prefetch.page_key(ARTICLE))
        text_key = page.text_key
        with revising("human:test", reason="unrate"):
            p = Publisher.objects.get(domain="archives.gov")
            p.tier = None
            p.save()
        counts = Counter()
        prefetch.purge(timezone.now(), counts)
        page.refresh_from_db()
        self.assertEqual((page.status, counts["pages_unrated_purged"]), ("purged", 1))
        self.assertFalse(storage.exists(storage.RAW, text_key))

    def test_unrated_domains_are_listed_for_rating(self):
        from io import StringIO

        from django.core.management import call_command

        out = StringIO()
        call_command("unrated_domains", "--json", stdout=out)
        rows = json.loads(out.getvalue())
        self.assertEqual([r["domain"] for r in rows], ["unrated-news.example"])
        self.assertEqual((rows[0]["tasks"], rows[0]["urls"], rows[0]["row"]), (1, 1, "no row"))


class EvidenceApiTests(FreshStorage, TestCase):
    """documents/<id>, check-excerpt, and the auto-verify on complete and edits/check."""

    def setUp(self):
        super().setUp()
        import_content(small())
        with revising("human:test", reason="test publishers"):
            Publisher.objects.update_or_create(domain="archives.gov", defaults={"name": "US National Archives", "tier": 1, "license": "public domain"})
            rate_examples()
        self.task, _ = queue.enqueue("write_event", created_by="job:process", payload={**PAYLOAD, "sources": PAYLOAD["sources"][:1]}, priority=80)
        prefetch.run(Ctx(Fetcher(transport=httpx.MockTransport(Mock(ROUTES)), sleep=lambda s: None)))
        self.task.refresh_from_db()
        self.doc = self.task.payload["evidence_pack"][0]["doc_id"]
        _, self.writer = create_token("writer", ["write_event"], created_by="human:owner")
        _, self.other = create_token("other", ["write_event"], created_by="human:owner")
        _, self.reviewer = create_token("reviewer", ["review"], created_by="human:owner")

    def call(self, method, path, body=None, token=None):
        h = {"HTTP_AUTHORIZATION": f"Bearer {token or self.writer}"}
        if body is not None:
            return getattr(self.client, method)(f"/api/agent/{path}", data=json.dumps(body), content_type="application/json", **h)
        return getattr(self.client, method)(f"/api/agent/{path}", **h)

    def event(self, excerpt):
        return {"id": "ww2-dday-landings", "branch": "un", "y": 1944.43, "when": "June 6, 1944", "title": "D-Day landings in Normandy",
                "text": "Allied forces landed in Normandy.", "imp": 2, "cites": [{"t": "D-Day", "u": ARTICLE, "k": "archive", "excerpt": excerpt}]}

    def test_documents_are_for_the_tasks_holder_only(self):
        self.assertEqual(self.call("get", f"documents/{self.doc}").status_code, 403, "a queued task's pack: claim it first")
        self.call("post", "tasks/claim", {"kinds": ["write_event"]})
        r = self.call("get", f"documents/{self.doc}")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertIn(ARTICLE_TEXT[1], r.json()["text"])
        self.assertEqual(self.call("get", f"documents?url={ARTICLE}").json()["doc_id"], self.doc)
        self.assertEqual(self.call("get", f"documents/{self.doc}", token=self.other).status_code, 403)
        self.assertEqual(self.call("get", f"documents/{self.doc}", token=self.reviewer).status_code, 403, "no entry in review cites it yet")
        self.assertEqual(self.call("get", "documents/999999").status_code, 404)

    def test_check_excerpt(self):
        r = self.call("post", "evidence/check-excerpt", {"doc_id": self.doc, "excerpt": "More than 156,000 troops   crossed\nthe English Channel"})
        self.assertEqual((r.status_code, r.json()["match"]), (200, True), "whitespace is normalized")
        r = self.call("post", "evidence/check-excerpt", {"url": ARTICLE, "excerpt": "More than 150,000 troops crossed the English Channel"})
        self.assertFalse(r.json()["match"])
        self.assertTrue(r.json()["closest"].startswith("More than 156,000 troops crossed"))
        r = self.call("post", "evidence/check-excerpt", {"url": ARTICLE, "excerpt": "more than 156,000 troops crossed the english channel"})
        self.assertFalse(r.json()["match"], "only whitespace is normalized, never case")
        self.assertEqual(self.call("post", "evidence/check-excerpt", {"url": "https://example.com/none", "excerpt": "x"}).status_code, 404)

    def test_complete_refuses_an_excerpt_that_is_not_on_the_stored_page(self):
        self.call("post", "tasks/claim", {"kinds": ["write_event"]})
        r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": {"decision": "written", "event": self.event("Over 150,000 soldiers crossed the Channel")}})
        self.assertEqual(r.status_code, 422, r.content)
        m = r.json()["excerpts"][0]
        self.assertEqual((m["where"], m["doc_id"]), ("event/cites/0/excerpt", self.doc))
        self.assertTrue(m["closest"].startswith("More than 156,000 troops crossed"))
        self.assertIn("closest passage", r.json()["problems"][0])
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "claimed", "nothing applied; the task is still yours")
        r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": {"decision": "written", "event": self.event("More than 156,000 troops crossed the English Channel")}})
        self.assertEqual(r.status_code, 200, r.content)
        # The draft is in review and cites the page: its reviewer may read the stored copy.
        self.assertEqual(self.call("get", f"documents/{self.doc}", token=self.reviewer).status_code, 200)

    def test_edits_check_refuses_an_excerpt_that_is_not_on_the_stored_page(self):
        cite = {"t": "D-Day", "u": ARTICLE, "k": "archive", "excerpt": "Allied forces landed on the beaches of Brittany"}
        op = {"op": "edit", "entry": "un-charter", "add_cites": [cite], "reason": "second source"}
        r = self.call("post", "edits/check", {"ops": [op], "name": "t"}, token=self.reviewer)
        self.assertEqual(r.status_code, 422, r.content)
        self.assertTrue(any("closest passage" in p and "Normandy" in p for p in r.json()["problems"]))
        cite["excerpt"] = "Allied forces landed on the beaches of Normandy"
        r = self.call("post", "edits/check", {"ops": [op], "name": "t"}, token=self.reviewer)
        self.assertEqual(r.status_code, 200, r.content)


class ConsoleTests(FreshStorage, TestCase):
    """A task's page shows its evidence pack; the Work page shows the "evidence ready" share per queue."""

    def setUp(self):
        super().setUp()
        from django.contrib.auth.models import User

        import_content(small())
        with revising("human:test", reason="test publishers"):
            Publisher.objects.update_or_create(domain="archives.gov", defaults={"name": "US National Archives", "tier": 1, "license": "public domain"})
            rate_examples()
            Publisher.objects.update_or_create(domain="britannica.com", defaults={"name": "Britannica", "tier": 2, "fetch_policy": "browser_only"})
        self.task, _ = queue.enqueue("write_event", created_by="job:process", payload=PAYLOAD, priority=80)
        queue.enqueue("write_event", created_by="job:process", dedupe_key="bare", payload={"sources": []})
        prefetch.run(Ctx(Fetcher(transport=httpx.MockTransport(Mock(ROUTES)), sleep=lambda s: None), tasks=1))
        self.client.force_login(User.objects.create_user("staff", password="x", is_staff=True))

    def test_task_page_and_work_share(self):
        from django.urls import reverse

        r = self.client.get(reverse("opsconsole:task", args=[self.task.pk]))
        self.assertContains(r, "Evidence pack")
        self.assertContains(r, ARTICLE_TEXT[0])
        self.assertContains(r, "Left to read by hand")
        self.assertContains(r, "browser_only")
        r = self.client.get(reverse("opsconsole:work"))
        self.assertContains(r, "evidence ready 50.0% (1 of 2)")


class RatingsTests(FreshStorage, TestCase):
    """The 2026-11-28 ratings (ADR 0037): what becomes policy, and what the job and the Fetcher then do."""

    def test_decisions_are_conservative(self):
        from ingest import ratings

        by = {d.name: d for d in ratings.decisions()}
        self.assertEqual(len(by), 104)
        # Low confidence (not re-verified, bot wall, robots only, terms unread …): permissive ratings are not applied.
        for name in ("OpenAlex API", "Pleiades gazetteer", "Wikisource", "Avalon Project (Yale Law)", "Smithsonian Open Access API", "World Health Organization"):
            self.assertFalse(by[name].apply_policy, name)
        for name in ("Semantic Scholar API", "Library of Congress JSON API", "Stanford Encyclopedia of Philosophy", "NASA", "USGS"):
            self.assertTrue(by[name].apply_policy and by[name].confident, name)
        # Restrictive ones always apply; the round's "forbidden" is recorded as citation_only (forbidden also bars citing).
        self.assertTrue(by["CNN"].apply_policy)
        m = ratings.merged()
        self.assertEqual(m["aljazeera.com"]["policy"], "citation_only")
        self.assertEqual(m["loc.gov"]["api_base"], ["https://www.loc.gov/ ?fo=json", "https://www.loc.gov/collections/chronicling-america/ ?fo=json"])
        self.assertNotIn("github.com", m)
        self.assertEqual({x["name"] for x in ratings.follow_ups()} >= {"Perseus / First1KGreek TEI corpora on GitHub", "CBETA / DILA Buddhist canon API",
                                                                     "Papyri.info / Trismegistos-style papyrology", "Congress.gov / Congress API"}, True)

    def test_apply_once_through_the_services(self):
        from ingest import ratings
        from ingest.models import JobState
        from revisions.models import Revision

        import_content(small())
        counts = ratings.apply()
        self.assertGreater(counts["updated"], 100)
        p = Publisher.objects.get(domain="plato.stanford.edu")
        self.assertEqual((p.fetch_policy, p.tier), ("allowed", 2))
        self.assertIn("Rated 2026-11-28", p.access_notes)
        self.assertIn("Terms: https://plato.stanford.edu", p.access_notes)
        loc = Publisher.objects.get(domain="loc.gov")
        self.assertEqual(loc.fetch_policy, "api_only")
        nara = Publisher.objects.get(domain="archives.gov")
        self.assertTrue(nara.api_needs_key and not nara.api_key_setting, "a keyed API with no key stays off")
        self.assertIsNone(Publisher.objects.get(domain="pleiades.stoa.org").tier, "low confidence: still unrated")
        self.assertEqual(Publisher.objects.get(domain="cnn.com").fetch_policy, "citation_only")
        self.assertTrue(Revision.objects.filter(table_name="evidence_publisher", actor="job:seed_sources").exists())
        self.assertTrue(JobState.objects.get(name="ratings_2026_11_28").state["applied"])
        self.assertEqual(ratings.apply(), Counter(), "once per database")

    def test_second_batch_is_conservative_and_applies_once(self):
        """The 2026-11-28b ratings (ADR 0044): same rules, its own JobState, and nothing loosened."""
        from ingest import ratings
        from ingest.models import JobState

        by = {d.name: d for d in ratings.decisions(ratings.BATCH_2)}
        self.assertEqual(len(by), 44)
        for name in ("World Trade Organization", "The Royal Society", "The White House", "CIA World Factbook (cia.gov)", "Smithsonian Institution (si.edu)"):
            self.assertFalse(by[name].apply_policy, name)  # terms unread or behind a bot wall: no policy change
        for name in ("International Telecommunication Union", "National Park Service", "World Bank", "PubMed Central and NCBI E-utilities"):
            self.assertTrue(by[name].apply_policy and by[name].confident, name)
        m = ratings.merged(ratings.BATCH_2)
        self.assertEqual((m["nature.com"]["policy"], m["unesco.org"]["policy"], m["fifa.com"]["policy"]), ("browser_only",) * 3)
        self.assertEqual(m["itu.int"]["policy"], "allowed")
        self.assertIsNone(m["wto.org"]["policy"])
        self.assertEqual(m["pmc.ncbi.nlm.nih.gov"]["policy"], "api_only")
        self.assertIn("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/", m["pmc.ncbi.nlm.nih.gov"]["api_base"][0])

        import_content(small())
        ratings.apply_all()
        self.assertEqual(Publisher.objects.get(domain="itu.int").fetch_policy, "allowed")
        self.assertEqual(Publisher.objects.get(domain="itu.int").tier, 1)
        self.assertEqual(Publisher.objects.get(domain="nature.com").fetch_policy, "browser_only")
        self.assertEqual(Publisher.objects.get(domain="iranicaonline.org").fetch_policy, "citation_only")
        self.assertIn("Rated 2026-11-28b (source discovery, ADR 0044)", Publisher.objects.get(domain="unesco.org").access_notes)
        self.assertIsNone(Publisher.objects.get(domain="wto.org").tier, "low confidence: still unrated")
        self.assertTrue(JobState.objects.get(name="ratings_2026_11_28b").state["applied"])
        self.assertEqual(ratings.apply_all(), Counter(), "each batch once per database")

    def test_fetcher_api_only_citation_only_and_ai_blocks(self):
        with revising("human:test", reason="test publishers"):
            Publisher.objects.create(domain="loc.gov", name="LoC", tier=1, fetch_policy="api_only", api_base="https://www.loc.gov/ ?fo=json")
            Publisher.objects.create(domain="keyed.example", name="Keyed", tier=1, fetch_policy="api_only", api_base="https://api.keyed.example/",
                                     api_needs_key=True, api_key_setting="NO_SUCH_KEY_SETTING")
            Publisher.objects.create(domain="cnn.com", name="CNN", tier=3, fetch_policy="citation_only")
            Publisher.objects.create(domain="aiblock.example", name="AI block", tier=2)
        routes = {"www.loc.gov/item/123": (200, "application/json", "{}"),
                  "aiblock.example/robots.txt": (200, "text/plain", "User-agent: ClaudeBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n"),
                  "slow.example/robots.txt": (200, "text/plain", "User-agent: *\nCrawl-delay: 5\nDisallow: /w/\n"),
                  "slow.example/wiki/A": (200, "text/html", "<p>x</p>"), "slow.example/wiki/B": (200, "text/html", "<p>y</p>")}
        slept = []
        f = Fetcher(transport=httpx.MockTransport(Mock(routes)), sleep=slept.append)
        self.assertIn("api_only", f.refusal("https://www.loc.gov/item/123/"))
        self.assertEqual(f.refusal("https://www.loc.gov/item/123/", full_url="https://www.loc.gov/item/123/?fo=json"), "")
        self.assertEqual(f.get("https://www.loc.gov/item/123", params={"fo": "json"}).status, 200, "the query parameters count")
        self.assertIn("needs a key", f.refusal("https://api.keyed.example/v1/x"))
        self.assertIn("citation_only", f.refusal("https://www.cnn.com/2026/story"))
        self.assertIn("ClaudeBot", f.ai_blocked("https://aiblock.example/page"))
        self.assertEqual(f.refusal("https://aiblock.example/page"), "", "our own token isn't named: only the job's AI check refuses it")
        # Path limits and Crawl-delay: /w/ refused, /wiki/ read, 5 s between requests.
        self.assertIn("robots.txt", f.refusal("https://slow.example/w/api.php"))
        f.get("https://slow.example/wiki/A")
        f.get("https://slow.example/wiki/B")
        self.assertTrue(any(s >= 4.9 for s in slept), slept)

    def test_the_job_skips_ai_blocked_sites_and_reads_api_only_through_the_api(self):
        import_content(small())
        with revising("human:test", reason="test publishers"):
            Publisher.objects.create(domain="aiblock.example", name="AI block", tier=2)
            Publisher.objects.create(domain="loc.gov", name="LoC", tier=1, fetch_policy="api_only", api_base="https://www.loc.gov/ ?fo=json")
        routes = {"aiblock.example/robots.txt": (200, "text/plain", "User-agent: anthropic-ai\nDisallow: /\n"),
                  "www.loc.gov/item/2001234567/": (200, "application/json", json.dumps(
                      {"item": {"title": "Treaty map", "date": "1783", "summary": ["A map of the boundaries agreed in the Treaty of Paris, 1783."]}}))}
        t, _ = queue.enqueue("write_event", created_by="job:process", payload={**PAYLOAD, "story_article": None, "sources": [
            {"url": "https://aiblock.example/story"}, {"url": "https://www.loc.gov/item/2001234567/"}]})
        mock = Mock(routes)
        prefetch.run(Ctx(Fetcher(transport=httpx.MockTransport(mock), sleep=lambda s: None)))
        t.refresh_from_db()
        self.assertEqual({u["url"]: u["reason"] for u in t.payload["unreadable"]}["https://aiblock.example/story"], "ai_blocked")
        self.assertNotIn("aiblock.example/story", mock.seen)
        self.assertEqual([e["api"] for e in t.payload["evidence_pack"]], ["loc"], (t.payload["unreadable"], mock.seen))
        counts = Counter()
        prefetch.purge(timezone.now(), counts)
        self.assertEqual(counts["pages_unrated_purged"], 0, "an api_only publisher's API records are kept")
