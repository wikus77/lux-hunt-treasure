# M1SSION™ — Full App Intelligence Audit

**Target:** iOS Native Wrapper (Capacitor WKWebView) · App Store ready  
**Modalità:** Read-only · Nessuna modifica al codice  
**Output:** Conoscenza totale + piano miglioramento con percentuali  
© 2026 M1SSION™ – NIYVORA KFT™

---

## Indice

1. [FASE 0 — Inventario](#fase-0--inventario)
2. [FASE 1 — Cos'è M1SSION](#fase-1--cosè-m1ssion)
3. [FASE 2 — Architettura & Flows](#fase-2--architettura--flows)
4. [FASE 3 — Analisi Quality](#fase-3--analisi-quality)
5. [FASE 4 — Miglioramento Esponenziale](#fase-4--miglioramento-esponenziale)
6. [FASE 5 — Scoreboard Finale](#fase-5--scoreboard-finale)
7. [Missing Inputs (minimi)](#missing-inputs-minimi)

---

## FASE 0 — Inventario

### 0.1 Route / Schermate principali

| Route / Schermata | Scopo | Dipendenze | Rischi / Bug noti | KPI impattati |
|------------------|--------|------------|-------------------|----------------|
| `/` | Root: redirect a Landing/Login/Home in base ad auth e subscription | Auth, subscription check, Capacitor detection | Timeout subscription check (3s fail-open); black screen su iOS se blocking | Session length, bounce |
| `/landing` | Landing marketing (web) | — | Solo web; native va a login | Conversion |
| `/login`, `/register` | Auth | Supabase Auth, Apple/Google OAuth, Face ID (iOS) | Lock contention post-login se molti consumer partono insieme | Conversion |
| `/home` | Home principale (Command Center) | Auth, profile, M1U, mission enrollment, streak, cashback, notifiche, map-first redirect | Lock timeout a bootstrap; first-session redirect a map | Retention, session length |
| `/map-3d-tiler`, `/buzz-map`, `/living-map-3d` | Mappa 3D / Buzz Map | Auth, geolocation, user_map_areas, buzz_map_actions, pricing | Lock su getSession in pricing; schema DB (meta, mission_enrollments.id) se migration non applicata | Retention, conversion M1U |
| `/buzz` | Pagina BUZZ (azione core) | useBuzzCounter, useActiveMissionEnrollment, useBuzzStats, Edge handle-buzz-press | Gate “Start Mission” disabilitato; prezzo da useBuzzCounter | Conversion, retention |
| `/intelligence`, `/intelligence/rag`, sottorotte | Modulo Intel (coordinate, clue, radar, final shot) | Auth, realtime, Norah | Realtime a bootstrap se montato | Session length |
| `/notifications` | Centro notifiche | user_notifications, realtime | Tabella `notifications` errata (fix: user_notifications) applicato in ClueMilestoneWatcher | Retention |
| `/profile`, `/settings/*` | Profilo e impostazioni | Auth, profiles, payment methods, legal, delete account | RLS admin_logs su insert; delete-account-v2 Edge Function | Trust, compliance |
| `/subscriptions`, `/choose-plan`, `/subscriptions/{silver,gold,black,titanium}` | Abbonamenti e piani | SUBSCRIPTIONS_STEALTH flag; Stripe (web) / IAP (native) | Stealth = true nasconde tutto; IAP acknowledge “already finished” gestito | Conversion, revenue |
| `/dna` | M1SSION DNA (profilo agente) | agent_dna, lazy THREE.js | Lock timeout getDna; NaN risk su dimensioni canvas | Session length |
| `/leaderboard`, `/winners` | Classifiche e vincitori | profiles, rank, PE | — | Retention |
| `/battle`, `/battle/:battleId` | Battle (lobby + arena) | Battles, realtime | — | Retention |
| `/mission-intro` | Intro missione post-login | — | No ProtectedRoute per evitare loop | Onboarding |
| `/dev/scratch-win`, `/test/lottery` | Scratch & lottery (production/dev) | Store compliance mode (deterministic) | Solo se STORE_COMPLIANCE_MODE | — |
| `/qr-win` | QR Win (gratta e vinci QR) | — | Production | Conversion |
| Admin: `/admin/*`, `/panel/*` | Admin e panel | role admin/owner | — | — |
| Legal: `/terms`, `/privacy-policy`, `/cookie-policy`, `/game-rules`, ecc. | Legal e policy | — | — | Compliance |

### 0.2 Hook, store e servizi principali

| Tipo | Nome | Scopo | Rischi / Note |
|------|------|--------|----------------|
| **Auth** | AuthProvider, useUnifiedAuth, useAuth, use-auth-session-manager | Session, user, authReady, hydration | Single-flight getSession/getUser; authReady gating per realtime |
| **Auth** | getSessionSingleFlight, getUserSingleFlight (authSingleFlight.ts) | Deduplica getSession/getUser a bootstrap | Riduce lock contention |
| **Profile** | useProfileRealtime, useProfileImage, useProfileBasicInfo, useGlobalProfileSync | Profilo e avatar | Realtime e getSession gated da authReady |
| **Mission** | useActiveMissionEnrollment, useMissionStatus | Enrollment missione, stato | mission_enrollments.id richiesto (migration) |
| **M1U / Economy** | useM1UnitsRealtime, useBuzzMapPricingNew, useBuzzCounter, useBuzzGrants | Crediti M1U, prezzi Buzz/Buzz Map, free buzz | Lock; pricing channel; user_map_areas, buzz_grants, user_clues |
| **Pulse / Rank** | useAgentEnergy, useHierarchyRank, useAwardPE | PE, rank agente, award e record_pe_daily_action | RPC try/await/catch (no .catch chain); gated da authReady |
| **Buzz** | useBuzzStats | Statistiche buzz | — |
| **Cashback / Wallet** | useCashbackWallet | Cashback | getSession |
| **Streak** | StreakPill / streak logic | Streak giornaliero | — |
| **Notifiche** | useNotificationManager, useRealTimeNotifications | Notifiche e realtime | user_notifications |
| **IAP** | iapService (init, getProducts, purchase, validatePurchaseWithServer, finishTransaction) | Acquisti in-app (Capgo) + validazione Supabase | acknowledgePurchase “already finished” trattato come success |
| **Store (Zustand)** | navigationStore, mapStore, pulseBreakerStore, entityOverlayStore, prizeIntroStore, norah/store | Navigazione, mappa, pulse breaker, overlay, Norah | — |
| **Realtime** | useProfileRealtime, useM1UnitsRealtime, useActiveMissionEnrollment, useHierarchyRank, useAgentEnergy, useBuzzMapPricingNew | Canali Supabase Realtime | Tutti gated da authReady dove applicabile |

### 0.3 Edge Functions (Supabase) rilevanti

| Function | Scopo | Chiamata da |
|----------|--------|-------------|
| delete-account-v2 | Eliminazione account (5.1.1(v)) | Settings/Legal, DeleteAccountModal |
| handle-buzz-press | Registra buzz e applica costi/ricompense | BuzzPage / buzz flow |
| handle-buzz-map, buzz-map-resolve-v2 | Buzz Map: genera area, clue | Map/Buzz Map flow |
| verify-iap-purchase, validate-iap, credit-m1u-purchase | Validazione IAP e accredito M1U | iapService |
| register-push-token, send-native-push, chat-push-notify, auto-push-cron | Push native e cron | nativePush, backend |
| claim-marker-reward, claim-welcome-bonus, cashback-claim | Claim reward e bonus | UI reward/cashback |
| norah-chat-v2, rag-search, norah-answer | Norah / Intel | Intelligence, assistente |
| launch-new-mission, enroll-mission-of-the-month, reset-mission | Missioni | Mission intro / admin |
| stripe-create-payment-intent, stripe-webhook | Stripe (web) | Checkout web |

### 0.4 Integrazioni

| Integrazione | Uso | Note iOS |
|--------------|-----|----------|
| **Supabase** | Auth, DB (PostgREST), Realtime, Storage (avatars), Edge Functions | Lock auth-token; RLS su tutte le tabelle sensibili |
| **Stripe** | Pagamenti web (subscription, one-off) | STRIPE_NATIVE_DISABLED = true su Capacitor → solo IAP |
| **Capgo Native Purchases** | IAP Apple/Google | acknowledgePurchase “already finished” gestito |
| **Push** | FCM, VAPID, Capacitor Push (APNs) | NATIVE_PUSH_ENABLED; token in push_tokens |
| **Mappe** | Leaflet, MapLibre, MapTiler 3D (sandbox), Living Map | Geolocation, user_map_areas, buzz_map_actions |
| **i18n** | react-i18next (en, it, fr) | — |
| **Analytics** | GA4, initAnalytics, track | — |
| **Sentry** | Error tracking | — |
| **Face ID** | Login biometrico (iOS) | Message handler in native |

### 0.5 Schema Supabase (tabelle principali)

- **Auth/Profile:** profiles, user_roles, avatars (storage)
- **Mission:** missions, mission_enrollments, user_mission_status
- **Economy:** user_credits (M1U), buzz_grants, user_buzz_counter, user_buzz_map_counter, user_clues, buzz_map_actions, payment_transactions, subscriptions
- **Pulse/Rank:** agent_ranks, rank_history, pulse_events (RPC award_pulse_energy, record_pe_daily_action)
- **Notifiche:** user_notifications, push_tokens, scheduled_notifications, webpush_subscriptions
- **Map:** user_map_areas, buzz_game_targets
- **Battle:** battles, battle_participants, battle_audit
- **Legal/Admin:** admin_logs, legal_documents, security_audit_log

### 0.6 Asset / animazioni / font

- **Font:** Inter, Orbitron, VT323, Audiowide, Exo 2 (Google Fonts)
- **Animazioni:** Framer Motion, GSAP, Lottie, canvas-confetti
- **Audio:** Howler, BUZZMAP.mp3, TTS (Edge)
- **3D:** Three.js, @react-three/fiber (DNA, sandbox); modelli .glb rimossi (Agent Lab → “Coming soon”)
- **Impatto:** Bundle significativo; lazy load su DNA e pagine admin; font e CSS (ios-native.css, soft-native.css) critici per UX iOS

---

## FASE 1 — Cos'è M1SSION

### Definizione (1 pagina)

**M1SSION™** è un’app mobile (iOS nativa wrappata con Capacitor WKWebView) di **caccia al tesoro geolocalizzata** e **missioni a tempo**, con economy interna (M1U), progressione (Pulse Energy, rank, streak), notifiche push e acquisti in-app. Il giocatore è un “agente” che partecipa a missioni, usa il **BUZZ** per scoprire indizi, esplora la **Buzz Map** (mappa 3D/aree), accumula **M1U** (crediti) e può convertirli in acquisti reali o premi. L’app è pensata per App Store (IAP, account deletion, privacy, no Stripe su native).

### Core loop di gioco (10 righe)

1. Login/registrazione (email, Apple, Google, Face ID).
2. Scelta/avvio missione (Start Mission) e intro.
3. Home (Command Center): stato missione, M1U, streak, notifiche, prossime azioni.
4. **BUZZ:** azione principale a consumo M1U (prezzo progressivo); invoca Edge `handle-buzz-press`; possibile free buzz (grant).
5. **Buzz Map:** generazione area di gioco, acquisto indizi/clue con M1U; Edge `handle-buzz-map` / `buzz-map-resolve-v2`.
6. Raccolta indizi (user_clues), progresso missione (user_mission_status), milestone clue (ClueMilestoneWatcher).
7. Classifiche (leaderboard), Pulse Energy e rank (agent_ranks), daily missions/card.
8. Claim reward (marker, welcome bonus, cashback) via Edge.
9. Notifiche (push native, user_notifications) per engagement.
10. Battle (opzionale), Intel/Norah, profilo e impostazioni; eliminazione account da Settings/Legal.

### Economy loop

- **M1U (crediti):** single source of truth su `profiles` (o user_credits); incremento da IAP (verify-iap-purchase, credit-m1u-purchase), reward, bonus; decremento da BUZZ, Buzz Map, acquisti in-app.
- **BUZZ:** costo progressivo (useBuzzCounter, useBuzzMapPricingNew); free buzz tramite buzz_grants e user_buzz_counter.
- **Buzz Map:** costo per clue/area (buzz_map_actions, user_map_areas); trigger DB handle_buzz_map_pe (PE + XP).
- **Subscription/IAP:** SUBSCRIPTIONS_STEALTH nasconde piani; su native solo IAP (Capgo); Stripe disabilitato su Capacitor.

### Progression loop

- **Pulse Energy (PE):** award tramite RPC `award_pulse_energy` e trigger (buzz, buzz_map, referral); record daily via `record_pe_daily_action`; limite giornaliero (check_pe_daily_limit).
- **Rank:** agent_ranks per soglie PE; useHierarchyRank, useAgentEnergy; realtime su profiles.
- **Streak:** StreakPill; logica daily/streak.
- **Leaderboard:** classifica su PE/rank.
- **Daily missions:** DailyMissionsController, micro-missions, card.

### Social loop

- **Notifiche:** user_notifications (type buzz, leaderboard, game); realtime; centro notifiche.
- **Community:** Forum (route /forum), leaderboard, winners.
- **Competition:** Battle (lobby, arena), challenge.

---

## FASE 2 — Architettura & Flows

### Auth flows

```
[App Load] → AuthProvider (getSessionSingleFlight) → authHydrated/authReady
     → se !auth: Landing (web) / Redirect /login (native)
     → se auth: subscription check (3s timeout, fail-open) → /home o /choose-plan
     → onAuthStateChange → session refresh, roles (user_roles)
[Login] → Login page → email/Apple/Google/Face ID → Supabase Auth
     → postLoginRedirect → /mission-intro o /home
[Logout] → signOut → clear local → redirect /login
[Account deletion] → Settings/Legal → DeleteAccountModal → delete-account-v2 (Edge)
     → signOut, localStorage.clear, window.location /login
```

### Mission intro → Home → Map/Buzz → Acquisti → Reward

```
/mission-intro (no ProtectedRoute) → animazione → /home
/home → CommandCenterHome, M1UPill, MissionSync, StreakPill, notifiche
     → map-first redirect (first session) → /map-3d-tiler
/buzz → BuzzPage → useBuzzCounter (prezzo) → BuzzActionButton
     → evento buzz → Edge handle-buzz-press → refresh counter/stats
/buzz-map, /map-3d-tiler → Map + useBuzzMapPricingNew → handle-buzz-map
     → buzz_map_actions (INSERT) → trigger handle_buzz_map_pe (PE + XP)
Acquisti: Shop/M1U → IAP (Capgo) → verify-iap-purchase / credit-m1u-purchase → profili M1U
Reward: claim-marker-reward, claim-welcome-bonus, cashback-claim → Edge → DB + eventuale email
```

### Flussi critici: account deletion, privacy, error boundaries

- **Account deletion:** DeleteAccountModalContent / LegalSettings → `delete-account-v2` con Bearer token; FK e RLS gestiti da migration (admin_logs user_id ON DELETE SET NULL, ecc.).
- **Privacy:** PrivacySettings, PrivacyPermissionsSettings, cookie consent (CookieConsentManager); legal routes per policy.
- **Error boundaries:** ErrorBoundary (root), SectionErrorBoundary; unhandledrejection in main.tsx (lock timeout gestito con preventDefault).

### Realtime: canali, eventi, retry

- Canali principali: `profile_changes_${user.id}`, `mission_enrollment_changes`, `agent_energy_${user.id}`, `hierarchy_rank_${user.id}`, `buzz_map_pricing_updates_${uid}`, profiles postgres_changes (M1U).
- Tutti avviati dopo **authReady** (AuthProvider) per ridurre lock contention.
- Retry: non centralizzato; singoli hook possono refetch su error.

### Data model (alto livello)

- **Utente:** auth.users → profiles (M1U, role, agent_code, …), user_roles.
- **Missione:** missions ↔ mission_enrollments (user_id, mission_id) ↔ user_mission_status (clues_found, progress).
- **Economy:** profiles.m1_units / user_credits; buzz_map_actions, user_clues, buzz_grants, user_buzz_counter, user_buzz_map_counter.
- **RLS:** tutte le tabelle utente con policy “owner” (auth.uid() = user_id); admin con role; service_role per Edge.

### Diagramma ASCII — Flusso principale

```
                    +------------------+
                    |   App Load       |
                    | AuthProvider     |
                    | getSessionSF()   |
                    +--------+---------+
                             |
              +--------------+--------------+
              | auth                         | !auth
              v                              v
    +-----------------+            +------------------+
    | subscription    |            | Landing / Login  |
    | check (3s)      |            +------------------+
    +--------+--------+                     |
             |                              |
    +--------+--------+                     |
    | hasPlan/stealth |                     |
    +--------+--------+                     |
             |                              |
             v                              v
    /home <-------+---------------> /login ---> /mission-intro --> /home
             |                      (Apple/Google/FaceID)
             v
    CommandCenterHome
             |
    +--------+--------+--------+--------+
    |        |        |        |        |
    v        v        v        v        v
  [Map]   [Buzz]  [Intel] [Notif] [Profile]
    |        |        |
    v        v        v
  handle-   handle-  Norah/RAG
  buzz-map  buzz-press
```

### Single source of truth

- **Stato utente / sessione:** AuthProvider (user, session, authReady).
- **Crediti M1U:** profiles (o user_credits) con realtime useM1UnitsRealtime.
- **Mission enrollment:** useActiveMissionEnrollment (mission_enrollments + current_mission_data).

### Punti di rottura probabili (iOS WKWebView)

- Lock Supabase auth-token (getSession/getUser concorrenti) → mitigato con single-flight + authReady gating.
- RPC thenable senza .catch (record_pe_daily_action) → mitigato con try/await/catch.
- Schema DB: mission_enrollments.id, buzz_map_actions.meta (trigger) → migration applicate su progetto corretto.
- RLS admin_logs INSERT → policy o insert da Edge con service_role.
- Tabella notifications inesistente → sostituita con user_notifications in ClueMilestoneWatcher.

---

## FASE 3 — Analisi Quality

Per ogni categoria: **stato attuale (0–100)**, **impatto**, **root cause probabile**, **intervento consigliato (non applicato)**, **improvement potential %**.

| # | Categoria | Score 0–100 | Impatto | Root cause probabile | Intervento consigliato | Improvement potential % |
|---|-----------|-------------|---------|----------------------|------------------------|--------------------------|
| 1 | **Stabilità** (crash, error boundaries, edge cases) | 72 | Alto | Lock timeout già mitigato; RLS/DB error su admin_logs e mission_enrollments se migration non applicate; RPC .catch fix applicato | Applicare migration su DB production; policy INSERT admin_logs; test cold start e login su device | +12% |
| 2 | **Performance** (startup, navigazione, mappa, memoria, rete) | 68 | Alto | Molti hook e realtime al mount; bundle pesante (Three, GSAP, mappe); Lock contention ridotta ma non zero sotto carico | Lazy load route pesanti; defer realtime dopo first paint; monitor memoria su device | +18% |
| 3 | **UX / Onboarding** (chiarezza, attrito, carico cognitivo) | 70 | Alto | Map-first redirect può disorientare; mission intro e micro-missions numerose; copy e CTA non sempre coerenti | Onboarding sequenziale chiaro; A/B test su map-first; riduzione step mission intro | +15% |
| 4 | **Retention** (daily loop, cadenza reward, hook) | 65 | Alto | Daily missions e streak presenti; cadenza reward e notifiche non ottimizzate; manca “next best action” sempre visibile | Daily reward più visibile; push timing su dati reali; gamification loop più stretto | +22% |
| 5 | **Monetizzazione** (funnel IAP/subs, chiarezza prezzo, fiducia) | 62 | Alto | SUBSCRIPTIONS_STEALTH nasconde piani; M1U e shop presenti; pricing BUZZ/Buzz Map chiaro in UI ma funnel non ottimizzato | Quando stealth off: funnel chiaro subscription vs M1U; social proof e garanzie; A/B pricing | +20% |
| 6 | **Sicurezza** (RLS, token, auth Edge, abuse) | 78 | Alto | RLS su tabelle principali; token in header Edge; admin_logs INSERT bloccato per ruolo authenticated | Policy INSERT admin_logs o solo service_role; audit abuse_logs e rate limit | +8% |
| 7 | **iOS Wrapper** (permessi, photo/camera, background, storage, WKWebView) | 74 | Alto | Safe area, keyboard, Face ID, push; Lock e RPC fix; possibili constraint/RTI noise in log | Verifica UIScene lifecycle; ottimizzare constraint; test background/foreground | +10% |
| 8 | **App Store Compliance** (5.1.1, privacy, account deletion, ATT, data retention) | 82 | Alto | Account deletion (delete-account-v2); Stripe disabilitato su native; IAP con validazione; store compliance mode (deterministic) | Privacy nutrition label aggiornata; documentazione retention; ATT copy se tracking | +6% |

---

## FASE 4 — Miglioramento Esponenziale

### A) Quick Wins (1–3 giorni)

| Proposta | Descrizione | Sezione | Complessità | Rischio | Dipendenze | KPI target | % miglioramento | Priorità |
|----------|-------------|---------|-------------|--------|------------|------------|------------------|----------|
| Verifica migration DB su production | Eseguire 20260303100000 e 20260303100001 sul progetto Supabase dei log; verificare handle_buzz_map_pe e colonna mission_enrollments.id | Backend / Stabilità | S | Basso | Accesso Supabase Dashboard | Meno errori Postgres, Buzz Map e enrollment ok | +5% stabilità | P0 |
| Policy INSERT admin_logs | Aggiungere policy che consenta insert (es. authenticated con user_id = auth.uid()) o spostare tutti gli insert in Edge con service_role | Backend / Sicurezza | S | Basso | Schema admin_logs | Zero RLS violation su admin_logs | +3% stabilità | P0 |
| GRANT subscriptions | GRANT SELECT/INSERT/UPDATE ON public.subscriptions TO authenticated (e ruoli usati) | Backend | S | Basso | — | Zero “permission denied” subscriptions | +2% stabilità | P1 |
| Rimozione log forensic in main | Rimuovere build stamp e log “Sheets/Portals” in production da main.tsx | iOS / Compliance | S | Basso | — | Log più puliti in review | +1% | P2 |

### B) Core Upgrades (1–2 settimane)

| Proposta | Descrizione | Sezione | Complessità | Rischio | Dipendenze | KPI target | % miglioramento | Priorità |
|----------|-------------|---------|-------------|--------|------------|------------|------------------|----------|
| Defer Realtime dopo first paint | Avviare canali Realtime dopo requestIdleCallback o 500 ms da authReady | Performance | M | Medio | authReady già usato | Startup percepito più veloce, meno contesa | +8% performance | P0 |
| Lazy load route pesanti | DNA, Map 3D, Battle arena già lazy; estendere a Intel sottorotte e admin | Performance | M | Basso | — | TTI e bundle iniziale minori | +6% performance | P1 |
| Onboarding sequenziale unificato | Un solo flusso: welcome → mission intro → first buzz hint → map; ridurre redirect multipli | UX / Onboarding | M | Medio | Copy e design | D7 retention +10% (assunzione) | +10% retention | P1 |
| Funnel subscription (quando stealth off) | Pagina choose-plan chiara; confronto piani; CTA univoco; restore purchases visibile | Monetizzazione | M | Basso | SUBSCRIPTIONS_STEALTH = false | Conversion to paid +15% (range) | +12% monetizzazione | P1 |
| Error boundary per route | Un ErrorBoundary per route con fallback “Riprova” e log a Sentry | Stabilità | S | Basso | — | Meno crash full-app, recovery in-place | +5% stabilità | P1 |

### C) World-Class Leap (1–2 mesi)

| Proposta | Descrizione | Sezione | Complessità | Rischio | Dipendenze | KPI target | % miglioramento | Priorità |
|----------|-------------|---------|-------------|--------|------------|------------|------------------|----------|
| “Next best action” sempre visibile | Barra o pill globale: “Fai un BUZZ”, “Apri la mappa”, “Controlla notifiche” in base a contesto e tempo | Retention / UX | L | Medio | Analytics, regole | Session length +20%, D7 +15% (range) | +18% retention | P0 |
| Push intelligente (cadenza e segmenti) | Engine che invia push in base a attività, fuso, abbandono; A/B su copy e timing | Retention | L | Medio | Backend cron, segmenti | D1/D7 retention +25% (range) | +20% retention | P0 |
| Daily reward loop visibile e gratificante | Streak + daily reward (M1U o clue) con animazione e notifica; calendario settimanale | Retention / Monetizzazione | M | Basso | UI, backend daily job | D7 +15%, session length +10% | +12% retention | P1 |
| Social proof e trust (recensioni, garanzie, “come funziona”) | Sezione “Come funziona”, testimonial, refund/garanzia chiara in subscription e shop | Monetizzazione | M | Basso | Copy, legal | Conversion +10%, riduzione chargeback | +8% monetizzazione | P1 |
| Offline-first per mappa e clue | Cache aree e clue; sync quando online; indicatore offline in header | Performance / UX | L | Alto | Sync strategy, conflict | Session anche senza rete, retention in zone deboli | +15% performance/retention | P2 |
| Accessibilità (VoiceOver, contrasti, focus) | Audit a11y; RouteAnnouncer già presente; focus order e label su CTA critici | UX / Compliance | M | Basso | Design | Accessibilità score 90+ | +5% UX e compliance | P1 |

---

## FASE 5 — Scoreboard Finale

| Sezione | Score attuale /100 | Score target /100 | Delta (%) | Top 3 interventi |
|---------|--------------------|--------------------|-----------|-------------------|
| Home | 72 | 88 | +22% | Defer realtime; map-first opzionale; error boundary per route |
| Buzz | 75 | 90 | +20% | Migration DB production; prezzo e CTA sempre visibili; analytics evento buzz |
| Buzz Map / Mappa | 68 | 86 | +26% | Migration + RLS; lazy tile/canvas; offline cache (world-class) |
| Notifiche | 70 | 85 | +21% | user_notifications (già fix); push timing; centro notifiche con azioni chiare |
| Profile / Account | 78 | 90 | +15% | Policy admin_logs; delete account UX chiaro; privacy label aggiornata |
| Subscriptions / IAP | 62 | 82 | +32% | Funnel quando stealth off; restore purchases; trust/social proof |
| Onboarding / Mission Intro | 70 | 88 | +26% | Sequenza unica; first buzz hint; riduzione step |
| Backend / Supabase (RLS + Functions) | 76 | 90 | +18% | Migration applicate; policy admin_logs; GRANT subscriptions; audit RLS |
| iOS Wrapper (Capacitor / WKWebView) | 74 | 88 | +19% | Verifica UIScene; constraint; test background; rimozione log forensic |

**M1SSION complessiva**

| Metrica | Valore |
|---------|--------|
| **Score attuale** | **72 / 100** |
| **Score target** | **88 / 100** |
| **Delta** | **+22%** |
| **Top 3 interventi globali** | 1) Applicare migration DB e policy admin_logs (stabilità e compliance). 2) Defer realtime e lazy load (performance e startup). 3) “Next best action” e daily reward loop (retention). |

---

## Missing Inputs (minimi)

1. **Dati analytics reali:** D7 retention, session length medio, conversion to paid (se disponibili) per calibrare le % di miglioramento su KPI.
2. **Conferma progetto Supabase:** Che il progetto su cui sono stati applicati (o da applicare) le migration sia lo stesso usato dall’app in produzione.
3. **Decisione SUBSCRIPTIONS_STEALTH:** Se e quando portare a `false` per riattivare il funnel subscription; impatta priorità Core Upgrades.
4. **Target retention/monetizzazione:** Numeri obiettivo (es. D7 > 40%, conversion > 5%) per dare priorità agli interventi World-Class.
5. **Uso reale Battle e Intel:** Se sono core o secondari per definire priorità di performance e error boundary.

---

*Fine report. Nessuna modifica al codice è stata applicata.*
