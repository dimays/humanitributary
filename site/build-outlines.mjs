// Builds outlines.js: simplified polity outlines for the details-pane globe (loaded lazily by timeline.html).
//   node build-outlines.mjs            match branches/events to shapes, write outlines.js, print a report
//   node build-outlines.mjs --verbose  also list every branch match and the unmatched polity-like branches
// Rerunnable: new branches and events are picked up; matches are never guessed (ambiguous -> no outline).
//
// Sources (downloaded once into the gitignored .outline-cache/):
//   Cliopatria v0.2.2 (Seshat Global History Databank; Scientific Data 2025,
//     doi:10.1038/s41597-025-04516-9; data doi:10.5281/zenodo.13363120), CC BY 4.0. Polity polygons 3400 BCE–2024 CE.
//   Natural Earth 1:50m admin-0 countries v5.1.2, public domain. Used only where the table below says so.
//
// How entries get an outline:
//   * A branch is matched to Cliopatria polities by the hand-checked TABLE (or, for branches not in the table, by an
//     exact, unique name match that covers at least half of the branch's span). Its outline at any year is the row
//     whose FromYear..ToYear contains the year; within EDGE years before its first or after its last row the nearest
//     row is borrowed (the caption then names the row's year). Gaps between different polities are left empty.
//   * An event on a matched branch gets the branch's outline at the event's year: "full" when the event's region is
//     the polity itself (same label, or a region the size of the branch's own), "context" (faint, behind the event's
//     own pin or circle) when the event's point lies inside the polity. A region event whose label exactly names a
//     Cliopatria polity existing that year (and lies inside it) gets that polity in full.
//   * Shapes under MIN_SHAPE_KM2 are skipped (a pin reads better at globe size).
import { collector, applyRestructure } from "./restructure.mjs";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import readline from "node:readline";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const VERBOSE = process.argv.includes("--verbose");
const CACHE = path.join(here, ".outline-cache");
const CLIO_VER = "v0.2.2";
const CLIO_ZIP = path.join(CACHE, `cliopatria-${CLIO_VER}.geojson.zip`), CLIO = path.join(CACHE, "cliopatria.geojson");
const NE = path.join(CACHE, "ne_50m_admin_0_countries.geojson");
const UA = "tributaries-timeline-build/1.0 (static history timeline; one-off dataset download)";
const TOL = 0.14;              // Douglas–Peucker tolerance, degrees (the globe is 130–260 px across: 1 px ≈ 0.7–1.4°)
const Q = 10;                  // coordinates stored in tenths of a degree
const MIN_POLY_KM2 = 2500;     // drop islands/exclaves smaller than this (unless they are the shape's largest piece)
const MIN_SHAPE_KM2 = 15000;   // whole shapes smaller than this keep the radius pin instead
const EDGE = 15;               // years a branch may borrow its first/last row across its own start/end
const NOW = 2026;

// ---------- hand-checked branch -> polity table ----------
// value: list of Cliopatria names in priority order (an inner array = drawn together as one shape), or an object
// { c: [...], ne: [ADM0_A3...], neFrom: year, label: "display name" }, or null = no outline (not a polity, or no
// faithful shape: e.g. Spanish viceroyalties are not separate polities in Cliopatria).
const TABLE = {
  // ancient Near East & Egypt
  sumer: ["Sumerian City-States"], akkad: ["Akkadian Empire"], assyria: ["Assyria", "Neo-Assyrian Empire"],
  babylonia: ["Babylonia", "Neo-Babylonian Empire"], hittites: ["Hittites"], phoenicia: ["Phoenicia"], carthage: ["Carthage"],
  egypt: ["Early Dynastic Period of Egypt", "Old Kingdom of Egypt", ["Lower Egypt", "Upper Egypt"], "Middle Kingdom of Egypt", "New Kingdom of Egypt",
    "Twenty-first Dynasty of Egypt", "Twenty-second Dynasty of Egypt", "Twenty-sixth Dynasty of Egypt", "Thirtieth Dynasty of Egypt", "Ptolemaic Kingdom"],
  "israel-judah": { c: [["Kingdom of Israel", "Kingdom of Judah"]], label: "the Kingdoms of Israel and Judah" },
  achaemenid: ["Achaemenid Empire"], seleucid: ["Seleucid Empire"], parthia: ["Parthian Empire"], sasanian: ["Sasanian Empire"],
  kush: ["Kingdom of Kush"], aksum: ["Kingdom of Axum"],
  // Mediterranean & Europe
  minoan: ["Minoan civilization"], mycenaean: ["Mycenaean Greece"], "ancient-greece": ["Greek City-States"], etruscans: ["Etruscans"],
  "roman-kingdom": ["Roman Kingdom"], "roman-republic": ["Roman Republic"], "roman-empire": ["Roman Empire"], "western-roman": ["Western Roman Empire"],
  byzantine: ["Eastern Roman Empire", "Byzantine Empire"],
  visigoths: ["Visigothic Kingdom", "Visigoths"], franks: ["(Kingdom of the Franks)"], "west-francia": ["West Franks"],
  "east-francia": ["East Franks", "Kingdom of Germany"], hre: ["(Holy Roman Empire)"],
  france: ["(Kingdom of France)", "(French First Republic)", "(French Directory)", "(French Consulate)", "(First French Empire)", "(Bourbon Kingdom of France)",
    "(French Second Republic)", "(Second French Empire)", "(French Third Republic)", "(Vichy France)", "(French Fourth Republic)", "French Fifth Republic"],
  "anglo-saxons": ["(Anglo-Saxon England)"], england: ["(Kingdom of England)"], scotland: ["Kingdom of Alba", "Kingdom of Scotland"],
  "great-britain": ["Kingdom of Great Britain"], uk: ["United Kingdom"], ireland: ["Irish Free State", "Éire"], "dal-riata": ["Dál Riata"],
  "asturias-leon": ["Kingdom of Asturias", "Kingdom of León"], navarre: ["Kingdom of Pamplona", "Kingdom of Navarre"],
  castile: ["Crown of Castile"], aragon: ["Kingdom of Aragon", "Crown of Aragon"],
  spain: ["Second Spanish Republic", "Francoist Spain", "First Spanish Republic", "Kingdom of Spain", "Iberian Union", ["Crown of Castile", "Crown of Aragon"]],
  portugal: ["Portugal", "Estado Novo", "Portuguese Republic", "Kingdom of Portugal", "Iberian Union", "County of Portugal"],
  "al-andalus": ["Emirate of Córdoba", "Caliphate of Córdoba", "(Taifas of Iberia)", "Emirate of Granada"],
  "kingdom-of-poland": ["Kingdom of Poland", "(Duchies of Poland)"], lithuania: ["Grand Duchy of Lithuania"],
  "polish-lithuanian": ["Polish-Lithuanian Commonwealth"], "savoy-sardinia": ["Kingdom of Sardinia"], "dutch-republic": ["(Dutch Republic)"],
  "kievan-rus": ["Kievan Rus'"], "golden-horde": ["Golden Horde"], muscovy: ["Grand Principality of Moscow"], "tsardom-russia": ["Tsardom of Russia"],
  "russian-empire": ["Russian Empire", "Russian Republic"], ussr: ["Union of Soviet Socialist Republics"], russia: ["Russian Federation"],
  ukraine: ["Ukraine"], belarus: ["Republic of Belarus"],
  "baltic-states": { ne: ["EST", "LVA", "LTU"], neFrom: 1991, label: "the Baltic states" },
  "south-caucasus": { ne: ["GEO", "ARM", "AZE"], neFrom: 1991, label: "Georgia, Armenia and Azerbaijan" },
  "post-yugoslav-states": { ne: ["SVN", "HRV", "BIH", "SRB", "MNE", "MKD", "KOS"], neFrom: 1992, label: "the former Yugoslav states" },
  "german-confederation": ["German Confederation"], "north-german-confederation": ["North German Confederation"], "german-empire": ["German Empire"],
  weimar: ["Weimar Republic"], "nazi-germany": ["Nazi Germany"], "west-germany": ["Federal Republic of Germany"], "east-germany": ["German Democratic Republic"],
  germany: ["Federated Republic of Germany"], "austria-hungary": ["Austrian Empire", "Austria-Hungary"], austria: ["Republic of Austria", "Second Republic of Austria"],
  hungary: ["Hungarian People's Republic", "Hungary", "Kingdom of Hungary"], czechoslovakia: ["Czechoslovakia"], "czech-republic": ["Czech Republic"], slovakia: ["Slovakia"],
  yugoslavia: ["Kingdom of Yugoslavia", "Socialist Federal Republic of Yugoslavia"], poland: ["Second Polish Republic", "Republic of Poland"],
  italy: ["Kingdom of Italy", "Republic of Italy"], belgium: ["Kingdom of Belgium"],
  // Middle East & Central Asia
  rashidun: ["Rashidun Caliphate"], umayyad: ["Umayyad Caliphate"], abbasid: ["Abbasid Caliphate", "Abbasid Caliphate/Buyid Dynasty"], fatimid: ["Fatimid Caliphate"],
  seljuk: ["Great Seljuk Empire"], ilkhanate: ["Ilkhanate"], timurid: ["Timurid Empire"], safavid: ["Safavid Dynasty"], afsharid: ["Afsharid Iran"],
  ottoman: ["Ottoman Empire"], turkey: ["Republic of Turkey"], iran: ["Qajar Dynasty", "Pahlavi Dynasty", "Islamic Republic of Iran"],
  iraq: ["Kingdom of Iraq", "Iraqi Republic", "Republic of Iraq"], "saudi-arabia": ["Kingdom of Saudi Arabia"], israel: ["State of Israel"],
  palestine: { ne: ["PSX"], neFrom: 1994, label: "the Palestinian territories" },
  "modern-egypt": ["Kingdom of Egypt", "Republic of Egypt", "United Arab Republic", "Arab Republic of Egypt"],
  syria: ["Second Syrian Republic", "United Arab Republic", "Republic of Syria", "Syrian Arab Republic"],
  afghanistan: ["Durrani Empire", "Emirate of Afghanistan", "Kingdom of Afghanistan", "Republic of Afghanistan", "Afghanistan"],
  kazakhstan: ["Kazakhstan"], xiongnu: ["Xiongnu"], yuezhi: ["Yuezhi"], "mongol-empire": ["Mongol Empire"],
  // South Asia
  indus: ["Indus Valley Civilization"], mahajanapadas: ["(Mahajanapadas)"], maurya: ["Maurya Empire"],
  kushan: ["Kushan Empire", ["Eastern Kushans", "Western Kushans"]], gupta: ["Gupta Empire"], pallavas: ["Late Pallava Empire"], chola: ["Chola Empire"],
  ghaznavids: ["Ghaznavid Empire"], ghurids: ["Ghurid Dynasty"], "delhi-sultanate": ["(Delhi Sultanate)"], vijayanagara: ["Vijayanagara Empire"],
  "deccan-sultanates": { c: [["Ahmadnagar Sultanate", "Berar Sultanate", "Bidar Sultanate", "Bijapur Sultanate", "Golconda Sultanate"]], label: "the Deccan sultanates" },
  mughal: ["Mughal Empire"], maratha: ["Maratha Empire"], "british-raj": ["British Raj"], india: ["Republic of India"],
  pakistan: ["Islamic Republic of Pakistan"], bangladesh: ["People's Republic of Bangladesh"],
  // East & Southeast Asia
  shang: ["Shang Dynasty"], zhou: ["Zhou Dynasty", "Eastern Zhou"], qin: ["Qin Dynasty"], han: ["Han Dynasty"], sui: ["Sui Dynasty"], tang: ["Tang Dynasty"],
  song: ["Northern Song", "Southern Song"], yuan: ["Yuan Dynasty"], ming: ["Ming Dynasty"], qing: ["Qing Dynasty"], roc: ["Republic of China"],
  prc: ["People's Republic of China"], gojoseon: ["Gojoseon"], "korea-three-kingdoms": { c: [["Goguryeo", "Baekje", "Silla"]], label: "the Three Kingdoms of Korea" },
  "unified-silla": ["Unified Silla"], goryeo: ["Goryeo"], joseon: ["Joseon"], "korean-empire": ["Korean Empire"],
  "north-korea": ["Democratic People's Republic of Korea"], "south-korea": ["Republic of Korea"],
  japan: ["Japan", "Empire of Japan", "Tokugawa Shogunate", "Warring States Japan", "Ashikaga Shogunate", "Kenmu Restoration", "Kamakura Shogunate", "Heian Japan", "Nara Japan", "Asuka Japan"],
  funan: ["Funan"], chenla: ["(Chenla)", ["Water Chenla", "Land Chenla"]], khmer: ["Khmer Empire"], cambodia: ["Khmer Rouge", "People's Republic of Kampuchea", "Kingdom of Cambodia"],
  srivijaya: ["Srivijaya"], singhasari: ["Singhasari"], majapahit: ["Majapahit"], ayutthaya: ["Ayutthaya Kingdom"], "dutch-east-indies": ["Dutch East Indies"],
  "french-indochina": ["French Indochina"], "north-vietnam": ["Democratic Republic of Vietnam"], "south-vietnam": ["Republic of Vietnam"],
  vietnam: ["Socialist Republic of Vietnam"], indonesia: ["Republic of Indonesia"], malaysia: ["Malaysia"], singapore: ["Republic of Singapore"],
  philippines: { c: ["Republic of the Philippines"], ne: ["PHL"], neFrom: 1898 },
  // Africa
  "ghana-empire": ["Ghana Empire"], mali: ["Mali Empire"], songhai: ["Songhai Empire"], kongo: ["Kingdom of Kongo"], ashanti: ["Ashanti Empire"],
  ethiopia: ["Ethiopian Empire", "Ethiopia"], "ethiopia-modern": ["Ethiopia"], "belgian-congo": ["Belgian Congo"], drc: ["Zaire", "Democratic Republic of the Congo"],
  "south-africa": { c: ["South Africa"], ne: ["ZAF"], neFrom: 1910 }, ghana: ["Ghana"], nigeria: ["Federal Republic of Nigeria"], kenya: ["Republic of Kenya"],
  sudan: ["Republic of Sudan"], "south-sudan": ["South Sudan"], eritrea: ["State of Eritrea"], algeria: ["People's Democratic Republic of Algeria"],
  rwanda: ["Republic of Rwanda"], tunisia: ["Republic of Tunisia"],
  // Americas & Oceania
  olmec: ["Olmec Civilization"], maya: ["Mayan City-States", "Later Mayan City-States"], teotihuacan: ["Teotihuacan"], aztec: ["Aztec Triple Alliance"], inca: ["Inca Empire"],
  usa: ["United States of America"], canada: ["Canada"], haiti: ["Empire of Haiti", "Republic of Haiti"],
  mexico: ["First Mexican Empire", "Federated Republic of Mexico", "Centralist Republic of Mexico", "Second Federal Republic of Mexico", "Second Mexican Empire", "Mexico"],
  "gran-colombia": ["Gran Colombia"], colombia: ["Republic of New Granada", "Granadine Confederation", "United States of Colombia", "Republic of Colombia"],
  venezuela: ["Venezuela"], ecuador: ["Republic of Ecuador"], peru: ["Republic of Peru"], chile: ["Republic of Chile"],
  argentina: ["Río de la Plata", "Argentine Confederation", "Argentine Republic"],
  brazil: ["Empire of Brazil", "Unitary State of Brazil", "Federated Republic of Brazil", "Brazilian Republic", "Republic of Brazil"], cuba: ["Communist Cuba"],
  australia: ["Commonwealth of Australia"], "new-zealand": { c: ["New Zealand"], ne: ["NZL"], neFrom: 1841 },
  // branches added November 2026 (restructure)
  uganda: ["Republic of Uganda"], zimbabwe: ["Republic of Zimbabwe", "Zimbabwe Rhodesia"], "mali-republic": ["Mali Federation", "Republic of Mali"],
  cameroon: ["Republic of Cameroon"], morocco: ["Morocco"], jordan: ["Kingdom of Jordan"],
  libya: ["Kingdom of Libya", "Libyan Arab Republic", "Great Socialist People's Libyan Arab Jamahiriya", "State of Libya"],
  "gulf-states": { c: [["Emirate of Kuwait", "State of Kuwait", "Bahrain", "Kingdom of Bahrain", "Qatar", "State of Qatar", "Trucial States",
    "United Arab Emirates", "Sultanate of Muscat and Oman", "Sultanate of Oman"]], label: "the Gulf states" },
  "sri-lanka": ["Kingdom of Polonnaruwa", "Ceylon kingdoms", "Sri Lanka"], nepal: ["Gorkha Kingdom", "Kingdom of Nepal", "Nepal"],
  "khedivate-egypt": ["Khedivate of Egypt"], "nguyen-vietnam": ["Nguyễn Dynasty"], zagwe: ["Zagwe Dynasty"],
  goths: { c: [["Goths", "Gothia"]], label: "the Goths" },
  // no faithful Cliopatria shape (too small, not a polity, or Cliopatria lacks it): keep the radius circle
  "hong-kong": null, tonga: null, "hawaii-kingdom": null, "spanish-philippines": null, erlitou: null, "neo-inca": null, eu: null,
  "indigenous-north-america": null, "indigenous-mesoamerica": null, "indigenous-andes": null, "indigenous-amazonia": null,
  "indigenous-caribbean": null, "indigenous-rights-movements": null,
  // not polities, or no faithful Cliopatria shape: keep the radius circle
  yamnaya: null, "bantu-expansion": null, "austronesian-expansion": null, renaissance: null, "germanic-peoples": null, picts: null, dmt: null, tichitt: null,
  denkyira: null, naqada: null, canaanites: null, "china-division": null, hellenistic: null, vedic: null, nok: null, caral: null, polynesians: null,
  "new-granada": null, "rio-de-la-plata": null, "new-spain": null, "viceroyalty-peru": null, "colonial-brazil": null, "thirteen-colonies": null,
  "congo-free-state": null, "kingdom-of-ireland": null, "mandatory-palestine": null, "allied-occupied-germany": null, "benin-kingdom": null,
  "great-zimbabwe": null, maori: null, vikings: null, asean: null, mercosur: null, oau: null, "african-union": null, holocaust: null, "civil-rights": null,
};

// ---------- data ----------
function loadTimeline() {
  const branches = [], events = [], geos = [], ops = [];
  for (const f of fs.readdirSync(path.join(here, "data")).filter((f) => f.endsWith(".js")).sort()) {
    const TL = { add(o) { branches.push(...(o.branches || [])); events.push(...(o.events || [])); }, cite() {}, enrich() {}, geo(id, o) { geos.push({ id, ...o }); }, image() {}, origin() {}, ...collector(ops, f) };
    try { vm.runInNewContext(fs.readFileSync(path.join(here, "data", f), "utf8"), { TL }, { filename: f }); } catch (err) { console.warn(`! ${f}: ${err.message}`); }
  }
  // Apply moves/patches/merges (restructure.mjs) so outlines follow each event's final branch.
  for (const e of applyRestructure({ branches, events, geos, images: [], origins: [], enrich: [], extraCites: [] }, ops)) console.warn("! " + e);
  const geo = new Map(geos.map(({ id, ...o }) => [id, o]));
  return { branches, events, geo };
}
async function ensureDownloads() {
  fs.mkdirSync(CACHE, { recursive: true });
  const get = async (url, file) => {
    console.log(`Downloading ${url}`);
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  };
  if (!fs.existsSync(CLIO)) {
    if (!fs.existsSync(CLIO_ZIP)) await get(`https://github.com/Seshat-Global-History-Databank/cliopatria/raw/${CLIO_VER}/cliopatria.geojson.zip`, CLIO_ZIP);
    execFileSync("unzip", ["-o", "-q", CLIO_ZIP, "cliopatria.geojson", "-d", CACHE]);
  }
  if (!fs.existsSync(NE)) await get("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson", NE);
}
// Cliopatria: one feature per line. Pass 1 reads properties only; pass 2 keeps geometry for the rows we use.
async function readClio(keep) {
  const rows = [];
  const rl = readline.createInterface({ input: fs.createReadStream(CLIO, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (let line of rl) {
    if (!line.startsWith('{ "type": "Feature"')) continue;
    line = line.replace(/,\s*$/, "").replace(/\]\s*\}\s*$/, "");
    const i = rows.length;
    if (keep && !keep.has(i)) { rows.push(null); continue; }
    const f = JSON.parse(line), p = f.properties;
    rows.push({ i, name: p.Name, from: p.FromYear, to: p.ToYear, type: p.Type, wiki: p.Wikipedia || "", area: p.Area, geom: keep ? f.geometry : null });
  }
  return rows;
}

// ---------- geometry ----------
const KM_PER_DEG = 111.32;
const ringArea = (r) => { let a = 0; for (let i = 0, n = r.length; i < n; i++) { const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % n]; a += x1 * y2 - x2 * y1; } return a / 2; }; // deg², + = counter-clockwise
const ringKm2 = (r) => { const lat = r.reduce((s, p) => s + p[1], 0) / r.length; return Math.abs(ringArea(r)) * KM_PER_DEG * KM_PER_DEG * Math.cos(lat * Math.PI / 180); };
function dp(pts, tol) { // Douglas–Peucker on a closed ring, longitude scaled by cos(latitude)
  const n = pts.length; if (n < 5) return pts;
  const k = Math.cos((pts.reduce((s, p) => s + p[1], 0) / n) * Math.PI / 180);
  // split the ring at its two farthest-apart points so the closed ring simplifies cleanly
  let far = 0, fd = -1; for (let i = 1; i < n; i++) { const d = ((pts[i][0] - pts[0][0]) * k) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const keep = new Uint8Array(n); keep[0] = keep[far] = 1;
  const stack = [[0, far], [far, n]];
  while (stack.length) {
    const [a, b] = stack.pop(), pa = pts[a], pb = pts[b % n];
    const dx = (pb[0] - pa[0]) * k, dy = pb[1] - pa[1], L = Math.hypot(dx, dy) || 1e-12;
    let mi = -1, md = tol;
    for (let i = a + 1; i < b; i++) { const ex = (pts[i][0] - pa[0]) * k, ey = pts[i][1] - pa[1], d = Math.abs(ex * dy - ey * dx) / L; if (d > md) { md = d; mi = i; } }
    if (mi >= 0) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// Exterior rings of a GeoJSON geometry (holes are dropped: at globe size they are invisible or misleading).
const exteriors = (g) => (!g ? [] : g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : []);
function pointIn(r, x, y) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; }
// Inside or within ~`km` of the shape (the event's point may sit on a coast that simplification moved).
function nearShape(rings, lat, lon, km = 80) {
  const pts = [[lon, lat]];
  for (let b = 0; b < 360; b += 45) { const t = b * Math.PI / 180; pts.push([lon + (km / (KM_PER_DEG * Math.max(0.2, Math.cos(lat * Math.PI / 180)))) * Math.sin(t), lat + (km / KM_PER_DEG) * Math.cos(t)]); }
  return pts.some(([x, y]) => rings.some((r) => pointIn(r, x, y)));
}
// Google polyline-style encoding of integer tenths: first point absolute, then deltas; ~1–2 chars per number.
function encode(ints) { let s = ""; for (let v of ints) { v = v < 0 ? ~(v << 1) : v << 1; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } s += String.fromCharCode(v + 63); } return s; }

// rows -> one shape: simplified, small pieces dropped, clockwise, quantized and encoded; area and centroid.
function makeShape(rowList, neFeatures) {
  let polys = [];
  for (const r of rowList) for (const ring of exteriors(r.geom)) polys.push(ring.map(([x, y]) => [x, y]));
  for (const f of neFeatures || []) for (const ring of exteriors(f.geometry)) polys.push(ring.map(([x, y]) => [x, y]));
  polys = polys.map((p) => { if (p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) p = p.slice(0, -1); return p; }).filter((p) => p.length >= 3);
  const full = polys.map((p) => ({ p, km2: ringKm2(p) })).sort((a, b) => b.km2 - a.km2);
  const total = full.reduce((s, x) => s + x.km2, 0);
  if (!full.length || total < MIN_SHAPE_KM2) return null;
  const rings = [], enc = [], raw = [];
  let cx = 0, cy = 0, cz = 0;
  for (const [n, { p, km2 }] of full.entries()) {
    if (n > 0 && km2 < MIN_POLY_KM2) continue;
    raw.push(p);
    let s = dp(p, TOL).map(([x, y]) => [Math.round(x * Q), Math.round(y * Q)]);
    s = s.filter((q, i) => i === 0 || q[0] !== s[i - 1][0] || q[1] !== s[i - 1][1]);
    if (s.length > 1 && s[0][0] === s[s.length - 1][0] && s[0][1] === s[s.length - 1][1]) s.pop();
    if (s.length < 3) continue;
    if (ringArea(s) > 0) s.reverse(); // clockwise (interior on the right of travel), like the globe's land rings
    const ints = []; let px = 0, py = 0;
    for (const [x, y] of s) { ints.push(x - px, y - py); px = x; py = y; }
    enc.push(encode(ints)); rings.push(s);
    // centroid: area-weighted mean of the ring's vertices on the unit sphere (good enough to aim the globe)
    let vx = 0, vy = 0, vz = 0;
    for (const [x, y] of s) { const la = (y / Q) * Math.PI / 180, lo = (x / Q) * Math.PI / 180; vx += Math.cos(la) * Math.cos(lo); vy += Math.cos(la) * Math.sin(lo); vz += Math.sin(la); }
    const h = Math.hypot(vx, vy, vz) || 1; cx += (vx / h) * km2; cy += (vy / h) * km2; cz += (vz / h) * km2;
  }
  if (!enc.length) return null;
  const c = [Math.round(Math.atan2(cz, Math.hypot(cx, cy)) * 180 / Math.PI * 10) / 10, Math.round(Math.atan2(cy, cx) * 180 / Math.PI * 10) / 10];
  return { enc, c, km2: Math.round(total), raw };
}

// ---------- names ----------
const normName = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const bare = (s) => String(s || "").replace(/^\((.*)\)$/, "$1").replace(/\s*\([^)]*\)\s*/g, " ").trim(); // "(Holy Roman Empire)" -> "Holy Roman Empire"; "Song (state)" -> "Song"
const ARTICLE = /\b(Empire|empire|Dynasty|dynasty|Kingdom|Kingdoms|Caliphate|Sultanate|sultanates|Emirate|Republic|Confederation|Confederacy|Union|Commonwealth|Khanate|Khaganate|Horde|Ilkhanate|Shogunate|shogunate|Federation|States|states|State|Raj|League|Netherlands|Philippines|Indies|civilization|Civilization|Civilisation|Crown|Duchy|Duchies|Principality|Tsardom|Directory|Consulate|Dominion|Taifas|Hittites|Etruscans|Xiongnu|Yuezhi|Mahajanapadas|Olmecs|Visigoths|territories)\b/;
const withArticle = (s) => (/^the /i.test(s) || !ARTICLE.test(s) ? s : "the " + s);
// Wikipedia phrases make the nicest names ("Ming dynasty", "Soviet Union"), except when they name an article about
// something else (a period, a family, a document); then the Cliopatria name is used.
const BAD_WIKI = /^(History of|Testament)|\b(family|period|Period)$|^(Polis|Taifa|Restoration)$/;
const cleanName = (n) => bare(n).replace(/ Dynasty\b/g, " dynasty").replace(/ Shogunate\b/g, " shogunate").replace(/^Federated Republic of Germany$/, "Germany").replace(/^Communist Cuba$/, "Cuba");
function displayName(rowsInShape, label) {
  if (label) return label;
  const names = [...new Set(rowsInShape.map((r) => { const w = bare((r.wiki || "").split(";")[0]); return w && !BAD_WIKI.test(w) ? w : cleanName(r.name); }))];
  return withArticle(names.join(" and "));
}

// ---------- main ----------
await ensureDownloads();
const { branches, events, geo } = loadTimeline();
const BR = new Map(branches.map((b) => [b.id, b]));
console.log("Reading Cliopatria properties…");
const props = await readClio(null);
const byName = new Map();
for (const r of props) if (r.type === "POLITY") (byName.get(r.name) || byName.set(r.name, []).get(r.name)).push(r);
for (const list of byName.values()) list.sort((a, b) => a.from - b.from);
const neAll = JSON.parse(fs.readFileSync(NE, "utf8")).features;
const neBy = new Map(neAll.map((f) => [f.properties.ADM0_A3, f]));

const problems = [];
// Resolve each branch's spec: an ordered list of elements, each element a list of Cliopatria names drawn together.
const specs = new Map(), how = new Map();
for (const b of branches) {
  const g = geo.get(b.id);
  if (!g || (g.scope !== "region" && g.scope !== "place")) continue;
  let spec = Object.prototype.hasOwnProperty.call(TABLE, b.id) ? TABLE[b.id] : undefined;
  if (spec === null) { how.set(b.id, "excluded"); continue; }
  if (spec === undefined) {
    // auto: exact (normalized) name, unique, covering >= half the branch's span inside Cliopatria's range
    const cands = [...byName.keys()].filter((n) => normName(n) === normName(b.name) && !n.startsWith("("));
    if (cands.length !== 1) { how.set(b.id, cands.length ? "ambiguous" : "unmatched"); continue; }
    const s0 = Math.max(b.start, -3400), s1 = Math.min(b.end ?? NOW, 2024);
    const cov = byName.get(cands[0]).reduce((s, r) => s + Math.max(0, Math.min(r.to + 1, s1) - Math.max(r.from, s0)), 0);
    if (!(s1 > s0) || cov < 0.5 * (s1 - s0)) { how.set(b.id, "unmatched"); continue; }
    spec = [cands[0]]; how.set(b.id, "auto");
  } else how.set(b.id, "table");
  if (Array.isArray(spec)) spec = { c: spec };
  const els = (spec.c || []).map((e) => (Array.isArray(e) ? e : [e]));
  for (const e of els) for (const n of e) if (!byName.has(n)) problems.push(`TABLE ${b.id}: no Cliopatria polity named "${n}"`);
  specs.set(b.id, { els: els.map((e) => e.filter((n) => byName.has(n))).filter((e) => e.length), ne: spec.ne || null, neFrom: spec.neFrom, label: spec.label });
}

// Segments per branch: [effFrom, effTo, rowFrom, rowTo, shapeKey]. Elementary intervals between all row boundaries;
// in each, the first element (in priority order) with a row covering it supplies the shape.
const shapeRows = new Map(); // shapeKey -> { rows: [row indices], ne: [codes], label }
const branchSegs = new Map();
for (const [id, sp] of specs) {
  const b = BR.get(id), bStart = Math.floor(b.start), bEnd = Math.floor(b.end ?? NOW);
  const segs = [];
  const bounds = new Set();
  for (const e of sp.els) for (const n of e) for (const r of byName.get(n)) { bounds.add(r.from); bounds.add(r.to + 1); }
  const bs = [...bounds].sort((x, y) => x - y);
  for (let k = 0; k + 1 < bs.length; k++) {
    const a = bs[k], z = bs[k + 1] - 1;
    if (z < bStart - EDGE || a > bEnd + EDGE) continue;
    for (const e of sp.els) {
      const rows = e.flatMap((n) => byName.get(n).filter((r) => r.from <= a && r.to >= z));
      if (!rows.length) continue;
      const key = "c:" + rows.map((r) => r.i).sort((x, y) => x - y).join(",");
      if (!shapeRows.has(key)) shapeRows.set(key, { rows: rows.map((r) => r.i), label: e.length > 1 ? sp.label : null });
      const rf = Math.max(...rows.map((r) => r.from)), rt = Math.min(...rows.map((r) => r.to));
      const last = segs[segs.length - 1];
      if (last && last[4] === key && last[1] === a - 1) last[1] = z; else segs.push([a, z, Math.max(a, rf), Math.min(z, rt), key]);
      break;
    }
  }
  // keep segments overlapping the branch; let the first/last stretch EDGE years over the branch's own start/end
  let out = segs.filter((s) => s[1] >= bStart && s[0] <= bEnd);
  if (!out.length) {
    const before = segs.filter((s) => s[1] < bStart).pop(), after = segs.find((s) => s[0] > bEnd);
    out = [before, after].filter(Boolean);
  }
  out = out.map((s) => [...s]);
  if (out.length) {
    const f = out[0], l = out[out.length - 1];
    if (f[0] > bStart && f[0] - bStart <= EDGE) f[0] = bStart;
    if (l[1] < bEnd && bEnd - l[1] <= EDGE) l[1] = bEnd;
    for (const s of out) { s[0] = Math.max(s[0], bStart - EDGE); s[1] = Math.min(s[1], bEnd + EDGE); s[2] = Math.max(s[0], Math.min(s[2], s[1])); s[3] = Math.max(s[2], Math.min(s[3], s[1])); }
  }
  // present-day borders where the table says they are a fair stand-in and Cliopatria has nothing
  if (sp.ne) {
    const key = "n:" + sp.ne.join(",");
    if (!shapeRows.has(key)) shapeRows.set(key, { rows: [], ne: sp.ne, label: sp.label });
    const from = Math.max(bStart, sp.neFrom ?? bStart), to = bEnd + EDGE, gaps = [];
    let cur = from;
    for (const s of [...out].sort((x, y) => x[0] - y[0])) { if (s[0] > cur) gaps.push([cur, Math.min(s[0] - 1, to)]); cur = Math.max(cur, s[1] + 1); }
    if (cur <= to) gaps.push([cur, to]);
    for (const [a, z] of gaps) if (z >= a) out.push([a, z, a, z, key]);
    out.sort((x, y) => x[0] - y[0]);
  }
  branchSegs.set(id, out);
}

// Label route: a region event whose label exactly names a polity existing that year (wiki phrase or name).
const labelIdx = new Map();
for (const r of props) {
  if (r.type !== "POLITY") continue;
  for (const k of new Set([normName(bare(r.name)), ...String(r.wiki).split(";").map((w) => normName(bare(w)))])) if (k) (labelIdx.get(k) || labelIdx.set(k, []).get(k)).push(r);
}
function labelRows(label, y) {
  const rows = (labelIdx.get(normName(label)) || []).filter((r) => r.from <= y && r.to >= y);
  const names = [...new Set(rows.map((r) => r.name))];
  // a plain polity and its "(group)" twin (members included) count as one: use the group
  if (names.length === 2 && names.some((n) => n === `(${names.find((m) => !m.startsWith("("))})`)) return rows.filter((r) => r.name.startsWith("("));
  return names.length === 1 ? rows.filter((r) => r.name === names[0]) : [];
}

// Pass 2: geometry for every row any segment or label match could use.
const need = new Set();
for (const v of shapeRows.values()) v.rows.forEach((i) => need.add(i));
const evYear = (e) => Math.floor(e.y);
const labelPlans = new Map();
for (const e of events) {
  const g = geo.get(e.id);
  if (!g || g.scope !== "region" || e.y < -3400 || e.y > 2024 + EDGE) continue;
  const rows = labelRows(g.label, Math.min(evYear(e), 2024));
  if (rows.length) { labelPlans.set(e.id, rows); rows.forEach((r) => need.add(r.i)); }
}
console.log(`Reading geometry for ${need.size} rows…`);
const full = await readClio(need);

const shapes = [], shapeIdx = new Map();
function shapeFor(key) {
  if (shapeIdx.has(key)) return shapeIdx.get(key);
  const v = shapeRows.get(key), rows = v.rows.map((i) => full[i]);
  const ne = (v.ne || []).map((c) => neBy.get(c)).filter(Boolean);
  if (v.ne && ne.length !== v.ne.length) problems.push(`Natural Earth codes missing: ${v.ne.join(",")}`);
  const s = makeShape(rows, ne);
  if (!s) { shapeIdx.set(key, -1); return -1; }
  const name = v.ne ? (v.label || withArticle(ne.map((f) => f.properties.NAME).join(" and "))) : displayName(rows, v.label);
  shapes.push({ n: name, s: v.ne ? "n" : "c", c: s.c, a: s.km2, r: s.enc, _raw: s.raw });
  shapeIdx.set(key, shapes.length - 1);
  return shapes.length - 1;
}

// Branch index: segments with a usable shape.
const outB = {};
for (const [id, segs] of branchSegs) {
  const list = [];
  for (const [ef, et, rf, rt, key] of segs) { const s = shapeFor(key); if (s >= 0) list.push([ef, et, rf, rt, s]); }
  if (list.length) outB[id] = list;
}
const segAt = (id, y) => (outB[id] || []).find((s) => s[0] <= y && s[1] >= y) || null;
const dist = (a, b) => { const r = Math.PI / 180, d = Math.sin(a.lat * r) * Math.sin(b.lat * r) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.cos((a.lon - b.lon) * r); return Math.acos(Math.max(-1, Math.min(1, d))) * 6371; };

// Event index: id -> [shape, mode (1 full, 2 context), year for the caption]
const outE = {}, stat = { full: 0, ctx: 0, label: 0 };
for (const e of events) {
  const g = geo.get(e.id), b = BR.get(e.branch), bg = b && geo.get(b.id);
  if (!g || (g.scope !== "region" && g.scope !== "place")) continue;
  const y = evYear(e);
  let pick = null;
  const seg = segAt(e.branch, y);
  if (seg) {
    const sh = shapes[seg[4]], cy = Math.max(seg[2], Math.min(seg[3], y));
    const inside = nearShape(sh._raw, g.lat, g.lon);
    const same = g.scope === "region" && bg && (normName(g.label) === normName(bg.label) || normName(g.label) === normName(b.name) || normName(g.label) === normName(bare(sh.n.replace(/^the /, ""))) ||
      (bg.scope === "region" && g.r >= 0.8 * bg.r && dist(g, bg) < 300));
    if (same && inside) pick = [seg[4], 1, cy];
    else if (inside) pick = [seg[4], 2, cy];
  }
  if ((!pick || pick[1] !== 1) && labelPlans.has(e.id)) {
    const rows = labelPlans.get(e.id), key = "c:" + rows.map((r) => r.i).sort((x, z) => x - z).join(",");
    if (!shapeRows.has(key)) shapeRows.set(key, { rows: rows.map((r) => r.i), label: null });
    const s = shapeFor(key);
    if (s >= 0 && nearShape(shapes[s]._raw, g.lat, g.lon)) {
      const rf = Math.max(...rows.map((r) => r.from)), rt = Math.min(...rows.map((r) => r.to));
      pick = [s, 1, Math.max(rf, Math.min(rt, y))]; stat.label++;
    }
  }
  if (pick) { outE[e.id] = pick; stat[pick[1] === 1 ? "full" : "ctx"]++; }
}

// ---------- write ----------
const used = new Set([...Object.values(outB).flatMap((l) => l.map((s) => s[4])), ...Object.values(outE).map((p) => p[0])]);
const remap = new Map(); const finalShapes = [];
shapes.forEach((s, i) => { if (used.has(i)) { remap.set(i, finalShapes.length); const { _raw, ...rest } = s; finalShapes.push(rest); } });
for (const l of Object.values(outB)) for (const s of l) s[4] = remap.get(s[4]);
for (const p of Object.values(outE)) p[0] = remap.get(p[0]);
const payload = {
  v: 1, built: new Date().toISOString().slice(0, 10), q: Q,
  attr: {
    c: "Cliopatria (CC BY 4.0)",
    cFull: `Polity outline: Cliopatria ${CLIO_VER}, Seshat Global History Databank (Scientific Data 2025, doi:10.1038/s41597-025-04516-9; data doi:10.5281/zenodo.13363120), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Simplified for this globe; small islands dropped.`,
    n: "Natural Earth (public domain)",
    nFull: "Country borders: Natural Earth 1:50m admin-0 countries v5.1.2 (public domain), simplified. Present-day borders, shown as a stand-in.",
  },
  shapes: finalShapes, b: outB, e: outE,
};
const js = `// Generated by build-outlines.mjs on ${payload.built} — do not edit. Polity outlines for the globe in timeline.html.\n` +
  `// ${payload.attr.cFull}\n// ${payload.attr.nFull}\nwindow.TL_OUTLINES = ${JSON.stringify(payload)};\n`;
fs.writeFileSync(path.join(here, "outlines.js"), js);

// ---------- report ----------
const counts = {}; for (const v of how.values()) counts[v] = (counts[v] || 0) + 1;
const located = events.filter((e) => { const g = geo.get(e.id); return g && (g.scope === "region" || g.scope === "place"); });
const regionEv = located.filter((e) => geo.get(e.id).scope === "region");
console.log(`\nBranches (place/region scope): ${how.size} — table ${counts.table || 0}, auto ${counts.auto || 0}, excluded ${counts.excluded || 0}, unmatched ${counts.unmatched || 0}, ambiguous ${counts.ambiguous || 0}`);
console.log(`Branches with an outline: ${Object.keys(outB).length}`);
console.log(`Located events: ${located.length} (${regionEv.length} region) — outline in full: ${stat.full} (${stat.label} by label), as context: ${stat.ctx}, none: ${located.length - stat.full - stat.ctx}`);
console.log(`Region events with a full outline: ${regionEv.filter((e) => outE[e.id] && outE[e.id][1] === 1).length} of ${regionEv.length}`);
console.log(`Shapes: ${finalShapes.length}, outlines.js ${(js.length / 1024).toFixed(0)} KB`);
for (const [id, v] of how) if (v === "auto") console.log(`  auto-matched ${id} -> ${specs.get(id).els.flat().join(", ")}`);
for (const [id, v] of how) if (v === "table" && !outB[id]) console.log(`  no usable shape: ${id}`);
if (VERBOSE) {
  for (const [id, l] of Object.entries(outB)) console.log(`  ${id}: ${l.map((s) => `${s[0]}..${s[1]} ${finalShapes[s[4]].n}`).join(" | ")}`);
  for (const [id, v] of how) if (v === "unmatched" || v === "ambiguous") console.log(`  ${v}: ${id} (${BR.get(id).name})`);
}
problems.forEach((p) => console.log("⚠", p));
