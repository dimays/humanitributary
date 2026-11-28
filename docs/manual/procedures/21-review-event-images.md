# 21. Review the pictures for events

Purpose: This procedure tells how to decide the pictures that the `image_search` job found. It also tells how to
blur a picture, or show it unblurred again.

The job attaches a picture by itself only when the match is sure (ADR 0048). It sends the other pictures to the
Review page. The Review page holds two kinds of picture item:

| Kind | What waits | Approve | Deny |
|---|---|---|---|
| Image | A picture that the job found for an event | Attaches the picture to the event. The next release shows it. | Refuses the picture. The job never proposes it again for that event. |
| Image flag | A picture that an event has already, which the job blurred because of its signals | Keeps the blur if the box Sensitive has a tick. Clears it if not. | Clears the blur |

A picture with a blur shows on the public page behind a short notice and the button "Show image".

## Before you start

- You have a staff user with the permission `ops_operator`.
- You have a browser. You open the source pages in your own browser.

## Procedure

1. Open the Review page of the console, `https://data.manyages.com/ops/review/`.
   Make sure that the list on the left shows the items of the kind Image.
2. Click the first item of the kind Image.
   Make sure that the item shows the event, the picture, its credit and its license.
3. Read the text of the event.
   Make sure that you know what the event is about.
4. Look at the picture. If it has a blur, click "Show image".
   Make sure that you can see the picture.
5. Click the link to the page of the picture at its source.
   Make sure that the page opens in a new tab of your browser.
6. Compare the picture with the event.
   Make sure that the picture shows the event, its place, its people or a record of it.
7. Compare the license on the source page with the license on the Review page.
   Make sure that the two licenses are the same.
8. Examine the source page for signs of AI generation.
   Make sure that no category, description or author names an AI tool or a prompt.
9. Decide if the picture can disturb a viewer.
   Make sure that the box Sensitive has a tick only for such a picture.
10. If the picture is correct, click Approve.
    Make sure that the banner shows "Approve in 5 s" and the button Undo.
11. If the picture is not correct, click Deny.
    Make sure that the banner shows "Deny in 5 s" and the button Undo.
12. If you cannot decide now, click Defer.
    Make sure that the next item opens.
13. Do steps 2 to 12 for each item of the kind Image.
    Make sure that no item of the kind Image stays in the list.

> **NOTE:** These pictures can disturb a viewer: the dead, the wounded, executions, atrocities, the victims of a
> disaster and graphic medical subjects. If you are not sure, put a tick in the box Sensitive. A viewer can always
> click "Show image".

> **NOTE:** After you deny a picture, the next picture for the same event can come into the list. The job keeps
> two more pictures for each event at most.

> **WARNING:** Do not approve a picture that an AI tool made, or that an AI tool changed. This rule has no
> exceptions.

## Decide an image flag

1. Click an item of the kind "Image flag".
   Make sure that the item shows the signals that set the flag.
2. Click "Show image" and look at the picture.
   Make sure that you can see the picture.
3. If the picture can disturb a viewer, put a tick in the box Sensitive and click Approve.
   Make sure that the next item opens after 5 seconds.
4. If the picture cannot disturb a viewer, click Deny.
   Make sure that the next item opens after 5 seconds.

> **NOTE:** The job never sets a flag again after you clear it.

## Blur any picture, or show it unblurred

1. Find the entry id of the event. The entry id is the text after `#` in the address of the public page.
   Make sure that the entry id is correct.
2. Scroll to the form "A picture's sensitive flag" below the list of the Review page.
   Make sure that the form shows the field "Entry id".
3. Type the entry id in the field "Entry id".
   Make sure that the field shows the entry id.
4. To blur the picture, click "Blur it".
   Make sure that the banner names the action.
5. To show the picture unblurred, click "Show it unblurred".
   Make sure that the banner names the action.

## After the procedure

1. Publish a release (procedure [03](03-publish-a-release.md)), or let the daily round publish it.
   Make sure that the public page shows the new pictures and blurs.

> **NOTE:** The job finds pictures each hour. It searches each event 3 times at most, 14 days and then 42 days
> apart. Each item stays on the Review page until you decide it.
