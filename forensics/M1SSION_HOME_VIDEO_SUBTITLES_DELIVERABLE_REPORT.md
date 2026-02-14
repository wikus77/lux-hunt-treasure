# M1SSION HOME Video — Subtitles i18n — Deliverable Report

**Data:** 14 Feb 2026  
**Incident:** iOS Wrapped App — Video "M1SSION HOME" — Subtitles i18n (EN/FR only, IT none)

---

## 1. Snapshot & Rollback

### Tag
```
SNAPSHOT_PRE_MISSION_HOME_VIDEO_SUBTITLES_20260214_065024
```

### Comando Rollback
```bash
git reset --hard SNAPSHOT_PRE_MISSION_HOME_VIDEO_SUBTITLES_20260214_065024
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. File Modificati

| File | Modifiche |
|------|-----------|
| `src/components/shared/BriefingFlipOverlay.tsx` | Prop `enableSubtitles`, import `getLocale`, costanti `SUBTITLES_EN`/`SUBTITLES_FR`, overlay sottotitoli, sync `timeupdate` |
| `src/components/layout/BottomNavigation.tsx` | `enableSubtitles` passato solo per M1SSION HOME |

---

## 3. Comportamento

| Lingua iOS | Sottotitoli |
|------------|-------------|
| IT | Nessuno |
| EN | Testi in inglese (6 cue) |
| FR | Testi in francese (6 cue) |

**Posizione:** bottom-center, safe-area aware, fade-in/out  
**Sync:** `timeupdate` + `loadedmetadata`, durata video divisa in 6 segmenti

---

## 4. Testi (immutabili)

Usati esattamente come da FASE 3. IT: nessun overlay.

---

## 5. QA su iPhone (da completare)

- [ ] iOS IT → nessun testo
- [ ] iOS EN → sottotitoli corretti
- [ ] iOS FR → sottotitoli corretti
- [ ] Nessun crash
- [ ] Nessun impatto su altri video

---

FINE REPORT.
