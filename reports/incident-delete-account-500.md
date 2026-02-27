# Incident Report — Delete Account Edge Function 500

**Data:** 2026-02-27  
**Target:** App nativa iOS (Capacitor / WKWebView) — M1SSION™  
**Scope:** Verifica forense end-to-end — **nessuna modifica a codice/config/DB/RLS/Edge Functions**  
**Firma:** Lovable Agent JLENIA

---

## 1. Executive Summary

L’invocazione POST della Edge Function `delete-account` restituisce **500**; i log dashboard mostrano:  
`delete-account: error Database error deleting user`.  
La verifica in sola lettura sul repo conferma che: (1) il client invoca correttamente la function con JWT; (2) la function usa Service Role e fa storage → tabelle public → `auth.admin.deleteUser`; (3) l’unico `throw` che porta al 500 è quello su **authResult.error** dentro `auth.admin.deleteUser`. Quindi il **500 è causato dal fallimento di `auth.admin.deleteUser`**, che restituisce il messaggio “Database error deleting user”. Le cause candidate sono: **FK in public o in auth che bloccano la DELETE su auth.users**, oppure **tabelle public con riferimenti a auth.users non eliminate dalla function** (RESTRICT/NO ACTION). Il logging attuale non espone il codice/constraint Postgres, quindi la causa esatta va confermata con log dettagliati o ispezione DB live.

---

## 2. Symptoms + Evidence

- **Dashboard:** Edge Functions → delete-account → Invocations: **POST 500**.
- **Log:** `delete-account: error Database error deleting user`.
- **App:** Chiamata `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer <access_token> } })`; in caso di errore l’utente vede messaggio generico (toast “Deletion failed…”).

**Evidenze da codice (read-only):**  
In `supabase/functions/delete-account/index.ts` il catch finale (righe 107–114) fa `console.warn("delete-account: error", message)` e ritorna 500. L’unico `throw` nel try è `throw authResult.error` (riga 100). Quindi **il messaggio “Database error deleting user” è il `.message` di `authResult.error`** restituito da `admin.auth.admin.deleteUser(user_id)`.

---

## 3. Callers Map (UI → invoke)

| File | Funzione / contesto | Invoke params |
|------|---------------------|----------------|
| **src/components/m1units/DeleteAccountModalContent.tsx** | `handleDelete` (conferma modale Delete Account) | `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer ${session.access_token} } })` |
| **src/pages/settings/LegalSettings.tsx** | Handler cancellazione account (pagina Legal) | `supabase.functions.invoke('delete-account', { method: 'POST', headers: { Authorization: Bearer ${(await supabase.auth.getSession()).data.session?.access_token} } })` |

Entrambi: nessun body; solo Authorization Bearer con access_token. In caso di successo: signOut, clear localStorage, redirect a login (in DeleteAccountModalContent); comportamento analogo atteso in LegalSettings.

---

## 4. Edge Function Execution Trace

**File:** `supabase/functions/delete-account/index.ts`

- **Metodo:** POST (OPTIONS → 204).
- **Env:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; se mancanti → 500 “Server configuration error”.
- **Auth:** Legge `Authorization` header, estrae JWT (dopo "Bearer "), usa `admin.auth.getUser(jwt)` per validare e ottenere `user.id`; se invalido → 401.
- **Client:** `createClient(url, serviceKey)` → client **admin** (service role), non anon/user JWT.

**Sequenza:**

1. **Storage:** `admin.storage.from("avatars").list(user_id)` poi `remove(paths)`. In caso di errore: `console.warn`, **continue** (non throw).
2. **Public tables (ordine):** Per ogni coppia (table, column) in  
   `email_sends` (recipient_user_id), `user_clues` (user_id), `user_buzz_counter` (user_id), `user_notifications` (user_id), `subscriptions` (user_id):  
   `admin.from(table).delete().eq(column, user_id)`. In caso di errore: `console.warn`, **continue**.
3. **Profiles:** `admin.from("profiles").delete().eq("id", user_id)`. In caso di errore: `console.warn`, **continue** (non throw).
4. **Auth:** `admin.auth.admin.deleteUser(user_id)`. Se `authResult.error`:  
   - se il messaggio contiene “not found” / “does not exist” → ritorna 200 success;  
   - altrimenti **throw authResult.error** → catch → 500 e log “delete-account: error” + message.

**Failure points per step:**

- Step 1: bucket/permessi storage → solo warning, non 500.
- Step 2–3: tabelle inesistenti, RLS, FK, permessi → solo warning; la function **non** interrompe.
- Step 4: **auth.admin.deleteUser** fallisce → **unica fonte del 500** osservata; messaggio tipico “Database error deleting user”.

---

## 5. Dashboard Logs Correlation (invocation IDs, execution_id)

**Stato:** Nessun accesso diretto alla dashboard in questa verifica.  
**Da fare a mano (read-only):**  
Aprire Supabase Dashboard → Edge Functions → delete-account → Logs / Invocations, selezionare l’evento con POST 500 e annotare:

- **execution_id**
- **timestamp**
- **event_message** (es. “delete-account: error Database error deleting user”)
- Se disponibile **Raw / stacktrace:** codice errore Postgres (23503 FK, 42501 permission, ecc.), nome tabella/constraint.

**Conclusione:** Se nei log non compare il dettaglio DB (codice, constraint, tabella), **il logging attuale non permette di provare la causa esatta solo da dashboard**; serve logging aggiuntivo in function o ispezione DB.

---

## 6. DB Schema / FK Blockers

**Tabelle che la function elimina esplicitamente:**  
email_sends (recipient_user_id), user_clues (user_id), user_buzz_counter (user_id), user_notifications (user_id), subscriptions (user_id), profiles (id).

**Tabelle con FK verso auth.users (da migrations):**

- La maggior parte ha **ON DELETE CASCADE** (es. iap_transactions, user_entitlements, user_wallet, m1u_ledger, vera_mission_runs, mpe_*, commit_ritual_daily, user_progress_meters, profiles.id in 20251208, ecc.): alla DELETE su auth.users, Postgres elimina in cascata; **non bloccano**.
- **Possibili eccezioni (no CASCADE / no ON DELETE):**
  - **20260119_001_iap_schema.sql:** iap_transactions, user_wallet, user_entitlements, iap_audit_logs con `REFERENCES auth.users(id)` **senza** ON DELETE (default NO ACTION).  
    Le migrazioni successive (20260128_004, 20260129_005) ridefiniscono alcune di queste con ON DELETE CASCADE; l’ordine delle migrazioni va verificato sul DB reale.
  - **20260120_001_iap_notifications_rate_limits.sql:** iap_notifications.user_id `REFERENCES auth.users(id)` senza ON DELETE.
  - **20251226_landing_events.sql:** user_id `REFERENCES auth.users(id)` senza ON DELETE.
  - **20250115_007_referral_system.sql:** profiles.referred_by `REFERENCES auth.users(id)` senza ON DELETE (la function elimina comunque la riga profiles prima di deleteUser).
  - **20251128_fix_missing_functions.sql:** creator_id, opponent_id, winner_id, sender_id, recipient_id in varie tabelle `REFERENCES auth.users(id)` senza ON DELETE (potrebbero essere stati corretti in 20251208).

**Tabella “User FK blockers” (inferita da migrations, da confermare su DB):**

| Tabella (candidata) | Colonna | Constraint / comportamento | Coperta dalla function? |
|---------------------|--------|----------------------------|--------------------------|
| profiles | id | profiles_id_fkey → auth.users(id) ON DELETE CASCADE (20251208) | Sì (delete esplicita) |
| iap_notifications | user_id | REFERENCES auth.users(id) [no ON DELETE in 20260120] | No |
| iap_audit_logs | user_id | REFERENCES auth.users(id) [no ON DELETE in 20260119] | No |
| landing_events | user_id | REFERENCES auth.users(id) [no ON DELETE] | No |
| Altre tabelle con FK auth.users senza CASCADE | varie | NO ACTION / RESTRICT | Parziale / No |

Se sul DB esistono ancora FK verso auth.users **senza** ON DELETE CASCADE/SET NULL, la DELETE su auth.users può fallire con “Database error deleting user” finché quelle righe non sono eliminate o il vincolo non è modificato.

---

## 7. Permissions / RLS / Service Role Assessment

- **Env:** La function usa `SUPABASE_SERVICE_ROLE_KEY`; presenza in env: **da considerare “present”** se la function non ritorna 500 “Server configuration error” prima di arrivare a deleteUser (altrimenti il 500 sarebbe “Server configuration error”).
- **Client:** `createClient(url, serviceKey)` → client **admin** (service role); tutte le operazioni (storage, from().delete(), auth.admin.deleteUser) sono con privilegi elevati; **RLS non si applica** al client service role.
- **Auth capability:** `auth.admin.deleteUser` richiede service role; l’uso è corretto lato codice. Un eventuale “Database error deleting user” è quindi **errore lato DB/constraint** durante l’operazione di delete utente in auth, non mancanza di permessi sulla chiave.

**RLS exposure check (inferenza):** Le delete su public sono eseguite con lo stesso client admin; non c’è uso di client “anon” o “user JWT” per quelle delete. Quindi **non** si attribuisce il 500 a RLS sulle tabelle public. Il fallimento è coerente con un vincolo FK (o operazione interna auth) durante `deleteUser`.

---

## 8. Root Cause Candidates (ranked, con prove)

1. **auth.admin.deleteUser fallisce per FK su auth.users (public schema)**  
   **Prova:** Il messaggio “Database error deleting user” è quello di `authResult.error`; in Supabase/GoTrue questo può essere il wrapping di un errore Postgres.  
   **Ipotesi:** Una o più tabelle in **public** hanno FK verso auth.users(id) con **ON DELETE RESTRICT / NO ACTION** e righe ancora presenti; la function non le elimina; quando Auth tenta di eliminare la riga in auth.users, Postgres solleva violazione FK.  
   **Conferma:** Verificare su DB (information_schema / pg_constraint) quali FK puntano a auth.users e con quale ON DELETE; verificare se le tabelle non coperte dalla function (es. iap_notifications, iap_audit_logs, landing_events) hanno ancora vincoli senza CASCADE.

2. **auth.admin.deleteUser fallisce per stato interno auth (sessions/refresh_tokens)**  
   **Prova:** Stesso messaggio generico.  
   **Ipotesi:** Lo schema auth (sessions, refresh_tokens, ecc.) potrebbe avere vincoli o logica che impediscono la delete dell’utente finché ci sono sessioni attive; o un bug/limite di GoTrue.  
   **Conferma:** Documentazione Supabase Auth; eventuale tentativo di signOut/session cleanup prima di deleteUser (solo come test, non applicato in questa verifica).

3. **Tabelle mancanti nella lista “tablesByUser”**  
   **Prova:** La function elimina solo un sottoinsieme fisso di tabelle; in migrations esistono molte tabelle con user_id/user_id-like che referenziano auth.users.  
   **Ipotesi:** Anche con CASCADE, l’ordine di esecuzione (delete public prima, poi deleteUser) potrebbe non essere il problema; il problema è una tabella con **RESTRICT/NO ACTION** non toccata dalla function.  
   **Conferma:** Elenco completo FK → auth.users sul DB reale + ordine di delete in function.

4. **Logging insufficiente**  
   **Prova:** Il log contiene solo “delete-account: error Database error deleting user” senza codice Postgres né constraint name.  
   **Conclusione:** **Senza log dettagliato o ispezione DB non si può provare quale dei punti sopra sia la causa esatta.**

---

## 9. What Works / What Fails

**Funziona:**

- Invocazione da app (POST + Bearer token).
- Validazione JWT e estrazione user_id in Edge.
- Env SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY presenti (altrimenti 500 sarebbe “Server configuration error”).
- Storage cleanup (o warning senza 500).
- Delete su email_sends, user_clues, user_buzz_counter, user_notifications, subscriptions (o warning senza 500).
- Delete su profiles (o warning senza 500).

**Non funziona:**

- **auth.admin.deleteUser(user_id)** restituisce errore con messaggio “Database error deleting user” → **throw** → risposta 500 e log “delete-account: error Database error deleting user”.
- L’utente non riesce a completare la cancellazione account; vede messaggio generico in app.

---

## 10. Fix Plan (PROPOSTA SOLO TESTUALE — no patch)

- **Migliorare il logging nella Edge Function:**  
  Nel catch (e/o prima del throw su authResult.error) loggare: `authResult.error` (oggetto), eventuale `code`, `details`, e in caso di errore da delete su tabelle public (se in futuro si decidesse di fare throw lì) loggare tabella e errore. **Rischio:** basso; nessun cambio di comportamento, solo diagnostica.

- **Allineare elenco tabelle alla function con lo schema reale:**  
  Eseguire su DB (read-only) una query che elenchi tutte le tabelle/colonne con FK verso auth.users e il relativo ON DELETE. Estendere la lista `tablesByUser` (e l’ordine di delete) in modo da includere **tutte** le tabelle public che referenziano l’utente e che potrebbero bloccare la delete su auth.users se non eliminate prima. Eliminare prima le dipendenze “figlie” (es. tabelle che referenziano profiles o altre tabelle user-scoped). **Rischio:** medio (ordine sbagliato può rompere FK tra tabelle public); va fatto con backup e test.

- **Verificare e, se necessario, correggere FK senza CASCADE:**  
  Per ogni FK verso auth.users che sia ancora NO ACTION/RESTRICT, valutare migrazione a ON DELETE CASCADE o ON DELETE SET NULL (dove sensato) così che alla delete di auth.users non ci siano blocchi. **Rischio:** medio-alto; impatta integrità referenziale e comportamento globale; richiede analisi per tabella.

- **Riprodurre e catturare log dettagliati:**  
  Ripetere una delete con account test e catturare dall’invocation (o da log Supabase) l’eventuale stack/codice Postgres; oppure abilitare log più verbosi in function per un solo test. **Rischio:** basso.

---

## 11. Next Diagnostic Steps (se mancano prove)

1. Dashboard: aprire l’evento 500, copiare **execution_id**, **timestamp**, **event_message**, e se presente **Raw** (stack/codice errore).
2. DB (solo lettura):  
   Query per FK verso auth.users:
   ```sql
   SELECT tc.table_schema, tc.table_name, kcu.column_name, rc.delete_rule
   FROM information_schema.table_constraints tc
   JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' AND rc.unique_constraint_name IN (
     SELECT constraint_name FROM information_schema.table_constraints
     WHERE table_schema = 'auth' AND table_name = 'users'
   );
   ```
   Verificare quali hanno `delete_rule = 'RESTRICT'` o `'NO ACTION'` e se quelle tabelle sono coperte dalla function.
3. Aggiungere temporaneamente in function (solo per diagnostica) log di `authResult.error` completo (senza loggare token/key) e rieseguire una delete con account test per ottenere codice/constraint nel log.

---

**Nessuna modifica è stata applicata a codice, config, DB, RLS o Edge Functions.**  
**Nessun comando distruttivo, nessun deploy, nessuna migrazione.**
