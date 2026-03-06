# INCIDENT REPORT — Mission Cycle Engine (Opzione B) — FASE 0 AUDIT
**Data:** 2026-03-03  
**Scope:** Read-only verification before any patch. Zero modifications.

---

## 1. Call site di `getMissionOfTheDay()` e cosa mostrano

| File | Uso | Cosa mostra / comportamento |
|------|-----|-----------------------------|
| **NextActionContainer.tsx** | `const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;` | Missione usata per: (1) decidere se mostrare la card Daily Mission (`!isMissionCompleted && mission`), (2) testo stato (`getMissionStatusText()`), (3) `isMissionCompleted = (missionPhase === 3 && activeMissionId === mission?.id)`. Non passa `mission` a figli direttamente; il figlio è NextActionContent che ha la stessa logica. |
| **NextActionContent.tsx** | `const mission = MISSIONS_ENABLED ? getMissionOfTheDay() : null;` | Condizione `(MISSIONS_ENABLED && isMissionReady && !isMissionCompleted && mission)` per mostrare la card Daily Mission. Label card: "Daily Mission" (hardcoded, vedi §6). Al tap apre `DailyMissionFlipOverlay` con `<DailyMissionContent mission={mission} ... />`. Se `mission == null` la card e il modal non vengono mostrati. |
| **DailyMissionCard.tsx** | `const mission = getMissionOfTheDay();` | Card compatta sulla home: titolo "🎯 {t('home_daily_title')}", sottotitolo `mission.title`, badge e stato. Se aperta, modal con briefing/fasi. Non gestisce `mission == null` (chiama sempre getMissionOfTheDay(), quindi mission è sempre definita oggi). |
| **MissionPill.tsx** | `const mission = getMissionOfTheDay();` | Pill con icon e label della missione del giorno. Non gestisce `mission == null`. |
| **missionEngine.ts** | `getMissionOfTheDay()` in `getEngineState()`, `handlePhase1Complete()`, `handlePhase2Complete()` | `getEngineState()` espone `currentMission: todayMission` per briefing / phase 2 resume. `handlePhase1Complete` / `handlePhase2Complete` usano la missione per `calculatePhaseRewards(mission.totalRewardM1U)` e `creditM1USafe`; assumono missione sempre definita. |

**Nota:** `missionEngine` è usato da altri punti (es. DailyMissionsController, missionEngine.getEngineState). Se `getMissionOfTheDay()` diventa async (hook che legge dal server), tutti questi call site dovranno usare il risultato dell’hook o di una funzione async, e gestire `mission == null` dove oggi non lo fanno (DailyMissionCard, MissionPill, missionEngine).

---

## 2. Dove vive `dayOfYear` e come viene calcolato

**Unico punto:** `src/missions/missionsRegistry.ts`, funzione `getMissionOfTheDay()`.

**Snippet:**

```ts
export function getMissionOfTheDay(): MissionDefinition {
  const forcedId = import.meta.env.VITE_FORCE_DAILY_MISSION;
  if (forcedId && typeof forcedId === 'string') {
    const found = MISSIONS_REGISTRY.find((m) => m.id === forcedId);
    if (found) return found;
  }
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % MISSIONS_REGISTRY.length;
  return MISSIONS_REGISTRY[index];
}
```

- `dayOfYear` = giorno dell’anno (1–365/366).
- `index = dayOfYear % MISSIONS_REGISTRY.length` (registry ha 31 elementi).
- Nessun altro riferimento a `dayOfYear` nel flusso daily (né in login, IAP, BUZZ, map, push, delete).

---

## 3. Componenti UI che dipendono dalla “missione del giorno”

- **NextActionContainer:** usa `mission` per visibilità card e stato; non renderizza contenuto missione, passa stato al figlio.
- **NextActionContent:** mostra la card “Daily Mission” e al tap apre il modal con `DailyMissionContent`; dipende da `mission` per titolo card (`mission.title`), icon, e per passare `mission` al modal.
- **DailyMissionCard:** usa `getMissionOfTheDay()` per titolo, icon, fasi, reward; apre modal con stesso contenuto logico.
- **MissionPill:** mostra icon e label della missione del giorno.
- **DailyMissionContent:** riceve `mission` come prop. Se `mission?.id === 'cipher_drill_anagram_v1'` renderizza `CipherDrillModal` (server-real); altrimenti renderizza il flusso generico (phase 1/2 con `creditM1USafe` client-side, senza chiamare l’Edge). Dipende da `mission` per `mission.totalRewardM1U`, `mission.title`, ecc.

Nessuno di questi componenti fa parte dei flussi FROZEN (login, logout, delete account, IAP, BUZZ, BUZZ MAP, push).

---

## 4. Gestione di `day_key` (client vs server)

- **Client (missionState):**  
  `getTodayKey()` in `src/missions/missionState.ts`:  
  `return new Date().toISOString().split('T')[0];`  
  → **UTC** YYYY-MM-DD. Usato per `KEYS.DAY_KEY`, `isNewDay()`, `startMission()`, `markBriefingShown()`.

- **Server (Edge claim-daily-phase):**  
  `getDayKeyUtc()`: `now.toISOString().slice(0,10)` → **UTC** YYYY-MM-DD. Usato per tutti i read/write su `daily_mission_runs` e `daily_mission_claims`.  
  `getYesterdayKeyUtc()` per sblocco phase 2.

Allineamento: entrambi usano la data in UTC; nessuna dipendenza da `dayOfYear` lato server.

---

## 5. Missione “oggi” senza supporto server-real (es. claim 501)

- **Dove si usa l’Edge:** solo `CipherDrillModal` chiama `claimDailyPhase(...)` (start_phase1, complete_phase1, start_phase2, complete_phase2). L’Edge accetta solo `mission_id === 'cipher_drill_anagram_v1'`; per altri `mission_id` restituisce 400 `unknown_mission`; per Idea 2/3 restituisce 501 `NOT_IMPLEMENTED_YET`.

- **Flusso generico (non Cipher Drill):** se `mission?.id !== 'cipher_drill_anagram_v1'`, `DailyMissionContent` renderizza il blocco con `useState(phase)`, `handleStartMission`, `handleCompletePhase1`, `handleCompletePhase2` che usano `creditM1USafe` (client-side). **Non viene mai chiamata l’Edge** per queste missioni. Quindi nessun 501 in questo path.

- **Conclusione:** se la “missione del giorno” non è Cipher Drill, l’UI mostra il flusso generico (phase 1/2, crediti client) e non va in crash. Se in futuro una missione server-real restituisse 501, andrebbe gestita nel componente specifico di quella missione (analogamente a come CipherDrillModal gestisce errori da `claimDailyPhase`). Per l’implementazione Mission Cycle Engine (Opzione B), il server può restituire qualsiasi `mission_id` presente in `MISSIONS_REGISTRY`; i componenti esistenti continuano a funzionare (Cipher Drill via modal server-real, altre via flusso generico).

---

## 6. Stringhe UI (daily flow) non i18n — solo elenco

- **NextActionContent.tsx** (circa riga 381): label della card Daily Mission → **`"Daily Mission"`** (testo fisso, non `t('...')`).

Le altre stringhe rilevanti nel flusso daily usano già `t('...')` (es. `next_action_*`, `home_daily_*`, `daily_mission.*`, `cipher_drill.*`, `mission.popup.*`, `mapPills.mission.*`). Nessun’altra stringa hardcoded nel daily flow è stata individuata in questo audit.

---

## 7. Rischio FROZEN e conclusione FASE 0

- **Login/Logout, Delete account, IAP, BUZZ, BUZZ MAP, Push:** nessun uso di `getMissionOfTheDay()` o `dayOfYear` in questi flussi. La modifica è confinata a: missionsRegistry (sostituzione/rimozione dayOfYear), nuovo hook/API “mission of the day”, e ai 4–5 componenti che oggi chiamano `getMissionOfTheDay()`.

- **Rischio:** se l’hook `useMissionOfTheDay()` o l’Edge `daily-mission-today` venissero usati per errore in un flusso FROZEN (es. condizione di login o di delete), potrebbero introdurre regressioni. **Mitigazione:** usare il nuovo hook e l’Edge **solo** nei componenti daily già identificati (NextActionContainer, NextActionContent, DailyMissionCard, MissionPill) e in `missionEngine`/caller che devono conoscere la missione del giorno; non toccare auth, delete, IAP, BUZZ, map, push.

**Esito FASE 0:** nessun rischio FROZEN identificato a patto che le modifiche rispettino lo scope sopra. Si può procedere con FASE 1 (implementazione Mission Cycle Engine Opzione B + fallback senza dayOfYear + i18n per le nuove stringhe).
