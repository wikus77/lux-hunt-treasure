# VERA BOMB CUT WIRES — Verification Report

**Date:** 2026-02-16  
**Scope:** fix/vera-bomb-cutwires-polish  
**Status:** VERIFICATION COMPLETE

---

## 1) FILE COINVOLTI

| File | Ruolo |
|------|-------|
| `src/features/vera-missions/bomb/BombMissionModal.tsx` | Modal principale: briefing, playing, success, fail |
| `src/features/vera-missions/bomb/useBombMissionRun.ts` | Hook RPC: startRun, finalizeRun |
| `src/features/vera-missions/bomb/ui/BombDeviceVisual.tsx` | Visual bomba SVG (armed/disarmed/exploded) |
| `src/features/vera-missions/bomb/ui/bomb-visual.css` | Animazioni CSS bomba |
| `src/features/vera-missions/bomb/bombMissionTypes.ts` | BOMB_TIMER_MS, wire config |
| `src/components/feedback/NextActionContainer.tsx` | Container Next Action, badge BOMBA, BombMissionModal |
| `src/components/feedback/NextActionContent.tsx` | Overlay contenuto, entry VERA BOMB card |
| `src/utils/haptics.ts` | hapticWarning, hapticSuccess, hapticError, hapticLight, etc. |
| `src/config/featureFlags.ts` | isVeraBombEnabled() |

---

## 2) FLUSSO ATTUALE

1. **Tap Next Action** → NextActionFlipOverlay apre NextActionContent
2. **Tap card VERA BOMB** → `onOpenVeraBomb()` → BombMissionModal open
3. **Briefing** → tap "AVVIA MISSIONE" → `handleStart()` → `startRun()` RPC
4. **RPC start_vera_mission_run** → ritorna `{ run_id, day_key, status, attempts_left }`
5. **Playing** → timer 30s, BombDeviceVisual, 3 bottoni Cut wire
6. **Taglio filo / timeout** → `handleWireCut(i)` o `handleFail()` → `finalizeRun()` RPC
7. **RPC finalize_vera_mission_run** → delta PE, status completed/failed
8. **Success / Fail** → UI con deltaPe, emoji ✅/💥

---

## 3) BACKEND SUPABASE — STATO REALE

### Tabelle
- **vera_mission_runs** — definita in `20260216120000_vera_mission_runs_tables.sql`
- **vera_mission_attempts** — definita stessa migration
- RLS: Users can read/insert own runs; no update/delete

### RPC

**start_vera_mission_run(p_mission_id TEXT)** (`20260216061900_repair_vera_mission_rpc.sql`):
- Se esiste run oggi (user + mission + day_key): **ritorna la run esistente** (anche se completed/failed)
- NON blocca "already played" — ritorna run_id e status
- Client attualmente **non controlla status**: procede sempre con runId

**finalize_vera_mission_run(p_run_id, p_outcome, p_elapsed_ms, p_payload)**:
- Se run già completed/failed: ritorna `already_finalized: true`, `delta_pe: 0`
- Altrimenti: award_pulse_energy, update run, insert attempt

### Problema 1/day
- Server **non blocca** all'avvio se già completato
- Client deve controllare `status` nella risposta di startRun
- Se `status === 'completed' || status === 'failed'` → mostrare "Già completata oggi"
- Badge "DONE": serve query per sapere se user ha completato oggi (SELECT vera_mission_runs WHERE status IN ('completed','failed') AND day_key = today)

---

## 4) CHIAMATE SUPABASE NEL CODICE

```ts
// useBombMissionRun.ts:69
await supabase.rpc('start_vera_mission_run', { p_mission_id: 'bomb' });

// useBombMissionRun.ts:110
await supabase.rpc('finalize_vera_mission_run', {
  p_run_id: runId,
  p_outcome: outcome,
  p_elapsed_ms: Math.min(elapsedMs, 60_000),
  p_payload: payload ?? {},
});
```

Nessuna query diretta a `vera_mission_runs` nel client attuale.

---

## 5) COSA MANCA (per acceptance)

| Obiettivo | Stato | Fix |
|-----------|-------|-----|
| 1/day enforcement | ❌ | Client: check status in startRun; se completed/failed → blocco UI |
| Badge "DONE" quando completato | ❌ | Query `vera_mission_runs` per status completed/failed today |
| Bomba + micro-shake / tension | ⚠️ Parziale | BombDeviceVisual ha breathing/urgent; aggiungere shake |
| Timer progress bar color shift | ❌ | Aggiungere barra con verde→giallo→rosso |
| Wire buttons feedback + disable | ⚠️ Parziale | whileTap esiste; disabilitare dopo scelta |
| Haptics: tick countdown, impact, success/error | ⚠️ Parziale | Success/error già; aggiungere tick (ultimi 5–10s), impact su taglio |
| Pulse Bar finale | ❌ | Nuovo componente PulseBarOverlay con delta PE |
| CTA CONTINUA | ❌ | Aggiungere bottone "CONTINUA" dopo result |

---

## 6) PIANO PATCH MINIMO

1. **STEP A** — 1/day: startRun check status; fase "already_played"; query per badge
2. **STEP B** — Visual: micro-shake CSS; timer progress bar; wire disable + ripple
3. **STEP C** — Haptics: tick ultimi 5s; impact su wire cut (già success/error su esito)
4. **STEP D** — PulseBarOverlay: barra delta PE + CTA CONTINUA
5. **STEP E** — Badge: "VERA BOMB" quando available; "DONE" quando completed today

---

© 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
