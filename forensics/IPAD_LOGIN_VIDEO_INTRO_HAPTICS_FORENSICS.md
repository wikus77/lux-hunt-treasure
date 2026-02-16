# iPad iOS Wrapper: Login Video + Intro + Haptics — Forensic Report

**Incident:** Login video incoerente (fallback “foto 1”) + Intro post-login saltata al primo login + Haptics quasi assenti su iPad.  
**Scope:** Fix minimali, no wrapper iOS, no IAP/Stripe/Buzz/Map. Rollback obbligatorio.

---

## 1. Root cause FIX 1 — “Schermata statica” (foto 1) al posto del video login

### Dove nasce la UI statica
- **M1LogoSplash** (`src/components/intro/M1LogoSplash.tsx`): mostrato a ogni avvio app (App.tsx, `showSplash`). Quando `videoError === true` viene mostrato il fallback **“M1” + “IT IS POSSIBLE”** (blocco statico = “foto 1”).
- **Login** (`src/pages/Login.tsx`): sfondo fullscreen `<video>` con `VIDEO_SRC = '/assets/video/M1SSION_INTRO.mp4'`, nessun `poster`, nessun fallback esplicito. Se autoplay fallisce, il video può restare nero o mostrare il primo frame congelato.

### Condizioni che causano il fallback
- **M1LogoSplash:**  
  - `video.play()` fallisce (autoplay bloccato su iOS/WKWebView, tipico su iPad).  
  - Nel `catch` si imposta `video.muted = true` e si ritenta `play()`; se anche questo fallisce si chiama `setVideoError(true)`.  
  - Non c’è retry su primo tap; non si aspetta `canplay`/`loadedmetadata` prima del play.  
  - Risultato: su iPad spesso si vede il fallback “M1” (foto 1) invece del video.
- **Login:**  
  - Un solo `video.play()` in `useEffect` al mount; in caso di autoplay bloccato non c’è retry su interazione.  
  - Nessun `poster`/fallback UI, ma l’esperienza “statica” può essere il primo frame o nero.

### Conclusione FIX 1
- Su iPad l’autoplay è spesso bloccato; il fallback “M1” in M1LogoSplash è la “foto 1” non voluta.
- **Patch:** (1) M1LogoSplash: retry play al primo `touchstart`/`click` sul container; non mostrare mai il blocco “M1” come fallback — in caso di errore video mostrare solo nero + overlay (stessa esperienza visiva). (2) Login: retry `video.play()` al primo tap sulla pagina; `muted` + `playsInline`; opzionale attesa `canplay`/`loadedmetadata` prima del play.

---

## 2. Root cause FIX 2 — Intro post-login saltata al primo login (iPad)

### Flusso attuale
- **Redirect post-login:**  
  - `StandardLoginForm.tsx`: dopo login riuscito, se `!isFirstLoginDone()` → `navigate('/mission-intro')`.  
  - `postLoginRedirectFixed` (chiamato da Login.tsx quando `isAuthenticated`): se `!isFirstLoginDone()` → `navigate('/mission-intro')` (o `window.location.href = '/mission-intro'`).
- **Flag first-login:**  
  - `m1_first_login_done` in `localStorage`; impostata **solo** in `PostLoginMissionIntro.tsx` al **completamento** dell’intro (non al login). Comportamento corretto.
- **Route `/mission-intro`:**  
  - In `WouterRoutes.tsx` è definita; il componente è `MissionIntroPage` (che usa `PostLoginMissionIntro`).

### Perché l’intro viene saltata su iPad (clean install)
- In `WouterRoutes.tsx`, nell’effetto che fa il check abbonamento (linee ~209–214):
  - `initialRoutes = ['/', '/login', '/mission-intro', '/subscription-verify']`
  - Se `subResult.plan === 'free' && initialRoutes.includes(location)` → `setLocation('/home')`.
- Quindi: utente fa primo login → redirect a `/mission-intro` → l’effetto del subscription check vede `location === '/mission-intro'` e `plan === 'free'` → **reindirizza subito a `/home`**. L’intro non ha il tempo di essere mostrata/completata.

### Conclusione FIX 2
- **Root cause:** il redirect “free plan → /home” viene applicato anche a `/mission-intro`, quindi l’intro viene sostituita da /home.
- **Patch:** escludere `/mission-intro` dal set di route che vengono reindirizzate a `/home` (es. usare `['/', '/login', '/subscription-verify']` per il redirect, così `/mission-intro` non viene mai reindirizzata).

---

## 3. Root cause FIX 3 — Haptics quasi assenti su iPad

### Stato attuale
- **File:** `src/utils/haptics.ts`.
- **Rilevamento iPad:** `isIPad()` (UA `iPad` oppure `platform === 'MacIntel' && maxTouchPoints > 1`).
- **Rimappatura già presente:**  
  - `light` / `selection` → `ImpactStyle.Medium` su iPad (Light su iPhone).  
  - `medium` → `ImpactStyle.Heavy` su iPad (Medium su iPhone).  
  - `heavy` → Heavy invariato.  
  - Notification (success/error/warning) invariati.

### Perché su iPad il feedback è impercettibile
- Le chiamate native partono (log “To Native -> Haptics”).
- Su iPad il motore haptics è meno forte; Light/Medium nativi sono spesso poco percepibili. La rimappatura attuale (Light→Medium, Medium→Heavy) è nella direzione giusta ma può non essere sufficiente per tutti i contesti (es. bottom nav, tap principali).

### Conclusione FIX 3
- Nessun bug di “chiamata non parte”; il problema è solo intensità.
- **Patch:** confermare/rafforzare la rilevazione iPad (UA + MacIntel + maxTouchPoints) e mantenere la rimappatura light/selection→Medium, medium→Heavy. Opzionale: su iPad usare sempre almeno Medium per “selection” e Heavy per “medium” (già fatto). Nessuna modifica ai chiamanti; solo `haptics.ts`. iPhone invariato.

---

## 4. File toccati (scope minimo)

| Fix | File | Modifica |
|-----|------|----------|
| 1 | `src/components/intro/M1LogoSplash.tsx` | Retry play al primo tap; fallback senza “M1” (solo nero + overlay) |
| 1 | `src/pages/Login.tsx` | Retry `video.play()` al primo tap; muted + playsInline |
| 2 | `src/routes/WouterRoutes.tsx` | Escludere `/mission-intro` dal redirect free→/home |
| 3 | `src/utils/haptics.ts` | Verifica/rafforzamento iPad; rimappatura già presente, nessun cambiamento necessario salvo commenti |

---

## 5. ROLLBACK

Dopo il commit della patch:

```bash
# Revert dell’intero commit (un commit per tutte le patch)
git revert <PATCH_SHA> --no-edit

# Oppure ripristino file singoli allo stato del tag
git checkout SNAPSHOT_PRE_IPAD_LOGIN_VIDEO_INTRO_HAPTICS -- \
  src/components/intro/M1LogoSplash.tsx \
  src/pages/Login.tsx \
  src/routes/WouterRoutes.tsx \
  src/utils/haptics.ts
```

**Tag di sicurezza:** `SNAPSHOT_PRE_IPAD_LOGIN_VIDEO_INTRO_HAPTICS`  
**Branch:** `fix/ipad-login-video-intro-haptics`  
**File toccati:** M1LogoSplash.tsx, Login.tsx, WouterRoutes.tsx, haptics.ts (solo commento), forensics report.
