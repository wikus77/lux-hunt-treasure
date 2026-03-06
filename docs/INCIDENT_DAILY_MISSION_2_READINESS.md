# INCIDENT REPORT — Daily Mission #2 (Word Duel Memory) — READINESS
**Data:** 2026-03-03  
**Scope:** Verifica pre-patch (FASE 0) + whitelist file per FASE 1  

---

## 1) Mission Cycle Engine (Opzione B) — Conferma attivo

- **Edge `daily-mission-today`:** presente in `supabase/functions/daily-mission-today/index.ts`. Restituisce `day_key`, `mission_id`, `cycle_version`, `index` (ciclo 15 id).
- **Hook client `useMissionOfTheDay()`:** presente in `src/missions/useMissionOfTheDay.ts`. Chiama l’Edge, cache `m1_daily_mission_today_cache`, fallback con stesso ciclo (epochDay % 15).
- **Flusso:** NextActionContainer usa il hook e passa `mission` / `missionLoading` a NextActionContent; DailyMissionCard e MissionPill usano il hook. La missione del giorno arriva da server/cache/fallback.
- **Per Daily #2:** per far comparire `word_duel_memory_v1` nel ciclo va aggiunto agli array di 15 id in: `daily-mission-today` (Edge), `useMissionOfTheDay.ts` (MISSION_CYCLE), `missionsRegistry.ts` (MISSION_CYCLE_FALLBACK). Nessun altro cambiamento allo scheduler.

---

## 2) Stato DB — daily_mission_runs e daily_mission_claims

- **Tabelle:** definite in `supabase/migrations/20260303110000_daily_mission_runs_claims.sql`.
- **daily_mission_runs:** `user_id` REFERENCES auth.users(id) ON DELETE CASCADE, `progress_json` JSONB. RLS: SELECT per owner, INSERT/UPDATE/DELETE con WITH CHECK (false) (solo service_role).
- **daily_mission_claims:** `user_id` REFERENCES auth.users(id) ON DELETE CASCADE, idempotency_key UNIQUE. RLS: SELECT per owner, INSERT/UPDATE/DELETE bloccati per anon/authenticated.
- **Conclusione:** nessuna migrazione aggiuntiva necessaria; `progress_json` già supporta payload arbitrario per Word Duel. Delete account non bloccato (CASCADE).

---

## 3) Stato Edge — claim-daily-phase

- **Path:** `supabase/functions/claim-daily-phase/index.ts`.
- **Azioni:** start_phase1, complete_phase1, start_phase2, complete_phase2.
- **Missioni:** attualmente accetta solo `cipher_drill_anagram_v1`; per altri `mission_id` restituisce 400 unknown_mission; per `truth_filter_words_v1` e `signal_pattern_numbers_v1` restituisce 501 NOT_IMPLEMENTED_YET.
- **Estensione prevista:** aggiungere gestione esplicita di `word_duel_memory_v1` (stesso schema a 4 azioni, reward idempotenti, progress_json per round/savedWords/memorization/expectedAnswer).

---

## 4) Whitelist file da toccare (solo daily + edge)

| Tipo | File |
|------|------|
| **Edge** | `supabase/functions/claim-daily-phase/index.ts` (aggiunta mission_id word_duel_memory_v1) |
| **Edge** | `supabase/functions/daily-mission-today/index.ts` (inserire word_duel_memory_v1 nel MISSION_CYCLE) |
| **Client** | `src/components/feedback/DailyMissionContent.tsx` (switch word_duel_memory_v1 → WordDuelMemoryModal) |
| **Client** | `src/missions/ui/WordDuelMemoryModal.tsx` (nuovo) |
| **Client** | `src/missions/missionsRegistry.ts` (definizione mission + ciclo fallback) |
| **Client** | `src/missions/useMissionOfTheDay.ts` (aggiungere word_duel_memory_v1 a MISSION_CYCLE) |
| **Client** | `src/missions/serverReal/claimDailyPhase.ts` (opzionale: costante MISSION_ID_WORD_DUEL, tipi payload) |
| **i18n** | `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json` (chiavi daily.word_duel.*) |

Nessuna migrazione DB aggiuntiva; nessun tocco a login, logout, delete-account-v2, IAP, BUZZ, BUZZ MAP, push.

---

## 5) Conferma NO TOUCH su flussi FROZEN

- **Login / Logout:** non toccati.
- **Cancellazione account (delete-account-v2):** non toccata; runs/claims con ON DELETE CASCADE.
- **IAP (Capgo + verify/credit):** non toccati; credito daily solo via admin_credit_m1u e daily_mission_claims.
- **BUZZ / BUZZ MAP:** non toccati.
- **Push native:** non toccati.

Implementazione additiva: solo nuova mission_id, nuovo modal, estensione Edge e i18n.

---

## 6) Piano test iOS (smoke) + comandi

**Test manuali (post FASE 1):**
- Login / logout OK  
- Delete account OK  
- IAP OK  
- BUZZ OK  
- BUZZ MAP OK  
- Push native OK  
- Daily #1 (Cipher Drill) ancora OK  
- Daily #2: start_phase1 → 5 round mostrati; timer 60s; complete_phase1 idempotente; giorno dopo start_phase2 → input → complete_phase2 win/fail; idempotenza crediti; i18n IT/EN/FR senza hardcoded  

**Comandi finali:**
```bash
npm run build
npx cap sync ios
npx supabase functions deploy claim-daily-phase
npx supabase functions deploy daily-mission-today
```

---

## Esito FASE 0

**Tutto pronto e in-scope.** Nessun rischio FROZEN identificato. Procedere con FASE 1 (rollback prep + implementazione server + client + i18n).

---

## FASE 1 — Completata (2026-03-03)

- **Rollback:** branch `feat/daily-mission-2-word-duel`, tag `safety/daily-mission-2-pre`.
- **Edge `claim-daily-phase`:** gestione completa di `word_duel_memory_v1` (start_phase1, complete_phase1 con `savedWords` in risposta, start_phase2, complete_phase2). Generazione deterministica round (seed `day_key + user_id`). Phase2: normalizzazione trim + spazi multipli → 1 spazio, case-insensitive. **savedWords vuoto:** `expectedAnswer = ""`; se l’utente invia stringa vuota (normalizzata) → WIN con credito phase2 = 0 (nessun doppio accredito).
- **Ciclo:** `word_duel_memory_v1` aggiunto a `daily-mission-today` (Edge), `useMissionOfTheDay.ts`, `missionsRegistry.ts` (MISSION_CYCLE_FALLBACK).
- **Client:** `WordDuelMemoryModal.tsx` (5 round, 60s memorize, phase2 input, win/fail), `DailyMissionContent` switch, `missionsRegistry` definition, `claimDailyPhase.ts` tipi + `MISSION_ID_WORD_DUEL`.
- **i18n:** chiavi `daily.word_duel.*` in en / it / fr.
- **Build:** `npm run build` exit 0. **Sync:** `npx cap sync ios` exit 0.

**Comandi deploy Edge (da eseguire a mano):**
```bash
npx supabase functions deploy claim-daily-phase
npx supabase functions deploy daily-mission-today
```
