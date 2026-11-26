"""Routing new material to branches through `BranchEntity` (docs/adr/0012-ingestion.md, retuned by
docs/adr/0021-ingestion-tuning.md), and seeding it.

Score of a branch for one candidate (deterministic, documented):

    score(branch) = max over the candidate's entities e of
        role(e) × mention(e, hit) × weight(BranchEntity) × hit(e → branch)

    role:    the entity's part in the story
             1.0 the story itself (the portal item's story article, `topic_qid`) or an entity linked in the item
             0.7 a name matched in a news item's text (the alias matcher is less certain than a wikilink)
             0.5 a context topic above the story (the portal's parent bullets)
    hit:     1.0  e is one of the branch's own entities (the country, the faith, the organization)
             0.6 / n  e is located in an entity of the branch: its country (P17) or what it is located in (P131),
                      n being how many values that statement has (a sea in 20 countries is in any one of them
                      only a twentieth as surely). For an event n is √(count): an event involves each of its
                      countries, but a long list of participants is weaker evidence for any one of them.
             0.3 / n  e is a person with that citizenship (P27), n citizenships
    mention: 0.5 for an indirect hit (country, citizenship) through a concept or a work: a passing mention
             ("Mediterranean Sea", "U.S. state"); 1 otherwise. A concept that is itself a branch's entity
             ("artificial intelligence") is a direct hit and counts in full.

The maximum, not the sum: naming a port and its country, or three American politicians, is one mention of the
place, not three. Each further entity that also routes to the branch adds MORE_MENTIONS (0.01): a tie-breaker, so
of two branches named equally strongly the one named more often leads, too small to outweigh a stronger mention. A branch only scores if the candidate's date falls inside its span (a 2026 item never routes to
the Ottoman Empire). A "2026 in Senegal" item adds YEAR_PAGE_BOOST to Senegal's branch. Scores are rounded to 3
places; the top branch is the highest score (ties: the branch slug). A story's branches (the cluster's suggestion,
process.build_payload) are the sum over its candidates; a second or third branch is suggested only with at least
LINK_MIN_SHARE of the top one's.
"""

import math
import re
from collections import defaultdict

from django.utils import timezone

from timeline.models import Branch

from .models import BranchEntity, Entity

ROLE_WEIGHT = {"story": 1.0, "item": 1.0, "topic": 0.5, "alias": 0.7}
HIT_DIRECT, HIT_IN_COUNTRY, HIT_CITIZEN = 1.0, 0.6, 0.3
PASSING_MENTION = 0.5  # an indirect hit through a concept or a work
PASSING_KINDS = {"concept", "work"}
YEAR_PAGE_BOOST = 1.5
TOUCH_THRESHOLD = 0.6  # a branch counts as "touched" by a candidate at this score
LINK_MIN_SHARE = 0.35  # a story's second (or third) branch needs this share of the top branch's score
MORE_MENTIONS = 0.01  # per further entity routing to the same branch (a tie-breaker)


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
            if factor * w > 0:
                scores[slug] = max(scores[slug], factor * w)
                hits[slug].append(why)
                self._by.setdefault(slug, set()).add(why.split(" ", 1)[0])

    def score(self, entities_with_roles, y=None, boost: dict | None = None) -> tuple[dict, dict]:
        """entities_with_roles: [(Entity, role)]. → ({slug: score}, {slug: [why …]})"""
        scores, hits = defaultdict(float), defaultdict(list)
        self._by = {}  # slug → the entities that route there
        for e, role in entities_with_roles:
            r = ROLE_WEIGHT.get(role, 1.0)
            self._add(scores, hits, e.qid, r * HIT_DIRECT, y, f"{e.qid} direct")
            facts = e.facts or {}
            m = PASSING_MENTION if e.kind in PASSING_KINDS else 1.0
            if e.kind == "person":
                cs = [c for c in dict.fromkeys(facts.get("P27", [])) if c != e.qid]
                for c in cs:
                    self._add(scores, hits, c, r * m * HIT_CITIZEN / len(cs), y, f"{e.qid} citizen of {c}")
            else:
                share = {}
                for p in ("P17", "P131"):
                    cs = [c for c in dict.fromkeys(facts.get(p, [])) if c != e.qid]
                    n = math.sqrt(len(cs)) if e.kind == "event" else len(cs)
                    for c in cs:
                        share[c] = max(share.get(c, 0.0), HIT_IN_COUNTRY / n)
                for c, w in share.items():
                    self._add(scores, hits, c, r * m * w, y, f"{e.qid} in {c}")
        for slug, ents in self._by.items():
            scores[slug] += MORE_MENTIONS * (len(ents) - 1)
        for slug, b in (boost or {}).items():
            scores[slug] += b
            hits[slug].append("year page")
        out = {s: round(v, 3) for s, v in sorted(scores.items()) if round(v, 3) > 0}
        return out, {s: hits[s][:8] for s in out}


def suggested(scores: dict, limit: int = 3) -> list[tuple[str, float]]:
    """A story's branches from its summed scores: the top one, then others with at least LINK_MIN_SHARE of it."""
    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    if not ranked:
        return []
    top = ranked[0][1]
    return [(s, v) for s, v in ranked[:limit] if v >= LINK_MIN_SHARE * top]


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

# Hand-checked mappings that exact titles get wrong or can't reach (docs/adr/0021-ingestion-tuning.md). Applied by
# every seeding run, for these branches whether or not they have rows: `use` rows are created (qid, role, weight),
# `never` rows are deleted and never created. Prefer fixing the rule (the guards in seed_branch_entities) to adding
# a line here.
CORRECTIONS = {
    # "Ireland" is the island's article (Wikipedia's primary topic); the branch is the state.
    "ireland": {"use": [("Q27", "polity", 1.0)], "never": ["Q22890"]},
    # The branch is the states that followed Yugoslavia, not SFR Yugoslavia (which has its own branch).
    "post-yugoslav-states": {"never": ["Q83286", "Q36704"], "use": [
        ("Q215", "member", 0.8), ("Q224", "member", 0.8), ("Q225", "member", 0.8), ("Q403", "member", 0.8),
        ("Q236", "member", 0.8), ("Q221", "member", 0.8), ("Q1246", "member", 0.8)]},
    # The branch maps the Palestinian National Authority by its title; the state, its territories and its people
    # route there too (the Gaza war's P17 names the State of Palestine, not the PNA).
    "palestine": {"use": [("Q219060", "polity", 1.0), ("Q23792", "place", 0.8), ("Q39760", "place", 0.8),
                          ("Q36678", "place", 0.8), ("Q201190", "people", 0.8)]},
}
MIN_SPAN_COVER = 0.1  # an item that ended must have lasted into at least this share of the branch's span


def _year(v) -> float | None:
    """"1992-04-26" → 1992.0, "-0500-01-01" → -500.0 (Wikidata's dates as parse_facts stores them)."""
    m = re.match(r"^\s*\+?(-?\d+)", str(v or ""))
    return float(m.group(1)) if m else None


def covers(entity, branch, now_year: float) -> bool:
    """Did the item last into the branch's span? An item that ended (P576 dissolved, P582 end) within the first
    MIN_SPAN_COVER of the span is a predecessor, not the branch: SFR Yugoslavia (to 1992) is not the states after it
    (1991–). Only the end counts: a state's inception (P571) is often its latest constitution (France, 1792)."""
    end = _year((entity.facts or {}).get("P576") or (entity.facts or {}).get("P582"))
    b0, b1 = branch.start, branch.end if branch.end is not None else now_year
    if end is None or b1 <= b0:
        return True
    return (min(end, b1) - b0) / (b1 - b0) >= MIN_SPAN_COVER


def apply_corrections(fetcher, counts, *, actor, only=None):
    """Make CORRECTIONS true: delete `never` rows, create `use` rows (fetching their items)."""
    from . import wikidata

    todo = {slug: fix for slug, fix in CORRECTIONS.items() if only is None or slug in only}
    branches = {b.slug: b for b in Branch.objects.filter(slug__in=todo)}
    use = sorted({q for slug, fix in todo.items() if slug in branches for q, *_ in fix.get("use", [])})
    ents = wikidata.fetch_entities(fetcher, use, counts=counts) if use else {}
    for slug, fix in todo.items():
        b = branches.get(slug)
        if b is None:
            continue
        n, _ = BranchEntity.objects.filter(branch=b, entity__qid__in=fix.get("never", [])).delete()
        counts["corrections_removed"] += n
        for qid, role, weight in fix.get("use", []):
            if qid in ents:
                _, made = BranchEntity.objects.get_or_create(branch=b, entity=ents[qid], defaults=dict(role=role, weight=weight, note="routing.CORRECTIONS", created_by=actor))
                counts["corrections_added"] += made


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

    # A place whose country has the same name is the wrong item for a branch: "Ireland" the island, not the state.
    places = [e for e in ents.values() if e.kind == "place"]
    countries = wikidata.fetch_entities(fetcher, sorted({c for e in places for c in (e.facts or {}).get("P17", [])}), counts=counts) if places else {}
    now_year = timezone.now().year + 1

    def the_state(qid, variants):
        e = ents[qid]
        if e.kind != "place":
            return qid
        low = {v.lower() for v in variants}
        same = [c for c in (e.facts or {}).get("P17", []) if c in countries and countries[c].kind == "polity" and countries[c].label.lower() in low]
        if len(same) == 1:
            ents[same[0]] = countries[same[0]]
            return same[0]
        return qid

    for b in todo:
        if b.slug in CORRECTIONS:
            continue  # hand-checked: apply_corrections below
        variants, mem = plan[b.pk]
        cited_qids = {q(t) for t in cited_by.get(b.pk, ())} - {""}
        options = [(v, the_state(q(v), variants)) for v in variants if q(v) and usable(q(v))]
        options = [(v, qid) for v, qid in options if covers(ents[qid], b, now_year)]
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
            if mq and usable(mq) and ents[mq].kind == "polity" and mq not in mapped and covers(ents[mq], b, now_year):
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
                                   "instructions": "Pick the Wikidata item(s) this branch is about (polity, faith, movement, organization) and complete "
                                                   "this task over the agent API with {\"branch\": …, \"entities\": [{\"qid\", \"role\"}]}; an empty list if no item fits."})
    apply_corrections(fetcher, counts, actor=actor, only=set(branches) if branches else None)
