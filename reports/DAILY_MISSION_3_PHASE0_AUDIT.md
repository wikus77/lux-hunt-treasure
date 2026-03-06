# Daily Mission #3 — Signal Pattern Numbers — FASE 0 Audit (Read-Only)

**Data:** 2026-03-03  
**Scope:** Verifica pre-patch per Daily #3 (Fibonacci/sequenze), slot machine, wallet realtime, whitelist file.

---

## A) Mission Cycle Engine (Opzione B) — Source of truth

- **Edge `daily-mission-today`:** `supabase/functions/daily-mission-today/index.ts` — restituisce `day_key`, `mission_id` (ciclo 15 id), `cycle_version`, `index`. Read-only, nessuna scrittura DB.
- **Hook client `useMissionOfTheDay()`:** `src/missions/useMissionOfTheDay.ts` — chiama l’Edge, cache `m1_daily_mission_today_cache`, fallback con stesso ciclo (epochDay % 15).
- **Conclusione:** La rotazione è server-driven (Opzione B). Per Daily #3 è sufficiente aggiungere `signal_pattern_numbers_v1` al ciclo in Edge + client; nessun ulteriore cambio allo scheduler.

---

## B) claim-daily-phase e accredito M1U reale

- **Edge `claim-daily-phase`:** `supabase/functions/claim-daily-phase/index.ts` — gestisce `cipher_drill_anagram_v1` e `word_duel_memory_v1`. Per `signal_pattern_numbers_v1` attualmente restituisce **501 NOT_IMPLEMENTED_YET** (stub).
- **Accredito:** Per #1 e #2 l’Edge inserisce in `daily_mission_claims` (idempotency_key) e chiama `admin.rpc('admin_credit_m1u', { p_user_id, p_amount, p_reason })`. Il saldo M1U è aggiornato nel DB.
- **UI realtime:** Il componente **`src/features/m1u/M1UPill.tsx`** usa `useM1UnitsRealtime(userId)` che espone `unitsData`, `refetch()`. Quando il saldo cambia (es. dopo credit), il hook può riflettere il nuovo valore; il pill si aggiorna anche tramite l’evento custom (vedi sotto).

---

## C) Slot machine animation — dove sta e come riusarla

- **Componente:** `src/features/m1u/M1UPill.tsx`
- **Meccanismo:** Il pill ascolta l’evento custom **`m1u-credited`** (`window.addEventListener('m1u-credited', ...)`).
- **Contratto:** `CustomEvent` con `detail: { amount: number }`. All’arrivo dell’evento:
  1. Legge `currentDisplayed` (stato locale del pill).
  2. Chiama `refetch()` (dopo 100 ms) per allineare al saldo reale DB.
  3. Esegue **`animateBalance(currentDisplayed, currentDisplayed + amount, 2500)`** — animazione “slot” (easeOutQuart, 2.5 s).
- **Uso attuale:** Già usato da Daily #1 (CipherDrillModal) e Daily #2 (WordDuelMemoryModal): dopo `claimDailyPhase(..., complete_phase1/complete_phase2)` con risposta ok e `amount > 0`, viene fatto `window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount } }))`.
- **Obbligo per Daily #3:** **Riuso identico.** In `SignalPatternNumbersModal`, alla risposta WIN di `complete_phase2` con `amount > 0`, dispatchare `m1u-credited` con `detail: { amount }`. Nessun refactor di M1UPill, nessuna nuova animazione.

---

## D) File che verranno toccati (whitelist)

| Tipo   | File |
|--------|------|
| Edge   | `supabase/functions/claim-daily-phase/index.ts` (rimuovere stub 501, aggiungere gestione completa `signal_pattern_numbers_v1`) |
| Edge   | `supabase/functions/daily-mission-today/index.ts` (aggiungere `signal_pattern_numbers_v1` al MISSION_CYCLE) |
| Client | `src/missions/useMissionOfTheDay.ts` (aggiungere id al ciclo) |
| Client | `src/missions/missionsRegistry.ts` (definizione mission + fallback cycle) |
| Client | `src/components/feedback/DailyMissionContent.tsx` (switch `signal_pattern_numbers_v1` → SignalPatternNumbersModal) |
| Client | `src/missions/ui/SignalPatternNumbersModal.tsx` (NUOVO) |
| Client | `src/missions/serverReal/claimDailyPhase.ts` (opzionale: costante/tipi) |
| i18n   | `src/locales/en/common.json`, `src/locales/it/common.json`, `src/locales/fr/common.json` (chiavi `daily.signal_pattern.*`) |

**NON toccare:** Auth, Router, delete-account-v2, IAP, BUZZ, BUZZ MAP, push native, M1UPill (solo “consumo” evento esistente).

---

## FROZEN — Nessun rischio identificato

- Login/Logout, Delete Account, IAP, BUZZ, BUZZ MAP, Push: nessun file di questi flussi è in whitelist.
- L’implementazione è additiva: nuova mission_id, nuovo modal, estensione Edge. Stesso percorso di credito già usato da Daily #1/#2 (`admin_credit_m1u` + `daily_mission_claims`).

---

## Esito FASE 0

**OK per procedere.** Slot machine = evento `m1u-credited` + M1UPill (riuso). Wallet realtime = DB aggiornato da Edge + refetch/useM1UnitsRealtime. Procedere con FASE 1 (branch/tag + implementazione).
