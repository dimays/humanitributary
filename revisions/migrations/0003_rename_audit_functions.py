"""Rename the audit functions and settings for the product's name (Tributaries -> Humanitributary; docs/adr/0006).

`tributaries_audit()` / `tributaries_revision_immutable()` and the `tributaries.actor|reason|task_id` settings become
`humanitributary_*` / `humanitributary.*`. The audit itself is unchanged: same checks, same Revision rows.

Correct on both kinds of database:
- an existing one, whose triggers still call the old functions: create the new functions, move every trigger onto
  them, drop the old ones;
- a fresh one, where 0002 and the apps' audit migrations already used the new names (`revisions.sql`): the creates are
  CREATE OR REPLACE, the triggers are dropped and recreated identically, and the old functions are not there to drop.

The table list is frozen here, as of the latest audit migrations of `timeline` and `evidence` (a new canonical table's
own migration calls `audit_table()`, which uses the new name). If a database had an audited table missing from this
list, DROP FUNCTION tributaries_audit() fails because that trigger still depends on it: loud, not silent.
"""

from django.db import migrations

from revisions.sql import AUDIT_FUNCTIONS, audit_trigger_sql

AUDITED = [
    ("timeline_region", "id"),
    ("timeline_entry", "id"),
    ("timeline_branch", "entry_ptr_id"),
    ("timeline_event", "entry_ptr_id"),
    ("timeline_branchlink", "id"),
    ("timeline_eventlink", "id"),
    ("timeline_connection", "id"),
    ("timeline_location", "id"),
    ("timeline_paleopin", "id"),
    ("timeline_image", "id"),
    ("evidence_publisher", "id"),
    ("evidence_citation", "id"),
    ("evidence_claim", "id"),
    ("evidence_evidence", "id"),
]

# The pre-rename functions, for the reverse: the same bodies under the old names, reading the old settings (so a
# reverse goes with the pre-rename code, whose revising() sets `tributaries.*`).
LEGACY_FUNCTIONS = AUDIT_FUNCTIONS.replace("humanitributary", "tributaries")


def _move(new: str, old: str, functions: str) -> str:
    """Create the `new` functions, put every audit trigger and the append-only guard on them, drop the `old` ones."""
    sql = [functions]
    for table, pk in AUDITED:
        sql.append(f"DROP TRIGGER IF EXISTS {table}_audit ON {table};")
        sql.append(audit_trigger_sql(table, pk, function=f"{new}_audit"))
    sql.append("DROP TRIGGER IF EXISTS revision_immutable ON revisions_revision;")
    sql.append(
        "CREATE TRIGGER revision_immutable BEFORE UPDATE OR DELETE ON revisions_revision "
        f"FOR EACH ROW EXECUTE FUNCTION {new}_revision_immutable();"
    )
    sql.append(f"DROP FUNCTION IF EXISTS {old}_revision_immutable();")
    sql.append(f"DROP FUNCTION IF EXISTS {old}_audit();")
    return "\n".join(sql)


class Migration(migrations.Migration):
    dependencies = [
        ("revisions", "0002_audit_function"),
        ("timeline", "0004_remove_entry_position"),
        ("evidence", "0003_claim_parts_and_evidence_values"),
    ]

    operations = [
        migrations.RunSQL(
            _move("humanitributary", "tributaries", AUDIT_FUNCTIONS),
            _move("tributaries", "humanitributary", LEGACY_FUNCTIONS),
        )
    ]
