# Audit forense read-only i18n — Post Wave 1–5

**Data:** 2026-03-12  
**Contesto:** M1SSION — app nativa wrappata iOS (Capacitor WKWebView)  
**Tipo:** Solo lettura. Nessuna patch, nessun commit, nessun build, nessun cap sync.

---

## 1. Stato attuale repo

| Elemento | Valore |
|----------|--------|
| **Branch** | `feat/pe-global-fullscreen-reward` |
| **HEAD** | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| **Working tree** | Modificato (~440 file in status: molti `D` in `android/.../models/`, `M` in `android/.../bundle-analysis.html`, `index.html`; i file wave i18n in `src/` e `src/locales/` risultano modificati/committati nelle wave precedenti) |
| **Conferma read-only** | Nessun file modificato in questa sessione. Nessun build, nessun sync, nessun branch/tag creato. |

**Nota:** I file effettivamente toccati dalle Wave 1–5 (Login, Auth, Register, EmailVerificationFlow, registration-form, LanguageSettings, SettingsPage, BuzzActionButton, BuzzMainContent, BuzzRewardHandler, BuzzMapRewardHandler, BuzzExplosionHandler, BuzzInfoCard, common.json en/it/fr) sono quelli indicati nei report WAVE1–WAVE5. Lo stato working tree attuale include molte altre modifiche (android assets, ecc.) non correlate alle wave i18n.

---

## 2. Stato infrastruttura i18n

### Sistemi presenti (tre)

| Sistema | File / entry point | Uso reale | Lingue / storage |
|--------|--------------------|-----------|-------------------|
| **i18next + react-i18next (common)** | `src/i18n/i18n.ts`, `main.tsx` → `I18nextProvider`, `src/locales/{en,it,fr}/common.json` | Shell app: LanguageSettings, Login, Auth, Register, EmailVerificationFlow, registration-form, BUZZ/BuzzMap (in parte), Settings. **Source of truth per l’app nativa.** | `en`, `it`, `fr`. Storage: `m1_locale`, `m1_locale_mode` (auto/manual). Fallback: `en`. |
| **intl/useI18n (fetch)** | `src/intl/useI18n.ts`, `src/intl/lang-detection.ts` | Solo **useUserPlan** (legge `currentLang`). Carica `/locales/{lang}.json` via fetch. | Dichiarate: en, it, fr, es, de, pt, zh, ar. Storage: `localStorage.lang`. |
| **Landing (useLandingTranslations)** | `src/hooks/useLandingTranslations.ts`, `src/intl/translations.ts` (landingTranslations), `lang-detection` | **LandingPage**, **CookieBanner** (GDPR). Traduzioni in-memory da `translations.ts`, nessun fetch. | Stesse lingue di lang-detection (en, it, fr, es, de, pt, zh, ar). |

### Source of truth reale

- Per **app nativa (Capacitor iOS)** la source of truth è **`src/i18n/i18n.ts`** con **`src/locales/{en,it,fr}/common.json`**.  
- `main.tsx` importa `./i18n/i18n` prima del render e avvolge l’app in `I18nextProvider`.  
- Rilevazione: `getDefaultLocale()` (da `m1_locale_mode` + `m1_locale` o device). Fallback: `en`.  
- **intl** e **Landing** sono sistemi paralleli (Landing per pagina landing + cookie; useI18n solo per useUserPlan).

### Incoerenze residue

1. **Lingue supportate:**  
   - **i18n.ts:** solo `en`, `it`, `fr`.  
   - **intl (lang-detection, useI18n, translations):** `en`, `it`, `fr`, `es`, `de`, `pt`, `zh`, `ar`.  
   Rischio: uso di useI18n/useLandingTranslations con lingue non presenti in common (es. `es`, `de`) fuori dalla shell i18next.

2. **Storage:**  
   - Shell: `m1_locale` + `m1_locale_mode`.  
   - useI18n: `localStorage.lang`.  
   Possibile disallineamento lingua “shell” vs “intl” se in futuro si usasse useI18n per UI.

3. **BuzzActionButton:** in **stato attuale del file** sono ancora presenti diverse stringhe hardcoded in italiano nei toast (v. sezione 5), pur essendo state pianificate sostituzioni con `t()` nel report Wave 3. Da considerare: patch Wave 3 parziale o codice successivo reintrodotto; in ogni caso **lo stato reale del file** ha ancora hardcoded.

---

## 3. Wave 1–5: cosa è stato davvero coperto

Sintesi per area, in base a report e verifica sui file.

| Wave | Area | Cosa è stato coperto (da report + lettura file) |
|------|------|-----------------------------------------------|
| **1** | Shell + Language UI | LanguageSettings: titolo, label, pulsanti, toast “lingua aggiornata”. SettingsPage: rimozione opzione “Deutsch”. Chiavi `language_settings_*`, `lang_name_*`. |
| **2** | Login / Auth | Login.tsx: headline, CTAs, termini/privacy, back, titoli, loading, toast. Auth.tsx: loading, quiz, profile complete, redirect. StandardLoginForm: label, placeholder, pulsanti, toast (auth_*, login_*). |
| **3** | BUZZ + BUZZ MAP | BuzzMainContent, BuzzRewardHandler, BuzzMapRewardHandler, BuzzExplosionHandler, BuzzInfoCard: toast e copy portati a `t()`. **BuzzActionButton:** solo in parte: alcuni toast usano `t()`, altri risultano ancora hardcoded (v. sezione 5). |
| **4** | Register + Email Verification | Register.tsx: sottotitolo, missione, link “Cambia preferenza”, “Hai già account”, footer legale. EmailVerificationFlow: titolo, stati verified/pending, step, pulsanti, help, footer. Chiavi `register_*`, `email_verification_*`. |
| **5** | Registration Form | registration-form.tsx: label (nome, email, password, conferma), placeholder, CTA submit/submitting. Chiavi `register_form_*`. Riuso di `auth_label_email`, `auth_label_password`. |

**Effetti collaterali positivi:**  
- Coerenza UI Login/Register/EmailVerification con lingua scelta.  
- Meno stringhe fisse in italiano nei flussi critici (eccetto dove ancora presenti, v. sotto).

---

## 4. Copertura reale attuale per macro-area

Stima qualitativa in base a grep e lettura file (stato attuale codice).

| Area | Stato | Copertura stimata | Rischio se toccata | Serve intervenire ora? |
|------|--------|-------------------|--------------------|-------------------------|
| **Language / Settings (shell)** | Stabile | Alta (Wave 1) | Basso | No |
| **Login / Auth / StandardLoginForm** | Stabile | Alta (Wave 2) | Basso | No |
| **Register (pagina)** | Stabile | Alta (Wave 4) | Basso | No |
| **EmailVerificationFlow** | Stabile | Alta (Wave 4) | Basso | No |
| **RegistrationForm (campi/CTA)** | Stabile | Alta (Wave 5) | Basso | No |
| **BUZZ (MainContent, RewardHandler, MapRewardHandler, ExplosionHandler, InfoCard)** | Stabile | Alta | Medio (logica BUZZ) | No |
| **BUZZ BuzzActionButton** | Parziale | Media: diversi toast ancora hardcoded | Alto (logica BUZZ, M1U, consume_credit) | Solo se si completa i18n toast con patch minima |
| **useRegistration (toast/error)** | Non toccata | Bassa: messaggi e toast in italiano | Alto (auth, redirect, signUp) | Solo wave dedicata, molto mirata |
| **ProfilePage / ProfileInfo** | Non toccata | Bassa: “Profilo non trovato”, “crediti”, toast, avatar | Medio | Opzionale, dopo stabilizzazione |
| **Subscriptions / Payment (Gold, Silver, Black)** | Non toccata | Bassa: titoli piani, toast, “Pagamento Rapido” | Alto (IAP, Stripe) | No, area critica |
| **PaymentMethodsPage / Metodi pagamento** | Non toccata | Bassa: “Metodi di Pagamento”, “Caricamento”, “Nessuna Carta” | Alto (pagamenti) | No |
| **CommandCenterHome** | Parziale | useTranslation importato; toast e copy in italiano | Medio | Opzionale |
| **OnboardingOverlay** | Non toccata | Bassa: toast PE, copy | Medio | Opzionale |
| **m1uHelpers (showInsufficientM1UToast, showM1UDebitSuccessToast)** | Non toccata | Bassa: stringhe e description hardcoded | Medio (condiviso, M1U) | Opzionale, dopo BUZZ |
| **Apple/Google auth (useAppleAuth, useGoogleAuth)** | Non toccata | Bassa: toast in italiano | Alto (OAuth) | Solo con patch minime |
| **Notifiche push / NotificationsPage** | Non toccata | Bassa | Alto (native push) | No |
| **Landing / Cookie (useLandingTranslations)** | Separata | Alta per landing/GDPR (sistema intl) | Basso per shell app | No |

---

## 5. Hardcoded residui più importanti

Elenco per area/file, senza modificare nulla.

### Alta visibilità / flussi principali

| File / area | Tipo | Esempi (stato attuale) | Severità |
|-------------|------|------------------------|----------|
| **BuzzActionButton.tsx** | Toast | `'Nessun credito BUZZ disponibile'`, `'Errore durante l\'uso del BUZZ gratuito'`, `'BUZZ gratuito utilizzato!'`, `'Errore durante il riscatto gratuito'`, `'Devi essere loggato per utilizzare BUZZ!'`, `BUZZ gratuito del giorno! (... tier rimasti)`, `'BUZZ gratuito del giorno (premio) utilizzato!'`, `'Errore nel processare il pagamento M1U'` | Alta (utente BUZZ vede sempre italiano) |
| **use-registration.ts** | Toast | `"Registrazione completata!"`, `"Benvenuto in M1SSION™!"`, `"Errore nel bypass"`, `"Scegli il tuo piano per iniziare la missione."`, `"Errore"`, `"Si è verificato un errore. Riprova più tardi."` | Alta (flusso registrazione) |
| **ProfilePage.tsx** | UI + toast | `"Profilo non trovato"`, `"crediti"`, `"Avatar utente"`, toast caricamento/errore/logout/avatar | Media |
| **m1uHelpers.ts** | Toast | `Saldo M1U insufficiente`, `Ti servono {{n}} M1U...`, `Acquista un pacchetto M1U`, `Acquista M1U`, `{{n}} M1U spesi`, `Nuovo saldo: {{n}} M1U`, `Errore M1U` | Media (M1U in tutta l’app) |

### Aree critiche (pagamenti / auth)

| File / area | Esempi | Impatto reale |
|-------------|--------|----------------|
| **PaymentGold/Silver/Black** | Titoli piani, “Pagamento Rapido”, toast errore/successo | Utente pagamento vede italiano; **non toccare** senza wave dedicata e test IAP. |
| **PaymentMethodsPage** | “Metodi di Pagamento”, “Caricamento...”, “Nessuna Carta Salvata”, description | Stesso discorso. |
| **useAppleAuth / useGoogleAuth** | Toast “Sign in with Apple non è supportato”, “Reindirizzamento ad Apple...”, “Accesso effettuato con Apple!”, ecc. | Flusso OAuth; modifiche solo con patch minime e test. |
| **Subscriptions.tsx** | Toast “Sistema di pagamento non disponibile”, “Errore nel sistema di pagamento...” | Critico per acquisti. |

### Altre aree (priorità minore)

- **CommandCenterHome:** toast “Indizio acquistato con successo!”, “Crediti insufficienti...”, “Nota aggiunta al diario”.  
- **OnboardingOverlay:** toast “+50 PE accreditati...”.  
- **ProfileInfo:** toast formato immagine, avatar, aggiornamento.  
- **useStripePayment, useNativePush, NotificationsPage, InviteFriendsModal, ReferralCard, StreakWidget, ecc.:** vari toast/copy in italiano/inglese.

---

## 6. Aree stabili da NON toccare adesso

Da non modificare per evitare regressioni su flussi critici:

| Area | Motivazione |
|------|-------------|
| **Login / Auth / StandardLoginForm** | Già localizzati (Wave 2), funzionanti. |
| **Register (pagina) + EmailVerificationFlow** | Già localizzati (Wave 4). |
| **registration-form.tsx (campi/CTA)** | Già localizzato (Wave 5). |
| **Logica auth (signUp, redirect, session)** | Nessun refactor i18n qui. |
| **IAP / StoreKit / receipts / Subscriptions** | Pagamenti e abbonamenti; cambiare stringhe senza test dedicati = rischio. |
| **Notifiche push native** | Integrazione delicata. |
| **Routing / navigazione** | Fuori scope i18n. |
| **Supabase / session / auth state** | Nessuna modifica per i18n. |
| **BUZZ: RPC consume_credit, handle-buzz-press, logica M1U** | Solo stringhe UI/toast; non toccare logica. |
| **useRegistration: signUp, redirect, validazione** | Solo eventuale sostituzione messaggi/toast; non toccare flusso. |

---

## 7. Aree ancora candidate a future wave

Ordine per priorità/beneficio vs rischio (solo testo, nessuna patch).

| Priorità | Area | Rischio | Beneficio | Convenienza |
|----------|------|--------|----------|-------------|
| 1 | **Completare BuzzActionButton** (solo toast mancanti con `t()`) | Alto (file critico BUZZ/M1U) | Coerenza lingua BUZZ | Solo se patch minima: sostituire stringhe con chiavi esistenti o poche nuove; nessun refactor. |
| 2 | **useRegistration (solo messaggi/toast)** | Alto (auth) | Registrazione multilingua | Wave dedicata; hook deve ricevere `t` o chiavi senza cambiare logica. |
| 3 | **m1uHelpers (toast M1U)** | Medio | Coerenza messaggi M1U | Dopo BUZZ; helper condivisi. |
| 4 | **ProfilePage / ProfileInfo (solo UI/toast)** | Medio | Profilo multilingua | Dopo le precedenti. |
| 5 | **CommandCenterHome (toast + copy)** | Medio | Coerenza Command Center | Opzionale. |
| 6 | **Apple/Google auth (solo toast)** | Alto | Login social multilingua | Solo patch minime, test OAuth. |
| 7 | **Payment pages / PaymentMethodsPage** | Alto | Pagamenti multilingua | Solo con wave dedicata e test IAP/Stripe. |
| 8 | **OnboardingOverlay** | Basso | Tutorial multilingua | Ultima priorità. |

---

## 8. Valutazione strategica

1. **L’app oggi è sufficientemente stabile da fermarci qui con i18n?**  
   Sì. Le wave 1–5 coprono shell, login, auth, register, email verification e form di registrazione. I flussi critici (login, registrazione, verifica email) sono localizzati. Restano hardcoded soprattutto in BUZZ (BuzzActionButton), useRegistration, profilo, pagamenti e helper M1U.

2. **Ci sono ancora hardcoded tali da giustificare nuove wave?**  
   Sì: BuzzActionButton (toast), useRegistration (toast/error), Profile, M1U helper, pagamenti. La più evidente per l’utente è BUZZ (toast sempre in italiano).

3. **Quali wave future hanno miglior rapporto beneficio/rischio?**  
   Una sola wave “completamento BuzzActionButton” (solo sostituzione stringhe toast con `t()`), con scope strettissimo e nessun refactor. Subito dopo, eventuale wave “useRegistration toast/error” con modifica minima all’hook.

4. **Quali wave future sono sconsigliate adesso?**  
   Pagamenti (Gold/Silver/Black, PaymentMethodsPage), IAP, notifiche push, modifiche alla logica auth o BUZZ. Evitare refactor che toccano useI18n/intl in parallelo a i18next senza piano chiaro.

5. **Punto oltre il quale il rischio supera il beneficio?**  
   Oltre la sostituzione pura di stringhe (toast/copy) in file già usati dall’i18n, senza toccare condizioni, redirect, RPC, IAP. Esempio: non unificare intl e i18next in una sola passata; non toccare logica di consume_credit/handle-buzz-press.

6. **Se dovessimo fare un solo prossimo step, qual è il più safe?**  
   Completare **solo i toast** in **BuzzActionButton.tsx** con `t(...)` e chiavi in common.json (en/it/fr), senza cambiare nessuna logica, nessun altro file BUZZ, nessun m1uHelpers. Scope: un file, solo stringhe.

7. **Se non facciamo nulla, lo stato attuale è accettabile?**  
   Sì. L’app funziona; login, registrazione e verifica email rispettano la lingua. Resta un’esperienza mista in BUZZ (toast in italiano) e in registrazione (toast success/error in italiano). Accettabile per un rilascio; migliorabile con una wave molto mirata.

---

## 9. Piano consigliato

- **Scenario A — STOP qui**  
  Non fare altre wave. Pro: zero rischio. Contro: BUZZ e registrazione continuano a mostrare diversi messaggi in italiano.

- **Scenario B — 1 sola wave ancora, poi stop**  
  Una wave unica: **solo completamento toast in BuzzActionButton** (sostituzione stringhe con `t()` e chiavi in common.json). Nessun altro file, nessuna logica. Poi stop. Pro: BUZZ coerente con la lingua senza toccare pagamenti/auth. Contro: useRegistration e M1U helper restano in italiano.

- **Scenario C — Proseguire con più wave**  
  Dopo la wave BuzzActionButton: useRegistration (toast), poi m1uHelpers, poi Profile/CommandCenter. Pro: copertura più ampia. Contro: più punti di possibile regressione (auth, M1U).

**Raccomandazione per M1SSION ora:**  
**Scenario B.** Una sola wave “BuzzActionButton toast only”, poi stop. Massimo beneficio visibile (BUZZ usato spesso) con rischio contenuto (un file, solo stringhe). Tutto il resto (useRegistration, pagamenti, profilo) può restare per una fase successiva, con wave dedicate e test.

---

## 10. Verdetto finale

**GO 1 WAVE SAFE**

- **Interpretazione:** Procedere con **una sola** wave aggiuntiva, limitata al **completamento i18n dei toast in BuzzActionButton.tsx** (sostituzione stringhe con `t()` e chiavi in common.json). Nessuna modifica a logica BUZZ, M1U, auth, pagamenti, altri file.
- **Motivazione:** Lo stato dopo Wave 1–5 è già stabile e sufficiente per produzione. La sola area con impatto utente evidente e circoscritta è BuzzActionButton (toast). Completarla con una patch minima riduce l’esperienza in italiano in BUZZ senza aumentare il rischio su flussi critici.
- **Se si preferisce zero modifiche:** **GO STOP** è ugualmente accettabile; l’audit non introduce modifiche e lo stato attuale è considerato stabile.

---

*Audit eseguito in sola lettura. Nessun file modificato, nessun build, nessun cap sync.*
