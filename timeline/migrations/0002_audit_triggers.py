"""Every timeline table is canonical: writes need revisions.revising() and leave a Revision (docs/adr/0006)."""

from django.db import migrations

from revisions.sql import audit_table


class Migration(migrations.Migration):
    dependencies = [("timeline", "0001_initial"), ("revisions", "0002_audit_function")]

    operations = [
        audit_table("timeline_region"),
        audit_table("timeline_entry"),
        audit_table("timeline_branch", pk="entry_ptr_id"),
        audit_table("timeline_event", pk="entry_ptr_id"),
        audit_table("timeline_branchlink"),
        audit_table("timeline_eventlink"),
        audit_table("timeline_connection"),
        audit_table("timeline_location"),
        audit_table("timeline_paleopin"),
        audit_table("timeline_image"),
    ]
