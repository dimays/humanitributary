// Restructuring operations, so branches can be split, merged and re-dated from a data file instead of by editing the
// files that originally defined them. Used by build.mjs and build-outlines.mjs.
//
//   TL.move("event-id", "new-branch-id")          the event now sits on another branch
//   TL.patch("branch-or-event-id", { start, end, startWhen, endWhen, name, text, region, parents, into, addCites })
//                                                  overwrite those fields (addCites: citations appended to `cites`)
//   TL.merge("old-branch-id", "into-branch-id")   every reference to the old branch now points at the other one
//                                                  (events, links, parents/into, origin links, citations); the old
//                                                  branch is removed, and its location/image move over if the target
//                                                  has none.
//
// Order of application: patches, then merges, then moves. Each op records the data file it came from.

export function collector(ops, file) {
  return {
    move(id, branch) { ops.push({ op: "move", id, branch, _file: file }); },
    patch(id, fields) { ops.push({ op: "patch", id, fields, _file: file }); },
    merge(from, into) { ops.push({ op: "merge", from, into, _file: file }); },
  };
}

const PATCHABLE = new Set(["start", "end", "startWhen", "endWhen", "name", "text", "region", "parents", "into", "title", "when", "y", "imp", "link"]);

// state: { branches, events, geos, images, origins, enrich, extraCites } — arrays of plain objects (mutated in place).
// Returns a list of error strings.
export function applyRestructure(state, ops) {
  const errors = [];
  const { branches, events } = state;
  const byId = () => new Map([...branches, ...events].map((x) => [x.id, x]));
  let ids = byId();
  for (const o of ops.filter((o) => o.op === "patch")) {
    const x = ids.get(o.id);
    if (!x) { errors.push(`${o._file}: TL.patch references unknown id "${o.id}"`); continue; }
    for (const [k, v] of Object.entries(o.fields || {})) {
      if (k === "addCites") { x.cites = [...(x.cites || []), ...v]; continue; }
      if (!PATCHABLE.has(k)) { errors.push(`${o._file}: TL.patch ${o.id}: field "${k}" is not patchable`); continue; }
      x[k] = v;
    }
  }
  for (const o of ops.filter((o) => o.op === "merge")) {
    const from = branches.find((b) => b.id === o.from), into = branches.find((b) => b.id === o.into);
    if (!from || !into) { errors.push(`${o._file}: TL.merge ${o.from} → ${o.into}: unknown branch`); continue; }
    const re = (v) => (v === o.from ? o.into : v);
    for (const e of events) { e.branch = re(e.branch); if (e.link) { e.link = re(e.link); if (e.link === e.branch) delete e.link; } }
    for (const b of branches) {
      for (const k of ["parents", "into"]) if (Array.isArray(b[k])) b[k] = [...new Set(b[k].map(re))].filter((x) => x !== b.id);
    }
    for (const g of state.origins) for (const l of g.links || []) l.id = re(l.id);
    for (const g of state.origins) if (g.links) g.links = g.links.filter((l, i, a) => l.id !== g.id && a.findIndex((m) => m.id === l.id) === i);
    for (const c of state.extraCites) c.id = re(c.id);
    for (const en of state.enrich) for (const c of en.connections || []) c.id = re(c.id);
    for (const key of ["geos", "images"]) {
      const list = state[key];
      const hasTarget = list.some((g) => g.id === o.into);
      for (let i = list.length - 1; i >= 0; i--) if (list[i].id === o.from) { if (!hasTarget) list[i].id = o.into; else list.splice(i, 1); }
    }
    for (const key of ["origins", "enrich"]) { const list = state[key]; for (let i = list.length - 1; i >= 0; i--) if (list[i].id === o.from) list.splice(i, 1); }
    into.cites = [...(into.cites || []), ...(from.cites || []).filter((c) => !(into.cites || []).some((d) => d.u === c.u))];
    branches.splice(branches.indexOf(from), 1);
  }
  ids = byId();
  const moved = new Map();
  for (const o of ops.filter((o) => o.op === "move")) {
    const e = events.find((x) => x.id === o.id);
    if (!e) { errors.push(`${o._file}: TL.move references unknown event "${o.id}"`); continue; }
    if (!branches.some((b) => b.id === o.branch)) { errors.push(`${o._file}: TL.move ${o.id} → unknown branch "${o.branch}"`); continue; }
    if (moved.has(o.id) && moved.get(o.id) !== o.branch) { errors.push(`${o._file}: TL.move ${o.id} conflicts with an earlier move to ${moved.get(o.id)}`); continue; }
    moved.set(o.id, o.branch);
    e.branch = o.branch;
    if (e.link === e.branch) delete e.link;
  }
  return errors;
}
