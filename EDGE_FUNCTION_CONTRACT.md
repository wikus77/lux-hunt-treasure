# Contratto payload — Edge Functions email (pg_net → Edge)

**Progetto:** vkjrqirvdvjbemsfzxof. Invocazione da trigger DB via `net.http_post`.

---

## send-marker-prize-email

**URL:** `POST {base_url}/functions/v1/send-marker-prize-email`

**Header obbligatorio:** `Authorization: Bearer <token>` (JWT service_role o EMAIL_INVOKE_SECRET).

**Body (JSON):**

| Campo           | Tipo   | Obbligatorio | Descrizione                          |
|----------------|--------|--------------|--------------------------------------|
| user_id        | UUID   | Sì           | ID utente destinatario (auth.users)  |
| email_send_id  | UUID   | Sì           | ID riga in public.email_sends        |
| prize_claim_id | UUID   | No           | ID claim (per claim_code, prize_name)|

**Risposta 200:** `{ "ok": true }` oppure `{ "ok": false, "reason": "user_or_email_missing" | "smtp_not_configured" | "smtp_error" | "exception" }`.

**Errori:** 400 se mancano `user_id` o `email_send_id`; 401 se auth mancante/non valida; 500 se boot_config_missing o exception.

**Comportamento:** Lookup user email, aggiorna `email_sends.recipient_email`, invia email SMTP, aggiorna `email_sends.status` (sent/failed) e `sent_at`.

---

## send-final-shoot-winner-email

**URL:** `POST {base_url}/functions/v1/send-final-shoot-winner-email`

**Header obbligatorio:** `Authorization: Bearer <token>`.

**Body (JSON):**

| Campo          | Tipo     | Obbligatorio | Descrizione                         |
|----------------|----------|--------------|-------------------------------------|
| user_id        | UUID     | Sì           | ID utente vincitore                 |
| email_send_id  | UUID     | Sì           | ID riga in public.email_sends       |
| mission_id     | UUID     | No           | ID missione                         |
| won_at         | string   | No           | ISO timestamp vincita               |

**Risposta 200:** come sopra (`ok`, `reason`).

**Errori:** 400 se mancano `user_id` o `email_send_id`; 401/500 come sopra.

**Comportamento:** Come marker: lookup email, aggiorna recipient_email, invia email, aggiorna status/sent_at.

---

## Allineamento DB → Edge (stato attuale)

Le funzioni DB `send_marker_prize_email_now` e `send_final_shoot_winner_email_now` inviano già:

- **Marker:** `{ user_id, prize_claim_id, email_send_id }` ✅
- **Final shoot:** `{ user_id, mission_id, won_at, email_send_id }` ✅

Le Edge si aspettano `user_id` e `email_send_id` obbligatori; gli altri campi sono opzionali. **Nessuna modifica al payload DB è necessaria**; il 400 "missing user_id or email_send_id" si verifica se l’header Authorization è vuoto/invalido e la richiesta viene rifiutata prima del body, o se un altro chiamante invia payload errato. Il fix della colonna token (auth_token_st vs auth_token) risolve il 401 e permette alla Edge di ricevere il body corretto.
