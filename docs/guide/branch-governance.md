---
title: Branch governance
summary: How fixed rules measure every branch and propose splits, merges, end dates and new branches, how a proposal is kept from flapping, and how an agent's decision is applied, rejected or reverted.
order: 70
covers:
  - governance/**
  - "!governance/migrations/**"
  - "!governance/waves.py"
  - "!governance/pointers.py"
  - "!governance/management/commands/waves.py"
  - tests/test_governance.py
  - scripts/validate_branch_rules.sh
---

Branches are the timeline's lanes: peoples, states, faiths, ideas. As events
arrive, a lane may come to hold two stories, two lanes may turn out to tell
the same one, or a lane may go quiet. A weekly job measures every branch and
applies fixed rules that *propose* such changes; an agent or the owner
decides each one, and applying a decision is mechanical and can be undone.

The decision is [ADR 0011](../adr/0011-branch-governance.md); the rationale
for each rule, with real examples, is in [branch rules](../branch-rules.md).
Every threshold lives in `governance/thresholds.py` `DEFAULTS` (a deployment
can override any of them with a `BRANCH_RULES` dict in settings; nested
dicts are merged key by key).

## The two tables

Neither table is canonical: a proposal changes nothing until it is applied
through the timeline's services, and those writes leave Revisions.

**BranchMetric**: one snapshot of a branch's shape. `branch`, `computed_at`,
`rules_version` (holds `METRICS_VERSION`, despite its name) and `metrics`
(JSON, below). `review.snapshot()` stores a new row only when a branch's
metrics differ from its latest row.

**BranchProposal**: one proposed change.

| Field | What |
|---|---|
| `kind` | `split`, `merge`, `end`, `new` (and `rename`, which no rule produces yet). |
| `branch`, `other_branches` | The branch it concerns (the survivor, for a merge; empty for a new branch), and the others involved. |
| `rule_id` | The rule that fired, e.g. `SPLIT-PLACE-v1`. |
| `summary`, `evidence` | One paragraph, and what the rule saw (clusters, gaps, shared events, with event ids, titles, dates, places). |
| `payload` | `key`, `strength`, `operations`, `needs_agent`, `rules_version`; later `accepted`, `applied`, `reverted` (proposals applied before the cutover may also hold `legacy_file`). |
| `status` | `proposed`, `accepted` (an agent accepted it over the API; waiting for the owner's apply), `rejected`, `applied`, `withdrawn`. |
| `created_by`, `decided_by`, `decided_at`, `decision_note` | Who and when. |

## Measuring a branch

`governance/metrics.py` `compute()` measures every **published** branch from
its **published** events, as of a date. Lengths of time are measured on the
page's own time scale:

```
s = −log10(years before now + 40)        (metrics.py C_YEARS = 40, as in site/template.html)
```

Deep time is compressed and recent centuries get the room, so a gap of 0.2 s
is as wide on screen in 500 BCE as in 1950. One s-unit is a factor of ten in
"years before now"; 0.1 s is about a 26% change (1500 → 1600, or 1960 →
1975). "Now" is today as a fractional year.

| Metric | What |
|---|---|
| `events`, `start`, `end`, `continues` | Count and dates; an open end counts to now. |
| `span` | In years and in s. |
| `era` | The era (`eras`: deep time, ancient from 3000 BCE, medieval from 500, early modern from 1500, modern from 1800, since 1945) at the middle of the span on the page. |
| `windows` | Events per window. The window is 10 years for a span up to 200 years, 100 up to 3,000, 1,000 up to 50,000, then a power of ten. |
| `density`, `relative_density`, `peers` | Events per s-unit, and its ratio to the median of the branch's peers: branches in the same region and era, or the same era, or everyone, whichever first has at least `min_peers` (5) branches with events. |
| `gaps` | `lead` (start to first event), `longest` inside, `trail` (last event to the end, or now), each in s and years. An event with an end covers its span. |
| `phases` | Runs of events separated by gaps of at least `phase_gap_s` (0.25 s). |
| `links` | How many of its events link to each other branch (EventLink), incoming links, and the top five as shares. |
| `geo` | Located events (places or regions within `geo_max_radius_km`, 1,500 km), their centroid and mean distance, the branch's own region location (`extent`), and clusters. Clusters are average-linkage: the closest pair joins while their mean distance is within `cluster_km` (2,500 km). Each cluster gets a suggested name from `MACRO_REGIONS` (only a label). |
| `structure` | Parents, into, children (BranchLink). |
| `countries` | Always null for now; no rule uses it. |

## The rules

`governance/rules.py` has one function per rule. A rule reads the metrics
and returns **findings**: a summary, the evidence, a **strength** (1.0 means
exactly at the threshold) and the exact operations that would apply the
change, with `needs_agent`, the fields an agent must write first. Rules never
write anything.

| Rule | Fires when (thresholds from `governance/thresholds.py`) | Strength | Proposes |
|---|---|---|---|
| `SPLIT-PLACE-v1` | Region not in `split_place.exempt_regions` (cosmos, life, humans, global, faiths, culture); ≥ `min_events` (30) events; ≥ `min_clusters` (3) significant clusters, each ≥ `min_cluster_events` (5) events and ≥ `min_cluster_share` (5%) of them and not abroad; clusters ≥ `min_separation_km` (2,000 km) apart; connections between clusters ≤ `max_cross_link_share` (10%) of the clustered events. | min(clusters / 3, closest separation / 2,000) | A child branch per cluster (parent: the branch), each cluster's events moved to it. |
| `SPLIT-TIME-v1` | ≥ `min_events` (30) events, and either (a) ≥ 2 phases with ≥ `min_phase_events` (8) events and ≥ `min_phase_share` (20%) each, and the widest gap between phases ≥ `min_gap_s` (0.4 s); or (b) a date where the located events before and after (≥ `min_side_events`, 10, each side) have centroids ≥ `min_shift_km` (3,000 km) apart, each side's mean spread ≤ `max_side_spread_ratio` (0.5) of that distance. | gap / 0.4, or distance / 3,000 | End the branch at the cut; a successor branch (an `into` link) takes the events from the cut on. |
| `MERGE-OVERLAP-v1` | Two branches with centroids ≤ `max_distance_km` (800 km) apart, sharing ≥ `min_shared` (25%) of the smaller's events, and linked as parent or into (or sharing ≥ `shared_without_lineage`, 50%); and either spans overlapping ≥ `min_overlap` (60%) of the shorter (in s) with ≥ `min_shared_events` (3) shared, or the smaller has < `small_events` (15) events, sits ≥ `contained` (90%) inside the other's span, with ≥ `small_min_shared_events` (2) shared. | max over pairs of shared / 0.25 | Merge the group into one survivor. |
| `END-STALE-v1` | Region not in `end_stale.exempt_regions` (cosmos, life, humans); ≥ `min_events` (8) events; trailing gap ≥ `min_trail_s` (0.6 s). | trail / 0.6 | An end date at the last event. |
| `NEW-BRANCH-v2` | An entity behind ingestion's new-branch signals, mapped to no branch, seen in ≥ `new_branch.min_clusters` (5) story clusters over ≥ `min_days` (7) days, that can be a branch (`ingest/branchable.py`: a state or historical polity, a people, a conflict or movement of 2 years or more, an international organization; never a subnational unit or a political party). | min(clusters / 5, days / 7) | A new branch for it, under the parent its Wikidata relations name (or none), and a `map_entity` operation so new material routes to it. |
| `THIN-v1` | `relative_density` ≤ `thin.max_relative_density` (0.15) and span ≥ `min_span_s` (0.15 s). | 0.15 / relative density | Not a proposal: an `audit` task to fill in the branch. |

Details the table leaves out:

- **SPLIT-PLACE.** A cluster is *abroad* when its centroid is farther from
  the branch's own region location than that region's radius × `abroad_factor`
  (1.25): a treaty in London on Canada's lane. If some significant clusters
  are closer than 2,000 km, the rule keeps, largest first, only those at
  least that far from every kept one, then counts again. "Connections" are
  `Connection` rows between two of the branch's own events. Events in no
  significant cluster stay. A child's id is `<branch>-<region name>`.
- **SPLIT-TIME.** (a) is tried first; (b) picks the cut with the largest
  distance. The successor's id is `<branch>-from-<year>` (`-<year>-bce`
  before year 0).
- **MERGE-OVERLAP.** *Shared* means a smaller-branch event that cites a page
  one of the other's events cites, or duplicates one of them (within two
  years and a title similarity, `difflib` ratio, ≥ `duplicate_title`, 0.75).
  An event linked to the other branch doesn't count: neighbours at war are
  linked, not the same. Pairs are joined into groups; a small successor (an
  `into` link, < 15 events, starting within `succession_gap_s`, 0.01 s, of
  its predecessor's end, ≤ 800 km away) joins the group. The survivor is the
  branch that continues, else the one with most events, else the latest end.
  If the group starts before the survivor, a patch stretches its start and
  joins the names ("A / B / C") for the agent to rewrite.
- **NEW-BRANCH.** Signals are ingestion's `new_branch_signal` candidates,
  queued or claimed, which `ingest/process.py` raises at a lower bar
  (`SIGNAL_MIN_CLUSTERS` 4, `SIGNAL_MIN_DAYS` 3). `review.new_branch_signals()`
  counts distinct cluster keys and the days from first to last document, and
  asks `ingest/branchable.py` whether the entity can be a branch
  (`can_be_branch`) and under which parent (`parent`, from its Wikidata
  relations: succession, part of, its country, its class; see
  [ingestion](ingestion.md#new-branch-signals)). An entity that can't be a
  branch is not proposed: it is counted as `NEW-BRANCH.not_a_branch` and
  listed in `branches review`'s output with the reason ("a political party",
  "a subnational unit", "an event that isn't …"). With no parent the proposal
  says it needs review, `parents` is empty, and `needs_agent` lists the
  branch's `parents` too. The parent is never chosen by co-occurrence (the
  first version did, and put El Salvador under Haiti and the Netherlands
  under Italy: [ADR 0022](../adr/0022-ingestion-tuning.md)). The region is the
  parent's, or `global`.
- **Placeholders.** Fields a rule can't know hold `TODO`
  (`rules.PLACEHOLDER`): every new branch's `text`, and NEW-BRANCH's
  `start_when`. New branches start with no cites.

## From findings to proposals

`governance/review.py` `review()` runs weekly as `job:branches_review` (the
`branches_review` job in `ingest/job_defs.py`, or `manage.py branches
review`), in one transaction:

1. Compute the metrics and every rule's findings.
2. Store a metric snapshot for each branch that changed.
3. Each THIN finding becomes an `audit` task (`_thin_task`): dedupe key
   `thin:<slug>`, priority 15, payload with the empty windows (up to 20)
   and up to 40 existing events. None is queued while one is open, or within
   `thin.fill_after_days` (90) of the last one finishing.
4. Every other finding goes through `_propose()` (next section). A proposal
   it creates or keeps gets a `review_branch_proposal` task (dedupe key
   `proposal:<id>`, priority 30 + min(20, ⌊10 × strength⌋)), whose payload
   is in [the work queue chapter](work-queue-and-agents.md#the-kinds-of-task).
   A queued task's payload is refreshed when the finding changes.
5. Every open proposal this job created whose finding didn't come up this
   run is **withdrawn** ("the rule no longer fires"), and its queued task is
   cancelled. A claimed task stays with its agent.

THIN looks at a branch as a whole. Content waves look at it window by
window: the daily `gap_waves` job reuses these metrics to find the windows in
which a branch has no event, or far fewer than its peers, and queues them as
`fill_gap` tasks ([content waves](content-waves.md)). Its code lives here
(`governance/waves.py`, `governance/pointers.py`, `manage.py waves`) and is
described in that chapter.

`--dry-run` does it all and rolls the transaction back. The result lists each
finding with what happened to it: `proposed`, `refreshed`, `unchanged`,
`already_decided`, `held_back`, or for THIN `queued`, `open`,
`recently_filled`.

## Keeping proposals from flapping

A rule sits near its threshold for a while, so without care a proposal would
appear, vanish and reappear from week to week. Three mechanisms prevent it.

**Every change has one identity.** A finding's `key` is the rule's name
without its version and the sorted slugs of the branches involved
(`SPLIT-PLACE:polynesians`, `MERGE-OVERLAP:ecsc+eec+eu`), or
`NEW-BRANCH:<qid>`. It is stored in `payload.key`, and `_propose()` looks up
every earlier proposal with the same key, newest first:

| Earlier proposals with this key | Result |
|---|---|
| One is open (`proposed`) | Refresh it in place if the summary, evidence, payload or rule id changed (`refreshed`; a rule's new version takes its open proposals over), else `unchanged`. Never a second proposal. |
| One was accepted or applied | `already_decided`: never proposed again. |
| The newest declined one (`rejected` or `withdrawn`) was decided less than `reject_cooldown_days` (180) ago | `held_back`. |
| … or the finding's strength is less than `reject_regrowth` (1.5) × that proposal's strength | `held_back`. |
| None of these | A new proposal. |

`withdrawn` covers both a reverted proposal and one the job withdrew because
its rule stopped firing. So a finding that drops below its threshold and
comes back is held back for 180 days, and then needs 1.5 × the strength it
had. That is the hysteresis: the bar to come back is higher than the bar to
go away.

**Undoing needs twice the evidence.** `review.Context` reads every applied
proposal. Branches from the same applied split (the original and its
children) are *siblings*: merging two of them needs `undo_factor` (2.0) ×
`min_shared` and × `shared_without_lineage`. The survivor of an applied merge
needs 2 × `min_clusters` to split by place again, and 2 × `min_gap_s` and
`min_shift_km` to split in time.

**A proposal waits for its decision.** An unchanged open proposal returns
before its task is re-queued, so if a task is completed without accepting,
applying or rejecting (from the CLI; the API's schema requires a decision),
no new task appears until the finding itself changes.

## Deciding a proposal

`apply`, `reject` and `revert` are decisions: `manage.py branches` refuses a
`job:` actor for them (only `agent:` or `human:`). An agent decides over the
agent API instead (the CLI stays for the owner), and the owner applies. The
`review-branch-proposals` skill walks an agent through it.

### Accepting, over the API

An agent claims a `review_branch_proposal` task and completes it with a
result its schema accepts (`agentapi/schemas.py`): the `proposal` id,
`decision` `accept` with the full `operations` and a `note`, or `reject` with
a `note`.
`agentapi/apply.py` `review_branch_proposal()` applies it inside the API's
`revising("agent:<name>", task=…)`, in the same transaction that completes
the task:

1. Lock the proposal. Refuse if it doesn't exist, if the task targets another
   proposal, or if it isn't `proposed`.
2. **Reject**: status `rejected`, with the decider, time and note.
3. **Accept**: `operations.validate()` the agent's operations (a problem is
   a 422, nothing is kept, and the task stays held), store them as `payload.accepted`
   (`operations`, `by`, `at`, `task`, `note`), and set the status to
   `accepted` with the decider, time and note.

An accepted proposal changes nothing yet. Structure changes reach the page at
once, so the owner runs `branches apply <id>`, which uses the accepted
operations. See [the work queue chapter](work-queue-and-agents.md) for the
API itself.

### Applying

`governance/operations.py` `apply(proposal, ops, actor=…, task=…)`:

1. Take the final operations: `--ops <file>` if given, else the ones an agent
   accepted it with (`payload.accepted.operations`), else the proposal's own.
2. `validate()` them. A `create_branch` needs `name`, `text`, `start_when`
   and `region` written (not empty, no `TODO`), at least one cite, and a slug
   not in use. A `patch` may not hold `TODO`. A `move` needs the event and its
   target branch (existing or created in the same ops); a `merge` needs both
   branches. An unknown op is refused. `needs_agent` fields that are not
   placeholders (a merge survivor's name, a split's `end_when`) are not
   checked: writing them well is the agent's job.
3. The proposal must be `proposed` or `accepted`.
4. Inside `revising(actor, reason="apply branch proposal <id> (<rule>): <note>",
   task=task)`, note the transaction id and the range of Revision ids, and
   run the operations in the static site's order: creations, patches,
   merges, moves, entity mappings.
5. Record `payload.applied` (`txid`, `revision_ids`, `at`, `by`,
   `operations`, the Revision count) and mark the proposal `applied`.

### The operations

The same operations as the static site's `site/restructure.mjs`, run through
`timeline.services`:

| Op | What it does |
|---|---|
| `create_branch` | `save_branch` as `published`; parent and into links; an `as_written` claim with the branch's name, dates, text and links; one `supports` evidence row per cite (method `agent_read`, checked by the actor, now). A cite that can't be cited (not https, a forbidden publisher) stops the apply. |
| `patch` | On a branch: `name`, `start`, `end`, `start_when`, `end_when`, `text`, `region`, `parents`, `into` (link lists are set exactly, in order; origin links are kept after them). On an event: `title`, `when`, `y`, `end`, `imp`, `text`, `link` (replaces its event links). Any other field is refused. |
| `merge` | Every reference to the old branch moves to the survivor: its events, event links, branch links pointing at it, connections, its location and image if the survivor has none, and its record citations the survivor lacks (appended). Links that would duplicate or point at itself are deleted. The old branch is retracted, not deleted. |
| `move` | `save_event(event, branch=…)`, and drop any event link to its new branch. |
| `map_entity` | A `BranchEntity` row (ingestion's routing, not canonical, so no Revision). Skipped if the entity isn't known. |

### Rejecting

`branches reject <id> --note "…"` sets a `proposed` or `accepted` proposal
to `rejected` with the decider, time and note, so the owner can turn down
operations an agent accepted; an agent rejects a `proposed` one by
completing its task with `decision` `reject`. The note matters: it is how
the owner tunes thresholds.

### Reverting

`revert(proposal, actor=…, force=False)` undoes an applied proposal from its
Revisions:

1. Read the Revisions of the apply's transaction, within its id range,
   newest first.
2. Refuse if any of those rows has a later Revision (someone changed it
   since), unless `--force`.
3. Inside a new `revising()` block, put each row back: an insert is deleted
   (after `_detach()` lets go of non-canonical rows that point at it, by each
   relation's own `on_delete`: metrics, tasks, routing, proposals); a delete
   is re-inserted from its `before`; an update sets the changed columns back
   from `before` (`jsonb_populate_record`).
4. Record `payload.reverted` and set the proposal to `withdrawn`, with
   "reverted by <actor>" appended to its note.

`tests/test_governance.py` checks that apply then revert gives back a
byte-identical snapshot.

Postgres is the only record of an applied change: nothing imports over it
since the cutover ([ADR 0021](../adr/0021-the-cutover.md)), so an applied
proposal stays applied until `branches revert`. (Before the cutover
`branches apply --legacy-file` also wrote the change into the legacy data
files; the flag and `operations.legacy_js()` are gone.)

## Versions

| Constant (`governance/thresholds.py`) | Value | Where it shows |
|---|---|---|
| `RULES_VERSION` | `branch-rules-v2` (v2: NEW-BRANCH proposes only what can be a branch, with parents from Wikidata) | Each proposal's `payload.rules_version`, the review's output, the digest section. |
| `METRICS_VERSION` | `metrics-v1` | Each metric's `version` and `BranchMetric.rules_version`. |

Each rule also has a version in its id (`SPLIT-PLACE-v1`, `NEW-BRANCH-v2`,
hard-coded in `governance/rules.py`). The hysteresis key drops it, so a bumped version
doesn't re-propose what was already decided.

## The branches command

`governance/management/commands/branches.py`:

| Subcommand | What |
|---|---|
| `branches metrics [--today D]` | Store a metric snapshot per changed branch; prints counts. |
| `branches review [--today D] [--dry-run] [--json]` | The rules, proposals and tasks, as `job:branches_review`. Prints one line per finding, or the whole result with `--json`. |
| `branches list [--status S]` | Proposals by id. |
| `branches show <id>` | One proposal with its payload and evidence, as JSON. |
| `branches apply <id> --agent A [--ops F] [--task T] [--note N]` | Apply. |
| `branches reject <id> --agent A [--note N]` | Reject. |
| `branches revert <id> --agent A [--task T] [--force]` | Revert. |

`governance.review.digest_section()` lists up to 20 open proposals and the
count of open THIN tasks in `manage.py digest`: the `proposed` ones and the
`accepted` ones waiting for the owner (marked "accepted: apply or reject").
`branches list --status accepted` shows the latter alone.

## Checking the rules against history

The thresholds were fitted to two of the owner's own restructurings: the
First Americans split (`archive/site-data/91-first-americans.js`) and the
ECSC/EEC/EU merge (`archive/site-data/90-restructure.js`), both in the frozen
legacy files. `scripts/validate_branch_rules.sh` replays the rules on the
content as it was before them:

1. Copy every archived data file except `90-*` and `91-*` into
   `var/history/site-data/`, and dump them (`node site/build.mjs --archive
   var/history/site-data --dump-json …`).
2. Create a scratch database (your database's name plus `_history`) in the
   Docker Postgres, dropped again on exit. Your own database isn't touched.
3. Migrate it, import the dump, run `branches review` (THIN lines hidden).
4. Compare: the SPLIT-PLACE proposal for `first-americans`, move by move,
   against the moves in data file 91; the MERGE-OVERLAP proposal for `eu`
   against the merges in data file 90.

Run it after changing a threshold or a rule. What it printed last time is in
[branch rules](../branch-rules.md).

## Changing it

| Change | What it needs |
|---|---|
| A threshold | `governance/thresholds.py` (or `settings.BRANCH_RULES`). If it changes what the rules propose, bump `RULES_VERSION`, run `scripts/validate_branch_rules.sh`, and update [branch rules](../branch-rules.md) and the table here. |
| A rule's logic | Its function in `governance/rules.py`. Bump its id's version if it changes what it finds, and `RULES_VERSION`. Tests in `tests/test_governance.py` (`RuleTests`). A new rule goes in `RULES`, with a row here and a section in branch rules. |
| A metric | `governance/metrics.py`; bump `METRICS_VERSION` (every branch then gets a new snapshot). `MetricTests` covers the scale and clustering. Content waves read `events`, `region`, `links`, `structure` and the event rows: check [content waves](content-waves.md) too. |
| The hysteresis | `review._propose()` and the `reject_*` and `undo_factor` thresholds. `ProposalTests` covers refresh, rejected proposals held back and withdrawal. A change of policy belongs in ADR 0011. |
| A new operation | `operations.validate()` and `run()`. Revert works from Revisions, so it needs nothing new unless the op writes non-canonical rows. |
| A new proposal kind or status | The model's choices and check constraints: a migration. |
