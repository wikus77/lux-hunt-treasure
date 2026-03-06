# M1U SHOP FEEDBACK — FASE 1 RESULTS (Post-implementazione)

**Data:** 2026-03-04  
**Branch:** `fix/m1u-shop-feedback-pill` | **Tag rollback:** `safety/m1u-shop-feedback-pre`

---

## 1. Implementazione completata

### 1.1 Dispatch e timing
- **File:** `src/components/m1units/M1UShopContent.tsx`
- Su **payment success**: non si chiude più subito il modale. Si impostano `overlayAmount = selectedPack.m1u_total` e `showM1UPillOverlay = true`.
- **useEffect** (quando overlay attivo e `overlayAmount > 0`):
  - Dopo **120 ms**: `dispatch('m1u-credited', { amount })` + `m1u-balance-changed`, così il pill nell’overlay (e qualsiasi altro pill montato) riceve l’evento e avvia l’animazione slot.
  - Dopo **2800 ms**: `setShowM1UPillOverlay(false)`, `setOverlayAmount(0)`, `onClose()`.

### 1.2 Overlay pill
- Stesso componente **M1UPill** (`@/features/m1u/M1UPill`) usato in header/Home, renderizzato in overlay sopra il contenuto del modale Shop.
- **Posizione:** `position: fixed`, in alto a sinistra (stile pill reale: `top: calc(env(safe-area-inset-top) + 80px)`, `left: max(16px, env(safe-area-inset-left))`), `zIndex: 99999`.
- **Interazione:** `pointer-events: none` sul wrapper (non blocca tap).
- **Transizione:** `AnimatePresence` + `motion.div`: fade-in 280 ms (easeOut), fade-out 280 ms in exit.
- Nessuna nuova stringa: overlay solo visivo (pill + animazione).

### 1.3 File toccati
| File | Modifica |
|------|----------|
| `src/components/m1units/M1UShopContent.tsx` | State overlay, useEffect per dispatch ritardato e chiusura, overlay con M1UPill e fade |
| `reports/M1U_SHOP_FEEDBACK_PHASE0.md` | Report verifica forense |
| `reports/M1U_SHOP_FEEDBACK_PHASE1_RESULTS.md` | Questo report |

Nessuna modifica a: `M1UPill.tsx` (solo import), IAP, credit, `M1UPaymentModal`, `M1UnitsShopModal`.

---

## 2. Build e sync

- `npm run build`: **OK** (exit 0)
- `npx cap sync ios`: **OK**

---

## 3. Test smoke (checklist iOS)

1. Aprire lo Shop dal pill “+ M1U”.
2. Acquistare un pack (flusso IAP reale o sandbox):
   - Deve comparire l’overlay del pill con fade-in.
   - Deve partire l’animazione slot (stesso comportamento di M1UPill).
   - Nessun doppio overlay, nessun flicker, tap non bloccati (`pointer-events: none`).
3. Dopo ~2.8 s: fade-out dell’overlay e chiusura del modale.
4. Riaprire il modale: nessun effetto residuo.
5. **NO REGRESSION:** login/logout, delete, IAP, BUZZ, BUZZ MAP, push (smoke: aprire le schermate critiche e verificare assenza crash).

---

## 4. Rollback

```bash
git reset --hard safety/m1u-shop-feedback-pre
```

---

## 5. Output atteso

- Dopo acquisto M1U nello Shop modal: overlay del pill visibile con fade-in/out e animazione slot sempre visibile per ~2.8 s, poi chiusura modale.
- Nessuna modifica alle logiche di pagamento/credit, solo UX nel modale Shop.
