# Hardening Phase 4 — Email ufficiali + log invii

**Data:** 2026-02-24  
**Scope:** Email al vincitore Final Shoot + email premio fisico marker; log in `email_sends`. From/CC: contact@m1ssion.com. Nessuna modifica a Final Shoot RPC, Buzz, IAP, Push native, src/.

---

## 1) Migrations create

| Migration | Contenuto |
|-----------|-----------|
| **20260224140000_email_sends.sql** | Tabella `public.email_sends` (id, template_id, recipient_user_id, recipient_email, related_type, related_id, status, error_code, request_id, created_at, sent_at). RLS: SELECT negato, INSERT/UPDATE per service. Tabella `public.email_send_config` (id, base_url, auth_token) per invocazione Edge da trigger. |
| **20260224140001_triggers_email_final_shoot.sql** | Funzione `queue_and_invoke_final_shoot_winner_email()` SECURITY DEFINER: dopo INSERT su `final_shoot_winners` inserisce riga in `email_sends` (status=queued) e invoca Edge `send-final-shoot-winner-email` via pg_net (best-effort). Trigger AFTER INSERT su `final_shoot_winners`. |
| **20260224140002_triggers_email_marker_physical_prize.sql** | Funzione `queue_and_invoke_marker_prize_email()` SECURITY DEFINER: dopo INSERT su `prize_claims` inserisce in `email_sends` e invoca Edge `send-marker-prize-email` via pg_net (best-effort). Trigger AFTER INSERT su `prize_claims`. |

**Nota:** La tabella `prize_claims` deve esistere e avere colonna `id` (usata da claim-marker-reward). Se non esiste, la migration 20260224140002 fallirà; in quel caso creare prima la tabella o applicare solo le prime due migrations.

---

## 2) Edge Functions create

| Function | Input (JSON) | Comportamento |
|----------|---------------|---------------|
| **send-final-shoot-winner-email** | user_id, mission_id, won_at, email_send_id | Auth: Bearer = EMAIL_INVOKE_SECRET o SUPABASE_SERVICE_ROLE_KEY. Recupera email da auth.admin.getUserById. Invia tramite **SMTP (denomailer**, provider esistente): From/CC contact@m1ssion.com, subject "M1SSION™ — Final Shoot vinto". Aggiorna email_sends (sent/failed). Non logga email/token in chiaro. |
| **send-marker-prize-email** | user_id, prize_claim_id, email_send_id | Stesso auth. Recupera email e opzionalmente claim_code/prize_name da prize_claims. Invia tramite **SMTP (denomailer)**: From/CC contact@m1ssion.com, subject "M1SSION™ — Richiesta premio fisico ricevuta". Aggiorna email_sends. |

Entrambe usano **SMTP (IONOS)** come send-welcome-email e send-contact-email. Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (stessi già in uso). **Nessun uso di Mailjet.**

---

## 3) From / CC (hard requirement)

- **From:** `contact@m1ssion.com` (Name: M1SSION™)
- **CC:** sempre `contact@m1ssion.com`
- Nessun log in chiaro di segreti, token o indirizzi email (solo mascherati nei log).

---

## 4) Evidenze (query e log)

**Query ultime 5 righe email_sends (SQL Editor):**
```sql
SELECT id, template_id, recipient_user_id, status, error_code, created_at, sent_at
FROM public.email_sends
ORDER BY created_at DESC
LIMIT 5;
```

**Log:** verificare nei log delle Edge `send-final-shoot-winner-email` e `send-marker-prize-email` messaggi di invio senza PII (es. "sent (recipient masked)").

---

## 5) File toccati

| Tipo | File |
|------|------|
| Migrations | 20260224140000_email_sends.sql, 20260224140001_triggers_email_final_shoot.sql, 20260224140002_triggers_email_marker_physical_prize.sql |
| Edge (nuove) | supabase/functions/send-final-shoot-winner-email/index.ts, supabase/functions/send-marker-prize-email/index.ts |

**Nessuna modifica a:** execute_final_shoot, claim-marker-reward (nessun fallback aggiunto; trigger su prize_claims), src/, Buzz, IAP, Push native, altre Edge.

---

## 6) Config post-deploy

1. **email_send_config:** in Supabase (SQL o Dashboard) impostare una riga con `base_url` = URL progetto (es. `https://<ref>.supabase.co`) e `auth_token` = token con cui le Edge accettano la chiamata (es. SUPABASE_SERVICE_ROLE_KEY o un secret dedicato).
2. **Edge Secrets:** impostare `EMAIL_INVOKE_SECRET` uguale a `auth_token` usato nei trigger (oppure usare service role key in `auth_token` e non impostare EMAIL_INVOKE_SECRET).
3. **SMTP:** SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (stessi usati da send-welcome-email e send-contact-email). Phase 4 non usa Mailjet.

---

## 7) Rollback (descrittivo)

- **Tag:** `safety/hardening-phase4-preapply-20260224-1400` (creato in locale; push remoto eventuale da fare a mano se auth fallisce).
- **Rollback:** rimuovere i trigger (DROP TRIGGER su final_shoot_winners e prize_claims), rimuovere le due funzioni trigger, opzionalmente droppare le tabelle email_sends e email_send_config. Rimuovere o non deployare le due Edge Functions send-final-shoot-winner-email e send-marker-prize-email. Nessun comando terminale incluso in questo report; eseguire le operazioni da Dashboard/SQL Editor e da interfaccia Supabase per le function.

---

## 8) Verifica (Phase 5)

- **Final Shoot:** inserire una riga in `final_shoot_winners` (staging/test) e controllare che in `email_sends` compaia una riga con template_id `final_shoot_winner` e status che passa da queued a sent/failed; controllare i log della function.
- **Marker physical_prize:** inserire una riga in `prize_claims` (staging) e verificare analoga riga in `email_sends` per `marker_physical_prize`.
- **Vincoli:** nessun file in src/ modificato; execute_final_shoot invariata; Buzz/Buzz Map/IAP/Push native non toccati.

---

## 9) Checklist vincoli

| Vincolo | Stato |
|---------|--------|
| execute_final_shoot (signature, return, logica, pricing) | **NON TOCCATO** |
| Buzz / Buzz Map | **NON TOCCATI** |
| IAP / Push native iOS | **NON TOCCATI** |
| UI / file in src/ | **NON TOCCATI** |
| claim-marker-reward (nessun fallback aggiunto) | **NON TOCCATO** |

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
