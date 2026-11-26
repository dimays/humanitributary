"""Ingestion: parsing, entity resolution, routing, duplicates, clustering, priority, tasks, signals, link health,
lookups, the fetcher's policy and the job runner. Recorded fixtures only (tests/cassette.py): no network."""

import json
import re
from collections import Counter
from datetime import date, timedelta
from unittest import mock

import httpx
from django.db import connections
from django.test import TestCase, override_settings
from django.utils import timezone

from evidence.models import Citation, Claim, Evidence, Publisher
from ingest import branchable, jobs, lookup, policy, process, routing, seed, sources_news, sources_wiki, wikidata, wikitext
from ingest.candidates import AliasMatcher, decimal_year, when_text
from ingest.http import Fetcher, Refused, looks_like_challenge
from ingest.models import BranchEntity, Candidate, Document, Entity, Feed, FetchRun, JobState, LinkCheck, SuggestedSource, WikiTitle
from revisions import revising
from timeline import services
from timeline.models import Region
from work.models import AgentTask

from . import cassette
from .cassette import ReplayTransport, replay, response

NO_CACHE = mock.patch("ingest.wikidata._fresh", lambda ts, days: False)  # as when the cassettes were recorded


def region(slug="africa"):
    with revising("job:test"):
        return Region.objects.get_or_create(slug=slug, defaults={"name": slug})[0]


def branch(slug, name, start, end=None, region_slug="africa"):
    region(region_slug)
    with revising("job:test"):
        b, _ = services.save_branch(slug, region=region_slug, name=name, start=start, start_when=str(int(start)), end=end,
                                    end_when=str(int(end)) if end else None, text=f"{name}.", status="published")
    return b


def entity(qid, label, kind="polity", **kw):
    return Entity.objects.create(qid=qid, label=label, kind=kind, resolved_at=timezone.now(), **kw)


def run(name, *, feed=None, fetcher=None, **options):
    jobs._load_registry()
    return jobs.run_one(jobs.REGISTRY[name], feed=feed, options=options, fetcher=fetcher or Fetcher(transport=ReplayTransport({}), sleep=lambda s: None), log=lambda m: None)


class SeededTestCase(TestCase):
    def setUp(self):
        seed.seed()


# Parsing ---------------------------------------------------------------------------------------------------------
class WikitextTests(TestCase):
    def test_links_external_links_refs_and_plain_text(self):
        p = wikitext.parse_inline("The [[Saudi-led intervention in the Yemeni civil war|Saudi-led coalition]] strikes [[Hodeidah]]."
                                  "<ref>{{cite web |url=https://example.org/a |title=A story |website=[[Example]]}}</ref> [https://apnews.com/x (AP)]")
        self.assertEqual([l.title for l in p.links], ["Saudi-led intervention in the Yemeni civil war", "Hodeidah"])
        self.assertEqual(p.text, "The Saudi-led coalition strikes Hodeidah.")
        self.assertEqual((p.external[0].url, p.external[0].label), ("https://apnews.com/x", "AP"))
        self.assertEqual((p.refs[0]["url"], p.refs[0]["title"], p.refs[0]["website"]), ("https://example.org/a", "A story", "Example"))

    def test_normalize_title(self):
        self.assertEqual(wikitext.normalize_title("strait_of  Hormuz#History"), "Strait of Hormuz")

    def test_portal_items_topics_and_categories(self):
        body = json.loads(next(v for k, v in cassette.load("portal.json").items() if "prop=revisions" in k)["body"])
        items = sources_wiki.parse_portal(body["query"]["pages"][0]["revisions"][0]["slots"]["main"]["content"])
        first = items[0]
        self.assertEqual(first["category"], "Armed conflicts and attacks")
        self.assertEqual(first["topics"], ["Middle Eastern crisis (2023–present)", "2026 Iran war", "2026 Strait of Hormuz crisis"])
        self.assertIn("Oman", first["links"])
        self.assertEqual(first["external"][0]["domain"], "aje.news")
        self.assertTrue(all(it["text"] and not it["text"].startswith("[[") for it in items))
        self.assertFalse(any(it["text"] == "2026 Iran war" for it in items), "story headings are not items")

    def test_year_page_dates(self):
        text = "==Events==\n=== January ===\n* 18 January – [[Senegal]] wins the [[2025 Africa Cup of Nations]] final in Rabat.\n" \
               "* 11 March –\n** The [[National Assembly (Senegal)|National Assembly]] passes a budget for the year.\n" \
               "=== May ===\n* A drought affects northern farms across the country.\n==Deaths==\n* 2 May – Someone dies here today."
        items = sources_wiki.parse_year_page(text, 2026)
        self.assertEqual([(i["date"], i["precision"]) for i in items], [(date(2026, 1, 18), "day"), (date(2026, 3, 11), "day"), (date(2026, 5, 1), "month")])
        self.assertEqual(items[1]["text"], "The National Assembly passes a budget for the year.")

    def test_dates_as_the_timeline_writes_them(self):
        self.assertEqual(when_text(date(2026, 11, 20)), "November 20, 2026")
        self.assertEqual(decimal_year(date(1945, 6, 26)), 1945.482)


# Fetcher and policy ----------------------------------------------------------------------------------------------
class FetcherPolicyTests(SeededTestCase):
    def test_never_fetch_hosts_and_browser_only_publishers_are_refused_before_any_request(self):
        f = Fetcher(transport=ReplayTransport({}), sleep=lambda s: None)
        for url in ["https://www.britannica.com/event/Battle-of-Hastings", "https://openstax.org/books/x", "https://www.theguardian.com/world/x",
                    "https://content.guardianapis.com/search", "https://feeds.bbci.co.uk/news/world/rss.xml", "https://www.bbc.com/news/x",
                    "https://feeds.npr.org/1004/rss.xml", "https://www.aljazeera.com/xml/rss/all.xml", "https://apnews.com/article/x",
                    "https://news.un.org/feed/subscribe/en/news/all/rss.xml", "https://www.nobelprize.org/prizes/x"]:
            with self.assertRaises(Refused, msg=url):
                f.get(url)
        self.assertEqual(f.requests, 0)
        self.assertEqual(f.refusal("https://api.nobelprize.org/2.1/nobelPrizes"), "")

    def test_robots_txt_is_honored(self):
        f = Fetcher(transport=ReplayTransport({"GET https://example.org/robots.txt": response(200, "User-agent: *\nDisallow: /private/\n", "text/plain")}), sleep=lambda s: None)
        self.assertIn("robots.txt", f.refusal("https://example.org/private/page"))
        self.assertEqual(f.refusal("https://example.org/public/page"), "")

    def test_backs_off_on_429_with_retry_after(self):
        calls, waits = [], []

        def handler(request):
            calls.append(1)
            if request.url.path == "/robots.txt":
                return httpx.Response(404)
            return httpx.Response(429, headers={"Retry-After": "7"}) if len(calls) < 3 else httpx.Response(200, text="ok")

        f = Fetcher(transport=httpx.MockTransport(handler), sleep=waits.append)
        r = f.get("https://example.org/page")
        self.assertEqual(r.status, 200)
        self.assertIn(7.0, waits)

    def test_a_captcha_blocks_the_host_for_the_run(self):
        f = Fetcher(transport=ReplayTransport({"GET https://example.net/a": response(403, "<title>Just a moment...</title> cf-chl")}), sleep=lambda s: None)
        r = f.get("https://example.net/a")
        self.assertTrue(r.blocked)
        self.assertIn("bot challenge", f.refusal("https://example.net/b"))
        self.assertTrue(looks_like_challenge(200, b"<html>Please complete the CAPTCHA</html>"))

    @override_settings(SMITHSONIAN_API_KEY="abcdef123456")
    def test_secrets_are_masked(self):
        msg = policy.mask_secrets("GET https://api.si.edu/x?q=a&api_key=abcdef123456 failed; key abcdef123456; wskey=zzz")
        self.assertNotIn("abcdef123456", msg)
        self.assertNotIn("zzz", msg)


# Entities --------------------------------------------------------------------------------------------------------
class EntityTests(TestCase):
    def test_kind_from_classes_and_facts(self):
        self.assertEqual(wikidata.kind_of(["Q5"], {}), "person")
        self.assertEqual(wikidata.kind_of(["Q6256", "Q3624078"], {}), "polity")
        self.assertEqual(wikidata.kind_of(["Q999999"], {"P585": "2026-01-01"}), "event")
        self.assertEqual(wikidata.kind_of(["Q999999"], {"P625": True}), "place")
        self.assertEqual(wikidata.kind_of([], {}), "concept")
        self.assertEqual(wikidata.kind_of(["Q8142"], {"P580": "1792-04-02"}), "concept", "a currency is not an event")

    def test_facts_parsing(self):
        out = wikidata.parse_facts([
            {"item": {"value": "http://www.wikidata.org/entity/Q1041"}, "p": {"value": "http://www.wikidata.org/prop/direct/P31"}, "v": {"type": "uri", "value": "http://www.wikidata.org/entity/Q6256"}},
            {"item": {"value": "http://www.wikidata.org/entity/Q1041"}, "p": {"value": "http://www.wikidata.org/prop/direct/P625"}, "v": {"type": "literal", "value": "Point(-14.28 14.36)"}},
            {"item": {"value": "http://www.wikidata.org/entity/Q1041"}, "p": {"value": "http://www.wikidata.org/prop/direct/P297"}, "v": {"type": "literal", "value": "SN"}},
        ], {})
        self.assertEqual(out["Q1041"]["facts"], {"P31": ["Q6256"], "P297": "SN"})
        self.assertEqual(out["Q1041"]["coord"], (14.36, -14.28))

    def test_titles_resolve_exactly_and_are_cached(self):
        def handler(request):
            q = dict(request.url.params)
            if request.url.host == "en.wikipedia.org":
                self.assertEqual(q["titles"], "Oman|Sultanate of Oman")
                return httpx.Response(200, json={"query": {"redirects": [{"from": "Sultanate of Oman", "to": "Oman"}],
                                                           "pages": [{"title": "Oman", "pageprops": {"wikibase_item": "Q842"}}]}})
            query = q["query"]
            if "?p ?v" in query:
                rows = [{"item": {"value": "http://www.wikidata.org/entity/Q842"}, "p": {"value": "http://www.wikidata.org/prop/direct/P31"},
                         "v": {"type": "uri", "value": "http://www.wikidata.org/entity/Q3624078"}}]
            elif "?label" in query:
                rows = [{"item": {"value": "http://www.wikidata.org/entity/Q842"}, "label": {"value": "Oman"}, "art": {"value": "https://en.wikipedia.org/wiki/Oman"}}]
            else:
                rows = [{"item": {"value": "http://www.wikidata.org/entity/Q842"}, "alias": {"value": "Sultanate of Oman"}}]
            return httpx.Response(200, json={"results": {"bindings": rows}})

        f = Fetcher(transport=httpx.MockTransport(handler), sleep=lambda s: None)
        ents = wikidata.resolve(f, ["Oman", "Sultanate_of_Oman"])
        self.assertEqual({t: e.qid for t, e in ents.items()}, {"Oman": "Q842", "Sultanate of Oman": "Q842"})
        e = ents["Oman"]
        self.assertEqual((e.kind, e.enwiki_title, e.aliases), ("polity", "Oman", ["Sultanate of Oman"]))
        offline = Fetcher(transport=ReplayTransport({}), sleep=lambda s: None)  # any request would fail
        self.assertEqual(wikidata.resolve_titles(offline, ["Oman"]), {"Oman": "Q842"})
        self.assertTrue(WikiTitle.objects.filter(title="Sultanate of Oman", qid="Q842").exists())

    def test_alias_matcher(self):
        entity("Q1041", "Senegal", aliases=["Republic of Senegal"])
        entity("Q3718", "Dakar", kind="place")
        entity("Q11344", "missile", kind="concept")
        found = AliasMatcher().match("Floods hit Dakar as the Republic of Senegal declares an emergency; a missile test.")
        self.assertEqual(sorted(e.qid for e in found), ["Q1041", "Q3718"])


# Routing ---------------------------------------------------------------------------------------------------------
class RoutingTests(TestCase):
    def setUp(self):
        self.sn = branch("senegal", "Republic of Senegal", 1960.6)
        self.old = branch("mali-empire", "Mali Empire", 1235, 1600)
        self.q_sn = entity("Q1041", "Senegal")
        BranchEntity.objects.create(branch=self.sn, entity=self.q_sn, role="polity")
        BranchEntity.objects.create(branch=self.old, entity=self.q_sn, role="polity", weight=0.5)

    def test_country_beats_place_beats_citizenship_and_dates_must_fit(self):
        dakar = entity("Q3718", "Dakar", kind="place", facts={"P17": ["Q1041"]})
        person = entity("Q1", "A Senegalese person", kind="person", facts={"P27": ["Q1041"]})
        r = routing.Router()
        for ents, expected in [([(self.q_sn, "item")], 1.0), ([(dakar, "item")], 0.6), ([(person, "item")], 0.3), ([(self.q_sn, "topic")], 0.5)]:
            scores, _ = r.score(ents, y=2026.9)
            self.assertEqual(scores, {"senegal": expected})
        self.assertEqual(r.score([(self.q_sn, "item")], y=1400)[0], {"mali-empire": 0.5})
        self.assertEqual(routing.top_branch({"b": 1.0, "a": 1.0, "c": 0.2}), "a")

    def test_strongest_mention_split_countries_and_passing_mentions(self):
        dakar = entity("Q3718", "Dakar", kind="place", facts={"P17": ["Q1041"]})
        sea = entity("Q4", "A sea", kind="concept", facts={"P17": ["Q1041", "Q5", "Q6", "Q7"]})
        war = entity("Q8", "A war", kind="event", facts={"P17": ["Q1041", "Q5", "Q6", "Q7"]})
        r = routing.Router()
        self.assertEqual(r.score([(self.q_sn, "item"), (dakar, "item")], y=2026.9)[0], {"senegal": 1.01}, "a port and its country are one place")
        self.assertEqual(r.score([(sea, "item")], y=2026.9)[0], {"senegal": round(0.5 * 0.6 / 4, 3)}, "a concept is a passing mention, its countries split")
        self.assertEqual(r.score([(war, "item")], y=2026.9)[0], {"senegal": round(0.6 / 2, 3)}, "an event's countries split by the square root")
        self.assertEqual(r.score([(war, "story")], y=2026.9)[0], r.score([(war, "item")], y=2026.9)[0])
        self.assertEqual(routing.suggested({"a": 10.0, "b": 3.4, "c": 3.6}), [("a", 10.0), ("c", 3.6)], "a link needs 35% of the top")

    def test_year_page_boost(self):
        scores, hits = routing.Router().score([], y=2026.5, boost={"senegal": 1.5})
        self.assertEqual(scores, {"senegal": 1.5})

    def test_branch_name_variants_and_members(self):
        self.assertEqual(routing.name_variants("Iran (Qajar to Islamic Republic)"), ["Iran (Qajar to Islamic Republic)", "Iran"])
        self.assertIn("Senegal", routing.name_variants("Republic of Senegal"))
        self.assertEqual(routing.members("Gulf states (Kuwait, Bahrain, Qatar, UAE, Oman)"), ["Kuwait", "Bahrain", "Qatar", "UAE", "Oman"])

    def test_only_confident_exact_matches(self):
        hits = [{"id": "Q1", "label": "Georgia"}, {"id": "Q2", "label": "Georgia"}, {"id": "Q3", "label": "Georgia (fruit)"}]
        self.assertIsNone(routing.confident_match(["Georgia"], hits, set(), {"Q1": "polity", "Q2": "polity"}))
        self.assertEqual(routing.confident_match(["Georgia"], hits, {"Q2"}, {"Q1": "polity", "Q2": "polity"})[0], "Q2")
        self.assertEqual(routing.confident_match(["France"], [{"id": "Q142", "label": "France"}, {"id": "Q9", "label": "France"}], set(), {"Q142": "polity", "Q9": "concept"})[0], "Q142")


class BranchSeedingTests(TestCase):
    def test_exact_titles_members_and_tasks(self):
        branch("iran", "Iran (Qajar to Islamic Republic)", 1789)
        branch("ubuntu", "Ubuntu (African humanism)", 1850, region_slug="faiths")
        branch("gulf", "Gulf states (Kuwait, Oman)", 1899, region_slug="mideast")
        pages = {"Iran": "Q794", "Iran (Qajar to Islamic Republic)": "", "Ubuntu": "Q381", "Ubuntu (African humanism)": "",
                 "Gulf states": "Q1", "Gulf states (Kuwait, Oman)": "", "Kuwait": "Q817", "Oman": "Q842"}
        facts = {"Q794": ["Q6256"], "Q381": ["Q131669"], "Q1": ["Q4167410"], "Q817": ["Q6256"], "Q842": ["Q6256"]}

        def handler(request):
            q = dict(request.url.params)
            if request.url.host == "en.wikipedia.org":
                titles = q["titles"].split("|")
                return httpx.Response(200, json={"query": {"pages": [{"title": t, **({"pageprops": {"wikibase_item": pages[t]}} if pages.get(t) else {"missing": True})} for t in titles]}})
            rows = []
            if "?p ?v" in q["query"]:
                for qid, classes in facts.items():
                    rows += [{"item": {"value": f"http://www.wikidata.org/entity/{qid}"}, "p": {"value": "http://www.wikidata.org/prop/direct/P31"},
                              "v": {"type": "uri", "value": f"http://www.wikidata.org/entity/{c}"}} for c in classes]
            return httpx.Response(200, json={"results": {"bindings": rows}})

        r = run("seed_branch_entities", fetcher=Fetcher(transport=httpx.MockTransport(handler), sleep=lambda s: None))
        self.assertEqual(r.status, "ok", r.error)
        got = sorted(BranchEntity.objects.values_list("branch__slug", "entity__qid", "role"))
        self.assertEqual(got, [("gulf", "Q817", "member"), ("gulf", "Q842", "member"), ("iran", "Q794", "polity")])
        self.assertTrue(AgentTask.objects.filter(kind="map_branch_entities", dedupe_key="branch:ubuntu").exists(),
                        "an uncited short name of a concept is not trusted")


    def test_a_place_gives_way_to_its_state_and_a_predecessor_is_not_its_successors(self):
        branch("eire", "Ireland", 1922.93, region_slug="europe")
        branch("former-yugo", "Former Yugoslav states", 1991.48, region_slug="europe")
        pages = {"Ireland": "Q22890", "Former Yugoslav states": "Q83286"}
        facts = {"Q22890": {"P31": ["Q23442"], "P17": ["Q27", "Q145"]}, "Q27": {"P31": ["Q3624078"]}, "Q145": {"P31": ["Q3624078"]},
                 "Q83286": {"P31": ["Q3024240"], "P576": "1992-04-26"}}
        labels = {"Q22890": "Ireland", "Q27": "Ireland", "Q145": "United Kingdom", "Q83286": "Socialist Federal Republic of Yugoslavia"}

        def handler(request):
            q = dict(request.url.params)
            if request.url.host == "en.wikipedia.org":
                return httpx.Response(200, json={"query": {"pages": [{"title": t, **({"pageprops": {"wikibase_item": pages[t]}} if pages.get(t) else {"missing": True})}
                                                                     for t in q["titles"].split("|")]}})
            wanted = set(re.findall(r"wd:(Q\d+)", q["query"]))
            rows = []
            if "?p ?v" in q["query"]:
                for qid in wanted & set(facts):
                    for prop, vals in facts[qid].items():
                        for v in ([vals] if isinstance(vals, str) else vals):
                            rows.append({"item": {"value": f"http://www.wikidata.org/entity/{qid}"}, "p": {"value": f"http://www.wikidata.org/prop/direct/{prop}"},
                                         "v": {"type": "literal", "value": v} if prop == "P576" else {"type": "uri", "value": f"http://www.wikidata.org/entity/{v}"}})
            elif "rdfs:label" in q["query"]:
                rows = [{"item": {"value": f"http://www.wikidata.org/entity/{qid}"}, "label": {"value": labels[qid]}} for qid in wanted & set(labels)]
            return httpx.Response(200, json={"results": {"bindings": rows}})

        r = run("seed_branch_entities", fetcher=Fetcher(transport=httpx.MockTransport(handler), sleep=lambda s: None), branches="eire,former-yugo")
        self.assertEqual(r.status, "ok", r.error)
        self.assertEqual(sorted(BranchEntity.objects.values_list("branch__slug", "entity__qid")), [("eire", "Q27")], "the state, not the island")
        self.assertTrue(AgentTask.objects.filter(kind="map_branch_entities", dedupe_key="branch:former-yugo").exists(),
                        "SFR Yugoslavia ended in 1992: it covers almost none of its successors' span")


# The first real run, recorded (tests/record_first_run.py) ---------------------------------------------------------
FIRST_RUN = json.loads((cassette.DIR / "first_run.json").read_text())
FIRST_RUN_DAY = date(2026, 11, 26)


class FirstRunTests(TestCase):
    """Regression tests on the first ingestion run's own data: the stories it misrouted, and the new branches it
    proposed (docs/adr/0022-ingestion-tuning.md)."""

    def setUp(self):
        now = timezone.now()
        for slug, name, reg, start, end in FIRST_RUN["branches"]:
            branch(slug, name, start, end, region_slug=reg)
        for e in FIRST_RUN["entities"]:
            Entity.objects.create(qid=e["qid"], label=e["label"], kind=e["kind"], description=e["description"], facts=e["facts"],
                                  relations=e["relations"], relations_at=now if e["relations_read"] else None, resolved_at=now)
        ents = {e.qid: e for e in Entity.objects.all()}
        for slug, qid, role, weight in FIRST_RUN["branch_entities"]:
            BranchEntity.objects.create(branch_id=services.Branch.objects.get(slug=slug).pk, entity=ents[qid], role=role, weight=weight)
        # What the seeding job adds since the first run (routing.CORRECTIONS), without the network.
        for slug, fix in routing.CORRECTIONS.items():
            b = services.Branch.objects.filter(slug=slug).first()
            if b:
                BranchEntity.objects.filter(branch=b, entity__qid__in=fix.get("never", [])).delete()
                for qid, role, weight in fix.get("use", []):
                    if qid in ents:
                        BranchEntity.objects.get_or_create(branch=b, entity=ents[qid], defaults={"role": role, "weight": weight})

    def story(self, name) -> list[tuple[str, float]]:
        ents = {e.qid: e for e in Entity.objects.all()}
        cands = []
        for row in FIRST_RUN["stories"][name]:
            c = Candidate.objects.create(source_key=row["source_key"], title=row["title"], summary=row["summary"], when_text=row["when_text"],
                                         y_guess=row["y_guess"], precision=row["precision"], details=row["details"], created_by="job:portal")
            c.entities.set([ents[q] for q in row["entities"]])
            cands.append(c)
        process.route(cands, routing.Router())
        total = Counter()
        for c in cands:
            total.update(c._scores)
        return routing.suggested(total)

    def test_shadow_fleet_attacks_route_to_ukraine_not_libya(self):
        """Ukraine's drone attacks on Russian ships in a Libyan port: the first run put the story on Libya."""
        got = [s for s, _ in self.story("shadow_fleet")]
        self.assertEqual(got[0], "ukraine", got)
        self.assertIn("russia", got)

    def test_us_elections_route_to_the_us_alone(self):
        """The first run added India (a candidate's parents) as a second branch at 2% of the score."""
        self.assertEqual([s for s, _ in self.story("us_elections")], ["usa"])

    def test_gaza_war_routes_to_israel_and_palestine_not_iran(self):
        """The first run had Israel and Iran (the war's P17 lists six states) and no Palestine (only the PNA was mapped)."""
        self.assertEqual(sorted(s for s, _ in self.story("gaza_war")), ["israel", "palestine"])

    def test_new_branch_proposals(self):
        """Which of the first run's 17 signals can be branches, and their parents: from Wikidata relations, never from
        co-occurrence (El Salvador was put under Haiti, the Netherlands under Italy, the ICC under Sudan)."""
        by_qid = routing.Router().by_qid
        lookup = lambda q: Entity.objects.filter(qid=q).first()  # noqa: E731
        got = {}
        for qid in FIRST_RUN["signals"]:
            e = Entity.objects.get(qid=qid)
            ok, why = branchable.can_be_branch(e, FIRST_RUN_DAY)
            got[e.label] = branchable.parent(e, by_qid, lookup, FIRST_RUN_DAY)[0] if ok else why.split(" that ")[0].split(" of ")[0]
        self.assertEqual(got, {
            "Somalia": None, "Netherlands": None, "El Salvador": None, "International Criminal Court": None,
            "full-scale Russo-Ukrainian war": None, "Gaza War": None, "Middle Eastern crisis (2023–present)": None,
            "Gang war in Haiti": "haiti", "Sudanese civil war": "sudan",
            "Florida": "a subnational unit", "New Zealand National Party": "a political party", "Bangladesh Nationalist Party": "a political party",
            "2026 Brazilian general election": "an event", "2026 Iran War": "an event", "Operation Southern Spear": "an event",
            "2026 European cold chain hacks": "an event", "2026 French civil unrest": "a conflict or movement",
        })


# Sources ---------------------------------------------------------------------------------------------------------
class PortalTests(SeededTestCase):
    def test_portal_day_to_document_candidates_and_entities(self):
        feed = Feed.objects.get(config__job="portal")
        with NO_CACHE:
            r = run("portal", feed=feed, fetcher=replay("portal.json"), today="2026-11-20", days=1)
        self.assertEqual(r.status, "ok", r.error)
        doc = Document.objects.get()
        self.assertEqual(doc.license, "CC BY-SA 4.0")
        self.assertEqual(doc.metadata["date"], "2026-11-20")
        cands = Candidate.objects.filter(source_key__startswith="portal:2026-11-20:")
        self.assertEqual(cands.count(), r.counts["items"])
        c = cands.get(summary__contains="Khasab")
        self.assertEqual((c.when_text, c.precision, c.y_guess), ("November 20, 2026", "day", decimal_year(date(2026, 11, 20))))
        self.assertEqual(c.details["topic"], "2026 Strait of Hormuz crisis")
        self.assertTrue(c.details["topic_qid"].startswith("Q"))
        self.assertIn("Q842", {e.qid for e in c.entities.all()})
        self.assertEqual(c.details["roles"]["Q842"], "item")
        self.assertIn("CC BY-SA", c.details["attribution"])
        # The same revision again: nothing re-parsed, nothing duplicated.
        with NO_CACHE:
            r2 = run("portal", feed=feed, fetcher=replay("portal.json"), today="2026-11-20", days=1)
        self.assertEqual(r2.counts.get("days_unchanged"), 1)
        self.assertEqual(Candidate.objects.count(), cands.count())

    def test_edited_and_removed_items(self):
        items = [{"key": "portal:2026-01-01:aaa", "values": {"summary": "The army takes control of the capital city after a long night.", "title": "x"}, "entities": []},
                 {"key": "portal:2026-01-01:bbb", "values": {"summary": "A storm floods the coast.", "title": "y"}, "entities": []}]
        sources_wiki.sync_items("portal:2026-01-01:", items, actor="job:portal", counts=Counter())
        edited = [{"key": "portal:2026-01-01:ccc", "values": {"summary": "The army takes control of the capital city after a long night!", "title": "x"}, "entities": []}]
        counts = Counter()
        sources_wiki.sync_items("portal:2026-01-01:", edited, actor="job:portal", counts=counts)
        self.assertEqual(Candidate.objects.count(), 2)
        self.assertTrue(Candidate.objects.get(source_key="portal:2026-01-01:aaa").summary.endswith("!"))
        gone = Candidate.objects.get(source_key="portal:2026-01-01:bbb")
        self.assertEqual((gone.status, gone.details["gone"]), ("rejected", True))


class YearPageTests(SeededTestCase):
    def test_year_page_routes_through_wikidata_country(self):
        sn = branch("senegal", "Republic of Senegal", 1960.6)
        BranchEntity.objects.create(branch=sn, entity=entity("Q1041", "Senegal", enwiki_title="Senegal"), role="polity")
        with NO_CACHE:
            r = run("year_pages", feed=Feed.objects.get(config__job="year_pages"), fetcher=replay("year_page.json"), branches="senegal", year=2026)
        self.assertEqual(r.status, "ok", r.error)
        doc = Document.objects.get(title="2026 in Senegal")
        self.assertEqual(doc.metadata["branches"], ["senegal"])
        self.assertIn("P17", doc.metadata["mapped_by"])
        c = Candidate.objects.filter(source_key__startswith="year:2026 in Senegal:").order_by("y_guess").first()
        self.assertEqual(c.details["date"], "2026-01-18")
        self.assertTrue(c.details["external"][0]["url"].startswith("https://"))
        self.assertFalse(Candidate.objects.filter(summary__contains="Someone dies").exists(), "only the Events section")


class OfficialFeedTests(SeededTestCase):
    def _run(self, job, **opt):
        return run(job, feed=Feed.objects.get(config__job=job), fetcher=replay("feeds.json"), max_age_days=4000, year=2025, **opt)

    def test_who_federal_register_gazette_nobel(self):
        entity("Q30", "United States of America", aliases=["United States"])
        for job in ("who_don", "federal_register", "gazette", "nobel"):
            r = self._run(job)
            self.assertEqual(r.status, "ok", f"{job}: {r.error}")
        who = Candidate.objects.get(title__startswith="Influenza A(H5N1)")
        self.assertTrue(who.details["url"].startswith("https://who.int/emergencies/disease-outbreak-news/item/"))
        self.assertIn("Q30", {e.qid for e in who.entities.all()})
        self.assertLessEqual(len(who.summary.split()), 61)
        self.assertEqual(Candidate.objects.filter(details__source="federal_register").count(), 3)
        gz = Candidate.objects.filter(details__source="gazette")
        self.assertEqual([c.details["notice_code"] for c in gz], ["1101"], "only state notices")
        self.assertTrue(Candidate.objects.filter(details__source="nobel", title__contains="Yaghi").exists())

    def test_rss_headline_only(self):
        rss = """<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>
          <item><title>Council adopts resolution</title><link>https://example.org/story-1?utm_source=rss</link>
          <description>A long summary that must not be stored.</description><pubDate>%s</pubDate></item></channel></rss>""" % timezone.now().strftime("%a, %d %b %Y 10:00:00 GMT")
        feed = Feed.objects.create(name="t", url="https://example.org/rss.xml", kind="rss", publisher=Publisher.objects.get(domain="who.int"),
                                   config={"job": "rss", "headline_only": True})
        f = Fetcher(transport=ReplayTransport({"GET https://example.org/rss.xml": response(200, rss, "application/rss+xml", etag='"v1"')}), sleep=lambda s: None)
        r = run("rss", feed=feed, fetcher=f)
        self.assertEqual(r.status, "ok", r.error)
        c = Candidate.objects.get()
        self.assertEqual((c.title, c.summary, c.details["url"]), ("Council adopts resolution", "", "https://example.org/story-1"))
        feed.refresh_from_db()
        self.assertEqual(feed.etag, '"v1"')

    def test_historian_sync(self):
        r = run("historian_sync", feed=Feed.objects.get(config__job="historian_sync"), fetcher=replay("historian.json"), chapters=["1861-1865"])
        self.assertEqual(r.status, "ok", r.error)
        self.assertTrue(Document.objects.filter(metadata__source="historian", url__startswith="https://history.state.gov/milestones/1861-1865/").exists())


# Process: duplicates, clusters, priority, tasks, signals --------------------------------------------------------
def portal_candidate(key, summary, *, day, ents=(), topic_qid="", topic="", category="Disasters and accidents", external=()):
    c = Candidate.objects.create(source_key=key, title=summary[:200], summary=summary, when_text=when_text(day), y_guess=decimal_year(day), precision="day",
                                 created_by="job:portal", details={"source": "portal", "date": day.isoformat(), "category": category, "topic": topic,
                                                                   "topic_qid": topic_qid, "external": list(external), "roles": {e.qid: "item" for e in ents}})
    c.entities.set(ents)
    return c


class ProcessTests(TestCase):
    def setUp(self):
        self.today = timezone.now().date()
        self.ng = branch("nigeria", "Nigeria", 1960.75)
        self.q_ng = entity("Q1033", "Nigeria")
        BranchEntity.objects.create(branch=self.ng, entity=self.q_ng, role="polity")
        self.bayelsa = entity("Q1", "Bayelsa State", kind="place", facts={"P17": ["Q1033"]})
        self.disaster = entity("Q2", "2026 Bayelsa boat disaster", kind="event", facts={"P17": ["Q1033"]}, enwiki_title="2026 Bayelsa boat disaster", pageviews_30d=50_000)

    def test_cluster_route_prioritize_and_queue_once(self):
        p = portal_candidate("portal:a", "Twenty-four people are killed when a boat capsizes in Bayelsa State, Nigeria.", day=self.today,
                             ents=[self.q_ng, self.bayelsa, self.disaster], topic_qid="Q2", topic="2026 Bayelsa boat disaster",
                             external=[{"url": "https://www.arabnews.com/world/24-dead", "label": "Arab News", "domain": "arabnews.com"}])
        news = Candidate.objects.create(source_key="news:x", title="Boat capsizes in Nigeria", summary="Dozens die.", y_guess=p.y_guess, when_text=p.when_text,
                                        precision="day", created_by="job:rss", details={"source": "rss", "date": self.today.isoformat(),
                                                                                         "url": "https://arabnews.com/world/24-dead", "publisher": "arabnews.com"})
        r = run("process", threshold=10)
        self.assertEqual(r.status, "ok", r.error)
        p.refresh_from_db()
        news.refresh_from_db()
        self.assertEqual(p.cluster_key, f"topic:Q2:{self.today:%Y-%m}")
        self.assertEqual(news.cluster_key, p.cluster_key, "joined by the URL the portal item cites")
        self.assertEqual(p.top_branch.slug, "nigeria")
        self.assertEqual(p.branch_scores["nigeria"], 1.0 + 2 * routing.MORE_MENTIONS, "the strongest mention, not the sum")
        self.assertEqual(p.priority, news.priority)
        task = AgentTask.objects.get(kind="write_event")
        pl = task.payload
        self.assertEqual(pl["suggested"]["branches"][0]["slug"], "nigeria")
        self.assertEqual(pl["story_article"], "https://en.wikipedia.org/wiki/2026_Bayelsa_boat_disaster")
        self.assertTrue(all(len(s.get("excerpt", "").split()) <= 25 for s in pl["sources"]))
        self.assertEqual({e["qid"] for e in pl["entities"]}, {"Q1033", "Q1", "Q2"})
        run("process", threshold=10)
        self.assertEqual(AgentTask.objects.filter(kind="write_event").count(), 1, "re-running doesn't duplicate")
        # The agent finishes it: the candidates follow.
        AgentTask.objects.filter(pk=task.pk).update(status="done", claimed_by="agent:t", completed_at=timezone.now(), result={"entry": "nigeria"})
        run("process", threshold=10)
        p.refresh_from_db()
        self.assertEqual((p.status, p.result_entry.slug), ("accepted", "nigeria"))

    def test_new_tasks_are_capped_per_day_highest_priority_first(self):
        for i, views in enumerate((900_000, 9_000, 90)):
            e = entity(f"Q5{i}", f"Story {i}", kind="event", facts={"P17": ["Q1033"]}, enwiki_title=f"Story {i}", pageviews_30d=views)
            portal_candidate(f"portal:cap{i}", f"Story {i} in Nigeria.", day=self.today, ents=[self.q_ng, e], topic_qid=e.qid, topic=f"Story {i}")
        r = run("process", threshold=1, per_day=2)
        self.assertEqual((r.counts["tasks_created"], r.counts["tasks_held_by_daily_cap"]), (2, 1))
        self.assertEqual(sorted(t.payload["suggested"]["title_hint"] for t in AgentTask.objects.filter(kind="write_event")), ["Story 0", "Story 1"])
        r = run("process", threshold=1, per_day=2)
        self.assertEqual((r.counts.get("tasks_created", 0), r.counts["tasks_held_by_daily_cap"]), (0, 1), "the cap counts today's tasks")

    def test_entity_overlap_joins_within_two_days(self):
        storm = entity("Q3", "Cyclone Test", kind="event")
        p = portal_candidate("portal:b", "Cyclone Test hits Bayelsa State.", day=self.today, ents=[storm, self.bayelsa])
        other = Candidate.objects.create(source_key="news:y", title="Cyclone Test", summary="", y_guess=p.y_guess, precision="day", created_by="job:rss",
                                         details={"source": "who_don", "date": (self.today - timedelta(days=1)).isoformat(), "url": "https://who.int/x"})
        other.entities.set([storm, self.bayelsa])
        far = Candidate.objects.create(source_key="news:z", title="Cyclone Test", summary="", y_guess=p.y_guess, precision="day", created_by="job:rss",
                                       details={"source": "who_don", "date": (self.today - timedelta(days=5)).isoformat(), "url": "https://who.int/y"})
        far.entities.set([storm, self.bayelsa])
        run("process")
        keys = dict(Candidate.objects.values_list("source_key", "cluster_key"))
        self.assertEqual(keys["news:y"], keys["portal:b"])
        self.assertNotEqual(keys["news:z"], keys["portal:b"])

    def test_duplicate_of_an_existing_event(self):
        with revising("job:test"):
            services.save_event("ng-bayelsa-boat", branch="nigeria", y=decimal_year(self.today), when=when_text(self.today),
                                title="Bayelsa boat disaster", text="A boat capsized.", imp=3, status="published")
        p = portal_candidate("portal:c", "A boat disaster in Bayelsa kills 24.", day=self.today, ents=[self.q_ng], topic="2026 Bayelsa boat disaster", topic_qid="Q2")
        run("process")
        p.refresh_from_db()
        self.assertEqual(p.duplicate_of.slug, "ng-bayelsa-boat")
        self.assertGreaterEqual(p.similarity, 0.5)
        self.assertLess(p.details["priority_parts"]["D"], 1.0)

    def test_priority_formula(self):
        p = portal_candidate("portal:d", "x", day=self.today, ents=[self.disaster], topic_qid="Q2", category="Armed conflicts and attacks",
                             external=[{"url": "https://a.example/1", "domain": "a.example"}])
        p._scores = {"nigeria": 1.0}
        parts = process.priority_parts([p], tiers={"wikipedia.org": 3}, dups={}, today=self.today)
        S, T, B, C, R = 1 - 0.6 ** 2, (0.6 + 0.5) / 2, 0.25, 0.9, 1.0
        P = min(1.0, __import__("math").log10(1 + 50_000) / 6)
        self.assertAlmostEqual(parts["priority"], round(100 * (0.25 * S + 0.10 * T + 0.15 * B + 0.15 * C + 0.15 * R + 0.20 * P), 2), places=2)
        older = process.priority_parts([p], tiers={}, dups={}, today=self.today + timedelta(days=60))
        self.assertLess(older["priority"], parts["priority"])

    def test_new_branch_signal(self):
        movement = entity("Q77", "Test Liberation Front", kind="org", facts={"P17": ["Q1033"]}, description="armed group")
        for i in range(4):
            portal_candidate(f"portal:s{i}", f"Story {i} about the front.", day=self.today - timedelta(days=i), ents=[movement, self.q_ng], topic_qid=f"Q90{i}")
        run("process")
        sig = Candidate.objects.get(kind="new_branch_signal")
        self.assertEqual((sig.details["qid"], sig.details["clusters"], sig.details["country_routes_to"]), ("Q77", 4, ["nigeria"]))
        self.assertFalse(Candidate.objects.filter(kind="new_branch_signal", details__qid="Q1033").exists(), "routed entities never signal")
        BranchEntity.objects.create(branch=self.ng, entity=movement, role="movement")
        run("process")
        sig.refresh_from_db()
        self.assertEqual(sig.status, "rejected")


# Link health -----------------------------------------------------------------------------------------------------
class LinkHealthTests(SeededTestCase):
    def setUp(self):
        super().setUp()
        b = branch("england", "England", 927, region_slug="europe")
        with revising("job:test"):
            ag = Publisher.objects.create(domain="archives.gov", name="US National Archives", tier=1)
            wp = Publisher.objects.get(domain="wikipedia.org")
            self.claim = Claim.objects.create(entry=b, field="as_written", value={"text": "x"})
            urls = [("https://en.wikipedia.org/wiki/Battle_of_Hastings", wp), ("https://www.archives.gov/founding-docs/declaration", ag),
                    ("https://en.wikipedia.org/wiki/Hastings_battle_that_never_was_xyz", wp), ("https://www.archives.gov/founding-docs/this-page-does-not-exist-xyz", ag),
                    ("https://en.wikipedia.org/wiki/Battle_Of_Hastings", wp), ("https://www.britannica.com/event/Battle-of-Hastings", Publisher.objects.get_or_create(domain="britannica.com", defaults={"name": "B", "fetch_policy": "browser_only"})[0])]
            self.cites = []
            for i, (u, p) in enumerate(urls):
                c = Citation.objects.create(url=u, title=u, publisher=p)
                Evidence.objects.create(claim=self.claim, citation=c, position=i, cited_title=u)
                self.cites.append(c)
        self.extra = {"GET https://archive.org/wayback/available?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FHastings_battle_that_never_was_xyz":
                      response(200, json.dumps({"archived_snapshots": {"closest": {"available": True, "url": "http://web.archive.org/web/2020/https://en.wikipedia.org/wiki/x"}}}), "application/json")}

    def test_outcomes_stale_claims_and_tasks(self):
        r = run("link_health", fetcher=replay("link_health.json", extra=self.extra), limit=10)
        self.assertEqual(r.status, "ok", r.error)
        out = dict(LinkCheck.objects.values_list("citation__url", "outcome"))
        self.assertEqual(out, {
            "https://en.wikipedia.org/wiki/Battle_of_Hastings": "ok", "https://www.archives.gov/founding-docs/declaration": "ok",
            "https://en.wikipedia.org/wiki/Hastings_battle_that_never_was_xyz": "dead", "https://www.archives.gov/founding-docs/this-page-does-not-exist-xyz": "dead",
            "https://en.wikipedia.org/wiki/Battle_Of_Hastings": "redirected"})
        self.assertNotIn("britannica", " ".join(out), "browser_only publishers are never checked")
        dead = Citation.objects.get(url__endswith="never_was_xyz")
        self.assertTrue(dead.archive_url.startswith("https://web.archive.org/"))
        self.assertEqual(dead.http_status, 404)
        # The fact base's sweep (the next job in the registry) turns the dead link into a stale claim and a task.
        r = run("facts_sweep")
        self.assertEqual(r.status, "ok", r.error)
        self.claim.refresh_from_db()
        self.assertEqual((self.claim.status, self.claim.recheck_reason), ("stale", "dead_link"))
        task = AgentTask.objects.get(kind="verify_claim", target_claim=self.claim)
        self.assertEqual(task.dedupe_key, f"claim:{self.claim.pk}")
        ok = Citation.objects.get(url="https://www.archives.gov/founding-docs/declaration")
        self.assertTrue(ok.content_hash and ok.last_checked_at)
        from revisions.models import Revision
        self.assertTrue(Revision.objects.filter(actor="job:link_health").exists())

    def test_content_change_and_bot_wall(self):
        run("link_health", fetcher=replay("link_health.json", extra=self.extra), limit=10)
        changed = {"HEAD https://www.archives.gov/founding-docs/declaration": response(200, "", etag='"new"'),
                   "GET https://www.archives.gov/founding-docs/declaration": response(200, "<html><body><article><p>" + "Entirely different text. " * 40 + "</p></article></body></html>"),
                   "HEAD https://www.archives.gov/founding-docs/this-page-does-not-exist-xyz": response(403, "<title>Just a moment...</title>")}
        LinkCheck.objects.update(checked_at=timezone.now() - timedelta(days=30))
        with revising("job:test"):  # only the two archives.gov pages this round
            Evidence.objects.filter(citation__publisher__domain="wikipedia.org").delete()
        r = run("link_health", fetcher=replay("link_health.json", extra={**self.extra, **changed}), limit=2)
        self.assertEqual(r.status, "ok", r.error)
        latest = {c.citation.url: c.outcome for c in LinkCheck.objects.filter(checked_at__gte=timezone.now() - timedelta(minutes=5)).select_related("citation")}
        self.assertEqual(latest["https://www.archives.gov/founding-docs/declaration"], "changed")
        self.assertEqual(latest["https://www.archives.gov/founding-docs/this-page-does-not-exist-xyz"], "blocked")

    def test_selection_interleaves_publishers(self):
        from ingest import linkhealth

        picked = [c.publisher.domain for c in linkhealth.select(4)]
        self.assertEqual(picked, ["wikipedia.org", "archives.gov", "wikipedia.org", "archives.gov"])


# Lookups and second sources --------------------------------------------------------------------------------------
@override_settings(SMITHSONIAN_API_KEY="test-key-123456", EUROPEANA_API_KEY="")
class LookupTests(SeededTestCase):
    def test_adapters_against_recorded_responses(self):
        f = replay("lookups.json")
        sn = Entity(qid="Q1041", label="Senegal", kind="polity", facts={"P297": "SN"})
        cases = {"openalex": lookup.Query("Battle of Hastings", year=1066), "crossref": lookup.Query("Battle of Hastings", year=1066),
                 "loc": lookup.Query("Gettysburg Address", year=1863), "smithsonian": lookup.Query("Apollo 11 lunar landing", year=1969),
                 "worldbank": lookup.Query("Senegal population passes 16 million", text="population", year=2020, entities=[sn]),
                 "nobel": lookup.Query("Omar Yaghi wins the Nobel Prize in Chemistry", year=2025)}
        for name, q in cases.items():
            a = lookup.BY_NAME[name]
            self.assertTrue(a.applies(q), name)
            hits = a.accept(q, a.search(f, q))
            self.assertTrue(hits, name)
            self.assertTrue(all(h.url.startswith("https://") for h in hits), name)
            self.assertTrue(all(len(h.as_json()["snippet"].split()) <= 25 for h in hits), name)
        self.assertEqual(lookup.BY_NAME["chronicling_america"].search(f, lookup.Query("Gettysburg Address", year=1863)), [])
        self.assertFalse(lookup.BY_NAME["worldbank"].applies(lookup.Query("Battle", year=2020, entities=[sn])))

    def test_europeana_sends_its_key_in_a_header_and_is_disabled_without_one(self):
        self.assertFalse(lookup.BY_NAME["europeana"].enabled())
        seen = {}

        def handler(request):
            if request.url.path == "/robots.txt":
                return httpx.Response(404)
            seen["url"], seen["key"] = str(request.url), request.headers.get("X-Api-Key")
            return httpx.Response(200, json={"items": [{"title": ["Battle of Hastings tapestry print"], "guid": "https://www.europeana.eu/item/1/x?utm=1", "year": ["1066"], "dataProvider": ["P"]}]})

        with override_settings(EUROPEANA_API_KEY="eu-key-999999"):
            self.assertTrue(lookup.BY_NAME["europeana"].enabled())
            hits = lookup.BY_NAME["europeana"].search(Fetcher(transport=httpx.MockTransport(handler), sleep=lambda s: None), lookup.Query("Battle of Hastings", year=1066))
        self.assertEqual(seen["key"], "eu-key-999999")
        self.assertNotIn("wskey", seen["url"])
        self.assertEqual(hits[0].url, "https://www.europeana.eu/item/1/x")

    def test_historian_lookup_reads_synced_documents(self):
        run("historian_sync", feed=Feed.objects.get(config__job="historian_sync"), fetcher=replay("historian.json"), chapters=["1861-1865"])
        d = Document.objects.filter(metadata__source="historian").first()
        hits = lookup.BY_NAME["historian"].search(None, lookup.Query(d.title, year=1863))
        self.assertEqual(hits[0].url, d.url)

    def test_second_source_suggests_but_never_corroborates(self):
        b = branch("england", "England", 927, region_slug="europe")
        with revising("job:test"):
            cite = Citation.objects.create(url="https://en.wikipedia.org/wiki/Battle_of_Hastings", title="Battle of Hastings", publisher=Publisher.objects.get(domain="wikipedia.org"))
            claim = Claim.objects.create(entry=b, field="as_written", value={"text": "The Normans won at Hastings."}, status="single_source", confidence=0.35)
            Evidence.objects.create(claim=claim, citation=cite, position=0, cited_title="Battle of Hastings")
        WikiTitle.objects.create(title="Battle of Hastings", target="Battle of Hastings", qid="Q83224", resolved_at=timezone.now())
        entity("Q83224", "Battle of Hastings", kind="event", facts={"P585": "1066-10-14"})
        with mock.patch.object(lookup, "ADAPTERS", [lookup.BY_NAME["openalex"]]):
            r = run("second_source", fetcher=replay("lookups.json"), limit=5)
        self.assertEqual(r.status, "ok", r.error)
        self.assertGreater(SuggestedSource.objects.filter(claim=claim).count(), 0)
        task = AgentTask.objects.get(kind="verify_claim", target_claim=claim)
        self.assertTrue(task.payload["suggested_sources"][0]["url"].startswith("https://"))
        claim.refresh_from_db()
        self.assertEqual((claim.status, claim.evidence.count()), ("single_source", 1), "suggestions are not evidence")
        self.assertEqual(r.counts["family_scholarship"], SuggestedSource.objects.filter(claim=claim).count())


# The job runner --------------------------------------------------------------------------------------------------
class RunnerTests(TestCase):
    def test_lock_keeps_a_second_runner_out(self):
        other = connections.create_connection("default")
        try:
            with other.cursor() as c:
                c.execute("SELECT pg_advisory_lock(%s)", [jobs.LOCK_KEY])
            self.assertIsNone(jobs.run_due(log=lambda m: None))
            self.assertIsNone(jobs.run_named("process", log=lambda m: None))
            self.assertFalse(FetchRun.objects.exists())
        finally:
            with other.cursor() as c:
                c.execute("SELECT pg_advisory_unlock(%s)", [jobs.LOCK_KEY])
            other.close()
        self.assertTrue(jobs.try_lock())
        jobs.unlock()

    def test_due_by_interval_and_by_feed(self):
        jobs._load_registry()
        j = jobs.REGISTRY["process"]
        now = timezone.now()
        self.assertTrue(jobs.is_due(j, now))
        FetchRun.objects.create(job="process", started_at=now - timedelta(minutes=5), status="ok")
        self.assertFalse(jobs.is_due(j, now))
        self.assertTrue(jobs.is_due(j, now + timedelta(minutes=11)))
        seed.seed()
        feed = Feed.objects.get(config__job="portal")
        self.assertTrue(jobs.is_due(jobs.REGISTRY["portal"], now, feed))
        feed.next_run_at = now + timedelta(minutes=30)
        self.assertFalse(jobs.is_due(jobs.REGISTRY["portal"], now, feed))
        feed.enabled = False
        feed.next_run_at = None
        self.assertFalse(jobs.is_due(jobs.REGISTRY["portal"], now, feed))

    def test_a_failing_job_is_recorded_and_the_rest_still_run(self):
        jobs._load_registry()
        calls = []
        boom = jobs.Job("boom", lambda ctx: (_ for _ in ()).throw(RuntimeError("kaput api_key=SECRET")), 15)
        fine = jobs.Job("fine", lambda ctx: calls.append(ctx.counts.update(done=1)), 15)
        FetchRun.objects.create(job="old", started_at=timezone.now(), status="running")
        with mock.patch.dict(jobs.REGISTRY, {"boom": boom, "fine": fine}, clear=True):
            runs = jobs.run_due(log=lambda m: None, fetcher_factory=lambda: Fetcher(transport=ReplayTransport({}), sleep=lambda s: None))
        self.assertEqual([(r.job, r.status) for r in runs], [("boom", "failed"), ("fine", "ok")])
        self.assertIn("kaput", runs[0].error)
        self.assertNotIn("SECRET", runs[0].error)
        self.assertEqual(runs[1].counts["done"], 1)
        self.assertEqual(FetchRun.objects.get(job="old").status, "failed", "interrupted runs are closed")

    def test_feed_run_schedules_the_next(self):
        seed.seed()
        feed = Feed.objects.get(config__job="nobel")
        run("nobel", feed=feed, fetcher=replay("feeds.json"), year=2025)
        feed.refresh_from_db()
        self.assertAlmostEqual((feed.next_run_at - feed.last_run_at).total_seconds(), feed.interval_minutes * 60, delta=1)


class SeedAndDigestTests(TestCase):
    def test_seed_is_idempotent_and_keeps_owner_edits(self):
        first = seed.seed()
        self.assertGreater(first["feeds_created"], 10)
        self.assertFalse(Feed.objects.filter(url__contains="guardianapis").exists())
        self.assertFalse(Feed.objects.filter(url__contains="bbci").exists())
        self.assertEqual(Publisher.objects.get(domain="theguardian.com").fetch_policy, "browser_only")
        self.assertIn("6(g)", Publisher.objects.get(domain="theguardian.com").access_notes)
        with revising("human:owner"):
            services.apply_changes(Publisher.objects.get(domain="who.int"), {"access_notes": "owner's note"})
        Feed.objects.filter(config__job="portal").update(enabled=False)
        second = seed.seed()
        self.assertEqual((second["feeds_created"], second["publishers_created"], second["verdicts_applied"]), (0, 0, 0))
        self.assertEqual(Publisher.objects.get(domain="who.int").access_notes, "owner's note")
        self.assertFalse(Feed.objects.get(config__job="portal").enabled)
        self.assertTrue(JobState.objects.get(name="terms_verdicts_v1").state["applied"])

    def test_digest(self):
        from io import StringIO

        from django.core.management import call_command

        AgentTask.objects.create(kind="write_event", created_by="job:process", priority=60,
                                 payload={"suggested": {"title_hint": "2026 Bayelsa boat disaster", "branches": [{"slug": "nigeria"}], "last_date": "2026-11-20"}, "items_total": 2, "sources": [{}]})
        out = StringIO()
        call_command("digest", "--sources", stdout=out)
        text = out.getvalue()
        for s in ("# Queue digest", "| write_event | 1 | 0 | 60 |", "2026 Bayelsa boat disaster", "## Candidates", "## Job runs"):
            self.assertIn(s, text)


class LookupKeyTests(TestCase):
    """A key never rides in a URL: URLs reach logs and errors (docs/adr/0013-source-policy.md)."""

    def test_smithsonian_key_in_header(self):
        seen = {}

        class Recorder:
            def get(self, url, params=None, headers=None, **kw):
                seen.update(url=url, params=params or {}, headers=headers or {})
                return mock.Mock(ok=True, status=200, json=lambda: {"response": {"rows": []}})

        with override_settings(SMITHSONIAN_API_KEY="test-key-123456"):
            lookup.Smithsonian().search(Recorder(), lookup.Query("Apollo 11 lunar landing", year=1969))
        self.assertEqual(seen["headers"].get("X-Api-Key"), "test-key-123456")
        self.assertNotIn("test-key-123456", seen["url"] + json.dumps(seen["params"]))
