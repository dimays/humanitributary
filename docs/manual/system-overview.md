# System overview

Purpose: This file tells what the system does, what its main parts are, and how data moves through them.

## What the system does

The system makes a timeline of history from the Big Bang to today. Each item on the timeline has citations. Readers
see the timeline as one web page at `https://manyages.com`.

The timeline has two kinds of entries. A branch is a line on the timeline, for example a state, a people or a faith.
An event is a moment or a period on a branch. Each entry has claims, and each claim has evidence from cited pages.

The system collects material from outside sources. Programs sort the material. Claude agents use judgment to write
events and to examine sources. The owner examines what the agents write and decides what readers get.

## The main parts

| Part | What it does | Where it is |
|---|---|---|
| Sources | Outside sites that the system reads or cites: Wikipedia, Wikidata, official feeds and open archives | The internet; the rows `Publisher` and `Feed` describe them |
| Jobs | Scheduled programs that collect, sort and measure. They make no calls to a language model. | `ingest/job_defs.py`; the `worker` dyno runs them |
| The database | Postgres. It is the one source of truth for all content, its evidence and its history. | Heroku Postgres |
| Object storage | Two S3 buckets: `raw` for fetched documents, `releases` for releases | AWS S3 |
| The work queue | A list of tasks that need judgment. Each task is an `AgentTask` row. | `work/` |
| The agent API | The HTTP interface that agents use to claim and complete tasks. Agents do not connect to the database. | `/api/agent/` on the `web` dyno |
| Agents | Claude sessions that do the tasks. A skill tells each agent how to do one kind of task. | `.claude/skills/`; the daily cloud routine, or sessions that the owner starts |
| Reviews and edit files | An independent reviewer examines the agent drafts and writes an edit file. The daily round applies it through the agent API, or the owner applies it. | `edits/check` and `edits/apply`; `manage.py apply_edits` |
| Releases | A release is a set of files that holds the published content and the page. A release never changes. | The `releases` bucket; the `Release` table |
| The public page | The page that readers see. The `web` dyno serves it from the latest release. | `/` on the `web` dyno |
| The admin and the console | Web pages for the owner. The admin edits rows. The console shows the health of the system and the content that the agents make. It has a few actions. | `/admin/` and `/ops/` on the `web` dyno |
| GitHub and CI | The code, the pull requests and the checks that each pull request must pass | `dimays/manyages`; `.github/workflows/check.yml` |

## How data moves

1. A job fetches a page or a record from a source. The job keeps the raw bytes in the `raw` bucket and a `Document`
   row in the database.
2. The job finds the Wikidata items in the document and makes a `Candidate`: a possible event.
3. The `process` job groups candidates about the same story and gives each group a priority.
4. If a group has a priority at or above the threshold, the job makes a `write_event` task. A daily cap limits the
   number of new tasks.
5. Other jobs make other tasks: `verify_claim` tasks for claims to examine again, and `fill_gap` tasks for gaps in
   the history.
6. An agent claims a task through the agent API. The agent reads the sources and completes the task with a result.
7. The API writes the result into the database. A new event gets the status `review`. It does not go to readers.
8. A reviewer examines the agent drafts and writes an edit file. The owner applies the edit file with
   `manage.py apply_edits`. The `approve` operation changes the status of an entry to `published`.
9. The owner publishes a release. `manage.py publish` exports all published entries, does the release gates and
   writes the release files.
10. The `web` dyno reads the pointer `releases/latest.json` and serves the page of that release to readers.

## The rules that keep the data safe

- Postgres is the source of truth. The page never reads the database. If the database stops, readers still get the
  page.
- Each change to a canonical row makes a `Revision` row. A database trigger refuses all other writes.
- Jobs are deterministic. The same input gives the same output.
- Agents work only through the agent API. Agents do not have database credentials.
- Nothing that an agent writes goes to readers before an independent reviewer approves it. The daily round publishes only if each release gate passes ([the daily round](daily-round.md)).
- A release never changes after the system writes it. A rollback moves the pointer only.
