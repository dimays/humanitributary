---
title: Work queue and agents
summary: The queue that carries judgment work from deterministic jobs to Claude agents, how a task is leased, finished or handed back, and what each kind of task asks for.
order: 50
covers:
  - work/**
  - "!work/migrations/**"
  - .claude/skills/**
  - tests/test_queue.py
---

Scheduled jobs collect material and measure the timeline, but they never make
a judgment call: is this story worth an event, does this page support this
date, should this branch split? Instead they write a task into a queue. A
Claude agent, when it runs, claims a task, does the reading and writing, and
marks the task done, so any number of agents can share the work without
stepping on each other.

The decision is [ADR 0003](../adr/0003-deterministic-jobs-and-an-agent-queue.md).
The code is small: one model (`work/models.py` `AgentTask`), one module of
queue operations (`work/queue.py`) and one command (`manage.py tasks`).

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

queued ──a job withdraws it──▶ cancelled
```

`cancelled` is set only by jobs: branch governance cancels the queued task of
a proposal it withdraws (`governance/review.py`). Nothing in `work/` cancels a
task.

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
length (`tasks next --lease <minutes>`).

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

| Function | Command | Effect |
|---|---|---|
| `complete(id, agent, result)` | `tasks complete <id> --result <file>` | `done`, stores `result`, sets `completed_at`, clears the lease. |
| `fail(id, agent, error, retry=True)` | `tasks fail <id> --error "…" [--no-retry]` | Appends `<agent>: <error>` to `error` and clears the lease. Back to `queued` if `retry` and `attempts < max_attempts`; else `failed`. The attempt stays counted. |
| `release(id, agent)` | `tasks release <id>` | Back to `queued`, untouched, and the attempt is given back (`attempts − 1`). |
| `extend(id, agent, minutes)` | `tasks extend <id> [--minutes N]` | `lease_until` = now + `minutes` (default `TASK_LEASE_MINUTES`). Counted from now, not from the old lease end. |

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

`AgentTask.Kind` has seven kinds. Five are queued by jobs; two exist only for
people or agents to queue by hand with `tasks add`.

| Kind | Queued by | Dedupe key | Priority | Target | Skill |
|---|---|---|---|---|---|
| `write_event` | `ingest/process.py` (`job:process`, every 15 minutes) | `cluster:<cluster key>` | The cluster's priority, 0–100, rounded | `target_candidate`: the cluster's lead candidate | `drain-write-events` |
| `verify_claim` | `evidence/sweep.py` (`job:facts_sweep`, daily) | `claim:<id>` | By reason, plus 4 for an imp-1 entry and 2 for imp 2 | `target_claim`, `target_entry` | `verify-claims` |
| `verify_claim` | `ingest/second_source.py` (`job:second_source`, daily) | `claim:<id>` | 2 | `target_claim`, `target_entry` | `verify-stale-claims` |
| `review_branch_proposal` | `governance/review.py` (`job:branches_review`, weekly) | `proposal:<id>` | 30 + min(20, ⌊10 × strength⌋) | `target_proposal`, `target_entry` (the branch) | `review-branch-proposals` |
| `audit` | `governance/review.py`, for THIN findings | `thin:<branch slug>` | 15 | `target_entry` (the branch) | none |
| `map_branch_entities` | `ingest/routing.py` (`job:seed_branch_entities`, weekly) | `branch:<slug>` | 1 | `target_entry` (the branch) | none |
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
is at least `WRITE_EVENT_THRESHOLD` (45.0) and that has a Wikipedia item
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

On a re-run, `process` rewrites a queued task's payload and priority if they
changed, keeping `suggested_sources`.

What the agent does: decide whether the story is a duplicate, not worth an
event, or one event; read and cite its sources; write the event; complete the
task with `{"entry": <slug or null>, "decision": …}`. `process`
(`sync_task_states`) then moves the story's candidates: claimed while the task
is claimed; `accepted` with `result_entry` set if `result.entry` names an
existing entry, else `rejected`; back to queued if the task failed or was
cancelled.

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

What the agent does with either: read each cited or suggested page, record
what it says with `manage.py facts record` (which recomputes the claim), fix
the entry if it is wrong, and complete with `{"claim": <id>, "status": …,
"recorded": [...], …}`.

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
| `how_to_decide` | The apply and reject commands. |

What the agent does: decide, then `branches apply` (with the fields written)
or `branches reject`, and complete the task. See
[branch governance](branch-governance.md#deciding-a-proposal).

### audit (thin branches)

Built by `governance/review.py` `_thin_task` from a THIN finding: `rule`,
`action` (`"fill"`), `summary`, then the finding's evidence (`events`,
`density`, `relative_density`, `peers`, `gaps`, `empty_windows`,
`window_years`, `existing`), and `how`. The agent writes the branch's missing
landmark events and completes with their slugs. No skill covers it yet.

### map_branch_entities

Built by `ingest/routing.py` when no exact Wikidata match was found for a
branch: `branch`, `name`, `variants` (the name forms searched),
`cited_articles` and `cited_items` (up to 10 each), and `instructions`. The
agent picks the Wikidata items the branch is about and adds `BranchEntity`
rows (non-canonical routing data, in the admin or the ORM) with `created_by`
set to itself. See [ingestion](ingestion.md).

## The tasks command

`work/management/commands/tasks.py`. Every subcommand prints JSON
(`queue.as_json`: id, kind, status, priority, target, payload, lease,
attempts, result, error), so an agent can read the answer back.

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
in `.claude/skills/` and are part of the contract: when a payload or a command
changes, the skill must change with it.

| Skill | Works | What it covers |
|---|---|---|
| `drain-write-events` | `write_event` | Claim; read the payload; decide (duplicate, rejected, or one event); fetch and read every source cited (`browser_only` publishers in a browser, never openstax.org); aim for a non-Wikipedia source; write in `site/SCHEMA.md` style into `site/data/` until the cutover, then `make import`; complete with `entry`, `decision`, `sources_read`. |
| `verify-claims` | `verify_claim` | Claim; read each cited page; record a stance per page and part with `facts record`; what to do per reason (`no_second_source`, `conflict`, the recheck reasons); complete with the claim's new status and the evidence recorded. |
| `verify-stale-claims` | `verify_claim` from ingestion | The dead-link and changed-page cases (archived copies, replacements, re-recording `supports` to stamp a new hash) and suggested second sources (read each, record it only if it explicitly supports the claim, mark the `SuggestedSource` accepted or rejected). |
| `review-branch-proposals` | `review_branch_proposal` | What to ask of each rule; fill every `needs_agent` field; `branches apply --legacy-file …` then `make roundtrip`, or `branches reject --note`; how to revert. |

## From a task to the records

A task's `result` is a receipt. Only one job reads it: `process`, for
`write_event`, to accept or reject the story's candidates. Everything else an
agent does takes effect through the same doors any writer uses:

- **Content** goes through `timeline.services` inside
  `revising("agent:<name>", reason=…, task=task)`. The `task` argument puts
  the task's id on every Revision the block writes, so each change traces
  back to why it was made ([revisions](revisions.md)). New entries start as
  `draft` or `review`; only `manage.py facts publish` moves one to
  `published`, under the publishing rule ([publishing](publishing.md)).
- **Evidence** goes through `manage.py facts record --task <id>`
  (`evidence.services.record_evidence`), which recomputes the claim's status,
  confidence and next recheck at once.
- **Branch structure** goes through `manage.py branches apply --task <id>`,
  which runs the proposal's operations through the services and marks the
  proposal applied.

Until the cutover the legacy data files are still imported over Postgres, so
the skills write new events and branch changes to `site/data/` as well
([content model](content-model.md)).

> **Pending: parity branch.** An agent API arrives, so agents can claim,
> extend and complete tasks without running `manage.py tasks` in a checkout;
> update this section and the skills when it merges.

## Changing it

| Change | What it needs |
|---|---|
| A new task kind | Add it to `AgentTask.Kind` and make a migration (the choices are in the migration). Write its payload in the job that queues it, give it a dedupe key, and add a skill in `.claude/skills/` if agents will work it. Add a row to the kinds table here. |
| A new payload key | Change the job that builds it and the skill that reads it, in the same pull request. |
| The lease length | Set `TASK_LEASE_MINUTES` in the environment; the default is in `config/settings.py`. |
| Retry limits | `max_attempts` is per task (default 3 in `work/models.py`); a job may pass another value when it creates tasks. Changing the default needs a migration. |
| Claim order | `next_task`'s ordering and the `task_queued_idx` index must match; change both, with a migration. |
| Queue behavior | `tests/test_queue.py` covers ordering, peeking, ownership, takeover, release and fail, max attempts, dedupe, `not_before` and SKIP LOCKED between two connections. Extend it. A change of contract (leases, ownership) belongs in ADR 0003. |
