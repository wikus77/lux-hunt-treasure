# Email auto — Marker reward + Final Shoot winner (SMTP IONOS)

**© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™**

---

## FASE 0 — Safety / Rollback

- **Branch:** `incident/email-auto-marker-finalshoot`
- **Tag rollback:** `rollback/pre-email-auto-marker-finalshoot`
- **Diff iniziale (catena custodia):** 4 file modificati rispetto a HEAD (ios public, claim-marker-reward, send-welcome-email); le migrations e le Edge `send-marker-prize-email` / `send-final-shoot-winner-email` sono presenti nel repo (untracked o già esistenti).

---

## FASE 1 — Verifica (read-only forensics)

### 1.1 — Inventario Edge Functions

| Function | Esiste | Provider | From / CC | Env |
|----------|--------|----------|-----------|-----|
| send-welcome-email | Sì | denomailer SMTP | noreply@ + replyTo contact@ | SMTP_* |
| send-contact-email | Sì | denomailer SMTP | contact@ | SMTP_* |
| send-auto-reply | Sì | denomailer SMTP | contact@ | SMTP_* |
| **send-marker-prize-email** | **Sì** | **denomailer SMTP** | **contact@m1ssion.com** (From + CC) | SMTP_*, EMAIL_INVOKE_SECRET |
| **send-final-shoot-winner-email** | **Sì** | **denomailer SMTP** | **contact@m1ssion.com** (From + CC) | SMTP_*, EMAIL_INVOKE_SECRET |

Entrambe le funzioni target usano `SMTPClient` da `denomailer@1.6.0`, SMTP_HOST/PORT/USER/PASSWORD, From `"M1SSION™" <contact@m1ssion.com>`, CC `contact@m1ssion.com`. Auth: Bearer = `EMAIL_INVOKE_SECRET` o `SUPABASE_SERVICE_ROLE_KEY`. Log senza PII (email mascherata).

---

### 1.2 — Eventi DB (tabella + azione)

**Tabella A — Marker reward (premio fisico)**

| Campo | Valore |
|-------|--------|
| **Tabella** | `public.prize_claims` |
| **Azione** | INSERT |
| **Chi scrive** | Edge Function `claim-marker-reward` (quando `reward_type = 'physical_prize'`) |
| **Colonne utili** | `id`, `user_id`, `marker_id`, `prize_name`, `prize_description`, `claim_code`, `status`, `claimed_at` |
| **Nota** | La tabella `prize_claims` è referenziata dal trigger Phase 4; nello schema remoto (backup) esiste con `user_id`, `claim_code`, `prize_name`. Se in un ambiente non esiste, va creata con una migration minima prima del trigger. |

**Tabella B — Final Shoot winner**

| Campo | Valore |
|-------|--------|
| **Tabella** | `public.final_shoot_winners` |
| **Azione** | INSERT |
| **Chi scrive** | RPC `execute_final_shoot` (e varianti in migrations) — SECURITY DEFINER, server-side only |
| **Colonne utili** | `mission_id`, `winner_user_id`, `attempt_id`, `won_at`, `distance_meters`, `evidence`, `proof_hash` |
| **Nota** | RLS: INSERT WITH CHECK (false); solo RPC in SECURITY DEFINER può inserire. |

---

### 1.3 — Hook server-side (wiring)

| Evento | Hook | Tipo |
|--------|------|------|
| **A) Marker physical prize** | Trigger `trigger_email_marker_physical_prize` AFTER INSERT su `prize_claims` | DB trigger → `queue_and_invoke_marker_prize_email()` → INSERT in `email_sends` + `net.http_post` a `send-marker-prize-email` |
| **B) Final Shoot winner** | Trigger `trigger_email_final_shoot_winner` AFTER INSERT su `final_shoot_winners` | DB trigger → `queue_and_invoke_final_shoot_winner_email()` → INSERT in `email_sends` + `net.http_post` a `send-final-shoot-winner-email` |

Entrambe le funzioni trigger sono SECURITY DEFINER, leggono `email_send_config` (base_url, auth_token) e invocano l’Edge via **pg_net**. Se base_url o auth_token sono NULL/vuoti, la riga in `email_sends` viene messa in status `skipped` con error_code `config_missing`. Nessuna invocazione dal client iOS; l’email parte server-side anche se l’utente chiude l’app.

---

### 1.4 — Permessi / RLS

- **final_shoot_winners:** INSERT solo da RPC (policy WITH CHECK (false)); SELECT pubblico. Scrittura effettuata solo da `execute_final_shoot` (SECURITY DEFINER).
- **prize_claims:** INSERT da Edge `claim-marker-reward` con service_role (bypass RLS); RLS “Users can view own claims”, “Admin can manage”. Scrittura da Edge quindi server-side.
- **email_sends:** SELECT negato (policy false); INSERT/UPDATE per service. I trigger sono SECURITY DEFINER e usano il contesto del DB, non il client.

---

## FASE 1 — Output obbligatorio (riepilogo)

| Output | Contenuto |
|--------|-----------|
| **Tabella A (marker claim)** | Tabella `prize_claims`, azione INSERT, colonne: user_id, id (prize_claim_id), prize_name, claim_code. Scrittura da Edge `claim-marker-reward` (physical_prize). |
| **Tabella B (final shoot winner)** | Tabella `final_shoot_winners`, azione INSERT, colonne: winner_user_id, mission_id, won_at. Scrittura da RPC `execute_final_shoot`. |
| **Edge functions correlate** | send-marker-prize-email, send-final-shoot-winner-email (già presenti; SMTP denomailer, From/CC contact@m1ssion.com). |

---

## FASE 2 — Design (già implementato)

- **Pattern:** DB trigger → INSERT in `email_sends` (queue) → `net.http_post` (pg_net) verso Edge Function.
- **Tabelle:** `email_sends`, `email_send_config` (base_url, auth_token per Bearer).
- **Idempotenza:** Una riga per evento (una INSERT = un record email_sends = una chiamata Edge). Non si invia due volte per lo stesso INSERT; eventuali duplicati andrebbero gestiti a livello di business (es. un solo premio fisico per marker, un solo vincitore per missione).

---

## FASE 3 — Implementazione (stato attuale)

L’implementazione è **già presente** nel repo:

1. **Migrations**
   - `20260224140000_email_sends.sql` — tabelle `email_sends` e `email_send_config`
   - `20260224140001_triggers_email_final_shoot.sql` — trigger su `final_shoot_winners`
   - `20260224140002_triggers_email_marker_physical_prize.sql` — trigger su `prize_claims`

2. **Edge Functions**
   - `supabase/functions/send-final-shoot-winner-email/index.ts` — SMTP, From/CC contact@, auth Bearer
   - `supabase/functions/send-marker-prize-email/index.ts` — SMTP, From/CC contact@, auth Bearer

**Cosa fare per andare in produzione:**

1. Applicare le migrations (se non già applicate) sul progetto Supabase.
2. Valorizzare `email_send_config`: `base_url` = URL progetto (es. `https://<ref>.supabase.co`), `auth_token` = valore di `EMAIL_INVOKE_SECRET` (o service_role per test).
3. Deploy delle Edge `send-final-shoot-winner-email` e `send-marker-prize-email`.
4. Verificare che l’estensione **pg_net** sia abilitata (usata dai trigger).

Se la tabella **prize_claims** non esiste in un ambiente, creare prima una migration minima che la definisca (id, user_id, marker_id, prize_name, prize_description, claim_code, status, claimed_at, ecc.) e poi applicare `20260224140002`.

---

## FASE 4 — Test (istruzioni)

### 4.1 — Test Edge da Dashboard (service_role / EMAIL_INVOKE_SECRET)

**send-final-shoot-winner-email**

- URL: `POST .../functions/v1/send-final-shoot-winner-email`
- Header: `Authorization: Bearer <EMAIL_INVOKE_SECRET>`
- Body (sostituire con user_id reale e email_send_id da riga in email_sends):

```json
{
  "user_id": "<UUID_UTENTE>",
  "mission_id": "<UUID_MISSIONE>",
  "won_at": "2026-02-20T12:00:00Z",
  "email_send_id": "<UUID_DA_email_sends>"
}
```

**send-marker-prize-email**

- URL: `POST .../functions/v1/send-marker-prize-email`
- Header: `Authorization: Bearer <EMAIL_INVOKE_SECRET>`
- Body:

```json
{
  "user_id": "<UUID_UTENTE>",
  "prize_claim_id": "<UUID_DA_prize_claims>",
  "email_send_id": "<UUID_DA_email_sends>"
}
```

Verifica: email arrivata su indirizzo utente con From e CC = contact@m1ssion.com.

### 4.2 — Test end-to-end DB

- **Evento B:** Eseguire un Final Shoot che assegna il vincitore (RPC `execute_final_shoot`) → controllare `email_sends` (nuova riga template_id=final_shoot_winner, status sent/queued/failed) e inbox utente.
- **Evento A:** Claim marker con reward tipo `physical_prize` (via app o invocando claim-marker-reward con marker che ha physical_prize) → controllare `email_sends` (template_id=marker_physical_prize) e inbox.

### 4.3 — Anti-duplica

- Ripetere lo stesso claim o lo stesso Final Shoot (stesso marker / stessa missione già vinta); non deve essere creata una seconda riga “vincitore” o “claim” se la logica business lo impedisce; se invece si inserisce di nuovo in prize_claims/final_shoot_winners, partirà una seconda email (una INSERT = una email). Idempotenza è garantita a livello di “un record email_sends per INSERT”.

---

## Schema trigger (riferimento)

```
INSERT final_shoot_winners
  → trigger_email_final_shoot_winner
  → queue_and_invoke_final_shoot_winner_email()
  → INSERT email_sends (template_id='final_shoot_winner')
  → net.http_post(send-final-shoot-winner-email)

INSERT prize_claims
  → trigger_email_marker_physical_prize
  → queue_and_invoke_marker_prize_email()
  → INSERT email_sends (template_id='marker_physical_prize')
  → net.http_post(send-marker-prize-email)
```

---

## Vincoli rispettati

- Nessun provider nuovo (solo SMTP IONOS / denomailer).
- Nessuna modifica a src/, Final Shoot flow (logica RPC), Buzz, IAP, Push iOS.
- From/CC: contact@m1ssion.com.
- Log senza PII (email mascherata nelle due Edge).
- Invio solo server-side (trigger + pg_net), nessuna chiamata email dal client iOS.
