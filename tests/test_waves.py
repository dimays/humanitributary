"""Content waves (docs/adr/0026-content-waves.md): windows, gap detection on a small fixture, the daily cap and the
one-open-per-branch limit, recently-attempted suppression, wave advancement, the fill_gap result over the agent API,
and the pointers' heading parser. No network: the pointers' API calls are stubbed."""

import json
from collections import Counter
from datetime import date, timedelta
from io import StringIO
from types import SimpleNamespace
from unittest import mock

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone

from agentapi.auth import create_token
from governance import pointers, waves
from publish.legacy import import_content
from revisions import revising
from timeline import services
from timeline.models import Branch, Event, Status
from work import queue
from work.models import AgentTask

WAVES = [{"name": "A", "start": 1900, "end": 1950, "window": 10}, {"name": "B", "start": 1800, "end": 1900, "window": 50}]
RULES = {"min_peers": 2, "advance_below": 1}
TODAY = date(2026, 11, 26)


def cite(slug):
    return {"t": f"{slug} — Wikipedia", "u": f"https://en.wikipedia.org/wiki/{slug}"}


def branch(id, region, start, end=None):
    b = {"id": id, "name": id.title(), "region": region, "start": start, "end": end, "startWhen": str(start), "parents": [], "into": [],
         "text": f"{id.title()}.", "cites": [cite(id.title())]}
    if end is not None:
        b["endWhen"] = str(end)
    return b


def event(id, br, y):
    return {"id": id, "branch": br, "y": y, "when": str(y), "title": id.replace("-", " "), "text": "Something happened.", "imp": 2, "cites": [cite(id)]}


def content():
    B = [branch("alpha", "europe", 1850), branch("beta", "europe", 1900, 1950), branch("gamma", "europe", 1900), branch("delta", "europe", 1900),
         branch("faith", "faiths", 1800), branch("rock", "cosmos", 1800), branch("short", "europe", 1945, 1949), branch("old", "europe", 1700, 1790)]
    E = [event(f"al-{y}", "alpha", y) for y in (1901, 1903, 1905, 1912, 1914, 1915, 1932, 1934, 1935, 1942, 1944, 1945)]
    for b in ("beta", "gamma"):
        E += [event(f"{b[:2]}-{d}{k}", b, 1900 + d * 10 + k) for d in range(5) for k in (2, 3, 5)]
    E += [event(f"de-{d}{k}", "delta", 1900 + d * 10 + k) for d in range(5) for k in ((1,) if d == 2 else (2, 3, 5))]
    E += [event("fa-1910", "faith", 1910), event("sh-1946", "short", 1946), event("ol-1750", "old", 1750)]
    return {"branches": B, "events": E}


class WindowTests(SimpleTestCase):
    def test_windows_and_tails(self):
        w1 = waves.DEFAULT_WAVES[0]
        wins = waves.windows(w1, TODAY)
        self.assertEqual((wins[0], wins[-1], len(wins)), ((1925, 1930), (2020, 2026), 20), "a one-year tail joins the last window")
        self.assertEqual(waves.windows(w1, TODAY, wide=True), [(1925, 1945), (1945, 1965), (1965, 1985), (1985, 2005), (2005, 2026)])
        self.assertEqual(waves.windows({"start": 1800, "end": 1925, "window": 10}, TODAY, wide=True), [(1800, 1840), (1840, 1880), (1880, 1925)])
        self.assertEqual(waves.windows({"start": 1800, "end": 1900, "window": 50}, TODAY, wide=True), [(1800, 1900)], "a wave shorter than a window is one window")
        self.assertEqual(waves.label(-1000, -900), "1000 BCE–900 BCE")
        self.assertTrue(waves.in_window({"y": 1939.7, "end": 1945.6}, 1940, 1945))
        self.assertFalse(waves.in_window({"y": 1939.0, "end": 1940.0}, 1940, 1945), "a span ending as the window opens doesn't count")
        self.assertFalse(waves.in_window({"y": 1945.0, "end": None}, 1940, 1945))

    def test_heading_spans(self):
        h = lambda s: pointers.heading_spans(s, present=2027)  # noqa: E731
        self.assertEqual(h("Military rule (1966–1979)"), [(1966, 1980)])
        self.assertEqual(h("World War I (1914–18)"), [(1914, 1919)])
        self.assertEqual(h("19th century"), [(1800, 1900)])
        self.assertEqual(h("Early modern period (16th–18th centuries)"), [(1500, 1800)])
        self.assertEqual(h("5th century BC"), [(-500, -400)])
        self.assertEqual(h("Ancient history (c. 3000 BC – 500 AD)"), [(-3000, 501)])
        self.assertEqual(h("The <i>1920s</i>"), [(1920, 1930)])
        self.assertEqual(h("Fourth Republic (1999–present)"), [(1999, 2028)])
        self.assertEqual(h("Pre-colonial era"), [])
        self.assertEqual(pointers.overlaps(h("Military rule (1966–1979)"), 1960, 1965), [])
        self.assertTrue(pointers.overlaps(h("Military rule (1966–1979)"), 1965, 1970))


@override_settings(CONTENT_WAVES=WAVES, GAP_RULES=RULES)
class GapTests(TestCase):
    def setUp(self):
        import_content(content())

    def gaps(self):
        gaps, coverage = waves.detect(TODAY)
        return {(g.branch, waves.label(g.ws, g.we), g.kind) for g in gaps}, gaps, coverage

    def test_detection(self):
        found, gaps, coverage = self.gaps()
        self.assertEqual(found, {
            ("alpha", "1920–1930", "empty"), ("delta", "1920–1930", "sparse"),  # 1 event where its peers have 3
            ("alpha", "1850–1900", "empty"), ("faith", "1800–1900", "empty"),    # wave B; faith's windows are 4× wider
        })
        # Not gaps: rock (an exempt region), short (alive for less than half its window), old (dead before the waves),
        # faith in wave A (one 1900–1950 window with an event), beta / gamma (full).
        self.assertEqual(coverage["A"], {"pairs": 21, "covered": 20, "empty": 1, "sparse": 1, "branches": 5, "share_covered": 0.952})
        g = next(g for g in gaps if g.branch == "delta")
        self.assertEqual((g.count, g.peer_median, g.peer_group), (1, 3, "europe / 1920–1930"))

    def test_queue_payload_cap_and_branch_limit(self):
        out = waves.run(per_day=1)
        self.assertEqual(out["counts"]["queued"], 1)
        self.assertEqual(out["counts"]["A.held_cap"], 1)
        self.assertNotIn("B.queued", out["counts"], "only waves up to the active one are queued")
        t = AgentTask.objects.get(kind="fill_gap")
        self.assertTrue(60 <= t.priority <= 69, t.priority)
        self.assertEqual(t.created_by, "job:gap_waves")
        p = t.payload
        self.assertEqual(p["window"]["label"], "1920–1930")
        if p["branch"]["id"] == "alpha":
            self.assertEqual([e["id"] for e in p["before"]], ["al-1912", "al-1914", "al-1915"])
            self.assertEqual([e["id"] for e in p["after"]], ["al-1932", "al-1934", "al-1935"])
            self.assertEqual(p["branch"]["id_prefixes"][0], {"prefix": "al", "events": 12})
        self.assertEqual(p["branch"]["wikipedia"], [f"https://en.wikipedia.org/wiki/{p['branch']['name']}"])
        # The cap counts the day's tasks: a second run the same day adds nothing; a bigger cap adds the other gap.
        self.assertEqual(waves.run(per_day=1)["counts"]["queued"], 0)
        self.assertEqual(waves.run(per_day=5)["counts"]["queued"], 1)
        self.assertEqual(AgentTask.objects.filter(kind="fill_gap", status="queued").count(), 2)
        # A second gap on a branch that has an open task waits for it (one open per branch).
        with override_settings(GAP_RULES={**RULES, "advance_below": 0}):
            waves.set_active("B", by="human:owner", reason="test")
            out = waves.run(per_day=5)
        self.assertEqual(out["counts"]["B.held_branch"], 1)  # alpha 1850–1900 waits for alpha 1920–1930
        self.assertEqual(out["counts"]["B.queued"], 1)       # faith 1800–1900
        faith = AgentTask.objects.get(kind="fill_gap", payload__branch__id="faith")
        self.assertTrue(50 <= faith.priority <= 59, "wave B's band is below wave A's")

    def test_recently_attempted_is_not_requeued(self):
        waves.run(per_day=5)
        t = AgentTask.objects.get(kind="fill_gap", payload__branch__id="alpha")
        AgentTask.objects.filter(pk=t.pk).update(status="claimed", claimed_by="agent:filler", lease_until=timezone.now() + timedelta(minutes=30))
        queue.complete(t.pk, agent="agent:filler", result={"decision": "nothing_notable", "note": "A quiet decade in every source read."})
        out = waves.run(per_day=5)
        self.assertEqual(out["counts"]["A.recent_nothing_notable"], 1)
        self.assertEqual(AgentTask.objects.filter(kind="fill_gap", payload__branch__id="alpha").count(), 1)
        later = waves.run(per_day=5, now=timezone.now() + timedelta(days=181))
        self.assertEqual(later["counts"]["A.queued"], 1, "after retry_after_days the window is tried again")

    @override_settings(GAP_RULES={**RULES, "density_floor": 0})  # empty gaps only: one event fills a window
    def test_task_withdrawn_when_the_window_fills(self):
        waves.run(per_day=5)
        with revising("human:owner", reason="test"):
            services.save_event("al-1925", branch=Branch.objects.get(slug="alpha"), y=1925, when="1925", title="A 1920s event",
                                text="Something happened.", imp=2, why="", status=Status.PUBLISHED)
        out = waves.run(per_day=5)
        self.assertEqual(out["counts"]["cancelled_filled"], 1)
        self.assertEqual(AgentTask.objects.get(kind="fill_gap", dedupe_key="gap:alpha:1920:1930").status, "cancelled")

    def test_wave_advances_when_nearly_done_and_by_command(self):
        out = waves.run(per_day=5)
        self.assertEqual((out["active"], out["advanced_to"]), ("A", []))
        for t in AgentTask.objects.filter(kind="fill_gap"):
            AgentTask.objects.filter(pk=t.pk).update(status="done", completed_at=timezone.now(), result={"decision": "written", "entries": ["x"]})
        out = waves.run(per_day=5)
        self.assertEqual((out["active"], out["advanced_to"]), ("B", ["B"]))
        self.assertEqual(out["counts"]["A.recent_written"], 2)
        self.assertEqual(out["counts"]["B.queued"], 2, "the new wave's gaps are queued in the same run")
        st = waves.state()
        self.assertEqual(st.state["history"][-1]["to"], "B")
        self.assertEqual(st.state["last_run"]["active"], "B")
        s = StringIO()
        call_command("waves", "advance", "--to", "A", "--by", "human:owner", stdout=s)
        self.assertIn("B → A", s.getvalue())
        with self.assertRaises(CommandError):
            call_command("waves", "advance", "--to", "Z", stdout=StringIO())
        call_command("waves", "advance", stdout=StringIO())
        with self.assertRaises(CommandError):
            call_command("waves", "advance", stdout=StringIO())  # B is the last wave
        s = StringIO()
        call_command("digest", stdout=s)
        self.assertIn("## Content waves (active: B)", s.getvalue())

    def test_dry_run_writes_nothing(self):
        out = waves.run(per_day=5, dry_run=True)
        self.assertEqual(len(out["queued"]), 2)
        self.assertFalse(AgentTask.objects.filter(kind="fill_gap").exists())
        self.assertNotIn("last_run", waves.state().state)
        s = StringIO()
        call_command("waves", "gaps", "--wave", "A", stdout=s)
        self.assertIn("alpha", s.getvalue())

    def test_pointers_from_stubbed_lookups(self):
        waves.run(per_day=5)

        def api_get(fetcher, params, url=None):
            if params["action"] == "query":
                return {"query": {"pages": [{"title": "History of Alpha"}, {"title": "Alpha"}, {"title": "Timeline of Alpha", "missing": True},
                                            {"title": "History of Delta", "missing": True}, {"title": "Delta"}]}}
            secs = {"History of Alpha": [{"line": "Between the wars (1919–1939)", "anchor": "Between_the_wars"}, {"line": "19th century", "anchor": "C19"}],
                    "Alpha": [{"line": "History", "anchor": "History"}], "Delta": [{"line": "The 1920s", "anchor": "1920s"}]}
            return {"parse": {"sections": secs.get(params["page"], [])}}

        ctx = SimpleNamespace(opt=lambda k, d=None: d, fetcher=None, counts=Counter(), error=lambda m: None)
        with mock.patch("ingest.wikidata.api_get", api_get), mock.patch("ingest.lookup.lookup", lambda *a, **k: []):
            pointers.run(ctx)
        p = AgentTask.objects.get(kind="fill_gap", payload__branch__id="alpha").payload["pointers"]
        self.assertEqual([s["section"] for s in p["wikipedia_sections"]], ["Between the wars (1919–1939)"])
        self.assertEqual(p["wikipedia_sections"][0]["url"], "https://en.wikipedia.org/wiki/History_of_Alpha#Between_the_wars")
        self.assertIn("not evidence", p["note"])
        self.assertEqual(ctx.counts["tasks"], 2)


@override_settings(CONTENT_WAVES=WAVES, GAP_RULES=RULES)
class FillGapApiTests(TestCase):
    def setUp(self):
        import_content(content())
        waves.run(per_day=5)
        self.task = AgentTask.objects.get(kind="fill_gap", payload__branch__id="alpha")
        AgentTask.objects.exclude(pk=self.task.pk).update(status="cancelled")
        _, self.token = create_token("filler", ["fill_gap"], created_by="human:owner")

    def call(self, method, path, body=None):
        h = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        if body is not None:
            return getattr(self.client, method)(f"/api/agent/{path}", data=json.dumps(body), content_type="application/json", **h)
        return getattr(self.client, method)(f"/api/agent/{path}", **h)

    def ev(self, **kw):
        return {"id": "al-1925-treaty", "branch": "alpha", "y": 1925.5, "when": "July 1925", "title": "Alpha signs a treaty",
                "text": "Alpha signed a treaty, according to the national archive.", "imp": 2,
                "cites": [{"t": "Treaty of 1925", "u": "https://www.archives.gov/alpha-1925", "k": "archive", "excerpt": "The treaty was signed in July 1925"}], **kw}

    def test_schema_scope_and_written_events_land_in_review(self):
        self.assertEqual(self.call("get", "schemas/fill_gap").status_code, 200)
        r = self.call("post", "tasks/claim", {"kinds": ["fill_gap"]})
        self.assertEqual(r.json()["task"]["id"], self.task.pk)
        self.assertEqual(self.call("post", "tasks/claim", {"kinds": ["write_event"]}).status_code, 403)
        bad = [
            ({"decision": "written", "events": [self.ev(id=f"al-x{i}") for i in range(4)]}, "events"),  # more than three
            ({"decision": "written", "events": []}, "events"),
            ({"decision": "nothing_notable"}, "note"),
            ({"decision": "nothing_notable", "note": "Nothing notable found here.", "events": [self.ev()]}, "events"),
        ]
        for result, where in bad:
            r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": result})
            self.assertEqual(r.status_code, 422, result)
            self.assertTrue(any(where in p for p in r.json()["problems"]), r.json())
        r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": {"decision": "written", "events": [self.ev(y=1931)]}})
        self.assertEqual(r.status_code, 422)
        self.assertIn("outside the window", r.json()["error"])
        r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": {"decision": "written", "events": [self.ev(branch="beta")]}})
        self.assertEqual(r.status_code, 422)
        self.assertIn("not 'beta'", r.json()["error"])
        self.assertFalse(Event.objects.filter(slug="al-1925-treaty").exists())
        r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": {"decision": "written", "events": [self.ev(), self.ev(id="al-1928-war", y=1927, end=1931, when="1927–1931")]}})
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(set(Event.objects.filter(slug__in=["al-1925-treaty", "al-1928-war"]).values_list("status", flat=True)), {Status.REVIEW})
        self.task.refresh_from_db()
        self.assertEqual((self.task.status, self.task.result["entries"]), ("done", ["al-1925-treaty", "al-1928-war"]))
        # In review, not published: the window is still a gap, but the job leaves it alone for a while.
        self.assertEqual(waves.run(per_day=5)["counts"]["A.recent_written"], 1)

    def test_nothing_notable_and_token_scope_command(self):
        self.call("post", "tasks/claim", {"kinds": ["fill_gap"]})
        r = self.call("post", f"tasks/{self.task.pk}/complete", {"result": {"decision": "nothing_notable", "note": "Read the 1920s section of History of Alpha; nothing notable."}})
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["task"]["result"]["applied"], {"entries": [], "decision": "nothing_notable"})
        s = StringIO()
        call_command("agent_token", "create", "gapper", "--scope", "fill_gap", stdout=s)
        self.assertIn("['fill_gap']", s.getvalue())
