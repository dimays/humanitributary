# Glossary

Purpose: This file defines each term that this manual uses. Each term has only one sense in this manual.

| Term | Definition |
|---|---|
| ADR | An architecture decision record in `docs/adr/`. It tells why the system has a rule or a design. |
| Admin | The Django admin at `/admin/`. The owner uses it to examine and edit rows. An edit in the admin writes as `human:<user name>`. |
| Agent | A Claude session that does tasks from the queue through the agent API. Agents are the only part of the system that uses a language model. |
| Agent API | The HTTP interface at `/api/agent/` on the `web` dyno. Agents claim, extend, complete, release and fail tasks through it. |
| Agent draft | An entry that an agent wrote and that has the status `review`. It does not go to readers until a reviewer or the owner approves it. |
| Agent round | One work period: agents do queued tasks, a reviewer examines the drafts, the edit file goes in, and a release follows if each gate passes. The table `Round` records each one. Also "round". |
| Agent token | A bearer token that gives an agent access to the agent API. The system keeps only its hash. It has scopes and a rate limit. |
| Alert | One email that the system sends when a job fails three runs in a row. Without the mail config vars, it is a log line. |
| Approve | To change the status of an entry from `review` to `published`. The `approve` operation of an edit file does this under the publication rule. |
| Archived job | A job that the console retired. No runner runs it. The console and `/healthz` do not show it, but its runs stay. Unarchive makes it a paused job again. |
| Backlog | The items that you deferred on the Review page. They are not in a count or in the queue of an agent until you bring them back. |
| Branch | A line on the timeline, for example a state, a people, a faith or an idea. A branch is a kind of entry. |
| Bucket | A container for objects in S3. The system has two: `raw` and `releases`. |
| Candidate | A possible event that a job made from one or more documents. It has a cluster and a priority. |
| Canonical | A table in the apps `timeline` and `evidence`. A write to it needs `revising()`, and each change makes a `Revision`. |
| Cap | A daily maximum of new tasks of one kind, for example `WRITE_EVENT_TASKS_PER_DAY`. |
| Change report | The files `changes.json` and `changes.md` in a release. They list the entries that the release adds, changes and retracts. |
| CI | The GitHub Actions workflow `check`. It runs `make check-pr` on each pull request and each push to `main`. |
| Claim | One statement about an entry. The system calculates its status and confidence from its evidence. |
| Cluster | A group of candidates about one story. One cluster gets one `write_event` task. |
| Config var | An environment variable of the Heroku app. `heroku config:set` changes it and restarts the dynos. |
| Console | The operations console at `/ops/`. It shows the health of the system and has a few audited actions. |
| Content wave | A period of history in equal windows. The `gap_waves` job finds the gaps in the active wave and in the newer waves. |
| Contested | A claim status: sources that conflict with the claim have enough weight against it. |
| Dedupe key | A key that a job gives to a task. Only one open task can have a given kind and key. |
| Deferred task | A queued task that an agent released. Agents do not get it before its time "not before". Agents never get it again if it has a need. The console shows it on the tab Deferred. |
| Deploy | The step that puts new code on the Heroku app. Heroku deploys `main` after CI passes. |
| Deterministic | A program is deterministic when the same input always gives the same output. All jobs are deterministic. |
| Dismissed | The mark on a failed job run that an operator removed from "Needs attention" without a new run. The run stays in the history. |
| Document | A fetched page or record, with its extracted text. Its raw bytes are in the `raw` bucket. |
| Dyno | A Heroku container that runs one process: `web`, `worker`, the release phase or a one-off command. |
| Edit file | A JSON list of operations from a reviewer, in `var/reviews/`. `manage.py apply_edits` applies it in one transaction. |
| Entry | An item on the timeline: a branch or an event. Each entry has a unique slug. |
| Event | A moment or a period on a branch, with a date, a title, a text and an importance from 1 to 3. |
| Evidence | One citation for one claim, with a stance and an excerpt of 25 words or fewer. Only evidence that supports its claim goes into a release. |
| Feed | A source that a job reads on a schedule, with an interval and an on or off value. |
| Feed job | A job that runs one time for each `Feed` row that names it. |
| `fetch_policy` | How jobs can read a publisher: `allowed`, `api_only`, `browser_only`, `citation_only` or `forbidden`. With `api_only`, jobs use only its API. With `citation_only`, agents cite it and read it in a browser. |
| Fetch policy endpoint | The call `GET /api/agent/policy?url=<url>`. It tells an agent if its script can read a page (`may_fetch`). |
| Fetcher | `ingest.http.Fetcher`, the one HTTP client of all jobs. It refuses a request that the source policy does not permit. |
| Gap | A window of a content wave in which a branch has no published event, or far fewer events than its peers. |
| Gate | `make check-pr`: the checks and the tests that a pull request must pass. CI runs the same command. |
| Guide | The technical guide in `docs/guide/`. It is the developer reference for how the code operates. |
| Held draft | A draft that a reviewer read and kept in review, with an edit and no approval. An operator can send it to the next review. |
| Job | A scheduled, deterministic function in `ingest/job_defs.py`, with a name and an interval. |
| Job run | One run of one job, recorded as a `FetchRun` row. |
| Jobs tab | The console page of the jobs. The worker runs them on a schedule. They collect and prepare material and make tasks, without Claude. |
| Lease | The time for which an agent holds a claimed task. After the lease time, another agent can take the task. |
| Lock | A Postgres advisory lock. The runner lock lets one runner run jobs. The scheduler lock lets one worker schedule. |
| Needs | A note on a deferred task: `browser` (only a browser can read a page that the task needs) or `owner` (the owner must decide). |
| New events | The console page that shows each content item from the fetch to the release, with its five steps. It also shows the numbers of the last 14 days. |
| One-off dyno | A dyno that `heroku run` starts for one command. It stops when the command ends. |
| Operation scope | A token scope that is not a task kind: `review`, `publish` or `round`. The scope `*` does not give it. |
| OpsAction | The audit row of one console action: who, what, why, the status and the result. |
| `ops_operator` | The permission that a staff user needs to do actions in the console. A superuser has it. |
| Owner | The one person who maintains and operates the system. This manual is for the owner. |
| Page hash | The sha256 hash of the files that the build reads to make the page, other than the snapshot. |
| Page input | One of the files in `PAGE_INPUTS`: `site/build.mjs`, `site/canonical.mjs`, `site/restructure.mjs`, `site/template.html` and `site/globe-assets.json`. |
| Paused job | A job that the console paused. No runner runs it on the schedule until an operator resumes it. |
| Payload | The JSON in a task that holds all the information that the agent needs. |
| Plain job | A job that runs when its interval has passed since its last run. It reads no `Feed` row. |
| Pointer | The object `releases/latest.json` in the `releases` bucket. It names the release that readers get. |
| Priority | For a cluster, a score from 0 to 100. For a task, a number. A task with a higher priority goes first. |
| Procedure | A numbered list of steps for one task in this manual. Each step has one instruction and one check. |
| Public page | The timeline page at `https://manyages.com`. The `web` dyno serves it from the latest release. |
| Publish | To make a new release with `manage.py publish` or the console. This manual does not use "publish" for one entry. |
| Publisher | A cited site, by domain, with a tier, a license, a `fetch_policy` and access notes. |
| Publication rule | The rule that an entry must obey before it gets the status `published`: no unflagged contested claim, and a source other than Wikipedia. |
| Raw store | The `raw` bucket. It holds the bytes of each fetched document under its content hash. |
| Release | One output of `manage.py publish`: the files under `releases/<version>/` and a `Release` row. A release never changes. |
| Release gate | A check that `publish` must pass before it writes a release: `deterministic`, `build`, `contested` and `report`. |
| Release phase | The step in which Heroku runs `manage.py migrate` before a new deploy goes live. |
| Releases store | The `releases` bucket. It holds the release files and the pointer. |
| Review | The status `review` of an entry. Also, the written result of a reviewer: a Markdown file in `var/reviews/`. |
| Review page | The page `/ops/review/` of the console. It holds the claims, drafts and tasks that need a person to read a `browser_only` page. You approve, deny or defer each item there. |
| Reviewer | A Claude session that did not write the drafts. It reads them and their sources and writes a review and an edit file. |
| `revising()` | `revisions.revising(actor, reason, task)`, the only way to write a canonical row. It tells the trigger who writes and why. |
| Revision | One changed canonical row: who, when, why, which task, and the row before and after. A trigger writes it. |
| Rollback | A write of the pointer that names an earlier release. It deletes nothing and does not change the database. |
| Round configuration | The configuration that an operator changes on the Work page: paused, skip the next, the round size and the held drafts to send on. |
| Routine | The scheduled Claude Code cloud task that starts the daily round. It follows the skill `run-round`. |
| Run card | The card that the console shows on a bar of the run graph or a square of a history strip. It shows the trigger, the runtime, the stages, the counts and the error of the run. |
| Schema | The JSON Schema of the result of one task kind, in `agentapi/schemas.py`. `complete` refuses a result that does not match it. |
| Scope | A task kind that a token can claim and complete. The scope `*` covers each kind that has a schema. |
| Service layer | The functions in `timeline.services` and the related modules that write canonical rows. |
| Skill | Instructions in `.claude/skills/` that tell an agent how to do one kind of task. |
| Slug | The unique id of an entry, in lower case with hyphens. |
| Snapshot | The file `content.json` of a release. It holds the published content in one fixed shape. |
| Source | An outside site or API that a job reads or an agent cites. |
| Source policy | The rules that tell which hosts jobs can fetch: `NEVER_FETCH`, the `fetch_policy` of each publisher and `robots.txt`. |
| Stale | A task is stale when its status is `claimed` and its lease time is past. |
| Staging | The Heroku app `humanitributary-staging`. It holds the live data and serves the public page. |
| Stamp | A record in `docs/guide/stamps.json` that a person read a guide chapter against the current code. |
| STE | ASD-STE100 Simplified Technical English, Issue 9: the rules of the text of this manual. |
| Stuck task | A task that an agent holds, but the agent stopped. |
| Task | One unit of judgment work in the queue: an `AgentTask` row. |
| Task kind | What a task asks for, for example `write_event`, `verify_claim` or `fill_gap`. |
| Threshold | The minimum priority that a story must have to become a `write_event` task: `WRITE_EVENT_THRESHOLD`. |
| Tier | The reliability of a publisher, from 1 (primary or official) to 4 (weak). |
| Trigger | What started a job run: `schedule` (the worker), `manual` (Run now, or `run_job`) or `retry` (Retry on a failed run). |
| Verdict | The result of a read of the terms of a source: what jobs can do with it, with the clause. |
| Web dyno | The dyno that runs gunicorn and serves the page, the admin, the console, the agent API and `/healthz`. |
| Wikidata | The open database of items with ids such as Q1490. Jobs use it to connect documents to branches. |
| Window | One equal part of a content wave, for example 5 years in the wave W1. |
| Work tab | The console page of the agent tasks and the rounds. Claude agents do the tasks in rounds. |
| Worker | The dyno that runs `manage.py run_jobs --loop`: the jobs and the console actions that run in the worker. |
