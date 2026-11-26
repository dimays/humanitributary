// Applies audit fixes (JSON produced by citation auditors) to data/*.js.
//   node apply-fixes.mjs fixes1.json [fixes2.json ...]          dry run: print what would change
//   node apply-fixes.mjs --apply fixes1.json [...]              write the changes
// Each fix: { id, fix: { text|title|name|when|startWhen|endWhen: "new", removeParent: "id", removeInto: "id", removeLink: true },
//             addCite: { t, u } }. Added citations go to data/13-audit-sources.js as TL.cite(...) lines.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const inputs = args.filter((a) => !a.startsWith("--"));
const dataDir = path.join(here, "data");
const files = Object.fromEntries(fs.readdirSync(dataDir).filter((f) => f.endsWith(".js")).map((f) => [f, fs.readFileSync(path.join(dataDir, f), "utf8")]));
const STR = String.raw`"(?:[^"\\]|\\.)*"`;
const cites = [];
let ok = 0, failed = 0;

function block(src, id) {
  const m = new RegExp(String.raw`\bid:\s*"${id}"`).exec(src);
  if (!m) return null;
  const rest = src.slice(m.index + m[0].length);
  const next = /\bid:\s*"/.exec(rest);
  return { start: m.index, end: m.index + m[0].length + (next ? next.index : rest.length) };
}
for (const inp of inputs) {
  for (const item of JSON.parse(fs.readFileSync(inp, "utf8"))) {
    if (item.summary || (!item.fix && !item.addCite)) continue;
    const file = Object.keys(files).find((f) => block(files[f], item.id));
    if (!file) { console.log(`✗ ${item.id}: not found`); failed++; continue; }
    let src = files[file]; const b = block(src, item.id);
    let seg = src.slice(b.start, b.end); const before = seg;
    for (const [k, v] of Object.entries(item.fix || {})) {
      if (["text", "title", "name", "when", "startWhen", "endWhen"].includes(k)) {
        const re = new RegExp(String.raw`(\b${k}:\s*)${STR}`);
        if (!re.test(seg)) { console.log(`✗ ${item.id}: no ${k} field in source`); failed++; continue; }
        seg = seg.replace(re, (_, p) => p + JSON.stringify(v));
      } else if (k === "removeParent" || k === "removeInto") {
        const key = k === "removeParent" ? "parents" : "into";
        const re = new RegExp(String.raw`(\b${key}:\s*\[)([^\]]*)\]`);
        const m = re.exec(seg);
        if (!m) { console.log(`✗ ${item.id}: no ${key} array`); failed++; continue; }
        const kept = m[2].split(",").map((s) => s.trim()).filter((s) => s && s !== JSON.stringify(v));
        seg = seg.replace(re, `$1${kept.join(", ")}]`);
      } else if (k === "removeLink" && v) {
        seg = seg.replace(new RegExp(String.raw`\s*\blink:\s*${STR},?`), "");
      } else { console.log(`? ${item.id}: unknown fix key ${k}`); }
    }
    if (seg !== before) {
      files[file] = src.slice(0, b.start) + seg + src.slice(b.end);
      console.log(`• ${file} ${item.id} [${item.verdict}]\n  - ${before.replace(/\s+/g, " ").slice(0, 400)}\n  + ${seg.replace(/\s+/g, " ").slice(0, 400)}`);
      ok++;
    }
    if (item.addCite) { cites.push(`TL.cite(${JSON.stringify(item.id)}, ${JSON.stringify(item.addCite.t)}, ${JSON.stringify(item.addCite.u)});`); console.log(`  + cite ${item.addCite.u}`); }
  }
}
console.log(`\n${ok} entries changed, ${cites.length} citations added, ${failed} problems`);
if (apply) {
  for (const [f, src] of Object.entries(files)) fs.writeFileSync(path.join(dataDir, f), src);
  if (cites.length) {
    const out = path.join(dataDir, "13-audit-sources.js");
    const head = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "// Extra sources added during the full citation audit; each page was fetched and read by the auditor.\n";
    fs.writeFileSync(out, head + cites.join("\n") + "\n");
  }
  console.log("written");
}
