import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from publish.compare import differences
from publish.content import ADDITIVE, dumps, legacy_view


class Command(BaseCommand):
    help = ("Compare two content snapshots (a legacy dump and a release's content.json): normalized, then byte for byte. "
            "The keys a release adds that legacy files never have (publish/content.py ADDITIVE, ADR 0018) are left out of "
            "both first, unless --keep-additive.")

    def add_arguments(self, parser):
        parser.add_argument("a")
        parser.add_argument("b")
        parser.add_argument("--show", type=int, default=20, help="How many differences to print.")
        parser.add_argument("--keep-additive", action="store_true", help="Compare the additive keys too.")
        parser.add_argument("--write-legacy-view", metavar="PATH", default="", help="Write b without its additive keys here (for building the comparison page).")

    def handle(self, *args, a, b, show, keep_additive, write_legacy_view, **opts):
        ra, rb = Path(a).read_bytes(), Path(b).read_bytes()
        ca, cb = json.loads(ra), json.loads(rb)
        if not keep_additive:
            # A legacy dump has no additive keys, so its own bytes are what the stripped release must match.
            ca, cb = legacy_view(ca), legacy_view(cb)
            rb = dumps(cb).encode()
            if write_legacy_view:
                Path(write_legacy_view).write_bytes(rb)
        diffs = differences(ca, cb)
        for d in diffs[:show]:
            self.stdout.write(f"  {d}")
        if diffs:
            raise CommandError(f"{len(diffs)} differences between {a} and {b}")
        same_bytes = ra == rb
        extra = "" if keep_additive else f" (leaving out the additive keys {', '.join(k for ks in ADDITIVE.values() for k in ks)})"
        self.stdout.write(self.style.SUCCESS(f"Equal after normalizing; byte-identical: {'yes' if same_bytes else 'no'}{extra}"))
        if not same_bytes:
            raise CommandError("equal after normalizing but not byte for byte")
