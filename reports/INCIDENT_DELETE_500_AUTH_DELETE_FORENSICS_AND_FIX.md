# Incident: delete-account 500 "Database error deleting user" — Forensics + fix minimo con rollback

**Branch:** `fix/delete-account-500-auth-delete`  
**Tag rollback:** `backup/before-delete-account-fix`

---

## FASE 0 — Rollback garantito ✅

- Branch creato: `fix/delete-account-500-auth-delete`
- Tag creato: `backup/before-delete-account-fix`
- In caso di problemi: `git checkout backup/before-delete-account-fix` oppure `git reset --hard backup/before-delete-account-fix`

---

## FASE 1 — Forensics: trovare il constraint che blocca `auth.users`

Esegui in **Supabase → SQL Editor** (ruolo postgres / service_role) i blocchi sotto. Sono **read-only** tranne il blocco 2 (delete di test che **deve** fallire per estrarre l’errore).

### 1.1) Elenco FK che referenziano `auth.users` (e non sono CASCADE/SET NULL)

```sql
SELECT
  con.conname AS constraint_name,
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE con.contype = 'f'
  AND con.confrelid = 'auth.users'::regclass
ORDER BY nsp.nspname, rel.relname, con.conname;
```

**Incolla qui l’output:** ___________________________

### 1.2) Delete di test diagnostica (fallirà; serve per avere SQLERRM con nome constraint)

⚠️ **NON è un fix.** Serve solo a ottenere il messaggio di errore con il nome esatto del constraint.

```sql
DO $$
BEGIN
  DELETE FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
  RAISE NOTICE 'DELETE auth.users OK (unexpected if you still have 500)';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'DELETE auth.users FAILED -> %', SQLERRM;
  RAISE NOTICE 'SQLSTATE -> %', SQLSTATE;
END $$;
```

**Incolla qui i NOTICE (SQLERRM + SQLSTATE):**

- `SQLERRM`: ___________________________
- `SQLSTATE`: ___________________________

### 1.3) Mappatura constraint → tabella/colonna

Sostituisci `<CONSTRAINT_NAME>` con il nome uscito in SQLERRM (es. `storage_objects_owner_fkey`), poi esegui:

```sql
SELECT
  con.conname,
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  att.attname AS column_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
JOIN unnest(con.conkey) AS keycol(attnum) ON true
JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = keycol.attnum AND att.attnum > 0
WHERE con.conname = '<CONSTRAINT_NAME>';
```

**Risultato (schema, table, column):** ___________________________

---

## FASE 2 — Decisione fix (minimo, Apple‑compliant)

- **Strategia 1 (preferita per “delete account”):** `ON DELETE CASCADE`  
  Usa quando i dati della tabella sono “dell’utente” e devono sparire con l’account.

- **Strategia 2:** `ON DELETE SET NULL` + colonna nullable  
  Solo se i record devono restare (es. log di audit). Per “delete account” di solito non serve.

Per `storage.objects` (owner_id → auth.users): **CASCADE** è corretto (rimuovi i file dell’utente).  
Per tabelle “log” che vuoi tenere: **SET NULL** + colonna nullable.

---

## FASE 3 — Patch SQL (migration in-scope)

Quando hai **constraint_name**, **schema**, **table**, **column** da FASE 1:

### Caso A: CASCADE (es. `storage.objects`, tabelle dati utente)

Crea una migration (es. `supabase/migrations/YYYYMMDDHHMMSS_fk_<table>_on_delete_cascade.sql`):

```sql
-- Fix delete-account 500: FK <schema>.<table>.<column> blocca auth.users delete.
-- Rollback: vedi report INCIDENT_DELETE_500_AUTH_DELETE_FORENSICS_AND_FIX.md

ALTER TABLE <schema>.<table>
  DROP CONSTRAINT IF EXISTS <constraint_name>;

ALTER TABLE <schema>.<table>
  ADD CONSTRAINT <constraint_name>
  FOREIGN KEY (<column>)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

### Caso B: SET NULL (solo se i record devono restare, es. admin_logs)

```sql
ALTER TABLE <schema>.<table>
  ALTER COLUMN <column> DROP NOT NULL;

ALTER TABLE <schema>.<table>
  DROP CONSTRAINT IF EXISTS <constraint_name>;

ALTER TABLE <schema>.<table>
  ADD CONSTRAINT <constraint_name>
  FOREIGN KEY (<column>)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;
```

**Patch SQL esatta applicata (CASCADE/SET NULL) e motivazione Apple‑compliant:**

- Constraint: ___________________________
- Scelta: CASCADE / SET NULL perché ___________________________

---

## FASE 4 — Hardening Edge Function (solo se dopo fix FK il delete fallisce ancora)

Se dopo FASE 3 `auth.admin.deleteUser` restituisce ancora 500, il blocco può essere trigger/policy o altre dipendenze. In quel caso:

1. Creare una RPC `purge_user_data(p_user uuid)` che elimina in ordine dalle tabelle applicative (admin_logs, user_roles, …).
2. Nella Edge Function: dopo validazione JWT → chiamare `purge_user_data(user_id)` → poi `auth.admin.deleteUser(user_id)` → 200.

Template RPC (da adattare alle tue tabelle):

```sql
CREATE OR REPLACE FUNCTION public.purge_user_data(p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Ordine: tabelle figlie prima, poi tabelle che referenziano auth.users
  DELETE FROM public.admin_logs WHERE user_id = p_user;
  DELETE FROM public.user_roles WHERE user_id = p_user;
  -- ... altre tabelle ...
  DELETE FROM public.profiles WHERE id = p_user;
END $$;
```

Nella function: `await admin.rpc('purge_user_data', { p_user: user_id });` poi `deleteUser(user_id)`.

---

## Verifica finale (obbligatoria)

### V1) Riesegui il DO‑block delete di test

```sql
DO $$
BEGIN
  DELETE FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
  RAISE NOTICE 'DELETE OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'DELETE FAILED -> %', SQLERRM;
END $$;
```

**Esito:** OK / FAIL → ___________________________

### V2) Invocazione Edge Function da iPhone

- OPTIONS: 204
- POST: 200/204 (prima era 500)
- Log: nessun "AuthApiError Database error deleting user"

**Esito invocazione (status + log finale):** ___________________________

---

## Output richiesto a Cursor (da compilare dopo le tue esecuzioni)

1. **Messaggio completo NOTICE FASE 1:** (incolla sopra in FASE 1.2)
2. **Constraint name + tabella + colonna:** (incolla sopra in FASE 1.3)
3. **Patch SQL esatta applicata e motivazione Apple‑compliant:** (incolla sopra in FASE 3)
4. **Esito test DO‑block:** (incolla sopra in V1)
5. **Esito invocazione Edge Function:** (incolla sopra in V2)
6. **Rollback disponibile:** branch `fix/delete-account-500-auth-delete`, tag `backup/before-delete-account-fix`

---

## Constraint tipici Supabase che bloccano `auth.users`

| Schema   | Tabella         | Colonna   | Constraint tipico              | Fix consigliato |
|----------|-----------------|-----------|--------------------------------|-----------------|
| public   | admin_logs      | user_id   | admin_logs_user_id_fkey        | SET NULL        |
| public   | admin_logs      | admin_id  | admin_logs_admin_id_fkey       | SET NULL        |
| storage  | objects         | owner_id  | storage_objects_owner_fkey     | CASCADE         |
| public   | profiles        | id        | profiles_id_fkey               | CASCADE (di solito già) |

Dopo aver eseguito FASE 1 e incollato qui **SQLERRM** e **constraint name**, si può generare la migration esatta con schema/table/column corretti.

---

## Rollback per migration `storage.objects` (se applicata)

Se hai applicato `20260227130000_storage_objects_owner_cascade_if_exists.sql` e vuoi tornare indietro:

```sql
ALTER TABLE storage.objects DROP CONSTRAINT IF EXISTS storage_objects_owner_fkey;
ALTER TABLE storage.objects
  ADD CONSTRAINT storage_objects_owner_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE RESTRICT;
```

---

## Riepilogo per Cursor (obbligatorio)

1. **FASE 0:** Branch `fix/delete-account-500-auth-delete`, tag `backup/before-delete-account-fix` creati. Rollback: `git checkout backup/before-delete-account-fix` o `git reset --hard backup/before-delete-account-fix`.
2. **FASE 1:** Esegui in Supabase SQL Editor i blocchi 1.1, 1.2, 1.3. Incolla in questo report i NOTICE (SQLERRM, SQLSTATE) e il risultato della query 1.3 (constraint name, schema, table, column).
3. **FASE 2–3:** Se il constraint è `storage.objects.owner_id` è già pronta la migration `20260227130000_storage_objects_owner_cascade_if_exists.sql`. Per altri constraint usa il template in FASE 3 (CASCADE o SET NULL).
4. **FASE 4:** Solo se dopo fix FK il delete fallisce ancora: RPC `purge_user_data` + chiamata dalla Edge Function prima di `deleteUser`.
5. **Verifica:** DO-block su auth.users poi test da iPhone (POST 200, niente "Database error deleting user").
6. **Rollback disponibile:** sì, tag `backup/before-delete-account-fix`.
