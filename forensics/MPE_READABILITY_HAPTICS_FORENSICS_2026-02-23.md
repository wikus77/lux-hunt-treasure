# MPE Readability + Haptics — Forensics & Fix Report

**Date:** 2026-02-23  
**Target:** iOS native (Capacitor WKWebView)  
**Branch:** fix/mpe-readability-haptics-20260223-1457  
**Rollback tag:** safety/mpe-readability-haptics-before-20260223-1457  

---

## FASE 1 — Forensics

### 1) File MPE trovati (percorsi)

- `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx` — Sheet (titolo, idle/scan/report, RUN SCAN, Abort)
- `src/components/missionProfileEngine/MissionProfileEngineScan.tsx` — Scan HUD (step, Reading Intel…, Abort Scan)
- `src/components/missionProfileEngine/MissionProfileEnginePill.tsx` — Pill sotto BUZZ
- `src/components/missionProfileEngine/MissionProfileEngineRing.tsx` — Ring gauge report
- `src/lib/missionProfileEngine/buildReportFromSnapshot.ts` — Build report
- `src/lib/missionProfileEngine/scanTimings.ts` — Step timings
- `src/lib/missionProfileEngine/types.ts` — Types
- i18n: `src/locales/en/common.json` (mission_profile_engine_*, RUN SCAN, Abort Scan, Reading Intel…)

### 2) Root reali (portal) su iOS

- **MPE sheet:** non è un createPortal; è un `<motion.div data-m1-mpe-sheet="true" className="fixed ...">` renderizzato nel tree React (BuzzPage). Root effettivo in DOM: **`[data-m1-mpe-sheet]`** (attributo `data-m1-mpe-sheet="true"`).
- **Popup 99 marker rewards:** `RewardZonePopup.tsx` con createPortal(..., document.body). Root: **`.m1-reward-zone-popup`** (className sul wrapper).

### 3) Readability hotfix

- `ROOT_SELECTORS` include già `[data-m1-mpe-sheet]` e `.m1-reward-zone-popup`.
- Observer schedula sweep solo se la mutation riguarda un nodo dentro uno di quei root o un nodo che è esso stesso un root (portalAdded/targetInRoot).
- **Modifiche applicate:**
  - CSS più forte: base con `text-shadow: 0 1px 10px rgba(0,0,0,0.55)`; regole esplicite per h1/h2/h3/p/span/label/button in `[data-m1-mpe-sheet]` e `.m1-reward-zone-popup`; eccezione `.text-cyan-*` con rgba(0,229,255,0.95).
  - Harden “text-only” esteso: considerati testuali anche tag P, SPAN, H1–H6, LABEL, BUTTON, A, LI, SMALL, STRONG, EM e elementi con `aria-label` o `role="button"`.
  - Log DEV: `[iOSReadability] sweep scheduled (reason=...)`, `harden root=... nodes=...`, `sweep done roots=...`.

### 4) Haptics forensics

- **Sheet:** `hapticScanStart` → `impact(Medium)` (prima Light); `hapticScanSuccess` → `notification(SUCCESS)`; `hapticScanAbort` → `notification(WARNING)`. Guard: `isIosNative()` (Capacitor.isNativePlatform && platform === 'ios'). Log DEV: `[MPE][HAPTICS] start|success|abort`.
- **Scan:** `hapticStepComplete(stepIndex, totalSteps)` → step 0–2 `selectionChanged()`, step 3 (ultimo) `impact(Medium)`. Tick progressivo: setTimeout auto-riprogrammato con bande 0–33% Light/1400ms, 34–66% Medium/1100ms, 67–100% Heavy/850ms. Ref per cleanup; cleanup su unmount (scan complete/abort). Log DEV: `[MPE][HAPTICS] tick p=... style=...`, `stepComplete idx=...`.
- **Self-test (solo DEV):** `window.__m1_haptics_test__()` esegue notification(Success) + impact(Heavy) + selectionChanged() per verificare che il device senta gli haptics.

---

## FASE 2 — Patch applicate

### File toccati

| File | Modifiche |
|------|-----------|
| `src/ios/iosReadabilityHotfix.ts` | CSS: base + text-shadow; regole h1/h2/h3/p/span/label/button per MPE e popup; .text-cyan-*; harden con TEXT_TAGS + aria-label/role; log DEV sweep/harden. |
| `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx` | hapticScanStart → impact(Medium); log DEV start/success/abort. |
| `src/components/missionProfileEngine/MissionProfileEngineScan.tsx` | hapticStepComplete(stepIndex, totalSteps) con selectionChanged per step 0–2 e impact(Medium) per step 3; hapticProgressTick(style, pct); effect “progressive tick” (setTimeout chain 1400/1100/850ms, Light/Medium/Heavy); ref progressPctRef e progressiveTickTimeoutRef; cleanup su unmount; __m1_haptics_test__ (DEV); log DEV tick/stepComplete. |

### Diff breve

- **iosReadabilityHotfix.ts:** Aggiunte 2 blocchi CSS (titoli/testi MPE+popup, .text-cyan); costante TEXT_TAGS; harden con isTextTag e hasAriaLabel; isDev + log in sweep e in observer.
- **MissionProfileEngineSheet.tsx:** hapticScanStart da Light a Medium; tre log DEV (start, success, abort).
- **MissionProfileEngineScan.tsx:** hapticStepTick sostituito da hapticStepComplete + hapticProgressTick; effect progressive tick; effect __m1_haptics_test__; progressPctRef e progressiveTickTimeoutRef; advance chiama hapticStepComplete(currentIndex, steps.length).

---

## FASE 3 — Comandi eseguiti

```bash
cd /Users/josephmule/lux-hunt-treasure
npm run build
npx cap sync ios
```

---

## Rollback

```bash
git reset --hard safety/mpe-readability-haptics-before-20260223-1457
```

---

## FASE 4 — Checklist verifica iPhone (PASS/FAIL)

1. BUZZ → apri MPE sheet → titolo e step leggibili (bianco/ciano, niente testo scuro).
2. RUN SCAN: start percepibile (Medium); tick progressivo (Light → Medium → Heavy) percepibile; step complete percepibile; success a fine percepibile.
3. Abort Scan: warning percepibile + stop immediato.
4. Popup “99 marker rewards”: testi leggibili (niente grigio illeggibile).
5. Nessun crash / nessun lag; BUZZ/Home/nav senza regressioni.

---

## Esito

**Da validare su device.** Patch applicate; build e sync OK. Verificare su iPhone reale e marcare PASS/FAIL rispetto alla checklist sopra.

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
