-- =============================================================================
-- FORENSIC: Delete account 500 — Trova TUTTI i vincoli e trigger che possono
-- bloccare la DELETE su auth.users. Eseguire in Supabase SQL Editor UNA VOLTA
-- e salvare l'output (due risultati).
-- Nessuna modifica al DB: solo SELECT.
-- =============================================================================

-- RISULTATO 1: Tutte le FK che referenziano auth.users (TUTTI gli schemi)
-- Cerca righe con on_delete_action = 'NO ACTION' o 'RESTRICT' (bloccanti)
-- oppure on_delete_action = 'SET NULL' e col_nullability = 'NOT NULL' (bloccanti)
SELECT
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  a.attname AS column_name,
  c.conname AS constraint_name,
  CASE c.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS on_delete_action,
  CASE WHEN a.attnotnull THEN 'NOT NULL' ELSE 'NULLABLE' END AS col_nullability,
  CASE
    WHEN c.confdeltype IN ('a','r') THEN 'BLOCCA (va in CASCADE o SET NULL)'
    WHEN c.confdeltype = 'n' AND a.attnotnull THEN 'BLOCCA (colonna va resa nullable)'
    ELSE 'OK'
  END AS esito
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
JOIN pg_attribute a ON a.attrelid = c.conrelid
  AND a.attnum = ANY(c.conkey)
  AND NOT a.attisdropped
WHERE c.contype = 'f'
  AND c.confrelid = 'auth.users'::regclass
ORDER BY nsp.nspname, rel.relname, a.attname;

-- RISULTATO 2: Trigger su auth.users (possono bloccare o far fallire la DELETE)
SELECT
  event_object_schema AS schema_name,
  event_object_table AS table_name,
  trigger_name,
  action_timing AS timing,
  event_manipulation AS event
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- =============================================================================
-- SE IL RISULTATO 1 È VUOTO: esegui SOLO la query sotto (copia/incolla).
-- Elenca FK verso auth.users con information_schema (può mostrare più righe).
-- =============================================================================
/*
SELECT
  rc.constraint_schema AS schema_name,
  rc.table_name,
  kcu.column_name,
  rc.constraint_name,
  rc.delete_rule AS on_delete_action
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_schema = rc.constraint_schema
  AND kcu.constraint_name = rc.constraint_name
  AND kcu.table_name = rc.table_name
WHERE rc.unique_constraint_schema = 'auth'
  AND rc.unique_constraint_name = (
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'auth' AND table_name = 'users' AND constraint_type = 'PRIMARY KEY'
    LIMIT 1
  )
ORDER BY rc.constraint_schema, rc.table_name;
*/
