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
serve. Releases are written once to object storage, and a small pointer says
which one readers get. Content reaches readers only when someone publishes, not
when a row is saved, and `publish` refuses to make a release that fails its
gates.

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
| Publish | `make publish` (`manage.py publish`, with `--legacy var/legacy.json` when that file exists) | `published` rows, and the legacy dump | `releases/<version>/` (snapshot, manifest, change report, built page) and the pointer `releases/latest.json` in the releases store, a `Release` row |
| Mirror it | `make release-pull` (`manage.py storage pull-release [VERSION]`) | the store | `var/releases/<version>/`, the `var/releases/latest` link |
| Build the page | `make build-release` (`make release-pull`, then `node site/build.mjs --from-json var/releases/latest/content.json`) | the mirrored snapshot | the page, timeline.html in `site/` |

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
   with the `attribution` words ("says", "according to" …). This half is
   `unflagged_contested(entry)`, which the release gates reuse.
2. **An event with no supporting source other than Wikipedia.** It applies
   when the event's `as_written` claim has no supporting evidence (stance
   `supports` or `partial`, the keys of `stance_factor` in
   `evidence/policy.py`), or when every supporting citation is Wikipedia. An
   event whose evidence all conflicts or is unrelated has no support, so it is
   blocked too. The exception: an event dated this year or last may be
   published on Wikipedia alone for `grace_days` (14, in
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
(AGENTS.md rule 11). The first half is checked again for every published
entry when a release is made (the `contested` gate, under
[Release gates](#release-gates)), so an entry that reached `published` by
another door can't reach readers with an unflagged contested claim. The
second half is not a gate: legacy content published before the rule stays
on the page, and the sweep queues `verify_claim` tasks for it. How claims get
their status is in [evidence and fact-checking](evidence-and-fact-checking.md).

## The snapshot format

`releases/<version>/content.json` (in the releases store, mirrored to
`var/releases/<version>/content.json`) is `{"branches": [...], "events": [...]}`,
in the one canonical shape (see [the content model](content-model.md)). It is
written so that a snapshot exported from Postgres and a dump from the legacy
files of the same content are the same bytes and hash the same, on every key
the legacy dump has. The exception is the **additive keys**: keys Postgres
derives at publish time that the legacy files can't have. Today there is one,
an event's `singleSource`. They are compared separately
([ADR 0018](../adr/0018-single-source-marker.md), amending ADR 0007).

`publish/content.py` holds the Python side:

| Name | What it does |
|---|---|
| `KEYS` | The key order for each kind of object (branch, event, cite, origin, origin link, geo, image, connection). Must equal `site/canonical.mjs` `KEYS`; `read_js_keys()` parses the JavaScript file so a test can compare them. |
| `ADDITIVE` | The additive keys by kind: `{"event": ["singleSource"]}`. Each is also in `KEYS`, last. |
| `legacy_view(content)` | The snapshot as the legacy files would write it: the additive keys left out, everything else untouched. |
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
| event `singleSource` | `true` when `single_source_events()` finds one independent witness behind the event; absent otherwise |

`t` is the title as the entry cites it (`Evidence.cited_title`), not the
citation's stored title, so two entries can cite one URL under different
titles.

`single_source_events()` gathers the shown evidence (`SHOWN_STANCES`) on each
event's record claim (`as_written`) and that claim's atomic parts (date,
place, numbers, actors), maps each citation's publisher domain to its witness
(`evidence/independence.py` `witness`: publishers sharing a registrable
domain are one, and all of Wikipedia is one), and flags the events with
exactly one. An event with no shown evidence at all isn't flagged. The flag
comes from the evidence rows alone, never from the date or a stored claim
status, so the same database always gives the same snapshot. The page shows
it as a quiet "Single source" note above the event's sources (see
[the content model](content-model.md#the-snapshot-shape)).

## Releases

A release lives in the `releases` object store
([ADR 0016](../adr/0016-object-storage.md)), reached only through
`infra/storage.py`: MinIO locally (`make db` starts it and creates the
buckets), S3 or Cloudflare R2 in production, a directory under
`var/storage/` with `STORAGE_BACKEND=local`, and temporary directories in the
tests. Release files are **write-once**: `storage.write` raises `Immutable`
if a key already holds different bytes. The one object that is ever
rewritten is the pointer.

| Key in the releases store | What |
|---|---|
| `releases/<version>/content.json` | The snapshot. |
| `releases/<version>/manifest.json` | The version, hash, creation time, counts and high-water mark, with `SITE_NAME`, the notes, `previous` (the release readers had before), the change report's totals and the list of files. |
| `releases/<version>/changes.json`, `changes.md` | The change report, for code and for people (below). |
| `releases/<version>/timeline.html` | The page the build gate built from the snapshot, with the publish date as its "Data compiled" date. |
| `releases/latest.json` | The pointer: `version`, `content_hash`, `snapshot` (the key), `updated_at`, `updated_by`, `reason` (`publish` or `rollback`) and `previous`. |

`publish/release.py` `publish(actor, notes, force, legacy, check_only)` does
the work behind the command:

1. Builds the content and its bytes with `dumps()`, and their sha256.
2. If the newest `Release` has the same hash, stops: nothing new is written
   and the command prints "Unchanged since <version>". `--force` makes a new
   release anyway (the gates still run).
3. Runs the gates (`publish/gates.py` `check()`, below). If any finds a
   problem, raises `PublishRefused` with each gate's problems (the command
   prints up to 20 per gate), and nothing is written.
4. With `--check`, stops here: "Every release gate passes (nothing written)."
   `--check` runs the gates even when the content is unchanged.
5. Finds the release readers have now (`live_release()`: the pointer's
   version, or, before there is a pointer, the newest `Release`), and picks
   the new version `YYYY.MM.DD.N`: today's date, and N one more than the
   releases already made today, skipping any number that has a `Release` row
   or a `content.json` in the store (`_next_version`). A number whose files a
   failed run left behind is never reused.
6. Builds the change report against the live release's snapshot.
7. Writes the five files under `releases/<version>/`.
8. Checks that `changes.json` is in the store (the `report` gate).
9. Creates the `Release` row, then writes the pointer.

```bash
uv run python manage.py publish [--notes "…"] [--actor job:publish] [--force] [--legacy var/legacy.json]
uv run python manage.py publish --check [--legacy var/legacy.json]   # the gates only
uv run python manage.py publish --rollback <version> [--actor human:<you>]
```

| `Release` field | What |
|---|---|
| `version` | `YYYY.MM.DD.N`, unique |
| `created_at`, `created_by` | when, and `--actor` (default `job:publish`) |
| `content_hash` | sha256 of the snapshot file's bytes |
| `snapshot_path` | the snapshot's key in the releases store: `releases/<version>/content.json` |
| `counts` | branches, events, citations, distinct URLs, locations, images, connections, origins, `single_source_events` |
| `revision_high_water` | the newest Revision id when it was published: everything after it is "changed since this release" |
| `notes` | `--notes` |

Which release readers get is the pointer, not a row: the newest `Release`
and the pointer differ after a rollback. `Release` isn't a canonical table:
publishing needs no `revising()` and leaves no Revision. Releases are
read-only in the admin.

**Note:** the files are written before the `Release` row, and the pointer
after it. A run that fails in between leaves files in the store with no row;
they are never overwritten, and the next publish skips their number. If the
pointer write itself fails, the row exists but readers still get the old
release, and the next `publish` sees unchanged content and stops; point it
with `publish --rollback <that version>` (rollback can name any release,
newer or older).

Nothing deploys the page yet. The releases bucket is meant to be the CDN's
origin later; cache headers are set when the CDN is (ADR 0016).

### Release gates

`publish` refuses unless every gate passes
([ADR 0019](../adr/0019-processes-and-release-gates.md)):

| Gate | Passes when | Where |
|---|---|---|
| `build` | The site's own build accepts the snapshot: `node site/build.mjs --from-json … --dump-json …` finds no errors, and a second run builds the page (stored as `timeline.html`). Needs Node: without it, the gate fails. | `gates.node_build()` |
| `contested` | No entry in the snapshot has a contested top-level claim unless its text says the sources differ: the publishing rule's first half. | `gates.contested()`, `evidence/publishing.py` `unflagged_contested()` |
| `roundtrip` | The site reads the snapshot back byte for byte (the re-dump from the build gate equals it). With `--legacy <file>`, the snapshot without its additive keys (`legacy_view`) also equals that dump, structurally and byte for byte. | `gates.roundtrip()` |
| `report` | `changes.json` is in the store before the pointer moves, so readers never get a release without its report. | `release.publish()` (not in `check()`, so `--check` doesn't run it) |

`make publish` passes `--legacy var/legacy.json` when the file exists, which
is until the cutover. A stale dump makes the `roundtrip` gate refuse ("run
`make import` (it re-dumps data/*.js) before publishing"), so run
`make import` first. Content published only in Postgres (an event that went
through `facts publish` but isn't in `site/data/`) differs from the dump the
same way, so it blocks `make publish` until it is carried into `site/data/`;
`make import` would retract it instead. After the cutover, publish without
`--legacy`.

### The change report

`publish/changes.py` `report(prev, new)` compares the new snapshot with the
one the pointer names (what readers had, so after a rollback it is the
rolled-back release), entry by entry, grouped by branch (an event's branch;
a branch is its own group):

- **added**: ids only in the new snapshot;
- **changed**: ids in both, with the sorted list of keys whose values differ,
  and `from_branch` for an event that moved;
- **retracted**: ids only in the old one.

Each row has the id, the kind and a label (a branch's name, an event's
title), sorted by id. `changes.json` holds it all with `from`, `to` and the
totals (`from` is null for the first release); `changes.md` is the same for
people, with at most 12 rows of each kind per branch. The report has no
timestamps and sorted keys, so the same two snapshots always give the same
bytes.

## Rolling back

A rollback is a pointer write. `manage.py publish --rollback <version>`
(`release.rollback()`) finds the `Release`, reads its snapshot from the
store, checks it against the recorded `content_hash`, and rewrites
`releases/latest.json` with `reason: "rollback"` and the version it replaces
as `previous`. It deletes nothing: the newer release stays in the store.
It refuses an unknown version, a snapshot missing from the store, or one whose
hash doesn't match.

- **Mirror and build it.** The pointer moves in the store only. `make
  release-pull` (or `make build-release`) mirrors the release it names into
  `var/releases/<version>/` and points the local symlink `var/releases/latest`
  at it. The store also holds that release's own built `timeline.html`.
- **Look at an older release without rolling back.** `make release-pull
  VERSION=<version>` mirrors any release and points the local
  `var/releases/latest` at it, without touching the store's pointer; `node
  site/build.mjs --from-json var/releases/<version>/content.json` builds it.
- **What the next publish does.** `publish` compares with the newest
  `Release` row, not with the pointer: while the content is unchanged it says
  "Unchanged since <newest>" and leaves the pointer on the rolled-back
  release. The next real change makes a new version, reports its changes
  against the rolled-back release (what readers had), and points `latest` at
  it.
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
2. `make publish`, with `--legacy var/legacy.json`, so the `roundtrip` gate
   already refuses a release that differs from the dump.
3. `make release-pull`: mirror the release the pointer names.
4. `manage.py compare_content var/legacy.json var/releases/latest/content.json
   --write-legacy-view var/release-legacy-view.json`: drops the additive keys
   from both (`legacy_view`), compares them structurally, entry by entry
   (`publish/compare.py`), prints up to 20 differences (`--show`) and fails if
   there are any, then fails too if they are equal but not byte for byte. It
   writes the release without its additive keys to
   `var/release-legacy-view.json`. `--keep-additive` compares those keys too
   (a legacy dump never has them, so it fails wherever an event is marked).
5. Builds the page twice with the same `--built` date, once from
   `site/data/*.js` to `var/timeline-legacy.html` and once from
   `var/release-legacy-view.json` to `var/timeline-release.html`, and `cmp`s
   them.
6. Builds the release itself, additive keys and all, to
   `var/timeline-release-full.html`, which must succeed.

It imports into and publishes from your configured database and store, like
`make import` and `make publish`. It compares with the release the pointer
names: after a rollback with unchanged content, `make publish` makes nothing
new and that is the older release. Run it before a pull request that touches
content, import or export.

`tests/test_import_and_roundtrip.py` checks the same on a small fixture with
every shape (`tests/fixtures.py`):

| Test class | Checks |
|---|---|
| `ImportTests` | the first import creates everything; a re-import writes nothing; a changed field is one update and one Revision; removed and reordered citations; review state (rating, stance, status) survives a re-import; claim status counts independent publishers; openstax.org can't be cited |
| `RoundTripTests` | import then export gives back the input byte for byte on every legacy key, with only additive keys extra; `singleSource` marks events resting on one publisher (Wikipedia alone, or one other), not one with two, and a second publisher on an atomic part lifts it; the export is deterministic; unpublished entries and links to them stay out; conflicting evidence isn't shown; `publish` writes one release per content to the store and moves the pointer (build gate skipped); pages built from the dump and from the snapshot's legacy view are byte-identical (needs Node) |
| `FormatTests` | `KEYS` match `site/canonical.mjs`; numbers print as JavaScript does; `dumps` matches `JSON.stringify(…, null, 1)` |

The release files, the pointer, the change report, rollback, the mirror, a
skipped left-over version and each gate are tested in `tests/test_platform.py`
`ReleaseTests`.

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
release's snapshot carries only the content. The `timeline.html` the build
gate stores with a release has the globe data inlined from the checkout that
published it, but a deploy of the page still takes `site/images/` and
`site/outlines.js` from the same checkout.

The event panel in `site/template.html` reads `singleSource`: an event that
has it shows a small "Single source" note under the Sources heading, above
the list. There is no filter for it (the page has no filter controls).

## Changing it

- **A new content field.** Change [site/SCHEMA.md](../../site/SCHEMA.md),
  `KEYS` in both `site/canonical.mjs` and `publish/content.py`, the model and
  a migration, `publish/legacy.py` and `publish/export.py`. Add the field to
  `tests/fixtures.py` so the round-trip tests cover it, then run `make test`
  and `make roundtrip`.
- **A new derived key** (computed at publish time, never in `site/data/`).
  Add it to `ADDITIVE` and to both `KEYS` lists (last), compute it in
  `publish/export.py` from rows alone so the snapshot stays deterministic, and
  describe it in `site/SCHEMA.md` ([ADR 0018](../adr/0018-single-source-marker.md)).
  `legacy_view()` drops event keys only: a derived key on branches needs it
  extended.
- **A release gate.** `publish/gates.py` `check()` (or `release.publish()`
  for a check that needs the files in the store), with a test in
  `tests/test_platform.py` `ReleaseTests` and a line in
  [ADR 0019](../adr/0019-processes-and-release-gates.md).
- **What counts as a shown source.** `SHOWN_STANCES` in `publish/export.py`.
  It changes the page, so check the round trip and expect the legacy dump and
  the snapshot to differ wherever Postgres evidence has other stances.
- **The publishing rule.** Thresholds and word lists live in
  `evidence/policy.py` (`grace_days`, `sources_differ`, `attribution`); the
  rule itself in `evidence/publishing.py`. A change to what may be published
  updates [ADR 0010](../adr/0010-publishing-rule.md). The `contested` gate
  calls `unflagged_contested()`, so a change to the first half changes what
  may be released too.
- **The JSON writer.** Any change to `dumps` or `js_number` must keep
  `FormatTests` passing; a byte that differs from `JSON.stringify` breaks the
  round trip.
- **The import.** Keep its rule: never overwrite review state (AGENTS.md
  rule 7), and keep a re-run on unchanged input writing nothing
  (`test_reimport_of_unchanged_input_changes_nothing`).
- **A new file in a release.** `FILES` and `publish()` in
  `publish/release.py` (the manifest lists `FILES`, and `pull_release()`
  mirrors them), and the key list in `infra/storage.py`'s docstring and
  ADR 0016. The file is write-once like the rest.
