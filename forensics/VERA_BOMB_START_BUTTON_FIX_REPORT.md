# VERA BOMB — START Button + Badge Fix Report

**Date:** 2025-02-15  
**Incident:** "START MISSION" non fa nulla + badge dot → badge testo  
**Rollback tag:** `SNAPSHOT_PRE_FIX_VERA_BOMB_START_BUTTON_20260215-090656`

---

## Root Cause (START Button)

**Causa principale:** Fallimento silenzioso. `handleStart` chiama `startRun()`; se l’RPC fallisce o l’utente non è autenticato, il risultato è `null` o `{ error, runId: '' }`. L’UI ritornava senza feedback (nessun toast, nessun messaggio). L’utente non capiva che il tap era registrato ma la missione non partiva.

**Cause aggiuntive possibili:**
1. **user null:** `useBombMissionRun` restituiva `null` se `!user?.id`, senza messaggio d’errore.
2. **RPC:** Se `start_vera_mission_run` fallisce, il risultato ha `error` ma nessun feedback visibile.
3. **iOS touch:** `onClick` può non essere affidabile in alcuni contesti WKWebView; aggiunto `onTouchEnd` come fallback.

---

## Fix Applicati

### 1. BombMissionModal.tsx
- Import `toast` da sonner.
- `type="button"` sul pulsante START (evita submit se dentro form).
- `onTouchEnd` che richiama lo stesso handler per WKWebView.
- Toast in caso di errore: se `result?.error` → `toast.error(result.error)`, altrimenti messaggio generico.

### 2. useBombMissionRun.ts
- `inFlightRef` per evitare chiamate RPC duplicate (touch + click).
- `!user?.id` → ritorna `{ error: 'Utente non autenticato' }` invece di `null` così il toast può mostrare l’errore.

### 3. NextActionContainer.tsx (badge)
- Dot sostituito con badge testo `"1"`.
- Stile allineato al badge Daily Mission: `px-2 py-1 rounded-lg text-[10px] font-bold`, sfondo rosso, posizione top-right.

---

## File Modificati

| File | Modifiche |
|------|-----------|
| `src/features/vera-missions/bomb/BombMissionModal.tsx` | Toast su errore, `type="button"`, `onTouchEnd` |
| `src/features/vera-missions/bomb/useBombMissionRun.ts` | `inFlightRef`, messaggio d’errore su user null |
| `src/components/feedback/NextActionContainer.tsx` | Badge dot → testo "1" |

---

## Rollback

```bash
git checkout SNAPSHOT_PRE_FIX_VERA_BOMB_START_BUTTON_20260215-090656 -- src/features/vera-missions/bomb/BombMissionModal.tsx src/features/vera-missions/bomb/useBombMissionRun.ts src/components/feedback/NextActionContainer.tsx
```

---

## QA Checklist

| Check | Status |
|-------|--------|
| Flag OFF: nessuna riga Bomb, nessun badge | ⏳ Manuale |
| Flag ON: badge "1" su container NEXT ACTION | ⏳ Manuale |
| Tap START: se RPC OK → UI running + timer + fili | ⏳ Manuale |
| Tap START: se errore → toast visibile | ⏳ Manuale |
| Smoke: Home, Map, Buzz, Streak, Commit | ⏳ Manuale |

**Build:** ✅ OK  
**Cap sync iOS:** ✅ OK
