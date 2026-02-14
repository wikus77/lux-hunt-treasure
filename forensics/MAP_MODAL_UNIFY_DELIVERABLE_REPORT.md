# MAP MODAL DESIGN UNIFICATION — DELIVERABLE REPORT

**Data:** 2026-02-14  
**Scope:** FINAL SHOT + ARSENAL — design only, NOTE-style wrapper

---

## 1. ROLLBACK SNAPSHOT

**Tag creato:** `SNAPSHOT_PRE_MAP_MODAL_UNIFY_FINALSHOT_ARSENAL_20260214_054522`

**Comando rollback (pronto all'uso):**
```bash
git reset --hard SNAPSHOT_PRE_MAP_MODAL_UNIFY_FINALSHOT_ARSENAL_20260214_054522
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. FILE MODIFICATI (SOLO IN SCOPE)

| File | Modifiche |
|------|-----------|
| `src/components/final-shoot/FinalShootPill.tsx` | Video + Info modal wrappati in MapPillFlipOverlay (NOTE-style) |
| `src/components/battle/BattleShopPill.tsx` | Shop modal wrappato in MapPillFlipOverlay (NOTE-style) |

---

## 3. DIFF SUMMARY

### FinalShootPill.tsx
- Rimosso `createPortal`, `AnimatePresence` per modali
- Aggiunto `MapPillFlipOverlay`, `originRect`
- Video modal: sostituito backdrop/container con MapPillFlipOverlay, header NOTE-style (centered title, X left), stesso contenuto (video, buttons)
- Info modal: sostituito con MapPillFlipOverlay, header NOTE-style cyan gradient
- Pill: `onClick` passa event a `handleClick` per catturare `originRect`
- Animazione: scale-from-pill-origin come NOTE (MapPillFlipOverlay)

### BattleShopPill.tsx
- Rimosso `AnimatePresence`
- Aggiunto `MapPillFlipOverlay`, `originRect`
- Pill: `onClick` cattura rect e apre modal
- Modal: sostituito con MapPillFlipOverlay, header NOTE-style (cyan gradient), Tabs Shop/Inventory invariati
- Stesso scroll-lock, backdrop, close UX di NOTE

---

## 4. BUILD & CAP SYNC

| Gate | Esito |
|------|-------|
| `npm run build` | ✅ PASS |
| `npx cap sync ios` | ✅ PASS |

---

## 5. QA iPHONE — CHECKLIST (OBBLIGATORIA)

| # | Check | Esito |
|---|-------|-------|
| 1 | MAP → NOTE: animazione ingresso/uscita | ⬜ |
| 2 | MAP → FINAL SHOT: DEVE essere IDENTICO a NOTE | ⬜ |
| 3 | MAP → ARSENAL: DEVE essere IDENTICO a NOTE | ⬜ |
| 4 | Nessun glitch | ⬜ |
| 5 | Nessun crash | ⬜ |
| 6 | Nessuna regressione UI | ⬜ |

**Se uno fallisce → rollback immediato.**

---

## 6. MODIFICHE NON EFFETTUATE (RISPETTATE)

- Logiche di business
- Flussi (attempts, M1U, shop, inventory, unlock)
- Hook, store, context
- Routing
- Edge functions
- Map logic
- Comportamento pulsanti (solo design wrapper)

---

FINE REPORT.
