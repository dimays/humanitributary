What changed and why.

## Data
<!-- Migrations (and whether they touch canonical tables: a new one needs audit_table(), AGENTS.md rule 2), changes to the snapshot format (site/canonical.mjs and publish/content.py together, rule 8), or None. -->
- None

## How it was checked
- `make check`
- `make test`
- `make roundtrip` <!-- when import, export, the site build or content changed: counts, and "byte-identical" for both the JSON and the page -->
