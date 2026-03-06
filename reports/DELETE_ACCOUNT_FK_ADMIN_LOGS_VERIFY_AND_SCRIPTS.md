# Delete Account 500 — Verifica FASE 1 + Script SQL FORWARD/ROLLBACK

**Rollback tag creato:** `rollback/delete-account-fk-setnull-20260227`

---

## FASE 1 — Verifica (esegui in Supabase SQL Editor e incolla output)

### 1) Definizione FK `admin_logs_user_id_fkey`

```sql
SELECT
  tc.constraint_name,
  tc.table_schema,
  tc.table_name,
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
  AND tc.constraint_name = 'admin_logs_user_id_fkey';
```

**Nullable `admin_logs.user_id`:**
```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'admin_logs' AND column_name = 'user_id';
```

### 2) Conteggio log per utente test

```sql
SELECT count(*) AS cnt
FROM public.admin_logs
WHERE user_id = '7acd9551-644d-4e32-8758-f892efe47686';
```

### 3) Altre FK su `public.users(id)` con ON DELETE

```sql
SELECT
  tc.constraint_name,
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_schema = 'auth'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name, kcu.column_name;
```

**Criterio:** Se l’unico blocker è `admin_logs_user_id_fkey`, procedi con FASE 2. Se ce ne sono altri con `delete_rule = 'RESTRICT'` (o `NO ACTION`) che referenziano `auth.users`, elencali per gestirli con lo stesso pattern (SET NULL dove ha senso).

---

## FASE 2 — Script SQL

### FORWARD (fix “keep logs”)

La migration **già presente** nel repo è il FORWARD:

- `supabase/migrations/20260227120000_admin_logs_fk_on_delete_set_null.sql`

Contenuto (già applicabile se lo schema ha `user_id`):

- `ALTER TABLE public.admin_logs ALTER COLUMN user_id DROP NOT NULL`
- `ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_user_id_fkey`
- `ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL`

**Applicazione:** da CLI con progetto linkato: `supabase db push` oppure esegui il blocco DO $$ ... $$ nello SQL Editor.

### ROLLBACK (ripristino constraint precedente)

Esegui **solo** se devi annullare il fix. Sostituisci `DELETE_RULE_ORIGINALE` con il valore letto in FASE 1 (es. `RESTRICT` o `NO ACTION`). Se prima la colonna era NOT NULL e ora hai righe con `user_id IS NULL`, il ripristino di NOT NULL fallirà finché non aggiorni/elimini quelle righe.

```sql
-- ROLLBACK: ripristino FK admin_logs.user_id come prima del fix.
-- Sostituisci DELETE_RULE_ORIGINALE con il valore della FASE 1 (es. RESTRICT o NO ACTION).

ALTER TABLE public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_user_id_fkey;

-- Opzionale: ripristina NOT NULL solo se non esistono righe con user_id NULL:
-- ALTER TABLE public.admin_logs ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.admin_logs
  ADD CONSTRAINT admin_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE DELETE_RULE_ORIGINALE;
```

(Esempio con `RESTRICT`: `ON DELETE RESTRICT`.)

---

## Post-patch check (dopo FORWARD)

```sql
-- delete_rule attesa: SET NULL
SELECT constraint_name, delete_rule
FROM information_schema.referential_constraints
WHERE constraint_schema = 'public' AND constraint_name = 'admin_logs_user_id_fkey';

-- user_id deve accettare NULL
SELECT column_name, is_nullable FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'admin_logs' AND column_name = 'user_id';
```
