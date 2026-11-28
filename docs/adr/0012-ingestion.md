# 0012 — Ingestion: scheduled, deterministic collection into the agents' queue

**Status:** accepted (November 2026); amended by [0016](0016-object-storage.md); amended by [0019](0019-processes-and-release-gates.md); amended by [0022](0022-ingestion-tuning.md); amended by [0041](0041-archive-a-job.md) (archived jobs never run; a run of one stops at a safe point)

## Context

The timeline needs a steady supply of new material, current events first, then gaps in the last 500 years, then
deeper history, without a Claude session doing the searching. ADR 0003 settled that scheduled jobs are
deterministic and leave judgment to agents through the queue. This ADR is the collection side's design. What we
may fetch is in ADR 0013.

## Decision

**One entry point.** `manage.py run_jobs` runs whatever is due, in registry order (`ingest/job_defs.py`): set-up,
sources, entities, processing, upkeep. `manage.py run_job <name> [--opt k=v]` runs one now. A feed job runs once per
enabled `Feed` whose `config.job` names it, when its `next_run_at` has come. Any other job runs when its interval has
passed since its last run. Every run is a `FetchRun` with its job, feed, timings, status, counts and error; keys
are masked in errors and logs. A Postgres advisory lock (`pg_try_advisory_lock`) keeps two runners from
overlapping. A second runner exits at once. The lock dies with its connection, so a crash never leaves it stuck,
and runs a crashed process left `running` are closed as failed. A failing job never stops the next one.

| Job | Every | What |
|---|---|---|
| `seed_sources` | week | Publishers and Feeds (idempotent; keeps the owner's edits), and the terms verdicts once |
| `seed_branch_entities` | week | Branch → Wikidata items, exact matches only; the rest become `map_branch_entities` tasks |
| `portal` | hour | Wikipedia Current events, the last 3 days (late edits); `--opt days=30` backfills |
| `year_pages` | day | "<Year> in <Country>" for mapped country branches, 25 a run, rotating |
| `rss`, `who_don`, `federal_register`, `gazette`, `nobel` | 1–24 h | Official feeds (ADR 0013) |
| `historian_sync` | week | Office of the Historian Milestones TEI (for its lookup) |
| `refresh_entities` | day | Wikidata facts older than 30 days |
| `pageviews` | 6 h | Wikipedia pageviews for recent stories' articles (significance) |
| `process` | 15 min | Routing, duplicates, clusters, priority, `write_event` tasks, new-branch signals |
| `enrich_tasks` | hour | Lookup adapters' suggested sources added to queued `write_event` payloads |
| `link_health` | day | 200 cited URLs re-checked |
| `facts_sweep` | day | The fact base's sweep (ADR 0009): turns dead or changed links into stale claims and tasks |
| `branches_review` | week | Branch governance's rules (ADR 0011) |
| `second_source` | day | Suggested sources for Wikipedia-only claims → `verify_claim` tasks |

**Fetching.** Every request goes through `ingest.http.Fetcher`. It refuses whatever the source policy forbids, before
the request leaves the machine. It sends one request at a time, with a per-host delay and robots.txt's
Crawl-delay. It backs off on 429 and 5xx, honoring Retry-After, and sends conditional requests (ETag and
Last-Modified). It treats a CAPTCHA as blocking that host for the run. Raw bytes go to
`var/raw/<hash[:2]>/<hash>`. A `Document` holds the latest version of a canonical URL, and a `DocumentVersion`
holds each distinct hash.

**Pre-processing** is in Python and deterministic:

- canonical URLs (no tracking parameters; same-site rel=canonical);
- main text by trafilatura, and og:/schema.org metadata;
- language by a stopword vote, dates by dateparser;
- Wikipedia's wikitext parsed for bullets, wikilinks, external links and `<ref>` citations.

**Entities.** A wikilink resolves exactly: title → QID through the MediaWiki API (`WikiTitle`, redirects
followed), then three small SPARQL queries per 100 items (statements, labels, aliases). One combined query was
about 30× slower. The results are cached on `Entity` for 30 days. An entity's kind comes from a fixed class table
plus its facts. Text without links (feed items) is matched against known entity names: proper-noun n-grams,
ambiguity broken by mention count and then QID.

**Routing** (`ingest/routing.py`) works as follows.

- **Scores.** A branch's score is Σ role × weight × hit. Role is 1.0 for an item's own link, 0.5 for a context
  topic and 0.7 for a name match. Hit is 1.0 for the branch's own entity, 0.6 for something located in it
  (P17/P131) and 0.3 for a citizen (P27).
- **Date fit.** Only branches whose span contains the date count.
- **Year pages.** "<Year> in X" items get +1.5 for X's branch, found from the page's Wikidata country (P17).
- **Seeding.** `BranchEntity` rows are seeded by exact label or alias matches: confirmed by an article the branch
  cites, or unique among the search results of the expected kind. Member lists in a name ("Gulf states (Kuwait,
  …)") map each member. Everything uncertain becomes a task.

**Clusters.**

- **Portal items.** A portal item's cluster is its story: the deepest context topic it sits under, per calendar
  month (`topic:<QID>:<YYYY-MM>`). An item without a topic is a cluster of its own.
- **Other items.** A feed or year-page item joins the portal cluster that cites the same URL. Failing that, it
  joins the one sharing the most entities within ±2 days, where a polity counts half and 2.0 is needed.
- **Duplicates.** pg_trgm similarity (title, story topic, and `strict_word_similarity` of the event title in the
  item's text), taken inside the event's date window by precision. At ≥ 0.5 it gives `duplicate_of` and lowers the
  priority.

**Priority** (0–100, per cluster, documented in `ingest/process.py`):

  100 × (0.25·S + 0.10·T + 0.15·B + 0.15·C + 0.15·R + 0.20·P) × D

| Term | What it measures |
|---|---|
| S | independent sources: 1 − 0.6ⁿ |
| T | source tiers |
| B | branches touched |
| C | the Wikipedia category's weight |
| R | recency, with a 30-day half-life |
| P | pageviews of the story's article: log10(1 + views) / 6 |
| D | the duplicate penalty |

A cluster at or over the threshold (45), backed by Wikipedia (portal or year page), becomes a `write_event` task
(dedupe key `cluster:<key>`), refreshed while it is still queued. Its payload is everything an agent needs:

- the items with attribution;
- sources with tier and fetch policy, and excerpts of at most 25 words;
- entities with QIDs, coordinates and articles;
- suggested branches, date and title;
- possible duplicates;
- suggested sources from the lookup adapters (ADR 0013).

Candidates follow their task: claimed, then accepted (with `result_entry`) or rejected.

**Signals.** An unrouted polity, organization, event or movement that appears in ≥ 4 stories on ≥ 3 days in 60
days becomes a `new_branch_signal` candidate, carrying its entity. Branch governance's NEW-BRANCH rule reads these
(ADR 0011). A signal settles when a BranchEntity maps the entity.

**Link health** re-checks 200 citations a day, least recently checked first, round-robin across publishers. It never
checks NEVER_FETCH hosts, non-`allowed` publishers, or hosts that showed a bot wall in the last 14 days.

- **Wikipedia** is checked through the API, 50 titles at a time: a missing page is dead, and a redirect is a
  rename, not a breakage. Edits are not changes.
- **Other pages** get HEAD, with GET when needed, and a hash of the trafilatura text.
- **Results.** Dead links get a Wayback lookup. The citation keeps the latest result, and `LinkCheck` keeps the
  history.
- **Staleness.** Turning a dead link or a changed page into stale claims and `verify_claim` tasks is the fact
  sweep's job (ADR 0009), which runs right after. A link dead without a 4xx is recorded as 599 so the sweep sees it.

**Agents' side.** `manage.py digest` (Markdown: queue by kind, the top stories, branches, signals, the fact base's
and governance's sections, recent runs) is the first thing a session reads. Two skills drain the queue:
`.claude/skills/drain-write-events` and `verify-stale-claims` (with `verify-claims`).

**Schedule.**

- **Local.** A launchd agent (`make schedule-install`; `ops/launchd/run-jobs.plist`, `ops/run-jobs.sh`) runs every
  15 minutes. It starts Docker Desktop and the compose Postgres if needed, or logs a skip, and logs to `var/logs/`.
- **Hosted.** Heroku Scheduler runs `python manage.py run_jobs` every 10 minutes, unchanged. `var/raw/` is
  ephemeral on a dyno, so move raw storage to object storage before relying on it there. `INGEST_CONTACT` defaults to the project's repository.

## Consequences

- Re-running any job is safe:
  - candidates are keyed by `source_key` (an edited bullet keeps its candidate; a vanished one is rejected as gone);
  - tasks by `dedupe_key`;
  - seeding never overwrites review state.
- Tests replay recorded responses (`tests/cassette.py`, `tests/record_fixtures.py`). Nothing in the suite touches
  the network.
- The thresholds (45, 0.5, 2.0, 4 stories on 3 days) are first guesses, set on the first real ingestion. Change
  them in one place each and say why.

## Amendment note (November 2026)

The entity resolution above says three SPARQL queries "per 100 items". The code uses batches of 50
(`ingest/wikidata.py` `SPARQL_BATCH`), changed together with a 65-second query timeout (commit 81f575a);
the decision is otherwise unchanged. The text above is kept as written; this note records the change.

Where raw bytes live and how jobs run when hosted are now decided by [0016](0016-object-storage.md) (the `raw`
object store, not `var/raw/`) and [0019](0019-processes-and-release-gates.md) (a `worker` process running
`run_jobs --loop`, or Heroku Scheduler running `run_jobs`; the same locks either way).
