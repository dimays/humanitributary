---
name: verify-claims
description: Work verify_claim tasks in the Tributaries repo — re-read a claim's cited pages (stale, dead link, changed page, conflicting source, or a Wikipedia-only event that needs a second source) and record what each page says as evidence. Use when asked to verify claims, adjudicate conflicts, or work the verify_claim queue.
---

# Verify claims

The fact sweep (`docs/fact-checking.md`) queues a `verify_claim` task whenever a claim needs a human-quality read.
Read `AGENTS.md` and `site/SCHEMA.md` ("Citation rules") first. (Ingestion's link-health job queues the same task
kind with the same dedupe key; its skill `verify-stale-claims` covers the dead-link case in more detail.)

## 1. Claim a task

```bash
uv run python manage.py tasks next --kind verify_claim --claim --agent agent:<you>
```

The payload: `reason`, `todo` (what to do), `claim` (id, field, value, status, witnesses), `entry` (title, date,
text), `evidence` (each citation's URL, publisher, tier, fetch policy, excerpt, last check, HTTP status, archive URL,
whether the page changed), `parts` (its atomic claims: date, location, numbers, actors) and, for a changed page,
`page_changes` (the text diff).

## 2. Read

Fetch and read each cited page (a `browser_only` publisher such as britannica.com in a browser, never by script;
never openstax.org). For a dead link, try `archive_url` or the Wayback Machine. Decide, per page and per part:

- **supports**: the page explicitly says it; copy an excerpt of at most 25 words.
- **partial**: it says part of it (say which in the excerpt).
- **conflicts**: it says something else (record what, in `--found`, e.g. `{"y": 1951.3, "when": "April 1951"}`).
- **unrelated**: it does not bear on it (it will no longer be shown as a source).

By reason:

- `no_second_source`: find a reputable non-Wikipedia page that explicitly supports the claim and record it on the
  atomic parts it supports (the date, the place, a number); add it to the entry's `cites` in its data file too, so
  the page shows it (until the cutover the legacy files own the record's citations).
- `conflict`: read both sources. Fix the entry if ours is wrong (through the service layer, or its data file);
  if reputable sources disagree, say so in the text ("Sources differ: …" or "Wikipedia says …; Britannica says …"),
  which the publishing rule (ADR 0010) requires; if the conflicting page is about something else, mark it unrelated.
- `dead_link` / `content_changed` / `scheduled` / `value_changed`: re-read and record each page's stance again.

## 3. Record

```bash
uv run python manage.py facts record --claim <id> --url <url> --stance supports --excerpt "…" \
    --agent agent:<you> --task <task> [--method browser_read] [--found '{"y": …}']
```

Each record stamps the check time and the page's hash and recomputes the claim's status, confidence and next
recheck. Corroborated needs two independent publishers (Wikipedia counts once); `facts check <slug>` shows whether
the entry may be published.

## 4. Finish

```bash
uv run python manage.py tasks complete <task> --result result.json --agent agent:<you>
```

with `{"claim": <id>, "status": "<new status>", "recorded": [evidence ids], "changed_entry": false, "note": "…"}`.
