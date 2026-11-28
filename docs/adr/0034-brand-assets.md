# 0034 — Brand files drawn from the page's mark, a preview card rendered from the page, served at the root of every host

**Status:** proposed (November 2026); amended by [0043](0043-the-manyages-name.md) (the brand files carry the new name)

## Context

The public page's tab said only the name, with the braided-river mark as an inline `data:` SVG favicon. Nothing
else a browser, a phone or a link preview asks a site for was there: no `/favicon.ico` (browsers request it at the
root whatever the page says, so every visit logged a 404), no touch icon, no manifest, no description, canonical URL
or Open Graph tags, so a shared link showed a bare URL. The console and the admin, on the data host, had a
different ad hoc logo and Django's default favicon-less tabs titled "Dashboard · Humanitributary" and
"… | Humanitributary".

The set needs raster files (ICO, PNGs at fixed sizes, a 1200×630 preview image). Drawing them by hand in an editor
makes files nobody can regenerate or review; a generator needs a rasterizer. The repository has no image library;
cairosvg needs the system's Cairo, which CI and a laptop may lack. Pillow ships wheels with everything inside.

A shared link is read by its picture first. A logo and a name say little about the site; the page's own timeline,
its braided, colored branches with readable names, says what it is. Unnecessary Obstacles solved the same problem
(its ADR 0048): a script renders each card in headless Chrome from the site's own visuals, and the PNGs are
committed.

## Decision

**One mark, no new artwork.** Every file is drawn from the mark the page already used: the inline favicon's paths
(two streams that part and meet around a third, `M4 16 C9 16 9 7.5 16 7.5 S23 16 28 16` and its mirror, and
`M9 16 H23`), its colors and its dark rounded tile. `favicon.svg` adds a `prefers-color-scheme: dark` style (a light
tile, the header logo's colors) so the mark reads on a dark tab.

**A committed script draws the icons.** `scripts/build_brand.py` (`make brand`) writes `site/brand/`:
`favicon.svg`, `favicon.ico` (16, 32, 48), `favicon-32.png`, `apple-touch-icon.png` (180, solid), `icon-192.png`,
`icon-512.png` and `site.webmanifest`. The name comes from `SITE_NAME`. It draws at 8x with Pillow and scales down
with one filter, so the output is the same on any machine with the locked Pillow. Pillow joins the dev dependency
group; production never imports it. The files are committed, and a test redraws them and compares decoded pixels
(compressed bytes differ with the zlib build; up to 0.1% of pixels may differ by more than two levels).

**The preview card is the page.** `site/cards.mjs` (`make card`) builds the page from a release snapshot, opens it
in headless Chrome (Node's own WebSocket on the DevTools protocol: nothing to install), hides the controls, shows a
chosen view (`VIEW`: the Ancient era at the Near East and Europe, where the most colors braid) at 2x, and composes
`og-image.png` (1200×630): the mark, the name, one line and the domain above that picture, on the page's light
background. It is committed and rerun by hand after a big content wave or a change to how the page draws (the
manual's procedure 13); it depends on the content and the machine's fonts, so no test redraws it.

**Served from the deploy, at the root of every host.** `infra/site.py` `brand()` serves exactly the names in
`BRAND_FILES`, each with its content type (`image/x-icon`, `application/manifest+json` …) and the assets' day-long
`Cache-Control`, like `/images/*` (ADR 0024). The routes are not host-bound, so the data host's console and admin
use the same icons. The brand files are not page inputs (ADR 0029): a changed icon needs a deploy, not a publish.

**The page's head and the tabs.** `site/template.html` gets the title "Humanitributary — all of history, cited", a
description, the canonical URL, the icon and manifest links, light and dark `theme-color`, and Open Graph and
Twitter card tags. It is a page input, so the change publishes normally (ADR 0029). Console tabs read "<page> ·
<name> Operations" and the admin's "<page> · <name> administration".

## Consequences

- Shared links get a title, a description and an image; tabs, bookmarks and home screens get the mark on every host.
- The head reaches readers only at the next publish after the deploy that carries the template.
- A change to the mark means changing the script (and the template's inline logo in the header, which stays an
  inline SVG): the two must be changed together. The test catches a script changed without its files, not a
  template logo changed without the script.
- The card shows the content of the snapshot it was made from; it ages as the content grows, and nothing reminds
  anyone to remake it but the guide, the manual and AGENTS.md. Its type is the machine's system font.
- Revisit if a CDN serves the releases bucket (ADR 0024): the brand files would then have to be uploaded beside the
  page, as `images/` would.
