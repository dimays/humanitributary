# 0029 — A release's identity includes the page's inputs, so a page-only change publishes

**Status:** accepted (November 2026); amends [0001](0001-postgres-is-the-truth-the-site-reads-snapshots.md) ("has anything changed?" is two hashes); amends [0019](0019-processes-and-release-gates.md) (when publish makes a release)

## Context

`manage.py publish` compared the snapshot's sha256 with the newest `Release` row's and stopped with "Unchanged
since …" when they matched (ADR 0001: "has anything changed?" is a hash comparison). Since ADR 0024 the app serves
the release's own built page (`releases/<version>/timeline.html`) at `/`, so a change to `site/template.html` or to
the build (`site/build.mjs` and what it imports, `site/globe-assets.json` that it inlines) reaches readers only
through a new release, and with the content unchanged that took `publish --force`. A forced release looks the same as
any other in the change report (nothing added, changed or retracted), so nothing said why it was made. The built
page itself can't be compared: it carries the publish date ("Data compiled"), so it differs every day.

## Decision

- A release is identified by two hashes: `content_hash` (the snapshot's sha256, as before) and `page_hash`, a sha256
  over the page's inputs, `publish/release.py` `PAGE_INPUTS`: `site/build.mjs`, `site/canonical.mjs`,
  `site/restructure.mjs`, `site/template.html` and `site/globe-assets.json`, each as its name, a NUL, its bytes and a
  NUL, in that order (a missing optional file as its name and `-`). `Release.page_hash` (migration
  `publish/migrations/0003_release_page_hash.py`) and the manifest's `page_hash` record it.
- `publish` makes no release only when **both** hashes equal the newest Release's; a page-only change publishes
  without `--force`, through every gate (the `deterministic` gate is unchanged: two exports must give the same
  bytes). `--force` remains for a change the hash can't see.
- The change report (`publish/changes.py`) gains `page`: the compared release's page hash (`from`, null when not
  recorded), the new one (`to`) and `changed`; `changes.md` and the command say "page changed; content unchanged"
  (`page_summary()`). `publish --check` says it too, and `release.preview()` returns both hashes and whether a
  release would be made, for the operations console.
- Releases made before this have an empty page hash, so the first publish after it makes one release, reported as
  "page inputs not recorded for <version>; content unchanged".

## Consequences

- A template or build fix ships with `make publish` like a content change, and its release says what it was.
- A new file the build reads must join `PAGE_INPUTS`, or a change to it alone is invisible (the publishing chapter's
  "Changing it" says so). Changing the list changes the hash, so the next publish makes one release.
- `site/images/` and `site/outlines.js` are not inputs: the page references them and the app serves them from the
  slug (ADR 0024), so they change without a release, as before.
