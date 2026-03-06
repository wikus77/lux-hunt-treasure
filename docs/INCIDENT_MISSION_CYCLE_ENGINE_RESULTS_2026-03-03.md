# INCIDENT REPORT — Mission Cycle Engine (Opzione B) — RESULTS
**Data:** 2026-03-03  
**Branch:** feat/mission-cycle-engine  
**Tag:** safety/mission-cycle-engine-prechange  

---

## Implementazione completata

### 1. Server — Edge Function `daily-mission-today`
- **Path:** `supabase/functions/daily-mission-today/index.ts`
- **Comportamento:** POST, Bearer obbligatorio; restituisce `day_key` (UTC), `mission_id`, `cycle_version` ("v1"), `index`.
- **Ciclo:** 15 mission_id, `index = epochDay % 15` con `epochDay = floor(Date(day_key)/86400000)`.
- **Nessuna scrittura DB;** nessun impatto su claim-daily-phase, IAP, BUZZ, map, push.

### 2. Client — Hook `useMissionOfTheDay()`
- **Path:** `src/missions/useMissionOfTheDay.ts`
- **Comportamento:** Chiama `daily-mission-today`; cache in `localStorage` (`m1_daily_mission_today_cache`); fallback con stesso ciclo (epochDay % 15, **no dayOfYear**).
- **Ritorno:** `{ mission, dayKey, source: 'server'|'cache'|'fallback', loading, error, refetch }`.

### 3. Client — Sostituzione `getMissionOfTheDay()` nei componenti
- **NextActionContainer:** usa `useMissionOfTheDay()`, passa `mission` e `missionLoading` a NextActionContent.
- **NextActionContent:** riceve `mission` e `missionLoading`; mostra placeholder i18n in loading; mostra "Daily mission unavailable" (i18n) se `!mission && !loading`; label card da `t('daily_mission.title')`.
- **DailyMissionCard:** usa `useMissionOfTheDay()`; non renderizza se `missionLoading` o `!mission`.
- **MissionPill:** usa `useMissionOfTheDay()`; non renderizza se `missionLoading` o `!mission`.

### 4. missionsRegistry — Rimozione dayOfYear
- **Path:** `src/missions/missionsRegistry.ts`
- **Modifica:** `getMissionOfTheDay()` non usa più `dayOfYear`; usa `day_key` UTC (stesso formato di missionState) e ciclo di 15 id (`MISSION_CYCLE_FALLBACK`) con `epochDay % 15`.
- **Caller sincroni:** missionEngine e altri continuano a usare `getMissionOfTheDay()` (fallback locale allineato al server).

### 5. i18n
- **Chiavi aggiunte** (en/it/fr): `daily_mission.title`, `daily_mission.loading`, `daily_mission.unavailable`.

---

## Build e Capacitor sync

- **Comando:** `npm run build`  
- **Esito:** Exit code 0 (build completato in ~44 s).

- **Comando:** `npx cap sync ios`  
- **Esito:** Exit code 0 (sync completato in ~8 s).

---

## Checklist test (da validare manualmente)

| Check | Stato |
|-------|--------|
| Home: Next Action mostra Daily Mission (non legata a dayOfYear) | Da verificare |
| Next Action: tap Daily Mission apre modal corretto, nessun crash | Da verificare |
| Daily #1 Cipher Drill continua a funzionare come prima | Da verificare |
| Mission selection cambia con il giorno (o con day_key server) | Da verificare |
| Nessun errore runtime su iOS (WKWebView) | Da verificare |
| **FROZEN:** Login/Logout OK | Da verificare |
| **FROZEN:** Delete account OK | Da verificare |
| **FROZEN:** IAP OK | Da verificare |
| **FROZEN:** BUZZ OK | Da verificare |
| **FROZEN:** BUZZ MAP OK | Da verificare |
| **FROZEN:** Push native OK | Da verificare |

---

## Come testare la rotazione

- **Con Edge deployata:** la missione del giorno è quella restituita da `daily-mission-today` (ciclo 15).
- **Senza rete / Edge non deployata:** il client usa il fallback (stesso ciclo epochDay % 15); la missione è deterministica per il day_key UTC del device.
- **Override dev:** `VITE_FORCE_DAILY_MISSION=cipher_drill_anagram_v1` in `.env.local` forza ancora Cipher Drill (solo per test).

---

## Deploy Edge Function (manuale)

```bash
npx supabase functions deploy daily-mission-today
```

Dopo il deploy, la Home/Next Action useranno il `mission_id` restituito dal server; in caso di errore di rete viene usato il fallback locale (stesso ciclo, no dayOfYear).
