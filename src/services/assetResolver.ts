// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Asset Resolver Service
 * 
 * Resolves asset paths based on platform:
 * - iOS Native: Uses local paths (IPA has all assets)
 * - Android Native: Uses CDN for excluded assets (AAB < 200MB)
 * - Web/PWA: Uses CDN for better caching
 * 
 * NO iOS WRAPPER MODIFICATIONS - This is web layer only
 */

import { shouldUseRemoteAssets, getPlatform, isIOSNative } from '@/utils/platform';

// CDN base URL (can be overridden via env var)
const CDN_BASE = import.meta.env.VITE_ASSET_CDN_BASE || 'https://cdn.m1ssion.app';

// Patterns that are excluded from Android AAB (must match build.gradle ignoreAssetsPattern)
const EXCLUDED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.glb'];
const EXCLUDED_FOLDERS = [
  '/models/',
  '/assets/video/',
  '/assets/prizes/auto-reali/',
  '/assets/prizes/99premi/',
  '/assets/prizes/gioielli-reali/',
  '/assets/prizes/orologi-reali/',
  '/assets/prizes/borse-reali/'
];

// Default fallbacks for missing assets
const DEFAULT_FALLBACKS: Record<string, string> = {
  image: '/assets/prizes/altri/premi-1.png',
  video: '/assets/prizes/altri/premi-1.png',
  model: '' // No fallback for 3D models, handled by useSafeGLTF
};

interface ResolvedAsset {
  url: string;
  isRemote: boolean;
  fallbackUrl?: string;
}

class AssetResolverService {
  private platform: ReturnType<typeof getPlatform>;
  private useRemote: boolean;

  constructor() {
    this.platform = getPlatform();
    this.useRemote = shouldUseRemoteAssets();
    
    console.log('[AssetResolver] Initialized', {
      platform: this.platform,
      useRemote: this.useRemote,
      cdnBase: CDN_BASE
    });
  }

  /**
   * Check if a path matches excluded patterns (extensions or folders)
   */
  private isExcludedPath(path: string): boolean {
    // Check extensions
    const lowerPath = path.toLowerCase();
    for (const ext of EXCLUDED_EXTENSIONS) {
      if (lowerPath.endsWith(ext)) {
        return true;
      }
    }
    
    // Check folders
    for (const folder of EXCLUDED_FOLDERS) {
      if (path.includes(folder)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Resolve a local asset path to the appropriate URL
   * - iOS Native: Always returns local path
   * - Android Native/Web: Returns CDN URL for excluded assets
   */
  resolvePath(localPath: string): string {
    // iOS Native always uses local (IPA has all assets)
    if (isIOSNative()) {
      return localPath;
    }
    
    // For Android/Web, check if path is excluded and needs CDN
    if (this.useRemote && this.isExcludedPath(localPath)) {
      return `${CDN_BASE}${localPath}`;
    }
    
    return localPath;
  }

  /**
   * Resolve a path with fallback information
   */
  resolve(localPath: string, type: 'image' | 'video' | 'model' = 'image'): ResolvedAsset {
    const url = this.resolvePath(localPath);
    const isRemote = url.startsWith('http');
    
    return {
      url,
      isRemote,
      fallbackUrl: DEFAULT_FALLBACKS[type]
    };
  }

  /**
   * Resolve multiple paths (for image arrays)
   */
  resolvePaths(localPaths: string[]): string[] {
    return localPaths.map(p => this.resolvePath(p));
  }

  /**
   * Get current platform info (for debugging)
   */
  getInfo(): { platform: string; useRemote: boolean; cdnBase: string } {
    return {
      platform: this.platform,
      useRemote: this.useRemote,
      cdnBase: CDN_BASE
    };
  }

  /**
   * Force refresh platform detection (call after app state changes)
   */
  refresh(): void {
    this.platform = getPlatform();
    this.useRemote = shouldUseRemoteAssets();
  }
}

// Singleton instance
export const assetResolver = new AssetResolverService();

// Export convenience functions
export function resolveAssetPath(path: string): string {
  return assetResolver.resolvePath(path);
}

export function resolveAssetPaths(paths: string[]): string[] {
  return assetResolver.resolvePaths(paths);
}

export function resolveAsset(path: string, type?: 'image' | 'video' | 'model'): ResolvedAsset {
  return assetResolver.resolve(path, type);
}

export default assetResolver;
