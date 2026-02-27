# Delete Account → HTTP 500 — Fix Report

**App:** M1SSION™ — iOS native wrapped (Capacitor / WKWebView)  
**Branch:** `fix/delete-account-500`  
**Scope:** Solo flusso Delete Account (Edge Function `delete-account`). Nessuna modifica a UI iOS, routing, RLS, schema DB.

---

## 1) Summary

Il pulsante “Delete account” invoca la Edge Function **delete-account**; il 500 si verifica quando `admin.auth.admin.deleteUser(user_id)` fallisce (tipicamente “Database error deleting user”), probabilmente per FK verso `auth.users` con NO ACTION e righe figlie presenti. È stato eseguito **rollback safety** (branch, tag, copia .bak della function), **verifica pre-fix** dal codice (elenco delete, punto di generazione 500) e applicata **solo la patch di diagnostica (3.1)**: log redatti di `authResult.error` (message, status, code, details) prima del throw e nel catch. **Non** è stato applicato il cleanup aggiuntivo (3.2) perché in questa sessione non erano disponibili i risultati PROD (conteggi per user sulle tabelle NO ACTION); quando i “blocker reali” saranno noti (tabella/colonna con count > 0), andrà applicata la patch 3.2 come da report. Dopo il prossimo deploy della function, la prossima invocazione 500 produrrà log dettagliati per correlare l’errore a constraint/tabella.

---

## 2) Pre-fix evidence

### 2.1 Edge Function — delete attuali (solo lettura)

**File:** `supabase/functions/delete-account/index.ts`

| Ordine | Risorsa | Colonna / filtro | Gestione errore |
|--------|---------|-------------------|-----------------|
| 1 | Storage bucket `avatars` | folder = user_id | try/catch → console.warn, continue |
| 2 | `email_sends` | recipient_user_id | console.warn, continue |
| 3 | `user_clues` | user_id | idem |
| 4 | `user_buzz_counter` | user_id | idem |
| 5 | `user_notifications` | user_id | idem |
| 6 | `subscriptions` | user_id | idem |
| 7 | `profiles` | id | console.warn, continue |
| 8 | — | — | **admin.auth.admin.deleteUser(user_id)** → se errore e msg non “not found” → **throw** → **catch** → **500** |

**Punto di generazione 500:**  
Riga ~100: `throw authResult.error` quando `authResult.error` è valorizzato e il messaggio non contiene “not found”/“does not exist”. Il catch (righe 107–114) fa `console.warn("delete-account: error", message)` e ritorna `Response` con **status 500** e body generico.

### 2.2 Log Edge (da Dashboard — da incollare)

Supabase Dashboard → Edge Functions → **delete-account** → Logs → invocazione 500:

| Campo | Valore (redatto) |
|-------|------------------|
| event_message | |
| Raw / details | |

Se il log non mostra tabella/constraint: annotare *“insufficiente per causa deterministica”*.

### 2.3 FK NO ACTION/RESTRICT + conteggi (query PROD — da eseguire)

**Query 1 — Solo FK NO ACTION / RESTRICT verso auth.users:**

```sql
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS fk_column,
  con.conname AS constraint_name,
  CASE con.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' ELSE con.confdeltype::text END AS on_delete_rule,
  col.is_nullable
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey) AND a.attisdropped = false
JOIN pg_class ref ON ref.oid = con.confrelid
JOIN pg_namespace refn ON refn.oid = ref.relnamespace
LEFT JOIN information_schema.columns col ON col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name = a.attname
WHERE con.contype = 'f' AND refn.nspname = 'auth' AND ref.relname = 'users' AND con.confdeltype IN ('a', 'r')
ORDER BY n.nspname, c.relname, con.conname;
```

**Query 2 — Conteggi per user (sostituire `<USER_ID>` con UUID reale che fallisce):**

Per ogni (schema, table, fk_column) della Query 1 eseguire (o unire in una sola query):

```sql
SELECT COUNT(*) FROM <schema>.<table> WHERE <fk_column> = '<USER_ID>';
```

### 2.4 Blocker reali / Non blocker (da compilare dopo Query 1+2)

**BLOCKER REALI** (NO ACTION/RESTRICT e count > 0 per user_id di test):

| schema_name | table_name | fk_column | constraint_name | count |
|-------------|------------|-----------|-----------------|-------|
| | | | | |

**NON blocker** (count = 0 o tabella già gestita dalla function):

| table_name | count | note |
|------------|-------|------|
| | | |

**Conclusione pre-fix:**  
- [ ] Root cause confermata (almeno un blocker reale con count > 0)  
- [ ] Root cause non confermata (tutti count = 0) → solo logging applicato, ripetere forensics dopo nuovo 500 con log dettagliati  

*(Se non confermata, come da HARD STOP non è stata applicata patch 3.2; solo 3.1.)*

---

## 3) Root cause finale (con prove)

- **Causa diretta (da codice):** Il 500 è restituito **solo** quando `admin.auth.admin.deleteUser(user_id)` fallisce; l’errore viene rilanciato e loggato nel catch.

- **Causa strutturale (da confermare con 2.3–2.4):**  
  Tabelle con FK verso `auth.users(id)` con **ON DELETE NO ACTION** (o RESTRICT) che **non** sono eliminate dalla function e che hanno **almeno una riga** per l’utente che tenta la delete → Postgres blocca la DELETE su auth.users → Auth API restituisce errore → 500.

- **Prova richiesta:**  
  Compilare la sezione 2.4 con i risultati delle query PROD. Con almeno una riga “blocker reale” (count > 0), la root cause è confermata e si può procedere con la patch 3.2 (cleanup esplicito di quelle tabelle prima di `deleteUser`).

---

## 4) Patch applicata

### File modificato

- **supabase/functions/delete-account/index.ts** (solo diagnostica 3.1).

### Diff summary (solo logging)

1. **Prima del `throw authResult.error`:**  
   Aggiunto log redatto di `authResult.error`: `message`, `status`, `code`, `details` (nessun token/key/JWT).  
   `console.warn("delete-account: deleteUser error", { message, status, code, details })`.

2. **Nel catch:**  
   Oltre a `message`, ora si loggano anche `status`, `code`, `details` dell’oggetto errore (se presenti).  
   `console.warn("delete-account: error", message, { status, code, details })`.

### Patch 3.2 (cleanup tabelle blocker) — non applicata

In assenza dell’elenco “blocker reali” con count > 0 da PROD, **non** sono state aggiunte delete per tabelle aggiuntive. Quando l’elenco sarà compilato (sezione 2.4), andrà aggiunto in `tablesByUser` (o in un blocco dedicato prima di `deleteUser`) l’ordine corretto di delete per ogni (table, column) blocker reale, con gestione errore che fa fallire la function se una delete su una tabella blocker fallisce (così da non mascherare il problema).

---

## 5) Test post-fix (pass/fail + evidence)

- [ ] **5.1** Ridistribuire la Edge Function (Supabase Dashboard o CLI) con il codice aggiornato (solo logging).
- [ ] **5.2** Da iOS (WKWebView): premere “Delete account” con account di test che prima restituiva 500.
- [ ] **5.3** Se ancora 500: aprire Logs Edge per quell’invocazione e verificare che compaiano i nuovi campi (`status`, `code`, `details`) oltre a `message`; annotare qui sotto i valori (redatti).
- [ ] **5.4** Quando sarà applicata la patch 3.2 (cleanup blocker): ripetere il test → deve tornare **200**, user rimosso da auth, righe blocker rimosse, nessun “Database error deleting user” nei log.

**Esito attuale:**  
- Patch 3.1 (logging): applicata. Test post-fix: da eseguire dopo deploy (verifica che i log mostrino i campi aggiuntivi alla prossima 500).  
- Patch 3.2: non applicata; test 5.4 da eseguire dopo aver compilato i blocker reali e applicato il cleanup.

---

## 6) Rollback instructions

### Tag e branch

- **Branch:** `fix/delete-account-500`
- **Tag rollback:** `rollback/delete-account-500/20260227_053542`
- **Commit baseline (pre-fix):** `5de45f24f0c2da03a6c23142945ef41a18fc2cef`

### Ripristino codice (repository)

```bash
git checkout fix/delete-account-500
git reset --hard rollback/delete-account-500/20260227_053542
```

Oppure, per tornare al commit baseline:

```bash
git reset --hard 5de45f24f0c2da03a6c23142945ef41a18fc2cef
```

### Ripristino file Edge Function da .bak

Se si vuole ripristinare solo la function senza toccare il resto del repo:

```bash
cp supabase/functions/delete-account/index.ts.bak supabase/functions/delete-account/index.ts
```

Poi ridistribuire la function su Supabase.

### Verifica rollback

- `git status` e `git diff supabase/functions/delete-account/index.ts` devono mostrare nessuna modifica rispetto al tag/commit di rollback (o solo il contenuto di index.ts uguale a index.ts.bak se si è usata la copia .bak).

---

**Nessuna modifica a UI iOS, routing, RLS, schema DB o altre feature. Patch applicata: solo diagnostica (3.1) in `delete-account/index.ts`.**
