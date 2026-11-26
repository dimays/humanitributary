---
title: Architecture
summary: The whole platform in seven stages, from the sources it reads to the static page readers see, and where each stage lives in the code.
order: 10
covers:
  - config/*.py
  - Procfile
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
    Q --> A["5 Agents<br/>skills (the only LLM stage)"]
    A --> C["6 Canonical Postgres<br/>services, revising(), Revision"]
    L["site/data/*.js<br/>(until the cutover)"] -- "make import" --> C
    C -- "facts sweep, link health,<br/>branches review" --> Q
    C --> P["7 Publish<br/>Release snapshot"]
    P --> W["site/timeline.html"]
```

| Stage | What happens | Where | Chapter |
|---|---|---|---|
| 1. Sources | Who we read, how often, and under which terms | `ingest/seed.py`, `ingest/policy.py`, `evidence/publishers.py` | [Sources and terms](sources-and-terms.md) |
| 2. Ingest | Fetch, store by content hash, extract text, resolve Wikidata entities | `ingest/jobs.py`, `ingest/http.py`, `ingest/store.py`, `ingest/wikidata.py` | [Ingestion](ingestion.md) |
| 3. Transform | Turn items into candidates: route to branches, find duplicates, cluster, score | `ingest/routing.py`, `ingest/process.py` | [Ingestion](ingestion.md) |
| 4. Work queue | Tasks with everything an agent needs, leased one agent at a time | `work/` | [Work queue and agents](work-queue-and-agents.md) |
| 5. Agents | Claude sessions drain the queue and write through the service layer | `.claude/skills/`, `manage.py tasks` | [Work queue and agents](work-queue-and-agents.md) |
| 6. Canonical Postgres and validation | The content, its evidence and its audit log; the daily and weekly checks that feed work back | `timeline/`, `evidence/`, `revisions/`, `governance/` | [Content model](content-model.md), [Revisions](revisions.md), [Evidence and fact-checking](evidence-and-fact-checking.md), [Branch governance](branch-governance.md) |
| 7. Publish | A versioned, immutable snapshot, and the page built from it | `publish/`, `site/build.mjs` | [Publishing](publishing.md) |

How to run, schedule and repair all of this is in [Operations](operations.md); terms are in the
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
are refused the same way. Agents read these in a browser. The decision and every verdict are in
[ADR 0013](../adr/0013-source-policy.md).

## Stage 2: ingest

`manage.py run_jobs` is the scheduler's one entry point. It runs every job that is due, once, in the order
`ingest/job_defs.py` registers them, under a single Postgres advisory lock, so a second runner exits at once. Each
run of a job (or of a job on one feed) is a **FetchRun** with its status, counts and error; a failing job is
recorded and the next one runs. How runs are scheduled and watched is in [Operations](operations.md).

Every request goes through one client, `ingest.http.Fetcher`. Before a request leaves the machine it checks
`NEVER_FETCH`, the publisher's `fetch_policy` and robots.txt. It sends one request at a time with a per-host
delay, backs off on 429 and 503, and sends stored ETag and Last-Modified values so an unchanged page comes back
as 304.

What comes back is a **Document**, keyed by its canonical URL. The raw bytes go to `var/raw/` under their sha256
hash, never into the database or git. A different hash bumps the document's `version` and adds a
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

`work/models.py` also defines `enrich` and `recheck_citation`; no job queues them on main.

A claim on a task is a lease: `manage.py tasks next --claim` takes the best task under
`SELECT … FOR UPDATE SKIP LOCKED`, so agents working at once never get the same one. The lease lasts
`config/settings.py` `TASK_LEASE_MINUTES` (30 by default); after that another agent may take the task over. A
`dedupe_key` keeps one open task per kind and key, so re-running a job never doubles the work.

## Stage 5: agents

Agents are Claude sessions working in this repository, and the only stage that calls a language model. Each skill
in `.claude/skills/` drains one kind of task: `drain-write-events`, `verify-claims` and `verify-stale-claims`,
`review-branch-proposals`. A session starts with `manage.py digest`, claims a task, does the reading, writes, and
completes the task with a JSON result.

Agents write canonical rows only through the service layer (`timeline.services`, `evidence.services`,
`manage.py facts record`, `manage.py branches apply`) inside `revising("agent:<name>", task=task)`, so each change
links back to its task. An entry an agent writes straight to Postgres starts as `draft` or `review`; it becomes
`published` only through the publishing rule (`manage.py facts publish`).

Until the cutover, a `write_event` agent usually writes the event into `site/data/*.js` and runs `make import`
instead. The import creates new entries as `published`, so this path skips the publishing rule. It is used because
the next import (`--retract-missing`) would retract a published entry that exists only in Postgres.

> **Pending: parity branch.** An agent API is coming; update this section when it merges.

## Stage 6: canonical Postgres and validation

The `timeline` and `evidence` tables are canonical: what the page says and the evidence for it. They accept
writes only inside `revisions.revising(actor, reason, task)`. A Postgres trigger refuses any other write (ORM,
bulk update, raw SQL) and records every changed row, before and after, as a **Revision** with its actor and task.
The working tables in `ingest`, `work`, `governance` and `publish` are not audited. See
[Revisions](revisions.md) and [ADR 0006](../adr/0006-every-canonical-change-leaves-a-revision.md).

Three scheduled checks read the canonical tables and feed work back into the queue. This is the self-healing loop.

| Job | Interval (`ingest/job_defs.py`) | What it does |
|---|---|---|
| `link_health` | `DAY` | Re-checks cited URLs and records a `LinkCheck` for each |
| `facts_sweep` | `DAY`, right after `link_health` | Splits entries into atomic claims, recomputes each claim's status and confidence, schedules rechecks by claim type and entry age, records date conflicts from candidates, and queues `verify_claim` tasks |
| `branches_review` | `WEEK` | Measures every branch, runs the named rules (SPLIT-PLACE, SPLIT-TIME, MERGE-OVERLAP, END-STALE, NEW-BRANCH, THIN) and turns findings into proposals and tasks, with hysteresis |

The details are in [Evidence and fact-checking](evidence-and-fact-checking.md) and
[Branch governance](branch-governance.md).

## Stage 7: publish

`manage.py publish` (`make publish`) exports every `published` entry to
`var/releases/<version>/content.json`, with `var/releases/<version>/manifest.json` beside it and a **Release**
row: the version (`YYYY.MM.DD.N`), the sha256 of the bytes, the counts and the last Revision included. If the
content hash matches the newest release, nothing is written (unless `--force`). `var/releases/latest` is a symlink to the newest version.
`make build-release` builds the page, timeline.html in `site/`, from it. Same rows, same bytes:
[ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md).

Publishing is run by hand. Nothing on main deploys the page.

What main has as gates is per entry: the publishing rule decides which entries may be `published`, and only those
reach a snapshot. Rolling back means pointing `var/releases/latest` at an earlier version and rebuilding the
page by hand; no command does it ([Operations](operations.md#restore-a-release)).

> **Pending: parity branch.** Release gates (checks a release must pass before it goes out), object storage for
> snapshots, and rollback by repointing the served release; update this section when it merges.

## The legacy path

Until the cutover, `site/data/*.js` is still where most content is edited. `make import` dumps it
(`node site/build.mjs --dump-json var/legacy.json`) and upserts it into Postgres as `job:import_legacy`,
writing only what changed. The import never overwrites review state: an entry's status, a publisher's rating,
check results, evidence stance. `make roundtrip` proves that the import and the export are exact inverses. See
[ADR 0001](../adr/0001-postgres-is-the-truth-the-site-reads-snapshots.md) and [Publishing](publishing.md).

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
| `config/settings.py` | `SITE_NAME`; `ENVIRONMENT` (`dev`, or anything else for production safety); `DATABASE_URL` (required); `VAR_DIR` (default `var/`), with `RAW_DIR`, `RELEASES_DIR` and `LOG_DIR` under it; `TASK_LEASE_MINUTES`; `INGEST_CONTACT` and `INGEST_USER_AGENT`; the two lookup keys. `INSTALLED_APPS` lists the apps in dependency order ([ADR 0002](../adr/0002-django-and-apps-by-responsibility.md)). |
| `config/urls.py` | The admin only, the owner's review screen. There is no public web surface. |
| `ingest/job_defs.py` | Every scheduled job with its interval, in run order: set-up, sources, entities, processing, upkeep. |
| `Makefile` | The commands (`make help`): database, import, publish, build, round trip, tests, jobs, schedule. |
| `docker-compose.yml` | The local Postgres 16, on host port 5433. |
| `Procfile` | Heroku: `release` runs migrations, `web` runs gunicorn. |
| `pyproject.toml` | Python 3.12, Django 6, psycopg 3, httpx, trafilatura, feedparser, dateparser, gunicorn, whitenoise. |

The job order in `ingest/job_defs.py`:

| Group | Jobs |
|---|---|
| Set-up | `seed_sources`, `seed_branch_entities` |
| Sources | `portal`, `year_pages`, `rss`, `who_don`, `federal_register`, `gazette`, `nobel`, `historian_sync` |
| Entities | `refresh_entities`, `pageviews` |
| Processing | `process`, `enrich_tasks` |
| Upkeep | `link_health`, `facts_sweep`, `branches_review`, `second_source` |

## Environments

| | Local | Staging | Production |
|---|---|---|---|
| Database | Postgres 16 in Docker on 5433 (`make db`) | none yet | Heroku Postgres (planned) |
| Raw documents and snapshots | `var/` on disk | none yet | object storage (planned) |
| Scheduled jobs | launchd, every 15 minutes (`make schedule-install`) | none yet | Heroku Scheduler, `python manage.py run_jobs` every 10 minutes (planned) |
| The page | timeline.html in `site/`, opened locally | none yet | a CDN serving a release's files (planned) |

Main runs locally only. The layout is Heroku-ready (the `Procfile`, whitenoise for the admin's static files, and
`DATABASE_URL`, `SECRET_KEY` and `ALLOWED_HOSTS` from config vars), but nothing is deployed. In every
environment the database stays out of the page's read path: the page is built from a snapshot, so a database
outage stops editing, never reading.

> **Pending: parity branch.** Object storage (MinIO locally) replaces `var/raw/` and `var/releases/`, a worker
> process joins `web` in the `Procfile`, and staging and production on Heroku get health checks and CI; update
> this section when it merges.

## Changing it

| Change | What it needs |
|---|---|
| A new stage or app | An ADR; the app in `INSTALLED_APPS` in dependency order; this chapter and its diagram |
| A new job | A function in `ingest/job_defs.py` with `@job(name, interval=…)` in the right group; it must make no LLM calls; a test on recorded fixtures; [Ingestion](ingestion.md) |
| A new source | Its terms read first, its verdict in `ingest/seed.py` and [ADR 0013](../adr/0013-source-policy.md); [Sources and terms](sources-and-terms.md) |
| A new kind of judgment | A new `AgentTask.Kind` (a migration), the job that queues it with a complete payload, and a skill to drain it |
| A new canonical table | `audit_table()` in its migration (`tests/test_revisions.py` fails until it has one) |
| A new setting | `config/settings.py`, read from the environment, with a line in `.env.example` if a developer must set it |
| A new content field | `site/canonical.mjs`, `publish/content.py` `KEYS` and `site/SCHEMA.md` together ([ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md)) |
| A deployment | The pending parity work above; update the environments table |
