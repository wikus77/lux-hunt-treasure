// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Console Badge Test Helpers (Development Only)

/**
 * Simple console helpers for testing badge functionality
 * Available in development mode only
 */

// Quick test functions for console use
export const consoleBadgeHelpers = {
  // Test increment: window.badge.inc(3)
  inc: async (count = 1) => {
    const test = window.__M1_BADGE_TEST__;
    if (test) {
      return await test.incrementBadge(count);
    }
    return 'Badge test utils not available';
  },

  // Test decrement: window.badge.dec(1)
  dec: async (count = 1) => {
    const test = window.__M1_BADGE_TEST__;
    if (test) {
      return await test.decrementBadge(count);
    }
    return 'Badge test utils not available';
  },

  // Clear badge: window.badge.clear()
  clear: async () => {
    const test = window.__M1_BADGE_TEST__;
    if (test) {
      return await test.clearBadge();
    }
    return 'Badge test utils not available';
  },

  // Test app icon: window.badge.icon(5)
  icon: async (count = 5) => {
    const test = window.__M1_BADGE_TEST__;
    if (test) {
      return await test.testIconBadge(count);
    }
    return 'Badge test utils not available';
  },

  // Get status: window.badge.status()
  status: () => {
    const badge = window.__M1_BADGE__;
    const test = window.__M1_BADGE_TEST__;
    
    return {
      badge: badge?.get?.() || 'not available',
      diagnostics: test?.getDiagnostics?.() || 'not available',
      help: 'Use: window.badge.inc(3), window.badge.dec(1), window.badge.clear(), window.badge.icon(5)'
    };
  }
};

// Auto-expose in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Simple access via window.badge
  (window as any).badge = consoleBadgeHelpers;
  
  // Log availability
  console.log('🔔 Badge test helpers available:');
  console.log('  window.badge.inc(3)   - Increment badge by 3');
  console.log('  window.badge.dec(1)   - Decrement badge by 1');
  console.log('  window.badge.clear()  - Clear badge to 0');
  console.log('  window.badge.icon(5)  - Test app icon badge');
  console.log('  window.badge.status() - Get current state');
}