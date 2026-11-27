# 13. Make the preview card again

Purpose: This procedure tells how to make the picture that a shared link to the page shows, and when to make it.

The preview card is `site/brand/og-image.png`, 1200 by 630 pixels. Messages, feeds and search results show it
when a person shares `https://humanitributary.com/`. The script `site/cards.mjs` builds the page from a release. It opens
the page in a Chrome with no window, and takes a picture of the timeline. Then it puts the mark, the name, one line
and the domain above the picture. The card is a file in git, so a preview never waits for a render.

Make the card again after a large content wave, or after a change to how the page draws the timeline. A small
publish does not need a new card.

## Before you start

- You have Node 24 and Google Chrome on your computer. To use a different Chrome, set `CHROME` to its path.
- You can read the releases store, so that `make release-pull` gets the latest release.

## Procedure

1. Get the latest release:

   ```bash
   make release-pull
   ```

   Make sure that `var/releases/latest/content.json` exists.
2. Make the card:

   ```bash
   make card
   ```

   Make sure that the output names `site/brand/og-image.png`.
3. Open `site/brand/og-image.png`.
   Make sure that the name, the line and the domain are clear, and that the timeline has colored branches.
4. Open `var/cards/card-small.png`, the card at half size.
   Make sure that you can read the name and the line.
5. Commit `site/brand/og-image.png`, and deploy it with procedure [11](11-deploy-a-code-change.md).
   Make sure that `https://humanitributary.com/og-image.png` shows the new card after the deploy.

> **NOTE:** To show a different part of the timeline, change `VIEW` in `site/cards.mjs`. `node site/cards.mjs
> --explore` writes each era at five depths to `var/cards/`, so that you can compare them.

> **NOTE:** Apps keep a preview for some days. A new card can take that long to show in a chat app.
