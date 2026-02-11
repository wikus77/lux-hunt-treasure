# Remote Asset Pipeline Plan
**Date:** 2026-02-10
**Goal:** Android feature parity with iOS while keeping AAB < 200MB
**Constraint:** NO iOS wrapper modifications

---

## EXECUTIVE SUMMARY

To achieve Android feature parity with iOS (all animations, videos, 3D models) while staying under the 200MB AAB limit, we need to:

1. **Host heavy assets on CDN** (videos, GLB 3D models, HD images)
2. **Implement crash-proof loading** (fallbacks at every level)
3. **Use asset manifest** for version control and platform routing
4. **Cache aggressively** for offline-first experience

**Asset Size Analysis:**

| Asset Category | Total Size | Current in AAB | Required for Parity | Solution |
|----------------|------------|----------------|---------------------|----------|
| 3D Models (GLB) | 1.4GB | 0 | All | CDN |
| Videos (MP4) | 150MB | 0 | All | CDN |
| Prize Images (HD) | 103MB | 63MB | 103MB | CDN for excluded |
| Core UI Assets | ~60MB | ~60MB | ~60MB | Local |
| **Total AAB** | - | **182MB** | **< 200MB** | ✅ |

---

## PART A: CRASH-PROOF HOME

### A.1 Current Problem

```
PrizeVision.tsx
  └─ useGLTF('/models/agent/agent_male.glb')
       └─ THREE.GLTFLoader throws
            └─ React ErrorBoundary catches
                 └─ Entire Home shows "Oops!" error
```

### A.2 Solution: Granular Error Boundaries + Fallbacks

#### Layer 1: Suspense + Fallback for 3D Canvas

```tsx
// PrizeVision.tsx - MODIFIED STRUCTURE
<ErrorBoundary FallbackComponent={AgentModelFallback}>
  <Suspense fallback={<AgentLoadingPlaceholder />}>
    <Canvas>
      <MiniAgentModel glbPath={resolvedGlbUrl} />
    </Canvas>
  </Suspense>
</ErrorBoundary>
```

#### Layer 2: Safe GLB Loader

```tsx
// src/utils/safeGLTFLoader.ts - NEW FILE
import { useGLTF } from '@react-three/drei';

export function useSafeGLTF(url: string, fallbackUrl?: string) {
  const [error, setError] = useState<Error | null>(null);
  const [finalUrl, setFinalUrl] = useState(url);
  
  useEffect(() => {
    // Pre-check if URL is accessible
    fetch(url, { method: 'HEAD' })
      .then(res => {
        if (!res.ok && fallbackUrl) setFinalUrl(fallbackUrl);
      })
      .catch(() => {
        if (fallbackUrl) setFinalUrl(fallbackUrl);
        else setError(new Error('GLB not available'));
      });
  }, [url, fallbackUrl]);
  
  if (error) throw error; // Let ErrorBoundary handle
  return useGLTF(finalUrl);
}
```

#### Layer 3: Image Fallback Component

```tsx
// src/components/ui/SafeImage.tsx - NEW FILE
export function SafeImage({ 
  src, 
  fallbackSrc = '/assets/placeholder.png',
  ...props 
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  return (
    <img
      src={currentSrc}
      onError={() => {
        if (!hasError) {
          setCurrentSrc(fallbackSrc);
          setHasError(true);
        }
      }}
      {...props}
    />
  );
}
```

#### Layer 4: Video Fallback Component

```tsx
// src/components/ui/SafeVideo.tsx - NEW FILE
export function SafeVideo({ 
  src, 
  fallbackPoster,
  ...props 
}: SafeVideoProps) {
  const [showFallback, setShowFallback] = useState(false);
  
  if (showFallback) {
    return <img src={fallbackPoster} className="video-fallback" />;
  }
  
  return (
    <video
      src={src}
      onError={() => setShowFallback(true)}
      poster={fallbackPoster}
      {...props}
    />
  );
}
```

### A.3 Files to Modify

| File | Change |
|------|--------|
| `src/components/command-center/home-sections/PrizeVision.tsx` | Wrap 3D in ErrorBoundary, use SafeImage |
| `src/components/home/HomeIntroVideo.tsx` | Use SafeVideo with fallback poster |
| `src/components/agent/AgentViewer.tsx` (if exists) | Use useSafeGLTF |

---

## PART B: ASSET MANIFEST

### B.1 Manifest Structure

```json
// public/asset-manifest.json
{
  "version": "2.0.0",
  "generated": "2026-02-10T00:00:00Z",
  "baseUrls": {
    "cdn": "https://cdn.m1ssion.app",
    "local": ""
  },
  "assets": {
    "models": {
      "agent_male": {
        "path": "/models/agent/agent_male.glb",
        "size": 10485760,
        "hash": "sha256-abc123...",
        "platforms": {
          "ios": "local",
          "android": "cdn",
          "web": "cdn"
        }
      },
      // ... more models
    },
    "videos": {
      "home_intro": {
        "path": "/assets/video/HOME-BRIF-VIDEO.mp4",
        "size": 10485760,
        "hash": "sha256-def456...",
        "platforms": {
          "ios": "local",
          "android": "cdn",
          "web": "cdn"
        },
        "fallback": "/assets/images/home-intro-poster.png"
      }
    },
    "images": {
      "prizes_auto_reali": {
        "folder": "/assets/prizes/auto-reali/",
        "platforms": {
          "ios": "local",
          "android": "cdn"
        }
      }
      // ... more image groups
    }
  }
}
```

### B.2 Asset Resolver Service

```typescript
// src/services/assetResolver.ts - NEW FILE
import manifest from '../asset-manifest.json';
import { isAndroid, isIOS, isNativeApp } from '../utils/platform';

type AssetType = 'models' | 'videos' | 'images';

interface ResolvedAsset {
  url: string;
  isRemote: boolean;
  fallbackUrl?: string;
}

class AssetResolver {
  private platform: 'ios' | 'android' | 'web';
  private manifest = manifest;
  
  constructor() {
    if (isIOSNative()) this.platform = 'ios';
    else if (isAndroidNative()) this.platform = 'android';
    else this.platform = 'web';
  }
  
  resolve(type: AssetType, key: string): ResolvedAsset {
    const asset = this.manifest.assets[type]?.[key];
    if (!asset) {
      console.warn(`[AssetResolver] Unknown asset: ${type}/${key}`);
      return { url: '', isRemote: false };
    }
    
    const source = asset.platforms[this.platform] || 'cdn';
    const baseUrl = source === 'cdn' 
      ? this.manifest.baseUrls.cdn 
      : this.manifest.baseUrls.local;
    
    return {
      url: baseUrl + asset.path,
      isRemote: source === 'cdn',
      fallbackUrl: asset.fallback
    };
  }
  
  resolvePath(relativePath: string): string {
    // For hardcoded paths, check if folder is remote
    if (this.platform === 'android') {
      // Check if path matches excluded patterns
      const excludedPatterns = [
        '/models/', '/assets/video/', 
        '/assets/prizes/auto-reali/', '/assets/prizes/99premi/',
        '/assets/prizes/gioielli-reali/', '/assets/prizes/orologi-reali/',
        '/assets/prizes/borse-reali/'
      ];
      
      for (const pattern of excludedPatterns) {
        if (relativePath.includes(pattern)) {
          return this.manifest.baseUrls.cdn + relativePath;
        }
      }
    }
    return relativePath; // Local
  }
}

export const assetResolver = new AssetResolver();
```

### B.3 Usage in Components

```tsx
// PrizeVision.tsx - BEFORE
const missionPrizeImages = [
  "/assets/prizes/auto-reali/ AUTO NASCOSTA.png",
  // ...
];

// PrizeVision.tsx - AFTER
import { assetResolver } from '@/services/assetResolver';

const missionPrizeImages = [
  "/assets/prizes/auto-reali/ AUTO NASCOSTA.png",
  // ...
].map(path => assetResolver.resolvePath(path));
```

---

## PART C: CACHING STRATEGY

### C.1 HTTP Cache Headers (CDN Configuration)

```nginx
# CDN/CloudFlare configuration
location ~* \.(glb|mp4|webm|png|jpg|webp)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header ETag $etag;
}
```

### C.2 Service Worker Caching (if SW exists)

```javascript
// sw.js or workbox configuration
const ASSET_CACHE = 'm1ssion-assets-v1';

// Cache remote assets after first load
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('cdn.m1ssion.app')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(ASSET_CACHE).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
  }
});
```

### C.3 Cache Invalidation

- Use versioned URLs: `cdn.m1ssion.app/v2/models/agent.glb`
- Or use query params: `cdn.m1ssion.app/models/agent.glb?v=2.0.0`
- Update `asset-manifest.json` version to trigger re-fetch

---

## PART D: PERFORMANCE OPTIMIZATION

### D.1 Lazy Loading

```tsx
// Only load 3D canvas when in viewport
const PrizeVision3D = lazy(() => import('./PrizeVision3D'));

// In component
<InViewport fallback={<StaticPrizePreview />}>
  <Suspense fallback={<Loading3DModel />}>
    <PrizeVision3D />
  </Suspense>
</InViewport>
```

### D.2 Prefetch Strategy

```tsx
// src/utils/assetPrefetcher.ts
export function prefetchAssets(assetKeys: string[]) {
  assetKeys.forEach(key => {
    const { url, isRemote } = assetResolver.resolve('images', key);
    if (isRemote) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    }
  });
}

// Usage: prefetch when user is likely to navigate
useEffect(() => {
  if (isNearHomePage) {
    prefetchAssets(['prizes_auto_reali', 'prizes_99premi']);
  }
}, [isNearHomePage]);
```

### D.3 Progressive Loading for Images

```tsx
// Load thumbnail first, then HD
<SafeImage
  src={assetResolver.resolvePath('/assets/prizes/auto-reali/HD/car.png')}
  placeholderSrc="/assets/prizes/auto-reali/thumb/car.png"
  loadingStrategy="progressive"
/>
```

---

## PART E: SECURITY

### E.1 No Secrets in Client

- All CDN URLs are public (no API keys in manifest)
- No signed URLs required for public assets
- CDN should have CORS configured for `m1ssion.app` origins

### E.2 CDN Configuration

```
# CloudFlare or similar CDN rules
Access-Control-Allow-Origin: https://m1ssion.app, capacitor://localhost
Access-Control-Allow-Methods: GET, HEAD
```

### E.3 Optional: Signed URLs for Premium Assets

If some assets should be protected:

```typescript
// Backend generates signed URL
const signedUrl = await supabase.storage
  .from('premium-assets')
  .createSignedUrl('exclusive-model.glb', 3600);
```

---

## CHECKLIST OPERATIVA

### Phase 1: Infrastructure Setup

- [ ] **1.1** Set up CDN bucket (CloudFlare R2 / Supabase Storage / S3)
- [ ] **1.2** Upload all 3D models (1.4GB) to CDN
- [ ] **1.3** Upload all videos (150MB) to CDN
- [ ] **1.4** Upload excluded prize images (40MB) to CDN
- [ ] **1.5** Configure CORS headers on CDN
- [ ] **1.6** Create `asset-manifest.json` with all asset mappings

### Phase 2: Crash-Proof Components

- [ ] **2.1** Create `src/utils/platform.ts` - unified platform detection
- [ ] **2.2** Create `src/services/assetResolver.ts` - platform-aware URL resolver
- [ ] **2.3** Create `src/components/ui/SafeImage.tsx` - image with fallback
- [ ] **2.4** Create `src/components/ui/SafeVideo.tsx` - video with fallback
- [ ] **2.5** Create `src/utils/safeGLTFLoader.ts` - GLB loader with error handling
- [ ] **2.6** Create section-level ErrorBoundaries in `src/components/error/`

### Phase 3: Component Updates (NO iOS TOUCH)

- [ ] **3.1** Update `PrizeVision.tsx` - use SafeImage + SafeGLTF + ErrorBoundary
- [ ] **3.2** Update `HomeIntroVideo.tsx` - use SafeVideo + remote URL
- [ ] **3.3** Update `agentCatalog.ts` - resolve GLB paths via assetResolver
- [ ] **3.4** Update any other components with hardcoded asset paths

### Phase 4: Testing

- [ ] **4.1** Test on Android device with clean install (no cached assets)
- [ ] **4.2** Verify Home page loads without crash
- [ ] **4.3** Verify 3D models load from CDN
- [ ] **4.4** Verify videos play from CDN
- [ ] **4.5** Verify fallbacks work when CDN is unreachable (airplane mode)
- [ ] **4.6** Verify iOS still works unchanged (regression test)

### Phase 5: Performance Optimization

- [ ] **5.1** Add lazy loading for 3D components
- [ ] **5.2** Add prefetch for likely-needed assets
- [ ] **5.3** Verify CDN cache headers are correct
- [ ] **5.4** Monitor CDN bandwidth/costs

---

## ASSETS TO HOST ON CDN (Summary)

| Asset Path | Size | Reason |
|------------|------|--------|
| `/models/agent/*.glb` | ~200MB | 3D agent models |
| `/models/agent/special/*.glb` | ~1.2GB | Special agent models |
| `/assets/video/HOME-BRIF-VIDEO.mp4` | 10MB | Home intro video |
| `/video/*.mp4` | 39MB | Other videos |
| `/videos/*.mp4` | 7MB | Video clips |
| `/assets/prizes/auto-reali/*` | 21MB | HD prize images |
| `/assets/prizes/99premi/*` | 26MB | HD prize images |
| `/assets/prizes/gioielli-reali/*` | 18MB | HD prize images |
| `/assets/prizes/orologi-reali/*` | 19MB | HD prize images |
| `/assets/prizes/borse-reali/*` | 19MB | HD prize images |
| **TOTAL** | **~1.6GB** | - |

---

## ESTIMATED EFFORT

| Phase | Scope | Complexity |
|-------|-------|------------|
| Phase 1: CDN Setup | DevOps | Medium |
| Phase 2: Utils/Services | New files | Low |
| Phase 3: Component Updates | Existing files | Medium |
| Phase 4: Testing | QA | Medium |
| Phase 5: Optimization | Optional | Low |

---

## RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| CDN down = no assets | Fallback placeholders + local low-res versions |
| Slow CDN = bad UX | Prefetch + aggressive caching |
| CDN costs increase | Monitor usage, consider self-hosted option |
| iOS regression | Run iOS regression tests before release |

---

## ALTERNATIVE APPROACHES (Not Recommended)

1. **Re-include all in AAB** - NOT POSSIBLE (1.6GB > 200MB limit)
2. **Android App Bundle Dynamic Delivery** - Complex, requires Play Feature Delivery API
3. **Smaller asset quality** - Degrades experience vs iOS

---

*Plan generated: 2026-02-10*
*Constraints honored: iOS wrapper untouched, AAB < 200MB*
