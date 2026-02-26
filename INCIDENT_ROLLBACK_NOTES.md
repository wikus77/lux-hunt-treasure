# Incident rollback — Email pipeline (auth + payload)

**Branch:** fix/email-pipeline-auth-payload  
**Commit iniziale (snapshot):** `a0c7ed3b96e555ffa026e3ef4a39c2a1c59f1442`

---

## Snapshot definizioni attuali (da migration / codice repo)

Le funzioni e i trigger attuali sono definiti in:

- **Migration:** `supabase/migrations/20260225120000_email_trigger_direct_http.sql`  
  Contiene: `send_marker_prize_email_now(uuid)`, `send_final_shoot_winner_email_now(uuid,uuid,timestamptz)`, `queue_and_invoke_marker_prize_email()`, `queue_and_invoke_final_shoot_winner_email()`.
- **Trigger:**  
  - `trigger_email_marker_physical_prize` AFTER INSERT ON `public.prize_claims` → `queue_and_invoke_marker_prize_email()`  
  - `trigger_email_final_shoot_winner` AFTER INSERT ON `public.final_shoot_winners` → `queue_and_invoke_final_shoot_winner_email()`

Per ottenere l’output di `pg_get_functiondef` in produzione (SQL Editor):

```sql
SELECT pg_get_functiondef(p.oid) AS fn_def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'send_marker_prize_email_now',
    'send_final_shoot_winner_email_now',
    'queue_and_invoke_marker_prize_email',
    'queue_and_invoke_final_shoot_winner_email'
  )
ORDER BY p.proname;
```

Trigger (definizioni):

```sql
SELECT tgname, pg_get_triggerdef(t.oid, true) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND tgname IN ('trigger_email_marker_physical_prize', 'trigger_email_final_shoot_winner');
```

---

## Snapshot testuale funzioni (da migration 20260225120000)

### send_marker_prize_email_now(p_claim_id uuid)

Legge `base_url` e `auth_token` da `public.email_send_config` (LIMIT 1). Se mancanti → UPDATE email_sends status='skipped', error_code='config_missing'. Altrimenti costruisce URL, header `Authorization: Bearer <token>`, body `{ user_id, prize_claim_id, email_send_id }`, chiama `net.http_post`, scrive in email_sends error_code = 'pg_net:' || request_id.

### send_final_shoot_winner_email_now(p_mission_id, p_winner_user_id, p_won_at)

Stessa logica: legge config, se mancante → skipped/config_missing; altrimenti body `{ user_id, mission_id, won_at, email_send_id }`, http_post a send-final-shoot-winner-email, error_code = 'pg_net:' || request_id.

### queue_and_invoke_marker_prize_email()

RETURNS TRIGGER. Esegue `PERFORM public.send_marker_prize_email_now(NEW.id);` e `RETURN NEW;`.

### queue_and_invoke_final_shoot_winner_email()

RETURNS TRIGGER. Esegue `PERFORM public.send_final_shoot_winner_email_now(NEW.mission_id, NEW.winner_user_id, NEW.won_at);` e `RETURN NEW;`.

---

## Rollback in uno step

1. **DB:** Eseguire la migration “down” che ripristina le funzioni allo stato di `20260225120000_email_trigger_direct_http.sql` (senza lettura di `auth_token_st` e senza scrittura in `http_outbound_log`), e opzionalmente rimuovere la tabella `http_outbound_log` se creata.
2. **Git:** `git checkout incident/email-auto-marker-finalshoot` (o il branch precedente) e/o revert dei commit sul branch fix/email-pipeline-auth-payload.
3. **Edge:** Ripristinare i file da `supabase/functions/_backup_before_email_fix/` se sono stati modificati.
