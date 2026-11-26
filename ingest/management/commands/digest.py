"""A compact Markdown summary of the work queue: the first thing a Claude session reads.

    manage.py digest              # queue by kind, the top write_event stories, branches, signals, recent runs
    manage.py digest --top 20 --sources
"""

from collections import Counter, defaultdict
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Count, Max
from django.utils import timezone

from ingest.models import Candidate, Feed, FetchRun, SuggestedSource
from work.models import AgentTask


def _short(s: str, n: int) -> str:
    s = " ".join((s or "").split())
    return s if len(s) <= n else s[: n - 1] + "…"


class Command(BaseCommand):
    help = "Print a Markdown digest of queued agent work (by kind, priority and branch) and recent job runs."

    def add_arguments(self, parser):
        parser.add_argument("--top", type=int, default=12)
        parser.add_argument("--sources", action="store_true", help="Also list every feed and lookup adapter with its state.")

    def handle(self, *args, top, sources, **o):
        w = self.stdout.write
        now = timezone.now()
        open_ = AgentTask.objects.filter(status__in=["queued", "claimed"])
        w(f"# Queue digest — {now:%Y-%m-%d %H:%M} UTC\n")
        by = Counter()
        for kind, status, n in open_.values_list("kind", "status").annotate(n=Count("id")):
            by[(kind, status)] = n
        kinds = sorted({k for k, _ in by}, key=lambda k: -(by[(k, "queued")] + by[(k, "claimed")]))
        w("## Open tasks\n")
        if not kinds:
            w("Nothing queued.\n")
        else:
            w("| kind | queued | claimed | top priority |\n|---|---:|---:|---:|")
            tops = dict(open_.values_list("kind").annotate(m=Max("priority")))
            for k in kinds:
                w(f"| {k} | {by[(k, 'queued')]} | {by[(k, 'claimed')]} | {tops.get(k, 0)} |")
            w("\nClaim: `manage.py tasks next --kind <kind> --claim --agent agent:<name>` (skills: `.claude/skills/`).\n")

        we = list(open_.filter(kind="write_event").order_by("-priority", "id")[:top])
        if we:
            w(f"## Top write_event stories ({len(we)} of {open_.filter(kind='write_event').count()})\n")
            w("| # | pri | date | branch | story | items | sources |\n|---:|---:|---|---|---|---:|---:|")
            for t in we:
                p = t.payload or {}
                s = p.get("suggested") or {}
                br = ", ".join(b["slug"] for b in s.get("branches", [])[:2]) or "—"
                when = s.get("last_date") or s.get("when") or ""
                w(f"| {t.pk} | {t.priority} | {when} | {br} | {_short(s.get('title_hint', ''), 60)} | {p.get('items_total', 0)} | {len(p.get('sources', []))} |")
            w("")

        branch_counts = defaultdict(int)
        for p in open_.filter(kind="write_event").values_list("payload", flat=True):
            for b in ((p or {}).get("suggested") or {}).get("branches", [])[:1]:
                branch_counts[b["slug"]] += 1
        if branch_counts:
            w("## write_event by top branch\n")
            w(", ".join(f"{s} {n}" for s, n in sorted(branch_counts.items(), key=lambda kv: (-kv[1], kv[0]))[:25]) + "\n")

        vc = open_.filter(kind="verify_claim")
        if vc.exists():
            reasons = Counter((p or {}).get("reason", "?") for p in vc.values_list("payload", flat=True))
            w("## verify_claim\n")
            w(", ".join(f"{r}: {n}" for r, n in reasons.most_common()) + f". Suggested second sources waiting: {SuggestedSource.objects.filter(status='suggested').count()}.\n")

        sig = Candidate.objects.filter(kind="new_branch_signal", status="queued").order_by("-priority", "id")[:top]
        if sig:
            w("## New-branch signals\n")
            for c in sig:
                d = c.details
                w(f"- **{d.get('label')}** ({d.get('qid')}, {d.get('kind')}): {d.get('clusters')} stories on {d.get('days')} days, {d.get('first')} → {d.get('last')}"
                  + (f"; country routes to {', '.join(d.get('country_routes_to', []))}" if d.get("country_routes_to") else ""))
            w("")

        # The fact base and branch governance contribute their own sections.
        for mod, fn in (("evidence.health", "digest_section"), ("governance.review", "digest_section"), ("governance.waves", "digest_section")):
            try:
                w(getattr(__import__(mod, fromlist=[fn]), fn)())
            except Exception as e:  # a section failing never hides the queue
                w(f"_({mod} digest section failed: {type(e).__name__}: {e})_\n")

        cs = Counter(Candidate.objects.values_list("status", flat=True))
        w("## Candidates\n")
        w(", ".join(f"{k} {v}" for k, v in sorted(cs.items())) + "\n")

        w("## Job runs (last 24 h)\n")
        runs = FetchRun.objects.filter(started_at__gte=now - timedelta(hours=24))
        stat = defaultdict(Counter)
        last = {}
        for r in runs.order_by("started_at").select_related("feed"):
            name = r.job + (f" [{r.feed.name}]" if r.feed and r.job in ("rss",) else "")
            stat[name][r.status] += 1
            last[name] = r
        if not stat:
            w("No runs in the last 24 hours: is the schedule installed (`make schedule-status`)?\n")
        else:
            w("| job | runs | last | last counts |\n|---|---|---|---|")
            for name in sorted(stat):
                r = last[name]
                counts = ", ".join(f"{k} {v}" for k, v in sorted(r.counts.items()) if v and k not in ("requests",))[:120]
                w(f"| {name} | {' '.join(f'{k} {v}' for k, v in sorted(stat[name].items()))} | {r.status} {r.started_at:%H:%M} | {counts} |")
            failed = runs.filter(status__in=["failed", "partial"]).order_by("-started_at")[:3]
            for r in failed:
                w(f"\n- {r.job} {r.status} at {r.started_at:%H:%M}: {_short(r.error.splitlines()[0] if r.error else '', 160)}")
            w("")

        if sources:
            w("## Sources\n")
            for f in Feed.objects.select_related("publisher").order_by("config__job", "name"):
                state = "on" if f.enabled else "off"
                why = (f.config or {}).get("disabled_reason", "")
                w(f"- [{state}] {f.name} ({f.publisher.domain}, {f.publisher.fetch_policy}, tier {f.publisher.tier or '—'})" + (f": {why}" if why else ""))
            from ingest.seed import SKIPPED

            for name, why in SKIPPED.items():
                w(f"- [skipped] {name}: {why}")
