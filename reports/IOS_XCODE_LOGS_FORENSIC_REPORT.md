# iOS Xcode Logs — Forensic Report & Performance Regression

**Data:** 2026-02-20  
**Ambiente:** App nativa iOS (Capacitor WKWebView), device reale  
**Modalità:** READ-ONLY — nessuna modifica a codice, config o build  

---

## 1. Triage table (gravità / impatto)

| Categoria | Esempi stringhe log | Origine | Gravità reale | Impatto performance | Serve investigare? |
|-----------|----------------------|--------|----------------|---------------------|--------------------|
| **UIScene lifecycle** | "UIScene lifecycle will soon be required. Failure to adopt will result in an assert in the future." | UIKit / iOS SDK | Warning | Nullo (deprecation) | Sì (pianificazione migrazione) |
| **Sandbox extension** | "Could not create a sandbox extension for '.../App.app'" | iOS sandbox | Warning | Nullo | No (noto su simulator/bundle) |
| **Reading effective user settings** | "Reading from public effective user settings." | iOS system | Noise | Nullo | No |
| **NSMapTable NULL** | "NSMapGet(...): map table argument is NULL" | WebKit / internal | Warning | Basso | No (interno WebKit) |
| **WebContent server** | "WebContent[pid] Could not register system wide server: -25204" | WebKit | Noise | Nullo | No |
| **AX element cache** | "_AXAddToElementCache was called even though the element was in the cache" | WebKit accessibility | Noise | Nullo | No |
| **Hide query params** | "Unable to hide query parameters from script (missing data)" | WebKit | Noise | Nullo | No |
| **Event localhost** | "Ignoring Event: localhost" | JS app / Capacitor | Noise | Nullo | No |
| **SW not supported** | "[SW-ANYHOST] Service Worker not supported" | JS (sw-autorun) | Noise | Nullo | No (atteso su iOS native) |
| **PWA Stabilizer failed** | "❌ PWA Stabilizer: Initialization failed: {}" | JS `usePWAStabilizer` | Warning | Basso (init fallito, nessun loop) | Sì (evitare init su native) |
| **Stripe blocked** | "[Stripe] ❌ BLOCKED on iOS native", "Platform ios - Stripe disabled" | JS `stripeClient.ts`, `guard.ts` | Noise (voluto) | Nullo | No |
| **WEBP err=-50** | "makeImagePlus:3798: *** ERROR: 'WEBP'-_reader->initImage[0] failed err=-50" | WebKit image decode | Warning | Basso | No (rumore decode) |
| **CARenderServer bootstrap** | "Service \"com.apple.CARenderServer\" failed bootstrap look up (1)" | WebKit / GPU context | Warning | Medio (possibile fallback rendering) | Solo se artefatti visivi |
| **Failed device context** | "Failed to initialize application environment context", "Failed to load a device context." | WebKit | Warning | Medio | Come sopra |
| **UIKeyboardLayoutStar** | "UIKeyboardLayoutStar implements focusItemsInRect: - caching for linear focus movement is limited" | UIKit keyboard | Noise | Nullo | No |
| **Reporter disconnected** | "Reporter disconnected. { function=sendMessage, reporterID=... }" | WebKit Inspector | Noise | Nullo | No |
| **Unable to satisfy constraints** | "_UIToolbarContentView:0x... .width == 0", ".height == 0", _UIButtonBarStackView, _UIModernBarButton | UIKit (keyboard toolbar) | Warning | Basso (Auto Layout risolve) | Solo se glitch UI tastiera |
| **Gesture gate timeout** | "<0x...> Gesture: System gesture gate timed out." | UIKit | Warning | Basso | No |
| **Variant selector cell** | "The variant selector cell index number could not be found." (ripetuto) | RTI / emoji keyboard | Noise | Nullo | No |
| **RTIInputSystemClient** | "Can only set suggestions for an active session", "perform input operation requires a valid sessionID" | RTI (keyboard/input) | Warning | Nullo | No |
| **CoreGraphics NaN** | "invalid numeric value (NaN, or not-a-number) to CoreGraphics API" (×13) | App/WebKit (layout o animazione) | **Actionable** | **Medio–Alto** (ripetuto → possibile frame drop) | **Sì** |
| **Snapshotting keyboard** | "Snapshotting a view (0x..., UIKeyboardImpl) that is not in a visible window requires afterScreenUpdates:YES" | UIKit | Warning | Basso | No |
| **xpc_user_sessions** | "xpc_user_sessions_get_foreground_uid() failed with error 1" | WebKit / sandbox | Noise | Nullo | No |
| **LockManager timeout** | "Acquiring an exclusive Navigator LockManager lock \"lock:sb-vkjrqirvdvjbemsfzxof-auth-token\" timed out waiting 10000ms" | Supabase JS (navigator.locks) | **Actionable** | **Alto** (blocca auth/realtime) | **Sì** |
| **Profile realtime error** | "Error setting up profile realtime: {\"isAcquireTimeout\":true}" | JS `useProfileRealtime` | **Actionable** | Alto (stesso lock) | **Sì** |
| **useActiveMissionEnrollment** | "❌ [useActiveMissionEnrollment] Error checking enrollment: {...LockManager...}" | JS hook | **Actionable** | Alto | **Sì** |
| **user_clues count** | "❌ Error loading user_clues count: {...LockManager...}" | JS (prob. ProfilePage o simile) | **Actionable** | Alto | **Sì** |
| **Connection interrupted** | "[C:3] Error received: Connection interrupted." | Realtime WebSocket | Warning | Basso | No |
| **RTI connection interrupted** | "Client connection to service was interrupted: ... connection to service with pid -1" | RTI | Noise | Nullo | No |

---

## 2. Root-cause map (3 sospetti)

### A) Supabase LockManager timeout su lock auth-token

- **Ipotesi:** Più consumer chiamano `getSession()` o accedono al token in parallelo; il lock `sb-*-auth-token` è esclusivo e ha timeout 10s. Il primo tenant tiene il lock, gli altri vanno in timeout.
- **Trigger probabili:**
  1. **AuthProvider:** all’avvio fa `getSession()` (con retry) e possibilmente `getUser()` in fallback (`AuthProvider.tsx` ~127–141, ~337, ~395).
  2. **useProfileRealtime:** in `setupRealtimeSubscription` chiama `getSession()` poi crea channel `profile_changes_${user.id}` (`useProfileRealtime.ts` ~29–30). Usato da: `AgentProfileContent`, `useProfileImage`, `useProfileBasicInfo`, `useGlobalProfileSync` — tutti sotto albero autenticato.
  3. **useActiveMissionEnrollment:** fa fetch + realtime channel `mission_enrollment_changes`; internamente può usare sessione. Montato da: `BuzzPage`, `MissionBadgeInjector`, `BuzzMapButtonSecure`, `StartMissionButton`, `MissionPrizeIntroOverlay`.
  4. **ProfilePage / user_clues:** una query che carica `user_clues` count probabilmente parte dopo auth e compete per lo stesso lock.
  5. Altri hook che usano `getSession()`/`getUser()` all’avvio: `SubscriptionPlans`, `useFaceIDLogin`, `nativePush`, `use-auth`, ecc.
- **Cosa verificare:** Su quale route/schermata si vedono i timeout (es. subito dopo login, su Home, su Buzz)? Riprodurre con un solo tab e annotare ordine: AuthProvider hydrated → poi profile realtime → mission enrollment → user_clues. Confermare che tutti usano lo stesso client Supabase (singleton) e che il lock è uno solo (`lock:sb-<ref>-auth-token`).

### B) CoreGraphics NaN ripetuti

- **Ipotesi:** Qualche vista (DOM/CSS o layer nativo) riceve valore NaN per coordinate/dimensioni/transform (es. width/height 0 o undefined, divisione per zero, Framer Motion con stato iniziale undefined).
- **Trigger probabili:**
  1. **Framer Motion:** molti componenti usano `motion.*`, `animate`, `initial`/`variants`. Se `initial` o una variante usa una dimensione da ref non ancora misurata (0 o undefined), può propagare NaN a CoreGraphics.
  2. **Componenti con molti motion:** `PrizeVision`, `LotteryContent`, `LandingPage`, `FinalShootOverlay`, `MissionPrizeIntroOverlay`, `RewardZonePopup`, `MapTiler3D`, `LeaderboardPage`, `ActiveMissionBox`, `FortuneWheel`, `CelebrationModal`, ecc.
  3. **Layout/transform:** calcoli tipo `width * 0.5`, `height - inset` dove width/height sono 0 o undefined al primo frame.
  4. **Mappa/overlay:** MapTiler3D, layer 3D, tooltip o popover con posizione derivata da coordinate non ancora pronte.
- **Cosa verificare:** Impostare env `CG_NUMERICS_SHOW_BACKTRACE=1` e rilanciare per ottenere backtrace. Cercare nei componenti che sono in view quando compaiono i NaN (es. Home vs Map vs Buzz). Controllare ref su dimensioni (offsetWidth, getBoundingClientRect) usate in `style` o in `motion` values prima del primo layout.

### C) Bootstrap overhead (PWA stabilizer su native + Stripe guard ripetuto + init push/geo/realtime)

- **Ipotesi:** Su iOS native (Capacitor) girano inizializzazioni pensate per web/PWA (Service Worker, PWA Stabilizer) che falliscono o sono ridondanti; più componenti che toccano Stripe loggano "BLOCKED"; push e geo partono subito; molte subscription realtime partono appena l’utente è autenticato. Il costo è soprattutto lock contention (A) e quantità di lavoro JS dopo il primo paint.
- **Trigger probabili:**
  1. **PWA Stabilizer:** `App.tsx` linea 178 chiama `usePWAStabilizer()` senza guard `isCapacitorNative()`. L’hook (`usePWAStabilizer.ts`) fa `runPWACleanupOnce()`, poi `navigator.serviceWorker.register('/sw.js')`. Su WKWebView iOS il SW non è supportato → "[SW-ANYHOST] Service Worker not supported" e poi "❌ PWA Stabilizer: Initialization failed: {}". Overhead: una Promise che fallisce e log; nessun retry loop nel codice.
  2. **Stripe:** `main.tsx` importa `./lib/stripeFallback` (linea 61), che importa `stripeClient`. Ogni chiamata a `getStripe()` o `isStripeAvailable()` logga. Componenti che usano `getStripeSafe`/`assertStripeAvailable`/`isStripeAllowedOnPlatform`: `M1UPaymentContent`, `useStripePayment`, `SubscriptionPlans`, `stripeClient.getStripe`. I 4 log "[Stripe] ❌ BLOCKED" / "Platform ios" indicano almeno 4 entry point che toccano Stripe a bootstrap (es. lazy load di subscription/payment UI o init di stripePromise).
  3. **Push:** `main.tsx` ~90–112 fa lazy import di `nativePush` e, se Capacitor, `initNativePush()`. Poi l’utente può aprire Notifiche e chiamare `requestPushPermission` → secondo `register()`. Log mostrano due blocchi "APNs DEVICE TOKEN RECEIVED" (init + dopo request permission) → doppia registrazione possibile.
  4. **Geolocation:** `watchPosition` parte quando un componente che usa `useGeolocation` o `useGeoWatcher` è montato. MapTiler3D è su route `/map-3d-tiler` e `/buzz-map`; se l’utente va su quella route, il watch parte e i log "To Native -> Geolocation watchPosition" e "TO JS {coords}" sono attesi. Se invece il watch parte anche da un altro hook globale (es. in App o in un layout sempre montato), allora parte prima del necessario.
  5. **Realtime:** All’avvio, sotto AuthProvider, montano molti componenti che sottoscrivono channel: profile, mission enrollment, subscription, notifiche, leaderboard, battle, pulse, ecc. Ogni subscription può richiedere il lock auth → vedi (A).
- **Cosa verificare:** Confermare in log l’ordine: prima SW not supported, poi PWA Stabilizer failed. Verificare quali componenti che chiamano Stripe sono in tree al primo render (route iniziale). Per geo: verificare se `useGeolocation`/`useGeoWatcher` sono usati solo in route mappa o anche in layout globale. Per realtime: contare quanti channel vengono sottoscritti nei primi 2–3 secondi dopo login e incrociare con i timeout del lock.

---

## 3. Codebase audit (dove nascono i log)

### 3.1 Inizializzazione PWA / stubs / stabilizer su iOS native

| File | Funzione / hook | Quando viene eseguito |
|------|------------------|------------------------|
| `src/App.tsx` | `usePWAStabilizer()` linea 178 | Sempre al mount di `App` (nessun guard Capacitor) |
| `src/hooks/usePWAStabilizer.ts` | `initializePWA()` in `useEffect([user])` | Subito dopo mount App; poi di nuovo quando `user` cambia |
| | `runPWACleanupOnce()` | Prima operazione dentro initializePWA |
| | `navigator.serviceWorker.register('/sw.js')` | Su WKWebView iOS fallisce → "Service Worker not supported" (da altro modulo) e "PWA Stabilizer: Initialization failed" (catch linea 56–57) |
| `src/lib/pwa/sw-autorun.ts` | (registrazione SW anyhost) | Importato da `main.tsx` linea 30 → log "[SW-ANYHOST] Service Worker not supported" |
| `src/main.tsx` | `import './lib/stripeFallback'` linea 61 | A load: stripeFallback importa stripeClient (nessuna chiamata getStripe qui) |
| PWA stubs / functions | "M1SSION PWA stubs loaded", "PWA functions loaded" | Script iniettati o moduli caricati prima del bundle principale |

### 3.2 Dove viene loggato "Stripe blocked" e entry point

| File | Punto | Condizione |
|------|--------|------------|
| `src/lib/stripe/stripeClient.ts` | `isStripeAvailable()` linee 24–26 | Log "[Stripe] ❌ BLOCKED on iOS native - Use Apple IAP" quando `isIOS && isNative` |
| `src/lib/stripe/stripeClient.ts` | `getStripe()` linee 63–66 | Log "[Stripe] ❌ Platform ${platform} - Stripe disabled" quando `!isStripeAvailable()` |
| `src/lib/stripe/guard.ts` | `assertStripeAllowedOnPlatform()` linee 38–39, 47–48 | `console.error` quando bloccato (chiamato prima di pagamento) |
| Chiamate a `isStripeAvailable()` o `getStripe()` | Da qualsiasi modulo che importa stripeClient o stripeFallback e invoca queste funzioni | Es. `getStripeSafe()` in stripeFallback → chiama `coreGetStripe` (getStripe). Componenti che usano `getStripeSafe`/`stripePromise`: `M1UPaymentContent`, `ProfileBottomSheet`, `SavedCardPayment`, `StripeInAppCheckout`, `PowerBuzzModal`, `AddCardDialog`. `M1UPaymentContent` chiama anche `assertStripeAllowedOnPlatform()` (linee 58, 106). |
| `src/components/m1units/M1UPaymentContent.tsx` | linee 18, 58, 106 | Importa `assertStripeAvailable`; lo chiama in effetti o in handler. Montato quando si apre shop/pagamento M1U. |
| `src/hooks/useStripePayment.ts` | linee 35, 144 | `assertStripeAllowedOnPlatform()` e `isStripeAllowedOnPlatform()` — montato da flussi pagamento. |
| `src/components/subscription/SubscriptionPlans.tsx` | (usa getUser e probabilmente Stripe per piani) | Può toccare Stripe al mount se la route Subscriptions è aperta. |

I 4 log Stripe in sequenza indicano che almeno 4 percorsi (moduli o componenti) hanno chiamato `isStripeAvailable()` o `getStripe()` durante il bootstrap o il primo render dell’albero (inclusi lazy load di route che contengono shop/subscription).

### 3.3 Dove parte Geolocation watchPosition e se parte fuori dalla mappa

| File | Hook / funzione | Montato quando |
|------|------------------|----------------|
| `src/hooks/useGeolocation.ts` | `watchPositionSafe(...)` in useEffect (linea 111) | Quando un componente che usa `useGeolocation()` è montato |
| `src/hooks/useGeoWatcher.ts` | `watchPositionSafe` o `navigator.geolocation.watchPosition` (linee 189, 226, 295, 340) | Quando un componente che usa `useGeoWatcher()` è montato |
| `src/pages/sandbox/MapTiler3D.tsx` | `useGeolocation()` linea 170 | Solo su route `/map-3d-tiler` e `/buzz-map` (lazy) |
| `src/pages/settings/SettingsPage.tsx` | `useGeolocation()` linea 38 | Solo su route Settings |
| `src/components/chat/ChatView.tsx` | `useGeolocation()` linea 43 | Quando Chat è aperta |
| `src/components/map/GeoDebugOverlay.tsx` | `useGeoWatcher()` | Dove è usato (es. mappa/debug) |
| `src/components/diagnostics/M1ssionSystemReport.tsx` | `useGeoWatcher()` | Pagina diagnostica |
| `src/components/map/BuzzMapButtonSecure.tsx` | `navigator.geolocation.watchPosition` diretto (linea 137) | Quando il pulsante Buzz Map è usato (es. da Home) |
| `src/components/prizes/SmartPrizeManager.tsx` | `navigator.geolocation.watchPosition` (linea 174) | In contesto premi |

**Conclusione:** Il watch non è globale in App; parte quando l’utente entra in una route che monta MapTiler3D (o Settings/Chat/altro che usa useGeolocation/useGeoWatcher). I log "To Native -> Geolocation watchPosition" e i "TO JS {coords}" nel trace indicano che l’utente era su una pagina che monta uno di questi hook (molto probabilmente MapTiler3D su `/map-3d-tiler` o `/buzz-map`). Non risulta un watch globale al bootstrap dalla sola analisi; il timing nei log (dopo push init e prima di LockManager timeout) è compatibile con navigazione verso la mappa.

### 3.4 Realtime subscriptions Supabase — mappa delle subscribe

Elenco dei channel e dove partono (tutti dipendono da sessione/auth, quindi potenzialmente contendono il lock):

| Channel / uso | File | Montato quando |
|----------------|------|------------------|
| `profile_changes_${user.id}` | `useProfileRealtime.ts` | AgentProfileContent, useProfileImage, useProfileBasicInfo, useGlobalProfileSync → sotto albero autenticato, varie route |
| `mission_enrollment_changes` | `useActiveMissionEnrollment.ts` | BuzzPage, MissionBadgeInjector, BuzzMapButtonSecure, StartMissionButton, MissionPrizeIntroOverlay |
| `profiles-changes` | `SubscriptionPlans.tsx` | Route Subscriptions |
| `reward-counter-updates` | `RewardCounterPill.tsx` | Dove il pill è montato |
| `battle-console-updates` | `BattleConsole.tsx` | Command center / battle |
| `global-glitch` | `useGlobalGlitch.ts` | Listener globale (App / layout) |
| `notifications` | `NotificationsPage.tsx` | Route Notifiche |
| `hierarchy_rank_${user.id}` | `useHierarchyRank.ts` | Dove rank è usato |
| `country-domination-changes` | `useCountryDomination.ts` | Mappa 3D |
| `battle-defense-${userId}` | `useBattleDefenseNotification.ts` | Battle |
| `buzz_map_changes` | `useBuzzMapProgressivePricing.ts` | Buzz map |
| `chat-updates`, `chat-${conversationId}` | `useChat.ts` | Chat |
| `markers-changes-3d`, `agent-locations-live-3d`, `map3d_buzz_fit_${uid}` | `MapTiler3D.tsx` | Route map-3d-tiler / buzz-map |
| `notification-changes` | `useNotifications.ts` | Dove notifiche sono usate |
| `profile-updates-toast` | `ProfileToast.tsx` | Profile |
| `user_map_areas_changes` | `useBuzzMapLogic.ts` | Buzz map |
| `pulse_state_changes`, `pulse_notifications`, `pulse_rewards`, `pulse_cycle_reset` | usePulseRealtime, PulseRewardNotification | Pulse |
| `leaderboard-realtime` | `useRealtimeLeaderboard.ts` | Leaderboard |
| `realtime:profiles` | `UsersRealtimePanel.tsx` | Panel admin |
| `winners-updates` | `HallOfWinnersStyledPage.tsx` | Hall of winners |
| `weekly_leaderboard_rank` | `RankHighlight.tsx` | Rank |
| `mission_status_realtime` | `useMissionStatus.ts` | Mission status |
| `subscription-sync` | `useSubscriptionSync.ts` | Subscription sync |
| `user_badges_timeline` | `AchievementTimeline.tsx` | Achievements |
| `markers-changes` | `MapMarkers.tsx` | Mappa |
| `milestones_${user.id}` | `useMilestones.ts` | Pulse milestones |
| `battle-shop-${userId}` | `BattleShop.tsx` | Battle shop |
| `agent_energy_${user.id}` | `useAgentEnergy.ts` | Pulse |
| Altri (cfg_marker_min_zoom, RealtimePlayersPill, WeaponDefenseSelector, ecc.) | Vari | Su route specifiche |

Al boot post-login, tutti i componenti montati sotto la route corrente che usano questi hook avviano la loro subscription. `useProfileRealtime` e `useActiveMissionEnrollment` (e chi fa query `user_clues`) sono tra i primi a dover acquisire il lock auth → contesa probabile.

### 3.5 Chiamate concorrenti a auth/session (getSession, getUser, refresh, realtime)

| File | Chiamata | Quando |
|------|----------|--------|
| `AuthProvider.tsx` | `getSession()` (e fallback `getUser()`), poi di nuovo su visibility/interval | Init sessione, hydration, visibility change |
| `useProfileRealtime.ts` | `getSession()` in `setupRealtimeSubscription` | useEffect al mount ([]), quindi subito dopo che l’albero autenticato è montato |
| `useActiveMissionEnrollment.ts` | (fetch + channel; il channel usa il client Supabase che internamente usa il token) | Mount su BuzzPage, MissionBadgeInjector, BuzzMapButtonSecure, StartMissionButton, MissionPrizeIntroOverlay |
| ProfilePage / user_clues count | Probabile `getSession()` o uso del client con token | Dopo login, su route Profile/Home che carica count user_clues |
| `useProfileImage.ts` | Usa `useProfileRealtime` (che fa getSession) + eventuale altro fetch | Montato dove c’è avatar/profile |
| `useProfileBasicInfo.ts` | `useProfileRealtime` | Dove si mostra profilo base |
| `SubscriptionPlans.tsx` | `getUser()` più volte (linee 67, 258, 300, 341, 485) | Route Subscriptions |
| `nativePush.ts` | `getUser()` (linee 430, 550) | Dopo init push, per salvare token |
| `use-auth-session-manager.ts` | `getSession()` (linea 187) | Hook sessione |
| `useFaceIDLogin.ts`, `use-auth.ts` | `getSession()` pre/post login | Login flow |
| `MapTiler3D.tsx` | `getSession()`, `getUser()` (linee 433, 1362) | Route map-3d-tiler / buzz-map |
| `useCashbackWallet.ts`, `useBuzzGrants.ts`, `iapService.ts`, ecc. | `getSession()` o `getUser()` | Quando i rispettivi flussi sono usati |

Il lock `lock:sb-vkjrqirvdvjbemsfzxof-auth-token` è uno solo; ogni `getSession()` o operazione che legge il token lo richiede. Con AuthProvider che fa getSession + vari hook (profile realtime, mission enrollment, subscription, push, ecc.) che partono in parallelo, si crea contesa e il timeout 10s spiega "Error setting up profile realtime: isAcquireTimeout", "useActiveMissionEnrollment Error checking enrollment", "Error loading user_clues count".

---

## 4. Performance “critical path” (bootstrap, read-only)

Ordine probabile di esecuzione (sincrono vs async):

1. **main.tsx (sync):** Build stamp, Sheets/Portals log, import CSS, import `iosReadabilityHotfix`, `sw-autorun`, React, Supabase client, App, index.css, i18n, stripeFallback (→ stripeClient caricato), populateKB, initUiGapInspector (async), nativePush init (async), forensic probe (async DEV), ensureMainSWController (async), initPWABadgeDiagnosticsSafely (async), push kill switch, … Infine `createRoot` e `root.render(...)`.
2. **App (sync al primo paint):** usePWAStabilizer (useEffect → async initializePWA), usePushSync, useActivityTracker, useGlobalGlitchListener, useKeyboardVisible, … Render: splash, background, NativeSafeAreaProvider, ErrorBoundary, ProductionSafetyWrapper, AuthProvider, …
3. **AuthProvider (sync + async):** Init state, useEffect per session hydration → `getSession()` (e possibilmente `getUser()`). Finché non hydrated, sotto-albero può mostrare loading; quando hydrated, montano route e figli.
4. **Sotto AuthProvider (dopo hydration):** Montaggio di route (es. Home/Buzz/Map/Profile a seconda di default route). Ogni componente che usa useProfileRealtime, useActiveMissionEnrollment, useSubscriptionSync, useNotifications, BattleConsole, ecc. esegue il proprio useEffect e: chiama getSession() (o usa client che acquisisce lock) e/o sottoscrive un channel. Tutti in parallelo → contesa sul lock.
5. **Wrapper / bridge (nativo):** "Loading app at capacitor://localhost", UserScript, SSO Hide, Face ID handler, Badge handler, Pre-render CSS, ecc. sono iniettati lato native (iOS) prima o in parallelo al JS.
6. **i18n:** Import in main prima del render; "i18next is maintained with support from Locize" è da i18next.
7. **PWA Stabilizer:** useEffect in App → runPWACleanupOnce → register SW → su iOS fallisce → catch "Initialization failed".
8. **Push:** initNativePush (async da main) + eventuale requestPushPermission da UI → checkPermissions, register, token.
9. **Geo:** watchPosition solo quando un componente con useGeolocation/useGeoWatcher è montato (es. navigazione a /map-3d-tiler).
10. **Realtime:** Ogni hook che fa .channel().subscribe() parte dopo il proprio mount; molti partono insieme appena la route è quella che li contiene.

Cosa può bloccare o ritardare la UX percepita:

- **Lock auth:** Se AuthProvider tiene il lock a lungo (retry getSession) o molti hook fanno getSession/subscribe insieme, gli altri vanno in timeout 10s → "profile realtime", "useActiveMissionEnrollment", "user_clues" falliscono e l’UI può restare in loading o dati mancanti.
- **PWA Stabilizer:** Solo una Promise che fallisce; non blocca il thread ma aggiunge lavoro e log.
- **Stripe:** Solo log; nessun blocco.
- **CoreGraphics NaN:** Ripetuti layout/repaint con valori non validi possono far perdere frame e dare sensazione di “app meno fluida”.

---

## 5. Playbook di verifica (solo lettura / misura)

- **LockManager timeout:**  
  - Riprodurre: avvio app → login → annotare route di default (es. Home). Cercare in log l’ordine: "APNs DEVICE TOKEN", "Geolocation watchPosition", "Error setting up profile realtime", "useActiveMissionEnrollment Error", "Error loading user_clues".  
  - Isolare: commentare temporaneamente (solo in copia locale, non nel repo) l’uso di useProfileRealtime in un componente e riavviare; vedere se i timeout diminuiscono.  
  - Comandi read-only: `rg "getSession|getUser" src --type-add 'ts:*.ts' -t ts -t tsx -l` per elencare tutti i file che toccano sessione; `rg "\.channel\(" src -t tsx -c` per contare i channel.

- **CoreGraphics NaN:**  
  - Eseguire con variabile d’ambiente `CG_NUMERICS_SHOW_BACKTRACE=1` (Xcode scheme o `Product → Scheme → Edit Scheme → Run → Arguments → Environment Variables`), riavviare e catturare backtrace al primo NaN.  
  - Cercare nel repo componenti che usano dimensioni da ref in motion/style: `rg "offsetWidth|getBoundingClientRect|clientWidth|clientHeight" src -t tsx -l` e incrociare con file che usano `motion\.` o `framer-motion`.  
  - Non modificare; solo annotare file e componente sospetti.

- **DEBUG vs RELEASE:**  
  - Confrontare: build Debug (Xcode) vs Archive/Release (o TestFlight). In Release di solito non ci sono source maps, console può essere filtrata (es. productionSafety/buildOptimization), e i log in main.tsx (build stamp, Sheets, Portals) potrebbero ancora eseguirsi prima degli override. Misurare tempo fino a “first interactive” (es. splash dismiss) e tempo fino a scomparsa di loading su Home in entrambe le build.  
  - Verificare: `import.meta.env.DEV` e `import.meta.env.MODE` in main e in productionSafety/buildOptimization per capire quali log restano in prod.

- **PWA Stabilizer su native:**  
  - Verificare senza modificare: nei log, ordine "[SW-ANYHOST] Service Worker not supported" e "❌ PWA Stabilizer: Initialization failed".  
  - Cercare dove non c’è guard: `rg "usePWAStabilizer|isCapacitorNative" src/App.tsx` → conferma che usePWAStabilizer è chiamato senza controllo Capacitor.

- **Re-render / storm:**  
  - Solo osservazione: React DevTools Profiler (se disponibile in build) per vedere quali componenti si aggiornano dopo login e dopo i timeout.  
  - Nel codice: `rg "useState|useEffect" src/hooks/useProfileRealtime.ts src/hooks/useActiveMissionEnrollment.ts -c` per vedere quanti stati/effetti ci sono; nessuna modifica.

Comandi di sola lettura suggeriti (esempi):

```bash
rg "getSession|getUser" src --glob '*.{ts,tsx}' -l
rg "\.channel\(" src --glob '*.{ts,tsx}' -c
rg "usePWAStabilizer|isCapacitorNative" src/App.tsx
rg "offsetWidth|getBoundingClientRect|clientWidth|clientHeight" src --glob '*.tsx' -l
rg "motion\.|from 'framer-motion'" src --glob '*.tsx' -l
```

---

## 6. Conclusione: “What’s really happening”

- **Rumore (si possono ignorare per performance):** UIScene lifecycle (deprecation), sandbox extension, NSMapTable NULL, WebContent server -25204, AX element cache, hide query params, Ignoring Event localhost, SW not supported, Reporter disconnected, UIKeyboardLayoutStar, variant selector cell index, RTI “active session”/“valid sessionID”, xpc_user_sessions, Stripe BLOCKED (voluto), Reading from public effective user settings, Connection interrupted / RTI connection interrupted, snapshotting UIKeyboardImpl.
- **Warning da tenere d’occhio ma non causa diretta di lentezza:** Unable to satisfy constraints (toolbar tastiera; solo se vedi glitch), WEBP err=-50, CARenderServer/bootstrap/device context failed (solo se vedi artefatti), gesture gate timeout, PWA Stabilizer failed (ridondante su native).
- **Indicatori reali di problema:**  
  1) **LockManager timeout 10s** su `lock:sb-*-auth-token` con fallimenti "profile realtime", "useActiveMissionEnrollment", "user_clues count" → contesa tra AuthProvider e molti hook che usano getSession/subscribe in parallelo.  
  2) **CoreGraphics NaN ripetuti (×13)** → qualche vista/animazione passa NaN a CoreGraphics; può contribuire a micro-stutter o frame drop.  
  3) **Bootstrap:** PWA Stabilizer e Stripe log sono overhead minore; il peso principale è la contesa sul lock e il numero di subscription realtime che partono insieme.

- **Cause più probabili della regressione (in ordine):**  
  1) **Contesa sul lock auth (Supabase LockManager)** → timeout 10s, profile realtime e mission enrollment e user_clues falliscono, UI in attesa o dati mancanti, sensazione di “app lenta o bloccata”.  
  2) **CoreGraphics NaN** → lavoro di layout/rendering inutile o fallback, possibile perdita di frame.  
  3) **Molte subscription realtime + getSession/getUser in parallelo** → picco di lavoro JS e contesa lock subito dopo login.

- **Tre verifiche da fare per prime (solo verifica):**  
  1) Riprodurre i timeout del lock annotando route e ordine dei log; confermare che compaiono quando molti hook (profile realtime, mission enrollment, user_clues, ecc.) partono insieme.  
  2) Lanciare con `CG_NUMERICS_SHOW_BACKTRACE=1` e identificare il backtrace del primo NaN per restringere il componente/layout responsabile.  
  3) Confrontare tempo fino a “first interactive” e tempo fino a dati completi su Home in build Debug vs Release per capire quanto del rallentamento è dovuto a ambiente Debug vs lock/NaN.

---

*Report forense read-only. Nessuna modifica applicata a codice, config o build.*
