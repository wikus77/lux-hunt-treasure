/**
 * © 2025 Joseph MULÉ – M1SSION™ – PWA App Badge Integration
 * Synchronized with Notice tab counter - NO PUSH CHAIN MODIFICATIONS
 */

// Debounced badge update to prevent API spamming
let badgeUpdateTimeout: NodeJS.Timeout | null = null;

/**
 * Check if device supports Badging API and is in PWA mode
 */
export function supportsBadging(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const hasAPI = 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  return hasAPI && isPWA;
}

/**
 * Set app icon badge (debounced for performance)
 */
export function setBadge(count: number): void {
  // Clear existing timeout
  if (badgeUpdateTimeout) {
    clearTimeout(badgeUpdateTimeout);
  }
  
  // Debounce badge updates by 200ms
  badgeUpdateTimeout = setTimeout(() => {
    if (!supportsBadging()) {
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.log('🏷️ BADGE: API not supported or not in PWA mode');
      }
      return;
    }
    
    try {
      const safeCount = Math.max(0, Math.floor(count));
      
      if (safeCount > 0) {
        (navigator as any).setAppBadge(safeCount);
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.log(`🏷️ BADGE: Set to ${safeCount}`);
        }
      } else {
        (navigator as any).clearAppBadge();
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.log('🏷️ BADGE: Cleared');
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.error('🏷️ BADGE: Error updating:', error);
      }
    }
  }, 200);
}

/**
 * Sync badge from Notice tab count (main API)
 */
export function syncFromNotice(count: number): void {
  setBadge(count);
}

/**
 * Get platform detection info
 */
export function getPlatformInfo() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isDesktop = !isIOS && !isAndroid;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  return {
    isIOS,
    isAndroid, 
    isDesktop,
    isPWA,
    supportsIconBadge: supportsBadging(),
    platform: isIOS ? 'iosPWA' : isAndroid ? 'android' : 'desktop'
  };
}