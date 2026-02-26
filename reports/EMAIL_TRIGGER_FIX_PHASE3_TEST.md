# Email trigger fix — PHASE 3 Test

**Dopo aver applicato** `supabase/migrations/20260225120000_email_trigger_direct_http.sql`.

---

## 1) Test marker prize (con claim reale)

Sostituisci `<CLAIM_UUID>` con un `id` reale da `public.prize_claims`.

```sql
SELECT public.send_marker_prize_email_now('<CLAIM_UUID>');
```

## 2) Controllo righe in email_sends

```sql
SELECT id, template_id, recipient_user_id, related_type, related_id, status, error_code, created_at, sent_at
FROM public.email_sends
ORDER BY created_at DESC
LIMIT 20;
```

Atteso: almeno una riga nuova con `template_id = 'marker_physical_prize'`, `status` = 'queued' (poi l’Edge può portarla a 'sent'/'failed'), `error_code` tipo `pg_net:123` se la chiamata è partita.

## 3) Se status = failed

Controllare `error_code`: `config_missing`, `trigger_invoke_failed` o `pg_net:<id>`. Non interrogare tabelle `net.*`; il log è in `email_sends`.

## 4) Test final shoot (opzionale)

Con mission_id, winner_user_id, won_at validi:

```sql
SELECT public.send_final_shoot_winner_email_now(
  '<MISSION_UUID>'::uuid,
  '<WINNER_USER_UUID>'::uuid,
  now()
);
```

Poi rieseguire la query del punto 2 e verificare una riga con `template_id = 'final_shoot_winner'`.

---

**Exit criteria:** `email_sends` contiene righe nuove dopo la chiamata RPC; per almeno una chiamata lo stato diventa `sent` quando l’Edge aggiorna il record.
