# 0023 — A reviewer's verdicts are applied as one audited edit file

**Status:** proposed (November 2026); amends [0021](0021-the-cutover.md)

## Context

The first independent review of agent-written drafts (`var/reviews/2026-11-26-round1.md`) returned ten verdicts and
four corrections to published events: replacement titles and texts, new and removed sources, a changed branch and
link, new ids for nine drafts, one rejection, evidence for a fifth event, and conflicts that the corrected texts
settle. Before this there were two ways to apply such a review, and neither fit. The agent API applies one task's
result and never publishes, renames or edits an existing entry; the admin and a shell can do anything, one row at a
time, with whatever reason someone types. A review is a list of decisions that belong together: applying half of it
(a renamed draft whose edit failed, an approval of an unedited text) leaves the timeline in a state nobody reviewed.

Since the cutover (ADR 0021) nothing overwrites the record claim's citations, and ADR 0021 left open whether anyone
may add sources to it directly. Corrections need that: a corrected text is supported by the sources the reviewer
read, and those must become the entry's cites for readers to see them.

## Decision

- **An edit file.** A JSON list of operations, each with `op`, `reason` and an optional `note`: `edit` (an event's
  `title`, `text`, `y`, `end`, `when`, `branch`, `links`, `imp`; a branch's `text`; `add_cites` / `remove_cites`),
  `rename`, `approve`, `reject`, `add_evidence` and `resolve_conflict`. `manage.py apply_edits <file> --actor <who>`
  (`timeline/edits.py`) applies it. The file is kept beside the review it comes from (`var/reviews/`).
- **All or nothing, every problem listed.** The whole file is checked before anything is written: each op's shape,
  the SCHEMA limits (title ≤ 60, text ≤ 240, excerpts ≤ 25 words), https cites and never openstax.org, kebab-case and
  unique new ids, ids not used after a rename or rejection, and branches that exist. Then the ops run in order in one
  transaction; a failing op is recorded and the rest still run, so the error lists every problem, and then nothing is
  kept. `--dry-run` runs the same transaction, prints the Revisions it wrote as a diff and rolls back;
  `--validate-only` makes only the first check, so a file can be checked on a database that doesn't hold its entries.
- **Audited per op.** Everything runs inside `revising(actor)`, each op in its own nested block whose reason is
  `apply_edits <file> #<n> <op> <entry>: <reason>`, through the services (`timeline.services`,
  `evidence.services.record_evidence`, `evidence.publishing.publish_entry`). The Revision log says which verdict made
  each change.
- **An edit file may change the record claim's cites** (the question ADR 0021 left open, decided for edit files,
  which the owner applies; the agent API still refuses it). `add_cites` appends a supporting or partial row, or
  updates the row for the same page (URLs match up to percent-encoding, case of the host, `www.` and a trailing
  slash); `remove_cites` deletes rows by URL or by domain. An edit rewrites the record claim's value and re-splits the
  entry's atomic claims at once (`evidence.sweep.split_all(entries=…)`), so evidence can be recorded on the new parts
  in the same file.
- **A rename changes the slug of the same row.** Every reference (links, connections, claims, locations, images,
  tasks, Revisions) is by primary key, so it follows; a rename is refused while an open branch proposal names the old
  id in its operations.
- **Approve is publishing.** It goes through `publish_entry`, so the publishing rule (ADR 0010) applies and an
  `override` note is recorded; the release gates (ADR 0018, 0021) still apply when `manage.py publish` builds a
  snapshot. Reject sets a draft or an entry in review to `retracted`.
- **A resolved conflict** is a conflicting evidence row set to `unrelated`, with
  `found_value.resolved = {by, at, reason, was}`; the claim is recomputed. `conflicts.record_conflict` leaves a
  resolved row alone, so the sweep doesn't reopen it from the same page.
- **Re-running a file changes nothing**: an unchanged edit writes nothing, and approving a published entry,
  rejecting a retracted one or renaming to an id that already took its place is a note, not an error.

## Consequences

- A review becomes one reviewable artifact and one transaction; the dry run is what the owner reads before applying.
- `unrelated` now means two things, "this page doesn't bear on the claim" and "the text was corrected so this page no
  longer disagrees"; `found_value.resolved` tells them apart. A new stance would be cleaner but changes the status
  rule (ADR 0009); revisit if resolved rows need their own weight.
- Connections and "why it matters" text aren't edit-file ops yet (round 1 asks for two connections); they still go
  through the admin or a shell.
- A cite matched by domain removes every cite from that site; a file should name the URL when it knows it.
