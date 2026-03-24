# Profile and Apple Upload Forensics — 2026-03-09

**Modalità:** Solo lettura. Nessuna modifica a codice, config, plist, env, build, versioning.  
**Scope:** (A) Profilo/dati utente non caricati su iOS; (B) Upload App Store Connect fallito.  
**Obiettivo:** Diagnosi precisa e piano fix futuro senza patch in questa fase.

---

# 1. Executive Summary

- **Profilo non caricato:** La Home usa **due fonti di stato auth distinte**. La shell (AppHome) usa `useUnifiedAuth()` → **AuthProvider** (user/session da cache o primo `getSessionSingleFlight`). Il contenuto interno (CommandCenterHome, PulseBarPersonal, mission, prize, rank) usa **`useAuth()`** → **useAuthSessionManager**, che mantiene un proprio stato user/session e fa un secondo `getSessionSingleFlight()` in un `useEffect` al mount. Su iOS (WKWebView) il secondo getSession può essere lento, fallire o restituire null (storage/cookie/lock contention), lasciando **user = null** in useAuthSessionManager. Di conseguenza useHierarchyRank, useMissionStatus, usePrizeData e useAgentEnergy non fetchano (dipendono da `user?.id`), e la Home mostra guscio con dati vuoti/default. **Causa probabile:** doppia fonte auth + race/secondo getSession su iOS, non una regressione puntuale nei file PE/unification.
- **Upload Apple fallito:** (1) Primo tentativo: **build number duplicato** (valore inviato già usato in precedenza). (2) Secondo tentativo: **train 1.0 chiusa** e **CFBundleShortVersionString [1.0] non superiore alla versione già approvata [1.0]**. Apple richiede una **marketing version > 1.0** (es. 1.1) per inviare una nuova build; il build number a quel punto non è più il problema.
- **Correlazione:** **I due problemi sono indipendenti.** Il profilo non si carica per la doppia fonte auth e il comportamento di getSession su iOS. L’upload fallisce per versioning (train chiusa + marketing version da incrementare). Nessuna causa comune (build sbagliata, config iOS “rotta”, env) è emersa dal codice.

---

# 2. Profile Loading Runtime Map

| File | Funzione / hook | Cosa carica | Da dove prende i dati | Dove può rompersi |
|------|------------------|-------------|------------------------|-------------------|
| **AuthProvider.tsx** | initializeAuth, onAuthStateChange | user, session | getSessionSingleFlight(), cache localStorage (AUTH_SESSION_CACHE) | getSession fallisce/ritardo; cache scaduta o corrotta; onAuthStateChange non fire su iOS |
| **useUnifiedAuth** (AuthContext) | — | user, session, isLoading, authReady (authHydrated) | AuthProvider (stesso contesto) | Se AuthProvider ha user=null o isLoading bloccato, AppHome vede skeleton o “init user” |
| **use-auth.ts** → **useAuthSessionManager** | initializeSession (useEffect) | user, session, isLoading | getSessionSingleFlight() + fallback localStorage (getAuthTokenKey()) | **Secondo getSession** (dopo AuthProvider) su iOS può restituire null o fallire; stato user resta null; nessun listener condiviso con AuthProvider |
| **AppHome.tsx** | — | — | useUnifiedAuth (user, isLoading), useProfileImage, useMissionStatus (duale) | Se isLoading → skeleton; se !user → spinner “home_init_user”. Se user OK ma figli usano useAuth() con user null → contenuto vuoto |
| **CommandCenterHome.tsx** | — | mission, progress, prize, PE, battle | **useAuth()** (user), usePrizeData(user?.id), useMissionStatus(user), useBuzzPricing(user?.id) | **useAuth() = useAuthSessionManager**: se user null, tutti i fetch che dipendono da user?.id non partono → dati vuoti |
| **useHierarchyRank.ts** | fetchEnergy | pulse_energy, rank state | supabase profiles .eq('id', **user.id**), useAuth() + useAuthContext(authReady) | Se **user** (useAuth) è null, fetchEnergy esce subito; state resta null → PulseBarPersonal mostra 0/default |
| **useAgentEnergy.ts** | — | pulseEnergy, rank | useAuth() (user), supabase profiles + agent_ranks | Stesso problema: user null → nessun fetch |
| **useMissionStatus.ts** | loadMissionStatus | missionStatus | **useAuth()** (user); supabase current_mission_data, user_mission_progress | Se user null → loadMissionStatus non fa nulla → missionStatus null → UI default |
| **usePrizeData.ts** | — | prizes, userClues | **useAuth()** (user) | Se user null → fetch non avviene → dati vuoti |
| **useProfileRealtime.ts** | setupRealtimeSubscription | profileData (nome, avatar, bio, agent_code) | useAuthContext(authReady), **getSessionSingleFlight()** (propria chiamata), supabase profiles .eq('id', session.user.id) | Dipende da authReady + getSession; se getSession ritorna null in questa seconda chiamata, profileData resta null |
| **useProfileImage.ts** | — | profileImage | useProfileRealtime (profileData.avatar_url) + localStorage | Se useProfileRealtime non ha dati, avatar vuoto o da cache |
| **PulseBarPersonal.tsx** | — | PE, rank progress | useHierarchyRank() → state | Se useHierarchyRank.state null (per user null in useAuth), barra vuota/default |
| **AgentEnergyPill** | — | PE, rank | useAgentEnergy o dati condivisi | Stesso vincolo user da useAuth |

---

# 3. Root Cause Probabile Profilo

1. **Doppia fonte auth (AuthProvider vs useAuthSessionManager) e race su iOS**  
   AppHome e ProtectedRoute usano useUnifiedAuth (AuthProvider); CommandCenterHome e la maggior parte degli hook dati (useMissionStatus, usePrizeData, useHierarchyRank, useAgentEnergy) usano **useAuth()** = useAuthSessionManager. useAuthSessionManager ha stato separato e chiama getSessionSingleFlight() nel proprio useEffect al mount. Su iOS WKWebView la seconda getSession può essere più lenta, subire lock/timeout (authSingleFlight.ts è già mitigato ma con un solo retry) o restituire null, lasciando **user = null** in useAuthSessionManager mentre AuthProvider ha già user dalla cache o dalla prima getSession. **Evidenza:** due hook diversi (AuthContext vs useAuthSessionManager), due useEffect indipendenti, due chiamate getSessionSingleFlight a momenti diversi; useHierarchyRank/useMissionStatus/usePrizeData dipendono da useAuth().user.

2. **getSessionSingleFlight condiviso ma chiamate sequenziali**  
   authSingleFlight.ts invalida getSessionInflight dopo il primo .finally(). Quindi la chiamata di AuthProvider e quella di useAuthSessionManager non condividono lo stesso risultato: la seconda è una nuova getSession(). Su device iOS, storage/cookie Supabase o lock possono dare esito diverso alla seconda chiamata. **Evidenza:** authSingleFlight.ts riga 49: `getSessionInflight = run(0).finally(() => { getSessionInflight = null; });`.

3. **authReady (authHydrated) true mentre useAuth() ha ancora user null**  
   useHierarchyRank e useProfileRealtime aspettano authReady prima di fare fetch, ma prendono user/session da fonti diverse (useAuth vs getSession). Se authReady diventa true (AuthProvider ha completato) e subito dopo si monta CommandCenterHome, useAuthSessionManager può essere ancora in loading o aver ricevuto null. **Evidenza:** useHierarchyRank righe 158–160: fetchEnergy() viene chiamato quando authReady è true, ma fetchEnergy usa user?.id da useAuth(); se user è null, ritorna senza fare nulla.

4. **Cache AuthProvider vs nessuna cache in useAuthSessionManager**  
   AuthProvider inizializza con getCachedSession() (AUTH_SESSION_CACHE, 1h), quindi può mostrare user subito; useAuthSessionManager parte sempre con user=null e isLoading=true e aspetta getSession. Su cold start iOS, la prima paint può mostrare Home con user (da cache) e subito dopo i figli che usano useAuth() vedono ancora user null. **Evidenza:** AuthProvider righe 66–72 (cachedAuth), useAuthSessionManager righe 19–20 (useState(null)).

5. **Nessuna regressione puntuale nei file PE/unification/streak**  
   I file modificati in PE unification e streak (BattleDefenseModal, useClueMilestones, OnboardingOverlay, StreakModal, useAwardPE) non toccano AuthProvider, useAuthSessionManager, useHierarchyRank (eccetto emissione eventi post-accredito), né la catena di mount di AppHome/CommandCenterHome. Non risultano modifiche a fetch profilo, .eq('id', user.id), o guard che forzano stato vuoto. **Evidenza:** grep e lettura dei diff concettuali: nessun tocco a auth bootstrap, session restore, o ai hook che leggono user da useAuth().

---

# 4. Apple Upload Forensics

| Errore | Significato reale | Causa | File/config coinvolti | Severità |
|--------|-------------------|--------|------------------------|----------|
| Build number già usato (primo tentativo) | Un build con lo stesso CFBundleVersion è già stato inviato per questa app. | Valore CFBundleVersion inviato (es. 20260127051624) già presente su App Store Connect (o valore precedente 20260127051631 già usato). | **ios/App/App/Info.plist** → `<key>CFBundleVersion</key><string>20260127051624</string>` (hardcoded) | Alta per quel tentativo; risolvibile con nuovo build number univoco |
| "Invalid Pre-Release Train. The train version '1.0' is closed for new build submissions" | La “train” (marketing version) 1.0 non accetta più nuove build. | Apple chiude la train quando è stata approvata/pubblicata o quando non si accettano più build per quella versione. | **project.pbxproj** → MARKETING_VERSION = 1.0; **Info.plist** → CFBundleShortVersionString = $(MARKETING_VERSION) | Alta: blocca l’upload finché non si usa una nuova train |
| "CFBundleShortVersionString [1.0] must contain a higher version than previously approved version [1.0]" | La versione marketing inviata (1.0) non è maggiore dell’ultima già approvata (1.0). | Per una nuova submission serve una **marketing version superiore** (es. 1.1 o 2.0). | Come sopra | Alta: obbligatorio incrementare la marketing version |

- **Il primo errore era solo build number duplicato?** **Sì.** Il messaggio indica che il CFBundleVersion inviato era già stato usato.
- **Il secondo errore è solo train 1.0 chiusa + marketing version da portare > 1.0?** **Sì.** Non si possono più inviare build sulla train 1.0 e la stringa di versione deve essere maggiore di 1.0.
- **C’è un altro errore nascosto nei log?** **Non deducibile** dai soli messaggi citati; in questa fase non risultano altri errori da codice/config.
- **Problema team/account individuale è irrilevante in questi log?** **Sì.** I messaggi riguardano version/train e build number, non permessi o account.

**manageAppVersionAndBuildNumber in export:** Non è presente un ExportOptions*.plist nel repo; non risulta che Xcode stia usando `manageAppVersionAndBuildNumber=true` da file versionati. Se fosse abilitato solo in Xcode/UI, potrebbe sovrascrivere i valori a archive/export; i file locali (Info.plist + project.pbxproj) restano comunque la base e vanno allineati per una submission corretta.

---

# 5. Source of Truth Versioning iOS

| File / punto | Controlla | Valore attuale / nota |
|--------------|----------|------------------------|
| **ios/App/App/Info.plist** | CFBundleShortVersionString | `$(MARKETING_VERSION)` → risolto a build time da Xcode |
| **ios/App/App/Info.plist** | CFBundleVersion | **Hardcoded** `20260127051624` → non usa CURRENT_PROJECT_VERSION |
| **ios/App/App.xcodeproj/project.pbxproj** (Debug e Release) | MARKETING_VERSION | `1.0` |
| **ios/App/App.xcodeproj/project.pbxproj** | CURRENT_PROJECT_VERSION | `1` (non usato da Info.plist per CFBundleVersion) |
| **package.json** | version | `0.0.0` → non usato da iOS |
| **capacitor.config.ts** | — | Nessun campo version per iOS |
| **Script custom** | — | Nessuno script nel repo che modifichi Info.plist o MARKETING_VERSION in fase di build/cap sync |

**Conclusione:**  
- **Marketing version (CFBundleShortVersionString):** source of truth = **project.pbxproj** (MARKETING_VERSION = 1.0).  
- **Build number (CFBundleVersion):** source of truth = **Info.plist** (stringa hardcoded). CURRENT_PROJECT_VERSION nel project non è usato da Info.plist per il build number.

---

# 6. Correlazione tra i due problemi

- **Indipendenti.**  
- **Profilo:** dipende dalla doppia fonte auth (AuthProvider vs useAuthSessionManager) e dal comportamento di getSession su iOS (seconda chiamata, storage, eventuale lock). Non dipende da versioning, da Info.plist, da build number o da train Apple.  
- **Upload Apple:** dipende da versioning (train 1.0 chiusa e marketing version da incrementare) e da build number univoco. Non dipende da auth, da caricamento profilo o da logica React.  
- **Nessuna causa comune** individuata (stessa build, stessa config iOS “rotta”, env mancanti, sync Capacitor) tra i due sintomi.

---

# 7. Top 10 file da toccare DOPO

1. **src/hooks/use-auth.ts** e **src/hooks/use-auth-session-manager.ts** — Allineare la fonte user alla stessa di AuthProvider (es. usare AuthContext per user in lettura invece di stato duplicato) così CommandCenterHome e hook dati vedono lo stesso user senza secondo getSession in concorrenza.  
2. **src/components/command-center/CommandCenterHome.tsx** — Se si unifica auth: usare useUnifiedAuth() o useAuthContext() per user invece di useAuth(), così PE/mission/prize/rank usano la stessa identità.  
3. **src/hooks/useMissionStatus.ts** — Passare a user da AuthContext/useUnifiedAuth se si unifica auth.  
4. **src/hooks/usePrizeData.ts** — Idem.  
5. **src/hooks/useHierarchyRank.ts** — Usare user da AuthContext (o useUnifiedAuth) invece di useAuth() per evitare fetch bloccati da user null.  
6. **src/features/pulse/hooks/useAgentEnergy.ts** — Idem.  
7. **ios/App/App.xcodeproj/project.pbxproj** — Portare MARKETING_VERSION a **1.1** (o superiore) per aprire una nuova train e soddisfare il requisito “higher than previously approved [1.0]”.  
8. **ios/App/App/Info.plist** — Impostare **CFBundleVersion** a un valore **nuovo e univoco** (es. timestamp 20260309120000 o incrementale) prima di ogni nuovo upload.  
9. **src/contexts/auth/AuthProvider.tsx** — Solo se necessario: esporre un modo per “notify auth ready” ai consumer che oggi dipendono da useAuthSessionManager, per evitare race (opzionale se si elimina useAuthSessionManager per la lettura user).  
10. **src/integrations/supabase/authSingleFlight.ts** — Solo se serve: valutare retry/backoff più robusti per getSession su iOS (non sostituisce l’unificazione della fonte user).

---

# 8. Blacklist file da NON toccare

- Login/logout/cancellazione account: flussi completi (StandardLoginForm, DeleteAccountModalContent, useFaceIDLogin, useAppleAuth, useGoogleAuth, logout in AuthProvider e use-auth).  
- IAP / StoreKit / receipts / purchase flow / subscription.  
- Core BUZZ e BUZZ MAP (useBuzzHandler, BuzzMapButtonSecure, logica clue/prezzo).  
- Push native, BattlePush, notifiche.  
- M1U engine, routing, navigazione.  
- Supabase schema, migration, RLS.  
- File di report e forensics (solo lettura).

---

# 9. Piano minimo di fix futuro (solo teorico)

1. **Versioning Apple (per sbloccare upload)**  
   - In **project.pbxproj**: MARKETING_VERSION = 1.1 (o 2.0).  
   - In **Info.plist**: CFBundleVersion = valore nuovo univoco (es. 20260309120000).  
   - Ricreare archive e inviare; verificare che non ci sia “manage version/build” in Export Options che sovrascriva senza volerlo.

2. **Profilo / Home (per dati caricati)**  
   - **Opzione A (consigliata):** eliminare la doppia fonte. Fare sì che tutti i consumer che oggi usano useAuth() per **solo lettura** user/session usino **useUnifiedAuth()** (o useAuthContext()). Aggiornare use-auth.ts/useAuthSessionManager per delegare la lettura a AuthContext (mantenendo login/logout/forceSession dove servono).  
   - **Opzione B:** mantenere useAuthSessionManager ma sincronizzarlo con AuthProvider (es. sottoscrizione a stesso stato o evento “auth ready” + user da AuthContext) in modo che al mount di CommandCenterHome user non sia più null quando authReady è true.  
   - **Ordine:** prima versioning (per sbloccare upload), poi unificazione auth (per profilo/Home), senza toccare login/logout/IAP/BUZZ/push.

3. **Verifica**  
   - Su device iOS: cold start, Home con utente già loggato; controllare che PulseBarPersonal, mission, prize, rank e avatar si popolino senza refresh.  
   - Su App Store Connect: nuova build con marketing version 1.1 e build number univoco; conferma assenza errori train/version.

---

# 10. Verdetto finale secco

- **Profilo non caricato:** La Home mostra il guscio ma non i dati perché **CommandCenterHome e gli hook dati usano useAuth() (useAuthSessionManager)**, che ha stato user separato da AuthProvider. Su iOS la seconda getSession può restituire null o essere lenta, lasciando **user = null** in quei hook e quindi **nessun fetch** per PE, mission, prize, rank. Non è una regressione nei file PE/unification/streak.  
- **Upload Apple:** Il rifiuto è dovuto a **build number duplicato** (primo tentativo) e a **train 1.0 chiusa** con **CFBundleShortVersionString 1.0 non superiore all’ultima approvata** (secondo tentativo). Serve **marketing version > 1.0** (es. 1.1) e **CFBundleVersion univoco** nei rispettivi file.  
- **Correlazione:** **Nessuna.** I due problemi vanno affrontati separatamente: versioning per Apple, unificazione/coerenza della fonte auth per il caricamento profilo su iOS.

---

*Report forense read-only. Nessuna modifica applicata. Nessun commit, build, cap sync.*
