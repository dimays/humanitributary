// Where located entries lay at the age of the paleo map the globe shows for them. Adds `pts` to globe-assets.json.
//   node build-paleo-points.mjs            query what is missing (cached in .paleo-cache.json, gitignored), then write
//   node build-paleo-points.mjs --offline  use the cache only
//   --from-json content.json               the snapshot to read (default ../var/releases/latest/content.json)
// Uses the GPlates Web Service (https://gws.gplates.org, University of Sydney) with the PALEOMAP plate model, the same
// model as the PaleoDEM textures. Points are batched (60 per request) with a pause between requests. Points the model
// cannot place at that age (crust that did not exist yet) are stored as null, and the page then falls back to the
// present-day location.
//
// globe-assets.json `pts`: { "<slice Ma>": { "<lat>,<lon>": [paleoLat, paleoLon] | null } }, keyed by the entry's
// present-day coordinates exactly as the snapshot has them, so every entry at that place shares one lookup.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const offline = process.argv.includes("--offline");
const MODEL = "PALEOMAP", BATCH = 60, PAUSE_MS = 1500;
const assetsPath = path.join(here, "globe-assets.json"), cachePath = path.join(here, ".paleo-cache.json");
const assets = JSON.parse(fs.readFileSync(assetsPath, "utf8"));
const SLICES = assets.slices;
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

// ----- collect entries from a published snapshot (the content's only source since the cutover) -----
const fi = process.argv.indexOf("--from-json");
const snapFile = fi > 0 ? process.argv[fi + 1] : path.join(here, "..", "var", "releases", "latest", "content.json");
if (!fs.existsSync(snapFile)) { console.error(`${snapFile} not found: make release-pull, or name a snapshot with --from-json`); process.exit(2); }
const { branches, events } = JSON.parse(fs.readFileSync(snapFile, "utf8"));
const G = new Map([...branches, ...events].filter((x) => x.geo).map((x) => [x.id, x.geo]));
// The page's rule (template.html, Globe.plan): paleo maps for entries more than 12,000 years old and at most 540 Ma,
// using the nearest slice. Slice 0 is the present day and needs no reconstruction.
const nearest = (ma) => SLICES.reduce((a, b) => (Math.abs(b - ma) < Math.abs(a - ma) ? b : a));
const sliceAt = (y) => { const yrs = -y; return yrs > 12000 && yrs / 1e6 <= 540 ? nearest(yrs / 1e6) : null; };
const want = new Map(); // slice -> Set of "lat,lon"
const located = (g) => g && (g.scope === "place" || g.scope === "region") && Number.isFinite(g.lat) && Number.isFinite(g.lon);
const need = (slice, g) => { if (!slice) return; if (!want.has(slice)) want.set(slice, new Set()); want.get(slice).add(`${g.lat},${g.lon}`); };
let nEntries = 0;
for (const e of events) { const g = G.get(e.id); if (located(g) && sliceAt(e.y)) { nEntries++; need(sliceAt(e.y), g); } }
// Branches: their start/end markers and any moment along them ("You're on this branch at a moment…").
for (const b of branches) {
  const g = G.get(b.id); if (!located(g)) continue;
  const lo = b.end === null ? 0 : -b.end, hi = -b.start; // years before present
  let any = false;
  SLICES.forEach((s, i) => {
    if (!s) return;
    const from = ((SLICES[i - 1] ?? s) + s) / 2 * 1e6, to = i === SLICES.length - 1 ? 540e6 : (s + SLICES[i + 1]) / 2 * 1e6;
    if (hi > Math.max(from, 12000) && lo < to) { need(s, g); any = true; }
  });
  if (any) nEntries++;
}

// ----- query -----
const key = (t, p) => `${MODEL}|${t}|${p}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let requests = 0;
for (const [t, set] of [...want].sort((a, b) => a[0] - b[0])) {
  const todo = [...set].filter((p) => !(key(t, p) in cache));
  for (let i = 0; i < todo.length && !offline; i += BATCH) {
    const chunk = todo.slice(i, i + BATCH), ll = chunk.map((p) => p.split(",").map(Number));
    const url = `https://gws.gplates.org/reconstruct/reconstruct_points/?lats=${ll.map((x) => x[0]).join(",")}&lons=${ll.map((x) => x[1]).join(",")}` +
      `&time=${t}&model=${MODEL}&return_null_points`;
    if (requests++) await sleep(PAUSE_MS);
    const res = await fetch(url, { headers: { "User-Agent": "timeline-globe-build/1.0" } });
    if (!res.ok) throw new Error(`GWS ${res.status} for t=${t}`);
    const json = await res.json(), coords = json.coordinates;
    if (!Array.isArray(coords) || coords.length !== chunk.length) throw new Error(`GWS returned ${coords && coords.length} points for ${chunk.length} at t=${t}`);
    chunk.forEach((p, k) => { const c = coords[k]; cache[key(t, p)] = c && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90 ? [c[1], c[0]] : null; });
    fs.writeFileSync(cachePath, JSON.stringify(cache));
    console.log(`t=${t} Ma: ${chunk.length} points`);
  }
}

// ----- write -----
const pts = {};
let n = 0, nulls = 0, missing = 0;
for (const [t, set] of [...want].sort((a, b) => a[0] - b[0])) {
  for (const p of [...set].sort()) {
    if (!(key(t, p) in cache)) { missing++; continue; }
    const v = cache[key(t, p)];
    (pts[t] ||= {})[p] = v && [Math.round(v[0] * 100) / 100, Math.round(v[1] * 100) / 100];
    v ? n++ : nulls++;
  }
}
assets.pts = pts;
assets.attr.pts = "Positions then: GPlates Web Service, PALEOMAP plate model";
fs.writeFileSync(assetsPath, JSON.stringify(assets));
console.log(`${nEntries} located entries on paleo maps; ${n} place×slice positions reconstructed, ${nulls} not placeable, ${missing} missing (offline); ${requests} requests`);
