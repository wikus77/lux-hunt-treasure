# BRIEFING SUBTITLES + LEADERBOARD LONG-PRESS — FIX REPORT

**Date:** 2026-02-13  
**Branch:** `fix/briefing-subtitles-and-leaderboard-longpress`  
**Context:** iOS wrapped app — sottotitoli parziali (EN), long-press modal leaderboard scomparso

---

## 1. COMPONENT MAP

| Component | Path | Role |
|-----------|------|------|
| BriefingFlipOverlay | `src/components/shared/BriefingFlipOverlay.tsx` | Modal fullscreen unificato per TUTTI i briefing video. Prop `enableSubtitles?: 'home' \| 'buzz_map'` — solo questi due valori abilitano sottotitoli EN/FR |
| BottomNavigation | `src/components/layout/BottomNavigation.tsx` | Istanzia 6 BriefingFlipOverlay (Buzz, Home, Map, AION, Classifica, Notifiche). Solo Home e Map passano `enableSubtitles` |
| LeaderboardUserCard | `src/pages/LeaderboardPage.tsx` (inline) | Card con long-press → `handleUserLongPress` → UserProfileModal |
| UserProfileModal | `src/components/leaderboard/UserProfileModal.tsx` | Modale glass per long-press leaderboard |
| useLongPress | `src/hooks/useLongPress.ts` | Hook con touch + pointer events per iOS |

---

## 2. ROOT CAUSE A — SUBTITLES BRIEFING

### Tabella Briefing → key subtitle → risoluzione

| Briefing | enableSubtitles | key i18n | Risoluzione | Motivo render |
|----------|-----------------|----------|-------------|---------------|
| M1SSION HOME | `"home"` | SUBTITLES_EN / SUBTITLES_FR | OK | shown |
| BUZZ MAP | `"buzz_map"` | SUBTITLES_BUZZMAP_EN/FR | OK | shown |
| BRIEFING BUZZ | — | — | **missing** | hidden (enableSubtitles undefined) |
| AION AI | — | — | **missing** | hidden |
| CLASSIFICA | — | — | **missing** | hidden |
| NOTIFICHE | — | — | **missing** | hidden |

**Root cause:** `enableSubtitles` è passato solo a Home e Buzz Map. Gli altri briefing non hanno subtitle lines definite né la prop. Il componente mostra sottotitoli solo se `!!enableSubtitles && (locale === 'en' || locale === 'fr')`.

---

## 3. ROOT CAUSE B — LEADERBOARD LONG-PRESS

**Root cause:** `LeaderboardUserCard` usa solo **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`, …). Su iOS WKWebView i pointer events da touch possono non essere affidabili; altri componenti (PlayerCard, DailyMissionCard, ecc.) usano `useLongPress` che espone anche **Touch Events** (`onTouchStart`, `onTouchEnd`, `onTouchMove`).

**Evidenza:** Commit `5129ed12` ha introdotto la long-press con handler custom pointer-only. Il hook `useLongPress` (FIX v6) dichiara esplicitamente supporto pointer+touch per iOS.

**Fix:** Sostituire gli handler custom in `LeaderboardUserCard` con `useLongPress` per avere touch + pointer, come negli altri componenti che funzionano su iOS.

---

## 4. PATCH SUMMARY (APPLICATA)

### A) Briefing subtitles
- **File:** `src/components/shared/BriefingFlipOverlay.tsx`
  - Aggiunti SUBTITLES_BUZZ_EN/FR, SUBTITLES_AION_EN/FR, SUBTITLES_CLASSIFICA_EN/FR, SUBTITLES_NOTIFICHE_EN/FR
  - Tipo `enableSubtitles` esteso a `'home' | 'buzz_map' | 'buzz' | 'aion' | 'classifica' | 'notifiche'`
  - `getSubtitleLines()` per mappare enableSubtitles → array corretto
- **File:** `src/components/layout/BottomNavigation.tsx`
  - `enableSubtitles="buzz"` su BRIEFING BUZZ
  - `enableSubtitles="aion"` su AION AI
  - `enableSubtitles="classifica"` su CLASSIFICA
  - `enableSubtitles="notifiche"` su NOTIFICHE

### B) Leaderboard long-press
- **File:** `src/pages/LeaderboardPage.tsx`
  - Sostituiti handler custom (solo pointer) con `useLongPress(onLongPress, { threshold: 500 })` (touch + pointer)
  - Rimosso hook `useLongPressCard` non usato

---

## 5. TEST MATRIX

| Test | Device | Lingua | Risultato |
|------|--------|--------|-----------|
| Briefing Home subtitles | iPhone | EN | [ ] |
| Briefing Buzz Map subtitles | iPhone | EN | [ ] |
| Briefing Buzz subtitles | iPhone | EN | [ ] |
| Briefing AION subtitles | iPhone | EN | [ ] |
| Briefing Classifica subtitles | iPhone | EN | [ ] |
| Briefing Notifiche subtitles | iPhone | EN | [ ] |
| Briefing subtitles IT | iPhone | IT | (nessun subtitle previsto) |
| Leaderboard long-press → modal | iPhone | — | [ ] |
| Leaderboard tap normale | iPhone | — | (no modal) [ ] |
| Smoke: login, routing, IAP | — | — | [ ] |

---

## 6. ROLLBACK PLAN

```bash
# Revert del commit patch
git revert HEAD --no-edit

# Checkout file specifici (torna allo stato pre-patch)
git checkout HEAD~1 -- src/components/shared/BriefingFlipOverlay.tsx src/components/layout/BottomNavigation.tsx src/pages/LeaderboardPage.tsx
```

## 7. ENV (per test)

- Device: iPhone (iOS wrapped Capacitor)
- Lingua sistema: EN / IT
- Build: `pnpm run build && pnpm exec cap sync ios`
