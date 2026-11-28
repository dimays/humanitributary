---
title: Architecture
summary: The whole platform in seven stages, from the sources it reads to the static page readers see, and where each stage lives in the code.
order: 10
covers:
  - config/*.py
  - Procfile
  - app.json
  - package.json
  - Makefile
  - docker-compose.yml
  - pyproject.toml
  - ingest/job_defs.py
---

The platform turns outside material (news feeds, Wikipedia pages, open archives) into a cited timeline that
anyone can read as a single static web page. Scheduled programs do the mechanical work of collecting and sorting;
Claude agents do the work that needs judgment, such as writing an event or checking a source; a database keeps
every fact, the evidence behind it and a record of every change. Readers never touch that database: they get a
frozen copy of it, published as files.

## The seven stages

```mermaid
flowchart LR
    S["1 Sources<br/>Publisher, Feed"] --> I["2 Ingest<br/>run_jobs, Document, Entity"]
    I --> T["3 Transform<br/>Candidate: route, match,<br/>cluster, prioritize"]
    T --> Q["4 Work queue<br/>AgentTask"]
    Q --> A["5 Agents<br/>skills over /api/agent/<br/>(the only LLM stage)"]
    A --> C["6 Canonical Postgres<br/>services, revising(), Revision"]
    C -- "facts sweep, link health,<br/>branches review" --> Q
    C --> P["7 Publish<br/>gates, Release in object storage"]
    P --> W["site/timeline.html"]
```

| Stage | What happens | Where | Chapter |
|---|---|---|---|
| 1. Sources | Who we read, how often, and under which terms | `ingest/seed.py`, `ingest/policy.py`, `evidence/publishers.py` | [Sources and terms](sources-and-terms.md) |
| 2. Ingest | Fetch, store by content hash, extract text, resolve Wikidata entities | `ingest/jobs.py`, `ingest/http.py`, `ingest/store.py`, `ingest/wikidata.py`, `infra/storage.py` | [Ingestion](ingestion.md) |
| 3. Transform | Turn items into candidates: route to branches, find duplicates, cluster, score | `ingest/routing.py`, `ingest/process.py` | [Ingestion](ingestion.md) |
| 4. Work queue | Tasks with everything an agent needs, leased one agent at a time | `work/` | [Work queue and agents](work-queue-and-agents.md) |
| 5. Agents | Claude sessions drain the queue through the agent API, which writes through the service layer | `.claude/skills/`, `agentapi/` | [Work queue and agents](work-queue-and-agents.md) |
| 6. Canonical Postgres and validation | The content, its evidence and its audit log; the daily and weekly checks that feed work back | `timeline/`, `evidence/`, `revisions/`, `governance/` | [Content model](content-model.md), [Revisions](revisions.md), [Evidence and fact-checking](evidence-and-fact-checking.md), [Branch governance](branch-governance.md) |
| 7. Publish | Release gates, then a versioned, immutable release in object storage, and the page built from it | `publish/`, `infra/storage.py`, `site/build.mjs` | [Publishing](publishing.md) |

How to run, schedule and repair all of this is in [Operations](operations.md) (and, as numbered procedures with
diagrams, in the Maintainer's Manual, [docs/manual/](../manual/README.md)), and staff watch it in the
[operations console](operations-console.md) at `/ops/`, where operators can also take a few audited actions; terms are in the
[glossary](glossary.md). Every table is in [the data model](../data-model.md).

## Stage 1: sources

A **Publisher** (in `evidence`, canonical) is a site we cite, by domain: a reliability `tier` from 1 to 4, a
license, a `fetch_policy` (`allowed`, `browser_only` or `forbidden`) and access notes that record its terms. A
**Feed** (in `ingest`) is something a job reads on a schedule: a URL, a publisher, an `interval_minutes`, an
`enabled` switch and a `config` whose `job` key names the job that reads it. The `seed_sources` job creates both
from `ingest/seed.py` (`PUBLISHERS`, `FEEDS`), and writes the terms verdicts (`VERDICTS`) into the publishers'
access notes once. After that it never overwrites a rating, a policy or a feed's `enabled` flag.

Sources come in two shapes.

| Shape | What it does | Sources on main |
|---|---|---|
| Feeds | Push new items into ingest | Wikipedia Current events portal (`portal`), "<Year> in <Country>" pages (`year_pages`), WHO Disease Outbreak News (`who_don`), Federal Register presidential documents (`federal_register`), The Gazette's state notices (`gazette`), Nobel Prize announcements (`nobel`) |
| Lookup adapters | Answer "find support for this claim" when a job asks | `ingest/lookup.py` `ADAPTERS`, in this order: Nobel, World Bank, Office of the Historian, Chronicling America, Library of Congress, Smithsonian, Europeana, OpenAlex, Crossref |

Two more feeds keep reference data fresh rather than bringing news: `refresh_entities` re-reads Wikidata facts, and
`historian_sync` copies the Office of the Historian's Milestones (public-domain TEI on GitHub) into Documents for
the Historian lookup adapter. It makes no candidates. The `rss` job has three seeded feeds (UN News, UN press
releases, UNESCO World Heritage), all disabled because their publishers are `browser_only`.

Each lookup adapter also has a Feed row (`config["job"] = "lookup"`). No job of that name exists: the row is only
the adapter's on/off switch. Smithsonian and Europeana stay off until their keys are in `.env`.

Some publishers are citation-only: we may cite their pages, but no job ever fetches them. `ingest/policy.py`
`NEVER_FETCH` lists Britannica, the Guardian, the BBC, NPR, Al Jazeera, AP and Olympedia, plus OpenStax, which is
never cited either. Publishers whose `fetch_policy` is `browser_only` (the UN, UNESCO, nobelprize.org and others)
are refused the same way. A person reads these in their own browser, never an agent with any tool
([ADR 0046](../adr/0046-the-owners-review-queue.md)). The decision and every verdict are in
[ADR 0013](../adr/0013-source-policy.md).

## Stage 2: ingest

`manage.py run_jobs` is the scheduler's one entry point. It runs every job that is due, once, in the order
`ingest/job_defs.py` registers them, under a Postgres advisory lock, so a second runner exits at once. The
`worker` process runs the same thing in a loop (`run_jobs --loop`, every `WORKER_TICK_SECONDS`), and between jobs
the actions staff queued from the operations console. A job can be paused (it is then never due). Each run of a job
(or of a job on one feed) is a **FetchRun** with its status, counts and error, and its log, a **RunLog** (INFO and
above, secrets masked, capped: `ingest/runlog.py`); a failing job is recorded and the
next one runs, and one that fails three runs in a row sends an alert (`infra/alerts.py`). How runs are scheduled
and watched is in [Operations](operations.md).

Every request goes through one client, `ingest.http.Fetcher`. Before a request leaves the machine it checks
`NEVER_FETCH`, the publisher's `fetch_policy` and robots.txt. It sends one request at a time with a per-host
delay, backs off on 429 and 503, and sends stored ETag and Last-Modified values so an unchanged page comes back
as 304.

What comes back is a **Document**, keyed by its canonical URL. The raw bytes go to the `raw` object store at
`raw/<hash[:2]>/<hash>` (their sha256), through `infra/storage.py`, never into the database or git. A different hash bumps the document's `version` and adds a
**DocumentVersion**. Extraction keeps what the source policy allows: wikitext for Wikipedia, and a short lead for
news, never the full article.

Entities come next. Wikilinks in Wikipedia text resolve exactly, title to Wikidata QID (`WikiTitle`), into
**Entity** rows that carry what routing needs: kind, coordinates, country (P17), located in (P131) and
citizenship (P27). News items have no wikilinks, so their names are matched against known entities instead.

## Stage 3: transform

Each item becomes a **Candidate**: a proposed event with a date guess, its entities and its documents. The
`process` job then works through the open candidates.

- **Routing.** `BranchEntity` maps Wikidata items to branches. A candidate's entities score each branch: an
  entity that is one of the branch's own (its country, faith or organization) counts most, a place in that
  country less, a person who is a citizen of it least. Only branches whose span covers the date score.
- **Duplicates.** Each candidate is compared with existing events by pg_trgm title similarity, inside a date
  window that depends on the event's precision.
- **Clusters.** Items about one story are grouped: portal items by their story's article within a month; news
  and year-page items by a URL the portal cites, or else by shared entities within a few days.
- **Priority.** A documented score from 0 to 100 per cluster (sources, tiers, branches touched, category,
  recency, pageviews, minus a duplicate penalty). A cluster over the threshold becomes a `write_event` task.
- **New-branch signals.** An entity that keeps appearing with no branch to route to becomes a
  `new_branch_signal` candidate.

The formulas and thresholds are in [Ingestion](ingestion.md) and
[ADR 0012](../adr/0012-ingestion.md).

## Stage 4: the work queue

An **AgentTask** is one piece of judgment work, with a `payload` that holds everything the agent needs: the
story's items, sources, entities with coordinates, suggested branches, possible duplicates and suggested sources.

| Kind | Queued by |
|---|---|
| `write_event` | `process`, for a cluster over the priority threshold (`enrich_tasks` then adds lookup hits to its payload) |
| `verify_claim` | `facts_sweep` (conflicts, dead or changed pages, due rechecks, Wikipedia-only events) and `second_source` |
| `map_branch_entities` | `seed_branch_entities`, for a branch with no exact Wikidata match |
| `review_branch_proposal` | `branches_review`, one per proposal |
| `audit` | `branches_review`, for a branch much thinner than its peers |
| `fill_gap` | `gap_waves`, for a window of a content wave in which a branch has no event or far fewer than its peers (`gap_pointers` then adds reading pointers) |

`work/models.py` also defines `enrich` and `recheck_citation`; no job queues them on main.

**Evidence packs.** Every 15 minutes `prefetch_sources` (`ingest/prefetch.py`, [ADR 0036](../adr/0036-evidence-packs.md))
fetches the pages a queued `write_event`, `fill_gap` or `verify_claim` task points at, from `allowed` publishers
only, stores their clean text privately in the `raw` store (deleted after `EVIDENCE_RETENTION_DAYS`), and adds
`evidence_pack` (ranked passages per page) and `unreadable` (what is left for a browser) to the payload. Agents
read the stored text over the API (`GET documents/<id>`), and `complete` refuses an excerpt that isn't on a stored
page ([Ingestion](ingestion.md#evidence-packs), [Work queue and agents](work-queue-and-agents.md#evidence-packs)).

A claim on a task is a lease: `POST /api/agent/tasks/claim` (or the owner's `manage.py tasks next --claim`) takes
the best task under `SELECT … FOR UPDATE SKIP LOCKED`, so agents working at once never get the same one. The lease lasts
`config/settings.py` `TASK_LEASE_MINUTES` (30 by default); after that another agent may take the task over. A
`dedupe_key` keeps one open task per kind and key, so re-running a job never doubles the work.

## Stage 5: agents

Agents are Claude sessions, and the only stage that calls a language model. Each skill in `.claude/skills/` drains
one kind of task: `drain-write-events`, `verify-claims` and `verify-stale-claims`, `review-branch-proposals`,
`fill-gaps`. A
session claims a task, does the reading, and completes the task with a JSON result. The owner's `manage.py digest`
gives the overview.

Agents work through the agent API under `/api/agent/` (`agentapi/`, served by the `web` process), never the
database ([ADR 0017](../adr/0017-agent-api.md)). An agent holds a token, made by the owner with `manage.py
agent_token create <name> --scope <kind>`, stored only as a hash and scoped to the task kinds it may claim; it
reads the base URL and the token from `HUMANITRIBUTARY_API` and `HUMANITRIBUTARY_API_TOKEN`. The queue endpoints
call `work.queue` unchanged. `complete` checks the result against its kind's JSON Schema (`agentapi/schemas.py`; a
422 lists the problems) and `agentapi/apply.py` applies it through the service layer inside
`revising("agent:<name>", task=task)`, completing the task in the same transaction, so each change links back to
its task and a failure leaves nothing behind. A token is rate-limited (`AGENT_API_RATE_PER_MINUTE`, 120).

What an agent writes lands in review. A new event (`write_event`, `audit`, `fill_gap`) is created as `review`; `verify_claim`
evidence goes through `record_evidence`, and a corrected text stays in the result (`proposed_text`), never applied;
an accepted branch proposal stores the agent's operations for the owner's `manage.py branches apply`;
`map_branch_entities` writes routing rows. Nothing a task's result writes is published. Since
[ADR 0035](../adr/0035-automated-daily-rounds.md) a round's own tokens may do the rest of a round over the same
API: with the `review` scope, check and apply an independent reviewer's edit file (`edits/check`, `edits/apply`:
`timeline/edits.py`, the same checks as `manage.py apply_edits`, and a reviewer never approves its own draft);
with `publish`, run the release gates and publish (`releases/check`, `releases/publish`: `publish/release.py`, under
the console's single-publish lock); with `round`, record the round (`work.Round`). Each such call is an audited
`OpsAction` as `agent:<name>`. The daily cloud routine follows the `run-round` skill; the console's operators pause,
skip or size it (`work/rounds.py`). The CLI (`manage.py tasks`, `facts record`, `branches apply`, `apply_edits`,
`publish`) stays for the owner.

Since the cutover ([ADR 0021](../adr/0021-the-cutover.md)) Postgres is the only record: an agent's event that the
owner publishes reaches readers with the next release, and nothing imports over it.

## Stage 6: canonical Postgres and validation

The `timeline` and `evidence` tables are canonical: what the page says and the evidence for it. They accept
writes only inside `revisions.revising(actor, reason, task)`. A Postgres trigger refuses any other write (ORM,
bulk update, raw SQL) and records every changed row, before and after, as a **Revision** with its actor and task.
The working tables in `ingest`, `work`, `governance` and `publish` are not audited. See
[Revisions](revisions.md) and [ADR 0006](../adr/0006-every-canonical-change-leaves-a-revision.md).

Four scheduled checks read the canonical tables and feed work back into the queue. This is the self-healing loop.

| Job | Interval (`ingest/job_defs.py`) | What it does |
|---|---|---|
| `link_health` | `DAY` | Re-checks cited URLs and records a `LinkCheck` for each |
| `facts_sweep` | `DAY`, right after `link_health` | Splits entries into atomic claims, recomputes each claim's status and confidence, schedules rechecks by claim type and entry age, records date conflicts from candidates, and queues `verify_claim` tasks |
| `branches_review` | `WEEK` | Measures every branch, runs the named rules (SPLIT-PLACE, SPLIT-TIME, MERGE-OVERLAP, END-STALE, NEW-BRANCH, THIN) and turns findings into proposals and tasks, with hysteresis |
| `gap_waves` | `DAY` | Measures every branch window by window in the content waves (W1 1925 to this year … W6 3500–1000 BCE) and queues the gaps as `fill_gap` tasks, at most `FILL_GAP_TASKS_PER_DAY` (40) new a day; the active wave moves back in time when it is nearly done |

The details are in [Evidence and fact-checking](evidence-and-fact-checking.md),
[Branch governance](branch-governance.md) and [Content waves](content-waves.md).

## Stage 7: publish

`manage.py publish` (`make publish`) exports every `published` entry as a **release** in the `releases` object
store: `releases/<version>/content.json` (the snapshot), `manifest.json`, the change report (`changes.json` and
`changes.md`: what was added, changed and retracted since the release readers had, by branch) and `timeline.html`
(the page built from the snapshot). It also writes a **Release** row: the version (`YYYY.MM.DD.N`), the sha256 of
the snapshot, the counts and the last Revision included. Nothing under `releases/<version>/` is ever overwritten.
`releases/latest.json` is the one object that moves: a pointer naming the version readers get. If the content hash
matches the newest release, nothing is written (unless `--force`). Same rows, same bytes:
[ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md), amended by
[ADR 0018](../adr/0018-single-source-marker.md) for keys derived at publish time, such as `singleSource` on an
event that rests on one independent witness, and by [ADR 0021](../adr/0021-the-cutover.md): a snapshot loaded into
an empty database exports to the same bytes again.

`publish` refuses unless every release gate in `publish/gates.py` passes
([ADR 0019](../adr/0019-processes-and-release-gates.md), [ADR 0021](../adr/0021-the-cutover.md)): two exports of
the same rows are identical (deterministic); the site's own build checks the snapshot, reads it back byte for byte
and builds the page (build); no published entry has an unflagged contested record claim (contested); and the change
report against the live release is computed and in the store before the pointer moves (report). `publish --check`
(`make roundtrip`) runs the gates, prints the change report's totals and writes nothing.

`make release-pull` (`manage.py storage pull-release`) mirrors a release into `var/releases/<version>/` and points
`var/releases/latest` at it; `make build` (`make build-release`) pulls, then builds the page, timeline.html in
`site/`, from the mirror: the only way the page is built. Rolling back is a pointer write: `manage.py publish --rollback <version>` repoints `latest.json` after
checking the snapshot's hash ([Operations](operations.md#restore-a-release)).

Publishing is run by hand, from Postgres alone, into whichever `releases` store the settings name: MinIO (or
`var/storage/` with `STORAGE_BACKEND=local`) locally, and on staging the S3 bucket `humanitributary-staging-releases`.
Staging publishes with `heroku run python manage.py publish` (Node is in its build for the build gate). Readers get
the page from the web process: `/` is the latest release's `timeline.html`, read from the `releases` store and kept in
memory by version, with the pointer re-read at most once a minute, so a publish or a rollback is live within a minute
and no request reads the database (`infra/site.py`, [ADR 0024](../adr/0024-the-app-serves-the-page.md)). The
`releases` bucket can become a CDN's origin later; the responses already carry cache headers.

## The legacy files, frozen

The content was first written as `TL.*` calls in JavaScript files and imported into Postgres until the cutover
([ADR 0021](../adr/0021-the-cutover.md)). The last import wrote nothing (the two held the same content), and the
files moved to `archive/site-data/`, where a test holds them unchanged. They are read only on request: `manage.py
import_legacy --archive` (`make import-archive`, for an empty database such as CI's), and
`scripts/validate_branch_rules.sh`. See [Publishing](publishing.md#the-loader-and-the-archive).

## What is deterministic and what isn't

| Deterministic: same input, same output | Judgment |
|---|---|
| Every job in `ingest/job_defs.py`: fetching, extraction, entity resolution, routing, duplicate matching, clustering, priority, lookup scoring, link health, the fact sweep, branch metrics and rules | Agents: writing an event, deciding whether a page supports a claim, deciding a branch proposal, mapping a branch's entities |
| Claim status and confidence (`evidence/confidence.py`), never typed in | The owner's edits in the admin (`human:<username>`) |
| The snapshot and the page built from it | |

No job calls a language model ([ADR 0003](../adr/0003-deterministic-jobs-and-an-agent-queue.md)). Anything that
needs judgment becomes a task.

## How it is wired

| File | Role |
|---|---|
| `config/settings.py` | `SITE_NAME`; `ENVIRONMENT` (`dev`, or anything else for production safety); `DATABASE_URL` (required); `VAR_DIR` (default `var/`), with `LOG_DIR` and `RELEASES_MIRROR_DIR` under it; the `raw` and `releases` storages (`STORAGE_BACKEND`, the `S3_*` variables); `TASK_LEASE_MINUTES`; `WRITE_EVENT_TASKS_PER_DAY` (20: the `process` job's daily cap on new `write_event` tasks); `FILL_GAP_TASKS_PER_DAY` (40: the `gap_waves` job's cap on new `fill_gap` tasks; `CONTENT_WAVES` and `GAP_RULES` may override `governance/waves.py`'s defaults; `GAP_RULES` sets `max_open_per_branch` to 2 from env `FILL_GAP_MAX_OPEN_PER_BRANCH`); `WRITE_EVENT_THRESHOLD` (70: the priority a story needs to become a `write_event` task; ADR 0027); `WORKER_TICK_SECONDS`; `ALERT_AFTER_FAILURES`, `ALERT_EMAILS` and the mail settings; `AGENT_API_RATE_PER_MINUTE`, and the heavy operations' per-token limits (`AGENT_API_EDITS_CHECKS_PER_HOUR` 20, `AGENT_API_EDITS_APPLIES_PER_HOUR` 6, `AGENT_API_RELEASE_CHECKS_PER_HOUR` 10, `AGENT_API_PUBLISHES_PER_DAY` 4; ADR 0035); `ROUND_SCHEDULE` (the daily round's cron, UTC, default `0 6 * * *`: the routine's own schedule repeated so the console can show it) and `ROUND_ROUTINE` (where it runs, shown on the Work page); `INGEST_CONTACT` and `INGEST_USER_AGENT`; `EVIDENCE_RETENTION_DAYS` (180) and `EVIDENCE_RETENTION_DAYS_OPEN` (365: openly licensed publishers), how long the evidence packs' stored text is kept (ADR 0036); the two lookup keys; `OPS_HOSTS` (the hosts that serve the operations console; empty, any); `PUBLIC_SITE_URL` (the public page, for the console's links to an entry on it; by default `https://` and `SITE_NAME` lower-cased, `.com`). Outside `dev`: TLS to the database, HTTPS redirect, secure cookies, HSTS (`SECURE_HSTS_SECONDS`), logs to stdout at `LOG_LEVEL` (with `httpx` and `httpcore` held at `WARNING`: they print every request's URL), and the local storage backend refused unless `STORAGE_BACKEND=local` is set. `INSTALLED_APPS` lists the apps in dependency order ([ADR 0002](../adr/0002-django-and-apps-by-responsibility.md)). |
| `config/urls.py` | The public page at `/` with `/images/*` and `/outlines.js` (`infra/site.py`), the brand files at the root of every host (`/favicon.ico`, `/favicon.svg`, the app icons, `/og-image.png`, `/site.webmanifest`: `infra/site.py` `BRAND_FILES`, from `site/brand/`), the admin (the owner's review screen; its tabs read "<page> · `SITE_NAME` administration"), the staff's operations console under `/ops/` (`opsconsole/`, [ADR 0028](../adr/0028-operations-console.md)), the agent API under `/api/agent/` and `/healthz`. The page never touches the database. |
| `infra/` | `storage.py` (the one door to object storage), `manage.py storage`, `health.py` (`/healthz`), `alerts.py`, and `site.py` (the public page, its images and outlines, the brand files, and the `www.` redirect). No models. |
| `opsconsole/` | The operations console: seven pages (Dashboard, New events, Jobs, Runs, Work, Releases, Docs). `queries.py` (every figure, aggregated in SQL), `newevents.py` (the New events feed, each item's steps derived in SQL from tasks, Revisions and releases), `views.py` (pages: staff only, GET only, `noindex`; actions: POST, CSRF, the `ops_operator` permission, two steps), `actions.py` (what each action checks, shows and does), `worker.py` (the worker's pick-up of queued actions), `docs.py` (the Markdown in `docs/` rendered and sanitized), `models.py` (`OpsAction`, the audit row of every action), templates, and the admin header's link to it. See [The operations console](operations-console.md). |
| `ingest/job_defs.py` | Every scheduled job with its interval and tags, in run order: set-up, sources, entities, processing, upkeep. A job's docstring opens with one plain sentence saying what it does: the console's description of it. |
| `Makefile` | The commands (`make help`): database and storage, publish, build (from a release), the release gates (`roundtrip`), tests, the docs' checks (`check-guide`, `check-adr`, `check-manual`) and the gate (`check-pr`), `brand` (the icons in `site/brand/`) and `card` (the link-preview card), processes, jobs, schedule; `import-archive` for an empty database. |
| `docker-compose.yml` | The local services: Postgres 16 on host port 5433, and MinIO (the local S3) on `127.0.0.1:9000`, its console on 9001. |
| `Procfile` | The processes: `release` runs migrations, `web` runs gunicorn (admin, agent API, `/healthz`), `worker` runs `manage.py run_jobs --loop`. `make up` runs `web` and `worker` locally with honcho. |
| `package.json` | No dependencies: it pins Node 24.x for `site/build.mjs` (the publish gates' build) on Heroku, whose `heroku/nodejs` buildpack reads it. |
| `app.json` | Heroku's description of the app: the `heroku/nodejs` and `heroku/python` buildpacks, the formation (`web` 1, `worker` 1, Basic), Postgres Essential-1 (16) and the config vars. Read by review apps and a rebuild from scratch, not by ordinary deploys. |
| `.github/workflows/check.yml` | CI: `make check-pr` on every pull request and push to main, with a Postgres 16 service container and `STORAGE_BACKEND=local`, no secrets. |
| `pyproject.toml` | Python 3.12, Django 6, psycopg 3, httpx, trafilatura, feedparser, dateparser, gunicorn, whitenoise, django-storages and boto3, jsonschema, Markdown and nh3 (the console's Docs page renders and sanitizes the docs); honcho and Pillow for development (Pillow draws the brand files: `make brand`, `scripts/build_brand.py`). |

The job order in `ingest/job_defs.py`:

| Group | Jobs |
|---|---|
| Set-up | `seed_sources`, `seed_branch_entities` |
| Sources | `portal`, `year_pages`, `rss`, `who_don`, `federal_register`, `gazette`, `nobel`, `historian_sync` |
| Entities | `refresh_entities`, `pageviews` |
| Processing | `process`, `entity_relations`, `enrich_tasks` |
| Upkeep | `link_health`, `facts_sweep`, `branches_review`, `second_source`, `gap_waves`, `gap_pointers`, `prefetch_sources` (last, so the tasks' sources and pointers are in) |

## Environments

| | Local | Staging (Heroku `humanitributary-staging`) | Production |
|---|---|---|---|
| Database | Postgres 16 in Docker on 5433 (`make db`): a development copy since the move | Heroku Postgres Essential-1, Postgres 16: the platform's data since November 26, 2026 (moved from the laptop), backed up daily | Heroku Postgres (at launch) |
| Raw documents and releases | MinIO in Docker on `127.0.0.1:9000` (`make db` creates the buckets), or `var/storage/<bucket>/` with `STORAGE_BACKEND=local` | AWS S3 (us-east-1): `humanitributary-staging-raw` and `-releases`, through a user limited to them | S3, its own buckets and user (at launch) |
| Processes | `make up`: `web` (gunicorn on 127.0.0.1:8000) and `worker` via honcho | The `Procfile`: `release` (`migrate`), one Basic `web` dyno at https://data.manyages.com, one Basic `worker` | The same `Procfile` (at launch) |
| Scheduled jobs | The worker while `make up` runs, and launchd every 15 minutes if installed (`make schedule-install`); the locks keep them from overlapping | The `worker` dyno: the only place jobs run | A `worker` dyno, or Heroku Scheduler running `run_jobs` |
| The page | timeline.html in `site/`, built from the mirror in `var/releases/` | https://manyages.com: the web process serves the latest release (`infra/site.py`) | The same app (it is production until a separate one exists); a CDN in front later |

The Heroku pipeline `humanitributary` holds staging now and production at launch
([ADR 0020](../adr/0020-heroku-hosting.md)). CI (`.github/workflows/check.yml`) runs the gate with a throwaway Postgres filled
from the frozen legacy files (`make import-archive`: the real content is in Postgres, not in git) and the local
storage backend; the test suite always swaps both storages for temporary directories (`tests/runner.py`), so
it never reaches MinIO, S3 or the network.

Staging runs the `Procfile` on Heroku with whitenoise for the admin's static files and `DATABASE_URL`,
`SECRET_KEY`, `ALLOWED_HOSTS`, the `S3_*` variables and the mail settings from config vars; how it is deployed is
in [Operations](operations.md#hosted-heroku). A dyno's disk can be thrown away, because nothing that isn't a row lives on it
([ADR 0016](../adr/0016-object-storage.md)). In every environment the database stays out of the page's read path:
the page is built from a release, so a database outage stops editing, never reading.

## Changing it

| Change | What it needs |
|---|---|
| A new stage or app | An ADR; the app in `INSTALLED_APPS` in dependency order; this chapter and its diagram |
| A new job | A function in `ingest/job_defs.py` with `@job(name, interval=…, tags=…)` in the right group and a one-sentence docstring; it must make no LLM calls; a test on recorded fixtures; [Ingestion](ingestion.md) |
| A new source | Its terms read first, its verdict in `ingest/seed.py` and [ADR 0013](../adr/0013-source-policy.md); [Sources and terms](sources-and-terms.md) |
| A new kind of judgment | A new `AgentTask.Kind` (a migration), the job that queues it with a complete payload, a result schema in `agentapi/schemas.py` and its applier in `agentapi/apply.py`, and a skill to drain it |
| A new canonical table | `audit_table()` in its migration (`tests/test_revisions.py` fails until it has one) |
| A new setting | `config/settings.py`, read from the environment, with a line in `.env.example` if a developer must set it |
| A new content field | `site/canonical.mjs`, `publish/content.py` `KEYS` and `site/SCHEMA.md` together ([ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md)); a field derived at publish time also goes in `ADDITIVE` ([ADR 0018](../adr/0018-single-source-marker.md)) |
| A new hosted environment (production) | An app in the `humanitributary` pipeline with its own Postgres, the config vars in [Operations](operations.md#hosted-heroku), `app.json` if the formation or add-ons differ, the CDN in front of the `releases` bucket (with its cache headers, not set yet); update the environments table |
