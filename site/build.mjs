// Validates a published snapshot and inlines it into template.html -> timeline.html. Since the cutover (ADR 0021)
// the page is built only from snapshots that `manage.py publish` writes from Postgres:
//   node build.mjs --from-json f.json           validate and build (refuses to build on errors)
//   node build.mjs --from-json f.json --check   validate only
//   node build.mjs --from-json f.json --dump-json g.json   validate, then write the content back in the canonical shape
//                                     (publish's build gate: the snapshot must come back byte for byte)
//   --out path.html                   where to write the page (default timeline.html, next to this file)
//   --built YYYY-MM-DD                the "Data compiled" date (default: today, or BUILT in the environment)
// The legacy content files are frozen in archive/site-data/. `--archive [dir]` reads them (applying their TL.* calls)
// in place of a snapshot; it exists only for `manage.py import_legacy --archive` (with --dump-json), and `--file
// prefix` limits the report to some of those files.
// Content is written in one canonical key order (canonical.mjs), so the same content always gives the same bytes.
import fs from "node:fs";
import { collector, applyRestructure } from "./restructure.mjs";
import { canonicalContent, dropped } from "./canonical.mjs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const onlyFile = opt("--file");
const dumpJson = opt("--dump-json");
const fromJson = opt("--from-json");
const archiveArg = args.includes("--archive") ? (args[args.indexOf("--archive") + 1] || "") : null;
const archiveDir = archiveArg === null ? null : path.resolve(archiveArg && !archiveArg.startsWith("--") ? archiveArg : path.join(here, "..", "archive", "site-data"));
const outPath = opt("--out") || path.join(here, "timeline.html");
const built = opt("--built") || process.env.BUILT || new Date().toISOString().slice(0, 10);
if (args.some((a, i) => ["--dump-json", "--from-json", "--out", "--built", "--file"].includes(a) && !args[i + 1])) {
  console.error("Usage: node build.mjs --from-json content.json [--check] [--dump-json out.json] [--out page.html] [--built YYYY-MM-DD]\n" +
                "       node build.mjs --archive [dir] --dump-json out.json   (the frozen legacy files, for manage.py import_legacy --archive)");
  process.exit(2);
}
if (!fromJson === (archiveDir === null)) {
  console.error(fromJson
    ? "Name one source: --from-json or --archive, not both."
    : "build.mjs builds from a published snapshot: node site/build.mjs --from-json var/releases/latest/content.json (make build).\n" +
      "The legacy data/*.js files are frozen in archive/site-data/ (ADR 0021); --archive reads them, for manage.py import_legacy --archive only.");
  process.exit(2);
}
if (archiveDir !== null && !dumpJson && !checkOnly) {
  console.error("--archive only dumps (--dump-json) or checks (--check): the page is built from snapshots (ADR 0021).");
  process.exit(2);
}

const REGIONS = ["cosmos", "life", "humans", "global", "faiths", "culture", "mideast", "europe", "africa", "southasia", "eastasia", "americas", "oceania"];
const dataDir = archiveDir;
// From a snapshot, every entry is already resolved: there are no TL.* calls to apply, only the checks below.
const files = fromJson ? [] : fs.readdirSync(dataDir).filter((f) => f.endsWith(".js")).sort();

const branches = [], events = [], extraCites = [], enrich = [], geos = [], images = [], origins = [], restructure = [];
for (const f of files) {
  const src = fs.readFileSync(path.join(dataDir, f), "utf8");
  const TL = {
    add(o) { (o.branches || []).forEach((b) => branches.push({ ...b, _file: f })); (o.events || []).forEach((e) => events.push({ ...e, _file: f })); },
    cite(id, t, u, k) { extraCites.push({ id, t, u, k, _file: f }); }, // second source for an entry defined elsewhere
    enrich(id, o) { enrich.push({ id, ...o, _file: f }); },             // "why it matters" + connections for an entry
    geo(id, o) { geos.push({ id, ...o, _file: f }); },                  // where it happened: { scope, lat, lon, r, label, src }
    image(id, o) { images.push({ id, ...o, _file: f }); },              // a public-domain picture: { src, w, h, title, credit, license, page }
    origin(id, o) { origins.push({ id, ...o, _file: f }); },            // where a branch came from: { note, links: [{ id, how, note }], cites }
    ...collector(restructure, f),                                        // move / patch / merge (see restructure.mjs)
  };
  try { vm.runInNewContext(src, { TL }, { filename: f }); }
  catch (err) { console.error(`✗ ${f}: does not parse — ${err.message}`); process.exitCode = 1; }
}

if (fromJson) {
  const snap = JSON.parse(fs.readFileSync(fromJson, "utf8"));
  const src = path.basename(fromJson);
  for (const b of snap.branches || []) branches.push({ ...b, _file: src });
  for (const e of snap.events || []) events.push({ ...e, _file: src });
}

const errors = [], warnings = [];
errors.push(...applyRestructure({ branches, events, geos, images, origins, enrich, extraCites }, restructure));
{
  const byId = new Map([...branches, ...events].map((x) => [x.id, x]));
  for (const c of extraCites) {
    const x = byId.get(c.id);
    if (!x) { errors.push(`${c._file} ${c.id}: TL.cite references unknown id`); continue; }
    x.cites = Array.isArray(x.cites) ? x.cites : [];
    if (x.cites.some((k) => k.u === c.u)) { warnings.push(`${c._file} ${c.id}: duplicate citation ${c.u}`); continue; }
    x.cites.push(c.k ? { t: c.t, u: c.u, k: c.k } : { t: c.t, u: c.u });
  }
  for (const e of enrich) {
    const x = byId.get(e.id);
    if (!x) { errors.push(`${e._file} ${e.id}: TL.enrich references unknown id`); continue; }
    if (!e.why || typeof e.why !== "string") errors.push(`${e._file} ${e.id}: enrich needs a why`);
    else if (e.why.length > 700) warnings.push(`${e._file} ${e.id}: why is ${e.why.length} chars`);
    for (const c of e.connections || []) {
      if (!byId.has(c.id)) errors.push(`${e._file} ${e.id}: connection to unknown id "${c.id}"`);
      if (!c.note || c.note.length > 90) errors.push(`${e._file} ${e.id}: connection note missing or over 90 chars (${c.id})`);
    }
    if (!Array.isArray(e.cites) || !e.cites.length) errors.push(`${e._file} ${e.id}: enrich needs its own cites for the why/connections`);
    for (const c of e.cites || []) if (!c || !c.t || !/^https:\/\/\S+$/.test(c.u || "")) errors.push(`${e._file} ${e.id}: bad enrich cite ${c && c.u}`);
    x.why = e.why; x.connections = e.connections || []; x.whyCites = e.cites;
  }
  const SCOPES = ["place", "region", "global", "cosmic"];
  for (const g of geos) {
    const x = byId.get(g.id);
    if (!x) { errors.push(`${g._file} ${g.id}: TL.geo references unknown id`); continue; }
    if (!SCOPES.includes(g.scope)) errors.push(`${g._file} ${g.id}: geo scope must be one of ${SCOPES}`);
    if (g.scope === "place" || g.scope === "region") {
      if (!(Math.abs(g.lat) <= 90 && Math.abs(g.lon) <= 180)) errors.push(`${g._file} ${g.id}: bad lat/lon`);
      if (!(g.r > 0 && g.r <= 6000)) errors.push(`${g._file} ${g.id}: r (km) must be 0–6000`);
      if (!g.label) errors.push(`${g._file} ${g.id}: geo needs a label`);
      if (!/^https:\/\//.test(g.src || "")) errors.push(`${g._file} ${g.id}: geo needs a https src for the coordinates`);
    }
    if (g.scale !== undefined && (g.scope !== "cosmic" || !["solar-system", "galaxy", "universe"].includes(g.scale))) errors.push(`${g._file} ${g.id}: scale is only for cosmic scope and must be solar-system | galaxy | universe`);
    x.geo = { scope: g.scope, lat: g.lat, lon: g.lon, r: g.r, label: g.label, src: g.src };
    if (g.scale) x.geo.scale = g.scale;
  }
  for (const im of images) {
    const x = byId.get(im.id);
    if (!x) { errors.push(`${im._file} ${im.id}: TL.image references unknown id`); continue; }
    for (const k of ["src", "title", "credit", "license", "page"]) if (!im[k]) errors.push(`${im._file} ${im.id}: image needs ${k}`);
    if (!/^(PD|Public domain|CC0)/i.test(im.license || "")) errors.push(`${im._file} ${im.id}: image license must be public domain or CC0 (got ${im.license})`);
    (x.images ||= []).push({ src: im.src, w: im.w, h: im.h, title: im.title, credit: im.credit, license: im.license, page: im.page });
  }
}
const report = (list, item, msg) => { if (!onlyFile || item._file.startsWith(onlyFile)) list.push(`${item._file} ${item.id || "(no id)"}: ${msg}`); };
const ids = new Map();
for (const x of [...branches, ...events]) {
  if (!x.id || !/^[a-z0-9][a-z0-9-]*$/.test(x.id)) report(errors, x, "id must be kebab-case");
  if (ids.has(x.id)) report(errors, x, `duplicate id (also in ${ids.get(x.id)})`);
  ids.set(x.id, x._file);
}
const B = new Map(branches.map((b) => [b.id, b]));
// Origins: which earlier branches a branch grew out of, and how. Each link is also added to `parents`, so it is drawn.
const HOWS = ["independence", "split", "successor", "merger", "conquest", "peoples", "ideas", "reaction", "context"];
for (const o of origins) {
  const b = B.get(o.id);
  if (!b) { report(errors, o, "TL.origin references unknown branch"); continue; }
  if (b.origin) report(errors, o, "branch already has a TL.origin");
  if (!o.note || typeof o.note !== "string") report(errors, o, "origin needs a note");
  else if (o.note.length > 340) report(warnings, o, `origin note is ${o.note.length} chars`);
  if (!Array.isArray(o.links)) { report(errors, o, "origin needs a links array (may be empty)"); continue; }
  for (const l of o.links) {
    const p = B.get(l.id);
    if (!p) { report(errors, o, `origin link to unknown branch "${l.id}"`); continue; }
    if (l.id === b.id) report(errors, o, "origin links to itself");
    if (!HOWS.includes(l.how)) report(errors, o, `origin link how must be one of ${HOWS.join(" | ")} (${l.id})`);
    if (!l.note || l.note.length > 100) report(errors, o, `origin link note missing or over 100 chars (${l.id})`);
    if (p.start > b.start) report(warnings, o, `origin link ${l.id} starts after ${b.id}`);
  }
  if (!Array.isArray(o.cites) || !o.cites.length) report(errors, o, "origin needs its own cites");
  for (const c of o.cites || []) if (!c || !c.t || !/^https:\/\/\S+$/.test(c.u || "")) report(errors, o, `bad origin cite ${c && c.u}`);
  b.parents = [...new Set([...(b.parents || []), ...o.links.map((l) => l.id).filter((id) => B.has(id) && id !== b.id)])];
  b.origin = { note: o.note, links: o.links.map(({ id, how, note }) => ({ id, how, note })), cites: o.cites };
}
const KINDS = ["primary", "textbook", "paper", "museum", "archive", "reference", "encyclopedia", "news", "data"];
const checkCites = (x) => {
  if (!Array.isArray(x.cites) || x.cites.length === 0) return report(errors, x, "needs at least one citation");
  for (const c of x.cites) {
    if (!c || typeof c.t !== "string" || !c.t.trim()) report(errors, x, "citation missing title `t`");
    if (!c || typeof c.u !== "string" || !/^https:\/\/[^\s]+$/.test(c.u)) report(errors, x, `citation url must be https: ${c && c.u}`);
    if (c && c.k && !KINDS.includes(c.k)) report(errors, x, `unknown citation kind ${c.k}`);
  }
};
for (const b of branches) {
  if (!b.name) report(errors, b, "missing name");
  if (!REGIONS.includes(b.region)) report(errors, b, `bad region ${b.region}`);
  if (typeof b.start !== "number" || !isFinite(b.start)) report(errors, b, "start must be a number");
  if (b.end !== null && (typeof b.end !== "number" || !isFinite(b.end))) report(errors, b, "end must be a number or null");
  if (b.end !== null && b.end <= b.start) report(errors, b, "end must be after start");
  if (!b.startWhen) report(errors, b, "missing startWhen");
  if (b.end !== null && !b.endWhen) report(errors, b, "missing endWhen");
  if (!b.text) report(errors, b, "missing text");
  else if (b.text.length > 320) report(warnings, b, `text is ${b.text.length} chars`);
  for (const k of ["parents", "into"]) {
    if (!Array.isArray(b[k])) { report(errors, b, `${k} must be an array`); continue; }
    for (const r of b[k]) if (!B.has(r)) report(errors, b, `${k} references unknown branch "${r}"`);
  }
  checkCites(b);
}
for (const e of events) {
  const b = B.get(e.branch);
  if (!b) report(errors, e, `unknown branch "${e.branch}"`);
  if (typeof e.y !== "number" || !isFinite(e.y)) report(errors, e, "y must be a number");
  if (e.end !== undefined && (typeof e.end !== "number" || e.end <= e.y)) report(errors, e, "end must be a number after y");
  if (!e.when) report(errors, e, "missing when");
  if (!e.title) report(errors, e, "missing title");
  else if (e.title.length > 70) report(warnings, e, `title is ${e.title.length} chars`);
  if (!e.text) report(errors, e, "missing text");
  else if (e.text.length > 320) report(warnings, e, `text is ${e.text.length} chars`);
  if (![1, 2, 3].includes(e.imp)) report(errors, e, "imp must be 1, 2 or 3");
  if (e.link !== undefined && !B.has(e.link)) report(errors, e, `link references unknown branch "${e.link}"`);
  if (b && typeof e.y === "number") {
    const span = Math.max(50, Math.abs(b.start) * 0.05);
    if (e.y < b.start - span || (b.end !== null && e.y > b.end + span)) report(warnings, e, `y=${e.y} is outside branch ${b.id} [${b.start}, ${b.end}]`);
  }
  checkCites(e);
}

const perFile = {};
for (const x of branches) (perFile[x._file] ||= { branches: 0, events: 0, cites: 0 }).branches++;
for (const x of events) (perFile[x._file] ||= { branches: 0, events: 0, cites: 0 }).events++;
for (const x of [...branches, ...events]) perFile[x._file].cites += (x.cites || []).length;
console.table(perFile);
warnings.forEach((w) => console.log("⚠", w));
errors.forEach((e) => console.log("✗", e));
console.log(`${branches.length} branches, ${events.length} events, ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length) process.exitCode = 1;

if (dumpJson) {
  if (errors.length) { console.error("Not dumping: fix errors first."); process.exit(1); }
  fs.writeFileSync(dumpJson, JSON.stringify(canonicalContent({ branches, events }), null, 1) + "\n");
  console.log(`Wrote ${dumpJson} (${branches.length} branches, ${events.length} events)`);
} else if (!checkOnly) {
  if (errors.length) { console.error("Not building: fix errors first."); process.exit(1); }
  const data = JSON.stringify({ ...canonicalContent({ branches, events }), built });
  const tpl = fs.readFileSync(path.join(here, "template.html"), "utf8");
  const globePath = path.join(here, "globe-assets.json"); // built once by build-globe.mjs; optional
  const globe = fs.existsSync(globePath) ? fs.readFileSync(globePath, "utf8").trim() : "null";
  const out = tpl.replace("/*__DATA__*/null", () => data.replace(/<\/script/gi, "<\\/script"))
    .replace("/*__GLOBE__*/null", () => globe.replace(/<\/script/gi, "<\\/script"));
  fs.writeFileSync(outPath, out);
  console.log(`Wrote ${path.relative(process.cwd(), outPath) || outPath} (${(out.length / 1024).toFixed(0)} KB)`);
}
for (const [k, n] of dropped) console.log(`⚠ ${n} × unknown key "${k}" left out of the page (not in canonical.mjs)`);
