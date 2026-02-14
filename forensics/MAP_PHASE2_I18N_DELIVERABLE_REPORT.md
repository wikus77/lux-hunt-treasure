# MAP PAGE i18n PHASE 2 — DELIVERABLE REPORT

**Data:** 2026-02-14  
**Scope:** FINAL SHOT / NOTE / PUNTI E AREE / MISSION WAR modals (iOS EN fix)

---

## 1. ROLLBACK SNAPSHOT

**Tag creato:** `SNAPSHOT_PRE_MAP_I18N_PHASE2_MODALS_20260214_052456`

**Comando rollback (pronto all'uso):**
```bash
git reset --hard SNAPSHOT_PRE_MAP_I18N_PHASE2_MODALS_20260214_052456
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. FILE EFFETTIVAMENTE MODIFICATI

| File | Tipo |
|------|------|
| `src/components/final-shoot/FinalShootPill.tsx` | Component |
| `src/pages/sandbox/map3d/components/DevNotesPanel.tsx` | Component |
| `src/pages/sandbox/map3d/components/DevAreasPanel.tsx` | Component |
| `src/components/domination/M1ssionWarModal.tsx` | Component |
| `src/locales/it/common.json` | i18n |
| `src/locales/en/common.json` | i18n |
| `src/locales/fr/common.json` | i18n |

**Totale:** 4 componenti + 3 file JSON.

---

## 3. DIFF SUMMARY

### FinalShootPill.tsx (solo info modal, non video)
- `useTranslation` + `t('mapPills.finalShot.*')`
- Sostituiti: subtitle, whatIs, whatIsDesc, howItWorks, bullet1/2/3, attemptsAvailable, free/plus/elite/totalMax, freeValue/plusValue/eliteValue/totalValue, activatesIn, days, missionDays, gotIt

### DevNotesPanel.tsx
- `useTranslation` + `t('mapPills.notes.*')`
- Sostituiti: title, subtitle, placeholder, addNote, saving, empty, loginRequired, loading, toastLoadError, toastAddSuccess, toastAddError, pillLabel

### DevAreasPanel.tsx
- `useTranslation` + `t('mapPills.areas.*')`
- Sostituiti: title, subtitle, tabAreas, tabPoints, newArea, empty, pillLabel

### M1ssionWarModal.tsx
- `useTranslation` + `t('mapPills.missionWar.*')`
- Sostituiti: title, subtitle, conquered, contested, wins, continents, tabConquests, tabBattles, tabLeaderboard

---

## 4. BUILD & CAP SYNC

| Gate | Esito |
|------|-------|
| `npm run build` | ✅ PASS |
| `npx cap sync ios` | ✅ PASS |

---

## 5. CHIAVI i18n AGGIUNTE

### mapPills.finalShot.*
- subtitle, whatIs, whatIsDesc, howItWorks, bullet1, bullet2, bullet3
- attemptsAvailable, free, plus, elite, totalMax
- freeValue, plusValue, eliteValue, totalValue
- activatesIn, days, missionDays, gotIt

### mapPills.notes.*
- title, subtitle, placeholder, addNote, saving, empty, loginRequired, loading
- toastLoadError, toastAddSuccess, toastAddError, pillLabel

### mapPills.areas.*
- title, subtitle, tabAreas, tabPoints, newArea, empty, pillLabel

### mapPills.missionWar.*
- title, subtitle, conquered, contested, wins, continents
- tabConquests, tabBattles, tabLeaderboard

---

## 6. QA iPHONE — CHECKLIST (OBBLIGATORIA)

**Setup:** lingua iOS = EN

| # | Check | Esito |
|---|-------|-------|
| 1 | MAP → FINAL SHOT info modal: title, sezioni, bottone in EN | ⬜ |
| 2 | MAP → NOTE: title, subtitle, placeholder, CTA, empty in EN | ⬜ |
| 3 | MAP → PUNTI E AREE: title, subtitle, tab, CTA, empty in EN | ⬜ |
| 4 | MAP → MISSION WAR: header, subtitle, stats, tabs in EN | ⬜ |

**Se uno fallisce → rollback immediato con comando sopra.**

---

FINE REPORT.
