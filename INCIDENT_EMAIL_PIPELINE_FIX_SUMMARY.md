# Incident email pipeline — Fix summary

**Branch:** fix/email-pipeline-auth-payload  
**Firma:** Lovable Agent JLENIA

---

## 1) ROOT CAUSE CONFIRMED

- **401 Missing authorization header / Unauthorized:** Il trigger legge il token da `public.email_send_config`. Se in produzione la colonna effettiva è **auth_token_st** (e non **auth_token**), la SELECT `auth_token` restituisce NULL → l’header `Authorization: Bearer ` è vuoto → 401.
- **400 missing user_id or email_send_id:** Può comparire se la richiesta viene rifiutata prima della validazione del body (es. auth fallita) o se un altro chiamante invia payload errato. Il DB già invia `user_id` e `email_send_id`; le Edge sono allineate (vedi EDGE_FUNCTION_CONTRACT.md).
- **503 BOOT_ERROR:** Crash in bootstrap della Edge (env mancanti o import). Mitigato con guard su `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` che restituisce 500 con messaggio tecnico invece di crash.

---

## 2) Lista patch (DB + Edge)

| # | Tipo   | File / azione |
|---|--------|----------------|
| 1 | DB     | **supabase/migrations/20260226120000_email_pipeline_auth_and_log.sql** — Crea `http_outbound_log`; aggiunge `auth_token_st` e sync da `auth_token`; aggiorna `send_marker_prize_email_now` e `send_final_shoot_winner_email_now` per leggere **auth_token_st**, anti-null (no http_post se token vuoto), scrittura log. |
| 2 | Rollback DB | **supabase/migrations/20260226120000_email_pipeline_auth_and_log_down.sql** — Ripristina le due funzioni alla lettura di `auth_token` e senza log; DROP `http_outbound_log`. |
| 3 | Doc    | **EDGE_FUNCTION_CONTRACT.md** — Contratto payload e allineamento DB ↔ Edge (nessuna modifica codice Edge necessaria per il 400). |
| 4 | Edge   | Già presenti: guard bootstrap in **send-marker-prize-email** e **send-final-shoot-winner-email** (500 se SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY mancanti). |

---

## 3) Prove (query + risultati)

- **Verifica colonna token:** vedi **PHASE1_AUTH_COLUMN_VERIFICATION.md** (query `information_schema.columns` + SELECT su `email_send_config` senza segreti).
- **Test E2E:** vedi **PHASE6_E2E_TEST_REPORT.md** — invocazione `send_marker_prize_email_now(claim_id)` e `send_final_shoot_winner_email_now(mission_id, winner_user_id, won_at)`; verifica `email_sends` (status sent/failed, recipient_email) e `http_outbound_log` (request_id, error NULL).

---

## 4) Rollback in uno step

1. **DB:** Eseguire in SQL Editor **supabase/migrations/20260226120000_email_pipeline_auth_and_log_down.sql** (ripristina le due funzioni con lettura `auth_token`, rimuove `http_outbound_log`).
2. **Config:** Se in produzione il token è solo in `auth_token_st`, dopo il rollback va rimesso in **auth_token** (o lasciare entrambi valorizzati).
3. **Git:** `git checkout <branch_precedente>` e/o revert dei commit sul branch `fix/email-pipeline-auth-payload`.

Vedi anche **INCIDENT_ROLLBACK_NOTES.md** (commit iniziale, snapshot definizioni).
