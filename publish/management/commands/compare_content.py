import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from publish.compare import differences


class Command(BaseCommand):
    help = "Compare two content snapshots (a legacy dump and a release's content.json): normalized, then byte for byte."

    def add_arguments(self, parser):
        parser.add_argument("a")
        parser.add_argument("b")
        parser.add_argument("--show", type=int, default=20, help="How many differences to print.")

    def handle(self, *args, a, b, show, **opts):
        ra, rb = Path(a).read_bytes(), Path(b).read_bytes()
        diffs = differences(json.loads(ra), json.loads(rb))
        for d in diffs[:show]:
            self.stdout.write(f"  {d}")
        if diffs:
            raise CommandError(f"{len(diffs)} differences between {a} and {b}")
        same_bytes = ra == rb
        self.stdout.write(self.style.SUCCESS(f"Equal after normalizing; byte-identical: {'yes' if same_bytes else 'no'}"))
