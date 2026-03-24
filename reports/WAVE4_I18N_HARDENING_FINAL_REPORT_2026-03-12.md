# Wave 4 i18n Hardening — Final Report (Register + Email Verification Flow)

**Data:** 2026-03-12  
**Branch:** `feat/pe-global-fullscreen-reward`  
**Scope:** Solo Register.tsx, EmailVerificationFlow.tsx e chiavi in common.json (en/it/fr). Zero refactor logico, zero modifiche a auth/redirect/session.

---

## 1. Safety

| Elemento | Valore |
|----------|--------|
| Branch iniziale | `feat/pe-global-fullscreen-reward` |
| HEAD iniziale | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Safety branch | `safety/i18n-wave4-pre` (creato) |
| Safety tag | `safety/i18n-wave4-pre` (creato) |

**Comandi rollback (ripristino stato pre–Wave 4):**
```bash
git checkout feat/pe-global-fullscreen-reward
git reset --hard safety/i18n-wave4-pre
# oppure
git checkout safety/i18n-wave4-pre
```

---

## 2. Verifica pre-patch

### Perimetro primario

- **`src/pages/Register.tsx`** — Titolo/sottotitolo (M1SSION™ lasciato invariato), “Unisciti agli agenti”, indicatore missione (“Missione selezionata:”, “UOMO”/“DONNA”), “Cambia preferenza”, link “Hai già un account? Accedi”, footer termini (“Registrandoti accetti i”, “Termini di Servizio”, “e la”, “Privacy Policy”). Nessuna logica toccata (useEffect, navigate, preferenza, form).
- **`src/components/EmailVerificationFlow.tsx`** — Titolo dialog, toast (successo verifica, errore invio, successo reinvio, errore operazione), stati verificata/pending (titoli, descrizioni, badge), istruzioni (3 step), pulsanti “Controlla Stato” / “Inviando...” / “Reinvia tra {{time}}” / “Reinvia Email”, “Ultima email inviata: {{time}}”, help (“Non ricevi l’email?” + 4 punti), footer. Nessuna modifica a checkVerificationStatus, resendVerificationEmail, useEffect, supabase.auth, onVerified, onOpenChange.

### Perimetro escluso

- **`src/components/auth/registration-form`** (RegistrationForm): non toccato. Contiene altri testi utente (label, placeholder, validazioni); candidato per wave successiva.
- Auth flow, redirect, session, Supabase auth, token, storage, IAP, BUZZ, BUZZ MAP, push, routing: **nessun file modificato**.

### Hardcoded trovati (sostituiti)

- **Register:** register_subtitle, register_mission_selected, register_mission_man, register_mission_woman, register_change_preference, register_already_have_account, register_terms_intro, register_terms_link, register_terms_and, register_privacy_link.
- **EmailVerificationFlow:** email_verification_title, 4 toast, verified_title/desc, badge_secure, pending_title, pending_sent_to, badge_required, how_to_title, step1/2/3, btn_check, btn_sending, resend_in ({{time}}), btn_resend, last_sent ({{time}}), help_title, help_1/2/3/4, footer.

### Chiavi esistenti riusabili

- Nessuna chiave `register_*` o `email_verification_*` presente in common prima della patch. Chiavi `auth_*` esistenti sono per login/form login, non riusate per Register/EmailVerification.

### Nuove chiavi necessarie (aggiunte)

- 10 chiavi `register_*`.
- 28 chiavi `email_verification_*` (inclusi interpolazioni `{{time}}` dove necessario).

Tutte aggiunte in en, it, fr.

### Motivazione “patch safe”

- Solo sostituzione stringhe con `t(...)` e aggiunta chiavi in common.json.
- Nessun cambiamento a handler, callback, submit, redirect, useEffect, condizioni, supabase.auth, logica verifica email o registrazione.
- Brand M1SSION™ lasciato invariato nel titolo Register.
- Blast radius: 5 file (2 componenti + 3 common.json).

---

## 3. File modificati

| File | Modifica |
|------|----------|
| `src/locales/en/common.json` | Aggiunto blocco register_* e email_verification_* |
| `src/locales/it/common.json` | Aggiunto blocco register_* e email_verification_* |
| `src/locales/fr/common.json` | Aggiunto blocco register_* e email_verification_* |
| `src/pages/Register.tsx` | useTranslation + sostituzione 10 stringhe con t(...) |
| `src/components/EmailVerificationFlow.tsx` | useTranslation + sostituzione toast, titoli, descrizioni, pulsanti, help, footer con t(...) |

Nessun altro file toccato.

---

## 4. Chiavi i18n

- **Aggiunte (en/it/fr):** 10 `register_*` + 28 `email_verification_*` (totale 38 nuove chiavi).
- **Riusate:** nessuna.

---

## 5. Verifica post-patch

| Verifica | Esito |
|----------|--------|
| File fuori scope toccati? | **No** — solo Register, EmailVerificationFlow, 3 common.json |
| Logica BUZZ toccata? | **No** |
| Logica BUZZ MAP toccata? | **No** |
| Auth toccata? | **No** — solo testi, nessun handler/redirect/session |
| IAP toccati? | **No** |
| Push toccate? | **No** |
| Routing toccato? | **No** |
| Chiavi usate presenti in en/it/fr? | **Sì** — script Python: missing = none per tutte e tre le lingue |

---

## 6. Build

| Comando | Esito |
|---------|--------|
| `npm run build` | **OK** (exit code 0, ~3m 33s) |

Verifica TypeScript: `npx tsc --noEmit` **OK** (exit 0).

---

## 7. Cap sync iOS

| Comando | Esito |
|---------|--------|
| `npx cap sync ios` | **OK** (web assets copiati, plugin aggiornati) |

---

## 8. Rischio regressione

- **Livello:** **Basso**
- **Motivazione:** Modifiche limitate a stringhe utente sostituite con `t(...)`. Nessun refactor, nessun cambio a flussi auth, verifica email, registrazione, redirect o session. Comportamento identico; unica differenza è la lingua dei testi in base a i18next.

---

## 9. Verdetto finale

**GO** per Wave 5. Wave 4 completata con successo: patch solo in scope, nessuna regressione, build e cap sync ios OK. Procedere con wave successive quando richiesto.

---

## 10. Step successivo consigliato

- **Wave 5 possibile:** portare in i18n **RegistrationForm** (componente usato da Register.tsx): label, placeholder, messaggi di validazione, CTA submit, eventuali toast. File candidato: `src/components/auth/registration-form` (o percorso reale del componente). Non toccato in Wave 4 per mantenere scope minimo.
- **Altri candidati (senza applicare):** altri flussi auth/secondari con stringhe utente (es. reset password, access blocked) da valutare in wave dedicate.
- **Cosa NON toccare ancora:** logica auth, Supabase auth, redirect post-registrazione/post-verifica, session, IAP, BUZZ, BUZZ MAP, push, routing, delete account, wallet, mappe, notifiche.
