# PHASE 6 — Test end-to-end (query e risultati attesi)

Eseguire **dopo** aver applicato la migration `20260226120000_email_pipeline_auth_and_log.sql` e aver valorizzato `email_send_config.auth_token_st` (e `base_url`).

---

## 1) Marker prize — invocazione manuale

Usa un `claim_id` reale da `prize_claims` (con `user_id` valido).

```sql
-- Ultimo claim (per ottenere id)
SELECT id, user_id, created_at FROM public.prize_claims ORDER BY created_at DESC LIMIT 1;
```

Poi invoca (sostituisci `<claim_id>`):

```sql
SELECT public.send_marker_prize_email_now('<claim_id>'::uuid);
```

**Verifica:**

```sql
-- Ultima riga email_sends (atteso: status sent o failed, non queued; recipient_email valorizzato se sent)
SELECT id, template_id, status, error_code, recipient_email, created_at
FROM public.email_sends
WHERE template_id = 'marker_physical_prize'
ORDER BY created_at DESC LIMIT 1;

-- Ultima riga http_outbound_log (atteso: request_id valorizzato, error NULL)
SELECT id, trigger_name, url, request_id, error, created_at
FROM public.http_outbound_log
WHERE trigger_name = 'send_marker_prize_email'
ORDER BY id DESC LIMIT 1;
```

**Risultati attesi:** status 200 (via pg_net); email_sends.status in (sent, failed); nessun 401/400/503. Se status = sent, recipient_email non è NULL.

---

## 2) Final shoot winner — invocazione manuale

Usa un record reale da `final_shoot_winners`.

```sql
SELECT mission_id, winner_user_id, won_at FROM public.final_shoot_winners ORDER BY won_at DESC LIMIT 1;
```

Invocazione (sostituisci i parametri):

```sql
SELECT public.send_final_shoot_winner_email_now(
  '<mission_id>'::uuid,
  '<winner_user_id>'::uuid,
  '<won_at>'::timestamptz
);
```

**Verifica:**

```sql
SELECT id, template_id, status, error_code, recipient_email, created_at
FROM public.email_sends
WHERE template_id = 'final_shoot_winner'
ORDER BY created_at DESC LIMIT 1;

SELECT id, trigger_name, url, request_id, error, created_at
FROM public.http_outbound_log
WHERE trigger_name = 'send_final_shoot_winner_email'
ORDER BY id DESC LIMIT 1;
```

**Risultati attesi:** come per marker: nessun 401/400/503; status sent/failed; recipient_email valorizzato se sent.

---

## 3) Riepilogo post-fix

| Controllo              | Atteso                                              |
|------------------------|-----------------------------------------------------|
| net._http_response      | Non usare come tabella; usare http_outbound_log     |
| http_outbound_log      | request_id valorizzato, error NULL per chiamate OK  |
| email_sends            | status = sent o failed (non restare queued)         |
| email_sends.error_code | Non più pg_net:401 / 503; può essere pg_net:<id>   |
| email_sends.recipient_email | Valorizzato quando status = sent             |

---

## Rollback in uno step

Se qualcosa va male: eseguire **20260226120000_email_pipeline_auth_and_log_down.sql** nel SQL Editor (ripristina le funzioni che leggono `auth_token` e rimuove `http_outbound_log`). Vedere anche **INCIDENT_ROLLBACK_NOTES.md**.
