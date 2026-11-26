// Re-checks every TL.geo coordinate against Wikipedia: looks up the `src` page's coordinates (50 titles per request,
// one request at a time, politely paced) and rewrites lat/lon in data/*.js to the API's values.
//   node verify-geo.mjs           report only
//   node verify-geo.mjs --apply   rewrite coordinates; prints entries whose page has no coordinates or moved > 300 km
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const here = path.dirname(new URL(import.meta.url).pathname);
const dataDir = path.join(here, "data");
const apply = process.argv.includes("--apply");
const cacheFile = path.join(here, ".geo-cache.json");
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".js"));
const recs = [];
const RX = /TL\.geo\(\s*"([^"]+)"\s*,\s*(\{[^}]*\})\s*\)/g;
for (const f of files) {
  const src = fs.readFileSync(path.join(dataDir, f), "utf8");
  for (const m of src.matchAll(RX)) {
    let o; try { o = Function(`return (${m[2]})`)(); } catch { continue; }
    if (o.src && (o.scope === "place" || o.scope === "region")) recs.push({ file: f, id: m[1], o, raw: m[0] });
  }
}
const title = (u) => decodeURIComponent(u.replace(/^https:\/\/en\.wikipedia\.org\/wiki\//, "").split("#")[0]).replace(/_/g, " ");
const need = [...new Set(recs.map((r) => title(r.o.src)).filter((t) => !(t in cache)))];
console.log(`${recs.length} located entries, ${need.length} page titles to look up`);
const sleep = (ms) => execFileSync("sleep", [String(ms / 1000)]);
for (let i = 0; i < need.length; i += 50) {
  const batch = need.slice(i, i + 50);
  const url = "https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&format=json&redirects=1&colimit=max&titles=" + encodeURIComponent(batch.join("|"));
  let json = null;
  for (let attempt = 0; attempt < 5 && !json; attempt++) {
    try {
      const out = execFileSync("curl", ["-sS", "--max-time", "30", "-A", "history-timeline-builder/1.0 (offline educational timeline; geo check)", url], { encoding: "utf8" });
      json = JSON.parse(out);
    } catch { sleep(5000 * (attempt + 1)); }
  }
  if (!json) { console.log("✗ batch failed at", i); continue; }
  const norm = {}; for (const n of json.query?.normalized || []) norm[n.from] = n.to;
  const redir = {}; for (const r of json.query?.redirects || []) redir[r.from] = r.to;
  const byTitle = {}; for (const p of Object.values(json.query?.pages || {})) byTitle[p.title] = p.coordinates?.[0] || null;
  for (const t of batch) { let k = norm[t] || t; k = redir[k] || k; const c = byTitle[k]; cache[t] = c ? { lat: +c.lat.toFixed(2), lon: +c.lon.toFixed(2) } : null; }
  fs.writeFileSync(cacheFile, JSON.stringify(cache));
  process.stdout.write(`  looked up ${Math.min(i + 50, need.length)}/${need.length}\r`);
  sleep(1500);
}
const km = (a, b) => { const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
let fixed = 0, same = 0; const missing = [], moved = [];
const texts = Object.fromEntries(files.map((f) => [f, fs.readFileSync(path.join(dataDir, f), "utf8")]));
for (const r of recs) {
  const c = cache[title(r.o.src)];
  if (!c) { missing.push(`${r.id} → ${r.o.src}`); continue; }
  const d = km(r.o, c);
  if (d < 1) { same++; continue; }
  if (d > 300) moved.push(`${r.id} (${r.o.label}) moved ${Math.round(d)} km`);
  const upd = r.raw.replace(/lat:\s*-?[\d.]+/, `lat: ${c.lat}`).replace(/lon:\s*-?[\d.]+/, `lon: ${c.lon}`);
  texts[r.file] = texts[r.file].replace(r.raw, upd); fixed++;
}
console.log(`\n${same} already matched Wikipedia, ${fixed} corrected, ${missing.length} pages without coordinates`);
if (moved.length) console.log("Moved more than 300 km (check the src page is the right place):\n  " + moved.join("\n  "));
if (missing.length) console.log("No coordinates on page (kept the given values):\n  " + missing.slice(0, 80).join("\n  ") + (missing.length > 80 ? `\n  … ${missing.length - 80} more` : ""));
// Write only files that changed, applying each fix to the file as it is NOW (other tools may have edited it meanwhile).
if (apply) {
  const byFile = {};
  for (const r of recs) { const c = cache[title(r.o.src)]; if (!c || km(r.o, c) < 1) continue;
    (byFile[r.file] ||= []).push([r.raw, r.raw.replace(/lat:\s*-?[\d.]+/, `lat: ${c.lat}`).replace(/lon:\s*-?[\d.]+/, `lon: ${c.lon}`)]); }
  let n = 0;
  for (const [f, fixes] of Object.entries(byFile)) {
    const p = path.join(dataDir, f); let cur = fs.readFileSync(p, "utf8"); const before = cur;
    for (const [from, to] of fixes) cur = cur.replace(from, to);
    if (cur !== before) { fs.writeFileSync(p, cur); n++; }
  }
  console.log(`written (${n} files)`);
}
