# 0019 — Production's processes locally, health and alerts, and release gates

**Status:** accepted (November 2026)

## Context

The Procfile had `release` and `web`; jobs ran once per 15 minutes from launchd. Releases were written to `var/` with
nothing between `publish` and readers but the round trip the owner remembered to run. Before launch the same process
model, health check and release discipline should be in daily use.

## Decision

**Processes (Procfile parity).** `release: migrate`; `web: gunicorn` (admin, agent API, `/healthz`); `worker:
manage.py run_jobs --loop`. The worker holds a second Postgres advisory lock, the scheduler lock, for its life, so
only one worker schedules (another waits as a standby), and runs whatever is due every `WORKER_TICK_SECONDS` (60)
under the existing per-run lock. SIGTERM lets the running job finish and stops before the next one; a job cut off by
SIGKILL is closed as failed on the next run. `make up` runs `web` and `worker` with honcho from the same Procfile
(gunicorn bound to 127.0.0.1:8000). The launchd schedule (`run_jobs` once every 15 minutes) stays for when `make up`
isn't running; the two can run together without overlapping. `facts_sweep` (daily) and `branches_review` (weekly)
are in the job registry.

**Health and alerts.** `/healthz` reports the database, both stores, the latest release, each job's last
successful run and consecutive failures, and the queue's depth; 200 when the database and stores answer, 503
otherwise. A job that fails `ALERT_AFTER_FAILURES` (3) runs in a row sends one email to `ALERT_EMAILS` (or `ADMINS`)
through Django's mail settings (the console backend locally).

**Releases.** A release is `releases/<version>/` in the object store (ADR 0016), never overwritten; `latest.json`
points readers at one. `manage.py publish --rollback <version>` repoints it (after checking the snapshot's hash).
`publish` refuses unless every gate passes:

1. *build*: the site's own build accepts the snapshot and builds the page (stored as `timeline.html`);
2. *contested*: no published entry has a contested record claim unless its text says the sources differ;
3. *roundtrip*: the site reads the snapshot back byte for byte, and, given the legacy dump (`make publish` passes
   `var/legacy.json` until the cutover), the snapshot equals it on every legacy key (ADR 0018);
4. *report*: the change report (added, changed, retracted since the release readers had, by branch:
   `changes.json` and `changes.md`) is in the store before the pointer moves.

`publish --check` runs the gates and writes nothing.

## Consequences

- Heroku needs a `worker` dyno (or Scheduler running `run_jobs`), the S3 variables and mail settings.
- `make publish` refuses while `var/legacy.json` is stale: run `make import` (it re-dumps) first.
- Publishing needs Node (the build gate); CI has it.
