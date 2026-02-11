# Phase 2 Patch Report: Crash-Proof Home
**Date:** 2026-02-10
**Status:** ✅ APPLIED

---

## SUMMARY

Implemented crash-proof mechanisms for Android Home page. Even when assets are missing (GLB, images, videos excluded from AAB), the Home will render gracefully with fallbacks instead of showing the global "Oops!" ErrorBoundary.

---

## NEW FILES CREATED

### 1. `src/utils/platform.ts`
**Purpose:** Unified platform detection utility

```typescript
// Key exports:
isIOS(), isAndroid(), isNativeApp()
isIOSNative(), isAndroidNative(), isPWA()
shouldUseRemoteAssets()  // ← Core logic for Android vs iOS
```

**Android behavior:** `shouldUseRemoteAssets()` returns `true`
**iOS behavior:** `shouldUseRemoteAssets()` returns `false`

### 2. `src/components/ui/SafeImage.tsx`
**Purpose:** Image component with graceful error fallback

```typescript
<SafeImage 
  src={imagePath}
  fallbackSrc="/assets/prizes/altri/premi-1.png"  // ← Used when src fails
  hideOnError={false}  // Can hide instead of showing fallback
/>
```

### 3. `src/components/ui/SafeVideo.tsx`
**Purpose:** Video component with graceful error fallback

```typescript
<SafeVideo 
  src={videoPath}
  fallbackPoster="/path/to/poster.png"  // ← Shows if video fails
  showFallbackOnError={true}
/>
```

### 4. `src/utils/useSafeGLTF.ts`
**Purpose:** GLB/GLTF loader that **never throws**

```typescript
const { scene, isLoading, error } = useSafeGLTF(glbPath);

// Key features:
// - Returns null scene instead of throwing
// - Timeout handling (15s default)
// - Optional fallback URL
// - Loading progress tracking
```

---

## FILES MODIFIED

### 1. `src/components/command-center/home-sections/PrizeVision.tsx`

**Changes:**
1. Added imports for new utilities
2. Added `resolveAssetPath()` function for platform-aware URLs
3. Replaced `useGLTF()` with `useSafeGLTF()` in `MiniAgentModel`
4. Wrapped Canvas with `<SectionErrorBoundary section="Agent3D">`
5. Replaced raw `<img>` with `<SafeImage>` component
6. Added `AgentModelFallback` component for 3D loading states

**Before (crash point):**
```typescript
function MiniAgentModel({ glbPath }) {
  const { scene } = useGLTF(glbPath);  // ❌ THROWS on missing GLB
  // ...
}
```

**After (crash-proof):**
```typescript
function MiniAgentModel({ glbPath }) {
  const { scene, isLoading, error } = useSafeGLTF(resolveAssetPath(glbPath));
  if (isLoading || !scene) return null;  // ✅ Graceful handling
  // ...
}
```

### 2. `src/components/home/HomeIntroVideo.tsx`

**Changes:**
1. Added platform detection import
2. Added CDN base URL constant
3. Modified `VIDEO_SRC` to resolve based on platform

**Before:**
```typescript
const VIDEO_SRC = '/assets/video/HOME-BRIF-VIDEO.mp4';  // Always local
```

**After:**
```typescript
const VIDEO_SRC = shouldUseRemoteAssets() 
  ? `${CDN_BASE}/assets/video/HOME-BRIF-VIDEO.mp4`  // Android: CDN
  : VIDEO_SRC_LOCAL;  // iOS: Local
```

---

## BEHAVIOR MATRIX

| Scenario | Before | After |
|----------|--------|-------|
| Android + GLB missing | ❌ CRASH | ✅ Shows fallback UI |
| Android + Images missing | ⚠️ Broken icons | ✅ Shows fallback image |
| Android + Video missing | ⚠️ Empty space | ✅ Gracefully skips |
| iOS + All assets present | ✅ Works | ✅ Works (unchanged) |
| Web/PWA | ✅ Works | ✅ Works (uses CDN) |

---

## ANDROID-ONLY GATING

The platform detection ensures:
- **Android Native:** Resolves excluded asset paths to CDN URLs
- **iOS Native:** Always uses local paths (IPA has all assets)
- **Web/PWA:** Uses CDN for better caching

```typescript
// resolveAssetPath() logic:
if (shouldUseRemoteAssets()) {  // Android Native or Web
  return `${CDN_BASE}${localPath}`;
}
return localPath;  // iOS Native
```

---

## VERIFICATION

- [x] No changes to `ios/` directory
- [x] No `cap sync ios` executed
- [x] All new code is web layer only
- [x] Pre-existing lint errors unchanged
- [x] No new TypeScript errors introduced

---

## FALLBACK CHAIN

```
1. SafeImage → fallbackSrc → transparent pixel
2. SafeVideo → poster → skip to onComplete
3. useSafeGLTF → null scene → SectionErrorBoundary → "non disponibile" UI
```

---

*Patch applied: 2026-02-10*
*iOS wrapper: UNTOUCHED*
