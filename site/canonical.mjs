// The one canonical shape of the timeline's content: every branch and event with its keys in a fixed order, and only
// the keys the schema knows (SCHEMA.md). build.mjs writes this into timeline.html and into `--dump-json`, and
// `manage.py publish` writes the same shape from Postgres (publish/export.py mirrors the key lists below), so a build
// from data/*.js and a build from a published snapshot of the same content are byte-identical.
//
// Array order is kept as given: branches and events in file order (the page breaks ties in its sorts by it), and every
// list (cites, parents, links, images, connections) in the order its author wrote it.

export const KEYS = {
  branch: ["id", "name", "region", "start", "end", "startWhen", "endWhen", "parents", "into", "text", "cites", "origin", "geo", "images", "why", "connections", "whyCites"],
  event: ["id", "branch", "y", "end", "when", "title", "text", "imp", "link", "cites", "geo", "images", "why", "connections", "whyCites"],
  cite: ["t", "u", "k"],
  origin: ["note", "links", "cites"],
  originLink: ["id", "how", "note"],
  geo: ["scope", "lat", "lon", "r", "label", "src", "scale"],
  image: ["src", "w", "h", "title", "credit", "license", "page"],
  connection: ["id", "note"],
};

// null is kept only where it means something: a branch's `end` (it continues to today). Anywhere else null is the
// same as absent to the page (an `endWhen: null` reads like no endWhen), so it's left out.
const NULL_MEANS_SOMETHING = new Set(["branch.end"]);

// Keys dropped because the schema doesn't know them, e.g. "connection.link" (counted, so the build can say so).
export const dropped = new Map();

function pick(obj, kind) {
  const out = {};
  for (const k of KEYS[kind]) {
    if (obj[k] === undefined || (obj[k] === null && !NULL_MEANS_SOMETHING.has(`${kind}.${k}`))) continue;
    out[k] = obj[k];
  }
  for (const k of Object.keys(obj)) {
    if (KEYS[kind].includes(k) || k === "_file" || obj[k] === undefined) continue;
    dropped.set(`${kind}.${k}`, (dropped.get(`${kind}.${k}`) || 0) + 1);
  }
  return out;
}

const cites = (list) => list.map((c) => pick(c, "cite"));

function entry(x, kind) {
  const o = pick(x, kind);
  for (const k of ["cites", "whyCites"]) if (Array.isArray(o[k])) o[k] = cites(o[k]);
  if (o.origin) o.origin = { ...pick(o.origin, "origin"), links: (o.origin.links || []).map((l) => pick(l, "originLink")), cites: cites(o.origin.cites || []) };
  if (o.geo) o.geo = pick(o.geo, "geo");
  if (Array.isArray(o.images)) o.images = o.images.map((im) => pick(im, "image"));
  if (Array.isArray(o.connections)) o.connections = o.connections.map((c) => pick(c, "connection"));
  return o;
}

export function canonicalContent({ branches, events }) {
  return { branches: branches.map((b) => entry(b, "branch")), events: events.map((e) => entry(e, "event")) };
}
