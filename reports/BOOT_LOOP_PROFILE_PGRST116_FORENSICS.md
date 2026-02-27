# Forensics Report — iOS Boot Loop + Briefing/Welcome Loop + PGRST116 (profilo assente)

**App:** M1SSION™ — iOS native wrapped (Capacitor / WKWebView)  
**Branch:** `fix/boot-loop-profile-rollback`  
**Tag rollback:** `ROLLBACK_BOOTLOOP_2026-02-27`  
**Data:** 2026-02-27  
**Stato:** Fase 1 (forensics) completata — **nessuna patch applicata**. Patch solo dopo approvazione.

---

## 1) Rollback eseguito

| Step | Stato |
|------|--------|
| A) Branch di sicurezza | `fix/boot-loop-profile-rollback` creata |
| B) Commit snapshot | `5db1c8115` — "chore: snapshot before boot-loop forensics" |
| C) Tag | `ROLLBACK_BOOTLOOP_2026-02-27` |
| D) Ripristino | `git checkout ROLLBACK_BOOTLOOP_2026-02-27 -- <file>` oppure `git reset --hard ROLLBACK_BOOTLOOP_2026-02-27` |

---

## 2) Sintomi (da incident report)

- All’avvio: **BRIEFING: PRIZE** + messaggio **BENVENUTO** anche se già completati.
- Dopo completamento: dati non si caricano, UI in **ERR** o parzialmente vuota.
- Log Xcode: **PGRST116** (Error fetching profile, [HierarchyRank], [StreakPill], useAgentEnergy, Error fetching agent code), Production readiness check failed, WelcomeBonus FunctionsHttpError, PWA Stabilizer init failed.

---

## 3) File e funzioni che generano PGRST116

Quando Supabase ritorna **0 righe** (o >1) e la query usa **`.single()`**, PostgREST risponde con `PGRST116: JSON object requested, multiple (or no) rows returned`.  
Tabella: in tutti i casi sotto la tabella è **`public.profiles`** filtrata per `id = user.id` (o `userId`).  
Motivo 0 righe: **profilo mancante** (row mai creata, eliminata, o filtro/RLS che nasconde la row).

| Area | File | Riga | Query / nota | Perché può restare in loading / loop |
|------|------|------|--------------|--------------------------------------|
| Access control (boot gate) | `src/hooks/useAccessControl.ts` | 59 | `.maybeSingle()` già applicato (fix precedente) | — |
| Post-login redirect | `src/utils/postLoginRedirect.ts` | 105 | `getUserProfile`: `.single()` | Su error ritorna `null` e si chiama `createInitialProfile`; se insert fallisce (es. RLS), stato incoerente. Non blocca loading infinito da solo. |
| Auth / roles | `src/contexts/auth/AuthProvider.tsx` | 453 | Fallback role da `profiles`: `.single()` | In try/catch/finally; `setIsRoleLoading(false)` sempre. Non blocca ma `userRoles` può restare `[]`. |
| Welcome bonus | `src/hooks/useWelcomeBonus.ts` | 58 | `profiles` `welcome_bonus_claimed`, `first_login_completed`: `.single()` | Su error imposta `needsBonus: true` (se localStorage non `shown`/`claimed`) → **modal BENVENUTO ogni avvio**. |
| Hierarchy rank | `src/hooks/useHierarchyRank.ts` | 79 | `profiles` `pulse_energy`: `.single()` | throw → catch logga `[HierarchyRank] Error`; `finally` fa `setIsLoading(false)`. UI riceve error state, non loading infinito. |
| Streak pill | `src/components/gamification/StreakPill.tsx` | 57 | `profiles` `current_streak_days`, `last_check_in_date`: `.single()` | throw → retry 3x → poi default 0. Log `[StreakPill] Error`; alla fine `setIsLoading(false)`. |
| Agent energy | `src/features/pulse/hooks/useAgentEnergy.ts` | 99 | `profiles` + join `agent_ranks`: `.single()` | throw → catch setError; `finally` `setIsLoading(false)`. Log `useAgentEnergy error`. |
| Onboarding (PE award) | `src/components/onboarding/OnboardingOverlay.tsx` | 93 | Fallback dopo RPC error: `profiles` `pulse_energy`: `.single()` | Se RPC fallisce e profile manca → PGRST116. Usato solo in award PE post-onboarding. |
| Agent code (display) | `src/components/common/AgentCodeDisplay.tsx` | 64, 77 | `profiles` `role` e `agent_code`: `.single()` | Due `.single()`; 0 righe → throw → "Error fetching agent code", finally setIsLoading(false). |
| Agent code (service) | `src/services/agentCodeService.ts` | 14, 33, 56 | `profiles` `agent_code`: `.single()` | `ensureAgentCode` / `getAgentCodeForUser`: 0 righe → error, return null. |
| Prize intro (DB check) | `src/components/overlay/MissionPrizeIntroOverlay.tsx` | RPC | Usa `check_prize_intro_seen` (RPC), non query diretta su `profiles` | Se RPC fallisce (es. funzione assente / errore DB), fallback su localStorage. Se localStorage vuoto → **BRIEFING: PRIZE** mostrato ogni volta. |

---

## 4) Radice comune e causa più probabile

- **Radice comune:** tutte le query sopra (tranne access control già fixato) assumono **al più una riga** in `profiles` per l’utente corrente. Con **0 righe** (profilo mai creato, eliminato, o non visibile per RLS), `.single()` produce **PGRST116**.
- **Causa più probabile:**  
  **Manca la row profilo** per l’utente corrente (`profiles` senza riga con `id = auth.uid()`).  
  Possibili motivi: trigger di creazione profilo assente o fallito; utente creato solo in `auth.users`; profilo eliminato (es. delete account); RLS che nasconde la row (da verificare solo se forensics DB/RLS è esplicitamente richiesta).

- **Perché loop Briefing + Welcome**
  - **Welcome:** `useWelcomeBonus` con `.single()` su `profiles`: in caso di errore (PGRST116) imposta `needsBonus: true` se localStorage non ha `shown`/`claimed` → **BENVENUTO** ogni avvio. Su iOS localStorage può non persistere come su web (o chiave diversa), quindi il loop è plausibile.
  - **Briefing (PRIZE):** `MissionPrizeIntroOverlay` usa RPC `check_prize_intro_seen`. Se la RPC fallisce (es. funzione non deployata, o errore lato DB che dipende da profilo), si usa il fallback localStorage; se vuoto → `alreadySeenInDb = false` → overlay **BRIEFING: PRIZE** mostrato. Al tap si chiama `mark_prize_intro_seen`; se anche quella fallisce, si salva solo in localStorage. Se a ogni avvio la RPC fallisce ancora e per qualche motivo il localStorage non viene letto correttamente, il briefing può ripresentarsi.

- **Perché dati mai caricati / UI in ERR**  
  Hook che dipendono da `profiles` (HierarchyRank, StreakPill, useAgentEnergy, agent code, ecc.) con `.single()` vanno in errore → componenti ricevono `error` o dati null → UI mostra ERR o valori di fallback vuoti. Nessuno di questi hook blocca il boot gate all’infinito (hanno `finally` o setState su error), ma l’esperienza è “dati non caricati”.

---

## 5) Sequenza bootstrap (sintesi)

1. **main.tsx** → **App.tsx** → router (Wouter) → route protette con **WouterProtectedRoute**.
2. **WouterProtectedRoute** usa **useUnifiedAuth** (auth + hydration) e **useAccessControl** (profilo + piano).  
   - Se `accessLoading` resta true → spinner “Verifica accesso…” (già mitigato con fix `useAccessControl` .maybeSingle + setState su error).
3. Dopo il gate: **App** renderizza **WelcomeBonusManager** (useWelcomeBonus) e le pagine (es. **AppHome** con **MissionPrizeIntroOverlay**, **StreakPill**, **useAgentEnergy**, ecc.).
4. **Quando viene letto il profilo**
   - useAccessControl (boot), postLoginRedirect.getUserProfile (post-login), AuthProvider fetchUserRoles (fallback), useWelcomeBonus, useHierarchyRank, StreakPill, useAgentEnergy, OnboardingOverlay (PE), AgentCodeDisplay, agentCodeService.
5. **Dove si decide “hasSeenBriefing / hasSeenWelcome / onboardingComplete”**
   - **Prize intro (BRIEFING: PRIZE):** `prizeIntroStore` (localStorage) + RPC `check_prize_intro_seen` / `mark_prize_intro_seen` in **MissionPrizeIntroOverlay**. Source of truth desiderata: DB (RPC); fallback: localStorage.
   - **Welcome (BENVENUTO):** `useWelcomeBonus`: DB `profiles.welcome_bonus_claimed` + localStorage `m1ssion_welcome_bonus_shown:<userId>`. Se fetch profile fallisce → needsBonus da localStorage o true.
   - **Onboarding (tutorial):** **OnboardingProvider**: localStorage `m1ssion_onboarding_completed_<userId>`, `m1ssion_onboarding_skipped_<userId>`. Non dipende da una colonna `profiles.onboarding_completed` nel codice esaminato.

---

## 6) Conclusione forensics

- **Causa unica più probabile:** **manca la row profilo** per l’utente (`profiles` 0 righe).  
- **Non risultano** (in questa analisi) come causa: filtro errato nelle query (il filtro è sempre `id = user.id`), né RLS/policy verificati nel codice; se si sospetta RLS, serve verifica DB read-only (conteggio righe `profiles` per `user_id`).
- **Effetti:**  
  - PGRST116 in tutti i punti della tabella §3.  
  - Loop Briefing: RPC prize intro che fallisce + fallback localStorage non persistito/letto.  
  - Loop Welcome: useWelcomeBonus con `.single()` che fallisce → needsBonus true + localStorage non salvato/letto.  
  - Dati non caricati / UI in ERR: hook che leggono profilo con `.single()` vanno in errore e mostrano fallback o ERR.

---

## 7) Prossimi passi (Fase 2 — solo dopo approvazione)

1. **Ensure profile (ensureUserBootstrap)**  
   In bootstrap (es. dopo auth state change): leggere `profiles` con `.maybeSingle()`; se `null`, creare/upsert record minimo (id, created_at, flag default). Non fallire se la row esiste già.

2. **.single() → .maybeSingle() + fallback**  
   Nei file della tabella §3 (e solo quelli in scope bootstrap/onboarding/dati utente): sostituire `.single()` con `.maybeSingle()`; su `null` usare default deterministici e non loggare come errore bloccante; assicurare `setIsLoading(false)` (o equivalente) in `finally` dove già non presente.

3. **Onboarding gating anti-loop**  
   Una sola source of truth: preferenza `profiles.onboarding_completed` (se presente), fallback localStorage. Al tap “ENTER THE HUNT” / “BUONA CACCIA”: salvare subito in localStorage, poi persistere su profilo quando disponibile. All’avvio: se flag true (DB o localStorage) non mostrare briefing/welcome; se profilo manca, mostrare onboarding una sola volta (localStorage) e procedere comunque.

4. **WelcomeBonus / Edge**  
   Errore `FunctionsHttpError` (o altro) su welcome bonus non deve bloccare bootstrap: try/catch, log warn, procedere.

---

## 8) Verifica DB (read-only) — da eseguire lato cliente

- Confermare per l’utente di test:  
  `select count(*) from public.profiles where id = '<auth.uid()>';`  
- Se **0**: conferma “profilo mancante”.  
- Se **>1**: possibile duplicato (da indagare separatamente).

---

**Stop condition rispettata:** nessuna modifica a codice applicata in questa Fase 1. Se dalla verifica DB risultasse che la causa è RLS/DB/policy, le patch andrebbero fermate e andrebbe riportata evidenza (errore esatto, policy, endpoint) prima di procedere.
