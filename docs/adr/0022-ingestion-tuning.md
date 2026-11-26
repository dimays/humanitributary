# 0022 — Ingestion tuned on its first run: a threshold from the data, a daily cap, routing by role, branches only where Wikidata says so

**Status:** proposed (November 2026); amends [0012](0012-ingestion.md); amends [0011](0011-branch-governance.md)

## Context

The first real ingestion run (November 26, 2026, on the main database) collected 844 candidates in 682 clusters.
436 clusters were at or over the `write_event` threshold of 45, a first guess (ADR 0012), and 150 tasks were queued
(the per-run limit): far more than agents can write well. Reading the tasks and the branch proposals showed:

- **Routing.** "Ukrainian attacks on the Russian shadow fleet" went to Libya (the attacks were in a Libyan port,
  which every item names twice: the port and the country), with Ukraine second; "2026 United States elections"
  got India as a second branch at 2% of the US score; "Gaza war" got Israel and Iran (the war's Wikidata country
  statement lists six states at full weight) and no Palestine, because the `palestine` branch was mapped only to
  the Palestinian National Authority, which no news item names.
- **New branches.** NEW-BRANCH chose a parent by co-occurrence (the branches the entity's stories touched most), so
  El Salvador went under Haiti (its troops are there), the Netherlands under Italy and the International Criminal
  Court under Sudan. It also proposed Florida (a US state) and two political parties.
- **Seeding.** `ireland` was mapped to the island (Wikipedia's primary topic for "Ireland"), not the state (Q27);
  `post-yugoslav-states` ("Former Yugoslav states") to SFR Yugoslavia, which it succeeds.

## Decision

**Threshold, by a stated method.** `WRITE_EVENT_THRESHOLD` (`ingest/process.py`) is set so that about the top
12.5% of clusters qualify (the middle of the 10–15% the owner asked for): the priority of the cluster at the 12.5th
percentile from the top on the first run's 682 clusters, routed by the new rules below, rounded down. That is
64.86 → **64**, which lets 95 clusters (13.9%) through. When the priority formula or routing changes, the threshold
is re-derived the same way, on the then-current data, and this ADR's numbers amended.

**A daily cap.** `settings.WRITE_EVENT_TASKS_PER_DAY` (default 20, env `WRITE_EVENT_TASKS_PER_DAY`; `--opt
per_day=` for one run): the `process` job creates at most that many new `write_event` tasks per local day, highest
priority first; the rest wait (`tasks_held_by_daily_cap` in the run's counts) and are created on a later day if
they still qualify. Refreshing open tasks isn't capped. On the first run's data: 95 qualify, 20 are created, 75
wait. At about 23 clusters a day once the backfill is done, ~3 a day qualify, well under the cap.

**Routing by role** (`ingest/routing.py`, replacing ADR 0012's "Σ role × weight × hit"):

- A branch's score for a candidate is its **strongest** mention, max over entities of role × mention × weight ×
  hit, plus 0.01 for each further entity that routes there (a tie-breaker). The sum counted a port and its
  country, or a list of politicians, several times.
- **Role** in the story: the portal item's story article (`topic_qid`, role `story`) and the item's own links 1.0;
  a name match 0.7; context topics above the story 0.5.
- **Countries split.** A place, organization or concept in n countries (P17, or P131) gives 0.6 / n to each; an
  event 0.6 / √n (it involves each of its countries, but a long participant list is weak evidence for any one);
  a person's citizenship 0.3 / n. An indirect hit through a concept or work (a sea, "U.S. state") is a **passing
  mention**, × 0.5. So the country of an event or place counts more than the citizenship of a person in the story.
- **A second branch needs a share.** A story's suggested branches (`routing.suggested`) are the top one and, of
  the next two, those with at least `LINK_MIN_SHARE` (35%) of its score.
- On the first run's data: the shadow fleet story → Ukraine, then Libya and Russia; the US elections → the US alone;
  the Gaza war → Israel and Palestine. `tests/test_ingest.py` `FirstRunTests` replays those candidates from a
  recording of the run (`tests/fixtures/ingest/first_run.json`, `tests/record_first_run.py`).

**Mapping corrections** (`routing.CORRECTIONS`, applied by every `seed_branch_entities` run; the two wrong rows are
also deleted by migration `ingest/migrations/0005_entity_relations_and_routing_corrections.py`): `ireland` → Q27 (never the island Q22890); `post-yugoslav-states` → the
seven successor states as members (never SFR Yugoslavia or Yugoslavia); `palestine` also → the State of Palestine
(Q219060), Palestine (Q23792), the Gaza Strip, the West Bank and the Palestinians (Q201190). Two guards keep the
same mistakes from recurring: a place whose country (P17) has the branch's name gives way to that country, and an
item that ended (P576/P582) within the first tenth of the branch's span is a predecessor, not the branch.

**NEW-BRANCH-v2** (`ingest/branchable.py`, `governance/rules.py`; `RULES_VERSION` branch-rules-v2):

- Only entities that can be branches are proposed: sovereign states and historical polities, peoples, conflicts
  and movements running at least two years, international organizations. Never a subnational unit (an instance,
  through P31/P279*, of a first-level administrative division) or a political party. Refusals are counted
  (`NEW-BRANCH.not_a_branch`) and listed in `branches review`'s output.
- The parent comes from Wikidata relations, first match naming exactly one branch: succession (P1365 replaces,
  P155 follows, up to three steps back), part of (P361, up to three steps), the country (P17, for what isn't itself
  a state), the class (P279, then P31). Otherwise no parent, and the proposal says it needs review (an agent
  writes `parents` too). Co-occurrence is never used.
- The relations come from a new hourly job, `entity_relations` (two SPARQL queries per 50 entities, cached on
  `Entity.relations` for 30 days), for the signals' entities and the items their relations name.
- On the first run's data `branches review` now proposes nine: Somalia, the Netherlands, El Salvador, the
  International Criminal Court, the full-scale Russo-Ukrainian war, the Gaza War and the Middle Eastern crisis
  (2023–present), all with no parent; the gang war in Haiti under `haiti` and the Sudanese civil war under `sudan`
  (both by P17). It refuses eight: Florida (subnational), two parties, and five one-off or short events.

## Consequences

- Far fewer tasks, and the best first; a long backfill reaches agents over several days.
- Scores are smaller (a strongest mention, not a sum), so `TOUCH_THRESHOLD` (0.6) now means "named, or a country
  of something named", as it was meant to.
- Routing still trusts Wikidata's P17, which is uneven on story articles (the ADF insurgency lists Uganda only).
  The role weights can't fix missing statements; BranchEntity mappings and agents' corrections can.
- Most new-branch proposals now have no parent. That is deliberate: an agent reading the proposal chooses one,
  rather than the rule guessing from the news.
- The 150 tasks queued by the first run (at threshold 45) are still in the main database's queue; this change
  doesn't cancel them (the owner decides).
