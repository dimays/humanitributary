# 12. Add a data source

Purpose: This procedure tells how to add a new source that jobs read. The first part is a check of its terms.

The source policy is in `ingest/policy.py` and `ingest/seed.py`. The decisions and each verdict are in ADR 0013. Each
request goes through `ingest.http.Fetcher`, which obeys the policy.

> **WARNING:** Never cite or fetch openstax.org. Its terms forbid use of its textbooks by AI systems. The database
> refuses such a citation.

## Before you start

- You have the URL of the source and of its terms.
- You know which job reads the source, or that a new job is necessary.

## Read the terms first

1. Read the terms of use of the source. If it has an API, read the API terms too.
   Make sure that you record the clause that decides the verdict.
2. Read the `robots.txt` of the host, and also its `Content-Signal` lines and its `tdmrep.json`.
   Make sure that `robots.txt` permits the paths that the job reads.
3. Read the license of the data.
   Make sure that you know what the job may keep.
4. Choose what the job keeps: metadata, a headline and a link, a lead of 60 words or fewer, or nothing.
   Make sure that the choice obeys the terms.
5. If the terms do not permit automated reads, add the host to `NEVER_FETCH` in `ingest/policy.py`, with the reason.
   Make sure that you stop here. Agents can still cite the pages and read them in a browser.

## Add the source

1. Add the publisher to `PUBLISHERS` in `ingest/seed.py`, with its tier, license and `fetch_policy`.
   Make sure that the `fetch_policy` is `allowed`.
2. Add the verdict to `VERDICTS` in `ingest/seed.py`, with the clause.
   Make sure that the clause is the same as in your notes.
3. If the source states a rate limit or a `Crawl-delay`, add the host to `HOST_DELAY` in `ingest/policy.py`.
   Make sure that the delay agrees with the source.
4. Add the feed to `FEEDS` in `ingest/seed.py`, with its interval and the job that reads it.
   Make sure that `config["job"]` names a job that exists.
5. If the source needs a new job, add a function with `@job(name, interval=…)` to `ingest/job_defs.py`.
   Make sure that the job makes no call to a language model.
6. If the source needs a key, add it to `config/settings.py`, to `.env.example` with no value, and to
   `SECRET_SETTINGS`.
   If the API permits it, make sure that the key goes in a header.
7. Record a test cassette with `tests/record_fixtures.py`, and write a test that replays it.
   Make sure that the cassette has no key in it.
8. Add the verdict to the table in `docs/adr/0013-source-policy.md`, with the same clause.
   Make sure that `make check-adr` passes.
9. Update the guide chapters that `make check-guide` names, and deploy with procedure
   [11](11-deploy-a-code-change.md).
   Make sure that CI passes and Heroku shows the new release.

## Start the source on the live app

1. If the source needs a key, set it as a config var:

   ```bash
   heroku config:set <KEY NAME>=<value> -a humanitributary-staging
   ```

   Make sure that you do not paste the key into a log or a chat.
2. Run the seed job now, so that it makes the new `Publisher` and `Feed` rows:

   ```bash
   heroku run python manage.py run_job seed_sources -a humanitributary-staging
   ```

   Make sure that the output says `ok`.
3. Write the access note and the `fetch_policy` on the new `Publisher` row in the admin.
   Make sure that the access note has the verdict and the clause.
4. Show each feed and its policy:

   ```bash
   heroku run python manage.py digest --sources -a humanitributary-staging
   ```

   Make sure that the new feed shows as on, with the policy `allowed`.
5. Open the job runs page of the console after the next due time of the feed.
   Make sure that the first run has the status `ok` or `partial`.

> **NOTE:** `VERDICTS` goes into a database only one time (`JobState` "terms_verdicts_v1"). A new verdict does not
> reach the live database by itself. That is why step 3 writes it in the admin.

> **CAUTION:** Do not call `httpx`, `requests` or `urllib` directly in a job. Use the `Fetcher` of the job context.
> Only the `Fetcher` obeys the source policy.
