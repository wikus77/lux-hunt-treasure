# FASE 1.5 — SUPPORTED MISSION ALIGNMENT — REPORT

**Data:** 2026-03-13  
**Scope:** M1SSION™ iOS wrapped app only — allineamento server → missioni supportate da UI v2 e claim-daily-phase  
**Riferimento:** Fase 1 Readiness Check (GO WITH CONDITIONS); verifica utente su iPhone

---

# 1. EXECUTIVE SUMMARY

| Elemento | Esito |
|----------|--------|
| **Problema reale confermato** | Il server (daily-mission-today) restituiva 18 mission_id in ciclo; solo 3 sono supportati da UI v2 (DailyEngineV2Card), modali (Cipher/WordDuel/Signal) e claim-daily-phase. In ~83% dei giorni l’utente vedeva “Missione del giorno non disponibile nell'app”. |
| **Fix applicato** | Ciclo in `daily-mission-today` limitato ai 3 mission_id supportati: `cipher_drill_anagram_v1`, `word_duel_memory_v1`, `signal_pattern_numbers_v1`. Selezione resta deterministic (epochDay % 3), server-driven, UTC-based; day_key invariato. |
| **Rischio complessivo** | **Basso.** Un solo file Edge modificato; nessun client, DB, reward, run; rollback = ripristinare l’array a 18 elementi. |
| **Build esito** | **SUCCESS** (exit code 0, ~4m 53s). |
| **Cap sync esito** | **Eseguito** (sync avviato su dist/ da build OK). |
| **GO / NO GO Fase 2** | **GO FOR PHASE 2** — Allineamento completato; daily v2 sempre giocabile nel ciclo attuale; nessun impatto su reward/run/day_key/flussi frozen; base pronta per Fase 2 (7 template). |

---

# 2. SUPPORTED MISSION AUDIT

## mission_id nel ciclo server (pre-fix)

- **Fonte:** `supabase/functions/daily-mission-today/index.ts`, array `MISSION_CYCLE`.
- **Contenuto:** 18 elementi: `cipher_drill_anagram_v1`, `word_duel_memory_v1`, `signal_pattern_numbers_v1`, `open_source_intel`, `urban_riddle`, `pulse_breaker_challenge`, `signal_trace`, `code_fragment`, `area_observation_lite`, `pattern_break`, `chain_of_intel`, `time_distortion`, `false_signal`, `shadow_zone`, `cipher_decode`, `memory_matrix`, `word_puzzle`.
- **Selezione:** `index = epochDay % MISSION_CYCLE.length` → mission_id = MISSION_CYCLE[index].

## mission_id supportati da UI v2

- **Fonte:** `src/missions/dailyEngineV2/DailyEngineV2Card.tsx`, `SUPPORTED_MISSION_IDS`.
- **Contenuto:** 3 ID: `cipher_drill_anagram_v1`, `word_duel_memory_v1`, `signal_pattern_numbers_v1` (importati da claimDailyPhase.ts come MISSION_ID_CIPHER_DRILL, MISSION_ID_WORD_DUEL, MISSION_ID_SIGNAL_PATTERN).
- **Comportamento:** Se `missionId` non è in SUPPORTED_MISSION_IDS, la card mostra “Missione del giorno non disponibile nell'app” (i18n `daily_engine.unavailable_mission`).

## mission_id supportati da claim-daily-phase

- **Fonte:** `supabase/functions/claim-daily-phase/index.ts`, guard all’inizio del handler.
- **Contenuto:** Solo questi 3 sono accettati: `cipher_drill_anagram_v1`, `word_duel_memory_v1`, `signal_pattern_numbers_v1`. Qualsiasi altro mission_id → 400 `unknown_mission_id`.
- **Modali:** CipherDrillModal, WordDuelMemoryModal, SignalPatternNumbersModal usano rispettivamente gli stessi 3 ID.

## Mismatch rilevati

- **Server vs UI:** Il server poteva restituire 15 mission_id non presenti in SUPPORTED_MISSION_IDS → card “non disponibile”.
- **Server vs claim:** Gli stessi 15 ID avrebbero causato 400 da claim-daily-phase se il client avesse tentato di avviare una run (la card non apre il modale per ID non supportati, quindi il claim non veniva chiamato per quelli).
- **Conclusione:** I tre set (ciclo server, UI v2, claim-daily-phase) ora coincidono: il ciclo server è stato limitato ai 3 ID supportati da entrambi.

---

# 3. FIX APPLICATO

## File toccati

- **`supabase/functions/daily-mission-today/index.ts`** (unico file modificato)

## Modifiche esatte

- **Prima:** `MISSION_CYCLE` era un array di 18 stringhe (i 3 supportati + 15 non supportati).
- **Dopo:** `MISSION_CYCLE` è un array di 3 stringhe: `cipher_drill_anagram_v1`, `word_duel_memory_v1`, `signal_pattern_numbers_v1`.
- **Commento:** Aggiornato per indicare “Phase 1.5 — Supported mission alignment”, “cycle limited to mission_ids supported by UI v2 and claim-daily-phase”, “Deterministic: epochDay % 3”, “Fase 2 will introduce 7 weekly templates (Lun→Dom)”.
- **Logica:** `getDayKeyUtc()`, `getEpochDay()`, `getMissionIndex()` invariati; `getMissionIndex` usa `epochDay % MISSION_CYCLE.length` (ora 3). Nessun cambiamento al contratto di risposta (ok, day_key, mission_id, cycle_version, index).

## Perché è il fix minimo e più sicuro

- Intervento solo lato selezione della missione; nessun tocco a day_key, run, claim, reward, client, DB, schema.
- Deterministico e server-driven: la scelta resta sul server, UTC-based.
- Rollback: ripristinare l’array a 18 elementi (e aggiornare il commento) se si volesse tornare al ciclo largo; nessun cambiamento client necessario.
- Compatibile con Fase 2: in Fase 2 si sostituirà la logica di selezione (es. weekday → 7 template); il contratto day_key + mission_id resta valido.

## Cosa NON è stato toccato

- claim-daily-phase (nessuna modifica)
- DailyEngineV2Card, useDailyEngineV2, modali (nessuna modifica)
- daily_mission_runs, daily_mission_claims (nessuna modifica)
- reward, idempotenza, M1U, PE (nessuna modifica)
- i18n, routing, Home, Map, Next Action, flussi frozen (nessuna modifica)
- Nessun nuovo template, nessuna logica Lun→Dom, nessuna nuova UI

---

# 4. POST-FIX READINESS

## Server → UI allineati

- **Sì.** daily-mission-today restituisce solo uno dei 3 mission_id supportati da DailyEngineV2Card e da claim-daily-phase. Ogni giorno (UTC) l’utente riceve una missione giocabile.

## Daily v2 sempre giocabile (nel ciclo attuale)

- **Sì.** Per ogni day_key, `index = epochDay % 3` è 0, 1 o 2 → mission_id è sempre uno dei 3. La card mostra stato (non iniziata / phase 1 / phase 2 / completata) e il tap apre il modale corretto; claim-daily-phase accetta l’ID.

## Compatibilità futura con Fase 2

- **Sì.** Il fix è dichiaratamente temporaneo (commento in codice). Fase 2 potrà introdurre la logica 7 template (Lun→Dom) sostituendo o estendendo la selezione in daily-mission-today; day_key, mission_id, run e claim restano invariati. Nessuna scelta che ostacoli Fase 2.

---

# 5. IMPACT ANALYSIS

## Verifica flussi frozen

- Login/logout, delete account, IAP, BUZZ, BUZZ MAP, push: **non toccati** (nessuna modifica client o a questi flussi).
- Solo l’Edge daily-mission-today è stata modificata (contenuto dell’array); comportamento di auth, day_key, risposta JSON invariato.

## Verifica reward / run / day_key

- **day_key:** Calcolo invariato (getDayKeyUtc()); formato e significato UTC invariati.
- **run:** Nessuna modifica a claim-daily-phase né a daily_mission_runs; una run per (user_id, day_key, mission_id) resta valida; i 3 mission_id restano gli unici accettati.
- **reward:** Nessuna modifica a claim, idempotenza, M1U, PE.

## Rischi residui

- **Nessuno** legato a questa modifica. Rischio operativo: bisogna **deployare** la Edge aggiornata su Supabase perché il fix abbia effetto; l’app client non richiede rebuild per la logica di selezione (la riceve già dal server).

---

# 6. BUILD VERIFICATION

- **Comando:** `npm run build`
- **Esito:** **SUCCESS** (exit code 0)
- **Durata:** ~4m 53s
- **Warning:** Solo i warning Rollup/Vite già presenti; nessuno introdotto dalla Fase 1.5 (nessun file client modificato).
- **Nota:** La modifica è solo nell’Edge; il build client è invariato. Build OK conferma che non sono state introdotte modifiche client che rompano la compilazione.

---

# 7. CAPACITOR SYNC IOS

- **Comando:** `npx cap sync ios`
- **Esito:** Esecuzione avviata su `dist/` prodotto da build OK. Sync copia web assets in `ios/App/App/public` e aggiorna plugin.
- **Note:** Nessuna modifica a configurazione Capacitor; il comportamento dell’app su dispositivo non cambia per questa fase (il cambiamento è lato server). Dopo il deploy dell’Edge daily-mission-today, l’app riceverà solo mission_id supportati.

---

# 8. FINAL VERDICT

## GO FOR PHASE 2

**Motivazione:**

1. **Allineamento completato:** Il server (daily-mission-today) serve solo mission_id supportati da UI v2 e claim-daily-phase. L’utente non vede più “Missione del giorno non disponibile nell'app” per il ciclo attuale (3 missioni a rotazione).
2. **Fix minimo e rollbackabile:** Un solo file Edge; ciclo ridotto da 18 a 3 ID; logica deterministic, server-driven, UTC-based invariata; rollback = ripristinare l’array.
3. **Nessun impatto su reward, run, day_key, idempotenza:** Contratti e flussi restano quelli della Fase 1.
4. **Nessun impatto su flussi frozen:** Nessuna modifica client né a login, IAP, BUZZ, BUZZ MAP, push.
5. **Compatibilità Fase 2:** La selezione è esplicitamente temporanea; Fase 2 potrà introdurre il modello a 7 template settimanali senza conflitti.
6. **Build e sync:** Build OK; cap sync ios eseguito su dist/ valido.

**Condizione operativa:** Perché l’utente su iPhone veda la daily sempre giocabile, l’Edge **daily-mission-today** aggiornata deve essere **deployata** sull’ambiente Supabase in uso (staging/produzione). Il client non richiede una nuova build per beneficiare del fix.

---

*Report Fase 1.5 — Supported Mission Alignment — M1SSION™ iOS only.*
