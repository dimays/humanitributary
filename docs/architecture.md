# Architecture

Humanitributary turns outside material (news feeds, Wikipedia, open archives)
into a cited timeline of all history, published as a single static page.
Scheduled, deterministic jobs collect and sort; Claude agents, working
through a queue, do everything that needs judgment; Postgres keeps every
fact, its evidence and every change to it; and a versioned snapshot, never
the live database, is what the page is built from.

```text
sources → ingest → transform → work queue → agents → canonical Postgres + validation → publish
```

How each stage works, from the code, is the technical guide. Start with
[its architecture chapter](guide/architecture.md), then follow the stage you
are changing:

| Stage | Chapter |
|---|---|
| Sources and their terms | [Sources and terms](guide/sources-and-terms.md) |
| Ingest and transform | [Ingestion](guide/ingestion.md) |
| The work queue and agents | [Work queue and agents](guide/work-queue-and-agents.md) |
| Canonical content | [Content model](guide/content-model.md), [Revisions](guide/revisions.md) |
| Validation | [Evidence and fact checking](guide/evidence-and-fact-checking.md), [Branch governance](guide/branch-governance.md) |
| Publish | [Publishing](guide/publishing.md) |
| Running it | [Operations](guide/operations.md) |

Every chapter is listed in [the guide's README](guide/README.md), and terms
are in the [glossary](guide/glossary.md). Why things are the way they are is
in the [ADRs](adr/README.md); the tables are in
[the data model](data-model.md). The guide stays true to the code because
each chapter is stamped against the code it covers
([How this guide stays true](guide/this-guide.md)).
