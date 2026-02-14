# BUZZ MAP Video — Subtitles i18n — Deliverable Report

**Data:** 14 Feb 2026  
**Incident:** iOS Wrapped App — Video "BUZZ MAP" — Subtitles i18n (EN/FR only, IT none)

---

## 1. Snapshot & Rollback

### Tag
```
SNAPSHOT_PRE_BUZZ_MAP_VIDEO_SUBTITLES_20260214_070844
```

### Comando Rollback
```bash
git reset --hard SNAPSHOT_PRE_BUZZ_MAP_VIDEO_SUBTITLES_20260214_070844
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. FASE 1 — Conferma tecnica

- **Video BUZZ MAP:** BriefingFlipOverlay in BottomNavigation (righe 376-385), `title="BUZZ MAP"`, `videoSrc={MAP_VIDEO}`
- **Stessa infrastruttura di M1SSION HOME:** Sì — usa lo stesso BriefingFlipOverlay
- **Lingua:** getLocale() da i18n (EN/FR/IT)

---

## 3. File modificati

| File | Modifiche |
|------|-----------|
| `src/components/shared/BriefingFlipOverlay.tsx` | Prop `enableSubtitles?: 'home' \| 'buzz_map'`, costanti SUBTITLES_BUZZMAP_EN/FR, logica variant |
| `src/components/layout/BottomNavigation.tsx` | enableSubtitles="home" per M1SSION HOME, enableSubtitles="buzz_map" per BUZZ MAP |

---

## 4. Pattern applicato (identico a M1SSION HOME)

- Overlay testuale React bottom-center, safe-area aware
- Sync timeupdate + loadedmetadata, durata divisa in N cue
- IT = nessun sottotitolo; EN/FR = testi autorizzati

---

## 5. QA su iPhone (da completare)

- [ ] iOS IT → nessun sottotitolo
- [ ] iOS EN → sottotitoli BUZZ MAP corretti
- [ ] iOS FR → sottotitoli BUZZ MAP corretti
- [ ] Nessun impatto su BUZZ, mappa, altri video

---

FINE REPORT.
