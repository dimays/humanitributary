# 0003 — Deterministic jobs, and a queue for agents

**Status:** accepted (November 2026); amended by [0041](0041-deferred-releases-and-the-fetch-policy-endpoint.md) (an agent's release defers the task and may record a need)

## Context

New material will come from scheduled scrapers (APIs, RSS, sitemaps, pages)
and governance jobs that watch branches' shape. Some steps are mechanical
(fetch, hash, extract, resolve Wikidata entities, match duplicates by trigram
similarity, compute metrics); others need judgment (is this an event worth
adding, does this page support the claim, should this branch split). LLM calls
inside scheduled jobs would make them slow, costly, flaky and impossible to
re-run with the same result.

## Decision

Scheduled jobs are deterministic: no LLM calls, the same output for the same
input. They write working state (`ingest`, `governance`) and enqueue
`work.AgentTask`s for anything that needs judgment. Claude agents drain the
queue when they run, through `manage.py tasks`:

- `tasks next --kind … --claim --agent agent:<name>` leases the best task
  (highest priority, then oldest) with `SELECT … FOR UPDATE SKIP LOCKED`, so
  any number of agents can work at once without taking the same task or
  waiting on each other.
- A lease lasts `TASK_LEASE_MINUTES` (30); an expired one may be taken over,
  counting an attempt, and a task fails after `max_attempts`.
- Only the holder may `complete` (with a JSON result), `fail`, `release` or
  `extend` a task.
- A job's `dedupe_key` allows one open task per (kind, key), enforced by a
  partial unique index, so re-running a job doesn't duplicate work.

Routing is deterministic too: `BranchEntity` maps Wikidata items to branches,
and a document's entities score candidate branches (`Candidate.branch_scores`).

## Consequences

- Jobs can run on a cron (Heroku Scheduler or similar) and be re-run safely.
- The queue is the contract between jobs and agents: a new kind of judgment is
  a new task kind and a payload, not a new integration.
- Canonical writes an agent makes while working a task carry the task id in
  their Revisions (ADR 0006), so every change traces back to why it was made.
