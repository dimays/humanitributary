"""SQL for the audit triggers (docs/adr/0006). Each canonical app's migration calls `audit_table()` for its tables."""

from django.db import migrations

AUDIT_FUNCTION = r"""
CREATE OR REPLACE FUNCTION tributaries_audit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  who text := nullif(current_setting('tributaries.actor', true), '');
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
          coalesce(current_setting('tributaries.reason', true), ''),
          nullif(current_setting('tributaries.task_id', true), '')::bigint);
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION tributaries_revision_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'revisions are append-only' USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER revision_immutable BEFORE UPDATE OR DELETE ON revisions_revision
  FOR EACH ROW EXECUTE FUNCTION tributaries_revision_immutable();
"""

DROP_AUDIT_FUNCTION = """
DROP TRIGGER IF EXISTS revision_immutable ON revisions_revision;
DROP FUNCTION IF EXISTS tributaries_revision_immutable();
DROP FUNCTION IF EXISTS tributaries_audit();
"""


def audit_table(table: str, pk: str = "id") -> migrations.RunSQL:
    """A migration operation that puts the audit trigger on one canonical table."""
    return migrations.RunSQL(
        f"CREATE TRIGGER {table}_audit AFTER INSERT OR UPDATE OR DELETE ON {table} "
        f"FOR EACH ROW EXECUTE FUNCTION tributaries_audit('{pk}');",
        f"DROP TRIGGER IF EXISTS {table}_audit ON {table};",
    )


def audited_tables() -> list[str]:
    """Every table that carries the audit trigger, read from the database (used by the tests and `check_audit`)."""
    from django.db import connection

    with connection.cursor() as c:
        c.execute("SELECT DISTINCT event_object_table FROM information_schema.triggers WHERE trigger_name LIKE '%%_audit'")
        return sorted(r[0] for r in c.fetchall())
