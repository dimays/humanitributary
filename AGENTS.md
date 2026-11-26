# AGENTS.md — working on Humanitributary

Read this before changing anything. It's the short version of how the data
platform is put together and the rules that keep it that way. The why behind
each rule is in `docs/adr/`; every table, and how they connect, is in
`docs/data-model.md`. The product's name lives in one place,
`config/settings.py` `SITE_NAME` (plus this repo's README title, the page's
`<title>` and header in `site/template.html`): never write the name anywhere
else in code.

## What this is

An interactive, cited timeline of all history, from the Big Bang to today:
about 380 branches (peoples, states, faiths, ideas, cultures) and 5,400
events, every one cited. Postgres is the source of truth. Scheduled,
deterministic jobs collect material into a review queue; Claude agents drain
that queue when they run; `publish` writes a versioned static snapshot that
the single-file site is built from. The database is never in the page's
read path. Django 6, Python 3.12, uv, psycopg 3, Postgres 16 in Docker.

| Path | What |
|---|---|
| `site/` | The static site: `template.html`, `build.mjs` (builds `site/timeline.html` from `data/*.js`, or from a snapshot with `--from-json`; `--dump-json` writes the resolved content for import), `canonical.mjs` (the one content shape both directions share), `restructure.mjs`, `SCHEMA.md` (the content model and the citation rules), `images/` and `outlines.js` (inputs, kept beside the page), `globe-assets.json`, and the content tools (`build-outlines.mjs`, `fetch-images.mjs`, …). `data/*.js` is the legacy content, imported until the cutover (ADR 0001). |
| `config/` | Settings (`SITE_NAME`, `DATABASE_URL`, `VAR_DIR`, `TASK_LEASE_MINUTES`), URLs (the admin only), WSGI/ASGI. |
| `timeline/` | Canonical content: `Region`, `Entry` (the shared id namespace) with `Branch` and `Event`, `BranchLink`, `EventLink`, `Connection`, `Location`, `PaleoPin`, `Image`. `services.py` is the write path (`save_branch`, `save_event`, `apply_changes`, `place`); `dates.py` derives precision and exact dates from date text; `ordering.py` is the snapshot order (`Entry.sort_key`, a fractional index: ADR 0008). |
| `evidence/` | Canonical: `Publisher`, `Citation`, `Claim` (record claims and their atomic parts), `Evidence`. `confidence.py` computes status and confidence (independent witnesses: `independence.py`); `claims.py` splits entries into date, location, number and actor claims; `staleness.py` schedules rechecks; `conflicts.py` records disagreeing sources; `sweep.py` is `manage.py facts sweep`; `health.py` is `facts report`; `services.py` (`record_evidence`) and `publishing.py` (the publishing rule) are the agents' doors; every threshold is in `policy.py`. `publishers.py` holds the starting ratings for known publishers. See `docs/fact-checking.md`. |
| `revisions/` | The audit log. `revising(actor, reason, task)` (`context.py`) is the only door to canonical tables; the trigger in `sql.py` refuses writes without it and records every changed row (ADR 0006). `admin_mixins.py` runs admin edits as `human:<username>`. |
| `ingest/` | Collection, not canonical (ADR 0012): `Feed`, `FetchRun`, `Document` + `DocumentVersion`, `Entity` (Wikidata) + `WikiTitle`, `DocumentEntity`, `BranchEntity` (routing), `Candidate`, `LinkCheck`, `SuggestedSource`, `JobState`. `jobs.py` (registry, runner, lock) and `job_defs.py` (every job, in run order) behind `manage.py run_jobs` / `run_job`; `http.py` + `policy.py` (the one fetcher and the source policy, ADR 0013); `seed.py` (sources, terms verdicts); `sources_wiki.py` (Current events portal, "<Year> in X"), `sources_news.py` (WHO, Federal Register, Gazette, Nobel, permitted RSS, Office of the Historian); `wikidata.py`, `wikitext.py`, `extract.py`, `store.py`; `routing.py` (branch scores, BranchEntity seeding); `process.py` (duplicates, clusters, priority, write_event tasks, new-branch signals); `linkhealth.py`; `lookup.py` (open-API adapters) and `second_source.py`; `manage.py digest`. |
| `work/` | The agents' queue: `AgentTask`, `queue.py` (leases under `FOR UPDATE SKIP LOCKED`), `manage.py tasks`. |
| `governance/` | `BranchMetric`, `BranchProposal`, and `manage.py branches`: `metrics.py` (each branch's shape on the page's time scale), `rules.py` (SPLIT-PLACE, SPLIT-TIME, MERGE-OVERLAP, END-STALE, NEW-BRANCH, THIN), `thresholds.py` (every threshold), `review.py` (proposals, tasks, hysteresis), `operations.py` (apply and revert). See `docs/branch-rules.md`. |
| `publish/` | `Release`; the snapshot format (`content.py`: key order and a writer byte-compatible with `JSON.stringify`), `export.py` (Postgres → content), `legacy.py` (dump → Postgres), `release.py`, and the `import_legacy`, `publish` and `compare_content` commands. |
| `tests/` | The suite: import idempotency, the round trip, entry order, revision enforcement, the queue, dates, the fact base, branch governance and ingestion (`test_ingest.py` on recorded cassettes in `fixtures/ingest/`: `cassette.py` replays them, `record_fixtures.py` re-records). |
| `var/` | Gitignored: `legacy.json` dumps, `releases/<version>/` snapshots (`releases/latest` → newest), `raw/` fetched documents by content hash, `logs/` (the scheduled runs). |
| `ops/` | The local schedule: `run-jobs.sh` (start Docker/Postgres or skip, then `run_jobs`), `launchd/run-jobs.plist` (template), `schedule.sh` (install / uninstall / status). |
| `docs/adr/`, `docs/data-model.md`, `docs/fact-checking.md`, `docs/branch-rules.md` | Decisions (ingestion: 0012, source policy: 0013); the data model with an ER sketch; how claims are checked; the branch rules. |
| `scripts/` | `make_env.py`; `validate_branch_rules.sh` (replays the branch rules on the content before `data/90` and `data/91`). |
| `.claude/skills/` | Agent skills: `drain-write-events`, `review-branch-proposals`, `verify-claims`, `verify-stale-claims`. |

## Rules

1. **Postgres is the source of truth; the site reads snapshots.** The page is
   built from `var/releases/<version>/content.json`, never from a live query.
   Never edit a snapshot (or `site/timeline.html`) by hand: change the rows,
   then `manage.py publish`. Until the cutover, `site/data/*.js` is also
   edited by the content agents; bring changes in with `make import`
   (idempotent) rather than by editing rows to match. (ADR 0001)
2. **Every canonical write goes through the service layer and leaves a
   Revision.** Timeline and evidence tables accept writes only inside
   `revisions.revising("agent:<name>" | "human:<username>" | "job:<command>",
   reason=…, task=…)`; the database trigger refuses anything else (ORM, bulk
   `update()`, raw SQL) and logs each changed row before and after. Use
   `timeline.services` (it writes only real changes, so re-applying content
   leaves no Revision). Never drop, disable or bypass the trigger, and never
   write to `revisions_revision` yourself. A new canonical table gets
   `audit_table()` in its migration; `tests/test_revisions.py` fails until it
   does. (ADR 0006)
3. **Jobs are deterministic.** Scheduled jobs (scrapers, entity resolution,
   duplicate matching, branch metrics and proposal rules) make no LLM calls
   and give the same output for the same input. Judgment goes into an
   `AgentTask` for an agent to claim. A job that writes canonical rows runs as
   `job:<command>`. (ADR 0003)
4. **Agents work through the queue.** Claim with `manage.py tasks next --kind
   … --claim --agent agent:<name>`, finish with `tasks complete <id> --result
   file.json`, or hand it back with `tasks release` / `tasks fail`. Pass the
   task to `revising(…, task=task)` so its Revisions link to it. Extend a long
   lease with `tasks extend`; an expired lease may be taken over. (ADR 0003)
5. **Every fact has evidence.** Each statement the timeline makes is a
   `Claim` on an entry, backed by `Evidence` rows tying it to `Citation`s, each
   with a stance (supports, partial, conflicts, unrelated), who checked it and
   how. Claim status and confidence are computed (`evidence.confidence`),
   never typed in: corroborated means two independent publishers (Wikipedia
   counts once). Record what you read with `manage.py facts record` (it
   stamps the check and recomputes the claim); put new sources on the atomic
   parts (date, place, number, actor), since the import owns the record
   claim's citations. Excerpts are at most 25 words. A citation must be a page
   that was actually fetched and read, and must explicitly support the claim
   (`site/SCHEMA.md`, "Citation rules"). Only supporting evidence is published
   as a source. (ADR 0004)
6. **Never cite or fetch openstax.org.** Its terms forbid use of its
   textbooks by AI systems. The database refuses such a citation; its
   publisher is `forbidden`. Respect every publisher's `fetch_policy`: a
   `browser_only` site (Britannica, un.org, nobelprize.org …) is read in a
   browser by an agent, never by a job.
7. **Review state belongs to review.** The legacy import never overwrites an
   entry's status, a publisher's rating or notes, a citation's check results,
   or evidence stance and excerpts. Keep it that way in any new import.
8. **The snapshot format is one shape.** `site/canonical.mjs` and
   `publish/content.py` `KEYS` must match (a test checks); a snapshot exported
   from Postgres and a dump of the same content are byte-identical, and so are
   the pages built from them. A new content field changes both, and
   `SCHEMA.md`. (ADR 0007)
9. **Raw documents and secrets stay out of git.** Raw fetched bytes live in
   `var/raw/` by content hash; `.env` holds the local password. Never commit
   either, and never point anything at port 5432 (Postgres.app's): the local
   database is Docker's, on 5433.
10. **Don't run content-rewriting scripts casually.** `site/verify-geo.mjs
    --apply`, `apply-fixes.mjs --apply`, `fetch-images.mjs` and friends
    rewrite `site/data/`; run them only when that is the task.

11. **Publish through the rule.** An entry becomes `published` with
    `manage.py facts publish <slug>` (`evidence.publishing`): no contested
    claim unless its text says the sources differ, and no event without a
    non-Wikipedia source after the 14-day grace for current events. An
    override needs a reason, which is recorded. (ADR 0010)
12. **Branch structure changes come from proposals.** `manage.py branches
    review` (a job) proposes splits, merges, end dates and new branches by
    fixed rules; an agent or the owner decides each with `branches apply`
    (the operations run through the services and can be reverted with
    `branches revert`) or `branches reject`. Until the cutover apply with
    `--legacy-file`, or the next import undoes it. Thresholds live in
    `governance/thresholds.py`; changing one means bumping `RULES_VERSION`.
    (ADR 0011)
13. **Jobs fetch only what the source policy allows.** Every request goes
    through `ingest.http.Fetcher`, which refuses `NEVER_FETCH` hosts
    (`ingest/policy.py`: Britannica, OpenStax, the Guardian, BBC, NPR, AP,
    Al Jazeera, Olympedia), non-`allowed` publishers and anything robots.txt
    disallows, honors Crawl-delay and backs off. Never call `httpx`,
    `requests` or `urllib` directly in a job. From news-like feeds keep the
    headline, date, link and a short lead at most, never full text. A new
    source gets its terms read first, and its verdict (with the clause) goes
    in its Publisher's `access_notes` and ADR 0013. Keys come from `.env`
    only and never reach logs, errors or fixtures. Lookup hits are
    suggestions (`SuggestedSource`), never Evidence. (ADR 0013)

## Working

```bash
make env          # .env with a random local-only Postgres password (once)
make db           # Postgres 16 in Docker on localhost:5433 (starts Docker if needed)
uv sync
make migrate
make import       # node site/build.mjs --dump-json var/legacy.json, then manage.py import_legacy
make publish      # var/releases/<version>/content.json and releases/latest
make build-release   # site/timeline.html from the latest snapshot (make build: from data/*.js)
make roundtrip    # dump → import → publish → diff the JSON and both built pages
make test         # uv run python manage.py test (needs the database)
make check        # Django checks, missing migrations, the site's data validation
make serve        # the admin at http://localhost:8000/admin/ (manage.py createsuperuser first)

uv run python manage.py facts sweep      # the fact base's daily job: split claims, schedule rechecks, queue verify_claim tasks
uv run python manage.py facts report     # its health: corroborated / single source / contested / stale, by era and region
uv run python manage.py branches review  # the branch rules' weekly job: proposals + review_branch_proposal tasks
uv run python manage.py branches list    # open proposals (show / apply / reject / revert <id>)
```

Ingestion (ADR 0012):

```bash
uv run python manage.py digest                     # read this first: the queue by kind, top stories, signals, runs
uv run python manage.py run_jobs                   # whatever is due, once (make jobs); --list shows the registry
uv run python manage.py run_job portal --opt days=30          # one job now (backfill 30 days of Current events)
uv run python manage.py run_job year_pages --opt branches=senegal,france
uv run python manage.py run_job link_health --opt limit=200
make schedule-install   # launchd: run_jobs every 15 minutes (the owner decides; schedule-status / schedule-uninstall)
```

`facts sweep` (daily, right after `link_health`) and `branches review`
(weekly) run from the job runner as `facts_sweep` and `branches_review`;
`manage.py digest` includes `evidence.health.digest_section()` and
`governance.review.digest_section()`.

Writing canonical content from a shell (an agent with a task):

```python
from revisions import revising
from timeline import services

with revising("agent:claude-writer", reason="write_event from candidate 412", task=task):
    services.save_event("ww2-dday", branch="world-war-ii", y=1944.43, when="June 6, 1944",
                        title="D-Day landings in Normandy", text="…", imp=1, status="review")
```

New entries start as `draft`; only `published` ones reach a snapshot.
The tests run against the same Docker Postgres (Django creates a
`test_<your database>` database); the suite takes about 15 seconds. The full round
trip on the real content takes about 5 seconds when nothing changed (the
first import into an empty database, about 20).

Before opening a pull request, run `make check`, `make test` and, if anything
touching content, import or export changed, `make roundtrip`. Fill in the
template (`.github/pull_request_template.md`): what changed, any migration,
and how it was checked.

## Deploying

Not deployed yet. The layout is Heroku-ready: `Procfile` (release phase runs
migrations; web is gunicorn), whitenoise for the admin's static files,
`DATABASE_URL`, `SECRET_KEY` and `ALLOWED_HOSTS` from config vars
(`ENVIRONMENT=prod`). The `pg_trgm` extension is created by a migration
(allowed on Heroku Postgres). Scheduled jobs run there from Heroku Scheduler
as `python manage.py run_jobs` every 10 minutes (the same command as local
launchd; the advisory lock keeps runs from overlapping); move `var/raw/` to
object storage first (dynos are ephemeral); `INGEST_CONTACT` defaults to the GitHub repository. The public site is a separate static deploy of a
release's `timeline.html`, `images/` and `outlines.js` to a CDN (ADR 0001).

## Style

Python: standard library first, Django's ORM over raw SQL except where
Postgres does the job better (triggers, `SKIP LOCKED`, trigram matching), and
docstrings that say why. Content follows `site/SCHEMA.md` (American English,
dates as "April 12, 1861", neutral tone, attributed judgments). Commit
messages say what changed and why, and end with the co-author line.
