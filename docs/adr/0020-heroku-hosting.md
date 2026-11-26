# 0020 — Heroku hosts the platform: a pipeline, staging first

**Status:** proposed (November 2026); amends [0016](0016-object-storage.md) (local storage is refused when hosted unless stated); amends [0019](0019-processes-and-release-gates.md) (the worker runs as a dyno)

## Context

The platform ran only on the owner's laptop. Agents need a URL that is up when the laptop is asleep, the jobs need
a machine that runs them on time, and the owner wants production's patterns proven before launch. The code was
already laid out for Heroku (the `Procfile`, whitenoise, `DATABASE_URL`, settings from the environment: ADR 0019),
and the owner already runs other apps there on Basic dynos with Heroku Postgres. The owner never plans to monetize
the site, so cost decides between equivalent options, and nothing paid is created without their yes. The public
page doesn't need any of this: it is a static release behind a CDN (ADR 0001), so the database and the dynos are
never in a reader's path.

## Decision

- **A pipeline, `humanitributary`, with a staging app now and production at launch.** Staging is
  `humanitributary-staging` (region us, stack heroku-24), on its `herokuapp.com` domain. Production gets its own
  app and database at launch, and the custom domain then, never on staging.
- **Processes, from the `Procfile`:** `release` runs `migrate`; one `web` dyno (gunicorn: the admin, the agent API,
  `/healthz`) on Basic; a `worker` dyno (`run_jobs --loop`) on Basic, **scaled to 0 until object storage is
  configured**, because jobs write raw documents and a dyno's disk is thrown away on restart. Heroku Scheduler
  running `run_jobs` stays the fallback if the worker's cost ever matters: the locks make the two interchangeable.
- **Heroku Postgres Essential-1, Postgres 16** (10 GB, 20 connections): Essential-0's 1 GB would not hold the full
  content with its claims, evidence, Revisions and ingested documents if the owner imports it, and the step up is
  $4 a month. The schema needs nothing an Essential plan lacks: `pg_trgm` is an allowed extension, and the audit
  triggers and advisory locks are plain Postgres. `heroku addons:upgrade` moves it to a bigger plan.
- **One buildpack, `heroku/python`**, which installs from `uv.lock` on the Python in `.python-version` and runs
  `collectstatic`. Node is not installed: no hosted process runs `site/build.mjs` until publishing moves to Heroku
  (after the cutover, ADR 0001), and the build gate refuses cleanly without it. Adding it then needs a
  `package.json` and the `heroku/nodejs` buildpack first.
- **Settings outside dev** (`config/settings.py`): the database connection requires TLS (`sslmode=require`);
  HTTPS redirect, secure cookies and HSTS for an hour (`SECURE_HSTS_SECONDS`; a year at launch, no subdomains or
  preload); logs to stdout at `LOG_LEVEL` (Django prints nothing with `DEBUG` off otherwise); and the local storage
  backend only when `STORAGE_BACKEND=local` is set on purpose. `/healthz` reports `storage_backend`, so a green
  check on a throwaway disk says so.
- **Config vars**, never copied from a laptop's `.env`: `SECRET_KEY` (generated on Heroku, never printed),
  `ENVIRONMENT=staging`, `ALLOWED_HOSTS`, `INGEST_CONTACT`, `STORAGE_BACKEND=local` until the `S3_*` variables
  exist. API keys, `S3_*`, `ALERT_EMAILS` and the mail settings are the owner's to set.
- **Deploys:** the pipeline is connected to `dimays/humanitributary` through Heroku's GitHub integration, and
  `main` deploys to staging automatically only after CI (`make check-pr`) passes on it. A release whose `migrate`
  fails is not deployed.
- **DNS: Cloudflare's free plan, the registrar unchanged.** `humanitributary.com` stays registered at Namecheap,
  with its nameservers pointed at Cloudflare. Cloudflare is the likely CDN and object store (R2: no egress fees, and
  an R2 bucket gets a custom domain only in a Cloudflare zone), so one account serves DNS, the page and the bucket.
  No record points at Heroku until launch; then production (never staging) gets a subdomain for the admin and the
  agent API, a CNAME to its Heroku DNS target with Heroku's certificate, and the bare domain serves the static page.
- `app.json` records the buildpack, formation, add-on and variables, for review apps and a rebuild from scratch.

Monthly cost (Heroku's prices, prorated to the second), approved by the owner: web Basic $7, Postgres Essential-1
$9: **$16** while the worker is at 0; **$23** with it. Production at launch roughly doubles it.

## Consequences

- Agents and the owner have a URL that doesn't depend on the laptop; `/healthz` on it is the uptime check.
- Until object storage is chosen (S3 or R2), staging's stores are its dyno's disk: `/healthz` is green and says
  `storage_backend: local`, the worker stays at 0, and nothing worth keeping should be published there.
- Staging's database starts empty. Importing local data into it is a separate decision.
- A hosted environment that forgets the `S3_*` variables fails at start instead of quietly losing files.
- Revisit if the dynos' cost or Essential's limits (10 GB, no follower, no point-in-time rollback) start to bind:
  Scheduler instead of the worker, a bigger plan, or another host for the same `Procfile`.
