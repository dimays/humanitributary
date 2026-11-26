"""Branch governance: metrics, each rule on a deterministic fixture, proposals with hysteresis, apply and revert."""

import json
from datetime import date, datetime, timezone

from django.test import SimpleTestCase, TestCase, override_settings

from governance import operations, review
from governance.metrics import clusters, compute, s_of
from governance.models import BranchMetric, BranchProposal
from governance.rules import fmt_year
from ingest.models import BranchEntity, Candidate, Document, Entity
from publish.content import dumps
from publish.export import build_content
from publish.legacy import import_content
from revisions import revising
from timeline.models import Branch, Event, Status
from work.models import AgentTask

TODAY = date(2026, 11, 26)
SMALL_RULES = {
    "split_place": {"min_events": 12, "min_cluster_events": 4},
    "split_time": {"min_events": 12, "min_phase_events": 4, "min_gap_s": 0.3},
    "end_stale": {"min_events": 4},
    "thin": {"max_relative_density": 0.2},
    "min_peers": 2,
}


def cite(slug):
    return {"t": f"{slug} — Wikipedia", "u": f"https://en.wikipedia.org/wiki/{slug}"}


def branch(id, name, region, start, end, **kw):
    b = {"id": id, "name": name, "region": region, "start": start, "end": end, "startWhen": str(start), "parents": [], "into": [],
         "text": f"{name}.", "cites": [cite(id)]}
    if end is not None:
        b["endWhen"] = str(end)
    b.update(kw)
    return b


def event(id, br, y, lat=None, lon=None, title=None, cites=None, **kw):
    e = {"id": id, "branch": br, "y": y, "when": str(y), "title": title or id.replace("-", " ").title(), "text": "Something happened.", "imp": 2,
         "cites": cites or [cite(id)]}
    if lat is not None:
        e["geo"] = {"scope": "place", "lat": lat, "lon": lon, "r": 50, "label": f"{lat},{lon}", "src": "https://en.wikipedia.org/wiki/Place"}
    e.update(kw)
    return e


def content():
    B, E = [], []
    # A people spread over three far-apart regions (SPLIT-PLACE).
    B.append(branch("people", "Peoples of the Americas", "americas", -10000, None,
                    geo={"scope": "region", "lat": 19, "lon": -96, "r": 6000, "label": "The Americas", "src": "https://en.wikipedia.org/wiki/Americas"}))
    for i, (lat, lon) in enumerate([(40, -90)] * 6 + [(18, -97)] * 5 + [(-12, -75)] * 5):
        E.append(event(f"pe-{i}", "people", -3000 + i * 330, lat + (i % 3) * 0.5, lon + (i % 2) * 0.5))
    # Two small communities that are one story, and a renamed continuation (MERGE-OVERLAP + succession).
    shared = {"t": "History of the Union", "u": "https://european-union.europa.eu/history_en"}
    B.append(branch("coal", "Coal Community", "europe", 1952, 2002, into=["market"]))
    B.append(branch("market", "Common Market", "europe", 1958, 1993, parents=["coal"], into=["union"]))
    B.append(branch("union", "The Union", "europe", 1993, None, parents=["market"]))
    for i in range(5):
        E.append(event(f"co-{i}", "coal", 1953 + i * 9, 50.8, 4.3, cites=[shared, cite(f"co-{i}")]))
    for i in range(5):
        E.append(event(f"ma-{i}", "market", 1960 + i * 6, 50.8, 4.4, cites=[shared, cite(f"ma-{i}")]))
    E.append(event("co-joins", "coal", 1973.1, 50.8, 4.3, title="Denmark, Ireland and the UK join the Communities"))
    E.append(event("ma-joins", "market", 1973, 50.8, 4.3, title="Denmark, Ireland and the UK join"))
    for i in range(4):
        E.append(event(f"un-{i}", "union", 1995 + i * 7, 50.9, 4.4))
    # A branch whose events stop long before its (open) end (END-STALE).
    B.append(branch("quiet", "Quiet Kingdom", "africa", 500, None))
    for i in range(5):
        E.append(event(f"qu-{i}", "quiet", 600 + i * 50, 9.0, 38.7))
    # A branch with two phases far apart in time (SPLIT-TIME).
    B.append(branch("twice", "Twice-Told City", "mideast", -3000, None))
    for i in range(6):
        E.append(event(f"tw-a{i}", "twice", -2900 + i * 100, 33.3, 44.4))
    for i in range(6):
        E.append(event(f"tw-b{i}", "twice", 1950 + i * 10, 33.3, 44.4))
    # Peers for density, and a thin one (THIN).
    words = ["harvest", "council", "treaty", "temple", "market", "festival", "river", "mine", "palace", "road"]
    for k, (lat, lon) in enumerate([(10, 20), (-5, 30), (-25, 25)]):
        B.append(branch(f"peer-{k}", f"Peer {k}", "africa", 500, None))
        for i in range(30):
            E.append(event(f"pr-{k}-{i}", f"peer-{k}", 520 + i * 49, lat, lon, title=f"{words[i % 10]} {chr(65 + k)}{i * 7919 % 1000}"))
    B.append(branch("sparse", "Sparse Realm", "africa", 500, None))
    E.append(event("sp-0", "sparse", 1500, 12, 20))
    E.append(event("sp-1", "sparse", 2020, 12, 20))
    return {"branches": B, "events": E}


class MetricTests(SimpleTestCase):
    def test_scale_and_clusters(self):
        self.assertAlmostEqual(s_of(2026, 2026), -1.602, places=3)
        pts = [("a", (40, -90)), ("b", (40.5, -90)), ("c", (-12, -75)), ("d", (-12, -75.5))]
        self.assertEqual(clusters(pts, 1000), [["a", "b"], ["c", "d"]])
        self.assertEqual(fmt_year(-12500, 2026), "c. 12,500 BCE")
        self.assertEqual(fmt_year(1952.6, 2026), "c. 1953")


@override_settings(BRANCH_RULES=SMALL_RULES)
class RuleTests(TestCase):
    def setUp(self):
        import_content(content())

    def findings(self):
        found, _ = review.findings(TODAY)
        return {(f.rule, f.branch): f for f in found}

    def test_metrics_snapshot_is_stored_once(self):
        M = compute(TODAY)
        self.assertEqual(M["twice"]["events"], 12)
        self.assertEqual(len(M["twice"]["phases"]), 2)
        self.assertGreater(M["quiet"]["gaps"]["trail"]["s"], 0.6)
        self.assertEqual(review.snapshot(TODAY)["created"], len(M))
        self.assertEqual(review.snapshot(TODAY)["created"], 0)
        self.assertEqual(BranchMetric.objects.filter(branch__slug="people").count(), 1)

    def test_split_place(self):
        f = self.findings()[("SPLIT-PLACE-v1", "people")]
        self.assertEqual(sorted(c["n"] for c in f.evidence["clusters"]), [5, 5, 6])
        creates = [o for o in f.operations if o["op"] == "create_branch"]
        self.assertEqual(len(creates), 3)
        self.assertEqual(sum(o["op"] == "move" for o in f.operations), 16)
        self.assertIn("people-mesoamerica", [o["id"] for o in creates])

    def test_merge_overlap_with_succession(self):
        f = self.findings()[("MERGE-OVERLAP-v1", "union")]
        self.assertEqual(f.others, ["coal", "market"])
        self.assertEqual([o for o in f.operations if o["op"] == "merge"], [{"op": "merge", "from": "coal", "into": "union"}, {"op": "merge", "from": "market", "into": "union"}])
        self.assertEqual(f.evidence["succession"][0]["to"], "union")

    def test_end_stale_split_time_and_thin(self):
        f = self.findings()
        self.assertIn(("END-STALE-v1", "quiet"), f)
        st = f[("SPLIT-TIME-v1", "twice")]
        self.assertEqual(st.evidence["cut"], 1950)
        self.assertEqual(sum(o["op"] == "move" for o in st.operations), 6)
        self.assertIn(("THIN-v1", "sparse"), f)
        self.assertNotIn(("THIN-v1", "peer-0"), f)

    def test_new_branch_from_signals(self):
        ent = Entity.objects.create(qid="Q999001", label="New Movement", kind="org")
        known = Entity.objects.create(qid="Q999002", label="Quiet Kingdom", kind="polity")
        BranchEntity.objects.create(branch=Branch.objects.get(slug="quiet"), entity=known)
        for i in range(6):
            doc = Document.objects.create(canonical_url=f"https://example.org/n{i}", url=f"https://example.org/n{i}", fetched_at=datetime(2026, 11, 1 + 3 * i, tzinfo=timezone.utc), content_hash=str(i) * 64)
            c = Candidate.objects.create(kind="new_branch_signal" if i == 0 else "new_event", title=f"story {i}", cluster_key=f"k{i}", y_guess=2026.8)
            c.entities.add(ent, known)
            c.documents.add(doc)
        f = self.findings()[("NEW-BRANCH-v1", None)]
        self.assertEqual((f.evidence["clusters"], f.evidence["days"], f.evidence["parent"]), (6, 16, "quiet"))
        self.assertEqual(f.operations[1], {"op": "map_entity", "qid": "Q999001", "branch": "new-movement", "role": "org"})


@override_settings(BRANCH_RULES=SMALL_RULES)
class ProposalTests(TestCase):
    def setUp(self):
        import_content(content())

    def test_review_creates_proposals_and_tasks_and_is_idempotent(self):
        out = review.review(TODAY)
        props = {p.rule_id for p in BranchProposal.objects.all()}
        self.assertEqual(props, {"SPLIT-PLACE-v1", "MERGE-OVERLAP-v1", "END-STALE-v1", "SPLIT-TIME-v1"})
        task = AgentTask.objects.get(kind="review_branch_proposal", target_proposal__rule_id="MERGE-OVERLAP-v1")
        self.assertEqual(task.payload["operations"][0]["op"], "merge")
        self.assertIn("union", task.payload["metrics"])
        self.assertTrue(task.payload["evidence"]["events"]["coal"])
        self.assertTrue(AgentTask.objects.filter(kind="audit", dedupe_key="thin:sparse").exists())
        n_p, n_t = BranchProposal.objects.count(), AgentTask.objects.count()
        again = review.review(TODAY)
        self.assertEqual((BranchProposal.objects.count(), AgentTask.objects.count()), (n_p, n_t), again["counts"])
        self.assertTrue(all(f["result"] in ("unchanged", "open") for f in again["findings"]), again["findings"])
        self.assertTrue(out["findings"])

    def _filled(self, p):
        ops = json.loads(json.dumps(p.payload["operations"]))
        for o in ops:
            if o["op"] == "create_branch":
                o["fields"].update(text="A people of one region.", start_when="c. 3000 BCE", cites=[cite(o["id"])])
                o["fields"]["name"] = o["fields"]["name"].replace("Peoples of the Americas: ", "Peoples of ")
            if o["op"] == "patch":
                o["fields"] = {k: ("1952" if "when" in k else v) for k, v in o["fields"].items()}
        return ops

    def test_apply_needs_the_agents_fields(self):
        review.review(TODAY)
        p = BranchProposal.objects.get(rule_id="SPLIT-PLACE-v1")
        with self.assertRaises(operations.OperationError):
            operations.apply(p, actor="agent:test")

    def test_apply_split_then_review_does_not_repropose_and_revert_restores(self):
        review.review(TODAY)
        before = dumps(build_content())
        p = BranchProposal.objects.get(rule_id="SPLIT-PLACE-v1")
        applied = operations.apply(p, self._filled(p), actor="agent:test")
        self.assertGreater(applied["revisions"], 0)
        self.assertEqual(Event.objects.get(slug="pe-0").branch.slug, "people-north-america")
        out = build_content()
        self.assertIn("people-andes-and-pacific-coast", [b["id"] for b in out["branches"]])
        andes = next(b for b in out["branches"] if b["id"] == "people-andes-and-pacific-coast")
        self.assertEqual((andes["parents"], andes["cites"][0]["u"]), (["people"], "https://en.wikipedia.org/wiki/people-andes-and-pacific-coast"))
        again = review.review(TODAY)
        self.assertNotIn("SPLIT-PLACE-v1", {f["rule"] for f in again["findings"] if f["result"] == "proposed"})
        # The regional children are not proposed for merging back.
        self.assertFalse([f for f in again["findings"] if f["rule"] == "MERGE-OVERLAP-v1" and "people" in (f["branch"] or "")])
        operations.revert(BranchProposal.objects.get(pk=p.pk), actor="agent:test")
        self.assertEqual(dumps(build_content()), before)
        self.assertFalse(Branch.objects.filter(slug="people-north-america").exists())
        self.assertEqual(BranchProposal.objects.get(pk=p.pk).status, "withdrawn")

    def test_apply_merge_and_legacy_file(self):
        review.review(TODAY)
        p = BranchProposal.objects.get(rule_id="MERGE-OVERLAP-v1")
        ops = self._filled(p)
        operations.apply(p, ops, actor="agent:test")
        self.assertEqual(Branch.objects.get(slug="coal").status, Status.RETRACTED)
        self.assertEqual(Event.objects.get(slug="co-0").branch.slug, "union")
        union = next(b for b in build_content()["branches"] if b["id"] == "union")
        self.assertEqual(union["start"], 1952)
        self.assertEqual([c["u"] for c in union["cites"]], [cite(s)["u"] for s in ("union", "coal", "market")])
        js = operations.legacy_js(p, ops)
        self.assertIn('TL.merge("coal", "union");', js)
        self.assertIn('TL.patch("union", {', js)

    def test_revert_refuses_when_rows_changed_since(self):
        review.review(TODAY)
        p = BranchProposal.objects.get(rule_id="END-STALE-v1")
        operations.apply(p, self._filled(p), actor="agent:test")
        with revising("agent:someone", reason="later edit"):
            Branch.objects.filter(slug="quiet").update(end_when="c. 800 (later wording)")
        with self.assertRaises(operations.OperationError):
            operations.revert(BranchProposal.objects.get(pk=p.pk), actor="agent:test")

    def test_rejected_proposals_are_held_back(self):
        review.review(TODAY)
        p = BranchProposal.objects.get(rule_id="END-STALE-v1")
        p.status, p.decided_at = "rejected", datetime(2026, 11, 26, tzinfo=timezone.utc)
        p.save()
        out = review.review(TODAY)
        self.assertIn("held_back", [f["result"] for f in out["findings"] if f["rule"] == "END-STALE-v1"])
        self.assertEqual(BranchProposal.objects.filter(rule_id="END-STALE-v1").count(), 1)

    def test_proposal_withdrawn_when_rule_stops_firing(self):
        from timeline import services

        review.review(TODAY)
        with revising("agent:writer", reason="test"):
            for i in range(3):
                services.save_event(f"qu-new-{i}", branch="quiet", y=1900 + i * 40, when=str(1900 + i * 40), title=f"Later {i}", text="t.", imp=2, status="published")
        review.review(TODAY)
        self.assertEqual(BranchProposal.objects.get(rule_id="END-STALE-v1").status, "withdrawn")
