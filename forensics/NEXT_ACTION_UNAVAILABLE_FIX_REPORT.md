# NEXT ACTION UNAVAILABLE — Fix Report

**Date:** 2025-02-15  
**Incident:** Tap su "NEXT ACTION" → "Prossima Azione non disponibile" + bottone "Riprova" (iOS WKWebView)  
**Rollback tag:** `SNAPSHOT_PRE_FIX_NEXT_ACTION_UNAVAILABLE_20260215-084256`

---

## Root Cause

**File:line:** `src/components/feedback/NextActionContent.tsx` — **import mancanti**

`NextActionContent` usava `isVeraBombEnabled()` e `<BombMissionModal>` senza importarli. Al tap su "NEXT ACTION", l’overlay si apre e monta `NextActionContent`, che esegue `isVeraBombEnabled()` → **ReferenceError: isVeraBombEnabled is not defined**. `SectionErrorBoundary` (in `AppHome.tsx` intorno a `NextActionContainer`) intercetta l’errore e mostra il fallback `{section} non disponibile` = "Prossima Azione non disponibile" con bottone "Riprova".

---

## Perché su iOS

Su WKWebView il modulo viene caricato normalmente, ma l’esecuzione avviene solo al mount di `NextActionContent` (quando l’overlay viene aperto). A quel punto la ReferenceError viene sollevata e il componente non viene renderizzato. L’error boundary (che wrappa `NextActionContainer`) mostra il messaggio di fallback.

---

## Patch Applicata (max 2 file)

### 1. `src/components/feedback/NextActionContent.tsx`

- **Aggiunti import mancanti:**
  ```ts
  import { isVeraBombEnabled } from '@/config/featureFlags';
  import { BombMissionModal } from '@/features/vera-missions/bomb/BombMissionModal';
  ```

- **Guardia difensiva su `orderedActions` (per WKWebView):**
  ```ts
  {(orderedActions ?? []).map((action, index) => (
  ```

### 2. Nessuna modifica su altri file

`NextActionContainer.tsx`, `SectionErrorBoundary.tsx` e `AppHome.tsx` non sono stati modificati.

---

## Diff Sintetica

```diff
--- a/src/components/feedback/NextActionContent.tsx
+++ b/src/components/feedback/NextActionContent.tsx
@@ -28,6 +28,8 @@ import {
 import { DailyMissionFlipOverlay } from './DailyMissionFlipOverlay';
 import { DailyMissionContent } from './DailyMissionContent';
+import { isVeraBombEnabled } from '@/config/featureFlags';
+import { BombMissionModal } from '@/features/vera-missions/bomb/BombMissionModal';

 interface NextActionContentProps {
@@ -232,7 +234,7 @@ export const NextActionContent: React.FC<NextActionContentProps> = ({ onClose }) 
           {/* Primary Actions */}
           <div ...>
-            {orderedActions.map((action, index) => (
+            {(orderedActions ?? []).map((action, index) => (
```

---

## QA Checklist

| Check | Status |
|-------|--------|
| Tap su "NEXT ACTION" → overlay si apre SEMPRE | ✅ Pass |
| Nessun "Prossima Azione non disponibile" (a meno di lista totalmente vuota) | ✅ Pass |
| Flag OFF → nessuna riga VERA BOMB | ⏳ Manuale |
| Flag ON → riga VERA BOMB visibile + apre BombMissionModal | ⏳ Manuale |
| Nessuna regressione Home/Map/Buzz/Streak/Commit | ⏳ Manuale |

**Build:** `pnpm run build` — ✅ OK  
**Sync iOS:** `npx cap sync ios` — ✅ OK

---

## Rollback

```bash
git checkout SNAPSHOT_PRE_FIX_NEXT_ACTION_UNAVAILABLE_20260215-084256 -- src/components/feedback/NextActionContent.tsx
```

---

## Note

- Il flag VERA BOMB resta: `localStorage m1_vera_mission_bomb_enabled` + `VITE_VERA_MISSION_BOMB_ENABLED`
- Nessuna modifica a MapTiler3D, Buzz, Streak, routing, auth, claim-marker-reward
