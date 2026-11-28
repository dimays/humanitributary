# 0049 — A third batch of source ratings: thirty-three more records for the domains agents were refused

**Status:** proposed (November 2026); amends [0044](0044-source-ratings-batch-2.md) (a third `Batch`, with the same rules)

## Context

Agents ask `GET /api/agent/policy?url=` before reading a page (ADR 0042) and an unrated domain is refused. The
round after ADR 0044 left most claim checks undone: for nearly every claim the second source an agent found was a
domain with no rating. These were the domains agents asked about, most asked first: the National Park Service,
doi.org, Project Gutenberg, the British Museum, Wikisource, LacusCurtius, the American Presidency Project, Getty,
World History Encyclopedia, Smithsonian Magazine, Khan Academy, Livius, Taylor & Francis, Christianity Today, the
Vatican, CCEL, New Advent, the Holocaust Memorial Museum, LibreTexts, JSTOR, Cornell, the Louvre, Business
Insider, Cambridge, Oxford Research Encyclopedias, the University of Chicago libraries and Institute, History
Extra, Lumen Learning, TheCollector, Pressbooks, Encyclopedia.com, Harvard, History.com, National Geographic, UCL
and ushistory.org. Batches 1 and 2 already rated the National Park Service, History.com, the British Museum, the
Holocaust Memorial Museum and Wikisource, and World History Encyclopedia as `browser_only`; those were not
re-read (a site that refused us is not retried).

Each remaining site's robots.txt and terms were read with an honest client, with the method of ADR 0037. Where a
page answered 403, 404 or a bot check it was not retried.

## Decision

**A third record file**, `ingest/ratings/2026-11-28c-sources.json` (33 records, the same format), as batch
`2026-11-28c` (`BATCH_3`, JobState `ratings_2026_11_28c`). The rules are ADR 0044's: restrictive verdicts are
recorded whatever the confidence, a permissive one only when no field of the record says it rests on something
unread, and a later rating never loosens a restrictive policy a row already has. Nothing is rated `allowed` on
robots.txt alone.

Result: 24 `browser_only`, 6 `citation_only` (Christianity Today, the Vatican, JSTOR, Cambridge, TheCollector,
Encyclopedia.com) and 3 `allowed`: Bill Thayer's LacusCurtius (public-domain pages only, and not by Wget, which
its robots.txt blocks), CCEL (non-commercial use, 10 s delay) and the doi.org resolver (its factsheet allows
programmatic resolution; the publisher a DOI leads to is checked on its own).

Sites whose robots.txt names AI crawlers with `Disallow: /` (the American Presidency Project, Christianity Today,
JSTOR, Pressbooks, National Geographic Society, the University of Chicago Library) are not `allowed`. The Louvre
is `browser_only` though its robots.txt only bars images, since its notice reserves reuse. Khan Academy,
Livius, UCL, Harvard and others rest on a page that refused us or on a search snippet: they are `browser_only`, which
costs a person a visit, not a claim.

## Consequences

- Thirty-three records now answer in the policy lookup instead of "unrated" (forty domains, with ancient.eu, isac,
  vocab.getty.edu and the like). Three became readable by script: penelope.uchicago.edu, ccel.org and doi.org.
- Most of what agents asked about stays closed to scripts. Their claim checks will need a person's browser, or a
  rated alternative source: for the presidents' texts, govinfo.gov rather than presidency.ucsb.edu.
- Project Gutenberg answered robots.txt with 503 and a long retry time, so it is `browser_only` until a person reads
  its terms. Getty's `vocab.getty.edu` disallows every crawler; batch 1's unapplied `api_only` there is superseded.
- The batch-1 note on `ccel.org` ("terms not read", unapplied) is replaced by this one.
- To re-rate a site, read its terms and add a record to a new batch (these files are not edited).
