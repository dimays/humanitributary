---
name: verify-stale-claims
description: Work verify_claim tasks that ingestion caused in the Humanitributary repo. A citation's link died, moved or its page changed (link health → facts sweep), or a Wikipedia-only claim has suggested second sources from open APIs (second_source job). Re-read, record evidence, accept or reject suggestions. Use when asked to fix dead or changed citations, verify stale claims, or check suggested second sources.
---

# Verify stale claims and suggested second sources

This skill adds ingestion's two cases to `.claude/skills/verify-claims` (read that first: the API, claiming,
stances and the result shape are the same). Both arrive as `verify_claim` tasks, keyed `claim:<id>`, so each claim
has at most one open task.

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/claim" -d '{"kinds": ["verify_claim"]}'
```

## Dead, moved or changed links (`reason`: `dead_link`, `content_changed`)

The daily `link_health` job re-checked the citation and the `facts sweep` turned the result into this task. The
payload's `evidence` rows carry what it found (`http_status`, `archive_url`, `page_changed`); the full history is
in the admin (Ingest › Link checks) for the owner.

- **Dead** (404/410, a redirect to the site's home page, or 599, unreachable three rounds running): read the
  `archive_url` (Wayback) copy if there is one. It may stand as the citation (kind `archive`) if it says the same.
  Otherwise find a replacement page that explicitly supports the claim and record it. Mark the dead citation's
  evidence `unrelated` only if it no longer supports anything.
- **Changed**: re-read the page (the payload's `page_changes` has the diff when available). If it still says
  the same, record `supports` again (that stamps the new hash). If it now says something else, record
  `conflicts` with `--found`.
- **Blocked** (403, CAPTCHA) never comes as a task: the page may be fine. If you are re-reading such a page
  anyway, use a browser and `--method browser_read`.

## Suggested second sources (`reason`: `no_second_source`, `suggested_sources` in the payload)

The `second_source` job searched OpenAlex, Crossref, the Library of Congress, Chronicling America, the
Smithsonian, Europeana, the World Bank, the Nobel Prize API and the Office of the Historian for the claim's
subject. Each suggestion has a `url`, `title`, `adapter`, a keyword `score` and a short `snippet`. **A
suggestion is not evidence.** The job matched words, not meaning.

1. Open each suggestion, best score first. A DOI resolves to the publisher's page: read the abstract or the
   text you can reach. A paywalled abstract that doesn't state the claim doesn't count.
2. If it **explicitly** supports the claim (or one atomic part: the date, the place, a number), put it in the
   result's `evidence` on that part (`{"claim": <part id>, "url": …, "stance": "supports", "excerpt": "≤ 25 words"}`)
   and its id in `suggestions.accepted`.
3. Otherwise put its id in `suggestions.rejected`. Two or three rejections with nothing better: search yourself (a
   museum, a university, a national archive), or leave the claim single-source and say so in the note.

Complete as in `verify-claims`, with `"suggestions": {"accepted": [ids], "rejected": [ids]}` in the result: the API
records the evidence and marks each suggestion decided by you.
