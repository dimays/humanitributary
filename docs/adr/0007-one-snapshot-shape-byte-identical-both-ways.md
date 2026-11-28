# 0007 — One snapshot shape, byte-identical both ways

**Status:** accepted (November 2026); its last consequence amended by [0008](0008-entry-order.md); amended by [0018](0018-single-source-marker.md); amended by [0021](0021-the-cutover.md); amended by [0048](0048-event-images.md) (three more image keys, written only when set)

## Context

To trust Postgres as the source of truth, we must be able to show that nothing
is lost or changed between the legacy files and the database, and between the
database and the page. Comparing "roughly the same" content is not a proof.

## Decision

There is one canonical content shape, declared in `site/canonical.mjs` and
mirrored in `publish/content.py` (a test checks they match): every branch and
event with its keys in a fixed order, only the keys `SCHEMA.md` defines, lists
in their authored order, and `null` only where it means something (a branch's
`end`, meaning it continues; elsewhere null and absent are the same to the
page). The site's build writes this shape into `timeline.html` and into
`--dump-json`; `manage.py publish` writes it from Postgres with a JSON writer
that matches `JSON.stringify(…, null, 1)` byte for byte, numbers included.

The acceptance test (`make roundtrip`): dump → import → publish → the snapshot
equals the dump, normalized and byte for byte, and the pages built from each
are byte-identical.

Order is data: the page breaks ties in its sorts by array order, so entries
keep their legacy file order (as `Entry.sort_key`, ADR 0008).

## Consequences

- The round trip is a byte comparison, cheap enough to run on every change.
- Canonicalizing changed the legacy page slightly: one stray key the schema
  doesn't know (a `link` on one connection, in `g7-udhr`) and 13 `endWhen:
  null` values are left out of the page; the build prints the first as a
  warning. Neither was read by the page.
- A new content field is a change in three places (`SCHEMA.md`,
  `canonical.mjs`, `content.py`) plus the model and the import and export.
- Order follows the legacy files until the cutover. (Originally a position
  index, so removing an entry renumbered every entry after it; ADR 0008
  replaced it with a sort key that moves nothing else.)
