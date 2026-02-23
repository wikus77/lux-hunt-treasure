# INCIDENT REPORT — BUZZ crash (ERR-MLZ6UR79) + 99 Marker Rewards popup illegible

**Date:** 2026-02-23  
**Target:** iOS native (Capacitor WKWebView)  
**Scope:** Readability hotfix scoping + popup CSS; NO ios/** changes; NO BUZZ logic changes.

---

## ROOT CAUSE BUZZ CRASH (ReferenceError: Can't find variable: user)

- **File:** `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx`
- **Causa:** La dependency array di `handleScanComplete` conteneva `[user?.id]` ma nel componente **non era mai dichiarata** la variabile `user` (nessuna chiamata a useUnifiedAuth/useAuth/useAuthContext). Su iOS (e in strict mode) l’uso di un identificatore non dichiarato genera ReferenceError → ErrorBoundary con "Oops! Qualcosa è andato storto" e codice ERR-MLZ6URxx.
- **Fix applicato:** Aggiunto `import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';` e `const { user } = useUnifiedAuth();` all’inizio del componente. Comportamento BUZZ/MPE invariato; nessuna modifica a logiche BUZZ/Map/IAP/auth.

---

## Step 1 — Forensic verification (repo-side)

### ERR-MLZ6UR79
- **Source:** `src/components/error/ErrorBoundary.tsx`
- **Mechanism:** `generateErrorId() => 'ERR-' + Date.now().toString(36).toUpperCase()` — dynamic ID, not a fixed code.
- **UI:** "Oops! Qualcosa è andato storto" + codice mostrato quando `!DETAILED_ERRORS`.
- **Causa reale:** Qualsiasi eccezione React catturata dal boundary (serve stack da Safari Console su device per la root cause).

### Isolamento hotfix (da eseguire su device)
In Safari Develop → Console (sessione capacitor://localhost):
```js
window.__m1_stop_readability__?.();
window.__M1_DISABLE_READABILITY__ = true;
```
Poi riapri BUZZ. Se il crash sparisce ⇒ H1 (hotfix impatta BUZZ). Se resta ⇒ H2 (errore in altro componente).

### Popup "99 MARKER REWARDS"
- **Componente:** `src/components/rewards/RewardZonePopup.tsx`
- **Root reale:** `className="m1-reward-zone-popup fixed inset-0 z-[10003] ..."` (createPortal → `document.body`).
- **Testi secondari:** `text-white/90`, `text-white/70` (icona X), `text-sm`, ecc.
- **Selettore già in hotfix:** `.m1-reward-zone-popup` era in ROOT_SELECTORS; mancavano le varianti Tailwind `.text-white/90`, `.text-white/70` nella CSS injection per questo root.

---

## Step 2 — Patch applicata (solo `src/ios/iosReadabilityHotfix.ts`)

### A) Gating observer (no sweep su BUZZ)
- **Prima:** Ogni mutation su `document.documentElement` → `scheduleSweep()` → `sweep()` su tutti i ROOT_SELECTORS.
- **Dopo:** `scheduleSweep()` viene chiamato **solo** se la mutation riguarda un nodo che:
  - è **dentro** un target root, oppure
  - **è** un target root (es. nodo aggiunto con classe `.m1-reward-zone-popup`).
- **Helper:** `isInsideTargetRoot(node)`, `isTargetRootOrInside(node)` (gestisce target element o parent per text node, e `el.matches(sel)` per root appena aggiunte).
- **Effetto:** Su pagina BUZZ (nessun portal/sheet aperto) le mutation del DOM BUZZ non schedulano sweep ⇒ nessun hardening sul DOM BUZZ ⇒ riduzione rischio crash H1.

### B) Target roots popup
- Aggiunta CSS esplicita per **.m1-reward-zone-popup**:
  - `.text-white/90`, `.text-white/85`, `.text-white/80`, `.text-white/75`, `.text-white/70`
  - `.text-zinc-400`, `.text-zinc-500`
- Stesse regole colore/`-webkit-text-fill-color` già usate per MPE sheet (rgba 0.78).

### C) Hardening non distruttivo
- **Prima:** `harden()` su ogni elemento sotto i root (rimozione `opacity-*`, `opacity:1`, `filter:none`).
- **Dopo:** `harden()` applicato **solo** a elementi con contenuto testuale (`textContent?.trim()`) o con classe contenente `text-` (es. `text-white/90`).
- **Effetto:** Elementi puramente decorativi (es. `div` con `opacity-30` per glow) non vengono modificati; animazioni/layout non intaccate.

### D) Kill switch
- Invariati: `window.__M1_DISABLE_READABILITY__`, `window.__m1_stop_readability__()`.

---

## Rollback

- **Branch:** `safety/buzz-crash-readability-before-20260223-141037`
- **Tag:** `safety-buzz-crash-readability-before-20260223-141037`

```bash
git checkout safety/buzz-crash-readability-before-20260223-141037
# oppure
git reset --hard safety-buzz-crash-readability-before-20260223-141037
```

---

## File toccati

- `src/ios/iosReadabilityHotfix.ts` (observer gating + popup CSS + hardening non distruttivo)
- `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx` (fix crash: `user` dichiarato con `useUnifiedAuth()`)

---

## Comandi eseguiti

```bash
cd /Users/josephmule/lux-hunt-treasure
npm run build
npx cap sync ios
```

---

## Checklist test su iPhone

1. Cold start → Home → OK  
2. Apri BUZZ → nessun crash / nessun "Oops ERR-..."  
3. Trigger popup "99 marker rewards" → testi secondari leggibili  
4. MPE sheet → Run Scan → haptics start/step/complete/abort OK  
5. Nessun lag evidente aprendo modali/popup  

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
