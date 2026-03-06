# Delete Account 500 — Fix FK admin_logs (ON DELETE SET NULL)

**Branch:** `fix/delete-account-admin-logs-fk-setnull`  
**Tag rollback:** `rollback/delete-account-pre-fk-setnull-20260227-1200`  
**Commit SHA (pre-patch):** `8b1b679fe06cdb8c42ca42ecc0dc47a07ef25a0a`

---

## FASE 1 — Verifica (read-only) — Eseguire in Supabase SQL Editor

### 1) Definizione FK attuale

```sql
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS ref_schema,
  ccu.table_name AS ref_table,
  ccu.column_name AS ref_column,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'admin_logs'
  AND ccu.table_name = 'users' AND ccu.table_schema = 'auth';
```

### 2) Conteggio righe bloccanti (USER_ID test)

```sql
-- USER_ID: 7acd9551-644d-4e32-8758-f892efe47686
SELECT count(*) AS admin_logs_count
FROM public.admin_logs
WHERE user_id = '7acd9551-644d-4e32-8758-f892efe47686';
```

Se la colonna si chiama `admin_id` invece di `user_id`:

```sql
SELECT count(*) AS admin_logs_count
FROM public.admin_logs
WHERE admin_id = '7acd9551-644d-4e32-8758-f892efe47686';
```

### 3) TOP 20 righe (id, created_at, action/event_type)

```sql
SELECT id, created_at, event_type
FROM public.admin_logs
WHERE user_id = '7acd9551-644d-4e32-8758-f892efe47686'
ORDER BY created_at DESC
LIMIT 20;
```

Se la colonna è `admin_id`:

```sql
SELECT id, created_at, event_type
FROM public.admin_logs
WHERE admin_id = '7acd9551-644d-4e32-8758-f892efe47686'
ORDER BY created_at DESC
LIMIT 20;
```

---

## FASE 2 — Migration applicata

File: `supabase/migrations/20260227120000_admin_logs_fk_on_delete_set_null.sql`

- `DROP CONSTRAINT admin_logs_user_id_fkey`
- `ADD CONSTRAINT ... ON DELETE SET NULL`

**Nota:** Se nello schema la colonna che referenzia `auth.users` è `admin_id` (es. migration originale), il constraint sarà `admin_logs_admin_id_fkey`. In quel caso: (1) rendi nullable la colonna `admin_id` se è NOT NULL, (2) drop `admin_logs_admin_id_fkey`, (3) add FK con ON DELETE SET NULL. Usa la query FASE 1 #1 per confermare nome constraint e colonna.

---

## Rollback DB (se necessario)

Dopo FASE 1 #1 avrai la `delete_rule` attuale (es. `NO ACTION` o `RESTRICT`). Per ripristinare:

```sql
ALTER TABLE public.admin_logs DROP CONSTRAINT admin_logs_user_id_fkey;
ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE NO ACTION;
```

(Usa la rule originale restituita dalla query FASE 1 #1.)

---

## FASE 4 — Deploy mirato

Deploy solo della Edge Function (nessun’altra funzione):

```bash
cd /Users/josephmule/lux-hunt-treasure
supabase functions deploy delete-account
```

Eseguire la migration sul DB target (Supabase Dashboard → SQL Editor oppure `supabase db push` se linkato) **prima** di testare delete account:

```bash
# Opzionale: applica migrazioni pending
supabase db push
```

---

## FASE 5 — Test end-to-end

### Test A — DB (effetti FK)

1. Prima della delete: conta `admin_logs` con `user_id` (o `admin_id`) = user_id test.
2. Esegui delete account dall’app con utente test.
3. Dopo la delete:
   - `auth.users` non deve più contenere l’utente.
   - `public.profiles` non deve più contenere l’utente.
   - `public.admin_logs`: le righe che avevano quel `user_id` devono avere `user_id IS NULL` (log conservati).

### Test B — App “no zombie”

- Riaprire l’app dopo la delete: deve essere in stato “logged out”, nessun loop briefing/prima registrazione.

### Test C — Edge logs

- Invocazione `delete-account` deve restituire **200**.
- Log: `DELETE_ACCOUNT: deleteUser success` e `DELETE_ACCOUNT: cleanup success`.

---

## FASE 6 — Build iOS + Capacitor sync (obbligatorio)

```bash
cd /Users/josephmule/lux-hunt-treasure
npm run build
npx cap sync ios
```

Poi apri Xcode, build del workspace/scheme **App** per confermare che nulla si è rotto.
