# 0009 — The fact base: independent witnesses, atomic claims, staleness

**Status:** accepted (November 2026). Refines [0004](0004-every-fact-has-evidence.md)'s status rule.

## Context

ADR 0004 computed a claim's status from its evidence with the owner's legacy
rule: **corroborated** if any non-Wikipedia source supports it. That made a
single Britannica citation "corroborated", although corroboration means that
independent sources agree. Evidence also attached only to whole records (the
legacy "as written" claim), nothing scheduled re-reading, and there was no
way to record that a source disagrees.

## Decision

1. **Corroborated means at least two independent publishers fully support the
   claim**, Wikipedia counting as one at most. Independence is by
   organization (the registrable domain: `science.nasa.gov` and `nasa.gov`
   are one witness), not by domain row or by article. One non-Wikipedia
   source is **single source**, like Wikipedia alone.

   We considered a separate "sourced" status for "one non-Wikipedia source".
   We did not add it: status answers *how many independent witnesses agree*,
   and "is any of them not Wikipedia?" is a different axis (source type)
   that one status scale cannot hold without combinations (two Wikipedia-free
   witnesses vs. Wikipedia plus Britannica). It is computed where it matters
   (`confidence.wikipedia_only()`): in the publishing rule (ADR 0010), in the
   sweep's "find a second source" tasks, and in the report's
   "rest on Wikipedia alone" line. Confidence already ranks a lone Britannica
   (0.43) above a lone Wikipedia article (0.30).

2. **Confidence** weighs each witness by tier, stance, how it was checked
   (`method`) and how fresh the check is; witnesses combine as independent
   probabilities; conflicts scale it down; dates the sources give
   (`Evidence.found_value`) scale it by their agreement. **Contested** needs a
   tier-weighted conflict of 0.3 (or one at least as strong as the support),
   so one weak dissent does not contest a well-supported claim. The formula
   and every constant are in `docs/fact-checking.md` and `evidence/policy.py`.

3. **Atomic claims.** A deterministic splitter derives date, location, number
   and actor claims from every entry, as children of its "as written" claim
   (`Claim.parent`), so evidence and conflicts can attach to the part they
   bear on. New claim fields `number` and `actor`.

4. **Staleness** is a schedule by claim type and era plus link health:
   `recheck_after` (with `recheck_reason` and `recheck_requested_at`), pulled
   to today by dead or changed citations; other jobs may pull it earlier and
   the sweep honours that until a newer check answers it. `Evidence` records
   the page hash it was checked against (`content_hash`).

5. **Conflicts** are `Evidence(stance="conflicts")` on the atomic part, with
   both values; ingestion's matched candidates produce date conflicts.

6. **`manage.py facts sweep`** (a deterministic job, `job:facts_sweep`) runs it
   all and queues `verify_claim` tasks; `facts report` prints the health of
   the base; `facts record` is the agents' door for writing evidence.

## Consequences

- On today's content corroborated record claims fall from 4,125 (64.4%) to
  3,239 (50.6%): 886 claims supported by one non-Wikipedia publisher are now
  single source. Nothing on the page changes (status is not published).
- 41,739 atomic claims exist from the first sweep, each with a Revision; their
  status stays unverified until an agent attaches evidence, so the report
  shows record claims and atomic claims separately.
- The legacy import recomputes status and confidence with the same function
  as the sweep (`evidence.sweep.reassess`), so the two never disagree.
- Lowering a recheck interval takes effect at once; raising one waits for
  each claim's next check (the sweep never pushes a pending recheck later).
- The splitter is a heuristic. Its false positives cost an agent a glance;
  improving it changes claims' keys, which the sweep reconciles (unchecked
  parts are replaced, checked ones kept and marked for recheck).
