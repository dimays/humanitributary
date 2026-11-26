# The legacy content, frozen

Until November 2026 the timeline's content lived in `site/data/*.js`, written by agents in sessions and imported
into Postgres with `make import`. At the cutover ([ADR 0021](../docs/adr/0021-the-cutover.md)) a final import
brought them in (it wrote nothing: Postgres already held exactly this content), and the files moved here. **Postgres
is the only source of truth now**: content changes go through the service layer (`timeline.services`, the agent
API, the admin), and the page is built only from published snapshots (`make build`).

Nothing here is edited again. `tests/test_import_and_roundtrip.py` holds the archive's hash
(`publish/legacy.py` `ARCHIVE_SHA256`) and fails if a file changes, appears or disappears.

| Path | What |
|---|---|
| `site-data/` | The 70-odd content files (`TL.add`, `TL.cite`, `TL.geo`, `TL.enrich`, `TL.image`, `TL.origin`, `TL.move` / `patch` / `merge`), as they were at the cutover. |
| `site-tools/` | The tools that read or rewrote those files (`apply-fixes.mjs`, `apply-enrich-fixes.mjs`, `verify-geo.mjs`, `fetch-images.mjs`, `image-candidates.mjs`, `sample-cites.mjs`) and the content audit's report (`OVERNIGHT-REPORT.md`). Retired: they look for a `data/` folder beside themselves, which no longer exists, so they can't rewrite anything. Their work is done in Postgres now. |

The archive is still read in three places, all explicit:

- `node site/build.mjs --archive [dir] --dump-json out.json` resolves the files into the snapshot shape (`--check`
  validates them). The page can't be built this way.
- `manage.py import_legacy --archive` (`make import-archive`) loads that dump into a database: CI does this to give
  the release gates a realistic corpus, since the real content is in Postgres, not in git. On a database people
  have edited it overwrites their edits on every entry the archive has, so it's for empty databases.
- `scripts/validate_branch_rules.sh` replays the branch rules on the content before two of the owner's
  restructurings (`90-restructure.js`, `91-first-americans.js`).
