-- Fix delete-account-v2: "Database error deleting user" — FK verso auth.users bloccano DELETE.
-- Scope: solo schema public. Nessuna modifica a auth.* o altre funzioni.
-- Rollback: ripristinare le FK manualmente o git checkout al tag pre-db-fk-auth-users-delete-*.
--
-- Logica:
-- 1) FK con ON DELETE NO ACTION / RESTRICT → ricrea con ON DELETE CASCADE (dati utente).
-- 2) FK con ON DELETE SET NULL ma colonna NOT NULL → DROP NOT NULL, poi ricrea FK ON DELETE SET NULL (audit/log).

DO $$
DECLARE
  r RECORD;
  tbl_schema text;
  tbl_name text;
  col_name text;
  not_null boolean;
BEGIN
  FOR r IN
    SELECT
      c.conname,
      c.conrelid,
      c.conkey[1] AS conkey_attnum,
      c.confdeltype,
      n.nspname AS ref_schema,
      rel.relname AS ref_table
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE c.contype = 'f'
      AND c.confrelid = 'auth.users'::regclass
      AND n.nspname = 'public'
  LOOP
    tbl_schema := r.ref_schema;
    tbl_name := r.ref_table;
    SELECT a.attname, a.attnotnull INTO col_name, not_null
      FROM pg_attribute a
      WHERE a.attrelid = r.conrelid AND a.attnum = r.conkey_attnum AND NOT a.attisdropped;

    IF col_name IS NULL THEN
      RAISE NOTICE 'Skip constraint %: column not found', r.conname;
      CONTINUE;
    END IF;

    -- Caso 1: NO ACTION o RESTRICT → CASCADE
    IF r.confdeltype IN ('a', 'r') THEN
      EXECUTE format(
        'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
        tbl_schema, tbl_name, r.conname
      );
      EXECUTE format(
        'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE',
        tbl_schema, tbl_name, r.conname, col_name
      );
      RAISE NOTICE 'FK %: % %.%(%) → ON DELETE CASCADE', r.conname, tbl_schema, tbl_name, col_name;
    END IF;

    -- Caso 2: SET NULL ma colonna NOT NULL → DROP NOT NULL, poi SET NULL
    IF r.confdeltype = 'n' AND not_null THEN
      EXECUTE format(
        'ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL',
        tbl_schema, tbl_name, col_name
      );
      EXECUTE format(
        'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
        tbl_schema, tbl_name, r.conname
      );
      EXECUTE format(
        'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE SET NULL',
        tbl_schema, tbl_name, r.conname, col_name
      );
      RAISE NOTICE 'FK %: % %.%(%) → nullable + ON DELETE SET NULL', r.conname, tbl_schema, tbl_name, col_name;
    END IF;
  END LOOP;
END $$;
