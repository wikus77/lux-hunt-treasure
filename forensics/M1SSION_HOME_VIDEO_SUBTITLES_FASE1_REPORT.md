# FASE 1 — Verifica Tecnica — M1SSION HOME Video Subtitles

**Data:** 14 Feb 2026  
**Incident:** iOS Wrapped App — Video "M1SSION HOME" — Subtitles i18n (EN/FR only, IT none)

---

## 1. Dove è definito il video "M1SSION HOME"

| Aspetto | Dettaglio |
|---------|-----------|
| **Trigger** | Tap su icona Home nella Bottom Navigation |
| **Componente** | `BriefingFlipOverlay` (modal fullscreen unificato) |
| **File** | `src/components/shared/BriefingFlipOverlay.tsx` |
| **Sorgente video** | `/assets/video/HOME-BRIF-VIDEO.mp4` |
| **Istanza** | In `BottomNavigation.tsx` (righe 364-371): `BriefingFlipOverlay` con `title="M1SSION HOME"`, `videoSrc={HOME_VIDEO}` |

**Autoplay / mount / unmount:**
- `open={showHomeVideoModal}` controlla visibilità
- `useEffect` con `video.muted = false` + `video.play()` al mount quando `open && shouldShowVideo()`
- `onEnded={handleVideoEnd}` → handleClose dopo 500ms
- Video in `<video>` HTML5: `playsInline`, `muted={!audioEnabled}`, `onEnded`, `onError`

---

## 2. Come viene determinata la lingua corrente

| Metodo | Dettaglio |
|--------|-----------|
| **Fonte primaria** | `getLocale()` da `src/i18n/i18n.ts` |
| **Implementazione** | `i18next.language` (normalizzato) oppure `getDefaultLocale()` |
| **getDefaultLocale()** | Se mode=`auto` → `getDeviceLocale()` (navigator.languages[0] o navigator.language) |
| **Su iOS Capacitor** | `navigator.language` riflette la lingua di sistema del dispositivo |
| **Valori** | `'en'`, `'it'`, `'fr'` (SUPPORTED) |

**Conclusione:** La lingua di sistema iOS è correttamente mappata tramite i18n. `getLocale()` restituisce `'en'`, `'it'` o `'fr'`.

---

## 3. Overlay UI esistente sopra il video

| Elemento | Descrizione |
|----------|-------------|
| **Audio indicator** | Overlay centrale "Tocca per l'audio" quando `!audioEnabled` |
| **Audio badge** | `absolute bottom-4 left-4` — icona VolumeX/Volume2 |
| **Container** | `relative bg-black h-full w-full` — già predisposto per overlay aggiuntivi |

**Posizione per sottotitoli:** bottom-center è libera. L’audio badge è in `bottom-4 left-4`; i sottotitoli possono stare in `bottom-[calc(4rem+env(safe-area-inset-bottom))]` per non sovrapporsi.

---

## 4. Rischi e decisioni

| Rischio | Mitigazione |
|---------|-------------|
| BriefingFlipOverlay condiviso con altri video | Aggiungere prop `enableSubtitles?: boolean` — solo M1SSION HOME la riceve |
| Modifica timing video | Nessuna — solo overlay React sincronizzato con `timeupdate` |
| Dipendenze esterne | Nessuna — testi hardcoded in costanti, no API/cloud |
| Safe-area iOS | Usare `paddingBottom: env(safe-area-inset-bottom)` per il container sottotitoli |

**Rischio STOP:** Nessuno rilevato. Procedere con FASE 2-4.

---

FINE REPORT FASE 1.
