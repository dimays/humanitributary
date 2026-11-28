# 0024 — The web process serves the public page until a CDN does

**Status:** proposed (November 2026); amends [0001](0001-postgres-is-the-truth-the-site-reads-snapshots.md) (who serves the snapshot's page); amends [0020](0020-heroku-hosting.md) (the hosted app takes the bare domain); amended by [0043](0043-the-manyages-name.md) (the bare domain is manyages.com)

## Context

The owner wants the timeline live at https://humanitributary.com now, from the Heroku app that already holds the data
(ADR 0020), with no second app and no copy of the data. A release already contains the built page
(`releases/<version>/timeline.html` in the S3 releases bucket, behind the `latest` pointer: ADR 0019). The page loads
`images/…` (about 27 MB) and `outlines.js` from beside itself; both live in the repository under `site/`. ADR 0001
planned a CDN in front of the releases bucket; none exists yet, and setting one up is more than launch needs.

## Decision

- **`/` serves the latest release's page from the releases store** (`infra/site.py`). It is kept in memory by
  version; the pointer is re-read at most once a minute, so a `publish` or a `publish --rollback` reaches readers
  within a minute without a deploy. The database is never read: ADR 0001's guarantee holds. Before any release,
  `/` is a 503. The response carries `ETag` (the version), `X-Release` and `Cache-Control: public, max-age=300`.
- **`/images/*` and `/outlines.js` are served from the slug's `site/`** with `Cache-Control: public, max-age=86400`,
  through Django's static `serve`, which refuses paths outside its root. Nothing else under `site/` is served.
- **One name for the page:** `www.` redirects permanently to the bare host (`infra.site.WwwRedirect`), for any host
  whose `www.` form is also allowed.
- **DNS:** `humanitributary.com` (flattened CNAME at Cloudflare) and `www` point at the app's Heroku DNS targets,
  DNS only, with Heroku-managed certificates; `data.humanitributary.com` stays the admin's and the API's name.
- `/admin/`, `/api/agent/` and `/healthz` are unchanged. The staging app is production until a separate one exists.

## Consequences

- The site is live with no new service or cost. A store outage keeps the page in memory being served; a dyno
  restart with the store down shows a 500 until it answers.
- Gunicorn's sync workers serve the images, so heavy traffic would queue behind them. When that matters, put a CDN
  in front (Cloudflare's proxy or CloudFront): the cache headers are already set, and only DNS changes.
- Images change only with a deploy; their names aren't hashed, so a changed image can be stale in caches for a day.
