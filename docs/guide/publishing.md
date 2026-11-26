---
title: Publishing
summary: How published content leaves Postgres as a versioned static snapshot, how the page is built from it, how the legacy files are imported, and the round trip that proves nothing is lost either way.
order: 90
covers:
  - publish/**
  - "!publish/migrations/**"
  - site/build.mjs
  - site/canonical.mjs
  - site/template.html
  - evidence/publishing.py
  - tests/test_import_and_roundtrip.py
---

Readers never touch the database. `manage.py publish` writes the published
content to a versioned file, a **snapshot**, and the single-file page is built
from that file, so a release is a set of static files that any web server can
serve. Content reaches readers only when someone publishes, not when a row is
saved.

Until the cutover, the old content files in `site/data/` are still edited too,
and an import brings them into Postgres. The import and the export are exact
inverses: the same content gives byte-identical JSON and pages either way
([ADR 0001](../adr/0001-postgres-is-the-truth-the-site-reads-snapshots.md),
[ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md)).

## The path from rows to readers

| Step | Command | Reads | Writes |
|---|---|---|---|
| Dump the legacy files | `make dump` (`node site/build.mjs --dump-json var/legacy.json`) | `site/data/*.js` | `var/legacy.json` |
| Import them | `make import` (`manage.py import_legacy var/legacy.json --retract-missing`) | the dump | Postgres rows, with Revisions |
| Publish | `make publish` (`manage.py publish`) | `published` rows | `var/releases/<version>/content.json` and `var/releases/<version>/manifest.json`, the `var/releases/latest` link, a `Release` row |
| Build the page | `make build-release` (`node site/build.mjs --from-json var/releases/latest/content.json`) | the snapshot | the page, timeline.html in `site/` |

`make import` runs the dump first. `make build` is the legacy path: it builds
the page straight from `site/data/*.js`.

## What is published

An entry reaches the snapshot only when its status is `published`
(`publish/export.py` `build_content`). From there:

- An event goes out only if its branch is published too.
- A link (`parents`, `into`, an origin link, an event's `link`, a connection)
  goes out only if the entry it points at is published. A retracted parent
  disappears from its children's `parents`.
- A citation goes out only where the evidence supports the claim:
  `SHOWN_STANCES` is `supports` and `partial`. Evidence an agent marked
  `conflicts` or `unrelated` stays in Postgres but off the page.

### The publishing rule

Becoming `published` is a separate step, with a rule
([ADR 0010](../adr/0010-publishing-rule.md)). `evidence/publishing.py`
`problems(entry)` lists what stands in the way:

1. **A contested claim without a "sources differ" note.** For each top-level
   claim of the entry whose status is `contested`, the entry's text and dates
   (or its `why`, for the `why` claim) must say that the sources differ. That
   means matching `sources_differ` in `evidence/policy.py` ("sources differ",
   "estimates vary", "debated", "disputed" …), or naming two or more sources
   with the `attribution` words ("says", "according to" …).
2. **An event with no supporting source other than Wikipedia.** It applies
   when the event's `as_written` claim has no evidence at all, or when every
   supporting citation is Wikipedia. The exception: an event dated this year
   or last may be published on Wikipedia alone for `grace_days` (14, in
   `evidence/policy.py`) after its entry was created.

`publish_entry(slug, override="")` is the door. It must run inside
`revising()`, refuses with `PublishBlocked` and the list of problems, and with
an override note publishes anyway, adding "published despite: … — <note>" to
the Revision's reason. From the shell:

```bash
uv run python manage.py facts check <slug>                                   # the problems, without publishing
uv run python manage.py facts publish <slug> --agent agent:<name> [--task 42] [--override "why"]
```

The rule is enforced at that door, not by the database:
`timeline.services.set_status` and the admin can still set `published`
directly. The legacy import doesn't apply it either: it writes new entries as
`published`, mirroring the files. Agents must use `facts publish`
(AGENTS.md rule 11). How claims get their status is in
[evidence and fact-checking](evidence-and-fact-checking.md).

## The snapshot format

`var/releases/<version>/content.json` is `{"branches": [...], "events": [...]}`,
in the one canonical shape (see [the content model](content-model.md)). It is
written so that a snapshot exported from Postgres and a dump from the legacy
files of the same content are the same bytes and hash the same.

`publish/content.py` holds the Python side:

| Name | What it does |
|---|---|
| `KEYS` | The key order for each kind of object (branch, event, cite, origin, origin link, geo, image, connection). Must equal `site/canonical.mjs` `KEYS`; `read_js_keys()` parses the JavaScript file so a test can compare them. |
| `dumps(value)` | JSON exactly as `JSON.stringify(value, null, 1)` writes it: one space of indent per level, `[]` and `{}` for empty containers, non-ASCII kept as is, and a final newline. |
| `js_number(x)` | A number as JavaScript prints it: whole numbers without `.0`, the shortest round-trip digits, and exponent form only at 1e21 and above or below 1e-6 (`-13.8e9` → `-13800000000`, `1e-7` → `1e-7`, `1e21` → `1e+21`). NaN and infinity print as `null`. |
| `num(x)` | A stored double as the snapshot writes it: a whole number becomes an int, since JavaScript has no `2.0`. |

`site/canonical.mjs` `canonicalContent()` is the JavaScript side: it picks the
known keys in order, keeps `null` only for a branch's `end`, and drops (and
counts) unknown keys, which the build reports as a warning.

### From rows to the snapshot

`publish/export.py` `build_content()` writes branches and events in
`sort_key` order (ties by slug):

| Snapshot key | From |
|---|---|
| `id`, `text` | `Entry.slug`, `Entry.text` |
| branch `name`, `region`, `start`, `end`, `startWhen` | `Branch` (`region` is the region's slug; `end` is always written, `null` if it continues) |
| branch `endWhen` | `Branch.end_when`, only when it isn't null (`""` is written) |
| `parents`, `into` | `BranchLink` by relation, in `position` order |
| `origin` | written when `origin_note` isn't null: the note, origin links in `origin_position` order (`id`, `how`, `note`), and the `origin` claim's citations |
| event `branch`, `y`, `when`, `title`, `imp` | `Event`; `end` only when set |
| event `link` | the first `EventLink` by position |
| `cites` | the `as_written` claim's shown evidence in `position` order: `t` = `cited_title`, `u` = the citation's URL, `k` = `cited_kind` when set |
| `geo` | `Location`, without null fields (`radius_km` → `r`) |
| `images` | `Image` in `position` order (`width`/`height` → `w`/`h`), without null fields |
| `why`, `connections`, `whyCites` | only when `Entry.why` is set: the text, `Connection` rows in order, and the `why` claim's shown evidence |

`t` is the title as the entry cites it (`Evidence.cited_title`), not the
citation's stored title, so two entries can cite one URL under different
titles.

## Releases

`publish/release.py` `publish(actor, notes, force)` does the work behind the
command:

1. Builds the content and its bytes with `dumps()`, and their sha256.
2. If the newest `Release` has the same hash, stops: nothing new is written
   and the command prints "Unchanged since <version>". `--force` makes a new
   release anyway.
3. Picks the version `YYYY.MM.DD.N`: today's date, and N one more than the
   releases already made today (`_next_version`).
4. Writes `var/releases/<version>/content.json`, creates the `Release` row,
   writes `var/releases/<version>/manifest.json`, and points the symlink
   `var/releases/latest` at the new directory.

```bash
uv run python manage.py publish [--notes "…"] [--actor job:publish] [--force]
```

| `Release` field | What |
|---|---|
| `version` | `YYYY.MM.DD.N`, unique |
| `created_at`, `created_by` | when, and `--actor` (default `job:publish`) |
| `content_hash` | sha256 of the snapshot file's bytes |
| `snapshot_path` | relative to `VAR_DIR` (`config/settings.py`): `releases/<version>/content.json` |
| `counts` | branches, events, citations, distinct URLs, locations, images, connections, origins |
| `revision_high_water` | the newest Revision id when it was published: everything after it is "changed since this release" |
| `notes` | `--notes` |

The manifest repeats the version, hash, creation time, counts and high-water
mark, with `SITE_NAME` and the notes. `Release` isn't a canonical table:
publishing needs no `revising()` and leaves no Revision. Releases are
read-only in the admin.

**Note:** the directory is created before the `Release` row, and with
`exist_ok=False`. If a publish fails after creating it, the database rolls
back but the directory stays, and the next publish that day picks the same
version and fails on it. Delete the empty or partial directory and publish
again.

> **Pending: parity branch.** Release gates (checks a release must pass
> before it is made), snapshots in object storage instead of `var/releases/`,
> and the deploy of the built page to a CDN; update this section when it
> merges.

## Rolling back

There is no rollback command. What the code supports:

- **Build an older release.** Every release keeps its own directory, so
  `node site/build.mjs --from-json var/releases/<version>/content.json` builds
  the page as it was then.
- **Repoint `latest` by hand.** `make build-release` reads
  `var/releases/latest/content.json`, so pointing the symlink at an older
  version makes the next build use it. `publish` compares with the newest
  `Release` row, not with the symlink: while the content is unchanged, it
  leaves the symlink alone; the next real change makes a new version and
  points `latest` at it again.
- **Fix the rows.** A rollback of the page doesn't change Postgres, so the bad
  content comes back on the next publish. Undo it in the rows (each changed
  row's `before` is in its Revision; see [revisions](revisions.md)) or, for a
  branch proposal, with `branches revert` (see
  [branch governance](branch-governance.md)), then publish.

## The legacy import

`publish/legacy.py` `import_content()` upserts a dump into Postgres. It runs
inside one `revising("job:import_legacy", reason)` block, so the whole import
is one transaction; `import_legacy` sets the reason to the file name and the
first 12 hex digits of its sha256.

It compares every row with what is there and writes only differences, so a
re-run on unchanged input writes nothing and leaves no Revision. In order:

1. **Regions**: creates any the dump uses that are missing, with the page's
   names and order (`REGIONS`). Existing regions keep their admin edits.
2. **Publishers and citations**: creates missing ones only (a new publisher
   starts with `evidence/publishers.py` `defaults_for()`). Ratings and check
   results are never overwritten.
3. **Entries**: refuses a slug that changed kind, then upserts branches and
   events by slug, with date-derived fields and sort keys (`_sort_keys`, see
   [the content model](content-model.md#how-entries-are-ordered)). A new entry
   is created as `published`; an existing entry's status is never changed.
4. **Owned rows**: branch links, event links, connections, locations and
   images are made to match the dump exactly for each entry in it (`_sync`:
   update, create, delete extras).
5. **Record claims**: one `as_written` claim per entry, plus `origin` and
   `why` where the dump has them, with the dump's values. Their evidence
   follows the dump's citations by position: new rows start as `supports`,
   method `legacy`. On existing evidence only the citation, cited title and
   kind are updated; stance, excerpt and check fields belong to review.
6. **Claim status**: recomputed for those claims (`evidence.sweep.reassess`).
7. **Paleo pins**: from `site/globe-assets.json` (`--globe`; `''` skips).
8. **Missing entries**: counts published entries that aren't in the dump.
   With `--retract-missing`, sets them to `retracted`.

```bash
uv run python manage.py import_legacy var/legacy.json [--retract-missing] [--dry-run] [--globe path]
```

`--dry-run` runs the whole import, prints what it would write, and rolls back.

Things to know before relying on it:

- `make import` passes `--retract-missing`, so it retracts any published entry
  that exists only in Postgres, including one an agent wrote and published.
  Until the cutover, content belongs in `site/data/` too.
- A retracted entry that comes back in the dump stays retracted: the import
  never changes an existing status.
- The import owns the record claims' citations and an entry's links, places,
  images and connections: anything added to those in Postgres alone is
  deleted on the next import. Agents add sources to the claim's atomic parts
  instead (see [evidence and fact-checking](evidence-and-fact-checking.md)).

## The round trip

`make roundtrip` is the proof that nothing is lost or changed between the
files, the database and the page
([ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md)):

1. `make import`: dump `site/data/*.js` to `var/legacy.json`, then import it.
2. `make publish`.
3. `manage.py compare_content var/legacy.json var/releases/latest/content.json`:
   compares the two structurally, entry by entry (`publish/compare.py`),
   prints up to 20 differences and fails if there are any. It then reports
   whether the bytes are identical too (without failing if not).
4. Builds the page twice with the same `--built` date, once from
   `site/data/*.js` to `var/timeline-legacy.html` and once from the snapshot
   to `var/timeline-release.html`, and `cmp`s them.

It imports into and publishes from your configured database, like `make import`
and `make publish`. Run it before a pull request that touches content, import
or export.

`tests/test_import_and_roundtrip.py` checks the same on a small fixture with
every shape (`tests/fixtures.py`):

| Test class | Checks |
|---|---|
| `ImportTests` | the first import creates everything; a re-import writes nothing; a changed field is one update and one Revision; removed and reordered citations; review state (rating, stance, status) survives a re-import; claim status counts independent publishers; openstax.org can't be cited |
| `RoundTripTests` | import then export gives back the input byte for byte; unpublished entries and links to them stay out; conflicting evidence isn't shown; `publish` writes one release per content; pages built from the dump and from the snapshot are byte-identical (needs Node) |
| `FormatTests` | `KEYS` match `site/canonical.mjs`; numbers print as JavaScript does; `dumps` matches `JSON.stringify(…, null, 1)` |

## Building the page

`site/build.mjs`:

| Option | What it does |
|---|---|
| (none) | Reads `site/data/*.js`, applies the `TL.*` calls, validates, and writes the page |
| `--check` | Validates only (`--file <prefix>` limits the report to some files) |
| `--dump-json <file>` | Validates, then writes the resolved content with `JSON.stringify(…, null, 1)`, for the import |
| `--from-json <file>` | Builds from a snapshot instead of `site/data/`: no `TL.*` calls, the same checks |
| `--out <file>` | Where to write the page (default: timeline.html beside the script) |
| `--built YYYY-MM-DD` | The "Data compiled" date (default: the `BUILT` environment variable, or today) |

It refuses to build or dump while there are errors (an unknown id, a missing
citation, a non-https URL, a bad region, an image that isn't public domain or
CC0 …); warnings (a long text or title, an event outside its branch's dates)
don't stop it.

The build puts the canonical content and the `built` date, as compact JSON,
into `site/template.html` in place of `/*__DATA__*/null`, and the contents of
`site/globe-assets.json` (if present) in place of `/*__GLOBE__*/null`. It
escapes any closing script tag in both. Everything else the page needs at runtime sits
beside it: pictures in an images folder and polity outlines in outlines.js. A
release's snapshot carries only the content, so a deploy of the page takes
`site/images/`, `site/outlines.js` and the globe data from the same checkout.

## Changing it

- **A new content field.** Change [site/SCHEMA.md](../../site/SCHEMA.md),
  `KEYS` in both `site/canonical.mjs` and `publish/content.py`, the model and
  a migration, `publish/legacy.py` and `publish/export.py`. Add the field to
  `tests/fixtures.py` so the round-trip tests cover it, then run `make test`
  and `make roundtrip`.
- **What counts as a shown source.** `SHOWN_STANCES` in `publish/export.py`.
  It changes the page, so check the round trip and expect the legacy dump and
  the snapshot to differ wherever Postgres evidence has other stances.
- **The publishing rule.** Thresholds and word lists live in
  `evidence/policy.py` (`grace_days`, `sources_differ`, `attribution`); the
  rule itself in `evidence/publishing.py`. A change to what may be published
  updates [ADR 0010](../adr/0010-publishing-rule.md).
- **The JSON writer.** Any change to `dumps` or `js_number` must keep
  `FormatTests` passing; a byte that differs from `JSON.stringify` breaks the
  round trip.
- **The import.** Keep its rule: never overwrite review state (AGENTS.md
  rule 7), and keep a re-run on unchanged input writing nothing
  (`test_reimport_of_unchanged_input_changes_nothing`).
- **A new file in a release** (beside the content and the manifest).
  `publish/release.py`; the manifest is free-form JSON.
