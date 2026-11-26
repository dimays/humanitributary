# 0016 — Object storage for everything that isn't a row

**Status:** accepted (November 2026)

## Context

Raw fetched documents lived in `var/raw/` and release snapshots in `var/releases/` with a `latest` symlink. Heroku
dynos have ephemeral disks, the public site will be served from a CDN, and the owner wants production patterns used
now, while content is still built locally, so they are exercised before launch.

## Decision

Every file that isn't a database row goes through one interface, `infra/storage.py`, over two Django storages:

| Storage | Bucket (default) | Keys |
|---|---|---|
| `raw` | `humanitributary-raw` (private) | `raw/<hash[:2]>/<hash>`: fetched bytes by sha256, the value `Document.raw_path` holds |
| `releases` | `humanitributary-releases` (the CDN's origin later) | `releases/<version>/{content.json, manifest.json, changes.json, changes.md, timeline.html}` and `releases/latest.json` |

- **Backends by environment, same variables everywhere.** `S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`,
  `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET_RAW`, `S3_BUCKET_RELEASES` select django-storages' S3 backend:
  MinIO locally (`docker-compose.yml`, S3 API and console bound to 127.0.0.1 only; `make env` generates the
  credentials into `.env`), S3 or Cloudflare R2 in production (`S3_REGION=auto` and the account endpoint for R2).
  `STORAGE_BACKEND=local` keeps both in `var/storage/<bucket>/` with no Docker. The test runner
  (`tests/runner.py`) always swaps in temporary directories: the suite never reaches MinIO or the network.
- **Write-once.** Raw documents are content-addressed; release files are never overwritten (`storage.write` raises
  `Immutable` on different bytes). The only object that moves is `releases/latest.json`, the pointer (ADR 0019).
- **Migration without loss.** `manage.py storage migrate_local [--var-dir DIR] [--dry-run]` (`make
  storage-migrate`) copies `var/raw` and `var/releases` into the store after checking each raw file's hash, writes
  the pointer from the old `latest` symlink, is idempotent, deletes nothing, and lists anything the database refers
  to that the store still lacks. The keys equal the old relative paths, so no row changes.
- **The site build reads a local mirror.** `manage.py storage pull-release [VERSION]` (`make release-pull`, and
  `make build-release` first) copies a release into `var/releases/<version>/` and points `var/releases/latest`
  at it.

The MinIO image is Chainguard's build pinned by digest: `minio/minio` is no longer published on Docker Hub.
`MINIO_IMAGE` overrides it.

## Consequences

- Dynos can be thrown away; the CDN can serve `releases/` directly; a rollback is a pointer write.
- Locally, `make db` starts MinIO beside Postgres and creates the buckets. Until `make storage-migrate` has run,
  documents fetched before this change read as missing (their diffs in verify_claim payloads are skipped).
- A `.env` made before this change lacks the S3 variables: `make env` adds only the missing keys (printing none of
  them). Without them the backend is `local`.
- Per-object cache headers for the CDN (immutable versions, a short TTL on `latest.json`) are set when the CDN is.
