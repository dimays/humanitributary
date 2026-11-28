# The Maintainer's Manual

Purpose: This manual tells the owner how the system operates and how to do each maintenance task.

## How to use this manual

Read the [system overview](system-overview.md) first. Then read the [architecture](architecture.md) and its diagrams.
Use the [procedures](#procedures) when you do a task. Use [troubleshooting](troubleshooting.md) when a symptom occurs.
The [glossary](glossary.md) defines each term that this manual uses.

This manual is for the owner, who maintains and operates the system alone. The technical guide in `docs/guide/` is
the developer reference. The guide tells how each part of the code operates. This manual tells what to do.

If this manual and the code do not agree, the code is correct. Correct this manual in the same pull request as the
code change.

## Conventions

- Code names, commands, file names and configuration values are in backticks, for example `manage.py publish`.
  Type them exactly as this manual shows them.
- Commands for the hosted system use the Heroku app `humanitributary-staging`. This app holds the live data and
  serves the public page.
- `<version>`, `<id>` and other words in angle brackets are values that you supply.
- The operations console is at `https://data.manyages.com/ops/`. Its page names and button names can change.
  If a command does the same action, the procedure also gives the command.

## Safety labels

> **WARNING:** A warning tells you about a risk to data. If you do not obey it, data can go away permanently.

> **CAUTION:** A caution tells you about a risk to the system. If you do not obey it, a part of the system can
> stop or operate incorrectly.

> **NOTE:** A note gives information that helps you do the task.

## The rules of the text

This manual obeys the rules of ASD-STE100 Simplified Technical English, Issue 9. The rules make the text clear
to all readers. The script `scripts/check_ste.py` (`make check-manual`) examines each file. It is a part of the
gate, `make check-pr`, and CI runs it on each pull request.

| Rule | What it means here | Does `make check-manual` examine it? |
|---|---|---|
| Sentence length | A sentence in a numbered step has 20 words or fewer. Any other sentence has 25 words or fewer. | Yes |
| Paragraph length | A paragraph has 6 sentences or fewer. | Yes |
| One instruction | Each sentence in a step gives one instruction. | No |
| Imperative mood | Instructions start with a verb: "Open the page." | No |
| Active voice | Write "The job writes the row", not `The row is written`. | Yes (a heuristic for "be" with a past participle) |
| Present tense | Write "The job starts", not `The job will start`. | Yes (`will`, `would` and `shall`) |
| No "-ing" forms | Write "when the job runs", not `while running`. | Yes (with an allowlist for technical names) |
| Articles | Keep "the" and "a". Do not write in the style of a telegram. | No |
| One word, one sense | Each word has only one sense. The glossary defines each technical name. | No |
| No phrasal verbs | Write "start" or "stop", not `turn on` or `shut down`. | No |
| Conditions first | Write "If the run fails, do this", not "Do this if the run fails". | No |
| Safety labels | Use WARNING for a risk to data and CAUTION for a risk to the system. | No |
| A check for each step | Each step has a sentence that starts with "Make sure that". | No |

The script also examines these items:

- Each file starts with a title and then a line that starts with "Purpose:".
- Each relative link goes to a file that exists.
- Each Mermaid diagram starts with a known diagram type. Its brackets and quotes agree, and each block has an
  `end`.

The script does not examine code blocks, inline code, URLs or HTML comments. Thus code names stay unchanged. If
a technical name contains a word that the script flags, add the word to `ING_ALLOW` or `PASSIVE_ALLOW` in the
script. Write a comment that tells why.

## Sections

| File | What it contains |
|---|---|
| [system-overview.md](system-overview.md) | What the system does, its main parts, and how data moves through them |
| [architecture.md](architecture.md) | The diagrams: context, components, data flow, deployment, and two sequences |
| [daily-round.md](daily-round.md) | The daily agent round: its stages, its sequence diagram, its tokens and what the owner controls |
| [jobs-and-work.md](jobs-and-work.md) | How the Jobs tab and the Work tab of the console fit together, with a diagram |
| [jobs.md](jobs.md) | Each scheduled job: its schedule, what it reads and writes, and what to do when it fails |
| [data-model.md](data-model.md) | The main tables, with a diagram of their relations |
| [troubleshooting.md](troubleshooting.md) | Symptoms, their causes, and the actions that correct them |
| [glossary.md](glossary.md) | Each term that this manual uses |

## Procedures

| Number | Procedure |
|---|---|
| 01 | [Run a round by hand](procedures/01-run-a-round-by-hand.md) |
| 02 | [Review the agent drafts and apply an edit file](procedures/02-review-drafts-and-apply-an-edit-file.md) |
| 03 | [Publish a release](procedures/03-publish-a-release.md) |
| 04 | [Do a rollback](procedures/04-do-a-rollback.md) |
| 05 | [Run a failed job again](procedures/05-run-a-failed-job-again.md) |
| 06 | [Pause and resume a job](procedures/06-pause-and-resume-a-job.md) |
| 07 | [Release a stuck task](procedures/07-release-a-stuck-task.md) |
| 08 | [Change a cap or a threshold](procedures/08-change-a-cap-or-a-threshold.md) |
| 09 | [Replace an agent token](procedures/09-replace-an-agent-token.md) |
| 10 | [Restore the database from a backup](procedures/10-restore-the-database-from-a-backup.md) |
| 11 | [Deploy a code change](procedures/11-deploy-a-code-change.md) |
| 12 | [Add a data source](procedures/12-add-a-data-source.md) |
| 13 | [Make the preview card again](procedures/13-make-the-preview-card-again.md) |
| 14 | [Control the daily round](procedures/14-control-the-daily-round.md) |
| 15 | [Set up the daily round](procedures/15-set-up-the-daily-round.md) |
| 16 | [Measure the evidence coverage](procedures/16-measure-the-evidence-coverage.md) |
| 17 | [Archive and unarchive a job](procedures/17-archive-and-unarchive-a-job.md) |
| 18 | [Do a task that needs a browser](procedures/18-do-a-task-that-needs-a-browser.md) |
