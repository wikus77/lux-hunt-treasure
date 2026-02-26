# send-welcome-email — Incident Report (SMTP IONOS)

**© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™**

---

## FASE 0 — Safety / Rollback

- **Branch:** `incident/send-welcome-email-smtp-check`
- **Tag rollback:** `rollback/pre-send-welcome-email-incident`
- Modifiche ammesse solo in: `supabase/functions/send-welcome-email/index.ts` (+ eventuale file di test locale, no `src/`).

---

## FASE 1 — Forensics (read-only)

### 1.1 — Dashboard (da verificare manualmente)

| Controllo | Dove | Cosa segnare |
|-----------|------|----------------|
| Verify JWT | Supabase Dashboard → Edge Functions → send-welcome-email | ON / OFF |
| Ultime invocations | Stesso pannello → Invocations | Status code (401 / 400 / 500) e body |

- **Se 401:** Verify JWT probabilmente ON e chiamata senza JWT valido (o JWT non inviato).
- **Se 400:** Payload mancante o campi `to` / `agentCode` assenti.
- **Se 500:** Errore interno (SMTP, env, runtime); vedi log Edge.

### 1.2 — Codice: punti di fallimento

| Elemento | Valore / comportamento |
|----------|-------------------------|
| **Import std** | `https://deno.land/std@0.190.0/http/server.ts` |
| **Import denomailer** | `https://deno.land/x/denomailer@1.6.0/mod.ts` |
| **Env letti** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_EMAIL` (solo per replyTo) |
| **Log "SMTP Configuration"** | Sì — logga `host`, `port`, `authUser`, `fromEmail`. **authUser = email (PII)**. |
| **Log PII** | Sì — riga ~90: `to` e `agentCode` in chiaro; riga ~130: `to` in chiaro. |
| **Validazione input** | `to` e `agentCode` obbligatori; `fullName` opzionale. |
| **Auth nella function** | Nessun controllo su `Authorization`; l’unica auth è **Verify JWT** (Dashboard) se attivo. |
| **Errore SMTP** | Catch logga `emailError` intero; risposta 500 include `error.message` e **error.stack** (rischio perdita segreti). |

Punti dove può “rompersi”:

1. **Prima del handler:** Verify JWT ON → richiesta senza JWT valido → 401 da Supabase (la function non viene eseguita).
2. **Parsing body:** JSON non valido → 400.
3. **Campi mancanti:** `!to || !agentCode` → 400.
4. **SMTP_PASSWORD mancante:** throw → 500.
5. **SMTP connect/send:** credenziali/porta/TLS/IONOS → eccezione → 500; stack in risposta e in log.

### 1.3 — Secrets (solo presenza, da Dashboard)

Da **Project Settings → Edge Functions → Secrets** verificare presenza (non valore):

- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASSWORD`
- [ ] `CONTACT_EMAIL` (opzionale; default `contact@m1ssion.com`)

---

## FASE 2 — Test invocation “come produzione”

### 2.1 — Da Dashboard (preferito)

- Edge Functions → **send-welcome-email** → tab **Invocations** / **Test**.
- Body:

```json
{
  "to": "contact@m1ssion.com",
  "fullName": "Joseph",
  "agentCode": "TEST-IONOS-001"
}
```

- Se c’è opzione auth, usare quella prevista (es. JWT da progetto).

### 2.2 — Da CLI (senza header custom)

```bash
supabase functions list
supabase functions invoke send-welcome-email --body '{"to":"contact@m1ssion.com","fullName":"Joseph","agentCode":"TEST-IONOS-001"}'
```

- Se la CLI non supporta `--header`, l’auth dipende da Verify JWT e da come la CLI invia la richiesta (es. anon key in header se configurata).

### Risultato atteso

- **200** + body con `success: true` → controllare inbox (e spam) su contact@m1ssion.com.
- **401** → Caso A (JWT).
- **400** → Caso B (payload).
- **500** → Caso C o D; leggere log Edge (dopo patch: nessun PII, nessun stack con segreti).

---

## FASE 3 — Root cause matrix

| Caso | Sintomo | Probabile causa | Azione |
|------|---------|-----------------|--------|
| **A** | 401 Unauthorized | Verify JWT ON e chiamata senza JWT valido (o header sbagliato). | Verificare in Dashboard se “Verify JWT” è ON; in caso affermativo chiamare con JWT valido (anon key o service role) oppure disattivare Verify JWT per questa function se previsto dalla policy. |
| **B** | 400 Bad Request | Mancano `to` o `agentCode` nel body. | Usare payload di test completo (sopra). |
| **C** | 500 / smtp_error o connection fail | `SMTP_PASSWORD` assente/errato; porta/TLS (465 = TLS ok); IONOS blocca o credenziali scadute. | Controllare secrets; nei log Edge (dopo patch) cercare solo codice/tipo errore SMTP, senza PII né segreti. |
| **D** | 200 OK ma email non arriva | Spam/quarantine; From `noreply@` non autorizzato su IONOS; IONOS accetta ma non consegna. | Controllare spam; verificare su IONOS che l’invio da noreply@ (o dall’account usato) sia consentito; eventuale log Message-ID senza PII. |

---

## FASE 4 — Patch minima applicata

Applicata **solo** a `supabase/functions/send-welcome-email/index.ts`:

1. **Nessun PII in log:** introdotta `maskEmail(to)` → log in formato `j***@m1ssion.com`; richiesta loggata con `to` mascherato e `agentCode` come `***`; rimosso `authUser` dal log “SMTP Configuration”; “Sending welcome email to” usa `maskEmail(to)`.
2. **Errore SMTP sicuro:** in catch SMTP si logga solo `msg.slice(0, 200)` (nessuno stack); in catch generico si logga solo messaggio sanitizzato; risposta 500 **non** include più `error.stack` né `errorDetails` (solo `message` generico).

**File toccati:** solo `supabase/functions/send-welcome-email/index.ts` e `reports/SEND_WELCOME_EMAIL_INCIDENT_REPORT.md`.

---

## Output richiesto — Checklist

- [ ] **Report:** Verify JWT (ON/OFF), secrets present/missing, risultato invocation (status + body), root cause (A/B/C/D).
- [ ] **Patch:** Solo 1 file (`send-welcome-email/index.ts`), motivazione in report.
- [ ] **Prova invio:** Log “✅ Welcome email sent successfully!” oppure errore SMTP classificato (senza PII).
- [ ] **Vincoli:** Nessun Mailjet, nessun provider nuovo; non toccati `src/`, Final Shoot, Buzz, IAP, Push iOS.

---

## Payload test

- **Recipient:** contact@m1ssion.com  
- **Body:**

```json
{
  "to": "contact@m1ssion.com",
  "fullName": "Joseph",
  "agentCode": "TEST-IONOS-001"
}
```

---

## INCIDENT ADDENDUM — 401 + Test con JWT utente

*Verifica Verify JWT + invio 1 mail di test con JWT utente. Nessun Mailjet, nessuna nuova Edge Function, nessun log di token/email in chiaro.*

### FASE 1 — Prova oggettiva (Dashboard)

**Nota:** Cursor non può aprire la Dashboard Supabase. Esegui tu i passi sotto e compila la tabella.

1. Apri **Supabase Dashboard** → **Edge Functions** → **send-welcome-email**.
2. Compila e riporta:

| Campo | Valore da riportare |
|-------|---------------------|
| **Verify JWT** | ON / OFF |
| **Invocation 1** | Status: ___ | Body (se visibile): ___ |
| **Invocation 2** | Status: ___ | Body (se visibile): ___ |
| **Invocation 3** | Status: ___ | Body (se visibile): ___ |
| **Logs** | La function viene eseguita (log visibili) SÌ / NO. Se 401: di solito nessun log (blocco prima del handler). |

---

### FASE 2 — Test invio con JWT utente (nessuna modifica codice)

**Se Verify JWT è ON:** la chiamata deve usare un **access token** di un utente loggato (non anon key, non service_role).

1. **Recupera l’access token**
   - Dall’app: sessione Supabase (es. `supabase.auth.getSession()` → `session.access_token`).
   - Oppure da Supabase Dashboard → Authentication → Users → (utente) → non è possibile copiare il token da lì; serve dall’app o da uno script che fa `signIn` e stampa il token.

2. **Chiamata HTTP** (da terminale o Postman)

   Sostituisci `<ACCESS_TOKEN_UTENTE>` con il token reale.

```bash
curl -s -w "\n\nHTTP_STATUS:%{http_code}\n" -X POST \
  "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/send-welcome-email" \
  -H "Authorization: Bearer <ACCESS_TOKEN_UTENTE>" \
  -H "Content-Type: application/json" \
  -d '{"to":"contact@m1ssion.com","fullName":"Joseph","agentCode":"TEST-IONOS-001"}'
```

3. **Riporta**
   - HTTP status (es. 200, 401, 400, 500).
   - Body della response (senza incollare il token).
   - Se nei log Edge compaiono righe della function (es. "📧 Welcome email request", "📮 SMTP Configuration", "✅ Welcome email sent successfully!" o "❌ SMTP error").
   - Se l’email è arrivata su contact@m1ssion.com (inbox o spam).

---

### FASE 3 — Diagnosi

In base al risultato del test, classifica:

| Caso | Condizione | Diagnosi |
|------|------------|----------|
| **A** | Status **401** | Request non autenticata: JWT mancante, scaduto o errato; oppure Verify JWT blocca prima del handler. **Azione:** usare access token utente valido (da sessione app) e riprovare. |
| **B** | Status **400** | Body o campi invalidi (mancano `to` o `agentCode`). **Azione:** verificare JSON e payload sopra. |
| **C** | Status **500** | SMTP / env / IONOS. **Azione:** in Dashboard controllare solo presenza secret (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD); nei log cercare "❌ SMTP error (no PII):" e riportare solo il messaggio (senza PII). |
| **D** | Status **200** ma email non arriva | Spam/quarantine o From non autorizzato su IONOS. **Azione:** controllare spam; verificare su IONOS invio da noreply@ / account configurato. |

---

### Vincoli rispettati

- Nessun Mailjet, nessun provider nuovo.
- Nessuna nuova Edge Function per test.
- Nessun log di token o email in chiaro (la patch già applicata maschera le email nei log).
