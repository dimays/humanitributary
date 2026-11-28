// The page's picture block (site/template.html, between "// <images>" and "// </images>"; ADR 0048): an unflagged picture
// renders as it always did, lazily, sized, with its credit and license link; a flagged one renders blurred behind a
// short notice with a keyboard-reachable "Show image" button, and revealing it changes that one figure only.
// Run by tests/test_site_images.py: `node site/test-images.mjs` prints "ok N" and exits 0, or names each failure.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tpl = readFileSync(join(here, "template.html"), "utf8");
const a = tpl.indexOf("// <images>"), b = tpl.indexOf("// </images>");
if (a < 0 || b < a) { console.error("template.html has no // <images> … // </images> section"); process.exit(1); }
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const { imageBlock, revealImage, PIC_NOTICE } = new Function("esc", tpl.slice(a, b) + "\nreturn { imageBlock, revealImage, PIC_NOTICE };")(esc);

let n = 0;
const fails = [];
const ok = (cond, what) => { n++; if (!cond) fails.push(what); };

const plain = { src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/X.jpg/500px-X.jpg", w: 500, h: 283, title: "The death of Caesar",
  alt: "A painting of senators around Caesar", credit: "Vincenzo Camuccini, via Wikimedia Commons", license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", page: "https://commons.wikimedia.org/wiki/File:X.jpg" };

// Unflagged: renders normally.
const h1 = imageBlock({ images: [plain] });
ok(h1.startsWith('<figure class="pic">'), "an unflagged picture is a plain figure");
ok(!h1.includes("blurred") && !h1.includes("Show image") && !h1.includes(PIC_NOTICE), "an unflagged picture has no blur, notice or button");
ok(h1.includes('alt="A painting of senators around Caesar"'), "the alt text is the picture's alt");
ok(h1.includes('loading="lazy"') && h1.includes('decoding="async"'), "pictures load lazily");
ok(h1.includes('width="500" height="283"'), "pictures carry their size (no layout shift)");
ok(h1.includes('href="https://creativecommons.org/licenses/by-sa/4.0/"') && h1.includes('rel="license'), "the license links to its deed");
ok(h1.includes("Vincenzo Camuccini, via Wikimedia Commons"), "the credit line is shown");
ok(h1.includes('href="https://commons.wikimedia.org/wiki/File:X.jpg"'), "the source page is linked");

// Legacy pictures (no alt, no license URL): the title is the alt, the license is plain text.
const legacy = { src: "images/me-hastings.jpg", w: 480, h: 220, title: "Bayeux Tapestry", credit: "Unknown, 11th century", license: "Public domain",
  page: "https://commons.wikimedia.org/wiki/File:Bayeux.jpg" };
const h2 = imageBlock({ images: [legacy] });
ok(h2.includes('alt="Bayeux Tapestry"') && h2.includes('src="images/me-hastings.jpg"'), "a legacy picture renders as before, its title as alt");
ok(h2.includes(" · Public domain · "), "a license without a deed is plain text");
ok(imageBlock({}) === "" && imageBlock({ images: [] }) === "", "no picture, no block");

// Flagged: blurred, a neutral notice, a real button, no alt and no tab stop until revealed.
const h3 = imageBlock({ images: [{ ...plain, sensitive: true }] });
ok(/^<figure class="pic blurred" id="pic\d+">/.test(h3), "a flagged picture is a blurred figure with an id");
ok(h3.includes(`<p>${PIC_NOTICE}</p>`), "it shows the short notice");
ok(/<button type="button" class="btn pic-reveal" aria-controls="pic\d+"[^>]*>Show image<\/button>/.test(h3), "a native button (keyboard: Tab, Enter, Space) controls it");
ok(/<img [^>]*\salt=""/.test(h3) && !/<img [^>]*\salt="A painting/.test(h3), "while hidden, the picture is not described");
ok(h3.includes('data-alt="A painting of senators around Caesar"'), "the button keeps the alt text for the reveal");
ok(h3.includes('tabindex="-1" aria-hidden="true"'), "while hidden, the picture's link is out of the tab order");
ok(h3.includes("<figcaption>") && h3.includes("Vincenzo Camuccini"), "the credit stays visible");
const h4 = imageBlock({ images: [{ ...plain, sensitive: true }] });
ok(h3.match(/id="(pic\d+)"/)[1] !== h4.match(/id="(pic\d+)"/)[1], "each flagged figure has its own id");

// Reveal: a small fake DOM, enough for revealImage.
function fakeFigure() {
  const classes = new Set(["pic", "blurred"]);
  const link = { attrs: { tabindex: "-1", "aria-hidden": "true" }, removeAttribute(k) { delete this.attrs[k]; }, focused: false, focus() { this.focused = true; } };
  const img = { attrs: { alt: "" }, setAttribute(k, v) { this.attrs[k] = v; }, closest: (s) => (s === "a" ? link : null) };
  const veil = { removed: false, remove() { this.removed = true; } };
  const fig = { classList: { remove: (c) => classes.delete(c), contains: (c) => classes.has(c) }, querySelector: (s) => (s === "img" ? img : null) };
  const btn = { getAttribute: (k) => (k === "data-alt" ? "A painting of senators around Caesar" : null),
    closest: (s) => (s === "figure.pic" ? fig : s === ".pic-veil" ? veil : null) };
  return { fig, img, link, veil, btn };
}
const one = fakeFigure(), other = fakeFigure();
revealImage(one.btn);
ok(!one.fig.classList.contains("blurred"), "Show image removes the blur");
ok(one.img.attrs.alt === "A painting of senators around Caesar", "the revealed picture gets its alt text");
ok(!("tabindex" in one.link.attrs) && !("aria-hidden" in one.link.attrs), "the revealed picture's link is back in the tab order");
ok(one.veil.removed, "the notice and button go");
ok(one.link.focused, "focus moves to the revealed picture");
ok(other.fig.classList.contains("blurred") && other.img.attrs.alt === "" && !other.veil.removed, "the consent is for that one picture only");

if (fails.length) { for (const f of fails) console.error("FAIL", f); process.exit(1); }
console.log(`ok ${n}`);
