# AGENTS.md — working on Humanitributary

Read this before changing anything. It's the short version of how the data
platform is put together and the rules that keep it that way. How each part
works, from the code, is the technical guide (`docs/guide/`, starting at
`docs/architecture.md`); the why behind each rule is in `docs/adr/`; every
table, and how they connect, is in `docs/data-model.md`. The product's name lives in one place,
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
| `site/` | The static site: `template.html`, `build.mjs` (builds `site/timeline.html` from a release snapshot, `--from-json`, and nothing else; `--dump-json` writes it back for the build gate; `--archive` reads the frozen legacy files for `import_legacy --archive`), `canonical.mjs` (the one content shape), `restructure.mjs` (the legacy files' move / patch / merge), `SCHEMA.md` (the content model and the citation rules), `images/` and `outlines.js` (inputs, kept beside the page), `globe-assets.json`, and the globe tools (`build-globe.mjs`, `build-outlines.mjs`, `build-paleo-points.mjs`, reading a snapshot). |
| `archive/` | Frozen at the cutover (ADR 0021): `site-data/` (the legacy `TL.*` content files, held unchanged by a test) and `site-tools/` (the retired tools that rewrote them), with a README. Never edited. |
| `config/` | Settings (`SITE_NAME`, `DATABASE_URL`, `VAR_DIR`, the two object storages and `S3_*`, `TASK_LEASE_MINUTES`, `WORKER_TICK_SECONDS`, alerts, `AGENT_API_RATE_PER_MINUTE`, the daily caps `WRITE_EVENT_TASKS_PER_DAY` and `FILL_GAP_TASKS_PER_DAY`), URLs (the admin, `/api/agent/`, `/healthz`), WSGI/ASGI. |
| `timeline/` | Canonical content: `Region`, `Entry` (the shared id namespace) with `Branch` and `Event`, `BranchLink`, `EventLink`, `Connection`, `Location`, `PaleoPin`, `Image`. `services.py` is the write path (`save_branch`, `save_event`, `apply_changes`, `place`); `dates.py` derives precision and exact dates from date text; `ordering.py` is the snapshot order (`Entry.sort_key`, a fractional index: ADR 0008); `edits.py` is `manage.py apply_edits`, a reviewer's verdicts (and the branches, events and connections a review adds) applied as one audited, all-or-nothing edit file (ADR 0023, ADR 0025). |
| `evidence/` | Canonical: `Publisher`, `Citation`, `Claim` (record claims and their atomic parts), `Evidence`. `confidence.py` computes status and confidence (independent witnesses: `independence.py`); `claims.py` splits entries into date, location, number and actor claims; `staleness.py` schedules rechecks; `conflicts.py` records disagreeing sources; `sweep.py` is `manage.py facts sweep`; `health.py` is `facts report`; `services.py` (`record_evidence`) and `publishing.py` (the publishing rule) are the agents' doors; every threshold is in `policy.py`. `publishers.py` holds the starting ratings for known publishers. See `docs/fact-checking.md`. |
| `revisions/` | The audit log. `revising(actor, reason, task)` (`context.py`) is the only door to canonical tables; the trigger in `sql.py` refuses writes without it and records every changed row (ADR 0006). `admin_mixins.py` runs admin edits as `human:<username>`. |
| `ingest/` | Collection, not canonical (ADR 0012): `Feed`, `FetchRun`, `Document` + `DocumentVersion`, `Entity` (Wikidata) + `WikiTitle`, `DocumentEntity`, `BranchEntity` (routing), `Candidate`, `LinkCheck`, `SuggestedSource`, `JobState`. `jobs.py` (registry, runner, lock, the jobs' `TAGS`) and `job_defs.py` (every job, in run order, with its tags); `runlog.py` (each run's log, captured, masked and capped, kept as a `RunLog` for 30 days: ADR 0030) behind `manage.py run_jobs` / `run_job`; `http.py` + `policy.py` (the one fetcher and the source policy, ADR 0013); `seed.py` (sources, terms verdicts); `sources_wiki.py` (Current events portal, "<Year> in X"), `sources_news.py` (WHO, Federal Register, Gazette, Nobel, permitted RSS, Office of the Historian); `wikidata.py`, `wikitext.py`, `extract.py`, `store.py`; `routing.py` (branch scores by role, BranchEntity seeding and its `CORRECTIONS`); `process.py` (duplicates, clusters, priority, write_event tasks under a threshold and a daily cap, new-branch signals); `branchable.py` (whether a signal's entity can be a branch, and its parent from Wikidata relations); `linkhealth.py`; `lookup.py` (open-API adapters) and `second_source.py`; `manage.py digest`. |
| `infra/` | The platform around the content, no models: `storage.py` (the one door to object storage: `raw` and `releases`, write-once, the `latest` pointer; ADR 0016), `migrate_local.py` and `manage.py storage init / status / migrate_local / pull-release`, `health.py` (`/healthz`), `alerts.py` (one email when a job fails N runs in a row; ADR 0019). |
| `opsconsole/` | The staff's operations console at `/ops/` (ADR 0028, redesigned by ADR 0030: Dashboard, Jobs, Runs with each run's log, Work, Releases, Docs): `queries.py` (problems, the run graph, jobs with tags and run histories, the queues, releases, all aggregated in SQL), `docs.py` (`docs/manual/`, `docs/guide/` and `docs/adr/` rendered and sanitized), `views.py` (pages: staff only, GET only, `noindex`; `OPS_HOSTS` limits it to the data host; actions: POST with CSRF, the `ops_operator` permission, a confirmation page with the dry run, then a reason), `actions.py` (run or retry a job, pause or resume one, release or extend a lease, requeue or cancel tasks, advance the wave, publish --check then publish, roll back: what each checks, shows and does; rate limits), `worker.py` (the worker runs the long ones between jobs), `models.py` (`OpsAction`, the audit row of every action, with its idempotency key), templates (and the admin header's link to it). |
| `agentapi/` | The agents' HTTP door (ADR 0017): `AgentToken` (hashed, scoped; `manage.py agent_token create / list / revoke`), `auth.py` (bearer tokens, the per-token rate limit), `schemas.py` (a result schema per task kind), `apply.py` (results applied through the services into review), `views.py` (the endpoints). |
| `work/` | The agents' queue: `AgentTask`, `queue.py` (leases under `FOR UPDATE SKIP LOCKED`), `manage.py tasks`. |
| `governance/` | `BranchMetric`, `BranchProposal`, and `manage.py branches`: `metrics.py` (each branch's shape on the page's time scale), `rules.py` (SPLIT-PLACE, SPLIT-TIME, MERGE-OVERLAP, END-STALE, NEW-BRANCH, THIN), `thresholds.py` (every threshold), `review.py` (proposals, tasks, hysteresis), `operations.py` (apply and revert). See `docs/branch-rules.md`. Also content waves: `waves.py` (the waves, gap detection window by window, `fill_gap` tasks under a daily cap, the active wave; `manage.py waves`) and `pointers.py` (Wikipedia history sections and lookup hits for each gap, unread). See `docs/guide/content-waves.md`. |
| `publish/` | `Release`; the snapshot format (`content.py`: key order and a writer byte-compatible with `JSON.stringify`), `export.py` (Postgres → content), `legacy.py` (the loader: content → Postgres, and the archive's hash), `release.py` (immutable releases in the store, identified by the content's hash and the page's inputs' hash; the `latest` pointer, rollback, the local mirror), `gates.py` (what must hold before a release: ADR 0019, ADR 0021), `changes.py` (the change report), and the `import_legacy`, `publish` and `compare_content` commands. |
| `tests/` | The suite: import idempotency, the round trip (DB → snapshot → DB), entry order, revision enforcement, the queue, dates, the fact base, branch governance, the docs' checks and hooks (`test_guide.py`) and ingestion (`test_ingest.py` on recorded cassettes in `fixtures/ingest/`: `cassette.py` replays them, `record_fixtures.py` re-records; `first_run.json`, the first real run's routing inputs, from `record_first_run.py`). |
| `var/` | Gitignored: `gate-receipt.json` (the gate's last pass), `releases/<version>/` (a local mirror of a release from the store, `make release-pull`; `releases/latest` → it), `storage/` (the store itself with `STORAGE_BACKEND=local`), `logs/` (the scheduled runs). Raw documents and releases live in object storage (ADR 0016); an old `raw/` is copied there by `make storage-migrate`. |
| `ops/` | The local schedule: `run-jobs.sh` (start Docker/Postgres and MinIO or skip, then `run_jobs`), `launchd/run-jobs.plist` (template), `schedule.sh` (install / uninstall / status). |
| `docs/guide/` | The technical guide: a chapter per part of the platform, each stamped against the code it `covers` (`stamps.json`); `README.md` lists the chapters and says how to write one. `docs/architecture.md` points into it. |
| `docs/adr/`, `docs/data-model.md`, `docs/fact-checking.md`, `docs/branch-rules.md` | Decisions, with their index and template in `docs/adr/README.md` (ingestion: 0012, source policy: 0013, the guide: 0014, the gate: 0015, object storage: 0016, the agent API: 0017, the single-source marker: 0018, processes and release gates: 0019, Heroku hosting: 0020, the cutover: 0021, ingestion tuning: 0022, edit files: 0023, the app serves the page: 0024, edit files' add ops and junk actor claims: 0025, content waves: 0026, caps after round 3: 0027, the operations console: 0028, a release's identity includes the page: 0029, a simpler console and run logs: 0030); the data model with an ER sketch; how claims are checked; the branch rules. |
| `guide/` | The guide's tools behind `manage.py guide check / stamp / status / covers / index`: `chapters.py`, `coverage.py` (what a chapter covers, its hash), `checks.py`. No models. |
| `scripts/` | `make_env.py` (writes `.env`, or adds the keys it lacks, printing no values); `validate_branch_rules.sh` (replays the branch rules on the content before `data/90` and `data/91`); `check_adr.py` (`make check-adr`); `check_pr.py` (`make check-pr`, the gate, and its receipt in `var/gate-receipt.json`). |
| `.claude/settings.json`, `.claude/hooks/` | Hooks only: before `git commit`, the guide must be fresh; before `gh pr create`, the gate must have passed on the committed code; at the end of a turn, a reminder. |
| `.claude/skills/` | Agent skills: `drain-write-events`, `fill-gaps`, `review-branch-proposals`, `verify-claims`, `verify-stale-claims`; all work through the agent API (`HUMANITRIBUTARY_API`, `HUMANITRIBUTARY_API_TOKEN`). |
| `Procfile`, `app.json`, `docker-compose.yml`, `.github/workflows/check.yml` | The processes (`release`, `web`, `worker`; `make up` runs web and worker with honcho), Heroku's description of the app (buildpack, formation, add-on, config vars: ADR 0020), the local services (Postgres on 5433, MinIO on 127.0.0.1:9000/9001), and CI (`make check-pr` on pull requests and pushes to main). |

## Rules

1. **Postgres is the source of truth; the site reads snapshots.** The page is
   built from a release (`releases/<version>/content.json` in the object
   store, mirrored to `var/releases/` by `make release-pull`), never from a
   live query. Never edit a snapshot (or `site/timeline.html`) by hand:
   change the rows, then `manage.py publish`, which refuses unless its gates
   pass; roll back with `publish --rollback <version>`. (ADR 0019) Since the
   cutover Postgres is the only source: the legacy content files are frozen
   in `archive/site-data/` and nothing imports them over the database; never
   edit them, and never add content anywhere but the rows. (ADR 0021)
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
4. **Agents work through the queue, over the agent API.** An agent holds a
   token (`manage.py agent_token create <name> --scope <kind>`, the owner's
   command), never database credentials: claim with `POST
   /api/agent/tasks/claim`, finish with `POST tasks/<id>/complete` and a
   result its kind's schema accepts, or hand it back with `release` /
   `fail`; `extend` a long lease (an expired one may be taken over). The API
   applies results through the services as `agent:<name>`, linked to the
   task, and what it writes lands in review, never published. The owner's
   CLI (`manage.py tasks …`) does the same from a shell. (ADR 0003, ADR 0017)
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
7. **Review state belongs to review.** The loader (`import_legacy`) never
   overwrites an entry's status, a publisher's rating or notes, a citation's
   check results, or evidence stance and excerpts. Keep it that way in any new
   import.
8. **The snapshot format is one shape.** `site/canonical.mjs` and
   `publish/content.py` `KEYS` must match (a test checks); the site's build
   reads a snapshot back byte for byte, and a snapshot loaded into an empty
   database exports to the same bytes. A new content field changes both, and
   `SCHEMA.md`. (ADR 0007, ADR 0021)
9. **Raw documents and secrets stay out of git.** Raw fetched bytes live in
   the `raw` object store by content hash, written only through
   `infra/storage.py` (ADR 0016); `.env` holds the local passwords (Postgres,
   MinIO). Never commit either, never print a credential, and never point anything at port 5432 (Postgres.app's): the local
   database is Docker's, on 5433.
10. **Don't load files over the database casually.** `import_legacy`
    (`--archive`, or a content file) overwrites content on every entry the
    file has, and `--retract-missing` retracts the rest: it is for empty
    databases; on a live one, `--dry-run` first. The old content-rewriting
    scripts are retired in `archive/site-tools/`.

11. **Publish through the rule.** An entry becomes `published` with
    `manage.py facts publish <slug>` (`evidence.publishing`): no contested
    claim unless its text says the sources differ, and no event without a
    non-Wikipedia source after the 14-day grace for current events. An
    override needs a reason, which is recorded. (ADR 0010)
12. **Branch structure changes come from proposals.** `manage.py branches
    review` (a job) proposes splits, merges, end dates and new branches by
    fixed rules; an agent or the owner decides each with `branches apply`
    (the operations run through the services and can be reverted with
    `branches revert`) or `branches reject`. Thresholds live in
    `governance/thresholds.py`; changing one means bumping `RULES_VERSION`.
    (ADR 0011, ADR 0022)
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
14. **Every change that alters behavior updates the guide in the same PR.**
    `make check-guide` enforces it: it names each chapter whose covered code
    changed, the files and the `git diff` to read. Read the diff against the
    chapter, update the chapter, then `make guide-stamp CHAPTER=<name>` and
    commit `docs/guide/stamps.json` with it. A stamp says you read the
    chapter against the code; never stamp without reading. A new part of the
    platform gets a chapter (`docs/guide/README.md`). (ADR 0014)
15. **Every real decision gets an ADR; amend or supersede, never silently
    edit an accepted one.** A new behavior, a new source, a changed
    threshold's rationale, a new dependency or service: write
    `docs/adr/NNNN-words.md` from the template in `docs/adr/README.md`. To
    change a decision, a new ADR's Status says it amends, refines or
    supersedes the old one, with a link, and the old one's Status names it
    back. `make check-adr` enforces the form; `make adr-index` updates the
    index. (ADR 0014)

## Working

```bash
make env          # .env with random local-only passwords (adds missing keys to an existing one)
make db           # Postgres 16 on localhost:5433 and MinIO on 127.0.0.1:9000 (console :9001), buckets created
make storage-migrate  # once, on a checkout that has var/raw and var/releases: copy them into the store
uv sync
make migrate
make import-archive  # an EMPTY database only: load the frozen legacy files (or import_legacy <release content.json>)
make publish      # a release in the store (gates first), latest → it; publish --rollback <version> repoints
make build        # mirror the latest release (make release-pull), then site/timeline.html from it (= build-release)
make roundtrip    # the release gates on your content, writing nothing (publish --check: deterministic, build, contested, report)
make test         # uv run python manage.py test (needs the database)
make check        # Django checks and missing migrations
make serve        # the admin at http://localhost:8000/admin/ (manage.py createsuperuser first)
make up           # production's processes: web (gunicorn: admin, /api/agent/, /healthz) and worker (run_jobs --loop)

uv run python manage.py facts sweep      # the fact base's daily job: split claims, schedule rechecks, queue verify_claim tasks
uv run python manage.py facts report     # its health: corroborated / single source / contested / stale, by era and region
uv run python manage.py facts sweep --junk-actors --dry-run  # report only: actor claims the splitter now rejects (kept until the owner decides)
uv run python manage.py branches review  # the branch rules' weekly job: proposals + review_branch_proposal tasks
uv run python manage.py branches list    # open proposals (show / apply / reject / revert <id>)
uv run python manage.py waves status     # content waves (ADR 0026): coverage and gaps per wave, the active one
uv run python manage.py waves gaps --top 20   # what the daily gap_waves job would queue now (a dry run)
uv run python manage.py waves advance --by human:owner  # move the active wave on (W1 1925–now → W2 1800–1925 …)
uv run python manage.py apply_edits var/reviews/<review>.edits.json --actor human:owner --dry-run  # a review's verdicts: --validate-only, --dry-run, then apply
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

The worker (`make up` or `make worker`) and the launchd schedule run the same
jobs under the same lock, so they never overlap: use `make up` while you
work, the schedule when nothing else is running. A job that fails three runs
in a row sends one alert (the console locally). Agents reach the platform at
`http://127.0.0.1:8000/api/agent` while `make up` runs (ADR 0017).

`facts sweep` (daily, right after `link_health`) and `branches review`
(weekly) run from the job runner as `facts_sweep` and `branches_review`, and
the content waves as `gap_waves` (daily) and `gap_pointers` (hourly);
`manage.py digest` includes `evidence.health.digest_section()`,
`governance.review.digest_section()` and `governance.waves.digest_section()`.

Writing canonical content from a shell (the owner, or a job; agents use the API):

```python
from revisions import revising
from timeline import services

with revising("agent:claude-writer", reason="write_event from candidate 412", task=task):
    services.save_event("ww2-dday", branch="world-war-ii", y=1944.43, when="June 6, 1944",
                        title="D-Day landings in Normandy", text="…", imp=1, status="review")
```

New entries start as `draft`; only `published` ones reach a snapshot.
The tests run against the same Docker Postgres (Django creates a
`test_<your database>` database); the suite takes about 30 seconds. The release
gates on the real content (`make roundtrip`) take about 5 seconds; loading the
archive into an empty database (`make import-archive`), about 20.

### A change, start to finish

1. **Branch.** Work on a branch, in a worktree when other sessions are at
   work: `git worktree add ../humanitributary-<name> -b <name>`. Give the
   worktree its own database when anything else is using the main one (an
   ingestion run, another session's work): create
   `humanitributary_<name>` on the same server and name it in that
   worktree's `.env` `DATABASE_URL`.
2. **Change** the code, with tests.
3. **Guide and ADR.** `make check-guide` names the chapters your change
   touches: read the diff against each, update it, `make guide-stamp
   CHAPTER=<name>` (rule 14). A real decision gets an ADR, or amends one
   (rule 15).
4. **The gate.** `make check-pr` (`scripts/check_pr.py`): the guide's check
   first, then the ADR check, Django's checks and missing migrations (and
   ruff when configured) beside the test suite and the release gates on your
   database's content (`make roundtrip`). CI runs the same command, on the
   archive's content. A pass writes a receipt for the
   exact code it checked.
5. **Commit and open the PR** with the template
   (`.github/pull_request_template.md`): what changed and why, decisions,
   guide chapters updated, how it was checked, data and content impact.

Claude Code holds this line with hooks (`.claude/settings.json`): a
`git commit` is blocked while the guide is stale, and `gh pr create` is held
until the gate has passed on the committed code (a `--draft` isn't held).

```bash
make check-guide                       # what to review, and the diff
make guide-stamp CHAPTER=ingestion     # after reviewing a chapter against the change
make guide-status                      # every chapter, fresh or not
make check-adr                         # the ADRs agree with each other
make check-pr                          # the gate (about 30 seconds)
```

## Deploying

Heroku, in the pipeline `humanitributary` (ADR 0020): the staging app
`humanitributary-staging` now, production at launch. `main` deploys to staging
automatically once CI has passed on it. The `Procfile`'s `release` runs
migrations; `web` (gunicorn: the admin, the agent API and `/healthz`) is one
Basic dyno; `worker` (`run_jobs --loop`) is at 0 until the owner turns it on.
Raw documents and releases are in AWS S3 (us-east-1, `humanitributary-staging-raw`
and `-releases`, through an IAM user limited to them), because a dyno's disk is
thrown away. Heroku
Postgres Essential-1 (Postgres 16) is `DATABASE_URL`, over TLS. Config vars:
`SECRET_KEY`, `ENVIRONMENT=staging`, `ALLOWED_HOSTS`, `INGEST_CONTACT`,
`S3_REGION`, `S3_BUCKET_*` (outside dev the settings refuse the local storage
backend unless `STORAGE_BACKEND=local` is stated); the S3 access key, API keys
and mail settings are the owner's to set, never copied from a `.env`. Buildpacks `heroku/nodejs`
(Node 24.x pinned by `package.json`, no dependencies: the publish gates' build)
then `heroku/python`; staging publishes with `heroku run python manage.py publish`. Staging holds the platform's data
since November 26, 2026 (moved from the laptop) and is the only place jobs run
(the `worker` dyno); agents use `https://data.humanitributary.com/api/agent`.
DNS is Cloudflare's (the registrar is Namecheap): `data`, the bare domain and
`www` point at the app, which serves the public page at `/` (the latest
release, from the releases store: `infra/site.py`, ADR 0024). A key never goes in a URL (logs). Never
import data into a hosted database without the owner. The
page never reads the database (ADR 0001); a CDN can go in front later. Commands and the config vars:
`docs/guide/operations.md`, "Hosted: Heroku".

## Style

Python: standard library first, Django's ORM over raw SQL except where
Postgres does the job better (triggers, `SKIP LOCKED`, trigram matching), and
docstrings that say why. Content follows `site/SCHEMA.md` (American English,
dates as "April 12, 1861", neutral tone, attributed judgments). Commit
messages say what changed and why, and end with the co-author line.
