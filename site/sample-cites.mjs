// Prints a random sample of entries (claim + citations) for an independent citation audit.
//   node sample-cites.mjs 40 > sample.json
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const n = +(process.argv[2] || 40);
const items = [], extra = [];
for (const f of fs.readdirSync(path.join(here, "data")).filter((f) => f.endsWith(".js")).sort()) {
  const TL = { cite(id, t, u) { extra.push({ id, t, u }); }, add(o) {
    for (const b of o.branches || []) items.push({ file: f, id: b.id, kind: "branch", claim: `${b.name}: ${b.startWhen} – ${b.end === null ? "present" : b.endWhen}. ${b.text}`, cites: b.cites });
    for (const e of o.events || []) items.push({ file: f, id: e.id, kind: "event", claim: `${e.when} — ${e.title}. ${e.text}`, cites: e.cites });
  }, enrich() {}, geo() {}, image() {}, move() {}, patch() {}, merge() {},
  origin(id, o) { items.push({ file: f, id, kind: "origin", claim: `${o.note} ${o.links.map((l) => `[${l.how} ${l.id}] ${l.note}`).join(" ")}`, cites: o.cites }); } };
  vm.runInNewContext(fs.readFileSync(path.join(here, "data", f), "utf8"), { TL });
}
for (const c of extra) { const x = items.find((i) => i.id === c.id); if (x) x.cites = [...x.cites, { t: c.t, u: c.u }]; }
// stratified: equal share per file, random within each
const byFile = Object.groupBy(items, (x) => x.file);
const files = Object.keys(byFile);
const out = [];
for (const f of files) {
  const pool = byFile[f].slice();
  for (let k = 0; k < Math.ceil(n / files.length) && pool.length; k++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
}
console.log(JSON.stringify(out.slice(0, n), null, 1));
