# 0040 — A round's progress is counted from a task-to-round link, not a "planned" task state

**Status:** proposed (November 2026; in place of the "planned" task state the owner asked for); amends [0035](0035-automated-daily-rounds.md) (a task records the round that claimed it, and a round's record counts its tasks)

## Context

A round plans a mix (for example `fill_gap` 40, `write_event` 24, `verify_claim` 24, `map_branch_entities` 12),
then its role agents claim tasks one at a time. Round 1 took 25 minutes. While it ran, the console could show the
plan and the queue's totals, but nothing tied a task to the round working it. `GET rounds/<id>` answered `tasks:
{}` until the routine `PATCH`ed its own counts at the end. The owner asked for a "planned" state between waiting and
in progress, so they could watch a round's batch move.

A "planned" state would mean the round reserves its batch when it starts: it marks 100 queued tasks as planned for
round N, and the agents take only those. That has costs:

- **Reservations go stale.** A round can die without saying so: the session ends, hits a usage limit, or is
  stopped. Its planned tasks would then be held by nobody. Something would have to find and release them. That
  could be a timeout like a lease's, or the 12-hour stale-round close in `rounds.start`. Until then, the tasks
  would sit out of the queue. Leases already solve this problem for claimed tasks. A second kind of reservation
  would need its own expiry and its own repair.
- **A new state machine.** `AgentTask.status` has five values, and the database checks them
  (`task_status_valid`). The claim query, its partial index (`task_queued_idx`), the uniqueness rule on open tasks
  (`task_one_open_per_dedupe_key`), every job that withdraws or requeues tasks, the console's tabs and actions,
  and the owner's CLI all know them. A sixth state touches each of these, and it adds new transitions:
  planned → claimed, planned → queued, and planned → cancelled when a job withdraws a gap that filled.
- **The plan is not a batch.** A round plans counts, not task ids. Its agents claim the best task when they ask.
  Other jobs add and withdraw tasks in the meantime, so the tasks a reservation picked at the start are not
  always the ones that should be worked.

What the owner needs to see is how many tasks of each kind the round planned, how many its agents have claimed,
how many are being worked, and how many are done, failed or handed back. All of this can be derived. It needs only
the claim to record which round it belongs to.

## Decision

- `AgentTask.round` is a nullable foreign key to `Round` (`work/migrations/0005_task_round.py`, `SET_NULL`).
- `POST tasks/claim` (`agentapi/views.py`) sets it through `work.rounds.round_for_claim(actor)`. The link is set
  only when the token is one of a round's role tokens (`rounds.ROUND_AGENT`: `agent:round-writer`,
  `round-filler`, `round-verifier` or `round-mapper`, or a replacement such as `round-writer-2`) and a round is
  open (`rounds.open_round`: `running`, `reviewing` or `release_ready`, and younger than `STALE_HOURS`). Any
  other claim clears it, including a claim through the owner's CLI. A task belongs to the round that last claimed
  it. Release, fail and an expired lease keep the link.
- `work.rounds.progress(r)` counts, per kind: `planned` (the plan's mix), `claimed`, `in_progress` (with `stuck`),
  `done`, `failed` and `released` (back in the queue, or cancelled). `Round.as_json`, and so `GET rounds/<id>`,
  reports these as `tasks`. The routine's own `PATCH`ed counts stay in the row as `tasks_reported`.
- The console's Work page shows the open round inline: its stage, how long it has run, and one bar per kind. Each
  kind's card shows "in this round: N planned / N done". The page reloads every 20 seconds while a round is open.
  A round's page shows the same bars and the tasks its agents claimed (`opsconsole/queries.py` `live_round`,
  `round_tasks`).

No task state is added, and nothing is reserved. Planned work stays `queued` and open to any agent until a round
agent claims it.

## Consequences

- When a round dies, nothing needs repair. Its claimed tasks go back through their leases, as before. Its
  `planned` count stays a number in its plan.
- "Planned" means a count, not a list of tasks. The console can say "22 of 40 done". It cannot name the 18 tasks
  still to come, because no task is chosen before its claim.
- The link follows the last claim. A task a round handed back counts for it as `released` until another claim
  takes it. Then it moves to that claim's round, or to none. An operator's requeue of a failed task keeps its
  link, so it shows as `released` for the round.
- A released or failed task has no holder (`fail` and `release` clear `claimed_by`). The round page groups such
  tasks as "Handed back", not under an agent.
- Which tokens count as a round's is a naming rule. A round token made under another name (procedure 15 names
  them) would claim without linking, and the round's bars would stay empty. Rotate a token as `round-<role>-<n>`.
- Rounds from before this change have no linked tasks. Their bars show only what they planned.
- If a round ever needs to pin a specific batch, for example to retry exactly yesterday's failures, revisit this
  decision. That is when a reservation, with its own expiry, would earn its cost.
