# Phase 4 — Email provider forensics (read-only)

**Progetto:** lux-hunt-treasure  
**Data:** 2026-02-24  
**Scope:** Identificare il provider email già implementato. NON usare Mailjet. NON introdurre provider nuovi.

---

## 1) Edge Functions dedicate a invio email

| Function | Scopo | Provider usato |
|----------|--------|-----------------|
| **send-welcome-email** | Email benvenuto agente (agentCode) | SMTP (denomailer) |
| **send-contact-email** | Form contatto + auto-reply | SMTP (denomailer) |
| **send-auto-reply** | Auto-risposta | SMTP (denomailer) |
| **send-mailjet-email** | Contatto / form (Mailjet) | Mailjet |
| **send-registration-email** | Pre-registrazione / agente | Mailjet |
| **send-mailjet-campaign** | Campagne | Mailjet |
| **send-agent-confirmation** | Conferma agente | Mailjet |
| **send-email** | Welcome / notification generico | Resend |
| **send-pre-registration-email** | Pre-registrazione | Resend |

---

## 2) Provider già configurati

| Provider | Dove vive | Come si invoca |
|----------|-----------|-----------------|
| **SMTP (IONOS)** | send-welcome-email, send-contact-email, send-auto-reply | `SMTPClient` da `deno.land/x/denomailer@1.6.0`. Config: hostname, port, tls, auth (username, password). `client.send({ from, to, subject, content, html, replyTo })`. Supporta anche `cc`. |
| **Mailjet** | send-mailjet-email, send-registration-email, send-mailjet-campaign, send-agent-confirmation | API REST `https://api.mailjet.com/v3.1/send` con Basic auth. **NON usare per Phase 4 (vincolo utente).** |
| **Resend** | send-email, send-pre-registration-email | SDK `Resend` (npm:resend@2.0.0), `resend.emails.send()`. From in codice è `onboarding@resend.dev`. |

---

## 3) Env variables (solo nomi, non valori)

**SMTP (provider da usare per Phase 4):**
- `SMTP_HOST` (default: smtp.ionos.it)
- `SMTP_PORT` (default: 465)
- `SMTP_USER` (default: contact@m1ssion.com)
- `SMTP_PASSWORD` (obbligatorio)

**Opzionali già citati in altre function:**
- `CONTACT_EMAIL` (default: contact@m1ssion.com)
- `NOREPLY_EMAIL` (default: noreply@m1ssion.com)

**Mailjet (NON usare):**
- `MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE`
- `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`

**Resend (alternativa esistente):**
- `RESEND_API_KEY`

---

## 4) Conclusione

- **Provider esistente da usare per Phase 4 (backend-only, From/CC contact@m1ssion.com):** **SMTP (IONOS)** tramite denomailer, già usato da send-welcome-email e send-contact-email con `SMTP_USER` = contact@m1ssion.com.
- **Mailjet:** presente ma **non usato** per Phase 4 (vincolo).
- **Resend:** presente; From in send-email è dominio Resend, non contact@m1ssion.com; per coerenza con From/CC obbligatori si usa SMTP.

**Implementazione Phase 4:** le Edge send-final-shoot-winner-email e send-marker-prize-email **usano SMTP (denomailer)** con le stesse env `SMTP_*` e From/CC contact@m1ssion.com. Mailjet non è usato (vincolo rispettato).

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
