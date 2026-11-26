# 0002 — Django, with apps split by responsibility

**Status:** accepted (November 2026)

## Context

The platform needs a relational model with migrations, an admin the owner can
review in, management commands for jobs and agents, and a test runner, all on
Postgres. The owner's other projects use Django 6, uv and Heroku, and he works
as a data engineer: the shape of the data matters more than the web layer.

## Decision

Django 6 on Python 3.12, managed with uv, psycopg 3, dj-database-url and
python-dotenv; a Heroku-ready layout (Procfile, whitenoise) without deploying.
The only web surface is the admin. Seven apps, each owning one responsibility
and depending only on those before it:

| App | Owns | Canonical? |
|---|---|---|
| `revisions` | The audit log and `revising()` (ADR 0006). | log |
| `timeline` | What the timeline says: entries, links, locations, images. | yes |
| `evidence` | Why we believe it: publishers, citations, claims, evidence. | yes |
| `ingest` | What has been collected: feeds, documents, entities, candidates. | no |
| `governance` | Branch metrics and proposals. | no |
| `work` | The agents' task queue. | no |
| `publish` | Releases and the snapshot format, both directions (import and export). | no |

Two refinements of the first sketch: the audit log is its own app (`revisions`)
rather than part of `publish`, because every canonical app writes through it
and `publish` reads from them (keeping the dependencies one-way); and the
legacy import sits in `publish` beside the export, because both are the
snapshot format seen from either side.

## Consequences

- "Canonical" is a property of an app: every table in `timeline` and
  `evidence` is audited, and nothing outside them is (a test checks).
- Working state (documents, candidates, tasks) can churn freely without
  flooding the audit log.
- The admin is the review screen for now; a purpose-built review UI can come
  later without touching the model.
