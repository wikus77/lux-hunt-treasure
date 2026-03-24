# Audit forense completo i18n / struttura attuale / piano hardening safe

**Data:** 2026-03-11  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Contesto:** App nativa iOS wrappata (Capacitor WKWebView).  
**Modalità:** Read-only — nessuna modifica, nessuna patch, nessun build/cap sync/commit.

---

## 1. Executive Summary

L’app ha **tre sistemi di localizzazione** che coesistono senza un unico source of truth: (1) **react-i18next** con namespace `common` e risorse in `src/locales/{en,it,fr}/common.json` (~1340 chiavi), usato dalla maggior parte dell’app post-login e wrappato in `main.tsx`; (2) **Landing/intl** con `useLandingTranslations` e oggetto TS `landingTranslations` in `src/intl/translations.ts` (8 lingue), usato da `LandingPage.tsx` e `CookieBanner.tsx` (gdpr); (3) **intl/useI18n** che fa fetch di `/locales/${lang}.json` (public/locales), dichiara 8 lingue ma è usato solo da `useUserPlan.ts` per `currentLang` — le risorse public/locales contengono solo un blocco gdpr e **non** sono allineate a `common`. Le **lingue effettivamente supportate** dall’app principale sono **en, it, fr** (definite in `src/i18n/i18n.ts`); in **SettingsPage** la Select lingua espone anche **Deutsch (de)** senza che esista `common` per `de`, creando incoerenza e rischio comportamento indefinito. La **copertura** è **mista**: shell, settings, home, notifiche, leaderboard, shop, Pulse, missioni e molti modali usano `useTranslation` e chiavi da `common`; **Login, Auth, Register, Buzz** (toast e copy), **LanguageSettings** (titoli e toast), **PaymentMethodsPage**, **ProfilePage/ProfileInfo** e **decine di toast** in tutta l’app sono **hardcoded** (spesso in italiano). I **termini brand** (M1SSION, BUZZ, BUZZ MAP, AION, PE, M1U, Pulse Breaker) compaiono sia nelle chiavi `common` sia in stringhe hardcoded; vanno trattati come **non traducibili**. L’app **non è pronta** per l’aggiunta di 3 nuove lingue (es, pt, de) senza un **hardening preventivo**: occorre unificare il source of truth, eliminare l’opzione “Deutsch” dalla UI finché non supportata, sostituire gli hardcoded critici e definire wave di intervento sicure. **Da fare subito:** nessuna patch — solo pianificazione. **Da non fare subito:** non toccare login/logout, cancellazione account, IAP, BUZZ, BUZZ MAP, push, routing, auth; non aggiungere lingue in UI prima del hardening.

---

## 2. Stato repo / branch / HEAD / working tree

| Elemento | Valore |
|----------|--------|
| **Branch** | `feat/pe-global-fullscreen-reward` (verificato da comando git) |
| **HEAD** | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| **Working tree** | Presenza di modifiche locali non committate (da git status iniziale della sessione) |
| **Conferma** | **Read-only audit only** — nessun file modificato, nessun build/cap sync/commit/branch/tag |

---

## 3. Mappa architettura i18n reale

### 3.1 Sistemi presenti (ricognizione da codice)

| Sistema | Libreria / meccanismo | File config / entry | Risorse | Consumatori |
|---------|------------------------|---------------------|---------|-------------|
| **App principale** | i18next + react-i18next | `src/i18n/i18n.ts` | `src/locales/{en,it,fr}/common.json` (static import) | ~75+ componenti con `useTranslation()` |
| **Landing** | Hook custom + oggetto TS | `src/hooks/useLandingTranslations.ts`, `src/intl/translations.ts` | `landingTranslations` in translations.ts (en, it, fr, es, de, pt, zh, ar) | `LandingPage.tsx`, `src/components/gdpr/CookieBanner.tsx` |
| **intl/useI18n** | Hook custom + fetch runtime | `src/intl/useI18n.ts`, `src/intl/lang-detection.ts` | `fetch('/locales/${lang}.json')` → `public/locales/en.json` (e it; contenuto minimo, es. gdpr) | `src/hooks/useUserPlan.ts` (solo `currentLang`) |

### 3.2 Funzioni e helper (da codice)

| Funzione / helper | File | Ruolo |
|-------------------|------|--------|
| `getDeviceLocale()` | `src/i18n/i18n.ts` | Legge lingua da `navigator.languages` / `navigator.language`; normalizza a en/it/fr |
| `getSavedLocale()` | `src/i18n/i18n.ts` | Legge `localStorage.getItem('m1_locale')` |
| `getLocaleMode()` | `src/i18n/i18n.ts` | Legge `m1_locale_mode` ('auto' \| 'manual') |
| `getDefaultLocale()` | `src/i18n/i18n.ts` | Se mode manual usa saved, altrimenti device |
| `setLocale(lng)` | `src/i18n/i18n.ts` | Scrive in localStorage e chiama `i18next.changeLanguage(lng)` |
| `clearLocaleOverride()` | `src/i18n/i18n.ts` | Rimuove override e riallinea a OS |
| `getLocale()` | `src/i18n/i18n.ts` | Ritorna lingua corrente (i18next o default) |
| `t(key, vars?)` | `src/i18n/i18n.ts` | Wrapper sicuro su `i18next.t` |
| `useI18nSafe()` | `src/i18n/i18n.ts` | Hook opzionale (t, locale, setLocale) — **non verificato se usato** in repo |
| `detectInitialLanguage()` | `src/intl/lang-detection.ts` | Usa `navigator.language`; ritorna una delle 8 lingue (en, it, fr, es, de, pt, zh, ar) |
| `getLanguageDisplayName(lang)` | `src/intl/lang-detection.ts` | Nomi display hardcoded per le 8 lingue |

**Duplicazioni:** Detection lingua avviene in due modi: (1) i18n.ts con getDeviceLocale/getDefaultLocale (solo en/it/fr); (2) intl/lang-detection con detectInitialLanguage (8 lingue). Storage lingua: i18n usa `m1_locale` + `m1_locale_mode`; useI18n (intl) usa `localStorage.lang` (diversa chiave).

### 3.3 Namespace, fallback, storage (reale)

| Concetto | Valore reale | Dove |
|----------|--------------|------|
| **Namespace** | Unico: `common` | i18n.init `ns: ['common']`, `defaultNS: 'common'` |
| **Fallback lingua** | `'en'` | i18n.init `fallbackLng: 'en'` |
| **Storage lingua (app)** | `m1_locale`, `m1_locale_mode` | i18n.ts |
| **Storage lingua (intl)** | `localStorage.lang` | useI18n.ts (intl) |
| **Lingue supportate (app)** | `['en','it','fr']` | i18n.ts `SUPPORTED` |
| **Lingue dichiarate (Landing)** | 8 (en, it, fr, es, de, pt, zh, ar) | intl/translations.ts, lang-detection.ts |
| **Lingue dichiarate (useI18n)** | 8 (stesse) | intl/useI18n.ts |
| **Lingue in UI Settings** | it, en, fr, **de** | SettingsPage.tsx SelectItem — **de non in common** |

### 3.4 File config / provider / risorse (mappa)

| Ruolo | Path |
|-------|------|
| Init i18n | `src/i18n/i18n.ts` |
| Provider | `main.tsx`: `I18nextProvider i18n={i18n}` |
| Risorse app | `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json` |
| Risorse public (fetch) | `public/locales/en.json`, `public/locales/it.json` (contenuto minimo; struttura diversa da common) |
| Landing / intl | `src/intl/translations.ts`, `src/hooks/useLandingTranslations.ts`, `src/intl/lang-detection.ts` |
| useI18n fetch | `src/intl/useI18n.ts` |

**Incoerenze:** (1) UI Settings mostra "Deutsch" ma i18n non supporta `de` in common. (2) Due storage chiavi per lingua. (3) useUserPlan dipende da useI18n che carica public/locales; l’app principale non usa quel contenuto per le stringhe.

---

## 4. Source of truth lingue / namespace / fallback / storage / detection

- **Source of truth lingue (app):** `src/i18n/i18n.ts` → `SUPPORTED = ['en','it','fr']`. **Non unico:** LanguageSettings ha array `languages` (it, en, fr); SettingsPage ha Select con it, en, fr, de; intl dichiara 8 lingue.
- **Namespace:** unico `common` per i18next; nessun altro namespace usato nel codice analizzato.
- **Fallback:** `fallbackLng: 'en'` in i18n.init.
- **Storage:** app usa `m1_locale` + `m1_locale_mode`; intl usa `localStorage.lang` — **duplicazione**.
- **Detection:** app usa `getDefaultLocale()` (manual → saved, altrimenti `getDeviceLocale()` da navigator); Landing/useLandingTranslations usano `detectInitialLanguage()` da intl (8 lingue). **Non dimostrabile da solo codice** se in produzione l’utente vede prima Landing o app: se vede prima Landing, la detection intl può divergere da quella usata dopo il login (i18n).

---

## 5. Copertura reale per macro-area

| Macro-area | Stato | Stima copertura | File principali | Rischio regressione se toccata | Wave consigliata |
|------------|--------|------------------|------------------|----------------------------------|-------------------|
| **Shell globale (header, bottom nav, menu)** | OK / misto | ~80% | BottomNavigation.tsx, UnifiedHeader (testi), PortalBehaviorOverlay | Basso | 1 |
| **Settings / Language settings** | Misto / critico | ~60% | SettingsContent.tsx (i18n), LanguageSettings.tsx (titoli/toast hardcoded), SettingsPage.tsx (Select con de) | Medio (opzione de incoerente) | 1 |
| **Login / Auth / Register / Email verification** | Hardcoded / critico | ~15% | Login.tsx, Auth.tsx, StandardLoginForm.tsx, Register.tsx, EmailVerificationFlow | Alto (flusso critico) | 2 |
| **Home / Command center** | Misto | ~70% | AppHome, CommandCenterHome, ActiveMissionBox, AgentDiary, NextAction* (i18n); toast e messaggi in CommandCenterHome, OnboardingOverlay hardcoded | Medio | 2 / 4 |
| **BUZZ** | Misto / critico | ~50% | BuzzPage (i18n), BuzzMainContent, BuzzActionButton (toast/copy IT hardcoded), BuzzBriefingFlipOverlay ("Tocca per l'audio") | Alto (logica BUZZ non toccare) | 3 |
| **BUZZ MAP / Mappa** | Misto | ~75% | Chiavi mapPills.*, game_* in common; componenti mappa e pill usano t(); MapTiler3D e altri con toast hardcoded | Medio | 3 |
| **Profile** | Misto | ~65% | AgentProfileContent (i18n), ProfilePage, ProfileInfo (toast/errori hardcoded) | Medio | 4 |
| **Notifications** | OK | ~85% | Notifications*, NotificationCategory*, NotificationsHeader, NotificationsEmptyState (useTranslation) | Basso | 4 |
| **Leaderboard** | OK | ~85% | LeaderboardPage, UserProfileModal (useTranslation) | Basso | 4 |
| **Subscriptions / Wallet / M1U shop / Pagamenti** | Misto | ~65% | Payment*, M1UPaymentContent, ShopContent (i18n); PaymentMethodsPage (settings), Subscriptions (toast IT); IAP copy in common | Alto (IAP non toccare logica) | 4 |
| **Pulse / PE / Pulse Breaker** | OK / misto | ~80% | GlobalPERewardOverlay, PulseBarReward, PulseBreaker (useTranslation); StreakModal, StreakWidget (toast residui) | Basso | 4 |
| **Tutorial / Onboarding / Popup** | Misto | ~60% | Chiavi tutorial_*, motivation_* in common; OnboardingOverlay toast IT; BriefingFlipOverlay, MotivationalPopup | Basso | 4 |
| **Pagine statiche / Info / Help / Learn / How it works** | OK / misto | ~75% | HelpContent, LegalSectionContent, LearnContent, Settings sections (i18n); eventuali toast/empty state residui | Basso | 4 |
| **Aree residuali / Sandbox / Admin / Dev** | Variabile | N/D | MapTiler3D, LotteryTest, MarkerRewardManager, DevAreasPanel, ecc. (toast e label hardcoded; visibilità in prod non verificata da codice) | Basso se solo dev | 5 o escluse |

---

## 6. Inventario hardcoded critici

### A. UI visibile

| File | Tipo | Esempio concreto | Visibilità | Severità | Rischio se toccato |
|------|------|-------------------|------------|----------|---------------------|
| `src/pages/Login.tsx` | Titoli, CTA, link | "Tools for", "Real-World", "Treasure Hunting", "Sign Up", "Log In", "Create Account", "Back", "Terms of Use", "Privacy Policy", "Sign up with Apple", "or", "Don't have an account?" | Sì | Alta | Alto (entry auth) |
| `src/pages/LanguageSettings.tsx` | Titoli, pulsanti | Oggetto `texts` con title, select, save per it/en/fr | Sì | Media | Basso |
| `src/pages/SettingsPage.tsx` | Select lingua | Label "Italiano", "English", "Français", "Deutsch" + value "de" | Sì | Media | Medio (de non supportato) |
| `src/components/buzz/BuzzBriefingFlipOverlay.tsx` | Label | "Tocca per l'audio" | Sì | Media | Medio (vicino a BUZZ) |

### B. Toast / Alert / Modal

| File | Esempio concreto | Visibilità | Severità | Rischio se toccato |
|------|-------------------|------------|----------|---------------------|
| `src/pages/Login.tsx` | "Email verificata", "La tua email è stata verificata con successo." | Sì | Alta | Alto |
| `src/components/buzz/BuzzMainContent.tsx` | "Accesso richiesto", "Devi effettuare l'accesso...", "Buzz non disponibile", "Hai raggiunto il limite...", "Errore", "Si è verificato un errore..." | Sì | Alta | Alto (BUZZ) |
| `src/components/buzz/BuzzActionButton.tsx` | "Devi essere loggato per usare il BUZZ gratuito", "Nessun credito BUZZ disponibile", "Errore durante l'uso del BUZZ gratuito", "BUZZ gratuito utilizzato!", "Devi essere loggato per utilizzare BUZZ!", "Errore nel processare il pagamento M1U", "Errore durante il BUZZ. Riprova." | Sì | Alta | Alto (BUZZ) |
| `src/pages/LanguageSettings.tsx` | Toast "Lingua Aggiornata" / "Language Updated" / "Langue Mise à Jour" + descrizione | Sì | Media | Basso |
| `src/pages/Auth.tsx` | "Quiz saltato. Riapparirà domani all'apertura dell'app." | Sì | Alta | Alto (auth) |
| `src/components/auth/StandardLoginForm.tsx` | "Tutti i campi sono obbligatori", "Formato email non valido", "Errore di login", "Login effettuato con successo", "Errore di sistema" | Sì | Alta | Alto (auth) |
| `src/pages/ProfilePage.tsx` | "Errore nel caricamento del profilo", "Logout effettuato con successo", "Errore durante il logout", "Avatar aggiornato", "Seleziona solo un'immagine...", "Immagine troppo grande..." | Sì | Alta | Medio |
| `src/pages/settings/PaymentMethodsPage.tsx` | "I pagamenti per contenuti digitali sono gestiti tramite acquisti in-app Apple.", "La configurazione di Google Pay sarà disponibile a breve.", "La carta è stata rimossa con successo.", "Impossibile rimuovere la carta...", "La carta è stata impostata come predefinita." | Sì | Alta | Alto (pagamenti) |
| `src/components/command-center/CommandCenterHome.tsx` | "Indizio acquistato con successo!", "Crediti insufficienti per acquistare questo indizio.", "Nota aggiunta al diario" | Sì | Media | Medio |
| `src/components/onboarding/OnboardingOverlay.tsx` | "+50 PE accreditati per aver completato il tutorial!" | Sì | Media | Medio |
| `src/pages/PaymentGold.tsx`, `PaymentSilver.tsx`, `PaymentBlack.tsx` | "Errore di pagamento", "Metodo Alternativo" | Sì | Media | Alto (IAP) |
| `src/pages/Subscriptions.tsx` | "Sistema di pagamento non disponibile", "Errore nel sistema di pagamento. Contatta l'assistenza." | Sì | Alta | Alto (IAP) |
| `src/components/profile/ProfileInfo.tsx` | "Formato non supportato. Scegli JPG o PNG.", "Devi essere loggato per cambiare avatar", "Errore nel caricamento dell'immagine", "Immagine profilo aggiornata" | Sì | Media | Medio |
| `src/components/gamification/ReferralCard.tsx` | "Codice copiato!", "Impossibile copiare", "Link copiato!", "Errore: " + error.message | Sì | Media | Basso |
| `src/components/gamification/StreakWidget.tsx` | "Streak resettata! Ricomincia da 1 giorno", "Errore durante il check-in" | Sì | Media | Basso |
| `src/components/shop/LotteryContent.tsx` | "Premio riscosso!", "Errore", "Impossibile riscuotere il premio" | Sì | Media | Medio |
| `src/components/scratch/ScratchWinModal.tsx` | "Errore", description err.message | Sì | Media | Medio |
| `src/pages/sandbox/MapTiler3D.tsx` | "MapTiler API key missing", "Stile Neon attivato", "Attivazione geolocalizzazione...", "Geolocalizzazione non disponibile" | Sì (se visibile) | Bassa | Basso |

### C. Loading / Error / Empty states

- Diversi componenti mostrano "Caricamento...", "Loading...", "Errore", "No data" senza `t()`. Chiavi esistono in common (es. `loading`, `no_data`, `error`) ma non usate ovunque. **Non inventariato file per file** — da considerare in fase di hardening per ogni macro-area.

### D. Validazione form

- StandardLoginForm: errori e success hardcoded (vedi B). PaymentMethodsPage e form profilo: messaggi IT hardcoded. Chiavi in common (required_fields, fill_all_fields, passwords_not_matching, ecc.) non usate in tutti i form.

### E. Runtime / feedback di gioco

- BUZZ: toast in BuzzActionButton e BuzzMainContent (vedi B). Reward overlay e Pulse Breaker usano i18n. Game feedback (mission popup, daily mission, cipher/word duel) hanno chiavi in common; eventuali residui da verificare per file.

### F. Pagine statiche / informative

- Help, Legal, Learn, Settings sections: in gran parte con useTranslation. Residui in cookie/legal se usano anche intl (Landing) vs common.

### G. Settings / Pagamenti / Profilo

- Vedi B (PaymentMethodsPage, ProfilePage, ProfileInfo, Subscriptions, Payment*). SettingsContent e sezioni usano i18n; SettingsPage Select lingua e LanguageSettings hanno hardcoded.

### H. Aree critiche Auth / Buzz / Map / IAP

- **Auth:** Login.tsx, Auth.tsx, StandardLoginForm.tsx — tutta copy e toast hardcoded; **non toccare** logica auth, solo sostituzione testi in wave dedicata.  
- **Buzz:** BuzzActionButton, BuzzMainContent, BuzzBriefingFlipOverlay — **non toccare** logica BUZZ; solo testi.  
- **Map:** Pill e overlay con t(); MapTiler3D e altri con toast — **non toccare** logica mappa.  
- **IAP:** Payment*, Subscriptions, M1UPaymentContent — **non toccare** StoreKit/receipts; solo testi visibili.

---

## 7. Punti pericolosi / rischi regressione

| File / area | Motivo del rischio | Severità | Suggerimento contenimento | Quando affrontare |
|-------------|--------------------|----------|----------------------------|-------------------|
| **Login.tsx / Auth.tsx / StandardLoginForm** | Testi vicini a redirect, session, verifica email; modifica stringhe o key può introdurre typo o chiave mancante e bloccare accesso | Alta | Solo sostituzione stringa → t(key); nessun refactor logica; QA obbligatoria login/signup/verifica | Wave 2, dopo Wave 1 |
| **BuzzActionButton / BuzzMainContent** | Toast e copy vicini a chiamate BUZZ, stato canUseBuzz, pagamento M1U; errore in key o interpolazione può far mostrare messaggio sbagliato o vuoto | Alta | Introduzione chiavi common solo per messaggi utente; non toccare condizioni né chiamate API | Wave 3 |
| **SettingsPage Select lingua (value "de")** | Utente può selezionare Deutsch; i18n non ha common per de → comportamento non definito (fallback en o key mancanti) | Media | Rimuovere SelectItem "de" fino a quando common per de non esiste; oppure aggiungere de in SUPPORTED e risorse in wave successive | Wave 1 (rimozione de) |
| **useUserPlan + useI18n (intl)** | useUserPlan dipende da useI18n che fa fetch public/locales; se si cambia storage lingua o si disattiva intl, useUserPlan potrebbe ricevere lingua diversa da app principale | Media | Documentare dipendenza; in hardening decidere se useUserPlan deve usare getLocale() da i18n invece di useI18n | Dopo Wave 1 |
| **PaymentMethodsPage / Subscriptions / Payment*** | Toast e descrizioni vicini a flussi pagamento e IAP; errore in testo può confondere utente in contesto sensibile | Alta | Solo sostituzione con t(); nessun cambiamento a logica pagamenti o StoreKit; QA pagamenti su dispositivo | Wave 4 |
| **DeleteAccountModalContent** | Già usa useTranslation; modifiche potrebbero toccare copy sensibile e legale | Alta | Non toccare in wave early; se necessario solo aggiunta chiavi mancanti, senza cambiare logica modale o cancellazione | Solo se necessario in wave successive |
| **LanguageSettings + setLocale** | Cambio lingua chiama setLocale e i18next.changeLanguage; sostituzione solo testi UI (titoli, toast) a basso rischio | Bassa | Sostituire titoli/toast con t(); non toccare setLocale/getLocale | Wave 1 |
| **Modali overlay / reward flow** | GlobalPERewardOverlay, StreakModal, reward toast: testo e chiavi; sostituzione errata può rompere layout o messaggio post-azione | Media | Verificare chiavi esistenti in common; solo aggiunta se mancanti; QA flussi reward | Wave 4 |
| **Landing + CookieBanner** | Usano useLandingTranslations (intl); separati da app principale; unificazione futura con i18next potrebbe richiedere migrazione | Media | In hardening non obbligatorio unificare subito; documentare che Landing è su sistema diverso | Post-hardening / step successivi |
| **Doppio storage (m1_locale vs localStorage.lang)** | Due chiavi per lingua possono divergere; comportamento non verificato da codice se useI18n scrive in localStorage.lang | Media | In hardening allineare: un solo storage e un solo reader per lingua app (es. solo m1_locale) e far leggere useUserPlan da lì se necessario | Wave 1 o 2 |

---

## 8. Brand protected terms

Verifica esplicita (da codice e da report precedente):

| Termine | Dove compaiono | Dentro chiavi i18n (common) | Hardcoded | Rischio traduzione accidentale | Strategia post-hardening |
|---------|----------------|-----------------------------|-----------|---------------------------------|---------------------------|
| **M1SSION** | common.json (molte chiavi), Login.tsx, Landing, intl | Sì (es. settings_modal_subtitle, learn_*, help_footer, delete_account_modal_*) | Sì (Login brand) | Basso (nome proprio) | Non tradurre mai; in frasi usare come token; eventuale lista "brand protected" in doc o in script lint |
| **BUZZ** | common.json (cta_buzz, game_buzz_*, buzz_*, tutorial_*, notifications_filter_buzz, motivation_buzz_*), BuzzActionButton, BuzzMainContent | Sì | Sì (toast IT) | Medio (potrebbe essere tradotto in nuove lingue per errore) | Bloccare in glossary; nelle nuove chiavi usare "BUZZ" letterale |
| **BUZZ MAP** | common.json (cta_show_map, mapPills.*, game_buzz_map_*, tutorial_buzz_map_*) | Sì | Possibili residui in UI | Medio | Idem |
| **AION** | common.json (aion_*, tutorial_aion_*, motivation_aion_*, help_aion_*) | Sì | Possibili in IntelChatPanel | Basso | Idem |
| **MCP** | Riferimenti tecnici / label se presenti | Non verificato in common | Non verificato | Basso | Non tradurre |
| **PE** | common.json (pulse_energy, pe_reward, streak_pe_*, game_pe_*, source_*) | Sì | OnboardingOverlay "+50 PE accreditati" | Medio | Idem |
| **M1U** | common.json (earn_m1u, iap_*, shop_*, game_m1u_*, learn_m1uprizes_*) | Sì | Toast Buzz e shop | Medio | Idem |
| **Pulse Breaker** | common.json (source_pulse_breaker_*, mission.popup.pulseBreakerHint, pulseBreaker.disclaimerPeOnly), PulseBreaker.tsx | Sì | Possibili in UI | Basso | Idem |

**Conclusione:** I termini sono già presenti sia in chiavi sia in hardcoded. La strategia più sicura è: (1) documentare lista ufficiale "brand protected"; (2) in ogni nuova traduzione (es/pt/de) non tradurre questi token; (3) eventuale script o checklist pre-commit che segnala se una stringa in common contiene uno di questi e viene modificata in traduzione.

---

## 9. Piano di messa in sicurezza della struttura attuale

Obiettivo: consolidare un unico source of truth per le lingue (en, it, fr), eliminare incoerenze UI e ridurre hardcoded critici **senza** aggiungere ancora es/pt/de.

### Da dove conviene partire

- Dal **punto a minor rischio e massima visibilità**: shell (header/nav) e **LanguageSettings** + correzione **SettingsPage** (rimozione opzione "Deutsch"). Poi Auth/Login, poi Buzz, poi resto.

### Primo intervento più sicuro

- **Wave 1 (solo testo):**  
  - Allineare **SettingsPage**: rimuovere `<SelectItem value="de">Deutsch</SelectItem>` finché non esiste common per de, così la UI riflette le sole lingue supportate.  
  - LanguageSettings: sostituire titoli e toast con chiavi da common (es. `t('language_settings_title')`) e aggiungere le chiavi in en/it/fr se mancanti.  
  - **Non** toccare: setLocale, getLocale, getDefaultLocale, storage, routing, logica cambio lingua.

### Sequenza ideale (wave)

- **Wave 1 — Shell e lingua UI**  
  - Aree: header (solo testi), bottom nav (solo testi), LanguageSettings (titoli + toast), SettingsPage (rimozione de + eventuali label Select da common).  
  - File: LanguageSettings.tsx, SettingsPage.tsx, eventuali label in BottomNavigation/UnifiedHeader se ancora hardcoded.  
  - Rischio: basso.  
  - Dipendenze: nessuna.  
  - QA: cambio lingua da Settings e da LanguageSettings; verifica che non compaia "Deutsch".  
  - **Non toccare:** logica auth, BUZZ, IAP, push, cancellazione account.

- **Wave 2 — Auth / Login / Register**  
  - Aree: Login.tsx, Auth.tsx, StandardLoginForm.tsx, Register.tsx (e EmailVerificationFlow se applicabile) — solo sostituzione stringhe con t().  
  - File: come sopra.  
  - Rischio: alto (flusso critico).  
  - Dipendenze: Wave 1 completata; chiavi common per tutti i testi auth.  
  - QA: login, signup, recupero password, verifica email su dispositivo reale.  
  - **Non toccare:** redirect, session, verifica email logic, Supabase auth.

- **Wave 3 — BUZZ e BUZZ MAP**  
  - Aree: BuzzMainContent, BuzzActionButton, BuzzBriefingFlipOverlay (e altri componenti Buzz/Map con copy residua).  
  - Solo testi e toast → t(); nessun tocco a logica BUZZ o mappa.  
  - Rischio: alto (BUZZ sensibile).  
  - Dipendenze: chiavi common per messaggi BUZZ.  
  - QA: flusso BUZZ completo, messaggi success/errore, BUZZ MAP overlay.  
  - **Non toccare:** chiamate API BUZZ, stato canUseBuzz, pagamento M1U per BUZZ.

- **Wave 4 — Restante UI e toast**  
  - Aree: ProfilePage, ProfileInfo, PaymentMethodsPage, Subscriptions, PaymentGold/Silver/Black, CommandCenterHome, OnboardingOverlay, ReferralCard, StreakWidget, LotteryContent, ScratchWinModal, Shop, Notifications/Leaderboard residui, modali reward.  
  - Solo sostituzione stringhe con t(); nessun tocco a IAP/StoreKit, cancellazione account, push.  
  - Rischio: medio (molti file).  
  - QA: profilo, pagamenti, shop, notifiche, leaderboard, reward flow.  
  - **Non toccare:** IAP logic, StoreKit, receipts, delete account logic, push.

- **Wave 5 — Polish e allineamento**  
  - Verifica chiavi mancanti, fallback, doppio storage (m1_locale vs localStorage.lang), eventuale decisione su useUserPlan/useI18n (leggere da getLocale() i18n invece di useI18n).  
  - Documentazione brand protected e checklist.  
  - QA generale su en/it/fr.

### Cosa fare prima di aggiungere nuove lingue

- (1) Completare Wave 1–5 in modo che **en, it, fr** siano l’unico set supportato e la UI sia coerente (nessun "Deutsch" se de non supportato).  
- (2) Unificare storage e detection in un solo punto (es. solo i18n.ts).  
- (3) Decidere se unificare Landing/intl con i18next (opzionale ma consigliato prima di 6 lingue).  
- (4) Inventario completo chiavi common e copertura per ogni macro-area (per non dimenticare parti dell’app).

### Come ridurre rischio / evitare patch sparse / non toccare logica critica

- Una wave per volta; solo sostituzione stringhe con t(key) e aggiunta chiavi in common; nessun refactor di logica.  
- Blacklist esplicita: non toccare login/logout logic, cancellazione account logic, IAP/StoreKit, BUZZ logic, BUZZ MAP logic, push, routing, auth flow.  
- QA obbligatoria dopo ogni wave su dispositivo reale per le aree toccate.

---

## 10. Piano step successivi

Dopo il hardening (Wave 1–5):

- **Quando sarà sicuro aggiungere spagnolo (es):** Dopo che (1) l’opzione "Deutsch" è rimossa o de è supportato, (2) non ci sono più hardcoded critici nelle aree auth, BUZZ, pagamenti, (3) un solo source of truth lingue e un solo storage. Poi: aggiungere `es` a SUPPORTED in i18n.ts, creare `src/locales/es/common.json` (copiando struttura en e traducendo), aggiungere SelectItem "Español" in SettingsPage e voce in LanguageSettings. QA completa su flussi critici in es.

- **Quando sarà sicuro aggiungere portoghese (pt) e tedesco (de):** Stesso criterio di es; per ciascuna lingua: SUPPORTED, file common, UI Select. **Non dimostrabile da codice** il tempo effettivo di traduzione e QA; la sicurezza dipende dal completamento hardening.

- **Tutte insieme o una per volta:** **Una per volta** riduce il rischio: si abilita una lingua, si fa QA, si correggono eventuali key mancanti o layout (es. DE più lungo), poi la successiva. Abilitare es/pt/de tutte insieme senza QA per ciascuna espone a regressioni (key mancanti, overflow layout).

- **Cosa manca prima di attivarle lato utente:** (1) File common per es, pt, de con tutte le chiavi tradotte (o fallback en); (2) SUPPORTED aggiornato; (3) UI aggiornata (Settings + LanguageSettings); (4) Nessuna lingua "fantasma" (selezionabile ma senza risorse). Verificare che i18n.init carichi le nuove risorse (static import o dynamic per non gonfiare bundle — attualmente static import; per 6 lingue potrebbe richiedere valutazione).

- **QA reale su iPhone:** Eseguire su dispositivo reale: cambio lingua in Impostazioni, riavvio app, verifica che tutte le stringhe nelle aree critiche (auth, BUZZ, mappa, pagamenti, profilo) siano nella lingua selezionata e che non ci siano key mancanti (spesso i18next mostra la key se manca la traduzione).

- **Lingue selezionabili ma non supportate:** Oggi il rischio è **de** in SettingsPage. Dopo hardening: rimuovere de dalla UI finché non c’è common per de; in generale, **non** mostrare in Select/Radio nessuna lingua che non sia in SUPPORTED e per cui non esista il file common corrispondente.

---

## 11. Stima del lavoro reale

- **Hardening (Wave 1–5):**  
  - File da toccare: ~55–75 (stima da inventario).  
  - Nuove chiavi da aggiungere in common: ~250–400 (toast, errori, auth, Buzz, PaymentMethodsPage, LanguageSettings, ecc.).  
  - Complessità: media–alta (molti file, flussi critici).  
  - Stima temporale: **best case** ~3–4 settimane (una persona, solo en/it/fr); **realistic** ~5–6 settimane (con QA per wave); **safe** ~7–8 settimane (incluso allineamento storage e documentazione).

- **Aggiunta 3 lingue (es, pt, de) dopo hardening:**  
  - Per ogni lingua: creazione common.json (~1340 chiavi), traduzione, aggiornamento SUPPORTED e UI, QA.  
  - Stima: **~2–3 settimane per lingua** (traduzione esterna + integrazione + QA) se fatto una per volta; **~6–9 settimane** per tutte e tre in sequenza.  
  - **Non dimostrabile da codice** il tempo effettivo di traduzione umana.

---

## 12. Top file da toccare DOPO (in ordine di priorità)

1. `src/pages/LanguageSettings.tsx` — titoli e toast  
2. `src/pages/SettingsPage.tsx` — rimozione de, eventuali label da common  
3. `src/pages/Login.tsx` — tutta la copy e toast  
4. `src/pages/Auth.tsx` — messaggi e toast  
5. `src/components/auth/StandardLoginForm.tsx` — errori e success  
6. `src/components/buzz/BuzzActionButton.tsx` — toast BUZZ  
7. `src/components/buzz/BuzzMainContent.tsx` — toast e copy  
8. `src/components/buzz/BuzzBriefingFlipOverlay.tsx` — "Tocca per l'audio"  
9. `src/pages/settings/PaymentMethodsPage.tsx` — descrizioni e toast  
10. `src/pages/ProfilePage.tsx` — toast e errori  
11. `src/components/profile/ProfileInfo.tsx` — toast e errori  
12. `src/pages/Subscriptions.tsx` — toast  
13. `src/components/command-center/CommandCenterHome.tsx` — toast  
14. `src/components/onboarding/OnboardingOverlay.tsx` — toast  
15. `src/pages/PaymentGold.tsx`, `PaymentSilver.tsx`, `PaymentBlack.tsx` — toast  
16. Altri file da inventario §6 (ReferralCard, StreakWidget, LotteryContent, ScratchWinModal, MapTiler3D, ecc.)

---

## 13. Blacklist file / moduli da non toccare nelle prime wave

- **Logica e flussi (solo sostituzione testi, zero refactor):**  
  - StoreKit / IAP / purchase flow / receipts / subscriptions  
  - Cancellazione account (logica e chiamate; DeleteAccountModalContent: solo testi se strettamente necessario)  
  - Notifiche push native (config, handler, VAPID)  
  - BUZZ: logica chiamata, stato, API, pagamento M1U per BUZZ  
  - BUZZ MAP: logica mappa, radius, API  
  - Auth: redirect, session, verifica email, Supabase auth  
  - Routing / navigation  

- **Config e dati:**  
  - Supabase schema / migration / RLS  
  - Feature flag, env, build settings, plist, Capacitor config  

- **File critici (no refactor; al massimo aggiunta chiavi o sostituzione stringa):**  
  - `src/i18n/i18n.ts`: non riscrivere detection; eventuale estensione SUPPORTED solo quando si aggiungono lingue  
  - Store (pulseBreaker, auth, ecc.)  
  - Service worker, push (sw.js, ecc.)

---

## 14. Verdetto finale secco

- **L’app è pronta per 3 nuove lingue (es, pt, de)?**  
  **No.** Prima serve hardening: un solo source of truth, UI coerente (nessun "Deutsch" senza risorse), sostituzione hardcoded critici (auth, Buzz, pagamenti, LanguageSettings), e allineamento storage/detection. Solo dopo sarà sicuro aggiungere es, pt, de una per volta con risorse common e QA.

- **Da dove partire davvero?**  
  **Wave 1:** rimuovere l’opzione "Deutsch" da SettingsPage e portare LanguageSettings (e eventuali label shell) su common. Poi **Wave 2** Auth/Login/Register, poi **Wave 3** BUZZ, poi **Wave 4** resto UI e toast, poi **Wave 5** polish e documentazione.

- **Meglio wave o mega patch unica?**  
  **Wave.** Una mega patch unica su decine di file e flussi critici (auth, BUZZ, IAP) aumenta il rischio di regressioni e rende il debugging difficile. Le wave consentono QA mirata e rollback circoscritto.

- **Cosa fare adesso e cosa NON fare adesso?**  
  **Adesso:** (1) Approvare questo piano e la priorità delle wave; (2) creare un inventario fine delle chiavi mancanti per Wave 1 e 2; (3) preparare le chiavi common per LanguageSettings e Auth (senza ancora applicare patch).  
  **Non fare adesso:** (1) Nessuna modifica a codice, config, assets, i18n resources; (2) non aggiungere es/pt/de in UI né in SUPPORTED; (3) non toccare login, logout, cancellazione account, IAP, BUZZ, BUZZ MAP, push, auth flow, routing; (4) non fare build, cap sync, commit, branch, tag in questa fase.

---

**Fine report. Read-only: nessuna modifica applicata.**

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
