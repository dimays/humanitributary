"""Content waves and gap detection: the `gap_waves` job and `manage.py waves` (docs/guide/content-waves.md, ADR 0026).

The owner's content strategy works backward from today: the current year is ingestion's (write_event); then a detailed
picture of the last 500 years, filling gaps; then deeper history in waves. A **wave** is a stretch of time cut into
fixed **windows** (`DEFAULT_WAVES`, or `settings.CONTENT_WAVES`): W1 is 1925 to the start of this year in 5-year
windows, W2 1800–1925 in 10-year windows, and so on back to 3500 BCE. Branches about faiths, ideas and culture
(`wide_regions`) use windows `wide_factor` (4) times wider, since their events are rarer by nature.

Every day the job measures each published branch alive in each window (from the same metrics the branch rules use,
`governance.metrics.compute`), and calls a window a **gap** when the branch has no published event in it (`empty`), or
far fewer than its peers alive in the same window (`sparse`: under `density_floor` × the peers' median). Gaps in the
active wave and every wave before it become `fill_gap` tasks, best first (wave, then branch importance, then the
length of the silence around the window), at most `settings.FILL_GAP_TASKS_PER_DAY` new ones a day and
`max_open_per_branch` open per branch. A window with an open task, or one recently attempted (an agent found nothing
notable, wrote events now in review, or gave up), is skipped for `retry_after_days`. The active wave moves on when
what is left of it (open tasks plus gaps held back) drops below `advance_below`, or by `manage.py waves advance`.

Deterministic: the same content and the same day give the same gaps, priorities and tasks; no network, no LLM (the
pointers in a task's payload come later, from `governance/pointers.py`, the `gap_pointers` job).
"""

from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from statistics import median
from urllib.parse import unquote

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from ingest.prefetch import PAYLOAD_KEYS as PREFETCH_KEYS
from work.models import AgentTask
from work.queue import PAYLOAD_KEYS as QUEUE_KEYS
from work.queue import enqueue

from . import metrics as gm

KIND = "fill_gap"
ACTOR = "job:gap_waves"
STATE = "gap_waves"
VERSION = "waves-v1"
OPEN = ("queued", "claimed")

# Working backward from today. `end: None` is the start of the current year (the current year is ingestion's).
DEFAULT_WAVES = [
    {"name": "W1", "start": 1925, "end": None, "window": 5},
    {"name": "W2", "start": 1800, "end": 1925, "window": 10},
    {"name": "W3", "start": 1500, "end": 1800, "window": 25},
    {"name": "W4", "start": 1000, "end": 1500, "window": 50},
    {"name": "W5", "start": -1000, "end": 1000, "window": 100},
    {"name": "W6", "start": -3500, "end": -1000, "window": 250},
]

DEFAULTS = {
    "wide_regions": ["faiths", "culture"],     # religions, philosophies, arts and sport: windows wide_factor × wider
    "wide_factor": 4,
    "exempt_regions": ["cosmos", "life", "humans"],  # deep-time lanes, not history
    "min_overlap": 0.5,          # a branch counts in a window it is alive for at least this share of
    "density_floor": 0.34,       # sparse: fewer events than this × the peers' median (a third: 1 event where peers have 3) …
    "min_peer_median": 3,        # … when that median is at least this
    "min_peers": 3,              # peers: other branches of the region alive in the window; fewer → every branch alive in it
    "max_open_per_branch": 1,    # one open fill_gap per branch: an agent sees its neighbors' work, and the cap spreads
    "advance_below": 5,          # the active wave advances when its open tasks + held gaps drop below this
    # Days a window is left alone after a task on it ends, by how it ended.
    "retry_after_days": {"nothing_notable": 180, "written": 60, "failed": 30, "cancelled": 0},
}


def rules() -> dict:
    over = getattr(settings, "GAP_RULES", {}) or {}
    out = {**DEFAULTS, **over}
    out["retry_after_days"] = {**DEFAULTS["retry_after_days"], **(over.get("retry_after_days") or {})}
    return out


def waves() -> list[dict]:
    return [dict(w) for w in (getattr(settings, "CONTENT_WAVES", None) or DEFAULT_WAVES)]


def _num(x: float):
    return int(x) if float(x).is_integer() else round(x, 3)


def fmt_year(y: float) -> str:
    y = _num(y)
    return f"{-y} BCE" if y < 0 else str(y)


def label(ws: float, we: float) -> str:
    return f"{fmt_year(ws)}–{fmt_year(we)}"


def wave_end(wave: dict, today: date) -> float:
    return wave["end"] if wave.get("end") is not None else today.year


def windows(wave: dict, today: date, *, wide: bool = False) -> list[tuple[float, float]]:
    """The wave's windows, oldest first: [start, end) steps of its size; a tail shorter than half a window joins the
    last one (W1's 2025 → 2020–2026), a longer one is a window of its own."""
    size = wave["window"] * (rules()["wide_factor"] if wide else 1)
    start, end = wave["start"], wave_end(wave, today)
    out, s = [], start
    while s + size <= end:
        out.append((s, s + size))
        s += size
    if end - s > 0:
        if out and end - s < size / 2:
            out[-1] = (out[-1][0], end)
        else:
            out.append((s, end))
    return out


def in_window(e: dict, ws: float, we: float) -> bool:
    """An event counts in a window if it happened in it, or (an event with an end) its span overlaps it."""
    if e["y"] >= we:
        return False
    return e["end"] > ws if e.get("end") is not None else e["y"] >= ws


def key(slug: str, ws: float, we: float) -> str:
    return f"gap:{slug}:{_num(ws)}:{_num(we)}"


# ── the active wave ──

def state():
    from ingest.models import JobState

    st, _ = JobState.objects.get_or_create(name=STATE, defaults={"state": {"active": waves()[0]["name"], "history": []}})
    return st


def active_index(st=None) -> int:
    names = [w["name"] for w in waves()]
    st = st or state()
    a = st.state.get("active")
    return names.index(a) if a in names else 0


def set_active(name: str, *, by: str, reason: str) -> tuple[str, str]:
    """Make `name` the active wave (`manage.py waves advance`, or the job). → (old, new)"""
    names = [w["name"] for w in waves()]
    if name not in names:
        raise ValueError(f"no wave {name!r} (waves: {', '.join(names)})")
    st = state()
    old = names[active_index(st)]
    st.state = {**st.state, "active": name,
                "history": [*st.state.get("history", []), {"from": old, "to": name, "by": by, "at": timezone.now().isoformat(timespec="seconds"), "reason": reason}][-50:]}
    st.save(update_fields=["state", "updated_at"])
    return old, name


# ── detection ──

@dataclass
class Gap:
    branch: str
    wave: int          # index into waves()
    ws: float
    we: float
    kind: str          # "empty" | "sparse"
    count: int
    peer_median: float | None
    peer_group: str
    run: dict = field(default_factory=dict)  # the run of consecutive gap windows this one is in
    importance: float = 0.0

    @property
    def key(self) -> str:
        return key(self.branch, self.ws, self.we)

    @property
    def run_years(self) -> float:
        return self.run.get("years", self.we - self.ws)


def _pct_ranks(values: dict[str, float]) -> dict[str, float]:
    """slug → percentile rank 0–1 (ties share their average rank)."""
    if not values:
        return {}
    order = sorted(values.items(), key=lambda kv: kv[1])
    n, out, i = len(order), {}, 0
    while i < n:
        j = i
        while j + 1 < n and order[j + 1][1] == order[i][1]:
            j += 1
        r = ((i + j) / 2) / (n - 1) if n > 1 else 1.0
        for k in range(i, j + 1):
            out[order[k][0]] = r
        i = j + 1
    return out


def importance(M: dict) -> dict[str, dict]:
    """slug → {"score", "events", "degree", "pageviews", ranks}: the mean percentile rank of the branch's event count,
    its link degree (event links both ways and lineage links) and, where ingestion knows it, its Wikipedia pageviews."""
    from ingest.models import BranchEntity

    events = {s: m["events"] for s, m in M.items()}
    degree = {s: sum(m["links"]["out"].values()) + sum(m["links"]["in"].values())
              + len(m["structure"]["parents"]) + len(m["structure"]["into"]) + len(m["structure"]["children"]) for s, m in M.items()}
    views = defaultdict(int)
    for slug, pv in BranchEntity.objects.filter(branch__slug__in=list(M), entity__pageviews_30d__isnull=False).values_list("branch__slug", "entity__pageviews_30d"):
        views[slug] = max(views[slug], pv)
    re, rd, rv = _pct_ranks(events), _pct_ranks(degree), _pct_ranks(dict(views))
    out = {}
    for s in M:
        parts = [re[s], rd[s]] + ([rv[s]] if s in rv else [])
        out[s] = {"score": round(sum(parts) / len(parts), 4), "events": events[s], "degree": degree[s], "pageviews": views.get(s),
                  "events_rank": round(re[s], 3), "degree_rank": round(rd[s], 3), "pageviews_rank": round(rv[s], 3) if s in rv else None}
    return out


def detect(today: date, M: dict | None = None, context: dict | None = None) -> tuple[list[Gap], dict]:
    """Every gap in every wave, and coverage per wave: {wave: {"pairs", "covered", "empty", "sparse", "branches"}}."""
    R = rules()
    ctx = context if context is not None else {}
    if M is None:
        M = gm.compute(today, context=ctx)
    now = gm.now_year(today)
    live = {s: m for s, m in M.items() if m["region"] not in R["exempt_regions"]}
    gaps, coverage = [], {}
    for wi, wave in enumerate(waves()):
        cov = Counter()
        branches_seen = set()
        for wide in (False, True):
            members = {s: m for s, m in live.items() if (m["region"] in R["wide_regions"]) == wide}
            wins = windows(wave, today, wide=wide)
            counts = {}  # (slug, i) → events in window i, for branches alive in it
            for s, m in members.items():
                start, end = m["start"], (m["end"] if m["end"] is not None else now)
                rows = m["_event_rows"]
                for i, (ws, we) in enumerate(wins):
                    if min(we, end) - max(ws, start) < R["min_overlap"] * (we - ws):
                        continue
                    counts[(s, i)] = sum(1 for e in rows if in_window(e, ws, we))
            alive = defaultdict(list)  # window → [(slug, count)]
            for (s, i), n in counts.items():
                alive[i].append((s, n))
            found = defaultdict(list)  # slug → [gap]
            for (s, i), n in sorted(counts.items(), key=lambda kv: (kv[0][0], kv[0][1])):
                ws, we = wins[i]
                region = members[s]["region"]
                same = [c for t, c in alive[i] if t != s and members[t]["region"] == region]
                group = f"{region} / {label(ws, we)}"
                if len(same) < R["min_peers"]:
                    same, group = [c for t, c in alive[i] if t != s], f"all / {label(ws, we)}"
                med = median(same) if same else None
                cov["pairs"] += 1
                branches_seen.add(s)
                if n:
                    cov["covered"] += 1
                if n == 0:
                    kind = "empty"
                elif med is not None and med >= R["min_peer_median"] and n < R["density_floor"] * med:
                    kind = "sparse"
                else:
                    continue
                cov[kind] += 1
                found[s].append(Gap(s, wi, ws, we, kind, n, round(med, 2) if med is not None else None, group))
            win_i = {w: i for i, w in enumerate(wins)}
            for s, gs in found.items():
                runs, cur = [], [gs[0]]
                for g in gs[1:]:
                    if win_i[(g.ws, g.we)] == win_i[(cur[-1].ws, cur[-1].we)] + 1:
                        cur.append(g)
                    else:
                        runs.append(cur)
                        cur = [g]
                runs.append(cur)
                for run in runs:
                    info = {"from": _num(run[0].ws), "to": _num(run[-1].we), "years": _num(run[-1].we - run[0].ws), "windows": len(run)}
                    for g in run:
                        g.run = info
                gaps += gs
        coverage[wave["name"]] = {**{k: cov[k] for k in ("pairs", "covered", "empty", "sparse")}, "branches": len(branches_seen),
                                  "share_covered": round(cov["covered"] / cov["pairs"], 3) if cov["pairs"] else None}
    imp = importance(live)
    for g in gaps:
        g.importance = imp[g.branch]["score"]
    ctx["importance"] = imp
    ctx["metrics"] = M
    return gaps, coverage


def order(gaps: list[Gap]) -> list[Gap]:
    """Best first: wave (recent first), branch importance, the length of the silence, the most recent window, slug."""
    return sorted(gaps, key=lambda g: (g.wave, -g.importance, -g.run_years, -g.ws, g.branch))


def priority(g: Gap) -> int:
    """10–69 for six waves: a band of ten per wave (W1 60–69 … W6 10–19), plus importance within it. Ties are broken
    by creation order, which follows `order()`."""
    return max(0, 60 - 10 * g.wave) + min(9, int(g.importance * 10))


# ── payloads ──

def _brief(e: dict) -> dict:
    out = {"id": e["slug"], "title": e["title"], "when": e["when"], "y": _num(e["y"])}
    if e.get("end") is not None:
        out["end"] = _num(e["end"])
    return out


def id_prefixes(rows: list[dict]) -> list[dict]:
    """The prefixes the branch's ids use, most common first ("ga1", or "n92-sn" where a two-letter code follows)."""
    c = Counter()
    for e in rows:
        parts = e["slug"].split("-")
        p = parts[0] + (f"-{parts[1]}" if len(parts) > 2 and len(parts[1]) == 2 else "")
        c[p] += 1
    return [{"prefix": p, "events": n} for p, n in c.most_common(3)]


def branch_refs(slugs: list[str]) -> dict[str, dict]:
    """slug → {"wikipedia": [article URLs it cites], "qids": [{qid, label, role, wikipedia}]} (routing's BranchEntity)."""
    from evidence.models import Evidence
    from ingest.models import BranchEntity

    out = {s: {"wikipedia": [], "qids": []} for s in slugs}
    for slug, url in (Evidence.objects.filter(claim__entry__slug__in=slugs, claim__parent__isnull=True, citation__url__contains="wikipedia.org/wiki/")
                      .order_by("claim__entry__slug", "position", "pk").values_list("claim__entry__slug", "citation__url")):
        if url not in out[slug]["wikipedia"]:
            out[slug]["wikipedia"].append(url)
    for slug, qid, lab, role, wiki in (BranchEntity.objects.filter(branch__slug__in=slugs).exclude(role="member")
                                       .order_by("branch__slug", "-weight", "entity__qid")
                                       .values_list("branch__slug", "entity__qid", "entity__label", "role", "entity__enwiki_title")):
        if len(out[slug]["qids"]) < 5:
            out[slug]["qids"].append({"qid": qid, "label": lab, "role": role, "wikipedia": wiki})
    return out


def article_title(refs: dict, name: str) -> str:
    """The branch's Wikipedia article: its first QID's article, else the first article it cites, else its name."""
    for q in refs.get("qids", []):
        if q.get("wikipedia"):
            return q["wikipedia"]
    for u in refs.get("wikipedia", []):
        if "en.wikipedia.org/wiki/" in u:
            return unquote(u.split("/wiki/", 1)[1].split("#")[0]).replace("_", " ")
    return name


def payload(g: Gap, M: dict, ctx: dict, refs: dict, imp: dict) -> dict:
    m = M[g.branch]
    b = ctx["branches"][g.branch]
    wave = waves()[g.wave]
    rows = m["_event_rows"]
    stop = lambda e: e["end"] if e["end"] is not None else e["y"]  # noqa: E731
    before = [e for e in rows if stop(e) < g.ws and not in_window(e, g.ws, g.we)][-3:]
    after = [e for e in rows if e["y"] >= g.we][:3]
    inside = [e for e in rows if in_window(e, g.ws, g.we)]
    wide = m["region"] in rules()["wide_regions"]
    return {
        "version": VERSION,
        "wave": {"name": wave["name"], "from": wave["start"], "to": wave_end(wave, ctx["today"]), "window_years": _num(g.we - g.ws), "wide": wide},
        "window": {"from": _num(g.ws), "to": _num(g.we), "label": label(g.ws, g.we),
                   "note": "From the first year up to, not including, the second; y must fall inside (or a span overlap it)."},
        "gap": {"kind": g.kind, "events_in_window": g.count, "peer_median": g.peer_median, "peers": g.peer_group, "run": g.run},
        "branch": {
            "id": b.slug, "name": b.name, "text": b.text, "start": _num(b.start), "end": _num(b.end) if b.end is not None else None,
            "start_when": b.start_when, "end_when": b.end_when or "", "region": {"slug": b.region.slug, "name": b.region.name},
            "parents": m["structure"]["parents"], "into": m["structure"]["into"], "children": m["structure"]["children"],
            "links_out": dict(list(m["links"]["out"].items())[:8]), "links_in": dict(list(m["links"]["in"].items())[:8]),
            "events": m["events"], "id_prefixes": id_prefixes(rows), "wikipedia": refs["wikipedia"][:5], "qids": refs["qids"],
            "article": article_title(refs, b.name),
        },
        "before": [_brief(e) for e in before],
        "after": [_brief(e) for e in after],
        "in_window": [_brief(e) for e in inside][:10],
        "priority_parts": {"wave": wave["name"], "band": max(0, 60 - 10 * g.wave), "importance": imp[g.branch], "run_years": g.run_years},
        "instructions": ("Skill: .claude/skills/fill-gaps. Write 1–3 events for this branch in this window, in SCHEMA style, each citing pages "
                         "you actually read (at least one not Wikipedia), or report that nothing notable is sourceable. `pointers` (added "
                         "by the gap_pointers job) are unread suggestions, not evidence."),
    }


# ── queueing ──

def _outcome(t: AgentTask) -> str:
    if t.status == "done":
        return "nothing_notable" if (t.result or {}).get("decision") == "nothing_notable" else "written"
    return t.status


def suppressed(t: AgentTask | None, now: datetime) -> str:
    """Why a window's last task keeps it from being queued again: "open", "recent_<outcome>", or ""."""
    if t is None:
        return ""
    if t.status in OPEN:
        return "open"
    days = rules()["retry_after_days"].get(_outcome(t), 0)
    if days and t.completed_at and t.completed_at + timedelta(days=days) > now:
        return f"recent_{_outcome(t)}"
    return ""


def run(*, now: datetime | None = None, per_day: int | None = None, dry_run: bool = False) -> dict:
    """The gap_waves job: detect, queue fill_gap tasks under the caps, cancel tasks whose window filled, advance the
    active wave when it is nearly done. → a summary (also kept in JobState "gap_waves" for the digest)."""
    now = now or timezone.now()
    today = timezone.localtime(now).date()
    per_day = settings.FILL_GAP_TASKS_PER_DAY if per_day is None else per_day
    names = [w["name"] for w in waves()]
    counts = Counter()
    plan = []
    with transaction.atomic():
        ctx = {"today": today}
        gaps, coverage = detect(today, context=ctx)
        M, imp = ctx["metrics"], ctx["importance"]
        keys = {g.key for g in gaps}
        # Windows that are no longer gaps (events were published there): withdraw their queued tasks.
        for t in AgentTask.objects.filter(kind=KIND, created_by=ACTOR, status="queued"):
            if t.dedupe_key not in keys:
                t.status, t.completed_at, t.error = "cancelled", now, (t.error + "\n" if t.error else "") + f"{ACTOR}: the window is no longer a gap"
                t.save(update_fields=["status", "completed_at", "error"])
                counts["cancelled_filled"] += 1
        refs = branch_refs(sorted({g.branch for g in gaps}))
        last = {}
        for t in AgentTask.objects.filter(kind=KIND, dedupe_key__in=keys).order_by("created_at", "id"):
            last[t.dedupe_key] = t
        open_by_branch = Counter(p.get("branch", {}).get("id") for p in AgentTask.objects.filter(kind=KIND, status__in=OPEN).values_list("payload", flat=True))
        midnight = timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)
        room = max(0, per_day - AgentTask.objects.filter(kind=KIND, created_by=ACTOR, created_at__gte=midnight).count())
        R = rules()
        advanced = []
        while True:
            ai = active_index()
            held_active = 0
            wc = Counter()  # this pass's per-wave counts (a pass after an advance sees the earlier pass's tasks as open)
            for g in order([g for g in gaps if g.wave <= ai]):
                t = last.get(g.key)
                why = suppressed(t, now)
                wname = names[g.wave]
                if why == "open":
                    wc[f"{wname}.open"] += 1
                    if t.status == "queued" and not dry_run:
                        p = payload(g, M, ctx, refs[g.branch], imp)
                        keep = {k: t.payload[k] for k in ("pointers", *PREFETCH_KEYS, *QUEUE_KEYS) if k in (t.payload or {})}
                        if {**p, **keep} != t.payload or t.priority != priority(g):
                            t.payload, t.priority = {**p, **keep}, priority(g)
                            t.save(update_fields=["payload", "priority"])
                            counts["refreshed"] += 1
                    continue
                if why:
                    wc[f"{wname}.{why}"] += 1
                    continue
                if open_by_branch[g.branch] >= R["max_open_per_branch"]:
                    wc[f"{wname}.held_branch"] += 1
                    held_active += g.wave == ai
                    continue
                if room <= 0:
                    wc[f"{wname}.held_cap"] += 1
                    held_active += g.wave == ai
                    continue
                p = payload(g, M, ctx, refs[g.branch], imp)
                task, created = enqueue(KIND, created_by=ACTOR, dedupe_key=g.key, priority=priority(g), payload=p,
                                        target_entry=ctx["branches"][g.branch].entry_ptr)
                last[g.key] = task
                open_by_branch[g.branch] += 1
                room -= 1
                wc[f"{wname}.queued"] += 1
                plan.append({"task": task.pk, "branch": g.branch, "window": label(g.ws, g.we), "wave": wname, "kind": g.kind, "priority": priority(g)})
            open_active = sum(1 for t in AgentTask.objects.filter(kind=KIND, status__in=OPEN).only("payload")
                              if (t.payload or {}).get("wave", {}).get("name") == names[ai])
            outstanding = open_active + held_active
            wc[f"{names[ai]}.outstanding"] = outstanding
            if ai + 1 < len(names) and outstanding < R["advance_below"]:
                set_active(names[ai + 1], by=ACTOR, reason=f"{names[ai]}: {outstanding} outstanding (open tasks + held gaps) < {R['advance_below']}")
                advanced.append(names[ai + 1])
                continue
            break
        counts.update(wc)
        counts["queued"] = len(plan)
        found = Counter(names[g.wave] for g in gaps)
        summary = {
            "at": now.isoformat(timespec="seconds"), "version": VERSION, "active": names[active_index()], "advanced_to": advanced,
            "gaps": dict(found), "gaps_by_kind": {w: dict(Counter(g.kind for g in gaps if names[g.wave] == w)) for w in found},
            "coverage": coverage, "counts": dict(sorted(counts.items())), "per_day": per_day, "dry_run": dry_run,
        }
        if dry_run:
            transaction.set_rollback(True)
        else:
            st = state()
            st.state = {**st.state, "last_run": summary}
            st.save(update_fields=["state", "updated_at"])
    summary["queued"] = plan
    return summary


def digest_section() -> str:
    """The waves, for `manage.py digest`: the active wave, the last run's gaps, what was queued or held, coverage."""
    st = state()
    names = [w["name"] for w in waves()]
    active = names[active_index(st)]
    last = st.state.get("last_run") or {}
    out = [f"## Content waves (active: {active})", ""]
    open_by = Counter((p or {}).get("wave", {}).get("name") for p in AgentTask.objects.filter(kind=KIND, status__in=OPEN).values_list("payload", flat=True))
    if not last:
        out.append(f"No gap_waves run yet. Open fill_gap tasks: {sum(open_by.values())}.")
        return "\n".join(out) + "\n"
    c = last.get("counts", {})
    out.append(f"Last run {last.get('at', '?')[:16]}: queued {c.get('queued', 0)} (cap {last.get('per_day')}/day)"
               + (f"; advanced to {', '.join(last['advanced_to'])}" if last.get("advanced_to") else "") + ".")
    out += ["", "| wave | windows covered | gaps (empty / sparse) | open | held (cap / branch) | recently tried |", "|---|---:|---:|---:|---:|---:|"]
    for w in waves():
        n = w["name"]
        cov = (last.get("coverage") or {}).get(n) or {}
        share = f"{cov['share_covered']:.0%} of {cov['pairs']}" if cov.get("share_covered") is not None else "—"
        recent = sum(v for k, v in c.items() if k.startswith(f"{n}.recent_"))
        mark = " ◀" if n == active else ""
        out.append(f"| {n} {label(w['start'], w['end'] if w.get('end') is not None else date.today().year)}{mark} | {share} | {cov.get('empty', 0)} / {cov.get('sparse', 0)} "
                   f"| {open_by.get(n, 0)} | {c.get(f'{n}.held_cap', 0)} / {c.get(f'{n}.held_branch', 0)} | {recent} |")
    out.append("\nWork them with the `fill-gaps` skill; `manage.py waves status` / `waves advance` (the owner).")
    return "\n".join(out) + "\n"


__all__ = ["DEFAULT_WAVES", "DEFAULTS", "Gap", "detect", "digest_section", "order", "priority", "run", "set_active", "waves", "windows"]
