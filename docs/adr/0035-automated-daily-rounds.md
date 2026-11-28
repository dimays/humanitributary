# 0035 — Agent rounds run daily on a cloud routine, end to end through the API, and publish when the review approves and every gate passes

**Status:** accepted (November 2026; the owner approved the daily routine and the auto-publish policy); amends [0017](0017-agent-api.md) (operation scopes and the endpoints a round needs), [0023](0023-edit-files.md) (an edit file can be checked and applied over the API, under two more rules) and [0028](0028-operations-console.md) (the audit row records agents' operations too, and the console controls the rounds); amended by [0038](0038-larger-round-ceilings.md) (the round size's ceilings are settings, and higher) and [0040](0040-round-progress-from-a-task-link.md) (a task records the round that claimed it; a round's progress is counted from it)

## Context

Through November 27, 2026 every agent round was started by hand in a chat: the owner opened sessions with a skill
and a token each, collected the drafts, briefed a reviewer, then ran `apply_edits --validate-only`, `--dry-run` and
the apply with `heroku run`, and published the same way. Four rounds and two content waves went through that path
(`var/reviews/`: 10, 8, 9, 13 and 28 drafts, one reviewer each, 21 to 105 ops a file). The work was good; the
bottleneck was the owner. Three parts needed a shell on the host: reading the queue's state, applying the edit file
and publishing. Nothing recorded a round as a whole.

The owner approved two things: a **daily cloud routine** (a Claude Code cloud session on a cron that follows a
skill), and an **auto-publish policy**: a round publishes by itself when its independent review approved something
and every release gate passes.

Constraints. A cloud session has no in-app browser, so the `browser_only` publishers (Britannica, the BBC, the
Guardian, NPR, AP, Al Jazeera, un.org …) can't be read there, and they must never be fetched by script (ADR 0013).
Heroku ends a web request after 30 seconds; the release gates take about 5 seconds on the real content. The
console's publish already has a one-at-a-time rule; a second door must not get round it. Round 4's agents also
showed three habits to stop: two tried a spoofed browser User-Agent on sites that refuse scripts, leftover browser
tabs filled the pane's cap and starved the others, and paid news wires (Reuters, AFP, CNN) were forced instead of
replaced. And on November 27 a `POST tasks/<id>/complete` returned 500: Postgres raised at COMMIT.

## Decision

**The API gets a round's operations** (`agentapi/operations.py`), under three **operation scopes** that are not task
kinds and that `*` never grants (`agentapi/models.py` `OPERATION_SCOPES`): `review`, `publish`, `round`.

- `GET queue`: the queue per kind (waiting, in progress, stuck, priorities, the top five, today's and the week's
  counts, the caps, the feeding jobs), the drafts in review and the held ones, the live release, and the round
  settings. Any token.
- `POST edits/check` and `POST edits/apply` (scope `review`): the `apply_edits` JSON, checked by
  `timeline/edits.py` exactly as the command does (shapes, SCHEMA limits, https, never openstax.org), then a dry run
  with the diff; apply needs a passing check of the same ops (sha256), at most 60 minutes old and unused, and an
  Idempotency-Key, and runs in one transaction as `agent:<name>`, the file named after its round in every
  Revision's reason (and the transaction's id recorded). Two rules hold for agents only: **a reviewer may not
  approve an entry it wrote**, and **an entry added over the API lands in review**, never straight in `published`.
- `POST releases/check` and `POST releases/publish` (scope `publish`): `publish.release.preview()`, then
  `publish()` from a passing check at most 30 minutes old, with a reason, an Idempotency-Key, the content and page
  hashes unchanged since the check, and the gates run again. They run in the request (well inside 30 seconds).
- `POST rounds`, `GET`/`PATCH rounds/<id>`, `GET rounds/settings` (writing: scope `round`): the **Round** record
  (`work/models.py`): when, the trigger (schedule or manual), the planned mix, the agents, the tasks per kind, the
  drafts, the verdicts, the ops applied, the release, the status (running, reviewing, release ready, published,
  held, finished, failed, skipped), a summary, notes and a history.

**One audit table and one publish lock for both doors.** Each edits and releases call is an `OpsAction` with
`requested_by` `agent:<name>` and `runs_in` `api` (the human-only check constraint becomes human-or-agent), linked to
its round. The console's one-at-a-time rule for publishes and rollbacks (`exclusive_refusal`) counts both doors; the
API takes it under an advisory lock while it inserts its row, and an API row left running past 10 minutes (a request
cut off) is closed so it can't hold the lock. Per-token limits for the heavy calls (20 checks and 6 applies an hour,
10 release checks an hour, 4 publishes a day) sit on top of the per-minute limit.

**The routine follows a skill** (`.claude/skills/run-round`): the settings first (stop when paused), `GET queue`, a
plan by value (gaps first, then `map_branch_entities`, `write_event`, `verify_claim`) sized by the round settings,
stopping early when the plan is too small; `POST rounds` (its preflight); role agents with the task skills (a new
`map-branch-entities` skill covers that kind); fresh reviewers, at most 40 drafts each, who read every cited page;
`edits/check`, `edits/apply`; `releases/check`, then `releases/publish` only when the file approved or rejected
something and every gate passed; the round recorded; a summary posted. It carries the review rounds' rules
(verbatim excerpts, two independent sources for elections, wars and named living people, duplicate searches,
attribution, no Wikipedia-only publication beyond the publishing rule) and the cloud constraint: never fetch a
`browser_only` page by script, prefer other reputable sources, hold a draft whose only support is one. Every
fetching skill now says: never disguise the client (`INGEST_USER_AGENT` on every script fetch), one in-app browser
tab per agent, always closed, and never force a paid or blocked wire. Every task skill says to extend a lease when a
task passes about 20 minutes.

**Tokens for the routine**: one per role, made by the owner with `manage.py agent_token create` and stored as the
cloud environment's secrets, never printed or committed: `round-writer` (`write_event`), `round-filler`
(`fill_gap`), `round-verifier` (`verify_claim`), `round-mapper` (`map_branch_entities`), `round-reviewer`
(`review`), `round-publisher` (`publish`) and `round-recorder` (`round`). The writers' and reviewer's actors differ,
so the independence rule holds by construction.

**The console controls the rounds, and never calls Anthropic's services.** The Work page shows the schedule
(`ROUND_SCHEDULE`, the routine's cron repeated in a setting, in words, with the next due time), the last round's
state and a ten-round strip with hover cards, and a round's page with its stages (plan → agents → review → apply →
publish). Operators (`ops_operator`, a confirmation and a reason, an `OpsAction` each) pause and resume the scheduled
rounds, skip the next one, set the round size (0–4 agents a role, 10 in all, 1–12 tasks each), and send held drafts
to the next review. These are settings in one `JobState` row (`work/rounds.py`) that the routine reads and
`POST rounds` enforces: a scheduled round while paused is refused and records nothing; a skipped one is recorded as
skipped; held drafts move into the next round's plan. Jobs and Work each say in a sentence what they are, and link
to each other.

**The 500 at commit was two writers picking the same sort key.** `entry_sort_key_unique` is deferred (ADR 0008), so
two transactions that each appended an event read the same last key and the second failed only at COMMIT. Writers
that pick a key now take a transaction-scoped advisory lock per kind (`timeline.services._order_lock`). And
`complete` turns any conflict Postgres reports at COMMIT into a 409 with `"retryable": true`, and is idempotent: the
result's sha256 is stored, so the same agent sending the same result again gets the task back.

## Consequences

- A round needs no shell and no person: the owner reads the summary, the console's round page and the release. The
  owner still rolls back (the API has none), reviews held drafts in a browser when a source is `browser_only`, and
  can stop everything with one button (pause) or one command (`agent_token revoke`).
- Content now reaches readers without the owner's eyes on each draft. What stands in for them: an independent
  reviewer that read every cited page, the publishing rule, the release gates, the two agent rules on edit files,
  and a release per round that a rollback undoes. If rounds publish mistakes, the policy changes by a new ADR; the
  quick fix is pausing rounds or revoking the publisher token.
- Held and rejected drafts never publish: a release carries only `published` entries, and over the API nothing is
  added as `published`.
- A cloud round reads fewer sources than a desktop one (no browser), so it holds more drafts; the summary names
  them for the owner.
- The tokens are long-lived secrets in the cloud environment; each has one role, so a leaked writer token can draft
  but not publish. Procedure 09 replaces one.
- `OpsAction` is no longer "the console's" table only; its admin and the action log show agents' rows beside
  operators'.
- What was given up: a person approving each release, and publishing from the worker for agents (the API publishes
  in the request; if the gates grow past the request's 30 seconds, the API must queue to the worker like the
  console does).
