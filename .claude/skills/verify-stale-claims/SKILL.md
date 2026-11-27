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

**Extend a long lease.** A lease runs 30 minutes (`TASK_LEASE_MINUTES`). When one task's work passes about 20
minutes (a slow site, a long read, a second source to find), extend it before it runs out, and again every 20
minutes while you still work on it:

```bash
api -X POST "$HUMANITRIBUTARY_API/tasks/<id>/extend" -d '{"minutes": 30}'
```

A lease that runs out may be taken over by another agent; then your `complete` is refused (409) and the work is
lost. If you can't finish, `release` the task (untouched) or `fail` it with the reason; never leave it to lapse.

## Fetching: honest, one tab, never forced

- **Never disguise the client.** Every page you fetch by script sends the project's honest User-Agent:
  `curl -sS -A "$INGEST_USER_AGENT" <url>` (the same value as the app's `INGEST_USER_AGENT`). No spoofed browser
  User-Agent, no header tricks, no proxies, mirrors or caches to get round a site that refuses automated reads.
  The safety checks block such attempts, and they break the source policy (ADR 0013). If a site refuses, use
  another reputable source, or hold or reject the work.
- **Exactly one in-app browser tab per agent.** Open one tab, reuse it for every page you read, and close it when
  you finish, also when you stop early, fail or release a task. Leftover tabs fill the pane's cap (about eight)
  and starve the other agents. A cloud session has no in-app browser: there a `browser_only` page can't be read
  at all (see the `run-round` skill).
- **Paid and blocked wires are common in news.** Reuters (401), AFP (access denied) and CNN (451) often refuse.
  Don't force them. Find another readable, independent, reputable source; record only pages you read.

## Excerpts

- **Copy excerpts from the page itself, never from a fetch tool's summary.** Tools such as WebFetch hand back a
  model-written summary of the page, and the "quotes" in it are often paraphrased, shortened or straightened. For
  every excerpt (and every stance you record), read the page's own text: the in-app browser's `get_page_text`, or
  `javascript_tool` returning the matching sentence from `document.body.innerText`, or the raw page via `curl` where
  the site allows scripts. Then copy the sentence character for character. If only a summary is reachable, cite the
  page without an excerpt and say so in your note. Every review round so far has had to re-copy summarized excerpts.

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
