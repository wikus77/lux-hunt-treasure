# VERA MISSION BOMB — Phase 1 QA Report

## Rollback Instructions

```bash
git checkout SNAPSHOT_PRE_VERA_MISSION_BOMB_20260215-074641
```

---

## File Inventory

### Created

| Path | Ruolo |
|------|-------|
| `supabase/migrations/20260215_vera_mission_bomb.sql` | Tabelle + RPC + RLS |
| `src/features/vera-missions/bomb/bombMissionTypes.ts` | Config wire, timer |
| `src/features/vera-missions/bomb/useBombMissionRun.ts` | Hook RPC start/finalize |
| `src/features/vera-missions/bomb/BombMissionModal.tsx` | Modal UI (MapPillFlipOverlay) |
| `src/features/vera-missions/bomb/index.ts` | Barrel export |
| `forensics/VERA_MISSION_BOMB_PHASE1_DISCOVERY_REPORT.md` | Discovery |
| `forensics/VERA_MISSION_BOMB_PHASE1_QA_REPORT.md` | Questo report |

### Modified

| Path | Modifica |
|------|----------|
| `src/config/featureFlags.ts` | Aggiunto VERA_MISSION_BOMB_ENABLED |
| `src/components/command-center/CommandCenterHome.tsx` | Entrypoint + BombMissionModal |
| `src/locales/it/common.json` | Chiavi vera_mission.bomb.* |
| `src/locales/en/common.json` | Chiavi vera_mission.bomb.* |
| `src/locales/fr/common.json` | Chiavi vera_mission.bomb.* |

### Non toccati (conferma scope)

- MapTiler3D, RewardsLayer3D, AreasLayer3D, handleClick, claim-marker-reward
- Buzz flow (useBuzzHandler, BuzzMapButtonSecure)
- StreakModal, missionState, missionsRegistry, creditM1USafe
- NextActionContainer, routing, layout root, header, bottom nav

---

## Come attivare il flag per test

**Opzione 1 — localStorage (senza rebuild):**
```javascript
localStorage.setItem('m1_vera_mission_bomb_enabled', 'true');
// Ricarica la pagina
```

**Opzione 2 — env (richiede rebuild):**
```bash
VITE_VERA_MISSION_BOMB_ENABLED=true pnpm run build
```

Dopo l'attivazione, su Home (Command Center) apparirà il pulsante **VERA BOMB** in basso a sinistra.

---

## Anti-cheat verificato (da testare su device)

- **Doppio tap finalize:** RPC `finalize_vera_mission_run` marca run come completed/failed; se già finalizzata ritorna `already_finalized: true` senza ri-award.
- **Refresh:** Run già completata per day_key; start_vera_mission_run ritorna run esistente con status; non si può ri-finalizzare.
- **day_key:** Calcolato server-side UTC (`TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD')`).

---

## Run success / fail (log attesi)

**Successo:**
- RPC finalize ritorna `{ success: true, delta_pe: 25, old_pe: X, new_pe: X+25, run_status: 'completed' }`
- Evento `pe:awarded` con detail `{ success: true, deltaPE: 25 }`
- UI: "Disinnescata!" + "+25 PE"

**Fallimento (filo sbagliato o timeout):**
- RPC finalize ritorna `{ success: true, delta_pe: -15, old_pe: X, new_pe: X-15, run_status: 'failed' }`
- Evento `pe:awarded` con detail `{ success: true, deltaPE: -15 }`
- UI: "Esplosione" + "-15 PE"

---

## Build

- `pnpm run build` — OK (exit 0)

---

## Smoke test checklist (manuale)

- [ ] Home carica
- [ ] Map (pan/zoom + markers)
- [ ] Buzz
- [ ] Commit
- [ ] Streak
- [ ] Con flag ON: pulsante VERA BOMB visibile
- [ ] Apertura modal, start, cut wire corretto → successo + PE
- [ ] Apertura modal, start, cut wire sbagliato → fail + PE-
- [ ] Doppio claim non possibile (seconda run stesso giorno = stessa run)
