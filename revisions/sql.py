"""SQL for the audit triggers (docs/adr/0006). Each canonical app's migration calls `audit_table()` for its tables.

The functions and settings carry the product's name (`humanitributary_audit()`, `humanitributary.actor`); they were
`tributaries_*` / `tributaries.*` until revisions 0003 renamed them.
"""

from django.db import migrations

AUDIT_FUNCTION_NAME = "humanitributary_audit"

# The two functions alone (CREATE OR REPLACE, so safe to run again).
AUDIT_FUNCTIONS = r"""
CREATE OR REPLACE FUNCTION humanitributary_audit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  who text := nullif(current_setting('humanitributary.actor', true), '');
  old_j jsonb;
  new_j jsonb;
  diff text[] := '{}';
BEGIN
  IF who IS NULL THEN
    RAISE EXCEPTION 'canonical write to % outside revisions.revising(): every change to canonical content must go through the service layer and leave a Revision (AGENTS.md rule 2)', TG_TABLE_NAME
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF TG_OP <> 'INSERT' THEN old_j := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN new_j := to_jsonb(NEW); END IF;
  IF TG_OP = 'UPDATE' THEN
    SELECT coalesce(array_agg(n.key ORDER BY n.key), '{}') INTO diff
      FROM jsonb_each(new_j) n WHERE n.value IS DISTINCT FROM old_j -> n.key;
    IF cardinality(diff) = 0 THEN RETURN NULL; END IF;
  END IF;
  INSERT INTO revisions_revision (at, txid, actor, actor_kind, table_name, row_pk, action, before, after, changed, reason, task_id)
  VALUES (now(), txid_current(), who, split_part(who, ':', 1), TG_TABLE_NAME,
          coalesce(new_j, old_j) ->> TG_ARGV[0], lower(TG_OP), old_j, new_j, diff,
          coalesce(current_setting('humanitributary.reason', true), ''),
          nullif(current_setting('humanitributary.task_id', true), '')::bigint);
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION humanitributary_revision_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'revisions are append-only' USING ERRCODE = 'insufficient_privilege';
END;
$$;
"""

IMMUTABLE_TRIGGER = """
CREATE TRIGGER revision_immutable BEFORE UPDATE OR DELETE ON revisions_revision
  FOR EACH ROW EXECUTE FUNCTION humanitributary_revision_immutable();
"""

# The functions and the append-only guard (revisions 0002).
AUDIT_FUNCTION = AUDIT_FUNCTIONS + IMMUTABLE_TRIGGER

# Drops the pre-rename names too, so unwinding past 0002 leaves nothing behind whichever names a database has.
DROP_AUDIT_FUNCTION = """
DROP TRIGGER IF EXISTS revision_immutable ON revisions_revision;
DROP FUNCTION IF EXISTS humanitributary_revision_immutable();
DROP FUNCTION IF EXISTS humanitributary_audit();
DROP FUNCTION IF EXISTS tributaries_revision_immutable();
DROP FUNCTION IF EXISTS tributaries_audit();
"""


def audit_trigger_sql(table: str, pk: str = "id", function: str = AUDIT_FUNCTION_NAME) -> str:
    """CREATE TRIGGER for one canonical table's `<table>_audit` trigger."""
    return (
        f"CREATE TRIGGER {table}_audit AFTER INSERT OR UPDATE OR DELETE ON {table} "
        f"FOR EACH ROW EXECUTE FUNCTION {function}('{pk}');"
    )


def audit_table(table: str, pk: str = "id") -> migrations.RunSQL:
    """A migration operation that puts the audit trigger on one canonical table."""
    return migrations.RunSQL(audit_trigger_sql(table, pk), f"DROP TRIGGER IF EXISTS {table}_audit ON {table};")


def audited_tables() -> list[str]:
    """Every table that carries the audit trigger, read from the database (used by the tests and `check_audit`)."""
    from django.db import connection

    with connection.cursor() as c:
        c.execute("SELECT DISTINCT event_object_table FROM information_schema.triggers WHERE trigger_name LIKE '%%_audit'")
        return sorted(r[0] for r in c.fetchall())
