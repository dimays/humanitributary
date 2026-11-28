---
title: Operations
summary: How to set the platform up on a laptop, run its jobs on a schedule, tell whether it is healthy, what is and isn't backed up, and what to do when something goes wrong.
order: 100
covers:
  - ops/**
  - Makefile
  - Procfile
  - app.json
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
  - infra/*.py
  - infra/management/commands/*.py
---

This chapter is for whoever keeps the platform running. It covers setting up a local copy, running the
collection jobs every few minutes, checking that they are healthy, and what to do when a job keeps failing, a
source changes its terms or a release has to be undone. It runs on one laptop, with production's patterns: Postgres
and MinIO (a local stand-in for S3) in Docker, the `Procfile`'s `web` and `worker` processes (`make up`), a macOS
launchd schedule for when they aren't running, and logs and a mirror of the latest release under `var/`. The same
`Procfile` runs on Heroku as the staging app ([Hosted: Heroku](#hosted-heroku)). The owner's tasks (an agent round,
applying an edit file, publishing, a rollback, a restore …) are also written as numbered procedures, in Simplified
Technical English, in the Maintainer's Manual ([docs/manual/](../manual/README.md), `make check-manual`).

## Setting up a local copy

You need Docker Desktop, [uv](https://docs.astral.sh/uv/) and Node (the site's build scripts). Then:

| Step | Command | What it does |
|---|---|---|
| 1 | `make env` | `scripts/make_env.py` writes `.env` with `ENVIRONMENT=dev`, a random `POSTGRES_PASSWORD`, a `DATABASE_URL` on port 5433, and MinIO's credentials with the `S3_*` variables that point at it. On an existing `.env` it adds only the storage keys it lacks, and it never prints a value. |
| 2 | `make db` | Starts Docker Desktop if it isn't running, then `docker compose up -d --wait db minio`: Postgres 16 on `127.0.0.1:5433` (volume `humanitributary-pg`) and MinIO on `127.0.0.1:9000`, its console on `127.0.0.1:9001` (volume `humanitributary-minio`). Then `make storage-init` creates the two buckets if they are missing. |
| 3 | `uv sync` | Installs the Python dependencies into a .venv folder. |
| 4 | `make migrate` | Applies migrations (they create `pg_trgm`, the audit triggers and every table). |
| 5 | `make import-archive`, or `uv run python manage.py import_legacy <content.json>` | Fills the empty database: with the frozen legacy files (`archive/site-data/`, the content as it was at the cutover), or with a release snapshot someone gives you (what readers have). Postgres is the source of truth, so the real content comes from the owner's database, not from git. Both are idempotent. |
| 6 | `make publish` | Runs the release gates, then writes the first release to the `releases` store and points `releases/latest.json` at it. Needs Node (the build gate). |
| 7 | `make build` | Mirrors the latest release into `var/releases/<version>/` (`make release-pull`), then builds the page, timeline.html in `site/`, from it (the only way the page is built). |
| 8 | `uv run python manage.py createsuperuser`, then `make up` | `web` (gunicorn on 127.0.0.1:8000: the admin at http://127.0.0.1:8000/admin/, the agent API, `/healthz`) and `worker` (`run_jobs --loop`), from the `Procfile`, via honcho. `make serve` is the admin alone, on Django's runserver. |

A checkout made before object storage still has `var/raw/` and `var/releases/`. Run `make storage-migrate` once
(`manage.py storage migrate_local`): it copies both into the store, checking each raw file's hash, writes
`releases/latest.json` from the old `latest` symlink, and lists anything the database refers to that the store
still lacks. It is idempotent and deletes nothing; `VAR=<dir>` copies from another checkout's `var/`, and
`manage.py storage migrate_local --dry-run` shows what it would do. Until it has run, documents fetched before the
change read as missing. Delete the old local copies yourself once its list is empty.

`make test` runs the suite against the same Docker Postgres in a separate `test_<database>` database. `make check`
runs Django's checks, looks for missing migrations and validates the site's data.

**Never point anything at port 5432.** That is Postgres.app's port on the owner's laptop. The Docker database is
on 5433 (`docker-compose.yml` maps `127.0.0.1:5433` to the container's 5432), and `make env` writes 5433 into
`DATABASE_URL`.

> **Note:** Docker reads `POSTGRES_PASSWORD` only when it first creates the volume. Changing it in `.env` later
> doesn't change the database's password, so the two stop matching. Keep the password `make env` wrote. Locally,
> `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` are MinIO's root user and password (`make env` writes them equal).

The other variables are in `.env.example`:

| Variable | Needed for |
|---|---|
| `ENVIRONMENT` | `dev` locally. Anything else (`staging`, `prod`) turns on production safety and requires `SECRET_KEY` and `ALLOWED_HOSTS`: TLS to the database, HTTPS redirect, secure cookies, HSTS, logs to stdout. |
| `SECURE_HSTS_SECONDS`, `LOG_LEVEL` | Outside `dev` only: HSTS's max-age (3600; a year at launch) and the console log level (`INFO`; staging runs `WARNING`). `httpx` and `httpcore` stay at `WARNING` whatever the level: they log every request's full URL. |
| `POSTGRES_PASSWORD`, `DATABASE_URL` | The database. Settings refuse to start without `DATABASE_URL`. |
| `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | The local MinIO. Without a password MinIO refuses to start (Postgres is unaffected). `MINIO_PORT`, `MINIO_CONSOLE_PORT` and `MINIO_IMAGE` override its ports and image. |
| `S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET_RAW`, `S3_BUCKET_RELEASES` | Object storage ([ADR 0016](../adr/0016-object-storage.md)): MinIO locally, AWS S3 on staging ([Hosted: Heroku](#hosted-heroku)); any S3-compatible store works (an empty endpoint for AWS; `S3_REGION=auto` and the account endpoint for Cloudflare R2). |
| `STORAGE_BACKEND` | `local` keeps both stores in `var/storage/<bucket>/`, with no Docker. It is the default when neither `S3_ENDPOINT_URL` nor `S3_BUCKET_RAW` is set; `s3` otherwise. Outside `dev` the settings refuse to start on the local backend unless `STORAGE_BACKEND=local` is set explicitly, since a dyno's disk is thrown away on restart. |
| `INGEST_CONTACT` | The contact in the bot's User-Agent: a project address or URL, never a person's details. Defaults to the repository. |
| `SMITHSONIAN_API_KEY`, `EUROPEANA_API_KEY` | Two lookup adapters. Empty means those adapters skip. |
| `INGEST_START_DOCKER` | `0` stops `ops/run-jobs.sh` from starting Docker Desktop. |
| `WORKER_TICK_SECONDS` | How often the worker looks for due jobs (60). |
| `ALERT_AFTER_FAILURES`, `ALERT_EMAILS` | Alerts: after this many failed runs in a row (3), one email to these addresses (comma-separated). Outside `dev` the mail goes through `EMAIL_HOST`, `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`. |
| `AGENT_API_RATE_PER_MINUTE` | Requests per agent token per minute (120). Tokens themselves come from `manage.py agent_token create`, never from `.env`. |

Never print, commit or paste `.env`. Keys must never reach logs or errors: `ingest/policy.py` `mask_secrets`
masks configured key values and key-like query parameters in FetchRun errors and log lines.

## The schedule

One command does all scheduled work: `manage.py run_jobs`. It runs in two ways, with the same jobs and the same
lock.

| How | Command | Where |
|---|---|---|
| Once | `run_jobs` (`make jobs`) | launchd every 15 minutes; Heroku Scheduler if it is used |
| As a loop | `run_jobs --loop` (`make worker`, or `make up` with `web`) | The `Procfile`'s `worker` process |

Each run takes the runner's advisory lock (`ingest/jobs.py` `LOCK_KEY`), closes any FetchRun a crashed process
left `running`, and runs every due job once, in the order `ingest/job_defs.py` registers them. A second runner that
finds the lock taken logs "another run_jobs holds the lock; exiting" and stops. The lock belongs to the database
session, so it dies with the process: a crash never leaves it stuck.

### The worker

`run_jobs --loop` (`ingest/jobs.py` `loop()`) holds a second advisory lock, the scheduler lock
(`SCHEDULER_LOCK_KEY`), for its whole life, and runs whatever is due every `WORKER_TICK_SECONDS` (60) under the
runner's lock. A second worker finds the scheduler lock taken, logs "another worker holds the scheduler lock;
standing by" and tries again each tick, so a deploy that briefly runs two workers never schedules twice. The worker
and launchd can run at the same time: whichever holds the runner's lock runs the due jobs, and the other exits or
waits for its next tick.

Between jobs, and once a tick when nothing is due, the worker also runs the actions staff queued from the
[operations console](operations-console.md) (a job run, `publish --check`, a publish, a rollback): they wait as
`pending` OpsAction rows until a worker holding the scheduler lock picks them up, so with no worker running
(staging's `worker` scaled to 0, or no `make up` locally) they wait, and the console says so. A job paused from the console
(`JobState` "paused_jobs") is skipped by every runner until it is resumed; `run_jobs --list` shows it as paused. An
archived one (`JobState` "archived_jobs", [ADR 0041](../adr/0041-archive-a-job.md)) never runs, not even by
`run_job`, until it is unarchived (it comes back paused); `run_jobs --list` shows it as archived, and a run of it under
way when it was archived stops at its next request and is recorded as `stopped`.

SIGTERM (Heroku's shutdown, Ctrl-C under honcho) lets the job that is running finish, then stops before the next
one and logs "worker stopped". A job cut off by SIGKILL is closed as failed on the next run. The worker's output
goes to its terminal (honcho prefixes each line with the process's name), not to `var/logs/`.

Use `make up` while you work; the launchd schedule runs the jobs when nothing else is running.

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
3. If the database still isn't up, log a skip line and exit.
4. If `S3_ENDPOINT_URL` in `.env` points at a local MinIO (`127.0.0.1` or `localhost`) and nothing answers on its
   port, `docker compose up -d --wait minio`; if MinIO doesn't come up, log a skip line and exit.
5. If `uv` isn't on the path, log a skip line and exit.
6. Run `uv run --quiet python manage.py run_jobs` and log its output and exit status.

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
| `entity_relations` | 60 | plain |
| `enrich_tasks` | 60 | plain |
| `link_health` | `DAY` (1,440) | plain |
| `facts_sweep` | `DAY` | plain |
| `branches_review` | `WEEK` | plain |
| `second_source` | `DAY` | plain |
| `gap_waves` | `DAY` | plain |
| `gap_pointers` | 60 | plain |
| `prefetch_sources` | 15 | plain |

`seed_sources` also applies one-off rating sets once per database: the terms verdicts (ADR 0013) and the
November 28, 2026 source ratings (ADR 0037, JobState "ratings_2026_11_28"). On a database that has them pending,
`manage.py run_job seed_sources` applies them now instead of at the weekly run.

Plain intervals are in `ingest/job_defs.py` (`DAY, WEEK = 1440, 10080`). Feed intervals are the Feed rows'
`interval_minutes`, seeded from `ingest/seed.py` `FEEDS`. Seeding never changes an existing Feed's interval, so
after the first run the admin is the place to change it.

A job runs on the first tick after it is due, so its real period is its interval rounded up to the tick. With
launchd's 15-minute ticks, `process` (15 minutes) runs every 15 or 30 minutes, depending on how long the jobs before
it took; under the worker, which waits `WORKER_TICK_SECONDS` after each pass, it runs a minute or so after it
is due.

`manage.py run_jobs --list` prints the registry: each job and feed, its interval, whether it is on, and when it is
next due. `run_jobs --only portal,process` limits a run to some jobs.

### Hosted

On Heroku a `worker` dyno runs `run_jobs --loop`, or Heroku Scheduler runs `python manage.py run_jobs`; the locks
keep either from overlapping with the other. A dyno's disk is thrown away on restart, which is why raw documents
and releases live in object storage, and why a worker never runs on a dyno without the `S3_*` variables set
([Hosted: Heroku](#hosted-heroku)).

## Hosted: Heroku

The Heroku pipeline `humanitributary` holds the hosted apps ([ADR 0020](../adr/0020-heroku-hosting.md)). Today that
is staging, and since November 26, 2026 it holds the platform's data: the laptop's database and object store were
moved into it, and collection runs there, not on a laptop. Production joins the pipeline at launch, with its own
database; the bare domain is reserved for the public page.

| | Staging |
|---|---|
| App | `humanitributary-staging` (region us, stack heroku-24), at https://data.manyages.com (Heroku-managed certificate) and https://humanitributary-staging-aeb697fb63be.herokuapp.com. Agents use `https://data.manyages.com/api/agent` as `HUMANITRIBUTARY_API` |
| Build | Two buildpacks, in order: `heroku/nodejs` (Node 24.x from `package.json`, which has no dependencies; it runs `site/build.mjs` for the publish gates) and `heroku/python` (Python from `.python-version`, packages from `uv.lock`, then `collectstatic`). `heroku buildpacks -a humanitributary-staging` lists them. |
| Processes | From the `Procfile`: `release` runs `migrate` before each release goes live (a failed migration stops the deploy); `web` 1 × Basic; `worker` 1 × Basic (`run_jobs --loop`): the only place jobs run |
| Object storage | AWS S3, us-east-1: `humanitributary-staging-raw` and `humanitributary-staging-releases`, private (public access blocked, SSE-S3). The IAM user `humanitributary-staging` has no console login and may only list those two buckets and read, write and delete their objects |
| Database | Heroku Postgres Essential-1, Postgres 16 (10 GB, 20 connections), as `DATABASE_URL`; TLS required; a backup daily at 03:00 Chicago time (`heroku pg:backups`) |
| Deploys | Connected to `dimays/humanitributary`: `main` deploys automatically once CI has passed on it |

Config vars (`heroku config -a humanitributary-staging` lists them; never paste their values anywhere):

| Variable | Set by | Value |
|---|---|---|
| `SECRET_KEY` | the setup, generated on the spot | never printed; rotate with a new random value (it signs out every admin session) |
| `ENVIRONMENT` | the setup | `staging` |
| `ALLOWED_HOSTS` | the setup | the app's `herokuapp.com` host, `data.manyages.com`, `manyages.com`, `www.manyages.com`, and `data.humanitributary.com` while agents still use it |
| `OPS_HOSTS` | the setup | the hosts that serve `/ops/`: `data.manyages.com`, and `data.humanitributary.com` while it serves |
| `LOG_LEVEL` | the setup | `WARNING` (the worker's progress is in FetchRun rows, the admin and `/healthz`, not the log) |
| `INGEST_CONTACT` | the setup | the repository's URL |
| `STORAGE_BACKEND` | the setup | `local` only until the access key is in; unset after, so the `S3_*` variables choose S3 |
| `DATABASE_URL` | Heroku Postgres | managed by Heroku; it changes when Heroku rotates credentials |
| `S3_REGION`, `S3_BUCKET_RAW`, `S3_BUCKET_RELEASES` | the setup | `us-east-1` and the two staging buckets; no `S3_ENDPOINT_URL` (it is AWS) |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | the owner | the IAM user's key, created straight into config vars (below); it lives nowhere else, not in a `.env` or GitHub's secrets |
| `ALERT_EMAILS`, `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL` | the owner | alerts by mail; without them an alert is a log line |
| `SMITHSONIAN_API_KEY` | the owner | its lookup adapter skips without it |
| `EUROPEANA_API_KEY` | nobody yet | a Personal key is for non-production use only: leave it unset until a Project key exists ([Sources and terms](sources-and-terms.md)) |

The site is ManyAges, at `manyages.com`, registered at Namecheap on November 28, 2026, with its nameservers on
Cloudflare (free plan: `NS1_PLACEHOLDER`, `NS2_PLACEHOLDER`). It was Humanitributary at `humanitributary.com` until
then ([ADR 0043](../adr/0043-the-manyages-name.md)). The `manyages.com` zone holds:

| Record | Value | Why |
|---|---|---|
| `data` CNAME | the app's Heroku DNS target (`heroku domains -a humanitributary-staging`), DNS only | the admin and the agent API; DNS only so Heroku issues and renews the certificate (`heroku certs:auto`) |
| `@` CNAME (flattened) and `www` CNAME | each name's own Heroku DNS target (`heroku domains -a humanitributary-staging`), DNS only | the public page; Heroku issues their certificates, and the app redirects `www` to the bare domain |
| `@` TXT | `v=spf1 -all` | no server may send mail as the domain |
| `_dmarc` TXT | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s` | receivers reject mail that claims to come from it |

The old domain, `humanitributary.com` (Cloudflare `angelina.ns.cloudflare.com`, `rex.ns.cloudflare.com`), is not
renewed: it expires on November 26, 2027, and its redirects work until then. Its zone keeps the same two mail
records, and:

| Name | What it does |
|---|---|
| `@` and `www` | proxied (orange cloud), so Cloudflare answers them: a redirect rule sends each request, 301, to `https://manyages.com` with the same path and query. A browser keeps the `#` part of a link across a redirect, so an event link (`/#<slug>`) still opens its event |
| `data` | a CNAME to its Heroku DNS target, DNS only, serving the admin, the console and the agent API like `data.manyages.com`, until every agent environment uses the new name: a redirect would lose an agent's `POST` |

The public page is the web process's `/` ([ADR 0024](../adr/0024-the-app-serves-the-page.md)): the latest release's
`timeline.html` from the S3 releases bucket, kept in memory and re-checked against `releases/latest.json` at most
once a minute, so `heroku run python manage.py publish` (or `publish --rollback <version>`) is live within a minute.
`/images/*` and `/outlines.js` come from the slug's `site/`, so a changed image needs a deploy; so do the brand files
(`/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`, `/og-image.png`,
`/site.webmanifest`, from `site/brand/`), which every host serves at its root ([Publishing](publishing.md#the-brand-files)).
The preview card is remade by hand (`make release-pull`, `make card`, commit, deploy) after a big content wave or a
change to how the page draws: the manual's procedure 13. Before the first
release `/` answers 503; the `X-Release` header names the version being served. `ALLOWED_HOSTS` must list
`manyages.com` and `www.manyages.com`. Mail for the domain needs an MX (Cloudflare Email Routing for forwarding) and an SPF
that names the sender before anything sends as it.

To create or rotate the access key, with the AWS CLI signed in (`aws login`), the owner runs, in zsh:

```bash
aws iam create-access-key --user-name humanitributary-staging --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text | read -r AK SK && heroku config:set -a humanitributary-staging S3_ACCESS_KEY_ID="$AK" S3_SECRET_ACCESS_KEY="$SK" >/dev/null && unset AK SK && echo "key stored in Heroku"
```

The secret is never shown. A user holds at most two keys: to rotate, create the new one, check `/healthz`, then
`aws iam delete-access-key --user-name humanitributary-staging --access-key-id <old id>` (`aws iam
list-access-keys` shows the ids). If the `heroku` half fails, delete the key it made and run it again.

Never copy a laptop's `.env` into config vars: its passwords are local-only, and its keys are the owner's to place.

Everyday commands:

```bash
heroku logs --tail -a humanitributary-staging                  # web, worker, release and router lines
heroku ps -a humanitributary-staging                           # dynos and their state
heroku releases -a humanitributary-staging                     # each deploy; heroku releases:output shows a release phase's log
heroku ps:scale worker=0 -a humanitributary-staging            # stop collection (1 starts it again; Basic: $7 a month)
heroku run python manage.py createsuperuser -a humanitributary-staging       # the owner types the password
heroku run python manage.py agent_token create <name> --scope <kind> -a humanitributary-staging
heroku pg:info -a humanitributary-staging                      # size against the plan's 10 GB
heroku run python manage.py publish --check -a humanitributary-staging       # the release gates, writing nothing
heroku run python manage.py publish -a humanitributary-staging               # a release in the S3 releases bucket
```

To deploy a branch to staging by hand (the dashboard's Deploy tab, "Manual deploy", does the same): `git push
https://git.heroku.com/humanitributary-staging.git <branch>:main`. The next automatic deploy of `main` replaces it.
To roll back, `heroku rollback -a humanitributary-staging` returns to the previous release's code and config; it
doesn't undo a migration.

Staging's database is the laptop's, moved on November 26, 2026 with the writers stopped: `pg_dump -Fc --no-owner
--no-acl` from the Docker Postgres, `heroku pg:reset`, then `pg_restore --no-owner --no-acl` (Postgres 16's client,
in Docker); every table's row count and the 15 audit triggers matched afterwards. The objects went across with
`aws s3 sync` (MinIO → S3, every `raw_path` the database names present). Nothing else is imported without the
owner's say. `heroku pg:backups` lists the daily backups (and `capture` takes one now); restore one with `heroku
pg:backups:restore <id> DATABASE_URL`, which replaces the database, schema and data together.

## Is it healthy?

Read these, in this order. Most of it is also in the [operations console](operations-console.md) (`/ops/` on the
data host, for staff; the admin's header links to it): its Dashboard says in one line whether anything is wrong,
and its Jobs, Runs (with each run's log), Work, Releases and Docs pages hold the rest. Staff with the `ops_operator` permission can
also act from it (run or retry a job, pause one, free a lease, requeue or cancel tasks, advance the wave, publish,
roll back), each confirmed, with a reason, and recorded as an OpsAction; the commands below do the same from a shell.

| Where | What it tells you |
|---|---|
| `/ops/` (the operations console) | The Dashboard: "All good" or the problems, one per line; the last 24 hours of runs as a run graph; failed runs needing attention (with Retry); what runs next; waiting, in progress and stuck per agent queue. Pointing at a run's bar (or a square of a ten-run strip), or focusing it, shows its run card: what started it, its runtime against the job's usual one, where its time went, its counts and error. Then Jobs (tags, schedule, the last ten runs), Runs (each with its log), Work, Releases and Docs, and the action log. Staff only; acting needs `ops_operator`. |
| `/healthz` (http://127.0.0.1:8000/healthz while `make up` or `make serve` runs; on staging, the app's URL + `/healthz`) | JSON from `infra/health.py`: the database, both stores and `storage_backend` (`local` when hosted means the dyno's throwaway disk), the latest release's version, each job's state, judged by each of its feeds' last finished runs as the console's Needs attention is (`failing` when one of them failed, `ok`, `never_run`, `paused`, with who paused it and why, or `dismissed` when every one that failed was dismissed from the console, with the run, who and when: [ADR 0039](../adr/0039-dismiss-a-failed-run.md)), last run, last run that finished ok or partial, last status and consecutive failures (the worst feed's; a dismissal doesn't reset it), `failing_jobs`, `paused_jobs` and `dismissed_jobs` (a paused or dismissed job is never in `failing_jobs`; resumed, or failing again after the dismissal, it is again; a run being retried stays failing until the retry completes), and the queue (queued by kind, claimed, expired leases). An archived job ([ADR 0041](../adr/0041-archive-a-job.md)) is left out altogether: not in `jobs`, `failing_jobs`, `paused_jobs` or `dismissed_jobs`. 200 when the database and both stores answer, 503 otherwise; the job and queue figures never change the status code. |
| `make storage-status` | The storage backend, whether each bucket answers, and the `latest` pointer: its version, why it was written and by whom. |
| `manage.py unrated_domains [--json] [--limit N]` | The unrated domains queued and claimed tasks point at, with task and URL counts, whether a Publisher row exists, and an example: what the evidence-pack job won't fetch until someone reads their terms and rates them in the admin. No requests. |
| `manage.py evidence_coverage [--out var/]` | Evidence-pack coverage of the queued tasks ([ingestion](ingestion.md#evidence-packs)): per task kind, region and era, the share whose pack holds a non-Wikipedia page and the share that point at one a job may fetch; the unreadable hosts and reasons and the host health. No requests. `--out` writes `evidence-coverage-<date>.md` and `.json` (`var/` is gitignored): the input to a source-discovery round. |
| `make digest` (`manage.py digest`) | Open tasks by kind, the top `write_event` stories, `write_event` by branch, `verify_claim` reasons, new-branch signals, the fact base's and branch governance's sections, candidates by status, and every job's runs in the last 24 hours with the last three failed or partial errors. "No runs in the last 24 hours" means the schedule isn't running. `--sources` adds every feed and lookup adapter, on or off, with its publisher's policy, tier and disabled reason, plus the sources considered and skipped. |
| `uv run python manage.py facts report` | The fact base: record claims by status (corroborated, single source, contested, stale, unverified), by era and region, and what is due, broken, contested or blocking publication. `--brief` drops the tables. |
| `make schedule-status` | Whether launchd runs the ticks, and the last log lines. The worker's output is in the terminal that runs `make up`. |
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

A FetchRun also says what started it (`trigger`): `schedule` (with `scheduled_for`, when it became due), `manual`
(the console's "Run now", or `run_job` from the shell: `triggered_by` "shell") or `retry` (the console's "Retry",
with the failed run in `retry_of` and the `attempt`). The console's run cards show it
([ingestion](ingestion.md#the-job-runner), [ADR 0032](../adr/0032-run-cards-and-what-started-a-run.md)).

`manage.py run_jobs` prints "N run(s), M failed" and exits 0 either way. `manage.py run_job` exits with an error
when a run failed.

### Alerts

A job (on one feed, for a feed job) that fails `ALERT_AFTER_FAILURES` (3) runs in a row sends one email
(`infra/alerts.py`), on exactly that run: not again on the next failure, and a run that doesn't fail resets the
count (a run stopped because its job was archived, `stopped`, neither fails nor resets it). It is counted from FetchRun history, so nothing extra is stored. It goes to `ALERT_EMAILS`, or else to
Django's `ADMINS`; with neither set it is only a log line ("ALERT (no ALERT_EMAILS or ADMINS set): …"). In `dev`
the mail uses the console backend, so with `ALERT_EMAILS` set the message is printed in the run's output (the
worker's terminal or the day's log) instead of sent. Error text in the mail is masked like the logs. An alert that can't be sent is logged and
never stops the runner. A paused job never alerts (it runs only by hand, with `run_job`); once resumed, its failures
count as usual, so its next failure alerts if it reaches the threshold.

## Backups

Say it plainly: **there is no backup system.** Here is what exists.

| What | Where it lives | Survives |
|---|---|---|
| The database | The Docker volume `humanitributary-pg` | Stopping or recreating the container (`make db-stop`, `docker compose down`). It does not survive `docker compose down -v`, `docker volume rm` or losing the laptop. |
| Staging's database (the platform's data) | Heroku Postgres Essential-1 | Dyno restarts and deploys; a daily backup at 03:00 Chicago time, kept by Heroku (`heroku pg:backups`). No point-in-time rollback on Essential plans. |
| Content (branches, events, cites) | Postgres only, since the cutover ([ADR 0021](../adr/0021-the-cutover.md)) | Only what the volume survives. What was published is also in every release in the object store (`import_legacy <content.json>` loads one into an empty database), and the content as it was at the cutover is frozen in git (`archive/site-data/`), but anything written since and not yet released exists nowhere else. |
| Review state, Revisions, evidence checks, ratings set in the admin, the queue, ingest state, agent tokens | Postgres only | Only what the volume survives. |
| Raw documents and releases | The object store: the Docker volume `humanitributary-minio`, or `var/storage/` with `STORAGE_BACKEND=local` | The same as the database's volume. Nothing copies them elsewhere. Old `var/raw/` and `var/releases/` copies stay until you delete them. |
| Staging's raw documents and releases | AWS S3, `humanitributary-staging-raw` and `-releases` | Dyno restarts and deploys (nothing is on the dyno's disk). Nothing copies them elsewhere. |
| Logs, the release mirror | `var/`, gitignored | Nothing, but the mirror is rebuilt by `make release-pull`. |

There is no `pg_dump` target, no scheduled dump and no copy off the machine. If you need a copy now, a one-off
dump works while the database runs:

```bash
mkdir -p var/backups
docker compose exec -T db pg_dump -U humanitributary -Fc humanitributary > var/backups/humanitributary-$(date +%F).dump
```

Restore a dump into an empty database with `pg_restore`, schema and data together. A data-only restore runs into
the revision trigger, which refuses canonical rows written outside `revising()`. Never restore over the live
database while the worker or the schedule is running.

A lost `releases` store can be rebuilt from the database (see [Restore a release](#restore-a-release)). Lost raw
documents can't: Postgres keeps only their hashes and extracted text, so the page diffs in `verify_claim` payloads
skip them.

## Runbooks

### A job keeps failing

1. **Find the error.** After three failures in a row an alert names the job and carries the latest error.
   `make digest` shows the job's runs and the first line of the last failures, and `/healthz` its consecutive
   failures. The console's run page (`/ops/runs/<id>/`, from the Dashboard's "Needs attention" or the job's page)
   has the run's log, its counts and the error with its traceback; the admin's FetchRun list has the same error.
   `var/logs/run-jobs-<date>.log` (launchd) or the worker's terminal has what the run printed.
2. **Reproduce it.** `uv run python manage.py run_job <name>` runs it now, due or not; for a feed job add
   `--feed "<feed name>"` to run one feed. It takes the same lock, so if the worker or a launchd tick is running
   jobs it exits with "another run_jobs holds the lock". Options go in with `--opt key=value`. From the console, a
   failed run's "Retry" does the same in the worker (not for `link_health` or `second_source` within a day of their
   last run: they are not idempotent back to back), and "Pause" stops the schedule running it while you look.
3. **Read the cause.**

   | The error says | Usually |
   |---|---|
   | "interrupted (the runner exited before finishing)" | The process died mid-run (sleep, a killed shell, SIGKILL, Docker stopping). It runs again next time. |
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
   (`browser_read`). Documents already fetched stay in the `raw` store. If the terms also limit what we may keep
   (some ask for deletion within a time limit), that is a separate clean-up to plan.

[Sources and terms](sources-and-terms.md) explains the policy layers.

### Restore a release

What `publish/release.py` writes, in the `releases` store:

- `releases/<version>/content.json`: the snapshot. `<version>` is `YYYY.MM.DD.N`, where N counts that day's
  Release rows, skipping any number whose files a failed run left in the store.
- `releases/<version>/manifest.json`: the version, sha256 `content_hash`, `page_hash` (the built page's inputs),
  creation time, counts, `revision_high_water` (the last Revision included) and the release readers had before
  (`previous`).
- `releases/<version>/changes.json` and `changes.md`: the change report against that previous release.
- `releases/<version>/timeline.html`: the page the build gate built.
- `releases/latest.json`: the pointer, with the version, its hash and snapshot key, when and by whom it was
  written, why (`publish` or `rollback`) and the version before. It is the only object that is ever rewritten.
- A `Release` row with the same two hashes, the snapshot's key and the counts.

Nothing under `releases/<version>/` is changed after it is written (`infra/storage.py` raises `Immutable` on
different bytes). `publish` makes a new release only when the content's hash or the page's inputs' hash differs
from the newest Release row's (or with `--force`), and only when every gate passes; a change to `site/template.html`
or the build alone publishes as "page changed; content unchanged" ([publishing](publishing.md)).

To serve an earlier release:

```bash
uv run python manage.py publish --rollback <version>   # pick one from the admin's Release list
make build                                             # make release-pull, then the page from that release
```

`--rollback` refuses a version with no Release row, or whose snapshot is missing from the store or doesn't match
the row's hash; otherwise it rewrites `releases/latest.json` (reason `rollback`, actor `job:publish` unless
`--actor` says otherwise). `make release-pull` (`manage.py storage pull-release`) mirrors the pointer's version into
`var/releases/<version>/` and repoints `var/releases/latest`; `make build` runs it first. The console's Releases
page does the same ("Roll back to this", run by the worker as `human:<you>`), after showing the pointer now and the
release it would point at, its snapshot's hash checked.

This changes what readers get, not the database. The next `make publish` compares the database's content with the
newest Release row, not with the pointer.

- If neither the content nor the page has changed since that newest release, `publish` prints "Unchanged since
  <version> (content and page)" and leaves the pointer where you put it.
- If it has, `publish` runs the gates, writes a new version (its change report against the release you rolled back
  to) and points `latest` at it.

So to undo a change for good, fix the rows (for a branch operation, `manage.py branches revert <id>`), then
publish a new release. Releases only go forward.

If the `releases` store is lost, the database still produces the same bytes: `manage.py publish --force` writes
the current content as a new version, and its hash matches the old Release row's if nothing changed since. After
the database is reset, the day's counter starts again at 1, and `publish` skips any version already in the store.

> **Note:** a refusal (`publish refused:` and the failing gates) writes nothing. The usual causes: Node is missing
> (the build gate), the site's build rejects an entry (the build gate prints its `✗` lines: fix the row), or a
> published entry has a contested record claim its text doesn't flag. `manage.py publish --check` (`make
> roundtrip`) runs the gates without writing and prints what a release would add, change and retract.

## Changing it

| Change | What it needs |
|---|---|
| A different local tick | `StartInterval` in `ops/launchd/run-jobs.plist` and the comments in `ops/run-jobs.sh` and `ops/schedule.sh`, then `make schedule-install` again |
| A job's interval | Plain job: `ingest/job_defs.py`. Feed job: the Feed row in the admin, and `FEEDS` in `ingest/seed.py` for new databases |
| A new environment variable | `config/settings.py`, `.env.example`, and `scripts/make_env.py` if every developer needs it (today it adds only the storage keys to an existing `.env`) |
| A different worker tick | `WORKER_TICK_SECONDS` in `.env` or the environment; the code default is in `config/settings.py` |
| A new process | A line in the `Procfile`, the `make up` target if it should run locally, its size and count in `app.json`'s `formation`, `heroku ps:scale` on each app, and this chapter |
| A new `make` command | A target in the `Makefile` with a `## ` comment, so `make help` lists it, and `.PHONY` |
| A changed procedure (a command, a cap's default, a job, a step) | The procedure and the tables in `docs/manual/` too, in its STE rules (`make check-manual`; AGENTS.md rule 16) |
| A backup system | An ADR first: what is copied (the database and the `raw` store), where, how often, and how a restore is tested; then the Backups section |
| A new runbook | A `###` section under Runbooks, written from the code it depends on, with that code in `covers` |
