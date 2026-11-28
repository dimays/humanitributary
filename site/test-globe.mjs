// The panel's globe on entries with good, missing and malformed locations, and when drawing throws: every entry gets a
// globe or (only if the fallback itself fails) none, never a thrown error. No dependencies: it runs the Globe module
// from template.html in a VM with a stub DOM and canvas. tests/test_site.py runs it (so `make check-pr` does):
//   node site/test-globe.mjs        exits 1 and names the failing case
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(here, "template.html"), "utf8");
const a = tpl.indexOf("const Globe = (() => {"), b = tpl.indexOf("\n})();", a);
assert.ok(a > 0 && b > a, "template.html has the Globe module");
const SRC = tpl.slice(a, b + 6);
const GLOBE = JSON.parse(fs.readFileSync(path.join(here, "globe-assets.json"), "utf8"));

// ----- a stub DOM: the panel holds at most one globe figure, kept as its HTML -----
function world({ throwOn = null, globe = GLOBE } = {}) {
  const dom = { html: "", frames: [], warned: [] };
  const noop = () => {};
  const ctx = () => new Proxy({}, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === "createImageData") return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (k === "getImageData") return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (k === "measureText") return () => ({ width: 40 });
      if (typeof throwOn === "function" ? throwOn(k) : k === throwOn) return () => { throw new Error(`stub ${String(k)} threw`); };
      return () => ({ addColorStop: noop });
    },
    set(t, k, v) { t[k] = v; return true; },
  });
  const canvas = () => ({ width: 0, height: 0, clientWidth: 300, clientHeight: 200, style: {}, isConnected: true,
    addEventListener: noop, setPointerCapture: noop, getContext: ctx });
  const cv = canvas();
  const fig = { remove() { dom.html = ""; }, replaceWith(n) { dom.html = n.html; } };
  const document = {
    hidden: false, head: { appendChild: noop }, documentElement: {}, addEventListener: noop,
    getElementById: (id) => (id === "globeCv" && dom.html.includes('id="globeCv"') ? cv : null),
    querySelector: (q) => (q === "figure.globe" && dom.html.includes('<figure class="globe"') ? fig : null),
    createElement(tag) {
      if (tag === "canvas") return canvas();
      if (tag === "div") { const d = { set innerHTML(h) { d.firstChild = { html: h }; } }; return d; }
      return {};
    },
  };
  class Image { set src(_) { queueMicrotask(() => this.onload && this.onload()); } }
  const g = {
    GLOBE: globe, document, Image, devicePixelRatio: 1, console: { warn: (...m) => dom.warned.push(m.join(" ")) },
    matchMedia: () => ({ matches: false }), getComputedStyle: () => ({ getPropertyValue: () => "#336699" }),
    requestAnimationFrame: (f) => dom.frames.push(f), cancelAnimationFrame: noop, addEventListener: noop, setTimeout: (f) => queueMicrotask(f),
    panel: { classList: { contains: () => false } }, fmtYear: (y) => String(y), queueMicrotask,
    esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  };
  g.window = g;
  vm.createContext(g);
  vm.runInContext(`${SRC}\nglobalThis.__Globe = Globe;`, g, { filename: "template.html#Globe" });
  const Globe = g.__Globe;
  // renderPanel's two calls: the figure into the panel, then mount; then run a few animation frames
  dom.show = async (ev) => {
    dom.html = Globe.html(ev);
    Globe.mount();
    for (let t = 1; t < 8; t++) { await new Promise((r) => setImmediate(r)); const fs = dom.frames.splice(0); fs.forEach((f) => f(t * 100)); }
    return dom.html;
  };
  dom.Globe = Globe;
  return dom;
}

const ROME = { scope: "place", lat: 41.89, lon: 12.49, r: 40, label: "Rome", src: "https://en.wikipedia.org/wiki/Rome" };
const ev = (o) => ({ id: "x", kind: "event", y: 1950, title: "An event", ...o });
const MISSING = '<span class="g-missing">Location data not found</span>';
const cases = [];
const test = (name, fn) => cases.push([name, fn]);

test("an event with a location: the globe, no fallback caption", async () => {
  const d = world(), h = await d.show(ev({ geo: ROME }));
  assert.match(h, /<figure class="globe"><canvas id="globeCv"/);
  assert.doesNotMatch(h, /g-missing/);
  assert.deepEqual(d.warned, []);
});
for (const [name, o] of [
  ["no geo, modern", { y: 2016.99 }],
  ["no geo, 100 million years ago (a PaleoDEM map)", { y: -100e6 }],
  ["no geo, Last Glacial Maximum", { y: -22000 }],
  ["no geo, 1 billion years ago (a procedural stage)", { y: -1e9 }],
  ["latitude out of range", { geo: { ...ROME, lat: 141.89 } }],
  ["latitude a string", { geo: { ...ROME, lat: "41.89" } }],
  ["longitude missing", { geo: { scope: "region", lat: 10, r: 500, label: "Somewhere" } }],
  ["geo not an object", { geo: "Rome" }],
]) {
  test(`${name}: the globe, captioned "Location data not found"`, async () => {
    const d = world(), h = await d.show(ev(o));
    assert.match(h, /<figure class="globe"><canvas id="globeCv" role="img" aria-label="Rotating globe, location data not found: /);
    assert.ok(h.includes(MISSING), h);
    assert.deepEqual(d.warned, [], "a missing location is not an error");
  });
}
test("a branch marker uses its branch's location", async () => {
  const d = world(), h = await d.show({ id: "b-start", kind: "start", y: -753, title: "Roman Kingdom", b: { id: "rk", geo: ROME } });
  assert.doesNotMatch(h, /g-missing/);
});
test("a branch marker whose branch has no location: the fallback caption", async () => {
  const h = await world().show({ id: "b-start", kind: "start", y: 1800, title: "A branch", b: { id: "b" } });
  assert.ok(h.includes(MISSING));
});
test("a scope the renderer does not know, with good coordinates: drawn as a place", async () => {
  const h = await world().show(ev({ geo: { ...ROME, scope: "city" } }));
  assert.doesNotMatch(h, /g-missing/);
});
test("a place with no radius: drawn as a pin", async () => {
  const d = world(), h = await d.show(ev({ geo: { ...ROME, r: undefined } }));
  assert.doesNotMatch(h, /g-missing/);
  assert.deepEqual(d.warned, []);
});
test("global and cosmic scopes, and a cosmic scale the renderer does not know", async () => {
  for (const geo of [{ scope: "global" }, { scope: "cosmic", scale: "galaxy" }, { scope: "cosmic", scale: "multiverse" }]) {
    const d = world(), h = await d.show(ev({ geo }));
    assert.match(h, /<figure class="globe">/); assert.doesNotMatch(h, /g-missing/); assert.deepEqual(d.warned, []);
  }
  assert.match(await world().show(ev({ y: -13.8e9 })), /aria-label="Scale diagram: /, "before Earth, no geo: the scale diagram");
});
test("planning throws: the plain globe, captioned \"Location could not be shown\"", async () => {
  const bad = { id: "x", kind: "event", title: "Bad", geo: ROME, get y() { throw new Error("bad entry"); } };
  const d = world(), h = await d.show(bad);
  assert.ok(h.includes('<span class="g-missing">Location could not be shown</span>'), h);
  assert.match(h, /aria-label="Rotating globe, location could not be shown: /);
  assert.equal(d.warned.length, 1);
});
test("drawing the marker throws: the plain globe in its place", async () => {
  // the label tag (roundRect) is drawn only for a located entry, so the fallback (no marker) draws cleanly
  const d = world({ throwOn: "roundRect" }), h = await d.show(ev({ geo: ROME }));
  assert.ok(h.includes("Location could not be shown"), h);
  assert.ok(d.warned.length >= 1);
});
test("the fallback globe throws too: no figure, and nothing thrown", async () => {
  const d = world({ throwOn: "arc" }), h = await d.show(ev({ geo: ROME }));
  assert.equal(h, "", "no broken canvas left in the panel");
  assert.equal(d.Globe.html(ev({})).includes(MISSING), true, "the next entry still gets its figure");
});
test("built without globe assets: no figure, nothing thrown", async () => {
  const d = world({ globe: null });
  assert.equal(await d.show(ev({ geo: ROME })), "");
  assert.equal(await d.show(ev({})), "");
});

let failed = 0;
for (const [name, fn] of cases) {
  try { await fn(); console.log(`✓ ${name}`); }
  catch (err) { failed++; console.log(`✗ ${name}\n  ${String(err.stack || err).split("\n").slice(0, 6).join("\n  ")}`); }
}
console.log(`${cases.length - failed} of ${cases.length} globe cases passed`);
process.exitCode = failed ? 1 : 0;
