# HOME AUTH/STATE — VERIFICA CONCLUSIVA MIRATA iOS (READ-ONLY)

**Data:** 2026-03-09  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Modalità:** Solo lettura. Nessuna patch, nessun commit, nessun build.

---

## Executive Summary

L’ipotesi è **confermata dal codice**. La Home usa **due fonti auth/state distinte e non condivise**:

1. **AuthProvider** (esposto da `useUnifiedAuth()` / `useAuthContext()`) — stato React interno, inizializzato da cache (`getCachedSession`) e da `getSessionSingleFlight()` in `useEffect`. AppHome legge da qui.
2. **useAuthSessionManager** (esposto da `useAuth()`) — stato React interno **separato**, inizializzato a `user=null`, `session=null`, `isLoading=true`; poi in `useEffect` chiama **una seconda** `getSessionSingleFlight()`. CommandCenterHome e i 4 hook dati (useHierarchyRank, useMissionStatus, usePrizeData, useAgentEnergy) leggono **solo** da qui.

Se al boot iOS la seconda getSession (in useAuthSessionManager) restituisce null/errore o arriva dopo che i figli hanno già valutato le guard, **user resta null** in useAuth(); le guard `if (!user?.id) return` / `if (!user) return` nei data hook **bloccano i fetch**; la Home mostra il guscio ma senza PE, rank, missione, prize, energy. **Causa runtime:** doppia fonte + seconda getSession non condivisa con AuthProvider. **Non** è una regressione recente: la split è presente da luglio 2025 (git blame). Apple upload è **non correlato**.

---

## 1. MAPPA ESATTA DELLE FONTI AUTH

### 1.1 Chi usa quale hook

| Hook | File definizione | Chi lo usa (rilevante per Home) |
|------|-------------------|----------------------------------|
| **useUnifiedAuth()** | `src/hooks/useUnifiedAuth.ts` | **AppHome.tsx** (riga 52) |
| **useAuth()** | `src/hooks/use-auth.ts` → delega a useAuthSessionManager | **CommandCenterHome.tsx** (38), **useHierarchyRank.ts** (45), **useMissionStatus.ts** (26), **usePrizeData.ts** (51), **useAgentEnergy.ts** (41), AgentDiary, AgentDiaryContent, PrizeVision |
| **useAuthContext()** | `src/contexts/auth/useAuthContext.ts` → stesso contesto di useUnifiedAuth | useHierarchyRank (authReady), useAgentEnergy (authReady), useProfileRealtime (authReady), altri |

### 1.2 Da dove leggono user/session

- **useUnifiedAuth()** — `useContext(AuthContext)`. Il valore viene da **AuthProvider**, che tiene stato con `useState(cachedAuth.user)`, `useState(cachedAuth.session)`, aggiornato in `initializeAuth` con `getSessionSingleFlight()` e `onAuthStateChange`. **Fonte:** stato React di AuthProvider + cache `m1ssion_session_cache`.
- **useAuth()** — ritorna `sessionManager.user`, `sessionManager.session` dove `sessionManager = useAuthSessionManager()`. **Fonte:** stato React di **useAuthSessionManager** (`useState(null)` per user/session), aggiornato solo in `initializeSession` con **una propria** `getSessionSingleFlight()` e in `onAuthStateChange` (stesso Supabase, stato **non** condiviso con AuthProvider).

**Conclusione:** **Non** condividono la stessa memoria/state. Sono **due state machine separate**. useAuth() **oggi legge solo** da useAuthSessionManager. useUnifiedAuth() **oggi legge solo** da AuthProvider (AuthContext). I due percorsi **non** usano lo stesso state.

### 1.3 Tabella finale fonti auth

| File | Hook auth usato | user source | session source | Guard che bloccano fetch |
|------|------------------|-------------|----------------|---------------------------|
| **AppHome.tsx** | useUnifiedAuth | AuthProvider (AuthContext) | AuthProvider | `if (isLoading)` → skeleton; `if (!user)` → spinner "home_init_user" |
| **CommandCenterHome.tsx** | useAuth() | useAuthSessionManager | useAuthSessionManager | Nessuna guard su user; ma i figli (hook dati) sì |
| **useHierarchyRank.ts** | useAuth(), useAuthContext(authReady) | useAuthSessionManager | — | `if (!user?.id) return` in fetchEnergy (71); `if (!authReady \|\| !user?.id) return` in effect realtime (164) |
| **useMissionStatus.ts** | useAuth() | useAuthSessionManager | — | `if (!user)` in loadMissionStatus (29); `if (!user) return` in effect (275) |
| **usePrizeData.ts** | useAuth() | useAuthSessionManager | — | `if (!user) return` in loadPrizes (55); effect `if (user)` per chiamare loadPrizes (277–281) |
| **useAgentEnergy.ts** | useAuth(), useAuthContext(authReady) | useAuthSessionManager | — | `if (!user?.id) return` in fetchEnergy (84); `if (!authReady \|\| !user?.id) return` in effect realtime (151) |

---

## 2. CALL GRAPH REALE DI BOOT DELLA HOME

Sequenza temporale reale (da codice):

1. **Boot app** — React monta albero. AuthProvider è antenato di AppHome.
2. **Mount AuthProvider** — `getCachedSession()` in lettura sincrona; `useState(cachedAuth.user)`, `useState(cachedAuth.session)`, `useState(!cachedAuth.user)` per isLoading, `useState(!!cachedAuth.user)` per authHydrated. Se cache hit, user/session già valorizzati.
3. **getSessionSingleFlight #1** — In AuthProvider, `useEffect` → `initializeAuth()` → `getSessionSingleFlight()`. Al termine: setSession/setUser, cacheSession(), setAuthHydrated(true), setIsLoading(false). **user/session** in AuthProvider aggiornati.
4. **Mount AppHome** — useUnifiedAuth() legge AuthContext → stesso stato di AuthProvider. **user** e **isLoading** da lì.
5. **Guard di AppHome** — Riga 190: `if (isLoading) return <PageSkeleton />`. Riga 195: `if (!user) return` (spinner "home_init_user"). Se AuthProvider ha user valido e isLoading=false, **si supera** e si rende il layout con CommandCenterHome.
6. **Mount CommandCenterHome** — useAuth() invocato → useAuthSessionManager montato.
7. **useAuthSessionManager** — Stato iniziale: `user=null`, `session=null`, `isLoading=true` (righe 18–20 use-auth-session-manager.ts). **Nessuna cache**. In `useEffect`: `initializeSession()` → **getSessionSingleFlight #2** (riga 188). Se #2 restituisce session null o error (es. su iOS lock/timeout), `setUser`/`setSession` non vengono chiamati con valore valido → **user resta null**.
8. **Mount useHierarchyRank, useMissionStatus, usePrizeData, useAgentEnergy** — Tutti leggono **user** da useAuth() = useAuthSessionManager.  
   - **useHierarchyRank:** effect (158–160) `if (authReady) fetchEnergy();`; fetchEnergy (71) `if (!user?.id) return` → **con user null non fa fetch**.  
   - **useMissionStatus:** effect (274–276) `if (!user) return; loadMissionStatus();` → **con user null loadMissionStatus non parte** (e loadMissionStatus stesso ha `if (!user) return` a 29).  
   - **usePrizeData:** effect (277–281) `if (user) loadPrizes();` → **con user null loadPrizes non viene chiamato**.  
   - **useAgentEnergy:** come useHierarchyRank, `if (authReady) fetchEnergy();` e fetchEnergy (84) `if (!user?.id) return` → **con user null non fa fetch**.

**Quando getSession #2 è null/errore:**  
- **user** in useAuthSessionManager resta **null**.  
- **authReady** può essere **true** (AuthProvider ha finito).  
- I 4 hook eseguono gli effect ma le funzioni di fetch escono subito per le guard su **user**.  
- Risultato: **shell Home visibile, dati (PE, rank, mission, prize, energy) vuoti/default**.

Flusso sintetico: **A (AuthProvider init + getSession #1) → B (AppHome guard con user da AuthProvider) → C (CommandCenterHome monta, getSession #2 in useAuthSessionManager) → D (hook dati montano, leggono user da useAuth; se user null, guard bloccano fetch)**.

---

## 3. BREAKPOINT LOGICO DEFINITIVO

### A. AuthProvider

- **File:** `src/contexts/auth/AuthProvider.tsx`.  
- Se AuthProvider ha **user valido** (da cache o da getSession #1): lo espone via AuthContext.  
- **Cosa monta:** AppHome riceve da useUnifiedAuth() quel user; supera `if (isLoading)` e `if (!user)` e rende il layout incluso **CommandCenterHome**.

### B. useAuthSessionManager

- **File:** `src/hooks/use-auth-session-manager.ts`.  
- **Parte con user null:** Sì. Righe 18–20: `useState<User | null>(null)`, `useState<Session | null>(null)`, `useState(true)` per isLoading.  
- **Fa una seconda getSession:** Sì. Riga 188: `const { data: { session }, error } = await getSessionSingleFlight();` dentro `initializeSession()` in useEffect.  
- **Condivide il risultato di AuthProvider?** No. Stato locale; AuthProvider non passa nulla a useAuthSessionManager.  
- **Se la seconda getSession restituisce null/error:** Righe 197–203: si entra in Method 2 (localStorage backup) o in catch; se nessuno setta session/user valido, **user e session restano null** (e in finally setIsLoading(false)). Quindi **user resta null** nello state di useAuthSessionManager.

### C. useHierarchyRank

- **File:** `src/hooks/useHierarchyRank.ts`.  
- **Da dove prende user:** useAuth() (riga 45), cioè useAuthSessionManager.  
- **Guard che blocca il fetch:** Riga 71: `if (!user?.id) return;` all’inizio di `fetchEnergy`.  
- **Se authReady=true e user=null:** L’effect (158–160) chiama `fetchEnergy()` perché `authReady` è true. `fetchEnergy` esegue `if (!user?.id) return` e **esce senza fare la query**. State resta null, PulseBarPersonal mostra 0/default.

### D. useMissionStatus

- **File:** `src/hooks/useMissionStatus.ts`.  
- **Guard:** Riga 29: `if (!user) { setLoading(false); return; }` in loadMissionStatus. Effect (274–276): `if (!user) return; loadMissionStatus();` — se user null non chiama loadMissionStatus.  
- **Dipende da user di useAuth:** Sì (riga 26: `const { user } = useAuth();`).

### E. usePrizeData

- **File:** `src/hooks/usePrizeData.ts`.  
- **Guard:** Riga 55: `if (!user) return;` in loadPrizes. Effect (277–281): `if (user) loadPrizes();` — con user null loadPrizes non viene invocato.  
- **Dipende da user di useAuth:** Sì (riga 51).

### F. useAgentEnergy

- **File:** `src/features/pulse/hooks/useAgentEnergy.ts`.  
- **Guard:** Riga 84: `if (!user?.id) return;` in fetchEnergy. Effect (151): `if (!authReady || !user?.id) return` per realtime; effect (145–147) `if (authReady) fetchEnergy();` — con user null fetchEnergy esce subito.  
- **Dipende da user di useAuth:** Sì (riga 41).

### Scenario concreto

Lo scenario **“AppHome autenticata + CommandCenterHome montato + user null nei data hooks + fetch bloccati”** **esiste** e si materializza così:

- **Dove:** In **useAuthSessionManager** (seconda getSession restituisce null/error o non è ancora completata quando i figli leggono user), e subito dopo nelle **guard** dei 4 hook (useHierarchyRank riga 71, useMissionStatus riga 29, usePrizeData riga 55, useAgentEnergy riga 84).
- **Breakpoint logico più importante:** **`src/hooks/use-auth-session-manager.ts`**, effect che chiama `initializeSession()` → `getSessionSingleFlight()`. Se il risultato non fornisce session/user validi, **user resta null**; tutti i consumer di useAuth() (CommandCenterHome e i 4 hook) vedono user null e le rispettive guard bloccano i fetch.

---

## 4. VERIFICA DELLA TESI “NON È UNA REGRESSIONE RECENTE”

### 4.1 Da quando

- **AppHome usa useUnifiedAuth():** git blame AppHome.tsx riga 52 (e import 14) → commit **0134f2ddc3** (24 luglio 2025, “Fix: Stabilize PWA iOS rendering and login”).  
- **CommandCenterHome usa useAuth():** git blame CommandCenterHome.tsx riga 38 → commit **f2af6d8518** (17 luglio 2025).  
- **useHierarchyRank / useMissionStatus / usePrizeData / useAgentEnergy leggono da useAuth():** presente da lungo tempo (useMissionStatus/usePrizeData da prima del MEGA BACKUP; useHierarchyRank e useAgentEnergy con useAuth già nelle versioni esaminate).  

Quindi: **split architetturale presente da luglio 2025**.

### 4.2 Ultimi fix PE/streak/overlay/home reward

- Nessuna modifica a: auth bootstrap (AuthProvider, useAuthSessionManager), provider order in App, **user source** (CommandCenterHome e i 4 hook continuano a usare useAuth()).  
- Nessun cambio al mount order della Home (AppHome → CommandCenterHome).  
- Nessun cambio agli import auth in AppHome, CommandCenterHome, useHierarchyRank, useMissionStatus, usePrizeData, useAgentEnergy in relazione a PE unification / streak / overlay.

**Conclusione:** **Nessuna prova di regressione recente** introdotta da PE/streak/overlay. **Causa architetturale preesistente** (doppia fonte da luglio 2025). Un **eventuale trigger recente** (es. Face ID, session restore, timing iOS) potrebbe aver reso più frequente la race senza che un singolo commit sia identificabile come “causa” senza log runtime.

---

## 5. FALSI POSITIVI DA ESCLUDERE

| # | Causa alternativa | Stato | Motivazione |
|---|--------------------|--------|-------------|
| 1 | Query Supabase errate | **Esclusa** | Le query usano `.eq('id', user.id)`; il blocco avviene **prima** (guard `if (!user) return`). Nessuna query parte se user è null. |
| 2 | Guard sbagliate nei data hooks | **Esclusa** | Le guard sono corrette: bloccano il fetch quando **non c’è user**. Il problema non è la guard ma il fatto che **user è null** nella fonte usata (useAuth). |
| 3 | Provider non montato o montato male | **Esclusa** | AuthProvider avvolge l’app; useAuthSessionManager è invocato da useAuth() dentro CommandCenterHome e hook. Entrambi sono montati; non condividono lo state. |
| 4 | Realtime che sovrascrive dati buoni con vuoti | **Esclusa** | Il realtime nei 4 hook si attiva solo con `user?.id`; con user null la subscription non parte. Non c’è path in cui realtime “sovrascriva” dati già caricati con vuoti in questo flusso. |
| 5 | Cache profilo corrotta | **Esclusa** | Il sintomo (dati mai caricati) è coerente con fetch mai partiti (user null), non con fetch riusciti e poi cache corrotta. |
| 6 | Avatar/profile image pipeline che maschera il vero problema | **Esclusa** | useProfileImage/useProfileRealtime possono essere vuoti per altri motivi, ma il problema “PE, rank, mission, prize, energy vuoti” è spiegato dai 4 hook che non fetchano per user null. |
| 7 | useMissionStatus / usePrizeData / useAgentEnergy rotti per motivi indipendenti dall’auth | **Esclusa** | Tutti e tre dipendono da `user` da useAuth(); le guard sono su user. Se user fosse valido, i fetch partirebbero. |
| 8 | Regressione introdotta da PE unification | **Esclusa** | PE unification non tocca AuthProvider, use-auth-session-manager, né la scelta della fonte user in CommandCenterHome o nei 4 hook. |
| 9 | Regressione introdotta da streak modal | **Esclusa** | Streak modal non modifica bootstrap auth né la fonte user in Home. |
| 10 | Problema dovuto a upload Apple/versioning | **Esclusa** | Upload Apple riguarda build number e marketing version; nessun nesso con auth/state o caricamento profilo. |

---

## 6. VERDETTO FINALE

1. **La Home usa davvero due fonti auth/state diverse?** **Sì.** (AuthProvider/useUnifiedAuth vs useAuthSessionManager/useAuth; stato non condiviso.)
2. **Queste due fonti possono divergere al boot iOS?** **Sì.** (AuthProvider può avere user da cache o da getSession #1; useAuthSessionManager fa getSession #2, che può fallire o restituire null; stato indipendente.)
3. **Se divergono, i data hooks possono restare con user null e non fetchare?** **Sì.** (I 4 hook leggono user da useAuth(); guard `if (!user?.id) return` / `if (!user) return` bloccano i fetch.)
4. **Questo spiega in modo coerente il sintomo “shell Home sì, dati profilo no”?** **Sì.** (Shell passa con user da AuthProvider; contenuto dati dipende da useAuth() che può restare null.)
5. **È una causa certa al 100% oppure solo la più probabile?** **La più probabile** in base al codice e al flusso logico. La certezza al 100% richiederebbe log runtime su device iOS (es. valore di user in useAuthSessionManager subito dopo getSession #2) per escludere altre cause esterne (rete, storage, Supabase).
6. **È una regressione recente provata?** **No.** (Split presente da luglio 2025; nessun commit recente che introduca la doppia fonte o cambi la fonte user in Home.)
7. **I problemi Apple upload sono collegati a questo?** **No.**
8. **Singolo breakpoint logico più importante:** **useAuthSessionManager**, effect che chiama `initializeSession()` → `getSessionSingleFlight()`. Se quella chiamata non fornisce session/user validi (o non è ancora completata quando i figli leggono), **user resta null** e tutti i consumer useAuth() non fetchano.
9. **Primi 5 file da toccare DOPO (se si farà il fix):**  
   (1) `src/hooks/use-auth.ts` — far sì che user/session letti da useAuth() provengano da AuthContext quando disponibili, oppure deprecare useAuth per la lettura e usare useUnifiedAuth/useAuthContext;  
   (2) `src/hooks/use-auth-session-manager.ts` — allineare a AuthProvider (leggere user/session da contesto quando disponibili, mantenere forceSessionFromTokens/clearSession per login/logout);  
   (3) `src/components/command-center/CommandCenterHome.tsx` — usare useUnifiedAuth() o useAuthContext() per user;  
   (4) `src/hooks/useHierarchyRank.ts` — user da useAuthContext()/useUnifiedAuth();  
   (5) `src/hooks/useMissionStatus.ts`, `src/hooks/usePrizeData.ts`, `src/features/pulse/hooks/useAgentEnergy.ts` — idem (stessa fonte user).
10. **File da non toccare:** Login/logout (flussi completi, signIn/signOut, clearSession/forceSessionFromTokens solo per refactor auth mirato), delete account, IAP, BUZZ, BUZZ MAP, push native, M1U engine, routing, Supabase schema/migration/RLS, report e file forensi.

---

*Report read-only. Nessuna modifica, nessun commit, nessun build, nessun cap sync.*
