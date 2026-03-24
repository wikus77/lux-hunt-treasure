# Wave 5 i18n Hardening — Final Report (Registration Form only)

**Data:** 2026-03-12  
**Branch:** `feat/pe-global-fullscreen-reward`  
**Scope:** Solo il componente form di registrazione usato da Register.tsx + common.json (en/it/fr). Zero refactor logico, zero modifiche a auth/redirect/session.

---

## 1. Safety

| Elemento | Valore |
|----------|--------|
| Branch iniziale | `feat/pe-global-fullscreen-reward` |
| HEAD iniziale | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Safety branch | `safety/i18n-wave5-pre` (creato) |
| Safety tag | `safety/i18n-wave5-pre` (creato) |

**Comandi rollback (ripristino stato pre–Wave 5):**
```bash
git checkout feat/pe-global-fullscreen-reward
git reset --hard safety/i18n-wave5-pre
# oppure
git checkout safety/i18n-wave5-pre
```

---

## 2. Verifica pre-patch

### File reale individuato del RegistrationForm

- **`src/components/auth/registration-form.tsx`** — Import in Register.tsx: `import RegistrationForm from "@/components/auth/registration-form";`. Unico file del form in scope; nessun `RegistrationForm.tsx` in maiuscolo, nessun `registration-form/index.tsx`.

### Perimetro primario

- **`src/components/auth/registration-form.tsx`** — Label (Nome Agente, Email, Password, Conferma Password), placeholder (Il tuo nome, agente@example.com, ••••••••), CTA (“Registrazione...” / “Registrati”). Errori di validazione (`errors.name`, `errors.email`, ecc.) provengono da `useRegistration()`; **non in scope** (hook non toccato).
- **`src/locales/en/common.json`**, **`src/locales/it/common.json`**, **`src/locales/fr/common.json`** — Aggiunta sole chiavi necessarie per il form.

### Perimetro escluso

- **Register.tsx** — Non toccato (già localizzato in Wave 4).
- **EmailVerificationFlow.tsx** — Non toccato.
- **useRegistration** (hook) — Non toccato; i messaggi di errore mostrati nel form restano quelli restituiti dall’hook (candidato per wave successive se si vorranno localizzare).
- Auth flow, Supabase, redirect, session, IAP, BUZZ, BUZZ MAP, push, routing: **nessun file modificato**.

### Hardcoded trovati (sostituiti)

- Label: “Nome Agente”, “Email”, “Password”, “Conferma Password”.
- Placeholder: “Il tuo nome”, “agente@example.com”, “••••••••” (campo password e conferma).
- CTA: “Registrazione...”, “Registrati”.

### Chiavi esistenti riusabili

- **auth_label_email** — Riusata per label Email.
- **auth_label_password** — Riusata per label Password.

### Nuove chiavi necessarie (aggiunte)

- **register_form_label_name** — “Agent Name” / “Nome Agente” / “Nom d'agent”.
- **register_form_placeholder_name** — “Your name” / “Il tuo nome” / “Votre nom”.
- **register_form_placeholder_email** — “agent@example.com” (en/it), “agent@example.com” (fr).
- **register_form_placeholder_password** — “••••••••” (uguale in en/it/fr).
- **register_form_label_confirm_password** — “Confirm Password” / “Conferma Password” / “Confirmer le mot de passe”.
- **register_form_btn_submitting** — “Registering...” / “Registrazione...” / “Inscription...”.
- **register_form_btn_submit** — “Register” / “Registrati” / “S'inscrire”.

### Motivazione “patch safe”

- Solo sostituzione stringhe con `t(...)` e aggiunta chiavi in common.json.
- Nessun cambiamento a handler, handleSubmit, useRegistration, condizioni, validazione, redirect o auth.
- Blast radius: 4 file (1 componente + 3 common.json).

---

## 3. File modificati

| File | Modifica |
|------|----------|
| `src/locales/en/common.json` | Aggiunte 7 chiavi register_form_* |
| `src/locales/it/common.json` | Aggiunte 7 chiavi register_form_* |
| `src/locales/fr/common.json` | Aggiunte 7 chiavi register_form_* |
| `src/components/auth/registration-form.tsx` | useTranslation + sostituzione label, placeholder e CTA con t(...); riuso auth_label_email e auth_label_password |

Nessun altro file toccato (Register.tsx, EmailVerificationFlow.tsx, useRegistration, ecc. invariati).

---

## 4. Chiavi i18n

- **Aggiunte (en/it/fr):** 7 chiavi `register_form_*` (label_name, placeholder_name, placeholder_email, placeholder_password, label_confirm_password, btn_submitting, btn_submit).
- **Riusate:** auth_label_email, auth_label_password.

---

## 5. Verifica post-patch

| Verifica | Esito |
|----------|--------|
| File fuori scope toccati? | **No** — solo registration-form.tsx e 3 common.json |
| Logica BUZZ toccata? | **No** |
| Logica BUZZ MAP toccata? | **No** |
| Auth toccata? | **No** — solo testi nel form |
| IAP toccati? | **No** |
| Push toccate? | **No** |
| Routing toccato? | **No** |
| Register.tsx toccato? | **No** |
| EmailVerificationFlow.tsx toccato? | **No** |
| Chiavi usate presenti in en/it/fr? | **Sì** — script: missing = none per tutte e tre le lingue |

---

## 6. Build

| Comando | Esito |
|---------|--------|
| `npm run build` | **OK** (exit code 0, ~3m 14s) |

---

## 7. TypeScript

| Comando | Esito |
|---------|--------|
| `npx tsc --noEmit` | **OK** (exit code 0) |

---

## 8. Cap sync iOS

| Comando | Esito |
|---------|--------|
| `npx cap sync ios` | **OK** (web assets copiati, plugin aggiornati) |

---

## 9. Rischio regressione

- **Livello:** **Basso**
- **Motivazione:** Modifiche limitate a stringhe utente nel form sostituite con `t(...)`. Nessun refactor, nessun cambio a useRegistration, handleSubmit, validazione o redirect. Comportamento identico; unica differenza è la lingua di label, placeholder e CTA.

---

## 10. Verdetto finale

**GO** per la fase successiva. Wave 5 completata con successo: patch solo in scope (RegistrationForm + common.json), nessuna regressione, build OK, tsc OK, cap sync ios OK. Procedere con wave successive quando richiesto.

---

## 11. Step successivo consigliato

- **Fase successiva possibile:** localizzare i **messaggi di validazione** restituiti dall’hook **useRegistration** (es. “Tutti i campi sono obbligatori”, “Le password non coincidono”, “Formato email non valido”, ecc.) solo se il hook verrà modificato in modo minimo (es. accettare `t` o chiavi) senza toccare logica auth. Valutare come wave dedicata “useRegistration toast/error i18n”.
- **Cosa resta da fare dopo Wave 5:** eventuali altre aree con stringhe utente hardcoded (es. reset password, access blocked, altre pagine auth/secondarie) da mappare e affrontare in wave dedicate.
- **Cosa NON toccare ancora:** logica auth, Supabase auth, redirect, session, IAP, BUZZ, BUZZ MAP, push, routing, delete account, wallet, mappe, notifiche; refactor di useRegistration oltre alla sola sostituzione testi.
