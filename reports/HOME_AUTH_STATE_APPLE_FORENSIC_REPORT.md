# HOME AUTH/STATE + APPLE UPLOAD — FORENSIC REPORT

**Data:** 2026-03-09  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Branch:** feat/pe-global-fullscreen-reward  
**HEAD:** 7012170a1132f77a66f7359d69b9be6cd97e703b  
**Modalità:** Read-only. Nessuna modifica a codice, config, versioning.

---

## 1. VERDETTO SECCO

- **Causa più probabile del problema profilo/Home:** La Home usa **due fonti auth indipendenti**. La shell (AppHome) legge **user** da **useUnifiedAuth()** (AuthProvider). Il contenuto (CommandCenterHome e gli hook dati) legge **user** da **useAuth()** = useAuthSessionManager. useAuthSessionManager fa una **seconda** chiamata a getSessionSingleFlight() al mount; su iOS quella chiamata può restituire null o fallire (storage/lock/timing). In quel caso **user resta null** in useAuthSessionManager; useHierarchyRank, useMissionStatus, usePrizeData, useAgentEnergy **escono subito** (guard `if (!user?.id) return`) e **non fanno fetch**. Risultato: guscio Home con dati vuoti. **Non** è una regressione introdotta da un singolo commit recente: l’architettura doppia esiste **da luglio 2025** (CommandCenterHome con useAuth da commit f2af6d8518; AppHome con useUnifiedAuth da commit 0134f2ddc3). Il problema è **architetturale e preesistente**; può essersi reso visibile su iOS per timing/ambiente (cold start, storage, lock) o per maggiore uso/test su device.
- **Regressione recente sì/no:** **No.** Nessun commit recente ha “introdotto” la doppia fonte: la split era già presente. Possibile che modifiche successive (Face ID, auth init, cache) abbiano cambiato l’ordine o la velocità di risposta di getSession, rendendo la race più frequente su iOS; **non dimostrabile** dai soli diff senza log runtime.
- **Problema Apple upload:** **Indipendente.** Dovuto a build number duplicato (primo tentativo) e train 1.0 chiusa + marketing version 1.0 non superiore all’ultima approvata (secondo tentativo). Nessun nesso con auth/state o caricamento profilo.

---

## 2. PROVE

| # | Prova | File / punto |
|---|--------|----------------|
| 1 | AppHome usa **useUnifiedAuth()** (AuthProvider); CommandCenterHome usa **useAuth()** (useAuthSessionManager). Due fonti distinte. | AppHome.tsx riga 52; CommandCenterHome.tsx riga 38 |
| 2 | useHierarchyRank usa **useAuth()** per `user` e **useAuthContext()** per `authReady`. fetchEnergy ha guard **`if (!user?.id) return`**: con user null nessun fetch. | useHierarchyRank.ts righe 45–46, 71 |
| 3 | useMissionStatus e usePrizeData usano **useAuth()** e hanno guard **`if (!user) return`** / **`if (!user) return`** nei load. | useMissionStatus.ts riga 29; usePrizeData.ts riga 55 |
| 4 | useAuthSessionManager inizializza con **user = null**, poi in useEffect chiama **getSessionSingleFlight()** (seconda chiamata dopo quella di AuthProvider). Nessuna cache; stato separato da AuthProvider. | use-auth-session-manager.ts righe 19–20, 182–189 |
| 5 | authSingleFlight invalida **getSessionInflight** nel `.finally()`. La seconda chiamata (useAuthSessionManager) è quindi una **nuova** getSession(), non condivide il risultato della prima. | authSingleFlight.ts riga 49 |
| 6 | AuthProvider inizializza con **getCachedSession()** (AUTH_SESSION_CACHE). Può avere user subito; useAuthSessionManager no. | AuthProvider.tsx righe 66–72 |
| 7 | useAuthSessionManager ha **onAuthStateChange**, ma su cold start getSession() **non** emette eventi; l’evento arriva su signIn/setSession. Quindi al primo caricamento user in useAuthSessionManager dipende **solo** da initializeSession → getSessionSingleFlight(). | use-auth-session-manager.ts righe 269–293; comportamento Supabase getSession vs onAuthStateChange |
| 8 | **git blame**: CommandCenterHome riga 38 `const { user } = useAuth();` da commit **f2af6d8518** (17 luglio 2025). AppHome righe 14 e 52 useUnifiedAuth da commit **0134f2ddc3** (24 luglio 2025 “Fix: Stabilize PWA iOS rendering and login”). La split esiste da allora. | git blame CommandCenterHome.tsx, AppHome.tsx |
| 9 | Nessun commit recente (PE unification, streak, overlay) modifica AuthProvider, use-auth-session-manager, useHierarchyRank, useMissionStatus, usePrizeData per la logica auth/user. | git log --oneline sui file auth e Home |

---

## 3. MAPPA FONTI AUTH

| File | Hook/Provider | Stato esposto | Source of truth | Inizializzazione | Cache | getSession | onAuthStateChange | Dipende da |
|------|----------------|---------------|------------------|-------------------|-------|------------|-------------------|------------|
| **AuthProvider.tsx** | AuthContext (useUnifiedAuth / useAuthContext) | user, session, isLoading, authReady (authHydrated), getCurrentUser, hasRole, … | Stato React locale (useState) | useEffect initializeAuth → getSessionSingleFlight() (con retry), poi onAuthStateChange | Sì: getCachedSession() AUTH_SESSION_CACHE (1h) | Sì (prima chiamata) | Sì supabase.auth.onAuthStateChange | — |
| **use-auth-session-manager.ts** | useAuth() | user, session, isLoading, isAuthenticated, forceSessionFromTokens, clearSession | Stato React locale (useState) | useEffect initializeSession → getSessionSingleFlight(), fallback localStorage getAuthTokenKey() | No (solo fallback token backup) | Sì (seconda chiamata, al mount) | Sì supabase.auth.onAuthStateChange | — |
| **authSingleFlight.ts** | — | — | getSessionInflight (modulo) | getSessionSingleFlight() serializza una getSession; .finally() azzera getSessionInflight | No | Chiamato da entrambi | No | supabase.auth.getSession() |

**Conclusione:** Due fonti indipendenti (AuthProvider e useAuthSessionManager). Entrambe chiamano getSession (a momenti diversi); nessuna condivisione dello stato user tra di loro; useAuthSessionManager non legge da AuthContext.

---

## 4. MAPPA HOME CONSUMER

| File / componente | Usa | Variabile | Fetch dipendenti da user?.id | Se user null | Fallback UI |
|-------------------|-----|-----------|-------------------------------|--------------|-------------|
| **AppHome.tsx** | useUnifiedAuth | user, isLoading, hasRole, getCurrentUser | — | skeleton (isLoading), spinner “home_init_user” (!user) | PageSkeleton, spinner |
| **CommandCenterHome.tsx** | useAuth() | user | usePrizeData, useBuzzPricing(user?.id), useMissionStatus | user null → figli non fetchano | Dati default / vuoti da hook |
| **PulseBarPersonal** | useHierarchyRank() | state (deriva da user in useHierarchyRank) | — | state null → progressPercent/pulseEnergy 0, barra vuota | 0 / default |
| **AgentEnergyPill** | useAgentEnergy (→ useAuth) | user | fetch profile/rank | user null → nessun fetch | Valori default |
| **useHierarchyRank** | useAuth(), useAuthContext() | user, authReady | fetchEnergy → profiles .eq('id', user.id); realtime | **if (!user?.id) return** → fetchEnergy non parte; state resta null | isLoading true poi state null |
| **useMissionStatus** | useAuth() | user | loadMissionStatus (current_mission_data, user_mission_progress) | **if (!user) return** → loadMissionStatus non parte | missionStatus null → UI default |
| **usePrizeData** | useAuth() | user | load prize/userClues | **if (!user) return** → fetch non parte | prizes/userClues vuoti |
| **useAgentEnergy** | useAuth(), useAuthContext() | user, authReady | profile + agent_ranks | user null → nessun fetch | energy null |
| **useProfileRealtime** | useAuthContext() | authReady | getSessionSingleFlight() poi profiles .eq('id', session.user.id) | authReady false → skip; getSession null → profileData null | profileData null |
| **useProfileImage** | useProfileRealtime | profileData.avatar_url | — | profileData null → avatar da localStorage o vuoto | safeGetProfileImage() |
| **AgentDiary, AgentDiaryContent, PrizeVision** | useAuth() | user | dati per diary/prize | user null → hook figli non fetchano | Contenuto vuoto/default |

**Shell vs figli:** La shell (AppHome) usa **useUnifiedAuth** (AuthProvider). I figli (CommandCenterHome, AgentDiary, PrizeVision, useHierarchyRank, useMissionStatus, usePrizeData, useAgentEnergy) usano **useAuth()** (useAuthSessionManager). Una sola fonte (AuthProvider) non alimenta i figli.

---

## 5. CALL GRAPH DEL BOOT

1. **Boot app** — React mount, AuthProvider montato.
2. **Init AuthProvider** — useState(cachedAuth.user), useState(cachedAuth.session), isLoading = !cachedAuth.user. Se cache valida, user già valorizzato.
3. **Lettura cache** — getCachedSession() (AUTH_SESSION_CACHE). Se hit, user/session in stato iniziale.
4. **getSessionSingleFlight #1** — In AuthProvider useEffect initializeAuth(). Se cache miss o non usata, getSessionSingleFlight() eseguita. Al completamento setSession/setUser e cacheSession(); in finally setAuthHydrated(true), setIsLoading(false).
5. **Render AppHome** — useUnifiedAuth() legge AuthContext. Se user presente e !isLoading, passa guard; se !user mostra spinner “home_init_user”.
6. **Mount CommandCenterHome** — useAuth() = useAuthSessionManager montato.
7. **getSessionSingleFlight #2** — In useAuthSessionManager useEffect initializeSession(). getSessionSingleFlight() chiamata (nuova promise, getSessionInflight della #1 già azzerata). Se su iOS ritorna null/error o lock, setUser non chiamato con valore valido → **user resta null**.
8. **Mount useHierarchyRank, useMissionStatus, usePrizeData, useAgentEnergy** — Tutti leggono user da useAuth(). Se user null: useHierarchyRank fetchEnergy **if (!user?.id) return**; useMissionStatus loadMissionStatus **if (!user) return**; usePrizeData **if (!user) return**; useAgentEnergy stesso schema. **Nessun fetch parte.**
9. **Guard che bloccano fetch** — useHierarchyRank riga 71; useMissionStatus riga 29; usePrizeData riga 55; useAgentEnergy (user da useAuth). authReady può essere true (AuthProvider hydrated) ma user in useAuthSessionManager ancora null.
10. **Realtime** — useHierarchyRank sottoscrive realtime su `authReady && user?.id`; se user null, subscription non parte. useProfileRealtime fa getSessionSingleFlight() propria quando authReady; se quella getSession fallisce, profileData resta null.

**Se sessione è temporaneamente null:** AuthProvider può comunque andare in finally e mettere isLoading=false; se getSession non ha restituito session, user=null e AppHome mostra spinner. Se invece AuthProvider ha user (da cache) e useAuthSessionManager no, AppHome rende il contenuto ma CommandCenterHome e hook vedono user null → dati vuoti.

**Se authReady=true ma user=null in useAuthSessionManager:** useHierarchyRank chiama fetchEnergy() (perché authReady true) ma fetchEnergy fa **if (!user?.id) return** e esce senza fare nulla. State resta null. Stesso per gli altri hook.

---

## 6. FALSE CAUSE ESCLUSE

| Causa | Stato | Prova |
|-------|--------|-------|
| **A. Query bloccate da guard sbagliate** | **Confermata come meccanismo** | Le guard `if (!user?.id) return` e `if (!user) return` sono **corrette** semanticamente; bloccano il fetch quando **user è null**. La causa non è una guard “sbagliata” ma il fatto che **user è null** in quella fonte (useAuth). |
| **B. Fetch non parte per effect dependencies** | **Esclusa** | fetchEnergy è chiamato in useEffect([authReady, fetchEnergy]); fetchEnergy è useCallback([user?.id, ...]). Quando user diventa non null, fetchEnergy viene richiamato. Il problema è che **user non diventa non null** in useAuthSessionManager (getSession #2 fallisce o ritorna null). Non è dependency mancante. |
| **C. useHierarchyRank / useMissionStatus / usePrizeData guasti indipendentemente dall’auth** | **Esclusa** | Le query usano .eq('id', user.id) e sono coerenti. Il blocco avviene **prima** della query (guard if (!user) return). Nessun select/eq su campo errato; nessun parse/mapper rotto individuato. |
| **D. Realtime/cache incoerenti** | **Parziale** | useProfileRealtime dipende da getSessionSingleFlight() (propria chiamata); se fallisce, profileData null. La subscription realtime in useHierarchyRank non parte se !user?.id. Non è la causa prima: la causa prima è **user null** in useAuthSessionManager. |
| **E. Regressioni indirette PE/streak/eventi** | **Esclusa** | git log: nessun commit PE/unification/streak tocca AuthProvider, use-auth-session-manager, useHierarchyRank, useMissionStatus, usePrizeData per la logica auth/user. Nessun cambio a import order o provider order in App che rimuova AuthProvider o cambi l’ordine dei consumer. |

---

## 7. REGRESSION ANALYSIS

- **Commit sospetti / cronologia:**
  - **f2af6d8518** (17 luglio 2025): CommandCenterHome già usa `useAuth()` (git show e blame). “RESET COMPLETO 17/07/2025” — non introduzione di useAuth in quel commit, già presente.
  - **0134f2ddc3** (24 luglio 2025): “Fix: Stabilize PWA iOS rendering and login” — AppHome passa a **useUnifiedAuth()** (e AuthProvider potenziato). Da qui la **split** shell = AuthProvider, contenuto = useAuthSessionManager.
  - **97be8fdba** (6 marzo 2026): “chore(safety): core auth/main/i18n/hooks” — ultimo tocco su useHierarchyRank/useMissionStatus/usePrizeData; nessun cambio alla fonte user (restano useAuth()).
- **Conclusione:** **L’architettura doppia era già presente da luglio 2025.** Non è stata introdotta da un commit “recente” (PE/streak/overlay). Il comportamento “Home vuota” può essere sempre stato possibile su iOS in cold start (race tra getSession #1 e #2) e solo ora osservato, oppure reso più probabile da modifiche successive (es. Face ID, auth init, cache) senza che un singolo commit sia dimostrabile come “causa” senza log runtime.

**Risposta secca:** **Architettura già presente da prima** (luglio 2025). **Né “regressione introdotta da commit/file specifico”** né “rotto da modifica recente” sono dimostrabili in modo univoco; la **causa strutturale** (doppia fonte + seconda getSession su iOS) è invece **dimostrata** dal codice.

---

## 8. BREAKPOINT LOGICO ESATTO

- **File:** `src/hooks/use-auth-session-manager.ts`  
- **Hook:** useAuthSessionManager (esposto come useAuth in use-auth.ts).  
- **Effect:** useEffect che chiama initializeSession() (righe 182–266).  
- **Condizione:** getSessionSingleFlight() restituisce **session null** o **error** (es. su iOS per lock/timeout/storage).  
- **Stato input:** Al mount di CommandCenterHome, AuthProvider può aver già user (da cache o da getSession #1). useAuthSessionManager parte con user=null.  
- **Stato output:** setUser(session.user) **non** viene chiamato (perché !session || !session.user). user **resta null**.  
- **Conseguenza:** useHierarchyRank.fetchEnergy (useCallback con user da useAuth) viene invocato con authReady=true ma **user=null**; alla riga 71 **if (!user?.id) return** esce senza fare la query. useMissionStatus loadMissionStatus e usePrizeData idem. **Nessun meccanismo** garantisce un retry quando useAuthSessionManager si allinea: onAuthStateChange si attiva su signIn/setSession, **non** su getSession() a cold start. Quindi se la seconda getSession fallisce, user in useAuthSessionManager resta null fino al prossimo evento auth (es. refresh token, login).

**Formulazione sintetica:** AppHome riceve user da AuthProvider e mostra la Home. CommandCenterHome usa useAuthSessionManager, che al mount inizializza user a null e aspetta una seconda getSession. useHierarchyRank (e gli altri) montano con authReady=true ma user=null (useAuth) e quindi escono subito senza fetch. Non c’è retry quando useAuthSessionManager si riallinea, e il riallineamento su cold start avviene solo se la seconda getSession riesce o se poi scatta un onAuthStateChange (non garantito dopo sola getSession).

---

## 9. APPLE UPLOAD FORENSICS

- **Errori reali e separati:**  
  (1) **Build number duplicato** — CFBundleVersion inviato già usato.  
  (2) **Train 1.0 chiusa** — “The train version '1.0' is closed for new build submissions”.  
  (3) **Marketing version 1.0 non più valida** — “CFBundleShortVersionString [1.0] must contain a higher version than previously approved version [1.0]”.
- **Collegamento con problema profilo/Home:** **Nessuno.** Upload fallisce per versioning; profilo/Home per auth/state. Indipendenti.
- **Source of truth versioning iOS:**  
  - **CFBundleShortVersionString:** da **$(MARKETING_VERSION)** in Info.plist; valore da **project.pbxproj** (MARKETING_VERSION = 1.0).  
  - **CFBundleVersion:** **Info.plist** (stringa hardcoded 20260127051624).  
  - **CURRENT_PROJECT_VERSION** in project.pbxproj = 1; **non** usato da Info.plist per CFBundleVersion.  
  - Nessuno script nel repo modifica questi valori in build/cap sync.
- **manageAppVersionAndBuildNumber:** Nessun ExportOptions*.plist versionato; non è verificabile se Xcode usa “Manage Version and Build Number” in export. Se attivo, può sovrascrivere; la base resta project.pbxproj + Info.plist.

---

## 10. TOP 10 FILE DA TOCCARE DOPO

1. **src/hooks/use-auth.ts** — Far sì che useAuth() esponga lo stesso user/session di AuthContext (lettura da contesto) invece di stato duplicato da useAuthSessionManager, oppure deprecare useAuth per la lettura e usare useUnifiedAuth/useAuthContext.  
2. **src/hooks/use-auth-session-manager.ts** — Allineare a AuthProvider: leggere user/session da AuthContext quando disponibili invece di seconda getSession, mantenendo forceSessionFromTokens/clearSession per login/logout.  
3. **src/components/command-center/CommandCenterHome.tsx** — Usare useUnifiedAuth() o useAuthContext() per user (stessa fonte di AppHome).  
4. **src/hooks/useHierarchyRank.ts** — Usare user da useAuthContext() o useUnifiedAuth() invece di useAuth().  
5. **src/hooks/useMissionStatus.ts** — Idem.  
6. **src/hooks/usePrizeData.ts** — Idem.  
7. **src/features/pulse/hooks/useAgentEnergy.ts** — Idem.  
8. **src/components/command-center/home-sections/AgentDiary.tsx**, **AgentDiaryContent.tsx**, **PrizeVision.tsx** — Se necessario, passare a useAuthContext()/useUnifiedAuth() per user.  
9. **ios/App/App.xcodeproj/project.pbxproj** — MARKETING_VERSION a 1.1 (o superiore) per nuova train.  
10. **ios/App/App/Info.plist** — CFBundleVersion a valore nuovo univoco per ogni upload.

---

## 11. BLACKLIST FILE DA NON TOCCARE

- **Login / logout:** flussi completi (StandardLoginForm, useFaceIDLogin, useAppleAuth, useGoogleAuth, signIn/signOut in AuthProvider e use-auth), clearSession/forceSessionFromTokens solo per refactor mirato auth, non per rimuovere logica.  
- **Delete account:** DeleteAccountModalContent, flusso cancellazione.  
- **IAP / StoreKit / receipts / purchase flow / subscription.**  
- **BUZZ:** useBuzzHandler, BuzzActionButton, logica clue/prezzo.  
- **BUZZ MAP:** BuzzMapButtonSecure, azioni mappa.  
- **Push native / BattlePush / notifiche.**  
- **M1U engine, routing, navigazione.**  
- **Supabase schema, migration, RLS.**  
- **File di report e forensics.**

---

## 12. CONCLUSIONE FINALE

- **Cosa sta succedendo davvero:** La Home ha **due fonti auth**. La shell usa AuthProvider (spesso con user da cache o prima getSession). Il contenuto usa useAuthSessionManager, che fa una **seconda** getSession al mount; su iOS quella chiamata può dare null/errore. In quel caso **user resta null** nei hook dati; le guard **if (!user) return** impediscono qualsiasi fetch; PE, rank, missione, prize restano vuoti. **Non** è un bug “nuovo” introdotto da un commit: la doppia fonte esiste da luglio 2025.  
- **Cosa NON sta succedendo:** Non è una regressione puntuale da file PE/streak/overlay. Non è un errore di query/select/eq. Non è (solo) realtime/cache: la causa prima è user null in useAuthSessionManager. L’upload Apple non c’entra con il profilo.  
- **Cosa fare dopo (senza implementare ora):** (1) **Versioning Apple:** MARKETING_VERSION > 1.0 e CFBundleVersion univoco. (2) **Auth/Home:** Unificare la fonte user per la Home (un solo consumer: AuthContext) così che CommandCenterHome e tutti gli hook dati leggano lo stesso user di AppHome, senza seconda getSession in concorrenza; oppure far sì che useAuthSessionManager non faccia una seconda getSession ma legga da AuthContext. Nessuna patch applicata in questa fase.

---

*Report forense read-only. Nessuna modifica. Nessun commit, build, cap sync.*
