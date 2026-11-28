# 14. Control the daily round

Purpose: This procedure tells how to watch a round, pause, resume and skip the scheduled rounds, change their size,
and send held drafts on.

The console does not start a round. It changes the round configuration. The routine reads it before it does work, and
the API obeys it ([the daily round](../daily-round.md)).

## Before you start

- You have a staff user with the permission `ops_operator`.
- You know why you make the change. The console records your reason with the action.

## Watch a round

You can watch a round while it runs. You do not need the permission `ops_operator` for this.

1. Open the Work page of the console while a round is open.
   Make sure that the card "Round #N" shows at the top, above the round strip.
2. Read the stage and the time since the start.
   Make sure that the stage is Agents, Review or Publish.
3. Read the bar of each task kind. Green shows done tasks, blue tasks in progress, red failed tasks, gray released tasks.
   Make sure that the line next to each bar shows the done tasks and the planned tasks.
4. Look at the cards of the task kinds.
   Make sure that each kind of the plan shows the line `in this round`.
5. Wait 20 seconds.
   Make sure that the page shows new numbers when the agents finish tasks.
6. Click "Round #N" to open the page of the round.
   Make sure that the table "Its tasks" shows the tasks of each agent.

An amber segment shows a task with a lease that ran out. If it stays amber, use procedure
[07](07-release-a-stuck-task.md). An outlined segment shows planned tasks that no agent has yet.

> **NOTE:** The card shows only the tasks that the role tokens of the round get. A token with a different name gets
> tasks, but they do not show in the card. Use the names of procedure [15](15-set-up-the-daily-round.md).

## Pause the scheduled rounds

1. Open the Work page of the console.
   Make sure that the round strip at the top shows the schedule.
2. Click "Pause rounds".
   Make sure that the confirmation page shows the schedule and the next time.
3. Type the reason and click "Pause the scheduled rounds".
   Make sure that the action page shows the state `done`.
4. Open the Work page again.
   Make sure that the round strip shows the badge Paused.

To resume, click "Resume rounds" on the Work page, then confirm with a reason. Make sure that the badge Paused goes.

> **NOTE:** A round that runs when you pause continues to its end. A round with the trigger `manual` still runs.

## Skip the next scheduled round

1. Open the Work page of the console.
   Make sure that the round strip does not show the badge Paused.
2. Click "Skip the next".
   Make sure that the confirmation page shows the next time.
3. Type the reason and confirm.
   Make sure that the round strip shows your reason for the skip.
4. After the scheduled time, open the Work page again.
   Make sure that the last round shows the state Skipped, with your reason.

## Change the round size

1. Open the Work page of the console.
   Make sure that the line "Round size" shows the current size.
2. Click "Round size" to open the form.
   Make sure that the form shows the agents and the tasks for each role.
3. Type the new numbers. Use 0 to 8 agents for each role and 1 to 20 tasks for each agent.
   Make sure that the total of the agents is 16 or less.
4. Click "Set the round size".
   Make sure that the confirmation page shows each old and new number.
5. Type the reason and confirm.
   Make sure that the line "Round size" shows the new numbers.
6. Look at the cards of the task kinds.
   Make sure that the number `next round will take` agrees with the new size.

> **NOTE:** The daily caps of the jobs (procedure [08](08-change-a-cap-or-a-threshold.md)) still limit the number of
> new tasks. A large round size does not make more tasks.

## Send held drafts to the next review

A held draft is a draft that a reviewer read and kept in review. Usually a source could not be read.

1. Open the Work page of the console.
   Make sure that the round strip shows the number of held drafts.
2. Click "Send them to the next review".
   Make sure that the confirmation page lists each held draft.
3. Type the reason and confirm.
   Make sure that the round strip says that the drafts go to the next review.
4. After the next round, open its page.
   Make sure that the plan lists the held drafts.

> **CAUTION:** A held draft needs an approval of a reviewer before it goes into a release. Do not approve it in the
> admin. Use the review, or procedure [02](02-review-drafts-and-apply-an-edit-file.md).
