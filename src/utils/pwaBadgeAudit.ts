/**
 * © 2025 Joseph MULÉ – M1SSION™ – PWA Badge Audit Utilities
 * PHASE 1 AUDIT: Environment detection and badge API testing
 */

interface BadgeDiagnostics {
  standalone: boolean;
  hasSetAppBadge: boolean;
  hasClearAppBadge: boolean;
  ua: string;
  lastTest?: {
    count: number;
    success: boolean;
    error?: string;
    timestamp: string;
  };
}

let diagnosticState: BadgeDiagnostics = {
  standalone: false,
  hasSetAppBadge: false,
  hasClearAppBadge: false,
  ua: ''
};

/**
 * Initialize PWA badge diagnostics - detect environment support
 */
export function initPWABadgeDiagnostics() {
  if (typeof window === 'undefined') return;

  // Detect standalone PWA mode
  const standalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // Detect Badge API support
  const hasSetAppBadge = typeof (navigator as any).setAppBadge === 'function';
  const hasClearAppBadge = typeof (navigator as any).clearAppBadge === 'function';

  diagnosticState = {
    standalone,
    hasSetAppBadge,
    hasClearAppBadge,
    ua: navigator.userAgent.slice(0, 120)
  };

  // Expose global diagnostic interface
  (window as any).__M1_BADGE_DIAG__ = diagnosticState;

  console.log('🔍 PWA BADGE AUDIT - Environment Detection:', diagnosticState);
}

/**
 * Test Badge API with given count (PHASE 1 testing only)
 */
export async function testBadgeAPI(count: number): Promise<boolean> {
  if (!diagnosticState.hasSetAppBadge) {
    console.warn('🔍 PWA BADGE TEST: setAppBadge not available');
    return false;
  }

  const testResult = {
    count,
    success: false,
    timestamp: new Date().toISOString()
  } as any;

  try {
    if (count > 0) {
      await (navigator as any).setAppBadge(count);
      console.log(`🔍 PWA BADGE TEST: setAppBadge(${count}) SUCCESS`);
    } else {
      await (navigator as any).clearAppBadge();
      console.log('🔍 PWA BADGE TEST: clearAppBadge() SUCCESS');
    }
    
    testResult.success = true;
  } catch (error: any) {
    testResult.success = false;
    testResult.error = error.message || error.toString();
    console.error('🔍 PWA BADGE TEST: Failed -', error);
  }

  diagnosticState.lastTest = testResult;
  return testResult.success;
}

/**
 * Create dev helpers for badge testing (behind VITE_BADGE_DEBUG)
 */
export function createBadgeTestHelpers() {
  if (typeof window === 'undefined') return;
  
  const isDebugMode = import.meta.env.VITE_BADGE_DEBUG === '1';
  
  if (isDebugMode) {
    (window as any).__M1_BADGE_TEST__ = {
      set: async (n: number) => {
        console.log(`🧪 BADGE TEST: Setting badge to ${n}`);
        return await testBadgeAPI(n);
      },
      clear: async () => {
        console.log('🧪 BADGE TEST: Clearing badge');
        return await testBadgeAPI(0);
      },
      getDiagnostics: () => diagnosticState
    };
    
    console.log('🧪 PWA BADGE DEBUG: Test helpers available at window.__M1_BADGE_TEST__');
  }
}

/**
 * Get current diagnostic state
 */
export function getBadgeDiagnostics(): BadgeDiagnostics {
  return { ...diagnosticState };
}