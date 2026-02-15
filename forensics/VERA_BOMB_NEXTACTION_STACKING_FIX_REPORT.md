# VERA BOMB — Next Action Stacking + Badge Fix Report

**Date:** 2025-02-15  
**Incident:** BombMissionModal si apre sotto overlay "Prossima Azione" + badge mancante su container NEXT ACTION  
**Rollback tag:** `SNAPSHOT_PRE_FIX_VERA_BOMB_NEXTACTION_STACK_20260215-085354`

---

## Root Cause

**Modal sotto overlay:** BombMissionModal era renderizzato dentro `NextActionContent`, quindi dentro il panel di `NextActionFlipOverlay`. Anche se `MapPillFlipOverlay` (usato da BombMissionModal) usa `createPortal` verso `m1-map-pill-portal` sul body, il portal ha `z-index: 99998` mentre `NextActionFlipOverlay` usa `z-index: 99999` (portal `m1-nextaction-portal`). Il modale Bomba restava visivamente sotto perché:
1. Veniva aperto con Prossima Azione ancora aperta.
2. MapPillFlipOverlay (z 99998) < NextActionFlipOverlay (z 99999).

**Badge mancante:** Nessun indicatore visivo su "NEXT ACTION" per la missione Vera Bomba disponibile.

---

## Fix Applicato

### Strategia: lift state + close-then-open

- BombMissionModal montato in `NextActionContainer` (fuori dall’overlay Prossima Azione).
- Click su riga "BOMBA / DISINNESCO" → chiude overlay Prossima Azione → `requestAnimationFrame` → apre BombMissionModal.
- Badge: dot rosso (8px) in alto a destra sul container NEXT ACTION quando `isVeraBombEnabled()`.

---

## File Modificati

### 1. `src/components/feedback/NextActionContainer.tsx`

- Import: `isVeraBombEnabled`, `BombMissionModal`.
- Stato: `isVeraBombOpen`, `setVeraBombOpen`.
- Handler: `handleOpenVeraBomb` → `setIsModalOpen(false)` + `requestAnimationFrame(() => setVeraBombOpen(true))`.
- Passaggio: `onOpenVeraBomb={handleOpenVeraBomb}` a `NextActionContent`.
- Render: `<BombMissionModal open={isVeraBombOpen} onClose={() => setVeraBombOpen(false)} originRect={null} />` (sibling di NextActionFlipOverlay).
- Badge: dot rosso (position absolute, top-right) quando `isVeraBombEnabled()`.

### 2. `src/components/feedback/NextActionContent.tsx`

- Rimosso: import `BombMissionModal`, stato `isBombOpen`, render di `BombMissionModal`.
- Aggiunto: prop `onOpenVeraBomb: () => void`.
- Riga BOMBA: `onClick={onOpenVeraBomb}` al posto di `setBombOpen(true)`.

---

## Diff Sintetica

```diff
# NextActionContainer.tsx
+ import { isVeraBombEnabled } from '@/config/featureFlags';
+ import { BombMissionModal } from '@/features/vera-missions/bomb/BombMissionModal';
+ const [isVeraBombOpen, setVeraBombOpen] = useState(false);
+ const handleOpenVeraBomb = useCallback(() => {
+   setIsModalOpen(false);
+   requestAnimationFrame(() => setVeraBombOpen(true));
+ }, []);
  ...
- <NextActionContent onClose={() => setIsModalOpen(false)} />
+ <NextActionContent onClose={() => setIsModalOpen(false)} onOpenVeraBomb={handleOpenVeraBomb} />
+ <BombMissionModal open={isVeraBombOpen} onClose={() => setVeraBombOpen(false)} originRect={null} />
+ {/* Badge dot when isVeraBombEnabled() */}

# NextActionContent.tsx
- import { BombMissionModal } from '@/features/vera-missions/bomb/BombMissionModal';
  interface NextActionContentProps {
    onClose: () => void;
+   onOpenVeraBomb: () => void;
  }
- const [isBombOpen, setBombOpen] = useState(false);
- <GlassCard onClick={() => setBombOpen(true)} ...>
+ <GlassCard onClick={onOpenVeraBomb} ...>
- <BombMissionModal ... />
  (rimosso)
```

---

## Rollback

```bash
git checkout SNAPSHOT_PRE_FIX_VERA_BOMB_NEXTACTION_STACK_20260215-085354 -- src/components/feedback/NextActionContainer.tsx src/components/feedback/NextActionContent.tsx
```

---

## QA Checklist

| Check | Status |
|-------|--------|
| Flag OFF: nessuna riga BOMBA, nessun badge | ⏳ Manuale |
| Flag ON: badge su container NEXT ACTION | ⏳ Manuale |
| Flag ON: riga BOMBA visibile in Prossima Azione | ⏳ Manuale |
| Tap BOMBA → Prossima Azione si chiude | ⏳ Manuale |
| Tap BOMBA → BombMissionModal sopra tutto, interagibile | ⏳ Manuale |
| Chiusura BombMissionModal → torna a Home (no auto-riapro) | ⏳ Manuale |
| Smoke: Home, Map, Buzz, Streak, Commit | ⏳ Manuale |

**Build:** ✅ OK  
**Cap sync iOS:** ✅ OK
