"""The technical guide's tools (docs/guide/README.md, ADR 0014):

    manage.py guide check                 every chapter whole and true to its code (make check-guide)
    manage.py guide stamp ingestion …     record that you reviewed a chapter against the code
                                          as it is now (make guide-stamp CHAPTER=ingestion)
    manage.py guide status                each chapter, when it was reviewed, fresh or not
    manage.py guide covers ingestion      the files a chapter covers
    manage.py guide index                 rewrite the README's chapter list (make guide-index)
"""

import sys

from django.core.management.base import BaseCommand, CommandError

from guide import checks, coverage
from guide.chapters import all_chapters, find, read_stamps


class Command(BaseCommand):
    help = "Check the technical guide against the code, or stamp a chapter as reviewed."
    requires_system_checks = []  # no database, no models: it runs anywhere, fast

    def add_arguments(self, parser):
        parser.add_argument("action", choices=["check", "stamp", "status", "covers", "index"])
        parser.add_argument("chapters", nargs="*", help="for stamp and covers: a chapter's name (ingestion, publishing)")

    def handle(self, action, chapters, **opts):
        getattr(self, f"do_{action}")(chapters)

    def do_check(self, names):
        report = checks.run()
        if report.problems:
            self.stderr.write("\n".join(report.problems))
            n = len(report.problems)
            self.stderr.write(
                f"\n{n} problem{'s' if n != 1 else ''} in the technical guide. "
                "Every change that alters behavior updates the guide in the same PR (AGENTS.md rule 14)."
            )
            sys.exit(1)
        self.stdout.write(checks.summary(report))

    def _chapters(self, names):
        if not names:
            raise CommandError("name a chapter: make guide-stamp CHAPTER=ingestion (manage.py guide status lists them)")
        out = []
        for name in names:
            ch = find(name)
            if ch is None:
                raise CommandError(f"no chapter {name!r}: manage.py guide status lists them")
            out.append(ch)
        return out

    def do_stamp(self, names):
        report = checks.run(freshness=False)
        for ch in self._chapters(names):
            own = [p for p in report.problems if p.startswith((f"✖ {ch.rel}:", f"✖ {ch.rel} "))]
            if own:
                raise CommandError(f"{ch.slug} has problems to fix before it's stamped:\n" + "\n".join(own))
            try:
                value = coverage.stamp(ch)
            except ValueError as e:
                raise CommandError(str(e)) from None
            n = len(coverage.covered(ch)[0])
            self.stdout.write(
                f"Stamped {ch.slug}: reviewed {value['reviewed']}, hash {value['hash']} ({n} covered file{'s' if n != 1 else ''}). "
                f"Commit docs/guide/stamps.json and {ch.rel} with the change."
            )

    def do_status(self, names):
        files = coverage.repo_files()
        stamps = read_stamps()
        for ch in all_chapters():
            fresh = coverage.freshness(ch, files, stamps)
            state = f"fresh ({len(fresh.files)} files)" if fresh.fresh else f"NEEDS REVIEW ({len(fresh.files)} files)"
            self.stdout.write(f"{ch.slug:<28} {fresh.reviewed_on or '—':<11} {state}")

    def do_covers(self, names):
        for ch in self._chapters(names):
            paths, empty = coverage.covered(ch)
            self.stdout.write("\n".join(paths))
            for p in empty:
                self.stderr.write(f"(matches nothing: {p})")

    def do_index(self, names):
        checks.readme_problem(all_chapters(), write=True)
        self.stdout.write("Wrote the chapter list in docs/guide/README.md.")
