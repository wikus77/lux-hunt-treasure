# Hardening Phase 3 — Verifica Push 401 + Antifraud evidence

**Data:** 2026-02-24  
**Scope:** Solo verifiche e config Supabase (Dashboard / SQL Editor). Nessuna modifica a codice, migrations, src/, altre Edge, terminale.

---

## Phase 1 — Root cause Push 401 (read-only)

### 1.1 Dashboard — Secret PUSH_ADMIN_TOKEN

**Azione:** Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets** (o **Settings** → **Secrets**).

- Verificare se esiste la chiave **PUSH_ADMIN_TOKEN**.
- **Stato:** _[compilare: PRESENTE / MANCANTE]_
- **Nota:** il valore del token non va mai loggato né riportato in output.

### 1.2 Codice (verifica read-only)

| Function | Comportamento |
|----------|----------------|
| **claim-marker-reward** | Invia header `x-admin-token` = `Deno.env.get('PUSH_ADMIN_TOKEN') \|\| service` (SERVICE_ROLE_KEY se secret assente). |
| **webpush-targeted-send** | Legge `x-admin-token` e confronta con `Deno.env.get("PUSH_ADMIN_TOKEN")`; entrambi trimmati (`.trim()`); se `!adminHdr \|\| !ADMIN \|\| adminHdr !== ADMIN` → 401. |

**Conclusione:** Se **PUSH_ADMIN_TOKEN** non è impostato in Edge Secrets, `webpush-targeted-send` ha `ADMIN === ""` e ritorna sempre 401. Stesso project e stesso secret per entrambe le function; confronto esatto `header === env` (con trim lato webpush). Nessun trim lato claim-marker-reward sull’invio; se il secret non ha spazi leading/trailing non c’è mismatch.

---

## Phase 2 — Fix config (solo Dashboard, no codice, no terminale)

Se **PUSH_ADMIN_TOKEN** mancava o era diverso:

1. Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**.
2. Aggiungere o modificare **PUSH_ADMIN_TOKEN** con un valore forte (es. stringa random lunga). **Non stampare il valore.**
3. I secret sono letti a runtime; in genere non serve redeploy. Se la dashboard richiede “Save” o “Redeploy”, usare solo la dashboard (nessun comando da terminale).

**Azione eseguita:** _[compilare: es. “Impostato PUSH_ADMIN_TOKEN (nuovo secret)” / “Verificato presente, nessuna modifica”]_

---

## Phase 3 — Verifica successo push

1. Eseguire un **claim marker** dall’app (iOS o altro client).
2. Controllare i **log** di **claim-marker-reward** (Supabase → Edge Functions → claim-marker-reward → Logs).

**Evidenza log attesa:** deve comparire una riga:
```text
M1QR-TRACE: Push sent - status:200 (OK)
```
oppure `status:204 (OK)`.

**Evidenza log (incolla qui solo la riga di log):**
```text
_[incollare la riga di log con status 200 o 204]_
```

Se ancora **401:**
- Confermare che **webpush-targeted-send** e **claim-marker-reward** usano lo stesso project (stessi Edge Secrets).
- Confermare che il confronto sia esattamente header ricevuto (trim) === env token (trim); nessun carattere extra nel secret in dashboard.

---

## Phase 4 — Antifraud log evidence

### 4.1 Tabella esiste

Eseguire in **SQL Editor** (Supabase Dashboard):

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'antifraud_log'
) AS table_exists;
```

**Risultato:** `table_exists` = _[true / false]_

### 4.2 Righe dopo un claim marker

Dopo almeno un claim marker, eseguire:

```sql
SELECT event_type, user_id, marker_id, request_id, created_at
FROM public.antifraud_log
ORDER BY created_at DESC
LIMIT 10;
```

**Numero righe trovate:** _[N]_

**Sample (1–3 righe; anonimizzare user_id se necessario, es. ultimi 4 caratteri):**

| event_type   | user_id (anon.) | marker_id | request_id | created_at          |
|-------------|------------------|-----------|------------|----------------------|
| marker_claim | …xxxx            | …         | …          | 2026-02-24 HH:MM:SS  |

_(sostituire con risultato reale; per user_id si può riportare solo suffix tipo `...a1b2c3d4`.)_

---

## Checklist vincoli (conferma no scope drift)

| Vincolo | Conferma |
|---------|----------|
| Flusso Final Shoot (RPC/UI/logica/return/pricing) | **NON TOCCATO** |
| Flusso Buzz e Buzz Map | **NON TOCCATO** |
| Pagamenti IAP | **NON TOCCATO** |
| Push native iOS (APNs/Capacitor) | **NON TOCCATO** |
| UI/design e file in src/ | **NON TOCCATI** |
| Supabase migrations / SQL / schema / RPC | **NON MODIFICATI** (solo query di lettura in SQL Editor) |
| Altre Edge Functions | **NON TOCCATE** |
| Comandi terminale | **NON USATI** (solo istruzioni Dashboard / SQL Editor) |

**Stop condition:** Per sistemare il 401 non è stato modificato codice, schema, migrations né altre function; solo config (secret) in Dashboard. Se in futuro il 401 persistesse con secret impostato, la causa andrebbe indagata (stesso project, stesso secret, trim) senza cambiare scope.

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
