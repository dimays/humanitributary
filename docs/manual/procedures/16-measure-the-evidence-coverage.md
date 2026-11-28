# 16. Measure the evidence coverage

Purpose: This procedure tells how to find the tasks that have no stored source other than Wikipedia, and the sites
that cause this.

The job `prefetch_sources` reads the pages of each queued task before an agent claims it (ADR 0036). It reads only
the sites whose publisher has a tier and the fetch policy `allowed`. For catalog pages, it reads the
official API of the catalog. It keeps the clean text of each page in the private store
for 180 days (365 days for an open license). Agents copy their excerpts from this text.

A task is "ready" when its evidence pack has one or more stored pages that are not Wikipedia. A task is "possible"
when it cites a page that is not Wikipedia and that the policy lets a job read. A task is "open" when such a page is
on a site that did not refuse the job.

## Before you start

- You have access to the Heroku app `humanitributary-staging`.
- The job `prefetch_sources` ran in the last hour.

## Procedure

1. Open the Work page of the console, `https://data.manyages.com/ops/work/`.
   Make sure that the cards of `write_event`, `fill_gap` and `verify_claim` show "evidence ready".
2. Write the report:

   ```bash
   heroku run python manage.py evidence_coverage -a humanitributary-staging
   ```

   Make sure that the report has a table for each task kind, region and era.
3. Find the groups with a low "Possible" share in the report.
   Make sure that you have a list of these groups. They need new sources.
4. Find the hosts in the tables "Left to read by hand" and "Hosts the policy keeps jobs off".
   Make sure that you know the reason for each frequent host.
5. Find the groups where "Open" is less than "Possible".
   Make sure that you know the sites that refuse the job. These sources need a replacement.
6. Find the groups where "Ready" is less than "Open".
   Make sure that you know which tasks the job has not read yet. The next runs read them.
7. Show the unrated domains:

   ```bash
   heroku run python manage.py unrated_domains -a humanitributary-staging
   ```

   Make sure that you have the list of domains with the most tasks. Give each a tier only after you read its terms.
8. Find the second list in the output. It shows the unrated domains that agents asked about.
   Make sure that you have the domains with the most lookups. Rate them first, after you read their terms.
9. Open the page of one task from a group with a low share.
   Make sure that the evidence pack shows the stored pages and the pages to read by hand.

> **NOTE:** A new source needs its terms first. Do procedure [12](12-add-a-data-source.md) for each new source.

> **NOTE:** The report makes no requests. It reads only the queue and the `PrefetchedPage` rows.

> **NOTE:** The API counts each `GET policy` answer that says `unrated`. The table `UnratedLookup` keeps one row for
> each domain (ADR 0045). The Work page in the console shows the ten domains with the most lookups. A domain that
> has a tier now is not in the list.

> **NOTE:** The job `seed_sources` applied the source verdicts of November 28, 2026 (ADR 0037). A verdict with low
> confidence did not change the publisher. Give such a publisher a tier only after you read its terms.

> **CAUTION:** Do not give a publisher a tier before you read its terms. The tier lets the job keep its text.

> **CAUTION:** Do not change a `browser_only` publisher to `allowed` to increase the share. Change the fetch policy
> only when the terms of the site permit automated access.
