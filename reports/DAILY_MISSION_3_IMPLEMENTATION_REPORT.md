# Daily Mission #3 — Signal Pattern Numbers — Implementation Report

**Data:** 2026-03-03  
**Branch:** `feat/daily-mission-3-signal-pattern`  
**Tag rollback:** `safety/daily-mission-3-pre`

---

## 1) File toccati

| File | Modifica |
|------|----------|
| `supabase/functions/claim-daily-phase/index.ts` | Rimosso stub 501; aggiunta gestione completa `signal_pattern_numbers_v1` (4 azioni, reward solo Phase 2 WIN) |
| `supabase/functions/daily-mission-today/index.ts` | Aggiunto `signal_pattern_numbers_v1` al MISSION_CYCLE (16 id) |
| `src/missions/useMissionOfTheDay.ts` | Aggiunto `signal_pattern_numbers_v1` al ciclo + `word_puzzle` per allineamento |
| `src/missions/missionsRegistry.ts` | Aggiunto `signal_pattern_numbers_v1` al ciclo fallback; definizione missione (totalRewardM1U: 10, icon 🔢) |
| `src/components/feedback/DailyMissionContent.tsx` | Switch `mission?.id === MISSION_ID_SIGNAL_PATTERN` → `SignalPatternNumbersModal` |
| `src/missions/ui/SignalPatternNumbersModal.tsx` | **NUOVO** — modal fullscreen Phase 1 (sequenza + CTA) / Phase 2 (input numero + WIN/FAIL) |
| `src/missions/serverReal/claimDailyPhase.ts` | Aggiunto `MISSION_ID_SIGNAL_PATTERN`; tipi `progress.sequence_shown`, `pattern_type` |
| `src/locales/en/common.json` | Chiavi `daily.signal_pattern.*` (title, subtitle, phase1/phase2, win/fail, reward, error, close) |
| `src/locales/it/common.json` | Idem (IT) |
| `src/locales/fr/common.json` | Idem (FR) |
| `reports/DAILY_MISSION_3_PHASE0_AUDIT.md` | **NUOVO** — audit FASE 0 (slot animation, wallet realtime, whitelist) |

---

## 2) Schema progress_json (daily_mission_runs)

Per `signal_pattern_numbers_v1`:

```json
{
  "pattern_type": "fibonacci" | "arith" | "geom",
  "sequence_shown": [1, 1, 2, 3, 5, 8],
  "expected_next": 13
}
```

- **pattern_type:** scelto deterministicamente da `seed = hash(day_key + user_id + mission_id)` (0=fibonacci, 1=arith, 2=geom).
- **sequence_shown:** array di 5–8 numeri (Fibonacci), 6 (aritmetica) o 5 (geometrica).
- **expected_next:** numero corretto per Phase 2; **non** inviato al client (anti-cheat).
- Dopo complete_phase2 vengono aggiunti `userAnswer` e `result` ("win" | "fail").

---

## 3) Riuso slot machine animation

- **Componente:** `src/features/m1u/M1UPill.tsx` — ascolta l’evento custom **`m1u-credited`** con `detail: { amount }`.
- **Comportamento:** alla ricezione chiama `refetch()` e `animateBalance(currentDisplayed, currentDisplayed + amount, 2500)` (easeOutQuart, 2.5 s).
- **Uso in Daily #3:** in `SignalPatternNumbersModal.tsx`, in risposta WIN di `complete_phase2` con `amount > 0`:
  ```ts
  if (amount > 0) {
    window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount } }));
  }
  ```
- Nessun refactor di M1UPill; stesso meccanismo già usato da Daily #1 e #2.

---

## 4) Wallet realtime

- L’Edge `claim-daily-phase` su WIN inserisce in `daily_mission_claims` e chiama `admin.rpc('admin_credit_m1u', ...)`.
- Il saldo M1U è aggiornato nel DB; `M1UPill` usa `useM1UnitsRealtime(userId)` che espone `refetch()`.
- All’evento `m1u-credited` il pill esegue `refetch()` (dopo 100 ms) e avvia l’animazione sul valore attuale + amount; il refetch allinea il display al saldo reale.

---

## 5) Build e Capacitor sync

- **npm run build:** exit code **0** (completato con successo).
- **npx cap sync ios:** exit code **0** (sync completato).

---

## 6) Test da eseguire (smoke iOS)

- [ ] Login / Logout OK  
- [ ] Delete account OK  
- [ ] IAP OK (purchase + restore invariati)  
- [ ] BUZZ OK  
- [ ] BUZZ MAP OK  
- [ ] Push native OK  
- [ ] Daily #1 OK  
- [ ] Daily #2 OK  
- [ ] Daily #3:  
  - [ ] Compare nel ciclo (o con override `VITE_FORCE_DAILY_MISSION=signal_pattern_numbers_v1`)  
  - [ ] Phase 1: start/complete OK (0 M1U)  
  - [ ] Giorno dopo Phase 2: risposta corretta → WIN, saldo M1U aumenta, aggiornamento realtime + slot animation  
  - [ ] Risposta sbagliata → FAIL, 0 M1U  
  - [ ] Idempotenza: ripetere complete_phase2 → nessun doppio accredito  
  - [ ] i18n IT/EN/FR: nessun testo hardcoded  

---

## 7) Comandi deploy Edge (da eseguire a mano)

```bash
npx supabase functions deploy claim-daily-phase
npx supabase functions deploy daily-mission-today
```

---

## 8) Rollback

```bash
git reset --hard safety/daily-mission-3-pre
```

Oppure tornare al branch precedente ed eliminare `feat/daily-mission-3-signal-pattern` se non si vuole mantenere le modifiche.
