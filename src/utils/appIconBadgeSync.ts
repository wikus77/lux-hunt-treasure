/**
 * © 2025 Joseph MULÉ – M1SSION™ – PWA App Icon Badge Sync
 * Real-time synchronization with Notice counter - NO PUSH CHAIN MODIFICATIONS
 */

// Debounce management
let syncTimeout: NodeJS.Timeout | null = null;
let lastSyncValue: number = -1;

/**
 * Check if PWA badge API is available and supported
 */
function isSupported(): boolean {
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
    
    // Environment check
    if (!isSupported()) {
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.info('🔍 BADGE SYNC: Not supported (standalone={}, hasAPI={})', 
          window.matchMedia('(display-mode: standalone)').matches, 
          'setAppBadge' in navigator
        );
      }
      return;
    }
    
    try {
      const safeCount = Math.max(0, Math.floor(count || 0));
      
      if (safeCount > 0) {
        await (navigator as any).setAppBadge(safeCount);
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.info('🔍 BADGE SYNC: Set to', safeCount, {
            prev: lastSyncValue,
            next: safeCount,
            supported: true,
            standalone: window.matchMedia('(display-mode: standalone)').matches
          });
        }
      } else {
        await (navigator as any).clearAppBadge();
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.info('🔍 BADGE SYNC: Cleared', {
            prev: lastSyncValue,
            next: 0,
            supported: true,
            standalone: window.matchMedia('(display-mode: standalone)').matches
          });
        }
      }
      
      lastSyncValue = safeCount;
    } catch (error: any) {
      // Log once and don't throw
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.warn('🔍 BADGE SYNC: Failed -', error?.message || error);
        
        // Detect specific iOS settings issue
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
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    hasAPI: 'setAppBadge' in navigator,
    lastValue: lastSyncValue,
    timestamp: new Date().toISOString()
  };
}