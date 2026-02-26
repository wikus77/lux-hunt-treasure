# Incident Report — Email pipeline bloccata (pg_net + Supabase Functions)

**Progetto:** vkjrqirvdvjbemsfzxof | **Ambiente:** Produzione | **App:** iOS nativa (Capacitor WKWebView)  
**Modalità:** READ-ONLY — Nessuna modifica applicata. Solo analisi e report.  
**Firma:** Lovable Agent JLENIA — Cursor Forensics Mode (READ-ONLY)

---

## 1) Summary

I trigger email (Marker Prize, Final Shoot Winner) inseriscono righe in `email_sends` e invocano le Edge Functions via pg_net, ma le chiamate HTTP restituiscono **401** (Missing authorization header / Invalid JWT) e talvolta **503** (BOOT_ERROR). Inoltre **recipient_email** in `email_sends` resta **NULL** perché nessun componente lo valorizza. Le cause principali sono: **auth_token** in `email_send_config` lasciato a placeholder, **base_url** errato (host `.functions.supabase.co` invece di `.supabase.co`), e possibili errori di avvio delle Edge (env/dipendenze). Il fix richiede valorizzare config con URL e token corretti, verificare env delle Functions e, opzionalmente, popolare `recipient_email` in fase di INSERT o da Edge.

---

## 2) Observed Symptoms

- **401** con body `{"code":401,"message":"Missing authorization header"}` su chiamate pg_net verso le Edge email.
- **401** con body `{"code":401,"message":"Invalid JWT"}` (es. `net._http_response` id 48029).
- **503** con body `{"code":"BOOT_ERROR","message":"Function failed to start (please check logs)"}` su alcune invocazioni.
- **public.email_sends**: righe con `template_id` (es. `marker_physical_prize`), `status = queued`, `error_code = pg_net:<id>`, `recipient_user_id` valorizzato, **recipient_email = NULL**.
- **public.email_send_config**: `base_url = https://vkjrqirvdvjbemsfzxof.functions.supabase.co`, `auth_token` = stringa placeholder (non token reale).
- **net._http_request**: relation non esiste; in progetto esistono viste/tabelle tipo `net._http_response`.

---

## A) Mappa architettura "email pipeline"

### A.1) Punti che creano righe in `public.email_sends` e/o invocano le Edge email

| Punto | File / funzione | Azione |
|-------|-----------------|--------|
| INSERT in email_sends | `send_marker_prize_email_now(p_claim_id uuid)` | INSERT (template_id, recipient_user_id, related_type, related_id, status); poi net.http_post. |
| INSERT in email_sends | `send_final_shoot_winner_email_now(p_mission_id, p_winner_user_id, p_won_at)` | Idem per final_shoot_winner. |
| INSERT (versione originale) | `queue_and_invoke_marker_prize_email()` (in rollback/40002) | INSERT poi net.http_post. |
| INSERT (versione originale) | `queue_and_invoke_final_shoot_winner_email()` (in rollback/40001) | Idem. |
| UPDATE email_sends | Edge `send-marker-prize-email` / `send-final-shoot-winner-email` | Aggiornano status, error_code, sent_at (non recipient_email). |

Nessun altro componente nel repo inserisce in `email_sends` o invoca le due Edge email.

### A.2) Trigger email-related e catena

| Evento | Tabella | Trigger | Funzione SQL | Chiamata HTTP | Edge | Provider |
|--------|---------|---------|--------------|---------------|------|----------|
| Premio fisico marker | `public.prize_claims` | `trigger_email_marker_physical_prize` | `queue_and_invoke_marker_prize_email` → chiama `send_marker_prize_email_now(NEW.id)` | pg_net `net.http_post` | `send-marker-prize-email` | SMTP (denomailer) |
| Vincitore Final Shoot | `public.final_shoot_winners` | `trigger_email_final_shoot_winner` | `queue_and_invoke_final_shoot_winner_email` → chiama `send_final_shoot_winner_email_now(NEW.mission_id, NEW.winner_user_id, NEW.won_at)` | pg_net `net.http_post` | `send-final-shoot-winner-email` | SMTP (denomailer) |

Catena: **table INSERT → trigger → function SQL → INSERT email_sends → net.http_post(url, headers, body) → Edge Function → SMTP.**

### A.3) Costruzione della richiesta HTTP verso Supabase Functions

- **URL:** `trim(trailing '/' from base_url) || '/functions/v1/' || <function_name>`.  
  Es.: `base_url` = `https://vkjrqirvdvjbemsfzxof.supabase.co` → `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/send-marker-prize-email`.  
  **Errore in produzione:** base_url impostato a `https://vkjrqirvdvjbemsfzxof.functions.supabase.co` (host sbagliato).

- **Headers:** `Content-Type: application/json`, `Authorization: Bearer ` || `auth_token`.  
  La chiave è esattamente `Authorization` (maiuscolo A); il valore è preso da **public.email_send_config.auth_token**.

- **Dove viene letto auth_token:** Nella funzione SQL, `SELECT base_url, auth_token INTO v_base_url, v_auth_token FROM public.email_send_config LIMIT 1;`. Quindi **sempre** da `email_send_config`.

- **Funzione pg_net usata:** `net.http_post(url := v_url, headers := v_headers, body := v_body)`. Restituisce un bigint (request_id). Nessuna lettura da `net._http_request` (inesistente); le risposte sono in `net._http_response` (o vista equivalente).

---

## 3) Data Evidence

| Fonte | Estratto |
|-------|----------|
| **email_sends** | template_id: marker_physical_prize; status: queued; error_code: pg_net:48029; recipient_user_id: valorizzato; recipient_email: NULL |
| **net._http_response** (id 48029) | status_code: 401; content: `{"code":401,"message":"Invalid JWT"}` |
| **email_send_config** | base_url: `https://vkjrqirvdvjbemsfzxof.functions.supabase.co`; auth_token: placeholder "IL_TUO_EMAIL_INVOKE_SECRET_O_SERVICE_ROLE_KEY" |
| **Schema net** | `net._http_request` assente; presente `net._http_response` (o simile). |

---

## 4) Root Causes

### 4.1) 401 "Missing authorization header"

- **Dove:** La richiesta HTTP verso l’Edge viene costruita in SQL da `public.send_marker_prize_email_now` / `send_final_shoot_winner_email_now` (e nelle versioni originali da `queue_and_invoke_*`). Headers: `jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_auth_token)`.
- **Perché manca:** Se `auth_token` in `email_send_config` è NULL o stringa vuota, l’header diventa `Authorization: Bearer ` (o equivalente vuoto). Il gateway Supabase (Kong) richiede un header Authorization valido e risponde 401 "Missing authorization header" quando l’header è assente o considerato vuoto.
- **Confidence:** **High.**

### 4.2) 401 "Invalid JWT"

- **Cosa arriva alla function:** Il token inviato è il valore di `email_send_config.auth_token`. In evidenza è il **placeholder** `"IL_TUO_EMAIL_INVOKE_SECRET_O_SERVICE_ROLE_KEY"`, non un JWT e non il secret reale.
- **Cosa si aspetta il gateway:** Supabase può essere configurato con **Verify JWT** ON per le Edge Functions. In quel caso il gateway valida il Bearer come **JWT** (es. anon key o service_role key in formato JWT) prima di inoltrare alla function. Un Bearer che non è un JWT valido → 401 "Invalid JWT".
- **Cosa si aspetta l’Edge (nel codice):** Le funzioni `send-marker-prize-email` e `send-final-shoot-winner-email` confrontano il Bearer con `EMAIL_INVOKE_SECRET` o `SUPABASE_SERVICE_ROLE_KEY` (stringa). Non validano JWT; fanno `bearer === secret`. Quindi se il gateway è bypassato (es. Verify JWT OFF), la function accetterebbe un Bearer uguale al secret; con Verify JWT ON il gateway blocca prima con "Invalid JWT" se il token non è un JWT.
- **Conclusione:** Con auth_token = placeholder, il gateway riceve un Bearer non JWT → 401 "Invalid JWT". Anche con Verify JWT OFF, la function risponderebbe 401 "Unauthorized" perché il placeholder non coincide con `EMAIL_INVOKE_SECRET` né con `SUPABASE_SERVICE_ROLE_KEY`.
- **Confidence:** **High.**

### 4.3) 503 "BOOT_ERROR / Function failed to start"

- **Cosa indica:** Il runtime Deno non riesce ad avviare la Edge Function (crash in fase di bootstrap), prima di eseguire la logica della richiesta.
- **Possibili cause (da verificare nei log / nel repo):**  
  - **Env mancanti:** Le due Edge usano `Deno.env.get("SUPABASE_URL")`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_INVOKE_SECRET`. Se una variabile obbligatoria non è impostata (es. `SUPABASE_SERVICE_ROLE_KEY` o `SMTP_PASSWORD`) e il codice la usa senza fallback, può lanciare in fase di avvio.  
  - **Import/bundle:** Import da `jsr:@supabase/supabase-js@2.49.8` e `https://deno.land/x/denomailer@1.6.0/mod.ts`; errori di risoluzione moduli o rete al cold start possono causare BOOT_ERROR.  
  - **File sospetti nel repo:** `supabase/functions/send-marker-prize-email/index.ts`, `supabase/functions/send-final-shoot-winner-email/index.ts` (uso di `!` su `Deno.env.get("SUPABASE_URL")!` e `service`; se `SUPABASE_SERVICE_ROLE_KEY` non è settato, `createClient(url, service)` può fallire).  
- **Dove verificare:** Log delle Edge Functions in Dashboard (Supabase → Edge Functions → funzione → Logs), in particolare le righe relative a avvio/crash e alle variabili d’ambiente.
- **Confidence:** **Medium** (causa generica; la conferma richiede log di runtime).

### 4.4) base_url errato

- **Evidenza:** `base_url = https://vkjrqirvdvjbemsfzxof.functions.supabase.co`.
- **URL corretta (da repo e doc Supabase):** Le invocazioni alle Edge vanno indirizzate a **`https://<project_ref>.supabase.co`** (non `.functions.supabase.co`), con path **`/functions/v1/<function_name>`**. Esempio: `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/send-marker-prize-email`.
- **Impatto:** Con host `.functions.supabase.co` la richiesta può andare a un endpoint inesistente o con comportamento diverso, contribuendo a 503 o a risposte inattese. Anche gli 401 possono essere influenzati se il gateway che risponde è diverso.
- **Confidence:** **High.**

### 4.5) recipient_email NULL (bug logico / schema)

- **Chi inserisce in email_sends:** Solo le funzioni SQL (trigger/RPC): `send_marker_prize_email_now`, `send_final_shoot_winner_email_now` e le versioni originali `queue_and_invoke_*`. Gli INSERT includono solo: `template_id`, `recipient_user_id`, `related_type`, `related_id`, `status`. **Nessuno** imposta `recipient_email`.
- **Chi potrebbe valorizzarlo:**  
  - **Opzione A (DB):** La funzione che fa INSERT potrebbe fare una lookup su `auth.users` (es. con SECURITY DEFINER e permessi su `auth`) e impostare `recipient_email` nella stessa INSERT (o in un UPDATE subito dopo). Nel repo attuale non c’è nessuna lettura da `auth.users` nelle funzioni email.  
  - **Opzione B (Edge):** L’Edge, dopo `getUserById(user_id)` e aver ottenuto `user.user.email`, potrebbe fare `UPDATE email_sends SET recipient_email = toEmail WHERE id = email_send_id`. Nel codice attuale le Edge **non** aggiornano `recipient_email`; aggiornano solo `status`, `error_code`, `sent_at`.
- **Conseguenza:** Anche a parità di auth e avvio corretto della function, la tabella `email_sends` non avrebbe mai il destinatario memorizzato; l’invio effettivo avviene comunque perché l’Edge legge l’email da `auth.users` via `getUserById`. Il NULL è quindi un problema di **audit/log**, non di invio.
- **Confidence:** **High.**

---

## 5) Fix Plan (Minimal / Safe / In-Scope)

Da applicare **in una fase successiva**; nessuna modifica eseguita in questo report.

1. **Configurazione email_send_config (priorità massima)**  
   - Impostare **base_url** = `https://vkjrqirvdvjbemsfzxof.supabase.co` (nessuno slash finale).  
   - Impostare **auth_token** = valore segreto che le Edge accettano:  
     - O lo **stesso valore** impostato come secret `EMAIL_INVOKE_SECRET` per le due Edge (e, se necessario, `SUPABASE_SERVICE_ROLE_KEY` per uso interno),  
     - O la **Service Role Key** (JWT) del progetto, se le Edge confrontano anche con `SUPABASE_SERVICE_ROLE_KEY` e il gateway Supabase richiede un JWT valido (Verify JWT ON). In quel caso usare la service role key come Bearer soddisfa sia il gateway sia il confronto in codice.  
   - Verificare in Dashboard che non resti il placeholder.

2. **Verifica Edge Functions (503 BOOT_ERROR)**  
   - In Dashboard → Edge Functions → `send-marker-prize-email` e `send-final-shoot-winner-email`: controllare **Logs** per stack trace / messaggi di bootstrap.  
   - In **Secrets** (o Project Settings → Edge Functions): assicurare presenza di `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_INVOKE_SECRET` (o almeno quelli usati dal codice).  
   - Se il codice usa `!` su env, considerare (in un secondo momento) fallback o check per evitare crash in avvio se un secret non è impostato.

3. **Verify JWT (Dashboard)**  
   - Per le due Edge email: se **Verify JWT** è ON, il Bearer deve essere un **JWT valido** (es. service role key). Se si usa un custom secret (stringa opaca), in molti casi va impostato **Verify JWT OFF** e la sicurezza è affidata al controllo interno (bearer === EMAIL_INVOKE_SECRET). Allineare config (auth_token) e impostazione Verify JWT.

4. **recipient_email (opzionale, impatto minimo)**  
   - **Opzione A:** Nella funzione SQL che fa l’INSERT in `email_sends`, se il contesto SECURITY DEFINER può leggere `auth.users`, aggiungere una sottoprocesso che legge l’email da `auth.users` (join su `recipient_user_id`) e la inserisce in `recipient_email`.  
   - **Opzione B:** Nelle Edge, dopo aver ottenuto `user.user.email`, eseguire `UPDATE public.email_sends SET recipient_email = toEmail WHERE id = email_send_id` (senza loggare PII in chiaro).  
   - Entrambe le opzioni sono compatibili con RLS (le Edge usano service_role; le funzioni SQL sono SECURITY DEFINER).

---

## 6) Verification Plan (NON eseguito qui; solo elenco)

- **SQL da eseguire (read-only):**  
  - `SELECT id, base_url, (CASE WHEN auth_token IS NOT NULL AND trim(auth_token) <> '' THEN 'SET' ELSE 'NULL' END) AS auth_token_status FROM public.email_send_config;`  
  - Verificare che `base_url` sia `https://vkjrqirvdvjbemsfzxof.supabase.co` e che auth_token_status sia SET (senza mostrare il valore).  
  - Dopo un trigger di test: `SELECT id, template_id, status, error_code, recipient_user_id, recipient_email FROM public.email_sends ORDER BY created_at DESC LIMIT 5;`  
  - Atteso dopo fix: almeno una riga con status `sent` o `failed` (non solo `queued`), e opzionalmente `recipient_email` valorizzato se implementato il fix 4.

- **net._http_response (se disponibile):**  
  - Per l’ultimo request_id noto: verificare `status_code` (200 atteso se auth e function ok) e `content` (no 401/503).

- **Edge Logs:**  
  - Aprire i log delle due Edge e verificare assenza di BOOT_ERROR e presenza di log tipo "sent (recipient masked)" o "SMTP error (no PII)".

---

## 7) Rollback Plan

Se dopo l’applicazione dei fix si debba tornare indietro:

- **Solo config:** Ripristinare `email_send_config` ai valori precedenti (o a NULL/placeholder) con un UPDATE. Non modifica schema né trigger.
- **Se si fosse modificato codice Edge:** Ripristinare le versioni deployate dalle versioni in repo (o da backup) e fare redeploy.
- **Se si fosse aggiunta popolazione di recipient_email in SQL:** Eseguire lo script di rollback delle funzioni (es. `supabase/rollback/EMAIL_FIX_ROLLBACK.sql` ripristina le funzioni trigger/RPC allo stato precedente; non tocca la colonna `recipient_email`).

---

## 8) Notes / Non-Goals

- **Non in scope:** Modifiche a DB, RLS, trigger, funzioni, env, secrets, file sorgente; soluzioni solo PWA o browser-only; modifiche all’app iOS wrapper.
- **Scope:** Solo analisi e report in questo file; i fix sopra sono descritti per essere applicati in un secondo momento.
- **Architettura di riferimento (email pipeline):**  
  - **Marker Prize:** INSERT in `public.prize_claims` → trigger `trigger_email_marker_physical_prize` → `queue_and_invoke_marker_prize_email()` (o equivalente che chiama `send_marker_prize_email_now(claim_id)`) → INSERT `email_sends` → `net.http_post` verso `base_url + '/functions/v1/send-marker-prize-email'` con header `Authorization: Bearer ' || auth_token` e body JSON (user_id, prize_claim_id, email_send_id) → Edge Function → SMTP (denomailer).  
  - **Final Shoot Winner:** INSERT in `public.final_shoot_winners` → trigger `trigger_email_final_shoot_winner` → `queue_and_invoke_final_shoot_winner_email()` (o chiamata a `send_final_shoot_winner_email_now(...)`) → INSERT `email_sends` → `net.http_post` verso `base_url + '/functions/v1/send-final-shoot-winner-email'` con stesso schema auth e body (user_id, mission_id, won_at, email_send_id) → Edge Function → SMTP.  
- **Componenti rotti (sintesi):** Config (base_url + auth_token), eventuale Verify JWT, eventuale avvio Edge (BOOT_ERROR); colonna recipient_email mai popolata per scelta implementativa attuale.
