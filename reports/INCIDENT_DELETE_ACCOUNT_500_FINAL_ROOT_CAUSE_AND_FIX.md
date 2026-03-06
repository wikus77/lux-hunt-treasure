# Incident: Delete Account 500 "Database error deleting user" — Root cause e fix (forensics completa)

**App:** M1SSION™ — iOS nativa (Capacitor WKWebView)  
**Endpoint:** `POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/delete-account`  
**Sintomo iPhone:** "Danger Zone — Edge Function returned a non-2xx status code"  
**Errore Edge:** AuthApiError 500 "Database error deleting user" (code: unexpected_failure, details: undefined)  
**User test:** `7acd9551-644d-4e32-8758-f892efe47686`  
**Edge event (UTC):** 2026-03-01T07:00:17.888Z  
**Edge deployment_id:** `vkjrqirvdvjbemsfzxof_22f160d8-dd65-4314-b925-cdfb08071c9e_3`  
**Edge execution_id:** `f8c220ce-45a7-466a-bb3b-3ea2814cbf5a`  
**Branch (fix auth-admin):** `fix/delete-account-auth-admin`  
**Tag rollback (pre-authadmin):** `rollback/delete-account-pre-authadmin`  
**Tag rollback generale:** `backup/before-delete-account-fix`  
**Tag pre-patch DB:** `backup/before-db-fk-fix-20260227-0817`  
**Scope:** Solo iOS wrapper (Capacitor) + Edge delete-account + DB auth. Vietate modifiche UI/routing/tabelle/RLS.

---

## FIX AUTH ADMIN — FASE 0 Inventory + FASE 1 Patch (completato)

### FASE 0 — Inventory (read-only)

| Elemento | Valore |
|----------|--------|
| **Posizione function** | `supabase/functions/delete-account/index.ts` (unico file; nessun helper esterno) |
| **Autenticazione chiamante** | JWT da header `Authorization: Bearer <token>` |
| **Verifica token (prima del fix)** | `createClient(url, serviceKey)` → `admin.auth.getUser(jwt)` (stesso client admin per auth + delete) |
| **Cancellazione utente** | `admin.auth.admin.deleteUser(user_id)` — già presente, nessun SQL su `auth.users` |
| **Cleanup** | Storage avatars + tabelle app (email_sends, user_clues, … profiles); già presente |

**Conclusione pre-fix:** La function usava già SERVICE_ROLE_KEY e `auth.admin.deleteUser`. Il 500 può dipendere da: (1) uso dello stesso client per getUser e deleteUser; (2) GoTrue interno che non usa correttamente i privilegi; (3) necessità di separare verifica JWT (client anon) da azione admin (solo delete). Fix applicato: verifica JWT con client anon quando `SUPABASE_ANON_KEY` è impostata; admin usato solo per `deleteUser` + cleanup; logging sicuro; response con `ok`/`success`/`error`.

### FASE 1 — Fix chirurgico applicato

- **A) Auth:** JWT estratto da `Authorization`; verifica con client anon (`SUPABASE_ANON_KEY`) se disponibile, altrimenti service role; 401 con `{ ok: false, success: false, error: "unauthorized" }` se token mancante/invalido.
- **B) Delete:** Client admin creato con `SUPABASE_SERVICE_ROLE_KEY`; `admin.auth.admin.deleteUser(user_id)`; su fallimento log sicuro (solo error_name, error_status) e 500 `{ ok: false, success: false, error: "internal_error" }`. "User not found" trattato come successo (idempotente).
- **C) Cleanup:** Invariato (storage avatars + tabelle app); nessuna nuova tabella.
- **D) Logging:** Solo `req_id`, `ts`, `user_id`, step (`AUTH_OK`, `ADMIN_DELETE_START`, `ADMIN_DELETE_OK`, `ADMIN_DELETE_FAIL`, `CATCH`) e in errore solo `error_name`, `error_status`. Non loggati: header Authorization, service role key, stack completo.
- **E) Response:** 200 `{ ok: true, success: true }`; 401 `{ ok: false, success: false, error: "unauthorized" }`; 500 `{ ok: false, success: false, error: "internal_error" }`. Mantenuto `success` per compatibilità client (`DeleteAccountModalContent.tsx`, `LegalSettings.tsx`).

**Build id deploy:** `EDGE_DELETE_ACCOUNT_BUILD_ID = "20260301-authadmin-v1"`.

### Rollback (obbligatorio)

Prima delle modifiche sono stati creati:
- **Branch:** `fix/delete-account-auth-admin`
- **Tag:** `rollback/delete-account-pre-authadmin`

**Comandi per rollback (se qualcosa va storto):**
```bash
git checkout rollback/delete-account-pre-authadmin -- supabase/functions/delete-account/index.ts
# oppure ripristino completo al tag:
git checkout rollback/delete-account-pre-authadmin
```

### Diff patch (solo file function)

Modifiche in `supabase/functions/delete-account/index.ts`:
- Aggiunto uso di `SUPABASE_ANON_KEY` (opzionale) per client di verifica JWT; admin usato solo per deleteUser e cleanup.
- Rimosso logging di `has_url`, `has_service_role_key`; rimosso dump completo errore (solo `error_name`, `error_status`).
- Rimosso header diagnostico `x-m1ssion-diagnostic` e risposta JSON dettagliata in 500.
- Rimosso conteggio `admin_logs` (diagnostica fuori scope).
- Response unificate: `ok`, `success`, `error`; 401/500 con messaggio generico.
- Build id aggiornato a `20260301-authadmin-v1`.

### Checklist prima/dopo (FASE 2 — verifica)

| Step | Prima | Dopo (da compilare dopo test) |
|------|--------|--------------------------------|
| 1. Deploy Edge Function | — | `supabase functions deploy delete-account` |
| 2. Chiamata da app (Delete Account) | POST 500 | [ ] 200 OK |
| 3. `SELECT id,email FROM auth.users WHERE id='<userId>'` | 1 row | [ ] 0 rows |
| 4. Log Edge (no 500) | DELETEUSER_FAIL | [ ] ADMIN_DELETE_OK o nessun 500 |
| 5. Client: messaggio utente | "Edge Function returned non-2xx" | [ ] Conferma eliminazione / redirect login |

**Nota:** In Supabase Dashboard → Edge Functions → Secrets, impostare `SUPABASE_ANON_KEY` (chiave anon del progetto) per usare il path verifica-anon + admin-solo-delete. Se non impostata, la function usa il service role anche per la verifica JWT (comportamento analogo al precedente, ma con logging e response allineati).

---

## INCIDENT — DELETE ACCOUNT 500 DOPO RE-DEPLOY (FK SET NULL + NOT NULL)

### Context (stato attuale / prove)

| Campo | Valore |
|-------|--------|
| App | M1SSION™ — iOS nativa (Capacitor WKWebView) |
| Endpoint | `POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/delete-account` |
| Sintomo iPhone | "Danger Zone — Edge Function returned a non-2xx status code" |
| Edge build | `build_id = "20260301-authadmin-v1"` ✅ |
| Edge logs (ultimo tentativo) | AUTH_OK ✅ → ADMIN_DELETE_START ✅ → ADMIN_DELETE_FAIL ❌ (error_name=AuthApiError, error_status=500) |
| POST 500 sb_request_id | `019ca874-19b9-7dfc-96b7-624c1000e323` |
| execution_id | `5d1ee947-49d6-4f5c-bbf3-743958e933f3` |
| Utente test | `7acd9551-644d-4e32-8758-f892efe47686` |
| Ts Edge (UTC) | ~2026-03-01T08:11:47Z |

### Evidenze DB (già raccolte)

- Query "FK bloccanti (NON CASCADE e NON SET NULL)" → **0 rows** ✅  
- Trigger su `auth.users`: solo AFTER INSERT ✅ (nessun trigger DELETE custom)  
- RLS su `auth.users`: `rls_enabled=true`, `force_rls=false`  
- `pg_policies` su `auth.users`: **0 rows** (nessuna policy esplicita)  
- `auth.users` owner: `supabase_auth_admin`  
- `SET LOCAL ROLE supabase_auth_admin` da SQL Editor → **permission denied** (non testabile così)

### Ipotesi root cause (altamente probabile)

Se esistono FK verso `auth.users` con **ON DELETE SET NULL** ma la colonna referenziante è **NOT NULL** (o ha vincolo che impone NOT NULL):

- Al delete, Postgres tenta di impostare NULL sulla colonna.
- Fallisce per NOT NULL violation.
- GoTrue/Auth admin API traduce in: **"Database error deleting user"** (AuthApiError 500).

Questo **non** viene catturato dalla query "non-cascade/non-setnull" perché la `delete_rule` è comunque `SET NULL` (quindi "non bloccante" a prima vista), ma in pratica è bloccante per il vincolo NOT NULL.

---

### PHASE 0 — Forensics (READ-ONLY) — NON MODIFICARE NULLA

#### A) Postgres log — errore reale

**Istruzioni:** In Supabase Dashboard → **Logs** → **Postgres** (o Database logs):

- **sb_request_id:** `019ca874-19b9-7dfc-96b7-624c1000e323`
- **Timeframe:** ~2026-03-01 08:11:47 UTC
- **Cercare:** `7acd9551-644d-4e32-8758-f892efe47686`, oppure:
  - `null value in column … violates not-null constraint`
  - `violates foreign key constraint`
  - `update or delete on table "users"`
  - `row-level security`

**Output richiesto (incolla 30–80 righe max):** errore completo, schema.tabella, colonna, constraint name, SQLSTATE se visibile.

```
[ incolla qui estratto Postgres log ]
```

---

#### B) Query: FK verso auth.users con ON DELETE SET NULL + colonna NOT NULL

Eseguire in **Supabase SQL Editor** (ruolo con lettura cataloghi, es. postgres):

```sql
WITH fks AS (
  SELECT
    con.oid AS con_oid,
    con.conname,
    nsp.nspname AS schema_name,
    rel.relname AS table_name,
    con.conkey,
    con.confdeltype,
    con.conrelid,
    pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE con.contype = 'f'
    AND con.confrelid = 'auth.users'::regclass
    AND con.confdeltype = 'n'  -- SET NULL
)
SELECT
  f.schema_name,
  f.table_name,
  f.conname,
  a.attname AS column_name,
  a.attnotnull AS is_not_null,
  f.definition
FROM fks f
JOIN LATERAL unnest(f.conkey) AS key_attnum(attnum) ON true
JOIN pg_attribute a
  ON a.attrelid = f.conrelid
 AND a.attnum = key_attnum.attnum
 AND NOT a.attisdropped
WHERE a.attnotnull = true
ORDER BY 1, 2, 3, 4;
```

**Output richiesto:** elenco completo righe. Se ci sono righe → root cause quasi certa (SET NULL + colonna NOT NULL).

```
[ incolla qui risultato query B ]
```

---

#### C) Impatto per utente test (per ogni riga trovata in B)

Per ogni `schema.table` e `column` restituiti dalla query B, eseguire (sostituendo `<schema>`, `<table>`, `<column>`):

```sql
SELECT count(*) AS rows_for_user
FROM <schema>.<table>
WHERE <column> = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Output richiesto:** tabella + count (es. `public.admin_logs | 3`).

```
[ incolla qui: tabella | count ]
```

---

#### D) Conferma utente ancora presente

```sql
SELECT id, email, created_at
FROM auth.users
WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Output richiesto:**

```
[ incolla qui risultato ]
```

---

### Decision rule (automatica)

| Se Postgres log mostra… | Patch |
|-------------------------|--------|
| NOT NULL violation su colonna FK SET NULL | DROP NOT NULL su quella colonna (audit/log) **oppure** FK → CASCADE (solo tabelle “dati utente”, non audit) |
| FK RESTRICT/NO ACTION (improbabile con B2=0) | CASCADE o SET NULL a seconda tabella |
| RLS/policy/permission | Patch mirata solo su auth (serve prova precisa) |
| **Nessuna patch senza prova da log.** | — |

---

### PHASE 1 — Patch minima DB (SOLO DOPO PROVA) + rollback SQL

Applicare **solo** gli oggetti usciti da log (A) o query (B). Non cambiare altre FK.

#### Caso 1 — FK ON DELETE SET NULL su colonna NOT NULL (audit/log)

**FORWARD.sql**

```sql
BEGIN;

-- 1) DROP NOT NULL sulla colonna che deve poter diventare NULL
ALTER TABLE <schema>.<table>
  ALTER COLUMN <column> DROP NOT NULL;

COMMIT;
```

**ROLLBACK.sql**

```sql
BEGIN;

-- Verificare prima: SELECT count(*) FROM <schema>.<table> WHERE <column> IS NULL;
-- Rollback possibile solo se non esistono già NULL in colonna

ALTER TABLE <schema>.<table>
  ALTER COLUMN <column> SET NOT NULL;

COMMIT;
```

#### Caso 2 — Tabella “dati utente” (non audit) → CASCADE

**FORWARD.sql**

```sql
BEGIN;

ALTER TABLE <schema>.<table>
  DROP CONSTRAINT IF EXISTS <constraint_name>;

ALTER TABLE <schema>.<table>
  ADD CONSTRAINT <constraint_name>
  FOREIGN KEY (<column>) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMIT;
```

**ROLLBACK.sql**

```sql
BEGIN;

ALTER TABLE <schema>.<table>
  DROP CONSTRAINT IF EXISTS <constraint_name>;

ALTER TABLE <schema>.<table>
  ADD CONSTRAINT <constraint_name>
  FOREIGN KEY (<column>) REFERENCES auth.users(id) ON DELETE SET NULL;

COMMIT;
```

---

### PHASE 2 — Verify (obbligatoria)

1. Ripetere delete da iPhone (o chiamata API) → atteso: **POST 200**; Edge logs: **ADMIN_DELETE_OK** (nessun ADMIN_DELETE_FAIL).
2. DB: `SELECT id FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';` → atteso: **0 rows**.
3. Se è stato fatto DROP NOT NULL su audit/log: verificare che le righe su quelle tabelle possano avere NULL e che l’app non sia impattata.

---

### Note operative

- Il fatto che **"FK non-cascade/non-setnull = 0 rows"** non esclude blocchi: il caso **NOT NULL + SET NULL** è il pattern che produce 500 GoTrue.
- Usare **sb_request_id** e **execution_id** per trovare il log DB reale; senza quel log si lavora alla cieca.

### GO / NO-GO

- **GO:** Eseguire subito PHASE 0 (A+B+C+D) e compilare il report con gli output.
- **NO-GO:** Nessuna patch DB finché non c’è prova dal Postgres log (A) o dalla query SET NULL + NOT NULL (B).

---

### OUTPUT FINALE (da compilare dopo Phase 0)

#### ROOT CAUSE

- **Estratto Postgres log:**  
  [ incolla qui estratto con errore reale ]

- **Tabella / colonna / constraint:**  
  [ es. schema.tabella, colonna, nome constraint ]

- **Spiegazione (1 riga):**  
  [ es. "FK ON DELETE SET NULL su colonna NOT NULL impedisce a Postgres di impostare NULL al delete su auth.users → NOT NULL violation → GoTrue 500" ]

#### PATCH MINIMA

- **SQL forward:**  
  [ incolla script FORWARD applicato ]

- **SQL rollback:**  
  [ incolla script ROLLBACK ]

- **Oggetti toccati:**  
  [ es. public.admin_logs, colonna user_id, constraint admin_logs_user_id_fkey ]

#### VERIFY RESULTS

- **Edge logs:**  
  [ ] ADMIN_DELETE_OK, nessun 500

- **auth.users per user test:**  
  [ ] 0 rows

- **Note:**  
  [ eventuali verifiche su tabelle con DROP NOT NULL ]

---

## FASE 0 — Rollback (completata)

| Elemento | Stato |
|----------|--------|
| Branch | `fix/delete-account-500-auth-delete` |
| Tag rollback generale | `backup/before-delete-account-fix` |
| Tag prima patch DB | `backup/before-db-fk-fix-20260227-0817` |

**Elenco tag/branch rilevanti:**
```
branch: fix/delete-account-500-auth-delete (current)
branch: fix/delete-account-500
branch: fix/delete-account-admin-logs-fk-setnull
branch: fix/delete-account-admin-logs-setnull
branch: fix/delete-account-profile-integrity-ios
tag: backup/before-db-fk-fix-20260227-0817
tag: backup/before-delete-account-fix
```

---

## 1. Timeline e identificazione deploy

Dopo il re-deploy della Edge Function (con `EDGE_DELETE_ACCOUNT_BUILD_ID = "20260227-forensics-v1"`):

| Timestamp (UTC) | sb_request_id / x-request-id | Note |
|-----------------|------------------------------|------|
| [ incolla timestamp del tentativo fallito ] | [ incolla request id dai log Edge ] | POST 500 |

**Conferma deploy:** nei log Edge, la riga `DELETE_ACCOUNT: START` deve contenere `build_id: "20260227-forensics-v1"`. Se manca, il deploy non è quello aggiornato.

---

## 2. Log Edge — DELETEUSER_FAIL completo

Incolla qui l’**intera** riga di log che contiene `DELETEUSER_FAIL` (o l’oggetto `error` completo), come appare in Supabase → Edge Functions → delete-account → Logs.

```
[ incolla qui: timestamp, sb_request_id, user_id, error { name, message, status, code, details, stack } ]
```

**Esempio formato atteso:**
```json
{
  "user_id": "7acd9551-644d-4e32-8758-f892efe47686",
  "req_id": "...",
  "error": {
    "name": "AuthApiError",
    "message": "Database error deleting user",
    "status": 500,
    "code": "unexpected_failure",
    "details": "...",
    "stack": "..."
  }
}
```

---

## 3. ENV Edge Function (no secrets)

Dal log `DELETE_ACCOUNT: START` devono risultare:
- `has_url: true`
- `has_service_role_key: true`

**Dashboard:** Supabase → Project Settings → Edge Functions → verificare che per l’ambiente siano impostate `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

---

## FASE A — Conferma da codice (READ-ONLY)

Dal file `supabase/functions/delete-account/index.ts`:

| Verifica | Stato |
|----------|--------|
| Chiave usata | `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` → **SUPABASE_SERVICE_ROLE_KEY** (service role) |
| Client | `createClient(url, serviceKey)` → auth.admin usa privilegi admin |
| build_id in log | `EDGE_DELETE_ACCOUNT_BUILD_ID = "20260227-forensics-v1"` → loggato in `DELETE_ACCOUNT: START` |
| has_url / has_service_role_key | Loggati in `START` come boolean (riga ~59) |

**Azione richiesta:** In Supabase Dashboard → Edge Functions → delete-account → Logs, incolla nella sezione 2 (Log Edge DELETEUSER_FAIL):
- timestamp dell’invocazione
- `sb_request_id` o `x-request-id`
- riga completa con **DELETEUSER_FAIL** e oggetto `error` (name, message, status, code, details, stack).

---

## Osservazioni già raccolte (da screenshot)

- **FK verso auth.users:** molte risultano ON DELETE CASCADE / SET NULL; la UI limita a 100 righe → serve query mirata “solo non-cascade / non-setnull” (FASE B2).
- **storage.objects:** NON ha FK `owner_id` → auth.users (compare solo `objects_bucketId_fkey`). Lo script “storage owner cascade” non risolve questo incidente.
- **Trigger su auth.users:** solo AFTER INSERT; nessun DELETE trigger.
- **RLS su auth.users:** `relrowsecurity = true` (RLS attiva). Sospetto: GoTrue deleteUser può fallire se non bypassa RLS/policy sullo schema auth → verificare policy (FASE B3).

---

## Evidenze già raccolte (dalle query)

- **B1:** utente esiste in `auth.users`
- **B2:** FK bloccanti verso `auth.users` = **0 righe** (nessun RESTRICT/NO ACTION)
- **Trigger su auth.users:** solo AFTER INSERT (nessun DELETE trigger)
- **RLS su auth.users:** enabled = true, force = false
- **Privilegi `supabase_auth_admin` su auth.users:** SELECT = true, DELETE = true  

⇒ **Root cause non ancora identificata:** manca il messaggio reale DB/GoTrue (Postgres logs) e manca test “DELETE as supabase_auth_admin” + dump completo policy.

---

## PHASE 1 — Read-only forensics (NO PATCH)

Eseguire in **Supabase SQL Editor** con ruolo **postgres**. Incollare l’output completo nel report.

### 1) Conferma utente (di nuovo, prima di tutto)

```sql
SELECT id, email, created_at FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Output (incolla qui):**

```
[ incolla risultato ]
```

---

### 2) Test DELETE “as supabase_auth_admin”

Verifica se il ruolo usato da GoTrue per la DELETE riesce o fallisce e con quale errore esatto (SQLERRM/SQLSTATE).

```sql
DO $$
BEGIN
  SET LOCAL ROLE supabase_auth_admin;
  DELETE FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
  RAISE NOTICE 'DELETE as supabase_auth_admin OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'DELETE as supabase_auth_admin FAILED -> %', SQLERRM;
  RAISE NOTICE 'SQLSTATE -> %', SQLSTATE;
END $$;
```

**Nota:** Se `SET LOCAL ROLE` non è consentito in questo contesto, esegui in due step: (a) connettiti come ruolo `supabase_auth_admin` (se possibile da dashboard) e lancia `DELETE FROM auth.users WHERE id = '...';` oppure (b) usa `SECURITY DEFINER` in una funzione che fa la DELETE. In alternativa, il DO block sopra va eseguito in una sessione dove postgres può fare SET ROLE.

**Output (incolla qui):**
- **SQLERRM:** [ incolla ]
- **SQLSTATE:** [ incolla ]

---

### 3) Policy dump completo su auth.users

Tutte le policy su `auth.users` (definizione completa per capire chi può fare DELETE).

```sql
SELECT
  p.schemaname,
  p.tablename,
  p.policyname,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual::text   AS using_expression,
  p.with_check::text AS with_check_expression
FROM pg_policies p
WHERE p.schemaname = 'auth' AND p.tablename = 'users'
ORDER BY p.policyname;
```

**Output (incolla qui):**

```
[ incolla tutte le righe ]
```

---

### 4) Postgres logs (errore reale)

Con **execution_id** e **timestamp** del tentativo fallito:
- **execution_id:** `f8c220ce-45a7-466a-bb3b-3ea2814cbf5a`
- **timestamp (UTC):** 2026-03-01T07:00:17.888Z

In **Supabase Dashboard → Logs → Postgres** (o Log Explorer / Database):
1. Filtra per finestra temporale intorno a 2026-03-01 07:00:17 UTC.
2. Cerca l’user id `7acd9551-644d-4e32-8758-f892efe47686` o stringhe come: `violates foreign key`, `constraint`, `permission denied`, `row-level security`, `policy`, `DELETE`.

**Output (incolla qui la riga o il blocco più rilevante, max 30–60 righe):**

```
[ incolla estratto Postgres log con l’errore reale ]
```

---

## 4. Forensics DB — Output obbligatori

Eseguire in **Supabase → SQL Editor** (ruolo postgres / service_role) le query sotto e incollare i risultati in questa sezione.

### 4.1 — FK globali verso `auth.users`

```sql
SELECT
  con.conname,
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE con.contype = 'f'
  AND con.confrelid = 'auth.users'::regclass
ORDER BY 2, 3, 1;
```

**Output (incolla qui; se 0 rows scrivi "0 rows"):**

```
[ incolla tutte le righe ]
```

---

## FASE B — DB forensics (query mirate, da eseguire in ordine)

Eseguire in **Supabase SQL Editor** con ruolo postgres / service_role.

### B1 — Conferma utente esiste ancora

```sql
SELECT id, email, created_at FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Output (incolla qui):**

```
[ incolla risultato; se 0 rows l’utente è già stato eliminato ]
```

---

### B2 — Solo FK “bloccanti” (delete_rule NON CASCADE e NON SET NULL)

Query mirata: FK che referenziano `auth.users` e hanno `delete_rule` = RESTRICT o NO ACTION (quelle che impediscono la DELETE).

```sql
SELECT
  con.conname,
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  rc.delete_rule,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = con.conname
  AND rc.constraint_schema = nsp.nspname
WHERE con.contype = 'f'
  AND con.confrelid = 'auth.users'::regclass
  AND rc.delete_rule NOT IN ('CASCADE', 'SET NULL')
ORDER BY nsp.nspname, rel.relname, con.conname;
```

**Output (incolla qui; se 0 rows nessuna FK “bloccante” da questa query):**

```
[ incolla tutte le righe ]
```

---

### B3 — RLS e policy su `auth.users`

RLS attiva su `auth.users` può far fallire la DELETE se le policy non consentono al ruolo usato da GoTrue di eliminare la riga. Verificare:

```sql
-- RLS e force RLS
SELECT n.nspname, c.relname, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth' AND c.relname = 'users';
```

**Output (incolla qui):**

```
[ incolla risultato ]
```

```sql
-- Policy definite su auth.users (cmd = DELETE o * per tutte le operazioni)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual::text AS using_expr, with_check::text
FROM pg_policies
WHERE schemaname = 'auth' AND tablename = 'users'
ORDER BY policyname;
```

**Output (incolla qui):**

```
[ incolla tutte le righe ]
```

Se esistono policy DELETE (o cmd = '*') che non includono il ruolo usato da GoTrue (es. `service_role` / `postgres`), la DELETE può essere bloccata da RLS.

---

### B4 — DELETE di test (SQLERRM + SQLSTATE)

```sql
DO $$
BEGIN
  DELETE FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
  RAISE NOTICE 'DELETE auth.users OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'DELETE auth.users FAILED -> %', SQLERRM;
  RAISE NOTICE 'SQLSTATE -> %', SQLSTATE;
END $$;
```

**Output obbligatorio:**
- **SQLERRM:** [ incolla qui ]
- **SQLSTATE:** [ incolla qui ]

---

### 4.2 — Trigger su `auth.users` e event trigger

```sql
-- Trigger su auth.users
SELECT
  tg.tgname,
  n.nspname AS schema_name,
  c.relname AS table_name,
  pg_get_triggerdef(tg.oid) AS trigger_def
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth' AND c.relname = 'users'
  AND NOT tg.tgisinternal
ORDER BY tg.tgname;
```

**Output trigger (incolla qui):**

```
[ incolla risultato ]
```

```sql
-- Event triggers
SELECT evtname, evtenabled, evtevent, evtfoid::regproc AS fn
FROM pg_event_trigger
ORDER BY 1;
```

**Output event trigger (incolla qui):**

```
[ incolla risultato ]
```

---

### 4.3 — RLS su `auth.users`

```sql
SELECT n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth' AND c.relname = 'users';
```

**Output (incolla qui):**

```
[ incolla risultato ]
```

---

### 4.4 — DELETE di test con SQLERRM e SQLSTATE

```sql
DO $$
BEGIN
  DELETE FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
  RAISE NOTICE 'DELETE auth.users OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'DELETE auth.users FAILED -> %', SQLERRM;
  RAISE NOTICE 'SQLSTATE -> %', SQLSTATE;
END $$;
```

**Output obbligatorio:**
- **SQLERRM:** [ incolla qui ]
- **SQLSTATE:** [ incolla qui ]

---

### 4.5 — Postgres logs (prova definitiva se SQLERRM non basta)

1. Prendi **sb_request_id** (o x-request-id) dal log Edge del tentativo fallito (sezione 2).
2. Supabase → **Logs** → **Postgres** (o Log Explorer / Database logs).
3. Filtra per la finestra temporale del tentativo e cerca:
   - user id `7acd9551-644d-4e32-8758-f892efe47686`
   - stringhe: `violates foreign key constraint`, `constraint`, `deadlock`, `could not serialize`, `permission denied`, `update or delete on table "users"`

**Output (incolla la riga/blocco più rilevante, max 30–60 righe):**

```
[ incolla estratto Postgres log con l’errore reale ]
```

---

## 5. Root cause conclusiva (da compilare dopo forensics)

**5.1 — Root cause primaria (una frase + prova)**

Esempi ammessi:
- "FK `<nome>` su `<schema>.<tabella>(<colonna>)` blocca la delete su `auth.users` perché ON DELETE RESTRICT; prova: SQLERRM / Postgres log."
- "Trigger custom su `auth.users` chiama funzione X che fallisce; prova: output 4.2."
- "RLS/force RLS su `auth.users` attiva e blocca la delete; prova: output 4.3."
- "Deadlock/lock su tabelle auth durante deleteUser; prova: Postgres log."
- "Constraint storage con nome diverso da quello usato nello script; prova: output 4.1 + Postgres log."

**Root cause primaria:**  
[ compilare dopo aver incollato FASE B e 4.4/4.5 ]

**Prova (riferimento a sezione/riga):**  
[ es. "SQLERRM: ..." oppure "Postgres log riga con constraint X" oppure "B2 riga con constraint Y" oppure "B3: RLS attiva + policy DELETE che esclude ruolo GoTrue" ]

**Candidati se B2 = 0 rows:**
- **RLS su auth.users:** se B3 mostra `rls_enabled = true` e esistono policy su `auth.users` che non concedono DELETE al ruolo usato da GoTrue (es. `service_role` / `postgres`), la DELETE può essere bloccata da RLS. Verificare in Supabase se il ruolo con cui gira GoTrue bypassa RLS (di solito il service role bypassa RLS; se invece si usa un ruolo custom, controllare `pg_roles` e policy).
- **Errore non FK:** Postgres log (4.5) per deadlock, permission denied, o messaggio specifico.

**5.2 — Root cause secondaria (se presente)**  
[ es. altra FK o altra tabella; altrimenti "N/A" ]

---

## 6. Patch minima (SOLO dopo root cause dimostrata)

**Non applicare** fino a quando la sezione 5 non è compilata con prove (SQLERRM e/o Postgres log).

### Caso A — FK “dati utente” → ON DELETE CASCADE

```sql
-- FORWARD
ALTER TABLE <schema>.<table> DROP CONSTRAINT IF EXISTS <constraint_name>;
ALTER TABLE <schema>.<table>
  ADD CONSTRAINT <constraint_name>
  FOREIGN KEY (<column>) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ROLLBACK (ripristino stato precedente)
-- ALTER TABLE <schema>.<table> DROP CONSTRAINT IF EXISTS <constraint_name>;
-- ALTER TABLE <schema>.<table> ADD CONSTRAINT <constraint_name> FOREIGN KEY (<column>) REFERENCES auth.users(id) ON DELETE RESTRICT;
```

### Caso B — Tabelle “audit/log” → ON DELETE SET NULL

```sql
-- FORWARD
ALTER TABLE <schema>.<table> ALTER COLUMN <column> DROP NOT NULL;
ALTER TABLE <schema>.<table> DROP CONSTRAINT IF EXISTS <constraint_name>;
ALTER TABLE <schema>.<table>
  ADD CONSTRAINT <constraint_name>
  FOREIGN KEY (<column>) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ROLLBACK: ripristinare NOT NULL (solo se possibile) e constraint con ON DELETE precedente.
```

### Caso C — Trigger / RLS / altro (non FK)

- Trigger: rimuovere o correggere trigger custom su `auth.users` se illegittimo.
- RLS: disabilitare RLS su `auth.users` se attivata per errore.
- RPC: introdurre `purge_user_data(p_user uuid)` che pulisce in ordine le tabelle applicative, poi in Edge: chiamare RPC poi `auth.admin.deleteUser(user_id)`.

**Patch effettivamente applicata (da compilare dopo decisione):**  
[ schema, tabella, constraint, tipo CASCADE/SET NULL o Caso C ]

**Rollback garantito:**  
[ comando git: tag o reset; script SQL di rollback se applicabile ]

---

## 7. Verifica (obbligatoria, con prove)

Eseguire **dopo** aver applicato la patch.

**7.1 — DO-block delete test**

```sql
DO $$
BEGIN
  DELETE FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
  RAISE NOTICE 'DELETE OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'DELETE FAILED -> %', SQLERRM;
END $$;
```

**Esito:** [ OK / FAIL ] — [ incolla NOTICE ]

**7.2 — Da iPhone: Delete Account**

- OPTIONS: [ 204 ]
- POST: [ 200 / 204 ] (prima era 500)
- Log Edge: [ nessun DELETEUSER_FAIL / incolla riga rilevante ]

**7.3 — Utente rimosso da auth**

```sql
SELECT id FROM auth.users WHERE id = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Esito:** [ 0 rows ]

---

## Riepilogo vincoli (scope control)

- Solo: Edge Function `delete-account` + DB (constraint/trigger/policy) + eventuale RPC `purge_user_data`.
- Vietato: refactor estesi, migrazioni “wide”, cambi UI/routing non necessari.
- Ogni patch con rollback (git tag + script SQL dove applicabile).
- **Nessuna patch applicata finché la root cause non è dimostrata** (sezione 5 compilata con prove).
