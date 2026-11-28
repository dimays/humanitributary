# Architecture

Purpose: This file shows the system in six diagrams and tells what each diagram shows.

The diagrams use Mermaid. GitHub and the console Docs page draw them as pictures. The names in the diagrams are the
names in the code.

## Context

The context diagram shows the people, the agents and the outside systems that connect to the platform.

```mermaid
flowchart LR
    owner(["Owner<br/>maintains and operates the system"])
    agents(["Claude agents<br/>writers, gap fillers, verifiers"])
    reviewer(["Independent reviewer<br/>a Claude session"])
    readers(["Readers"])
    subgraph platform["ManyAges platform, Heroku app humanitributary-staging"]
        core["Jobs, Postgres, object storage,<br/>agent API, admin, console, releases"]
    end
    page["Public page<br/>https://manyages.com"]
    sources["Outside sources<br/>Wikipedia, Wikidata, WHO, Federal Register,<br/>The Gazette, Nobel, Office of the Historian,<br/>open lookup APIs"]
    cited["Cited pages<br/>some only in a browser"]
    github["GitHub<br/>code, pull requests, CI"]
    mail["Mail server<br/>alerts, if configured"]

    sources -- "jobs fetch through the Fetcher" --> core
    agents -- "claim and complete tasks<br/>HTTPS and a bearer token" --> core
    agents -- "read" --> cited
    reviewer -- "read the drafts, GET only" --> core
    reviewer -- "a review and an edit file" --> owner
    owner -- "admin, console, heroku run" --> core
    owner -- "pull requests" --> github
    github -- "deploys main after CI passes" --> core
    core -- "serves the latest release" --> page
    page --> readers
    core -- "one email after 3 failed runs" --> mail
    mail --> owner
```

- The owner is the one person who maintains and operates the system.
- Jobs read the outside sources. Each request goes through one HTTP client, `ingest.http.Fetcher`. The Fetcher
  refuses a host that the source policy does not permit.
- Agents use the agent API only. Agents read each cited page themselves. A `browser_only` site gets a browser.
- The job `prefetch_sources` reads the `allowed` pages of the queued tasks first. Agents read the stored text of
  these pages through the agent API. The text stays private and goes away after the retention time (ADR 0036).
- A reviewer is a separate Claude session that writes nothing to the database. The reviewer gives a review and an
  edit file to the owner.
- Readers get the public page only. The page does not read the database.
- If the owner sets `ALERT_EMAILS` and the mail config vars, the system sends one email after a job fails three runs
  in a row. Without them, the alert is only a log line.

## Components

The component diagram shows the processes, the stores and the outside services, and which component reads or writes
which store.

```mermaid
flowchart TB
    subgraph heroku["Heroku app humanitributary-staging"]
        subgraph webdyno["web dyno: gunicorn config.wsgi"]
            site["/ the public page<br/>infra/site.py"]
            admin["/admin/<br/>the Django admin"]
            ops["/ops/<br/>the operations console"]
            api["/api/agent/<br/>the agent API"]
            health["/healthz"]
        end
        subgraph workerdyno["worker dyno: manage.py run_jobs --loop"]
            jobs["Jobs<br/>ingest/job_defs.py"]
            pickup["Console actions that run in the worker<br/>opsconsole/worker.py"]
        end
        oneoff["One-off dyno<br/>heroku run python manage.py ..."]
        releasephase["Release phase<br/>manage.py migrate"]
    end
    pg[("Heroku Postgres")]
    raw[("S3 bucket humanitributary-staging-raw")]
    rel[("S3 bucket humanitributary-staging-releases")]
    gh["GitHub dimays/humanitributary<br/>Actions: make check-pr"]

    admin & ops & api & health --> pg
    site -- "latest.json and timeline.html only" --> rel
    ops -- "manifests and change reports" --> rel
    health --> raw & rel
    jobs --> pg & raw
    pickup --> pg & rel
    oneoff --> pg & rel
    releasephase --> pg
    gh -- "automatic deploy of main" --> heroku
```

| Component | What it does |
|---|---|
| `web` dyno | It runs gunicorn. It serves the public page, the admin, the console, the agent API and `/healthz`. |
| The public page, `/` | It reads `releases/latest.json` at most once a minute. It serves the `timeline.html` of that release from memory. |
| `worker` dyno | It runs `manage.py run_jobs --loop`. Each `WORKER_TICK_SECONDS` (60), it runs the jobs that are due. |
| Console actions in the worker | Between jobs, the worker runs the console actions that wait as `pending`: a job run, a publish check, a publish, a rollback. |
| One-off dyno | `heroku run` starts it for one command, for example `manage.py publish` or `manage.py apply_edits`. |
| Release phase | Before each deploy goes live, Heroku runs `manage.py migrate`. If a migration fails, the deploy stops. |
| Heroku Postgres | The database: all content, evidence, Revisions, the queue and the state of the jobs. |
| The `raw` bucket | Fetched documents, by content hash, at `raw/<hash[:2]>/<hash>`. The system writes each object one time. |
| The `releases` bucket | The release files and the pointer. The pointer is the only object that the system writes again. |
| GitHub and CI | CI runs `make check-pr` on each pull request and on each push to `main`. |

> **NOTE:** The worker holds the scheduler lock for its life. If two workers run at the same time, the second worker
> waits. Thus a deploy never runs the jobs two times.

## Data flow

The data-flow diagram shows how an outside item becomes a part of the public page.

```mermaid
flowchart LR
    src["Source<br/>Publisher and Feed"] -- "a job fetches" --> doc["Document<br/>raw bytes in the raw bucket"]
    doc -- "entities and branch scores" --> cand["Candidate"]
    cand -- "process: cluster, priority at or above<br/>the threshold, under the daily cap" --> task["AgentTask<br/>write_event"]
    canon["Canonical rows<br/>Entry, Claim, Evidence, Revision"] -- "gap_waves, facts_sweep,<br/>second_source, branches_review" --> task2["AgentTask<br/>fill_gap, verify_claim,<br/>review_branch_proposal"]
    task & task2 -- "an agent claims it<br/>over the agent API" --> draft["Agent draft<br/>new entries with status review,<br/>evidence, accepted proposals"]
    draft -- "a reviewer reads, GET only" --> review["Review<br/>var/reviews/name.md"]
    review --> edits["Edit file<br/>var/reviews/name.edits.json"]
    edits -- "apply_edits as human:owner<br/>approve sets status published" --> canon
    canon -- "manage.py publish<br/>and the release gates" --> release["Release<br/>releases/version/ files,<br/>Release row, latest.json"]
    release -- "the web dyno reads<br/>the pointer" --> pagenode["Public page"]
```

1. A job fetches an item from a source. The job writes a `Document` row and puts the raw bytes in the `raw` bucket.
2. The job finds the Wikidata items in the document and makes a `Candidate`.
3. The `process` job groups the candidates by story. A story with a priority at or above `WRITE_EVENT_THRESHOLD`
   (70) becomes a `write_event` task. The daily cap `WRITE_EVENT_TASKS_PER_DAY` (20) limits the new tasks.
4. Other jobs read the canonical rows and make other tasks. `gap_waves` makes `fill_gap` tasks under the cap
   `FILL_GAP_TASKS_PER_DAY` (40).
5. An agent claims a task and completes it. The API writes the result through the service layer as
   `agent:<name>`. A new entry gets the status `review`.
6. A reviewer reads the drafts and writes a review and an edit file. The owner applies the edit file.
7. `manage.py publish` exports only the entries that have the status `published`. It writes a release.
8. The `web` dyno serves the page of the release that `releases/latest.json` names.

## Deployment

The deployment diagram shows where each part runs, the DNS names and the storage buckets.

```mermaid
flowchart TB
    reader(["Reader browser"])
    agent(["Agent session"])
    ownerb(["Owner browser and shell"])
    subgraph cf["Cloudflare DNS, registrar Namecheap"]
        dnsroot["manyages.com<br/>flattened CNAME, DNS only"]
        dnswww["www.manyages.com<br/>CNAME, DNS only"]
        dnsdata["data.manyages.com<br/>CNAME, DNS only"]
        dnsold["humanitributary.com and www<br/>proxied, 301 to manyages.com"]
        dnsolddata["data.humanitributary.com<br/>CNAME, DNS only, until agents move"]
    end
    subgraph hk["Heroku pipeline humanitributary, region us"]
        router["Heroku router<br/>TLS with Heroku-managed certificates"]
        subgraph app["App humanitributary-staging, stack heroku-24<br/>buildpacks heroku/nodejs then heroku/python"]
            web["web: 1 Basic dyno<br/>gunicorn"]
            worker["worker: 1 Basic dyno<br/>run_jobs --loop"]
            rp["release phase<br/>migrate --noinput"]
        end
        pg[("Add-on heroku-postgresql:essential-1<br/>Postgres 16 as DATABASE_URL<br/>a backup each day at 03:00 Chicago time")]
    end
    subgraph aws["AWS us-east-1"]
        iam["IAM user humanitributary-staging<br/>access to the two buckets only"]
        raw[("S3 humanitributary-staging-raw")]
        rel[("S3 humanitributary-staging-releases")]
    end
    subgraph ghub["GitHub"]
        repo["dimays/humanitributary"]
        ci["Actions workflow check<br/>make check-pr"]
    end
    reader --> dnsroot & dnswww
    reader -. "old links" .-> dnsold
    dnsold -. "301" .-> dnsroot
    agent --> dnsdata
    agent -. "old HUMANITRIBUTARY_API" .-> dnsolddata
    ownerb --> dnsdata
    dnsroot & dnswww & dnsdata & dnsolddata --> router
    router --> web
    web & worker & rp --> pg
    web & worker --> raw & rel
    iam -. "the key in the S3 config vars" .- raw & rel
    repo --> ci
    ci -- "main passes" --> app
```

| Item | Value |
|---|---|
| Heroku app | `humanitributary-staging`, in the pipeline `humanitributary`. It holds the live data. |
| Dynos | `web` and `worker`, one Basic dyno each, as `app.json` states. `heroku ps -a humanitributary-staging` shows the real count. |
| Database | Heroku Postgres Essential-1, Postgres 16, as `DATABASE_URL`, with TLS. Heroku keeps a backup each day. |
| Object storage | AWS S3 in us-east-1: `humanitributary-staging-raw` and `humanitributary-staging-releases`. S3 blocks public access. |
| DNS | Cloudflare holds the two zones. Each `manyages.com` name is a CNAME to its Heroku DNS target, with DNS only (no proxy). |
| `data.manyages.com` | The admin, the console and the agent API |
| `manyages.com` | The public page. The app sends `www.manyages.com` to this name. |
| `humanitributary.com` | The old name of the site. Cloudflare sends `humanitributary.com` and `www.humanitributary.com` to `https://manyages.com`, with the same path and query (301). The domain expires on November 26, 2027. |
| `data.humanitributary.com` | The old data host. It serves the admin, the console and the agent API until all agent environments use `data.manyages.com`. |
| Deploys | Heroku deploys `main` automatically after CI passes on it. |

> **NOTE:** The public page and the data host are the same app. `OPS_HOSTS` can limit the console to the data host.

## Sequence: one agent round

This diagram shows one agent that does one task, and then the review of the drafts. The daily round does all of
it through the agent API: see [the daily round](daily-round.md).

```mermaid
sequenceDiagram
    actor O as Owner
    participant A as Agent session
    participant API as Agent API on the web dyno
    participant DB as Postgres
    participant SRC as Cited pages
    actor R as Reviewer
    O->>A: start the session with a skill and a token
    A->>API: POST tasks/claim with kinds
    API->>DB: next_task, FOR UPDATE SKIP LOCKED
    DB-->>API: the best task, leased for 30 minutes
    API-->>A: the task with its payload, or null
    A->>API: GET entries, branches, search
    A->>SRC: read each cited page
    opt the work takes longer than the lease
        A->>API: POST tasks/id/extend
    end
    A->>API: POST tasks/id/complete with the result
    alt the result does not match the schema
        API-->>A: 422 with the problems, the task stays claimed
    else the result is valid
        API->>DB: apply as agent:name in one transaction, task done
        API-->>A: the completed task
    end
    R->>API: GET entries and claims, read only
    R->>SRC: read each cited page again
    R-->>O: the review and the edit file
    O->>DB: apply_edits --validate-only, then --dry-run, then apply as human:owner
```

1. The owner starts an agent session. The session has a skill and an agent token.
2. The agent claims a task. `SKIP LOCKED` makes sure that two agents never get the same task.
3. The agent reads the payload, the related entries and each cited page.
4. If the work takes more than 30 minutes, the agent extends the lease.
5. The agent completes the task. If the result does not match the schema of its kind, the API returns 422. The task
   stays with the agent.
6. If the result is valid, the API applies it and completes the task in one transaction. Each change has a
   `Revision` that names the task.
7. A reviewer reads the drafts and the cited pages, and writes an edit file. The owner applies it.

## Sequence: publish

This diagram shows a publish from the console. `heroku run python manage.py publish` does the same steps in a
one-off dyno.

```mermaid
sequenceDiagram
    actor O as Owner
    participant C as Console on the web dyno
    participant W as worker dyno
    participant DB as Postgres
    participant S as releases bucket
    participant P as Public page on the web dyno
    O->>C: publish_check
    C->>DB: OpsAction publish_check, pending
    W->>DB: pick_up between jobs
    W->>S: read the live snapshot
    W->>W: release gates and the change report
    W->>DB: OpsAction done, with the report
    O->>C: publish, with a reason
    C->>DB: OpsAction publish, pending
    W->>DB: pick_up
    W->>W: compare the hashes with the check, then the gates again
    W->>S: write the files under releases/version/
    W->>DB: insert the Release row
    W->>S: write releases/latest.json
    P->>S: read latest.json, at most once a minute
    P->>S: read timeline.html of the new version
    Note over P: readers get the new page within a minute
```

1. The owner starts `publish_check`. It writes nothing. The worker does the release gates and makes the change
   report.
2. The owner reads the change report and starts `publish` with a reason. The check must be 30 minutes old or less.
3. The worker compares the content hash and the page hash with the check. If they changed, the publish stops.
4. The worker does the release gates again. It writes the release files, then the `Release` row, then the pointer.
5. Within one minute, the `web` dyno reads the new pointer and serves the new page.

## Sequence: rollback

This diagram shows a rollback from the console. `heroku run python manage.py publish --rollback <version>` does the
same steps in a one-off dyno.

```mermaid
sequenceDiagram
    actor O as Owner
    participant C as Console on the web dyno
    participant W as worker dyno
    participant DB as Postgres
    participant S as releases bucket
    participant P as Public page on the web dyno
    O->>C: rollback to an earlier version, with a reason
    C->>DB: OpsAction rollback, pending
    W->>DB: pick_up between jobs
    W->>DB: read the Release row of that version
    W->>S: read its content.json
    alt the hash does not agree with the Release row
        W->>DB: OpsAction failed, the pointer stays
    else the hash agrees
        W->>S: write releases/latest.json with the reason rollback
        W->>DB: OpsAction done
    end
    P->>S: read latest.json, at most once a minute
    Note over P: readers get the earlier page within a minute
```

- A rollback writes only the pointer. It does not delete a release, and it does not change the database.
- The next publish compares the database with the newest `Release` row, not with the pointer.
