/**
 * © 2025 Joseph MULÉ – M1SSION™ – PWA App Icon Badge Sync
 * Real-time synchronization with Notice counter - NO PUSH CHAIN MODIFICATIONS
 * 
 * Supports:
 * - iOS Native (via M1SSIONBadge bridge)
 * - PWA (via navigator.setAppBadge)
 */

// Debounce management
let syncTimeout: NodeJS.Timeout | null = null;
let lastSyncValue: number = -1;

/**
 * Check if iOS native badge bridge is available
 */
function hasNativeBadge(): boolean {
  return typeof window !== 'undefined' && 
         !!(window as any).M1SSIONBadge?.setBadge;
}

/**
 * Check if PWA badge API is available and supported
 */
function isPWASupported(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  
  const hasAPI = 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
    
  return hasAPI && isStandalone;
}

/**
 * Check if any badge API is supported
 */
function isSupported(): boolean {
  return hasNativeBadge() || isPWASupported();
}

/**
 * Core badge sync function with debouncing and coalescing
 */
export async function syncAppIconBadge(count: number): Promise<void> {
  // Clear existing timeout to coalesce rapid updates
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  // Debounce and coalesce to latest value
  syncTimeout = setTimeout(async () => {
    // Skip if same value
    if (lastSyncValue === count) {
      return;
    }
    
    const safeCount = Math.max(0, Math.floor(count || 0));
    
    // Try iOS native badge first (highest priority for wrapped app)
    if (hasNativeBadge()) {
      try {
        (window as any).M1SSIONBadge.setBadge(safeCount);
        lastSyncValue = safeCount;
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.info('🔍 BADGE SYNC: iOS Native set to', safeCount);
        }
        return;
      } catch (error: any) {
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.warn('🔍 BADGE SYNC: iOS Native failed -', error?.message || error);
        }
      }
    }
    
    // Fallback to PWA Badge API
    if (!isPWASupported()) {
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.info('🔍 BADGE SYNC: Not supported (native={}, pwa={})', 
          hasNativeBadge(),
          isPWASupported()
        );
      }
      return;
    }
    
    try {
      if (safeCount > 0) {
        await (navigator as any).setAppBadge(safeCount);
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.info('🔍 BADGE SYNC: PWA set to', safeCount);
        }
      } else {
        await (navigator as any).clearAppBadge();
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.info('🔍 BADGE SYNC: PWA cleared');
        }
      }
      
      lastSyncValue = safeCount;
    } catch (error: any) {
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.warn('🔍 BADGE SYNC: PWA failed -', error?.message || error);
        
        if (error?.name === 'NotAllowedError' || error?.message?.includes('not allowed')) {
          console.info('💡 HINT: Enable badge in iOS Settings → Notifications → M1SSION™ → Badge');
        }
      }
    }
  }, 150); // 150ms debounce
}

/**
 * Get current sync state for diagnostics
 */
export function getBadgeSyncState() {
  return {
    supported: isSupported(),
    hasNative: hasNativeBadge(),
    hasPWA: isPWASupported(),
    standalone: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
    lastValue: lastSyncValue,
    timestamp: new Date().toISOString()
  };
}
