# Scheduled jobs

Purpose: This file lists each scheduled job, what it reads and writes, and what to do when it fails.

## How the jobs run

The `worker` dyno runs `manage.py run_jobs --loop`. Each `WORKER_TICK_SECONDS` (60), the worker runs each job that
is due, in the order of `ingest/job_defs.py`. A Postgres advisory lock makes sure that only one runner runs jobs at a
time.

- A plain job is due when its interval has passed since the start of its last run.
- A feed job runs one time for each `Feed` row that is on (`enabled`) and names the job in `config["job"]`. It is due
  when the `next_run_at` time of that feed has come. The interval of the `Feed` row (`interval_minutes`) is the real
  schedule.
- A paused job is never due. `manage.py run_job <name>` runs a paused job all the same.
- An archived job never runs, and `manage.py run_job <name>` refuses it. Procedure [17](procedures/17-archive-and-unarchive-a-job.md) tells how to archive and unarchive a job.
- Each run makes one `FetchRun` row: the status (`ok`, `partial`, `failed` or `running`), the counts and the error.
- The row also records the trigger of the run. The trigger is `schedule`, `manual` or `retry`. For `schedule`, the
  row keeps the time when the job became due (`scheduled_for`). For a retry, the row keeps the failed run and the
  attempt number.
- On the console, put the pointer on a run in the run graph or in a history strip. A card shows the trigger, the
  runtime against the usual runtime of the job, the stages, the counts and the error.
- A failed job does not stop the other jobs. If a job fails three runs in a row (`ALERT_AFTER_FAILURES`), the
  system sends one alert.
- No job calls a language model. The same input gives the same output.

The tag in the table is the group of the job in `ingest/job_defs.py`: `set-up`, `sources`, `entities`, `processing` or
`upkeep`.

## The jobs

| Name | Tag | Schedule | Reads | Writes | Safe to run again? | When it fails |
|---|---|---|---|---|---|---|
| `seed_sources` | `set-up` | Each week (10,080 minutes) | `ingest/seed.py`: `PUBLISHERS`, `FEEDS`, `VERDICTS`; the source verdicts of November 28, 2026 (`ingest/ratings.py`, one time for each database) | New `Publisher` and `Feed` rows (as `job:seed_sources`); the terms verdicts one time (`JobState` "terms_verdicts_v1") | Yes. It makes only the rows that do not exist. It never changes a tier, a `fetch_policy` or an `enabled` value. | Read the error. Usually a row in `ingest/seed.py` is not valid. Correct the code and deploy. |
| `seed_branch_entities` | `set-up` | Each week | Branches; Wikidata | `BranchEntity`, `Entity`, `WikiTitle`; `map_branch_entities` tasks | Yes. The dedupe key `branch:<slug>` keeps one open task for each branch. | If Wikidata does not answer, wait for the next run. |
| `portal` | `sources` | Feed, each 60 minutes | The Wikipedia Current events portal, the last 3 days | `Document`, `DocumentVersion`, raw bytes, entities, `Candidate` | Yes. The `source_key` of a candidate makes a second read update the same candidate. | If the page format changed, correct the parser and record the test cassette again. |
| `year_pages` | `sources` | Feed, each day (1,440 minutes) | The Wikipedia pages `<Year> in <Country>`, 25 for each run | The same as `portal` | Yes. A second run reads the next pages. | The same as `portal` |
| `rss` | `sources` | Feeds: 60, 120 and 10,080 minutes | RSS feeds that the terms permit; the three seeded feeds are off | Headlines, dates, links and a short lead as candidates | Yes | The three feeds are off because their publishers are `browser_only`. Do not start them. |
| `who_don` | `sources` | Feed, each 360 minutes | WHO Disease Outbreak News | Documents and candidates | Yes | If the source is down, the next run tries again. |
| `federal_register` | `sources` | Feed, each 360 minutes | Federal Register presidential documents | Documents and candidates | Yes | The same as `who_don` |
| `gazette` | `sources` | Feed, each 720 minutes | The Gazette (UK) state notices | Documents and candidates | Yes | The same as `who_don` |
| `nobel` | `sources` | Feed, each day | Nobel Prize announcements | Documents and candidates | Yes | The same as `who_don` |
| `historian_sync` | `sources` | Feed, each week | The Office of the Historian Milestones on GitHub | Documents for the historian lookup. It makes no candidates. | Yes | If GitHub does not answer, wait for the next run. |
| `refresh_entities` | `entities` | Feed, each day | Wikidata facts older than 30 days, 2,000 for each run | `Entity` facts and kinds | Yes | If Wikidata does not answer, wait for the next run. |
| `pageviews` | `entities` | Each 360 minutes | Wikipedia pageviews for the entities of recent candidates | `Entity` pageviews | Yes | If the pageviews API does not answer, wait for the next run. |
| `process` | `processing` | Each 15 minutes | Open candidates, entities, `BranchEntity` rows, events | Candidate scores, clusters, duplicates and priority; `write_event` tasks; new-branch signals | Yes. The dedupe key `cluster:<key>` keeps one open task for each story. | Read the traceback. Until it runs again, no new `write_event` tasks come. |
| `entity_relations` | `processing` | Each 60 minutes | Wikidata relations for the entities behind new-branch signals | `Entity` relations | Yes | If Wikidata does not answer, wait for the next run. |
| `enrich_tasks` | `processing` | Each 60 minutes | Queued `write_event` tasks; the lookup adapters | `SuggestedSource` rows and `suggested_sources` in the task payloads | Yes | A `partial` run is usual when one adapter fails. The tasks stay valid without suggestions. |
| `link_health` | `upkeep` | Each day | 200 cited URLs, the oldest checks first | `LinkCheck` rows; the check fields of `Citation` (as `job:link_health`) | No. Each run is one round, and three failed rounds make a citation dead. | Wait for the next day. Do not run it again within a day. |
| `facts_sweep` | `upkeep` | Each day, after `link_health` | Claims, evidence, link checks, matched candidates | Atomic claims, claim status and confidence, recheck dates (as `job:facts_sweep`); `verify_claim` tasks | Yes. It writes only real changes, and the dedupe key `claim:<id>` stops a second task. | Read the traceback. Run it again after you correct the cause. |
| `branches_review` | `upkeep` | Each week | Branches and their events | `BranchMetric` and `BranchProposal` rows; `review_branch_proposal` and `audit` tasks | Yes. Its hysteresis rules stop a second proposal for the same change. | Read the traceback. Run it again after you correct the cause. |
| `second_source` | `upkeep` | Each day | Claims that only Wikipedia supports, from a bookmark (`JobState` "second_source"); the lookup adapters | `SuggestedSource` rows; `verify_claim` tasks at priority 2 | No. Each run does the next batch from its bookmark. | Wait for the next day. |
| `gap_waves` | `upkeep` | Each day | Published events, window by window, in the content waves | `fill_gap` tasks, at most `FILL_GAP_TASKS_PER_DAY` (40) new each day; the active wave (`JobState` "gap_waves") | Yes. It makes no requests, and the dedupe key `gap:<branch>:<from>:<to>` stops a second task. | Read the traceback. Run it again after you correct the cause. |
| `gap_pointers` | `upkeep` | Each 60 minutes | Queued `fill_gap` tasks, 20 for each run; Wikipedia history sections; the lookup adapters | `pointers` in the task payloads | Yes | If a source does not answer, the next run tries again. |
| `prefetch_sources` | `upkeep` | Each 15 minutes, after all other jobs | Queued `write_event`, `fill_gap` and `verify_claim` tasks, 40 for each run. The pages that they cite or suggest, only from publishers with a tier and the policy `allowed`. Catalog pages through their APIs. At most 60 requests for each run, 8 for each host. | `PrefetchedPage` rows; the clean text of each page in the private `raw` store (`pages/`); `evidence_pack` and `unreadable` in the task payloads | Yes. The job uses a page from the last 7 days again with no request. | A `partial` run is usual when a site does not answer. The tasks stay valid without a pack. The next run tries again. |

## Commands

```bash
heroku run python manage.py run_jobs --list -a humanitributary-staging     # each job, its interval, when it is due, paused or not
heroku run python manage.py run_job <name> -a humanitributary-staging      # one job now, due or not, paused or not
heroku run python manage.py run_job <name> --feed "<feed name>" -a humanitributary-staging   # one feed of a feed job
heroku run python manage.py digest -a humanitributary-staging              # the runs of the last 24 hours, the queue, the signals
heroku run python manage.py evidence_coverage -a humanitributary-staging   # the share of tasks with a stored non-Wikipedia source
```

> **CAUTION:** Do not run `link_health` or `second_source` two times within one day. A second `link_health` run can
> make a citation dead after one bad hour of its host. A second `second_source` run does the next batch, not the
> same batch.

> **NOTE:** A job that the console runs uses the same lock as the worker. If the worker is in a job, the console
> action waits as `pending`.

## Intervals and where to change them

| Kind of job | Where its interval is | How to change it |
|---|---|---|
| Plain job | `ingest/job_defs.py` (`DAY` = 1,440 and `WEEK` = 10,080 minutes) | Change the code and deploy. |
| Feed job | The `interval_minutes` of each `Feed` row | Change the row in the admin. `ingest/seed.py` `FEEDS` holds the value for a new database only. |

To stop one feed, clear `enabled` on its `Feed` row in the admin and give a `config["disabled_reason"]`. The seed job
never sets `enabled` again. To stop a plain job, pause it (procedure
[06](procedures/06-pause-and-resume-a-job.md)).
