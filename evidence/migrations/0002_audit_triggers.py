"""Every evidence table is canonical: writes need revisions.revising() and leave a Revision (docs/adr/0006)."""

from django.db import migrations

from revisions.sql import audit_table


class Migration(migrations.Migration):
    dependencies = [("evidence", "0001_initial"), ("revisions", "0002_audit_function")]

    operations = [
        audit_table("evidence_publisher"),
        audit_table("evidence_citation"),
        audit_table("evidence_claim"),
        audit_table("evidence_evidence"),
    ]
