# delete-account-v2 — FK blocca DELETE su auth.users — Report e fix

**Branch:** `fix/db-fk-auth-users-delete`  
**Tag rollback:** `pre-db-fk-auth-users-delete-20260302-1217`  
**Rollback (prima di applicare migration):**  
`git checkout pre-db-fk-auth-users-delete-20260302-1217 -- supabase/migrations/`

**Contesto:** GoTrue "Database error deleting user" (500 unexpected_failure) → vincoli DB (FK con NO ACTION/RESTRICT o SET NULL + colonna NOT NULL) bloccano la DELETE su `auth.users`.

---

## FASE 1 — Read-only forensics (query da eseguire)

Eseguire in **Supabase SQL Editor** (ruolo con lettura cataloghi) e incollare l’output nel report.

### Query 1 — Elenco FK che referenziano auth.users(id)

```sql
SELECT
  nsp.nspname AS schema_name,
  conrelid::regclass AS referencing_table,
  a.attname AS referencing_column,
  confrelid::regclass AS referenced_table,
  af.attname AS referenced_column,
  conname AS constraint_name,
  confdeltype AS on_delete_code,
  CASE confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS on_delete_action
FROM pg_constraint c
JOIN pg_namespace nsp ON nsp.oid = (SELECT relnamespace FROM pg_class WHERE oid = c.conrelid)
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) AND NOT a.attisdropped
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey) AND NOT af.attisdropped
WHERE c.contype = 'f'
  AND c.confrelid = 'auth.users'::regclass
ORDER BY nsp.nspname, referencing_table::text, referencing_column;
```

**Output (incolla qui):**
```
[ incolla risultato ]
```

---

### Query 2 — Nullable per ogni colonna referenziante

Dopo aver eseguito la query 1, usa l’elenco `(schema, table, column)` per compilare la query sotto (sostituisci i valori con quelli ottenuti). Oppure usa questa versione che non richiede sostituzioni:

```sql
SELECT
  nsp.nspname AS table_schema,
  rel.relname AS table_name,
  a.attname AS column_name,
  CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END AS is_nullable,
  pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) AND NOT a.attisdropped
WHERE c.contype = 'f'
  AND c.confrelid = 'auth.users'::regclass
ORDER BY nsp.nspname, rel.relname, a.attname;
```

**Output (incolla qui):**
```
[ incolla risultato ]
```

---

### Query 3 — Trigger custom (opzionale)

```sql
SELECT
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema IN ('auth', 'public')
ORDER BY event_object_schema, event_object_table, trigger_name;
```

**Output (incolla qui):**
```
[ incolla risultato ]
```

---

## FASE 2 — Classificazione (da compilare dopo query 1 e 2)

| referencing_table | referencing_column | on_delete_action attuale | is_nullable | target_action | motivazione |
|-------------------|--------------------|---------------------------|-------------|---------------|-------------|
| ...               | ...                | ...                       | ...         | CASCADE / SET NULL | 1 riga |

- **Dati utente** (profiles, user_*, subscriptions, …) → **CASCADE**
- **Log/audit** (admin_logs, abuse_logs, …) → **SET NULL** + colonna nullable

---

## FASE 3 — Migration applicata

È stata creata **una** migration che corregge in modo dinamico le FK bloccanti nello schema **public**:

- **NO ACTION / RESTRICT** → drop constraint e ricreazione con **ON DELETE CASCADE** (dati “owned” dall’utente).
- **SET NULL** con colonna **NOT NULL** → **DROP NOT NULL**, drop constraint, ricreazione con **ON DELETE SET NULL**.

File: `supabase/migrations/20260302122000_fix_auth_users_fk_blocking_delete.sql`

**Rollback (repo):**  
`git checkout pre-db-fk-auth-users-delete-20260302-1217 -- supabase/migrations/`  
Poi eventualmente eseguire una migration “down” manuale se le migration sono già state applicate al DB remoto.

---

## FASE 4 — Verify

1. Applicare le migration (Supabase Dashboard → SQL Editor, oppure `supabase db push` / deploy).
2. **Non** è necessario ri-deploy della function delete-account-v2 (nessun cambio codice).
3. Ripetere curl su delete-account-v2 con JWT valido.
4. **Atteso:** 200 `{ "ok": true, "rid": "…" }`.
5. In Dashboard → Authentication → Users verificare che l’utente target non esista più.

---

## Risultati (da compilare dopo verify)

- [ ] Query 1 e 2 eseguite e output incollati
- [ ] Migration applicata
- [ ] curl delete-account-v2 → 200 ok:true
- [ ] Utente assente da Authentication → Users

---

# NEXT STEP DEFINITIVO — Blocco fuori public / colonne composite

**Contesto:** delete-account-v2 arriva a `delete_start` ma fallisce con AuthApiError "Database error deleting user". FK in **public** già CASCADE o SET NULL. Il blocco è su FK/constraint/trigger **fuori public** o su colonne composite. Solo DB, nessuna modifica UI né Edge Function.

---

## FASE 1 — Tutti i vincoli verso auth.users (TUTTI gli schemi, NO LIMIT)

Eseguire in **Supabase SQL Editor**:

```sql
SELECT
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  c.conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE c.contype = 'f'
  AND c.confrelid = 'auth.users'::regclass
ORDER BY nsp.nspname, rel.relname;
```

**Risultato FASE 1 (incolla qui):**
```
[ incolla output completo ]
```

---

## FASE 2 — Solo vincoli che BLOCCANO (RESTRICT / NO ACTION / SET NULL + NOT NULL)

```sql
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
  CASE WHEN a.attnotnull THEN 'NOT NULL' ELSE 'NULLABLE' END AS col_nullability
FROM pg_constraint c
JOIN pg_class rel ON rel.oid = c.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
JOIN pg_attribute a ON a.attrelid = c.conrelid
  AND a.attnum = ANY(c.conkey)
  AND NOT a.attisdropped
WHERE c.contype = 'f'
  AND c.confrelid = 'auth.users'::regclass
  AND (
    c.confdeltype IN ('a','r')
    OR (c.confdeltype = 'n' AND a.attnotnull = true)
  )
ORDER BY nsp.nspname, rel.relname;
```

**Risultato FASE 2 (incolla qui):**
```
[ incolla output ]
```

**Solo vincoli problematici evidenziati (elenco):**
```
[ elenca qui schema.table, colonna, constraint_name, on_delete_action, col_nullability ]
```

---

## FASE 3 — Fix mirato (per ogni riga di FASE 2)

### A) NO ACTION / RESTRICT + tabella “dati utente”

Sostituisci `SCHEMA`, `TABLE`, `CONSTRAINT_NAME`, `COLUMN` con i valori della riga.

```sql
ALTER TABLE "SCHEMA"."TABLE" DROP CONSTRAINT "CONSTRAINT_NAME";
ALTER TABLE "SCHEMA"."TABLE"
  ADD CONSTRAINT "CONSTRAINT_NAME"
  FOREIGN KEY ("COLUMN")
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

### B) SET NULL ma colonna NOT NULL

```sql
ALTER TABLE "SCHEMA"."TABLE"
  ALTER COLUMN "COLUMN" DROP NOT NULL;

ALTER TABLE "SCHEMA"."TABLE" DROP CONSTRAINT "CONSTRAINT_NAME";

ALTER TABLE "SCHEMA"."TABLE"
  ADD CONSTRAINT "CONSTRAINT_NAME"
  FOREIGN KEY ("COLUMN")
  REFERENCES auth.users(id)
  ON DELETE SET NULL;
```

**Nota:** Per tabelle in schema `auth` o `storage` valutare con attenzione (potrebbero essere gestite da Supabase). Preferire fix solo su schemi `public` o custom; per auth/storage documentare e, se possibile, aprire issue Supabase o applicare solo se sicuri.

---

## FASE 4 — Retest

1. Eseguire di nuovo: `curl` → delete-account-v2 (JWT valido).
2. **Atteso:** 200 `{ "ok": true, "rid": "…" }`.
3. Verificare: Dashboard → Authentication → Users → utente rimosso.

---

## Se FASE 2 restituisce 0 righe

Il blocco può essere: **trigger custom**, **funzione collegata a users**, o **constraint non-FK**. Eseguire:

```sql
SELECT
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema IN ('auth','public','storage','realtime')
ORDER BY event_object_schema, event_object_table;
```

**Output trigger (incolla qui se FASE 2 vuota):**
```
[ incolla risultato ]
```

---

## Output richiesto (riepilogo)

| Cosa | Dove incollare |
|------|-----------------|
| Risultato FASE 1 | Sezione “Risultato FASE 1” sopra |
| Risultato FASE 2 | Sezione “Risultato FASE 2” sopra |
| Solo vincoli problematici | Elenco “Solo vincoli problematici evidenziati” |
| Se FASE 2 vuota | Output query trigger nella sezione “Se FASE 2 restituisce 0 righe” |
