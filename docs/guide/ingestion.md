---
title: Ingestion
summary: How scheduled, deterministic jobs collect new material (Wikipedia, official feeds, Wikidata), turn it into scored candidates, and queue the best stories as write_event tasks for agents.
order: 30
covers:
  - ingest/**
  - "!ingest/migrations/**"
  - tests/test_ingest.py
  - ops/run-jobs.sh
  - ops/launchd/run-jobs.plist
---

Ingestion keeps the timeline supplied with new material, current events first. Scheduled jobs read a few trusted
sources, work out what each item is about and which branches it belongs to, group items into stories, and put the
stories that matter most in the agents' queue. No job makes a judgment call or an LLM call: the same input always
gives the same output, and the writing is left to agents
([ADR 0003](../adr/0003-deterministic-jobs-and-an-agent-queue.md), [ADR 0012](../adr/0012-ingestion.md)).

What jobs may fetch, and why, is its own chapter: [sources and terms](sources-and-terms.md). The tables these jobs
fill are described in [the data model](../data-model.md#ingest).

## The flow at a glance

1. A **source job** reads a feed (the Current events portal, a "<Year> in <Country>" page, an official API) through
   the one HTTP client, `ingest.http.Fetcher`.
2. It stores what it read as a `Document` (the raw bytes go to disk by content hash) and turns each item into a
   `Candidate`: a proposed timeline item with a title, a date guess and the Wikidata entities it mentions.
3. The **`process` job** routes each candidate to branches, checks it against existing events for duplicates,
   groups candidates into clusters (one cluster per story), and gives each cluster a priority from 0 to 100.
4. A cluster at or over the threshold becomes a `write_event` task. An agent claims it, writes the event, and the
   candidates follow the task's outcome.
5. Upkeep jobs re-check cited links, look for second sources, and raise signals for possible new branches.

Nothing here is canonical content. `ingest` tables are working state; only an agent (or the owner) writes events,
through the service layer.

## The job runner

[ingest/jobs.py](../../ingest/jobs.py) is the registry and the runner behind two commands:

| Command | What it does |
|---|---|
| `manage.py run_jobs` | Runs every job that is due, once, in registry order. `--only a,b` limits it; `--list` prints each job, its interval and when it is next due. `make jobs` runs it. |
| `manage.py run_job <name> [--feed F] [--opt k=v …]` | Runs one job now, due or not. A feed job runs for every enabled feed, or for the one named by `--feed` (an id or exact name, even a disabled one; the Fetcher still applies the source policy). `--opt` values are parsed as JSON when they can be. |

A **job** is a function `fn(ctx)` registered with `@job(name, interval=…, feed=…)`. Importing
`ingest/job_defs.py` registers them all, and the order of that file is the order `run_due` runs them.

**When a job is due.**

- A **feed job** (`feed=True`) runs once per enabled `Feed` whose `config["job"]` names it, when that feed's
  `next_run_at` is empty or has passed. After the run, `next_run_at` becomes now plus the feed's
  `interval_minutes` (the job's own interval is only a fallback).
- **Any other job** runs when its interval has passed since the start of its last finished `FetchRun`.

**One runner at a time.** `run_due` and `run_named` take a Postgres advisory lock (`pg_try_advisory_lock` on
`ingest/jobs.py` `LOCK_KEY`). A second runner finds it taken, prints "another run_jobs holds the lock; exiting" and
stops. The lock belongs to the database connection, so a crashed process never leaves it held. Once the lock is
taken, `close_interrupted()` marks any run still `running` as failed ("interrupted"), since nobody else can be
running.

**Every run is a `FetchRun`** with its job, its feed (if any), start and finish times, counts and errors. The job
gets a `Context`: the run, a `Fetcher`, the feed, the options, a `counts` counter and `error()`. `ctx.opt(key)` reads
a `--opt` value first, then the feed's `config`. The status is:

| Status | When |
|---|---|
| `ok` | The job returned and recorded no errors. |
| `partial` | The job returned but called `ctx.error()` at least once (one bad day or page doesn't stop the rest). |
| `failed` | The job raised. The exception and the last 3,000 characters of its traceback are recorded, and the next job still runs. |
| `running` | Still going, or left behind by a crash (closed as `failed` by the next runner). |

Each error is cut to 2,000 characters and the whole error field to 20,000. Errors and the one-line log per run pass
through `ingest.policy.mask_secrets`, so API keys never reach the database or the log
([keys](sources-and-terms.md#keeping-keys-out-of-logs-errors-and-fixtures)). A job that writes canonical rows
runs as `ctx.actor`, which is `job:<name>`.

### Every job, in run order

From `ingest/job_defs.py` (`DAY` = 1440 minutes, `WEEK` = 10080). For feed jobs the interval that matters is the
seeded feed's `interval_minutes` (`ingest/seed.py` `FEEDS`), shown in the third column.

| Job | Registry interval | Seeded feed interval | What it does |
|---|---|---|---|
| `seed_sources` | week | — | Publishers, Feeds and the terms verdicts ([sources and terms](sources-and-terms.md#what-seed_sources-writes)). |
| `seed_branch_entities` | week | — | Maps branches to Wikidata items by exact match; the rest become `map_branch_entities` tasks. |
| `portal` | 60 min (feed) | 60 min | Wikipedia's Current events portal, the last 3 days. |
| `year_pages` | day (feed) | 1 day | "<Year> in <Country>" pages, 25 a run. |
| `rss` | 60 min (feed) | UN News 60, UN press 120, UNESCO 1 week; all three seeded **disabled** | RSS / Atom feeds whose terms allow it. |
| `who_don` | 360 min (feed) | 360 min | WHO Disease Outbreak News. |
| `federal_register` | 360 min (feed) | 360 min | Federal Register presidential documents. |
| `gazette` | 720 min (feed) | 720 min | The Gazette (UK) state notices. |
| `nobel` | day (feed) | 1 day | Nobel Prize announcements. |
| `historian_sync` | week (feed) | 1 week | Office of the Historian Milestones (TEI on GitHub), for its lookup. |
| `refresh_entities` | day (feed) | 1 day | Re-reads Wikidata facts older than 30 days (`per_run` 2,000), then re-derives every entity's kind. |
| `pageviews` | 360 min | — | Wikipedia pageviews for recent candidates' stories. |
| `process` | 15 min | — | Routing, duplicates, clusters, priority, `write_event` tasks, new-branch signals. |
| `enrich_tasks` | 60 min | — | Lookup adapters' suggestions added to queued `write_event` payloads. |
| `link_health` | day | — | Re-checks 200 cited URLs. |
| `facts_sweep` | day | — | The fact base's sweep (`evidence/sweep.py`, [ADR 0009](../adr/0009-fact-base.md)); runs right after `link_health`. |
| `branches_review` | week | — | Branch governance's rules (`governance/review.py`, [ADR 0011](../adr/0011-branch-governance.md)). |
| `second_source` | day | — | Suggested second sources for claims only Wikipedia supports. |

The lookup adapters also have `Feed` rows (`config.job` = `lookup`), but no job is named `lookup`: those rows are
only on/off switches the adapters read.

### The schedule

Locally, a launchd agent runs `ops/run-jobs.sh` every 900 seconds (`ops/launchd/run-jobs.plist` `StartInterval`;
`make schedule-install`, `schedule-status`, `schedule-uninstall`). Each tick:

1. If Postgres answers on port 5433, go on. Otherwise start Docker Desktop if it isn't running (unless
   `INGEST_START_DOCKER=0`), waiting up to 2 minutes, then `docker compose up -d --wait db`.
2. If Docker, the database or `uv` isn't available, log "skipped: …" and exit 0, so launchd doesn't back off.
3. Run `uv run python manage.py run_jobs`, logging to `var/logs/run-jobs-YYYY-MM-DD.log`.

Ticks can't overlap because of the runner's lock.

> **Pending: parity branch.** A worker process takes over running jobs in the hosted setup; update this section
> (and the runner description above, if the entry point changes) when it merges.

## Fetching

Every request a job makes goes through `ingest.http.Fetcher` ([ingest/http.py](../../ingest/http.py)). Never call
`httpx`, `requests` or `urllib` directly in a job. Before a request leaves, the Fetcher checks the source policy
(NEVER_FETCH, the publisher's `fetch_policy`, robots.txt); that is explained in
[sources and terms](sources-and-terms.md#what-the-fetcher-checks-before-a-request). Here is what it does with
requests it allows:

- **One request at a time, politely.** Before each request it waits out the host's delay (`ingest/policy.py`
  `HOST_DELAY`, else `DEFAULT_HOST_DELAY` 1.0 s) or robots.txt's Crawl-delay for our token, whichever is longer
  (Crawl-delay capped at 30 s).
- **Backoff.** A 429, 502, 503 or 504 that isn't a bot wall is retried up to `max_retries` (3) times. The wait is
  `Retry-After` when it is a number (clamped to 1–60 s), else 2, 4, 8 s. Network errors are retried the same number
  of times with waits of 2, 4, 8 s (at most 30), then raise `FetchError`.
- **Timeouts.** 20 s by default; callers raise it where a service is slow (SPARQL 65 s, Library of Congress 90 s).
- **Conditional requests.** Pass `etag=` / `last_modified=` and the Fetcher sends `If-None-Match` /
  `If-Modified-Since`; a 304 comes back with `not_modified` true. The `rss` job stores the feed's ETag and
  Last-Modified on its `Feed` row for this.
- **Bot walls.** A response that looks like a CAPTCHA or challenge page is marked `blocked`, and its host (and the
  final host after redirects) is refused for the rest of the run.

The Fetcher counts its requests (`fetcher.requests`), which the runner adds to the run's counts.

## Storing what was fetched

[ingest/store.py](../../ingest/store.py) keeps documents:

- **Raw bytes** go to `var/raw/<hash[:2]>/<hash>` (sha256 of the bytes), written once through a temporary file.
  They never go into git or the database. For Wikipedia the raw bytes are the page's wikitext; for feed items they
  are a JSON record of the item (title, summary, link, date), not the publisher's page.
- **`Document`** holds the latest version of one canonical URL: fetch time, status, the hash and raw path, title,
  date, language, license, extracted text and a metadata JSON.
- **`DocumentVersion`** holds every distinct hash a document has had.

`save_document()` returns `new`, `changed` or `unchanged`. Unchanged bytes only move `fetched_at`. Changed bytes
bump `version`, set `changed_at` and add a `DocumentVersion`. The derived fields (title, text, metadata) are
rewritten either way, so a parser fix shows up on the next run without a content change. `touch_document()` records
a 304.

> **Pending: parity branch.** Raw storage moves from `var/raw/` to object storage (a dyno's disk is ephemeral);
> update this section when it merges.

## Pre-processing

Everything in [ingest/extract.py](../../ingest/extract.py) and [ingest/wikitext.py](../../ingest/wikitext.py) is a
pure function of its input, with no network.

**Canonical URLs** (`canonical_url`): https, lower-case host without "www." (and mobile Wikipedia mapped to the
desktop host), no fragment, no trailing slash, and no tracking parameters (`TRACKING_PARAMS`: `utm_*`, `fbclid`,
`gclid`, `ref` and others). A page's own rel=canonical wins when it points at the same site.

**HTML pages** (`extract_html`): main text by trafilatura (no comments or tables, precision over recall), plus
og:, twitter:, article: and schema.org metadata, the title, rel=canonical, `<html lang>` and outbound links (up to
200). Dates come from the metadata, else trafilatura, and are parsed by dateparser (`parse_date`). Language without
a `lang` attribute is a stopword vote among six languages (`guess_language`: at least 8 words and 3 stopword hits).

**Short text** for payloads: `lead()` keeps the first 60 words (news items keep no more), `excerpt()` the first 25
(what a task payload may quote), and `text_hash()` hashes whitespace-normalized text so layout changes don't count as
content changes.

**Wikitext** (`ingest/wikitext.py`) is read just far enough for the portal and year pages: bullets as a tree with
their depth and the heading they sit under (a bold `'''Category'''` line or a `==` section, `===` as the
subheading), wikilinks (with file, category and other namespaces skipped), external links, `<ref>` citations (the
`cite` template family's url, title, website, work, publisher, date and language), and the plain text a reader sees.
Templates other than citations are dropped.

## The sources

### The Current events portal

`sources_wiki.run_portal` reads "Portal:Current events/<YYYY> <Month> <D>" for the last `days_back` days (3, because
editors fix recent days late), or `--opt days=30` for a backfill. Pages come through the MediaWiki API, 50 titles a
request, redirects followed. A day whose revision id matches the stored document is skipped (unless
`--opt reparse=true`).

Each day is one `Document`. A bullet is a news **item** if it cites an external link, or if it is a leaf with at
least 6 words; other bullets are story headings. An item's **topics** are the wikilinks of the bullets above it,
and its story topic is the last of those (the closest heading). Each item becomes a `new_event` candidate with
day precision, its category, topics, links, external links, and the CC BY-SA attribution.

**Stable keys.** A candidate's `source_key` is `portal:<date>:<hash of its text>`. When an item is lightly edited
(at least 85 % similar by `difflib`), it keeps its old candidate. A queued candidate whose item has left the page is
rejected and marked `gone`.

### "<Year> in <Country>" pages

`run_year_pages` picks, for each continuing branch, its highest-weight `BranchEntity` that is a polity with an
English article, and tries "<year> in X" and "<year> in the X". It reads `per_run` (25) branches a run, rotating
through them with an offset stored in the feed's `cursor`; `--opt branches=senegal,france` picks branches instead.

Only bullets under the Events section count. An item's date comes from its own text ("18 January – …" or
"January 18 – …"), else the date-only bullet above it, else the month subheading (month precision). Items with
fewer than 4 words are skipped. The page maps to branches through Wikidata: the page's item, its country (P17),
then the branches mapped to that country; failing that, the branch that was searched. Keys are
`year:<page title>:<hash>`.

### Official feeds

`ingest/sources_news.py` handles the feeds whose terms allow automated reading. A `NewsWriter` turns each item into
a `Document` and, when it has a date, a candidate keyed `news:<canonical url>`. It keeps the headline, date, link
and a lead of at most 60 words from the feed itself, never an article's full text. Items older than `max_age_days`
are skipped. Entities come from the alias matcher (below), since feed text has no wikilinks.

| Job | Reads | Limits |
|---|---|---|
| `rss` | Any RSS/Atom feed, with a conditional GET | `max_items` 80; `headline_only` drops the summary; `max_age_days` 7 |
| `who_don` | WHO's Disease Outbreak News OData API, newest first | 30 items; 30 days |
| `federal_register` | Federal Register API, one document type (`PRESDOCU`) | 40 items; 14 days |
| `gazette` | The Gazette's Atom data feed | 100 a page; only notice codes starting with "11" (state notices) |
| `nobel` | Nobel Prize API v2, this year and last | laureates' prizes once awarded; age limit at least 800 days |
| `historian_sync` | 19 Milestones TEI chapters from GitHub (raw files) | stores each section as a `Document`; no candidates |

The Nobel job builds each prize's nobelprize.org link for the candidate but never fetches it (the site is
`browser_only`).

## Entities

[ingest/wikidata.py](../../ingest/wikidata.py) turns Wikipedia titles into Wikidata items, stored as `Entity` rows.

**Titles to QIDs, exactly.** `resolve_titles` asks the MediaWiki API for each title's `wikibase_item`, 50 titles a
request, following redirects. Every answer is cached as a `WikiTitle` row (an empty QID means no page or no item).
A cached title is fresh for `ENTITY_TTL_DAYS` (30) when it has a QID and `MISSING_TTL_DAYS` (7) when it doesn't.
Nothing is guessed: a title either resolves or it doesn't.

**Facts by SPARQL.** `fetch_entities` reads items from the Wikidata Query Service in batches of `SPARQL_BATCH` (50),
with three small queries per batch: statements (`PROPS`: P31, P17, P131, P27, P625, P585, P580, P582, P571, P576,
P297), English label, description and article, and English aliases. One combined query was about 30 times slower.
It keeps up to 20 values per property, 12 aliases, and Earth coordinates only. Entities are re-read after
`ENTITY_TTL_DAYS`.

**MediaWiki API calls** (`api_get`) send `maxlag=5` and retry `maxlag`, busy, rate-limit, read-only and internal
errors up to 4 times, waiting 5, 10, 20, 40 s (at most 60).

**Kinds** (`kind_of`) come from a fixed class table, so they are deterministic:

1. A `CONCEPT_CLASSES` class (currency, calendar month, …) makes it a `concept`, unless it is also a polity or person.
2. Otherwise the first kind in `KIND_ORDER` (person, polity, event, org, work, place) whose `KIND_CLASSES` contains
   one of its P31 classes.
3. Otherwise from facts: citizenship (P27) → person; point in time or start (P585, P580) → event; coordinates
   (P625) → place; else concept.

`refresh_entities` re-derives every kind from stored facts after each run, so a change to the class table applies
to all entities without new requests.

**Text without links** (feed items) is matched by `ingest.candidates.AliasMatcher`: proper-noun n-grams of 1 to 6
words (the first word capitalized) looked up in the labels and aliases of known person, polity, place, org and event
entities, with names of at least 4 characters. An ambiguous name goes to the entity mentioned in the most
documents, then the lower QID number.

**Pageviews.** The `pageviews` job fills `Entity.pageviews_30d` (English Wikipedia user views over the last 30 full
days) for the story topics and the event, person and org entities of candidates from the last 45 days. A count is
fresh for `PAGEVIEWS_TTL_DAYS` (3); a run makes at most 400 requests (`--opt limit`).

## Routing

[ingest/routing.py](../../ingest/routing.py) decides which branches a candidate belongs to, through `BranchEntity`
rows: "this Wikidata item belongs to this branch, with this weight".

### How a candidate is scored

    score(branch) = Σ over the candidate's entities e:  role(e) × weight(BranchEntity) × hit(e → branch)

| Factor | Value | Constant |
|---|---|---|
| role: linked in the item itself | 1.0 | `ROLE_WEIGHT["item"]` |
| role: a context topic (the portal's parent bullets) | 0.5 | `ROLE_WEIGHT["topic"]` |
| role: a name matched in a feed item's text | 0.7 | `ROLE_WEIGHT["alias"]` |
| hit: e is one of the branch's own entities (the country itself) | 1.0 | `HIT_DIRECT` |
| hit: e is in a country (P17) or located in (P131) an entity of the branch | 0.6 | `HIT_IN_COUNTRY` |
| hit: e is a person whose citizenship (P27) is an entity of the branch | 0.3 | `HIT_CITIZEN` |

So a country beats a place in that country, which beats a citizen of it. People only route through citizenship;
everything else only through P17 and P131.

- **Date fit.** A branch scores only when the candidate's year falls inside its span, with a year's margin each
  side (an open-ended branch runs to next year). A 2026 item never routes to the Ottoman Empire.
- **Year pages.** Items from a "<Year> in X" page add `YEAR_PAGE_BOOST` (1.5) to each branch the page mapped to.
- **Result.** Scores are rounded to 3 places; zero scores are dropped. The top branch is the highest score, ties
  broken by slug. A branch counts as **touched** at `TOUCH_THRESHOLD` (0.6) or more (used by priority). The reasons
  (up to 8 per branch) are kept in the candidate's `details.routing`.

### How branches get their entities

`seed_branch_entities` maps branches that have no `BranchEntity` rows yet (or the ones named in `--opt branches=`),
skipping retracted ones. It only accepts exact matches:

1. **Name variants.** "Iran (Qajar to Islamic Republic)" also tries "Iran"; "Republic of Senegal" also tries
   "Senegal"; "A / B" tries both halves (`name_variants`).
2. Each variant is looked up as an English Wikipedia title (redirects followed: Wikipedia's own primary-topic
   decision). The item must not be a disambiguation page and must be of an expected kind.
3. An item the branch already cites (a Wikipedia article in its evidence) wins. Otherwise the first variant that
   is the full name, or any variant whose item is a polity or organization. (A concept's short name is too often
   another topic: "Ubuntu" is the operating system.)
4. **Members** listed in a name ("Gulf states (Kuwait, Bahrain, …)") each map, when their title is a polity, with
   role `member` and weight 0.8. The main match gets weight 1.0.
5. A branch with no match becomes a `map_branch_entities` task (dedupe key `branch:<slug>`, priority 1) with its
   variants and cited articles, for an agent to decide.

`confident_match` (matching Wikidata's entity search results) is only used when `seed_branch_entities` is called
with `search=True`, which the job doesn't do.

## The process job

[ingest/process.py](../../ingest/process.py) runs every 15 minutes over the queued and claimed candidates whose date
is within `WINDOW_DAYS` (60) (signals excluded). It writes only the routing, duplicate, cluster and priority fields
of a candidate, and only when they changed. In order: sync with tasks, route, find duplicates, cluster, prioritize,
queue tasks, raise signals.

### Duplicates of existing events

`event_duplicates` asks Postgres (pg_trgm) for the best match among events near the candidate's date. The
similarity is the greatest of:

- `similarity` of the event title and the candidate title;
- `similarity` of the event title and the candidate's story topic;
- `strict_word_similarity` of the event title within the candidate's text.

Events are taken within 1.5 years, then narrowed by the event's date precision (`PRECISION_WINDOW`: day 0.05 year,
month 0.15, year 1.0, else 1.5). A match at `DUP_THRESHOLD` (0.5) or more sets `duplicate_of` and `similarity` and
lowers the cluster's priority.

### Clusters: one per story

- **A portal item's cluster** is its story: `topic:<QID>:<YYYY-MM>`, the story topic's item within a calendar month.
  An item without a topic is a cluster of its own.
- **A feed or year-page item** joins the portal cluster whose item cites the same URL (the lowest-id one, if
  several). Failing that, it joins the portal candidate sharing the most entities within ±2 days, where a polity
  counts 0.5 and anything else 1.0, if that sum is at least 2.0. Otherwise it stands alone. How it joined is kept in
  `details.joined_by`.

### Priority

Each cluster gets one priority from 0 to 100, given to every member:

    100 × (0.25·S + 0.10·T + 0.15·B + 0.15·C + 0.15·R + 0.20·P) × D

| Term | Weight | What it is | How it's computed (`priority_parts`) |
|---|---|---|---|
| S | 0.25 | Independent sources | 1 − 0.6ⁿ, n = distinct publisher domains: wikipedia.org if a member is from the portal or a year page, every external link's domain, every feed item's publisher. |
| T | 0.10 | Source tiers | Mean of `TIER_WEIGHT` over those domains: tier 1 → 1.0, 2 → 0.8, 3 → 0.6, 4 → 0.3, unrated → 0.5 (0.5 with no domains). |
| B | 0.15 | Branches touched | Branches scoring ≥ 0.6 for any member, capped at 4, divided by 4. |
| C | 0.15 | Wikipedia category | The highest `CATEGORY_WEIGHT` among the members (below); 0.5 for a member without a listed category. |
| R | 0.15 | Recency | 0.5^(days since the newest member / 30): a 30-day half-life. |
| P | 0.20 | Pageviews | min(1, log10(1 + views) / 6), views = the story topic's 30-day pageviews, else the most viewed event, person or org in the cluster. |
| D | × | Duplicate penalty | 1 − 0.8 × similarity when the best duplicate similarity is ≥ 0.5, else 1. |

`CATEGORY_WEIGHT`: armed conflicts and attacks 0.9; politics and elections 0.8; disasters and accidents 0.8;
international relations 0.75; science and technology 0.7; health and environment 0.7; business and economy 0.6;
law and crime 0.5; arts and culture 0.5; sports 0.4.

**Worked example** (the case in `tests/test_ingest.py` `test_priority_formula`). One portal item from today, under
"Armed conflicts and attacks", citing one unrated site, touching one branch, whose story article had 50,000 views:

| Term | Value | Weighted |
|---|---|---|
| S | 1 − 0.6² = 0.64 (Wikipedia + the cited site) | 0.160 |
| T | (0.6 + 0.5) / 2 = 0.55 | 0.055 |
| B | 1 / 4 = 0.25 | 0.0375 |
| C | 0.9 | 0.135 |
| R | 1.0 | 0.150 |
| P | log10(50,001) / 6 ≈ 0.783 | 0.157 |

100 × 0.694 × 1 ≈ **69.4**, over the threshold. The same cluster 60 days later has R = 0.25 and scores about 58.

All the parts are stored in each candidate's `details.priority_parts`, so a priority can be explained.

### write_event tasks

A cluster becomes a `write_event` task when its priority is at least `WRITE_EVENT_THRESHOLD` (45, or
`--opt threshold=`) and at least one member comes from the portal or a year page (Wikipedia backs it). Clusters are
taken highest first, up to `MAX_TASK_UPDATES` (150) a run. The task's dedupe key is `cluster:<key>` and its
priority the rounded cluster priority, so re-running never duplicates it. While the task is still queued, its
payload and priority are refreshed (keeping any `suggested_sources` that `enrich_tasks` added).

The payload is everything an agent needs to write the event:

- `suggested`: the top 3 branches by summed score, date, precision, first and last dates, a title hint, branches
  to link;
- `items`: up to 12 members with their text (up to 1,200 characters), source and attribution;
- `sources`: up to 15 links with tier and `fetch_policy` (so the agent knows which to read in a browser), and an
  excerpt of at most 25 words for feed items;
- `entities`: up to 15, with QIDs, kinds, coordinates and Wikipedia links;
- `possible_duplicates`, `priority_parts`, the story article, and a pointer to `.claude/skills/drain-write-events`.

### Candidates follow their task

`sync_task_states` runs first on every pass. For each `write_event` task the job created:

| Task status | Its cluster's open candidates become |
|---|---|
| `claimed` | `claimed` |
| `done` | `accepted` (with `result_entry`) if the task's result names an existing entry, else `rejected`; only candidates created before the task finished |
| `failed` or `cancelled` | `queued` again (from `claimed`) |

### New-branch signals

An entity becomes a `new_branch_signal` candidate (key `signal:<QID>`) when, among the loaded candidates:

- it appears in at least `SIGNAL_MIN_CLUSTERS` (4) clusters on at least `SIGNAL_MIN_DAYS` (3) distinct days;
- no `BranchEntity` maps it;
- it is a polity, org or event (`SIGNAL_KINDS`), or one of its P31 classes is a movement (`MOVEMENT_CLASSES`).

Its priority is min(100, 8 × clusters + 4 × days). The signal carries its entity, which branch governance's
NEW-BRANCH rule reads ([branch governance](branch-governance.md)). A queued signal whose entity has since been
mapped is settled (rejected, with `details.settled`).

## Lookups and second sources

The lookup adapters ([ingest/lookup.py](../../ingest/lookup.py)) search open sources for material that may support
a claim or a story. A hit is only ever a suggestion (`SuggestedSource`), never evidence; which sources they are and
the terms behind them are in [sources and terms](sources-and-terms.md#lookup-adapters).

- **Relevance.** The share of the query's keywords (content words of the title and the first 3 entities' labels, up
  to 12) found in the hit's title and snippet, plus 0.15 when its year is within 2 years of the query's. A hit needs
  at least 2 keywords and `MIN_SCORE` (0.5). Adapters run in `ADAPTERS` order, each only when it applies (by year
  range or subject) and is enabled, and the search stops at `MAX_HITS` (3).
- **`second_source`** (daily) walks claims whose supporting evidence is all Wikipedia, 60 a run, from a bookmark in
  `JobState` "second_source" (wrapping around). Hits become `SuggestedSource` rows, and the top 5 go into a
  `verify_claim` task (dedupe key `claim:<id>`, priority 2), or into the open one the fact sweep already queued. It
  never writes Evidence or changes a claim's status.
- **`enrich_tasks`** (hourly) runs the same lookups for up to 30 queued `write_event` tasks that have no
  `suggested_sources` yet, highest priority first, and adds the hits to their payload.

## Link health

[ingest/linkhealth.py](../../ingest/linkhealth.py) re-checks the URLs we cite, `limit` (200) a day.

**Which citations.** Cited ones (with evidence), never checked first, then least recently checked, taken
round-robin across publishers so no host gets a burst. Skipped: NEVER_FETCH hosts, publishers whose policy isn't
`allowed`, and publishers with a `blocked` check in the last `BLOCKED_COOLDOWN_DAYS` (14).

**How each is checked.**

| Kind | Method | Outcomes |
|---|---|---|
| Wikipedia articles | MediaWiki API, 50 titles a request | Missing → `dead` (404). Redirect → `redirected` (a rename). Otherwise `ok`, with the revision id as the hash: edits are not changes. |
| Other pages | HEAD; if its ETag or Last-Modified matches the last check, `ok`. Otherwise GET, extract the main text and hash it | 404/410 → `dead`. A redirect to the site's home page → `dead`. 401/403/429, a bot wall or a policy refusal → `blocked`. Other 4xx/5xx and network errors → `error`. A different text hash from the citation's → `changed`. A new URL → `redirected`. |

An `error` after two earlier failed rounds in a row (three in all) becomes `dead`. A dead link gets a Wayback
Machine lookup (the availability API). Every check is a `LinkCheck` row; the `Citation` keeps the latest status,
hash, canonical URL and archive URL, written as `job:link_health`. A link dead without a 4xx is recorded with
status `UNREACHABLE` (599).

Turning dead or changed links into stale claims and `verify_claim` tasks is the fact sweep's job, which runs right
after ([evidence and fact-checking](evidence-and-fact-checking.md), [how claims are checked](../fact-checking.md)).

## The digest

`manage.py digest` (`make digest`) prints the Markdown a Claude session reads first: open tasks by kind, the top
`write_event` stories (`--top`, default 12), `write_event` tasks by top branch, `verify_claim` reasons and waiting
suggestions, new-branch signals, the fact base's and branch governance's own sections, candidate counts, and the last
24 hours of job runs with recent failures. `--sources` adds every feed (on or off, with its publisher's policy and
tier) and the sources considered and skipped (`ingest/seed.py` `SKIPPED`). If no run happened in 24 hours it says
so and points at `make schedule-status`.

## Tests

`tests/test_ingest.py` covers the whole pipeline with no network. `tests/cassette.py` replays recorded responses
from `tests/fixtures/ingest/` and fails loudly on any request not in the cassette; unknown robots.txt requests answer
404 (allow all). `tests/record_fixtures.py` re-records cassettes against the live services (not part of the suite).
Hand-made responses (`cassette.response`) cover what live services won't reliably show: 404s, CAPTCHAs, 503s.

## Changing it

| Change | What it needs |
|---|---|
| A threshold or weight (45, 0.5, 2.0, the priority weights, the signal counts) | Change the constant in `ingest/process.py` or `ingest/routing.py`, say why in the commit, and update this chapter and [ADR 0012](../adr/0012-ingestion.md). `test_priority_formula` restates the formula, so update it too. |
| A new job | A function in `ingest/job_defs.py` with `@job(name, interval=…)`, placed where it should run in the order. A feed job also needs a `Feed` row with `config.job` (add it to `ingest/seed.py` `FEEDS`). Add it to the table above and to ADR 0012. |
| A new source | Read its terms first ([adding a source](sources-and-terms.md#adding-a-source)), then a reader in `sources_news.py` or `sources_wiki.py` using `NewsWriter` or `upsert_candidate`, and a recorded cassette and test. |
| A new Wikidata property or kind class | `ingest/wikidata.py` `PROPS` or `KIND_CLASSES`; `refresh_entities` re-derives kinds on its next run. |
| A new field on an ingest model | A migration (these tables aren't canonical, so no `audit_table()`), and `docs/data-model.md`. |
| The candidate key scheme | Careful: a changed `source_key` makes every existing item look new and its old candidate look gone. |
