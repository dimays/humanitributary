"""The audit trigger function and the append-only guard on revisions (docs/adr/0006)."""

from django.db import migrations

from revisions.sql import AUDIT_FUNCTION, DROP_AUDIT_FUNCTION


class Migration(migrations.Migration):
    dependencies = [("revisions", "0001_initial")]

    operations = [migrations.RunSQL(AUDIT_FUNCTION, DROP_AUDIT_FUNCTION)]
