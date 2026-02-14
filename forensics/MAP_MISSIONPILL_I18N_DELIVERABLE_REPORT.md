# MAP PAGE i18n — MissionPill (HIDDEN MESSAGE) — DELIVERABLE REPORT

**Data:** 2026-02-14  
**Scope:** MissionPill modal "Hidden Message / Mission (Daily)" — ULTRA-SAFE (solo UI label)

---

## 1. ROLLBACK SNAPSHOT

**Tag creato:** `SNAPSHOT_PRE_MAP_I18N_MISSIONPILL_ULTRASAFE_20260214_051148`

**Comando rollback (pronto all'uso):**
```bash
git reset --hard SNAPSHOT_PRE_MAP_I18N_MISSIONPILL_ULTRASAFE_20260214_051148
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. FILE EFFETTIVAMENTE MODIFICATI

| File | Tipo |
|------|------|
| `src/missions/ui/MissionPill.tsx` | Component |
| `src/locales/it/common.json` | i18n |
| `src/locales/en/common.json` | i18n |
| `src/locales/fr/common.json` | i18n |

**Totale:** 1 componente + 3 file JSON.

**NON toccati:** RewardCounterPill, BattleShopPill, SearchLocationPill, BattleShop, FinalShootPill, BattleModal, M1ssionWarModal, DevNotesPanel, DevAreasPanel, MapTiler3D, store, hooks.

---

## 3. DIFF SUMMARY (PUNTUALE)

### MissionPill.tsx
- `import useTranslation` da `react-i18next`
- `const { t } = useTranslation()`
- Sostituzioni:
  - `aria-label="Daily Mission"` → `aria-label={t('mapPills.mission.ariaLabel')}`
  - `📍 PHASE 1 TODAY: +{phase1Reward} M1U` → `t('mapPills.mission.phase1Today', { reward: phase1Reward })`
  - `🔄 PHASE 2 TOMORROW: +{phase2Reward} M1U` → `t('mapPills.mission.phase2Tomorrow', { reward: phase2Reward })`
  - `START MISSION` → `t('mapPills.mission.startMission')`
  - `📍 PHASE 1 IN PROGRESS` → `t('mapPills.mission.phase1InProgress')`
  - `✓ COMPLETE PHASE 1 (+{phase1Reward} M1U)` → `t('mapPills.mission.completePhase1', { reward: phase1Reward })`
  - `PHASE 2 UNLOCKS TOMORROW` → `t('mapPills.mission.phase2UnlocksTomorrow')`
  - `Return to claim +{phase2Reward} M1U` → `t('mapPills.mission.returnToClaim', { reward: phase2Reward })`
  - `🔄 PHASE 2 READY!` → `t('mapPills.mission.phase2Ready')`
  - `🎉 COMPLETE PHASE 2 (+{phase2Reward} M1U)` → `t('mapPills.mission.completePhase2', { reward: phase2Reward })`
  - `Close` → `t('mapPills.mission.close')`
  - `✅ PHASE 1 COMPLETE!` / `🎉 MISSION ACCOMPLISHED!` → `t('mapPills.mission.phase1Complete')` / `t('mapPills.mission.missionAccomplished')`
  - `Return tomorrow for Phase 2!` → `t('mapPills.mission.returnTomorrowPhase2')`
- **Invariati:** `mission.title`, `mission.description`, `mission.phase1.instruction`, `mission.phase2.instruction` (contenuti da config)

### common.json (IT/EN/FR)
- Aggiunte 14 chiavi `mapPills.mission.*` con interpolazione `{{reward}}` dove richiesto

---

## 4. TASK 1 — VERIFY SCOPE (CONFERMATO)

- **File:** `src/missions/ui/MissionPill.tsx` ✓
- **createPortal:** non usato ✓
- **Input/keyboard:** nessuno ✓
- **mission.title/description/phase1.instruction/phase2.instruction:** NON tradotti (contenuto da missionsRegistry) ✓

---

## 5. BUILD & CAP SYNC

| Gate | Esito |
|------|-------|
| `npm run build` | ✅ PASS |
| `npx cap sync ios` | ✅ PASS |

---

## 6. QA iPHONE — CHECKLIST (OBBLIGATORIA)

Eseguire su iPhone fisico (iOS wrapped) **PRIMA** di qualsiasi fase successiva:

| # | Check | IT | EN | FR |
|---|-------|----|----|-----|
| 1 | MAP → apri "Hidden Message / Mission (Daily)" | ⬜ | ⬜ | ⬜ |
| 2 | Titolo missione (da config, invariato) | ⬜ | ⬜ | ⬜ |
| 3 | Pulsante "Start Mission" tradotto | ⬜ | ⬜ | ⬜ |
| 4 | Link "Close" tradotto | ⬜ | ⬜ | ⬜ |
| 5 | Righe "PHASE 1 TODAY" / "PHASE 2 TOMORROW" tradotte | ⬜ | ⬜ | ⬜ |
| 6 | Stati "PHASE 1 IN PROGRESS", "PHASE 2 UNLOCKS TOMORROW", "PHASE 2 READY!" tradotti | ⬜ | ⬜ | ⬜ |
| 7 | Nessun glitch UI, crash, cambio layout | ⬜ | - | - |

**Cambio lingua:** usare meccanismo già presente in app (Settings/Lingua) o lingua di sistema iOS.

**Se anche un solo punto fallisce → rollback immediato con comando sopra e STOP.**

---

## 7. CHIAVI i18n AGGIUNTE

```
mapPills.mission.ariaLabel
mapPills.mission.startMission
mapPills.mission.close
mapPills.mission.phase1Today          (+ {{reward}})
mapPills.mission.phase2Tomorrow       (+ {{reward}})
mapPills.mission.phase1InProgress
mapPills.mission.completePhase1       (+ {{reward}})
mapPills.mission.phase2UnlocksTomorrow
mapPills.mission.returnToClaim        (+ {{reward}})
mapPills.mission.phase2Ready
mapPills.mission.completePhase2       (+ {{reward}})
mapPills.mission.phase1Complete
mapPills.mission.missionAccomplished
mapPills.mission.returnTomorrowPhase2
```

---

FINE REPORT.
