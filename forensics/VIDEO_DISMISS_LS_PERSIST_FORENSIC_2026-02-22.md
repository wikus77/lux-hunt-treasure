# INCIDENT REPORT — “Non mostrare più” localStorage torna NULL dopo cambio tab

**Data:** 2026-02-22  
**Target:** iOS Capacitor WKWebView (origin: capacitor://localhost)  
**Scope patch:** SOLO `BottomNavigation.tsx`, `BriefingFlipOverlay.tsx`  
**Firma:** Lovable Agent JLENIA

---

## EVIDENZA GIÀ OSSERVATA (PROVA)

- **Origin:** capacitor://localhost  
- **setItem:** `localStorage.setItem('m1_home_video_dismissed','true')` → subito dopo è `"true"`  
- **Dopo cambio tab + ritorno Home:** `localStorage.getItem('m1_home_video_dismissed')` diventa **NULL**  
- **Conclusione:** Non è solo un gate mancante; è quasi certamente un **clear/remove** oppure **hard reload/nuovo contesto storage**.

---

## FASE 0 — ROLLBACK SAFETY (ESEGUITO)

- **Commit:** `chore(safety): before forensic localStorage dismiss persistence` (a4ac28d4)
- **Tag creato:** `safety/ls-dismiss-persist-20260222_083118`
- **Push:** NON eseguito (come da istruzioni)

**Rollback immediato:**
```bash
git reset --hard safety/ls-dismiss-persist-20260222_083118
```

---

## FASE 1 — FORENSICS (GREP REPO)

### A) localStorage.clear() / sessionStorage.clear()

| File | Righe |
|------|-------|
| src/main.tsx | 464, 620 |
| src/components/settings/sections/SecuritySectionContent.tsx | 82 |
| src/App.tsx | 239, 240 |
| src/pages/settings/LegalSettings.tsx | 110 |
| src/pages/settings/SecuritySettings.tsx | 126 |
| src/components/panel/MissionResetSection.tsx | 85 |
| src/components/error/GlobalErrorBoundary.tsx | 82, 83 |
| src/components/error/FatalErrorScreen.tsx | 52, 53 |

**Quando scattano:**  
- main.tsx: bottoni UI (reset app, reload).  
- App.tsx: bottone “RIAVVIA EMERGENZA” in error boundary (solo dopo errore fatale).  
- SecuritySectionContent/LegalSettings/SecuritySettings: azioni utente (logout/reset password).  
- MissionResetSection: reset missione.  
- GlobalErrorBoundary/FatalErrorScreen: dopo errore fatale.  

**Nessuno** è nel flusso “cambio tab” della bottom navigation (nessun clear al solo cambio route).

### B) removeItem su chiavi m1_* / video dismiss

| File | Riga | Chiave / contesto |
|------|------|--------------------|
| src/components/layout/BottomNavigation.tsx | 192–197, 404–464 | Solo **lettura** (VIDEO_DISMISSED_KEYS + storageKey props) |
| src/components/shared/BriefingFlipOverlay.tsx | 179 | **removeItem(storageKey)** solo se **isAdmin** (ADMIN_EMAILS) |
| src/components/home/HomeIntroVideo.tsx | 19, 43 | STORAGE_KEY = `m1_home_video_dismissed`; **removeItem** solo se **isAdmin** |
| src/components/map/MapIntroVideo.tsx | 19, 43 | STORAGE_KEY = `m1_map_video_dismissed`; **removeItem** solo se **isAdmin** |
| src/components/buzz/BuzzBriefingFlipOverlay.tsx | 13, 38 | STORAGE_KEY = `m1_buzz_video_modal_dismissed`; removeItem (admin/reset) |
| src/components/buzz/BuzzVideoModal.tsx | 13, 37 | idem |

**In-scope (2 file):**  
- **BriefingFlipOverlay.tsx** riga 179: `localStorage.removeItem(storageKey)` **solo** quando `userEmail` è in `ADMIN_EMAILS`. Per utenti non admin **non** viene chiamato removeItem.  
- **BottomNavigation.tsx**: nessun removeItem/clear.

**Fuori scope:**  
- **HomeIntroVideo.tsx** e **MapIntroVideo.tsx**: stesse chiavi `m1_home_video_dismissed` / `m1_map_video_dismissed`; removeItem solo per admin. Non risultano importati/rendered nelle route attuali (nessun `<HomeIntroVideo` / `<MapIntroVideo` trovato fuori dai file stessi).

### C) iOS WKWebView / WebsiteDataStore / evaluateJavaScript

- **ios/App/App/AppDelegate.swift:** `evaluateJavaScript` usato per iniettare script (stili, SSO hide, ecc.). **Nessun** `WKWebsiteDataStore.removeAllWebsiteData` o clear storage da native.

### D) window.location / location.reload / location.replace

- **UnifiedHeader.tsx** 275: `window.location.reload()` (azione utente).  
- **silentAutoUpdate.ts** 119, 122: `location.replace(currentUrl)` / `location.reload()` dopo **aggiornamento SW** (non al cambio tab).  
- **WouterRoutes.tsx** 1191: `window.location.href = '/home'` (bottone in una route).  
- Altri: login redirect, error boundary, reset missione, mailto, ecc. **Nessuno** nel flusso “tap tab → cambia route” della bottom bar (che usa `navigate()` da useWouterNavigation).

**Conclusione grep:**  
- **Nessun clear/remove** delle chiavi video dismiss nel flusso “cambio tab” **nei 2 file in scope**.  
- removeItem in-scope (BriefingFlipOverlay) solo per admin.  
- clear() e reload/replace sono fuori scope e legati a errori, logout, reset, SW update, non al tap sulla tab.

---

## FASE 1 — STRUMENTAZIONE (2 FILE, DEV ONLY)

### BriefingFlipOverlay.tsx

- **handleDismissForever:**  
  - Prima di setItem: `[VIDEO DEBUG] dismiss click` + storageKey  
  - Dopo setItem: `[VIDEO DEBUG] after set` + storageKey + valore da getItem + `href` + location.href  
- **shouldShowVideo:**  
  - `[VIDEO DEBUG] shouldShowVideo` + storageKey + valore da getItem + `href` + location.href  

### BottomNavigation.tsx

- **handleNavigationPWA** (prima di qualsiasi setShowXxx(true)):  
  - `[VIDEO DEBUG] navigation click` + link.path + `key` + storageKey + `val` + getItem(storageKey) + `href` + location.href  
- **Lifecycle (DEV only):**  
  - `pagehide` / `pageshow` / `visibilitychange` con href e (dove applicabile) `persisted` / `visibility`.

---

## FASE 2 — RIPRODUZIONE GUIDATA (DA FARE SU iOS)

1. Apri Home → video appare.  
2. Premi “Non mostrare più”.  
3. In console: verificare `[VIDEO DEBUG] after set … true` e stesso href (es. capacitor://localhost/...).  
4. Cambia tab (Map) e torna su Home.  
5. In console:  
   - `[VIDEO DEBUG] navigation click` … `val` … `href`  
   - `[VIDEO DEBUG] shouldShowVideo` … `val` … `href`  
   - Eventuali `pagehide` / `pageshow` / `visibilitychange`.  

**Criterio di prova:**  
- Se al ritorno su Home `val` è **NULL** ma **href/origin** restano **capacitor://localhost/...** e **non** compare `pageshow` con nuovo contesto → qualcuno fa **clear/remove** (da individuare fuori dai 2 file, es. SW, altro modulo).  
- Se compare **pageshow** con **persisted: false** o **reload** / **nuovo documento** → plausibile **hard reload / nuovo contesto** (es. WKWebView o SPA che ricarica).

---

## FASE 3 — DECISIONE

### CASO A) Clear/remove o reset in file FUORI SCOPE

**Stato:**  
- Dai grep **non** risulta nessun clear/remove delle chiavi `m1_*_video_dismissed` nel flusso “cambio tab” **nei 2 file in scope**.  
- removeItem in BriefingFlipOverlay solo per admin.  
- clear() e reload sono in main, App, Settings, error boundary, silentAutoUpdate, ecc. (tutti fuori scope).

**Conclusione:**  
- La causa più probabile è **fuori scope**:  
  - **WKWebView / processo iOS** che ricrea il contesto (storage vuoto) al cambio route o a visibility change, **oppure**  
  - **Altro modulo** (es. SW, silentAutoUpdate, o altro) che fa clear/reload in condizioni non ancora identificate dai grep.  

**Azione:**  
- **NON PATCHARE** i 2 file per “impedire clear” (non c’è clear in-scope).  
- Report con file + righe rilevanti (sopra).  
- Per andare oltre: riproduzione su iOS con i log sopra e eventuale estensione scope a **un solo file** (es. silentAutoUpdate, o punto di ingresso route) **solo dopo** aver visto dai log chi modifica lo storage o chi forza reload.

### CASO B) / CASO C)

- **Non applicabili** finché non si dimostra (con i log di FASE 2) che il reset avviene **in-scope** (BottomNavigation/BriefingFlipOverlay) o per **hard reload in-scope**.  
- Attualmente la navigazione tab è **già SPA** (motion.button + `navigate()`), senza window.location/href per il cambio tab.

---

## FASE 4 — FIX

**Nessun fix applicato.**  
Causa certa non in-scope; non si modifica nulla nei 2 file oltre alla strumentazione DEV già descritta.

---

## FASE 5 — TEST (DOPO EVENTUALE FIX FUTURO)

- [ ] Home → dismiss → Map → Home → video NON appare; localStorage resta `"true"`  
- [ ] Buzz → dismiss → Home → Buzz → video NON appare  
- [ ] Tab mai dismissata → video appare  
- [ ] Kill app → riapri → comportamento coerente (se storage persistente)  
- [ ] Logout/reset → comportamento coerente  

Se anche un solo test fallisce → rollback al tag safety.

---

## OUTPUT FINALE

### 1) Root cause

- **Non dimostrata al 100% in-scope.**  
- **Evidenza:**  
  - setItem subito dopo dismiss funziona (valore `"true"`).  
  - Dopo cambio tab + ritorno, getItem diventa NULL.  
  - Nei 2 file consentiti **non** c’è clear né removeItem per utenti non admin nel flusso “cambio tab”.  
- **Ipotesi:** reset da **contesto WKWebView** (nuovo documento/processo) oppure **clear/reload** da codice **fuori scope** (es. SW, visibility, altro).  
- **Prova successiva:** riproduzione su iOS con i log `[VIDEO DEBUG]` e pagehide/pageshow/visibilitychange per vedere se `val` diventa NULL con stesso href o dopo pageshow/reload.

### 2) Patch

- **Nessuna patch** (solo strumentazione DEV nei 2 file).  
- Diff: aggiunta log DEV e listener lifecycle in BottomNavigation; log DEV in BriefingFlipOverlay come sopra.

### 3) Checklist test

- Da eseguire **dopo** eventuale fix fuori scope (o fix in-scope solo se in futuro si dimostra causa in-scope).

### 4) Rollback

```bash
git reset --hard safety/ls-dismiss-persist-20260222_083118
```

---

## FILE COLPEVOLI (FUORI SCOPE) — PROPOSTA FIX

Se dai log su iOS risultasse che:

- **silentAutoUpdate** fa `location.replace`/`reload` al cambio tab (es. su visibility): limitare `executeRefresh` solo a “dopo aggiornamento SW” e **non** su semplice visibility change (o non eseguire replace/reload in Capacitor su cambio tab).  
- **Service Worker** fa clear o forza reload: escludere le chiavi `m1_*_video_dismissed` da eventuale clear o non fare full reload su navigazione SPA.  

Questi interventi richiedono **ampliamento scope** a uno specifico file (es. silentAutoUpdate.ts o SW); da fare **solo dopo** aver raccolto i log e aver identificato il punto esatto.
