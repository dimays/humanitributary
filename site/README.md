# The static site

The timeline itself: `template.html`, the content in `data/*.js` (schema and citation rules in [SCHEMA.md](SCHEMA.md)), and the build. What the page does, how its content was gathered and audited, and every rebuild command are in the repository's [README](../README.md#the-site-site); how this folder fits the data platform is in [AGENTS.md](../AGENTS.md).

```bash
node site/build.mjs --check                        # validate data/*.js
node site/build.mjs                                # build site/timeline.html from data/*.js
node site/build.mjs --dump-json var/legacy.json    # the resolved content, for manage.py import_legacy
node site/build.mjs --from-json var/releases/latest/content.json   # build from a release snapshot
```
