# 0028 — An operations console for staff: read-only pages now, audited interventions planned

**Status:** accepted (November 2026). Phase 1, the read-only console, is built; phase 2, the interventions below, was accepted by the owner and is built as the plan says, with the changes listed under "Phase 2 as built" at the end; amended by [0030](0030-a-simpler-console-and-run-logs.md) (the pages redesigned, run logs, an index, a little JavaScript and two dependencies)

## Context

Watching the platform means reading several places: `/healthz` (JSON), `manage.py digest` and `facts report` (a
shell on the dyno), `run_jobs --list`, `waves status`, `branches list`, the admin's FetchRun, AgentTask and Revision
lists (one table at a time, no totals), and the releases bucket for change reports. Since November 26, 2026 the data
lives on Heroku (ADR 0020), so each of those is a `heroku run` away, and none of them answers "is anything wrong,
and what happened today" on one screen. The owner and agents' operators want that screen, then the few routine
fixes (re-run a job, free a stuck lease, roll back a release) without a shell.

## Decision

### Phase 1: a read-only console under /ops/

- **Where.** A new app, `opsconsole/` (no models, no migrations), mounted at `/ops/` by `config/urls.py`. Pages are
  server-rendered Django templates with one inline stylesheet (light and dark by `prefers-color-scheme`), no
  JavaScript and no new dependency. Sparklines are inline SVG rectangles.
- **Who.** Every view is wrapped by `opsconsole.views.console`: GET and HEAD only (a POST is a 405),
  `staff_member_required` (anyone else is sent to the admin's login), `Cache-Control: no-store` and
  `X-Robots-Tag: noindex, nofollow` (plus a robots meta tag). `settings.OPS_HOSTS` (env `OPS_HOSTS`, comma-separated)
  limits it to those hosts and answers 404 on any other, so the public page's domain can be given no `/ops/`; empty
  (the default) means any allowed host. The admin's header links to it (`opsconsole/templates/admin/base_site.html`).
- **Pages.** Overview (health, one row per job, queue depth per kind, today's intake against the daily caps,
  alerts); Job runs (filterable FetchRun history with counts and masked errors, a sparkline per job); Work queue
  (tasks by kind, status and agent, a detail page with the payload collapsed and the Revisions the task made,
  agents' throughput); Changes (the Revision feed with filters, daily counts by actor kind, batches grouped by the
  reason's prefix, a page per Revision with a readable before/after diff and the row's history); Releases (counts,
  hash, the change report's totals from each manifest, which one is live, the report itself); Content programs
  (waves, the current-event pipeline, fact-base shares and rechecks, open branch proposals).
- **Fast and fixed.** Totals are SQL (`GROUP BY`, `FILTER`, `DISTINCT ON`, window functions) in
  `opsconsole/queries.py`; lists are paginated (50; releases 25) and never load the `payload`, `result`, `before`
  or `after` JSON for a list. Each page makes the same number of queries however many rows there are (a test seeds
  ten times the rows and compares). The existing indexes cover the filters (`FetchRun.job`, `started_at`; the
  queue's partial indexes; `Revision.at`, `actor`, `table_name`, `row_pk`), so no index is added. A release's
  `manifest.json` is read once per process and cached, since release files never change. The fact-base shares
  aggregate `Claim` rows in SQL instead of calling `evidence.health.collect()`, which loads every published
  event.
- **Worker liveness without a heartbeat table.** The worker holds the scheduler advisory lock for its life
  (ADR 0019), so the Overview reads `pg_locks` for it (and for the runner's lock), beside the newest FetchRun's start.
- **Read-only, strictly.** Nothing on these pages writes. In particular it reads the waves' `JobState` directly
  rather than through `governance.waves.state()`, which creates the row. Secrets in error text are masked again with
  `ingest.policy.mask_secrets` on display.

### Phase 2: interventions in the UI

A short list of operator actions, each mapped to code that already exists or to a small, named addition.

| Action | Maps to | Notes |
|---|---|---|
| Re-run one job now | `ingest.jobs.run_named(name, feed=…)` (`manage.py run_job`) | Idempotent jobs only (below). Refused while the runner's lock is held. |
| Retry a failed run | the same, for that run's job and feed | Offered on a `failed` FetchRun of an idempotent job. |
| Release a stuck lease, or extend it | new `work.queue.release_expired(task_id, by, reason)` and `extend_for(task_id, by, minutes, reason)` | Today `release` and `extend` require the holding agent; an operator's version checks the task is still `claimed` by the agent the page showed. |
| Requeue or cancel tasks, with a reason | new `work.queue.requeue(ids, by, reason)` and `cancel(ids, by, reason)` | Selected tasks only, at most 50 at once; the reason is appended to `error` as `human:<username>: …`. |
| Mark a wave advanced | `governance.waves.set_active(name, by="human:<username>", reason=…)` (`manage.py waves advance`) | The confirmation shows `waves status` for the wave being left. |
| Publish | `publish.release.check()` (`publish --check`), then `publish.release.publish(actor="human:<username>")` | The check's change report is the confirmation page; publish runs as a one-off job. |
| Roll back | `publish.release.rollback(version, actor="human:<username>")` (`publish --rollback`) | The confirmation shows the pointer now and the release it would point at. |
| Pause or resume a job | Feed jobs: `Feed.enabled` with `config["disabled_reason"]` (what the admin does today). Plain jobs: new `JobState` "paused_jobs", read by `ingest.jobs.is_due` | A paused job shows on the Overview with who paused it and why. |

**How each is made safe.**

- **POST only, with CSRF**, from a form on the page; the read-only pages stay GET.
- **A separate permission.** Staff see the console; acting needs `opsconsole.ops_operator` (a permission on a
  model-less content type, granted per user or group in the admin). Superusers have it implicitly, so the owner
  grants it deliberately to anyone else.
- **Two steps.** The first POST shows a confirmation page with what will happen: the dry run where one exists
  (`publish --check`'s change report, `waves gaps` for an advance, the tasks a requeue would touch, the job's last
  runs and whether it is idempotent). The second POST carries a reason (required) and the confirmation's token.
- **An audit row for every action.** Revisions cover canonical tables only, and none of these actions writes one
  (queue, runs, pointer and `JobState` are working state), so phase 2 adds one table, `OpsAction`: actor
  `human:<username>`, action, target, parameters, reason, the dry run's digest, an idempotency key (unique), status,
  result or error, and times. Actions that do reach canonical rows (publish writes a `Release`; none edits content)
  still run inside `revising("human:<username>", reason=…)` where the code already does.
- **Idempotency keys.** The confirmation page mints a key; the action is inserted with it before it runs, so a
  double submit or a retried request finds the row and shows its result instead of acting twice.
- **Rate limits.** At most 10 actions per user per 10 minutes, and one publish or rollback at a time, counted from
  `OpsAction` rows in one query, like the agent API's limit (ADR 0017).
- **Long actions run in the worker, not the request.** Publish, a job run, and anything that could outlast
  gunicorn's 30-second timeout are stored as `OpsAction` rows with status `pending`; a registry job, `ops_actions`
  (every tick), runs them under the runner's lock and records the result, and the page polls the row. Quick,
  single-row changes (a lease, a cancel, a wave pointer) run in the request inside one transaction.

**Which jobs are idempotent** (read from `ingest/job_defs.py` and the modules it calls). Idempotent here means a
second run straight after the first leaves the same rows: dedupe keys, unique keys and "write only on change".

| Job | Idempotent? | Why |
|---|---|---|
| `seed_sources`, `seed_branch_entities` | yes | Seeding keeps ratings and flags; tasks have dedupe keys. |
| `portal`, `year_pages`, `who_don`, `federal_register`, `gazette`, `nobel`, `historian_sync`, `rss` | yes for rows, not for cost | Documents by canonical URL and candidates by `source_key` don't duplicate, but each run spends requests on the source and moves the feed's `next_run_at`. Offer per feed, not more than once an hour. |
| `refresh_entities`, `pageviews`, `entity_relations` | yes | Re-reads cached facts; requests only for what is older than its TTL. |
| `process`, `enrich_tasks`, `gap_pointers` | yes | Deterministic; candidates update only on change, tasks have dedupe keys, the daily caps count from midnight. |
| `facts_sweep`, `branches_review`, `gap_waves` | yes | Recompute from the rows; writes only real changes; proposals and tasks keyed; `gap_waves` respects the day's cap. |
| `link_health` | **no** | Each run is a round: three failed rounds in a row make a citation dead (`ingest/linkhealth.py`), so back-to-back runs can turn a host's bad hour into dead links, and every run appends `LinkCheck` rows. |
| `second_source` | **no** | It walks claims from a bookmark (`JobState` "second_source"); each run does the next batch. Safe to run, but it is "more", not "again". |

Non-idempotent jobs are not offered for "re-run now" or "retry"; they wait for their schedule.

## Consequences

- One screen answers "is it healthy and what happened today", on the data host, with no shell and no new service.
- The console is a second reader of the same tables as `/healthz`, `digest` and the admin, with its own SQL; when a
  table changes shape, `opsconsole/queries.py` and its tests change with it (the guide chapter
  `operations-console` covers it, so the check asks).
- Staff with an admin login can see payloads and error text: that was already true in the admin. Nothing secret is
  stored there, and error text is masked on display.
- Phase 2 needs a model and a migration (`OpsAction`), four queue functions, a paused-jobs flag in `is_due`, the
  `ops_operator` permission and a worker job; it is a separate pull request once the owner accepts this part.
- Revisit `OPS_HOSTS` at launch (set it to the data host), and the absence of indexes if a page's query grows slow
  on production's row counts.

## Phase 2 as built (November 2026)

The plan above holds, with these differences, each decided when it was built:

- **The permission is on the model.** `opsconsole.ops_operator` is in `OpsAction`'s `Meta.permissions` (migration
  `opsconsole/migrations/0001_opsaction.py`) rather than on a model-less content type, since the app now has a model. Staff
  without it see no buttons and get a 403 on every action URL; superusers have it implicitly.
- **The worker picks actions up between jobs, not as a registry job.** A registry job `ops_actions` would have
  written a FetchRun every tick and waited behind every due job. Instead `ingest.jobs.loop()` passes `run_due` a
  `between` callback that runs the hooks in `ingest.jobs.BETWEEN_JOBS` before each due job and once a pass;
  `opsconsole` registers `opsconsole.worker.pick_up` there. Same locks as planned: only the worker holding the
  scheduler lock runs them, under the runner's lock.
- **Non-idempotent jobs have a cooldown instead of no button.** `link_health` and `second_source` carry
  `not_idempotent` (the reason, in `ingest/job_defs.py`), and the console refuses to run them again within their
  interval (a day) of their last run, saying why and when they may run; outside it they can be run or retried.
  Feed jobs are refused per feed within an hour of that feed's last run, as planned.
- **Publish --check runs in the worker too**, as an action of its own (`publish_check`) that needs no confirmation
  (it writes nothing); its finished page is the publish confirmation. A publish then checks that the content and
  the page still hash as checked, and refuses otherwise, so what was confirmed is what is released. A check is good
  for 30 minutes and for one publish.
- **Pausing is one flag for every job**, `JobState` "paused_jobs" read by `run_due` (and `run_jobs --list`), feed
  jobs included; `Feed.enabled` stays the admin's switch for one feed. `run_job` still runs a paused job.
- **Requeue resets attempts** (a failed task is usually out of them), and acts on at most 50 tasks: a filtered batch
  shows its count and takes the first 50 by priority and age, exactly the ids the confirmation listed. Cancel never
  takes a task whose lease is live. Releasing a stuck lease keeps the attempt counted.
- **Confirmation tokens** are signed (Django's signing, 30 minutes) and carry the plan, the user and the
  idempotency key, so the second step cannot change what the first one showed. A pending worker action can be
  withdrawn before the worker takes it.
- **Page-only releases.** A page-only change now makes a release without `--force` ([0029](0029-release-identity-includes-the-page.md)),
  so the console's "force" box is for the rare change the page hash cannot see.

How it works in full: `docs/guide/operations-console.md`, "Actions".
