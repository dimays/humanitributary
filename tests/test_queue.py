"""The task queue: leases, ownership, retries, dedupe, and SKIP LOCKED between concurrent agents."""

import threading
from datetime import timedelta

from django.db import connection, connections, transaction
from django.test import TestCase, TransactionTestCase
from django.utils import timezone

from work import queue
from work.models import AgentTask


class QueueTests(TestCase):
    def test_highest_priority_then_oldest_first(self):
        low, _ = queue.enqueue("audit", created_by="job:t", priority=0)
        high, _ = queue.enqueue("audit", created_by="job:t", priority=5)
        old, _ = queue.enqueue("audit", created_by="job:t", priority=5)
        self.assertEqual(queue.next_task(agent="agent:a", claim=True).pk, high.pk)
        self.assertEqual(queue.next_task(agent="agent:b", claim=True).pk, old.pk)
        self.assertEqual(queue.next_task(agent="agent:c", claim=True).pk, low.pk)
        self.assertIsNone(queue.next_task(agent="agent:d", claim=True))

    def test_kind_filter_and_peek_does_not_claim(self):
        queue.enqueue("audit", created_by="job:t")
        t, _ = queue.enqueue("verify_claim", created_by="job:t")
        self.assertEqual(queue.next_task(agent="", kinds=["verify_claim"]).pk, t.pk)
        self.assertEqual(AgentTask.objects.get(pk=t.pk).status, "queued")

    def test_only_the_holder_completes(self):
        queue.enqueue("audit", created_by="job:t")
        t = queue.next_task(agent="agent:a", claim=True)
        with self.assertRaises(queue.TaskError):
            queue.complete(t.pk, agent="agent:b", result={})
        done = queue.complete(t.pk, agent="agent:a", result={"ok": True})
        self.assertEqual((done.status, done.result), ("done", {"ok": True}))
        with self.assertRaises(queue.TaskError):
            queue.complete(t.pk, agent="agent:a", result={})

    def test_an_expired_lease_can_be_taken_over(self):
        queue.enqueue("audit", created_by="job:t")
        t = queue.next_task(agent="agent:a", claim=True)
        AgentTask.objects.filter(pk=t.pk).update(lease_until=timezone.now() - timedelta(seconds=1))
        t2 = queue.next_task(agent="agent:b", claim=True)
        self.assertEqual((t2.pk, t2.claimed_by, t2.attempts), (t.pk, "agent:b", 2))
        with self.assertRaises(queue.TaskError):
            queue.complete(t.pk, agent="agent:a", result={})

    def test_a_live_lease_is_not_offered(self):
        queue.enqueue("audit", created_by="job:t")
        queue.next_task(agent="agent:a", claim=True)
        self.assertIsNone(queue.next_task(agent="agent:b", claim=True))

    def test_release_and_fail(self):
        queue.enqueue("audit", created_by="job:t")
        t = queue.next_task(agent="agent:a", claim=True)
        r = queue.release(t.pk, agent="agent:a")
        self.assertEqual((r.status, r.claimed_by, r.attempts), ("queued", "", 0))
        t = queue.next_task(agent="agent:a", claim=True)
        f = queue.fail(t.pk, agent="agent:a", error="page gone")
        self.assertEqual(f.status, "queued")
        t = queue.next_task(agent="agent:a", claim=True)
        f = queue.fail(t.pk, agent="agent:a", error="still gone", retry=False)
        self.assertEqual(f.status, "failed")
        self.assertIn("still gone", f.error)

    def test_tasks_fail_after_max_attempts_of_expired_leases(self):
        t, _ = queue.enqueue("audit", created_by="job:t")
        AgentTask.objects.filter(pk=t.pk).update(max_attempts=2)
        for _ in range(2):
            got = queue.next_task(agent="agent:a", claim=True)
            AgentTask.objects.filter(pk=got.pk).update(lease_until=timezone.now() - timedelta(seconds=1))
        self.assertIsNone(queue.next_task(agent="agent:a", claim=True))
        self.assertEqual(AgentTask.objects.get(pk=t.pk).status, "failed")

    def test_dedupe_key_allows_one_open_task(self):
        a, created_a = queue.enqueue("verify_claim", created_by="job:t", dedupe_key="claim:1")
        b, created_b = queue.enqueue("verify_claim", created_by="job:t", dedupe_key="claim:1")
        self.assertEqual((a.pk, created_a, created_b), (b.pk, True, False))
        t = queue.next_task(agent="agent:a", claim=True)
        queue.complete(t.pk, agent="agent:a", result={})
        c, created_c = queue.enqueue("verify_claim", created_by="job:t", dedupe_key="claim:1")
        self.assertTrue(created_c)
        self.assertNotEqual(c.pk, a.pk)

    def test_not_before(self):
        queue.enqueue("audit", created_by="job:t")
        AgentTask.objects.update(not_before=timezone.now() + timedelta(hours=1))
        self.assertIsNone(queue.next_task(agent="agent:a", claim=True))


class ConcurrentClaimTests(TransactionTestCase):
    """Two agents claiming at the same moment get different tasks (SKIP LOCKED), and neither waits."""

    def test_skip_locked(self):
        t1, _ = queue.enqueue("audit", created_by="job:t", priority=9)
        t2, _ = queue.enqueue("audit", created_by="job:t", priority=1)
        locked, done = threading.Event(), threading.Event()
        got = {}

        def agent_a():
            try:
                with transaction.atomic():
                    got["a"] = queue.next_task(agent="agent:a", claim=True).pk  # holds t1's row lock until commit
                    locked.set()
                    done.wait(10)
            finally:
                connections.close_all()

        th = threading.Thread(target=agent_a)
        th.start()
        self.assertTrue(locked.wait(10))
        with connection.cursor() as c:
            c.execute("SET lock_timeout = '2s'")  # a blocking claim would fail here instead of skipping
        got["b"] = queue.next_task(agent="agent:b", claim=True).pk
        done.set()
        th.join()
        self.assertEqual((got["a"], got["b"]), (t1.pk, t2.pk))
