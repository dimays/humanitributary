"""Content waves (governance/waves.py, docs/guide/content-waves.md). The job is `gap_waves` (`run_jobs`); this is the
owner's view and lever.

    manage.py waves status                       # the waves, the active one, coverage and gaps per wave (no writes)
    manage.py waves gaps [--wave W1] [--top 20]  # what the job would queue now, best first (a dry run: no writes)
    manage.py waves run [--per-day 20]           # the job, once (= run_job gap_waves)
    manage.py waves advance [--to W3] --by human:owner   # move the active wave on (next, or the one named)
"""

import json

from django.core.management.base import BaseCommand, CommandError

from governance import waves
from revisions.context import ACTOR_RE


class Command(BaseCommand):
    help = "Content waves: the active wave, gaps per wave, what gap_waves would queue, and moving the active wave on."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest="action", required=True)
        sub.add_parser("status")
        p = sub.add_parser("gaps")
        p.add_argument("--wave", help="Only this wave's gaps (default: the waves the job queues, up to the active one).")
        p.add_argument("--top", type=int, default=20)
        p.add_argument("--json", action="store_true")
        p = sub.add_parser("run")
        p.add_argument("--per-day", type=int)
        p = sub.add_parser("advance")
        p.add_argument("--to", help="A wave name (default: the next one).")
        p.add_argument("--by", default="human:owner")
        p.add_argument("--reason", default="by command")

    def handle(self, *args, action, **o):
        w = self.stdout.write
        names = [x["name"] for x in waves.waves()]
        if action == "status":
            from datetime import date

            gaps, coverage = waves.detect(date.today())
            ai = waves.active_index()
            w(f"Active wave: {names[ai]}")
            for i, wave in enumerate(waves.waves()):
                c = coverage[wave["name"]]
                n = sum(1 for g in gaps if g.wave == i)
                share = f"{c['share_covered']:.0%}" if c["share_covered"] is not None else "—"
                w(f"{'▶' if i == ai else ' '} {wave['name']} {waves.label(wave['start'], waves.wave_end(wave, date.today()))} "
                  f"({wave['window']}-year windows): {c['branches']} branches, {c['pairs']} branch-windows, {share} covered; "
                  f"{n} gaps ({c['empty']} empty, {c['sparse']} sparse)")
            return
        if action == "gaps":
            if o["wave"] and o["wave"] not in names:
                raise CommandError(f"no wave {o['wave']!r} (waves: {', '.join(names)})")
            from datetime import date

            gaps, _ = waves.detect(date.today())
            ai = waves.active_index()
            pick = [g for g in gaps if (names[g.wave] == o["wave"] if o["wave"] else g.wave <= ai)]
            out = waves.run(dry_run=True)
            would = out["queued"]
            if o["json"]:
                w(json.dumps({"gaps": len(pick), "would_queue": would[: o["top"]], "counts": out["counts"]}, indent=2, ensure_ascii=False))
                return
            w(f"{len(pick)} gaps{' in ' + o['wave'] if o['wave'] else ' up to ' + names[ai]}; the job would queue {len(would)} now "
              f"(cap {out['per_day']}/day, one open per branch):")
            for r in would[: o["top"]]:
                w(f"  {r['priority']:>3}  {r['wave']}  {r['branch']:<28} {r['window']:<16} {r['kind']}")
            if o["wave"]:
                w(f"\nBest {min(o['top'], len(pick))} gaps in {o['wave']} by the job's order:")
                for g in waves.order(pick)[: o["top"]]:
                    w(f"  {waves.priority(g):>3}  {g.branch:<28} {waves.label(g.ws, g.we):<16} {g.kind:<6} importance {g.importance:.2f}, run {g.run_years} years")
            return
        if action == "run":
            out = waves.run(per_day=o["per_day"])
            out.pop("coverage", None)
            w(json.dumps(out, indent=2, ensure_ascii=False))
            return
        if action == "advance":
            if not ACTOR_RE.match(o["by"]):
                raise CommandError("--by must be human:<name>, agent:<name> or job:<name>")
            ai = waves.active_index()
            to = o["to"] or (names[ai + 1] if ai + 1 < len(names) else None)
            if to is None:
                raise CommandError(f"{names[ai]} is the last wave")
            try:
                old, new = waves.set_active(to, by=o["by"], reason=o["reason"])
            except ValueError as e:
                raise CommandError(str(e)) from e
            w(f"Active wave: {old} → {new}")
