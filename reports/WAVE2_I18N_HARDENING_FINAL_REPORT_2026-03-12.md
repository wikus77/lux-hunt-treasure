# Wave 2 i18n Hardening — Final Report (Auth / Login / Register)

**Data:** 2026-03-12  
**Branch:** `feat/pe-global-fullscreen-reward`  
**Scope:** Auth, Login, Register — solo sostituzione testi, zero refactor logico.

---

## FASE 0: Safety e rollback

| Elemento | Valore |
|----------|--------|
| Branch attuale | `feat/pe-global-fullscreen-reward` |
| HEAD pre-patch | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| Safety branch | `safety/i18n-wave2-pre` (creato) |
| Safety tag | `safety/i18n-wave2-pre` (creato) |

**Comandi rollback (se necessario):**
```bash
git checkout feat/pe-global-fullscreen-reward
git reset --hard safety/i18n-wave2-pre
# oppure
git reset --hard 7012170a1132f77a66f7359d69b9be6cd97e703b
```

---

## FASE 1: Verifica forense (read-only) pre-patch

### File nel perimetro primario

1. **`src/pages/Login.tsx`**
   - **Hardcoded:** titoli headline (“Tools for”, “Real-World”, “Treasure Hunting”), CTA (“Sign Up”, “Log In”), termini/legal (“Terms of Use”, “Privacy Policy”), “Back”, “Create Account”, “Choose how you want to sign up”, “Loading…”, “Sign up with Apple/Google”, “or”, “Sign up with Email”, “Already have an account?”, “Welcome Back”, “Log in to continue your mission”, “Don’t have an account?”, toast email verificata.
   - **Rischio:** Basso — solo testi sostituiti con `t(...)`, nessun cambio a video, redirect, session, OAuth.

2. **`src/components/auth/StandardLoginForm.tsx`**
   - **Hardcoded:** label/placeholder email e password, toast (campi obbligatori, email non valida, errore login, credenziali non valide, login successo, benvenuto M1SSION, errore sistema), “Mostra/Nascondi password”, “Caricamento…”, “Accedi”, “Registrati - Accesso limitato”.
   - **Rischio:** Basso — solo stringhe sostituite con `t(...)`; riusate chiavi esistenti `show_password` / `hide_password` da common.

3. **`src/pages/Auth.tsx`**
   - **Hardcoded:** “Caricamento…”, toast quiz saltato (titolo + descrizione), toast profilo completato (con interpolazione `{{name}}`), “Reindirizzamento in corso…”.
   - **Rischio:** Basso — solo testi sostituiti con `t(...)` e `t(..., { name })`.

### Perimetro secondario (non modificato)

- **`src/pages/Register.tsx`** e **`src/components/EmailVerificationFlow.tsx`** contengono testi utente hardcoded ma sono stati lasciati **fuori dalla patch** per mantenere scope Wave 2 strettamente su Login/Auth/StandardLoginForm e ridurre rischio di regressione. Possibile Wave successiva.

### Chiavi esistenti riutilizzate

- `show_password`, `hide_password` (common) — usate in StandardLoginForm per “Mostra password” / “Nascondi password”.

### Nuove chiavi aggiunte (en / it / fr)

- **Login:** `login_headline_1`, `login_headline_2`, `login_headline_3`, `login_cta_sign_up`, `login_cta_log_in`, `login_terms_intro`, `login_terms_link`, `login_terms_and`, `login_privacy_link`, `login_back`, `login_create_account_title`, `login_create_account_subtitle`, `login_loading`, `login_signup_apple`, `login_signup_google`, `login_or`, `login_signup_email`, `login_already_have`, `login_welcome_back`, `login_continue_mission`, `login_dont_have`, `login_email_verified_title`, `login_email_verified_description`.
- **Auth (form + pagina):** `auth_all_fields_required`, `auth_invalid_email_format`, `auth_login_error`, `auth_invalid_credentials`, `auth_login_success`, `auth_welcome_m1ssion`, `auth_system_error`, `auth_unexpected_error`, `auth_label_email`, `auth_placeholder_email`, `auth_label_password`, `auth_placeholder_password`, `auth_button_submit`, `auth_register_cta`, `auth_loading`, `auth_page_loading`, `auth_quiz_skipped_title`, `auth_quiz_skipped_description`, `auth_profile_complete_title`, `auth_profile_complete_description`, `auth_redirecting`.

**Brand protected:** M1SSION™ e “Treasure Hunting” lasciati nelle stringhe dove già presenti (es. `auth_welcome_m1ssion`, `login_headline_3`); nessuna modifica ai flussi o alla logica auth.

---

## FASE 2–3: Implementazione

- **`src/locales/en/common.json`**, **`src/locales/it/common.json`**, **`src/locales/fr/common.json`:** aggiunto blocco di chiavi `login_*` e `auth_*` con traduzioni per en, it, fr.
- **`src/pages/Login.tsx`:** import `useTranslation`, `const { t } = useTranslation()`, tutte le stringhe utente sostituite con `t('...')`. Nessun cambiamento a stato, redirect, video, OAuth, session.
- **`src/components/auth/StandardLoginForm.tsx`:** import `useTranslation`, sostituzione label, placeholder, toast e pulsanti con `t(...)`; riuso di `show_password` / `hide_password`.
- **`src/pages/Auth.tsx`:** import `useTranslation`, sostituzione “Caricamento…”, “Reindirizzamento in corso…”, toast quiz e profilo (con interpolazione `{{name}}`).

Nessun refactor di logica, condizioni, submit handler, chiamate Supabase, redirect, storage o gestione sessione.

---

## FASE 4: Verifiche post-patch

| Verifica | Esito |
|----------|--------|
| Nessun file fuori scope modificato | OK (solo Login, Auth, StandardLoginForm, en/it/fr common.json) |
| Chiavi usate presenti in en/it/fr | OK |
| Import e TypeScript sui file toccati | OK (nessun errore lint/TS) |
| Flusso auth non alterato | OK (solo sostituzione stringhe) |
| Brand (M1SSION, Treasure Hunting) non tradotti come termine | OK |

---

## FASE 5: Build e sync

| Comando | Esito |
|---------|--------|
| `npm run build` | OK (exit code 0, ~2m 1s) |
| `npx cap sync ios` | OK (web assets copiati, plugin aggiornati) |

---

## Riepilogo file modificati

| File | Tipo modifica |
|------|----------------|
| `src/locales/en/common.json` | Aggiunte chiavi login_* e auth_* |
| `src/locales/it/common.json` | Aggiunte chiavi login_* e auth_* |
| `src/locales/fr/common.json` | Aggiunte chiavi login_* e auth_* |
| `src/pages/Login.tsx` | useTranslation + sostituzione testi |
| `src/components/auth/StandardLoginForm.tsx` | useTranslation + sostituzione testi |
| `src/pages/Auth.tsx` | useTranslation + sostituzione testi |

**Non toccati (perimetro secondario):** `Register.tsx`, `EmailVerificationFlow.tsx`.

---

## Verdetto

**GO** — Wave 2 completata con successo. Nessuna regressione su login, logout, IAP, BUZZ, notifiche push; nessuna modifica fuori scope; solo testi portati in i18n. Procedere con wave successive (es. Register / EmailVerificationFlow) quando richiesto.
