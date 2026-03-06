# M1U Slot UX Baseline — Incident Report (Post-IAP numeri fuorvianti)

**Data:** 2026-03-05  
**Scope:** iOS Capacitor WKWebView — pill M1U post-acquisto  
**File modificato:** `src/features/m1u/M1UPill.tsx` ONLY  
**NO IAP TOUCH** — Nessuna modifica a StoreKit, receipt, accredito, Supabase, Edge, BUZZ, login, push, subscriptions.

---

## Riepilogo

- **Problema:** Dopo acquisto IAP la pill mostrava prima il saldo post-accredito corretto, poi animazione “slot” con numeri strani/overshoot, poi di nuovo il saldo corretto.
- **Causa ipotizzata:** All’arrivo di `m1u-credited`, `unitsData.balance` era già il valore POST; la pill sincronizzava su quel valore e animava da baseline errato (es. da post a post+amount) generando overshoot.
- **Fix:** Baseline deterministico **PRE → POST**: `fromBalance = Math.max(0, targetBalance - amount)`; sync UI su `fromBalance` prima di animare; animazione solo se `targetBalance > fromBalance`.

---

## Rollback (obbligatorio in caso di regressione)

Tag creato **prima** delle modifiche:

```bash
# Ripristino allo stato pre-fix
git reset --hard safety/m1u-slot-ux-baseline-pre-20260305-ux
```

- **Tag:** `safety/m1u-slot-ux-baseline-pre-20260305-ux`  
- **Commit:** `aca569c0089e90adcb76a008e375ca6812ef8349`

---

## Fasi eseguite

### FASE 1 — Forensics (log temporanei)

- `DEBUG_M1U_PILL = true` impostato temporaneamente.
- Log aggiunti in:
  1. **Inizio `handleM1UCredited`:** `instanceId`, `amount`, `unitsData?.balance`, `displayedBalanceRef.current`, lock (`creditKey`, `expiresAt`).
  2. **Subito prima dell’animazione:** `computedFromBalance`, `computedTargetBalance`, `reason` (targetFromUnitsData / targetFromDisplayed / fallback), `fromReason` (fromComputedPre / fromPrevBalance / fromDisplayed).
  3. **`forceStopAnimation`:** `finalTarget`, `displayedBalanceRef.current` al momento dello stop.

Log disattivati in FASE 3 (`DEBUG_M1U_PILL = false`). Per riattivare il debug: impostare `const DEBUG_M1U_PILL = true` in `M1UPill.tsx`.

### FASE 2 — Fix baseline deterministico

- **targetBalance:** prima scelta `unitsData?.balance` (number), fallback `displayedBalanceRef.current`, altrimenti `0`.
- **fromBalance:**  
  - Se `amount` e `targetBalance` validi: `fromBalance = Math.max(0, targetBalance - amount)` (PRE-accredito ricostruito).  
  - Altrimenti: `prevBalance` o `displayedBalanceRef.current`.
- **Prima di animare:** sync UI a PRE:
  - `setDisplayedBalance(fromBalance)`
  - `displayedBalanceRef.current = fromBalance`
  - `setPrevBalance(fromBalance)`
- **Animazione solo se** `targetBalance > fromBalance`; altrimenti solo sync a `targetBalance` (nessuna animazione).
- **Animazione:** `animateBalance(fromBalance, targetBalance, 2500)` — nessun “slot randomizer”; intervallo sempre tra `fromBalance` e `targetBalance` (easeOutQuart, nessun jitter).
- **Mantenuti:** lock globale `window.__m1u_pill_credit_lock__`, hard stop, throttle refetch, effect sync su `unitsData.balance` (solo sync, no `animateBalance`).

### FASE 3 — Cleanup

- `DEBUG_M1U_PILL = false`.
- Nessun log rumoroso lasciato attivo.

---

## Build e sync

- `pnpm run build` — OK (prebuild guard passed, vite build completato).
- `npx cap sync ios` — OK (assets copiati in `ios/App/App/public`, plugin aggiornati).

---

## Conferme deliverable

| Requisito | Stato |
|-----------|--------|
| Baseline pre→post deterministico (`target - amount`) | ✅ |
| Nessun numero fuori range [pre, post] | ✅ (animazione da `fromBalance` a `targetBalance` solo) |
| NO IAP TOUCH | ✅ |
| Patch solo in `M1UPill.tsx` | ✅ |
| Rollback documentato | ✅ `git reset --hard safety/m1u-slot-ux-baseline-pre-20260305-ux` |

---

## Test matrix iOS (da eseguire su dispositivo)

1. **Saldo noto (es. 9.572.123), acquisto +110**  
   - Pill mostra prima 9.572.123, poi anima solo in salita fino a 9.572.233.  
   - Mai valori fuori [pre, post].

2. **Doppia istanza (Home + Shop overlay)**  
   - Solo una pill anima (lock globale).

3. **Chiusura shop subito dopo acquisto**  
   - Hard stop garantisce fine pulita.

4. **IAP invariato**  
   - Receipt e accredito reale invariati.

---

## Diff minimale (logica chiave)

- `handleM1UCredited`: non usa più `currentDisplayed + amount` come target; calcola `targetBalance` da `unitsData?.balance` o `displayedBalanceRef.current`, e `fromBalance = Math.max(0, targetBalance - amount)`.
- Sync esplicito a `fromBalance` prima di `animateBalance(fromBalance, targetBalance, 2500)`.
- Skip animazione se `targetBalance <= fromBalance` (solo sync a `targetBalance`).
- `forceStopAnimation`: log forense con `finalTarget` e `displayedBalanceRef.current` (attivi solo con `DEBUG_M1U_PILL = true`).

---

© 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
