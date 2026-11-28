# 0050 — The number of rounds a token may start in a day is a setting

**Status:** accepted (November 2026; the owner asked to run more rounds overnight); amends [0035](0035-automated-daily-rounds.md) (the limit on `POST rounds`)

## Context

ADR 0035 limits `POST rounds` to 6 per token in any 24 hours, written into `agentapi/operations.py`. On November
28, 2026 rounds took 20 to 30 minutes each, and the owner asked for rounds to keep running overnight until the weekly
plan usage reached 95%. The sixth round of the day used up the limit at 08:27 UTC, so no further round could start
until 02:33 UTC the next day, although work and usage were left.

## Decision

The limit becomes the setting `AGENT_API_ROUNDS_PER_DAY` in `config/settings.py`, 6 by default, like the other
`AGENT_API_*` limits. It is still counted from the `Round` rows the token started in the last 24 hours. An operator
raises it in the app's config without a deploy.

## Consequences

- The default does not change: a daily routine still has room for retries and a few rounds by hand.
- A higher value lets rounds run back to back. The owner's plan usage, the round size and the work queued then set
  the pace, not this limit.
- A round that is refused still says how many it allows: `429` with "N rounds in the last day from this token: at
  most N".
