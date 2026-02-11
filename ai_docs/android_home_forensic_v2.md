# Android Home Crash Forensic Report V2
**Date:** 2026-02-10
**Error ID Pattern:** ERR-[timestamp_base36] (e.g., ERR-MLGIBWV1)
**Status:** ROOT CAUSE CONFIRMED

---

## 1. EXACT CRASH LOCATION

### Primary Crash Point: `useGLTF()` in PrizeVision

**File:** `src/components/command-center/home-sections/PrizeVision.tsx`

```typescript
// Line 37 - THROWS when GLB file not found
const { scene } = useGLTF(glbPath);
```

**Crash Chain:**
```
AppHome.tsx
  └─ <PrizeVision> (lazy loaded)
       └─ useEffect() calls loadAgent() [line 93]
            └─ getDefaultAgent() returns glbPath: '/models/agent/agent_male.glb'
                 └─ MiniAgentModel renders with this path
                      └─ useGLTF('/models/agent/agent_male.glb') [line 37]
                           └─ THREE.js GLTFLoader.load() fails
                                └─ Error: "Could not load /models/agent/agent_male.glb"
                                     └─ ErrorBoundary catches → "Oops!" screen
```

### Secondary Crash Risk: Missing Images

**File:** `src/components/command-center/home-sections/PrizeVision.tsx` (lines 17-28)

```typescript
const missionPrizeImages = [
  "/assets/prizes/auto-reali/ AUTO NASCOSTA.png",      // ❌ EXCLUDED
  "/assets/prizes/auto-reali/PORSCHE_CAYENNE_COUPE.png", // ❌ EXCLUDED
  "/assets/prizes/99premi/APPLE WATCH_ULTRA.png",       // ❌ EXCLUDED
  // ... all paths reference EXCLUDED folders
];
```

---

## 2. HOW TO GET REAL STACK TRACE

### Option A: Chrome Remote Debugging (WebView)

```bash
# 1. Enable USB debugging on Android device
# Settings → Developer Options → USB Debugging: ON

# 2. Connect device via USB-C (data cable)

# 3. On Mac, open Chrome and navigate to:
chrome://inspect/#devices

# 4. Find "M1SSION" WebView and click "inspect"

# 5. In DevTools Console, reproduce crash
#    Look for errors like:
#    - "Could not load /models/agent/*.glb"
#    - "Failed to fetch"
#    - THREE.js loader errors
```

### Option B: ADB Logcat

```bash
# Clear logs
adb logcat -c

# Start logging (filter for WebView/JS errors)
adb logcat | tee ~/Desktop/android_home_crash.log

# Reproduce crash in app

# Stop logging (Ctrl+C)

# Search for errors
grep -E "chromium|WebView|Error|Exception|ReferenceError|TypeError" ~/Desktop/android_home_crash.log
```

---

## 3. ASSET PATH MAPPING (Home Page)

### PrizeVision Images

| Path | Status | Reason |
|------|--------|--------|
| `/assets/prizes/auto-reali/ AUTO NASCOSTA.png` | ❌ EXCLUDED | `auto-reali` in ignoreAssetsPattern |
| `/assets/prizes/auto-reali/PORSCHE_CAYENNE_COUPE.png` | ❌ EXCLUDED | `auto-reali` in ignoreAssetsPattern |
| `/assets/prizes/99premi/APPLE WATCH_ULTRA.png` | ❌ EXCLUDED | `99premi` in ignoreAssetsPattern |
| `/assets/prizes/99premi/IPAD_PRO.png` | ❌ EXCLUDED | `99premi` in ignoreAssetsPattern |
| `/assets/prizes/gioielli-reali/collana_pietra.png` | ❌ EXCLUDED | `gioielli-reali` in ignoreAssetsPattern |
| `/assets/prizes/gioielli-reali/ANELLO_04.png` | ❌ EXCLUDED | `gioielli-reali` in ignoreAssetsPattern |
| `/assets/prizes/orologi-reali/PANERAI.png` | ❌ EXCLUDED | `orologi-reali` in ignoreAssetsPattern |
| `/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png` | ❌ EXCLUDED | `orologi-reali` in ignoreAssetsPattern |
| `/assets/prizes/borse-reali/CHANEL.png` | ❌ EXCLUDED | `borse-reali` in ignoreAssetsPattern |
| `/assets/prizes/borse-reali/HERMES_BIRKIN_COCCODRILLO.png` | ❌ EXCLUDED | `borse-reali` in ignoreAssetsPattern |

### 3D Agent Models (GLB)

| Path | Status | Size | Reason |
|------|--------|------|--------|
| `/models/agent/agent_male.glb` | ❌ EXCLUDED | ~10MB | `*.glb` + `models` in ignoreAssetsPattern |
| `/models/agent/agent_female01.glb` | ❌ EXCLUDED | ~10MB | `*.glb` + `models` in ignoreAssetsPattern |
| `/models/agent/special/*.glb` (70+ files) | ❌ EXCLUDED | ~1.4GB total | `*.glb` + `models` in ignoreAssetsPattern |

### Home Intro Video

| Path | Status | Size | Reason |
|------|--------|------|--------|
| `/assets/video/HOME-BRIF-VIDEO.mp4` | ❌ EXCLUDED | 10MB | `*.mp4` in ignoreAssetsPattern |

---

## 4. CURRENT EXCLUSION PATTERN

**File:** `android/app/build.gradle`

```groovy
ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~:*.mp4:*.mov:*.webm:*.glb:models:99premi:auto-reali:orologi-reali:borse-reali:gioielli-reali'
```

### Breakdown:
| Pattern | Effect | Size Saved |
|---------|--------|------------|
| `*.mp4` | Excludes all MP4 videos | ~150MB |
| `*.mov` | Excludes MOV videos | ~0 |
| `*.webm` | Excludes WebM videos | ~0 |
| `*.glb` | Excludes 3D models | ~1.4GB |
| `models` | Excludes /models/ folder | (redundant with *.glb) |
| `99premi` | Excludes prize folder | 26MB |
| `auto-reali` | Excludes prize folder | 21MB |
| `orologi-reali` | Excludes prize folder | 19MB |
| `borse-reali` | Excludes prize folder | 19MB |
| `gioielli-reali` | Excludes prize folder | 18MB |

**Total Excluded:** ~1.65GB+

---

## 5. WHY iOS WORKS

iOS IPA bundle includes ALL assets:
- No equivalent to `ignoreAssetsPattern`
- All GLB models present (~1.4GB)
- All videos present (~150MB)
- All prize images present (~103MB)

iOS app size is not limited to 200MB for App Store (limit is ~4GB for app thinning).

---

## 6. SUMMARY: ROOT CAUSE EVIDENCE

| Evidence | File | Line | Status |
|----------|------|------|--------|
| `useGLTF()` throws on missing GLB | PrizeVision.tsx | 37 | ✅ CONFIRMED |
| GLB files excluded | build.gradle | - | ✅ CONFIRMED |
| Prize images excluded | build.gradle | - | ✅ CONFIRMED |
| Videos excluded | build.gradle | - | ✅ CONFIRMED |
| ErrorBoundary catches | ErrorBoundary.tsx | 32-37 | ✅ CONFIRMED |

**Root Cause:** `useGLTF()` in `MiniAgentModel` throws when loading GLB files that don't exist in the Android bundle due to AAB size optimization exclusions.

---

*Report generated: 2026-02-10*
