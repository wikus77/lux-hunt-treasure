# MAP PAGE i18n PHASE 1 — DELIVERABLE REPORT

**Date:** 2026-02-14  
**Scope:** LOW-RISK ONLY (RewardCounterPill, BattleShopPill, SearchLocationPill)

---

## 1. ROLLBACK SNAPSHOT

**Tag creato:** `SNAPSHOT_PRE_MAP_I18N_PHASE1_LOWRISK_20260214_045336`

**Rollback command (pronto all’uso):**
```bash
git reset --hard SNAPSHOT_PRE_MAP_I18N_PHASE1_LOWRISK_20260214_045336
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. FILE MODIFICATI

| File | Tipo |
|------|------|
| `src/components/map/RewardCounterPill.tsx` | Component |
| `src/components/battle/BattleShopPill.tsx` | Component |
| `src/components/map/SearchLocationPill.tsx` | Component |
| `src/locales/it/common.json` | i18n |
| `src/locales/en/common.json` | (chiavi già presenti) |
| `src/locales/fr/common.json` | (chiavi già presenti) |

**Totale:** 3 componenti + 3 file JSON (IT aggiornato con traduzioni arsenale)

---

## 3. DIFF SUMMARY

### RewardCounterPill.tsx
- `import useTranslation` da `react-i18next`
- `const { t } = useTranslation()`
- Sostituiti: `aria-label`, title, subtitle, availableLabel, total, claimed, available, hint`
- Hint: frase completa via `t('mapPills.rewards.hint')` (senza split per "verdi")

### BattleShopPill.tsx
- `import useTranslation` da `react-i18next`
- `const { t } = useTranslation()`
- Sostituiti: `aria-label`, title, subtitle, tabShop, tabInventory (con `{ count: totalItems }`), emptyTitle, emptyHint, weapons, defenses, equipped (2 occorrenze)

### SearchLocationPill.tsx
- `import useTranslation` da `react-i18next`
- `const { t } = useTranslation()`
- `setError(t('mapPills.search.placeNotFound'))`, `setError(t('mapPills.search.searchError'))`
- `placeholder={t('mapPills.search.placeholder')}`

### common.json (IT)
- `mapPills.arsenal.*` aggiornati con traduzioni IT (Arsenale, Inventario, Armi, Difese, ecc.)

---

## 4. BUILD & CAP SYNC

| Gate | Esito |
|------|-------|
| `npm run build` | ✅ PASS |
| `npx cap sync ios` | ✅ PASS |

---

## 5. QA iPHONE — CHECKLIST (MANUALE)

Eseguire su iPhone fisico (iOS wrapped) e verificare:

| # | Check | IT | EN | FR |
|---|-------|----|----|-----|
| 1 | MAP → REWARDS: title/subtitle/stats/hint tradotti | ⬜ | ⬜ | ⬜ |
| 2 | MAP → ARSENAL: title/subtitle/tab labels/empty state | ⬜ | ⬜ | ⬜ |
| 3 | MAP → Search: errore "place not found" / "search error" tradotti | ⬜ | ⬜ | ⬜ |
| 4 | Nessun crash, overlay integro | ⬜ | - | - |
| 5 | Layout invariato | ⬜ | - | - |

**Come cambiare lingua:** usa il meccanismo già presente in app (Settings/Lingua) o lingua di sistema iOS se collegata.

Se anche un solo check fallisce → **rollback immediato**.

---

## 6. CHIAVI i18n UTILIZZATE

- `mapPills.rewards.title` / `subtitle` / `available` / `total` / `claimed` / `availableLabel` / `hint` / `ariaLabel`
- `mapPills.arsenal.title` / `subtitle` / `tabShop` / `tabInventory` / `emptyTitle` / `emptyHint` / `weapons` / `defenses` / `equipped` / `ariaLabel`
- `mapPills.search.placeNotFound` / `searchError` / `placeholder`

---

## STOP CONDITIONS — NESSUNA ATTIVATA

- Nessun file fuori scope toccato
- Nessun rischio portal/keyboard/scroll-lock
- Build e cap sync OK
- QA iPhone: da completare manualmente
