"""The jobs `run_jobs` knows, in the order it runs them: set-up, sources, entities, processing, upkeep.

Intervals are minutes; a feed job's own interval is its Feed row's `interval_minutes`.
"""

from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from . import linkhealth, process, routing, second_source, seed, sources_news, sources_wiki, wikidata
from .jobs import job
from .models import Candidate, Entity

DAY, WEEK = 1440, 10080


@job("seed_sources", interval=WEEK, tags="maintenance")
def seed_sources(ctx):
    """Creates or updates the Publisher and Feed rows for every source, keeping ratings and enabled flags."""
    ctx.counts.update(seed.seed(actor=ctx.actor))


@job("seed_branch_entities", interval=WEEK, tags="maintenance")
def seed_branch_entities(ctx):
    """Maps branches to their Wikidata items by exact match, and queues map_branch_entities tasks for the rest."""
    branches = ctx.opt("branches")
    routing.seed_branch_entities(ctx.fetcher, ctx, branches=branches.split(",") if isinstance(branches, str) else branches,
                                 actor=ctx.actor, limit=ctx.opt("limit"))


@job("portal", interval=60, feed=True, tags="collect")
def portal(ctx):
    """Collects new items from Wikipedia's Current events portal."""
    sources_wiki.run_portal(ctx)


@job("year_pages", interval=DAY, feed=True, tags="collect")
def year_pages(ctx):
    """Collects events from Wikipedia's "<Year> in <Country>" pages."""
    sources_wiki.run_year_pages(ctx)


@job("rss", interval=60, feed=True, tags="collect")
def rss(ctx):
    """Collects headlines from the permitted news RSS and Atom feeds."""
    sources_news.run_rss(ctx)


@job("who_don", interval=360, feed=True, tags="collect")
def who_don(ctx):
    """Collects the WHO's Disease Outbreak News."""
    sources_news.run_who_don(ctx)


@job("federal_register", interval=360, feed=True, tags="collect")
def federal_register(ctx):
    """Collects presidential documents from the Federal Register."""
    sources_news.run_federal_register(ctx)


@job("gazette", interval=720, feed=True, tags="collect")
def gazette(ctx):
    """Collects state notices from The Gazette (UK)."""
    sources_news.run_gazette(ctx)


@job("nobel", interval=DAY, feed=True, tags="collect")
def nobel(ctx):
    """Collects Nobel Prize announcements."""
    sources_news.run_nobel(ctx)


@job("historian_sync", interval=WEEK, feed=True, tags="collect")
def historian_sync(ctx):
    """Syncs the Office of the Historian's Milestones (TEI), which the historian lookup reads."""
    sources_news.run_historian_sync(ctx)


@job("refresh_entities", interval=DAY, feed=True, tags="maintenance")
def refresh_entities(ctx):
    """Re-reads Wikidata facts for entities older than the TTL (`per_run` a run), and re-derives every kind."""
    cutoff = timezone.now() - timedelta(days=wikidata.ENTITY_TTL_DAYS)
    qids = list(Entity.objects.filter(Q(resolved_at__isnull=True) | Q(resolved_at__lt=cutoff)).order_by("resolved_at").values_list("qid", flat=True)[: int(ctx.opt("per_run", 2000))])
    wikidata.fetch_entities(ctx.fetcher, qids, refresh=True, counts=ctx.counts)
    # Re-derive every kind from the stored facts (no requests), so a change to the class table applies to all.
    for e in Entity.objects.only("pk", "kind", "facts").iterator(chunk_size=2000):
        k = wikidata.kind_of((e.facts or {}).get("P31", []), e.facts or {})
        if k != e.kind:
            Entity.objects.filter(pk=e.pk).update(kind=k)
            ctx.counts["kinds_changed"] += 1


@job("pageviews", interval=360, tags="process")
def pageviews(ctx):
    """Fetches Wikipedia pageviews for the entities in recent candidates' stories, which raise their priority."""
    since = timezone.now() - timedelta(days=45)
    recent = Candidate.objects.filter(created_at__gte=since, status__in=["queued", "claimed"])
    topic_qids = {q for q in recent.values_list("details__topic_qid", flat=True) if q}
    ents = list(Entity.objects.filter(qid__in=topic_qids)) + list(
        Entity.objects.filter(candidates__in=recent, kind__in=["event", "person", "org"]).distinct().order_by("qid"))
    wikidata.refresh_pageviews(ctx.fetcher, ents, counts=ctx.counts, limit=int(ctx.opt("limit", 400)))


@job("process", interval=15, tags="process")
def process_(ctx):
    """Routes, de-duplicates, clusters and prioritizes candidates, then queues write_event tasks and new-branch signals."""
    process.run(ctx)


@job("entity_relations", interval=60, tags="governance")
def entity_relations(ctx):
    """Fetches the Wikidata relations of the entities behind new-branch signals, which the NEW-BRANCH rule reads.

    The relations are part of, follows, replaces, subclass of, subnational or party, for those entities and for what
    the relations name, up to branchable.MAX_HOPS steps (ingest/branchable.py). A few requests a run; cached for
    ENTITY_TTL_DAYS."""
    from . import branchable

    qids = sorted({q for q in Candidate.objects.filter(kind="new_branch_signal", status__in=["queued", "claimed"]).values_list("details__qid", flat=True) if q})
    seen = set()
    for _ in range(branchable.MAX_HOPS + 1):
        todo = [q for q in qids if q not in seen]
        if not todo:
            break
        seen |= set(todo)
        wikidata.fetch_entities(ctx.fetcher, todo, counts=ctx.counts)
        wikidata.fetch_relations(ctx.fetcher, todo, counts=ctx.counts)
        qids = sorted(branchable.relation_targets(Entity.objects.filter(qid__in=todo)) - seen)


@job("enrich_tasks", interval=60, tags="process")
def enrich_tasks(ctx):
    """Adds the lookup adapters' suggested sources to queued write_event tasks."""
    second_source.run_enrich_tasks(ctx)


@job("link_health", interval=DAY, not_idempotent=(
    "each run is a round: three failed rounds in a row make a citation dead (ingest/linkhealth.py), so back-to-back "
    "runs can turn a host's bad hour into dead links, and every run appends LinkCheck rows"), tags="fact-check")
def link_health(ctx):
    """Re-checks cited URLs, and marks claims stale and queues verify_claim tasks for dead or changed ones."""
    linkhealth.run(ctx)


@job("facts_sweep", interval=DAY, tags="fact-check")
def facts_sweep(ctx):
    """Runs the fact base's daily sweep (evidence/sweep.py): recomputes claims, stales dead or changed links and queues verify_claim tasks."""
    from evidence import sweep

    out = sweep.sweep(actor=ctx.actor)
    for section, stats in out.items():
        if isinstance(stats, dict):
            for k, v in stats.items():
                if isinstance(v, (int, float)):
                    ctx.counts[f"{section}.{k}"] += v


@job("branches_review", interval=WEEK, tags="governance")
def branches_review(ctx):
    """Runs branch governance's weekly review (governance/review.py): the rules make proposals and review tasks."""
    from governance import review

    out = review.review(actor="job:branches_review")
    ctx.counts.update(out.get("counts", {}))
    ctx.counts["findings"] = len(out.get("findings", []))


@job("second_source", interval=DAY, not_idempotent=(
    "it walks claims from a bookmark (JobState \"second_source\"): each run does the next batch, so a second run is "
    "\"more\", not \"again\""), tags="fact-check")
def second_source_(ctx):
    """Suggests second sources for claims only Wikipedia supports, as verify_claim tasks."""
    second_source.run_second_source(ctx)


@job("gap_waves", interval=DAY, tags="waves")
def gap_waves(ctx):
    """Finds the gaps in each branch's windows for the content waves (governance/waves.py), queues fill_gap tasks and advances the active wave."""
    from governance import waves

    per_day = ctx.opt("per_day")
    out = waves.run(per_day=int(per_day) if per_day is not None else None, dry_run=bool(ctx.opt("dry_run", False)))
    ctx.counts.update({k: v for k, v in out["counts"].items() if isinstance(v, int)})
    for w, n in out["gaps"].items():
        ctx.counts[f"{w}.gaps"] = n
    ctx.counts["advanced"] = len(out["advanced_to"])


@job("gap_pointers", interval=60, tags="waves")
def gap_pointers(ctx):
    """Adds pointers to queued fill_gap tasks (governance/pointers.py): Wikipedia history sections and lookup hits, unread."""
    from governance import pointers

    pointers.run(ctx)


@job("prefetch_sources", interval=15, tags=("process", "fact-check"))
def prefetch_sources(ctx):
    """Fetches the allowed pages queued tasks point at and adds evidence packs (stored text, ranked passages) to their payloads.

    Runs after process, enrich_tasks, the sweep and gap_pointers, so their sources and pointers are in; capped per
    run and per host; never requests a browser_only page (ingest/prefetch.py, docs/adr/0036-evidence-packs.md)."""
    from . import prefetch

    prefetch.run(ctx)


@job("image_search", interval=60, tags="collect")
def image_search(ctx):
    """Looks for an openly licensed picture for events that have none, attaching sure matches and sending the rest to the Review page.

    Wikidata's P18 and the Commons API first, then the Library of Congress, Smithsonian Open Access and NASA's image
    library; each event at most MAX_ATTEMPTS times, days to weeks apart; never AI-generated imagery; pictures likely
    to disturb are flagged and blurred (ingest/images.py, docs/adr/0048-event-images.md)."""
    from . import images

    images.run(ctx)
