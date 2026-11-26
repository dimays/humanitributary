---
title: Content waves
summary: How the timeline is deepened round after round, working backward from today, by measuring every branch window by window, queueing the gaps as fill_gap tasks under a daily cap, and moving on to older history when a wave is nearly done.
order: 75
covers:
  - governance/waves.py
  - governance/pointers.py
  - governance/management/commands/waves.py
  - tests/test_waves.py
  - .claude/skills/fill-gaps/SKILL.md
---

The timeline grows in three ways. Ingestion keeps the current year up to date
([ingestion](ingestion.md)). Content waves fill in the past: first a detailed
picture of the last 500 years, then deeper history in later waves. A daily
job finds the places where a branch says nothing (or much less than its
neighbors) and queues them for agents, best first, a few a day.

The decision is [ADR 0026](../adr/0026-content-waves.md). The code is
`governance/waves.py` (waves, detection, queueing, the digest section),
`governance/pointers.py` (reading suggestions for each task) and
`manage.py waves` (the owner's view). Agents work the tasks with the
`fill-gaps` skill.

## Waves and windows

A **wave** is a stretch of time cut into equal **windows**. The waves work
backward from today (`governance/waves.py` `DEFAULT_WAVES`):

| Wave | From | To | Window | Wide window |
|---|---|---|---:|---:|
| W1 | 1925 | the start of this year | 5 years | 20 |
| W2 | 1800 | 1925 | 10 | 40 |
| W3 | 1500 | 1800 | 25 | 100 |
| W4 | 1000 | 1500 | 50 | 200 |
| W5 | 1000 BCE | 1000 CE | 100 | 400 |
| W6 | 3500 BCE | 1000 BCE | 250 | 1,000 |

- A window runs from its first year up to, not including, its second:
  1960–1965 holds 1960.0 to 1964.99.
- W1 stops at the start of the current year. The current year belongs to
  ingestion.
- Branches in the `wide_regions` (`faiths` and `culture`: religions,
  philosophies, arts, sport) use windows `wide_factor` (4) times wider.
  Their landmark events are rarer by nature.
- A tail shorter than half a window joins the last window (W1's 2025 makes
  the last window 2020–2026). A longer tail is a window of its own
  (`windows()`).
- Branches in `exempt_regions` (`cosmos`, `life`, `humans`) are deep time,
  not history, and are never measured.

A deployment can replace the waves with `settings.CONTENT_WAVES` (the same
list shape) and any rule below with a `settings.GAP_RULES` dict, merged over
`DEFAULTS`.

## What counts as a gap

`detect()` measures every published branch from its published events,
reusing the branch rules' metrics (`governance.metrics.compute`, see
[branch governance](branch-governance.md#measuring-a-branch)). For each wave
and each window:

1. **Alive.** A branch counts in a window when it exists for at least
   `min_overlap` (half) of it. A branch founded in 1964 doesn't count in
   1960–1965.
2. **Count.** Its events in the window: an event whose `y` is in it, or one
   with an `end` whose span overlaps it (`in_window()`). A war from 1939 to
   1945 counts in 1940–1945.
3. **Peers.** The other branches of the same region alive in the same
   window, or every branch alive in it when the region has fewer than
   `min_peers` (3). Normal and wide branches are measured on their own
   grids and are never each other's peers.
4. **Gap.** `empty` when the branch has no event in the window. `sparse`
   when it has fewer than `density_floor` (0.34) × the peers' median, and
   that median is at least `min_peer_median` (3): one event where its peers
   have three.

Each gap also knows its **run**: the consecutive gap windows around it on
the same branch (`run.from`, `run.to`, `run.years`). A long silence ranks
above a short one.

`detect()` also returns each wave's **coverage**: how many branch-windows it
measured (`pairs`), how many have at least one event (`covered`,
`share_covered`), and how many are empty or sparse.

## Which gaps become tasks

`run()` is the `gap_waves` job (daily, registered in `ingest/job_defs.py`).
It queues gaps from the **active wave and every wave before it**, so W1 is
still watched after W2 starts. The best come first (`order()`):

1. the wave, recent first;
2. the branch's **importance**: the mean percentile rank, among all measured
   branches, of its published event count, its link degree (event links in
   and out, plus parents, `into` and children) and, where ingestion has it,
   its Wikipedia pageviews (the best of its `BranchEntity` items'
   `pageviews_30d`);
3. the length of its run;
4. the most recent window, then the slug.

A gap is skipped when:

| Reason | Counted as | What |
|---|---|---|
| An open task | `<wave>.open` | A queued or claimed `fill_gap` with the same key. A queued one gets its payload and priority refreshed (keeping `pointers`). |
| Recently attempted | `<wave>.recent_<outcome>` | The window's last task ended less than `retry_after_days` ago: 180 days after `nothing_notable`, 60 after events were written (they wait in review, and the window counts as a gap until one is published), 30 after a failure, none after a cancellation. |
| The branch is busy | `<wave>.held_branch` | The branch already has `max_open_per_branch` (1) open `fill_gap` task. One at a time lets each agent see the last one's events, and spreads the day's tasks across branches. |
| The daily cap | `<wave>.held_cap` | `settings.FILL_GAP_TASKS_PER_DAY` (20, env `FILL_GAP_TASKS_PER_DAY`; `--opt per_day=` for one run) new tasks a local day, counted like `write_event`'s cap. |

A gap is a window on a branch, and its key is the task's dedupe key:
`gap:<branch>:<from>:<to>`. A queued task whose window is no longer a gap
(someone published an event there) is cancelled (`cancelled_filled`).

The task: kind `fill_gap`, `created_by` `job:gap_waves`, `target_entry` the
branch, **priority** 10–69 (`priority()`): a band of ten per wave (W1 60–69,
W2 50–59 … W6 10–19) plus ⌊10 × importance⌋, at most 9. Tasks with the same
priority are claimed oldest first, and the job creates them in `order()`, so
the tie-break follows the same ranking.

## Moving to the next wave

The active wave is kept in `JobState` "gap_waves" (`state.active`, with a
`history` of every change, and `last_run`, the last run's summary for the
digest). It starts at the first wave.

After queueing, the job counts what is left of the active wave: its open
tasks plus its gaps held back by the caps. When that is below
`advance_below` (5), the next wave becomes active, and the same run queues
its first gaps. Gaps that were tried recently don't count as left, so a wave
whose every gap was attempted moves on.

The owner can move it by hand: `manage.py waves advance` (to the next wave)
or `waves advance --to W3`.

## The payload

Built by `payload()`:

| Key | What |
|---|---|
| `wave` | `name`, `from`, `to`, `window_years`, `wide`. |
| `window` | `from`, `to`, `label` ("1960–1965", "1000 BCE–900 BCE"). |
| `gap` | `kind`, `events_in_window`, `peer_median`, `peers` (the group), `run`. |
| `branch` | `id`, `name`, `text`, `start`, `end`, `start_when`, `end_when`, `region`, `parents`, `into`, `children`, `links_out` / `links_in` (event links, up to 8), `events`, `id_prefixes` (the prefixes its ids use, most common first: `ga10`, or `n92-sn` where a two-letter code follows), `wikipedia` (articles its record claim cites), `qids` (its `BranchEntity` items, up to 5, members left out), `article` (its Wikipedia article title). |
| `before`, `after` | Up to three published events just before and just after the window: `id`, `title`, `when`, `y`, `end`. |
| `in_window` | What is already there (a sparse gap), up to 10. |
| `priority_parts` | The wave, its band, the importance parts, the run length. |
| `instructions` | A pointer to the skill. |
| `pointers` | Added later by `gap_pointers` (below). |

## Pointers

The `gap_pointers` job (hourly, `governance/pointers.py`) adds `pointers` to
queued `fill_gap` tasks that have none, best first, `limit` (20) a run. They
are suggestions for where to start reading, marked as unread, never
evidence:

- **`wikipedia_sections`**: for the branch's article and for its name
  (they can differ: "Kingdom of Portugal" and "Portugal"), the pages "History
  of X", "Timeline of X history" and "Timeline of X", and the article itself,
  where they exist (one MediaWiki query for 50 titles), and each page's section list
  (`action=parse&prop=sections`). A heading is kept when the years it names
  overlap the window (`heading_spans()`: ranges such as "1966–1979" or
  "1914–18", "c. 3000 BC – 500 AD" and "1999–present", centuries such as
  "19th century" or "16th–18th centuries", decades, single years). Up to 8,
  with links to the section.
- **`lookups`**: the open-API adapters (`ingest/lookup.py`: LoC, Smithsonian,
  Europeana, OpenAlex) for "History of <branch name>" around the middle of
  the window, scored and limited as every lookup is.
- `pages` (the pages read), `at`, `errors` (a source that failed; the rest
  are still kept), and `note`.

Every request goes through `ingest.http.Fetcher` and the source policy
([sources and terms](sources-and-terms.md)).

## What the agent sends back

The `fill-gaps` skill (`.claude/skills/fill-gaps/SKILL.md`) claims a task,
reads, and completes it over the agent API with one of
([the schema](work-queue-and-agents.md#results-validated-then-applied)):

- `{"decision": "written", "events": [1–3 events]}`, each in the
  `write_event` event shape, **on the task's branch** and **inside its
  window** (`y` in it, or a span overlapping it). The API refuses anything
  else with a 422. The events are created in `review`, as `write_event`'s
  are; their slugs go in `result.entries`.
- `{"decision": "nothing_notable", "note": "…"}` (a note of at least 20
  characters, and no events): nothing is written; the result is the record
  that keeps the job off that window for `retry_after_days`.

## The owner's command and the digest

| Command | What |
|---|---|
| `manage.py waves status` | Every wave: branches, branch-windows, the share covered, gaps (empty and sparse). Writes nothing. |
| `manage.py waves gaps [--wave W1] [--top 20] [--json]` | What the job would queue now, best first (a dry run, rolled back); with `--wave`, that wave's best gaps too. |
| `manage.py waves run [--per-day N]` | The job, once (as `run_job gap_waves`). |
| `manage.py waves advance [--to W3] [--by human:owner]` | Move the active wave. |

`manage.py digest` has a "Content waves" section (`digest_section()`): the
active wave, the last run's queued count and cap, and per wave its coverage,
gaps, open tasks, gaps held by the cap or the branch limit, and windows tried
recently.

## Changing it

| Change | What it needs |
|---|---|
| A wave's span or window | `DEFAULT_WAVES` (or `CONTENT_WAVES`). Windows change, so their keys change: queued tasks of the old windows are cancelled on the next run, and suppression starts over for the new ones. Bump `VERSION`, amend ADR 0026, update the table above. |
| A threshold | `DEFAULTS` (or `GAP_RULES`), the table rows here, and ADR 0026 when it changes what gets queued. `tests/test_waves.py` pins the fixture's gaps. |
| The daily cap | `FILL_GAP_TASKS_PER_DAY` in the environment; the default is in `config/settings.py`. |
| The priority bands | `priority()`, and the kinds table in [work queue and agents](work-queue-and-agents.md#the-kinds-of-task). Keep them under the other kinds' scales in mind: a token with every scope claims the highest priority first. |
| A payload key or the result | `payload()` or `agentapi/schemas.py` / `agentapi/apply.py` `fill_gap`, and the skill, in the same pull request. |
| A new pointer source | `governance/pointers.py`; its terms read first (rule 13, ADR 0013). |
