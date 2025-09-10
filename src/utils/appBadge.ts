// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA App Icon Badge Utility

const isDev = import.meta.env.DEV;

// Diagnostic logging (enabled in dev or with VITE_BADGE_DEBUG)
const log = (message: string, data?: any) => {
  if (isDev || import.meta.env.VITE_BADGE_DEBUG) {
    console.log(`🔴 [AppBadge] ${message}`, data || '');
  }
};

// Feature detection for Badge API
export const isBadgeAPISupported = (): boolean => {
  return typeof navigator !== 'undefined' && 
         'setAppBadge' in navigator && 
         'clearAppBadge' in navigator;
};

// Safe app badge setter with feature detection
export const setAppBadgeSafe = async (count: number): Promise<boolean> => {
  try {
    const n = Math.max(0, Math.floor(count) || 0);
    const canBadge = isBadgeAPISupported();
    
    if (!canBadge) {
      log('Badge API not supported on this device/browser');
      return false;
    }

    if (n > 0) {
      await (navigator as any).setAppBadge(n);
      log(`App badge set to: ${n}`);
    } else {
      await (navigator as any).clearAppBadge();
      log('App badge cleared');
    }
    
    return true;
  } catch (error) {
    log('Error setting app badge:', error);
    return false;
  }
};

// Clear app badge
export const clearAppBadgeSafe = async (): Promise<boolean> => {
  return setAppBadgeSafe(0);
};

// Diagnostic exposure for development
if (isDev && typeof window !== 'undefined') {
  window.__M1_BADGE__ = window.__M1_BADGE__ || {};
  window.__M1_BADGE__.get = () => ({
    supported: isBadgeAPISupported(),
    lastSyncAt: Date.now(),
    setAppBadgeSafe,
    clearAppBadgeSafe
  });
}