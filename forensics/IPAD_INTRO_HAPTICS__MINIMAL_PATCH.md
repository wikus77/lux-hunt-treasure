# iPad: First-Login Intro Skipped + Haptics Assenti — Minimal Patch Report

**Date:** 2026-02-16  
**Branch:** `fix/ipad-intro-haptics-minimal`  
**Safety tag:** `safety/ipad-intro-haptics-prepatch-20260216_104216`  
**Prepatch SHA:** `f17272080908c13cb1dc0d7586bd32a323b3d6e7`  
**Patch commit SHA:** `731fd777`

---

## Executive summary

| Issue | Root cause | Fix |
|-------|------------|-----|
| **1) Intro non visibile al primo login (clean install)** | Dopo login il redirect andava sempre a `/map-3d-tiler` (o `post_login_redirect`). La route `/mission-intro` (animazione M1SSION™) non era mai raggiunta. | Redirect al primo login verso `/mission-intro`; flag `m1_first_login_done` in localStorage settato solo a intro completata; successivi login vanno a map come prima. |
| **2) Haptics assenti/deboli su iPad** | Nessun gate per iPad; `ImpactStyle.Light` su iPad è spesso impercettibile (device senza Taptic Engine o feedback più debole). | Pattern rinforzati solo su iPad: `light`/`selection` → Medium, `medium` → Heavy; iPhone invariato. Nessuna modifica al wrapper nativo. |

---

## Rollback (obbligatorio)

### File toccati dalla patch (solo questi 4)

```
src/utils/postLoginRedirectFixed.ts
src/components/auth/StandardLoginForm.tsx
src/components/auth/PostLoginMissionIntro.tsx
src/utils/haptics.ts
```

### Diff stat patch

```
 src/components/auth/PostLoginMissionIntro.tsx |  3 ++
 src/components/auth/StandardLoginForm.tsx     | 40 +++++++++++++++------------
 src/utils/haptics.ts                          | 26 +++++++++++++----
 src/utils/postLoginRedirectFixed.ts           | 22 ++++++++++++++-
 4 files changed, 66 insertions(+), 25 deletions(-)
```

### Metodo 1 — Revert del commit di patch

Dopo aver fatto il commit di questa patch:

```bash
git revert 731fd777 --no-edit
```

(Sostituire `<commit_sha>` con l’hash del commit che applica questa patch.)

### Metodo 2 — Ripristino file da prepatch

```bash
git checkout safety/ipad-intro-haptics-prepatch-20260216_104216 -- \
  src/utils/postLoginRedirectFixed.ts \
  src/components/auth/StandardLoginForm.tsx \
  src/components/auth/PostLoginMissionIntro.tsx \
  src/utils/haptics.ts
```

---

## FORENSICS INTRO

### Dove viene deciso di mostrare/saltare l’intro post-login

| File / linea | Ruolo |
|--------------|--------|
| `src/utils/postLoginRedirectFixed.ts` | Decide dove andare dopo login quando la pagina Login rileva `isAuthenticated`: prima andava sempre a `consumePostLoginRedirect() \|\| '/map-3d-tiler'`. |
| `src/components/auth/StandardLoginForm.tsx` | Dopo `login()` di successo faceva sempre `navigate(finalTarget)` con `finalTarget = target \|\| '/map-3d-tiler'`. Nessun redirect a `/mission-intro`. |
| `src/routes/WouterRoutes.tsx` (1175–1178) | Route `/mission-intro` esiste e renderizza `MissionIntroPage` → `PostLoginMissionIntro`. |
| `src/components/auth/PostLoginMissionIntro.tsx` (54–56) | A fine animazione imposta `sessionStorage.setItem('hasSeenPostLoginIntro', 'true')` e `navigate('/home')`. Il flag “già visto” era solo in sessionStorage. |

### Ordine eventi (prima della patch)

1. Utente fa login (email/password o sessione già presente).
2. `StandardLoginForm`: `navigate('/map-3d-tiler')` (o `post_login_redirect`).  
   Oppure `Login.tsx` useEffect: `postLoginRedirectFixed(navigate)` → `navigate('/map-3d-tiler')`.
3. Nessun passaggio da `/mission-intro`: il componente `PostLoginMissionIntro` non veniva mai montato dopo il primo login.
4. `hasSeenPostLoginIntro` (sessionStorage) veniva usato altrove ma non c’era un “primo login dopo install” che forzasse la visita a `/mission-intro`.

### Perché al primo login su iPad l’intro veniva saltata

- **Causa diretta:** Il flusso post-login non andava mai su `/mission-intro`. Sia `StandardLoginForm` sia `postLoginRedirectFixed` puntavano sempre a map (o a `post_login_redirect`), quindi l’intro “M1SSION™” non era nel percorso.
- **Perché sembrava “ok dopo kill”:** Al cold start (dopo kill) la **splash** in `App.tsx` (`M1LogoSplash`) viene mostrata di nuovo perché `sessionStorage` è vuoto (`m1_splash_shown_session`). Quindi l’utente vede la splash video, non la mission-intro. La mission-intro ora viene mostrata una sola volta dopo il **primo** login grazie al flag `m1_first_login_done`.

### Condizione attuale (dopo patch)

- **Primo login (clean install):** `!isFirstLoginDone()` → redirect a `/mission-intro`. Dopo l’animazione, `PostLoginMissionIntro` setta `localStorage.setItem('m1_first_login_done', 'true')` e `navigate('/home')`.
- **Login successivi:** `isFirstLoginDone()` true → redirect come prima a `post_login_redirect` o `/map-3d-tiler`.
- Nessun uso di “cold start” o “hydration” per decidere l’intro: solo il flag persistente `m1_first_login_done`.

### Chiavi storage

- `m1_first_login_done` (localStorage): nuovo; settato a `'true'` solo alla **fine** dell’intro (onComplete). Non viene mai cancellato al logout.
- `hasSeenPostLoginIntro` (sessionStorage): già esistente; settato a `'true'` alla fine dell’intro; cancellato al logout in `AuthProvider`.

---

## FORENSICS HAPTICS

### Plugin e invocazione

- **Plugin:** `@capacitor/haptics` (ImpactStyle, NotificationType).
- **Punto unico di invocazione nativa:** `src/utils/haptics.ts` → `triggerNativeHaptic(type)`.
- **Chiamate:** `hapticLight`, `hapticMedium`, `hapticHeavy`, `hapticSuccess`, `hapticError`, `hapticWarning`, ecc. Usati da BottomNavigation, CommitRitual, BuzzActionButton, OnboardingOverlay, dialog, toast, ecc.

### Condizioni / gate

- **Runtime:** `guardHapticsRuntime()`: haptics solo se `isCapacitorNative()` (nessun gate esplicito iPad).
- **Preferenza utente:** `isHapticsEnabled()` → `localStorage.getItem('m1_haptics_enabled') !== 'false'`.
- **Nessun gate “disabilita su iPad”:** il codice non disattivava gli haptics su iPad; le chiamate “To Native -> Haptics impact/notification” partono anche su iPad, ma il feedback può essere impercettibile.

### Ipotesi supporto device

- Su iPhone il Taptic Engine gestisce bene Light/Medium/Heavy.
- Su iPad (modelli senza Taptic Engine o con feedback più debole) `ImpactStyle.Light` è spesso non percepito; i log Xcode mostrano chiamate native eseguite ma l’utente non sente nulla.
- **Patch:** senza toccare il wrapper nativo, in `haptics.ts` si rileva iPad (UA `iPad` o `MacIntel` + `maxTouchPoints > 1`) e si usano pattern più forti: `light`/`selection` → Medium, `medium` → Heavy. Success/Error/Warning restano `NotificationType` (già più percettibili). Così iPhone resta invariato e iPad ha feedback più percettibile dove il device lo supporta.

### Punti di invocazione principali (solo lettura)

- `src/utils/haptics.ts`: export `hapticSync`, `hapticLight`, `hapticMedium`, …
- `src/components/layout/BottomNavigation.tsx`: `hapticLight`
- `src/components/commit/CommitRitual.tsx`, `CommitNodesContainer.tsx`: Haptics + ImpactStyle
- `src/components/buzz/BuzzActionButton.tsx`: `hapticHeavy`, `buzzHapticPulse`
- `src/hooks/useLongPress.ts`: `hapticMedium`
- `src/components/onboarding/OnboardingOverlay.tsx`: `hapticLight`, `hapticSuccess`, `hapticHeavy`
- Nessuna modifica a questi call site: solo il comportamento interno in `haptics.ts` cambia su iPad.

---

## Test matrix (iPad + iPhone)

### 1) iPad — Clean install → primo login → intro visibile

- Disinstalla app, reinstalla (o installa da Xcode).
- Apri app → schermata login.
- Inserisci credenziali e fai login.
- **Atteso:** Viene mostrata l’animazione “M1SSION™” / “IT IS POSSIBLE” (route `/mission-intro`), poi redirect a Home.
- **Verifica:** Nessun salto diretto alla mappa senza intro.

### 2) iPad — Kill e riapro → intro non in loop

- Con utente già loggato: kill app, riapri.
- **Atteso:** Splash (M1LogoSplash) può apparire (sessionStorage vuoto); poi Home/Map. La mission-intro **non** si ripete (perché `m1_first_login_done` è già true).

### 3) iPhone — Clean install → primo login

- Stesso flusso di (1) su iPhone.
- **Atteso:** Stesso comportamento: prima mission-intro al primo login, poi Home. Nessuna regressione.

### 4) Haptics — iPad punti chiave

- Su iPad: nav bottom, tap su card mission, buzz, onboarding step, pulsanti con haptic.
- **Atteso:** Feedback percepibile (dove il device supporta haptics) grazie a pattern Medium/Heavy su iPad.
- **Documentare:** Dove l’utente sente o meno (modello iPad / iPadOS) per eventuali follow-up.

### 5) Nessuna regressione auth / redirect / home

- Login → mission-intro → home; logout → login di nuovo → va a map (non a mission-intro).
- Nessun loop su `/login`, nessun redirect inatteso.

---

## Riepilogo modifiche (patch minimale)

1. **postLoginRedirectFixed.ts**  
   - Aggiunto `KEY_FIRST_LOGIN_DONE`, `isFirstLoginDone()`.  
   - Se `!isFirstLoginDone()` → `navigate('/mission-intro')`, altrimenti comportamento invariato.

2. **StandardLoginForm.tsx**  
   - Dopo login success: se `!isFirstLoginDone()` → `navigate('/mission-intro')`; altrimenti `finalTarget` come prima (map o `post_login_redirect`).  
   - PWA fallback usa `finalTarget` in entrambi i rami.

3. **PostLoginMissionIntro.tsx**  
   - In onComplete (prima di `navigate('/home')`): `localStorage.setItem('m1_first_login_done', 'true')`.

4. **haptics.ts**  
   - Helper `isIPad()` (UA + MacIntel + maxTouchPoints).  
   - In `triggerNativeHaptic`: su iPad, `light`/`selection` → ImpactStyle.Medium; `medium` → ImpactStyle.Heavy; resto invariato.

Nessuna modifica a IAP, Stripe, BUZZ, mappa, routing core, codice nativo iOS. Nessun refactor fuori scope.

---

© 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
