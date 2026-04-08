# REPORT PROGETTAZIONE — TACTICAL TIC TAC TOE DAILY

**Prodotto:** M1SSION™ Daily Mini-Game  
**Mission ID:** `tactical_tic_tac_toe_v1`  
**Game type (API):** `tic_tac_toe`  
**Data:** 2026-04-01  

---

## 1. ARCHITETTURA

### Client (React / Capacitor WKWebView)

- Modulo isolato sotto `src/missions/miniGames/ticTacToe/`: tipi, helper UI (nessuna logica di “risposta giusta”), griglia 3×3 a bottoni, modal full-screen nello stesso pattern degli altri daily (framer-motion, `claimDailyPhase`).
- Registrazione solo in `miniGameRegistry.ts` (mission_id + `game_type`), senza modificare Cipher / Word Duel / Signal.

### Server (Supabase Edge)

- `supabase/functions/_shared/ticTacToeDaily.ts`: pool di puzzle validati (mossa tattica unica: vittoria immediata per **X** oppure blocco obbligatorio vs **O**), seed deterministico `dayKey|userId|missionId|p1|p2`, difficoltà per **settimana del mese** (bucket 0–3 → `week_1` … `week_4`).
- `supabase/functions/_shared/dailyTicTacToeClaim.ts`: branch isolato per `claim-daily-phase` (start/complete phase1 e phase2, reward M1U + PE su phase2 win, streak).
- `daily-mission-today`: sabato (strategic) → `tactical_tic_tac_toe_v1` + `game_type`, `difficulty_level`, `board_seed` (nessun `correct_cell` in risposta).
- **Nota sicurezza:** `correct_cell` resta solo in `progress_json` lato DB; le risposte API usano `sanitizeTttProgressForClient` (board + meta).

### Integrazione daily

- Stesso modello a due fasi degli altri mission server-real: phase1 sul `day_key` corrente; phase2 legata al run del **giorno precedente** (UTC), come Cipher / Signal / Word Duel.
- Pilot `pin_rotator_timing` invariato: valutato **prima** del branch TTT in `claim-daily-phase`; `daily-mission-today` continua a sovrascrivere missione per allowlist pilot.

---

## 2. FILE CREATI / TOCCATI

**Creati**

- `src/missions/miniGames/ticTacToe/ticTacToeTypes.ts`
- `src/missions/miniGames/ticTacToe/ticTacToeLogic.ts`
- `src/missions/miniGames/ticTacToe/TicTacToeBoard.tsx`
- `src/missions/miniGames/ticTacToe/TicTacToeModal.tsx`
- `supabase/functions/_shared/ticTacToeDaily.ts`
- `supabase/functions/_shared/dailyTicTacToeClaim.ts`
- `reports/REPORT_TACTICAL_TIC_TAC_TOE_DAILY_2026-04-01.md`

**Modificati (integrazione minima)**

- `supabase/functions/daily-mission-today/index.ts` — sabato → TTT + meta API
- `supabase/functions/claim-daily-phase/index.ts` — invocazione handler TTT + guard anti fall-through
- `src/missions/dailyMiniGames/miniGameRegistry.ts`
- `src/missions/serverReal/claimDailyPhase.ts` — costanti + tipo `progress`
- `src/missions/serverReal/dailyMissionToday.ts` — tipo risposta opzionale
- `src/locales/en/common.json`, `it/common.json`, `fr/common.json` — chiavi `daily_ttt.*` (+ `cta_confirm`, `error_network` per UX)

---

## 3. FLOW (STEP BY STEP)

1. Client: `fetchDailyMissionToday` → `mission_id` / `game_type` / `difficulty_level` (meta).
2. Utente apre la card → `resolveMiniGameModal` → `TicTacToeModal`.
3. Modal: `start_phase2` → se ok, mostra griglia phase2; altrimenti `start_phase1` → griglia phase1.
4. Tap cella vuota → evidenziazione cyan; **Confirm** → `complete_phase1` o `complete_phase2` con `{ cell: 0..8 }`.
5. Server: confronta `cell` con `correct_cell` nel run (phase1 da run odierno; phase2 da `progress_json.phase2` persistito o rigenerato deterministicamente coerente).
6. Fail phase1: nessun avanzamento di fase, retry illimitato; feedback shake + testo `daily_ttt.fail`.
7. Success phase1: +10 M1U (idempotenza come altri daily), messaggio “torna domani” per phase2.
8. Success phase2: +10 M1U, +50 PE, streak aggiornata; fail phase2: run `failed`, niente reward phase2.

---

## 4. VALIDAZIONE SERVER

- Ignora qualsiasi calcolo client: valida solo `user_id` (JWT), `mission_id`, `day_key` server-side, e `payload.cell`.
- Puzzle e `correct_cell` generati/registrati solo sul server; risposte start_* espongono solo board sanificata.
- `complete_phase2` idempotente se `phase2_completed_at` già valorizzato.
- `start_phase2` rifiutato se il run di ieri è già completato (fase ≥ 3 o `phase2_completed_at`), per evitare riaperture incoerenti.

---

## 5. UX

- Titolo + sottotitolo + istruzione breve; griglia 3×3; glow sulla selezione; shake su errore phase1; highlight verde sulla cella corretta al successo; input disabilitato durante submit; chiusura con X senza bloccare (stesso overlay degli altri daily).

---

## 6. TEST

| ID | Scenario | Esito |
|----|-----------|--------|
| A | Scelta corretta phase1 / phase2 | Gestito server → `result: win`, reward coerente |
| B | Scelta errata phase1 | `result: fail`, retry, nessun avanzamento |
| B2 | Scelta errata phase2 | Run failed, messaggio fail |
| C | Replay stesso giorno (phase1 ok) | `start_phase1` → fase ≥ 2 → schermata “return tomorrow” |
| D | Chiusura modal | `onClose` senza side-effect obbligatori |
| E | Altri mini-game | Nessuna modifica ai file Cipher / Word Duel / Signal |
| F | iPhone reale | Non eseguito in CI; build produzione `npm run build` **OK** (2026-04-01) |

---

## 7. RISCHI / EDGE CASE

- **Rotazione giornaliera mission_id:** Phase2 usa il run del **ieri UTC** con lo **stesso** `mission_id`. Se l’utente non apre il modal il giorno successivo mentre la missione del giorno è un altro gioco, lo stesso vincolo strutturale vale per tutti i daily a due fasi (preesistente). Mitigazione prodotto futura: CTA “riprendi ieri” out of scope.
- **Sabato = TTT:** Il Sabato storico era Signal; ora è TTT per introdurre il nuovo gioco senza toccare i file di Signal.
- **Deploy Edge:** Funzioni aggiornate richiedono deploy Supabase per effetto in prod.

---

## 8. GO / NO GO

**GO** (dopo deploy Edge + smoke test su device iOS): implementazione isolata, validazione server, i18n EN/IT/FR, build web ok, pilot pin_rotator non alterato nel flusso.

**NO GO** finché le funzioni `daily-mission-today` e `claim-daily-phase` non sono deployate allineate al client.
