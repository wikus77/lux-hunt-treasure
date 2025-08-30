// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Notification Kill Switch Utilities */

/**
 * Check if push notifications are disabled by kill switch
 */
export function isPushDisabled(): boolean {
  try {
    return localStorage.getItem('push:disable') === '1';
  } catch {
    return false;
  }
}

/**
 * Enable push notification kill switch
 */
export function disablePush(): void {
  try {
    localStorage.setItem('push:disable', '1');
    console.warn('[PUSH-KILL] Push notifications disabled by kill switch');
  } catch (error) {
    console.error('[PUSH-KILL] Failed to set kill switch:', error);
  }
}

/**
 * Disable push notification kill switch
 */
export function enablePush(): void {
  try {
    localStorage.removeItem('push:disable');
    console.log('[PUSH-KILL] Push notifications re-enabled');
  } catch (error) {
    console.error('[PUSH-KILL] Failed to remove kill switch:', error);
  }
}

/**
 * Check URL for hotfix disable parameter
 */
export function checkHotfixDisable(): boolean {
  try {
    if (window.location.search.includes('__noPush=1')) {
      disablePush();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).pushKillSwitch = {
    disable: disablePush,
    enable: enablePush,
    isDisabled: isPushDisabled,
    checkHotfix: checkHotfixDisable
  };
  console.log('🔧 Push kill switch available as: window.pushKillSwitch');
}