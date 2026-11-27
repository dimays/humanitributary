# 0026 — Content waves: gaps found window by window, newest history first, queued as fill_gap tasks under a daily cap

**Status:** proposed (November 2026); refines [0011](0011-branch-governance.md); refines [0017](0017-agent-api.md); amended by [0027](0027-caps-after-round-3.md)

## Context

The owner's content strategy has three parts: the current year first (ingestion does this: ADR 0012, ADR 0022);
then a detailed global picture of the last 500 years, filling gaps and bridging periods; then deeper history in
gradual waves. Before launch, overnight agent runs did the second and third parts by hand, era by era, with wider
windows for faiths, philosophies and culture. Nothing on main measured where the timeline is thin in time, or
queued that work for agents.

The branch rules' THIN rule (ADR 0011) looks at a branch as a whole: it fires only when a branch is much sparser
than its peers over its whole span, and its `audit` task asks for up to 30 events at once, with no skill and no
window. On the archive's content (386 branches, 5,388 events) THIN finds a handful of branches. Measured window
by window from 1925 to the start of this year, 334 of 2,085 branch-windows (16%) have no event at all.

## Decision

**Waves, as data.** `governance/waves.py` `DEFAULT_WAVES` (a deployment may set `settings.CONTENT_WAVES`): W1
1925 to the start of the current year in 5-year windows, W2 1800–1925 in 10, W3 1500–1800 in 25, W4 1000–1500 in
50, W5 1000 BCE–1000 CE in 100, W6 3500–1000 BCE in 250. Branches in the `faiths` and `culture` regions use
windows four times wider (`wide_factor`), as the pre-launch waves did; `cosmos`, `life` and `humans` are exempt.
A tail shorter than half a window joins the last one.

**A gap** is a window in which a published branch, alive for at least half of it, has no published event
(`empty`), or fewer than `density_floor` (0.34) × the median of its peers alive in the same window (`sparse`; the
peers are the other branches of its region, or every branch when the region has fewer than three, and their
median must be at least 3). Detection reuses the branch rules' metrics (`governance.metrics.compute`). Thresholds
are in `governance/waves.py` `DEFAULTS` (or `settings.GAP_RULES`).

**Tasks.** The daily `gap_waves` job (`ingest/job_defs.py`) queues `fill_gap` tasks (a new `AgentTask` kind) for
the gaps of the active wave and every wave before it, best first: wave (recent first), then branch importance (the
mean percentile rank of its published event count, its link degree and, where ingestion knows them, its Wikipedia
pageviews), then the length of the silence around the window. Priority is 10–69: a band of ten per wave plus the
importance. At most `settings.FILL_GAP_TASKS_PER_DAY` (20, env `FILL_GAP_TASKS_PER_DAY`) new tasks a day, counted
like `write_event`'s cap (ADR 0022), and one open task per branch, so each agent sees the previous one's events
and the day's tasks are spread across branches. The payload carries the branch (text, span, region, lineage,
links, id prefixes, cited Wikipedia articles, Wikidata items), the window, and the published events just before
and after it.

**Recently attempted windows are left alone.** The window's last task is the record: none is queued for 180 days
after an agent reports `nothing_notable`, 60 days after it wrote events (they wait in review, and the window
counts as a gap until one is published), 30 after a failure. A queued task whose window filled is cancelled. No
new table: the queue's history is enough, keyed by `gap:<branch>:<from>:<to>`.

**The active wave** is kept in `JobState` "gap_waves". It advances when what is left of it (open tasks plus gaps
held back by the caps) is below `advance_below` (5), and the same run queues the next wave's first gaps; the
owner can move it with `manage.py waves advance [--to W3]`. Counting held gaps keeps the daily cap from making a
wave look finished while most of it is still waiting.

**Pointers, not evidence.** The hourly `gap_pointers` job (`governance/pointers.py`) adds, through the one
`Fetcher` and the source policy (ADR 0013): the headings of the branch's "History of X" / "Timeline of X" pages
on Wikipedia whose years overlap the window, and lookup-adapter hits (LoC, Smithsonian, Europeana, OpenAlex) for
"History of <branch>" around it. They are marked as unread suggestions. Detection itself makes no requests.

**The agent API** (refining ADR 0017): `fill_gap` results are `{"decision": "written", "events": [1–3 events in
the write_event event shape]}` or `{"decision": "nothing_notable", "note": "…"}`. Each event must be on the task's
branch and inside its window, or the API refuses it (422). Written events are created in `review`, as
`write_event`'s are; nothing is published. A token is scoped with `--scope fill_gap`. The `fill-gaps` skill
(`.claude/skills/fill-gaps/SKILL.md`) carries the lessons of the first two review rounds: verbatim excerpts, the
branch's existing id prefix, titles of at most 60 characters, a duplicate search before writing, and contested
claims attributed.

**The digest** has a "Content waves" section: the active wave, the last run's queued count, and per wave its
coverage, gaps, open tasks, gaps held by each cap and windows tried recently.

## Consequences

- Agents can be pointed at the timeline round after round without anyone choosing what to write next: the queue
  says which branch and which window, with what is around it.
- At 20 tasks a day, W1 alone (334 gaps on the archive's content, more where the hosted database has more
  branches) takes two to three weeks of daily rounds before W2 starts. Raising the cap is an environment change.
- Events written into a gap stay in review until the owner publishes them; until then the window is still a gap,
  held off for 60 days. If review falls behind by more than that, the window is queued again: the `before` /
  `after` events in the payload don't show review entries, so the skill tells agents to search for duplicates.
- One open task per branch serializes a branch's gaps: a branch with ten empty windows gets them one at a time,
  newest-ranked first. That trades speed on one branch for coherence and breadth.
- Changing a wave's windows changes the gaps' keys: queued tasks of the old windows are cancelled, and the
  recently-attempted memory starts over for the new windows.
- `sparse` gaps are rare on today's content (peers' medians are mostly one event a window); they matter more as
  the timeline fills. Revisit `density_floor` and `min_peer_median` then, and the importance weights once pageviews
  are known for most branches.
- THIN's `audit` tasks stay as they are for whole-branch fills; the two can overlap on a thin branch, and an
  agent working one should search before writing.
