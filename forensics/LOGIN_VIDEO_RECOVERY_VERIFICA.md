# LOGIN VIDEO RECOVERY — Verifica (pre-patch)

**Incident:** iPad/iOS wrapped: login video incoerente, Error 3 "Media failed to decode".  
**Scope:** Solo componente Login/video. NO auth, routing, IAP.

---

## 1. File esatto del Login video

- **Path:** `src/pages/Login.tsx`
- **Contenuto video:** `<video>` fullscreen con `VIDEO_SRC = '/assets/video/M1SSION_INTRO.mp4'`, `<source src={VIDEO_SRC} type="video/mp4" />`.
- **Overlay:** div con gradient `linear-gradient(to top, rgba(0,0,0,0.9)...)` (z-index 1). Contenuto UI (Sign Up / Log In) z-index 10.

---

## 2. Perché si vede schermata senza video

- **Stato attuale:** Se il video non parte (autoplay bloccato, decode fail, stalled), non c’è retry né fallback: il video resta nero o va in errore e l’utente vede lo sfondo nero del container senza “cover” visiva coerente.
- **Error 3 (MEDIA_ERR_DECODE):** iOS/WKWebView può rifiutare la decodifica; il tag `<video>` va in errore senza recovery.
- **Mancano:** retry deterministico, fallback invisibile (poster/cover + stesso overlay), log forensi.

---

## 3. Eventi già gestiti vs no

| Evento        | Prima della patch | Dopo patch |
|---------------|-------------------|------------|
| mount         | No log            | [LOGIN-VIDEO-FORENSIC] mount + deviceClass |
| loadstart     | No                | Sì, log    |
| canplay       | Sì (play catch)   | Sì + log + first-frame path |
| playing       | No                | Sì, log    |
| timeupdate    | No                | Sì (first frame), log |
| stalled       | No                | Sì, trigger retry |
| waiting       | No                | Sì, log (opz. retry se prolungato) |
| error         | Sì (console.error)| Sì + code/message + retry o FALLBACK |
| ended         | No                | Sì, log    |
| Retry         | No                | Max 2 retry (pause, currentTime=0, load, play) |
| Fallback      | No                | Sì: black + stesso overlay (nessuna “foto 1”) |

---

## 4. Rollback

- **Tag:** `safety/login-video-prepatch-20260216_113743`
- **Branch:** `fix/login-video-recovery-min`
- **File toccati:** `src/pages/Login.tsx`, `forensics/LOGIN_VIDEO_RECOVERY_VERIFICA.md`

```bash
# Revert del commit PATCH (sostituire <PATCH_SHA> con SHA effettivo dopo commit)
git revert <PATCH_SHA> --no-edit

# Oppure ripristino file dal tag
git checkout safety/login-video-prepatch-20260216_113743 -- src/pages/Login.tsx
```

## 5. Test

```bash
npm run build && npx cap sync ios
```

- **iPad:** clean install → avvio → login screen: video tentato sempre; se decode fail, retry (max 2); se fallisce, fallback invisibile (nero + overlay). Mai schermata “brutta”.
- **iPhone:** nessuna regressione; video come prima.
- **Log:** in console cercare `[LOGIN-VIDEO-FORENSIC]` per event, deviceClass, errorCode, retryCount, finalMode (VIDEO_OK | RETRY_OK | FALLBACK).
