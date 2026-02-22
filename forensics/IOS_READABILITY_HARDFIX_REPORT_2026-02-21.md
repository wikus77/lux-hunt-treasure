# iOS WKWebView — Hard Override Readability + Cache Verification — Report finale

**Data:** 2026-02-21  
**Target:** Solo app nativa iOS (Capacitor WKWebView). Nessuna modifica in `ios/**`.  
**Branch:** `fix/ios-wkwebview-readability-hardfix`  
**Tag rollback:** `safety/ios-wkwebview-readability-before-20260221_101409`

---

## 1) Lista file modificati / creati

| File | Azione |
|------|--------|
| `src/ios/iosReadabilityHotfix.ts` | **NUOVO** — style injection solo iOS native |
| `src/main.tsx` | Modificato — CSS stamp check + import e chiamata `installIOSReadabilityHotfix()` |

Nessun file in `ios/**` (native) modificato. Nessuna modifica a routing, auth, Buzz, Map, IAP.

---

## 2) Diff summary (punti chiave)

### `src/ios/iosReadabilityHotfix.ts` (nuovo)

- Export `installIOSReadabilityHotfix()`.
- Controllo: `Capacitor.isNativePlatform()` e `Capacitor.getPlatform() === 'ios'`; su web non fa nulla.
- Se esiste già `<style id="m1-ios-readability-hotfix">` esce senza duplicare.
- Crea `<style id="m1-ios-readability-hotfix">` e lo appende a `document.head` con CSS ad alta specificità e `!important` per:
  - **Portali:** `#m1-modal-portal`, `#m1-settings-section-portal`, `#m1-profile-portal` — `.text-muted-foreground`, `[class*="text-muted-foreground"]`, `.text-gray-400`, `.text-gray-500`, `.text-foreground`, placeholder, disabled (opacity 1, color bianco/muted).
  - **Reward popup:** `.m1-reward-zone-popup` — stesse regole.
  - **Radix/Vaul:** `[data-radix-dialog-content]`, `[data-radix-popover-content]`, `[data-radix-select-content]`, `[data-vaul-drawer]`, `.settings-modal` — stesse regole.
- Valori: muted/gray `rgba(255,255,255,0.85)`, foreground `#ffffff`, placeholder `rgba(255,255,255,0.50)`, disabled `opacity:1` + `rgba(255,255,255,0.70)`.
- Log una tantum: `console.log('📱 [iOS] m1-ios-readability-hotfix installed')` solo su iOS native.

### `src/main.tsx`

- **CSS stamp check** (solo log, non blocca nulla):
  - `console.log('Sheets:', [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(l => l.href))`
  - `console.log('Portals:', { modal: !!getElementById('m1-modal-portal'), settings: ..., profile: ... })`
- **Import e chiamata:** `import { installIOSReadabilityHotfix } from '@/ios/iosReadabilityHotfix';` e `installIOSReadabilityHotfix();` subito dopo lo stamp (prima degli altri import di CSS), così la hotfix è iniettata in testa e vale per tutto il runtime.

---

## 3) Comandi eseguiti

```bash
cd /Users/josephmule/lux-hunt-treasure
git status -sb && git rev-parse --short HEAD && git branch --show-current && git remote -v
git stash push -u -m "safety: preserve WIP before ios readability hardfix 20260221_101405"
BR="fix/ios-wkwebview-readability-hardfix"
git checkout -b "$BR"
TAG="safety/ios-wkwebview-readability-before-20260221_101409"
git tag "$TAG"
git stash pop

# Phase 3
rm -rf dist
npm run build
npx cap sync ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*App* 2>/dev/null
rm -rf ~/Library/Developer/Xcode/DerivedData/*M1SSION* 2>/dev/null
```

*(Build stamp già presente in main.tsx; non duplicato.)*

---

## 4) Rollback (1 comando)

```bash
git reset --hard safety/ios-wkwebview-readability-before-20260221_101409
```

Ripristino WIP (se serve):

```bash
git stash pop
```

---

## 5) Evidenza hotfix attiva su iOS e NON su web

- **Bundle:** In `dist/assets/index.CjUgwVpL.js` sono presenti:
  - `const STYLE_ID$1 = "m1-ios-readability-hotfix"`
  - `function installIOSReadabilityHotfix() { ... }`
  - `console.log("📱 [iOS] m1-ios-readability-hotfix installed")`
  - `installIOSReadabilityHotfix();` in esecuzione al load.
- **Comportamento:**
  - Su **web** (browser): `Capacitor.isNativePlatform()` è false → la funzione ritorna subito, nessuno `<style>` iniettato, nessun log "m1-ios-readability-hotfix installed".
  - Su **iOS native** (WKWebView): `Capacitor.isNativePlatform()` true e `getPlatform() === 'ios'` → viene creato `<style id="m1-ios-readability-hotfix">` in `<head>` e in console appare `📱 [iOS] m1-ios-readability-hotfix installed`.

In Xcode, con Run su device/simulator iOS, ci si aspetta:
- `🚨 [BUILD STAMP] main.tsx loaded at: <timestamp>`
- `Sheets: [...]` (href dei CSS caricati)
- `Portals: { modal: false, settings: false, profile: false }` (a cold start i portali non sono ancora creati)
- `📱 [iOS] m1-ios-readability-hotfix installed` (solo su app nativa iOS).

---

## 6) Verifica su device (FASE 4 — criteri PASS)

- **PASS** se:
  - Reward popup: “Abbiamo nascosto…”, “Più tardi”, “Non mostrare più” leggibili (bianco/muted chiaro).
  - Agent Profile edit: placeholder e label leggibili.
  - Settings sheet / sub-modali Radix: descrizioni e muted text non grigi scuri.
  - In console Xcode: BUILD STAMP con timestamp nuovo e log `m1-ios-readability-hotfix installed`.

Se **non** cambia:
- Probabile bundle/cache vecchio: disinstalla l’app da iPhone e fai di nuovo **Run** da Xcode (o ripeti clean DerivedData + reinstall).
- DerivedData clean da terminale (fuori sandbox):  
  `rm -rf ~/Library/Developer/Xcode/DerivedData/*App* ~/Library/Developer/Xcode/DerivedData/*M1SSION*`

---

## 7) Istruzione manuale (non codice)

**Per forzare l’uso del bundle nuovo su iPhone:**  
Disinstalla l’app dal device e fai **Run** da Xcode (⌘R) per reinstallare. In questo modo WKWebView caricherà il JS/CSS aggiornato incluso lo style injection `m1-ios-readability-hotfix`.

---

*Firma: Lovable Agent JLENIA*
