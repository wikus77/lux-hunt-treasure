# VERA MISSION BOMB — Phase 1 Discovery Report

## Phase 0 — Rollback

- **git status:** Working tree NON pulito (modified: StreakModal, ios/*, untracked forensics)
- **Tag esistente SNAPSHOT_PRE_VERA_MISSION_BOMB:** Nessuno prima dell'esecuzione
- **Tag creato:** `SNAPSHOT_PRE_VERA_MISSION_BOMB_20260215-074641`
- **HEAD:** ae01cd79 (fix/streak-modal-note-style-rollback)

**Rollback plan:**
```bash
git checkout SNAPSHOT_PRE_VERA_MISSION_BOMB_20260215-074641
```

---

## Phase 1A — Discovery

### Note-style modal pattern

- **Componente EXACT:** Non esiste "NoteModal" o "NotesModal". Il pattern "NOTE-style" è usato in:
  - `src/components/ui/LongPressInfoModal.tsx` — usa MapPillFlipOverlay
  - `src/components/gamification/StreakModal.tsx` — usa MapPillFlipOverlay
  - `src/pages/sandbox/map3d/components/DevNotesPanel.tsx` — usa MapPillFlipOverlay

- **Wrapper base:** `src/components/map/MapPillFlipOverlay.tsx`
  - Props: `open`, `originRect`, `onClose`, `children`
  - Backdrop: rgba(10,10,15,0.98), blur, click to close
  - Panel: scale animation from origin, gradient background

- **Pattern close:** X button in header + backdrop onClick → `handleClose` → `onClose()`

- **iOS safe-area:** `paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)'`

### Haptics

- **Path:** `src/utils/haptics.ts`
- **Funzioni:** `hapticLight`, `hapticSuccess`, `hapticError`, `hapticWarning`, `hapticSync(type)`
- **Pattern:** `hapticSync('warning')`, `hapticSync('success')`, `hapticSync('error')`

### useAwardPE / pe:awarded

- **Path:** `src/features/pulse/hooks/useAwardPE.ts`
- **awardPE(action, customAmount?, metadata?)** — per delta custom usare `'CUSTOM'` con `customAmount`
- **pe:awarded:** dispatch in useAwardPE riga 224 con `detail: { ...awardResult, action }`
- **PulseBarPersonal** ascolta `pe:awarded` e refetch

**NOTA:** Per Vera Mission Bomba useremo RPC `finalize_vera_mission_run` che internamente chiama `award_pulse_energy`. L'evento `pe:awarded` viene emesso da useAwardPE. Dato che il reward arriva dall'RPC (non da useAwardPE direttamente), dobbiamo emettere manualmente `pe:awarded` dopo aver ricevuto old_pe/new_pe/delta_pe dall'RPC, per far aggiornare PulseBarPersonal. Verificare se l'RPC finalize ritorna già questi valori.
