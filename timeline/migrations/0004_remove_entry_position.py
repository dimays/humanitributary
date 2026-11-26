from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("timeline", "0003_entry_sort_key")]

    operations = [
        migrations.AlterModelOptions(name="branch", options={"ordering": ["sort_key", "slug"], "verbose_name_plural": "branches"}),
        migrations.AlterModelOptions(name="entry", options={"ordering": ["kind", "sort_key", "slug"], "verbose_name_plural": "entries"}),
        migrations.AlterModelOptions(name="event", options={"ordering": ["sort_key", "slug"]}),
        migrations.RemoveField(model_name="entry", name="position"),
        migrations.AlterField(
            model_name="entry",
            name="sort_key",
            field=models.CharField(
                db_collation="C",
                help_text="Order within its kind in the snapshot, which the page breaks sort ties by: a fractional index assigned once, so inserting or removing an entry never moves another (timeline/ordering.py).",
                max_length=64,
            ),
        ),
        migrations.AddConstraint(
            model_name="entry",
            constraint=models.UniqueConstraint(deferrable=models.Deferrable["DEFERRED"], fields=("kind", "sort_key"), name="entry_sort_key_unique"),
        ),
    ]
