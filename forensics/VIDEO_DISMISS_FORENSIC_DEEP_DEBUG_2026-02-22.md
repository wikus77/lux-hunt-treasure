# INCIDENT REPORT — “Non mostrare più questo video” riappare — Verifica forense

**Data:** 2026-02-22  
**Target:** iOS Capacitor WKWebView  
**Scope:** SOLO `BottomNavigation.tsx`, `BriefingFlipOverlay.tsx`  
**Nessun fix applicato** finché la causa non è certa al 100%.

---

## FASE 0 — ROLLBACK SAFETY (ESEGUITO)

- **Commit:** `chore(safety): before forensic video dismiss deep debug` (73771ecb)
- **Tag creato:** `safety/video-dismiss-forensic-20260222_070946`
- **Push:** non eseguito (come da istruzioni)
- **Rollback immediato:**  
  `git reset --hard safety/video-dismiss-forensic-20260222_070946`

---

## FASE 1 — LOG TEMPORANEI (SOLO DEV)

Aggiunti 4 log racchiusi in `import.meta.env.DEV`:

1. **handleDismissForever (BriefingFlipOverlay.tsx)**  
   - Prima di `safeSet`: `[VIDEO DEBUG] dismiss click` + `storageKey`  
   - Dopo `safeSet`: `[VIDEO DEBUG] after set` + `storageKey` + `localStorage.getItem(storageKey)`

2. **shouldShowVideo() (BriefingFlipOverlay.tsx)**  
   - All’ingresso: `[VIDEO DEBUG] shouldShowVideo` + `storageKey` + valore letto da localStorage

3. **handleNavigationPWA (BottomNavigation.tsx)**  
   - Prima del gate: `[VIDEO DEBUG] navigation` + `link.path` + `storageKey` + `safeGet(storageKey)`

**Come riprodurre:** build con `import.meta.env.DEV === true` (es. `npm run dev` o build dev), oppure build production e verificare che i log non compaiano. Su iOS: Safari Remote Debugging / Console per vedere i log da WKWebView.

---

## FASE 2 — RIPRODUZIONE GUIDATA (DA FARE SU DISPOSITIVO)

Flusso da eseguire su iOS (simulatore o device) con console attaccata:

1. Apri Home → si apre il video (se non già dismissato).
2. Premi “Non mostrare più questo video”.
3. Controlla in console:
   - `[VIDEO DEBUG] dismiss click m1_home_video_dismissed`
   - `[VIDEO DEBUG] after set m1_home_video_dismissed true` (oppure `null` se write fallisce)
4. Cambia tab (es. Map).
5. Torna su Home (tap su tab Home).
6. Controlla in console:
   - `[VIDEO DEBUG] navigation /home m1_home_video_dismissed <valore>`
   - Se valore è `true` → il gate non deve aprire il modal (solo navigate).
   - Se valore è `null` o altro → il parent apre il modal; possibile causa: write non persistito o chiave diversa/origin diversa.
7. Se il video riappare, controlla:
   - `[VIDEO DEBUG] shouldShowVideo m1_home_video_dismissed <valore>`  
   Se qui il valore è `null` mentre dopo “dismiss” avevi visto `true`, la causa è **persistenza** (es. WKWebView/origin) o **clear** da altro codice.

Da riportare:
- Valore salvato in localStorage subito dopo “Non mostrare più”.
- Valore letto in `shouldShowVideo` al ritorno su Home.
- Valore letto in `handleNavigationPWA` al tap su Home.
- Se il parent riapre comunque il modal (e in che ordine compaiono i log).

---

## FASE 3 — POSSIBILI CAUSE VERIFICATE (EVIDENZA CODICE)

### A) storageKey mismatch  
**Esito:** Nessun mismatch.  
- `BottomNavigation.tsx`: `VIDEO_DISMISSED_KEYS` (righe 187–193) e le 6 istanze di `<BriefingFlipOverlay storageKey="...">` (righe 392, 404, 416, 428, 440, 452) usano le stesse stringhe:  
  `m1_buzz_video_modal_dismissed`, `m1_home_video_dismissed`, `m1_map_video_dismissed`, `m1_aion_video_dismissed`, `m1_classifica_video_dismissed`, `m1_notifiche_video_dismissed`.

### B) localStorage sovrascritto altrove  
**Esito:** Stesse chiavi usate da altri componenti (fuori scope, solo nota).  
- `HomeIntroVideo.tsx` (riga 19): `m1_home_video_dismissed`.  
- `MapIntroVideo.tsx` (riga 19): `m1_map_video_dismissed`.  
- Se l’utente è in `ADMIN_EMAILS`, in entrambi c’è `localStorage.removeItem(STORAGE_KEY)` al mount (HomeIntroVideo riga 42, MapIntroVideo riga 42).  
- Per utenti admin, il “riapparire” può essere causato da questi removeItem. Per utenti non admin, non risulta altro codice che scriva/rimuova queste chiavi (solo lettura/scrittura in overlay e parent).

### C) localStorage.clear() al cambio tab  
**Esito:** Nessun clear legato al cambio tab nei 2 file in scope.  
- `localStorage.clear()` è usato in: `main.tsx` (reset app), `SecuritySectionContent.tsx`, `App.tsx`, `LegalSettings.tsx`, `SecuritySettings.tsx`, `MissionResetSection.tsx`, `GlobalErrorBoundary.tsx`, `FatalErrorScreen.tsx`.  
- Nessuno di questi è nel flusso “cambio tab” della bottom navigation; non risultano clear al solo cambio route/tab.

### D) Overlay montato con key React diversa  
**Esito:** Nessuna `key` sulle istanze di `BriefingFlipOverlay`.  
- In `BottomNavigation.tsx` le 6 `<BriefingFlipOverlay ... />` non hanno prop `key`.  
- La `key={link.path}` (riga 303) è sul bottone della tab, non sull’overlay.  
- Quindi non c’è remount dell’overlay dovuto a key che cambia.

### E) Stato booleano non resettato nel parent  
**Esito:** Coerente.  
- `onClose` di ogni overlay è `() => setShowXxxVideoModal(false)`.  
- Alla chiusura (X o “Non mostrare più”) viene chiamato `handleClose()` che dopo 280ms chiama `onClose()` e `onContinue()`.  
- Quindi lo stato del parent viene messo a `false`. Al ritorno sulla tab, è `handleNavigationPWA` che decide se chiamare `setShowXxxVideoModal(true)`; il gate usa `safeGet(storageKey) === 'true'` e, in quel caso, non apre il modal.

### F) Doppia istanza di BriefingFlipOverlay  
**Esito:** Una sola istanza per tab.  
- In `BottomNavigation.tsx` ci sono esattamente 6 istanze di `BriefingFlipOverlay` (Buzz, Home, Map, Aion, Classifica, Notifiche), ognuna con `open={showXxxVideoModal}` e `storageKey` univoca.  
- Non risultano altri posti che montano `BriefingFlipOverlay` per le stesse chiavi nel flusso tab (altri usi sono ForumPage, componenti Buzz separati).

### G) WKWebView / origin diversa tra tab  
**Esito:** Non verificabile dal solo codice.  
- In Capacitor, l’origin della WebView è tipicamente fissa (es. `capacitor://localhost`).  
- Se in alcuni casi l’app usasse origin o storage diversi (iframe, altro WebView), il valore scritto in un contesto potrebbe non essere visibile nell’altro.  
- **Verifica possibile solo con i log su dispositivo:** dopo “after set” deve comparire `true`; al tap su Home, “navigation” deve mostrare ancora `true`. Se “navigation” mostra `null`, la causa probabile è persistenza/origin.

---

## FASE 4 — FIX

**Nessun fix applicato.**  
Causa non dimostrata al 100% senza riproduzione su dispositivo e lettura dei log.  
I log aggiunti in FASE 1 servono a ottenere evidenza (valori letti/scritti e ordine degli eventi); in base a quella si potrà applicare un fix minimo solo nei 2 file consentiti.

---

## FASE 5 — TEST (DOPO EVENTUALE FIX)

Quando ci sarà un fix, test obbligatori:

- [ ] Home → dismiss → cambia tab → torna → video NON appare  
- [ ] Buzz → dismiss → cambia tab → torna → video NON appare  
- [ ] Tab mai dismissata → video appare  
- [ ] Kill app → riapri → video NON appare se già dismissato  
- [ ] Logout (se presente) → comportamento coerente  

Se anche un solo test fallisce → rollback al tag forensic.

---

## DIFF ATTUALE (SOLO LOG, 2 FILE)

- **`src/components/shared/BriefingFlipOverlay.tsx`**  
  - In `shouldShowVideo`: lettura localStorage in variabile + log `[VIDEO DEBUG] shouldShowVideo` (solo DEV).  
  - In `handleDismissForever`: log `[VIDEO DEBUG] dismiss click` prima di `safeSet`, log `[VIDEO DEBUG] after set` dopo `safeSet` (solo DEV).

- **`src/components/layout/BottomNavigation.tsx`**  
  - In `handleNavigationPWA`: log `[VIDEO DEBUG] navigation` con path, storageKey e valore `safeGet(storageKey)` (solo DEV), prima del gate.

Nessun altro file modificato. Nessun refactor, nessuna nuova logica.

---

## COMANDO ROLLBACK

```bash
git reset --hard safety/video-dismiss-forensic-20260222_070946
```

Poi, se serve, `npm run build` e `npx cap sync ios`.
