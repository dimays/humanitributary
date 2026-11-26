---
name: review-branch-proposals
description: Drain the review_branch_proposal queue in the Humanitributary repo — read what a branch rule proposed (split, merge, end date, new branch), decide, and either apply it mechanically (writing the names, texts and cites it leaves to you) or reject it with a reason. Use when asked to review branch proposals or to work review_branch_proposal tasks.
---

# Review branch proposals

The branch rules (`docs/branch-rules.md`) propose structural changes; you decide them. Read `AGENTS.md` first.

## 1. Claim a task

```bash
uv run python manage.py tasks next --kind review_branch_proposal --claim --agent agent:<you>
```

The payload has everything: `rule`, `summary`, `strength`, `metrics` of each branch involved, `evidence` (clusters,
gaps, shared events, with event ids, titles, dates and places), `operations` (what would run) and `needs_agent`
(the fields you must write). `manage.py branches show <proposal>` prints the proposal itself.

## 2. Decide

Ask whether a reader would be better served by the change:

- **SPLIT-PLACE / SPLIT-TIME**: are the clusters or phases really separate stories (peoples, eras), or one polity
  that happens to be large? Would each child have enough events to stand alone? Check the events that "stay".
- **MERGE-OVERLAP**: are the branches the same story under different names (ECSC → EEC → EU), not neighbours
  that interact? Pick the survivor's name and start date.
- **END-STALE**: did it end (then when, by a source), or does it continue with no events (then reject and leave
  it to the THIN fill-in tasks)?
- **NEW-BRANCH**: is the entity a lasting state, movement or phenomenon, under the right parent?

Look things up as you would to write an event (`site/SCHEMA.md` citation rules: fetch and read every page you cite;
never openstax.org; britannica.com only in a browser).

## 3a. Accept: write the fields, then apply

Copy `operations` to a file and fill every `needs_agent` field: a branch `name`, `text` (one or two sentences in
SCHEMA style, every statement supported), `start_when` / `end_when` as the source puts them, and `cites`
(`[{"t": title, "u": url, "k": kind}]`, at least one, pages you read). You may drop moves that are wrong or add
ones the rule missed; keep the shape of each op. Then:

```bash
uv run python manage.py branches apply <proposal> --ops ops.json --agent agent:<you> --task <task> \
    --legacy-file site/data/99-proposal-<proposal>.js
```

`apply` refuses while a placeholder (`TODO`) or a cite-less new branch remains. Until the cutover keep
`--legacy-file` (the next `make import` would otherwise undo the change), then run `make roundtrip`: it must still
print "byte-identical" for both the JSON and the page.

## 3b. Reject

```bash
uv run python manage.py branches reject <proposal> --note "why, in one sentence" --agent agent:<you>
```

The rule will not propose it again for 180 days, and then only if its evidence grew by half. Say why so the owner can
tune the thresholds.

## 4. Finish

```bash
uv run python manage.py tasks complete <task> --result result.json --agent agent:<you>
```

with `{"decision": "applied" | "rejected", "proposal": <id>, "note": "…", "legacy_file": "…"}`. If you cannot decide,
`tasks release <task>` and say why in the task's error with `tasks fail <task> --error "…"` only if it can never be
decided.

A mistake can be undone: `manage.py branches revert <proposal> --agent agent:<you>` restores every row the apply
changed (it refuses if they have changed since); delete the legacy file it wrote, too.
