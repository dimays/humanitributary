# 0011 — Branch governance: rules propose, people decide, applying is mechanical

**Status:** accepted (November 2026); amended by [0021](0021-the-cutover.md); amended by [0022](0022-ingestion-tuning.md)

## Context

Deciding that "Indigenous peoples of the Americas" should become regional
branches (`data/91`) or that the ECSC, EEC and EU are one story (`data/90`)
took a long session of reading hundreds of events. With ingestion adding
material daily, those calls will come up constantly, and they cannot wait for
someone to notice. They are also exactly the decisions an LLM inside a job
should not take (ADR 0003).

## Decision

- **Metrics** are a deterministic snapshot of each branch's shape
  (`BranchMetric`), measured on the page's own time scale so that "a long
  gap" means the same on screen in every era.
- **Rules** are named and versioned functions (`SPLIT-PLACE-v1`,
  `SPLIT-TIME-v1`, `MERGE-OVERLAP-v1`, `END-STALE-v1`, `NEW-BRANCH-v1`,
  `THIN-v1`), with every threshold in one dict and each documented in
  `docs/branch-rules.md` with its rationale and a real example. They only
  *propose*: a `BranchProposal` and a `review_branch_proposal` task carrying
  the evidence and the exact operations. THIN only queues a fill-in task.
- **Hysteresis** keeps the list short and stable: the same change is never
  proposed twice; a rejected one returns only after a cool-down with 1.5× the
  strength; undoing an applied change needs 2× the strength.
- **Applying is mechanical**: the operations are the static site's
  restructure operations (move, patch, merge, plus create-branch), executed
  through the service layer in one `revising()` block, so they leave
  Revisions and can be **reverted** exactly from them. Until the cutover the
  same operations can be written as a legacy data file, so the import keeps
  the change.
- **Validation against history** is part of the rules' definition: they are
  tuned so that, run on the content before `data/90` and `data/91`, they
  propose those decisions (`scripts/validate_branch_rules.sh`), and so that
  today's list is short.

## Consequences

- The rules recover the owner's ECSC/EEC/EU merge exactly and the First
  Americans split's three regional branches that took existing events (55 of
  62 moves). A thematic split (the rights movements branch) is out of reach of
  place and time rules; it stays a human idea.
- On today's content they propose three changes (one regional split, two end
  dates) and 13 fill-in tasks.
- The thresholds are fitted to two decisions; each new decision the owner
  makes (accepting or rejecting a proposal, or restructuring by hand) is
  another test case to replay, and changing a threshold means bumping
  `RULES_VERSION`.
- Applying in Postgres alone is undone by the next legacy import until the
  cutover; `--legacy-file` closes that gap, and the cutover removes it.
