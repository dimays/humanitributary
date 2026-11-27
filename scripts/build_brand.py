"""`make brand`: the favicon set, the app icons and the web manifest, in `site/brand/`.

    uv run python scripts/build_brand.py                       write site/brand/
    uv run python scripts/build_brand.py --check               do the committed files match? (a test runs this)
    uv run python scripts/build_brand.py --preview var/brand-preview.png   also a contact sheet of every icon

Everything is drawn from the one mark the page already uses: the braided river in `site/template.html`'s favicon
(two streams that part and meet again around a third, on a dark rounded tile), with its paths and colors as
written there. No artwork is added. The name comes from `config/settings.py` `SITE_NAME`.

The output is deterministic: the PNGs and the ICO are drawn with Pillow (the dev group's) at 8x and scaled down
with one fixed filter. `--check` compares the decoded pixels, not the compressed bytes, since zlib builds differ
between machines (docs/adr/0034-brand-assets.md). The link-preview card beside them, `og-image.png`, is not drawn
here: `site/cards.mjs` (`make card`) renders it from the page itself in headless Chrome.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "brand"

# The mark, in the 32-unit box of the page's inline favicon (site/template.html).
TILE, TILE_RX = "#1c1d21", 7
STROKE = 3.2
UPPER = ((4, 16), (9, 16), (9, 7.5), (16, 7.5), (23, 7.5), (23, 16), (28, 16))   # M4 16 C9 16 9 7.5 16 7.5 S23 16 28 16
LOWER = ((4, 16), (9, 16), (9, 24.5), (16, 24.5), (23, 24.5), (23, 16), (28, 16))
MIDDLE = ((9, 16), (23, 16))
BLUE, CORAL, TEAL = "#6f97ee", "#ee8a6a", "#46b8a0"
# On a dark browser tab the tile turns light (the page's dark-theme ink) and the streams take the page header's
# logo colors (hsl(218 70% 55%), hsl(14 75% 55%), hsl(168 55% 42%)), so the mark reads on either.
DARK_TAB = {"tile": "#ececef", "blue": "#3d73db", "coral": "#e5683d", "teal": "#30a68d"}

# The page's palette (site/template.html :root): the light background and the header surface.
PAGE_BG, SURFACE = "#f6f5f1", "#ffffff"

SS = 8  # supersampling factor


def site_name() -> str:
    sys.path.insert(0, str(ROOT))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    from django.conf import settings

    return settings.SITE_NAME


def bezier(points, steps: int = 96) -> list[tuple[float, float]]:
    """A polyline through a chain of cubic segments (start, then three points per segment)."""
    out = [points[0]]
    for i in range(1, len(points) - 1, 3):
        p0, p1, p2, p3 = points[i - 1], points[i], points[i + 1], points[i + 2]
        for k in range(1, steps + 1):
            t = k / steps
            u = 1 - t
            out.append(tuple(u ** 3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3)))
    return out


def stroke(draw: ImageDraw.ImageDraw, pts, color: str, scale: float, ox: float = 0, oy: float = 0, width: float = STROKE):
    """A round-capped, round-joined stroke: a quad per segment and a disc at every point (Pillow's wide lines leave
    hairline gaps on curves)."""
    xy = [(ox + x * scale, oy + y * scale) for x, y in pts]
    r = width * scale / 2
    for (x0, y0), (x1, y1) in zip(xy, xy[1:]):
        dx, dy = x1 - x0, y1 - y0
        n = (dx * dx + dy * dy) ** 0.5 or 1.0
        nx, ny = -dy / n * r, dx / n * r
        draw.polygon([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)], fill=color)
    for x, y in xy:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def mark(draw, scale: float, ox: float = 0, oy: float = 0, *, tile: str | None = TILE, rx: float = TILE_RX,
         colors=(BLUE, CORAL, TEAL)):
    if tile:
        draw.rounded_rectangle((ox, oy, ox + 32 * scale - 1, oy + 32 * scale - 1), radius=rx * scale, fill=tile)
    blue, coral, teal = colors
    stroke(draw, bezier(UPPER), blue, scale, ox, oy)
    stroke(draw, bezier(LOWER), coral, scale, ox, oy)
    stroke(draw, MIDDLE, teal, scale, ox, oy)


def icon(size: int, *, full_bleed: bool = False, dark_tab: bool = False) -> Image.Image:
    """The tile at `size` pixels: rounded with transparent corners, or (full_bleed, for iOS, which rounds it itself)
    filling the square. dark_tab: favicon.svg's colors on a dark browser tab (for the preview only)."""
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    if dark_tab:
        t = DARK_TAB
        mark(ImageDraw.Draw(img), big / 32, tile=t["tile"], colors=(t["blue"], t["coral"], t["teal"]))
    else:
        mark(ImageDraw.Draw(img), big / 32, rx=0 if full_bleed else TILE_RX)
    return img.resize((size, size), Image.LANCZOS)


def favicon_svg() -> str:
    def path(pts):
        (x0, y0), rest = pts[0], pts[1:]
        segs = " ".join(f"C{rest[i][0]:g} {rest[i][1]:g} {rest[i + 1][0]:g} {rest[i + 1][1]:g} {rest[i + 2][0]:g} {rest[i + 2][1]:g}"
                        for i in range(0, len(rest), 3))
        return f"M{x0:g} {y0:g} {segs}"

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">\n'
        "<style>\n"
        f".t{{fill:{TILE}}} .b{{stroke:{BLUE}}} .c{{stroke:{CORAL}}} .g{{stroke:{TEAL}}}\n"
        f"@media (prefers-color-scheme: dark) {{ .t{{fill:{DARK_TAB['tile']}}} .b{{stroke:{DARK_TAB['blue']}}} "
        f".c{{stroke:{DARK_TAB['coral']}}} .g{{stroke:{DARK_TAB['teal']}}} }}\n"
        "</style>\n"
        f'<rect class="t" width="32" height="32" rx="{TILE_RX}"/>\n'
        f'<g fill="none" stroke-width="{STROKE:g}" stroke-linecap="round">\n'
        f'<path class="b" d="{path(UPPER)}"/>\n'
        f'<path class="c" d="{path(LOWER)}"/>\n'
        f'<path class="g" d="M{MIDDLE[0][0]} {MIDDLE[0][1]} H{MIDDLE[1][0]}"/>\n'
        "</g>\n</svg>\n"
    )


def manifest(name: str) -> str:
    m = {
        "name": name,
        "short_name": name,
        "description": "An interactive, cited timeline of all history, from the Big Bang to now.",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "theme_color": SURFACE,
        "background_color": PAGE_BG,
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml"},
        ],
    }
    return json.dumps(m, indent=2, ensure_ascii=False) + "\n"


def png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def ico(img16: Image.Image, img32: Image.Image, img48: Image.Image) -> bytes:
    buf = io.BytesIO()
    img48.save(buf, "ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[img16, img32])
    return buf.getvalue()


def build() -> dict[str, bytes]:
    name = site_name()
    i16, i32, i48 = icon(16), icon(32), icon(48)
    return {
        "favicon.svg": favicon_svg().encode(),
        "favicon.ico": ico(i16, i32, i48),
        "favicon-32.png": png(i32),
        "apple-touch-icon.png": png(icon(180, full_bleed=True).convert("RGB")),
        "icon-192.png": png(icon(192)),
        "icon-512.png": png(icon(512)),
        "site.webmanifest": manifest(name).encode(),
    }


def pixels(data: bytes) -> list[tuple]:
    """Every frame of an image file, decoded: (size, mode, raw pixels)."""
    im = Image.open(io.BytesIO(data))
    frames = [im.ico.getimage(s) for s in sorted(im.ico.sizes())] if im.format == "ICO" else [im]
    return [(f.size, f.convert("RGBA").tobytes()) for f in frames]


def differs(name: str, want: bytes, have: bytes) -> str | None:
    if name.endswith((".svg", ".webmanifest")):
        return None if want == have else "text differs"
    a, b = pixels(want), pixels(have)
    if [s for s, _ in a] != [s for s, _ in b]:
        return f"sizes differ: {[s for s, _ in a]} vs {[s for s, _ in b]}"
    for (size, pa), (_, pb) in zip(a, b):
        diff = ImageChops.difference(Image.frombytes("RGBA", size, pa), Image.frombytes("RGBA", size, pb))
        hist = diff.convert("L").histogram()
        off = sum(hist[3:])  # an edge's anti-aliasing a level or two apart is not a different icon
        if off > size[0] * size[1] // 1000:
            return f"{off} pixels differ at {size[0]}x{size[1]}"
    return None


def preview(files: dict[str, bytes]) -> Image.Image:
    """Every icon on the page's light and dark backgrounds, at its own size, and the link-preview card (site/cards.mjs's)
    under them."""
    shown = ["favicon.ico", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"]
    ims = [Image.open(io.BytesIO(files[n])).convert("RGBA") for n in shown]
    ico_im = Image.open(io.BytesIO(files["favicon.ico"]))
    small = [ico_im.ico.getimage((s, s)).convert("RGBA") for s in (16, 32, 48)]
    row = small + ims[1:]
    card = OUT / "og-image.png"
    og = Image.open(card).convert("RGBA") if card.exists() else Image.new("RGBA", (1200, 630), PAGE_BG)
    pad = 24
    width = max(sum(i.width for i in row) + pad * (len(row) + 1) + 96 + 3 * pad, og.width + 2 * pad)
    band = max(i.height for i in row) + 2 * pad
    sheet = Image.new("RGBA", (width, 2 * band + og.height + pad), PAGE_BG)
    ImageDraw.Draw(sheet).rectangle((0, band, width, 2 * band), fill="#131417")
    for y0 in (0, band):
        x = pad
        for im in row:
            sheet.paste(im, (x, y0 + (band - im.height) // 2), im)
            x += im.width + pad
    x = pad + sum(i.width + pad for i in row)  # favicon.svg on a dark tab: its prefers-color-scheme colors
    for s in (16, 32, 48):
        im = icon(s, dark_tab=True)
        sheet.paste(im, (x, band + (band - s) // 2), im)
        x += s + pad
    sheet.paste(og, (pad, 2 * band), og)
    return sheet.convert("RGB")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check", action="store_true", help="compare with the committed files; write nothing")
    ap.add_argument("--preview", type=Path, help="also write a contact sheet of every icon here")
    args = ap.parse_args(argv)
    files = build()
    if args.check:
        bad = []
        for name, data in files.items():
            path = OUT / name
            why = "missing" if not path.exists() else differs(name, data, path.read_bytes())
            if why:
                bad.append(f"  site/brand/{name}: {why}")
        if bad:
            print("site/brand/ is not what scripts/build_brand.py draws; run `make brand` and commit it:\n" + "\n".join(bad))
            return 1
        print(f"site/brand/: {len(files)} files match")
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    for name, data in files.items():
        path = OUT / name
        if not path.exists() or differs(name, data, path.read_bytes()):
            path.write_bytes(data)
            print(f"wrote site/brand/{name} ({len(data):,} bytes)")
    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        preview(files).save(args.preview)
        print(f"wrote {args.preview}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
