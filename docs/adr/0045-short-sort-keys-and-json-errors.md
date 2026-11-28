# 0045 — Sort keys stay short and a used-up gap is respaced; the agent API answers every error as JSON, refuses long excerpts and counts unrated lookups

**Status:** proposed (November 2026); amends [0008](0008-entry-order.md) (appends step instead of halving, and a used-up gap respaces its neighbours, in the same order) and [0017](0017-agent-api.md) (a value that doesn't fit is a 422 naming the field, any other failure a JSON 500, an excerpt over 25 words a 422, and `GET policy` counts its unrated answers)

## Context

Three faults from the live agent rounds of November 27, 2026:

- **A 500 that lost an agent's work.** `POST tasks/<id>/complete` for `fill_gap` answered Django's HTML 500 with
  `DataError: value too long for type character varying(64)`, from `_create_event` → `services.save_event` →
  `apply_changes` → `obj.save()`. The column was `Entry.sort_key`. `ordering.between(last, None)`, used for every
  new entry, took the midpoint between the last key and the end of the range. Each append halved the room that was
  left, so a key grew by a digit every six appends: 372 appends after the 5,400 imported events pass 64 characters
  (`tests/test_ordering.py` shows it). Inserting again and again after one event (`after` in a result) halves that
  gap the same way: about 300 inserts. The agent got an HTML page, not a reason, and its result was lost.
- **The excerpt limit wasn't enforced.** Rule 5 and ADR 0004 say an excerpt is at most 25 words (the
  `evidence_excerpt_25_words` constraint holds it in the table). Edit files refused a longer one, but the task
  appliers cut it to 25 words without saying so: a `verify_claim` with a 30-word excerpt was accepted, and the
  stored excerpt was no longer what the agent quoted.
- **Unrated domains were invisible.** `GET policy?url=` (ADR 0042) answers `may_fetch: false` for an unrated domain
  and recorded nothing. `manage.py unrated_domains` lists only the domains queued tasks cite, and showed 0 while
  agents were refused dozens of unrated sites (wto.org, pbs.org, olympics.com, fifa.com …).

## Decision

**Sort keys** (`timeline/ordering.py`, `timeline/services.py`):

- `between(lo, hi)` returns the key with the fewest digits in the gap (the middle one of those), computed exactly
  with fractions. With an open end it takes a small step from the closed one: `1/APPEND_STEP` (1/62²) of the room
  left, not half of it. 5,000 appends after 5,400 events stay at six digits.
- When the key `between` gives is longer than `MAX_LEN` (16), `services._new_key` respaces: `ordering.respace(keys,
  i)` takes a window around the insertion point (four entries each side, doubling until the fresh keys are at most
  `RESPACED_LEN`, 8, long; the whole kind at worst) and gives it evenly spaced keys from `spread`, with a place for
  the new entry. Each moved entry's key is written through `apply_changes`, so each leaves a Revision. This is the
  amendment to ADR 0008: inserting or moving an entry still writes one key in the common case, but when its gap is
  used up, its neighbours' keys change too. Their relative order never changes, so the snapshot is the same.
- `spread(n, lo, hi)` now gives keys of one width, the narrowest with room for about 60 inserts between neighbours
  (it already did so for a fresh list).
- The column is widened to 255 characters (migration `timeline/migrations/0005_sort_key_255.py`), a backstop; keys stay at 16 or
  fewer. Production's long keys at the end of the event order are respaced by the first append after the deploy.

**Errors from `complete`** (`agentapi/views.py`, `agentapi/auth.py`, `timeline/services.py`):

- `services.apply_changes` checks each text against its `CharField`'s `max_length` before it saves, and raises a
  `ValidationError` keyed `<model>.<field>`.
- `complete` answers a `ValidationError` or a Postgres `DataError` as a 422 whose `fields` names the field (for a
  `DataError`, the column from psycopg's diagnostics when Postgres gives one). The transaction is rolled back and
  the task stays claimed by the agent, so it fixes the result and sends it again.
- `agent_view` catches any other exception in an agent endpoint, logs it with its traceback (logger `agentapi`) and
  answers a JSON 500 with the exception's type. No agent endpoint answers an HTML page.

**Excerpts** (`agentapi/schemas.py`): `schemas.errors` counts the words (split on whitespace, as the constraint does)
of every excerpt a result carries, found by `schemas.excerpts`: the cites of a `write_event`'s event and of an
`audit`'s or a `fill_gap`'s events, and a `verify_claim`'s evidence rows. One over `EXCERPT_WORDS` (25) is a
problem in the 422, naming its path (`evidence/0/excerpt: the excerpt is 30 words; at most 25`). The excerpt
check against stored pages (`agentapi/evidence.py`, ADR 0036) uses the same walk.

**Unrated lookups** (`agentapi/policy.py`, `ingest.UnratedLookup`): each `unrated` answer of `GET policy` upserts
one row per domain (one `INSERT … ON CONFLICT`, in a savepoint; a failure is logged and never changes the answer):
`lookups` + 1, `first_seen`, `last_seen`, the latest URL and who asked. No other answer is recorded.
`unrated_lookups()` lists them, most asked first, leaving out domains rated since. `manage.py unrated_domains`
prints them under the domains tasks cite (`--json`: `{"cited_by_tasks", "asked_by_agents"}`), and the console's
Work page shows the top ten, each linking to the admin's Publisher search.

## Consequences

- An agent can't lose work to a long sort key again, and any failure in `complete` comes back as JSON it can act
  on: fix and resend (422), resend (409), or release with a reason (500).
- A respace writes a Revision per moved entry (`sort_key`, `updated_at`), in the same transaction as the insert. The
  first append on production rewrites the few hundred keys at the end of the event order once; after that, a
  respace touches a window of about ten entries, roughly every 60 inserts at one point.
- `unrated_domains --json` changed shape (an object with two lists, not one list). Nothing in the repo reads it but
  the tests; a script that did must read `cited_by_tasks`.
- A result whose excerpt is over 25 words is now refused, where it was cut before. Skills already say 25 words; an
  agent that relied on the cut gets a 422 naming the excerpt.
- `UnratedLookup` is a tally, not canonical (no Revision), like `PrefetchedPage`. It grows by one row per domain, so
  no retention is needed. If agents are ever refused many URLs on one site, the count says how much, not which pages.
