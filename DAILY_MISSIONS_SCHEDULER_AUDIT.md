# DAILY MISSIONS SCHEDULER AUDIT (NO dayOfYear)
## Mission Cycle Engine Feasibility — Read-Only Report

**App:** M1SSION™  
**Environment:** iOS Native Wrapper (Capacitor WKWebView)  
**Mode:** READ-ONLY (no patches, no refactor, no file changes)  
**Date:** 2026-03-03  

---

## FROZEN CONSTRAINTS (DO NOT TOUCH)

The following flows must not be regressed or altered by any scheduler change:

1. Login / Logout  
2. Account deletion (delete-account-v2)  
3. IAP (Capgo + verify/credit)  
4. BUZZ flow and logic  
5. BUZZ MAP flow and logic  
6. Native push notifications flow  
7. All currently working behaviour  

**STOP RULE:** If any proposed change could impact a FROZEN flow → do not propose it; document the risk and safe alternatives only.

---

## FASE 1 — INVENTORY (WHERE THE SCHEDULER LIVES TODAY)

### 1.1 `dayOfYear`

| Location | File | Function/const | Role | Caller |
|----------|------|----------------|------|--------|
| **Single source** | `src/missions/missionsRegistry.ts` | `getMissionOfTheDay()` | Computes `dayOfYear` from local `Date`, then `index = dayOfYear % MISSIONS_REGISTRY.length` to pick mission. | NextActionContainer, NextActionContent, DailyMissionCard, MissionPill, CipherDrillModal (indirect via mission prop) |

**Snippet (missionsRegistry.ts, ~1155–1160):**

```ts
const today = new Date();
const dayOfYear = Math.floor(
  (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
);
const index = dayOfYear % MISSIONS_REGISTRY.length;
return MISSIONS_REGISTRY[index];
```

No other references to `dayOfYear` exist in the **daily mission** flow (excluding backups, Android bundles, and date-fns usage elsewhere).

---

### 1.2 `getMissionOfTheDay`

| File | How it's used |
|------|----------------|
| `src/components/feedback/NextActionContainer.tsx` | `const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;` — drives which mission card is shown and `mission?.id` for completion check. |
| `src/components/feedback/NextActionContent.tsx` | Same: `const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;` |
| `src/components/feedback/DailyMissionCard.tsx` | `const mission = getMissionOfTheDay();` — card content and CTA. |
| `src/missions/ui/MissionPill.tsx` | `const mission = getMissionOfTheDay();` — pill label/entry. |

So: **“Mission of the day” is chosen only on the client**, inside `getMissionOfTheDay()`, using `dayOfYear % MISSIONS_REGISTRY.length`. The server never chooses the mission; it only accepts `mission_id` from the client and uses **server UTC `day_key`** for runs/claims.

---

### 1.3 `MISSIONS_REGISTRY` and rotation

| Location | Usage |
|----------|--------|
| `src/missions/missionsRegistry.ts` | `MISSIONS_REGISTRY` array (31 entries). Comment says “30 REAL MISSIONS”; `cipher_drill_anagram_v1` is the 31st. |
| Same file | `getMissionOfTheDay()` uses `MISSIONS_REGISTRY.find()` for override, then `MISSIONS_REGISTRY[index]` with `index = dayOfYear % MISSIONS_REGISTRY.length`. |

So: **31 missions**, index `0..30`. Cipher Drill is index **30**; it appears only when `dayOfYear % 31 === 30` (e.g. day 30, 61, 92…).

---

### 1.4 `VITE_FORCE_DAILY_MISSION` and test overrides

| Location | Role |
|----------|------|
| `src/missions/missionsRegistry.ts` | At top of `getMissionOfTheDay()`: if `import.meta.env.VITE_FORCE_DAILY_MISSION` is set, returns that mission from registry (e.g. `cipher_drill_anagram_v1`). Documented in comment for `.env.local`. |

Override is **dev/test only**; no production code path depends on it for correctness. It can remain as-is for testing.

---

### 1.5 `day_key`, `getTodayKey()`, `isNewDay()`

| File | Symbol | Role |
|------|--------|------|
| `src/missions/missionState.ts` | `KEYS.DAY_KEY` | Storage key `m1_daily_missions_day_key` for “last day we ran state for”. |
| `src/missions/missionState.ts` | `getTodayKey()` | `return new Date().toISOString().split('T')[0]` → **UTC** YYYY-MM-DD. Used when starting a mission and for `isNewDay()`. |
| `src/missions/missionState.ts` | `isNewDay()` | `storedDayKey !== getTodayKey()` — true when stored day ≠ “today” (UTC). Used for “phase 2 available next day”. |
| `src/missions/missionState.ts` | `startMission()` | Writes `getTodayKey()` to `KEYS.DAY_KEY`. |
| `supabase/functions/claim-daily-phase/index.ts` | `getDayKeyUtc()` | `now.toISOString().slice(0,10)` → server **UTC** day key. Used for all DB reads/writes (`day_key`, `yesterdayKey`). |
| `supabase/migrations/20260303110000_daily_mission_runs_claims.sql` | `day_key` | Column on `daily_mission_runs` and `daily_mission_claims`; UNIQUE (user_id, day_key, mission_id) on runs. |

Other `getTodayKey`-style helpers (e.g. in `quizDailyGuard.ts`, `useDNA.ts`, `DNAHub.tsx`) use **local** YYYY-MM-DD for their own features; they are **not** used by the daily mission scheduler or by `missionState`.

---

### 1.6 `cipher_drill_anagram_v1` and Daily #1

| File | Usage |
|------|--------|
| `src/missions/missionsRegistry.ts` | Mission definition `id: 'cipher_drill_anagram_v1'` in `MISSIONS_REGISTRY`. |
| `src/components/feedback/DailyMissionContent.tsx` | `const MISSION_ID_CIPHER_DRILL = 'cipher_drill_anagram_v1';` — if `mission?.id === MISSION_ID_CIPHER_DRILL` renders `CipherDrillModal`. |
| `src/missions/serverReal/claimDailyPhase.ts` | `export const MISSION_ID_CIPHER_DRILL = 'cipher_drill_anagram_v1'` — sent in body to Edge. |
| `supabase/functions/claim-daily-phase/index.ts` | Rejects unknown `mission_id`; only `cipher_drill_anagram_v1` is implemented; Ideas 2/3 return 501. |

So: **Daily #1 (Cipher Drill)** is the only server-real daily; UI shows it when `getMissionOfTheDay().id === 'cipher_drill_anagram_v1'`. The server does **not** decide which mission is “today”; it only validates and processes the `mission_id` sent by the client.

---

## FASE 2 — SOURCE OF TRUTH FOR “DAY KEY” (NO dayOfYear)

### 2.1 Where “today” is computed

| Function | File | Definition | Scope |
|----------|------|------------|--------|
| **getTodayKey()** | `src/missions/missionState.ts` | `new Date().toISOString().split('T')[0]` | **UTC** date. Used for daily mission state (DAY_KEY, briefing, isNewDay). |
| **getDayKeyUtc()** | `supabase/functions/claim-daily-phase/index.ts` | `now.toISOString().slice(0,10)` | **UTC** date. Sole day key used for DB (runs/claims). |
| getYesterdayKeyUtc() | Same Edge | `d.setUTCDate(d.getUTCDate() - 1)` then `toISOString().slice(0,10)` | UTC “yesterday” for phase 2 unlock. |

Other “today” helpers (e.g. `quizDailyGuard.ts`, `useDNA.ts`, `DNAHub.tsx`) use **local** calendar date; they are **not** the source of truth for daily missions.

### 2.2 Conclusion: day key source of truth

- **For persistence (runs/claims):** Server is source of truth. Edge uses **server UTC** `getDayKeyUtc()` for all inserts/selects. Client sends `mission_id` and optional `client_day_hint`; the Edge does **not** use client day for keying.
- **For client state (which day we’re in, phase 2 unlock):** Client uses `missionState.getTodayKey()` which is **UTC** (same formula as server). So for daily missions, client and server both use UTC date; no intentional local/timezone mix in this flow.
- **Remaining risk on iOS:** If the device clock is wrong or the user changes timezone/clock, client `getTodayKey()` can diverge from server. The server remains correct for credits and idempotency; the client could show “wrong day” or phase 2 availability until the next sync. Mitigation: any future “get mission for today” API should return server `day_key` so the client can align.

---

## FASE 3 — ROTATION ANALYSIS (CURRENT BEHAVIOUR)

- **Why a mission appears only on specific days**  
  The client picks mission index as `dayOfYear % 31`. So:
  - Index 0 (e.g. `open_source_intel`) appears when `dayOfYear % 31 === 0`.
  - Index 30 (`cipher_drill_anagram_v1`) appears when `dayOfYear % 31 === 30` (e.g. 30 Jan, 1 Mar, 2 Apr…).
  - So with 31 missions, each mission appears on a fixed set of calendar days per year; Cipher Drill appears only ~12 days per year unless overridden.

- **Is “dayOfYear % N” still used?**  
  **Yes**, only in `getMissionOfTheDay()` in `missionsRegistry.ts`. There is no server-side rotation; the server never chooses `mission_id` from a cycle.

- **Does the server-real daily system decide mission_id?**  
  **No.** The server stores and credits by `(user_id, day_key, mission_id)`; it accepts `mission_id` from the client and uses server `day_key`. So the “Mission Cycle Engine” today is entirely client-side and based on `dayOfYear`.

---

## FASE 4 — MISSION CYCLE ENGINE: THREE OPTIONS (ANALYSIS ONLY)

### OPZIONE A — Cycle deterministico su day_key (client-safe)

- **Idea:** `index = f(day_key) % N` (e.g. hash of `day_key` or “day number” from a fixed epoch) so the same calendar day always maps to the same mission.
- **Pro:** No new tables; client can stay in control; deterministic; works with a fixed N (e.g. 15).
- **Contro:** If `day_key` is still client-derived, clock/timezone abuse remains. If client gets `day_key` from server (e.g. from a lightweight “today” endpoint), then A is safe and consistent.
- **Impatto su FROZEN:** **None** if only `getMissionOfTheDay()` and the way the index is computed change (no login, IAP, BUZZ, map, push, delete).
- **Complessità:** Bassa.
- **Compatibilità:** Daily #1 (Cipher Drill) unchanged; #2/#3 can be added to registry and same formula applies.

---

### OPZIONE B — Server decides mission_id per day_key (consigliata se già server-real)

- **Idea:** For each `day_key`, server assigns a `mission_id` (e.g. from a deterministic cycle or from a table). Client calls e.g. `GET /daily-mission-today` or gets `mission_id` in `start_phase1` response; UI renders that mission.
- **Pro:** Single source of truth; no client clock abuse; same server that already has `day_key` and runs can own the cycle.
- **Contro:** Requires a new endpoint or extending `claim-daily-phase` (e.g. return `mission_id` for “today”); client must use that instead of `getMissionOfTheDay()`.
- **Impatto su FROZEN:** **None** if the new/updated endpoint is only for “which mission today” and existing auth/claims flow is unchanged.
- **Complessità:** Media (endpoint + client switch from `getMissionOfTheDay()` to server response).
- **Compatibilità:** Daily #1, #2, #3: server can return any `mission_id` the client knows how to render (e.g. Cipher Drill, future types).

---

### OPZIONE C — Schedule table (controllo totale)

- **Idea:** Table `daily_mission_schedule(day_key, mission_id)` (or global schedule) filled in advance or on-demand; server (or cron) decides which mission per day.
- **Pro:** Massimo controllo; possibilità di campagne o override per giorno.
- **Contro:** Gestione tabella; necessità di popolamento (batch o on-demand); più complessità operativa.
- **Impatto su FROZEN:** **None** if only read from this table for “mission of the day” and all existing flows untouched.
- **Complessità:** Alta.
- **Compatibilità:** Full; any mission_id can be scheduled per day.

---

## FASE 5 — COMPATIBILITY CHECK

1. **Possiamo eliminare dayOfYear senza rompere nulla?**  
   **SÌ**, a patto di sostituire la logica di scelta della missione con qualcosa di equivalente:  
   - **Opzione A:** stessi call site (`getMissionOfTheDay()`), ma interno che usa `day_key` (o “day number”) invece di `dayOfYear` (es. `hash(day_key) % N` o giorno da epoch).  
   - **Opzione B/C:** `getMissionOfTheDay()` diventa una chiamata async che legge dal server (o da cache) il `mission_id` per “oggi”; i componenti che oggi chiamano `getMissionOfTheDay()` andrebbero adattati (es. hook che restituisce `mission | null` e loading).  
   Nessun uso di `dayOfYear` in login, IAP, BUZZ, map, push o delete-account.

2. **Possiamo introdurre un Mission Cycle Engine senza cambiare login/IAP/buzz/map/push/delete?**  
   **SÌ.** Lo scheduler è confinato a:  
   - `missionsRegistry.ts` (getMissionOfTheDay + eventuale nuovo ciclo),  
   - eventuale nuovo endpoint o risposta Edge “mission for today”,  
   - e i 4–5 componenti che chiamano `getMissionOfTheDay()` (NextActionContainer, NextActionContent, DailyMissionCard, MissionPill; DailyMissionContent riceve già `mission` come prop).  
   Nessuno di questi fa parte dei flussi FROZEN.

3. **Dove va implementata la scelta “missione del giorno” per essere più safe?**  
   **Sul server (Opzione B, o C)** è più safe: il server già è la source of truth per `day_key` e per run/claim; decidere anche `mission_id` per `day_key` evita manipolazioni lato client (orario, timezone) e mantiene un solo punto di verità.  
   **Sul client (Opzione A)** è accettabile se il client usa un `day_key` “ufficiale” ricevuto dal server (es. da un endpoint “today” o dalla risposta di `start_phase1`), così il ciclo è deterministico e allineato al server.

---

## FASE 6 — RACCOMANDAZIONE FINALE

### Strategia raccomandata: **OPZIONE B (Server decides mission_id per day_key)**

- **Motivazione**
  - Il backend già gestisce `day_key` (UTC) e run/claims; estendere la stessa autorità alla “missione del giorno” evita discrepanze e abusi di clock/timezone.
  - Nessun impatto su login, IAP, BUZZ, map, push, delete: si aggiunge (o si estende) un endpoint “mission for today” e si fa usare al client al posto di `getMissionOfTheDay()` basato su `dayOfYear`.
  - Compatibile con Daily #1 già implementata e con #2/#3: il server restituisce un `mission_id` che il client mappa già alla UI (CipherDrillModal o altro).

### Perché è la più safe rispetto ai paletti FROZEN

- Nessuna modifica a flussi di auth, pagamento, BUZZ, BUZZ MAP, push o cancellazione account.
- Le uniche modifiche sono: (1) lato server: logica o tabella “mission_id per day_key” + API; (2) lato client: sostituire la chiamata a `getMissionOfTheDay()` con il risultato di quell’API (con eventuale cache per la sessione).

### Lista minima di file da toccare (solo elenco, nessuna patch)

- **Server**
  - `supabase/functions/claim-daily-phase/index.ts` — eventuale estensione per restituire “mission for today” (o nuovo handler), e/o lettura da tabella/cycle.
  - (Opzione C) Nuova migrazione: tabella `daily_mission_schedule` (o simile) + eventuale funzione/RPC per leggerla.
- **Client**
  - `src/missions/missionsRegistry.ts` — rimozione di `dayOfYear`, e o (A) nuovo calcolo deterministico da `day_key`, o (B) chiamata API + cache; `getMissionOfTheDay()` potrebbe diventare async o essere sostituita da un hook.
  - `src/components/feedback/NextActionContainer.tsx` — usare mission da API/hook invece di `getMissionOfTheDay()`.
  - `src/components/feedback/NextActionContent.tsx` — idem.
  - `src/components/feedback/DailyMissionCard.tsx` — idem.
  - `src/missions/ui/MissionPill.tsx` — idem.
  - (Opzionale) Nuovo modulo/hook: `useMissionOfTheDay()` che chiama l’API e espone `mission | null` e loading.

### Rischi e mitigazioni

- **Rischio:** Client e server disallineati su “oggi” (clock/timezone).  
  **Mitigazione:** Il server già usa UTC per `day_key`; l’API “mission for today” deve restituire anche il `day_key` usato; il client può mostrare/decidere in base a quello e non al proprio orario.
- **Rischio:** Latenza o errore di rete sulla nuova API.  
  **Mitigazione:** Fallback a `getMissionOfTheDay()` con ciclo deterministico lato client (senza `dayOfYear`, es. giorno da epoch % N) finché l’API non è disponibile; oppure cache “mission for today” con TTL 24h.
- **Rischio:** Regressione su UI daily (card/pill non mostrati).  
  **Mitigazione:** Stessi criteri di visibilità di oggi (MISSIONS_ENABLED, stato fase, `activeMissionId === mission?.id`); solo la sorgente di `mission` cambia (API invece di `getMissionOfTheDay()`).

---

**Fine report. Read-only; nessuna modifica applicata.**
