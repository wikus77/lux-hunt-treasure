# SMTP Test Email — Auth Fix & Test Endpoint Report

**© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™**

---

## 1. Cosa era rotto

- **JWT vs secret raw:** La function confrontava il valore dell’header `Authorization: Bearer <token>` con `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`. Il chiamante inviava un JWT (es. anon/key di Supabase), mentre il codice si aspettava la chiave segreta raw (stringa).
- **Env non disponibile:** `SUPABASE_SERVICE_ROLE_KEY` spesso non è esposta come variabile d’ambiente alle Edge Functions in produzione, quindi il confronto falliva sempre → risposta `{"success":false,"error":"Unauthorized"}`.

---

## 2. Fix minimo applicato

- **Secret dedicato:** Autorizzazione basata su **`SMTP_TEST_SECRET`** (env dedicata alla function).
- **Regola auth:** Si accetta solo `Authorization: Bearer <token>` dove `<token>` deve essere **identico** a `Deno.env.get("SMTP_TEST_SECRET")` (trim). Se manca header, secret o non combaciano → **401 Unauthorized**.
- **Nessun JWT**, nessun uso di `SUPABASE_SERVICE_ROLE_KEY` per questo endpoint.
- Comportamento SMTP (denomailer, From/To/CC, subject, body con timestamp) invariato. Nessun log di token o email in chiaro.

---

## 3. File toccati

| File | Modifica |
|------|----------|
| `supabase/functions/smtp-test-email/index.ts` | Solo logica auth: confronto Bearer con `SMTP_TEST_SECRET` |
| `reports/SMTP_TEST_EMAIL_REPORT.md` | Creato (questo report) |

Nessun altro file modificato (no `src/`, no RPC, no migrations, no altre Edge functions).

---

## 4. Istruzioni di test (senza comandi terminale)

1. **Secrets (Dashboard Supabase)**  
   Impostare per la function `smtp-test-email`:
   - `SMTP_HOST` (opzionale, default ok)
   - `SMTP_PORT` (opzionale, default ok)
   - `SMTP_USER` = `contact@m1ssion.com`
   - `SMTP_PASSWORD` (obbligatorio)
   - **`SMTP_TEST_SECRET`** = token forte scelto da te (non loggato mai)

2. **Invocazione**  
   Invocare l’endpoint Edge:
   - **URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/smtp-test-email`
   - **Method:** `POST`
   - **Header:** `Authorization: Bearer <SMTP_TEST_SECRET>`
   - **Body:** `{}` (o nessun body)

3. **Risultato atteso**  
   - **200** e `{"success":true}` → email di test inviata a contact@m1ssion.com (From/CC come da spec).
   - **401** e `{"success":false,"error":"Unauthorized"}` → token mancante o diverso da `SMTP_TEST_SECRET`.

---

## 5. Checklist vincoli rispettati

- [x] Solo SMTP (denomailer IONOS); nessun Mailjet né provider nuovi
- [x] Auth con `SMTP_TEST_SECRET`; nessun JWT, nessun uso di `SUPABASE_SERVICE_ROLE_KEY` per questo test
- [x] Nessun log di token o email in chiaro
- [x] From: "M1SSION™" &lt;contact@m1ssion.com&gt;; To e CC: contact@m1ssion.com
- [x] Subject: M1SSION™ — SMTP TEST OK; body testo con timestamp ISO
- [x] Modifiche limitate alla function `smtp-test-email` e a questo report
- [x] Non toccati: `src/`, Final Shoot flow, Buzz/Buzz Map, IAP, Push iOS, migrations/schema/RPC, altre Edge functions
