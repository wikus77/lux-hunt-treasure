# BRIEFING Subs EN/FR — Deliverable Report

**Data:** 14 Feb 2026  
**Scope:** BUZZ, AION AI, NOTIFICHE, CLASSIFICA — sottotitoli EN/FR (IT = none)

---

## 1. Snapshot & Rollback

### Tag
```
SNAPSHOT_PRE_BRIEFING_SUBS_ENFR_20260214
```

### Comando Rollback
```bash
git reset --hard SNAPSHOT_PRE_BRIEFING_SUBS_ENFR_20260214
git clean -fd
npm run build
npx cap sync ios
```

---

## 2. FASE 1 — Verifica (confermata)

- **Componente:** BriefingFlipOverlay (stesso per tutti i briefing)
- **Video:** BUZZ, AION, NOTIFICHE, CLASSIFICA in BottomNavigation
- **Architettura:** overlay sottotitoli, getLocale(), sync timeupdate/durata, no STT/API esterne

---

## 3. File modificati

| File | Modifiche |
|------|-----------|
| `src/components/shared/BriefingFlipOverlay.tsx` | SUBTITLES_BUZZ_EN/FR, SUBTITLES_AION_EN/FR, SUBTITLES_NOTIFICHE_EN/FR, SUBTITLES_CLASSIFICA_EN/FR; prop enableSubtitles estesa |
| `src/components/layout/BottomNavigation.tsx` | enableSubtitles="buzz", "aion", "notifications", "leaderboard" sui 4 BriefingFlipOverlay |

---

## 4. Traduzioni EN/FR (da sorgente IT)

- **BUZZ:** 5 cue — Buzz, clues, activation, true/false, necessity
- **AION:** 5 cue — Aion, oracle, analyze, where to look, survive
- **NOTIFICHE:** 4 cue — Not simple, mission changes, falls behind, silence
- **CLASSIFICA:** 5 cue — Leaderboard, position, everyone sees, rise or watch, no joking

---

## 5. Sync & stile

- Stesso algoritmo M1SSION HOME: timeupdate + loadedmetadata, durata/N segmenti
- Stesso overlay: bottom-center, safe-area, blur, font, animazione fade

---

## 6. QA iPhone (checklist)

- [ ] IT → nessun sottotitolo (4 video)
- [ ] EN → sottotitoli visibili, stile = Home (4 video)
- [ ] FR → sottotitoli visibili (4 video)
- [ ] Nessuna regressione: CTA, "Non mostrare più", autoplay invariati

---

FINE REPORT.
