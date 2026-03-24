# Audit forense i18n completo M1SSION — Read-only

**Data:** 2026-03-11  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Contesto:** App nativa iOS wrappata (Capacitor WKWebView).  
**Modalità:** Solo lettura — nessuna modifica, nessuna patch, nessun build/cap sync/commit.

---

## 1. Executive Summary

L’app dispone di **due sistemi i18n distinti**: (1) **react-i18next** con namespace `common` e file `src/locales/{en,it,fr}/common.json` (~1340 chiavi) — usato dalla maggior parte dell’app post-login; (2) **Landing/intl** con `useLandingTranslations` e `src/intl/translations.ts` (oggetto TS) — usato da Landing e CookieBanner. Esiste inoltre **intl/useI18n** che carica da `fetch('/locales/${lang}.json')` (public/locales) e dichiara supporto a 8 lingue (en, it, fr, es, de, pt, zh, ar), ma è usato solo da `useUserPlan.ts`. La **copertura reale** è mista: molte aree usano `useTranslation` e chiavi da `common`, ma **Login/Register**, **Buzz** (toast e copy), **Auth**, **LanguageSettings** (toast e titoli), **SettingsPage** (opzione "Deutsch" senza traduzioni common), e **decine di toast/alert** in tutta l’app sono **hardcoded** (spesso in italiano). I **termini brand** (M1SSION, BUZZ, PE, M1U, Pulse Breaker, AION, ecc.) compaiono sia in chiavi i18n sia in stringhe hardcoded; vanno trattati come **brand protected** e non tradotti. L’infrastruttura è **parzialmente robusta** per 3 lingue (en, it, fr); **non è pronta** per 6 lingue senza hardening: source of truth frammentato, incoerenza Settings (de non in common), e volume elevato di stringhe hardcoded. **Ordine consigliato:** Wave 1 shell/header/nav + LanguageSettings; Wave 2 Auth/Login/Register; Wave 3 Buzz/Buzz Map; Wave 4 restante UI e toast; Wave 5 polish e QA. **File/moduli da non toccare nelle prime wave:** flussi IAP/StoreKit, cancellazione account (solo testi), notifiche push native, logica BUZZ/BUZZ MAP.

---

## 2. Stato repo / branch / HEAD

| Elemento | Valore |
|----------|--------|
| **Branch** | `feat/pe-global-fullscreen-reward` |
| **HEAD** | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| **Working tree** | Modifiche locali presenti (non committate) — da `git status` iniziale |
| **Conferma** | **Read-only audit only** — nessuna modifica applicata, nessun branch/tag creato |

---

## 3. Mappa infrastruttura i18n

### 3.1 Libreria e stack

| Elemento | Dettaglio |
|----------|-----------|
| **Libreria principale** | i18next ^25.5.3, react-i18next ^16.0.0 |
| **Plugin detection** | i18next-browser-languagedetector ^8.2.0 (in package.json); in `src/i18n/i18n.ts` **non** usato: rilevazione custom con `getDeviceLocale()` e `getSavedLocale()` |
| **Bootstrap** | `src/i18n/i18n.ts`: `initI18n()` usa `getDefaultLocale()`, `resources` da import static di `src/locales/{en,it,fr}/common.json` |
| **Provider** | `main.tsx`: `import './i18n/i18n'` prima del render; `I18nextProvider i18n={i18n}` wrappa l’app |
| **Namespace** | Unico: `common`. `defaultNS: 'common'`, `ns: ['common']` |
| **Fallback** | `fallbackLng: 'en'` |
| **Lingue supportate (i18n.ts)** | Solo **en, it, fr** (`SUPPORTED = ['en','it','fr']`) |
| **Persistenza** | `localStorage`: chiave `m1_locale` (lingua), `m1_locale_mode` ('auto' \| 'manual') |
| **Cambio lingua runtime** | `setLocale(lng)`, `clearLocaleOverride()` in `src/i18n/i18n.ts`; `i18next.changeLanguage(lng)` |
| **Interpolazione** | `interpolation: { escapeValue: false }` |

### 3.2 File e directory coinvolti

| Ruolo | Path |
|-------|------|
| **Init/config i18n** | `src/i18n/i18n.ts` |
| **Risorse (main app)** | `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json` |
| **Landing (altro sistema)** | `src/intl/translations.ts` (oggetto `landingTranslations`: en, it, fr, es, de, pt, zh, ar), `src/hooks/useLandingTranslations.ts`, `src/intl/lang-detection.ts` |
| **useI18n (fetch public)** | `src/intl/useI18n.ts` — carica `fetch('/locales/${lang}.json')`; usato da `useUserPlan.ts` |
| **Public locales** | `public/locales/en.json`, `public/locales/it.json` (solo gdpr in en; struttura diversa da common) |
| **Language switcher UI** | `src/pages/LanguageSettings.tsx` (usa `getLocale`/`setLocale` da i18n + useTranslation; titoli/toast della pagina parzialmente hardcoded) |
| **Settings lingua** | `src/pages/SettingsPage.tsx`: Select con it, en, fr, **de** — valore "de" non supportato da `src/i18n/i18n.ts` |

### 3.3 Lingue attualmente supportate (da codice)

- **react-i18next (app principale):** **it, en, fr** (solo queste tre hanno `common.json` in src/locales).
- **Landing (intl/translations.ts):** en, it, fr, es, de, pt, zh, ar (8 lingue in oggetto TS).
- **intl/useI18n + public/locales:** dichiara 8 lingue; `public/locales/en.json` contiene solo blocco gdpr — **non** allineato a common.

### 3.4 Caricamento traduzioni

- **App principale:** static import in `i18n.ts`: `import en from '../locales/en/common.json'` (e it, fr). Tutto in bundle.
- **Landing:** oggetto TS `landingTranslations` in `intl/translations.ts` — niente lazy load.
- **useI18n (intl):** dynamic fetch `/locales/${lang}.json` con cache in memoria; fallback su `en` se richiesta fallisce.

### 3.5 Punto unico di verità

- **Elenco lingue app:** in `src/i18n/i18n.ts` → `SUPPORTED = ['en','it','fr']`. **NON** unico: LanguageSettings e intl dichiarano altre lingue.
- **Namespace:** unico `common` per i18next.
- **Fallback:** `en` in i18n.ts.
- **Detection:** `getDefaultLocale()` → se mode `manual` usa `getSavedLocale()`, altrimenti `getDeviceLocale()` (navigator).
- **Storage preferenza:** `m1_locale`, `m1_locale_mode` in localStorage.

### 3.6 Copertura architetturale

- **Robustezza:** Parziale. Per en/it/fr e componenti che usano `t('key')` funziona; coerenza compromessa da: (1) secondo sistema (Landing/intl), (2) useI18n che punta a public/locales con contenuto minimo, (3) SettingsPage che mostra "Deutsch" senza avere common per de.
- **Scalabilità a 6 lingue:** **No** senza hardening: andrebbero allineati SUPPORTED, risorse common per es, de, pt, e rimossi/aggiornati i riferimenti a de/zh/ar dove non ancora tradotti.

---

## 4. Lingue attuali e source of truth

| Contesto | Lingue | Source of truth |
|----------|--------|------------------|
| **App (i18next)** | en, it, fr | `src/i18n/i18n.ts` (SUPPORTED) + `src/locales/{en,it,fr}/common.json` |
| **Landing** | en, it, fr, es, de, pt, zh, ar | `src/intl/translations.ts` (landingTranslations) |
| **LanguageSettings** | it, en, fr (nomi lingua hardcoded) | `src/pages/LanguageSettings.tsx` array `languages` |
| **SettingsPage** | it, en, fr, **de** (label "Deutsch") | `src/pages/SettingsPage.tsx` SelectItem — **de non in common** |

---

## 5. Autofind hardcoded — mappa completa

### A. UI visibile (esempi critici)

| File | Tipo | Esempio | Visibilità | Severità |
|------|------|---------|------------|----------|
| **Login.tsx** | Titoli, CTA, link | "Tools for", "Real-World", "Treasure Hunting", "Sign Up", "Log In", "Create Account", "Back", "Terms of Use", "Privacy Policy", "Sign up with Apple", "or", "Don't have an account?" | Sì | Alta |
| **Login.tsx** | Toast | "Email verificata", "La tua email è stata verificata con successo." | Sì | Alta |
| **LanguageSettings.tsx** | Titoli, pulsanti | `texts.it/en/fr` per title, select, save; toast "Lingua Aggiornata" / "Language Updated" | Sì | Media |
| **SettingsPage.tsx** | Select lingua | "Italiano", "English", "Français", "Deutsch" (de non supportato in common) | Sì | Media |
| **BuzzMainContent.tsx** | Toast + copy | "Accesso richiesto", "Devi effettuare l'accesso...", "Buzz non disponibile", "Hai raggiunto il limite..." | Sì | Alta |
| **BuzzActionButton.tsx** | Toast | "Devi essere loggato per usare il BUZZ gratuito", "Nessun credito BUZZ disponibile", "Errore durante l'uso del BUZZ gratuito", "BUZZ gratuito utilizzato!", "Devi essere loggato per utilizzare BUZZ!", "Errore nel processare il pagamento M1U", "Errore durante il BUZZ. Riprova." | Sì | Alta |
| **BuzzBriefingFlipOverlay.tsx** | Label | "Tocca per l'audio" | Sì | Media |
| **Auth.tsx** | Messaggi | "Caricamento...", "Quiz saltato. Riapparirà domani...", titoli schermate | Sì | Alta |
| **StandardLoginForm.tsx** | Toast/errori | "Tutti i campi sono obbligatori", "Formato email non valido", "Errore di login", "Login effettuato con successo", "Errore di sistema" | Sì | Alta |
| **ProfilePage.tsx** | Toast | "Errore nel caricamento del profilo", "Logout effettuato con successo", "Errore durante il logout", "Avatar aggiornato" | Sì | Alta |
| **settings/PaymentMethodsPage.tsx** | Toast/descrizioni | "I pagamenti per contenuti digitali sono gestiti tramite acquisti in-app Apple.", "La carta è stata rimossa con successo.", "Impossibile rimuovere la carta..." (tutto IT) | Sì | Alta |
| **CommandCenterHome.tsx** | Toast | "Indizio acquistato con successo!", "Crediti insufficienti...", "Nota aggiunta al diario" | Sì | Media |
| **OnboardingOverlay.tsx** | Toast | "+50 PE accreditati per aver completato il tutorial!" | Sì | Media |
| **PaymentGold/Silver/Black** | Toast | "Errore di pagamento", "Metodo Alternativo" | Sì | Media |
| **Subscriptions.tsx** | Toast | "Sistema di pagamento non disponibile", "Errore nel sistema di pagamento..." | Sì | Alta |
| **ReferralCard, StreakWidget, LotteryContent, ScratchWinModal, ProfileInfo, MarkerRewardManager, MapTiler3D, LotterTest** | Toast/errori | Molti messaggi in italiano o inglese hardcoded | Sì | Media |

### B. Messaggi di stato (loading, empty, error)

- Presenti in molti componenti senza `useTranslation`: es. "Caricamento...", "No data available" (quest’ultimo può essere in common), "Errore", "Loading...".
- **common.json** contiene chiavi per loading, no_data, error, empty states — non tutti i componenti le usano.

### C. Messaggi dinamici (toast, alert, modal, onboarding)

- Vedi tabella sopra: toast in **BuzzActionButton**, **BuzzMainContent**, **Login**, **Auth**, **StandardLoginForm**, **ProfilePage**, **Payment***, **Subscriptions**, **CommandCenterHome**, **OnboardingOverlay**, **ReferralCard**, **StreakWidget**, **LotteryContent**, **ScratchWinModal**, **ProfileInfo**, **PaymentMethodsPage**, **MapTiler3D**, **LotteryTest**, **MarkerRewardManager**, **DevAreasPanel/DevNotesPanel** (se visibili in prod), ecc.

### D. Testi da hook/util

- **useUserPlan.ts** usa `useI18n` (intl) — quindi dipende da public/locales, non da common.
- **getLanguageDisplayName** in `intl/lang-detection.ts`: nomi lingue hardcoded (English, Italiano, Français, Español, Deutsch, Português, 中文, العربية).
- Helper che ritornano label: vari componenti costruiscono stringhe (es. "Level {{n}}", "{{count}} days") — parte già con t() e interpolazione, parte ancora hardcoded.

### E. Validazione / form

- **StandardLoginForm**: errori e success hardcoded (vedi sopra).
- **PaymentMethodsPage**: messaggi di validazione/feedback in italiano.
- **common.json** ha chiavi per required_fields, fill_all_fields, passwords_not_matching, password_too_short, ecc. — non ovunque usate.

### F. Runtime / feedback di gioco

- **Buzz**: toast e copy in BuzzActionButton/BuzzMainContent hardcoded (IT).
- **BUZZ MAP**: componenti mappa e pill usano in parte t() (chiavi mapPills.*, game_* in common) — verificare ogni file singolarmente per residui.
- **Pulse Breaker**: usa `useTranslation` e t() (PulseBreaker.tsx).
- **PE/CE modal, reward overlay**: usano useTranslation (GlobalPERewardOverlay, PulseBarReward).
- **Mission popup, daily mission, cipher/word duel/signal pattern**: chiavi in common (mission.popup.*, daily_mission.*, cipher_drill.*, daily.word_duel.*, daily.signal_pattern.*) — copertura presente; eventuali stringhe fuori da t() da verificare.

### G. Pagine statiche / informative

- **Settings**: SettingsContent e sezioni usano useTranslation e chiavi section_*, settings_modal_*, ecc.
- **Profile**: AgentProfileContent usa useTranslation; ProfilePage e ProfileInfo hanno toast/errori hardcoded.
- **Help, Legal, Notifications, Leaderboard, Shop, Learn, How it works**: in gran parte con useTranslation e common; alcuni toast/empty state ancora hardcoded.
- **Buzz page**: BuzzPage usa useTranslation; BuzzMainContent e BuzzActionButton no (toast/copy hardcoded).
- **Home, Diary, Console**: CommandCenterHome, AgentDiary, NextAction, ecc. mix di t() e stringhe residue.

### Riepilogo severità e rischio

- **Alta:** Login, Register (se presente), Auth, Buzz (azione + pagina), cancellazione account (solo testi — DeleteAccountModalContent già i18n), pagamenti/toast IAP, LanguageSettings/Settings lingua.
- **Media:** Toast sparsi (profile, onboarding, command center, shop, lottery), PaymentMethodsPage, SettingsPage (opzione de).
- **Bassa:** Debug/sandbox, label minori, placeholder dove già esiste chiave in common.

---

## 6. Copertura reale per macro-area

| Macro-area | Stato | % qualitativa | Problemi principali | File principali |
|------------|--------|----------------|----------------------|------------------|
| **Shell globale** | Parzialmente i18n | ~75% | Header/nav usano t(); LanguageSettings e toast cambio lingua hardcoded; alcuni pill/label residui | BottomNavigation, UnifiedHeader, LanguageSettings, App |
| **Auth** | Quasi tutta hardcoded | ~15% | Login, Register, Auth: titoli, CTA, toast, link, quiz — nessun useTranslation | Login.tsx, Auth.tsx, StandardLoginForm.tsx |
| **Home / Command center** | Mista | ~70% | Molte chiavi in common; toast e messaggi in CommandCenterHome, OnboardingOverlay hardcoded | AppHome, CommandCenterHome, ActiveMissionBox, AgentDiary, NextAction*, OnboardingOverlay |
| **BUZZ** | Mista / incoerente | ~50% | BuzzPage usa t(); BuzzMainContent e BuzzActionButton: toast e copy tutti IT hardcoded; briefing "Tocca per l'audio" | BuzzPage, BuzzMainContent, BuzzActionButton, BuzzBriefingFlipOverlay |
| **BUZZ MAP / Mappa** | Parzialmente i18n | ~75% | Chiavi mapPills.*, game_*; alcuni overlay/label da verificare; MapTiler3D toast IT | Map*, RewardCounterPill, SearchLocationPill, BuzzMapAreas, MapTiler3D |
| **Profile, Notifications, Leaderboard, Games, How it works** | Parzialmente i18n | ~70% | Sezioni settings e contenuti con t(); ProfilePage/ProfileInfo toast e errori hardcoded; Notifications/Leaderboard in gran parte i18n | ProfilePage, ProfileInfo, AgentProfileContent, Notifications*, LeaderboardPage, ShopContent, LearnContent |
| **Subscriptions, Store, Wallet, Cashback** | Parzialmente i18n | ~65% | Payment* e M1U shop usano t(); PaymentMethodsPage (settings) e Subscriptions toast/descrizioni IT; IAP copy in common | PaymentGold/Silver/Black, PaymentMethods, M1UPaymentContent, Subscriptions, CashbackVaultPill |
| **Pulse system (PE, Pulse Breaker)** | Parzialmente i18n | ~80% | PE overlay, Pulse Breaker, streak usano t(); alcune label/toast potrebbero essere residue | GlobalPERewardOverlay, PulseBarReward, PulseBreaker, StreakModal, StreakWidget |
| **Tutorial, Onboarding, Popup promozionali** | Mista | ~60% | Chiavi tutorial_*, motivation_* in common; OnboardingOverlay toast IT; altri popup da campionare | OnboardingOverlay, MotivationalPopup, BriefingFlipOverlay |
| **Pagine secondarie / residuali** | Mista | Variabile | Forum, HallOfWinners, Battle, sandbox, admin: molte senza useTranslation o con toast hardcoded | Vari |

---

## 7. Punti pericolosi / rischi layout / rischi regressione

- **Stringhe concatenate in modo fragile:** Diversi toast costruiti con `'Errore: ' + error.message` o descrizioni fisse — sostituire con chiavi uniche e eventuale interpolazione.
- **SettingsPage: SelectItem value="de":** L’utente può selezionare "Deutsch" ma `src/i18n/i18n.ts` non ha `de` in SUPPORTED né risorse common per de — comportamento indefinito o fallback silenzioso su en.
- **Due sistemi i18n (i18next vs intl/useLandingTranslations vs useI18n):** Rischio confusione e doppie chiavi; useUserPlan dipende da useI18n (public/locales) non da common.
- **LanguageSettings:** Toast e titoli della pagina costruiti con oggetto locale per lingua invece di t() — da allineare a common.
- **Layout stretti (DE/PT/ES):** CTA e pill (es. "BUZZ", "BUZZ MAP", "PULSE BREAKER") con testo più lungo potrebbero andare in overflow su navbar/tab — da testare su dispositivo reale dopo aggiunta lingue.
- **Modali critici (delete account, IAP, logout):** DeleteAccountModalContent già usa t(); non modificare logica, solo eventuale aggiunta chiavi mancanti; IAP e flussi StoreKit non toccare logica.
- **Form validation sparse:** StandardLoginForm, PaymentMethodsPage, ProfileInfo — errori e success non centralizzati in common.
- **Brand in stringhe localizzabili:** Molte chiavi contengono "M1SSION", "BUZZ", "M1U", "PE", "Pulse Breaker", "AION" — da mantenere come brand protected (non tradurre i termini, eventuale token).

---

## 8. Brand protected terms

Termini che **non** devono essere tradotti o alterati (e dove compaiono):

| Termine | Dove compaiono | Note |
|---------|----------------|------|
| **M1SSION** | common.json (settings_modal_subtitle, learn_*, home_*, help_footer, delete_account_modal_*, ecc.), Login.tsx (brand), Landing, intl | Già in chiavi; non proporre traduzione del termine |
| **BUZZ** | common.json (cta_buzz, cta_show_map, game_buzz_*, buzz_*, tutorial_buzz_*, notifications_filter_buzz, motivation_buzz_*), BuzzActionButton/BuzzMainContent (toast) | Protetto; in frasi localizzabili usare come token |
| **BUZZ MAP** | common.json (cta_show_map, mapPills.*, game_buzz_map_*, tutorial_buzz_map_*), UI mappa | Idem |
| **AION** | common.json (aion_*, tutorial_aion_*, motivation_aion_*, help_aion_*), IntelChatPanel | Idem |
| **MCP** | Riferimenti tecnici / label se presenti | Protetto |
| **PE** | common.json (pulse_energy, pe_reward, streak_pe_*, game_pe_*, source_*), PulseBar, overlay | Pulse Energy come concetto; "PE" non tradurre |
| **M1U** | common.json (earn_m1u, iap_*, shop_*, game_m1u_*, learn_m1uprizes_*), toast e UI shop | Idem |
| **Pulse Breaker** | common.json (source_pulse_breaker_*, mission.popup.pulseBreakerHint, pulseBreaker.disclaimerPeOnly), PulseBreaker.tsx | Protetto |

Se in futuro si localizzano frasi che contengono questi termini, trattarli come **token non traducibili** (es. "Fai un BUZZ" → "Do a BUZZ" / "Faites un BUZZ", non tradurre "BUZZ").

---

## 9. Ordine ottimale di intervento (wave)

- **Wave 1 — Shell globale**
  - **Scope:** Header, bottom nav, menu, modali globali (toast generici), **LanguageSettings** (titoli, toast, uso unico di common), **SettingsPage** (rimuovere "Deutsch" o aggiungere de in common solo se si abilita de).
  - **File principali:** BottomNavigation.tsx, UnifiedHeader (solo testi), LanguageSettings.tsx, SettingsPage.tsx (Select lingua), i18n.ts (eventuale allineamento SUPPORTED/UI).
  - **Rischio:** Basso. **Non toccare:** logica cambio lingua, storage, routing.
  - **QA:** Cambio lingua da Impostazioni e da LanguageSettings; verifica fallback en.

- **Wave 2 — Auth, Login, Register**
  - **Scope:** Login.tsx, Auth.tsx, StandardLoginForm.tsx, Register.tsx (se usato), EmailVerificationFlow — tutti i testi visibili e toast.
  - **File principali:** Login.tsx, Auth.tsx, StandardLoginForm.tsx, Register.tsx.
  - **Rischio:** Medio (flusso critico). **Non toccare:** logica auth, redirect, session.
  - **QA:** Login, signup, recupero password, verifica email su dispositivo reale.

- **Wave 3 — BUZZ e BUZZ MAP**
  - **Scope:** BuzzMainContent, BuzzActionButton, BuzzBriefingFlipOverlay (e altri componenti Buzz/Map con copy residua); chiavi common per tutti i messaggi e toast.
  - **File principali:** BuzzMainContent.tsx, BuzzActionButton.tsx, BuzzBriefingFlipOverlay.tsx, BuzzPage.tsx (verifica), componenti mappa con label/toast.
  - **Rischio:** Medio. **Non toccare:** logica BUZZ, chiamate API, mappa.
  - **QA:** Flusso BUZZ, messaggi success/errore, BUZZ MAP overlay e pill.

- **Wave 4 — Profile, Notifications, Leaderboard, Games, Subscriptions, Wallet, Toast sparsi**
  - **Scope:** ProfilePage, ProfileInfo, Notifications*, Leaderboard*, Shop*, Subscriptions, PaymentMethodsPage (settings), PaymentGold/Silver/Black, CommandCenterHome, OnboardingOverlay, ReferralCard, StreakWidget, LotteryContent, ScratchWinModal, MarkerRewardManager, altri toast individuati in Fase 2.
  - **File principali:** Elenco da Fase 2 (toast e UI visibile).
  - **Rischio:** Medio (molti file). **Non toccare:** IAP/StoreKit, cancellazione account (solo testi già in DeleteAccountModalContent), notifiche push native.
  - **QA:** Profilo, notifiche, leaderboard, acquisti, toast in scenari reali.

- **Wave 5 — Polish e QA finale**
  - **Scope:** Verifica chiavi mancanti, fallback, lunghezze (DE/ES/PT), accessibilità, brand protected.
  - **Rischio:** Basso.
  - **QA:** Tutte le lingue target su iPhone reale; layout CTA/pill; flussi critici.

---

## 10. Stima precisa del lavoro

| Metrica | Stima | Note |
|---------|--------|------|
| **File da toccare** | ~55–75 | Pagine principali (~20), componenti con toast/copy (~25–35), i18n/landing (~5), sezioni settings (~5–10) |
| **Componenti** | ~50–65 | Stima da file sopra + sottocomponenti con stringhe |
| **Hook/helper** | ~5–10 | useUserPlan (useI18n), useLandingTranslations, getLanguageDisplayName, eventuali formatter |
| **Stringhe/chiavi** | ~250–400 | Nuove chiavi da aggiungere per hardcoded (toast, errori, label, Auth/Login, Buzz, PaymentMethodsPage, ecc.); common ne ha già ~1340 |
| **Complessità totale** | Media–Alta | Due sistemi da tenere coerenti; molti file con poche stringhe ciascuno; flussi critici (auth, BUZZ, IAP) |
| **Per wave** | | |
| Wave 1 | Basso | ~8–12 file, ~30–50 chiavi |
| Wave 2 | Medio | ~4–6 file, ~40–60 chiavi, QA auth |
| Wave 3 | Medio | ~6–10 file, ~25–40 chiavi, QA BUZZ |
| Wave 4 | Alto | ~30–45 file, ~120–200 chiavi, QA estesa |
| Wave 5 | Basso | Verifica e fix, nessuna nuova feature |

- **Best case:** ~3–4 settimane (una persona, solo en/it/fr, scope ridotto).
- **Realistic case:** ~5–7 settimane (stesso scope, 6 lingue richiedono anche es/de/pt e QA layout).
- **Safe case:** ~8–10 settimane (include allineamento intl/useI18n, rimozione "de" o supporto de, QA completa su dispositivo).

*Le cifre sono orientative; verificare con inventario stringhe per componente.*

---

## 11. Verdict finale

1. **L’app oggi ha un’infrastruttura i18n abbastanza solida da scalare a 6 lingue?**  
   **No.** Va hardenata: unificare source of truth lingue, allineare Settings (rimuovere de o aggiungere risorse de), e sostituire l’elevato numero di stringhe hardcoded (in particolare Auth, Buzz, toast).

2. **Dove sono i maggiori hardcoded residui?**  
   Login/Register/Auth (tutta la copy e toast); Buzz (BuzzActionButton, BuzzMainContent, briefing); LanguageSettings (toast e titoli); PaymentMethodsPage e Subscriptions (toast/descrizioni); ProfilePage/ProfileInfo (toast/errori); StandardLoginForm; decine di toast in CommandCenterHome, OnboardingOverlay, Shop, Lottery, ReferralCard, StreakWidget, MapTiler3D, ecc.

3. **Quali sono le aree più pericolose da localizzare?**  
   Auth/Login (regressione accesso); flussi IAP e StoreKit (solo testi, non logica); cancellazione account (solo testi); BUZZ e BUZZ MAP (feedback utente e stato).

4. **Qual è il miglior ordine di rollout?**  
   Wave 1 shell + LanguageSettings; Wave 2 Auth/Login/Register; Wave 3 Buzz/Buzz Map; Wave 4 restante UI e toast; Wave 5 polish e QA.

5. **Meglio tutto insieme o per wave?**  
   **Per wave**, per limitare rischio e permettere QA mirata su flussi critici.

6. **Wave obbligatorie vs opzionali?**  
   Wave 1 e 2 sono **obbligatorie** per coerenza shell e accesso; Wave 3 e 4 **fortemente consigliate** per UX; Wave 5 **obbligatoria** prima di rilascio multilingua.

7. **Stima realistica del lavoro?**  
   Vedi §10: realistic case 5–7 settimane (6 lingue + QA).

8. **Termini brand da bloccare?**  
   M1SSION, BUZZ, BUZZ MAP, AION, MCP, PE, M1U, Pulse Breaker (e nomi sistema/brand analoghi) — non tradurre; in frasi localizzate usare come token.

9. **File/moduli da non toccare nelle prime wave?**  
   Logica IAP/StoreKit/purchase flow; logica cancellazione account; notifiche push native; logica BUZZ/BUZZ MAP (solo testi); routing e auth flow (solo stringhe).

10. **Piano per i18n completo senza rompere nulla?**  
    Eseguire le wave in ordine; per ogni wave: (1) aggiungere solo chiavi in common (e risorse it/fr); (2) sostituire stringhe con t(); (3) non modificare logica né flussi critici; (4) QA su dispositivo reale; (5) prima di abilitare es/de/pt, aggiungere risorse common e allineare SUPPORTED e UI (rimuovere "Deutsch" da Settings finché de non è pronto).

---

## 12. Top file da toccare DOPO (priorità)

1. **src/pages/Login.tsx** — tutta la copy e toast  
2. **src/pages/Auth.tsx** — messaggi e toast  
3. **src/components/auth/StandardLoginForm.tsx** — errori e success  
4. **src/components/buzz/BuzzActionButton.tsx** — toast BUZZ  
5. **src/components/buzz/BuzzMainContent.tsx** — toast e copy  
6. **src/pages/LanguageSettings.tsx** — titoli e toast  
7. **src/pages/SettingsPage.tsx** — Select lingua (de)  
8. **src/pages/settings/PaymentMethodsPage.tsx** — descrizioni e toast  
9. **src/pages/ProfilePage.tsx** — toast e errori  
10. **src/components/profile/ProfileInfo.tsx** — toast e errori  
11. **src/pages/Subscriptions.tsx** — toast  
12. **src/components/command-center/CommandCenterHome.tsx** — toast  
13. **src/components/onboarding/OnboardingOverlay.tsx** — toast  
14. **src/components/buzz/BuzzBriefingFlipOverlay.tsx** — "Tocca per l'audio"  
15. **src/pages/PaymentGold.tsx**, **PaymentSilver.tsx**, **PaymentBlack.tsx** — toast  

(Segue elenco esteso da §5 per Wave 4.)

---

## 13. Blacklist file/moduli da non toccare nelle prime wave

- **Logica e flussi:**  
  - StoreKit / IAP / purchase flow (solo sostituzione testi visibili, senza cambiare logica)  
  - Cancellazione account (logica e chiamate; solo testi in DeleteAccountModalContent se mancanti)  
  - Notifiche push native (config e handler)  
  - BUZZ: logica di chiamata, stato, API  
  - BUZZ MAP: logica mappa, radius, API  
  - Auth: redirect, session, verifica email (solo stringhe UI)  
- **Config e routing:**  
  - Routing (path e guard)  
  - Config feature flag e env  
- **File critici (no refactor):**  
  - `src/i18n/i18n.ts`: solo eventuale estensione SUPPORTED/risorse, non riscrittura detection  
  - `src/stores/*` (pulseBreaker, auth, ecc.)  
  - Service worker e push (sw.js, VAPID, ecc.)

---

## Tabella riepilogativa per area

| Area | Stato attuale | Priorità | Rischio | Wave consigliata |
|------|----------------|----------|---------|-------------------|
| Shell (header, nav, modali globali) | Parzialmente i18n | Alta | Basso | 1 |
| LanguageSettings + Settings lingua | Parziale / incoerente (de) | Alta | Basso | 1 |
| Auth, Login, Register | Quasi tutta hardcoded | Alta | Medio | 2 |
| BUZZ (azione + pagina) | Mista; toast/copy IT | Alta | Medio | 3 |
| BUZZ MAP / Mappa | Parzialmente i18n | Alta | Medio | 3 |
| Profile, Notifications, Leaderboard | Parzialmente i18n | Media | Basso | 4 |
| Subscriptions, Store, Wallet, Payment methods | Parzialmente i18n | Alta | Medio | 4 |
| Toast sparsi (Command center, Shop, Lottery, Onboarding) | Molti hardcoded | Media | Basso | 4 |
| Pulse, PE, Pulse Breaker | Parzialmente i18n | Media | Basso | 4 |
| Tutorial, Onboarding, Popup | Mista | Media | Basso | 4 |
| Polish, fallback, layout DE/ES/PT | Da verificare | Media | Basso | 5 |

---

**Fine report. Nessuna modifica applicata; nessun build, cap sync o commit eseguito.**

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
