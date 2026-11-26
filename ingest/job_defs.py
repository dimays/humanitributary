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


@job("seed_sources", interval=WEEK)
def seed_sources(ctx):
    """Publishers and Feeds for every source (idempotent; keeps ratings and enabled flags)."""
    ctx.counts.update(seed.seed(actor=ctx.actor))


@job("seed_branch_entities", interval=WEEK)
def seed_branch_entities(ctx):
    """Map branches to Wikidata items by exact match; queue map_branch_entities tasks for the rest."""
    branches = ctx.opt("branches")
    routing.seed_branch_entities(ctx.fetcher, ctx, branches=branches.split(",") if isinstance(branches, str) else branches,
                                 actor=ctx.actor, limit=ctx.opt("limit"))


@job("portal", interval=60, feed=True)
def portal(ctx):
    """Wikipedia Current events portal."""
    sources_wiki.run_portal(ctx)


@job("year_pages", interval=DAY, feed=True)
def year_pages(ctx):
    """Wikipedia "<Year> in <Country>" pages."""
    sources_wiki.run_year_pages(ctx)


@job("rss", interval=60, feed=True)
def rss(ctx):
    """News RSS / Atom feeds."""
    sources_news.run_rss(ctx)


@job("who_don", interval=360, feed=True)
def who_don(ctx):
    """WHO Disease Outbreak News."""
    sources_news.run_who_don(ctx)


@job("federal_register", interval=360, feed=True)
def federal_register(ctx):
    """Federal Register presidential documents."""
    sources_news.run_federal_register(ctx)


@job("gazette", interval=720, feed=True)
def gazette(ctx):
    """The Gazette (UK) state notices."""
    sources_news.run_gazette(ctx)


@job("nobel", interval=DAY, feed=True)
def nobel(ctx):
    """Nobel Prize announcements."""
    sources_news.run_nobel(ctx)


@job("historian_sync", interval=WEEK, feed=True)
def historian_sync(ctx):
    """Office of the Historian Milestones TEI (for the historian lookup)."""
    sources_news.run_historian_sync(ctx)


@job("refresh_entities", interval=DAY, feed=True)
def refresh_entities(ctx):
    """Re-read Wikidata facts for entities older than the TTL (`per_run` a run)."""
    cutoff = timezone.now() - timedelta(days=wikidata.ENTITY_TTL_DAYS)
    qids = list(Entity.objects.filter(Q(resolved_at__isnull=True) | Q(resolved_at__lt=cutoff)).order_by("resolved_at").values_list("qid", flat=True)[: int(ctx.opt("per_run", 2000))])
    wikidata.fetch_entities(ctx.fetcher, qids, refresh=True, counts=ctx.counts)


@job("pageviews", interval=360)
def pageviews(ctx):
    """Wikipedia pageviews for the entities of recent candidates' stories (significance for priority)."""
    since = timezone.now() - timedelta(days=45)
    recent = Candidate.objects.filter(created_at__gte=since, status__in=["queued", "claimed"])
    topic_qids = {q for q in recent.values_list("details__topic_qid", flat=True) if q}
    ents = list(Entity.objects.filter(qid__in=topic_qids)) + list(
        Entity.objects.filter(candidates__in=recent, kind__in=["event", "person", "org"]).distinct().order_by("qid"))
    wikidata.refresh_pageviews(ctx.fetcher, ents, counts=ctx.counts, limit=int(ctx.opt("limit", 400)))


@job("process", interval=15)
def process_(ctx):
    """Route, de-duplicate, cluster, prioritize; write_event tasks; new-branch signals."""
    process.run(ctx)


@job("enrich_tasks", interval=60)
def enrich_tasks(ctx):
    """Lookup adapters for queued write_event tasks (suggested sources in the payload)."""
    second_source.run_enrich_tasks(ctx)


@job("link_health", interval=DAY)
def link_health(ctx):
    """Re-check cited URLs; stale claims and verify_claim tasks for dead or changed ones."""
    linkhealth.run(ctx)


@job("facts_sweep", interval=DAY)
def facts_sweep(ctx):
    """The fact base's daily sweep (evidence/sweep.py): recompute, stale dead or changed links, verify_claim tasks."""
    from evidence import sweep

    out = sweep.sweep(actor=ctx.actor)
    for section, stats in out.items():
        if isinstance(stats, dict):
            for k, v in stats.items():
                if isinstance(v, (int, float)):
                    ctx.counts[f"{section}.{k}"] += v


@job("branches_review", interval=WEEK)
def branches_review(ctx):
    """Branch governance's weekly review (governance/review.py): rules → proposals and tasks."""
    from governance import review

    out = review.review(actor="job:branches_review")
    ctx.counts.update(out.get("counts", {}))
    ctx.counts["findings"] = len(out.get("findings", []))


@job("second_source", interval=DAY)
def second_source_(ctx):
    """Suggested second sources for claims only Wikipedia supports (verify_claim tasks)."""
    second_source.run_second_source(ctx)
