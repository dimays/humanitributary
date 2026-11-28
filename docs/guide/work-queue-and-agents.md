---
title: Work queue and agents
summary: The queue that carries judgment work from deterministic jobs to Claude agents, how a task is leased, finished or handed back, what each kind of task asks for, and how a round runs them, records itself and publishes.
order: 50
covers:
  - work/**
  - "!work/migrations/**"
  - .claude/skills/**
  - tests/test_queue.py
  - tests/test_rounds.py
  - agentapi/*.py
  - agentapi/management/commands/*.py
---

Scheduled jobs collect material and measure the timeline, but they never make
a judgment call: is this story worth an event, does this page support this
date, should this branch split? Instead they write a task into a queue. A
Claude agent, when it runs, claims a task, does the reading and writing, and
marks the task done, so any number of agents can share the work without
stepping on each other.

The decision is [ADR 0003](../adr/0003-deterministic-jobs-and-an-agent-queue.md).
The code is small: one model (`work/models.py` `AgentTask`), one module of
queue operations (`work/queue.py`), the agent API that agents reach it
through (`agentapi/`, [ADR 0017](../adr/0017-agent-api.md)), and the
owner's command (`manage.py tasks`). Agents work in **rounds**: a `Round`
(`work/models.py`) records each one, and `work/rounds.py` holds the settings
operators change and the preflight a round passes
([ADR 0035](../adr/0035-automated-daily-rounds.md); [rounds](#rounds)).

## What a task is

An `AgentTask` row is one piece of judgment work. Its fields:

| Field | What |
|---|---|
| `kind` | What to do (see [the kinds of task](#the-kinds-of-task)). |
| `status` | `queued`, `claimed`, `done`, `failed` or `cancelled`. |
| `priority` | Higher runs first. Each job sets its own scale (below). |
| `target_entry`, `target_claim`, `target_candidate`, `target_proposal` | What the task is about: a timeline entry, an `evidence.Claim`, an `ingest.Candidate`, a `governance.BranchProposal`. Usually one is set. All are `SET_NULL`, so deleting the target leaves the task. |
| `target_ref` | Anything else the task is about, as text (a URL, a Wikidata QID). |
| `payload` | Everything the agent needs that isn't in the target, as JSON. A GIN index (`task_payload_gin`) lets jobs query it. |
| `dedupe_key` | A job's key for the task. At most one open task per (kind, key). |
| `not_before` | The task isn't offered before this time. |
| `claimed_by`, `claimed_at`, `lease_until` | The lease: who holds it, since when, until when. |
| `attempts`, `max_attempts` | Times claimed, and the limit (default 3). |
| `result` | The agent's JSON result, set on completion. |
| `error` | Every failure note, one per line, each prefixed with the agent's name. |
| `created_by` | Who queued it (`job:<name>`, `agent:<name>` or `human:<name>`). |
| `created_at`, `completed_at` | When it was queued and when it finished (done, failed or cancelled). |

The database holds the queue's rules, not just the code:

- `task_status_valid`: the status is one of the five.
- `task_claimed_has_lease`: a `claimed` task always has `claimed_by` and
  `lease_until`.
- `task_one_open_per_dedupe_key`: a partial unique index on (`kind`,
  `dedupe_key`) over queued and claimed tasks with a non-empty key.
- Two partial indexes serve the hot queries: `task_queued_idx` (queued tasks
  by kind, priority, age) and `task_lease_idx` (claimed tasks by lease end).

The queue isn't canonical content. Tasks have no audit trigger and are written
with the ORM directly. A canonical write an agent makes *while* working a task
carries the task's id in its Revision (see
[from a task to the records](#from-a-task-to-the-records)).

## How a task moves

```
queued ──claim──▶ claimed ──complete──▶ done
  ▲                 │ │
  │   release, fail │ └──fail (no retry, or out of attempts)──▶ failed
  └──(retry left)───┘
  ▲                 │
  └─lease runs out──┘  (offered again; past max_attempts → failed)

queued ──a job withdraws it, or an operator cancels it──▶ cancelled
failed, cancelled ──an operator requeues it (attempts reset)──▶ queued
```

`cancelled` is set by jobs (branch governance cancels the queued task of a
proposal it withdraws, `governance/review.py`; `gap_waves` withdraws a gap that
filled) and by operators from the console (below). Agents never cancel.

## Claiming a task: leases and SKIP LOCKED

`queue.next_task(agent=…, kinds=…, claim=True)` picks the best available task
and leases it to the agent.

1. **Available** means queued, or claimed with a lease that has run out
   (`lease_until` in the past), and `not_before` empty or past.
2. **Best** means highest `priority`, then oldest `created_at`, then lowest
   id. `kinds` narrows the choice.
3. The row is read with `SELECT … FOR UPDATE SKIP LOCKED`. If another agent
   is claiming that row at the same moment, this agent skips it and takes the
   next one instead of waiting. Two agents asking at once always get
   different tasks, and neither blocks.
4. If the chosen task has already been claimed `max_attempts` times, it is
   marked `failed` (with "lease expired after N attempts" appended to
   `error`) and the loop picks the next one.
5. Otherwise it becomes `claimed`: `claimed_by` is the agent,
   `claimed_at` is now, `lease_until` is now plus the lease, and `attempts`
   goes up by one.

The lease is `TASK_LEASE_MINUTES` in `config/settings.py`: 30 minutes, read
from the environment variable of the same name. A caller may ask for another
length (`lease_minutes` in an API claim, 1 to 240; on the command line,
`tasks next --lease <minutes>`).

**Takeover.** A task whose lease ran out is offered again like a queued one.
The next agent to claim it takes it over, and that claim counts as another
attempt. From then on only the new holder may finish it.

Without `claim=True`, `next_task` only shows the best task and changes
nothing.

## Finishing, handing back and extending

Every operation below first locks the row and checks that the task is
`claimed` and `claimed_by` is the calling agent (`_held`); otherwise it raises
`TaskError`. It does not check the clock: an agent whose lease has lapsed can
still finish, as long as nobody has claimed the task since.

| Function | API (`/api/agent/…`) | Command | Effect |
|---|---|---|---|
| `complete(id, agent, result)` | `POST tasks/<id>/complete` | `tasks complete <id> --result <file>` | `done`, stores `result`, sets `completed_at`, clears the lease. The API first validates and applies the result ([below](#the-agent-api)). |
| `fail(id, agent, error, retry=True)` | `POST tasks/<id>/fail` | `tasks fail <id> --error "…" [--no-retry]` | Appends `<agent>: <error>` to `error` and clears the lease. Back to `queued` if `retry` and `attempts < max_attempts`; else `failed`. The attempt stays counted. |
| `release(id, agent)` | `POST tasks/<id>/release` | `tasks release <id>` | Back to `queued`, untouched, and the attempt is given back (`attempts − 1`). |
| `extend(id, agent, minutes)` | `POST tasks/<id>/extend` | `tasks extend <id> [--minutes N]` | `lease_until` = now + `minutes` (default `TASK_LEASE_MINUTES`). Counted from now, not from the old lease end. |

### Operators' versions

The [operations console](operations-console.md) has its own four, for staff with
the `ops_operator` permission ([ADR 0028](../adr/0028-operations-console.md)).
Each takes who acts (`by`, `human:<username>`) and why, and appends
`<by>: <what it did>: <reason>` to the task's `error`, so the task itself says
what happened to it; the console also records an `OpsAction` row.

| Function | Effect |
|---|---|
| `release_stuck(id, holder, by, reason)` | Back to `queued`, the lease cleared. `holder` is the agent the page showed: if the task is no longer `claimed` by it (finished, or taken over), it raises `TaskError` and nothing changes. Unlike an agent's `release`, the attempt stays counted (the agent did try). |
| `extend_for(id, holder, by, minutes, reason)` | The lease runs `minutes` (1–1,440) from now, or from its current end if that is later; same holder check. |
| `requeue(ids, by, reason)` | Failed or cancelled tasks back to `queued` with `attempts` 0 and no lease; others are skipped, and so is a task whose dedupe key another open task (or an earlier one in the same batch) holds. |
| `cancel(ids, by, reason)` | Queued tasks, and claimed ones whose lease has run out, to `cancelled`; a live lease is skipped (release it first). |

`requeue` and `cancel` take at most `MAX_BATCH` (50) ids, lock them
(`select_for_update`) and return `{"done": [ids], "skipped": {id: why}}`.

## One open task per key

`queue.enqueue(kind, created_by=…, dedupe_key=…, priority=…, payload=…,
**targets)` returns `(task, created)`. With a `dedupe_key`, if a queued or
claimed task of that kind already has the key, that task comes back with
`created=False` and nothing is written. Once that task is done, failed or
cancelled, the same key may be queued again.

So a job can run as often as it likes. Each job decides for itself whether to
refresh the payload of an open task it finds: `process` and
`governance.review` update queued tasks in place; the facts sweep leaves open
ones alone.

The check and the insert are in one transaction, and the partial unique index
backs it: if two jobs race, the second insert fails with an integrity error
rather than making a duplicate.

## The kinds of task

`AgentTask.Kind` has eight kinds. Six are queued by jobs; two exist only for
people or agents to queue by hand with `tasks add`.

| Kind | Queued by | Dedupe key | Priority | Target | Skill |
|---|---|---|---|---|---|
| `write_event` | `ingest/process.py` (`job:process`, every 15 minutes) | `cluster:<cluster key>` | The cluster's priority, 0–100, rounded | `target_candidate`: the cluster's lead candidate | `drain-write-events` |
| `verify_claim` | `evidence/sweep.py` (`job:facts_sweep`, daily) | `claim:<id>` | By reason, plus 4 for an imp-1 entry and 2 for imp 2 | `target_claim`, `target_entry` | `verify-claims` |
| `verify_claim` | `ingest/second_source.py` (`job:second_source`, daily) | `claim:<id>` | 2 | `target_claim`, `target_entry` | `verify-stale-claims` |
| `review_branch_proposal` | `governance/review.py` (`job:branches_review`, weekly) | `proposal:<id>` | 30 + min(20, ⌊10 × strength⌋) | `target_proposal`, `target_entry` (the branch) | `review-branch-proposals` |
| `audit` | `governance/review.py`, for THIN findings | `thin:<branch slug>` | 15 | `target_entry` (the branch) | none |
| `map_branch_entities` | `ingest/routing.py` (`job:seed_branch_entities`, weekly) | `branch:<slug>` | 1 | `target_entry` (the branch) | `map-branch-entities` |
| `fill_gap` | `governance/waves.py` (`job:gap_waves`, daily) | `gap:<branch slug>:<from>:<to>` | 10–69: ten per wave (W1 60–69 … W6 10–19) plus the branch's importance | `target_entry` (the branch) | `fill-gaps` |
| `enrich` | nothing (by hand) | | | | none |
| `recheck_citation` | nothing (by hand) | | | | none |

Two jobs queue `verify_claim` under the same key, so a claim has at most one
open verify task whichever job noticed it first. The first one sets the
priority: if `second_source` queued the claim at 2, the sweep finds the key
open and leaves it.

The `enrich_tasks` job (hourly, `ingest/second_source.py`
`run_enrich_tasks`) does not queue `enrich` tasks. It adds lookup hits to the
payload of queued `write_event` tasks. The `enrich` kind ("write why it
matters and connections") has no producer yet.

### write_event

Built by `ingest/process.py` `build_payload`, for each cluster whose priority
is at least `WRITE_EVENT_THRESHOLD` (70) and that has a Wikipedia item
(portal or year page) in it, at most `MAX_TASK_UPDATES` (150) a run. How
clusters and priority are computed is in [ingestion](ingestion.md).

| Payload key | What |
|---|---|
| `cluster_key`, `priority`, `priority_parts` | The cluster and how its priority was computed. |
| `suggested` | `branches` (top three by summed routing score: `slug`, `name`, `score`), `when`, `y`, `precision`, `first_date`, `last_date`, `title_hint`, `link_branches`. |
| `story_article` | The story's Wikipedia article, when the cluster has a topic. |
| `items` | Up to 12 members: `candidate`, `source`, `date`, `category`, `text` (1,200 characters at most), `attribution`, `document`. |
| `items_total` | How many members the cluster has. |
| `sources` | Up to 15 distinct URLs: `url`, `label`, `domain`, `tier`, `fetch_policy`, `via_candidate`, and an `excerpt` (25 words at most) for a candidate's own link. |
| `entities` | Up to 15: `qid`, `label`, `kind`, `description`, `lat`, `lon`, `wikipedia`. |
| `possible_duplicates` | Existing events that look alike: `event`, `title`, `when`, `similarity`. |
| `instructions` | A pointer to the skill. |
| `suggested_sources`, `suggested_at` | Added later by `enrich_tasks`: lookup hits from open APIs (not evidence). |
| `evidence_pack`, `unreadable`, `evidence_ready`, `evidence_pack_at`, `evidence_urls` | Added later by `prefetch_sources` ([evidence packs](#evidence-packs)). |

On a re-run, `process` rewrites a queued task's payload and priority if they
changed, keeping `suggested_sources` and the evidence-pack keys.

What the agent does: decide whether the story is a duplicate, not worth an
event, or one event; read and cite its sources; complete the task with
`{"decision": "written", "event": {…}}` (or `"duplicate"` with the existing
`entry`, or `"rejected"` with a `note`). The API creates a written event in
`review` and puts its slug in `result.entry`. `process` (`sync_task_states`)
then moves the story's candidates: claimed while the task is claimed;
`accepted` with `result_entry` set if `result.entry` names an existing entry,
else `rejected`; back to queued if the task failed or was cancelled.

### Verify tasks from the sweep

Built by `evidence/sweep.py` `task_payload`. The reasons, their priorities
(`evidence/policy.py` `task_priority`) and the queueing rules are in
[the evidence chapter](evidence-and-fact-checking.md#queueing-verify-tasks).

| Payload key | What |
|---|---|
| `reason` | `conflict`, `dead_link`, `content_changed`, `value_changed`, `no_second_source`, `scheduled` or another recheck reason. |
| `rules_version` | `evidence/policy.py` `RULES_VERSION`. |
| `claim` | `id`, `field`, `key`, `value`, `status`, `confidence`, `recheck_after`, `witnesses`, `conflicting`. |
| `entry` | Slug, kind, title or name, dates, text, branch, imp, status. |
| `evidence` | Each row: `id`, `position`, `stance`, `url`, `cited_title`, `publisher`, `tier`, `fetch_policy`, `excerpt`, `found_value`, `method`, `checked_at`, `http_status`, `archive_url`, `page_changed`. |
| `parts` | The claim's atomic children: `id`, `field`, `key`, `value`. |
| `parent_claim` | For an atomic claim, its "as written" parent. |
| `page_changes` | For `content_changed`: each changed page's diff from ingestion's stored versions (or its new text when the old one is missing). |
| `todo` | One sentence saying what to do for this reason. |
| `evidence_pack`, `unreadable`, … | Added later by `prefetch_sources`, from the cited pages and the suggestions ([evidence packs](#evidence-packs)). |

### Verify tasks from second sources

Built by `ingest/second_source.py` `run_second_source` for claims that
Wikipedia alone supports, when the lookup adapters found something.

| Payload key | What |
|---|---|
| `reason` | Always `no_second_source`. |
| `entry`, `field`, `value` | The entry's slug, and the claim's field and value. |
| `query` | The lookup query: `title`, `year`. |
| `suggested_sources` | Up to five suggestions, best score first: `id` (a `SuggestedSource` row), `adapter`, `url`, `title`, `publisher`, `date`, `snippet`, `kind`, `score`, `ids`. |
| `instructions` | A suggestion isn't evidence: read it, record it only if it explicitly supports the claim. |

If the sweep already queued the claim, `second_source` adds
`suggested_sources` to that queued task's payload instead.

What the agent does with either: read each cited or suggested page and
complete with `{"claim": <id>, "evidence": [{"url", "stance", "excerpt", …}],
"suggestions": {"accepted": [...], "rejected": [...]}}`. The API records each
evidence row (on the claim or one of its parts) with `record_evidence()`,
which recomputes the claim, and marks the suggestions decided. A corrected
entry text goes in `proposed_text`, which is stored for the owner and not
applied.

### review_branch_proposal

Built by `governance/review.py` `_task_payload`:

| Payload key | What |
|---|---|
| `proposal` | The `BranchProposal` id. |
| `rule`, `kind`, `summary`, `strength` | What fired and how strongly. |
| `metrics` | Each involved branch's metrics, without the per-window counts. |
| `evidence` | What the rule saw (clusters, gaps, shared events, with event ids, titles, dates and places). |
| `operations` | The exact operations `branches apply` would run. |
| `needs_agent` | The fields the agent must write first (names, texts, cites, dates as written). |
| `how_to_decide` | How to decide, and the two result shapes to complete with (accept with operations, or reject). |

What the agent does: decide, and complete the task with `{"decision":
"accept", "proposal": <id>, "operations": [...], "note": …}` (every
`needs_agent` field written) or `{"decision": "reject", …}`. The API checks
the operations (`governance.operations.validate`) and stores them on the
proposal with status `accepted`; it doesn't apply them. The owner runs
`manage.py branches apply <proposal>`, which uses them, because a structural
change reaches the page at once. A rejection is recorded on the proposal. See
[branch governance](branch-governance.md#deciding-a-proposal).

### audit (thin branches)

Built by `governance/review.py` `_thin_task` from a THIN finding: `rule`,
`action` (`"fill"`), `summary`, then the finding's evidence (`events`,
`density`, `relative_density`, `peers`, `gaps`, `empty_windows`,
`window_years`, `existing`), and `how`. The agent writes the branch's missing
landmark events and completes with `{"events": [...]}` (up to 30, each in the
`write_event` event shape); the API creates them in `review` and stores
their slugs in `result.entries`. No skill covers it yet.

### fill_gap

Built by `governance/waves.py` `payload()` for each gap in a branch's window
of a content wave, at most `FILL_GAP_TASKS_PER_DAY` (40) new a day and two
open per branch. How gaps, waves and priorities are computed, and every
payload key, is in [content waves](content-waves.md#the-payload). In short:
`wave`, `window` (`from`, `to`, `label`), `gap` (`kind`, counts, `run`),
`branch` (its text, span, region, lineage, links, `id_prefixes`, Wikipedia
articles and QIDs), `before` / `after` (the published events around the
window), `in_window`, `priority_parts`, `instructions`, later `pointers`
(the `gap_pointers` job: Wikipedia history sections and lookup hits, unread),
and the evidence-pack keys (`prefetch_sources`: those pages and the branch's
article, read; [evidence packs](#evidence-packs)).

On a re-run, `gap_waves` refreshes a queued task's payload and priority if
they changed, keeping `pointers` and the evidence-pack keys, and cancels a queued task whose window is
no longer a gap.

What the agent does: read about the branch in that window and complete with
`{"decision": "written", "events": [1–3 events]}` or `{"decision":
"nothing_notable", "note": "…"}`. The events land in review; a
`nothing_notable` result keeps the job off that window for 180 days.

### map_branch_entities

Built by `ingest/routing.py` when no exact Wikidata match was found for a
branch: `branch`, `name`, `variants` (the name forms searched),
`cited_articles` and `cited_items` (up to 10 each), and `instructions`. The
agent picks the Wikidata items the branch is about and completes with
`{"branch": <slug>, "entities": [{"qid", "role", "label"}]}` (up to 20). The
API adds the `BranchEntity` rows (non-canonical routing data) with
`created_by` set to the agent, creating a stub `Entity` for a QID not yet
fetched (the daily `refresh_entities` job reads its facts). The
`map-branch-entities` skill says how to choose: look the candidates up on
Wikidata, keep only items the branch is about (not a disambiguation page, not
a predecessor that ended early in the span, not a place for a state), and
prefer an empty list to a wrong item. See [ingestion](ingestion.md).

## The tasks command

`work/management/commands/tasks.py` is the owner's way into the queue from
a shell with database access; agents use the API. Every subcommand prints
JSON (`queue.as_json`: id, kind, status, priority, target, payload, lease,
attempts, result, error), the same shape the API returns. `tasks complete`
stores the result as given: it doesn't validate or apply it, and it is the
only way to complete a kind without a result schema.

| Subcommand | What |
|---|---|
| `tasks next [--kind K]… [--claim --agent A] [--lease M]` | The best available task, or `null`. `--kind` repeats. With `--claim`, leases it to the agent. |
| `tasks complete <id> --result <file> --agent A` | Done, with the JSON in the file (`-` reads standard input). |
| `tasks fail <id> --error "…" [--no-retry] --agent A` | Back to the queue while attempts remain, else failed. |
| `tasks release <id> --agent A` | Back to the queue untouched. |
| `tasks extend <id> [--minutes M] --agent A` | A longer lease. |
| `tasks list [--status S] [--kind K] [--limit N]` | Tasks in queue order, 50 by default. |
| `tasks add <kind> --by WHO [--entry SLUG] [--ref R] [--payload JSON] [--priority P] [--dedupe KEY]` | Queue a task by hand. Only an entry target can be given. |

The agent's name comes from `--agent` or the `HUMANITRIBUTARY_AGENT`
environment variable, and must match `revisions.context.ACTOR_RE`
(`agent:`, `human:` or `job:` and a name). Queue errors, unknown entries and
bad JSON come back as command errors.

## The agent skills

Skills are instructions a Claude agent loads for one kind of work. They live
in `.claude/skills/` and are part of the contract: when a payload, a result
schema or an endpoint changes, the skill must change with it. Every skill
works through the agent API: it reads the base URL from
`HUMANITRIBUTARY_API` and the token from `HUMANITRIBUTARY_API_TOKEN` in its
environment, so the same skill runs against `make up` locally and the
production URL.

| Skill | Works | What it covers |
|---|---|---|
| `drain-write-events` | `write_event` | Claim over the API; read the payload (and `GET entries/<slug>`, `GET branches/<slug>`, `GET search`); decide (duplicate, rejected, or one event); fetch and read every source cited (`browser_only` publishers in a browser, marked `browser_read`; never openstax.org); aim for a non-Wikipedia source; complete with the event in `site/SCHEMA.md` style, which lands in review; the owner publishes it (`facts publish`), and the next release carries it. |
| `verify-claims` | `verify_claim` | Claim; read each cited page; complete with a stance per page and part as `evidence` rows; what to do per reason (`no_second_source` on the atomic parts, `conflict` with a `proposed_text` for the owner, the recheck reasons). |
| `verify-stale-claims` | `verify_claim` from ingestion | The dead-link and changed-page cases (archived copies, replacements, re-recording `supports` to stamp a new hash) and suggested second sources (read each, add it as evidence only if it explicitly supports the claim, list it in `suggestions.accepted` or `rejected`). |
| `review-branch-proposals` | `review_branch_proposal` | What to ask of each rule; fill every `needs_agent` field; accept with the operations (for the owner's `branches apply`) or reject with a note. |
| `fill-gaps` | `fill_gap` | Claim; read the window, the events around it and the pointers; check duplicates with `GET search`; write 1–3 events in SCHEMA style on the branch's id prefix (titles ≤ 60, verbatim excerpts, contested claims attributed, a non-Wikipedia source each), or complete `nothing_notable` with what was read. |
| `map-branch-entities` | `map_branch_entities` | Claim; read the payload's variants and cited articles; look the candidates up on Wikidata with the honest User-Agent; keep only items the branch is about (the polity, faith, movement or organization; a group's member states as `member`), never a disambiguation page, a predecessor or a namesake place; complete with up to 20 items or an empty list and a note. |
| `run-round` | a whole round | The daily routine's skill ([rounds](#rounds)): the settings first (stop when paused), `GET queue`, a plan by value (gaps, then `map_branch_entities`, `write_event`, `verify_claim`) and the round size, `POST rounds`, role agents with the four skills above, fresh reviewers in batches of at most 40 drafts who read every cited page and write the edit file, `edits/check` then `edits/apply`, `releases/check` then `releases/publish` when everything passes, the round recorded, a summary posted. It carries the review rounds' hard-won rules and the cloud constraint (no browser: `browser_only` sources are never fetched by script; a draft resting on one only is held). |

Every skill that records evidence (`drain-write-events`, `fill-gaps`, `verify-claims`, `verify-stale-claims`)
carries the same section, "The evidence pack: read it first": read the passages and `GET documents/<doc_id>`, copy
excerpts from the stored text (checked with `POST evidence/check-excerpt`), and open a browser only for an `unreadable`
URL whose reason is `browser_only`. For a page not in the pack the old excerpt rule holds: copy the sentence from
the page's own text (the in-app browser's page text, or the raw page where the site allows scripts), never from a
fetch tool's summary, whose "quotes" are often paraphrased; if only a summary is reachable, the cite goes in without
an excerpt. `run-round` briefs its role agents and reviewers the same way: a reviewer reads a stored page with `GET
documents?url=` and checks excerpts against it, and in a cloud round a draft only `browser_only` pages support is
held.

Every task skill also says to **extend a long lease** (`POST tasks/<id>/extend` when one task's work passes about
20 minutes, and every 20 minutes after), and the skills that fetch pages (`drain-write-events`, `fill-gaps`,
`verify-claims`, `verify-stale-claims`, `map-branch-entities`, `run-round`) carry three fetching rules: **never
disguise the client** (every script fetch sends `INGEST_USER_AGENT`; no spoofed User-Agent, header tricks, proxies
or mirrors), **one in-app browser tab per agent**, reused and always closed (leftover tabs fill the pane's cap and
starve other agents), and **never force a paid or blocked wire** (Reuters 401, AFP, CNN 451): a `write_event`
without two readable independent sources is rejected or failed with `retry: false`.

## From a task to the records

A task's `result` is a receipt. Only one job reads it: `process`, for
`write_event`, to accept or reject the story's candidates. What an agent
writes takes effect through the same doors any writer uses, and the API
opens them for it (`agentapi/apply.py`):

- **Content** goes through `timeline.services` inside
  `revising("agent:<name>", reason=…, task=task)`. The `task` argument puts
  the task's id on every Revision the block writes, so each change traces
  back to why it was made ([revisions](revisions.md)). Entries an agent
  writes start as `review`; only `manage.py facts publish` moves one to
  `published`, under the publishing rule ([publishing](publishing.md)).
- **Evidence** goes through `evidence.services.record_evidence`, which
  recomputes the claim's status, confidence and next recheck at once. The
  owner's `manage.py facts record --task <id>` uses the same function.
- **Branch structure** goes through `manage.py branches apply`, the owner's
  command, which runs the proposal's operations (those an agent accepted it
  with, if any) through the services and marks the proposal applied.

Postgres is the only record ([ADR 0021](../adr/0021-the-cutover.md)): what
an agent writes and the owner publishes reaches readers with the next
release, and nothing imports over it.

## The agent API

Agents never hold database credentials. They reach the queue and the reads
they need over a small JSON API under `/api/agent/` (`agentapi/`), served by
the `web` process (gunicorn; `make up` runs it on 127.0.0.1:8000), with a
bearer token on every request ([ADR 0017](../adr/0017-agent-api.md)).

### Endpoints

From `agentapi/views.py` (routes in `agentapi/urls.py`):

| Endpoint | What |
|---|---|
| `GET /api/agent/` | Who you are (`agent:<name>`), your scopes, the kinds with schemas, every endpoint. |
| `GET schemas/<kind>` | The result schema `complete` checks for that kind (404 for a kind without one). |
| `GET tasks/next?kind=…` | Peek at the best available task (`kind` repeats), changing nothing. |
| `POST tasks/claim` | `{"kinds": [...], "lease_minutes": 30}` → `{"task": {…}}` leased to you, or `{"task": null}`. |
| `GET tasks/<id>` | A task you claimed, or any queued task of a kind you may take (403 otherwise). |
| `POST tasks/<id>/extend` | `{"minutes": N}` (1–240; default `TASK_LEASE_MINUTES`). |
| `POST tasks/<id>/complete` | `{"result": {…}}` → validated, applied, done. |
| `POST tasks/<id>/release` | Hand it back untouched. |
| `POST tasks/<id>/fail` | `{"error": "…", "retry": true}`. |
| `GET entries/<slug>` | An entry, its location and its claims (with status and confidence). |
| `GET branches/<slug>` | A branch: its events (up to 300 listed), latest metrics, open proposals. |
| `GET claims/<id>` | A claim with its evidence and parts, in the `verify_claim` payload's shape. |
| `GET search?q=…&kind=event` | Events and branches by title or name (trigram similarity; `kind` is `event` or `branch`, `limit` up to 50). |
| `GET documents/<id>`, `GET documents?url=…` | A stored page's clean text ([evidence packs](#evidence-packs)): for the holder of a claimed task whose pack names it, or a `review` token when an entry in review cites it. |
| `POST evidence/check-excerpt` | `{"doc_id" | "url", "excerpt"}` → whether it is verbatim on the stored page, and the closest passage when not. |
| `GET queue` | What a round plans from ([below](#a-rounds-operations)). Any token. |
| `POST edits/check`, `POST edits/apply` | An edit file checked (a dry run) and applied. Scope `review`. |
| `POST releases/check`, `POST releases/publish` | The release gates, and a release. Scope `publish`. |
| `GET rounds/settings`, `POST rounds`, `GET`/`PATCH rounds/<id>` | The round settings, and a round's record ([rounds](#rounds)). Writing needs scope `round`. |

The queue endpoints call `work.queue` unchanged: the same leases, the same
`SKIP LOCKED` claims, the same ownership checks. A queue error (not your
task, not claimed) is a 409, a body that isn't a JSON object a 400.

### Tokens and scopes

`manage.py agent_token` is the owner's command; agents never run it.

| Subcommand | What |
|---|---|
| `agent_token create <name> --scope <kind> [--scope …] [--by WHO]` | A token for `agent:<name>`, printed once. `--scope` is a task kind with a result schema, or `*` for all of them, or an operation scope: `review`, `publish` or `round` (ADR 0035), which `*` never includes. |
| `agent_token list` | Every token as JSON: name, prefix, scopes, who made it, when last used, whether revoked. |
| `agent_token revoke <name>` | Cuts that agent off; nobody else is touched. |

A token is `hta_` and 32 random bytes; only its sha256 is stored
(`AgentToken.token_hash`), with its first characters as a `prefix` to
recognize it in a list. The admin shows tokens read-only. Scopes are task
kinds: a token may peek at, claim and complete only those (asking for
another kind is a 403), and every token may use the read endpoints. `*`
covers the kinds with schemas, so `enrich` and `recheck_citation` are never
offered over the API. The **operation scopes** (`agentapi/models.py`
`OPERATION_SCOPES`: `review`, `publish`, `round`) are not task kinds: a token
gets one only by naming it (`AgentToken.has`), so a `*` writer can never
publish, and a token with operation scopes only claims nothing (a claim is a
403, not "any kind").

**Rate limit.** Each token may make `AGENT_API_RATE_PER_MINUTE` (120)
requests in a one-minute window. The count is kept on the token row and
updated in one SQL statement, so it holds across gunicorn workers. Over the
limit the answer is a 429 with `Retry-After` (and `retry_after` in the body).
A missing, unknown or revoked token is a 401.

### Results: validated, then applied

Each kind an agent may complete has a JSON Schema (draft 2020-12) in
`agentapi/schemas.py` `RESULTS`. Content follows `site/SCHEMA.md` (an
event's keys and limits, a cite's `t`/`u`/`k`); decisions follow the old CLI
results, so `process` reads `result.entry` unchanged.

| Kind | Result | How it is applied |
|---|---|---|
| `write_event` | `decision`: `written` (with `event`), `duplicate` (with `entry`), `rejected` (with `note`) | A written event is created with status `review`: its record claim, one `supports` evidence row per cite (method `agent_read` unless the cite says `browser_read`, excerpt cut to 25 words), its location, its link, and its place after `after` if given. Its slug goes in `result.entry`. |
| `audit` | `events`: up to 30 events | Each created as for `write_event`; the slugs go in `result.entries`. |
| `verify_claim` | `claim`, `evidence` (`url`, `stance`, optional `claim` for a part, `excerpt`, `method`, `title`, `found`), optional `suggestions`, `proposed_text`, `note` | Each row through `record_evidence()` on the claim or one of its entry's claims; `SuggestedSource` rows marked `accepted` or `rejected`. `proposed_text` is stored, not applied. |
| `review_branch_proposal` | `decision` (`accept` with `operations`, or `reject`), `proposal`, `note` | Reject: recorded on the proposal. Accept: the operations are checked and stored on the proposal with status `accepted`, for the owner's `branches apply`. |
| `map_branch_entities` | `branch`, `entities` (`qid`, `role`, `label`; up to 20) | A `BranchEntity` per item, and a stub `Entity` for a QID not yet fetched. |
| `fill_gap` | `decision`: `written` (with `events`, 1 to 3) or `nothing_notable` (with a `note` of at least 20 characters, and no events); optional `sources_read` | Each event must be on the task's branch and inside its window (else `ApplyError`), then is created as for `write_event`; the slugs go in `result.entries`. `nothing_notable` writes nothing. |

`complete` runs in this order:

1. The token must have the task's kind in scope (403), and the result must
   match the kind's schema. If it doesn't, the answer is a 422 that lists
   each problem as `path: message`, with the schema's URL; nothing is
   written and the task stays yours to fix and resend. A kind without a
   schema is refused the same way.
2. **A retry is safe.** The completed result stores `result_sha256`, the
   hash of what was sent. The same agent sending the same result for a task
   it already completed gets the task back (200, `"replayed": true`) and
   nothing is applied twice; a different result is a 409.
3. In one transaction, the task row is locked (`queue._held`: it must be
   yours), the result is applied (`agentapi/apply.py`) inside
   `revising("agent:<name>", reason="<kind> #<id> (agent API)", task=task)`,
   and the task is completed with the result plus an `applied` summary. A
   task you don't hold is a 409. A conflict Postgres reports only at COMMIT
   (a deferred constraint such as `entry_sort_key_unique`, a serialization
   failure or a deadlock between two agents writing at once: an
   `IntegrityError` or `OperationalError`) rolls everything back and is a 409
   with `"retryable": true`, never a 500; the task is still yours. The
   sort-key race behind the 500 of November 27, 2026 is closed at its root
   by the order lock ([content model](content-model.md#how-entries-are-ordered)).
4. **Excerpts are checked against stored pages** (`agentapi/evidence.py`
   `result_mismatches`, before anything is applied, and not on a replay): for
   `write_event`, `fill_gap` (and `audit`) every cite's `excerpt`, for
   `verify_claim` every evidence row's, whose URL's page itself is stored
   (`ingest.prefetch.stored(url, pages_only=True)`: an API's record of a page
   holds less than the page, so it never causes a refusal) must be on it,
   verbatim up to whitespace. A
   mismatch is a 422 with `problems` and `excerpts`
   (`[{where, url, doc_id, fetched_at, excerpt, closest}]`); the task is still
   yours. A page that isn't stored isn't checked here.
5. A result that is well-formed but can't be applied (an id that exists, an
   unknown branch, an uncitable URL, a task about another claim or
   proposal, operations with placeholders left, a `fill_gap` event outside
   its window) raises `ApplyError`: a 422
   with the reason, everything rolled back, the task still held.

Nothing a task's result writes is published: events land in `review`,
evidence is evidence, a branch change waits for the owner. Only a round's
reviewer and publisher tokens go further, through the operations below.

## A round's operations

`agentapi/operations.py` ([ADR 0035](../adr/0035-automated-daily-rounds.md))
gives a round what used to need a shell on the host. Each edits and releases
call is an `OpsAction` row (`opsconsole/models.py`) with `requested_by`
`agent:<name>` and `runs_in="api"`, so the console's action log shows it, and
the console's single-publish lock covers both doors.

| Endpoint | Scope | What |
|---|---|---|
| `GET queue` | any | Per kind: `waiting`, `in_progress`, `stuck`, `done_today`, `failed_today`, `done_7d`, `oldest_waiting_minutes`, `priorities` (max, median, min of the waiting), the `top` five, the daily `cap`, `fed_by` (its jobs) and `role`; the stuck leases; the drafts `in_review` and the `held` ones; the live and newest release and the Revisions since; the round settings with `next_round_takes` and the latest round. |
| `POST edits/check` | `review` | `{"ops", "name", "round"}`: `timeline.edits.check()` plus the agent rules (below), then `apply(dry_run=True)`. 200 with `valid`, `counts`, `revisions` and each op's diff (25 lines); 422 with every problem. The row keeps the full diff. At most 500 ops (413). |
| `POST edits/apply` | `review` | `{"ops", "name", "round", "check", "reason"}` and an `Idempotency-Key` header. Needs a passing check of the same ops (their sha256), at most 60 minutes old and not yet applied. One transaction as `agent:<name>`, the file named `round-<id>:<name>` in every Revision's reason; the answer has the counts, the Revisions and the `txid`. The round's `edit_ops` add up. |
| `POST releases/check` | `publish` | `publish.release.preview()`: the gates and the change report, writing nothing. 200 with the hashes, `unchanged_since` and the summary; 422 with `problems` per gate. A passing check moves an open round to `release_ready`. |
| `POST releases/publish` | `publish` | `{"check", "reason", "round", "notes"}` and an `Idempotency-Key`. Refused (409) unless the check passed, is at most 30 minutes old, is unused and something changed, and no publish or rollback is open from either door (`opsconsole.actions.publish_check_refusal`, under an advisory lock while the row is made; `"retryable": true` when it was only busy). Then the content and page hashes must still match the check, and `publish.release.publish(actor="agent:<name>")` runs every gate again. The release's notes and the round record why; the round becomes `published`. |

**Agent rules on edit files** (`agent_rules`): a reviewer may not `approve`
an entry whose insert Revision is its own (independence: nothing reaches
readers without a second reader), an `add_event` or `add_branch` may not
carry `"status": "published"` (an added entry lands in review, for the next
round's reviewers), and every excerpt on a stored page (an `add_evidence`'s,
and the cites of `add_cites`, `add_event`, `add_branch` and `add_connection`)
must be on it (`agentapi/evidence.py` `ops_problems`; the problem names the
closest passage), on `edits/check` and again on `edits/apply`.

**Idempotency.** `edits/apply`, `releases/publish` and `POST rounds` need an
`Idempotency-Key` (8–64 characters). It is stored hashed with the actor and
the kind; a retry with the same key and body returns the stored answer
(`"replayed": true`), the same key with another body is a 409.

**Limits.** On top of the per-minute limit, per token: `edits/check` 20 an
hour, `edits/apply` 6 an hour, `releases/check` 10 an hour,
`releases/publish` 4 a day (`AGENT_API_*` in `config/settings.py`), counted
from the `OpsAction` rows; `POST rounds` 6 a day. Over a limit: 429 with
`Retry-After`. An API action still `running` after 10 minutes lost its
request (Heroku ends one after 30 seconds) and is closed as failed by the next
lock check, so it never holds the publish lock.

## Evidence packs

The `prefetch_sources` job ([ingestion](ingestion.md#evidence-packs),
[ADR 0036](../adr/0036-evidence-packs.md)) gives queued `write_event`,
`fill_gap` and `verify_claim` tasks their pages ahead of time. Payload keys:

| Key | What |
|---|---|
| `evidence_pack` | `[{url, title, publisher, tier, fetched_at, doc_id, words, passages: [{text, score, matches}]}]`: each stored page (non-Wikipedia first), with up to five ranked passages; at most 20,000 bytes. A page read through its official API adds `"via": "api", "api": "openalex"` (or `crossref`, `loc`, `smithsonian`, `europeana`): the record (abstract, metadata), not the page, and its `publisher` is the API's. A page purged by retention keeps its entry with no passages and `purged: true`. |
| `unreadable` | `[{url, reason, detail}]`: the pages left to read by hand. `unrated` means the publisher has no rating, so the job doesn't fetch it (an agent may read it itself, with the honest User-Agent); `api_<…>` that a catalog page's API failed or lacks its key; `api_only` that the publisher allows only its API and no route reaches it. `browser_only`, `citation_only` and `ai_blocked` (robots.txt shuts out AI crawlers by name, ADR 0037) are the reasons an agent opens a browser for; `forbidden`, `never_fetch`, `robots` and `blocked` are never fetched by script either; `tdm_reserved` (the page reserves text and data mining: read it by hand, it is never stored), `http_<n>`, `error`, `unsupported`, `too_large`, `empty`; `deferred` means the next run reads it. |
| `evidence_ready` | A stored page that isn't Wikipedia: what the console's "evidence ready" share counts. |
| `evidence_pack_at`, `evidence_urls` | When it was built, and from which URLs (a hash; `+deferred` when a cap cut it short). |

The API's side (`agentapi/evidence.py`): `GET documents/<id>` (or
`?url=`) returns `{doc_id, url, final_url, title, publisher, tier, license,
fetched_at, retain_until, words, text, note}`, a 403 to anyone but the holder
of a claimed task whose pack names the page (a JSON containment query on the
payload) or a `review` token when an entry in review cites it, 404 for an
unknown page and 410 for a purged one. `POST evidence/check-excerpt` answers
`{match, closest, words, within_25_words, doc_id, url, fetched_at}` (404 when
the page isn't stored). The same comparison (`ingest.passages.contains`:
Unicode NFC and whitespace collapsed, nothing else) backs the auto-verify on
`complete` and on edit files.

## Rounds

A `Round` (`work/models.py`) records one round: `started_at`, `finished_at`,
`trigger` (`schedule`, `manual`), `status`, `started_by`, the `plan` (the
mix, the roles, the size, held drafts carried over), `agents` and `tasks`
(claimed, completed, failed, released per kind), `drafts`, `verdicts`
(approve, approve with edits, hold, reject), `edit_ops`, the `release`, a
`summary`, `notes`, a `history` of every change, and its idempotency key.
Like a task it is not canonical. Its statuses: `running`, `reviewing`,
`release_ready` (the file is applied and every gate passes), `published`
(set only by `releases/publish`), `held` (finished without a release:
something needs the owner), `finished` (nothing to publish), `failed`,
`skipped`. The last five are final: then only `summary` and `notes` change.

**The settings** (`work/rounds.py`, one `JobState` row, `agent_rounds`):
`paused`, `skip_next`, `size` (agents per role, 0–8 and 16 in all, and tasks
per agent, 1–20, by default: the ceilings are the settings
`ROUND_MAX_AGENTS_PER_ROLE`, `ROUND_MAX_AGENTS` and `ROUND_MAX_TASKS_PER_AGENT`; the roles are writer, filler, verifier and mapper, for
`write_event`, `fill_gap`, `verify_claim` and `map_branch_entities`) and
`carry_over` (held drafts an operator sends to the next review). Operators
change them from the Work page ([operations console](operations-console.md));
`GET rounds/settings` gives them to the routine with the schedule
(`ROUND_SCHEDULE` in words and the next time it is due) and
`DRAFTS_PER_REVIEWER` (40). The console never calls Anthropic's services.

**The preflight** (`rounds.start`, behind `POST rounds`, under the settings'
row lock): an open round older than 12 hours is closed as failed; a
scheduled round while `paused` is a 409 (`"paused": true`, nothing
recorded: the routine stops cleanly); any round while another is open is a
409 (`"busy": true`); a scheduled round with `skip_next` is recorded as
`skipped`, the flag clears, and the answer says `"proceed": false`.
Otherwise the round starts, and `carry_over` moves into its plan (the drafts
still in review) and clears. **Held drafts** (`rounds.held_drafts`) are
entries in review with a Revision whose reason starts `apply_edits`: a
reviewer's file touched them and left them there.

`PATCH rounds/<id>` checks what it sets (`validate_patch`: known fields,
counts that are non-negative integers, a status an agent may set, `finish`
only with a final status) and appends to the history.

## Changing it

| Change | What it needs |
|---|---|
| A new task kind | Add it to `AgentTask.Kind` and make a migration (the choices are in the migration). Write its payload in the job that queues it, give it a dedupe key, and add a skill in `.claude/skills/` if agents will work it. For agents to complete it over the API, add its schema to `agentapi/schemas.py` `RESULTS` and its applier to `agentapi/apply.py` `APPLIERS`. Add a row to the kinds table here. |
| A new payload key | Change the job that builds it and the skill that reads it, in the same pull request. A key `prefetch_sources` writes goes in `ingest/prefetch.py` `PAYLOAD_KEYS`, which the refreshing jobs keep. |
| A result field | The kind's schema in `agentapi/schemas.py`, its applier, and the skill, together; `tests/test_agent_api.py`. |
| The rate limit | Set `AGENT_API_RATE_PER_MINUTE` in the environment; the default is in `config/settings.py`. |
| The lease length | Set `TASK_LEASE_MINUTES` in the environment; the default is in `config/settings.py`. |
| Retry limits | `max_attempts` is per task (default 3 in `work/models.py`); a job may pass another value when it creates tasks. Changing the default needs a migration. |
| Claim order | `next_task`'s ordering and the `task_queued_idx` index must match; change both, with a migration. |
| A round setting, a limit on the round size, `DRAFTS_PER_REVIEWER` | `work/rounds.py`, the `run-round` skill and the Work page together; `tests/test_rounds.py`. A change to the auto-publish policy is a new ADR (it amends ADR 0035). |
| The heavy operations' limits | `AGENT_API_EDITS_CHECKS_PER_HOUR`, `AGENT_API_EDITS_APPLIES_PER_HOUR`, `AGENT_API_RELEASE_CHECKS_PER_HOUR`, `AGENT_API_PUBLISHES_PER_DAY` in the environment. |
| Queue behavior | `tests/test_queue.py` covers ordering, peeking, ownership, takeover, release and fail, max attempts, dedupe, `not_before` and SKIP LOCKED between two connections. Extend it. A change of contract (leases, ownership) belongs in ADR 0003. |
