# INCIDENT REPORT — iOS (Capacitor WKWebView) — XCODE LOGS + PERFORMANCE REGRESSION

**READ-ONLY FORENSIC AUDIT (NO PATCHES)**  
Supabase LockManager timeouts + potential NaN/CoreGraphics  
© 2026 M1SSION™ – NIYVORA KFT™ – Lovable Agent JLENIA

---

## 1) EXECUTIVE SUMMARY

- **Root cause principale:** Contesa sul lock `navigator.locks` usato da Supabase Auth (lock `lock:sb-<ref>-auth-token`). Molte chiamate `getSession()`/`getUser()` partono in parallelo al bootstrap (AuthProvider, useProfileRealtime, useActiveMissionEnrollment, useM1UnitsRealtime, iapService, push, DNA, MicroMissions, BattleDefense, ecc.). La prima chiamata tiene il lock; le altre vanno in timeout dopo 10s → errori "Failed to get DNA", "Error fetching profile", "MicroMissions DB check error", "Error fetching XP status", "BattleDefense Check pending error", "UNHANDLED REJECTION".
- **Realtime a bootstrap:** Profile realtime, mission enrollment, M1U realtime, e altri channel partono appena montano i rispettivi componenti; tutti dipendono da session/token e possono competere con AuthProvider per il lock.
- **NaN/CoreGraphics:** Nel codebase ci sono divisioni su `rect.width`/`rect.height` e `width/height` senza guard (es. DNA/Three/canvas); se `rect` ha width/height 0 si ottiene NaN. Rischio medio su route DNA/Intro; basso su Home se i ref sono pronti dopo layout.
- **Log:** La maggior parte dei messaggi in console sono NOISE (WebKit, RTI, Stripe blocked, SW not supported). ACTIONABLE sono il LockManager timeout e eventuali NaN/crash. WATCHLIST: UIScene lifecycle, constraint warnings.

---

## 2) FINDINGS

### PHASE 0 — PROVE DI AMBIENTE (READ-ONLY)

| Cosa | File | Snippet (max 10 righe) |
|------|------|------------------------|
| Build stamp / log pre-React | `src/main.tsx` | `console.log('🚨 [BUILD STAMP] main.tsx loaded at:', new Date().toISOString());` (righe 5-6). Log "Sheets"/"Portals" prima di import React (righe 10-16). |
| React root | `src/main.tsx` | `const root = ReactDOM.createRoot(rootElement);` (riga 411). `root.render(<I18nextProvider i18n={i18n}><QueryClientProvider>...<App /></QueryClientProvider></I18nextProvider>)` (righe 414-426). |
| i18n init | `src/i18n/i18n.ts` | `initI18n().catch(console.error);` (riga 165). `i18next.use(initReactI18next).init({...})` (righe 116-118). Import in main: `import './i18n/i18n';` prima di render (riga 39), poi `import i18n from './i18n/i18n'` e `I18nextProvider i18n={i18n}`. |
| Console override / production logging | `src/utils/productionSafety.ts` | `setupProductionConsole()`: in production (hostname !== localhost) override `console.log` per mostrare solo CRITICAL/ERROR (righe 7-27). |
| | `src/utils/buildOptimization.ts` | `setupProductionLogging()`: in PROD override `console.log` per mostrare solo CRITICAL/SECURITY; warn/error lasciati (righe 7-28). |
| Chiamate in main prima di render | `src/main.tsx` | `setupProductionConsole(); setupProductionLogging(); enableProductionOptimizations();` (righe 312-314). Override applicati prima di `renderApp()`. |
| Supabase client init | `src/integrations/supabase/client.ts` | `export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { storage: localStorage, persistSession: true, autoRefreshToken: true } });` (righe 16-22). Nessun override lock/timeout. |
| StrictMode | Repo | **NON usato**: nessun `<React.StrictMode>` in main.tsx o App.tsx. |
| Entrypoint iOS / script injection | `ios/App/App/AppDelegate.swift` | `didFinishLaunchingWithOptions` → `startEarlyInjection()` (riga 29). Polling per WebView e iniezione UserScript prima del load (addPreRenderUserScript, addSSOHideUserScript, hideKeyboardAccessoryBar, FaceID, Badge). |

---

### PHASE 1 — LOCKMANAGER FORENSICS (CORE)

#### Tabella AUTH/TOKEN CONSUMERS (ranking per rischio di concorrenza a bootstrap)

| # | File | Funzione / hook | Contesto mount | useEffect (mount) / onClick | Bootstrap plausibile? |
|---|------|------------------|----------------|----------------------------|------------------------|
| 1 | `AuthProvider.tsx` | init effect | App-level (wrap tutta l’app) | useEffect([]) | **SÌ** – prima getSession al boot |
| 2 | `useProfileRealtime.ts` | setupRealtimeSubscription | Usato da Profile, useProfileImage, useProfileBasicInfo, AgentProfileContent, useGlobalProfileSync | useEffect([]) | **SÌ** – getSession() poi .from('profiles') + channel |
| 3 | `useActiveMissionEnrollment.ts` | checkEnrollment | Usato da Home/Command Center / mission UI | useEffect([user]) | **SÌ** – appena user disponibile, query DB |
| 4 | `useM1UnitsRealtime.ts` | fetchUnits + channel | Usato da M1UPill / header | useEffect([userId]) | **SÌ** – userId da context, poi fetch + postgres_changes |
| 5 | `iapService.ts` | validatePurchaseWithServer | Dopo acquisto IAP | Chiamato da callback IAP | No al boot; sì se ci sono pending tx |
| 6 | `lib/nativePush.ts` | (multiple) | Init push, sync subscription | getSession/getUser in vari punti | **SÌ** – init push dopo ~3s in main, può chiamare auth |
| 7 | `lib/push/unified.ts` | upsert, sync | Push subscription | getSession in più funzioni | **SÌ** – se push init corre con auth |
| 8 | `hooks/use-auth-session-manager.ts` | getSession + onAuthStateChange | Session manager | useEffect | **SÌ** – secondo consumer getSession + listener |
| 9 | `DNAManager` → `useDNA` → `dnaClient.getDna` | getDna | App-level (sotto AuthProvider) | useDNA: useEffect([user]) | **SÌ** – supabase.from('agent_dna') usa token implicito (lock) |
| 10 | `MicroMissionsCard` | DB check / mission logic | App-level (sotto AuthProvider) | useEffect + Supabase | **SÌ** – può fare query con token |
| 11 | `useFaceIDLogin.ts` / `use-auth.ts` | getSession before/after | Login flow | Chiamate in login | No al cold boot; sì dopo login |
| 12 | `useAgentCode.ts` | getUser | Header / Agent code | useEffect | **SÌ** – montato su Home |
| 13 | `useBuzzMapProgressivePricing.ts` | getUser | Buzz map | useEffect | Sì se utente va su mappa |
| 14 | `useBattleDefenseNotification.ts` | (realtime) | Battle defense | useEffect + channel | **SÌ** – channel con userId |
| 15 | `metrics/interestSignals.ts` | getUser | Analytics | Chiamate sparse | Possibile al boot |
| 16 | `useNotifications.ts` | getUser | Notifiche | useEffect | **SÌ** se componente montato |
| 17 | `StartMissionButton` | getSession + functions.invoke | Home | onClick + possibile prefetch | Meno critico (on demand) |
| 18 | `useProfileImage.ts` | getSession | Profile image | useProfileRealtime già fa getSession | Ridondante con useProfileRealtime |
| 19 | `useCashbackWallet.ts` | getSession | Cashback | useEffect / onClick | Possibile a boot se montato |
| 20 | `useHierarchyRank.ts` | channel | Rank | useEffect([user]) | **SÌ** – realtime su profiles |
| 21 | `usePulseRealtime.ts` | channel | Pulse | useEffect | **SÌ** se route Pulse |
| 22 | `features/pulse/hooks/useAgentEnergy.ts` | channel | Agent energy (header) | useEffect([user]) | **SÌ** – Home header |
| 23 | `useSubscriptionSync.ts` | channel | Subscription | useEffect | **SÌ** se montato |
| 24 | `useMissionStatus.ts` | channel | Mission status | useEffect | **SÌ** se montato |
| 25 | `IntelligenceStyledPage` / realtime | setupRealtimeSubscriptions | Intel page | useEffect | Sì su route Intel |

#### Tabella REALTIME SUBSCRIPTIONS AT BOOT

| File | Channel name / table | Condizione avvio | Dipende da session/token? | Avvio probabile post-login? |
|------|----------------------|-------------------|----------------------------|-----------------------------|
| `useProfileRealtime.ts` | `profile_changes_${user.id}`, profiles UPDATE | useEffect([]) | **SÌ** – getSession() prima | **SÌ** – montato da componenti profilo/header |
| `useActiveMissionEnrollment.ts` | `mission_enrollment_changes`, postgres_changes | useEffect([user]) | **SÌ** (user da auth) | **SÌ** |
| `useM1UnitsRealtime.ts` | `profiles` postgres_changes (M1U) | useEffect([userId]) | **SÌ** | **SÌ** |
| `useHierarchyRank.ts` | `hierarchy_rank_${user.id}`, profiles | useEffect([user]) | **SÌ** | **SÌ** |
| `features/pulse/hooks/useAgentEnergy.ts` | `agent_energy_${user.id}`, profiles | useEffect([user]) | **SÌ** | **SÌ** (header) |
| `SubscriptionPlans.tsx` | `profiles-changes` | useEffect (subscription flow) | **SÌ** | Sì se apri subscription |
| `RewardCounterPill.tsx` | `reward-counter-updates`, marker_claims | useEffect | **SÌ** (implicito token) | Sì se pill montata |
| `useBattleDefenseNotification.ts` | `battle-defense-${userId}` | useEffect([userId]) | **SÌ** | **SÌ** |
| `DNAPage.tsx` | `dna-updates:${user.id}`, agent_dna | useEffect([user]) | **SÌ** | Sì su route DNA |
| `useNotifications.ts` | `notification-changes` | useEffect | **SÌ** | **SÌ** se montato |
| `useChat.ts` | `chat-updates`, chat_messages | useEffect | **SÌ** | Sì su chat |
| `useBuzzMapLogic.ts` | `user_map_areas_changes` | useEffect | **SÌ** | Sì su map |
| `useRealtimeLeaderboard.ts` | `leaderboard-realtime` | useEffect | **SÌ** | Sì su leaderboard |
| `MapTiler3D.tsx` | markers, agent_locations, buzz | useEffect | **SÌ** | Sì su map 3D |

#### Timeline bootstrap (T0..T+5s) – ordine plausibile

- **T0:** main.tsx load → production console/logging override → DOMContentLoaded / initAppWithSWGuard → renderApp() → React mount.
- **T0+:** AuthProvider monta → useEffect([]) → **getSession()** (acquisisce lock auth-token; può durare se refresh/rete lenta).
- **T0+ (parallelo):** Montano sotto AuthProvider: DNAManager, WelcomeBonusManager, DailyMissionsController, **MicroMissionsCard**, ClueMilestoneWatcher, RankUpWatcher, CookieConsentManager, **WouterRoutes** (Home, ecc.).
- **T0+:** Route Home monta → **M1UPill** (useM1UnitsRealtime(userId)) → fetchUnits + **channel** (altro uso token/lock). **UnifiedHeader** / **useAgentCode** → getUser. **useProfileRealtime** usato da componenti profilo/immagine → **getSession()** + profile channel. **useActiveMissionEnrollment** (user da context) → checkEnrollment → query + **channel mission_enrollment_changes**. **useAgentEnergy** (user) → **channel agent_energy**. **useBattleDefenseNotification** (userId) → **channel battle-defense**. **useHierarchyRank** (user) → **channel hierarchy_rank**. Push init (main.tsx setTimeout 3s) → **nativePush** / **unified** → getSession/getUser. **use-auth-session-manager** → getSession + onAuthStateChange.
- **Effetto:** 2+ consumer (AuthProvider + useProfileRealtime + useM1UnitsRealtime + useActiveMissionEnrollment + useAgentEnergy + push + session-manager + …) possono chiamare getSession/getUser o aprire realtime (che usa token) **in parallelo**. Il lock è uno solo; gli altri attendono → timeout 10s → "Failed to get DNA", "Error fetching profile", "MicroMissions DB check error", "Error fetching XP status", "BattleDefense Check pending error", "UNHANDLED REJECTION".

#### Conclusione top 3 suspect per contesa lock

1. **`src/hooks/useProfileRealtime.ts`** – useEffect([]) con **getSession()** subito e poi .from('profiles') + channel. Montato indirettamente da più componenti (profile, header, image). Parte a cold boot senza aspettare “auth ready”.
2. **`src/contexts/auth/AuthProvider.tsx`** – Unica fonte “ufficiale” di getSession al boot; se la rete è lenta tiene il lock a lungo; tutti gli altri che chiamano getSession/getUser vanno in coda e possono andare in timeout.
3. **`src/hooks/useActiveMissionEnrollment.ts`** + **`src/hooks/useM1UnitsRealtime.ts`** + **`src/features/pulse/hooks/useAgentEnergy.ts`** – Tutti partono su user/userId (da context); se l’hydration di AuthProvider non è ancora “completa” ma i componenti sono già montati, fanno comunque query/realtime che internamente toccano il token (e quindi il lock). In più **use-auth-session-manager** fa una seconda getSession + onAuthStateChange in parallelo.

---

### PHASE 2 — NaN/CoreGraphics FORENSICS (SEGNALI DI FRAME DROP)

#### NaN Suspects List (ordinata per probabilità + impatto)

| # | File | Riga/snippet breve | Perché può produrre NaN | Rischio (Home/global = alto, route secondaria = basso) |
|---|------|--------------------|-------------------------|-------------------------------------------------------|
| 1 | `src/components/aion/AionEntity.tsx` | `const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);` (137) | Se `width` o `height` sono 0 (container non ancora layout), `width/height` → Infinity/NaN. | Medio – componente AION, non sempre su Home |
| 2 | `src/features/dna/mind-fractal3d/MindFractal3D.tsx` | `rect.width / rect.height` (111, 586), `(e.clientX - rect.left) / rect.width` (285, 306) | `getBoundingClientRect()` su canvas/container; se nascosto o size 0, rect.width/height = 0 → divisione = NaN. | Alto se route DNA/Intel aperta |
| 3 | `src/features/dna/mind-fractal-lite/input/useFractalInput.ts` | `(clientX - rect.left) / rect.width`, `(clientY - rect.top) / rect.height` (55-56) | Stesso: rect 0 → NaN. | Alto su route con fractal |
| 4 | `src/features/dna/mind-fractal/MindFractalScene.tsx` | `(e.clientX - rect.left) / rect.width`, `(e.clientY - rect.top) / rect.height` (86-87) | rect da `canvasRef.current?.getBoundingClientRect()`; ref null o size 0 → NaN. | Alto su route fractal |
| 5 | `src/features/dna/DNAVisualizerV2.tsx` | `(e.clientX - rect.left) / rect.width`, `(e.clientY - rect.top) / rect.height` (444-445, 478-479) | Stesso pattern. | Alto su route DNA |
| 6 | `src/features/dna/TesseractDNA.tsx` | `(e.clientX - centerX) / rect.width`, `(e.clientY - centerY) / rect.height` (368-369) | Stesso. | Alto su route DNA |
| 7 | `src/features/dna/rubik/controls/RubikGestures.ts` | `(e.clientX - rect.left) / rect.width`, `(e.clientY - rect.top) / rect.height` (77-78) | rect da canvas.getBoundingClientRect(); size 0 → NaN. | Medio – DNA/Rubik |
| 8 | `src/features/dna/mind-fractal-lite/MindFractalLite.tsx` | `rect.width / rect.height` (102, 242) | aspect ratio; rect 0 → NaN. | Alto su route con fractal lite |
| 9 | `src/features/pulse-breaker/components/PulseBreaker.tsx` | `(width - star.z) / width`, `(star.x / width)`, `(star.y / height)` (227, 242) | width/height da canvas.getBoundingClientRect(); 0 → NaN. | Medio – Pulse Breaker |
| 10 | `src/components/intro/effects/blackhole/ParticleSystem.tsx` | `(e.clientX - rect.left) / rect.width`, `(e.clientY - rect.top) / rect.height` (52-53) | rect da svg.getBoundingClientRect(); 0 → NaN. | Basso – intro/blackhole |
| 11 | `src/features/dna/visuals/components/useStableComposer.ts` | `canvas.clientWidth \|\| window.innerWidth`, `canvas.clientHeight \|\| window.innerHeight` (112-113) | Fallback presente; rischio basso se canvas non montato. | Basso |
| 12 | `src/features/dna/mind-fractal/canvas/renderer.ts` | `canvas.width = canvas.clientWidth * devicePixelRatio` (158-159) | clientWidth 0 → 0, non NaN; ma se usato come divisore altrove può propagare. | Basso |
| 13 | `src/components/onboarding/OnboardingOverlay.tsx` | `el.offsetWidth > 0 && el.offsetHeight > 0` (239) | Guard esplicita; riduce rischio. | Basso (componente disabilitato in App) |

Nota: In molti punti non c’è `if (rect.width && rect.height)` prima della divisione; su primo render o layout non ancora pronto (es. canvas nascosto), `rect.width`/`rect.height` possono essere 0 → divisione → NaN → eventuale “invalid numeric value (NaN)” in CoreGraphics/WebGL se passato a transform/canvas.

---

### PHASE 3 — LOG NOISE vs ACTIONABLE

| Classe | Esempi | Motivazione (breve) |
|--------|--------|---------------------|
| **NOISE** | WebContent “Could not register system wide server -25204”, “_AXAddToElementCache”, “Unable to hide query parameters”, “RTIInputSystemClient … sessionID”, “The variant selector cell index”, “Stripe BLOCKED on iOS”, “[SW-ANYHOST] Service Worker not supported”, “Reading from public effective user settings”, “Reporter disconnected”, “nw_connection_copy_protocol_metadata on unconnected”, “MADService Client XPC connection invalidated”, “Gesture: System gesture gate timed out” | Messaggi di sistema WebKit/accessibility/keyboard/push/SW/network; non indicano bug applicativo; Stripe bloccato è intenzionale; SW non usato in Capacitor. |
| **ACTIONABLE** | “Acquiring an exclusive Navigator LockManager lock … timed out waiting 10000ms”, “Failed to get DNA”, “Error fetching profile”, “[MicroMissions] DB check error”, “Error fetching XP status”, “[BattleDefense] Check pending error”, “UNHANDLED REJECTION” (con motivo lock), eventuale “invalid numeric value (NaN)” da CoreGraphics/WebGL | Lock timeout è root cause di errori a cascata; NaN può causare frame drop o crash in view/canvas. |
| **WATCHLIST** | “UIScene lifecycle will soon be required”, “Unable to simultaneously satisfy constraints” (_UIToolbarContentView width/height == 0) | UIScene: futuro requisito Apple; constraint: warning layout tastiera, può dare glitch minori. |

---

## 3) TOP 3 ROOT CAUSES (con prove da file)

1. **Contesa LockManager Auth (Supabase)**  
   - **Prova:** In `AuthProvider.tsx` (righe 125-127) c’è `await supabase.auth.getSession()` nel solo init; in `useProfileRealtime.ts` (riga 29) c’è `await supabase.auth.getSession()` in useEffect([]) senza dipendenze; in `useM1UnitsRealtime.ts` la fetch e il channel usano l’utente e quindi il token; in `useActiveMissionEnrollment.ts` checkEnrollment fa query DB che richiedono token. Tutti questi possono essere in esecuzione mentre il lock è già tenuto da AuthProvider o da un altro consumer. Il messaggio di errore nei log è esattamente “Acquiring an exclusive Navigator LockManager lock … timed out”.

2. **Realtime e fetch che partono prima di “auth ready”**  
   - **Prova:** `useProfileRealtime` non dipende da uno stato “authHydrated” o “session ready”; parte con `useEffect([])`. I hook che dipendono da `user` (useM1UnitsRealtime, useActiveMissionEnrollment, useAgentEnergy) partono non appena `user` è truthy, che può avvenire prima che la prima getSession abbia rilasciato il lock (o prima che tutti i consumer abbiano smesso di chiamare getSession). File: `useProfileRealtime.ts` (righe 23-101), `useM1UnitsRealtime.ts` (righe 81-102, 195-226), `useActiveMissionEnrollment.ts` (righe 84-95, 245-282).

3. **Divisioni senza guard su rect/dimensioni (rischio NaN)**  
   - **Prova:** In `MindFractal3D.tsx` (righe 111, 285-286, 306-307, 586) e in `AionEntity.tsx` (riga 137) ci sono divisioni per `rect.width`, `rect.height`, `width`, `height` senza controlli `> 0`. In `RubikGestures.ts` (77-78), `useFractalInput.ts` (55-56), `DNAVisualizerV2.tsx` (444-445, 478-479), `TesseractDNA.tsx` (368-369) stesso pattern. Se l’elemento non è ancora layoutato o ha size 0, si ottiene NaN. File citati sopra.

---

## 4) SAFE MIN-DIFF MITIGATION PLAN (SOLO RACCOMANDAZIONI – NO PATCH)

### A) Ridurre contesa lock auth-token

- **Single-flight getSession:** In AuthProvider mantenere una sola getSession in bootstrap; tutti gli altri consumer non devono chiamare getSession/getUser in parallelo. **Dove:** AuthProvider resta l’unico che fa getSession in init; tutti i componenti/hook che oggi chiamano `supabase.auth.getSession()` o `getUser()` in useEffect al mount dovrebbero usare **solo** `useAuth()` / contesto (session/user già idratati) e non richiamare getSession/getUser.
- **Centralizzare in AuthProvider:** Esporre da AuthProvider un flag tipo `authReady` o “hydration complete” e far sì che i consumer critici (useProfileRealtime, useM1UnitsRealtime, useActiveMissionEnrollment, useAgentEnergy, useBattleDefenseNotification, useHierarchyRank) **non** eseguano la propria getSession/getUser o subscription fino a quando `authReady` è true (o fino a quando `session`/`user` dal context è non-null e “stabile”).
- **useProfileRealtime:** **File:** `src/hooks/useProfileRealtime.ts`. **Modifica suggerita:** Non chiamare getSession in useEffect([]); ricevere `user`/`session` dal contesto (useAuth) e avviare la subscription solo quando `user` è disponibile. Stesso approccio per qualsiasi hook che oggi fa getSession/getUser al mount.
- **Lazy subscribe dopo hydration:** Per realtime (profile, M1U, mission enrollment, agent energy, battle defense, hierarchy rank): avviare la subscription solo dopo che AuthProvider ha completato la prima getSession (es. leggere `authHydrated` o `session` dal context e dipendere l’effect da quello invece che da [] o da user “appena” truthy).

### B) Ridurre probabilità NaN

- **Guard numerici:** In ogni punto dove si fa `something / width`, `something / height`, `rect.width`, `rect.height`, usare guard: `if (!rect || rect.width <= 0 || rect.height <= 0) return;` (o valore di fallback sicuro) prima di divisioni o passaggio a Three/canvas.
- **Fallback:** Dove si usa `getBoundingClientRect()` o `clientWidth`/`clientHeight` per aspect ratio o coordinate normalizzate, usare fallback tipo `Math.max(1, rect.width)` o `rect.width || 1` per evitare divisione per zero (solo dove ha senso semanticamente).
- **Delay misurazioni:** Dove possibile, ritardare la lettura di rect/size fino al primo layout (es. requestAnimationFrame dopo mount, o ResizeObserver) per evitare letture a size 0.

**File target suggeriti (per guard/fallback):**  
`src/components/aion/AionEntity.tsx`, `src/features/dna/mind-fractal3d/MindFractal3D.tsx`, `src/features/dna/mind-fractal-lite/input/useFractalInput.ts`, `src/features/dna/mind-fractal/MindFractalScene.tsx`, `src/features/dna/DNAVisualizerV2.tsx`, `src/features/dna/TesseractDNA.tsx`, `src/features/dna/rubik/controls/RubikGestures.ts`, `src/features/dna/mind-fractal-lite/MindFractalLite.tsx`, `src/features/pulse-breaker/components/PulseBreaker.tsx`, `src/components/intro/effects/blackhole/ParticleSystem.tsx`.

### C) Ridurre init non necessario su native iOS

- **Solo se già presente e certificato:** In main.tsx ci sono già controlli per Capacitor (es. native push, PWA stabilizer skip). Non applicare altre modifiche se non già previste; l’unica riduzione “init” coerente con l’audit è **non** avviare subscription realtime e fetch che dipendono da auth finché auth non è idratata (come in A).

---

### Checklist MIN-DIFF FIX CANDIDATES

| # | File target | Tipo modifica suggerita | Rischio | Test iOS da eseguire |
|---|-------------|--------------------------|---------|----------------------|
| 1 | `src/hooks/useProfileRealtime.ts` | Ricevere user/session da useAuth(); avviare subscription solo quando user non null; rimuovere getSession() dall’effect. | Med | Login → Home → profilo/avatar aggiornati; nessun timeout lock in console. |
| 2 | `src/contexts/auth/AuthProvider.tsx` | Esporre `authReady` o “hydration complete” (es. dopo prima getSession in finally). Documentare che i consumer devono attendere authReady prima di getSession/getUser propri. | Low | Boot → nessun peggioramento login; altri hook dovranno essere adattati a usare authReady. |
| 3 | `src/hooks/useM1UnitsRealtime.ts` | Avviare fetchUnits + channel solo quando session/user da context è “ready” (es. authReady da AuthProvider o delay minimo dopo user). | Med | Boot → M1U in header si aggiornano; nessun timeout. |
| 4 | `src/hooks/useActiveMissionEnrollment.ts` | Già dipende da user; assicurarsi che non ci siano altre getSession nel flusso; eventuale delay “dopo authReady” prima di prima checkEnrollment. | Low | Home → mission enrollment e realtime mission senza errori. |
| 5 | `src/features/pulse/hooks/useAgentEnergy.ts` | Come useM1UnitsRealtime: avviare channel solo dopo auth ready / user stabile. | Low | Header → rank/energy senza timeout. |
| 6 | `src/hooks/use-auth-session-manager.ts` | Evitare getSession duplicata al mount se AuthProvider è già la fonte; o ritardare listener fino a authReady. | Low | Nessuna regressione login/session. |
| 7 | `src/components/aion/AionEntity.tsx` | Guard: if (width && height) prima di PerspectiveCamera(45, width/height, …); altrimenti skip o default aspect. | Low | Route che usa AION: nessun NaN in console. |
| 8 | `src/features/dna/mind-fractal3d/MindFractal3D.tsx` | Guard: if (rect.width > 0 && rect.height > 0) prima di divisioni e di camera.aspect. | Med | Route DNA/Intel: nessun NaN; resize ok. |
| 9 | `src/features/dna/mind-fractal-lite/input/useFractalInput.ts` | Guard su rect.width/rect.height prima di normalizzare coordinate. | Med | Stesso. |
| 10 | `src/features/dna/DNAVisualizerV2.tsx` | Stesso tipo di guard su rect. | Med | Stesso. |

---

## 5) APPENDIX — Comandi di ricerca usati e risultati sintetici

- **React root / i18n / StrictMode:**  
  `rg "StrictMode|createRoot|ReactDOM" src` → createRoot in main.tsx; nessun StrictMode.  
  `rg "initI18n|i18n\.init|i18next" src` → i18n import e init in src/i18n/i18n.ts; initI18n() chiamato in i18n.ts.

- **Console override / production logging:**  
  `rg "console\.(log|error|warn)\s*=|override|production.*log" src` → productionSafety.ts, buildOptimization.ts (override in PROD).

- **Supabase client:**  
  `read_file src/integrations/supabase/client.ts` → createClient con auth.storage, persistSession, autoRefreshToken.

- **Auth/Token consumers:**  
  `rg "supabase\.auth\.getSession\(|supabase\.auth\.getUser\(" src` → ~90+ occorrenze in decine di file (AuthProvider, useProfileRealtime, iapService, use-auth-session-manager, useProfileImage, nativePush, useDNA chain, useActiveMissionEnrollment, useM1UnitsRealtime, useAgentEnergy, push/unified, ecc.).  
  `rg "onAuthStateChange" src` → AuthProvider.tsx, use-auth-session-manager.ts, analytics, ResetPasswordPage.

- **Realtime at boot:**  
  `rg "\.channel\(|\.subscribe\(|postgres_changes|realtime" src --glob "*.{ts,tsx}"` → useProfileRealtime, useM1UnitsRealtime, useActiveMissionEnrollment, useAgentEnergy, useBattleDefenseNotification, useHierarchyRank, SubscriptionPlans, RewardCounterPill, DNAPage, useNotifications, MapTiler3D, useBuzzMapLogic, useRealtimeLeaderboard, useChat, usePulseRealtime, useSubscriptionSync, useMissionStatus, ecc.

- **functions.invoke:**  
  `rg "supabase\.functions\.invoke" src` → iapService, subscription, M1U payment, battle, push, norah, mission, admin, ecc. (molti su azione utente; alcuni potrebbero essere chiamati dopo boot con token).

- **NaN suspects:**  
  `rg "getBoundingClientRect|offsetWidth|offsetHeight|clientWidth|clientHeight" src --glob "*.{ts,tsx}"` → molti file (PrizeVision, settings, UnifiedHeader, MapTiler3D, AionEntity, DNA/fractal, pulse-breaker, intro/blackhole, ecc.).  
  `rg "/ width|/ height|/ rect\.|/ size\." src --glob "*.{ts,tsx}"` → AionEntity (width/height), PulseBreaker, MindFractal3D, RubikGestures, useFractalInput, DNAVisualizerV2, TesseractDNA, MindFractalLite, ParticleSystem (divisioni per rect.width/height).

- **iOS entrypoint:**  
  `read_file ios/App/App/AppDelegate.swift` (limit 95) → startEarlyInjection(), addPreRenderUserScript, addSSOHideUserScript, hideKeyboardAccessoryBar, FaceID, Badge.

Fine report. Nessuna modifica applicata; solo lettura e analisi.
