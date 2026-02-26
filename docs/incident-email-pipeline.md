# Incident — Email pipeline bloccata (pg_net → Edge Functions)

**Progetto:** vkjrqirvdvjbemsfzxof (produzione) | **App:** iOS nativa (Capacitor WKWebView). Niente PWA/TWA/browser push.  
**Scope fix:** solo backend email (email_send_config, Edge send-marker-prize-email / send-final-shoot-winner-email, opz. recipient_email).

---

## Summary

I trigger email (Marker Prize, Final Shoot Winner) creano righe in `public.email_sends` (status=queued) ma le chiamate pg_net alle Edge falliscono con **401** (Missing authorization header / Invalid JWT) e **503** (BOOT_ERROR). Cause principali: **base_url** errato (host `.functions.supabase.co`), **auth_token** lasciato a placeholder, e possibile crash in avvio Edge per env mancanti. In più **recipient_email** resta NULL (nessuno lo valorizzava). Fix applicati: (1) script SQL per base_url corretto e auth_token valido, (2) backup config e Edge, (3) patch Edge: validazione env in avvio e UPDATE recipient_email per audit.

---

## Evidence (query + output sintetico)

**Eseguire in Supabase SQL Editor (read-only). Non stampare auth_token in chiaro.**

```sql
-- Config (auth_token: solo SET/EMPTY/PLACEHOLDER)
SELECT id, base_url,
  CASE WHEN auth_token IS NULL OR trim(auth_token) = '' THEN 'EMPTY'
       WHEN auth_token LIKE '%IL_TUO_%' OR auth_token LIKE '%placeholder%' THEN 'PLACEHOLDER'
       ELSE 'SET' END AS auth_token_status
FROM public.email_send_config;

-- Ultimi 30 net._http_response (se la vista esiste)
SELECT id, status_code, created, left(content::text, 200) AS content_preview
FROM net._http_response
ORDER BY id DESC LIMIT 30;

-- Ultimi 20 email_sends
SELECT id, template_id, status, error_code, created_at, recipient_user_id, recipient_email
FROM public.email_sends
ORDER BY created_at DESC LIMIT 20;
```

**Output sintetico atteso (pre-fix):** base_url con `.functions.supabase.co`, auth_token_status = PLACEHOLDER; net._http_response con status_code 401/503; email_sends con status=queued, recipient_email=NULL, error_code pg_net:\<id>.

---

## Root causes

| Causa | Confidence | Descrizione |
|-------|------------|-------------|
| **401 Missing authorization header** | High | auth_token NULL/vuoto → header `Authorization: Bearer ` vuoto; gateway risponde 401. |
| **401 Invalid JWT** | High | auth_token = placeholder non JWT; con Verify JWT ON il gateway valida il Bearer come JWT e risponde 401 Invalid JWT. |
| **503 BOOT_ERROR** | Medium | Edge crash in bootstrap: env mancanti (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) o createClient() con service undefined. |
| **base_url errato** | High | base_url = `https://vkjrqirvdvjbemsfzxof.functions.supabase.co`; host corretto è `https://vkjrqirvdvjbemsfzxof.supabase.co`. |
| **recipient_email NULL** | High | Nessun INSERT/UPDATE valorizza la colonna; le Edge non facevano UPDATE recipient_email. |

---

## Fix plan (minimo)

1. **FIX 2.1 — base_url:** Aggiornare `email_send_config.base_url` a `https://vkjrqirvdvjbemsfzxof.supabase.co` (senza slash finale).
2. **FIX 2.2 — auth_token + Verify JWT:**  
   - **Strategia A (consigliata):** auth_token = SUPABASE_SERVICE_ROLE_KEY (JWT). Le Edge già accettano `EMAIL_INVOKE_SECRET` OR `SUPABASE_SERVICE_ROLE_KEY`. Con Verify JWT ON il gateway accetta il JWT.  
   - **Strategia B:** auth_token = EMAIL_INVOKE_SECRET, Verify JWT = OFF per le due Edge; sicurezza dal confronto Bearer === secret in codice.  
   - Nel report non si scrive il token; solo: "token presente e valido (tipo: service_role_jwt / invoke_secret)".
3. **FIX 2.3 — BOOT_ERROR:** Validazione env all’ingresso handler: se SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancano, rispondere 500 con messaggio chiaro invece di crash. Secrets in Dashboard: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_*, EMAIL_INVOKE_SECRET.
4. **FIX 2.4 — recipient_email (audit):** In Edge, dopo aver ottenuto `toEmail` da getUserById, eseguire `UPDATE email_sends SET recipient_email = toEmail WHERE id = email_send_id`. Nessun log in chiaro.

---

## Patch applicate

- **Config:** Eseguire in SQL Editor `supabase/rollback/apply_email_config_fix.sql` dopo aver sostituito `<AUTH_TOKEN>` con il valore reale (SUPABASE_SERVICE_ROLE_KEY JWT oppure EMAIL_INVOKE_SECRET). Non committare il file con il token in chiaro.
- **Edge send-marker-prize-email:** (1) Guard env all’inizio del handler (500 se SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti); (2) dopo `const toEmail = user.user.email` aggiunto UPDATE `email_sends.recipient_email = toEmail`.
- **Edge send-final-shoot-winner-email:** stesse due patch.
- **Backup:** Copie in `supabase/functions/_backup_before_email_fix/send-marker-prize-email/index.ts` e `send-final-shoot-winner-email/index.ts`.
- **Rollback config:** `supabase/rollback/rollback_email_send_config.sql` (SELECT stato attuale senza token; UPDATE di ripristino con placeholder; valorizzare auth_token da storage sicuro se necessario).

---

## Verification plan (query da eseguire, non eseguite automaticamente)

1. **Dopo fix config:**  
   `SELECT id, base_url, CASE WHEN auth_token IS NOT NULL AND trim(auth_token) <> '' THEN 'SET' ELSE 'NULL' END FROM public.email_send_config;`  
   Atteso: base_url = `https://vkjrqirvdvjbemsfzxof.supabase.co`, auth_token = SET.

2. **Dopo invio di test (trigger o RPC send_marker_prize_email_now):**  
   `SELECT id, template_id, status, error_code, recipient_email FROM public.email_sends ORDER BY created_at DESC LIMIT 5;`  
   Atteso: almeno una riga con status = sent o failed (non solo queued); recipient_email valorizzato se patch 2.4 attiva.

3. **net._http_response:** Ultimo id per la funzione email: status_code = 200, content senza 401/503.

4. **Edge Logs (Dashboard):** Nessun BOOT_ERROR; presenza di "sent (recipient masked)" o "SMTP error (no PII)".

---

## Before vs After

| Controllo | Before | After (atteso) |
|-----------|--------|----------------|
| base_url | .functions.supabase.co | .supabase.co |
| auth_token_status | PLACEHOLDER/EMPTY | SET (tipo: service_role_jwt o invoke_secret) |
| net._http_response (ultimo email) | 401 / 503 | 200 |
| email_sends.status (ultima riga) | queued | sent o failed |
| email_sends.recipient_email | NULL | valorizzato (se patch 2.4) |
| Edge logs | BOOT_ERROR / 401 | richiesta ricevuta, outcome sent/smtp_error |

---

## Rollback plan

1. **Config:** Eseguire `supabase/rollback/rollback_email_send_config.sql`. Contiene UPDATE che ripristina base_url e auth_token (valorizzare auth_token da backup sicuro se non si vuole committare).
2. **Edge:** Copiare da backup e ridistribuire:  
   `cp supabase/functions/_backup_before_email_fix/send-marker-prize-email/index.ts supabase/functions/send-marker-prize-email/`  
   `cp supabase/functions/_backup_before_email_fix/send-final-shoot-winner-email/index.ts supabase/functions/send-final-shoot-winner-email/`  
   Poi `supabase functions deploy send-marker-prize-email send-final-shoot-winner-email`.
3. **Rollback verified:** YES/NO — Da compilare dopo prova: eseguire rollback config (UPDATE da rollback_email_send_config.sql con valori da backup sicuro), ripristinare i due file Edge da `_backup_before_email_fix/` e `supabase functions deploy`; rieseguire le verification query e confermare che lo stato torna a pre-fix.

---

## Rollback steps (dettaglio)

- **Un comando / un revert:**  
  - Config: 1) Aprire `rollback_email_send_config.sql`, 2) Sostituire `<RESTORE_AUTH_TOKEN>` con il valore salvato in modo sicuro (se necessario), 3) Eseguire l’UPDATE in SQL Editor.  
  - Edge: 1) Ripristinare i file da `_backup_before_email_fix/` come sopra, 2) `supabase functions deploy send-marker-prize-email send-final-shoot-winner-email`.

---

## Notes / Non-Goals

- Non introdurre refactor; non cambiare schema DB; non toccare trigger esistenti se non necessario.
- Non toccare app iOS wrapper, UI, routing, PWA, auth flows, altre tabelle/trigger.
- Priorità: sbloccare 401/503 e far partire la pipeline email per app iOS wrappata.
