"""Entry order becomes a fractional sort key assigned once (docs/adr/0008-entry-order.md), replacing the
legacy file position that renumbered every later entry when one was removed. Existing rows get evenly spaced keys in
their current (position, slug) order, so the snapshot's order is unchanged; each update leaves a Revision."""

from django.db import migrations, models


def assign_keys(apps, schema_editor):
    from revisions import revising
    from timeline.ordering import spread

    Entry = apps.get_model("timeline", "Entry")
    if not Entry.objects.exists():
        return
    with revising("job:migrate", reason="timeline 0003: legacy position → fractional sort_key (same order)"):
        for kind in ("branch", "event"):
            rows = list(Entry.objects.filter(kind=kind).order_by("position", "slug"))
            for row, key in zip(rows, spread(len(rows))):
                row.sort_key = key
            Entry.objects.bulk_update(rows, ["sort_key"], batch_size=1000)


class Migration(migrations.Migration):
    dependencies = [("timeline", "0002_audit_triggers"), ("revisions", "0002_audit_function")]

    operations = [
        migrations.AddField(
            model_name="entry",
            name="sort_key",
            field=models.CharField(db_collation="C", default="", max_length=64),
            preserve_default=False,
        ),
        migrations.RunPython(assign_keys, migrations.RunPython.noop),
    ]
