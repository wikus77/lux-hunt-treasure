# Delete Account → HTTP 500 — Forensics Report

**App:** M1SSION™ — iOS native wrapped (Capacitor / WKWebView)  
**Scope:** SOLO verifica forense — NESSUNA modifica a codebase, DB, RLS, triggers, functions, policies, constraints.  
**Obiettivo:** Identificare le constraint FK reali che bloccano `auth.admin.deleteUser()` e produrre report dettagliato.

---

## 1) Summary

Il pulsante “Delete account” invoca la Edge Function **`delete-account`** (`supabase/functions/delete-account/index.ts`). La function, con service role, esegue cleanup su storage (avatars), su 5 tabelle public (email_sends, user_clues, user_buzz_counter, user_notifications, subscriptions) e su **profiles**, poi chiama **`admin.auth.admin.deleteUser(user_id)`**. Il 500 si verifica quando `deleteUser` fallisce: l’errore viene rilanciato, loggato in Edge come `delete-account: error <message>` (es. “Database error deleting user”), e la risposta HTTP è 500. L’evidenza raccolta (32 FK con NO ACTION verso auth.users, assenza di trigger DELETE su auth.users) è coerente con l’ipotesi che **almeno una tabella con FK NO ACTION verso auth.users contenga ancora righe per l’utente** e non venga pulita dalla function, bloccando la DELETE su auth.users. La “Gap list” sotto elenca le tabelle NO ACTION che la function **non** elimina e che quindi possono essere blocker reali se hanno count > 0.

---

## 2) Evidence

### TASK 1 — Edge Function e log (read-only)

- **Edge Function usata:** `delete-account`  
- **Path nel repo:** `supabase/functions/delete-account/index.ts`  
- **Endpoint:** POST `/functions/v1/delete-account` (Supabase gestisce l’URL).

**Log da Supabase Dashboard (incollare qui, redacting token/keys):**

Supabase Dashboard → Edge Functions → **delete-account** → Logs → selezionare l’invocazione con esito 500 e copiare:

| Campo | Valore (redatto) |
|-------|------------------|
| execution_id | |
| timestamp | |
| event_message | (es. `delete-account: error Database error deleting user`) |
| Raw / details / stack | (constraint name, table, Postgres code se presenti) |

Se nei log compare un messaggio più dettagliato (es. nome constraint, tabella, codice errore Postgres), trascriverlo qui:

```
[Incollare qui il messaggio di errore completo dai log Edge, senza token/key.]
```

---

### TASK 2 — FK verso auth.users con NO ACTION o RESTRICT (solo quelle)

Query **read-only** da eseguire in Supabase SQL Editor (PROD). Restituisce **solo** le FK con `confdeltype` = `'a'` (NO ACTION) o `'r'` (RESTRICT), senza limite di righe:

```sql
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  a.attname AS fk_column,
  con.conname AS constraint_name,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    ELSE con.confdeltype::text
  END AS on_delete_rule,
  col.is_nullable
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey) AND a.attisdropped = false
JOIN pg_class ref ON ref.oid = con.confrelid
JOIN pg_namespace refn ON refn.oid = ref.relnamespace
LEFT JOIN information_schema.columns col
  ON col.table_schema = n.nspname AND col.table_name = c.relname AND col.column_name = a.attname
WHERE con.contype = 'f'
  AND refn.nspname = 'auth'
  AND ref.relname = 'users'
  AND con.confdeltype IN ('a', 'r')
ORDER BY n.nspname, c.relname, con.conname;
```

**Risultati (compilare con l’output della query):**

| schema_name | table_name | fk_column | constraint_name | on_delete_rule | is_nullable |
|-------------|------------|-----------|-----------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... |

*(Se la UI limita le righe, esportare il risultato o eseguire la query in un client che non tronca; la query filtra solo NO ACTION/RESTRICT.)*

---

### TASK 3 — Conteggi per user su tutte le tabelle NO ACTION

Sostituire **`<USER_ID>`** con l’UUID dell’utente di test che riceve 500 (es. da log Edge o da client).

Per **ogni** riga restituita dalla query TASK 2, va eseguito un conteggio. Esempio generico per una tabella `public.tabella` e colonna `colonna`:

```sql
SELECT COUNT(*) FROM public.tabella WHERE colonna = '<USER_ID>';
```

Per automatizzare su tutte le tabelle NO ACTION in un colpo solo (sempre read-only), si può usare una query dinamica o eseguire una singola query per ogni (schema, table, column) della TASK 2. Esempio per le tabelle più probabili (adattare se la lista NO ACTION è diversa):

```sql
-- Sostituire <USER_ID> con l'UUID reale
SELECT 'profiles' AS table_name, 'id' AS fk_column, COUNT(*) AS cnt FROM public.profiles WHERE id = '<USER_ID>'
UNION ALL SELECT 'email_sends', 'recipient_user_id', COUNT(*) FROM public.email_sends WHERE recipient_user_id = '<USER_ID>'
UNION ALL SELECT 'user_clues', 'user_id', COUNT(*) FROM public.user_clues WHERE user_id = '<USER_ID>'
UNION ALL SELECT 'user_notifications', 'user_id', COUNT(*) FROM public.user_notifications WHERE user_id = '<USER_ID>'
UNION ALL SELECT 'subscriptions', 'user_id', COUNT(*) FROM public.subscriptions WHERE user_id = '<USER_ID>'
UNION ALL SELECT 'user_buzz_counter', 'user_id', COUNT(*) FROM public.user_buzz_counter WHERE user_id = '<USER_ID>';
-- Aggiungere una riga UNION ALL per OGNI (table_name, fk_column) risultante dalla query TASK 2
-- che non sia già in elenco (es. iap_notifications.user_id, landing_events.user_id, iap_audit_logs.user_id,
-- e tutte le altre 32 tabelle/colonne NO ACTION).
```

**Tabella riepilogo (compilare con i risultati):**

| table_name | fk_column | constraint_name | rule | count | blocker (yes/no) |
|------------|-----------|-----------------|------|-------|------------------|
| ... | ... | ... | NO ACTION | 0 o >0 | yes se rule in (NO ACTION, RESTRICT) e count > 0 |

**Regola:** blocker = **yes** se `on_delete_rule` è NO ACTION o RESTRICT **e** `count > 0` per quel user_id. Per SET NULL: blocker = yes se la colonna è NOT NULL e count > 0 (se presente tra le FK).

---

## 3) Root cause (con prove: constraint + tabella + count)

- **Causa diretta (da codice):** Il 500 è restituito **solo** quando `admin.auth.admin.deleteUser(user_id)` fallisce (riga 100: `throw authResult.error`). Il messaggio tipico nei log è “Database error deleting user”.

- **Causa strutturale (da verificare con TASK 2 + TASK 3):**  
  Esistono **32 FK con NO ACTION** verso `auth.users`. Se in almeno una di quelle tabelle esiste **almeno una riga** con `user_id` (o la colonna FK) uguale all’utente che tenta la delete, Postgres **impedisce** la DELETE su `auth.users` per violazione di FK, e l’API Auth restituisce un errore che la Edge Function propaga come 500.

- **Prova richiesta:**  
  1) Elenco completo delle FK NO ACTION (output TASK 2).  
  2) Per un `user_id` che riceve 500, la tabella “count per tabella” (TASK 3): ogni riga con **rule** = NO ACTION (o RESTRICT) e **count > 0** è un **blocker reale**.  
  3) (Opzionale) Messaggio completo dai log Edge (TASK 1) con eventuale constraint name / tabella / codice Postgres.

**Root cause finale (da compilare dopo TASK 2 e TASK 3):**

- **Constraint/tabella/count:**  
  [Esempio: `public.iap_notifications` — colonna `user_id` — constraint `iap_notifications_user_id_fkey` — NO ACTION — count = 2 → **BLOCKER REALE**.]

- **Altre tabelle blocker (se presenti):**  
  [Elenco delle altre righe con rule NO ACTION/RESTRICT e count > 0.]

---

## 4) Impatto (perché l’iOS wrapper non c’entra)

- Il flusso “Delete account” è: **client iOS (WKWebView)** → chiamata HTTP POST a Supabase Edge (`delete-account`) con Bearer JWT → **Edge Function** (server-side) → cleanup storage + tabelle + profiles → **auth.admin.deleteUser** (server-side).  
- Il 500 è generato **lato server** (Edge + Supabase Auth/DB). Il client riceve solo lo status 500 e un messaggio generico; non ci sono modifiche a RLS, policies o codice app che cambino questo flusso.  
- L’iOS wrapper (Capacitor / WKWebView) si limita a invocare `supabase.functions.invoke('delete-account', ...)` e a mostrare il toast in caso di errore; non esegue delete dirette né ha accesso alla service role. Quindi **l’impatto e la causa del 500 sono interamente backend (DB constraint + logica della Edge Function)**; l’app iOS non è la sorgente del problema.

---

## 5) Soluzioni possibili (SOLO PROPOSTE — NON APPLICARE PATCH)

Per **ogni causa reale** (tabella NO ACTION con count > 0 non gestita dalla function):

### Opzione A — Estendere il cleanup nella Edge Function (ordine corretto)

- **Cosa:** Aggiungere nella function `delete-account`, **prima** di `admin.auth.admin.deleteUser(user_id)`, la delete esplicita per **tutte** le tabelle che in PROD risultano FK NO ACTION (e RESTRICT) verso auth.users, rispettando l’ordine di dipendenze (tabelle “figlie” prima).  
- **Rischio:** Ordine sbagliato può causare violazioni FK tra tabelle public; va definito un ordine sicuro (es. da TASK 2) e testato con account di test.  
- **Beneficio:** Nessuna modifica allo schema DB; la delete utente diventa possibile senza toccare constraint.

### Opzione B — Cambiare FK a CASCADE dove sensato

- **Cosa:** Per le tabelle che sono chiaramente “dati dell’utente”, modificare il vincolo FK verso `auth.users(id)` in **ON DELETE CASCADE** (o ON DELETE SET NULL dove la colonna è nullable e ha senso).  
- **Rischio:** Impatto su tutto lo schema; la DELETE su auth.users cancellerebbe in cascata quelle righe; richiede migrazione, backup e analisi per tabella.  
- **Beneficio:** Comportamento coerente e nessuna necessità di elencare tutte le tabelle nella Edge Function.

### Opzione C — Ibrido

- **Cosa:** Per alcune tabelle (es. poche con poche righe o critiche) estendere il cleanup in Edge (Opzione A); per altre (es. tabelle chiaramente user-scoped e non critiche) applicare CASCADE (Opzione B).  
- **Rischio:** Combinazione dei rispettivi rischi; va documentato quali tabelle sono gestite in quale modo.  
- **Beneficio:** Massima flessibilità e possibilità di non toccare tabelle sensibili con CASCADE.

---

## 6) TASK 4 — Correlazione con il codice della Edge Function (Gap list)

### Delete eseguite dalla function prima di `deleteUser` (solo lettura da `delete-account/index.ts`)

| Ordine | Risorsa | Colonna filtro | Note |
|--------|---------|----------------|--------|
| 1 | Storage bucket `avatars` | folder = user_id | list + remove |
| 2 | `email_sends` | recipient_user_id | admin.from(...).delete().eq(...) |
| 3 | `user_clues` | user_id | idem |
| 4 | `user_buzz_counter` | user_id | idem |
| 5 | `user_notifications` | user_id | idem |
| 6 | `subscriptions` | user_id | idem |
| 7 | `profiles` | id | idem |
| 8 | — | — | **auth.admin.deleteUser(user_id)** |

Nessun’altra tabella public viene eliminata dalla function.

### Gap list (tabelle NO ACTION non gestite dalla function)

- **Definizione:** Sono “gap” tutte le tabelle che in PROD hanno una FK verso `auth.users(id)` con **ON DELETE NO ACTION** (o RESTRICT) e che **non** compaiono nella lista sopra (storage + 6 tabelle public).

- **Elenco (da compilare con l’output di TASK 2):**  
  Inserire qui ogni `schema_name.table_name` (e relativa `fk_column`) restituita dalla query TASK 2 che **non** è una di:  
  `email_sends`, `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `profiles`.

Esempio (se tra le 32 NO ACTION ci sono ad es. iap_notifications, landing_events, iap_audit_logs, …):

| schema_name | table_name | fk_column | blocker se count > 0 |
|-------------|------------|-----------|----------------------|
| public | iap_notifications | user_id | sì |
| public | landing_events | user_id | sì |
| public | iap_audit_logs | user_id | sì |
| ... | ... | ... | ... |

*(Compilare con tutte le righe NO ACTION della TASK 2 escluse le 6 tabelle già gestite dalla function.)*

---

## 7) Checklist di verifica post-fix (NON eseguire fix)

- [ ] Eseguire in PROD le query TASK 2 e TASK 3 e compilare le tabelle del report (FK NO ACTION + count per user).
- [ ] Identificare almeno un blocker reale (NO ACTION + count > 0) e inserirlo in “Root cause”.
- [ ] (Opzionale) Inserire nei log Edge il messaggio/dettaglio completo dell’errore (TASK 1).
- [ ] Dopo aver applicato una soluzione (A, B o C) **fuori da questo report**: su iOS, con account di test, premere “Delete account” e confermare → risposta 200, account rimosso, redirect a login.
- [ ] Verificare in Dashboard che l’ultima invocazione di `delete-account` sia 200 e che non compaia più “delete-account: error …”.

---

**Nessuna modifica è stata applicata a DB, codebase, RLS, triggers, functions, policies o constraints. Solo forensics e report.**
