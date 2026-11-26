# 0004 — Every fact has evidence: claims, citations and computed confidence

**Status:** accepted (November 2026); its status rule refined by [0009](0009-fact-base.md)

## Context

Every entry on the timeline cites the pages it was written from, and the
citation rules are strict (`site/SCHEMA.md`): fetched and read, explicitly
supporting, reputable where possible. In files, a citation is just a title and
a URL on an entry. To verify continuously (pages change, go dead, or turn out
not to say what was claimed) we need to know which statement each source backs,
how strongly, who checked it and when, and to rank publishers.

## Decision

- **Publisher** (by domain): a reliability tier 1–4 (1 primary, official or
  peer-reviewed; 2 scholarly or institutional reference; 3 general reference
  such as Wikipedia; 4 weak), its license, and a fetch policy (`allowed`,
  `browser_only` for sites that refuse automated readers, `forbidden`).
  openstax.org is `forbidden` and the database refuses any citation of it.
- **Citation** (by URL, shared): canonical URL, title, kind, and check results
  (last checked, HTTP status, content hash, archive URL).
- **Claim**: one atomic statement about an entry and a field (`as_written`,
  `date`, `title`, `text`, `location`, `origin`, `why`, …), with its value.
- **Evidence**: a claim ↔ citation pair with a stance (supports, partial,
  conflicts, unrelated), an excerpt of at most 25 words (a check constraint),
  who checked it (`agent:` / `human:` / `job:`), when, and how.
- Status (unverified, single source, corroborated, contested, stale) and a 0–1
  confidence are **computed** from the evidence (`evidence/confidence.py`):
  each publisher counts once, weighted by tier; conflicts scale confidence down
  and make a supported claim contested; a passed `recheck_after` makes it stale.

Legacy content arrives as one `as_written` claim per entry (its date, title and
text together, citing the entry's `cites`), plus `why` and `origin` claims where
the entry has them, with evidence method `legacy` and no check date. Following
the owner's rule, such a claim is **corroborated** if any non-Wikipedia
citation supports it and **single source** if only Wikipedia does. Verification
agents split claims into finer ones over time.

The page shows a citation only where its evidence supports or partly supports
the claim.

## Consequences

- "Which events rest only on Wikipedia?" and "which claims haven't been checked
  in a year?" are queries (and task generators), not audits.
- The legacy rule counts a single Britannica citation as corroborated; it is a
  starting point, and the computation is one function to change.
- Each use of a citation keeps the title and kind as that entry wrote them
  (`Evidence.cited_title`, `cited_kind`), because the same URL is sometimes
  cited with different wording; the snapshot reproduces them exactly.
