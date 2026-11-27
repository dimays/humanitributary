# How Jobs and Work fit together

Purpose: This page tells the difference between the Jobs tab and the Work tab of the console, and how they connect.

## Two kinds of work

**Jobs** are programs that the worker dyno runs on a schedule. They collect and prepare material and make tasks.
They do not use Claude. The same input always gives the same output.

**Work** is the tasks that Claude agents do in rounds. Each round writes drafts, a reviewer examines them, and the
approved changes go into a release.

## The flow

```mermaid
flowchart LR
    subgraph Jobs["Jobs: the worker, on a schedule, no Claude"]
        J1["portal, rss, year_pages: collect stories"]
        J2["process: clusters and priorities"]
        J3["gap_waves: gaps in the history"]
        J4["facts_sweep, second_source: claims to examine"]
        J5["seed_branch_entities: branches without Wikidata items"]
    end
    subgraph Queue["The work queue"]
        Q1["write_event"]
        Q2["fill_gap"]
        Q3["verify_claim"]
        Q4["map_branch_entities"]
    end
    subgraph Round["Work: one agent round"]
        A["Role agents write drafts"]
        V["Reviewers examine each draft"]
        E["The edit file goes in, in one transaction"]
    end
    J1 --> J2 --> Q1
    J3 --> Q2
    J4 --> Q3
    J5 --> Q4
    Q1 --> A
    Q2 --> A
    Q3 --> A
    Q4 --> A
    A --> V --> E
    E --> P["A release, if each gate passes"]
    P --> Readers["The public page"]
```

## Where to look in the console

| Tab | What it shows | Links to the other tab |
|---|---|---|
| Jobs | Each job, its schedule, its last ten runs and its next run | A job names the task kinds that it makes. |
| Work | The round schedule, the last ten rounds and a card for each task kind | A card names the jobs that make its tasks. |

## Which page to use

- If a job fails, use procedure [05](procedures/05-run-a-failed-job-again.md).
- If a job must stop for a time, use procedure [06](procedures/06-pause-and-resume-a-job.md).
- If a task stays in progress after its agent stops, use procedure [07](procedures/07-release-a-stuck-task.md).
- If the rounds must stop, skip a day or change size, use procedure [14](procedures/14-control-the-daily-round.md).
- For the stages of a round, read [the daily round](daily-round.md).
