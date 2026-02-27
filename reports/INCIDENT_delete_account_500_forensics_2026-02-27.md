# INCIDENT — Delete Account 500 — Forensics “cause vere” + prove

**Data:** 2026-02-27  
**Target:** M1SSION™ app nativa iOS (Capacitor / WKWebView)  
**Sintomo:** “Delete Account” → Edge Function `delete-account` risponde **500**  
**Dashboard log:** `delete-account: error Database error deleting user`  
**Modalità:** SOLO verifica / forensics — **NESSUNA modifica** a codice, DB, RLS, Edge, env, config  
**Firma:** Lovable Agent JLENIA — FORENSICS MODE (NO PATCH)

---

## Executive Summary

L’Edge Function `delete-account` ritorna 500 dopo aver eseguito storage cleanup, delete su 5 tabelle public, delete su `profiles`, e infine `admin.auth.admin.deleteUser(user_id)`. Nel codice l’**unico throw** che porta al 500 è quello su **authResult.error** (riga 100): il messaggio osservato è **“Database error deleting user”**, quindi il fallimento avviene **dentro** `auth.admin.deleteUser`.

**Causa diretta (da codice):**  
Il 500 è determinato dal **fallimento di `auth.admin.deleteUser(user_id)`**; il testo “Database error deleting user” è il `.message` dell’errore restituito dall’API Auth.

**Cause strutturali candidate (da verificare con PROD):**  
1. **FK blocker:** una o più tabelle in **public** (o in **auth**) referenziano `auth.users(id)` con **ON DELETE RESTRICT / NO ACTION** e contengono ancora righe per l’utente; la function non le elimina (o le elimina con warn+continue e la delete fallisce silenziosamente), quindi la DELETE su `auth.users` viene bloccata da Postgres.  
2. **Delete parziali silenziose:** gli step precedenti (tabelle in `tablesByUser` + `profiles`) in caso di errore fanno solo `console.warn` e continuano; se una di quelle delete fallisce (es. RLS, FK, tabella inesistente), i record restano e un successivo FK su `auth.users` può bloccare `deleteUser`.  
3. **Mismatch migrations vs PROD:** vincoli definiti come CASCADE nelle migrations potrebbero in PROD essere ancora NO ACTION (migrazione non applicata o rollback); oppure tabelle presenti in PROD con FK a auth.users non presenti nelle migrations analizzate.

**Prove richieste per causa deterministica:**  
- **Dashboard:** execution_id, timestamp, event_message e se possibile **raw/details** dell’invocazione 500 (codice errore Postgres, constraint name, tabella).  
- **DB PROD:** esecuzione delle query read-only sotto (FASE 2) per elencare **tutti** i vincoli FK verso `auth.users` e il relativo `confdeltype`; evidenziare i **blocker** (RESTRICT/NO ACTION).  

Senza questi dati, il report può solo **inferire** i blocker da migrations e dall’ordine di esecuzione della function; **non** fornire una causa reale univoca.

---

## FASE 0 — Inventario: UI → invoke → Edge Function → DB/Auth

### A) Edge Function

**File:** `supabase/functions/delete-account/index.ts`

- **Metodo:** POST (OPTIONS → 204).
- **Auth:** Legge `Authorization: Bearer <jwt>`, valida con `admin.auth.getUser(jwt)`; estrae `user_id = user.id`.
- **Client:** `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` → client admin (service role).
- **Sequenza:**
  1. Storage: `avatars` bucket, folder `user_id` → list + remove; on error: `console.warn`, continue.
  2. Public tables (ordine): `email_sends` (recipient_user_id), `user_clues` (user_id), `user_buzz_counter` (user_id), `user_notifications` (user_id), `subscriptions` (user_id). Per ognuna: `admin.from(table).delete().eq(column, user_id)`; on error: `console.warn`, continue.
  3. Profiles: `admin.from("profiles").delete().eq("id", user_id)`; on error: `console.warn`, continue.
  4. Auth: `admin.auth.admin.deleteUser(user_id)`; se `authResult.error` e messaggio non “not found”/“does not exist” → **throw authResult.error** → catch → 500, `console.warn("delete-account: error", message)`.

### B) Caller UI

| Entrypoint UI | File | Funzione | Invoke |
|---------------|------|----------|--------|
| Modale Delete Account (Settings / Legal) | `src/components/m1units/DeleteAccountModalContent.tsx` | `handleDelete` | `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer ${session.access_token} } })` |
| Pagina Legal (Settings) | `src/pages/settings/LegalSettings.tsx` | handler delete account | `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer ${(await supabase.auth.getSession()).data.session?.access_token} } })` |

Entrambi: nessun body; in caso di successo fanno signOut/redirect. Nessun altro caller invoca `delete-account` nel repo (grep confermato).

**Mappa completa:**  
UI (DeleteAccountModalContent / LegalSettings) → `functions.invoke('delete-account', POST + Bearer)` → Edge `delete-account/index.ts` → storage cleanup → delete 5 tabelle → delete profiles → auth.admin.deleteUser → (se errore) → 500.

---

## FASE 1 — Dashboard Evidence

**Istruzioni:** Supabase Dashboard → Edge Functions → `delete-account` → Invocations → selezionare l’evento **POST 500** più recente. Copiare qui sotto i campi (NON includere token, key, secret).

| Campo | Valore (da incollare) |
|-------|------------------------|
| execution_id | |
| timestamp | |
| deployment_id | |
| request_id | |
| event_message | |
| Raw / stacktrace / details (solo code, constraint, hint, table) | |

**Se il dettaglio non mostra constraint/codice Postgres:**  
Annotare: *“Dashboard non espone Postgres error code/constraint → serve ispezione DB read-only (FASE 2).”*

---

## FASE 2 — DB Forensics: FK verso `auth.users` in PROD (read-only)

Eseguire **solo in Supabase SQL Editor** (read-only) sul progetto PROD le query sotto e incollare i risultati nel report.

### Query A — Elenco FK verso auth.users con delete rule

```sql
-- FK che referenziano auth.users (pg_catalog)
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS fk_column,
  con.conname AS constraint_name,
  con.confdeltype AS confdeltype,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
    ELSE con.confdeltype::text
  END AS on_delete_action
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey) AND a.attisdropped = false
JOIN pg_class ref ON ref.oid = con.confrelid
JOIN pg_namespace refn ON refn.oid = ref.relnamespace
WHERE con.contype = 'f'
  AND refn.nspname = 'auth'
  AND ref.relname = 'users'
ORDER BY n.nspname, c.relname, con.conname;
```

**Interpretazione confdeltype:**  
- `a` = NO ACTION, `r` = RESTRICT → **BLOCKER** (impediscono DELETE su auth.users se esistono righe figlie).  
- `c` = CASCADE, `n` = SET NULL → non bloccanti (a meno di bug/ordine).

### Tabella “FK → auth.users (PROD)”

*(Compilare con l’output della Query A.)*

| schema_name | table_name | fk_column | constraint_name | confdeltype | on_delete_action |
|-------------|------------|-----------|-----------------|-------------|------------------|
| ... | ... | ... | ... | ... | ... |

### Blockers reali

Elencare qui le righe con **on_delete_action** = `NO ACTION` o `RESTRICT` (confdeltype `a` o `r`). Per ognuna indicare se la function `delete-account` elimina quella tabella (e con quale colonna).

**Esempio:**  
- `public.iap_notifications` — `user_id` — constraint `...` — NO ACTION — **Function non la cancella** → BLOCKER.

### Query B (opzionale) — Conteggio righe per user test

Se si dispone di un `user_id` (UUID) per cui la delete ha restituito 500, sostituire `<USER_ID>` e eseguire (read-only) per le tabelle sospette:

```sql
-- Sostituire <USER_ID> con l'UUID dell'utente test
SELECT 'profiles' AS tbl, COUNT(*) FROM public.profiles WHERE id = '<USER_ID>'
UNION ALL
SELECT 'email_sends', COUNT(*) FROM public.email_sends WHERE recipient_user_id = '<USER_ID>'
UNION ALL
SELECT 'user_clues', COUNT(*) FROM public.user_clues WHERE user_id = '<USER_ID>'
UNION ALL
SELECT 'user_notifications', COUNT(*) FROM public.user_notifications WHERE user_id = '<USER_ID>'
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions WHERE user_id = '<USER_ID>';
-- Aggiungere altre tabelle con FK a auth.users che risultano BLOCKER.
```

Inserire sotto il risultato (o annotare “non eseguito / user_id non disponibile”).

---

## FASE 3 — Confronto: Migrations vs DB reale

### Da migrations (repo) — FK senza ON DELETE CASCADE/SET NULL

Dalle migrations analizzate, le definizioni che **non** specificano ON DELETE (quindi default **NO ACTION** in Postgres) o che potrebbero essere ancora presenti in PROD se migrazioni successive non le hanno modificate:

| Migration | Tabella (inferita) | Colonna | Note |
|------------|--------------------|---------|------|
| 20260120_001_iap_notifications_rate_limits.sql | iap_notifications | user_id | `REFERENCES auth.users(id)` solo |
| 20260119_001_iap_schema.sql | iap_transactions | user_id | idem (poi 20260128_004 può aver aggiunto CASCADE) |
| 20260119_001_iap_schema.sql | user_wallet | user_id | idem (poi 20260129_005 può aver aggiunto CASCADE) |
| 20260119_001_iap_schema.sql | user_entitlements | user_id | idem |
| 20260119_001_iap_schema.sql | iap_audit_logs | user_id | idem |
| 20260119_005_lottery_winners_claim.sql | lottery_notifications (?) | user_id | `REFERENCES auth.users(id)` solo |
| 20251226_landing_events.sql | landing_events | user_id | idem |
| 20250115_007_referral_system.sql | profiles | referred_by | idem (la function elimina profiles prima di deleteUser) |
| 20251201_group_chat_full.sql | (group chat) | handled_by | idem |
| 20251128_fix_missing_functions.sql | varie (battle/chat) | creator_id, opponent_id, winner_id, sender_id, recipient_id | no ON DELETE |
| 20251120035636 (b58dba26...) | varie | assigned_by, admin_id, target_user_id, created_by | no ON DELETE |
| 20251120125505 | (tabella con user_id) | user_id | una occorrenza senza CASCADE |

L’ordine di applicazione delle migrations può aver cambiato alcuni vincoli in CASCADE; **lo stato reale è dato solo dalla Query A su PROD**.

### Mismatch Summary

- **Da compilare dopo FASE 2:**  
  - Vincoli che in migrations risultano CASCADE ma in PROD hanno confdeltype `a`/`r`.  
  - Tabelle presenti in PROD con FK a auth.users (da Query A) che **non** compaiono nella lista “tablesByUser” o “profiles” nella function → non coperte dalla function.  
- Se la Query A non è stata ancora eseguita: *“Mismatch non determinabile senza risultati PROD (FASE 2).”*

---

## FASE 4 — Edge Function path: possibili delete parziali “silenziose”

### Execution checklist (da codice, senza modifiche)

| Step | Azione | On error |
|------|--------|----------|
| 1 | Storage: avatars, list(user_id) + remove(paths) | console.warn, continue |
| 2a | Delete `email_sends` WHERE recipient_user_id = user_id | console.warn, continue |
| 2b | Delete `user_clues` WHERE user_id = user_id | console.warn, continue |
| 2c | Delete `user_buzz_counter` WHERE user_id = user_id | console.warn, continue |
| 2d | Delete `user_notifications` WHERE user_id = user_id | console.warn, continue |
| 2e | Delete `subscriptions` WHERE user_id = user_id | console.warn, continue |
| 3 | Delete `profiles` WHERE id = user_id | console.warn, continue |
| 4 | auth.admin.deleteUser(user_id) | **throw** → 500 |

### Copertura tabelle

- **Eliminate dalla function (esplicitamente):**  
  email_sends, user_clues, user_buzz_counter, user_notifications, subscriptions, profiles.

- **Non eliminate dalla function (candidati blocker se FK = RESTRICT/NO ACTION):**  
  Tutte le altre tabelle che in PROD hanno FK verso auth.users con confdeltype `a` o `r` (vedi FASE 2). Da migrations: es. iap_notifications, iap_audit_logs, landing_events, e qualsiasi tabella con FK “solo REFERENCES auth.users(id)” non successivamente modificata in CASCADE.

### Silent-failure risk

- Se una delle delete agli step 2a–3 **fallisce** (es. tabella inesistente, RLS, FK a sua volta), la function **non** interrompe e non ritorna 500 in quel punto; i record restano.  
- Se una di quelle tabelle o un’altra tabella (non in lista) ha FK verso auth.users con RESTRICT/NO ACTION, la successiva `deleteUser` può fallire con “Database error deleting user”.  
- **Dai soli log dashboard:** se non compaiono warning tipo `delete-account: <table> delete warning` o `profiles delete warning`, non è possibile confermare delete parziali silenziose; annotare: *“Logging insufficiente per confermare failure silenziose sugli step 1–3.”*

---

## FASE 5 — Classificazione: causa diretta vs concause vs rumore

- **Causa diretta del 500 (con prova da codice):**  
  **auth.admin.deleteUser(user_id)** restituisce errore con messaggio “Database error deleting user” → l’unico `throw` nel try è su `authResult.error` (riga 100) → catch → 500 e log osservato.

- **Concause (da confermare con PROD):**  
  - Presenza di vincoli FK verso auth.users con **ON DELETE RESTRICT/NO ACTION** su tabelle non eliminate (o eliminate con failure silenziosa) dalla function.  
  - Delete parziali silenziose (warn+continue) che lasciano righe in tabelle che referenziano auth.users.

- **Rumore non correlato:**  
  Log iOS (WebKit, LockManager, CARenderServer, _AXAddToElementCache, sandbox extension, UIScene lifecycle, WEBP err=-50, ecc.) non sono la causa del 500 della Edge Function.

---

## Root cause “cause vere” (deterministiche)

- **Con sola analisi codice:**  
  Il 500 è causato dal **fallimento di `auth.admin.deleteUser(user_id)`**; il messaggio “Database error deleting user” è quello restituito dall’API Auth. Nessun altro path nel try ritorna 500.

- **Causa deterministica piena (richiede PROD):**  
  Dopo aver eseguito la Query A (FASE 2) e opzionalmente Query B e aver compilato “Blockers reali”, la causa reale è:  
  - **Se esiste almeno un BLOCKER (FK RESTRICT/NO ACTION su tabella con righe per l’utente):** il 500 è dovuto alla violazione di quel vincolo quando Auth/DB tenta la DELETE su auth.users.  
  - **Se non esiste alcun BLOCKER in public:** la causa è interna allo schema **auth** (es. sessioni/refresh_tokens) o al comportamento di GoTrue/Supabase; per prova deterministica servirebbero dettagli raw dell’errore (dashboard o logging aggiuntivo).

---

## What works / What fails

**Funziona:**

- Invocazione da app (POST + Bearer).
- Validazione JWT e estrazione user_id in Edge.
- Client service role e sequenza storage → tabelle → profiles (con warn su errore, senza 500).
- Gestione “not found” su deleteUser (ritorno 200).

**Non funziona:**

- **auth.admin.deleteUser(user_id)** fallisce con “Database error deleting user” → throw → risposta 500; l’utente non completa la cancellazione account.

---

## Possibili soluzioni (SOLO TESTO, NO PATCH)

### A) Non invasive (diagnostica / logging / check constraint)

- Aumentare logging in Edge: prima del throw, loggare `authResult.error` completo (code, details, hint), **senza** token/key.  
- Eseguire in PROD le query FASE 2 e documentare i blocker reali.  
- In una singola invocazione test (account dedicato), verificare se nei log compaiono warning su delete (storage, tabelle, profiles).

### B) Data cleanup (eliminare record blocker)

- Per l’utente che riceve 500: in modalità read-only identificare le tabelle con FK RESTRICT/NO ACTION che hanno ancora righe per quel user_id; poi (fuori da questo report, con processo controllato) eliminare quelle righe **prima** di richiamare di nuovo delete-account, oppure estendere la function per eliminare esplicitamente quelle tabelle prima di deleteUser.  
- Rischio: medio (integrità referenziale; va fatto in ordine corretto).

### C) Schema change (CASCADE / SET NULL)

- Per ogni FK verso auth.users attualmente RESTRICT/NO ACTION, valutare migrazione a ON DELETE CASCADE (o SET NULL dove sensato) così che la DELETE su auth.users non sia bloccata.  
- Rischio: medio-alto; impatta tutto il DB; richiede analisi per tabella e backup.

### D) Function logic (estendere deletes / ordine)

- Estendere `tablesByUser` (e l’ordine di delete) includendo tutte le tabelle public che referenziano auth.users e che in PROD hanno RESTRICT/NO ACTION, rispettando l’ordine di dipendenze (figli prima).  
- Rischio: medio (ordine sbagliato può causare FK violation tra tabelle public); va testato con account dedicato.

---

## Checklist verifica finale (post-fix, solo riferimento)

- [ ] Da iOS: Settings → Delete Account Permanently (o Legal → Delete Account) → conferma → nessun 500.  
- [ ] Dashboard: ultima invocazione delete-account → status 200.  
- [ ] Log: nessun “delete-account: error Database error deleting user”.  
- [ ] Utente disconnesso e reindirizzato a login; account non più presente in auth.users (verifica read-only se necessario).

---

**Nessuna modifica è stata applicata a codice, DB, RLS, Edge Functions, env, migrazioni o configurazioni.**  
**Nessun deploy, nessun comando distruttivo.**
