---
title: Publishing
summary: How published content leaves Postgres as a versioned static snapshot, the gates a release must pass, how the page is built from it, and the round trip (DB → snapshot → DB) that proves nothing is lost; the legacy files are frozen since the cutover.
order: 90
covers:
  - publish/**
  - "!publish/migrations/**"
  - site/build.mjs
  - site/canonical.mjs
  - site/template.html
  - evidence/publishing.py
  - tests/test_import_and_roundtrip.py
  - archive/README.md
---

Readers never touch the database. `manage.py publish` writes the published
content to a versioned file, a **snapshot**, and the single-file page is built
from that file, so a release is a set of static files that any web server can
serve. Releases are written once to object storage, and a small pointer says
which one readers get. Content reaches readers only when someone publishes, not
when a row is saved, and `publish` refuses to make a release that fails its
gates.

Postgres is the only source of truth
([ADR 0001](../adr/0001-postgres-is-the-truth-the-site-reads-snapshots.md),
[ADR 0021](../adr/0021-the-cutover.md)). The content files the site was first
written in (site/data/*.js) were imported one last time at the cutover and
frozen in `archive/site-data/` ([the archive](#the-archive)); nothing imports
them over Postgres any more. A snapshot loaded into an empty database exports
to the same bytes again, so export and load are exact inverses
([ADR 0007](../adr/0007-one-snapshot-shape-byte-identical-both-ways.md)).

## The path from rows to readers

| Step | Command | Reads | Writes |
|---|---|---|---|
| Write content | `timeline.services` inside `revising()`: the agent API, the admin, `branches apply`, a shell | — | Postgres rows, with Revisions |
| Publish entries | `manage.py facts publish <slug>` (the publishing rule) | an entry's claims | its status `published` |
| Check a release | `make roundtrip` (`manage.py publish --check`) | `published` rows | nothing: prints the gates' result and the change report's totals |
| Publish | `make publish` (`manage.py publish`) | `published` rows | `releases/<version>/` (snapshot, manifest, change report, built page) and the pointer `releases/latest.json` in the releases store, a `Release` row |
| Mirror it | `make release-pull` (`manage.py storage pull-release [VERSION]`) | the store | `var/releases/<version>/`, the `var/releases/latest` link |
| Build the page | `make build` (= `make build-release`: `make release-pull`, then `node site/build.mjs --from-json var/releases/latest/content.json`) | the mirrored snapshot | the page, timeline.html in `site/` |

The page is only ever built from a snapshot: `node site/build.mjs` without
`--from-json` refuses.

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
directly. The loader (`import_legacy`) doesn't apply it either: it writes new
entries as `published`, mirroring the file it loads. Agents must use `facts publish`
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
written exactly as the site's build writes the same content
(`JSON.stringify(…, null, 1)`), so the build reads it back byte for byte and
the same rows always hash the same. Some keys are **derived** (the code calls
them additive): computed at publish time from other rows, never stored as
content, and ignored by the loader. Today there is one, an event's
`singleSource` ([ADR 0018](../adr/0018-single-source-marker.md)).

`publish/content.py` holds the Python side:

| Name | What it does |
|---|---|
| `KEYS` | The key order for each kind of object (branch, event, cite, origin, origin link, geo, image, connection). Must equal `site/canonical.mjs` `KEYS`; `read_js_keys()` parses the JavaScript file so a test can compare them. |
| `ADDITIVE` | The derived keys by kind: `{"event": ["singleSource"]}`. Each is also in `KEYS`, last. |
| `without_derived(content)` | The snapshot with the derived keys left out, everything else untouched (`compare_content --drop-derived`, the tests). |
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

`publish/release.py` `publish(actor, notes, force, check_only)` does the work
behind the command:

1. Builds the content and its bytes with `dumps()`, and their sha256.
2. If the newest `Release` has the same hash, stops: nothing new is written
   and the command prints "Unchanged since <version>". `--force` makes a new
   release anyway (the gates still run).
3. Runs the gates (`_prepare()`: a second export for the `deterministic` gate,
   then `publish/gates.py` `check()`, below). If any finds a problem, raises
   `PublishRefused` with each gate's problems (the command prints up to 20 per
   gate), and nothing is written.
4. Finds the release readers have now (`live_release()`: the pointer's
   version, or, before there is a pointer, the newest `Release`), and picks
   the new version `YYYY.MM.DD.N`: today's date, and N one more than the
   releases already made today, skipping any number that has a `Release` row
   or a `content.json` in the store (`_next_version`). A number whose files a
   failed run left behind is never reused.
5. Builds the change report against the live release's snapshot.
6. Writes the five files under `releases/<version>/`.
7. Checks that `changes.json` is in the store (the `report` gate).
8. Creates the `Release` row, then writes the pointer.

`release.check()` (`publish --check`, `make roundtrip`) runs steps 1, 3 and 5
whether or not the content changed, and writes nothing: it prints "Every
release gate passes (deterministic, build, contested, report; nothing
written). Against <live version>: N added, N changed, N retracted."

```bash
uv run python manage.py publish [--notes "…"] [--actor job:publish] [--force]
uv run python manage.py publish --check                  # the gates and the change report's totals, writing nothing
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
([ADR 0019](../adr/0019-processes-and-release-gates.md), amended by
[ADR 0021](../adr/0021-the-cutover.md)):

| Gate | Passes when | Where |
|---|---|---|
| `deterministic` | Two exports of the same rows (`build_content()` twice) give the same bytes, so the hash says whether anything changed. The problem names the first line that differs. | `gates.deterministic()`, `release._prepare()` |
| `build` | The site's own build accepts the snapshot: `node site/build.mjs --from-json … --check` finds no errors; `--dump-json` of it gives back the same bytes (the build reads it back: `site/canonical.mjs` and `publish/content.py` agree); a third run builds the page (stored as `timeline.html`). Needs Node: without it, the gate fails. | `gates.node_build()` |
| `contested` | No entry in the snapshot has a contested top-level claim unless its text says the sources differ: the publishing rule's first half. | `gates.contested()`, `evidence/publishing.py` `unflagged_contested()` |
| `report` | The change report against the release readers have is computed with the gates (`--check` prints its totals), and `changes.json` is in the store before the pointer moves, so readers never get a release without its report. | `release.publish()`, `release.check()` |

Before the cutover a `roundtrip` gate also compared the snapshot with a dump
of the legacy files (`publish --legacy`); with Postgres the only source there
is nothing to compare it with, so the option is gone. A Postgres-only entry
(an agent's event published with `facts publish`) is simply part of the next
release.

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

## The loader and the archive

### The archive

`archive/site-data/` holds the legacy content files as they were at the
cutover, and `archive/site-tools/` the tools that read or rewrote them
(`apply-fixes.mjs`, `verify-geo.mjs`, `fetch-images.mjs`, …, retired: they
look for a `data/` folder beside themselves, so they can't rewrite anything).
`archive/README.md` says what is there. At the cutover the files and Postgres
held the same content: `import_legacy --archive` on a copy of the main
database wrote 0 rows, and the first release from Postgres alone equals a dump
of the archive on every key the archive has. `publish/legacy.py`
`ARCHIVE_SHA256` is `archive_hash()` of the directory (file names and bytes,
in name order); `test_the_legacy_archive_is_frozen` fails if a file changes,
appears or disappears, or if a site/data/ folder comes back.

`node site/build.mjs --archive [dir]` still reads the files (applying their
`TL.*` calls), but only to dump (`--dump-json`) or check (`--check`) them:
the page can't be built that way.

### Loading content: import_legacy

`publish/legacy.py` `import_content()` loads content in the snapshot shape
into Postgres. Nothing runs it routinely; it has two uses:

```bash
uv run python manage.py import_legacy --archive [--dry-run]                 # the frozen files (make import-archive)
uv run python manage.py import_legacy var/releases/latest/content.json      # a release snapshot (a fresh database)
uv run python manage.py import_legacy <file> [--retract-missing] [--dry-run] [--globe path]
```

`make import-archive` fills an empty database with the archive: CI does it,
since the real content lives in Postgres and isn't in git. Loading a release
snapshot fills a fresh database with what readers have, without what releases
don't carry (drafts, entries in review, evidence that isn't shown).
**On a database people and agents have edited, either one overwrites their
content edits on every entry the file has** (review state is kept), and
`--retract-missing` retracts everything the file lacks, so run `--dry-run`
first. `--archive` runs `node site/build.mjs --archive archive/site-data
--dump-json` into a temporary file (Node is needed).

It runs inside one `revising("job:import_legacy", reason)` block, so the whole
load is one transaction; the reason is the source (`archive/site-data` or the
file name) and the first 12 hex digits of its sha256.

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
8. **Missing entries**: counts published entries that aren't in the file.
   With `--retract-missing`, sets them to `retracted`.

`--dry-run` runs the whole load, prints what it would write, and rolls back.
Derived keys (`singleSource`) in a snapshot are ignored.

Things to know before running it on a live database:

- A retracted entry that comes back in the file stays retracted: the loader
  never changes an existing status.
- For each entry in the file it makes the record claims' citations and the
  entry's links, places, images and connections match the file: anything
  added to those in Postgres since is deleted. (This is why, before the
  cutover, agents added sources to the claim's atomic parts; the agent API
  still refuses new evidence on the record claim, see
  [evidence and fact-checking](evidence-and-fact-checking.md).)

## The round trip

Since the cutover the round trip is **DB → snapshot → DB**: a database's
snapshot, loaded into an empty database, exports to the same bytes (derived
keys included), and loading it again writes nothing
([ADR 0021](../adr/0021-the-cutover.md), restating ADR 0007). Content written
in Postgres alone (an agent's event) comes back like the rest.

- **On the fixture** (`tests/test_import_and_roundtrip.py`
  `test_db_to_snapshot_to_db_is_exact`): load `tests/fixtures.py` `small()`,
  write an event in Postgres alone, export; roll all of it back, load that
  snapshot into the now empty database, export again: the bytes are equal, and
  a second load writes nothing and leaves no Revision.
- **On your database** (`make roundtrip`, `manage.py publish --check`): the
  release gates on the real content, writing nothing: two exports are
  identical, the build checks it, reads it back byte for byte and builds the
  page, no contested claim is unflagged, and the change report against the
  live release is computed. `make check-pr` runs it as its "release gates"
  lane.

`manage.py compare_content A B [--drop-derived] [--show N]` compares any two
snapshots (two releases, or a snapshot and a dump), structurally and entry by
entry (`publish/compare.py`), printing up to 20 differences, and fails if there
are any, or if they are equal but not byte for byte.

`tests/test_import_and_roundtrip.py`:

| Test class | Checks |
|---|---|
| `ImportTests` | the first load creates everything; a re-load writes nothing; a changed field is one update and one Revision; removed and reordered citations; review state (rating, stance, status) survives a re-load; claim status counts independent publishers; openstax.org can't be cited |
| `RoundTripTests` | DB → snapshot → DB is exact (above); the fixture comes back exact with only derived keys extra; `singleSource` marks events resting on one publisher (Wikipedia alone, or one other), not one with two, and a second publisher on an atomic part lifts it; the export is deterministic; unpublished entries and links to them stay out; conflicting evidence isn't shown; `publish` writes one release per content to the store and moves the pointer (build gate skipped); the archive is frozen and site/data/ is gone; the fixture and its snapshot build byte-identical pages (needs Node) |
| `FormatTests` | `KEYS` match `site/canonical.mjs`; numbers print as JavaScript does; `dumps` matches `JSON.stringify(…, null, 1)` |

The release files, the pointer, the change report, rollback, the mirror, a
skipped left-over version and each gate (an export that isn't deterministic,
`check()` writing nothing) are tested in `tests/test_platform.py`
`ReleaseTests`.

## Building the page

`site/build.mjs`:

| Option | What it does |
|---|---|
| `--from-json <file>` | Builds the page from a snapshot: validates, then writes the page. Required: without it (or `--archive`) the build refuses and says how to build. |
| `--check` | Validates only |
| `--dump-json <file>` | Validates, then writes the content back with `JSON.stringify(…, null, 1)` (the build gate's read-back) |
| `--out <file>` | Where to write the page (default: timeline.html beside the script) |
| `--built YYYY-MM-DD` | The "Data compiled" date (default: the `BUILT` environment variable, or today) |
| `--archive [dir]` | Reads the frozen legacy files (default `archive/site-data`) instead of a snapshot, applying their `TL.*` calls; only with `--dump-json` or `--check` (`--file <prefix>` limits the report to some files) |

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
`site/outlines.js` from the same checkout. `site/build-outlines.mjs` and
`site/build-paleo-points.mjs`, which derive those globe assets from the
content, read a snapshot too (`--from-json`, default
`var/releases/latest/content.json`).

The event panel in `site/template.html` reads `singleSource`: an event that
has it shows a small "Single source" note under the Sources heading, above
the list. There is no filter for it (the page has no filter controls).

## Changing it

- **A new content field.** Change [site/SCHEMA.md](../../site/SCHEMA.md),
  `KEYS` in both `site/canonical.mjs` and `publish/content.py`, the model and
  a migration, `publish/legacy.py` (the loader) and `publish/export.py`. Add
  the field to `tests/fixtures.py` so the round-trip tests cover it, then run
  `make test` and `make roundtrip`. The archive never has it.
- **A new derived key** (computed at publish time, never stored). Add it to
  `ADDITIVE` and to both `KEYS` lists (last), compute it in
  `publish/export.py` from rows alone so the snapshot stays deterministic (the
  `deterministic` gate checks), and describe it in `site/SCHEMA.md`
  ([ADR 0018](../adr/0018-single-source-marker.md)). `without_derived()` drops
  event keys only: a derived key on branches needs it extended.
- **A release gate.** `publish/gates.py` `check()` (or `release.publish()`
  for a check that needs the files in the store), with a test in
  `tests/test_platform.py` `ReleaseTests`, a line in `gates.GATES` (what
  `--check` names) and an ADR amending
  [ADR 0021](../adr/0021-the-cutover.md)'s gate list.
- **What counts as a shown source.** `SHOWN_STANCES` in `publish/export.py`.
  It changes the page: `publish --check` shows how many entries change.
- **The publishing rule.** Thresholds and word lists live in
  `evidence/policy.py` (`grace_days`, `sources_differ`, `attribution`); the
  rule itself in `evidence/publishing.py`. A change to what may be published
  updates [ADR 0010](../adr/0010-publishing-rule.md). The `contested` gate
  calls `unflagged_contested()`, so a change to the first half changes what
  may be released too.
- **The JSON writer.** Any change to `dumps` or `js_number` must keep
  `FormatTests` passing; a byte that differs from `JSON.stringify` breaks the
  round trip.
- **The loader.** Keep its rules: never overwrite review state (AGENTS.md
  rule 7), a re-run on unchanged input writes nothing
  (`test_reimport_of_unchanged_input_changes_nothing`), and loading a snapshot
  this database exported writes nothing (`test_db_to_snapshot_to_db_is_exact`).
- **The archive.** Never. It is frozen (ADR 0021); content changes go into
  Postgres.
- **A new file in a release.** `FILES` and `publish()` in
  `publish/release.py` (the manifest lists `FILES`, and `pull_release()`
  mirrors them), and the key list in `infra/storage.py`'s docstring and
  ADR 0016. The file is write-once like the rest.
