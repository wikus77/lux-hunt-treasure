# INCIDENT REPORT — Email "Premio Fisico" non arriva (POST 400 su send-marker-prize-email)

**Data:** 2026-02-26  
**Firma:** Lovable Agent JLENIA  
**Scope:** `send-marker-prize-email` Edge + (solo se necessario) trigger SQL

---

## 1) Root cause del 400 (riga/codice preciso + motivo)

- **File:** `supabase/functions/send-marker-prize-email/index.ts`
- **Causa:** L’unico punto in cui la funzione restituisce **400** è la validazione del body: mancanza di `user_id` o di `email_send_id`.
- **Codice originale (pre-fix):**
  - `body = await req.json().catch(() => ({}));`
  - `user_id = body?.user_id;` `email_send_id = body?.email_send_id;`
  - `if (!user_id || !email_send_id) return new Response(..., { status: 400 })` con messaggio `"missing user_id or email_send_id"`.

**Perché in prod si vede 400 con chiamante `pg_net/0.14.0`:**
- Il trigger DB (`send_marker_prize_email_now`) in repo invia `user_id`, `prize_claim_id`, `email_send_id` (migrations 20260225120000 / 20260226120000). In produzione può succedere che:
  1. **Body vuoto o non parsabile** → `req.json()` fallisce, `.catch(() => ({}))` restituisce `{}` → `user_id` e `email_send_id` undefined → 400.
  2. **Payload con chiavi diverse** (es. solo `claim_id` invece di `prize_claim_id`, o `email_send_id` assente in una versione vecchia del trigger) → stessi campi mancanti → 400.

**Decision gate:** **FIX A (body incompleto / mismatch)** + **FIX C (parsing JSON resiliente)**.

---

## 2) Patch minima applicata

**Solo file modificato:** `supabase/functions/send-marker-prize-email/index.ts`.

### Modifiche (riassunto)

1. **Auth:** Aggiunto log `EMAIL_PIPELINE: auth failed` in caso di 401.
2. **Parsing body (FIX C):**
   - Body letto con `await req.text()` e poi `JSON.parse(raw)` in try/catch.
   - Se body vuoto → 400 con `error: "invalid_json", message: "empty body"` e log `EMAIL_PIPELINE: missing fields (empty body)` con `content-type` e `contentLength`.
   - Se JSON non valido → 400 con `error: "invalid_json", message: "body is not valid JSON"` e log `EMAIL_PIPELINE: invalid_json` con `content-type`.
3. **Body compatibile con trigger (FIX A):**
   - `user_id` obbligatorio; se manca → 400 e log `EMAIL_PIPELINE: missing fields: user_id required`.
   - `prize_claim_id` accettato anche come `claim_id` (alias): `prize_claim_id = body?.prize_claim_id ?? body?.claim_id`.
   - Se manca `email_send_id` ma sono presenti `user_id` e `prize_claim_id`/`claim_id` → la Edge **crea** una riga in `email_sends` (insert con `template_id: "marker_physical_prize"`, `recipient_user_id`, `related_type: "prize_claim"`, `related_id: prize_claim_id`, `status: "queued"`) e usa l’`id` restituito come `email_send_id`.
   - Se dopo questo step `email_send_id` è ancora assente → 400 e log `EMAIL_PIPELINE: missing fields: email_send_id required and could not be created`.
4. **Log EMAIL_PIPELINE (FASE 3):**
   - `EMAIL_PIPELINE: accepted request` quando `email_send_id` era già nel body.
   - `EMAIL_PIPELINE: accepted request (email_send_id created server-side)` quando creato dalla Edge.
   - `EMAIL_PIPELINE: provider response: sent` in caso invio SMTP ok.
   - `EMAIL_PIPELINE: provider response: smtp_error` + messaggio in caso errore SMTP.

**Nessuna modifica a:** trigger SQL, iOS, altre Edge, claim-marker-reward.

---

## 3) Rollback (FASE 0)

- **Tag:** `rollback/send-marker-prize-email-pre-400fix-20260226-0634`
- **Backup:** `reports/rollback/send-marker-prize-email.index.ts.pre-400fix.20260226-0634.bak`

**Rollback istantaneo:** ripristinare il file dalla copia `.bak` (o dal tag), poi redeploy della sola funzione `send-marker-prize-email`.

---

## 4) Verifica post-deploy (FASE 4)

1. Triggerare **un solo** evento premio fisico (claim da app).
2. In Supabase Dashboard → Edge `send-marker-prize-email`:
   - **Status** della chiamata POST deve essere **200** (o 202 se in futuro si usa async).
   - **Log:** devono comparire `EMAIL_PIPELINE: accepted request` (o `... created server-side`) e `EMAIL_PIPELINE: provider response: sent` (o `smtp_error` con messaggio).
3. Controllare la casella email (anche spam) per la mail “Richiesta premio fisico ricevuta”.

Se qualcosa va storto: usare il rollback sopra e ri-deployare solo `send-marker-prize-email`.

---

## 5) Evidenza attesa (deliverable)

- Invocazione **200** (non più 400) per la POST da pg_net.
- Log con “accepted request” e “provider response: sent” (o errore provider esplicito).
- Email premio fisico ricevuta (o errore SMTP chiaro nei log).

Fine report.
