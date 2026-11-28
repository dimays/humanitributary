"""Run one ingestion job now, due or not:

    manage.py run_job portal --opt days=30
    manage.py run_job year_pages --opt branches=senegal,france
    manage.py run_job link_health --opt limit=200
    manage.py run_job rss --feed "BBC News: World"
"""

import json

from django.core.management.base import BaseCommand, CommandError

from ingest import jobs


def _value(v: str):
    try:
        return json.loads(v)
    except json.JSONDecodeError:
        return v


class Command(BaseCommand):
    help = "Run one ingestion job now (every enabled feed of a feed job, or --feed)."

    def add_arguments(self, parser):
        parser.add_argument("name")
        parser.add_argument("--feed", help="Feed id or exact name.")
        parser.add_argument("--opt", action="append", default=[], help="key=value (JSON values allowed), repeatable.")

    def handle(self, *args, name, feed, opt, **o):
        options = {}
        for kv in opt:
            if "=" not in kv:
                raise CommandError(f"--opt wants key=value, got {kv!r}")
            k, v = kv.split("=", 1)
            options[k] = _value(v)
        try:
            runs = jobs.run_named(name, feed=feed, options=options, log=self.stdout.write)
        except (KeyError, jobs.JobArchived) as e:
            raise CommandError(str(e)) from e
        if runs is not None and any(r.status == "failed" for r in runs):
            raise CommandError("the job failed: see the FetchRun error above / in the admin")
