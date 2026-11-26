"""Production parity: object storage, releases (gates, change report, rollback, mirror), the worker loop, alerts and
the health check (docs/adr/0016, 0018, 0019). The storages are temporary directories (tests/runner.py)."""

import hashlib
import json
import shutil
import tempfile
from datetime import date, timedelta
from pathlib import Path
from unittest import mock, skipUnless

from django.core import mail
from django.db import connections
from django.test import TestCase, override_settings
from django.utils import timezone

from evidence.models import Claim
from infra import migrate_local, storage
from infra.alerts import consecutive_failures
from ingest import jobs, store
from ingest.models import Document, FetchRun
from publish import gates
from publish.content import dumps, without_derived
from publish.legacy import import_content
from publish.models import Release
from publish.release import check, publish, pull_release, rollback
from revisions import revising
from timeline import services
from timeline.models import Event, Status

from .fixtures import small
from .runner import FreshStorage

D = date(2026, 11, 26)


class StorageTests(FreshStorage, TestCase):
    def test_write_once(self):
        self.assertTrue(storage.write(storage.RELEASES, "releases/x/a.json", b"1"))
        self.assertFalse(storage.write(storage.RELEASES, "releases/x/a.json", b"1"), "the same bytes again: nothing to do")
        with self.assertRaises(storage.Immutable):
            storage.write(storage.RELEASES, "releases/x/a.json", b"2")
        storage.write_pointer({"version": "x"})
        storage.write_pointer({"version": "y"})  # the pointer is the one key that moves
        self.assertEqual(storage.read_pointer()["version"], "y")

    def test_raw_documents_are_content_addressed(self):
        h, key = store.write_raw(b"<html>hello</html>")
        self.assertEqual(key, f"raw/{h[:2]}/{h}")
        self.assertEqual(store.read_raw(key), b"<html>hello</html>")
        self.assertEqual(store.write_raw(b"<html>hello</html>"), (h, key))
        self.assertIsNone(store.read_raw("raw/00/" + "0" * 64))


class MigrateLocalTests(FreshStorage, TestCase):
    def setUp(self):
        super().setUp()
        self.var = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.var)
        self.data = b"a fetched page"
        h = hashlib.sha256(self.data).hexdigest()
        (self.var / "raw" / h[:2]).mkdir(parents=True)
        (self.var / "raw" / h[:2] / h).write_bytes(self.data)
        bad = "f" * 64
        (self.var / "raw" / "ff").mkdir()
        (self.var / "raw" / "ff" / bad).write_bytes(b"not what the name says")
        rel = self.var / "releases" / "2026.11.20.1"
        rel.mkdir(parents=True)
        (rel / "content.json").write_bytes(b'{"branches": [], "events": []}\n')
        (rel / "manifest.json").write_bytes(b"{}\n")
        (self.var / "releases" / "latest").symlink_to("2026.11.20.1")
        self.key = f"raw/{h[:2]}/{h}"

    def test_copies_checks_points_and_deletes_nothing(self):
        Document.objects.create(canonical_url="https://example.org/a", url="https://example.org/a", raw_path=self.key, content_hash=self.key[-64:], fetched_at=timezone.now())
        stats, problems = migrate_local.migrate(self.var, dry_run=True, log=lambda m: None)
        self.assertEqual(stats["raw.copied"], 1)
        self.assertFalse(storage.exists(storage.RAW, self.key), "a dry run writes nothing")
        stats, problems = migrate_local.migrate(self.var, log=lambda m: None)
        self.assertEqual((stats["raw.copied"], stats["raw.bad_hash"], stats["releases.copied"], stats["pointer.written"]), (1, 1, 2, 1))
        self.assertEqual(stats["db.missing_raw"], 0)
        self.assertEqual(store.read_raw(self.key), self.data)
        self.assertEqual(storage.read_pointer()["version"], "2026.11.20.1")
        self.assertTrue((self.var / "raw" / self.key[4:6] / self.key[7:]).exists(), "local files stay")
        again, _ = migrate_local.migrate(self.var, log=lambda m: None)
        self.assertEqual((again["raw.copied"], again["raw.present"], again["releases.present"], again["pointer.written"]), (0, 1, 2, 0))

    def test_reports_what_the_database_needs_and_the_store_lacks(self):
        Document.objects.create(canonical_url="https://example.org/b", url="https://example.org/b", raw_path="raw/ab/" + "ab" * 32, content_hash="ab" * 32, fetched_at=timezone.now())
        stats, _ = migrate_local.migrate(self.var, log=lambda m: None)
        self.assertEqual(stats["db.missing_raw"], 1)


class ReleaseTests(FreshStorage, TestCase):
    """Release files, the pointer, the change report, rollback and the mirror (the build gate skipped: see below)."""

    def setUp(self):
        super().setUp()
        import_content(small())

    def _publish(self, **kw):
        return publish(actor="job:test", today=D, skip_gates=("build",), **kw)

    def test_release_files_pointer_and_change_report(self):
        r1, _ = self._publish()
        self.assertEqual(r1.version, "2026.11.26.1")
        for name in ("content.json", "manifest.json", "changes.json", "changes.md"):
            self.assertTrue(storage.exists(storage.RELEASES, f"releases/{r1.version}/{name}"), name)
        first = json.loads(storage.read(storage.RELEASES, f"releases/{r1.version}/changes.json"))
        self.assertIsNone(first["from"])
        self.assertEqual(first["total"]["added"], 7)

        with revising("human:owner", reason="test"):
            services.save_event("an-punic-wars", text="Three wars between Rome and Carthage.")
            services.set_status("co-big-bang", Status.RETRACTED)
        r2, created = self._publish()
        self.assertTrue(created)
        rep = json.loads(storage.read(storage.RELEASES, f"releases/{r2.version}/changes.json"))
        self.assertEqual(rep["from"], r1.version)
        self.assertEqual(rep["by_branch"]["roman-republic"]["changed"][0]["id"], "an-punic-wars")
        self.assertIn("text", rep["by_branch"]["roman-republic"]["changed"][0]["fields"])
        self.assertEqual(rep["by_branch"]["un"]["retracted"][0]["id"], "co-big-bang")
        self.assertEqual(storage.read_pointer()["version"], r2.version)
        md = storage.read(storage.RELEASES, f"releases/{r2.version}/changes.md").decode()
        self.assertIn("## roman-republic (1 changed)", md)

        rollback(r1.version, actor="human:owner")
        p = storage.read_pointer()
        self.assertEqual((p["version"], p["reason"], p["previous"]), (r1.version, "rollback", r2.version))
        self.assertTrue(storage.exists(storage.RELEASES, f"releases/{r2.version}/content.json"), "rollback deletes nothing")

        mirror = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, mirror)
        v, out = pull_release(dest=mirror)
        self.assertEqual(v, r1.version)
        self.assertEqual((mirror / "latest" / "content.json").read_bytes(), storage.read(storage.RELEASES, r1.snapshot_path))

    def test_a_version_a_failed_run_left_behind_is_skipped(self):
        storage.write(storage.RELEASES, "releases/2026.11.26.1/content.json", b"left over\n")
        r, _ = self._publish()
        self.assertEqual(r.version, "2026.11.26.2")

    def test_rollback_checks_the_snapshot(self):
        with self.assertRaises(ValueError):
            rollback("1999.01.01.1", actor="human:owner")

    def test_contested_claim_without_a_note_blocks_publishing(self):
        claim = Claim.objects.get(entry__slug="an-punic-wars", field="as_written")
        with revising("job:test"):
            services.apply_changes(claim, {"status": "contested"})
        with self.assertRaises(gates.PublishRefused) as ctx:
            self._publish()
        self.assertIn("contested", ctx.exception.problems)
        self.assertFalse(Release.objects.exists())
        self.assertIsNone(storage.read_pointer())
        with revising("job:test"):
            services.save_event("an-punic-wars", text="Three wars with Carthage; sources differ on the start of the third.")
            services.apply_changes(claim, {"status": "contested"})  # the save re-derives nothing here, but be explicit
        r, created = self._publish()
        self.assertTrue(created)

    def test_an_export_that_is_not_deterministic_is_refused(self):
        from publish import export

        real = export.build_content
        calls = []

        def flaky():
            calls.append(1)
            out = real()
            if len(calls) % 2 == 0:
                out["events"] = list(reversed(out["events"]))
            return out

        with mock.patch("publish.release.build_content", flaky), self.assertRaises(gates.PublishRefused) as ctx:
            self._publish()
        self.assertEqual(list(ctx.exception.problems), ["deterministic"])
        self.assertFalse(Release.objects.exists())

    def test_check_runs_the_gates_and_reports_changes_without_writing(self):
        r1, _ = self._publish()
        with revising("job:test"):
            services.save_event("an-punic-wars", title="The Punic Wars")
        rep = check(today=D, skip_gates=("build",))
        self.assertEqual((rep["from"], rep["total"]), (r1.version, {"added": 0, "changed": 1, "retracted": 0}))
        self.assertEqual(Release.objects.count(), 1)
        self.assertEqual(storage.read_pointer()["version"], r1.version)

    @skipUnless(shutil.which("node"), "needs Node")
    def test_the_build_gate_builds_the_page_and_reads_the_snapshot_back(self):
        r, _ = publish(actor="job:test", today=D)
        page = storage.read(storage.RELEASES, f"releases/{r.version}/timeline.html")
        self.assertIn(b'"singleSource":true', page)
        body = storage.read(storage.RELEASES, r.snapshot_path)
        build = gates.node_build(body, D.isoformat())
        self.assertEqual(build.redump, body)
        self.assertEqual(json.loads(dumps(without_derived(json.loads(body)))), small())

    @skipUnless(shutil.which("node"), "needs Node")
    def test_a_snapshot_the_site_rejects_is_refused(self):
        with revising("job:test"):
            Event.objects.filter(slug="an-punic-wars").update(when="")  # the site requires a date text
        with self.assertRaises(gates.PublishRefused) as ctx:
            publish(actor="job:test", today=D)
        self.assertIn("build", ctx.exception.problems)


class WorkerTests(TestCase):
    def test_loop_runs_due_jobs_and_stops_between_jobs(self):
        calls = []
        stop = jobs.Stop()

        def first(ctx):
            calls.append("first")
            stop.request()  # SIGTERM arrives while this job runs …

        def second(ctx):
            calls.append("second")  # … so this one waits for the next worker

        reg = {"first": jobs.Job("first", first, 15), "second": jobs.Job("second", second, 15)}
        with mock.patch.dict(jobs.REGISTRY, reg, clear=True), mock.patch.object(jobs, "_load_registry"):
            ticks = jobs.loop(tick=1, log=lambda m: None, stop=stop, sleep=lambda s: None)
        self.assertEqual(calls, ["first"])
        self.assertEqual(ticks, 1)
        self.assertEqual(FetchRun.objects.get(job="first").status, "ok")
        self.assertTrue(jobs.try_lock(jobs.SCHEDULER_LOCK_KEY), "the scheduler lock is released on the way out")
        jobs.unlock(jobs.SCHEDULER_LOCK_KEY)

    def test_a_second_worker_stands_by(self):
        other = connections.create_connection("default")
        calls = []
        try:
            with other.cursor() as c:
                c.execute("SELECT pg_advisory_lock(%s)", [jobs.SCHEDULER_LOCK_KEY])
            reg = {"x": jobs.Job("x", lambda ctx: calls.append(1), 15)}
            with mock.patch.dict(jobs.REGISTRY, reg, clear=True), mock.patch.object(jobs, "_load_registry"):
                jobs.loop(tick=1, log=lambda m: None, stop=jobs.Stop(), max_ticks=2, sleep=lambda s: None)
            self.assertEqual(calls, [])
        finally:
            with other.cursor() as c:
                c.execute("SELECT pg_advisory_unlock(%s)", [jobs.SCHEDULER_LOCK_KEY])
            other.close()

    def test_governance_jobs_are_scheduled(self):
        jobs._load_registry()
        self.assertEqual(jobs.REGISTRY["facts_sweep"].interval, 1440)
        self.assertEqual(jobs.REGISTRY["branches_review"].interval, 10080)


@override_settings(ALERT_AFTER_FAILURES=3, ALERT_EMAILS=["owner@example.org"], EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AlertTests(TestCase):
    def test_one_email_on_the_third_failure_in_a_row(self):
        boom = jobs.Job("boom", lambda ctx: (_ for _ in ()).throw(RuntimeError("down api_key=SECRET")), 15)
        t0 = timezone.now()
        for i in range(5):
            with mock.patch.object(timezone, "now", return_value=t0 + timedelta(minutes=i)):
                jobs.run_one(boom, log=lambda m: None)
            if i == 1:
                self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("boom failed 3 runs in a row", mail.outbox[0].subject)
        self.assertNotIn("SECRET", mail.outbox[0].body)
        self.assertEqual(consecutive_failures("boom", None), 4, "counted up to ALERT_AFTER_FAILURES + 1")


class HealthTests(FreshStorage, TestCase):
    def test_healthz(self):
        FetchRun.objects.create(job="process", started_at=timezone.now(), status="ok")
        r = self.client.get("/healthz")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertTrue(body["ok"] and body["db"]["ok"] and body["storage"]["raw"]["ok"])
        self.assertIsNotNone(body["jobs"]["process"]["last_ok"])
        self.assertEqual(body["storage_backend"], "local")
        self.assertIn("queued_total", body["queue"])

    def test_unreachable_storage_is_a_503(self):
        with mock.patch.object(storage, "reachable", return_value=(False, "ConnectionError: refused")):
            r = self.client.get("/healthz")
        self.assertEqual(r.status_code, 503)
        self.assertFalse(r.json()["storage"]["releases"]["ok"])


class HostedSettingsTests(TestCase):
    """Outside dev (Heroku: docs/adr/0020-heroku-hosting.md) the settings refuse what a dyno can't keep."""

    def settings_load(self, **env):
        import os
        import subprocess
        import sys

        # Empty, not absent: settings load .env, which never overrides a variable that is set.
        base = dict(os.environ) | {"STORAGE_BACKEND": "", "S3_ENDPOINT_URL": "", "S3_BUCKET_RAW": ""}
        base |= {"ENVIRONMENT": "staging", "SECRET_KEY": "test-only", "ALLOWED_HOSTS": "example.herokuapp.com",
                 "DATABASE_URL": "postgres://u:p@localhost:1/x", **env}
        code = "import django; django.setup(); from django.conf import settings as s; print(s.DATABASES['default']['OPTIONS'].get('sslmode'), s.SECURE_HSTS_SECONDS)"
        return subprocess.run([sys.executable, "-c", code], env=base, capture_output=True, text=True, cwd=Path(__file__).resolve().parent.parent)

    def test_local_storage_only_when_stated(self):
        r = self.settings_load()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("STORAGE_BACKEND=local", r.stderr)
        r = self.settings_load(STORAGE_BACKEND="local")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(r.stdout.split(), ["require", "3600"], "the database over TLS, and HSTS on")
