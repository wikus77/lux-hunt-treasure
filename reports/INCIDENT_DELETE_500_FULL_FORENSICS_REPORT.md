# Incident: Delete Account 500 "Database error deleting user" — Report forense completo

**Branch:** `fix/delete-account-500-auth-delete`  
**Tag rollback:** `backup/before-delete-account-fix`  
**Sintomo UI iOS:** "Danger Zone — Edge Function returned a non-2xx status code"  
**Utente test:** `7acd9551-644d-4e32-8758-f892efe47686`

---

## FASE 0 — Checkpoint e rollback ✅

| Elemento | Stato |
|----------|--------|
| Branch corrente | `fix/delete-account-500-auth-delete` |
| Tag rollback | `backup/before-delete-account-fix` |
| Rollback comando | `git checkout backup/before-delete-account-fix` o `git reset --hard backup/before-delete-account-fix` |

**Prima di applicare qualsiasi patch DB:** crea tag addizionale  
`backup/before-db-fk-fix-<timestamp>` (es. `backup/before-db-fk-fix-20260227-1200`).

---

## FASE 1 — Forensics Edge Function (READ-ONLY)

### 1.1) Client Supabase e chiave

Dal codice `supabase/functions/delete-account/index.ts`:

- **Chiave usata:** `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` → il client è creato con **SERVICE_ROLE_KEY** (admin).
- **Creazione client:** `createClient(url, serviceKey)` (riga ~44). Quindi `auth.admin.deleteUser()` viene chiamato con privilegi **admin** (service role). ✅
- Se `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` fossero assenti/vuoti, la risposta sarebbe **500 "Server configuration error"** (e nel log: `DELETE_ACCOUNT: config missing`). Dato che il log mostra "Database error deleting user", le env sono presenti e il fallimento avviene **dentro** GoTrue/DB.

### 1.2) Identificazione utente e validazione

- **Fonte user_id:** header `Authorization: Bearer <jwt>` → `admin.auth.getUser(jwt)` → `user.id`.
- **user_id** è quindi **sempre** il subject del JWT validato; non viene letto da body. Nessun rischio di mismatch. ✅

### 1.3) Punto esatto dell’errore

- L’errore avviene in **`admin.auth.admin.deleteUser(user_id)`** (chiamata GoTrue Admin API).
- I log mostrano prima "admin_logs count for user 13/14" (query DB OK) e poi "deleteUser failed" → il 500 è scatenato dalla **cancellazione su auth.users**, bloccata da un vincolo DB (FK/trigger/policy).

### 1.4) Logging diagnostico aggiunto (safe, no secrets)

Sono stati aggiunti log con:

- `req_id`: da header `x-request-id` o `sb_request_id` (se presenti).
- Step: `START`, `DELETEUSER_START`, `DELETEUSER_OK` / `DELETEUSER_FAIL`, `PURGE_OK`, `CATCH`.
- Oggetto errore completo: `name`, `message`, `status`, `code`, `details`, `stack`.
- In caso di config mancante: `has_url`, `has_service_role_key` (boolean, no valori).

**Azione richiesta:**  
1) Fare deploy della Edge Function.  
2) Ripetere Delete Account da iPhone.  
3) Incollare qui i log completi dell’invocazione (in particolare la riga `DELETEUSER_FAIL` con tutto `error`).

### 1.5) Output obbligatorio FASE 1 (da compilare dopo re-deploy e tentativo)

| Voce | Valore (incolla da log/dashboard) |
|------|-----------------------------------|
| 1) Key usata da auth.admin | SERVICE_ROLE_KEY (confermato da codice; in dashboard verificare che `SUPABASE_SERVICE_ROLE_KEY` sia impostata per la Edge) |
| 2) Log completo errore (name, message, status, code, details, stack) | ___________________________ |
| 3) user_id usato = subject JWT | Sì (user_id deriva da getUser(jwt), non da body) |

**Dashboard Supabase → Edge Functions → delete-account → Settings/Environment:**  
Verificare presenza di `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Se manca la service role key, GoTrue non può chiamare deleteUser con privilegi admin.

---

## FASE 2 — Forensics database: cosa blocca `auth.users`

Esegui in **Supabase → SQL Editor** (ruolo postgres o service_role) la query sotto e **incolla l’intero risultato** in questa sezione.

### 2.1) Lista completa FK che referenziano `auth.users`

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

**Output (incolla qui):**

```
[ incolla risultato della query sopra ]
```

### 2.2) (Opzionale) Nome esatto constraint su storage.objects per owner_id

Se nella lista 2.1 compare una riga con `schema_name = 'storage'` e `table_name = 'objects'`, il nome del constraint potrebbe non essere `storage_objects_owner_fkey`. Per avere nome e definizione:

```sql
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'storage' AND rel.relname = 'objects' AND con.contype = 'f';
```

**Output (incolla qui):**

```
[ incolla risultato ]
```

---

## Root cause (da compilare dopo FASE 2)

- **Constraint/tabella che blocca:** ___________________________
- **Schema.table.colonna:** ___________________________
- **delete_rule attuale (RESTRICT / NO ACTION / altro):** ___________________________

---

## Piano fix minimo (dopo forensics)

1. **Se blocker = FK su tabella public/storage:**  
   - Se i record devono sparire con l’utente → migration: drop FK, add FK `ON DELETE CASCADE`.  
   - Se i record devono restare (es. log) → migration: colonna nullable + `ON DELETE SET NULL`.
2. **Se blocker = constraint con nome diverso** (es. storage):  
   - Usare nella migration il **nome esatto** uscito dalla query 2.1/2.2 (non assumere `storage_objects_owner_fkey`).
3. **Rollback:**  
   - Prima di applicare migration DB: `git tag backup/before-db-fk-fix-<timestamp>`.  
   - Script di rollback: drop constraint nuova, ricreare constraint con definizione precedente (es. ON DELETE RESTRICT).

---

## Verifica finale (dopo fix)

1. Rieseguire in SQL Editor il blocco delete di test su `auth.users` per l’utente test; atteso: "DELETE OK".
2. Da iPhone: Delete Account → POST 200, nessun "Database error deleting user" nei log, app torna al Login.

---

## Riepilogo vincoli

- Solo iOS native wrapper + Supabase Edge/DB. Nessun PWA/TWA.
- Nessun refactor generale; fix minimo mirato.
- Ogni modifica con rollback (tag già presenti; prima di patch DB creare tag aggiuntivo).
- Forensics prima, poi decisione e patch.
