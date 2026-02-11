# Android Home Verification Report
**Date:** 2026-02-10
**Status:** CRASH POINTS CONFIRMED

---

## 1. CONFIRMED CRASH POINTS

### 1.1 PRIMARY CRASH: `useGLTF()` in PrizeVision.tsx

**File:** `src/components/command-center/home-sections/PrizeVision.tsx`
**Line:** 37

```typescript
function MiniAgentModel({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);  // ❌ THROWS when GLB not found
  // ...
}
```

**Crash Flow:**
1. `useEffect` at line 93 calls `loadAgent()`
2. `loadAgent()` calls `getDefaultAgent()` → returns `glbPath: '/models/agent/agent_male.glb'`
3. `MiniAgentModel` renders at line 465 inside `<Suspense fallback={null}>`
4. `useGLTF('/models/agent/agent_male.glb')` at line 37 attempts to load
5. THREE.js GLTFLoader fails → **THROWS unhandled exception**
6. **No ErrorBoundary wraps the Canvas** → propagates to global ErrorBoundary
7. Global ErrorBoundary shows "Oops! Qualcosa è andato storto"

**Evidence:** The `<Suspense fallback={null}>` at line 464 does NOT catch loader errors, only lazy loading states.

### 1.2 SECONDARY ISSUE: Images without onError

**File:** `src/components/command-center/home-sections/PrizeVision.tsx`
**Lines:** 312-316

```typescript
<img
  src={missionPrizeImages[currentImageIndex]}  // ❌ NO onError handler
  alt={`M1SSION Prize ${currentImageIndex + 1}`}
  className="w-full h-full object-cover rounded-lg shadow-lg"
/>
```

**Impact:** Missing images won't crash the app but will show broken image icons.

### 1.3 EXCLUDED IMAGE PATHS

**Lines 17-28 - All paths reference EXCLUDED folders:**

| Path | Excluded By |
|------|-------------|
| `/assets/prizes/auto-reali/ AUTO NASCOSTA.png` | `auto-reali` pattern |
| `/assets/prizes/auto-reali/PORSCHE_CAYENNE_COUPE.png` | `auto-reali` pattern |
| `/assets/prizes/99premi/APPLE WATCH_ULTRA.png` | `99premi` pattern |
| `/assets/prizes/99premi/IPAD_PRO.png` | `99premi` pattern |
| `/assets/prizes/gioielli-reali/collana_pietra.png` | `gioielli-reali` pattern |
| `/assets/prizes/gioielli-reali/ANELLO_04.png` | `gioielli-reali` pattern |
| `/assets/prizes/orologi-reali/PANERAI.png` | `orologi-reali` pattern |
| `/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png` | `orologi-reali` pattern |
| `/assets/prizes/borse-reali/CHANEL.png` | `borse-reali` pattern |
| `/assets/prizes/borse-reali/HERMES_BIRKIN_COCCODRILLO.png` | `borse-reali` pattern |

### 1.4 HOME INTRO VIDEO

**File:** `src/components/home/HomeIntroVideo.tsx`
**Line:** 18

```typescript
const VIDEO_SRC = '/assets/video/HOME-BRIF-VIDEO.mp4';  // ❌ EXCLUDED by *.mp4
```

**Note:** This component HAS an `onError` handler (line 100-105) that gracefully skips to `onComplete()`.

---

## 2. DEBUG PROCEDURE (NO PATCH)

### Chrome Remote Debugging (WebView)

```bash
# 1. Enable USB debugging on Android device
# Settings → Developer Options → USB Debugging: ON

# 2. Connect device via USB-C (data cable)

# 3. On Mac, open Chrome and navigate to:
chrome://inspect/#devices

# 4. Find "M1SSION" WebView and click "inspect"

# 5. In DevTools Console, look for:
#    - "Could not load /models/agent/*.glb"
#    - "THREE.GLTFLoader" errors
#    - "Uncaught Error in component"
```

### ADB Logcat

```bash
# Clear logs
adb logcat -c

# Start logging (filter for WebView/JS errors)
adb logcat | grep -E "chromium|WebView|Error|Exception" | tee ~/Desktop/android_home.log

# Reproduce crash by opening Home

# Stop logging (Ctrl+C) and review ~/Desktop/android_home.log
```

---

## 3. ASSET TABLE: LOCAL vs EXCLUDED

### GLB Models (3D)

| Asset | Status | Reason |
|-------|--------|--------|
| `/models/agent/agent_male.glb` | ❌ EXCLUDED | `*.glb` + `models` pattern |
| `/models/agent/agent_female01.glb` | ❌ EXCLUDED | `*.glb` + `models` pattern |
| All `/models/**/*.glb` | ❌ EXCLUDED | `*.glb` + `models` pattern |

### Videos (MP4)

| Asset | Status | Reason |
|-------|--------|--------|
| `/assets/video/HOME-BRIF-VIDEO.mp4` | ❌ EXCLUDED | `*.mp4` pattern |
| All `*.mp4` files | ❌ EXCLUDED | `*.mp4` pattern |

### Prize Images

| Folder | Status | Reason |
|--------|--------|--------|
| `/assets/prizes/auto-reali/*` | ❌ EXCLUDED | `auto-reali` pattern |
| `/assets/prizes/99premi/*` | ❌ EXCLUDED | `99premi` pattern |
| `/assets/prizes/gioielli-reali/*` | ❌ EXCLUDED | `gioielli-reali` pattern |
| `/assets/prizes/orologi-reali/*` | ❌ EXCLUDED | `orologi-reali` pattern |
| `/assets/prizes/borse-reali/*` | ❌ EXCLUDED | `borse-reali` pattern |
| `/assets/prizes/altri/*` | ✅ LOCAL | Not excluded |
| `/assets/prizes/auto/*` | ✅ LOCAL | Not excluded |
| `/assets/prizes/borse/*` | ✅ LOCAL | Not excluded |
| `/assets/prizes/orologi/*` | ✅ LOCAL | Not excluded |

### Core UI Assets

| Folder | Status |
|--------|--------|
| `/lovable-uploads/*` | ✅ LOCAL |
| `/assets/crew/*` | ✅ LOCAL |
| `/assets/scratch/*` | ✅ LOCAL |
| `/assets/m1ssion-prize/*` | ✅ LOCAL |

---

## 4. AAB SIZE CONSTRAINT CONFIRMATION

**Current AAB Size:** 182MB
**Limit:** 200MB
**Headroom:** ~18MB

**Cannot Re-include (Total ~1.65GB):**
- 3D Models: ~1.4GB
- Videos: ~150MB
- HD Prize Images: ~103MB

**Conclusion:** Re-inclusion is NOT an option. Remote asset loading required.

---

## 5. CURRENT ignoreAssetsPattern

**File:** `android/app/build.gradle`

```groovy
ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~:*.mp4:*.mov:*.webm:*.glb:models:99premi:auto-reali:orologi-reali:borse-reali:gioielli-reali'
```

---

## 6. FIX REQUIREMENTS

### Immediate (Phase 2: Crash-Proof)
1. Wrap Canvas/3D in ErrorBoundary with fallback UI
2. Add `onError` handlers to all `<img>` tags
3. Create `useSafeGLTF` hook that doesn't throw

### Full Parity (Phase 3: Remote Assets)
1. Resolve GLB paths to CDN on Android
2. Resolve video paths to CDN on Android
3. Resolve HD image paths to CDN on Android
4. Keep iOS using local paths (no changes)

---

*Verification completed: 2026-02-10*
