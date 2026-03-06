# M1U Slot Animation Infinite Loop — Fix Report (Finale)

**Data:** 2026-03-05  
**Tag rollback:** `safety/m1u-slotloop-pre-fix`

---

## FASE 0 — Verifica forense (esito)

| Trigger | Quante volte / Perché |
|--------|------------------------|
| `m1u-credited` listener | Effect con deps `[refetch, displayedBalance]` → a ogni frame di animazione `displayedBalance` cambiava → effect rieseguito → add/remove listener continuo (handler non stabile). |
| `animateBalance` avviata | Potenzialmente più volte: (1) da evento, (2) da effect “balance change” dopo `refetch()` quando `unitsData.balance` aggiornava. |
| Due pill montati (Home + overlay Shop) | Entrambi ricevevano lo stesso `m1u-credited` → due animazioni avviate; overlay unmount non fermava l’animazione sull’altro. |
| Nessun hard stop | Se RAF non arrivava a `progress >= 1`, `isAnimating` e RAF potevano restare attivi. |

**Root cause (1 frase):** Listener `m1u-credited` ri-registrato a ogni cambio di `displayedBalance` (ogni frame) + effect “balance change” che poteva riavviare l’animazione dopo `refetch()` + assenza di hard stop e lock anti-re-trigger.

---

## FASE 1 — Fix applicati in `M1UPill.tsx`

1. **Listener stabile** — Handler `handleM1UCredited` con `useCallback`; lettura valore da `displayedBalanceRef.current`; effect con dipendenze `[handleM1UCredited]` (nessun `displayedBalance`). Un solo listener, nessun re-register per frame.
2. **Lock animazione** — `animatingRef`: in `handleM1UCredited` se `animatingRef.current === true` si esce; all’avvio animazione `animatingRef.current = true`, a fine o hard stop `false`.
3. **Hard stop** — `setTimeout(forceStopAnimation, 3200)` all’avvio di `animateBalance`; cleanup RAF + timeout in unmount; `forceStopAnimation` forza `displayedBalance` al target, `isAnimating = false`, `animatingRef.current = false`.
4. **Guard effect “balance change”** — Nell’effect che chiama `animateBalance(prevBalance, unitsData.balance, 1500)` aggiunta condizione `!animatingRef.current`; refetch resta, ma non si riavvia animazione se già in corso.

**FASE 1.1** — `M1UShopContent.tsx` non modificato: un solo dispatch per success (useEffect con `showM1UPillOverlay` + `overlayAmount`); nessun doppio dispatch ravvicinato rilevato.

---

## Risultato

- **Build:** `npm run build` OK.  
- **Sync:** `npx cap sync ios` OK.  
- **Test iOS (da confermare su dispositivo):** Acquisto M1U → overlay pill + animazione slot parte una volta → si ferma entro ~3.2 s; chiusura modale e ritorno a Home → pill non continua ad animare. Nessuna modifica IAP/accredito.  
- **Regressioni:** Nessun touch su IAP, BUZZ, BUZZ MAP, login/logout, delete-account, push.

**Rollback:** `git reset --hard safety/m1u-slotloop-pre-fix`
