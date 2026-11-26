# 0020 — The cutover: Postgres is the only source of truth, and the legacy files are frozen

**Status:** proposed (November 2026); amends [0001](0001-postgres-is-the-truth-the-site-reads-snapshots.md); amends [0007](0007-one-snapshot-shape-byte-identical-both-ways.md); amends [0018](0018-single-source-marker.md); amends [0019](0019-processes-and-release-gates.md); amends [0011](0011-branch-governance.md); amends [0017](0017-agent-api.md)

## Context

ADR 0001 left the cutover for later: until then `site/data/*.js` stayed editable and `make import` brought it into
Postgres with `--retract-missing`. That made the files the real record. Anything written into Postgres alone (an
event an agent wrote over the API and the owner published, a branch proposal applied without `--legacy-file`) was
retracted or undone by the next import, and the release gate's round trip compared each release with a dump of the
files, so content that existed only in Postgres blocked `make publish`. With agents now writing through the API
(ADR 0017), the files have to stop being a second source.

At the cutover the files and Postgres held the same content: `import_legacy` on a copy of the main database wrote 0
rows, and the first release published from Postgres alone (386 branches, 5,388 events) equals a dump of the files
byte for byte on every key the files have (`singleSource` aside, ADR 0018), as did the release before it.

## Decision

- **The legacy files are frozen.** `site/data/` moved to `archive/site-data/`, with the tools that read or rewrote
  it (`apply-fixes.mjs`, `verify-geo.mjs`, `fetch-images.mjs`, …) in `archive/site-tools/` and a README.
  `publish/legacy.py` `ARCHIVE_SHA256` is the archive's hash; a test fails if it changes.
- **The page is built only from published snapshots.** `node site/build.mjs` needs `--from-json <snapshot>`;
  `make build` is `make build-release`. `--archive [dir]` still reads the frozen files, only to dump or check them
  (never to build a page), for `manage.py import_legacy --archive` (`make import-archive`). `build-outlines.mjs`
  and `build-paleo-points.mjs` read the latest mirrored snapshot.
- **`make import` and `make dump` are gone.** `import_legacy` loads a content file (a release snapshot, e.g. into
  a fresh database) or, with `--archive`, the frozen files. Nothing runs it on a schedule or in `make` targets
  other than `make import-archive`, which is for empty databases: CI uses it, because the real content is in
  Postgres and not in git.
- **Release gates after the cutover** (`publish/gates.py`, replacing ADR 0019's gate 3, the round trip against
  the legacy dump; `publish --legacy` is removed):
  1. *deterministic*: two exports of the same rows give the same bytes;
  2. *build*: `build.mjs --from-json … --check` passes, the build reads the snapshot back byte for byte, and builds
     the page;
  3. *contested*: as before (ADR 0010);
  4. *report*: the change report against the release readers have is computed (`publish --check` prints its
     totals) and is in the store before the pointer moves.
- **The round trip is DB → snapshot → DB.** ADR 0007's invariant is restated: a snapshot loaded into an empty
  database exports to the same bytes (derived keys included), and loading it again writes nothing
  (`tests/test_import_and_roundtrip.py`, on the fixture). `make roundtrip` is `publish --check` on your
  database's content; `make check-pr` runs it as its "release gates" lane. ADR 0018's additive keys are now
  simply derived keys: never stored, ignored by the loader. `compare_content` compares any two snapshots
  (`--drop-derived` to leave those keys out).
- **Branch operations stay in Postgres.** `branches apply --legacy-file` and `operations.legacy_js` are removed
  (amending ADR 0011's "until the cutover"): an applied proposal is undone only by `branches revert`.
- Skills and docs no longer tell anyone to carry content into `site/data/`.

## Consequences

- Postgres (with its Revisions) is the only record of content. Backups of the database now matter as much as the
  releases; a fresh database can be filled from the latest release (`import_legacy var/releases/latest/content.json`),
  losing only what releases don't carry (drafts, entries in review, evidence that isn't shown, review state).
- The tools that edited files (citation audits, the geo check, image picks) have no Postgres equivalent yet; until
  they do, those jobs are done through the service layer or the admin.
- CI's release-gate lane runs on the archive corpus, not on today's content, so it tests the code, not the data.
  The owner's `make check-pr` and `make publish` run the gates on the real content.
- The record claim's citations were the import's to own (AGENTS.md rule 7, the agent API refuses new evidence
  there). Nothing overwrites them now; whether agents may add sources to the record claim directly is left to a
  later decision.
