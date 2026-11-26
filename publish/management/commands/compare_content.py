import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from publish.compare import differences
from publish.content import ADDITIVE, dumps, without_derived


class Command(BaseCommand):
    help = ("Compare two content snapshots (two releases' content.json, or a snapshot and a dump): structurally, entry "
            "by entry, then byte for byte. --drop-derived leaves out the keys the export derives (publish/content.py "
            "ADDITIVE) from both first.")

    def add_arguments(self, parser):
        parser.add_argument("a")
        parser.add_argument("b")
        parser.add_argument("--show", type=int, default=20, help="How many differences to print.")
        parser.add_argument("--drop-derived", action="store_true", help="Leave out the derived keys (singleSource) first.")

    def handle(self, *args, a, b, show, drop_derived, **opts):
        ra, rb = Path(a).read_bytes(), Path(b).read_bytes()
        ca, cb = json.loads(ra), json.loads(rb)
        if drop_derived:
            ca, cb = without_derived(ca), without_derived(cb)
            ra, rb = dumps(ca).encode(), dumps(cb).encode()
        diffs = differences(ca, cb)
        for d in diffs[:show]:
            self.stdout.write(f"  {d}")
        if diffs:
            raise CommandError(f"{len(diffs)} differences between {a} and {b}")
        same_bytes = ra == rb
        extra = f" (leaving out {', '.join(k for ks in ADDITIVE.values() for k in ks)})" if drop_derived else ""
        self.stdout.write(self.style.SUCCESS(f"Equal after normalizing; byte-identical: {'yes' if same_bytes else 'no'}{extra}"))
        if not same_bytes:
            raise CommandError("equal after normalizing but not byte for byte")
