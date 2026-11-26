# 0010 — What may be published

**Status:** proposed (November 2026). Enforced for entries published from
now on; what to do about legacy content that breaks it is the owner's call
(see Consequences).

## Context

The fact base can now say which claims are contested and which entries rest
on Wikipedia alone (ADR 0009). Publishing is where those facts should bite:
readers should never see a contested statement presented as settled, and the
site's citation rules (`site/SCHEMA.md`) already prefer reputable,
non-Wikipedia sources. Current events are the exception: for the first days,
Wikipedia and wire reports may be all there is.

## Decision

An entry may become `published` only if:

1. **No contested claim without a "sources differ" note.** If any of its
   record claims is contested, its text (or date) must say that the sources
   differ, in words like "sources differ", "estimates vary", "disputed", or by
   attributing each version to its source ("Wikipedia says … ; the Met
   says …").
2. **No event without a non-Wikipedia source**, after a grace period for
   current events: an event dated this year or last may be published on
   Wikipedia alone for 14 days (`grace_days`) after it was written.

`evidence.publishing.problems(entry)` lists what stands in the way;
`publish_entry()` (and `manage.py facts publish <slug>`) is the door agents
use, and refuses with that list unless given an override note, which is
recorded in the Revision's reason. `manage.py facts check <slug>` shows the
problems without publishing.

Entries published before this rule (the legacy content, which the import
writes as published) are not withdrawn by it. The fact sweep queues
`verify_claim` tasks ("find a second source", priority 20) for published
events that break rule 2, and contested claims get adjudication tasks.

## Consequences

- Today 1,879 published events have no non-Wikipedia source (58 of them
  current events inside the grace period). They stay on the page; the sweep
  works through them at up to 200 tasks a run.
- The import does not apply the rule (it mirrors the legacy files). After the
  cutover, when entries are written only in Postgres, the door is the only way
  to publish.
- **For the owner to decide**: whether, after a further grace period, legacy
  events still resting on Wikipedia alone should be demoted to `review`
  (dropping them from the page) or keep a visible "single source" mark.
