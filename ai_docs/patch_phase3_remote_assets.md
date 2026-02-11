# Phase 3 Patch Report: Remote Asset Pipeline
**Date:** 2026-02-10
**Status:** ✅ APPLIED

---

## SUMMARY

Implemented Remote Asset Pipeline to enable Android feature parity with iOS while keeping AAB under 200MB. The system resolves asset paths to CDN URLs on Android while keeping iOS using local paths.

---

## NEW FILES CREATED

### 1. `public/asset-manifest.json`
**Purpose:** Asset catalog with platform routing configuration

```json
{
  "version": "1.0.0",
  "baseUrls": {
    "cdn": "https://cdn.m1ssion.app",
    "local": ""
  },
  "platformRouting": {
    "ios-native": "local",
    "android-native": "cdn"
  },
  "excludedPatterns": {
    "extensions": ["*.mp4", "*.mov", "*.webm", "*.glb"],
    "folders": ["models", "99premi", "auto-reali", "orologi-reali", "borse-reali", "gioielli-reali"]
  }
}
```

### 2. `src/services/assetResolver.ts`
**Purpose:** Platform-aware asset path resolver

```typescript
// Key exports:
resolveAssetPath(path: string): string
resolveAssetPaths(paths: string[]): string[]
resolveAsset(path: string, type?: 'image' | 'video' | 'model'): ResolvedAsset
assetResolver (singleton instance)
```

**Logic:**
- iOS Native → Always returns local path
- Android Native/Web → Returns CDN URL for excluded assets
- Matches patterns from `ignoreAssetsPattern` in `build.gradle`

---

## FILES MODIFIED

### 1. `src/components/command-center/home-sections/PrizeVision.tsx`

**Change:** Use `resolveAssetPath` from assetResolver service

```typescript
// Before (inline function):
const CDN_BASE = '...';
function resolveAssetPath(path) { ... }

// After (service import):
import { resolveAssetPath } from "@/services/assetResolver";
```

### 2. `src/components/home/HomeIntroVideo.tsx`

**Change:** Use assetResolver for video path

```typescript
// Before:
const VIDEO_SRC = shouldUseRemoteAssets() 
  ? `${CDN_BASE}/assets/video/HOME-BRIF-VIDEO.mp4`
  : VIDEO_SRC_LOCAL;

// After:
import { resolveAssetPath } from '@/services/assetResolver';
const VIDEO_SRC = resolveAssetPath(VIDEO_SRC_LOCAL);
```

---

## PLATFORM ROUTING MATRIX

| Asset Type | iOS Native | Android Native | Web/PWA |
|------------|------------|----------------|---------|
| `/models/**/*.glb` | Local | CDN | CDN |
| `/assets/video/*.mp4` | Local | CDN | CDN |
| `/assets/prizes/auto-reali/*` | Local | CDN | CDN |
| `/assets/prizes/99premi/*` | Local | CDN | CDN |
| `/assets/prizes/gioielli-reali/*` | Local | CDN | CDN |
| `/assets/prizes/orologi-reali/*` | Local | CDN | CDN |
| `/assets/prizes/borse-reali/*` | Local | CDN | CDN |
| `/assets/prizes/altri/*` | Local | Local | Local |
| `/lovable-uploads/*` | Local | Local | Local |

---

## CDN CONFIGURATION REQUIRED

### Base URL
Set via environment variable:
```
VITE_ASSET_CDN_BASE=https://cdn.m1ssion.app
```

Or defaults to `https://cdn.m1ssion.app`

### CORS Headers (CDN Configuration)
```
Access-Control-Allow-Origin: https://m1ssion.app, capacitor://localhost
Access-Control-Allow-Methods: GET, HEAD
```

### Cache Headers
```
Cache-Control: public, max-age=31536000, immutable
```

---

## ASSETS TO UPLOAD TO CDN

| Path | Size | Priority |
|------|------|----------|
| `/models/agent/*.glb` | ~200MB | HIGH (Home crash) |
| `/models/agent/special/*.glb` | ~1.2GB | MEDIUM |
| `/assets/video/HOME-BRIF-VIDEO.mp4` | 10MB | HIGH (Home video) |
| `/assets/prizes/auto-reali/*` | 21MB | HIGH (Prize carousel) |
| `/assets/prizes/99premi/*` | 26MB | HIGH (Prize carousel) |
| `/assets/prizes/gioielli-reali/*` | 18MB | HIGH (Prize carousel) |
| `/assets/prizes/orologi-reali/*` | 19MB | HIGH (Prize carousel) |
| `/assets/prizes/borse-reali/*` | 19MB | HIGH (Prize carousel) |

**Total to upload:** ~1.5GB

---

## NO CHANGES TO

- ❌ `android/app/build.gradle` (ignoreAssetsPattern unchanged)
- ❌ `ios/` (wrapper untouched)
- ❌ No `cap sync ios`
- ❌ No Xcode/Pods changes

---

## OFFLINE BEHAVIOR

When CDN is unreachable (airplane mode):
1. **Images:** Show fallback (`/assets/prizes/altri/premi-1.png`)
2. **Videos:** Skip to `onComplete()` callback
3. **3D Models:** Show "non disponibile" placeholder via SectionErrorBoundary

---

## TESTING CHECKLIST

- [ ] Android device: Install clean AAB
- [ ] Verify Home loads without crash
- [ ] Verify prize images load (or show fallback)
- [ ] Verify 3D agent loads from CDN (or shows fallback)
- [ ] Verify video loads from CDN (or gracefully skips)
- [ ] Test airplane mode: fallbacks shown, no crash
- [ ] iOS device: Verify local assets still work
- [ ] Web browser: Verify CDN URLs resolve

---

*Patch applied: 2026-02-10*
*iOS wrapper: UNTOUCHED*
*CDN upload required: YES (before full parity)*
