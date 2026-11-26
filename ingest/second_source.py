"""Second sources: walk the claims only Wikipedia supports, ask the lookup adapters for material that may support them,
store what they find as SuggestedSource rows and queue a `verify_claim` task for an agent to read and decide.
Never writes Evidence and never changes a claim's status: corroboration needs an agent's reading (ADR 0004).

Also `enrich_tasks`: the same lookups for queued `write_event` tasks, added to their payload as `suggested_sources`.

The query for a claim: the title of the Wikipedia article it cites (the cleanest name of the subject), else the
entry's title or name; its year from the entry (`y` / `start`); entities from that article's Wikidata item and the
branch's BranchEntity rows (countries, for the World Bank adapter).
"""

from django.utils import timezone

from evidence.models import Claim
from timeline.models import Event
from work import queue
from work.models import AgentTask

from . import lookup, wikidata
from .models import BranchEntity, Candidate, Entity, JobState, SuggestedSource


def claim_query(fetcher, claim, counts) -> lookup.Query:
    entry = claim.entry.concrete
    wiki_titles = [wikidata.title_from_url(u) for u in claim.evidence.values_list("citation__url", flat=True)]
    wiki_titles = [t for t in wiki_titles if t]
    ents = []
    if wiki_titles:
        ents = list(wikidata.resolve(fetcher, wiki_titles[:2], counts=counts).values())
    branch = entry if entry.kind == "branch" else getattr(entry, "branch", None)
    if branch is not None:
        ents += [be.entity for be in BranchEntity.objects.filter(branch=branch).select_related("entity")]
    if isinstance(entry, Event):
        title, year = entry.title, entry.y
    else:
        title, year = entry.name, entry.start
    value = claim.value or {}
    text = " ".join(str(value.get(k, "")) for k in ("title", "text", "when", "name", "note")) if isinstance(value, dict) else str(value)
    q_title = wiki_titles[0] if wiki_titles else title
    return lookup.Query(title=q_title, text=f"{title}. {text}", year=year, entities=ents)


def save_suggestions(hits, *, claim=None, candidate=None, actor):
    n = 0
    for h in hits:
        _, created = SuggestedSource.objects.get_or_create(
            claim=claim, candidate=candidate, url=h.url[:1000],
            defaults=dict(adapter=h.adapter, title=h.title[:500], publisher_domain=h.publisher, date_text=str(h.date)[:60],
                          snippet=lookup.excerpt(h.snippet, 25)[:400], kind=h.kind, ids=h.ids, score=h.score, created_by=actor))
        n += created
    return n


def run_second_source(ctx):
    """Claims supported by Wikipedia alone → lookup adapters → suggested sources + verify_claim tasks (`limit` a run)."""
    limit = int(ctx.opt("limit", 60))
    state, _ = JobState.objects.get_or_create(name="second_source")
    after = int(state.state.get("after_claim", 0))
    qs = Claim.objects.filter(status="single_source").select_related("entry").order_by("id")
    batch = list(qs.filter(pk__gt=after)[:limit])
    if len(batch) < limit:  # wrap around: a later round may find what an earlier one didn't
        batch += list(qs.exclude(pk__in=[c.pk for c in batch])[: limit - len(batch)])
        state.state["rounds"] = state.state.get("rounds", 0) + 1
    for claim in batch:
        ctx.counts["claims"] += 1
        try:
            q = claim_query(ctx.fetcher, claim, ctx.counts)
            hits = lookup.lookup(ctx.fetcher, q, counts=ctx.counts)
        except Exception as e:
            ctx.error(f"claim {claim.pk}: {type(e).__name__}: {e}")
            continue
        if not hits:
            ctx.counts["claims_no_hit"] += 1
            continue
        ctx.counts["claims_with_suggestions"] += 1
        ctx.counts["suggestions_new"] += save_suggestions(hits, claim=claim, actor=ctx.actor)
        for h in hits:
            ctx.counts[f"family_{_family(h.adapter)}"] += 1
        sugg = [s for s in SuggestedSource.objects.filter(claim=claim, status="suggested").order_by("-score", "id")[:5]]
        _, created = queue.enqueue("verify_claim", created_by=ctx.actor, dedupe_key=f"claim:{claim.pk}", priority=2, target_claim=claim,
                                   target_entry=claim.entry, payload={
                                       "reason": "second source: only Wikipedia supports this claim", "entry": claim.entry.slug,
                                       "field": claim.field, "value": claim.value, "query": {"title": q.title, "year": q.year},
                                       "suggested_sources": [{"id": s.pk, "adapter": s.adapter, "url": s.url, "title": s.title, "publisher": s.publisher_domain,
                                                              "date": s.date_text, "snippet": s.snippet, "kind": s.kind, "score": s.score, "ids": s.ids} for s in sugg],
                                       "instructions": "Skill: .claude/skills/verify-stale-claims (second-source section). A suggestion is not "
                                                       "evidence: read the page; only if it explicitly supports the claim add Evidence (agent_read) "
                                                       "and mark the suggestion accepted, else rejected."})
        ctx.counts["verify_tasks_created" if created else "verify_tasks_existing"] += 1
    if batch:
        state.state["after_claim"] = max(c.pk for c in batch) if len(batch) == limit else 0
    state.save()


FAMILIES = {"openalex": "scholarship", "crossref": "scholarship", "worldbank": "official", "historian": "official", "nobel": "specialist",
            "loc": "cultural", "chronicling_america": "cultural", "smithsonian": "cultural", "europeana": "cultural"}


def _family(adapter: str) -> str:
    return FAMILIES.get(adapter, "other")


def run_enrich_tasks(ctx):
    """Queued write_event tasks without suggested sources: run the lookups for their story, add the hits to the payload."""
    limit = int(ctx.opt("limit", 30))
    tasks = AgentTask.objects.filter(kind="write_event", status="queued").exclude(payload__has_key="suggested_sources").order_by("-priority", "id")[:limit]
    for t in tasks:
        p = t.payload or {}
        cand = Candidate.objects.filter(pk=t.target_candidate_id).first()
        title = (p.get("suggested") or {}).get("title_hint") or (cand.title if cand else "")
        ents = list(Entity.objects.filter(qid__in=[e["qid"] for e in p.get("entities", [])][:6]))
        q = lookup.Query(title=title, text=" ".join(i["text"] for i in p.get("items", [])[:3]), year=(p.get("suggested") or {}).get("y"), entities=ents)
        try:
            hits = lookup.lookup(ctx.fetcher, q, counts=ctx.counts)
        except Exception as e:
            ctx.error(f"task {t.pk}: {type(e).__name__}: {e}")
            continue
        if cand:
            save_suggestions(hits, candidate=cand, actor=ctx.actor)
        t.payload = {**p, "suggested_sources": [h.as_json() for h in hits], "suggested_at": timezone.now().isoformat()}
        t.save(update_fields=["payload"])
        ctx.counts["tasks_enriched"] += 1
        ctx.counts["suggestions"] += len(hits)
        for h in hits:
            ctx.counts[f"family_{_family(h.adapter)}"] += 1
