# 0008 — Entry order is a sort key assigned once

**Status:** accepted (November 2026). Amends the last consequence of ADR 0007.

## Context

The page breaks ties in its sorts by array order, so the snapshot keeps entries in a fixed order (ADR 0007). That
order was `Entry.position`, the entry's index in the legacy files. An index is the wrong key for a list that changes:
removing one event from a data file shifted every later event down by one, and the import rewrote 2,255 rows (each
with a Revision) to say nothing had really moved. Agents writing entries in Postgres, splits that create branches,
and merges that retract them would all do the same.

Two ways out were considered:

- **Derive the order from content** (sort by branch, then date, then id). No stored key at all, but the snapshot's
  order would no longer be the legacy files' order, so today's snapshot and page would change and the round trip
  (dump → import → publish, byte for byte) would break until the build sorted the same way, which would itself
  change the page's tie-breaks.
- **A fractional index assigned once.** Each entry holds a key; a new entry gets a key between its neighbours'; no
  other key ever has to change. Chosen.

## Decision

- `Entry.sort_key` replaces `position`: a string of base-62 digits read as a fraction, compared byte by byte (the
  column uses the "C" collation, so Postgres and Python agree), unique per kind (a deferred constraint).
  `timeline/ordering.py` has `between(lo, hi)`, which always finds a key between two others (keys only grow a
  digit when about 60 entries have been put in the same gap), and `spread(n, …)`, which gives evenly spaced keys.
- The legacy import (`publish/legacy.py`) reconciles rather than renumbers: the longest run of entries whose keys
  are already in the dump's order keeps its keys (a longest increasing subsequence), and only the others (new
  entries, or ones the files moved) get keys in the gaps, without colliding with entries not in the dump. Deleting
  an entry writes nothing; inserting or moving one writes one key.
- `timeline.services.save_branch` / `save_event` append new entries at the end of their kind; `services.place(entry,
  after=… | before=…)` moves one, writing only its key.
- Migration `timeline 0003` gives existing rows evenly spaced keys in their old (position, slug) order, as
  `job:migrate`, so the snapshot is unchanged; `0004` drops `position`.

## Consequences

- `make roundtrip` stays byte-identical; on the real content, removing one event from the dump now leaves one
  Revision (its retraction) instead of 2,255.
- Keys mean nothing beyond order: never compare them to anything but each other, and never type one by hand (use
  `services.place`).
- The order of entries written in Postgres (not in the legacy files) is wherever they were placed; until the cutover
  the legacy files' order wins for the entries they contain.
