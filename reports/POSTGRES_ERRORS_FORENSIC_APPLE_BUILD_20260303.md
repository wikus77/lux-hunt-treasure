# Verifica forense errori Postgres — build Apple (post-migrazioni)

**Data:** 03 Mar 2026  
**Contesto:** Migrazioni SQL applicate ma errori ancora presenti in log Supabase. Valutazione gravità per invio build ad Apple.

---

## Executive summary

| Stato | Conclusione |
|--------|-------------|
| **Errori ancora in log** | Sì: gli stessi 3 errori (meta, mission_enrollments.id, admin_logs RLS) + **nuovi** "relation does not exist" e "connection/SSL". |
| **Gravi per Apple?** | **Sì.** Se le funzionalità core (Buzz Map, Mission enrollment, log, notifiche) falliscono o loggano errori in console, il rischio di rifiuto è alto. |
| **Perché le migrazioni non bastano** | (1) Migrazioni da applicare **sul progetto Supabase giusto** (Dashboard → SQL). (2) Un errore ("notifications") viene dal **codice app** (tabella sbagliata). (3) admin_logs e subscriptions richiedono **policy RLS / GRANT**, non solo migrazioni. |

---

## 1. Perché vedi ancora gli stessi errori dopo le migrazioni

### 1.1 Migrazioni applicate sul DB giusto?

- Le migration in repo (`20260303100000_fix_handle_buzz_map_pe_no_meta.sql`, `20260303100001_mission_enrollments_add_id_if_missing.sql`) vanno **eseguite sul progetto Supabase usato dall’app** (quello dei log).
- Se le hai eseguite in locale o su un altro progetto, il DB in produzione non è stato aggiornato.
- **Verifica:** Supabase Dashboard → SQL Editor → esegui e controlla:
  - Per il trigger:  
    `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_buzz_map_pe';`  
    nell’output non deve comparire `NEW.meta`.
  - Per mission_enrollments:  
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mission_enrollments';`  
    deve esserci la colonna `id`.

### 1.2 Ordine di esecuzione

- Prima **20260303100000** (fix trigger), poi **20260303100001** (colonne mission_enrollments).
- Se le hai eseguite in ordine inverso non cambia per queste due; l’importante è che siano state eseguite sul **progetto** da cui arrivano i log.

### 1.3 admin_logs e subscriptions

- **admin_logs:** l’errore è **RLS** (policy INSERT). La migration non tocca le policy. Serve una policy che permetta l’INSERT al ruolo che usa l’app (o fare gli insert solo da Edge Function con service_role).
- **subscriptions:** serve **GRANT** (e eventualmente RLS) sulla tabella usata dal client. Nessuna delle due migration lo fa.

Quindi: è normale che, anche con le due migration applicate, **admin_logs** e **subscriptions** continuino a dare errore finché non aggiusti policy e permessi.

---

## 2. Nuovi errori "relation does not exist" (dai log / screenshot)

| Relation (errore in log) | Origine probabile | Gravità per Apple |
|--------------------------|-------------------|--------------------|
| `public.notifications` does not exist | **App:** `ClueMilestoneWatcher.tsx` fa `.from('notifications')`. In DB la tabella si chiama **`user_notifications`**. | **Alta** — fallback milestone clue fallisce, log errore. |
| `public._sz_transaction_ts` does not exist | Probabile uso interno Supabase (Realtime/cache). Non presente nel repo. | Media se Realtime usato; altrimenti bassa. |
| `public.user_states_play` does not exist | Nome simile a tabelle “play”/stato; non trovato nel repo. Possibile typo o tabella rimossa. | Da verificare se qualche flusso la usa. |
| `public.pus_tokens_play` does not exist | Probabile typo/nome errato per **push_tokens** (tabella reale: `public.push_tokens`). | Alta se qualcosa la richiede. |
| `public.supabase_storage_objects` does not exist | Storage in Supabase è **`storage.objects`**, non `public.supabase_storage_objects`. Qualcosa (client/extension) usa il nome sbagliato. | Media se impatta upload/download file. |

L’unico su cui possiamo agire direttamente nel codice è **`notifications`**: va sostituito con **`user_notifications`** in `ClueMilestoneWatcher.tsx`.

---

## 3. Errori connection / SSL

- **"connection error: ssl protocol error"** e **"connection closed"** sono tipici di:
  - rete instabile,
  - client che si disconnettono (app in background, chiusura),
  - timeout o limiti lato Supabase.
- Non sono risolvibili con migration; in genere non bloccano la review se l’app si comporta bene quando la connessione è stabile. Valutazione: **rumore / media** a meno che non vedi crash o schermate bianche.

---

## 4. Gravità per invio build ad Apple

- **Bloccanti (da risolvere prima dell’invio):**
  - **Buzz Map:** se il trigger su `buzz_map_actions` fallisce ancora → INSERT falliti, feature rotta.
  - **Mission enrollment:** se `mission_enrollments.id` non esiste ancora → query fallite, “Start Mission” / stato missione rotti.
  - **`public.notifications`:** fallback in ClueMilestoneWatcher fallisce → errore in console e possibile comportamento anomalo milestone.
- **Alti (fortemente consigliato risolvere):**
  - **admin_logs RLS:** insert bloccati → log mancanti o errori ripetuti.
  - **subscriptions permission denied:** funzionalità che dipendono da quella tabella possono fallire.
- **Da verificare:** _sz_transaction_ts, user_states_play, pus_tokens_play, supabase_storage_objects — se compaiono durante flussi che l’utente (e il reviewer) usano, vanno indagati.

In sintesi: **sì, sono gravi per Apple** finché Buzz Map, Mission enrollment e notifiche (e possibilmente admin_logs/subscriptions) continuano a generare errori o comportamenti errati.

---

## 5. Checklist operativa prima dell’invio

1. **Conferma che le due migration siano state applicate sul progetto Supabase di produzione:**
   - Fix trigger `handle_buzz_map_pe` (niente `NEW.meta`).
   - Aggiunta colonne `id` / `state` / `created_at` a `mission_enrollments` se mancanti.
2. **Codice app:** sostituire `notifications` con `user_notifications` in `ClueMilestoneWatcher.tsx` (fix incluso in questo report).
3. **admin_logs:** aggiungere policy INSERT adeguata o spostare gli insert in Edge Function con service_role.
4. **subscriptions:** `GRANT` (e RLS se necessario) per il ruolo usato dall’app.
5. **Test su device reale:** cold start, login, Buzz Map, Start Mission, centro notifiche; verificare che in console/Xcode non compaiano più gli errori sopra.
6. **Log Postgres:** dopo le fix, ricontrollare i log Supabase per confermare che gli errori siano spariti o ridotti.

---

## 6. Fix applicato in codice (notifications → user_notifications)

- **File:** `src/components/milestones/ClueMilestoneWatcher.tsx`
- **Modifica:** `.from('notifications')` → `.from('user_notifications')` nel fallback del conteggio notifiche buzz.
- La tabella `user_notifications` ha la colonna `type`; il filtro `.eq('type', 'buzz')` resta valido.

La modifica è stata applicata nel repo. Ricompilare (`npm run build`) e rifare un test completo prima di inviare la build ad Apple.

---

## 7. Riepilogo: cosa fare adesso

1. **Supabase (stesso progetto dei log):**  
   Esegui di nuovo le due migration (SQL Editor) se non sei sicuro che siano state applicate su quel progetto. Poi verifica con le query di controllo al § 1.1.

2. **Codice:**  
   Fix `notifications` → `user_notifications` in ClueMilestoneWatcher: **già applicato.**

3. **admin_logs:**  
   Aggiungi policy INSERT (o sposta insert in Edge Function con service_role). Vedi report `POSTGRES_LOGS_VERIFICATION_20260303.md`.

4. **subscriptions:**  
   `GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;` (e ruoli necessari).

5. **Build + test:**  
   `npm run build` → `npx cap sync ios` → test su device (Buzz Map, Mission, notifiche). Controlla log Xcode e log Postgres: gli errori devono sparire o ridursi prima di inviare ad Apple.
