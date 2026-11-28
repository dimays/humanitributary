# 0038 — The round size's ceilings are settings, set by what the platform can carry

**Status:** accepted (November 2026; the owner asked for the limits to be as large as the resources allow); amends [0035](0035-automated-daily-rounds.md) (the round size's ceilings)

## Context

ADR 0035 let an operator set the round size within 0–4 agents a role, 10 in all, and 1–12 tasks an agent. Those
numbers were a first guess, not a measured limit. On November 27, 2026 the owner set the recommended size and hit
two ceilings at once: the size that clears the queues (four fillers of ten gaps, two verifiers of fifteen claims, a
mapper of twenty-five) did not fit, and every one of the ten agent slots was used.

What actually limits a round:

- **The owner's plan usage.** A routine run draws on the Claude subscription like an interactive session (the
  routines documentation, "Usage and limits"). That is the real pace, and it is set by the round size, not by the
  ceilings.
- **Subagents at once.** A Claude Code session runs at most 20 subagents at once by default
  (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`). The lead starts the role agents together, and the reviewers only after
  them.
- **The tasks that exist.** The daily caps (`FILL_GAP_TASKS_PER_DAY`, `WRITE_EVENT_TASKS_PER_DAY`) limit how many
  tasks the jobs make. More agents than tasks is waste, but costs little: an agent that finds the queue empty stops.
- **The host.** It has room. Heroku Postgres essential-1 allows 20 connections and the web dyno uses one or two.
  Agent API calls are short. The per-token rate limit (`AGENT_API_RATE_PER_MINUTE`, 120) answers with a 429 and a
  `retry_after` that every skill already obeys.

## Decision

The ceilings become settings, so they change without a deploy:
- `ROUND_MAX_AGENTS_PER_ROLE`, default 8;
- `ROUND_MAX_AGENTS`, default 16, which leaves room under the 20 subagents a session runs at once;
- `ROUND_MAX_TASKS_PER_AGENT`, default 20.

`DRAFTS_PER_REVIEWER` stays at 40, and more drafts mean more reviewers. The ceilings guard against a typo. The round
size, in the console, sets the pace.

## Consequences

- An operator can set a round twice the old maximum. The console's confirmation page shows the limits in force.
- A round at the new maximum uses much more of the owner's plan. The size is raised in steps, after a round's usage
  is measured, not straight to the ceiling.
- Raising `ROUND_MAX_AGENTS` above 20 also needs `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` in the routine's
  environment. Otherwise the 21st agent fails to start.
