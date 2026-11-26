# 0001 — Postgres is the source of truth; the site reads static snapshots

**Status:** accepted (November 2026); amended by [0020](0020-the-cutover.md) (the cutover)

## Context

The timeline has been a static single-file site: content in `data/*.js`, written
by agents in sessions, validated and inlined into `timeline.html` by `build.mjs`.
It has outgrown files: about 5,400 events and 11,000 citations, with scrapers,
verification agents and branch-governance jobs to come, all of which need to
query, deduplicate, queue and audit content. The public page, meanwhile, must
stay fast, cacheable and impossible to take down by a database problem.

## Decision

Postgres is the authoritative store for all content and its evidence. The
public site never queries it. `manage.py publish` exports the published content
to a versioned static snapshot, `var/releases/<version>/content.json` (with a
sha256 content hash, a manifest and a `Release` row), and the site is built
from that snapshot (`node site/build.mjs --from-json …`), so a release is a set
of static files a CDN can serve.

During the transition, `site/data/*.js` stays editable and is brought in with
`manage.py import_legacy` (idempotent). The cutover, when files stop being
edited, is a later decision; the import and the export are exact inverses
(ADR 0007), so either side can be the editing surface until then.

## Consequences

- Reads cost nothing: no database, no API, no cold start in the page's path.
  A database outage stops editing, never reading.
- Releases are versioned and reproducible: the same rows give the same bytes
  and the same hash, so "has anything changed?" is a hash comparison, and a bad
  release is rolled back by serving the previous directory.
- Content reaches readers only on publish, not on save. That is a feature
  (review before release) but means a publish step in any workflow.
- Snapshots are build output: never edited by hand (AGENTS.md rule 1).
