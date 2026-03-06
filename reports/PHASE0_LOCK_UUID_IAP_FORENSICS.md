# Phase 0 — Lock / UUID / IAP Forensics (READ-ONLY)

## 1) LOCK — Chiamate concorrenti e SESSION INIT ERROR

### Grep risultati (src)
- `supabase.auth.getSession(`: AuthProvider.tsx (127, 337, 395), use-auth-session-manager.ts (187), useProfileRealtime.ts (29, 106), useProfileImage.ts (71), SettingsPage.tsx (58), LegalSettings.tsx (99), DeleteAccountModalContent.tsx (25), MapTiler3D.tsx (433), useFaceIDLogin.ts (198, 270), use-auth.ts (192, 212), readOnlyData.ts (172), useBuzzApi.ts (210, 243), iapService.ts (760).
- `supabase.auth.getUser(`: AuthProvider.tsx (138), useBuzzGrants.ts (20), SubscriptionPlans.tsx (67, 258, 300, 341, 485), useAgentCode.ts (79), useCashbackWallet.ts (242), nativePush.ts (430, 550, 602), BattleConsole.tsx (34), useBuzzApi.ts (240), ecc.
- `onAuthStateChange(`: AuthProvider.tsx, use-auth-session-manager.ts (268).
- **"SESSION INIT ERROR"**: un solo file — `src/hooks/use-auth-session-manager.ts` riga **259** (`console.error('❌ SESSION INIT ERROR:', error);`). Il `error` è quello della `getSession()` (riga 187).
- **isAcquireTimeout**: nessuna stringa nel codebase; l’errore Supabase (Navigator LockManager lock timed out) arriva come eccezione/error object; va rilevato da `error?.message` (es. "timed out", "LockManager lock") o da eventuale proprietà sull’oggetto.

### TOP 10 hook/componenti che chiamano getSession/getUser al mount (useEffect) o aprono realtime subito dopo login
1. **AuthProvider.tsx** — getSession in init (127), getUser fallback (138), onAuthStateChange.
2. **use-auth-session-manager.ts** — getSession in initializeSession (187), onAuthStateChange (268) → **logga "SESSION INIT ERROR"** in catch (259).
3. **useProfileRealtime.ts** — getSession in useEffect([]) (29), poi channel profile.
4. **useM1UnitsRealtime.ts** — fetch + channel su userId (da context); non chiama getSession direttamente ma usa token per .from('profiles') e channel.
5. **useActiveMissionEnrollment.ts** — checkEnrollment (query DB) su user da context; non getSession diretto nel file ma user da auth.
6. **useAgentCode.ts** — getUser in useEffect (79).
7. **useHierarchyRank.ts** — channel su user.id (165).
8. **useCashbackWallet.ts** — getSession (242).
9. **useBuzzGrants.ts** — getUser (20), getUserId (54–60).
10. **SubscriptionPlans.tsx** — getUser (67, 258, 300, 341), channel profiles-changes (472).

### Realtime "at boot" (Home/header vs route secondarie)
- **Home/header**: useProfileRealtime (profile_changes), useM1UnitsRealtime (profiles), useActiveMissionEnrollment (mission_enrollment), useHierarchyRank (hierarchy_rank), useBattleDefenseNotification (battle-defense), useAgentEnergy (agent_energy), RewardCounterPill (reward-counter-updates), BattleConsole (battle-console-updates).
- **Route secondarie**: SubscriptionPlans (profiles-changes), MapTiler3D (markers, agent-locations, map3d_buzz), readOnlyData (user-locations-live), NotificationsPage (notifications), useBuzzMapProgressivePricing (buzz_map_changes).

### Proposta patch MINIMA (Lock)
- Introdurre **authSingleFlight.ts**: `getSessionSingleFlight()` e `getUserSingleFlight()` con promise in-flight unica e retry (solo su lock timeout) con backoff 250/750/1500 ms, max 3 tentativi.
- Sostituire chiamate critiche a bootstrap: **AuthProvider** init, **use-auth-session-manager** initializeSession, **useProfileRealtime** setupRealtimeSubscription. Opzionale: useM1UnitsRealtime (non chiama getSession ma dipende da userId dal context; lasciare invariato se il context arriva da AuthProvider che usa single-flight).
- Aggiungere in un punto unico (es. AuthProvider o single-flight) gestione **UNHANDLED REJECTION**: se `reason?.message` contiene "Navigator LockManager lock" o "timed out" → log warn e nessun crash.

---

## 2) FREE BUZZ — Invalid UUID (22P02)

### Dove nasce
- **File**: `src/hooks/useBuzzGrants.ts`.
- **Riga**: 161 — `const clueId = \`free_buzz_${Date.now()}_${Math.random().toString(36).substring(7)}\`;`
- **Inserimento**: 165–173 — `.from('user_clues').insert({ user_id, clue_id: clueId, title_it, description_it, clue_type, buzz_cost })`.
- **Errore**: `invalid input syntax for type uuid: "free_buzz_..."` → la colonna **clue_id** (o una colonna coinvolta nell’insert) è di tipo UUID; il valore passato è una stringa non-UUID.

### Schema user_clues (da migrations + types)
- `types.ts`: `clue_id: string` (Row/Insert/Update).
- Migration 20251220: tabella ha `id UUID` come PK; unique su (user_id, clue_id). Il tipo di `clue_id` non è modificato in quella migration; l’errore 22P02 indica che **clue_id** è UUID nel DB.
- Conferma: il valore `"free_buzz_..."` non è un UUID valido → 22P02.

### Proposta patch MINIMA (UUID)
- In **useBuzzGrants.ts**, per l’insert in `user_clues`, usare un **UUID v4** per `clue_id` (es. `crypto.randomUUID()`). Mantenere titolo/descrizione invariati (es. "Indizio BUZZ Gratuito" / uniqueClue). Non cambiare schema DB; non aggiungere nuovi campi se non già esistenti.

---

## 3) IAP — acknowledgePurchase "Already finished"

### Dove viene chiamato
- **File**: `src/iap/iapService.ts`.
- **Righe**: 367–375 — `finishTransaction` (wrapper Capgo): `await CapgoNativePurchases.acknowledgePurchase({ purchaseToken: String(transactionId) });` in try; in catch `console.error('[IAP Capgo] acknowledgePurchase error:', error);` e return false.

### Comportamento
- Il plugin iOS può avere “Auto-acknowledge” / “Auto-finishing transaction”; in quel caso la transazione è già finished quando noi chiamiamo `acknowledgePurchase` → errore tipo “Transaction not found or already finished”.
- **Transaction.updates**: non cercato in questa fase; l’obiettivo è solo evitare error spam e trattare “already finished” come successo.

### Proposta patch MINIMA (IAP)
- In **iapService.ts** dentro `finishTransaction`: dopo il catch, se `error?.message` (o stringa equivalente) contiene “already finished” o “Transaction not found” → log **warn** (non error), considerare operazione riuscita (return true). Altri errori → restano error e return false.

---

**Fine Phase 0. Nessuna modifica applicata.**
