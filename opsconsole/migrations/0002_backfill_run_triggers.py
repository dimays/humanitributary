"""Backfill FetchRun.trigger from the console's audit rows (ADR 0032).

Every run already in the table was recorded as started by the scheduler (ingest 0007's default). The runs a
`run_job` or `retry_run` OpsAction made are listed in its `result["runs"]`: those become `manual` or `retry`, with the
action's id and who asked; a retry also gets the failed run it retried (`params["run"]`) and its attempt number.
Nothing else is guessed: `scheduled_for` stays empty on older runs, and the console says "not recorded".
"""

from django.db import migrations


def backfill(apps, schema_editor):
    OpsAction = apps.get_model("opsconsole", "OpsAction")
    FetchRun = apps.get_model("ingest", "FetchRun")
    for a in OpsAction.objects.filter(kind__in=["run_job", "retry_run"]).order_by("created_at", "id").iterator():
        ids = [r.get("id") for r in ((a.result or {}).get("runs") or []) if isinstance(r, dict) and r.get("id")]
        if not ids:
            continue
        fields = {"trigger": "retry" if a.kind == "retry_run" else "manual", "triggered_by": a.requested_by, "ops_action": a.pk}
        earlier = FetchRun.objects.filter(pk=(a.params or {}).get("run")).first() if a.kind == "retry_run" else None
        if earlier is not None:
            fields.update(retry_of=earlier, attempt=(earlier.attempt or 1) + 1)
        FetchRun.objects.filter(pk__in=ids).update(**fields)


class Migration(migrations.Migration):
    dependencies = [("opsconsole", "0001_opsaction"), ("ingest", "0007_run_trigger_and_schedule")]

    operations = [migrations.RunPython(backfill, migrations.RunPython.noop)]
