# 0027 — Caps after round 3: more history gaps, fewer routine news stories

**Status:** accepted (November 2026); amends [0022](0022-ingestion-tuning.md); amends [0026](0026-content-waves.md)

## Context

Round 3 (November 27, 2026) was the first measured agent round: two writers, two gap fillers and a verifier, then two
independent reviewers, about 70 minutes from start to a published release. It showed:

- **History gaps are the highest-value work.** 13 `fill_gap` tasks gave 26 events, none rejected, about 7 minutes a
  gap, and the queue ran out mid-round: the daily cap (20) and one open task per branch were the bottleneck.
- **Many current-event tasks aren't worth an event.** Of 24 `write_event` tasks, 9 were rejected as routine incidents
  or stories without an outcome, and 1 was a duplicate (about 45%). More tasks would mostly mean more rejections.

## Decision

The owner approved:

- `FILL_GAP_TASKS_PER_DAY` 20 → **40**, and `max_open_per_branch` 1 → **2** (env `FILL_GAP_MAX_OPEN_PER_BRANCH`,
  through `GAP_RULES` in `config/settings.py`). Wave 1 (about 315 gaps left) takes about 8 days of rounds instead of 16.
- `WRITE_EVENT_THRESHOLD` 64 → **70** (now a setting, env `WRITE_EVENT_THRESHOLD`), keeping
  `WRITE_EVENT_TASKS_PER_DAY` at 20. Queued `write_event` tasks below 70 are cancelled once, as after ADR 0022.

## Consequences

- All three are environment settings, changed on Heroku without a deploy; their defaults live in `config/settings.py`.
- Re-measure after a few rounds: if the reject rate stays high, raise the threshold again; if gap tasks still run out,
  raise the cap further.
