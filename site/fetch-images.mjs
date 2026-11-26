// Downloads chosen public-domain images and records them as TL.image entries.
//   node fetch-images.mjs selections.json candidates.json
// selections.json: { "<entry id>": "File:Name.jpg" | null } (chosen from candidates.json produced by image-candidates.mjs)
// Each image is downloaded once from its Commons thumbnail (≤ 480 px), re-encoded to a small JPEG in images/,
// and written to data/70-images.js with its title, author, date, license and Commons page.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const here = path.dirname(new URL(import.meta.url).pathname);
const [selFile, candFile] = process.argv.slice(2);
const sel = JSON.parse(fs.readFileSync(selFile, "utf8"));
const cand = JSON.parse(fs.readFileSync(candFile, "utf8"));
const imgDir = path.join(here, "images");
fs.mkdirSync(imgDir, { recursive: true });
const UA = "history-timeline-builder/1.0 (offline educational timeline; public-domain image download)";
const outFile = path.join(here, "data", "70-images.js");
// Commons metadata often carries Wikidata QuickStatements ("…title QS:P1476,en:…", "…date QS:P571,+1492-…") and
// doubled template text ("Unknown authorUnknown author"); strip those so captions read cleanly.
const clean = (t) => String(t || "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/\s*Complete indexed photo collection at WorldHistoryPics\.com\.?/gi, "")
  .replace(/\bAnonymous\s*Unknown author\b/gi, "Unknown author")
  .replace(/(\d{4}-\d{2}-\d{2})[ T]\d{2}:\d{2}(?::\d{2})?/g, "$1")
  .replace(/\s*(?:title|label|date)\s*QS:.*$/s, "")
  .replace(/\b(Unknown (?:author|artist|photographer))\s*\1/gi, "$1")
  .replace(/^(?:English|German|French|Spanish|Italian|Russian):\s*/i, "")
  .replace(/\s+/g, " ").replace(/[\s,;:]+$/, "").trim();
// Captions written by hand where the Commons description is a catalog dump or OCR text.
const FIX = {
  christianity: { title: "The expansion of Christianity, map from George Adam Smith's historical atlas of the Holy Land (1915)" },
  hre: { title: "The Holy Roman Empire and its members (the “Quaternion Eagle”), woodcut, 1510" },
  "tsardom-russia": { title: "Charter of Tsar Peter I with the Great Seal of the Tsardom of Russia, 1701 (Rijksmuseum)" },
  yamnaya: { title: "Finds of the Yamnaya culture (late 4th–3rd millennium BCE), Hermitage Museum" },
  "mx-spanish-civil-war": { title: "“For Freedom”, from a portfolio of prints from Spain by Đorđe Andrejević Kun, 1938" },
  scholasticism: { title: "Henricus de Alemannia lecturing to his students, single leaf from the Liber ethicorum" },
  aragon: { title: "Libro del Conto (1450), Diputación General of the Kingdom of Aragon" },
  tang: { title: "Horse painting by Han Gan, Tang dynasty (8th century)" },
  "viceroyalty-peru": { title: "Map of the Viceroyalty of Peru by Andrés Baleato, 1792" },
  "me-charlemagne-crowned": { title: "Idealized portrait of Charlemagne by Albrecht Dürer" },
  "st-cultural-revolution": { title: "Red Guards, February 1967" },
  who: { title: "United Nations stamp honoring the World Health Organization" },
  "g7-brown-v-board": { title: "U.S. Supreme Court judgment of May 17, 1954, in Oliver Brown et al. v. Board of Education" },
  "an-sack-410": { title: "The Sack of Rome by the Barbarians in 410, by Joseph-Noël Sylvestre (1890)" },
  "an-socrates": { title: "The Death of Socrates by Jacques-Louis David (1787), detail" },
  "cl-chicxulub": { title: "The Chicxulub impact: painting by Donald E. Davis for NASA of an asteroid striking shallow tropical seas" },
  "ga1-quiet-revolution": { title: "“Maîtres chez nous” (“Masters in our own house”): Quebec Liberal Party election leaflet, 1962" },
  "ga10-etm-abiy": { title: "Prime Minister Abiy Ahmed with Birtukan Mideksa as she becomes head of Ethiopia's electoral board, 2018" },
  "ga11-ar-trial-juntas": { title: "Trial of the Juntas, May 22, 1985: members of the military juntas enter the courtroom" },
  "ga11-br-bolsonaro-elected": { title: "President-elect Jair Bolsonaro meets US national security adviser John Bolton in Rio de Janeiro, 2018" },
  "ga2-fr-vel-dhiv": { title: "Letter from Bureau IV on organizing the Vel' d'Hiv roundup, July 1942" },
  "ga2-it-maxi-trial": { title: "The bunker courtroom at Palermo's Ucciardone prison during the Mafia Maxi Trial" },
  "ga2-it-piazza-fontana": { title: "Inside the Banca Nazionale dell'Agricoltura after the bombing, December 12, 1969" },
  "ga3-warsaw-ghetto-uprising": { title: "Jewish women captured with weapons, from the Stroop Report on the Warsaw Ghetto Uprising (1943)" },
  "ga3-may-coup": { title: "Piłsudski on Poniatowski Bridge in Warsaw during the May Coup, 1926" },
  "ga5-may-16-coup": { title: "Chang Do-yong and Park Chung Hee in the Capitol plaza just after the May 16 coup, 1961" },
  "ga5-seoul-olympics": { title: "Kim Won-tak (athlete), Chong Son-man (teacher) and Son Mi-jong (dance student) light the Olympic torch, Seoul 1988" },
  "ga7-daoud-pm": { title: "Prime Minister Mohammad Daoud Khan of Afghanistan" },
  "ga8-ataturk-dies": { title: "Atatürk, İsmet İnönü and Fevzi Çakmak leaving the Grand National Assembly, 1929" },
  "ga8-simele-massacre": { title: "Aerial view of Batarshah, an Assyrian village in northern Iraq destroyed in August 1933 (RAF photo)" },
  "gb1-at-civil-war": { title: "Julius Deutsch, The Civil War in Austria: accounts by fighters and eyewitnesses (Karlsbad, 1934)" },
  "gb1-cs-slansky-trial": { title: "Published court record of the trial of Rudolf Slánský and the “anti-state conspiratorial center” (German edition, 1953)" },
  "gb2-caucasus-rose-revolution": { title: "Georgian postage stamp marking the Rose Revolution, 2004" },
  "gb2-ecuador-peru-war-1941": { title: "Signing of the Rio de Janeiro Protocol, 1942" },
  "ph-being-and-time": { title: "Cover of Heidegger's Being and Time (Sein und Zeit), German edition" },
  "ph-shang-yang": { title: "Shang Yang “moves the log to establish trust”: illustration from a Ming-dynasty printed edition of the New Records of the States" },
  "st-brazil-coup-1964": { title: "Deposition of João Goulart's government in the coup of 1964 (Correio da Manhã archive)" },
  "ga6-prc-proclaimed": { title: "Mao Zedong proclaims the founding of the People's Republic of China, Tiananmen, October 1, 1949" },
  "me-hastings": { title: "The Norman Conquest, or the Battle of Hastings: etching by Charles Grignion after Francis Hayman",
                   credit: "Francis Hayman (design) and Charles Grignion (etching), 18th century" },
};
const tidy = (l) => {
  const m = l.match(/^TL\.image\(("([^"]+)"), (\{.*\})\);$/); if (!m) return l;
  const o = JSON.parse(m[3]); o.title = clean(o.title); o.credit = clean(o.credit) || "Unknown author";
  Object.assign(o, FIX[m[2]] || {});
  return `TL.image(${m[1]}, ${JSON.stringify(o)});`;
};
// Entries removed on review (e.g. a public-domain claim that doesn't hold up: a 1986 atlas whose author died in 1996).
const DROP = new Set(["songhai"]);
const lines = (fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8").split("\n").filter((l) => l.startsWith("TL.image(")).map(tidy) : [])
  .filter((l) => !DROP.has((l.match(/TL\.image\("([^"]+)"/) || [])[1]));
const have = new Set(lines.map((l) => (l.match(/TL\.image\("([^"]+)"/) || [])[1]));
let added = 0;
for (const [id, file] of Object.entries(sel)) {
  if (!file || have.has(id) || DROP.has(id)) continue;
  const c = (cand[id]?.candidates || []).find((x) => x.file === file);
  if (!c) { console.log("✗ not a candidate:", id, file); continue; }
  if (!/^(public domain|pd|cc0)/i.test(c.license)) { console.log("✗ license:", id, c.license); continue; }
  const raw = path.join(imgDir, `${id}.src`), jpg = path.join(imgDir, `${id}.jpg`);
  // Small files come back as their original; upload.wikimedia.org rate-limits originals harder than thumbnails, so if the
  // original is refused, fall back to a standard 330 px thumbnail of it.
  const base = c.thumb.split("?")[0], m = base.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w\/\w\w)\/([^/]+)$/);
  const urls = [c.thumb, ...(m ? [`${m[1]}/thumb/${m[2]}/${m[3]}/330px-${m[3]}`] : [])];
  try {
    let ok = false;
    for (const u of urls) { try { execFileSync("curl", ["-sSfL", "--max-time", "60", "-A", UA, "-o", raw, u]); ok = true; break; } catch { execFileSync("sleep", ["3"]); } }
    if (!ok) throw new Error("download failed");
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "68", "-Z", "480", raw, "--out", jpg], { stdio: "ignore" });
    fs.unlinkSync(raw);
  } catch { console.log("✗ download failed:", id, c.thumb); try { fs.unlinkSync(raw); } catch {} continue; }
  const dims = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", jpg], { encoding: "utf8" });
  const w = +(dims.match(/pixelWidth: (\d+)/) || [])[1], h = +(dims.match(/pixelHeight: (\d+)/) || [])[1];
  const title = clean(c.desc) || c.file.replace(/^File:/, "").replace(/\.\w+$/, "");
  const credit = [clean(c.artist) || "Unknown author", clean(c.date)].filter(Boolean).join(", ");
  lines.push(tidy(`TL.image(${JSON.stringify(id)}, ${JSON.stringify({ src: `images/${id}.jpg`, w, h, title: title.slice(0, 200), credit: credit.slice(0, 200), license: c.license, page: c.page })});`));
  added++; execFileSync("sleep", ["1"]);
}
fs.writeFileSync(outFile, "// Public-domain images from Wikimedia Commons (license checked from Commons metadata; AI-generated categories excluded).\n" + lines.join("\n") + "\n");
console.log(`${added} images added, ${lines.length} total`);
