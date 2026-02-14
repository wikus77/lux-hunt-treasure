# INCIDENT REPORT — MAP PAGE: PILL → MODALS i18n (VERIFY ONLY)

**Date:** 2026-02-14  
**Context:** Modali aperti dai Pill nella pagina MAP (MapTiler3D)  
**Tag snapshot:** `SNAPSHOT_PRE_MAP_PILLS_MODALS_I18N_20260214_044541`  
**Vincoli:** NO BUZZ flow, NO map logic, NO edge functions, NO DB schema, NO routing

---

## TASK 0 — SNAPSHOT / ROLLBACK

### Esecuzione
- `git add -A` + `git commit -m "chore(snapshot): pre map pills modals i18n"` — ✅ Eseguito
- `git tag SNAPSHOT_PRE_MAP_PILLS_MODALS_I18N_20260214_044541` — ✅ Creato
- `git push --tags` — ❌ Fallito (Device not configured per GitHub auth)

### Comando rollback (pronto all’uso)
```bash
git reset --hard SNAPSHOT_PRE_MAP_PILLS_MODALS_I18N_20260214_044541
git clean -fd
npm run build
npx cap sync ios
```

---

## TASK 1 — MAPPA PILL → MODAL

### Pagina MAP
- **Route:** `/map-3d-tiler` (o equivalente da routing)
- **File:** `src/pages/sandbox/MapTiler3D.tsx`
- **Pills:** renderizzati in posizioni fixed, ordinati da top a bottom

### Tabella Pill → Modal

| Pill | Componente Pill | Handler apertura | Modal / Overlay | File modal |
|------|-----------------|------------------|-----------------|------------|
| **FINAL SHOT** | FinalShootPill | `handleClick` → `setShowInfoModal` / `setShowVideoModal` / `activateFinalShoot` | Info modal + Video modal (inline, createPortal) | FinalShootPill.tsx (inline) |
| **REWARDS** | RewardCounterPill | `handlePillClick` → `setIsOpen(true)` | MapPillFlipOverlay + contenuto inline | RewardCounterPill.tsx |
| **ARSENAL** | BattleShopPill | `onClick` → `setIsOpen(true)` | AnimatePresence + modal inline | BattleShopPill.tsx |
| **TRON BATTLE** | BattlePill | `onClick` → `setIsModalOpen(true)` | BattleModal (createPortal) | BattleModal.tsx |
| **MISSION WAR** | M1ssionWarPill | `onClick` → `setIsModalOpen(true)` | M1ssionWarModal (createPortal) | M1ssionWarModal.tsx |
| **NOTE** | DevNotesPanel | click → `setOpen(true)` | MapPillFlipOverlay | DevNotesPanel.tsx |
| **PUNTI E AREE** | DevAreasPanel | click → `setOpen(true)` | MapPillFlipOverlay | DevAreasPanel.tsx |
| **Mission (Daily)** | MissionPill | `onClick` → `setShowModal(true)` | AnimatePresence inline | MissionPill.tsx |
| **Search** | SearchLocationPill | `toggleExpanded` | Inline expand (nessun modal) | SearchLocationPill.tsx |

### Pill NON presenti sulla MAP
- **HIDDEN MESSAGE:** non è un Pill; è un tipo di missione in `missionsRegistry.ts`. Nessun modal dedicato sulla MAP.

### Sub-modali / overlay
- **FinalShootPill:** Info modal (locked) + Video modal (bottom sheet)
- **BattleModal:** usa BattleCreationForm, BattleShop, BattleMount
- **M1ssionWarModal:** tab Progress, History, Leaderboard (LeaderboardTab)
- **BattleShopPill:** modal con tab Shop e Inventory; Inventory usa BattleShop (stesso componente)

---

## TASK 2 — I18N GAP (SOLO UI COPY)

### 2.1 FinalShootPill.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 38-41 | tentativi, Limite raggiunto, gratuiti, M1U, M1U (Elite) | getNextAttemptLabel |
| 45-48 | PLUS, ELITE | getTierBadge |
| 250 | FINAL SHOT | Header pill |
| 260 | ATTIVA FINAL SHOT → | CTA video |
| 330 | ATTIVA FINAL SHOT → | Bottone skip |
| 392 | FINAL SHOT | Header info modal |
| 259 | Tocca per l'audio | Video hint |
| 260 | Briefing: La tua ultima possibilità di vincere | Video subtitle |
| 344 | Non mostrare più questo video | Link dismiss |
| 397 | FINAL SHOT | Info header |
| 399 | La Mossa Finale | Info subtitle |
| 417 | Cos'è Final Shot? | Info section |
| 418-419 | È la tua ultima possibilità... | Info body |
| 428 | Come Funziona | Info section |
| 434-441 | Attiva Final Shot... / Tocca sulla mappa... / Ricevi feedback... | Lista |
| 449 | Tentativi Disponibili | Pricing section |
| 455-458 | Gratuiti, Plus, Elite, tentativi | Tier labels |

**useTranslation:** ❌ assente

### 2.2 RewardCounterPill.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 124 | Marker Rewards disponibili | aria-label |
| 165 | REWARDS | Header |
| 170 | Premi disponibili sulla mappa | Subtitle |
| 202 | disponibili | Stat label |
| 209 | Totali | Stat |
| 215 | Riscattati | Stat |
| 221 | Disponibili | Stat |
| 227 | Trova i marker verdi sulla mappa... | Info card |

**useTranslation:** ❌ assente

### 2.3 BattleShopPill.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 77 | Open Battle Shop | aria-label |
| 139 | Arsenal | Header |
| 141 | Shop & Inventory | Subtitle |
| 162 | Shop | Tab |
| 166 | Inventory ({{count}}) | Tab |
| 188 | No items in inventory | Empty state |
| 189 | Purchase items from the Shop! | Empty hint |
| 201 | Weapons | Section |
| 244 | Equipped | Badge |
| 246 | Defenses | Section |

**useTranslation:** ❌ assente

### 2.4 BattleModal.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 105 | TRON Battle | Header |
| 106 | Manage your battles | Subtitle |

**useTranslation:** ❌ assente. Tab labels e contenuti sono in BattleCreationForm, BattleMount.

### 2.5 BattleShop.tsx (usato in BattleShopPill e BattleModal)
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 66 | Failed to load shop | Toast |
| 101 | Insufficient M1U | Toast |
| 102 | You need X M1U but only have Y M1U | Toast |

**useTranslation:** ❌ assente

### 2.6 M1ssionWarModal.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| ~220+ | Progress, History, Leaderboard | Tab |
| Varie | Domination stats, country names, ecc. | Contenuti (molti da COUNTRY_NAMES / CONTINENT_NAMES) |

**useTranslation:** ❌ assente. Molte stringhe, inclusi tab e label UI.

### 2.7 DevNotesPanel.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 60 | Errore nel caricare le note | Toast |
| 99 | Nota aggiunta | Toast |
| 104 | Errore nell'aggiungere la nota | Toast |
| Varie | NOTE, Aggiungi nota, placeholder, empty state | Header, CTA, placeholder |

**useTranslation:** ❌ assente

### 2.8 DevAreasPanel.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 506 | PUNTI E AREE | Header |
| 510 | Gestisci i tuoi punti di interesse | Subtitle |
| 516 | Aree (n) | Tab |
| 519 | Punti (n) | Tab |
| 536 | Seleziona dimensione area | Radius picker |
| 541-542 | Raggio, Diametro | Mode |
| 557 | Custom | Opzione |
| 559 | Diametro in metri / Raggio in metri | Placeholder |
| 563 | Min: 50m • Es: 5000m = 5km | Hint |
| 567-568 | Annulla, Conferma | Bottoni |
| 577 | Nuova area di ricerca | CTA |
| 582 | Nessuna area. Clicca "Nuova"... | Empty |
| 541 | Area di ricerca | Label default |
| 596 | Focus | Bottone |
| 623 | Aggiungi punto sulla mappa | CTA |
| 627 | Accedi per salvare i tuoi punti | Empty |
| 631 | Caricamento... | Loading |
| 633 | Nessun punto salvato... | Empty |
| 639 | Titolo del punto, Note sul punto... | Placeholder |
| 641-644 | Salva, Annulla | Bottoni |
| 601 | Focus, Modifica | Bottoni |
| 633 | Punto senza titolo | Fallback |
| 665 | Tocca sulla mappa per piazzare il punto | Indicator |
| 693 | Tocca sulla mappa per posizionare l'area | Indicator |

**useTranslation:** ❌ assente

### 2.9 MissionPill.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 129 | mission.title | Da missionsRegistry (config) |
| 218 | mission.description | Da missionsRegistry (config) |
| 223-224 | PHASE 1 TODAY, PHASE 2 TOMORROW | Rewards hint |
| 248 | START MISSION | CTA |
| 260 | PHASE 1 IN PROGRESS | Status |
| 261 | mission.phase1.instruction | Da config |
| 277 | COMPLETE PHASE 1 (+X M1U) | CTA |
| 295 | PHASE 2 UNLOCKS TOMORROW | Status |
| 298 | Return to claim +X M1U | Hint |
| 309 | PHASE 2 READY! | Status |
| 310 | mission.phase2.instruction | Da config |
| 324 | COMPLETE PHASE 2 (+X M1U) | CTA |
| 331 | Close | Link |
| 358-364 | PHASE 1 COMPLETE!, MISSION ACCOMPLISHED!, Return tomorrow... | Toast completion |

**useTranslation:** ❌ assente. `mission.title`, `mission.description`, `mission.phase1/2.instruction` sono config — NON tradurre come contenuto dinamico; solo label UI (START MISSION, Close, ecc.).

### 2.10 SearchLocationPill.tsx
| Linea | Stringa | Contesto |
|-------|---------|----------|
| 62 | Luogo non trovato | Errore |
| 66 | Errore di ricerca | Errore |

**useTranslation:** ❌ assente. Non è un modal, ma pill espandibile.

### File toccabili (solo modali)
1. `src/components/final-shoot/FinalShootPill.tsx`
2. `src/components/map/RewardCounterPill.tsx`
3. `src/components/battle/BattleShopPill.tsx`
4. `src/components/battle/BattleModal.tsx`
5. `src/components/battle/BattleShop.tsx`
6. `src/components/domination/M1ssionWarModal.tsx`
7. `src/pages/sandbox/map3d/components/DevNotesPanel.tsx`
8. `src/pages/sandbox/map3d/components/DevAreasPanel.tsx`
9. `src/missions/ui/MissionPill.tsx`
10. `src/components/map/SearchLocationPill.tsx` (pill espandibile, non modal)

### Chiavi i18n da aggiungere (stima)
- ~25 FinalShootPill
- ~10 RewardCounterPill
- ~15 BattleShopPill + BattleShop
- ~5 BattleModal
- ~30+ M1ssionWarModal
- ~15 DevNotesPanel
- ~35 DevAreasPanel
- ~15 MissionPill (solo UI)
- ~2 SearchLocationPill

**Totale stimato:** ~150+ chiavi.

### Rischio per modal

| Modal | Portal | Scroll lock | Keyboard | Safe-area | Rischio |
|-------|--------|-------------|----------|-----------|---------|
| FinalShootPill (info+video) | createPortal | Sì (video) | No | Sì | **Med-High** |
| RewardCounterPill | MapPillFlipOverlay | Sì | No | Sì | **Low** |
| BattleShopPill | AnimatePresence | Implicito | No | Sì | **Low** |
| BattleModal | createPortal | Sì | No | Sì | **Medium** |
| M1ssionWarModal | createPortal | Sì | No | Sì | **High** |
| DevNotesPanel | MapPillFlipOverlay | Sì | Sì (input) | Sì | **Medium** |
| DevAreasPanel | MapPillFlipOverlay | Sì | Sì (input) | Sì | **High** |
| MissionPill | AnimatePresence | Implicito | No | Sì | **Medium** |
| SearchLocationPill | Inline | No | Sì (input) | No | **Low** |

---

## TASK 3 — PATCH: DECISIONE

### Verdetto: **SOLO VERIFY — PATCH NON CONSIGLIATA**

**Motivazioni:**
1. **Perimetro ampio:** 10 file, ~150+ chiavi i18n, molti modali complessi.
2. **Componenti condivisi:** BattleShop usato in BattleShopPill e BattleModal; modifiche possono avere side effects non banali.
3. **createPortal / scroll lock:** FinalShootPill, BattleModal, M1ssionWarModal usano createPortal; cambi anche minimi possono alterare z-index/scroll/safe-area.
4. **Input e keyboard:** DevNotesPanel, DevAreasPanel, SearchLocationPill hanno input; DevAreasPanel ha custom radius, placeholder, validazione.
5. **Mission config:** MissionPill mescola UI labels e mission.title/description/instruction da `missionsRegistry`; separare in modo sicuro richiede analisi aggiuntiva.
6. **Rischio side effect:** M1ssionWarModal ha LeaderboardTab e logica dominio; DevAreasPanel gestisce aree e punti con callbacks verso MapTiler3D.

### Raccomandazione
Eseguire patch solo in fasi mirate:
1. **Fase 1 (Low risk):** RewardCounterPill, BattleShopPill (solo modal, non BattleShop), SearchLocationPill.
2. **Fase 2:** FinalShootPill (solo info modal, senza video).
3. **Fase 3:** BattleModal, BattleShop, DevNotesPanel.
4. **Fase 4:** M1ssionWarModal, DevAreasPanel, MissionPill (solo label UI).

Ogni fase andrebbe validata con build + iOS sync + QA manuale prima della successiva.

---

## TASK 4 — QA CHECKLIST (da eseguire manualmente)

Quando si applicherà una patch:
1. Aprire MAP → tap su ogni Pill → verifica apertura/chiusura modal.
2. Safe-area: notch e home indicator senza overlap.
3. Scroll: nessuno scroll indesiderato quando il modal blocca lo sfondo.
4. Keyboard: NOTE / input in DevAreasPanel e SearchLocationPill.
5. Nessun conflitto overlay con Bottom Nav.
6. Nessun crash o warning runtime.

---

## OUTPUT FINALE

### Report VERIFY
Completato in questo documento.

### File da modificare (in caso di patch futura)
Solo modali pill + `common.json` (it/en/fr):
- FinalShootPill.tsx
- RewardCounterPill.tsx
- BattleShopPill.tsx
- BattleModal.tsx
- BattleShop.tsx
- M1ssionWarModal.tsx
- DevNotesPanel.tsx
- DevAreasPanel.tsx
- MissionPill.tsx
- SearchLocationPill.tsx
- src/locales/{it,en,fr}/common.json

### Diff summary
Nessuna patch applicata.

### Comando rollback
```bash
git reset --hard SNAPSHOT_PRE_MAP_PILLS_MODALS_I18N_20260214_044541
git clean -fd
npm run build
npx cap sync ios
```

---

**Fine report — VERIFY ONLY, no patch applied**
