# Branch rules

Should this branch split, merge, end, or exist at all? The rules turn that
from a big-context judgment call into a short list of proposals an agent or
the owner confirms. They are deterministic (no LLM), named and versioned
(`branch-rules-v1`), one function each in `governance/rules.py`, with every
threshold in one dict, `governance/thresholds.py` (override with
`settings.BRANCH_RULES`). The decision record is ADR 0011.

```bash
manage.py branches metrics                 # a BranchMetric snapshot per branch (only when it changed)
manage.py branches review [--dry-run]      # run the rules → proposals + review_branch_proposal tasks
manage.py branches list | show <id>
manage.py branches apply <id> --ops final.json --agent agent:<you> [--task <id>]
manage.py branches reject <id> --note "why" --agent agent:<you>
manage.py branches revert <id> --agent agent:<you>
```

`review` and `metrics` are jobs (`job:branches_review`; weekly is plenty);
`apply`, `reject` and `revert` are decisions, taken by an agent or a human,
never by a job. The skill `.claude/skills/review-branch-proposals` walks an
agent through a `review_branch_proposal` task.

## Metrics

"Relative to era" means on the page's own time scale,
**s = −log10(years before now + 40)** (`sOf` in `site/template.html`): deep
time is compressed and recent centuries get the room, so a gap of 0.2 s is as
wide on screen in 500 BCE as in 1950. One s-unit is a factor of ten in
"years before now"; 0.1 s is 1500 → 1600, or 1960 → 1975.

Per published branch, from its published events (`governance/metrics.py`):

| metric | what |
|---|---|
| `events`, `span` | count; span in years and in s (an open end counts to now) |
| `windows` | events per decade, century, millennium … (by span) |
| `density`, `relative_density`, `peers` | events per s-unit, and against the median of branches in the same region and era (at least 5 peers, else the era, else everyone). A branch's era is the era at the middle of its span on the page. |
| `gaps` | the empty stretch before the first event, the longest inside (an event with an end covers its span), and the one after the last event to the end or now, in s and years |
| `phases` | runs of events separated by gaps ≥ 0.25 s |
| `links` | how many of its events link to each other branch (EventLink), and incoming links |
| `geo` | the events' centroid, mean distance from it (km), clusters (average-linkage, joining while the average distance is ≤ 2,500 km; locations vaguer than 1,500 km left out) each with a suggested macro-region name, and the branch's own TL.geo area (`extent`) |
| `structure` | parents, into, children |

`countries` (distinct countries via Wikidata P17) stays null until ingestion's
`Entity` rows carry countries; no rule needs it.

## The rules

Every finding has a **strength** (1.0 = exactly at its threshold), the
**evidence** it saw, and the exact **operations** that would apply it, with
the fields an agent must write first (`needs_agent`: names, texts, cites,
dates as written).

### SPLIT-PLACE-v1: regional child branches

A branch with ≥ 30 events whose events fall into ≥ 3 clusters of ≥ 5 events
(and ≥ 5% of them) that are ≥ 2,000 km apart, with ≤ 10% of the events
connected (TL.enrich) across clusters → create a child branch per cluster
(parent: the branch) and move each cluster's events there; events in no
significant cluster stay. A cluster outside the branch's own TL.geo area
(widened by 1.25) is events abroad (a treaty signed in London on Canada's
lane), not a region. Lanes meant to span the world (cosmos, life, humans,
global, faiths, culture) are exempt.

*Why:* a branch whose story happens in separate places, with little between
them, is several stories on one lane.

*Example (the test case):* before `data/91`, "Indigenous peoples of the
Americas" had 74 events in clusters North America (50), the Andes and Pacific
coast (9) and Mesoamerica (5), at least 2,486 km apart, with no connections
between them. The rule proposes exactly the owner's three regional branches
that took existing events: 42 of its 48 moves to Indigenous North America, 9
of 10 to the Andes, 4 of 4 to Mesoamerica (55 of 62 regional moves; the rest
have no usable location and stay on the root for the agent to place). The
owner's thematic "Indigenous rights movements" branch is not a place, so no
place rule can find it. Canada (33 events in eastern Canada, 9 in the west, 5
in London) is not proposed: London is outside Canada's area.

### SPLIT-TIME-v1: a successor branch

A branch with ≥ 30 events and either (a) two phases of ≥ 8 events (and ≥ 20%
of them each) separated by a gap ≥ 0.4 s, or (b) a date where its events'
place shifts sharply: the halves' centroids ≥ 3,000 km apart, each half with
≥ 10 located events and a mean spread ≤ half that distance → end the branch
at that date and continue on a successor (into link), moving the later
events.

*Why:* one name over two separate eras, or over a people who moved, hides
the break the reader should see.

*Example:* nothing fires on today's content. The nearest miss is First
Australians, in three phases: one event 40,000 years ago, five from 3000 BCE
to c. 1 CE, and 45 from 1606 (0.65 s after the second). Only the last has 8
or more events, so the early ones read as a thin beginning, not a phase.

### MERGE-OVERLAP-v1: one story told twice

Two branches whose spans overlap ≥ 60% of the shorter one (in s), whose
centroids are ≤ 800 km apart, and which **share** ≥ 25% of the smaller one's
events (at least 3), where shared means the event duplicates one of the
other's (title similarity ≥ 0.75 within two years) or cites a page the
other's events cite, and which are linked as parent / into (or share ≥ 50%
without a lineage link). Or: the smaller has < 15 events, sits ≥ 90% inside
the other's span and place, shares ≥ 25% (at least 2 events), with the same
lineage condition. A small successor (into link, starting within 0.01 s of
its predecessor's end, in the same place) joins the group: a renamed
continuation. → merge everything into the survivor (the one that continues,
else the one with most events) and stretch its start.

*Why:* contact is not sameness (neighbours at war link their events to each
other), so links do not count; the same happenings and the same sources do.

*Example (the test case):* before `data/90`, the ECSC (11 events) and the EEC
(12) overlapped completely in Brussels and Luxembourg; 5 of the ECSC's 11
events shared sources with the EEC's (europa.eu's history pages) or
duplicated them ("Denmark, Ireland and the UK join"), and the EEC was the
ECSC's successor. The EU (14 events) began the day the EEC ended, as its
`into`. The rule proposes `TL.merge("ecsc", "eu")` and `TL.merge("eec",
"eu")`: exactly the owner's operations. Not proposed today: East and West
Germany share sources for 6 of 16 events but are not one lineage; the EU and
the United Kingdom share 5 of 14 (Brexit) for the same reason.

### END-STALE-v1: an end date

A branch with ≥ 8 events whose last event leaves ≥ 0.6 s of its span empty
(to its end, or to now if it continues) → propose ending it at its last
event; or, if it continues, the agent rejects it and fills the gap instead.
Cosmos, life and human-origins lanes are exempt (their later story is on
other lanes by design).

*Example:* Indigenous Andes, whose last event is 1781 (Túpac Amaru II), 0.85 s
before now: its modern story moved to Indigenous rights movements in
`archive/site-data/91-first-americans.js`.

### NEW-BRANCH-v2: a branch nobody has yet

From ingestion's `new_branch_signal` candidates: an entity with no
`BranchEntity` mapping that appears in ≥ 5 distinct story clusters over ≥ 7
days, and that can be a branch (`ingest/branchable.py`): a sovereign state or
historical polity, a people, a conflict or movement running ≥ 2 years, an
international organization. Never a subnational unit (an instance, through
any chain of subclasses, of a first-level administrative division) or a
political party; those are counted as `NEW-BRANCH.not_a_branch`. → a new
branch named for it and a `map_entity` operation so new material routes to it,
under the parent its Wikidata relations name: what it replaces or follows
(P1365, P155, up to 3 steps back), what it is part of (P361), its country
(P17, unless it is a state), its class (P279, P31); the first that names
exactly one branch. With none, no parent, and the proposal says it needs
review. v1 chose the branch its co-mentioned entities routed to most, which
put El Salvador under Haiti (ADR 0021).

*Example:* the first ingestion run (November 2026) signalled 17 entities. v2
proposes nine: Somalia, the Netherlands, El Salvador, the International
Criminal Court, the full-scale Russo-Ukrainian war, the Gaza War and the
Middle Eastern crisis (2023–present) with no parent; the gang war in Haiti
under `haiti` and the Sudanese civil war under `sudan` (by P17). It refuses
Florida (subnational), the New Zealand National Party and the Bangladesh
Nationalist Party (parties), and five one-off or short events (the 2026
Brazilian general election, Operation Southern Spear, the 2026 Iran War, the
2026 French civil unrest, the 2026 European cold chain hacks).

### THIN-v1: a fill-in task, not a change

A branch spanning ≥ 0.15 s with a density ≤ 15% of its peers' median → an
`audit` task (dedupe `thin:<slug>`, not again within 90 days of the last one
finishing) listing its empty windows and existing events, for an agent to
write its missing landmark events.

*Example:* Indigenous Caribbean, 9 events, 11% of its peers' density; Non-avian
dinosaurs, no events at all.

## Proposals and hysteresis

`review` turns each finding into a `BranchProposal` (`rule_id`, `summary`,
`evidence`, `payload` = key, strength, operations, needs_agent) and a
`review_branch_proposal` task (dedupe `proposal:<id>`) whose payload has
everything needed to decide: the metrics, the events involved (ids, titles,
dates, places), the operations and how to decide. Then:

- the same change (same rule and branches) is never proposed twice: an open
  proposal is refreshed in place, its task too;
- an accepted or applied one is not proposed again;
- a rejected or reverted one comes back only after 180 days and with 1.5 × its
  strength at the time;
- undoing an applied change needs 2 × the usual strength (merging the children
  of an applied split; splitting the survivor of an applied merge);
- an open proposal whose rule no longer fires is withdrawn and its task
  cancelled.

## Applying and reverting

Applying is mechanical: the operations have the semantics of the legacy
files' restructure operations (`site/restructure.mjs`: `move`, `patch`,
`merge`, and `create_branch` for TL.add), run through the service layer in one
`revising()` block, in the site's order (creations, patches, merges, moves).
`apply` refuses while any `needs_agent` field still holds a placeholder or a
new branch has no cite. A merge points every reference to the old branch at
the survivor (events, event links, parents and into, connections, origin
links; location and image if the survivor has none; citations it lacks) and
retracts the old branch.

Since the cutover (ADR 0020) nothing imports over Postgres, so an applied
change stays applied until it is reverted.

`revert` undoes exactly the rows the apply transaction changed, newest first,
from their Revisions (before → after, via `jsonb_populate_record`), after
releasing what non-canonical tables hold on created rows (metrics, tasks,
routing). It refuses if any of those rows has changed since (`--force` to
override). Tested: apply then revert gives back a byte-identical snapshot.

## Validation

`scripts/validate_branch_rules.sh` replays the rules on the content as it was
before `data/90` and `data/91` (a dump of the frozen legacy files in
`archive/site-data/` without those two, in a scratch database) and compares
the proposals with the owner's decisions:

| | proposed | owner |
|---|---|---|
| First Americans (`data/91`) | SPLIT-PLACE: North America 50, Andes 9, Mesoamerica 5 | Indigenous North America, Mesoamerica, Andes (+ Amazonia, Caribbean with new events, + rights movements) |
| ECSC / EEC / EU (`data/90`) | MERGE-OVERLAP: merge ecsc → eu, eec → eu | the same |

On that state the rules propose three changes: those two and the Polynesian
split below.

**On today's content** they propose three changes and 13 fill-in tasks:

1. SPLIT-PLACE `polynesians`: Lapita & Polynesian peoples in western Polynesia
   (13 events), eastern Polynesia (13) and Hawaii (7), ≥ 2,816 km apart.
2. END-STALE `indigenous-andes`: no events after 1781.
3. END-STALE `indigenous-mesoamerica`: no events after 1901.

THIN: the Universe, the Milky Way, Sun & Solar System, the Moon, Fungi,
Non-avian dinosaurs, Homo heidelbergensis, Homo naledi, Homo floresiensis,
Homo sapiens, Writing & recorded history, Indigenous Amazonia and Indigenous
Caribbean.
