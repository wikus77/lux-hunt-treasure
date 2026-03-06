# INCIDENT REPORT — Delete Account 500 + PGRST116 (Solo forensics, NO patch)

**App:** M1SSION™ — iOS native wrapped (Capacitor / WKWebView)  
**Data:** 2026-02-27  
**Scope:** Verifica forense only. **Nessuna modifica a codice/SQL/config.**  
**Rollback:** branch `fix/delete-account-profile-integrity-ios`, tag `ROLLBACK_DELETE_ACCOUNT_PROFILE_INTEGRITY_20260227_0644`

---

## EVIDENZE

### 1) Chiamata alla Edge Function `delete-account` (repo)

| Campo | Valore |
|-------|--------|
| **File** | `src/components/m1units/DeleteAccountModalContent.tsx` |
| **Funzione** | `handleDelete` (linee 22–46) |
| **Payload (body)** | Nessuno: `invoke('delete-account', { method: 'POST', headers: { Authorization: ... } })` — nessun `body`. |
| **Headers** | `Authorization: Bearer ${session.access_token}` |
| **Session** | `(await supabase.auth.getSession()).data.session`; se `!session?.access_token` → toast "Session expired" e return. |
| **Schema request** | `POST /functions/v1/delete-account`, header `Authorization: Bearer <access_token>`, body vuoto. |

Secondo call-site (stesso schema): `src/pages/settings/LegalSettings.tsx` linee 97–100, con `(await supabase.auth.getSession()).data.session?.access_token`.

**Conclusione:** La chiamata usa correttamente `getSession()` e invia il JWT in `Authorization`. Nessun segreto nel body.

---

### 2) Edge Function `delete-account` (repo)

**File:** `supabase/functions/delete-account/index.ts`

| Step | Azione | Punto di fallimento |
|------|--------|----------------------|
| 0 | Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; client `createClient(url, serviceKey)` → **Service Role** | 500 se env mancanti |
| 1 | `admin.auth.getUser(jwt)` | 401 se JWT invalido/scaduto |
| 2 | Storage: `avatars` list + remove per `user_id` | Solo warn, continua |
| 3 | Public tables (in ordine): `email_sends`, `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `user_roles`, `antifraud_log` — `delete().eq(column, user_id)` | Ogni errore → `console.warn`, **continua** |
| 4 | **profiles**: `delete().eq('id', user_id)` | Solo warn, continua |
| 5 | **auth**: `admin.auth.admin.deleteUser(user_id)` | Se `authResult.error` → log poi **throw** → catch → **500** |

- **Gestione errori:** In catch (linee 115–127) si logga `console.warn("delete-account: error", message, { status, code, details })` e si risponde 500 con messaggio generico.
- **Messaggio di log riportato dall’utente:** `"delete-account: error Database error deleting user"` → `message` è il valore di `e.message` nel catch, quindi l’eccezione viene da **step 5** (`deleteUser`). In Supabase/GoTrue, **"Database error deleting user"** indica tipicamente che il DELETE su `auth.users` è stato bloccato dal **database** (es. FK constraint).

**Conclusione:** Il 500 avviene **esattamente allo step 5** (`admin.auth.admin.deleteUser(user_id)`). La causa probabile è un vincolo FK su `auth.users(id)` da una tabella che ancora contiene righe per questo utente e che **non** è tra quelle ripulite dall’Edge Function.

---

### 3) Mismatch codice locale vs deployato

- **Repo:** contenuto di `supabase/functions/delete-account/index.ts` come sopra (cleanup incluso `user_roles`, `antifraud_log`).
- **Dashboard Supabase:** non accessibile da questa analisi.
- **Output richiesto:** Verificare in Supabase Dashboard (Functions → delete-account → Logs / Source) che il codice deployato coincida con il repo (stesso ordine di delete e stesso elenco di tabelle). **Conferma da fare a mano: match / mismatch.**

---

### 4) Supabase Logs (da completare lato utente)

- **Errore preciso:** Il log riportato è `"delete-account: error Database error deleting user"`. Non è presente nel repo uno stacktrace o un `details` che identifichi la tabella/constraint.
- **Dove ricavare l’errore preciso:** Nella Dashboard Supabase → Edge Functions → delete-account → invocazione POST 500: copiare **request headers (sanitizzati)**, **response body**, e soprattutto **log interno / stacktrace / `details`** dell’errore (se presenti).
- **Interpretazione:** Se il messaggio è esattamente "Database error deleting user" proveniente da GoTrue, in genere corrisponde a un **FK violation** su `auth.users` da parte di un’altra tabella (schema `auth` o `public`). Lo **step che fallisce** è quindi: **chiamata a `admin.auth.admin.deleteUser(user_id)`** (step 4 della funzione).

---

## ROOT CAUSE

### A) Causa certa del 500

- **Prova:** Log Edge Function: `"delete-account: error Database error deleting user"`; nel codice l’unico `throw` dopo le delete è quello su `authResult.error` (step deleteUser).
- **Conclusione:** La **root cause del 500** è il **fallimento di `admin.auth.admin.deleteUser(user_id)`** con messaggio **"Database error deleting user"**, interpretabile come **blocco da parte del DB** (FK su `auth.users`).
- **Constraint/tabella bloccante:** Non deducibile solo dal messaggio. Serve una delle due:
  - **Opzione 1:** Log/stacktrace della Edge Function o di GoTrue che esponga tabella/constraint (es. nome FK o tabella).
  - **Opzione 2:** Eseguire le query read-only sotto (Fase 3) per l’utente test e individuare la tabella con `count > 0` che referenzia `auth.users(id)` e che **non** è nell’elenco di cleanup della funzione.

**Elenco tabelle che la funzione attualmente ripulisce:**  
`email_sends`, `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `user_roles`, `antifraud_log`, poi `profiles`.

**Tabelle (da migrations) con FK verso `auth.users(id)` che la funzione NON tocca** (candidati blocker):

- `iap_transactions` (user_id)
- `user_entitlements` (user_id)
- `user_wallet` (user_id)
- `m1u_ledger` (user_id)
- `subscription_entitlements` (user_id)
- `vera_mission_runs` (user_id)
- `mpe_daily_snapshots`, `mpe_run_log`, `mpe_daily_commit_log` (user_id)
- `user_daily_free_buzz` (user_id)
- `commit_ritual` (user_id)
- `wheel_deterministic_progress` (user_id)
- Tabelle lottery/scratch/forum/analytics/battle/leaderboard/referral/domination/clue_milestones/pulse_breaker/smart_push/mission_command_center/group_chat (varie colonne user_id / winner_user_id / referrer_id / referred_id / creator_id / defender_id / owner_id / etc.)

Se una di queste ha ancora righe per `USER_ID`, quella tabella è il **blocker reale** per `deleteUser`.

---

### B) Stato account (auth vs profiles)

- **auth.users:** Per l’utente test va verificato con:  
  `select count(*) from auth.users where id = '7acd9551-644d-4e32-8758-f892efe47686';`  
  (atteso: 1 se l’account non è mai stato eliminato.)
- **public.profiles:** Già verificato dall’utente: **0 righe** per lo stesso id → stato **zombie** (auth presente, profilo assente), coerente con una delete parziale precedente (profilo cancellato, deleteUser mai riuscito).

---

### C) Root cause del PGRST116 residuo ([HierarchyRank])

- **File:** `src/hooks/useHierarchyRank.ts` (linee 75–80): query su `profiles` con `.select('pulse_energy').eq('id', user.id).single()`.
- **Comportamento:** Con 0 righe, PostgREST restituisce **PGRST116**; il codice fa `throw profileError` → catch logga `"❌ [HierarchyRank] Error:"` e imposta `setError`; `finally` imposta `setIsLoading(false)`.
- **Conclusione:** PGRST116 persiste perché **il profilo per questo utente è assente** (zombie) e l’hook usa ancora **`.single()`**. La causa è quindi: **profilo mancante + uso di `.single()`** (non RLS: la query è per `id = user.id` e il problema è l’assenza della riga).

---

## SCOPE CHECK

- **In scope:** Flusso “Delete account permanently”, Edge Function delete-account, integrità profilo/utente, cause dei log (500, PGRST116).
- **Non modificato:** Nessun file; nessuna patch applicata; nessun refactor; nessun cambiamento a routing, UI, Stripe, PWA, schema DB, RLS, policy.

---

## NOISE vs ACTIONABLE (triage log Xcode)

| Log / gruppo | Impatto | Azione |
|--------------|--------|--------|
| **POST 500 delete-account** | Reale: Delete Account non funziona, nessun redirect a Login | **Fix:** Rimuovere FK blocker (cleanup tabelle mancanti o gestione errore) |
| **[HierarchyRank] PGRST116 … 0 rows returned** | Reale: utente zombie senza profilo; hook usa `.single()` | **Fix:** `.maybeSingle()` + fallback (o garantire profilo con ensureProfile) |
| **PWA Stabilizer: Initialization failed: {}** | Basso in iOS wrapper: PWA Stabilizer non necessario su Capacitor | **Monitor** / ignore in contesto iOS |
| **WEBP err=-50** | Probabile noise (decoder WebP / sistema) | **Ignore** se nessuna immagine rotta in UI |
| **CARenderServer … invalid address** | Noise tipico rendering iOS | **Ignore** |
| **xpc_user_sessions… Operation not permitted** | Noise sandbox/permessi sistema | **Ignore** |
| **NSMapGet … argument is NULL** | Noise framework/Cocoa | **Ignore** |
| **UIScene lifecycle will soon be required** | Warning futuro Apple; di solito non rompe il comportamento attuale | **Monitor**; nessun fix richiesto ora |

---

## PATCH MINIMA PROPOSTA (NON APPLICATA)

Solo proposta, da applicare solo se e quando richiesto.

1. **Edge Function delete-account (FK blocker)**  
   - Eseguire le query read-only sotto per `USER_ID` e individuare la tabella con `count > 0` che non è ancora in cleanup.  
   - Aggiungere alla lista `tablesByUser` (e eventualmente tabelle con colonne tipo `winner_user_id`, `creator_id`, etc.) le tabelle necessarie, nello stesso ordine di dipendenze (figli prima dei padri), mantenendo **profiles** come ultima delete prima di `deleteUser`.  
   - Opzione alternativa: in caso di errore da `deleteUser` con messaggio "Database error deleting user", loggare `errObj.details` (se presente) e/o ritornare in response un codice identificativo per supporto.

2. **PGRST116 HierarchyRank**  
   - In `src/hooks/useHierarchyRank.ts`: sostituire `.single()` con `.maybeSingle()`; in caso `data === null` usare valori di default (es. `pulse_energy: 0`) e non considerare come errore bloccante.

3. **Dopo eventuale patch**  
   - Build web + `npx cap sync ios` (obbligatorio).  
   - Test su device: Delete Account → nessun 500, redirect a Login; nessun PGRST116 per HierarchyRank con utente con profilo (o con profilo ricreato da ensureProfile).

---

## CHECKLIST DI VERIFICA DOPO EVENTUALE PATCH

- [ ] Supabase Dashboard: invocazione POST delete-account → 200 (o 401 se sessione invalida), mai 500 per “Database error deleting user”.
- [ ] DB: per un utente eliminato con successo: `auth.users` count = 0, `public.profiles` count = 0 per quel `id`.
- [ ] iOS: da modale Delete Account, dopo conferma → redirect a Login e sessione chiusa.
- [ ] Xcode: nessun [HierarchyRank] PGRST116 con utente con profilo (o profilo ripristinato).
- [ ] Build web + `cap sync ios` eseguiti dopo ogni modifica alla funzione o al frontend.

---

## FASE 3 — Query DB read-only (per utente test)

**USER_ID = `7acd9551-644d-4e32-8758-f892efe47686`**

### Presenza utente

```sql
select count(*) from auth.users where id = '7acd9551-644d-4e32-8758-f892efe47686';
select count(*) from public.profiles where id = '7acd9551-644d-4e32-8758-f892efe47686';
```

### Conteggi per tabelle “probabili blockers” (colonna user_id o id = USER_ID)

Eseguire in read-only; sostituire `<USER_ID>` con l’UUID sopra. Le colonne sono quelle presenti nello schema (da verificare in `information_schema.columns` se una tabella non esiste o ha nome colonna diverso).

```sql
-- Tabelle già in cleanup nella Edge Function (per riferimento)
select 'user_roles' as tbl, count(*) from public.user_roles where user_id = '<USER_ID>'
union all select 'subscriptions', count(*) from public.subscriptions where user_id = '<USER_ID>'
union all select 'user_notifications', count(*) from public.user_notifications where user_id = '<USER_ID>'
union all select 'user_clues', count(*) from public.user_clues where user_id = '<USER_ID>'
union all select 'user_buzz_counter', count(*) from public.user_buzz_counter where user_id = '<USER_ID>'
union all select 'email_sends', count(*) from public.email_sends where recipient_user_id = '<USER_ID>'
union all select 'antifraud_log', count(*) from public.antifraud_log where user_id = '<USER_ID>';

-- Tabelle NON in cleanup (candidati blocker per deleteUser)
union all select 'iap_transactions', count(*) from public.iap_transactions where user_id = '<USER_ID>'
union all select 'user_entitlements', count(*) from public.user_entitlements where user_id = '<USER_ID>'
union all select 'user_wallet', count(*) from public.user_wallet where user_id = '<USER_ID>'
union all select 'm1u_ledger', count(*) from public.m1u_ledger where user_id = '<USER_ID>'
union all select 'subscription_entitlements', count(*) from public.subscription_entitlements where user_id = '<USER_ID>'
union all select 'vera_mission_runs', count(*) from public.vera_mission_runs where user_id = '<USER_ID>'
union all select 'mpe_daily_snapshots', count(*) from public.mpe_daily_snapshots where user_id = '<USER_ID>'
union all select 'mpe_run_log', count(*) from public.mpe_run_log where user_id = '<USER_ID>'
union all select 'mpe_daily_commit_log', count(*) from public.mpe_daily_commit_log where user_id = '<USER_ID>'
union all select 'user_daily_free_buzz', count(*) from public.user_daily_free_buzz where user_id = '<USER_ID>';
```

**Output richiesto:** tabella `tbl → count`. Qualsiasi tabella con **count > 0** che non è nell’elenco di cleanup della funzione è un **candidato blocker** per `deleteUser`.

### FK che referenziano auth.users / profiles

Da migrations (elenco parziale):

- `public.profiles.id` → `auth.users(id)` ON DELETE CASCADE  
- Molte tabelle `public.*` con colonna `user_id` (o `winner_user_id`, `creator_id`, …) → `auth.users(id)` ON DELETE CASCADE / SET NULL  

Per l’elenco completo in read-only:

```sql
select tc.table_schema, tc.table_name, kcu.column_name, ccu.table_schema as ref_schema, ccu.table_name as ref_table, ccu.column_name as ref_column, rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
join information_schema.referential_constraints rc on tc.constraint_name = rc.constraint_name and tc.table_schema = rc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY' and (ccu.table_name = 'users' and ccu.table_schema = 'auth');
```

---

## STOP CONDITION

- **Evidenza mancante:** Lo stacktrace / dettaglio dell’errore (tabella o constraint che blocca il DELETE su `auth.users`) **non** è presente nel repo né nei log riportati. Per la **causa certa del blocker** serve: (a) un log/stacktrace dalla Dashboard che esponga tabella/constraint, oppure (b) i risultati delle query read-only sopra per individuare la tabella con righe residue per USER_ID.
- **Dichiarazione:** La root cause del **500** è identificata come fallimento di `deleteUser` con "Database error deleting user" (step 4 della funzione). La **identità della tabella/constraint che blocca** resta da confermare con i dati sopra.

---

---

## CHECKLIST FORENSE (query read-only)

### 1) CONFERMA STATO UTENTE (read-only)

**USER_ID:** `7acd9551-644d-4e32-8758-f892efe47686`

Eseguire in Supabase SQL Editor (read-only):

```sql
-- Presenza in auth
select count(*) as auth_count from auth.users where id = '7acd9551-644d-4e32-8758-f892efe47686';

-- Presenza in profiles
select count(*) as profiles_count from public.profiles where id = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Output atteso (zombie):** `auth_count = 1`, `profiles_count = 0`.  
Conferma: utente presente in auth, profilo assente → stato zombie (coerente con delete parziale: profiles cancellato, deleteUser non eseguito).

---

### 2) IDENTIFICA TUTTE LE FK CHE REFERENZIANO auth.users (read-only)

Eseguire in Supabase SQL Editor:

```sql
select
  tc.table_schema, tc.table_name, kcu.column_name,
  ccu.table_schema as ref_schema, ccu.table_name as ref_table, ccu.column_name as ref_column,
  rc.delete_rule, tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name and tc.table_schema = rc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and ccu.table_schema = 'auth'
  and ccu.table_name = 'users'
order by tc.table_schema, tc.table_name;
```

**Uso:** Ogni riga è una FK che punta a `auth.users(id)`. Se una tabella ha ancora righe per USER_ID e **non** è nell’elenco di cleanup della Edge Function, può essere il blocker di `deleteUser`.

---

### 3) FK verso auth.users — da migrations (riferimento repo)

Tabella ricavata dalle migrations (schema dichiarato). **In cleanup** = la Edge Function `delete-account` fa oggi `delete().eq(column, user_id)` per quella tabella/colonna.

| table_schema | table_name | column_name | delete_rule | In cleanup (delete-account) |
|--------------|------------|-------------|-------------|-----------------------------|
| public | profiles | id | CASCADE | Sì (profiles) |
| public | email_sends | recipient_user_id | — | Sì |
| public | user_clues | user_id | — | Sì |
| public | user_buzz_counter | user_id | — | Sì |
| public | user_notifications | user_id | — | Sì |
| public | subscriptions | user_id | — | Sì |
| public | user_roles | user_id | — | Sì |
| public | antifraud_log | user_id | — | Sì |
| public | mpe_daily_snapshots | user_id | CASCADE | No |
| public | mpe_run_log | user_id | CASCADE | No |
| public | mpe_daily_commit_log | user_id | CASCADE | No |
| public | user_entitlements | user_id | CASCADE | No |
| public | user_wallet | user_id | CASCADE | No |
| public | iap_transactions | user_id | CASCADE | No |
| public | subscription_entitlements | user_id | CASCADE | No |
| public | m1u_ledger | user_id | CASCADE | No |
| public | vera_mission_runs | user_id | CASCADE | No |
| public | user_daily_free_buzz | user_id | CASCADE | No |
| public | commit_ritual_daily | user_id | CASCADE | No |
| public | user_progress_meters | user_id | CASCADE | No |
| public | user_aion_state | user_id | CASCADE | No |
| public | user_locations | user_id | CASCADE | No |
| public | user_settings | user_id | CASCADE | No |
| public | chat_conversations | handled_by | SET NULL | No |
| public | battle_challenges | creator_id, opponent_id, winner_id | CASCADE / SET NULL | No |
| public | gift_transactions | sender_id, recipient_id | SET NULL | No |
| public | admin_config | created_by, updated_by | SET NULL | No |
| public | final_shoot_winners | winner_user_id | CASCADE | No |
| public | lottery_tickets, lottery_purchases, lottery_winners, lottery_notifications | user_id (o simile) | CASCADE / SET NULL | No |
| public | scratch_*, user_scratch_purchases, scratch_abuse_logs | user_id / claimed_by_user | CASCADE / SET NULL | No |
| public | wheel_spins, prize_awards, final_prize_claims, secondary_prize_claims | user_id / winner_user_id | CASCADE | No |
| public | referral, domination, forum, leaderboard, clue_milestones, pulse_*, smart_push, mission_center, group_chat, … | varie (user_id, referrer_id, referred_id, owner_id, …) | CASCADE / SET NULL | No |

**Conclusione:** La funzione ripulisce solo 7 tabelle + profiles. Qualsiasi altra tabella con FK su `auth.users(id)` che ha ancora righe per USER_ID è un **candidato blocker**. Eseguire la query al punto 2 per l’elenco reale sul DB e, per USER_ID, i `COUNT(*)` su ogni tabella risultante per individuare il blocker.

---

## CAUSA CERTA — Procedura (SOLO FORENSICS, NO PATCH)

Obiettivo: nome **tabella**, **constraint FK** e **colonna** che bloccano `admin.auth.admin.deleteUser(user_id)` (errore "Database error deleting user").

**USER_ID test:** `7acd9551-644d-4e32-8758-f892efe47686`

---

### TASK 1 — Conferma zombie (read-only)

Eseguire in Supabase SQL Editor e incollare l’output:

```sql
select count(*) as auth_count from auth.users where id = '7acd9551-644d-4e32-8758-f892efe47686';
select count(*) as profiles_count from public.profiles where id = '7acd9551-644d-4e32-8758-f892efe47686';
```

**Output atteso:** `auth_count = 1`, `profiles_count = 0` (zombie).

---

### TASK 2 — Tutte le FK che puntano a auth.users(id) (read-only)

Eseguire e incollare l’output completo:

```sql
select
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema as ref_schema,
  ccu.table_name   as ref_table,
  ccu.column_name  as ref_column,
  rc.delete_rule,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name
 and tc.table_schema = rc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and ccu.table_schema = 'auth'
  and ccu.table_name = 'users'
order by tc.table_schema, tc.table_name, kcu.column_name;
```

---

### TASK 3 — Tabella blocker con COUNT per USER_ID (read-only)

Eseguire **tutto il blocco sotto in una sola esecuzione** (DO + SELECT). La temp table viene creata nel DO e letta dal SELECT seguente; in alcuni client potrebbe servire eseguire DO e SELECT insieme.

```sql
do $$
declare
  r record;
  q text;
begin
  create temporary table if not exists __fk_counts(
    table_schema text,
    table_name text,
    column_name text,
    constraint_name text,
    delete_rule text,
    cnt bigint
  );

  truncate __fk_counts;

  for r in
    select
      tc.table_schema,
      tc.table_name,
      kcu.column_name,
      rc.delete_rule,
      tc.constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
     and ccu.table_schema = tc.table_schema
    join information_schema.referential_constraints rc
      on tc.constraint_name = rc.constraint_name
     and tc.table_schema = rc.constraint_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and ccu.table_schema = 'auth'
      and ccu.table_name = 'users'
  loop
    q := format(
      'insert into __fk_counts(table_schema, table_name, column_name, constraint_name, delete_rule, cnt)
       select %L, %L, %L, %L, %L, count(*) from %I.%I where %I = %L',
      r.table_schema, r.table_name, r.column_name, r.constraint_name, r.delete_rule,
      r.table_schema, r.table_name, r.column_name, '7acd9551-644d-4e32-8758-f892efe47686'
    );
    execute q;
  end loop;

  raise notice 'FK counts computed';
end $$;

select *
from __fk_counts
where cnt > 0
order by cnt desc, table_schema, table_name, column_name;
```

**Output atteso:** almeno una riga con `cnt > 0`. La prima riga (cnt massimo) è il **candidato blocker**.

---

### TASK 4 — Verifica “hard” del blocker

Dalla prima riga con `cnt > 0` risultante dal TASK 3:

- **Tabella:** `table_schema.table_name`
- **Colonna:** `column_name`
- **Constraint:** `constraint_name`
- **delete_rule:** `delete_rule`

**La tabella è ripulita dalla Edge Function `delete-account`?**

Elenco attuale nella funzione (repo):  
`email_sends` (recipient_user_id), `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `user_roles`, `antifraud_log`, poi `profiles` (id).

- Se la tabella blocker **non** è in questo elenco → **è il blocker reale** per `deleteUser`.
- Se la tabella **è** in questo elenco → possibile ordine/errore nella delete (es. RLS/permessi) o altro FK con cnt>0; verificare le altre righe con cnt>0.

---

### CAUSA CERTA (da compilare dopo TASK 3–4)

Compilare dopo aver eseguito i task e incollare sotto:

**CAUSA CERTA:**  
Tabella `table_schema.table_name`, colonna `column_name`, constraint `constraint_name` (delete_rule: `delete_rule`) — blocca `admin.auth.admin.deleteUser(user_id)` con "Database error deleting user".

**Ripulita da delete-account?** Sì / No.  
Se No → blocker confermato.

---

### EXTRA — Se TASK 3 restituisce 0 righe (cnt tutti 0)

Se `select * from __fk_counts where cnt > 0` è vuoto, il blocco potrebbe non essere una FK “semplice” su auth.users. Eseguire (read-only) e incollare output:

```sql
select conname, conrelid::regclass as table_name, pg_get_constraintdef(oid) as def
from pg_constraint
where contype in ('f','c','u','p')
  and pg_get_constraintdef(oid) ilike '%auth.users%';
```

---

**STOP: nessuna patch, nessuna modifica a codice/SQL/RLS/config. Solo forensics.**

---

## DIAGNOSTIC PATCH — Full error surfacing (2026-02-27)

**Rollback:** tag `ROLLBACK_DELETE_ACCOUNT_DIAG_20260227`. Branch: `fix/delete-account-profile-integrity-ios`.

### TASK A — Deploy parity (verifica manuale)

Non è possibile verificare da qui il codice deployato in Supabase. **Controllare in Dashboard:**  
Supabase → Edge Functions → `delete-account` → Source / Logs. Confrontare con `supabase/functions/delete-account/index.ts` nel repo.  
Se c’è **mismatch**: fare redeploy identico al repo (nessun’altra modifica).

### Patch applicata (solo Edge Function)

- Log completo dell’errore quando fallisce `admin.auth.admin.deleteUser(user_id)` e nel `catch`: `name`, `message`, `status`, `code`, `details`, `stack`.
- Se la request ha header **`x-m1ssion-diagnostic: 1`**, la response 500 è JSON:  
  `{ "ok": false, "stage": "deleteUser" | "catch", "user_id": "...", "error": { name, message, status, code, details, stack } }`.  
  Altrimenti si mantiene il messaggio generico (nessun cambiamento per i client senza header).

### Come invocare in modalità diagnostica (senza toccare l’app iOS)

Usare **curl** o **Postman** con lo stesso JWT che usa l’app:

1. Ottenere l’access token (es. da Supabase Auth per l’utente test, o da una sessione di test).
2. Chiamare la function con header diagnostico:

```bash
curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/delete-account' \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -H 'x-m1ssion-diagnostic: 1'
```

3. In caso di 500, il body della response contiene `ok`, `stage`, `user_id`, `error` (oggetto completo). Copiare il JSON nel report per individuare la causa (code/details/stack).
4. **Non** aggiungere l’header nell’app iOS: usare solo per test da strumenti esterni.

### Test plan (forward)

1. Deploy della Edge Function (Supabase CLI o Dashboard).
2. Riprodurre la chiamata con header `x-m1ssion-diagnostic: 1` (curl/Postman).
3. Copiare nel report il JSON di errore completo restituito.
4. Solo dopo aver ottenuto la causa reale (code/details o stack), proporre la patch definitiva.

### Rollback patch diagnostica

```bash
git checkout ROLLBACK_DELETE_ACCOUNT_DIAG_20260227 -- supabase/functions/delete-account/index.ts
```

---

**Fine report.**
