"""Pictures for events (docs/adr/0048-event-images.md): the image_search job's pacing (a cooldown between attempts, a
retry limit), its license and AI filters, its routing (sure matches attached, the rest to the owner's Review page),
the sensitivity signals and the owner's flag, the snapshot's new image fields and their round trip, and the
database's refusal of an incomplete attribution. The page's blur is tested in Node (tests/test_site_images.py).

Every source answer here is a recorded shape (no network): an httpx.MockTransport routes each request by host."""

import json
import uuid
from collections import Counter
from datetime import timedelta
from urllib.parse import parse_qs, urlsplit

import httpx
from django.contrib.auth.models import Permission, User
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from ingest import images as I
from ingest.http import Fetcher
from ingest.models import ImageCandidate, ImageSearch
from opsconsole import review as RV
from opsconsole.models import OpsAction
from publish.content import dumps, without_derived
from publish.export import build_content
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Entry, Image

from .fixtures import small
from .runner import FreshStorage

CAESAR_QID = "Q1067488"
PD_FILE = "File:Vincenzo Camuccini - La morte di Cesare.jpg"
BYSA_FILE = "File:Caesar death by Gerome.jpg"


def meta(**kw):
    return {k: {"value": v} for k, v in kw.items()}


def commons_page(title, *, license="pd", short="Public domain", artist="Vincenzo Camuccini", categories="Paintings of the assassination of Julius Caesar",
                 date="between 1804 and 1805", name="La morte di Cesare", description="The assassination of Julius Caesar in the Senate",
                 restrictions="", nonfree="", license_url=""):
    slug = title.split(":", 1)[1].replace(" ", "_")
    m = meta(License=license, LicenseShortName=short, Artist=f"<bdi><a href='x'>{artist}</a></bdi>" if artist else "", Categories=categories,
             DateTimeOriginal=date, ObjectName=f'<div class="fn">{name}</div>', ImageDescription=description, Restrictions=restrictions,
             LicenseUrl=license_url, NonFree=nonfree, Credit="Own work")
    return {"title": title, "imageinfo": [{
        "thumburl": f"https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/{slug}/500px-{slug}?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
        "thumbwidth": 500, "thumbheight": 283, "width": 2048, "height": 1161, "mime": "image/jpeg",
        "url": f"https://upload.wikimedia.org/wikipedia/commons/e/eb/{slug}?utm_source=x",
        "descriptionurl": f"https://commons.wikimedia.org/wiki/{slug}", "extmetadata": m}]}


class World:
    """The sources' answers, by host: Wikipedia titles → QIDs, Wikidata kinds and P18s, Commons files and searches."""

    def __init__(self):
        self.titles = {"Assassination of Julius Caesar": CAESAR_QID, "Punic Wars": "Q6392", "Big Bang": "Q323"}
        self.kinds = {CAESAR_QID: "Q1190554", "Q6392": "Q198", "Q323": "Q11862829"}   # an event, a war, a concept
        self.p18 = {CAESAR_QID: PD_FILE}
        self.files = {PD_FILE: commons_page(PD_FILE)}
        self.search = {}
        self.calls = Counter()

    def __call__(self, request: httpx.Request) -> httpx.Response:
        host = request.url.host
        q = {k: v[0] for k, v in parse_qs(urlsplit(str(request.url)).query).items()}
        self.calls[host] += 1
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        if host == "en.wikipedia.org":
            titles = q.get("titles", "").split("|")
            return httpx.Response(200, json={"query": {"pages": [
                {"title": t, "pageprops": {"wikibase_item": self.titles[t]}} if t in self.titles else {"title": t, "missing": True} for t in titles]}})
        if host == "query.wikidata.org":
            text = q.get("query", "")
            qids = [w[3:] for w in text.split() if w.startswith("wd:Q")]
            if "wdt:P18" in text and "VALUES ?p" not in text:
                rows = [{"item": {"value": f"http://www.wikidata.org/entity/{x}"},
                         "img": {"value": "http://commons.wikimedia.org/wiki/Special:FilePath/" + self.p18[x].split(":", 1)[1].replace(" ", "%20")}}
                        for x in qids if x in self.p18]
            elif "VALUES ?p" in text:
                rows = [{"item": {"value": f"http://www.wikidata.org/entity/{x}"}, "p": {"value": "http://www.wikidata.org/prop/direct/P31"},
                         "v": {"type": "uri", "value": f"http://www.wikidata.org/entity/{self.kinds[x]}"}} for x in qids if x in self.kinds]
            elif "rdfs:label" in text:
                rows = [{"item": {"value": f"http://www.wikidata.org/entity/{x}"}, "label": {"value": x}} for x in qids]
            else:
                rows = []
            return httpx.Response(200, json={"results": {"bindings": rows}})
        if host == "commons.wikimedia.org":
            if q.get("list") == "search":
                return httpx.Response(200, json={"query": {"search": [{"title": t} for t in self.search.get(q.get("srsearch"), [])]}})
            return httpx.Response(200, json={"query": {"pages": [self.files.get(t, {"title": t, "missing": True}) for t in q.get("titles", "").split("|")]}})
        return httpx.Response(404, json={})


class Ctx:
    job = "image_search"

    def __init__(self, fetcher, **opts):
        self.fetcher, self.options, self.counts, self.errors, self.lines = fetcher, opts, Counter(), [], []

    actor = "job:image_search"

    def opt(self, key, default=None):
        return self.options.get(key, default)

    def error(self, msg):
        self.errors.append(msg)

    def log(self, msg):
        self.lines.append(msg)

    def check_stop(self):
        pass


class Base(FreshStorage, TestCase):
    def setUp(self):
        super().setUp()
        import_content(small())
        self.world = World()

    def run_job(self, **opts):
        opts.setdefault("sources", "commons")
        ctx = Ctx(Fetcher(transport=httpx.MockTransport(self.world), sleep=lambda s: None), **opts)
        I.run(ctx)
        return ctx

    def search_of(self, slug):
        return ImageSearch.objects.filter(entry__slug=slug).first()


# ── pacing ──────────────────────────────────────────────────────────────────────────────────────────────────────────

class Pacing(Base):
    def test_an_attempt_that_finds_nothing_waits_its_cooldown_then_stops_at_the_limit(self):
        self.world.p18 = {}
        t0 = timezone.now()
        self.run_job()
        s = self.search_of("an-punic-wars")
        self.assertEqual((s.attempts, s.outcome), (1, "none"))
        self.assertAlmostEqual((s.next_attempt_at - t0).total_seconds(), I.COOLDOWN_DAYS[0] * 86400, delta=120)
        self.assertEqual(len(s.history), 1)
        # Within the cooldown it is not searched again, however often the job runs.
        calls = sum(self.world.calls.values())
        self.run_job()
        self.assertEqual(self.search_of("an-punic-wars").attempts, 1)
        self.assertNotIn("an-punic-wars", {e.slug for e in I.due(timezone.now(), limit=100)})
        self.assertLessEqual(sum(self.world.calls.values()) - calls, 2)  # the policy probe at most, no searches
        # After it: the second attempt, then a longer cooldown.
        ImageSearch.objects.update(next_attempt_at=timezone.now() - timedelta(minutes=1))
        self.run_job()
        s = self.search_of("an-punic-wars")
        self.assertEqual(s.attempts, 2)
        self.assertAlmostEqual((s.next_attempt_at - timezone.now()).total_seconds(), I.COOLDOWN_DAYS[1] * 86400, delta=120)
        # The last attempt: no next one, and never due again.
        ImageSearch.objects.update(next_attempt_at=timezone.now() - timedelta(minutes=1))
        self.run_job()
        s = self.search_of("an-punic-wars")
        self.assertEqual((s.attempts, s.next_attempt_at), (I.MAX_ATTEMPTS, None))
        ImageSearch.objects.update(next_attempt_at=timezone.now() - timedelta(minutes=1))
        self.assertNotIn("an-punic-wars", {e.slug for e in I.due(timezone.now(), limit=100)})
        self.run_job()
        self.assertEqual(self.search_of("an-punic-wars").attempts, I.MAX_ATTEMPTS)

    def test_next_attempt_schedule(self):
        now = timezone.now()
        self.assertEqual(I.next_attempt(1, now), now + timedelta(days=14))
        self.assertEqual(I.next_attempt(2, now), now + timedelta(days=42))
        self.assertIsNone(I.next_attempt(3, now))

    def test_events_with_a_picture_or_a_waiting_candidate_are_not_searched(self):
        due = {e.slug for e in I.due(timezone.now(), limit=100)}
        self.assertNotIn("un-charter", due)  # it has a picture
        self.assertIn("an-caesar-assassinated", due)
        self.world.files[PD_FILE] = commons_page(PD_FILE, license="cc-by-sa-4.0", short="CC BY-SA 4.0")
        self.run_job()
        self.assertTrue(ImageCandidate.objects.filter(entry__slug="an-caesar-assassinated", status="review").exists())
        self.assertNotIn("an-caesar-assassinated", {e.slug for e in I.due(timezone.now(), limit=100)})

    def test_per_run_caps_the_events(self):
        self.world.p18 = {}
        ctx = self.run_job(per_run=1)
        self.assertEqual(ctx.counts["events"], 1)
        self.assertEqual(ImageSearch.objects.count(), 1)

    def test_a_dry_run_writes_nothing(self):
        ctx = self.run_job(dry_run=True)
        self.assertEqual((ImageSearch.objects.count(), ImageCandidate.objects.count(), Image.objects.count()), (0, 0, 2))
        self.assertEqual(ctx.counts["attached"], 1)
        self.assertTrue(any(line.startswith("an-caesar-assassinated: attached") for line in ctx.lines))


# ── licenses and AI ─────────────────────────────────────────────────────────────────────────────────────────────────

class Licenses(TestCase):
    def lic(self, **kw):
        return I.commons_license(meta(**kw))

    def test_open_licenses_pass_normalized(self):
        self.assertEqual(self.lic(License="pd", LicenseShortName="Public domain"), ("Public domain", "", ""))
        self.assertEqual(self.lic(License="cc0", LicenseShortName="CC0"), ("CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", ""))
        self.assertEqual(self.lic(License="cc-by-sa-4.0", LicenseShortName="CC BY-SA 4.0", LicenseUrl="https://creativecommons.org/licenses/by-sa/4.0"),
                         ("CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", ""))
        self.assertEqual(self.lic(License="cc-by-2.0", LicenseShortName="CC BY 2.0")[:2], ("CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/"))
        self.assertEqual(self.lic(License="cc-by-sa-3.0-de", LicenseShortName="CC BY-SA 3.0 de")[0], "CC BY-SA 3.0 DE")

    def test_other_licenses_are_refused(self):
        for kw in ({"License": "gfdl", "LicenseShortName": "GFDL"}, {"License": "cc-by-nc-2.0", "LicenseShortName": "CC BY-NC 2.0"},
                   {"License": "cc-by-nd-4.0", "LicenseShortName": "CC BY-ND 4.0"}, {"License": "", "LicenseShortName": ""},
                   {"License": "pd", "LicenseShortName": "Public domain", "NonFree": "true"}):
            name, url, refused = self.lic(**kw)
            self.assertEqual(name, "", kw)
            self.assertTrue(refused, kw)

    def test_an_attribution_license_without_an_author_is_refused(self):
        f = I._commons_found(commons_page(BYSA_FILE, license="cc-by-4.0", short="CC BY 4.0", artist=""), "p18")
        self.assertIn("no author", f.refused)
        ok = I._commons_found(commons_page(BYSA_FILE, license="cc-by-4.0", short="CC BY 4.0"), "p18")
        self.assertEqual(ok.refused, "")
        self.assertEqual(ok.credit, "Vincenzo Camuccini, via Wikimedia Commons")
        self.assertNotIn("utm_", ok.thumb_url)

    def test_ai_generated_files_are_refused(self):
        def f(**kw):
            return I._commons_found(commons_page(PD_FILE, **kw), "p18")

        self.assertIn("AI-generated", I.ai_refusal(f(categories="AI-generated images by subject|Julius Caesar"), -44))
        self.assertIn("AI-generated", I.ai_refusal(f(categories="PD-algorithm"), -44))
        self.assertIn("colorized", I.ai_refusal(f(categories="Colorized photographs"), 1900))
        self.assertIn("AI generation", I.ai_refusal(f(description="Made with Midjourney from a prompt"), -44))
        self.assertIn("modern rendering", I.ai_refusal(f(date="2023-05-01"), -44))
        self.assertEqual(I.ai_refusal(f(date="2023-05-01"), 2023), "")  # a photograph of a current event
        self.assertEqual(I.ai_refusal(f(), -44), "")


class Filtering(Base):
    def test_refused_files_are_counted_never_kept(self):
        self.world.files[PD_FILE] = commons_page(PD_FILE, categories="AI-generated images of ancient Rome")
        ctx = self.run_job()
        self.assertEqual(ctx.counts["refused.ai"], 1)
        self.assertFalse(ImageCandidate.objects.filter(entry__slug="an-caesar-assassinated").exists())
        self.assertEqual(self.search_of("an-caesar-assassinated").outcome, "none")
        self.world.files[PD_FILE] = commons_page(PD_FILE, license="cc-by-nc-4.0", short="CC BY-NC 4.0")
        ImageSearch.objects.all().delete()
        ctx = self.run_job()
        self.assertEqual(ctx.counts["refused.license"], 1)
        self.assertFalse(Image.objects.filter(entry__slug="an-caesar-assassinated").exists())


# ── routing ─────────────────────────────────────────────────────────────────────────────────────────────────────────

class Routing(Base):
    def test_the_event_entitys_own_public_domain_p18_is_attached(self):
        ctx = self.run_job()
        im = Image.objects.get(entry__slug="an-caesar-assassinated")
        self.assertEqual(ctx.counts["attached"], 1)
        self.assertTrue(im.src.startswith("https://thumb.wikimedia.org/") and "utm_" not in im.src)
        self.assertEqual((im.width, im.height, im.license, im.sensitive), (500, 283, "Public domain", False))
        self.assertEqual(im.page, "https://commons.wikimedia.org/wiki/Vincenzo_Camuccini_-_La_morte_di_Cesare.jpg")
        self.assertTrue(Revision.objects.filter(table_name="timeline_image", actor="job:image_search").exists())
        c = ImageCandidate.objects.get(entry__slug="an-caesar-assassinated")
        self.assertEqual((c.status, c.image_id, c.match["via"], c.match["qid"]), ("attached", im.pk, "p18_primary", CAESAR_QID))
        self.assertIn("thumbnail", c.thumbnail_note)
        self.assertEqual(self.search_of("an-caesar-assassinated").outcome, "attached")
        self.assertEqual(RV.count(), 0)

    def test_an_attribution_license_goes_to_review(self):
        self.world.files[PD_FILE] = commons_page(PD_FILE, license="cc-by-sa-4.0", short="CC BY-SA 4.0")
        self.run_job()
        self.assertFalse(Image.objects.filter(entry__slug="an-caesar-assassinated").exists())
        c = ImageCandidate.objects.get(entry__slug="an-caesar-assassinated")
        self.assertEqual((c.status, c.license, c.license_url), ("review", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"))
        # Pictures have their own tab and count; the To review count and the badge are the reads only.
        self.assertEqual((RV.count(), RV.image_count()), (0, 1))
        self.assertEqual([i.key for i in RV.image_items()], [f"image-{c.pk}"])
        self.assertEqual(RV.items(timezone.now()), [])

    def test_a_p18_of_an_entity_that_is_not_an_event_goes_to_review(self):
        self.world.kinds[CAESAR_QID] = "Q5"  # a person: their portrait, not the event
        self.run_job()
        self.assertEqual(ImageCandidate.objects.get(entry__slug="an-caesar-assassinated").status, "review")

    def test_a_sensitive_picture_is_flagged_and_never_attached_alone(self):
        self.world.files[PD_FILE] = commons_page(PD_FILE, categories="Corpses in art|Paintings of the assassination of Julius Caesar")
        self.run_job()
        c = ImageCandidate.objects.get(entry__slug="an-caesar-assassinated")
        self.assertEqual((c.status, c.sensitive), ("review", True))
        self.assertIn("category: Corpses in art", c.sensitive_signals)
        self.assertFalse(Image.objects.filter(entry__slug="an-caesar-assassinated").exists())

    def test_a_weak_match_is_not_kept(self):
        self.world.p18 = {}
        self.world.search = {"julius caesar assassinated filetype:bitmap": [BYSA_FILE]}
        self.world.files[BYSA_FILE] = commons_page(BYSA_FILE, name="A cat", description="A cat on a sofa", categories="Cats", date="1950")
        self.run_job()
        self.assertFalse(ImageCandidate.objects.filter(entry__slug="an-caesar-assassinated").exists())
        self.assertEqual(self.search_of("an-caesar-assassinated").outcome, "none")

    def test_a_refused_source_is_skipped_for_the_run(self):
        from evidence.models import Publisher

        with revising("human:test", reason="test: Commons off"):
            Publisher.objects.update_or_create(domain="commons.wikimedia.org", defaults={"name": "Wikimedia Commons", "fetch_policy": "browser_only"})
        ctx = self.run_job()
        self.assertEqual(ctx.counts["refused_source.commons"], 1)
        self.assertEqual(self.world.calls["commons.wikimedia.org"], 0)
        self.assertFalse(Image.objects.filter(entry__slug="an-caesar-assassinated").exists())


class Sensitivity(TestCase):
    def ev(self, title="Battle", text="", branch="x x"):
        return I.EventInfo(pk=1, slug="x", title=title, text=text, year=1900, branch=branch)

    def found(self, **kw):
        return I.Found(source="commons", source_id="File:x.jpg", file_page="https://x", thumb_url="https://x", title=kw.pop("title", "A view"), via="p18", **kw)

    def test_signals(self):
        self.assertEqual(I.sensitivity(self.found(), self.ev()), [])
        self.assertTrue(I.sensitivity(self.found(categories=["Executions in the 1900s"]), self.ev()))
        self.assertTrue(I.sensitivity(self.found(categories=["Holocaust"]), self.ev()))
        # The event's own words count only with the picture or the branch agreeing.
        self.assertEqual(I.sensitivity(self.found(), self.ev(title="Massacre at the river")), [])
        self.assertTrue(I.sensitivity(self.found(), self.ev(title="Massacre at the river", branch="world-war-ii World War II")))
        self.assertTrue(I.sensitivity(self.found(text="Bodies of the wounded"), self.ev(title="Massacre at the river")))


# ── the owner's Review page ─────────────────────────────────────────────────────────────────────────────────────────

@override_settings(PUBLIC_SITE_URL="https://manyages.example")
class ReviewImages(Base):
    def setUp(self):
        super().setUp()
        self.op = User.objects.create_user("op", password="x", is_staff=True)
        self.op.user_permissions.add(Permission.objects.get(codename="ops_operator", content_type__app_label="opsconsole"))
        self.client.force_login(self.op)

    def decide(self, decision, item="", **data):
        return self.client.post(reverse("opsconsole:review_decide"), {"decision": decision, "item": item, "key": uuid.uuid4().hex, **data},
                                HTTP_ACCEPT="application/json")

    def candidates(self, *pages):
        self.world.p18 = {}
        self.world.search = {"julius caesar assassinated filetype:bitmap": [p["title"] for p in pages]}
        for p in pages:
            self.world.files[p["title"]] = p
        self.run_job()
        return list(ImageCandidate.objects.filter(entry__slug="an-caesar-assassinated").order_by("-score", "id"))

    def test_the_page_shows_an_image_item_and_approve_attaches_it_blurred(self):
        self.world.files[PD_FILE] = commons_page(PD_FILE, license="cc-by-sa-4.0", short="CC BY-SA 4.0")
        self.run_job()
        c = ImageCandidate.objects.get(entry__slug="an-caesar-assassinated")
        page = self.client.get(reverse("opsconsole:review") + f"?tab=images&item=image-{c.pk}")
        self.assertContains(page, "CC BY-SA 4.0")
        self.assertContains(page, 'name="sensitive"')
        self.assertContains(page, c.file_page)
        r = self.decide("approve", f"image-{c.pk}", sensitive="1")
        self.assertTrue(r.json()["ok"], r.json())
        im = Image.objects.get(entry__slug="an-caesar-assassinated")
        self.assertEqual((im.sensitive, im.license, im.license_url), (True, "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"))
        self.assertTrue(Revision.objects.filter(table_name="timeline_image", actor="human:op").exists())
        self.assertEqual(OpsAction.objects.get(pk=r.json()["action"]).kind, "review_approve")
        self.assertEqual((RV.count(), RV.image_count()), (0, 0))

    def test_deny_promotes_the_runner_up_then_waits_for_the_cooldown(self):
        a = commons_page("File:Death of Caesar A.jpg", name="Assassinated Julius Caesar in the Senate", license="cc-by-4.0", short="CC BY 4.0")
        b = commons_page("File:Death of Caesar B.jpg", name="Caesar assassinated", license="cc-by-4.0", short="CC BY 4.0")
        first, second = self.candidates(a, b)
        self.assertEqual((first.status, second.status), ("review", "alternate"))
        self.assertTrue(self.decide("deny", f"image-{first.pk}").json()["ok"])
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual((first.status, second.status), ("denied", "review"))
        self.assertTrue(self.decide("deny", f"image-{second.pk}").json()["ok"])
        s = self.search_of("an-caesar-assassinated")
        self.assertEqual(s.outcome, "none")
        self.assertIsNotNone(s.next_attempt_at)
        # A denied picture is never proposed again for the entry.
        ImageSearch.objects.update(next_attempt_at=timezone.now() - timedelta(minutes=1))
        self.run_job()
        self.assertEqual(set(ImageCandidate.objects.filter(entry__slug="an-caesar-assassinated").values_list("status", flat=True)), {"denied"})

    def test_defer_and_restore(self):
        self.world.files[PD_FILE] = commons_page(PD_FILE, license="cc-by-sa-4.0", short="CC BY-SA 4.0")
        self.run_job()
        c = ImageCandidate.objects.get()
        self.assertTrue(self.decide("defer", f"image-{c.pk}", note="later").json()["ok"])
        # One backlog for every kind: the deferred picture leaves the Images tab and its count, and lists in Backlog.
        self.assertEqual((RV.image_count(), RV.count(backlog=True)), (0, 1))
        self.assertEqual([i.key for i in RV.items(timezone.now(), backlog=True)], [f"image-{c.pk}"])
        self.assertContains(self.client.get(reverse("opsconsole:review") + "?tab=backlog"), f"image-{c.pk}")
        self.assertTrue(self.decide("restore", f"image-{c.pk}").json()["ok"])
        self.assertEqual((RV.count(), RV.image_count(), RV.count(backlog=True)), (0, 1, 0))

    def test_the_flag_form_sets_and_clears_a_pictures_flag(self):
        im = Image.objects.get(entry__slug="un-charter")
        r = self.decide("flag", entry="un-charter", sensitive="1")
        self.assertTrue(r.json()["ok"], r.json())
        im.refresh_from_db()
        self.assertTrue(im.sensitive)
        self.assertEqual(OpsAction.objects.get(pk=r.json()["action"]).kind, "review_flag")
        self.assertFalse(self.decide("flag", entry="un-charter", sensitive="1").json()["ok"])  # already blurred
        self.assertTrue(self.decide("flag", entry="un-charter", sensitive="0").json()["ok"])
        im.refresh_from_db()
        self.assertFalse(im.sensitive)
        self.assertFalse(self.decide("flag", entry="an-punic-wars", sensitive="1").json()["ok"])  # no picture
        self.assertContains(self.client.get(reverse("opsconsole:review") + "?tab=images"), "Blur it")
        self.assertNotContains(self.client.get(reverse("opsconsole:review")), "Blur it")

    def test_the_job_flags_an_attached_picture_and_the_owner_clears_it(self):
        im = Image.objects.get(entry__slug="un-charter")
        self.world.files["File:UN Charter.jpg"] = commons_page("File:UN Charter.jpg", categories="Executions in the United States")
        self.world.p18 = {}
        self.run_job()
        im.refresh_from_db()
        self.assertTrue(im.sensitive)
        flag = ImageCandidate.objects.get(kind="flag")
        self.assertEqual((flag.status, flag.image_id), ("review", im.pk))
        page = self.client.get(reverse("opsconsole:review") + f"?tab=images&item=image-{flag.pk}")
        self.assertContains(page, "https://manyages.example/images/un-charter.jpg")
        self.assertTrue(self.decide("deny", f"image-{flag.pk}").json()["ok"])
        im.refresh_from_db()
        flag.refresh_from_db()
        self.assertEqual((im.sensitive, flag.status), (False, "denied"))
        # The owner's decision stands: the job doesn't flag it again.
        from ingest.models import JobState

        JobState.objects.filter(name=I.FLAG_STATE).delete()
        self.run_job()
        im.refresh_from_db()
        self.assertFalse(im.sensitive)


# ── the snapshot ────────────────────────────────────────────────────────────────────────────────────────────────────

class Snapshot(FreshStorage, TestCase):
    PICTURE = {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/X.jpg/500px-X.jpg", "w": 500, "h": 283, "title": "The death of Caesar",
               "alt": "Senators around Caesar", "credit": "Vincenzo Camuccini, via Wikimedia Commons", "license": "CC BY-SA 4.0",
               "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "page": "https://commons.wikimedia.org/wiki/File:X.jpg", "sensitive": True}

    def test_new_fields_export_in_order_only_when_set_and_round_trip(self):
        data = small()
        ev = next(e for e in data["events"] if e["id"] == "an-punic-wars")
        ev["images"] = [dict(self.PICTURE)]
        import_content(data)
        out = build_content()
        got = next(e for e in out["events"] if e["id"] == "an-punic-wars")["images"][0]
        self.assertEqual(list(got), ["src", "w", "h", "title", "alt", "credit", "license", "licenseUrl", "page", "sensitive"])
        self.assertEqual(got, self.PICTURE)
        # The older pictures carry none of the new keys: their bytes are unchanged.
        legacy = next(e for e in out["events"] if e["id"] == "un-charter")["images"][0]
        self.assertEqual(list(legacy), ["src", "w", "h", "title", "credit", "license", "page"])
        # Round trip: the snapshot loaded into the database exports to the same bytes.
        first = dumps(out)
        import_content(without_derived(json.loads(first)))
        self.assertEqual(dumps(build_content()), first)

    def test_an_unflagged_picture_has_no_sensitive_key(self):
        import_content(small())
        with revising("human:test", reason="test"):
            im = Image.objects.get(entry__slug="un-charter")
            services.apply_changes(im, {"alt": "Delegates signing", "sensitive": False})
        got = next(e for e in build_content()["events"] if e["id"] == "un-charter")["images"][0]
        self.assertEqual(got["alt"], "Delegates signing")
        self.assertNotIn("sensitive", got)
        self.assertNotIn("licenseUrl", got)


class Constraints(FreshStorage, TestCase):
    def test_the_database_refuses_an_incomplete_attribution_or_a_closed_license(self):
        import_content(small())
        entry = Entry.objects.get(slug="an-punic-wars")
        ok = dict(src="https://thumb.wikimedia.org/x.jpg", title="t", credit="An author", license="CC BY 4.0",
                  license_url="https://creativecommons.org/licenses/by/4.0/", page="https://commons.wikimedia.org/wiki/File:X.jpg")
        for bad in ({"license_url": ""}, {"credit": ""}, {"license": "CC BY-NC 4.0"}, {"license": "All rights reserved"},
                    {"src": "http://insecure.example/x.jpg"}):
            with self.subTest(bad=bad), self.assertRaises(IntegrityError), transaction.atomic():
                with revising("human:test", reason="test"):
                    services.apply_changes(Image(entry=entry, position=5), {**ok, **bad})
        with revising("human:test", reason="test"):
            services.apply_changes(Image(entry=entry, position=5), ok)
            services.apply_changes(Image(entry=entry, position=6), {**ok, "license": "No known restrictions (Library of Congress)",
                                                                    "credit": "Library of Congress", "license_url": ""})
        self.assertEqual(Image.objects.filter(entry=entry).count(), 2)


class Ratings(FreshStorage, TestCase):
    def test_the_image_sources_batch_applies_both_once(self):
        """Ratings batch 4 (ADR 0048): the Commons API and NASA's image API, confident and applied as allowed, once."""
        from evidence.models import Publisher
        from ingest import ratings
        from ingest.models import JobState

        self.assertEqual(ratings.BATCHES[-1], ratings.BATCH_4)
        by = {d.name: d for d in ratings.decisions(ratings.BATCH_4)}
        self.assertEqual(len(by), 2)
        self.assertTrue(all(d.apply_policy and d.confident for d in by.values()))
        import_content(small())
        ratings.apply_all()
        for dom in ("commons.wikimedia.org", "images-api.nasa.gov"):
            p = Publisher.objects.get(domain=dom)
            self.assertEqual(p.fetch_policy, "allowed")
            self.assertIn("Rated 2026-11-28d (source discovery, ADR 0048)", p.access_notes)
        self.assertTrue(JobState.objects.get(name="ratings_2026_11_28d").state["applied"])
        self.assertEqual(ratings.apply_all(), Counter(), "each batch once per database")


@override_settings(PUBLIC_SITE_URL="https://manyages.example")
class ImagesTab(Base):
    """The Review page's Images tab (ADR 0048): its own list and count; the To review tab, its count, the sidebar badge
    and the agents' round summary cover the reads only; a decision there returns to the Images tab."""

    def setUp(self):
        super().setUp()
        self.op = User.objects.create_user("op", password="x", is_staff=True)
        self.op.user_permissions.add(Permission.objects.get(codename="ops_operator", content_type__app_label="opsconsole"))
        self.client.force_login(self.op)

    def test_the_images_tab_keeps_pictures_out_of_the_reads(self):
        from agentapi.operations import owner_review_count

        self.world.files[PD_FILE] = commons_page(PD_FILE, license="cc-by-sa-4.0", short="CC BY-SA 4.0")
        self.run_job()
        c = ImageCandidate.objects.get()
        main = self.client.get(reverse("opsconsole:review"))
        self.assertNotContains(main, f"image-{c.pk}")
        self.assertContains(main, "Images<span class=\"n\">1</span>", html=False)
        self.assertNotContains(main, 'aria-label="1 waiting"')  # the sidebar badge counts reads only
        self.assertEqual(owner_review_count(), 0)
        tab = self.client.get(reverse("opsconsole:review") + "?tab=images")
        self.assertContains(tab, f"image-{c.pk}")
        self.assertContains(tab, '<input type="hidden" name="tab" value="images">', html=False)
        # A decision made without the script comes back to the Images tab.
        r = self.client.post(reverse("opsconsole:review_decide"), {"decision": "defer", "item": f"image-{c.pk}", "key": uuid.uuid4().hex, "tab": "images"})
        self.assertEqual(r.status_code, 303)
        self.assertIn("tab=images", r["Location"])
