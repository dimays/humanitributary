"""Can an entity be a branch, and under which parent? The NEW-BRANCH rule's two questions (governance/rules.py,
docs/adr/0021-ingestion-tuning.md), answered from Wikidata statements alone: deterministic, no co-occurrence.

A branch is a long-lived lane of history. An entity that keeps coming up in the news can become one only if it is

- a sovereign state or a historical polity (P31 a country / sovereign state / historical country / empire …, or a
  polity with a dissolution date);
- a people (an ethnic group, a people, a tribe);
- a long-running conflict or movement: a war, armed conflict, rebellion, crisis … or a social movement, at least
  LONG_RUNNING_YEARS from its start (P580 / P571) to its end (P582 / P576) or today;
- an organization of international scope (an intergovernmental or international organization, an international
  court).

Never a subnational unit (an instance, through any chain of subclasses, of a first-level administrative division:
Florida is a "U.S. state", a subclass of one) and never a political party. Elections, single operations and other
one-off events aren't branches either: they are events on one.

The parent is chosen from the entity's own relations, in this order, the first that names exactly one branch winning:

1. succession: what it replaces (P1365) or follows (P155), up to MAX_HOPS steps back (the Netherlands → the United
   Kingdom of the Netherlands → … → the Dutch Republic);
2. part of (P361), up to MAX_HOPS steps up, a branch alive at the entity's start;
3. its country (P17), for anything that isn't itself a state, when exactly one of its countries is a branch;
4. its class (P279 subclass of, then P31 instance of), one step.

Otherwise there is no parent and the proposal says it needs review: a wrong parent is worse than none.
"""

from datetime import date

PARTY = "Q7278"
FIRST_LEVEL_DIVISION = "Q10864048"
# Without the relations read yet (Entity.relations), these classes still settle it.
SUBNATIONAL_CLASSES = {FIRST_LEVEL_DIVISION, "Q35657", "Q107390", "Q1763527", "Q34876", "Q5852411"}  # U.S. state, federated state, constituent country, province, state of Australia
STATE_CLASSES = {
    "Q3624078", "Q6256", "Q6726158", "Q7275", "Q112099",  # sovereign state, country, independent country, state, island country
    "Q3024240", "Q48349", "Q28171280", "Q417175", "Q1250464", "Q133442", "Q164142",  # historical country, empire, ancient civilization, kingdom, realm, city-state, protectorate
}
PEOPLE_CLASSES = {"Q41710", "Q2472587", "Q133311", "Q33829"}  # ethnic group, people, tribe, human population
CONFLICT_CLASSES = {
    "Q198", "Q8465", "Q350604", "Q180684", "Q11422542", "Q124734", "Q5791104", "Q154605", "Q474138", "Q7883019",
    # war, civil war, armed conflict, conflict, international conflict, rebellion, international crisis, total war,
    # war of aggression, undeclared war
    "Q686984", "Q467033",  # civil disorder, feud (Haiti's gang war)
}
INTERNATIONAL_ORG_CLASSES = {"Q245065", "Q484652", "Q1262438", "Q1335818"}  # intergovernmental / international organization, international court, supranational union
LONG_RUNNING_YEARS = 2.0
MAX_HOPS = 3


def _year(v) -> float | None:
    if not v:
        return None
    try:
        d = date.fromisoformat(str(v).lstrip("+")[:10])
        return d.year + (d.timetuple().tm_yday - 1) / 365.25
    except ValueError:
        try:
            return float(str(v).lstrip("+")[:4])
        except ValueError:
            return None


def lifetime(e, today: date) -> tuple[float | None, float]:
    f = e.facts or {}
    start = _year(f.get("P580") or f.get("P571"))
    end = _year(f.get("P582") or f.get("P576"))
    now = today.year + (today.timetuple().tm_yday - 1) / 365.25
    return start, end if end is not None else now


def can_be_branch(e, today: date) -> tuple[bool, str]:
    """→ (yes or no, why), from the entity's classes (P31), facts and relations."""
    from .wikidata import MOVEMENT_CLASSES

    p31 = set((e.facts or {}).get("P31", []))
    is_a = set((e.relations or {}).get("is_a", []))
    if PARTY in p31 | is_a:
        return False, "a political party"
    if FIRST_LEVEL_DIVISION in is_a or p31 & SUBNATIONAL_CLASSES:
        return False, "a subnational unit"
    if p31 & STATE_CLASSES or (e.kind == "polity" and (e.facts or {}).get("P576")):
        return True, "a state or historical polity"
    if p31 & PEOPLE_CLASSES:
        return True, "a people"
    if p31 & INTERNATIONAL_ORG_CLASSES:
        return True, "an international organization"
    if p31 & (CONFLICT_CLASSES | MOVEMENT_CLASSES):
        start, end = lifetime(e, today)
        if start is None:
            return False, "a conflict or movement with no start date"
        if end - start < LONG_RUNNING_YEARS:
            return False, f"a conflict or movement of {end - start:.1f} years (a branch needs {LONG_RUNNING_YEARS:g})"
        return True, "a long-running conflict or movement"
    noun = {"org": "an organization", "event": "an event", "person": "a person", "place": "a place", "polity": "a polity", "work": "a work"}.get(e.kind, f"a {e.kind}")
    return False, f"{noun} that isn't a state, a people, a long-running conflict or movement, or an international organization"


def _alive(start, end, y) -> bool:
    return y is None or (start - 1 <= y and (end is None or y <= end + 1))


def _walk(e, props, lookup, hops):
    """Breadth-first along `props` from e: yields (hop, qid, how) level by level."""
    level, seen = [e.qid], {e.qid}
    for hop in range(1, hops + 1):
        nxt = []
        for q in level:
            x = lookup(q)
            if x is None:
                continue
            for p in props:
                for v in (x.relations or {}).get(p, []):
                    if v not in seen:
                        seen.add(v)
                        nxt.append((v, f"{p} {v}" + (f" (via {q})" if q != e.qid else "")))
        if not nxt:
            return
        yield hop, nxt
        level = [v for v, _ in nxt]


def parent(e, by_qid: dict, lookup, today: date) -> tuple[str | None, str]:
    """The branch to put a new branch under. by_qid: Router.by_qid ({qid: [(branch id, slug, weight, start, end)]});
    lookup(qid) → Entity or None (with facts and relations). → (slug or None, how it was chosen)."""
    start, _ = lifetime(e, today)

    def slugs(qids, *, alive=True, before=False):
        out = set()
        for q in qids:
            for _, slug, _, b0, b1 in by_qid.get(q, ()):
                if before and start is not None and b0 > start:
                    continue  # a predecessor started before it
                if alive and not _alive(b0, b1, start):
                    continue
                out.add(slug)
        return sorted(out)

    for props, alive, before, label in ((("P1365", "P155"), False, True, "succession"), (("P361",), True, False, "part of")):
        for _, level in _walk(e, props, lookup, MAX_HOPS):
            found = slugs([q for q, _ in level], alive=alive, before=before)
            if len(found) == 1:
                how = next(h for q, h in level if found[0] in slugs([q], alive=alive, before=before))
                return found[0], f"{label}: {how}"
            if len(found) > 1:
                break  # ambiguous at this distance: don't guess further up
    if not ((e.facts or {}).get("P31") and set(e.facts["P31"]) & STATE_CLASSES):
        countries = [c for c in (e.facts or {}).get("P17", []) if c != e.qid]
        found = slugs(countries)
        if len(found) == 1:
            return found[0], "country (P17)"
    for p in ("P279", "P31"):
        src = (e.relations or {}).get(p, []) if p == "P279" else (e.facts or {}).get(p, [])
        found = slugs(src)
        if len(found) == 1:
            return found[0], f"class ({p})"
    return None, "no Wikidata relation reaches exactly one branch: needs review"


def relation_targets(entities, hops: int = MAX_HOPS) -> set[str]:
    """Every qid the parent search may look at from these entities (their relation targets, transitively)."""
    out = set()
    for e in entities:
        for p in ("P1365", "P155", "P361", "P279"):
            out |= set((e.relations or {}).get(p, []))
    return out
