/**
 * © 2025 Joseph MULÉ – M1SSION™ – Debug Helper Functions
 * Global debug utilities for PWA badge functionality
 */

import { getBadgeDiagnostics } from './pwaBadgeAudit';
import { syncAppIconBadge, getBadgeSyncState } from './appIconBadgeSync';

/**
 * Initialize global debug helpers for PWA badge testing
 */
export function initializeGlobalDebugHelpers() {
  if (typeof window === 'undefined') return;
  
  const isDebugMode = import.meta.env.VITE_BADGE_DEBUG === '1';
  
  if (isDebugMode) {
    // Global badge diagnostics
    (window as any).__M1_BADGE_DIAG__ = getBadgeDiagnostics();
    
    // Global badge test helpers
    (window as any).__M1_BADGE_TEST__ = {
      set: async (n: number) => {
        console.log(`🧪 BADGE TEST: Setting badge to ${n}`);
        await syncAppIconBadge(n);
        return getBadgeSyncState();
      },
      clear: async () => {
        console.log('🧪 BADGE TEST: Clearing badge');
        await syncAppIconBadge(0);
        return getBadgeSyncState();
      },
      get: () => getBadgeSyncState(),
      getDiagnostics: () => getBadgeDiagnostics()
    };
    
    console.log('🧪 PWA BADGE DEBUG: Global helpers available:');
    console.log('  - window.__M1_BADGE_DIAG__ (environment info)');
    console.log('  - window.__M1_BADGE_TEST__.set(n) / .clear() / .get()');
  }
}

/**
 * Log current PWA badge status for debugging
 */
export function logBadgeStatus() {
  if (import.meta.env.VITE_BADGE_DEBUG === '1') {
    console.group('🔍 PWA BADGE STATUS');
    console.log('Environment:', getBadgeDiagnostics());
    console.log('Sync State:', getBadgeSyncState());
    console.groupEnd();
  }
}