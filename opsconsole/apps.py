from django.apps import AppConfig


class OpsConsoleConfig(AppConfig):
    name = "opsconsole"
    verbose_name = "Operations console: staff pages, and the audit of every action taken from them"

    def ready(self):
        # The worker runs the console's queued actions between jobs (ADR 0028; opsconsole/worker.py).
        from ingest import jobs

        from .worker import pick_up

        if pick_up not in jobs.BETWEEN_JOBS:
            jobs.BETWEEN_JOBS.append(pick_up)
