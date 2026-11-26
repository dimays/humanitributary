"""manage.py apply_edits <file.json> --actor human:owner [--dry-run | --validate-only]

Apply a reviewer's verdicts (an edit file, timeline/edits.py) in one audited transaction: every op is checked first,
then applied in order inside revising(actor), each with its own reason; any problem lists them all and keeps nothing.
--dry-run prints the Revisions it would write and rolls back; --validate-only checks the file's shape and limits
(and that the branches it names exist) without reading the entries it changes.
"""

from collections import Counter

from django.core.management.base import BaseCommand, CommandError

from timeline import edits


class Command(BaseCommand):
    help = "Apply an edit file of reviewer verdicts (edit, rename, approve, reject, add_evidence, resolve_conflict) atomically."

    def add_arguments(self, parser):
        parser.add_argument("file")
        parser.add_argument("--actor", help='Who is applying it: "human:owner", "agent:reviewer" … (required unless --validate-only)')
        mode = parser.add_mutually_exclusive_group()
        mode.add_argument("--dry-run", action="store_true", help="Apply, print the diff, then roll everything back.")
        mode.add_argument("--validate-only", action="store_true", help="Check shape and limits only; no entry needs to exist.")

    def handle(self, *args, file, actor, dry_run, validate_only, **opts):
        try:
            ops = edits.load(file)
            if validate_only:
                problems = edits.check(ops)
                if problems:
                    raise edits.EditsInvalid(problems)
                counts = Counter(op["op"] for op in ops)
                self.stdout.write(f"{file}: {len(ops)} ops valid ({self._counts(counts)}); entries, claims and cites not checked")
                return
            if not actor:
                raise CommandError("--actor is required (e.g. --actor human:owner)")
            out = edits.apply(ops, actor=actor, source=file, dry_run=dry_run)
        except edits.EditsInvalid as e:
            raise CommandError(f"{file}: nothing applied. {e}") from e
        for i, op, notes, lines in out.ops:
            self.stdout.write(f"#{i} {op['op']} {op['entry']}: {op['reason']}")
            for n in notes:
                self.stdout.write(f"  = {n}")
            for line in lines:
                self.stdout.write(line)
        verdict = "dry run, rolled back: nothing written" if dry_run else f"applied as {actor}"
        self.stdout.write(f"{len(out.ops)} ops ({self._counts(out.counts)}), {out.revisions} revisions: {verdict}")

    @staticmethod
    def _counts(c: Counter) -> str:
        return ", ".join(f"{k} {v}" for k, v in sorted(c.items()))
