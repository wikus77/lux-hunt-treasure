# Piano fix — Email pipeline (pg_net → Edge)

**Progetto:** vkjrqirvdvjbemsfzxof | **App:** iOS wrappata (Capacitor).  
**Firma:** Lovable Agent JLENIA

---

## Lista modifiche (diff logico)

| # | Modifica | Dove | Diff logico |
|---|----------|------|-------------|
| 1 | base_url corretta | public.email_send_config | base_url da `https://vkjrqirvdvjbemsfzxof.functions.supabase.co` → `https://vkjrqirvdvjbemsfzxof.supabase.co` |
| 2 | auth_token valido (JWT) | public.email_send_config | auth_token da placeholder/empty → valore SUPABASE_SERVICE_ROLE_KEY (sostituire <AUTH_TOKEN> in SQL prima di eseguire; mai in commit) |
| 3 | Guard env (BOOT_ERROR) | Edge send-marker-prize-email, send-final-shoot-winner-email | All’inizio handler: se SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti → return 500 con body `{ error: "boot_config_missing", message: "..." }` invece di crash |
| 4 | Audit recipient_email | Stesse Edge | Dopo getUserById e aver ottenuto toEmail: UPDATE email_sends SET recipient_email = toEmail WHERE id = email_send_id (nessun log in chiaro) |

---

## Checklist done/verify

- [ ] **Backup Edge** — Copiati in `supabase/functions/_backup_before_email_fix/send-marker-prize-email/index.ts` e `.../send-final-shoot-winner-email/index.ts`
- [ ] **Rollback SQL** — Creato `supabase/rollback/EMAIL_PIPELINE_ROLLBACK.sql` con UPDATE di ripristino (placeholder per auth_token; istruzioni per valore da storage sicuro)
- [ ] **Patch config** — Eseguito `supabase/patches/EMAIL_PIPELINE_APPLY.sql` in Dashboard (dopo sostituzione <AUTH_TOKEN> con SUPABASE_SERVICE_ROLE_KEY)
- [ ] **Verifica post-fix** — Eseguite le query di verifica in EMAIL_PIPELINE_APPLY.sql (stato config; ultime email_sends; ultime net._http_response)
- [ ] **net._http_response** — Ultima richiesta verso le Edge email: status_code = 200 (non 401/503)
- [ ] **email_sends** — Almeno una riga con status = sent o failed (non restare queued); error_code non "pg_net:401" / "pg_net:503"
- [ ] **Logs Edge** — Dashboard → Edge Functions → send-marker-prize-email / send-final-shoot-winner-email → Logs: nessun BOOT_ERROR; presenza di "sent (recipient masked)" o "SMTP error (no PII)" o "boot_config_missing" (se env mancanti)
- [ ] **Rollback testato** — In caso di rollback: eseguito EMAIL_PIPELINE_ROLLBACK.sql e (se necessario) ripristinati i file Edge da _backup_before_email_fix e redeploy

---

## Verifica (FASE 6) — Dettaglio

**Query attese post-fix:**

1. **Config (senza stampare token):**  
   `SELECT id, base_url, CASE WHEN auth_token IS NOT NULL AND trim(auth_token) <> '' THEN 'SET' ELSE 'NULL' END FROM public.email_send_config;`  
   Atteso: base_url = `https://vkjrqirvdvjbemsfzxof.supabase.co`, secondo campo = SET.

2. **Ultime risposte pg_net:**  
   `SELECT id, status_code, left(content::text, 200) FROM net._http_response ORDER BY id DESC LIMIT 10;`  
   Atteso: per le chiamate alle due Edge email, status_code = 200.

3. **Ultime email_sends:**  
   `SELECT id, template_id, status, error_code, recipient_email FROM public.email_sends ORDER BY created_at DESC LIMIT 10;`  
   Atteso: status in (sent, failed); non solo queued; recipient_email valorizzato se patch audit attiva.

**Dove guardare i log Edge in Dashboard:**  
Supabase Dashboard → progetto vkjrqirvdvjbemsfzxof → **Edge Functions** → selezionare **send-marker-prize-email** o **send-final-shoot-winner-email** → tab **Logs**. Cercare righe con errore di bootstrap (BOOT_ERROR) o messaggi "boot_config_missing", "sent (recipient masked)", "SMTP error (no PII)".
