"""Entry order is a fractional sort key: inserting, deleting or moving one entry writes one key at most."""

import random

from django.test import SimpleTestCase, TestCase

from publish.content import dumps
from publish.export import build_content
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline.models import Entry, Event
from timeline.ordering import between, reconcile, spread

from .fixtures import small


class KeyTests(SimpleTestCase):
    def test_between_is_strictly_between(self):
        rng = random.Random(7)
        keys = [between(None, None)]
        for _ in range(2000):
            i = rng.randrange(len(keys) + 1)
            lo = keys[i - 1] if i else None
            hi = keys[i] if i < len(keys) else None
            k = between(lo, hi)
            self.assertTrue((lo is None or lo < k) and (hi is None or k < hi), (lo, k, hi))
            keys.insert(i, k)
        self.assertEqual(keys, sorted(keys))
        self.assertEqual(len(set(keys)), len(keys))

    def test_spread_is_increasing_and_short(self):
        keys = spread(5400)
        self.assertEqual(keys, sorted(keys))
        self.assertEqual(len(set(keys)), 5400)
        self.assertLessEqual(max(map(len, keys)), 4)
        inner = spread(50, keys[10], keys[11])
        self.assertTrue(keys[10] < inner[0] and inner[-1] < keys[11] and inner == sorted(inner))

    def test_reconcile_keeps_whatever_is_already_in_order(self):
        ids = [f"e{i}" for i in range(100)]
        current = dict(zip(ids, spread(100)))
        self.assertEqual(reconcile(ids, current), {})
        # Delete one: nothing moves.
        self.assertEqual(reconcile(ids[:40] + ids[41:], current), {})
        # Insert one: only it gets a key, between its neighbours.
        new = reconcile(ids[:40] + ["new"] + ids[40:], current)
        self.assertEqual(list(new), ["new"])
        self.assertTrue(current["e39"] < new["new"] < current["e40"])
        # Move one: only it changes.
        moved = ids[:10] + ids[11:60] + ["e10"] + ids[60:]
        self.assertEqual(list(reconcile(moved, current)), ["e10"])

    def test_reconcile_avoids_keys_held_by_entries_outside_the_order(self):
        current = {"a": "A", "b": "C"}
        new = reconcile(["a", "x", "b"], current, others=["B"])
        self.assertTrue("A" < new["x"] < "B")


class ImportOrderTests(TestCase):
    def test_removing_an_event_rewrites_no_other_row(self):
        import_content(small())
        data = small()
        del data["events"][0]
        before = Revision.objects.count()
        import_content(data, retract_missing=True)
        revs = list(Revision.objects.order_by("id")[before:])
        self.assertEqual([(r.table_name, r.changed) for r in revs], [("timeline_entry", ["status", "updated_at"])])

    def test_inserting_an_event_writes_one_key_and_the_order_round_trips(self):
        import_content(small())
        keys = dict(Entry.objects.values_list("slug", "sort_key"))
        data = small()
        extra = dict(data["events"][1], id="an-extra", title="Another")
        data["events"].insert(2, extra)
        import_content(data)
        after = dict(Entry.objects.values_list("slug", "sort_key"))
        self.assertEqual({s: k for s, k in after.items() if s != "an-extra"}, keys)
        self.assertEqual(dumps(build_content()), dumps(data))

    def test_services_append_and_place(self):
        import_content(small())
        with revising("agent:test", reason="test"):
            ev, _ = services.save_event("zz-new", branch="un", y=2000, when="2000", title="New", text="t.", imp=3)
            self.assertEqual(Event.objects.order_by("sort_key").last().slug, "zz-new")
            services.place(ev, after="an-caesar-assassinated")
        order = list(Event.objects.order_by("sort_key").values_list("slug", flat=True))
        self.assertEqual(order[:2], ["an-caesar-assassinated", "zz-new"])
