# App Info hide Links + Video modals i18n + “Non mostrare più” verify — Report

**Data:** 2026-02-22  
**Scope:** 1) Nascondere card “Links / Support the Project” in App Info; 2) i18n completo modali video; 3) Verifica CTA “Non mostrare più questo video”; 4) Fix solo se rotto.

---

## FASE 2 — Verifica CTA “Non mostrare più questo video” (read-only)

| Domanda | Risposta | Evidence |
|--------|----------|----------|
| **CTA esiste?** | Sì | `BriefingFlipOverlay.tsx` ~450–456: `<button … onClick={handleDismissForever}>` con testo ora da `t('tutorial_dont_show_again')`. |
| **Handler** | `handleDismissForever` | `BriefingFlipOverlay.tsx` 252–257: `localStorage.setItem(storageKey, 'true'); handleClose();` |
| **Key usata** | Prop `storageKey` per ogni modal | Es. `m1_buzz_video_modal_dismissed`, `m1_home_video_dismissed`, `m1_map_video_dismissed`, `m1_aion_video_dismissed`, `m1_classifica_video_dismissed`, `m1_notifiche_video_dismissed` (BottomNavigation.tsx 358–421). |
| **Read condition** | `shouldShowVideo()` | `BriefingFlipOverlay.tsx` 166–171: `return localStorage.getItem(storageKey) !== 'true'`. Stessa chiave usata in write. |
| **Dove si decide se mostrare** | Linee 301–306, 308 | `useEffect`: se `open && !shouldShowVideo()` → `onClose(); onContinue();`. Poi `if (!shouldShowVideo()) return null` → modal non renderizzato. |
| **Mismatch?** | No | Scrittura e lettura usano la stessa `storageKey`. |
| **Per-video?** | Sì | Ogni `BriefingFlipOverlay` ha `storageKey` diverso. |
| **Per-user server?** | No | Solo localStorage lato client. |

**localStorage.clear() in app:**  
Trovato in: `main.tsx` (pagine reset), `SecuritySectionContent.tsx`, `App.tsx`, `LegalSettings.tsx`, `SecuritySettings.tsx`, `MissionResetSection.tsx`, `GlobalErrorBoundary.tsx`, `FatalErrorScreen.tsx`. Se l’utente esegue “clear data” / logout con clear, i flag “non mostrare più” vengono persi (comportamento atteso). **Nessun fix applicato** per Phase 5: logica già corretta; persistenza dopo kill app garantita da localStorage finché non viene fatto clear.

---

## FASE 3 — Patch: nascondere “Links / Support the Project”

- **File:** `src/components/settings/sections/AppInfoSectionContent.tsx`
- **Modifica:** Card “Links” (titolo + bottone “Support the Project”) avvolta in `{false && ( ... )}` così non viene renderizzata. Resto del modale invariato.

---

## FASE 4 — Patch: i18n modali video

**Componenti modificati:**
- `src/components/shared/BriefingFlipOverlay.tsx`: aggiunto `useTranslation`; sostituite stringhe fisse con `t('tutorial_continue')`, `t('tutorial_dont_show_again')`, `t('tutorial_tap_audio')`, `t('tutorial_close')`; subtitle da prop con fallback `t('tutorial_default_subtitle')`.
- `src/components/layout/BottomNavigation.tsx`: aggiunto `useTranslation`; per ogni `BriefingFlipOverlay` passati `title` e `subtitle` da chiavi i18n (`tutorial_*_title`, `tutorial_*_subtitle`).

**Chiavi i18n aggiunte (en/it/fr):**
- `tutorial_continue`, `tutorial_dont_show_again`, `tutorial_tap_audio`, `tutorial_close`, `tutorial_default_subtitle`
- `tutorial_home_title`, `tutorial_home_subtitle`
- `tutorial_buzz_title`, `tutorial_buzz_subtitle`
- `tutorial_buzz_map_title`, `tutorial_buzz_map_subtitle`
- `tutorial_aion_title`, `tutorial_aion_subtitle`
- `tutorial_classifica_title`, `tutorial_classifica_subtitle`
- `tutorial_notifiche_title`, `tutorial_notifiche_subtitle`

**Sottotitoli video (EN/FR):**  
Restano gli array in `BriefingFlipOverlay.tsx` (SUBTITLES_*_EN/FR) per i sottotitoli overlay sul video; non convertiti in i18n in questa fase (scope: stringhe UI visibili nei modali; sottotitoli video già localizzati per locale).

---

## FASE 5 — Fix “Non mostrare più”

**Non applicato:** verifica ha confermato che write/read usano la stessa chiave e il gating è corretto. Persistenza dopo chiusura/kill app è garantita da localStorage. Unico caso in cui i flag si perdono è un `localStorage.clear()` esplicito (reset/sicurezza).

---

## Rollback

```bash
git reset --hard safety/appinfo-video-modals-before-20260222_1530
npm run build
npx cap sync ios
```

---

## File modificati (riepilogo)

- `src/components/settings/sections/AppInfoSectionContent.tsx` — Links card nascosta
- `src/components/shared/BriefingFlipOverlay.tsx` — i18n CTA, close, tap audio, subtitle fallback
- `src/components/layout/BottomNavigation.tsx` — i18n title/subtitle per ogni briefing
- `src/locales/en/common.json` — nuove chiavi tutorial_*
- `src/locales/it/common.json` — idem
- `src/locales/fr/common.json` — idem
