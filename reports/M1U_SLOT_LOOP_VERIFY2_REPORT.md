# M1U Slot Loop — Verifica 2 (Diff + 4 fix + patch aggiuntiva)

**Data:** 2026-03-05  
**Tag rollback:** `safety/m1u-slotloop-pre-fix-verify2`

---

## FASE 0 — Verifica oggettiva

### A) Stato repo
- **Branch:** `fix/m1u-slotloop-anim`
- **Ultimo commit:** `aca569c00 feat(welcome-bonus): 500→150 M1U + i18n ...`
- **Tag:** `safety/m1u-shop-feedback-pre`, `safety/m1u-slotloop-pre-20260305-0550`, `safety/m1u-slotloop-pre-fix`, `safety/m1u-slotloop-pre-fix-verify2`

### B) Diff vs tag `safety/m1u-slotloop-pre-fix`
- **DIFF vs TAG: PRESENTE** — Il file `M1UPill.tsx` attuale è diverso dalla versione al tag: la patch (listener stabile, animatingRef, hard stop, guard balance) è stata applicata.

### C) Firma dei 4 fix (righe)
| Fix | Trovato | Riferimento |
|-----|---------|-------------|
| 1) Listener stabile, effect NON dipende da `displayedBalance` | SÌ | `handleM1UCredited` useCallback (165–176), effect deps `[handleM1UCredited]` (181); `displayedBalanceRef` (54, 60) |
| 2) Lock `animatingRef` | SÌ | `animatingRef` (53), check in handler (169), set true/false in animateBalance e forceStop (96, 121, 80) |
| 3) Hard stop 3200ms + cleanup timeout | SÌ | `HARD_STOP_MS` (59), `hardStopTimeoutRef` (57, 98–101, 112–114), cleanup unmount (218) |
| 4) Guard effect balance | SÌ | `!animatingRef.current` nella condizione (204); aggiunto return iniziale `if (animatingRef.current) return` (196) |

**Decisione:** PATCH GIÀ APPLICATA MA POSSIBILE RE-TRIGGER — Aggiunte due guard aggiuntive per chiudere ogni race.

---

## FASE 1 — Patch aggiuntive (solo M1UPill.tsx)

1. **PrevBalance al start** — In `handleM1UCredited`, prima di `animateBalance`, viene chiamato `setPrevBalance(newBalance)` così al ritorno di `refetch()` l’effect “balance change” vede già `prevBalance === unitsData.balance` e non avvia una seconda animazione.
2. **Early return nell’effect balance** — All’inizio dell’effect che reagisce a `unitsData.balance` è stato aggiunto `if (animatingRef.current) return;` per non aggiornare stato (e non chiamare `animateBalance`) mentre l’animazione slot è in corso.

Nessuna modifica a IAP, accredito, eventi; solo UI/animazione.

---

## Build e sync
- `npm run build` — da eseguire
- `npx cap sync ios` — da eseguire

**Rollback:** `git reset --hard safety/m1u-slotloop-pre-fix-verify2`
