/**
 * © 2025 Joseph MULÉ – M1SSION™ – Badge Diagnostics
 * Debug utilities for Notice badge system
 */

import { getPlatformInfo } from './appBadge';

interface BadgeState {
  unreadCount: number;
  lastUpdate: string;
  supportsIconBadge: boolean;
  platform: string;
}

let currentState: BadgeState = {
  unreadCount: 0,
  lastUpdate: new Date().toISOString(),
  supportsIconBadge: false,
  platform: 'unknown'
};

/**
 * Update diagnostic state
 */
export function updateBadgeState(unreadCount: number) {
  const platformInfo = getPlatformInfo();
  
  currentState = {
    unreadCount,
    lastUpdate: new Date().toISOString(),
    supportsIconBadge: platformInfo.supportsIconBadge,
    platform: platformInfo.platform
  };
}

/**
 * Get current badge state
 */
export function getBadgeState(): BadgeState {
  return { ...currentState };
}

/**
 * Test function for development (dev only)
 */
export function testBadge(count: number) {
  if (import.meta.env.DEV) {
    updateBadgeState(count);
    console.log('🧪 BADGE TEST:', { count, state: currentState });
    return true;
  }
  return false;
}

/**
 * Initialize global diagnostics
 */
export function initBadgeDiagnostics() {
  if (typeof window !== 'undefined') {
    (window as any).__M1_BADGE__ = {
      get: () => getBadgeState(),
      test: testBadge,
      platform: getPlatformInfo()
    };
  }
}