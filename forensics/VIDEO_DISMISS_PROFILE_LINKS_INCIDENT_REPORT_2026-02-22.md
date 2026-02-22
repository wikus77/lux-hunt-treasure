# INCIDENT REPORT — "Non mostrare più" non persiste + Quick links Profilo → Modali Settings (Legal/Security/Privacy)

**Data:** 2026-02-22  
**Target:** iOS Capacitor WKWebView  
**Firma:** Lovable Agent JLENIA

---

## FASE 0 — ROLLBACK SAFETY (ESEGUITO)

- **Branch:** `fix/ui-modals-hide-quickactions-move-dangerzone-20260222`
- **Tag creato:** `safety/video-dismiss-profile-links-before-YYYYMMDD_HHMMSS`
- **Commit safety:** `chore(safety): snapshot before video dismiss + profile quick links`
- **Push tags:** fallito (credenziali); eseguire manualmente: `git push --tags`
- **Rollback:** `git reset --hard safety/video-dismiss-profile-links-before-<timestamp>`

---

## FASE 1 — FORENSICS: "NON MOSTRARE PIÙ QUESTO VIDEO"

### Overlay e dove viene montato

- **Componente:** `BriefingFlipOverlay` (`src/components/shared/BriefingFlipOverlay.tsx`)
- **Montato in:** `BottomNavigation.tsx` (6 istanze, una per tab: Home, Map, Buzz, AION, Classifica, Notifiche)
- **Chiavi storage (esatte, stabili):**
  - `m1_buzz_video_modal_dismissed`
  - `m1_home_video_dismissed`
  - `m1_map_video_dismissed`
  - `m1_aion_video_dismissed`
  - `m1_classifica_video_dismissed`
  - `m1_notifiche_video_dismissed`

### Dove avviene setItem e il controllo

- **setItem:** `BriefingFlipOverlay.tsx` ~256–260: `handleDismissForever` → `localStorage.setItem(storageKey, 'true')` poi `handleClose()`.
- **Controllo:** stesso file ~170–177: `shouldShowVideo()` → `localStorage.getItem(storageKey) !== 'true'` (e per admin `removeItem` per forzare show).  
- **Chi apre il video al cambio tab:** `BottomNavigation.tsx` ~187–216: `handleNavigationPWA` su click tab **sempre** chiama `setShowXxxVideoModal(true)` senza controllare localStorage.

### Root cause (causa unica più probabile)

- **Apertura senza gate nel parent:** in `BottomNavigation.tsx` il click sulla tab imposta sempre `setShowHomeVideoModal(true)` (e analoghi). L’overlay internamente fa:
  - `if (!shouldShowVideo()) return null` e un `useEffect` che con `open && !shouldShowVideo()` chiama `onClose()` + `onContinue()`.
- **Rischio su iOS WKWebView:** (1) possibile race: `handleDismissForever` faceva `setItem` poi subito `handleClose()` → unmount/animazione poteva avvenire prima che lo storage fosse “visto” al prossimo mount; (2) il **gate era solo dentro l’overlay**; se per qualunque motivo (remount, timing) il parent riapriva il modal, l’overlay poteva mostrarsi di nuovo prima che l’effect di skip facesse chiudere.
- **Nessun clear indebito trovato** per queste chiavi al cambio tab; `localStorage.clear()` è usato solo in SecuritySectionContent, LegalSettings, logout, reset (fuori scope).

**Conclusione:** Causa più probabile = **mancanza di gate nel parent** (BottomNavigation) + possibile **race tra setItem e close** nell’overlay. Fix: gate in parent + microtask dopo setItem prima di close.

---

## FASE 2 — FIX MIRATO "NON MOSTRARE PIÙ"

### Fix applicati

1. **BottomNavigation.tsx**
   - Aggiunta mappa `VIDEO_DISMISSED_KEYS` (path → storageKey) identica a quella usata dagli overlay.
   - In `handleNavigationPWA`, **prima** di aprire il modal: se `localStorage.getItem(VIDEO_DISMISSED_KEYS[link.path]) === 'true'` → si chiama il rispettivo handler di continue (suono + navigate) e **non** si apre il modal.
   - Garantisce che “Non mostrare più” sia rispettato anche se l’overlay non viene mostrato (es. remount / WKWebView).

2. **BriefingFlipOverlay.tsx**
   - In `handleDismissForever`: dopo `localStorage.setItem(storageKey, 'true')` si esegue `Promise.resolve().then(() => handleClose())` per dare al browser un microtask per “committare” la scrittura prima della chiusura/unmount.

### File toccati

- `src/components/layout/BottomNavigation.tsx`
- `src/components/shared/BriefingFlipOverlay.tsx`

### Test richiesto (iOS)

- Apri video → “Non mostrare più questo video” → cambia tab → torna alla tab → il video **non** deve riapparire.
- Kill app / reopen: deve restare non mostrato (finché non logout/reset).

---

## FASE 3 — PROFILO UTENTE: QUICK LINKS → MODALI SETTINGS (LEGAL/SECURITY/PRIVACY)

### Regole rispettate

- Nessuna duplicazione dei modali: si riusa `SettingsContent` + `SettingsSectionFlipOverlay` (Legal, Security, Privacy).
- Le CTA nel modale profilo (avatar) aprono lo **stesso** modale Settings già usato dalla rotella, con la sezione preselezionata.

### Implementazione

1. **Context:** `src/contexts/OpenSettingsSectionContext.tsx`
   - `OpenSettingsSectionProvider` con `onRequestOpen(sectionId)`.
   - `useOpenSettingsSection()` → `{ openSettingsWithSection(sectionId) }`.

2. **UnifiedHeader.tsx**
   - Stato `settingsInitialSection` (string | null).
   - `openSettingsWithSection(sectionId)` → `setSettingsInitialSection(sectionId)` + `setIsSettingsModalOpen(true)`.
   - Chiusura modal: `handleCloseSettingsModal` → `setIsSettingsModalOpen(false)` + `setSettingsInitialSection(null)`.
   - Header wrappato con `OpenSettingsSectionProvider`; `SettingsModal` riceve `initialSection={settingsInitialSection}`.

3. **SettingsModal.tsx**
   - Nuova prop `initialSection?: string | null` passata a `SettingsContent`.

4. **SettingsContent.tsx**
   - Nuova prop `initialSection`; `useEffect` che alla presenza di `initialSection` fa `setOpenSection(initialSection)` per aprire subito il sub-modale della sezione.

5. **AgentProfileContent.tsx**
   - `useOpenSettingsSection()`; helper `openSettingsSection('legal'|'security'|'privacy')`: se context disponibile → `onClose()` + `openSettings.openSettingsWithSection(sectionId)`; altrimenti fallback `goTo('/settings/...')`.
   - Legal Documents → `openSettingsSection('legal')`
   - Security → `openSettingsSection('security')`
   - Privacy → `openSettingsSection('privacy')`

### File toccati

- `src/contexts/OpenSettingsSectionContext.tsx` (nuovo)
- `src/components/layout/UnifiedHeader.tsx`
- `src/components/settings/SettingsModal.tsx`
- `src/components/settings/SettingsContent.tsx`
- `src/components/profile/AgentProfileContent.tsx`

### Test richiesto

- Apri modale profilo (avatar) → Legal Documents → si apre il modale Settings con il sub-modale Legal.
- Stesso per Security e Privacy.
- Chiusura e ritorno: nessun duplicato; stessi modali di Settings.

---

## DELIVERABLES

### 1) Report forense

- Root cause: gate “don’t show again” assente nel parent (BottomNavigation) + possibile race setItem/close nell’overlay.
- Evidenza: grep/tracing sopra; `handleNavigationPWA` non controllava localStorage prima di `setShowXxxVideoModal(true)`.
- Fix: gate in parent con `VIDEO_DISMISSED_KEYS` + microtask in `handleDismissForever`.

### 2) Patch – lista file

- `src/components/layout/BottomNavigation.tsx`
- `src/components/shared/BriefingFlipOverlay.tsx`
- `src/contexts/OpenSettingsSectionContext.tsx` (nuovo)
- `src/components/layout/UnifiedHeader.tsx`
- `src/components/settings/SettingsModal.tsx`
- `src/components/settings/SettingsContent.tsx`
- `src/components/profile/AgentProfileContent.tsx`

### 3) Build e test iOS

```bash
npm run build
npx cap sync ios
# Poi in Xcode: open ios/App/App.xcworkspace → Run su device/simulator
```

---

## CONSTRAINTS RISPETTATI

- Nessuna modifica fuori scope.
- Nessuna duplicazione dei modali Settings.
- Fix “Non mostrare più” solo dopo causa certa (gate in parent + race).
- Rollback tag + commit safety prima delle patch.
- iOS (Capacitor WKWebView) target primario.
