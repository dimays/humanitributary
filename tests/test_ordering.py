"""Entry order is a fractional sort key: inserting, deleting or moving one entry writes one key at most, until a gap
is used up and its neighbourhood is respaced in the same order (ADR 0045)."""

import random
from unittest import mock

from fractions import Fraction

from django.core.exceptions import ValidationError
from django.test import SimpleTestCase, TestCase

from publish.content import dumps, without_derived
from publish.export import build_content
from publish.legacy import import_content
from revisions import revising
from revisions.models import Revision
from timeline import services
from timeline import ordering
from timeline.models import Entry, Event, Location
from timeline.ordering import between, reconcile, respace, spread

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


def _old_append(lo: str) -> str:
    """The key the old between(lo, None) gave: half the way from lo to the end, so a digit every six appends."""
    return ordering._shortest(ordering._value(lo), Fraction(1))


def _insert(keys: list[str], i: int) -> int:
    """Insert a key at index i of `keys` the way services._new_key does (respacing when needed); → how many moved."""
    k = between(keys[i - 1] if i else None, keys[i] if i < len(keys) else None)
    if len(k) <= ordering.MAX_LEN:
        keys.insert(i, k)
        return 0
    start, stop, fresh = respace(keys, i)
    new = fresh.pop(i - start)
    moved = sum(a != b for a, b in zip(keys[start:stop], fresh))
    keys[start:stop] = fresh
    keys.insert(i, new)
    return moved


class ShortKeyTests(SimpleTestCase):
    """The 500 of November 27, 2026: keys grew past the column's 64 characters (ADR 0045)."""

    def test_between_takes_the_fewest_digits(self):
        self.assertEqual(between("1", "3"), "2")
        self.assertEqual(len(between("1", "2")), 2)
        self.assertEqual(between("1V", "1X"), "1W")
        self.assertEqual(len(between("1V", "1W")), 3)

    def test_thousands_of_appends_stay_short(self):
        keys = spread(5400)
        last = keys[-1]
        for _ in range(5000):
            k = between(last, None)
            self.assertLess(last, k)
            last = k
        self.assertLessEqual(len(last), 6, "an append steps, it doesn't halve the way to the end")
        first = keys[0]
        for _ in range(500):
            k = between(None, first)
            self.assertLess(k, first)
            first = k
        self.assertLessEqual(len(first), 6)

    def test_the_old_appends_would_have_overflowed(self):
        last = spread(5400)[-1]
        for _ in range(400):
            last = _old_append(last)
        self.assertGreater(len(last), 64, "the bug this fixes: a digit every six appends")

    def test_many_inserts_at_one_point_are_respaced_in_order(self):
        keys = spread(500)
        ids = list(range(500))  # follow each entry through the respacing
        order = dict(zip(keys, ids))
        moved = 0
        for n in range(250):  # always just after entry 100, so the gap after it halves every time
            i = keys.index(next(k for k, v in order.items() if v == 100)) + 1
            before = list(keys)
            moved += _insert(keys, i)
            new = keys[i]
            # Rebuild the id map from the positions: nothing but the new key changed places.
            old_ids = [order[k] for k in before]
            order = dict(zip(keys, old_ids[:i] + [1000 + n] + old_ids[i:]))
            self.assertEqual(keys, sorted(keys))
            self.assertEqual(len(set(keys)), len(keys))
            self.assertLessEqual(max(map(len, keys)), ordering.MAX_LEN)
            self.assertIn(new, order)
        ranked = [order[k] for k in keys]
        self.assertEqual([x for x in ranked if x < 1000], list(range(500)), "the old entries keep their relative order")
        self.assertEqual([x for x in ranked if x >= 1000], list(range(1249, 999, -1)), "each insert went just after entry 100")
        self.assertGreater(moved, 0, "the gap was used up, so neighbours were respaced")
        self.assertLess(moved, 250, "a neighbourhood, not the whole list, each time")

    def test_a_crowded_end_heals_on_the_next_append(self):
        keys = spread(1000)
        for _ in range(380):  # what production had: the old appends, a digit every six
            keys.append(_old_append(keys[-1]))
        self.assertGreater(max(map(len, keys)), 64)
        _insert(keys, len(keys))
        self.assertEqual(keys, sorted(keys))
        self.assertEqual(len(set(keys)), len(keys))
        self.assertLessEqual(max(map(len, keys)), ordering.MAX_LEN)


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
        self.assertEqual(dumps(without_derived(build_content())), dumps(data))

    def test_services_append_and_place(self):
        import_content(small())
        with revising("agent:test", reason="test"):
            ev, _ = services.save_event("zz-new", branch="un", y=2000, when="2000", title="New", text="t.", imp=3)
            self.assertEqual(Event.objects.order_by("sort_key").last().slug, "zz-new")
            services.place(ev, after="an-caesar-assassinated")
        order = list(Event.objects.order_by("sort_key").values_list("slug", flat=True))
        self.assertEqual(order[:2], ["an-caesar-assassinated", "zz-new"])


class DenseInsertTests(TestCase):
    """200+ events written at one point, and into a crowded end, through the services (ADR 0045)."""

    def setUp(self):
        import_content(small())

    def order(self):
        return list(Event.objects.order_by("sort_key").values_list("slug", flat=True))

    def test_two_hundred_events_after_one_target(self):
        before = self.order()
        with revising("agent:test", reason="dense inserts"):
            for n in range(220):
                ev, _ = services.save_event(f"dense-{n:03d}", branch="un", y=2000, when="2000", title=f"Dense {n}", text="t.", imp=3)
                services.place(ev, after="an-caesar-assassinated")
        after = self.order()
        self.assertEqual([s for s in after if not s.startswith("dense-")], before, "the others keep their order")
        i = after.index("an-caesar-assassinated")
        self.assertEqual(after[i + 1:i + 221], [f"dense-{n:03d}" for n in range(219, -1, -1)])
        lengths = list(Entry.objects.values_list("sort_key", flat=True))
        self.assertLessEqual(max(map(len, lengths)), ordering.MAX_LEN)
        rekeyed = Revision.objects.filter(table_name="timeline_entry", changed=["sort_key", "updated_at"]).count()
        self.assertGreater(rekeyed, 220, "beyond each placed event's own key, respacing rewrote neighbours' keys, each with a Revision")

    def test_appends_into_a_crowded_end(self):
        # Production on November 27: the last events' keys, appended the old way, near the column's 64 characters.
        with revising("job:test", reason="crowd the end"), mock.patch.object(ordering, "MAX_LEN", 255):
            key = Entry.objects.filter(kind="event").order_by("-sort_key").first().sort_key
            for n in range(300):
                key = _old_append(key)
                services.save_event(f"crowd-{n:03d}", branch="un", y=2001, when="2001", title=f"Crowd {n}", text="t.", imp=3)
                services.apply_changes(Entry.objects.get(slug=f"crowd-{n:03d}"), {"sort_key": key})
        self.assertGreater(len(key), 40)
        before = self.order()
        with revising("agent:test", reason="dense appends"):
            for n in range(210):
                services.save_event(f"tail-{n:03d}", branch="un", y=2002, when="2002", title=f"Tail {n}", text="t.", imp=3)
        after = self.order()
        self.assertEqual(after[:len(before)], before)
        self.assertEqual(after[len(before):], [f"tail-{n:03d}" for n in range(210)])
        self.assertLessEqual(max(len(k) for k in Entry.objects.values_list("sort_key", flat=True)), ordering.MAX_LEN)

    def test_a_value_too_long_for_its_column_names_the_field(self):
        ev = Event.objects.first()
        with revising("agent:test", reason="too long"), self.assertRaises(ValidationError) as cm:
            services.apply_changes(Location(entry=ev.entry_ptr), {"scope": "place", "label": "x" * 301})
        self.assertIn("location.label", cm.exception.message_dict)
