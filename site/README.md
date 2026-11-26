# The static site

The timeline itself: `template.html` and the build. The content lives in Postgres and reaches the page only through
a published release snapshot (schema and citation rules in [SCHEMA.md](SCHEMA.md)); the content files it was first
written in are frozen in [`archive/site-data/`](../archive/README.md) since the cutover (ADR 0021). What the page does,
how its content was gathered and audited, and every rebuild command are in the repository's
[README](../README.md#the-site-site); how this folder fits the data platform is in [AGENTS.md](../AGENTS.md).

```bash
make build                                                                  # mirror the latest release, then build from it
node site/build.mjs --from-json var/releases/latest/content.json            # build site/timeline.html from a release snapshot
node site/build.mjs --from-json var/releases/latest/content.json --check    # validate it only
node site/build.mjs --archive --dump-json out.json                          # the frozen legacy files, resolved (for manage.py import_legacy --archive)
```
