// One-off asset builder for the details-pane globe. Writes globe-assets.json (committed).
//   node build-globe.mjs [--paleo-dir DIR]   DIR = folder holding the extracted PaleoDEM CSVs (Map01_000Ma.csv, ...);
//                                            without it, the CSV zip is downloaded from Zenodo into a temp folder.
// Sources: Natural Earth land 110m via world-atlas@2.0.2 (public domain);
//          Scotese & Wright (2018) PALEOMAP PaleoDEMs, doi:10.5281/zenodo.5460860 (CC BY 4.0).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const SLICES = [0, 20, 35, 50, 65, 100, 150, 200, 250, 300, 350, 400, 450, 500, 540];
const W = 360, H = 180;

// ---------- present-day land ----------
const topo = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json")).json();
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; }); });
const arcPts = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
const ringPts = (idx) => { const pts = []; for (const i of idx) { const p = arcPts(i); pts.push(...(pts.length ? p.slice(1) : p)); } return pts; };
const rings = [];
const walk = (g) => {
  if (g.type === "GeometryCollection") g.geometries.forEach(walk);
  else if (g.type === "Polygon") g.arcs.forEach((r) => rings.push(ringPts(r)));
  else if (g.type === "MultiPolygon") g.arcs.forEach((poly) => poly.forEach((r) => rings.push(ringPts(r))));
};
Object.values(topo.objects).forEach(walk);
// Compact: tenths of a degree, first point absolute then deltas, consecutive duplicates dropped.
const land = rings.map((r) => {
  const q = []; let last = null;
  for (const [lo, la] of r) { const p = [Math.round(lo * 10), Math.round(la * 10)]; if (!last || p[0] !== last[0] || p[1] !== last[1]) { q.push(p); last = p; } }
  const out = []; let px = 0, py = 0;
  for (const [x, y] of q) { out.push(x - px, y - py); px = x; py = y; }
  return out;
}).filter((r) => r.length >= 6);

// ---------- PNG encoder (2-bit indexed) ----------
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); };
function png2bit(cls, w, h, palette) { // cls: Uint8Array of values 0..3
  const rb = Math.ceil(w / 4), raw = [];
  let prev = Buffer.alloc(rb);
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(rb);
    for (let x = 0; x < w; x++) row[x >> 2] |= cls[y * w + x] << (6 - 2 * (x & 3));
    const up = Buffer.from(row.map((v, i) => (v - prev[i]) & 255));
    const score = (b) => b.reduce((s, v) => s + (v > 127 ? 256 - v : v), 0);
    const f = score(up) < score(row) ? 2 : 0;
    raw.push(Buffer.concat([Buffer.from([f]), f ? up : row])); prev = row;
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 2; ihdr[9] = 3;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("PLTE", Buffer.from(palette.flat())),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(raw), { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// ---------- PaleoDEMs ----------
let dir = args.includes("--paleo-dir") ? args[args.indexOf("--paleo-dir") + 1] : null;
if (!dir) {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "paleodem-"));
  const zip = path.join(dir, "csv.zip");
  execFileSync("curl", ["-sSL", "--fail", "-o", zip, "https://zenodo.org/api/records/5460860/files/PaleoDEMS_long_lat_elev_csv_v2.zip/content"]);
  execFileSync("unzip", ["-q", "-o", zip, "-d", dir]);
  dir = path.join(dir, "PaleoDEMS_long_lat_elev_csv_v2.csv");
}
const files = fs.readdirSync(dir).filter((f) => /^Map[\d.]+_(\d+)Ma\.csv$/.test(f));
const ageOf = (f) => +f.match(/_(\d+)Ma/)[1];
// classes: 0 deep ocean, 1 shelf sea, 2 lowland, 3 highland. Stored as gray levels 0/85/170/255 (the page reads R/85).
const textures = {}, sizes = {};
for (const ma of SLICES) {
  const f = files.slice().sort((a, b) => Math.abs(ageOf(a) - ma) - Math.abs(ageOf(b) - ma))[0];
  if (ageOf(f) !== ma) console.warn(`no exact slice for ${ma} Ma; using ${ageOf(f)} Ma`);
  const grid = new Float32Array(361 * 181);
  for (const line of fs.readFileSync(path.join(dir, f), "utf8").split(/\r\n|\r|\n/)) {
    if (!line || line[0] === "#") continue;
    const [lo, la, el] = line.split(",").map(Number);
    const i = Math.round(lo + 180), j = Math.round(90 - la);
    if (i >= 0 && i <= 360 && j >= 0 && j <= 180) grid[j * 361 + i] = el;
  }
  // sea: shoreline elevation in m. The 0 Ma grid is also written a second time with the sea 120 m lower ("lgm"):
  // the Last Glacial Maximum coastline, when Beringia, Sundaland, Sahul and Doggerland were dry land.
  for (const [key, sea] of ma === 0 ? [[0, 0], ["lgm", -120]] : [[ma, 0]]) {
    const cls = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const e = (grid[j * 361 + i] + grid[j * 361 + i + 1] + grid[(j + 1) * 361 + i] + grid[(j + 1) * 361 + i + 1]) / 4;
      cls[j * W + i] = e < -1500 ? 0 : e < sea ? 1 : e < 1000 ? 2 : 3;
    }
    const buf = png2bit(cls, W, H, [[0, 0, 0], [85, 85, 85], [170, 170, 170], [255, 255, 255]]);
    textures[key] = "data:image/png;base64," + buf.toString("base64");
    sizes[key] = buf.length;
  }
}

// Keep reconstructed marker positions (written by build-paleo-points.mjs) across asset rebuilds.
let prevAssets = {};
try { prevAssets = JSON.parse(fs.readFileSync(path.join(here, "globe-assets.json"), "utf8")); } catch (_) {}
const out = {
  land,
  slices: SLICES,
  textures,
  attr: {
    land: "Present-day coastlines · Natural Earth (public domain)",
    paleo: "PALEOMAP PaleoDEMs, Scotese & Wright 2018, CC BY 4.0",
    paleoFull: "Scotese, C.R. & Wright, N. (2018), PALEOMAP Paleodigital Elevation Models (PaleoDEMs) for the Phanerozoic, Zenodo, doi:10.5281/zenodo.5460860, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Resampled to 4 classes and recolored.",
  },
};
if (prevAssets.pts) out.pts = prevAssets.pts;
const json = JSON.stringify(out);
fs.writeFileSync(path.join(here, "globe-assets.json"), json);
console.log(`land: ${land.length} rings, ${land.reduce((n, r) => n + r.length / 2, 0)} points`);
console.log("texture PNG bytes:", sizes);
console.log(`Wrote globe-assets.json (${(json.length / 1024).toFixed(0)} KB)`);
