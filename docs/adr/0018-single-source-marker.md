# 0018 — A "single source" marker, and additive snapshot keys

**Status:** proposed (November 2026); amends [0007](0007-one-snapshot-shape-byte-identical-both-ways.md); amended by [0021](0021-the-cutover.md)

## Context

About half the events rest on one publisher (often Wikipedia alone). The owner approved keeping them on the page with
a quiet indicator rather than hiding them. The flag comes from the fact base, which the legacy files don't have, so it
can't satisfy ADR 0007's "a snapshot from Postgres equals a dump from the files, byte for byte" as written.

## Decision

- `manage.py publish` adds `"singleSource": true` to an event whose supporting evidence (stance supports or partial)
  on its record claim and that claim's atomic parts comes from exactly one independent witness
  (`evidence/independence.py`; all of Wikipedia is one). It is derived from the evidence rows alone, not from the
  date or a stored status, so the same database always gives the same snapshot. It is absent otherwise.
- `site/canonical.mjs` and `publish/content.py` list it last in the event's keys; the event panel in
  `site/template.html` shows a "Single source" note above the sources, in the panel's existing style. There is no
  filter toggle: the page has no filter controls to add it to.
- **ADR 0007's invariant, restated:** a release equals the legacy dump exactly, byte for byte, *on every key the
  legacy dump has*; keys listed in `publish/content.py` `ADDITIVE` are derived at publish time and compared
  separately. `compare_content` and `make roundtrip` drop them before comparing (the JSON and the pages built from
  each), and `make roundtrip` also builds the release itself.

## Consequences

- A future derived field follows the same path: add it to `ADDITIVE`, both key lists and `SCHEMA.md`.
- The first release after this change differs from the one before it by the marker (2,640 of 5,388 events on the
  current content).
