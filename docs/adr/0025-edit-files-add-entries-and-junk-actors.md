# 0025 — Edit files add branches, events and connections; the splitter rejects junk actors and keeps the old ones for the owner

**Status:** proposed (November 2026); amends [0023](0023-edit-files.md); refines [0009](0009-fact-base.md)

## Context

ADR 0023 gave a reviewer's verdicts one audited, all-or-nothing door, but only for entries that already exist: a
missing branch, a missing event or a connection a review asks for (round 1 asks for two) still went through the admin
or a shell, one row at a time, with whatever reason someone typed. An addition belongs with the verdicts around it:
an event on a new branch, or a connection to a new event, is only right if both land.

The atomic claim splitter (ADR 0009, `evidence/claims.py`) makes actor claims out of runs of capitalized words. On
the archive corpus it made 27,568, and about 2,000 of them aren't actors at all. Some open with an article or a
function word: "the March" ("After the March 1983 election") and "the Franks"; on the hosted data, "of March" on the
Tōhoku event. "U.S." became "U" and "S". Some are fragments left when a leading word was stripped as a function
word: "Zealand" (34), "York" (31), "South Wales", "Kingdoms", "World War". Others are lone common words ("Literature",
"Republic", "Games", "War", "People") or a hyphenated adjective ("US-led"). Each one is a claim an agent may be sent to
verify. The sweep deletes a part that disappears and has no evidence (ADR 0009). With a fixed splitter, the next
daily sweep would delete about 2,000 claims without anyone having decided to.

## Decision

- **Three new ops** in `timeline/edits.py`, checked and applied like the others (`check()` first, then one
  transaction, a nested `revising()` per op, `--dry-run` and `--validate-only`):
  - `add_branch`: `branch` in SCHEMA's Branch keys, with `cites`, plus an optional `origin` (TL.origin, `how` from
    `BranchLink.How`) and `geo` (TL.geo). The ops write rows the way the loader (`publish/legacy.py`) does: parents,
    into and origin links become `BranchLink`s, and the `as_written` and `origin` record claims get the cites.
  - `add_event`: `event` in SCHEMA's Event keys (`link` or `links`, `cites`), plus `geo`.
  - `add_connection`: `entry`, `to`, `note` (≤ 90). The snapshot writes connections only beside "why it matters"
    (`publish/export.py`), and the why claim's cites support every note (TL.enrich). An entry without a why
    therefore needs `why` (≤ 700) and `cites` in the op, and the why claim must end with a supporting cite.
  - A new branch or event is created in `review`. `status: "published"` moves it through `publish_entry`, as
    `approve` does, so the publishing rule (ADR 0010) and an `override` note apply. An id that already exists is a
    problem, not an upsert.
  - Ops run in order, and any op may name an entry, branch or link target that an earlier op in the file adds. A
    reference to one added later is a problem. The region and every other target must already exist.
- **The splitter rejects junk actors.** `claims.junk_actor(name)` gives a reason or None: an article or function word
  first, a single letter, a month, day or season (or a name ending "of <month>"), a lone word in `COMMON_WORDS`, a
  hyphenated adjective, a possessive mark, or a sentence-opening participle before a people or a month. `actors()`
  also strips leading lowercase articles. It keeps "New", "Great", "Old" and, before a common noun or a plural, an
  ordinal or number at the front of a name (`NAME_PREFIXES`). It allows two connectors ("Republic of the Congo")
  and an "al-" before a run. `COMMON_WORDS` is collected from the corpus's own junk. Institutions that act
  (Congress, Parliament, the Crown, Labor) stay out of it. Regression tests use real entries
  (`tests/test_junk_actors.py`).
- **Existing junk is kept and reported, never removed by a job.** `claims.sync()` leaves alone an actor claim that
  the rules reject: either `junk_actor(name)` rejects it, or, with the names it now derives, it is a fragment of
  one ("Zealand" beside "New Zealand"). Such a claim is not deleted or marked for recheck, whether or not it has
  evidence, and is counted as `junk_kept`. `manage.py facts sweep --junk-actors --dry-run` (`sweep.junk_actors()`)
  reports them by reason, with how many have no evidence of their own and a sample. It writes nothing and refuses
  without `--dry-run`, and there is no deleting mode. Other disappeared parts follow ADR 0009 as before.

## Consequences

- A review's additions are reviewable in the same dry run as its verdicts. Running an add file twice fails on the
  ids that exist and writes nothing; it isn't the silent no-op that a repeated approve is.
- On the archive corpus, the next sweep creates 1,296 actor claims ("New Zealand", "al-Qaeda", "Three Kingdoms",
  "First World War" …). It updates 41 claims whose key stays and name changes (a possessive mark gone) and deletes
  26 real names that fall past the eight-actor cap. It keeps 2,001 junk claims, none with evidence (`junk_kept`,
  and the report's count). The hosted data will differ; run the report there first.
- Junk claims stay in the fact base and in the health report's counts until the owner decides. Removing them is a
  later decision: a deliberate, reviewable change, probably an edit-file op or a one-off command with its own reason.
- `COMMON_WORDS` is a list, so a name that is also a common word ("Labor" the party, "Crown") is a judgment call.
  Each such call should come with an example in the tests. The rules are deterministic and context-free except for
  the fragment check, which looks only at the same entry's names.
- Connections still have no op to remove or reorder them, and "why it matters" text has no op to edit it. Revisit
  when a review asks.
