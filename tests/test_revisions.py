"""Every canonical write goes through revising() and leaves a Revision; nothing else gets in (AGENTS.md rule 2)."""

from django.apps import apps
from django.contrib.auth.models import User
from django.db import DatabaseError, connection, transaction
from django.test import TestCase

from evidence.models import Publisher
from revisions import revising
from revisions.models import Revision
from revisions.sql import audited_tables
from timeline import services
from timeline.models import Event, Region
from work.queue import enqueue

from .fixtures import small


class RevisionEnforcementTests(TestCase):
    def test_every_canonical_table_is_audited(self):
        canonical = sorted(m._meta.db_table for app in ("timeline", "evidence") for m in apps.get_app_config(app).get_models())
        self.assertEqual(audited_tables(), canonical)

    def test_orm_write_outside_revising_is_refused(self):
        with self.assertRaisesMessage(DatabaseError, "outside revisions.revising()"), transaction.atomic():
            Region.objects.create(slug="nowhere", name="Nowhere")

    def test_bulk_update_and_raw_sql_outside_revising_are_refused(self):
        with revising("job:test"):
            Region.objects.create(slug="r1", name="R1")
        with self.assertRaises(DatabaseError), transaction.atomic():
            Region.objects.update(name="changed")
        with self.assertRaises(DatabaseError), transaction.atomic(), connection.cursor() as c:
            c.execute("DELETE FROM timeline_region")
        self.assertEqual(Region.objects.get(slug="r1").name, "R1")

    def test_a_write_inside_revising_records_who_why_and_what(self):
        task, _ = enqueue("audit", created_by="job:test")
        with revising("agent:claude-test", reason="add a region", task=task):
            r = Region.objects.create(slug="r2", name="R2")
            r.name = "Region two"
            r.save()
        revs = list(Revision.objects.filter(table_name="timeline_region", row_pk=str(r.pk)).order_by("id"))
        self.assertEqual([x.action for x in revs], ["insert", "update"])
        self.assertEqual(revs[1].changed, ["name"])
        self.assertEqual((revs[1].before["name"], revs[1].after["name"]), ("R2", "Region two"))
        self.assertEqual({(x.actor, x.actor_kind, x.reason, x.task_id) for x in revs}, {("agent:claude-test", "agent", "add a region", task.pk)})

    def test_bulk_update_inside_revising_records_every_row(self):
        with revising("job:test"):
            Region.objects.bulk_create([Region(slug=f"b{i}", name=f"B{i}") for i in range(3)])
            Region.objects.filter(slug__startswith="b").update(position=9)
        self.assertEqual(Revision.objects.filter(table_name="timeline_region", action="update").count(), 3)

    def test_an_unchanged_save_leaves_no_revision(self):
        with revising("job:test"):
            r = Region.objects.create(slug="r3", name="R3")
            n = Revision.objects.count()
            r.save()
            self.assertEqual(services.apply_changes(r, {"name": "R3"}), "unchanged")
        self.assertEqual(Revision.objects.count(), n)

    def test_services_refuse_outside_revising(self):
        with self.assertRaisesMessage(RuntimeError, "revising"):
            services.save_branch("x", name="X", region="europe", start=1, end=None, start_when="1", text="t")

    def test_the_actor_is_restored_after_a_nested_block_and_cleared_after(self):
        with revising("job:outer", reason="outer"):
            with revising("agent:inner", reason="inner"):
                Region.objects.create(slug="n1", name="N1")
            Region.objects.create(slug="n2", name="N2")
        actors = dict(Revision.objects.filter(table_name="timeline_region").values_list("after__slug", "actor"))
        self.assertEqual(actors, {"n1": "agent:inner", "n2": "job:outer"})
        with self.assertRaises(DatabaseError), transaction.atomic():
            Region.objects.create(slug="n3", name="N3")

    def test_actor_must_name_its_kind(self):
        with self.assertRaises(ValueError):
            with revising("claude"):
                pass

    def test_revisions_are_append_only(self):
        with revising("job:test"):
            Region.objects.create(slug="r4", name="R4")
        rev = Revision.objects.latest("id")
        with self.assertRaises(DatabaseError), transaction.atomic():
            Revision.objects.filter(pk=rev.pk).update(reason="rewritten")
        with self.assertRaises(DatabaseError), transaction.atomic():
            rev.delete()

    def test_services_save_event_derives_dates(self):
        from publish.legacy import import_content

        import_content(small())
        with revising("agent:writer", reason="test"):
            ev, result = services.save_event("un-geneva", branch="un", y=1946.3, when="April 18, 1946", title="League of Nations dissolved", text="t", imp=3)
        self.assertEqual(result, "created")
        ev = Event.objects.get(slug="un-geneva")
        self.assertEqual((ev.precision, str(ev.date), ev.status), ("day", "1946-04-18", "draft"))

    def test_admin_edits_are_revised_as_the_human(self):
        from publish.legacy import import_content

        import_content(small())
        user = User.objects.create_superuser("owner", "owner@example.com", "pw-for-tests-only")
        self.client.force_login(user)
        p = Publisher.objects.get(domain="britannica.com")
        url = f"/admin/evidence/publisher/{p.pk}/change/"
        form = {"domain": p.domain, "name": "Britannica", "tier": "2", "license": p.license, "fetch_policy": p.fetch_policy, "access_notes": p.access_notes}
        resp = self.client.post(url, form)
        self.assertEqual(resp.status_code, 302, resp.content[:2000])
        rev = Revision.objects.filter(table_name="evidence_publisher", row_pk=str(p.pk), action="update").latest("id")
        self.assertEqual((rev.actor, rev.changed), ("human:owner", ["name"]))
        for path in ["/admin/", "/admin/timeline/event/", "/admin/timeline/branch/", "/admin/evidence/claim/", "/admin/revisions/revision/", f"/admin/timeline/event/{Event.objects.first().pk}/change/"]:
            self.assertEqual(self.client.get(path).status_code, 200, path)
