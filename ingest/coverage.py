"""Evidence coverage: how many queued tasks have a non-Wikipedia `allowed` source pre-fetched, by task kind, region
and era, and which hosts and reasons leave pages to read by hand (docs/adr/0036-evidence-packs.md). Behind
`manage.py evidence_coverage`; it reads the queue and the page rows and makes no request.

Three numbers per group: **ready** (the pack holds at least one stored non-Wikipedia page), **possible** (the task
points at at least one non-Wikipedia URL the policy lets a job fetch, read or not) and **open** (such a URL whose
site hasn't refused us: no robots.txt refusal, bot wall or TDM reservation on record). A low "possible" is where new
sources are needed; "possible" well above "open" means the sources found are on sites that refuse automated
readers; "open" above "ready" is the job's backlog.
"""

from collections import Counter, defaultdict

from urllib.parse import urlsplit

from django.utils import timezone

from evidence.publishers import domain_of
from timeline.models import Branch
from work.models import AgentTask

from . import prefetch

ERAS = [(1900, None, "1900–now"), (1800, 1900, "1800–1900"), (1500, 1800, "1500–1800"), (500, 1500, "500–1500"),
        (-1000, 500, "1000 BCE–500 CE"), (None, -1000, "before 1000 BCE")]


def era(y) -> str:
    if y is None:
        return "unknown"
    for lo, hi, name in ERAS:
        if (lo is None or y >= lo) and (hi is None or y < hi):
            return name
    return "unknown"


def _where(t: AgentTask, regions: dict) -> tuple[str, float | None]:
    p = t.payload or {}
    if t.kind == "write_event":
        s = p.get("suggested") or {}
        b = (s.get("branches") or [{}])[0].get("slug")
        return regions.get(b, "unknown"), s.get("y")
    if t.kind == "fill_gap":
        w = p.get("window") or {}
        mid = (w["from"] + w["to"]) / 2 if "from" in w and "to" in w else None
        return ((p.get("branch") or {}).get("region") or {}).get("slug", "unknown"), mid
    e = t.target_entry
    if e is None:
        return "unknown", None
    x = e.concrete
    if e.kind == "event":
        return regions.get(x.branch.slug, "unknown"), x.y
    return x.region.slug, x.start


def _fetchable(fetcher, c) -> bool:
    """The policy lets the job read it: the page itself, or (unrated, robots, a bot wall) its official API."""
    from . import prefetch_api

    why = prefetch.policy_reason(fetcher, c.url)[0]
    if not why:
        return True
    return why == "unrated" and isinstance(prefetch_api.route(c.url, c.hit), prefetch_api.Route)


def unrated(tasks=None, fetcher=None) -> list[dict]:
    """The domains queued tasks point at that have no rating (no Publisher row, or one without a tier), with how
    many tasks and URLs name each and an example: what a source-discovery round rates, terms first."""
    from evidence.models import Publisher
    from ingest.http import Fetcher

    fetcher = fetcher or Fetcher()
    tasks = tasks if tasks is not None else AgentTask.objects.filter(kind__in=prefetch.KINDS, status__in=["queued", "claimed"]).order_by("id")
    n_tasks, n_urls, example, kinds = Counter(), Counter(), {}, defaultdict(Counter)
    for t in tasks:
        seen = set()
        for c in prefetch.candidates(t, prefetch.DEFAULTS["urls"]):
            if prefetch.policy_reason(fetcher, c.url)[0] != "unrated":
                continue
            d = domain_of(c.url)
            n_urls[d] += 1
            example.setdefault(d, c.url)
            kinds[d][t.kind] += 1
            if d not in seen:
                seen.add(d)
                n_tasks[d] += 1
    rows = {p.domain: p for p in Publisher.objects.filter(domain__in=list(n_urls))}
    return [{"domain": d, "tasks": n_tasks[d], "urls": n, "kinds": dict(kinds[d]), "row": "unrated row" if d in rows else "no row",
             "policy": rows[d].fetch_policy if d in rows else "", "example": example[d]}
            for d, n in sorted(n_urls.items(), key=lambda kv: (-n_tasks[kv[0]], -kv[1], kv[0]))]


def report(fetcher=None) -> dict:
    """The coverage of the queued tasks the prefetch job serves."""
    from ingest.http import Fetcher
    from ingest.models import PrefetchedPage

    fetcher = fetcher or Fetcher()
    refusing = {"robots", "blocked", "tdm_reserved"}
    refused_urls = set(PrefetchedPage.objects.filter(status="unreadable", reason__in=refusing).values_list("url", flat=True))
    refused_hosts = set(PrefetchedPage.objects.filter(status="unreadable", reason__in=refusing).values_list("host", flat=True))
    regions = dict(Branch.objects.values_list("slug", "region__slug"))
    tasks = list(AgentTask.objects.filter(kind__in=prefetch.KINDS, status="queued").select_related("target_entry").order_by("kind", "id"))
    groups = {k: defaultdict(Counter) for k in ("kind", "region", "era", "kind_region", "kind_era")}
    reasons, hosts, policy_hosts, missing = Counter(), Counter(), Counter(), Counter()
    for t in tasks:
        p = t.payload or {}
        region, y = _where(t, regions)
        cands = prefetch.candidates(t, prefetch.DEFAULTS["urls"])
        allowed = [(c.key, c.url) for c in cands if not prefetch.is_wikipedia(c.key) and _fetchable(fetcher, c)]
        possible = bool(allowed)
        open_ = any(k not in refused_urls and (urlsplit(u).hostname or "").lower() not in refused_hosts for k, u in allowed)
        for c in cands:
            why = prefetch.policy_reason(fetcher, c.url)[0]
            if why:
                policy_hosts[(domain_of(c.url), why)] += 1
        ready = bool(p.get("evidence_ready"))
        ready_page = any(e.get("publisher") != "wikipedia.org" and not e.get("via") for e in p.get("evidence_pack", []))
        packed = "evidence_pack" in p
        for g, key in (("kind", t.kind), ("region", region), ("era", era(y)), ("kind_region", f"{t.kind} · {region}"), ("kind_era", f"{t.kind} · {era(y)}")):
            c = groups[g][key]
            c["tasks"] += 1
            c["packed"] += packed
            c["ready"] += ready
            c["ready_page"] += ready_page
            c["possible"] += possible
            c["open"] += open_
        if not possible:
            missing[(t.kind, region, era(y))] += 1
        for u in p.get("unreadable", []):
            reasons[u.get("reason", "")] += 1
            hosts[(domain_of(u.get("url", "")), u.get("reason", ""))] += 1
    share = lambda c, k: round(c[k] / c["tasks"], 3) if c["tasks"] else None  # noqa: E731
    out = {"at": timezone.now().isoformat(timespec="seconds"), "tasks": len(tasks), "groups": {}}
    for g, rows in groups.items():
        out["groups"][g] = sorted(({"group": k, **c, "ready_share": share(c, "ready"), "ready_page_share": share(c, "ready_page"), "possible_share": share(c, "possible"), "open_share": share(c, "open"),
                                    "packed_share": share(c, "packed")} for k, c in rows.items()), key=lambda r: (-r["tasks"], r["group"]))
    out["unreadable_reasons"] = reasons.most_common()
    out["unreadable_hosts"] = [{"host": h, "reason": r, "n": n} for (h, r), n in hosts.most_common(40)]
    out["policy_refused_hosts"] = [{"host": h, "reason": r, "n": n} for (h, r), n in policy_hosts.most_common(40)]
    out["no_allowed_source"] = [{"kind": k, "region": r, "era": e, "tasks": n} for (k, r, e), n in missing.most_common(40)]
    out["host_health"] = prefetch.health()[:40]
    out["unrated_domains"] = unrated(tasks, fetcher)
    out["via_api"] = Counter(e.get("api") for t in tasks for e in (t.payload or {}).get("evidence_pack", []) if e.get("via")).most_common()
    return out


def markdown(r: dict) -> str:
    pct = lambda x: "–" if x is None else f"{100 * x:.0f}%"  # noqa: E731
    lines = [f"# Evidence coverage, {r['at'][:16]} UTC", "",
             f"{r['tasks']} queued write_event, fill_gap and verify_claim tasks. **Ready**: the pack holds a stored non-Wikipedia "
             "page or an official API's record of one; **Ready (page)**: the page itself. **Possible**: the task points at a non-Wikipedia URL the policy lets a job fetch. **Open**: one whose site "
             "has not refused us (robots.txt, a bot wall, a TDM reservation). Low possible: new sources are needed. Possible "
             "above open: the sources found are on sites that refuse automated readers. Open above ready: the job's backlog.", ""]
    for g, title in (("kind", "By task kind"), ("region", "By region"), ("era", "By era"), ("kind_era", "By kind and era"), ("kind_region", "By kind and region")):
        lines += [f"## {title}", "", "| Group | Tasks | Packed | Ready | Ready (page) | Open | Possible |", "|---|---:|---:|---:|---:|---:|---:|"]
        lines += [f"| {x['group']} | {x['tasks']} | {pct(x['packed_share'])} | {pct(x['ready_share'])} | {pct(x['ready_page_share'])} | {pct(x['open_share'])} | {pct(x['possible_share'])} |"
                  for x in r["groups"][g]]
        lines.append("")
    lines += ["## Where no allowed non-Wikipedia source is known", "", "| Kind | Region | Era | Tasks |", "|---|---|---|---:|"]
    lines += [f"| {x['kind']} | {x['region']} | {x['era']} | {x['tasks']} |" for x in r["no_allowed_source"]] + [""]
    lines += ["## Left to read by hand: reasons", "", "| Reason | Pages |", "|---|---:|"] + [f"| {k} | {n} |" for k, n in r["unreadable_reasons"]] + [""]
    lines += ["## Left to read by hand: hosts", "", "| Host | Reason | Pages |", "|---|---|---:|"] + [f"| {x['host']} | {x['reason']} | {x['n']} |" for x in r["unreadable_hosts"]] + [""]
    lines += ["## Hosts the policy keeps jobs off (cited or suggested)", "", "| Host | Policy | URLs |", "|---|---|---:|"]
    lines += [f"| {x['host']} | {x['reason']} | {x['n']} |" for x in r["policy_refused_hosts"]] + [""]
    lines += ["## Stored through an official API", "", "| API | Pages in packs |", "|---|---:|"] + [f"| {k} | {n} |" for k, n in r["via_api"]] + [""]
    lines += ["## Unrated domains the tasks point at (rate them, terms first)", "", "| Domain | Tasks | URLs | Row | Example |", "|---|---:|---:|---|---|"]
    lines += [f"| {x['domain']} | {x['tasks']} | {x['urls']} | {x['row']} | {x['example'][:90]} |" for x in r["unrated_domains"][:60]] + [""]
    lines += ["## Host health (last 30 days of prefetch requests)", "", "| Host | Outcomes |", "|---|---|"]
    lines += [f"| {x['host']} | {', '.join(f'{k} {v}' for k, v in x.items() if k != 'host')} |" for x in r["host_health"]] + [""]
    return "\n".join(lines)

