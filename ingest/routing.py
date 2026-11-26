"""Routing new material to branches through `BranchEntity` (docs/adr/0012-ingestion.md), and seeding it.

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


DISAMBIGUATION = {"Q4167410", "Q22808320", "Q4167836"}  # disambiguation page, human-name disambiguation, category


def seed_branch_entities(fetcher, ctx, *, branches=None, actor="job:seed_branch_entities", limit=None, search=False):
    """Map branches without BranchEntity rows to Wikidata items, exact matches only; queue the rest for agents.

    Exact means: a name variant of the branch ("Iran" for "Iran (Qajar to Islamic Republic)") is itself an English
    Wikipedia title (redirects followed: Wikipedia's own primary-topic decision) whose item is not a disambiguation
    page and is of an expected kind; an item the branch also cites wins over the others, and without a citation a
    shortened name only counts for a polity or organization. Members listed in a name
    ("Gulf states (Kuwait, …)") map when their title is a polity. All lookups are batched MediaWiki title queries
    and SPARQL reads (a few dozen requests for every branch). `search=True` also tries Wikidata's entity search
    (confident_match), which is slower and rate-limited.
    """
    from evidence.models import Evidence
    from work import queue

    from . import wikidata

    counts = ctx.counts
    qs = Branch.objects.exclude(status="retracted").order_by("slug")
    qs = qs.filter(slug__in=branches) if branches else qs.filter(entities__isnull=True)
    todo = list(qs[:limit] if limit else qs)
    cited_by = defaultdict(set)
    for entry_id, url in Evidence.objects.filter(claim__entry__in=todo).values_list("claim__entry_id", "citation__url"):
        if t := wikidata.title_from_url(url):
            cited_by[entry_id].add(t)
    plan = {b.pk: (name_variants(b.name), members(b.name)) for b in todo}
    titles = set().union(*cited_by.values()) if cited_by else set()
    for variants, mem in plan.values():
        titles |= set(variants) | set(mem)
    t2q = wikidata.resolve_titles(fetcher, sorted(titles), counts=counts)
    from .wikitext import normalize_title

    q = lambda t: t2q.get(normalize_title(t), "")  # noqa: E731
    ents = wikidata.fetch_entities(fetcher, sorted({v for v in t2q.values() if v}), counts=counts)

    def usable(qid):
        e = ents.get(qid)
        return e is not None and not (set((e.facts or {}).get("P31", [])) & DISAMBIGUATION) and e.kind in EXPECTED_KINDS

    for b in todo:
        variants, mem = plan[b.pk]
        cited_qids = {q(t) for t in cited_by.get(b.pk, ())} - {""}
        options = [(v, q(v)) for v in variants if q(v) and usable(q(v))]
        found = next(((qid, f"title '{v}', cited article") for v, qid in options if qid in cited_qids), None)
        # Uncited, a shortened name must be a polity or organization ("Iran" for "Iran (Qajar …)"); a concept's
        # short name is too often another primary topic ("Ubuntu" is the operating system, not the philosophy).
        options = [(v, qid) for v, qid in options if v == variants[0] or ents[qid].kind in ("polity", "org")]
        if found is None and options:
            found = (options[0][1], f"title '{options[0][0]}'")
        if found is None and search:
            hits = [h for v in variants[:2] for h in wikidata.search(fetcher, v)]
            kinds = {k: e.kind for k, e in wikidata.fetch_entities(fetcher, [h["id"] for h in hits][:20], counts=counts).items()}
            found = confident_match(variants, hits, cited_qids, kinds)
        mapped = []
        if found:
            e = Entity.objects.get(qid=found[0])
            BranchEntity.objects.get_or_create(branch=b, entity=e, defaults=dict(role=e.kind, weight=1.0, note=found[1], created_by=actor))
            mapped.append(found[0])
        for m in mem:
            mq = q(m)
            if mq and usable(mq) and ents[mq].kind == "polity" and mq not in mapped:
                BranchEntity.objects.get_or_create(branch=b, entity=ents[mq], defaults=dict(role="member", weight=0.8, note=f"member title '{m}'", created_by=actor))
                mapped.append(mq)
        if mapped:
            counts["branches_mapped"] += 1
            counts["branch_entities"] += len(mapped)
        else:
            counts["branches_unmapped"] += 1
            queue.enqueue("map_branch_entities", created_by=actor, dedupe_key=f"branch:{b.slug}", priority=1, target_entry=b,
                          payload={"branch": b.slug, "name": b.name, "variants": variants,
                                   "cited_articles": sorted(cited_by.get(b.pk, ()))[:10],
                                   "cited_items": sorted(cited_qids)[:10],
                                   "instructions": "Pick the Wikidata item(s) this branch is about (polity, faith, movement, organization) and add "
                                                   "BranchEntity rows (admin, or ingest.models.BranchEntity) with created_by agent:<name>; none if no item fits."})
