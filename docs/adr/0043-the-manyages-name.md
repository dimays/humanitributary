# 0043 — The site is ManyAges at manyages.com; humanitributary.com redirects until it expires

**Status:** proposed (November 2026); amends [0024](0024-the-app-serves-the-page.md) (the bare domain is manyages.com); amends [0034](0034-brand-assets.md) (the brand files carry the new name); amended by [0047](0047-manyages-variable-names.md) (the environment variables are renamed, with a fallback)

## Context

The site was called Humanitributary, at `humanitributary.com`. The owner finds the name hard to say and to spell,
and it sounds like "obituary". They bought `manyages.com` at Namecheap on November 28, 2026 (not `.org`), and turned
off auto-renew on `humanitributary.com`, which expires on November 26, 2027.

Links to the old name are out: shared event links (`https://humanitributary.com/#<slug>`), the preview card, the
console's bookmarks, and every agent environment's `HUMANITRIBUTARY_API`
(`https://data.humanitributary.com/api/agent`). A browser follows a redirect for a page and keeps the `#` part of
the URL. An HTTP client does not resend a `POST` body across a 301 or 302, and the agent API is mostly `POST`s.

The name is also inside the code, in two kinds of places: what a person reads (the page's title and header, the
manifest, the preview card, the console's and the admin's titles, the bot's User-Agent, the alert mail's sender, the
docs), and identifiers nobody outside the repository sees (the Django project, the Postgres audit functions and
settings, the database and MinIO user names, the S3 buckets, the Heroku app and pipeline, the environment variables
`HUMANITRIBUTARY_API`, `HUMANITRIBUTARY_TOKEN_*`, `HUMANITRIBUTARY_AGENT`).

## Decision

**The name is ManyAges** (that capitalization), and the title is "ManyAges — all of history, cited".
`SITE_NAME = "ManyAges"`; everything derived from it follows: the manifest and icons (`make brand`), the preview
card (`make card`), the console and admin titles, `PUBLIC_SITE_URL`'s default (`https://manyages.com`), the
User-Agent (`ManyAgesBot/0.1`) and the alert sender's default display name.

**Hosts.** `manyages.com`, `www.manyages.com` and `data.manyages.com` are custom domains on the same Heroku app,
each a DNS-only CNAME on Cloudflare (flattened at the apex) with a Heroku-managed certificate, as the old three
were. The `manyages.com` zone copies the old zone's settings and its two mail records (`v=spf1 -all`, a rejecting
DMARC).

**The old domain redirects at Cloudflare, not in the app.** `humanitributary.com` and `www` become proxied and a
redirect rule answers each with a 301 to `https://manyages.com` with the same path and query; the `#` fragment never
reaches a server, and the browser keeps it. Their Heroku custom domains are removed, since a proxied name cannot
renew a Heroku certificate. Nothing on the app knows the old name, and the redirect ends when the domain does.

**`data.humanitributary.com` keeps serving** (DNS only, in `ALLOWED_HOSTS` and `OPS_HOSTS`) until every agent
environment sets `HUMANITRIBUTARY_API=https://data.manyages.com/api/agent`. Then it either becomes a 308 redirect at
Cloudflare (a 308 keeps the method and body) or keeps serving until the domain expires.

**The identifiers stay.** Renaming the environment variables means pasting nine secrets into the cloud environment
again; the audit functions and their settings would need a migration that rewrites triggers on every audited table;
the buckets, the Heroku app and the databases would need copies and moves of live data. None of them is seen by a
reader. The repository is the exception: it is the bot's public contact, so it became `dimays/manyages` (GitHub
redirects `dimays/humanitributary`), and `INGEST_CONTACT` and the round routine's source name the new URL.

## Consequences

- Old links work until November 26, 2027: pages and event links redirect, the data host serves.
- The preview card and every brand file show the new name after the deploy, and the page after the next release
  (a page-only change publishes: [0029](0029-release-identity-includes-the-page.md)).
- The docs name the site ManyAges and its hosts `*.manyages.com`; commands still name `humanitributary-staging`,
  the buckets and the environment variables, because those are their real names.
- Agent environments must change `HUMANITRIBUTARY_API` before `data.humanitributary.com` stops serving; a round with
  the old value then fails on its first call
  (or, after a 308, still reaches the app), never writing anywhere else.
