---
title: Operations
summary: How to set the platform up on a laptop, run its jobs on a schedule, tell whether it is healthy, what is and isn't backed up, and what to do when something goes wrong.
order: 100
covers:
  - ops/**
  - Makefile
  - docker-compose.yml
  - scripts/make_env.py
  - .env.example
  - ingest/jobs.py
  - ingest/job_defs.py
  - ingest/seed.py
  - ingest/policy.py
  - ingest/management/commands/*.py
  - publish/release.py
  - publish/management/commands/publish.py
---

This chapter is for whoever keeps the platform running. It covers setting up a local copy, running the
collection jobs every few minutes, checking that they are healthy, and what to do when a job keeps failing, a
source changes its terms or a release has to be undone. Main runs on one laptop: a Postgres database in Docker, a
macOS launchd schedule, and files under `var/`.

## Setting up a local copy

You need Docker Desktop, [uv](https://docs.astral.sh/uv/) and Node (the site's build scripts). Then:

| Step | Command | What it does |
|---|---|---|
| 1 | `make env` | `scripts/make_env.py` writes `.env` with `ENVIRONMENT=dev`, a random `POSTGRES_PASSWORD` and a `DATABASE_URL` on port 5433. It leaves an existing `.env` alone. |
| 2 | `make db` | Starts Docker Desktop if it isn't running, then `docker compose up -d --wait db`: Postgres 16, bound to `127.0.0.1:5433`, data in the `humanitributary-pg` volume. |
| 3 | `uv sync` | Installs the Python dependencies into a .venv folder. |
| 4 | `make migrate` | Applies migrations (they create `pg_trgm`, the audit triggers and every table). |
| 5 | `make import` | Dumps `site/data/*.js` to `var/legacy.json` and imports it (idempotent: a second run writes nothing). |
| 6 | `make publish` | Writes the first release to `var/releases/<version>/`. |
| 7 | `make build-release` | Builds the page, timeline.html in `site/`, from `var/releases/latest`. |
| 8 | `uv run python manage.py createsuperuser`, then `make serve` | The admin at http://localhost:8000/admin/. |

`make test` runs the suite against the same Docker Postgres in a separate `test_<database>` database. `make check`
runs Django's checks, looks for missing migrations and validates the site's data.

**Never point anything at port 5432.** That is Postgres.app's port on the owner's laptop. The Docker database is
on 5433 (`docker-compose.yml` maps `127.0.0.1:5433` to the container's 5432), and `make env` writes 5433 into
`DATABASE_URL`.

> **Note:** Docker reads `POSTGRES_PASSWORD` only when it first creates the volume. Changing it in `.env` later
> doesn't change the database's password, so the two stop matching. Keep the password `make env` wrote.

The other variables are in `.env.example`:

| Variable | Needed for |
|---|---|
| `ENVIRONMENT` | `dev` locally. Anything else turns on production safety and requires `SECRET_KEY` and `ALLOWED_HOSTS`. |
| `POSTGRES_PASSWORD`, `DATABASE_URL` | The database. Settings refuse to start without `DATABASE_URL`. |
| `INGEST_CONTACT` | The contact in the bot's User-Agent: a project address or URL, never a person's details. Defaults to the repository. |
| `SMITHSONIAN_API_KEY`, `EUROPEANA_API_KEY` | Two lookup adapters. Empty means those adapters skip. |
| `INGEST_START_DOCKER` | `0` stops `ops/run-jobs.sh` from starting Docker Desktop. |

Never print, commit or paste `.env`. Keys must never reach logs or errors: `ingest/policy.py` `mask_secrets`
masks configured key values and key-like query parameters in FetchRun errors and log lines.

## The schedule

One command does all scheduled work: `manage.py run_jobs` (`make jobs`). Each time it runs, it takes the runner's
advisory lock (`ingest/jobs.py` `LOCK_KEY`), closes any FetchRun a crashed process left `running`, and runs every
due job once, in the order `ingest/job_defs.py` registers them. A second runner that finds the lock taken logs
"another run_jobs holds the lock; exiting" and stops. The lock belongs to the database session, so it dies with
the process: a crash never leaves it stuck.

### Locally: launchd

| Command | What it does |
|---|---|
| `make schedule-install` | `ops/schedule.sh install` fills in `ops/launchd/run-jobs.plist` and loads it as a launchd agent: `ops/run-jobs.sh` every 15 minutes (`StartInterval` 900) and once at load. The label is `local.<site name>.run-jobs`, from `SITE_NAME`. |
| `make schedule-status` | Whether the agent is loaded, its last exit, and the newest log's last five lines. |
| `make schedule-uninstall` | Unloads it and removes the plist from ~/Library/LaunchAgents. |

The owner decides whether the schedule is installed. Install it from the checkout whose code should run: the plist
records that checkout's path.

Each tick of `ops/run-jobs.sh`:

1. If something already answers on 5433 (from any checkout or worktree), go on.
2. Otherwise, if Docker isn't running and `INGEST_START_DOCKER` isn't `0`, start Docker Desktop and wait up to two
   minutes; then `docker compose up -d --wait db`.
3. If the database still isn't up, or `uv` isn't on the path, log a skip line and exit.
4. Run `uv run --quiet python manage.py run_jobs` and log its output and exit status.

The script always exits 0, so launchd never backs off. A Mac that is asleep runs nothing.

### Job intervals

A plain job is due when its interval has passed since its last run started. A feed job is due per feed, when
that Feed's `next_run_at` has come; each run sets `next_run_at` to now plus the Feed's `interval_minutes`.

| Job | Interval | Kind |
|---|---|---|
| `seed_sources` | `WEEK` (10,080 min) | plain |
| `seed_branch_entities` | `WEEK` | plain |
| `portal` | Feed: 60 | feed |
| `year_pages` | Feed: 1,440 | feed |
| `rss` | Feeds: 60, 120, 10,080 (all disabled) | feed |
| `who_don` | Feed: 360 | feed |
| `federal_register` | Feed: 360 | feed |
| `gazette` | Feed: 720 | feed |
| `nobel` | Feed: 1,440 | feed |
| `historian_sync` | Feed: 10,080 | feed |
| `refresh_entities` | Feed: 1,440 | feed |
| `pageviews` | 360 | plain |
| `process` | 15 | plain |
| `enrich_tasks` | 60 | plain |
| `link_health` | `DAY` (1,440) | plain |
| `facts_sweep` | `DAY` | plain |
| `branches_review` | `WEEK` | plain |
| `second_source` | `DAY` | plain |

Plain intervals are in `ingest/job_defs.py` (`DAY, WEEK = 1440, 10080`). Feed intervals are the Feed rows'
`interval_minutes`, seeded from `ingest/seed.py` `FEEDS`. Seeding never changes an existing Feed's interval, so
after the first run the admin is the place to change it.

A job runs on the first tick after it is due, so its real period is its interval rounded up to the tick. With
15-minute ticks, `process` (15 minutes) runs every 15 or 30 minutes, depending on how long the jobs before it took.

`manage.py run_jobs --list` prints the registry: each job and feed, its interval, whether it is on, and when it is
next due. `run_jobs --only portal,process` limits a run to some jobs.

### Hosted: Heroku Scheduler

> **Pending: parity branch.** The plan is Heroku Scheduler running `python manage.py run_jobs` every 10 minutes,
> the same command; the lock keeps runs from overlapping. Raw documents must move to object storage first,
> because dynos are ephemeral, and a worker process joins the `Procfile`. Update this section when it merges.

## Is it healthy?

Read these, in this order.

| Where | What it tells you |
|---|---|
| `make digest` (`manage.py digest`) | Open tasks by kind, the top `write_event` stories, `write_event` by branch, `verify_claim` reasons, new-branch signals, the fact base's and branch governance's sections, candidates by status, and every job's runs in the last 24 hours with the last three failed or partial errors. "No runs in the last 24 hours" means the schedule isn't running. `--sources` adds every feed and lookup adapter, on or off, with its publisher's policy, tier and disabled reason, plus the sources considered and skipped. |
| `uv run python manage.py facts report` | The fact base: record claims by status (corroborated, single source, contested, stale, unverified), by era and region, and what is due, broken, contested or blocking publication. `--brief` drops the tables. |
| `make schedule-status` | Whether launchd runs the ticks, and the last log lines. |
| `manage.py run_jobs --list` | What is due, and which feeds are off and why. |
| The admin's FetchRun list | Every run, filterable by status, job and feed, with counts and the full error. |
| `var/logs/` | `run-jobs-YYYY-MM-DD.log`: one file per day, with each tick's start, a line per run (`job [feed]: status {counts} (seconds)`), the run count and the exit status, and any skip. launchd's own output goes to `launchd.out.log` and `launchd.err.log`. Nothing rotates or deletes these. |

A FetchRun's status:

| Status | Means |
|---|---|
| `running` | In progress. One left over from a crash is closed as `failed`, with "interrupted (the runner exited before finishing)", at the start of the next run. |
| `ok` | Finished with no errors. |
| `partial` | Finished, but recorded errors: some items or pages failed. The errors are in `error`. |
| `failed` | Raised an exception. The traceback's tail is in `error`, with keys masked. |

`manage.py run_jobs` prints "N run(s), M failed" and exits 0 either way. `manage.py run_job` exits with an error
when a run failed.

## Backups

Say it plainly: **main has no backup system.** Here is what exists.

| What | Where it lives | Survives |
|---|---|---|
| The database | The Docker volume `humanitributary-pg` | Stopping or recreating the container (`make db-stop`, `docker compose down`). It does not survive `docker compose down -v`, `docker volume rm` or losing the laptop. |
| Content (branches, events, cites) | `site/data/*.js` in git | Anything git survives. `make import` rebuilds it into an empty database until the cutover. |
| Review state, Revisions, evidence checks, ratings set in the admin, the queue, ingest state | Postgres only | Only what the volume survives. |
| Raw documents, releases, logs | `var/`, gitignored | Nothing: not in git, not copied anywhere. |

There is no `pg_dump` target, no scheduled dump and no copy off the machine. If you need a copy now, a one-off
dump works while the database runs:

```bash
mkdir -p var/backups
docker compose exec -T db pg_dump -U humanitributary -Fc humanitributary > var/backups/humanitributary-$(date +%F).dump
```

Restore a dump into an empty database with `pg_restore`, schema and data together. A data-only restore runs into
the revision trigger, which refuses canonical rows written outside `revising()`. Never restore over the live
database while the schedule is running.

> **Pending: parity branch.** Hosted environments bring Heroku Postgres (with its own backups) and object storage
> for `var/`; update this section when it merges.

## Runbooks

### A job keeps failing

1. **Find the error.** `make digest` shows the job's runs and the first line of the last failures. The admin's
   FetchRun list (filter by job and status) has the full error and the counts. `var/logs/run-jobs-<date>.log` has
   what the run printed.
2. **Reproduce it.** `uv run python manage.py run_job <name>` runs it now, due or not; for a feed job add
   `--feed "<feed name>"` to run one feed. It takes the same lock, so if a scheduled tick is running it exits
   with "another run_jobs holds the lock". Options go in with `--opt key=value`.
3. **Read the cause.**

   | The error says | Usually |
   |---|---|
   | "interrupted (the runner exited before finishing)" | The process died mid-run (sleep, a killed shell, Docker stopping). It runs again next time. |
   | "publisher … is browser_only", a `NEVER_FETCH` reason, "robots.txt … disallows" | The source policy refused the request. The policy is right; the feed or URL is wrong. |
   | "answered with a bot challenge" | The host showed a CAPTCHA. The fetcher stops asking that host for the rest of the run, and link health skips it for `ingest/policy.py` `BLOCKED_COOLDOWN_DAYS` (14). |
   | `FetchError`, timeouts, HTTP 5xx | The source is down. It is retried on the next due run. |
   | A Python exception in parsing | The source changed its format. Fix the parser and re-record the test cassette (`tests/record_fixtures.py`). |

4. **Stop it if you must.** A failing job doesn't block the others, and a failure doesn't make it run sooner or
   later: it runs again after its normal interval. To stop a feed, untick `enabled` on its Feed in the admin and
   set `config["disabled_reason"]`, which `digest --sources` and `run_jobs --list` show. Seeding never turns it
   back on. A plain job has no switch: removing it from `ingest/job_defs.py` is a code change.

### A source changed its terms

1. **Read the new terms.** Note the clause that decides it.
2. **Stop automated reading now.** In the admin, set the Publisher's `fetch_policy` to `browser_only` (or
   `forbidden` if it must never be cited either). The edit runs as `human:<username>` and leaves a Revision. The
   fetcher reads the policy on every request, so every job stops fetching that domain at once, link health
   included. A subdomain without its own Publisher row follows its nearest parent.
3. **Turn off its feeds.** Untick `enabled` on each Feed of that publisher and set `config["disabled_reason"]`. For
   a lookup adapter, its Feed (`config["job"] = "lookup"`) is the switch.
4. **Record the verdict in code**, so a fresh database gets it:
   - `ingest/seed.py`: the publisher's `VERDICTS` entry, and its `FEEDS` row disabled with a `disabled_reason`.
     A dropped source goes in `SKIPPED` with why.
   - `ingest/policy.py` `NEVER_FETCH`, if the terms forbid automated reading whatever the database says.
   - The Publisher's `access_notes`, with the clause, and [ADR 0013](../adr/0013-source-policy.md).

   `VERDICTS` is applied only once per database (the `JobState` named `terms_verdicts_v1`), so a new verdict does
   not reach an existing database by itself. That is why step 2 happens in the admin.
5. **What already exists stays.** Citations to the publisher remain, and agents re-read them in a browser
   (`browser_read`). Documents already fetched stay in `var/raw/`. If the terms also limit what we may keep
   (some ask for deletion within a time limit), that is a separate clean-up to plan.

[Sources and terms](sources-and-terms.md) explains the policy layers.

### Restore a release

What `publish/release.py` writes:

- `var/releases/<version>/content.json`: the snapshot. `<version>` is `YYYY.MM.DD.N`, where N counts that day's
  Release rows.
- `var/releases/<version>/manifest.json`: the version, sha256 `content_hash`, creation time, counts and
  `revision_high_water` (the last Revision included).
- `var/releases/latest`: a relative symlink to the newest version's directory, replaced on every new release.
- A `Release` row with the same hash, path and counts.

A release directory is never changed after it is written. `publish` makes a new one only when the content's hash
differs from the newest Release row's (or with `--force`).

To serve an earlier release:

```bash
ls var/releases/                                   # pick a version
shasum -a 256 var/releases/<version>/content.json  # must match content_hash in its manifest.json
ln -sfn <version> var/releases/latest              # repoint latest (relative, as publish writes it)
make build-release                                 # the page from that snapshot
```

This changes what the page shows, not the database. The next `make publish` compares the database's content with
the newest Release row, not with `latest`.

- If the content hasn't changed since that newest release, `publish` prints "Unchanged since <version>" and
  leaves `latest` where you put it.
- If it has, `publish` writes a new version and points `latest` at it.

So to undo a change for good, fix the rows (for a branch operation, `manage.py branches revert <id>`), then
publish a new release. Releases only go forward.

If `var/releases/` is lost, the database still produces the same bytes: `manage.py publish --force` writes the
current content as a new version, and its hash matches the old Release row's if nothing changed since.

> **Note:** `publish` creates the version directory and refuses one that already exists. The day's counter comes
> from Release rows, so after the database is reset it starts again at 1, and publishing fails if that version's
> directory is still on disk. Move the old directories out of `var/releases/` first.

> **Pending: parity branch.** Release gates and rollback by repointing the served release in object storage;
> update this runbook when it merges.

## Changing it

| Change | What it needs |
|---|---|
| A different local tick | `StartInterval` in `ops/launchd/run-jobs.plist` and the comments in `ops/run-jobs.sh` and `ops/schedule.sh`, then `make schedule-install` again |
| A job's interval | Plain job: `ingest/job_defs.py`. Feed job: the Feed row in the admin, and `FEEDS` in `ingest/seed.py` for new databases |
| A new environment variable | `config/settings.py`, `.env.example`, and `scripts/make_env.py` if every developer needs it |
| A new `make` command | A target in the `Makefile` with a `## ` comment, so `make help` lists it, and `.PHONY` |
| A backup system | An ADR first: what is copied, where, how often, and how a restore is tested; then the Backups section |
| A new runbook | A `###` section under Runbooks, written from the code it depends on, with that code in `covers` |
