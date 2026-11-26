"""Routing new material to branches through `BranchEntity` (docs/adr/0008-ingest-design.md), and seeding it.

Score of a branch for a candidate (deterministic, documented):

    score(branch) = Σ over the candidate's entities e:
        role(e) × weight(BranchEntity) × hit(e → branch)

    role:  1.0 for an entity linked in the item itself, 0.5 for a context topic (the portal's parent bullets),
           0.7 for a name matched in a news item's text (the alias matcher is less certain than a wikilink)
    hit:   1.0  e is one of the branch's own entities (the country, the faith, the organization)
           0.6  e is a place or thing in a country (P17) or located in an entity (P131) of the branch
           0.3  e is a person whose citizenship (P27) is an entity of the branch

A branch only scores if the candidate's date falls inside its span (a 2026 item never routes to the Ottoman Empire).
A "2026 in Senegal" item adds YEAR_PAGE_BOOST to Senegal's branch. Scores are rounded to 3 places; the top branch is
the highest score (ties: the branch slug).
"""

import re
from collections import defaultdict

from django.utils import timezone

from timeline.models import Branch

from .models import BranchEntity, Entity

ROLE_WEIGHT = {"item": 1.0, "topic": 0.5, "alias": 0.7}
HIT_DIRECT, HIT_IN_COUNTRY, HIT_CITIZEN = 1.0, 0.6, 0.3
YEAR_PAGE_BOOST = 1.5
TOUCH_THRESHOLD = 0.6  # a branch counts as "touched" by a candidate at this score


class Router:
    def __init__(self):
        self.by_qid = defaultdict(list)  # qid → [(branch_id, slug, weight, start, end)]
        rows = BranchEntity.objects.select_related("entity", "branch").values_list("entity__qid", "branch_id", "branch__slug", "weight", "branch__start", "branch__end")
        for qid, bid, slug, w, start, end in rows:
            self.by_qid[qid].append((bid, slug, w, start, end))

    def _add(self, scores, hits, qid, factor, y, why):
        for bid, slug, w, start, end in self.by_qid.get(qid, ()):
            if y is not None and not (start - 1 <= y <= (end if end is not None else timezone.now().year + 1) + 1):
                continue
            scores[slug] += factor * w
            hits[slug].append(why)

    def score(self, entities_with_roles, y=None, boost: dict | None = None) -> tuple[dict, dict]:
        """entities_with_roles: [(Entity, role)]. → ({slug: score}, {slug: [why …]})"""
        scores, hits = defaultdict(float), defaultdict(list)
        for e, role in entities_with_roles:
            r = ROLE_WEIGHT.get(role, 1.0)
            self._add(scores, hits, e.qid, r * HIT_DIRECT, y, f"{e.qid} direct")
            facts = e.facts or {}
            if e.kind == "person":
                for c in facts.get("P27", []):
                    if c != e.qid:
                        self._add(scores, hits, c, r * HIT_CITIZEN, y, f"{e.qid} citizen of {c}")
            else:
                seen = set()
                for c in facts.get("P17", []) + facts.get("P131", []):
                    if c != e.qid and c not in seen:
                        seen.add(c)
                        self._add(scores, hits, c, r * HIT_IN_COUNTRY, y, f"{e.qid} in {c}")
        for slug, b in (boost or {}).items():
            scores[slug] += b
            hits[slug].append("year page")
        out = {s: round(v, 3) for s, v in sorted(scores.items()) if v > 0}
        return out, {s: hits[s][:8] for s in out}


def top_branch(scores: dict) -> str | None:
    if not scores:
        return None
    return sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]


# Seeding BranchEntity --------------------------------------------------------------------------------------------
PREFIXES = re.compile(r"^(the|republic of|kingdom of|state of|empire of)\s+", re.I)
EXPECTED_KINDS = {"polity", "org", "concept", "event", "place", "work"}


def name_variants(name: str) -> list[str]:
    """"Iran (Qajar to Islamic Republic)" → ["Iran (Qajar to Islamic Republic)", "Iran"]; "Republic of Senegal" → [.., "Senegal"];
    "Palestinian Authority / State of Palestine" → both halves."""
    out = [name.strip()]
    base = re.sub(r"\s*\([^)]*\)\s*", " ", name).strip()
    parts = [p.strip() for p in re.split(r"\s+/\s+|\s+&\s+(?=[A-Z])", base) if p.strip()] if " / " in base else [base]
    for p in parts:
        for v in (p, PREFIXES.sub("", p)):
            v = v.strip()
            if v and v not in out:
                out.append(v)
    return out


def members(name: str) -> list[str]:
    """"Gulf states (Kuwait, Bahrain, Qatar, UAE, Oman)" → ["Kuwait", "Bahrain", "Qatar", "UAE", "Oman"]."""
    m = re.search(r"\(([^)]*,[^)]*)\)", name)
    if not m:
        return []
    return [p.strip() for p in re.split(r",|\band\b", m.group(1)) if p.strip() and len(p.strip()) > 1]


def confident_match(variants: list[str], hits: list[dict], cited_qids: set, kinds: dict) -> tuple[str, str] | None:
    """The one Wikidata item we accept for a branch, or None. → (qid, how)

    Accepted only when exact: an item whose label (or alias) equals a name variant, case-insensitive, and
    (a) its label matches and it is the item of a Wikipedia article the branch cites, or
    (b) it is the only exact-label hit that is a polity, organization or event, or
    (b') its alias matches and it is the item of a cited article, or
    (c) it is the only exact-label hit of any expected kind, or
    (d) with no exact label at all, the only polity whose alias matches.
    Everything else is left for a `map_branch_entities` task.
    """
    low = {v.lower() for v in variants}
    labels, aliases = [], []
    for h in hits:
        label = (h.get("label") or "").lower()
        match = (h.get("match") or {})
        if label in low:
            labels.append(h["id"])
        elif match.get("type") == "alias" and (match.get("text") or "").lower() in low:
            aliases.append(h["id"])
    for qid in labels:
        if qid in cited_qids:
            return qid, "label match, cited article"
    strong = [q for q in labels if kinds.get(q) in ("polity", "org", "event")]
    if len(strong) == 1:
        return strong[0], f"unique exact label ({kinds[strong[0]]})"
    for qid in aliases:
        if qid in cited_qids:
            return qid, "alias match, cited article"
    expected = [q for q in labels if kinds.get(q) in EXPECTED_KINDS]
    if len(expected) == 1:
        return expected[0], "unique exact label"
    polity_aliases = [q for q in aliases if kinds.get(q) == "polity"]
    if not labels and len(polity_aliases) == 1:
        return polity_aliases[0], "unique polity alias"
    return None


def seed_branch_entities(fetcher, ctx, *, branches=None, actor="job:seed_branch_entities", limit=None):
    """Map branches without BranchEntity rows to Wikidata items (exact matches only); queue the rest for agents.

    Batched: every search first, then one pass resolving the branches' cited Wikipedia articles and reading the
    candidate items, then the decisions.
    """
    from evidence.models import Evidence
    from work import queue

    from . import wikidata

    counts = ctx.counts
    qs = Branch.objects.exclude(status="retracted").order_by("position", "slug")
    qs = qs.filter(slug__in=branches) if branches else qs.filter(entities__isnull=True)
    todo = list(qs[:limit] if limit else qs)
    cited_by = defaultdict(set)
    for entry_id, url in Evidence.objects.filter(claim__entry__in=todo).values_list("claim__entry_id", "citation__url"):
        if t := wikidata.title_from_url(url):
            cited_by[entry_id].add(t)
    t2q = wikidata.resolve_titles(fetcher, sorted(set().union(*cited_by.values())) if cited_by else [], counts=counts)
    plan = []
    for b in todo:
        variants = name_variants(b.name)
        hits, seen = [], set()
        for v in variants[:2]:
            for h in wikidata.search(fetcher, v):
                if h["id"] not in seen:
                    seen.add(h["id"])
                    hits.append(h)
        member_hits = {m: wikidata.search(fetcher, m) for m in members(b.name)}
        plan.append((b, variants, hits, member_hits, {t2q[t] for t in cited_by.get(b.pk, ()) if t2q.get(t)}))
        counts["searched"] += 1
    want = set()
    for b, variants, hits, member_hits, cited_qids in plan:
        low = {v.lower() for v in variants}
        want |= {h["id"] for h in hits if (h.get("label") or "").lower() in low or ((h.get("match") or {}).get("text") or "").lower() in low}
        for m, mh in member_hits.items():
            want |= {h["id"] for h in mh[:5]}
    kinds = {q: e.kind for q, e in wikidata.fetch_entities(fetcher, sorted(want), counts=counts).items()}
    for b, variants, hits, member_hits, cited_qids in plan:
        mapped = []
        if found := confident_match(variants, hits, cited_qids, kinds):
            e = Entity.objects.get(qid=found[0])
            BranchEntity.objects.get_or_create(branch=b, entity=e, defaults=dict(role=e.kind, weight=1.0, note=found[1], created_by=actor))
            mapped.append(found[0])
        for m, mh in member_hits.items():
            mf = confident_match([m], mh, set(), kinds)
            if mf and kinds.get(mf[0]) == "polity" and mf[0] not in mapped:
                e = Entity.objects.get(qid=mf[0])
                BranchEntity.objects.get_or_create(branch=b, entity=e, defaults=dict(role="member", weight=0.8, note=f"member '{m}': {mf[1]}", created_by=actor))
                mapped.append(mf[0])
        if mapped:
            counts["branches_mapped"] += 1
            counts["branch_entities"] += len(mapped)
        else:
            counts["branches_unmapped"] += 1
            queue.enqueue("map_branch_entities", created_by=actor, dedupe_key=f"branch:{b.slug}", priority=1, target_entry=b,
                          payload={"branch": b.slug, "name": b.name, "variants": variants,
                                   "cited_articles": sorted(cited_by.get(b.pk, ()))[:10],
                                   "search_hits": [{"qid": h["id"], "label": h.get("label", ""), "description": h.get("description", "")} for h in hits[:8]],
                                   "instructions": "Pick the Wikidata item(s) this branch is about (polity, faith, movement, organization) and add "
                                                   "BranchEntity rows (admin, or ingest.models.BranchEntity) with created_by agent:<name>; none if no item fits."})
