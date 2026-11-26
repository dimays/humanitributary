# AGENTS.md — working on Tributaries

Read this before changing anything. It's the short version of how the data
platform is put together and the rules that keep it that way. The why behind
each rule is in `docs/adr/`; every table, and how they connect, is in
`docs/data-model.md`. The product's name lives in one place,
`config/settings.py` `SITE_NAME` (plus this repo's README title): a rename is
coming, so never write the name anywhere else in code.

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
| `timeline/` | Canonical content: `Region`, `Entry` (the shared id namespace) with `Branch` and `Event`, `BranchLink`, `EventLink`, `Connection`, `Location`, `PaleoPin`, `Image`. `services.py` is the write path (`save_branch`, `save_event`, `apply_changes`); `dates.py` derives precision and exact dates from date text. |
| `evidence/` | Canonical: `Publisher`, `Citation`, `Claim`, `Evidence`. `confidence.py` computes a claim's status and confidence from its evidence; `publishers.py` holds the starting ratings for known publishers. |
| `revisions/` | The audit log. `revising(actor, reason, task)` (`context.py`) is the only door to canonical tables; the trigger in `sql.py` refuses writes without it and records every changed row (ADR 0006). `admin_mixins.py` runs admin edits as `human:<username>`. |
| `ingest/` | Collection, not canonical: `Feed`, `FetchRun`, `Document` + `DocumentVersion`, `Entity` (Wikidata), `DocumentEntity`, `BranchEntity` (routing), `Candidate`. Scrapers arrive later; the tables are ready. |
| `work/` | The agents' queue: `AgentTask`, `queue.py` (leases under `FOR UPDATE SKIP LOCKED`), `manage.py tasks`. |
| `governance/` | Tables only for now: `BranchMetric`, `BranchProposal`. |
| `publish/` | `Release`; the snapshot format (`content.py`: key order and a writer byte-compatible with `JSON.stringify`), `export.py` (Postgres → content), `legacy.py` (dump → Postgres), `release.py`, and the `import_legacy`, `publish` and `compare_content` commands. |
| `tests/` | The suite: import idempotency, the round trip, revision enforcement, the queue, dates and confidence. |
| `var/` | Gitignored: `legacy.json` dumps, `releases/<version>/` snapshots (`releases/latest` → newest), and later `raw/` fetched documents by content hash. |
| `docs/adr/`, `docs/data-model.md` | Decisions, and the data model with an ER sketch. |

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
   never typed in. Excerpts are at most 25 words. A citation must be a page
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
```

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
`test_tributaries` database); the suite takes a few seconds. The full round
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
(allowed on Heroku Postgres). The public site is a separate static deploy of a
release's `timeline.html`, `images/` and `outlines.js` to a CDN (ADR 0001).

## Style

Python: standard library first, Django's ORM over raw SQL except where
Postgres does the job better (triggers, `SKIP LOCKED`, trigram matching), and
docstrings that say why. Content follows `site/SCHEMA.md` (American English,
dates as "April 12, 1861", neutral tone, attributed judgments). Commit
messages say what changed and why, and end with the co-author line.
