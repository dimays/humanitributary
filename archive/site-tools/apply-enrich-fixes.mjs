// Applies audit fixes to TL.enrich blocks: { id, file, fixWhy, dropConnections: [ids], addCite: {t,u,k} }.
//   node apply-enrich-fixes.mjs [--apply] out.json
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2), apply = args.includes("--apply");
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "data");
const files = Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => [f, fs.readFileSync(path.join(dir, f), "utf8")]));
function blockSpan(src, id) {
  const m = new RegExp(String.raw`TL\.enrich\(\s*"${id}"\s*,\s*\{`).exec(src); if (!m) return null;
  let i = m.index + m[0].length - 1, d = 0, q = null;
  for (; i < src.length; i++) { const c = src[i];
    if (q) { if (c === "\\") { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c; else if (c === "{") d++; else if (c === "}") { d--; if (!d) return [m.index, i + 1]; } }
  return null;
}
let n = 0;
for (const inp of args.filter((a) => !a.startsWith("--"))) for (const x of JSON.parse(fs.readFileSync(inp, "utf8"))) {
  if (x.summary || x.progress) continue;
  const f = Object.keys(files).find((k) => blockSpan(files[k], x.id)); if (!f) { console.log("✗ not found", x.id); continue; }
  const [a, b] = blockSpan(files[f], x.id); let blk = files[f].slice(a, b); const before = blk;
  if (x.fixWhy) blk = blk.replace(/(\bwhy:\s*)"(?:[^"\\]|\\.)*"/, (_, p) => p + JSON.stringify(x.fixWhy));
  for (const cid of x.dropConnections || []) blk = blk.replace(new RegExp(String.raw`\s*\{\s*id:\s*"${cid}"[^}]*\},?`), "");
  for (const [cid, note] of Object.entries(x.fixNotes || {})) blk = blk.replace(new RegExp(String.raw`(\{\s*id:\s*"${cid}"\s*,\s*note:\s*)"(?:[^"\\]|\\.)*"`), (_, p) => p + JSON.stringify(note));
  if (x.addCite) blk = blk.replace(/(\bcites:\s*\[)/, `$1\n    ${JSON.stringify(x.addCite)},`);
  if (blk !== before) { files[f] = files[f].slice(0, a) + blk + files[f].slice(b); n++; console.log("•", f, x.id); }
}
console.log(n, "blocks changed");
if (apply) for (const [f, s] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), s);
