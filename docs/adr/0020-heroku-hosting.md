# 0020 — Heroku hosts the platform: a pipeline, staging first

**Status:** proposed (November 2026); amends [0016](0016-object-storage.md) (local storage is refused when hosted unless stated); amends [0019](0019-processes-and-release-gates.md) (the worker runs as a dyno); amends [0013](0013-source-policy.md) (hosted keys are config vars, and no key rides in a URL); amended by [0024](0024-the-app-serves-the-page.md) (the hosted app takes the bare domain)

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
  `humanitributary-staging` (region us, stack heroku-24). Production gets its own app and database at launch.
- **Staging holds the platform's data until then.** On November 26, 2026, with every local writer stopped, the
  laptop's Postgres was dumped and restored into staging's database and its MinIO buckets synced to S3; the
  `worker` dyno is the only place jobs run, and agents use the hosted API. One collector and one source of truth,
  never a laptop and a dyno both collecting. Heroku takes a backup daily. The owner chose this over keeping
  staging a disposable copy, so that the hosted setup is the one in daily use before launch.
- **Processes, from the `Procfile`:** `release` runs `migrate`; one `web` dyno (gunicorn: the admin, the agent API,
  `/healthz`) on Basic; a `worker` dyno (`run_jobs --loop`) on Basic, started once object storage was configured
  and the data moved (jobs write raw documents, and a dyno's disk is thrown away on restart). Heroku Scheduler
  running `run_jobs` stays the fallback if the worker's cost ever matters: the locks make the two interchangeable.
- **Heroku Postgres Essential-1, Postgres 16** (10 GB, 20 connections): Essential-0's 1 GB would not hold the full
  content with its claims, evidence, Revisions and ingested documents if the owner imports it, and the step up is
  $4 a month. The schema needs nothing an Essential plan lacks: `pg_trgm` is an allowed extension, and the audit
  triggers and advisory locks are plain Postgres. `heroku addons:upgrade` moves it to a bigger plan.
- **Object storage: AWS S3 in us-east-1**, the region Heroku's US dynos run in, so transfers between them cost
  nothing. Two private buckets per app, `humanitributary-staging-raw` and `humanitributary-staging-releases`
  (public access blocked, SSE-S3 encryption, owner-enforced object ownership, tagged), and an IAM user,
  `humanitributary-staging`, with no console login and one inline policy: `s3:ListBucket` and
  `s3:GetBucketLocation` on those two buckets, `s3:GetObject`, `s3:PutObject` and `s3:DeleteObject` on their
  objects (the pointer is rewritten by delete and save), nothing else, not even `CreateBucket`. Its access key is
  created straight into the app's config vars and lives nowhere else: not in a laptop's `.env` (local development
  stays on MinIO), not in GitHub's secrets (CI has none, and Heroku's integration deploys without them).
  Production gets its own buckets and its own user at launch. The owner chose S3 over Cloudflare R2, which would
  have cost nothing at this size, to stay in the AWS account they already have.
- **Two buildpacks, `heroku/nodejs` then `heroku/python`.** Python installs from `uv.lock` on the Python in
  `.python-version` and runs `collectstatic`. Node runs `site/build.mjs`, the publish gates' build, now that
  publishing happens on staging (after the cutover, Postgres is the only source: ADR 0001). `package.json` exists
  only to pin it (`engines.node` 24.x, CI's version) and declares no dependencies: the build uses Node's built-ins
  alone, so `npm` installs nothing.
- **Settings outside dev** (`config/settings.py`): the database connection requires TLS (`sslmode=require`);
  HTTPS redirect, secure cookies and HSTS for an hour (`SECURE_HSTS_SECONDS`; a year at launch, no subdomains or
  preload); logs to stdout at `LOG_LEVEL` (Django prints nothing with `DEBUG` off otherwise; staging runs
  `WARNING`), with `httpx` and `httpcore` held at `WARNING` because they log every request's full URL; and the local storage
  backend only when `STORAGE_BACKEND=local` is set on purpose. `/healthz` reports `storage_backend`, so a green
  check on a throwaway disk says so.
- **Config vars**, never copied from a laptop's `.env`: `SECRET_KEY` (generated on Heroku, never printed),
  `ENVIRONMENT=staging`, `ALLOWED_HOSTS`, `INGEST_CONTACT`, `S3_REGION`, `S3_BUCKET_RAW`, `S3_BUCKET_RELEASES`
  (no `S3_ENDPOINT_URL`: AWS), and `STORAGE_BACKEND=local` only until the access key is in. The access key, API
  keys, `ALERT_EMAILS` and the mail settings are the owner's to set. **No key rides in a URL:** the Smithsonian
  adapter sends api.data.gov's `X-Api-Key` header, as Europeana's already did, so a key can't reach a log line or an
  error. (The first hour of hosted INFO logging printed the Smithsonian key in request URLs to Heroku's log buffer;
  no drain kept them, and the owner was asked to rotate the key.)
- **Deploys:** the pipeline is connected to `dimays/humanitributary` through Heroku's GitHub integration, and
  `main` deploys to staging automatically only after CI (`make check-pr`) passes on it. A release whose `migrate`
  fails is not deployed.
- **DNS: Cloudflare's free plan, the registrar unchanged.** `humanitributary.com` stays registered at Namecheap,
  with its nameservers pointed at Cloudflare: free, where Route 53 charges per zone, and able to proxy and cache in
  front of whatever serves the page. Which CDN serves the `releases` bucket (CloudFront with origin access, or
  Cloudflare in front of it) is decided at launch. Records: `data` is a DNS-only CNAME to the hosted app's Heroku
  DNS target, so Heroku issues the certificate (the owner's choice of name: the admin and the agent API live there,
  whichever app holds the data); `@` TXT `v=spf1 -all` and `_dmarc` `p=reject`, since nothing sends mail as the
  domain. The bare domain and `www` stay empty until the public page exists.
- `app.json` records the buildpack, formation, add-on and variables, for review apps and a rebuild from scratch.

Monthly cost (Heroku's prices, prorated to the second), approved by the owner: web Basic $7, Postgres Essential-1
$9: **$16** while the worker is at 0; **$23** with it, as it runs now. S3, billed by AWS, should stay under about $1 a month at
staging's size (storage at $0.023 a GB, requests at fractions of a cent per thousand). Production at launch
roughly doubles it.

## Consequences

- Agents and the owner have a URL that doesn't depend on the laptop; `/healthz` on it is the uptime check.
- Staging's stores are S3 once its access key is in; until then they are its dyno's disk, and `/healthz` says
  `storage_backend: local`. A laptop can't write staging's buckets, so a local job never overwrites them.
- The laptop's database is a development copy from November 26, 2026 on; nothing should write it as if it were the
  data. Agent tokens moved with it (and are worth rotating, now that they reach a public URL).
- A hosted environment that forgets the `S3_*` variables fails at start instead of quietly losing files.
- Revisit if the dynos' cost or Essential's limits (10 GB, no follower, no point-in-time rollback) start to bind:
  Scheduler instead of the worker, a bigger plan, or another host for the same `Procfile`.
