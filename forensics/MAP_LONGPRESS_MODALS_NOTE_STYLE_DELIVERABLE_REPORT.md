# MAP Long Press Modals — NOTE-Style Unification — Deliverable Report

**Data:** 14 Feb 2026  
**Branch:** fix/i18n-global-ultra-safe  
**Incident:** MAP PAGE — Long Press Modals (Design + I18N) — NOTE-style unification (iOS safe)

---

## 1. Snapshot & Rollback

### Tag Snapshot
```
SNAPSHOT_PRE_LONGPRESS_MODALS_NOTE_STYLE_20260214_060912
```

### Commit Snapshot
```
chore(snapshot): pre longpress modals redesign + i18n
```

### Comando Rollback (se qualcosa va storto)
```bash
git reset --hard SNAPSHOT_PRE_LONGPRESS_MODALS_NOTE_STYLE_20260214_060912
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. Riepilogo Modifiche

### Obiettivi Raggiunti
- ✅ Long press resta il trigger (nessun cambio gestuale)
- ✅ Tutti i modali long press allineati al modale NOTE (animazione, layout, overlay, blur, typography)
- ✅ Leggibilità migliorata (contrasto, gerarchia, testi su sfondo chiaro)
- ✅ i18n completo per i modali long press (chiavi `mapLongPress.*`)
- ✅ M1SSION PRIZE: categorie generiche, nessun brand (Ferrari, Rolex, Porsche, Chanel, ecc. rimossi)

---

## 3. File Modificati

| File | Modifiche |
|------|-----------|
| `src/components/ui/LongPressInfoModal.tsx` | Riscritto: usa `MapPillFlipOverlay`, layout NOTE-style, prop `originRect`, i18n |
| `src/components/command-center/home-sections/PrizeVision.tsx` | Ref + `originRect`, contenuto M1SSION PRIZE ridisegnato (no brand), i18n `mapLongPress.prize.*` |
| `src/components/command-center/home-sections/AgentDiary.tsx` | Ref + `infoModalOriginRect` per long press info modal |
| `src/components/command-center/home-sections/ActiveMissionBox.tsx` | Ref + `timeLongPressOriginRect` per TEMPO RIMASTO long press |
| `src/locales/it/common.json` | Aggiunte chiavi `mapLongPress.*` |
| `src/locales/en/common.json` | Aggiunte chiavi `mapLongPress.*` |
| `src/locales/fr/common.json` | Aggiunte chiavi `mapLongPress.*` |

---

## 4. Diff Summary

### LongPressInfoModal
- **Prima:** Modal compatto con backdrop `blur(8px)`, animazione `scale 0.9 / y 20`
- **Dopo:** `MapPillFlipOverlay` (stessa animazione del NOTE: scale-from-origin, spring), fullscreen, header gradient, safe-area, tap fuori + X per chiudere

### M1SSION PRIZE (PrizeVision)
- **Prima:** Testi hardcoded con brand (Porsche, Ferrari, Rolex, Cartier)
- **Dopo:** Categorie generiche: Veicoli di prestigio, Oggetti rari, Esperienze esclusive, Tecnologia avanzata, Come vincere — tutte tradotte in IT/EN/FR

### Chiavi i18n Aggiunte
```
mapLongPress.noInfo
mapLongPress.tapOutsideToClose
mapLongPress.prize.title
mapLongPress.prize.subtitle
mapLongPress.prize.categoryPrestige
mapLongPress.prize.categoryPrestigeDesc
mapLongPress.prize.categoryRare
mapLongPress.prize.categoryRareDesc
mapLongPress.prize.categoryExperiences
mapLongPress.prize.categoryExperiencesDesc
mapLongPress.prize.categoryTech
mapLongPress.prize.categoryTechDesc
mapLongPress.prize.categorySpecial
mapLongPress.prize.categorySpecialDesc
mapLongPress.prize.poolTitle
mapLongPress.prize.poolDesc
mapLongPress.prize.progress
mapLongPress.prize.swipeHint
```

---

## 5. QA iOS — Checklist

| Criterio | Stato |
|----------|--------|
| Long press → apertura OK | ⏳ Da verificare su dispositivo |
| Animazione identica a NOTE | ⏳ Da verificare |
| Chiusura OK (tap fuori + X) | ⏳ Da verificare |
| Testi leggibili (contrasto/gerarchia) | ⏳ Da verificare |
| i18n IT/EN/FR | ⏳ Da verificare |
| Nessun crash | ⏳ Da verificare |
| Nessuna regressione MAP | ⏳ Da verificare |

**Nota:** Build e `cap sync ios` completati con successo. QA su iPhone reale richiesta dall’utente.

---

## 6. Scope Verificato

- **Intervento solo su:** M1SSION PRIZE, M1SSION AGENT, TEMPO MISSIONE (long press)
- **Nessuna modifica a:** Final Shot, Arsenal, Buzz, Map logic, Edge Functions, DB, altri modali
- **Trigger:** Long press invariato

---

FINE REPORT.
