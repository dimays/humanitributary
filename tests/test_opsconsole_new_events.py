"""The console's New events page (ADR 0033): the feed of content items, each item's five steps derived from the rows
that already record them (tasks and their results, the entry's Revisions, the releases), the tabs and filters, the
14-day pulse, staff-only access, and a query count that stays fixed as the tables grow.

`seed_content()` makes the items through the real paths: candidates and `write_event` tasks as `process` makes them,
`fill_gap` tasks as `gap_waves` does, results applied by the agent API's appliers and completed through the queue, a
review round through `apply_edits` (approve, approve with edits, hold, reject, a duplicate, a branch and events
added), and a release. It also fills a local database for a look at the page:
    uv run python manage.py shell -c "from tests.test_opsconsole_new_events import seed_content; seed_content(days=14, scale=3)"
"""

import random
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.db import connection, transaction
from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone

from agentapi import apply as appliers
from ingest.models import Candidate
from opsconsole import newevents as NE
from publish.legacy import import_content
from publish.release import publish
from timeline import edits
from timeline.models import Branch, Entry
from work import queue
from work.models import AgentTask

from .fixtures import small
from .runner import FreshStorage

URL = "opsconsole:new_events"

STORIES = [
    ("Lead azide detonated at an Iowa Army depot", "Army detonates tons of lead azide in Iowa"),
    ("Kraków main square shooting", "Gunman opens fire in Kraków's main square"),
    ("Court restores Senegal's AFCON title", "CAS reinstates Senegal as AFCON champions"),
    ("Flooding closes Lagos ports", "Lagos ports shut as floods hit the coast"),
    ("Tokyo approves a coastal levee plan", "Tokyo assembly backs a levee plan"),
    ("Monsoon landslides in Kerala", "Landslides kill dozens in Kerala"),
    ("Mexico City water rationing begins", "Mexico City begins rationing water"),
    ("Brazil passes an Amazon logging law", "Brazil's Senate passes a logging law"),
    ("UN climate talks end without a deal", "COP talks end without agreement"),
    ("Rohingya camp fire in Cox's Bazar", "Fire sweeps a Rohingya camp"),
    ("Kyiv hosts a reconstruction summit", "Kyiv summit on reconstruction"),
    ("French rail strike enters a second week", "French rail strike goes on"),
]
NEWS = ["https://www.reuters.com/world/", "https://apnews.example.org/article/", "https://www.cnn.com/2026/11/", "https://abcnews.go.com/International/"]


def _branches(n=4) -> list[str]:
    prefer = ["france", "japan", "senegal", "nigeria", "india", "brazil", "mexico", "un", "ukraine", "bangladesh", "roman-republic"]
    have = list(Branch.objects.filter(slug__in=prefer).values_list("slug", flat=True))
    have.sort(key=prefer.index)
    return (have or list(Branch.objects.order_by("slug").values_list("slug", flat=True)))[:max(n, 1)]


def _set(model, pk, **fields):
    model.objects.filter(pk=pk).update(**fields)


def _cites(slug: str, i: int, *, single=False) -> list[dict]:
    """A news page and a Wikipedia article; `single`: the news page alone (one independent publisher: ADR 0018)."""
    wiki = {"t": f"{slug} — Wikipedia", "u": f"https://en.wikipedia.org/wiki/{slug.replace('-', '_').title()}_{i}"}
    news = NEWS[i % len(NEWS)]
    page = {"t": f"Report {i} — {news.split('/')[2]}", "u": f"{news}{slug}-{i}"}
    return [page] if single else [page, wiki]


def write_event_task(story: tuple[str, str], branch: str, created, *, n_candidates=2, k=0):
    """Candidates about one story and the write_event task `process` makes from their cluster."""
    key = f"seed-{k}-{random.randrange(10**9)}"
    b = Branch.objects.get(slug=branch)
    cands = []
    for j in range(n_candidates):
        c = Candidate.objects.create(title=f"{story[1]}{' (update)' if j else ''}", summary=story[1], when_text=f"{created:%B} {created.day}, {created.year}",
                                     y_guess=2026.9, cluster_key=key, source_key=f"seed:{key}:{j}", top_branch=b, created_by="job:portal",
                                     details={"source": "portal", "date": f"{created:%Y-%m-%d}"})
        _set(Candidate, c.pk, created_at=created - timedelta(hours=6 - j))
        cands.append(c)
    payload = {"cluster_key": key, "suggested": {"title_hint": story[0], "branches": [{"slug": branch}]},
               "items": [{"candidate": c.pk} for c in cands], "items_total": len(cands)}
    task, _ = queue.enqueue("write_event", created_by="job:process", dedupe_key=f"cluster:{key}", priority=70 + k % 20, payload=payload,
                            target_candidate=cands[0])
    _set(AgentTask, task.pk, created_at=created)
    return task


def fill_gap_task(branch: str, ws: int, we: int, created, *, wave="W1"):
    from governance.waves import key, label

    b = Branch.objects.get(slug=branch)
    payload = {"wave": {"name": wave}, "window": {"from": ws, "to": we, "label": label(ws, we)}, "gap": {"kind": "empty", "events_in_window": 0},
               "branch": {"id": branch, "name": b.name}}
    task, _ = queue.enqueue("fill_gap", created_by="job:gap_waves", dedupe_key=key(branch, ws, we), priority=55, payload=payload)
    _set(AgentTask, task.pk, created_at=created)
    return task


def run_task(task, result: dict, agent: str, *, claimed, done):
    """Claim, apply and complete a task as the agent API does (one transaction), then put its times where they were."""
    _set(AgentTask, task.pk, status="claimed", claimed_by=agent, claimed_at=claimed, lease_until=timezone.now() + timedelta(hours=1), attempts=1)
    with transaction.atomic():
        held = queue._held(task.pk, agent)
        applied = appliers.apply(held, result, agent)
        queue.complete(task.pk, agent=agent, result={**result, "applied": applied})
    _set(AgentTask, task.pk, claimed_at=claimed, completed_at=done)
    return AgentTask.objects.get(pk=task.pk)


def event(slug, branch, title, i, *, y=2026.9, when="November 20, 2026", single=False):
    return {"id": slug, "branch": branch, "y": y, "when": when, "title": title[:60], "text": f"{title}, as the reports describe it.", "imp": 2,
            "cites": _cites(slug, i, single=single)}


def seed_content(now=None, *, days=14, scale=1, release=True, review=True, skip_gates=("build",)) -> dict:
    """Content items over the last `days` days, through the real paths (see the module's docstring). Returns the
    tasks, slugs and the edit file's name by role, for the tests."""
    now = now or timezone.now()
    rnd = random.Random(7)
    br = _branches(4)
    tag = AgentTask.objects.count()
    out = {"written": [], "declined": [], "duplicate": [], "queued": [], "claimed": [], "failed": [], "gap_written": [], "gap_nothing": [],
           "gap_queued": [], "slugs": []}
    k = 0
    for d in range(days - 1, -1, -1):
        day = now - timedelta(days=d)
        for _ in range(scale):
            k += 1
            story = STORIES[k % len(STORIES)]
            branch = br[k % len(br)]
            created = day - timedelta(hours=rnd.randint(2, 9))
            t = write_event_task(story, branch, created, n_candidates=1 + k % 3, k=k)
            agent = f"agent:writer-{'ab'[k % 2]}"
            claimed, done = created + timedelta(minutes=40), created + timedelta(minutes=58)
            if d == 0 and k % 3 == 0:
                out["queued"].append(t)
                continue
            if d == 0 and k % 3 == 1:
                _set(AgentTask, t.pk, status="claimed", claimed_by=agent, claimed_at=now - timedelta(minutes=12), lease_until=now + timedelta(minutes=48), attempts=1)
                out["claimed"].append(t)
                continue
            if k % 7 == 3:
                out["declined"].append(run_task(t, {"decision": "rejected", "note": "A routine incident with no outcome yet; not an event for the timeline."},
                                                agent, claimed=claimed, done=done))
            elif k % 11 == 5 and out["slugs"]:
                out["duplicate"].append(run_task(t, {"decision": "duplicate", "entry": out["slugs"][0], "note": "The same story as an event already written."},
                                                 agent, claimed=claimed, done=done))
            elif k % 13 == 6:
                _set(AgentTask, t.pk, status="failed", claimed_by="", completed_at=done, attempts=3, error="lease expired after 3 attempts")
                out["failed"].append(t)
            else:
                slug = f"cur-{tag}-{k}-" + "".join(ch for ch in story[0].lower().split()[0] if ch.isascii() and ch.isalnum())
                out["written"].append(run_task(t, {"decision": "written", "event": event(slug, branch, story[0], k, when=f"{day:%B} {day.day}, {day.year}", single=k % 5 == 2)},
                                               agent, claimed=claimed, done=done))
                out["slugs"].append(slug)
        if d % 2 == 0:  # history waves: a gap task most days
            for j in range(scale):
                k += 1
                branch = br[(k + j) % len(br)]
                ws = 1925 + 5 * ((k * 3 + j) % 18)
                created = day - timedelta(hours=10 + j)
                t = fill_gap_task(branch, ws, ws + 5, created)
                if d == 0:
                    out["gap_queued"].append(t)
                    continue
                agent = "agent:gaps-a"
                claimed, done = created + timedelta(hours=2), created + timedelta(hours=2, minutes=25)
                if k % 4 == 1:
                    out["gap_nothing"].append(run_task(t, {"decision": "nothing_notable", "note": "Searched the branch's history articles for this window; nothing notable and sourceable."},
                                                       agent, claimed=claimed, done=done))
                else:
                    evs = [event(f"gap-{tag}-{k}-{m}", branch, f"{Branch.objects.get(slug=branch).name}: a {ws + m} milestone", k + m,
                                 y=ws + m + 0.5, when=str(ws + m)) for m in range(1 + k % 2)]
                    out["gap_written"].append(run_task(t, {"decision": "written", "events": evs}, agent, claimed=claimed, done=done))
    if not review:
        return out
    # A review round: approvals (some with edits), a hold, two rejections (one a duplicate) and a branch with events added.
    written = out["written"]
    slugs = [Entry.objects.get(pk=AgentTask.objects.get(pk=t.pk).revisions.filter(table_name="timeline_entry", action="insert").first().row_pk).slug
             for t in written]
    gap_slugs = [s for t in out["gap_written"] for s in (AgentTask.objects.get(pk=t.pk).result or {}).get("entries", [])]
    ops = []
    approve = slugs[:-4] if len(slugs) > 5 else slugs[:1]
    for i, s in enumerate(approve):
        if i % 3 == 0:
            ops.append({"op": "edit", "entry": s, "fields": {"title": f"{Entry.objects.get(slug=s).as_event.title} (edited)"[:60]},
                        "reason": f"Review round (seed) §A{i}: APPROVE WITH EDITS; a clearer title"})
        ops.append({"op": "approve", "entry": s, "reason": f"Review round (seed) §A{i}: APPROVE{' WITH EDITS' if i % 3 == 0 else ''}; every claim is on the cited pages"})
    for s in gap_slugs[: max(1, len(gap_slugs) // 2)]:
        ops.append({"op": "approve", "entry": s, "reason": "Wave review (seed): APPROVE; the window's history article and a second source agree"})
    rest = [s for s in slugs if s not in approve]
    held = rest[0] if rest else None
    if held:
        ops.append({"op": "edit", "entry": held, "fields": {"text": "A shorter text, pending a second source."},
                    "reason": "Review round (seed) §B1: HOLD until a second source confirms the toll"})
    if len(rest) > 1:
        ops.append({"op": "reject", "entry": rest[1], "reason": "Review round (seed) §C1: REJECT; a routine incident"})
    if len(rest) > 2:
        ops.append({"op": "reject", "entry": rest[2], "reason": f"Review round (seed) §C2: REJECT (duplicate); {slugs[0]} already covers it"})
    nb = f"seed-guild-{tag}"
    ops.append({"op": "add_branch", "branch": {"id": nb, "name": "Hanseatic League (seed)", "region": Branch.objects.get(slug=br[0]).region.slug,
                                              "start": 1356, "startWhen": "1356", "end": 1862, "endWhen": "1862", "text": "A league of merchant towns around the Baltic.",
                                              "cites": _cites(nb, 1)}, "reason": "Branches review (seed): ADD a missing branch"})
    for m in range(2):
        ops.append({"op": "add_event", "event": event(f"{nb}-ev-{m}", nb, f"Hanseatic diet {m + 1}", 40 + m, y=1360 + 10 * m, when=str(1360 + 10 * m)),
                    "reason": "Branches review (seed): ADD an event on the new branch"})
    ops.append({"op": "add_event", "event": event(f"{nb}-ev-pub", br[1], "A published addition", 50, y=1900.5, when="1900"), "status": "published",
                "reason": "Branches review (seed): ADD, published through the rule"})
    edits.apply(ops, actor="human:owner", source="seed-round.edits.json")
    out.update(approved=approve, held=held, rejected=rest[1] if len(rest) > 1 else None, rejected_dup=rest[2] if len(rest) > 2 else None,
               branch=nb, gap_slugs=gap_slugs, file="seed-round.edits.json")
    if release:
        publish(actor="human:owner", skip_gates=tuple(skip_gates))
    # After the release: one more approval, so one item is approved and not released yet.
    late = gap_slugs[max(1, len(gap_slugs) // 2)] if len(gap_slugs) > 1 else None
    if late:
        edits.apply([{"op": "approve", "entry": late, "reason": "Wave review (seed): APPROVE after the release"}], actor="human:owner", source="seed-late.edits.json")
    out["late"] = late
    return out


def login(case):
    case.staff = getattr(case, "staff", None) or User.objects.create_user("staff", password="x", is_staff=True)
    case.client.force_login(case.staff)


class NewEventsAccessTests(FreshStorage, TestCase):
    def test_staff_only_read_only_noindex(self):
        r = self.client.get(reverse(URL))
        self.assertEqual(r.status_code, 302)
        self.assertIn("/admin/login/", r["Location"])
        User.objects.create_user("reader", password="x")
        self.client.login(username="reader", password="x")
        self.assertIn(self.client.get(reverse(URL)).status_code, (302, 403))
        login(self)
        r = self.client.get(reverse(URL))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r["X-Robots-Tag"], "noindex, nofollow")
        self.assertIn("no-store", r["Cache-Control"])
        self.assertEqual(self.client.post(reverse(URL)).status_code, 405)
        self.assertContains(r, "Nothing here")

    def test_in_the_sidebar(self):
        login(self)
        r = self.client.get(reverse(URL))
        nav = r.content.decode().split('<nav class="nav"', 1)[1].split("</nav>", 1)[0]
        self.assertIn('href="/ops/new/" class="on" aria-current="page"', nav)


class NewEventsTests(FreshStorage, TestCase):
    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("staff", password="x", is_staff=True)
        cls.now = timezone.now()
        cls.s = seed_content(cls.now, days=6, scale=2)

    def setUp(self):
        super().setUp()
        cache.clear()
        self.client.force_login(self.staff)

    def items(self, **get):
        from django.http import QueryDict

        q = QueryDict(mutable=True)
        q.update({"range": "all", **get})
        f = NE.parse(q)
        data = NE.counts_and_pulse(f, timezone.now())
        return data, NE.Items(f, timezone.now(), data["total"])[0:500]

    def find(self, items, *, task=None, slug=None):
        for i in items:
            if (task and i["task"] == task) or (slug and i["slug"] == slug):
                return i
        raise AssertionError(f"no item for task {task} / {slug}")

    def steps(self, item):
        return [(s["key"], s["status"]) for s in item["steps"]]

    def test_current_event_lifecycle(self):
        _, items = self.items()
        s = self.s
        approved = self.find(items, slug=s["approved"][0])  # approved with edits, then released
        self.assertEqual(approved["source"], "current")
        self.assertEqual(approved["state"], "published")
        self.assertEqual(approved["verdict"], "Approved with edits")
        self.assertEqual(approved["verdict_by"], "human:owner")
        self.assertTrue(approved["live"])
        self.assertTrue(approved["public_url"].endswith(f"/#{approved['slug']}"))
        self.assertEqual(self.steps(approved), [("fetched", "done"), ("queued", "done"), ("drafted", "done"), ("reviewed", "done"), ("published", "done")])
        self.assertTrue(approved["agent"].startswith("agent:writer-"))
        self.assertEqual(approved["sources"], {"total": 2, "non_wikipedia": 1, "witnesses": 2, "single": False})
        self.assertEqual(approved["branches"][0]["slug"], Entry.objects.get(slug=approved["slug"]).as_event.branch.slug)
        t = AgentTask.objects.get(pk=approved["task"])
        fetched = min(Candidate.objects.filter(pk__in=[x["candidate"] for x in t.payload["items"]]).values_list("created_at", flat=True))
        self.assertEqual(approved["steps"][0]["at"], fetched)
        self.assertEqual(approved["steps"][1]["at"], t.created_at)
        self.assertEqual(approved["steps"][2]["at"], t.completed_at)
        labels = [x[0] for x in approved["links"]]
        self.assertEqual(labels[0], "On the page")
        self.assertIn(f"Task #{t.pk}", labels)
        self.assertIn("Revisions", labels)
        plain = self.find(items, slug=s["approved"][1])
        self.assertEqual(plain["verdict"], "Approved")
        held = self.find(items, slug=s["held"])
        self.assertEqual((held["state"], held["verdict"]), ("held", "Held"))
        self.assertEqual(self.steps(held)[3:], [("reviewed", "current"), ("published", "pending")])
        self.assertIn("HOLD", held["verdict_why"])

    def test_rejections_and_agent_decisions(self):
        _, items = self.items()
        s = self.s
        rej = self.find(items, slug=s["rejected"])
        self.assertEqual(rej["state"], "rejected")
        self.assertEqual(self.steps(rej)[3:], [("reviewed", "failed"), ("published", "skipped")])
        dup = self.find(items, slug=s["rejected_dup"])
        self.assertEqual((dup["state"], dup["verdict"]), ("duplicate", "Duplicate"))
        dec = self.find(items, task=s["declined"][0].pk)
        self.assertEqual(dec["state"], "declined")
        self.assertFalse(dec["drafted"])
        self.assertEqual(self.steps(dec)[2:], [("drafted", "failed"), ("reviewed", "skipped"), ("published", "skipped")])
        self.assertIn("routine incident", dec["note"])
        self.assertEqual(dec["title"], AgentTask.objects.get(pk=dec["task"]).payload["suggested"]["title_hint"])
        if s["duplicate"]:
            d = self.find(items, task=s["duplicate"][0].pk)
            self.assertEqual((d["state"], d["duplicate_of"]), ("duplicate", s["slugs"][0]))
        failed = self.find(items, task=s["failed"][0].pk) if s["failed"] else None
        if failed:
            self.assertEqual(failed["state"], "failed")
        q = self.find(items, task=s["queued"][0].pk)
        self.assertEqual(self.steps(q)[1:3], [("queued", "current"), ("drafted", "pending")])
        c = self.find(items, task=s["claimed"][0].pk)
        self.assertEqual((c["state"], c["steps"][2]["status"], c["steps"][2]["note"]), ("writing", "current", c["steps"][2]["note"]))

    def test_wave_lifecycle(self):
        _, items = self.items()
        s = self.s
        task = s["gap_written"][0]
        mine = [i for i in items if i["task"] == task.pk]
        self.assertEqual(len(mine), len(task.result["entries"]))  # one item per event the task wrote
        i = mine[0]
        self.assertEqual(i["source"], "wave")
        self.assertEqual(i["wave"], "W1")
        self.assertTrue(i["window"])
        self.assertEqual(i["steps"][0]["label"], "Gap found")
        self.assertEqual(i["steps"][0]["at"], AgentTask.objects.get(pk=task.pk).created_at)
        late = self.find(items, slug=s["late"])
        self.assertEqual(late["state"], "approved")
        self.assertEqual(late["steps"][4]["status"], "current")
        self.assertIsNone(late["release"])
        self.assertFalse(late["live"])
        nothing = self.find(items, task=s["gap_nothing"][0].pk)
        self.assertEqual(nothing["state"], "nothing_notable")
        waiting = self.find(items, task=s["gap_queued"][0].pk)
        self.assertEqual(waiting["state"], "queued")
        self.assertEqual(waiting["branches"][0]["slug"], s["gap_queued"][0].dedupe_key.split(":")[1])

    def test_branch_additions(self):
        _, items = self.items(tab="branches")
        s = self.s
        self.assertEqual({i["source"] for i in items}, {"branch"})
        self.assertEqual(len(items), 4)  # the branch and three events
        b = self.find(items, slug=s["branch"])
        self.assertEqual((b["kind"], b["edit_op"], b["edit_file"]), ("branch", "add_branch", s["file"]))
        self.assertEqual(self.steps(b)[:3], [("fetched", "skipped"), ("queued", "skipped"), ("drafted", "done")])
        self.assertEqual(b["state"], "review")
        pub = self.find(items, slug=f"{s['branch']}-ev-pub")
        self.assertEqual((pub["state"], pub["verdict"]), ("published", "Added as published"))
        ev = self.find(items, slug=f"{s['branch']}-ev-0")
        self.assertEqual(ev["branches"][0]["slug"], s["branch"])

    def test_tabs_and_filters(self):
        data, items = self.items()
        tabs = data["tabs"]
        self.assertEqual(tabs["all"], len(items))
        self.assertEqual(tabs["current"] + tabs["waves"] + tabs["branches"], tabs["all"])
        for tab, check in [("current", lambda i: i["source"] == "current"), ("waves", lambda i: i["source"] == "wave"),
                           ("rejected", lambda i: i["state"] in NE.REJECTED), ("waiting", lambda i: i["state"] in NE.WAITING)]:
            d, its = self.items(tab=tab)
            self.assertEqual(len(its), tabs[tab], tab)
            self.assertTrue(its and all(check(i) for i in its), tab)
        d, its = self.items(state="held")
        self.assertEqual([i["slug"] for i in its], [self.s["held"]])
        branch = self.s["branch"]
        d, its = self.items(branch=branch)
        self.assertEqual(len(its), 3)  # the branch and its two events (the published addition is on another branch)
        d, its = self.items(range="today")
        self.assertTrue(all(i["last_at"] >= NE.midnight(timezone.now()) for i in its))
        d7, its7 = self.items(range="7d")
        self.assertEqual(len(its7), len(items))  # six days of seed
        _, ordered = self.items()
        self.assertEqual([i["last_at"] for i in ordered], sorted((i["last_at"] for i in ordered), reverse=True))
        f = NE.parse({"tab": "nope", "state": "nope", "range": "nope", "branch": "no-such-branch"})
        self.assertEqual((f.tab, f.state, f.range, f.branch, f.branch_id), ("all", "", NE.DEFAULT_RANGE, "", None))

    def test_pulse(self):
        data, items = self.items()
        p = data["pulse"]
        self.assertEqual(len(p["days"]), NE.PULSE_DAYS)
        self.assertEqual(p["days"][-1], NE.midnight(timezone.now()).date())
        by = {x["key"]: x for x in p["series"]}
        self.assertEqual(by["queued"]["total"], AgentTask.objects.filter(kind__in=["write_event", "fill_gap"]).count())
        self.assertEqual(by["fetched"]["total"], Candidate.objects.count())
        drafted = sum(1 for i in items if i["drafted"])
        self.assertEqual(by["drafted"]["total"], drafted)
        self.assertEqual(by["published"]["total"], sum(1 for i in items if i["release"]))
        self.assertEqual(by["rejected"]["total"], sum(1 for i in items if i["state"] in ("declined", "rejected", "duplicate")))
        self.assertEqual(by["published"]["today"], by["published"]["total"])  # the release is today
        for s in p["series"]:
            self.assertEqual(len(s["bars"]), NE.PULSE_DAYS)
            self.assertTrue(all(0 <= b["h"] <= NE.BAR_H for b in s["bars"]))

    def test_page_renders(self):
        r = self.client.get(reverse(URL), {"range": "all"})
        self.assertEqual(r.status_code, 200)
        html = r.content.decode()
        for text in ("Pulse, last 14 days", "Current events", "History waves", "Branch additions", "Rejected &amp; duplicates", "Waiting",
                     'class="stepper"', "LIVE", "single source", "Approved with edits", 'id="item-cards"', 'role", "tooltip"', "<svg"):
            self.assertIn(text, html, text)
        self.assertIn(self.s["approved"][0], html)
        for tab in ("current", "waves", "branches", "rejected", "waiting"):
            self.assertEqual(self.client.get(reverse(URL), {"tab": tab, "range": "30d"}).status_code, 200)
        self.assertEqual(self.client.get(reverse(URL), {"state": "held", "branch": self.s["branch"]}).status_code, 200)

    def test_reading_writes_nothing(self):
        from revisions.models import Revision

        before = (Revision.objects.count(), AgentTask.objects.count(), Entry.objects.count())
        self.client.get(reverse(URL), {"range": "all"})
        self.assertEqual(before, (Revision.objects.count(), AgentTask.objects.count(), Entry.objects.count()))


class NewEventsQueryCountTests(FreshStorage, TestCase):
    @classmethod
    def setUpTestData(cls):
        import_content(small())
        cls.staff = User.objects.create_user("staff", password="x", is_staff=True)

    def count(self, **params):
        self.client.force_login(self.staff)
        with CaptureQueriesContext(connection) as ctx:
            r = self.client.get(reverse(URL), params)
        self.assertEqual(r.status_code, 200)
        return len(ctx.captured_queries)

    def test_bounded(self):
        seed_content(days=3, scale=1)
        small_counts = [self.count(range="all"), self.count(tab="rejected"), self.count(branch="un", state="published")]
        seed_content(days=12, scale=3, release=True)
        big_counts = [self.count(range="all"), self.count(tab="rejected"), self.count(branch="un", state="published")]
        self.assertEqual(small_counts, big_counts)
        # session, user, two permission reads, the branch, counts and pulse, a page, the live release, details, the branch
        # list; and the sidebar's Review count (one query, ADR 0046)
        self.assertLessEqual(max(big_counts), 11)
