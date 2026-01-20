// © 2025 M1SSION™ – Stripe Configuration Shared Utilities
/**
 * SECURITY CLEANUP: 2026-01-20
 * 
 * Removed dependency on VITE_STRIPE_* secrets.
 * Publishable keys are PUBLIC (safe to expose) and are read by frontend via import.meta.env
 * 
 * ⚠️ NOTE: getPublishableKeyForMode() is NOT USED by any Edge Function.
 * Only getStripeModeFromKey() and normalizeMode() are actively used.
 * 
 * Secrets no longer needed in backend:
 * - VITE_STRIPE_PUBLISHABLE_KEY_TEST
 * - VITE_STRIPE_PUBLISHABLE_KEY_LIVE
 */

export type StripeMode = 'live' | 'test' | 'unknown';

export function getStripeModeFromKey(key?: string): StripeMode {
  if (!key) return 'unknown';
  return key.startsWith('sk_live_') ? 'live' : key.startsWith('sk_test_') ? 'test' : 'unknown';
}

export function normalizeMode(mode?: string): StripeMode {
  return mode === 'live' || mode === 'test' ? mode : 'unknown';
}

/**
 * @deprecated NOT USED - Frontend reads publishable keys directly via import.meta.env
 * Kept for backward compatibility. Returns empty strings.
 * 
 * If this function is needed in future, publishable keys should be:
 * 1. Passed from frontend in API request
 * 2. Or hardcoded here (they are PUBLIC, not sensitive)
 */
export function getPublishableKeyForMode(mode: StripeMode): string {
  // ⚠️ SECURITY CLEANUP: No longer reads from Supabase secrets
  // Publishable keys are PUBLIC and should be in frontend .env only
  console.warn('⚠️ DEPRECATED: getPublishableKeyForMode() called - this function is no longer supported');
  return '';
}

export function validateModeMatch(serverMode: StripeMode, clientMode?: StripeMode): { valid: boolean; error?: string } {
  if (serverMode === 'unknown') {
    return { valid: false, error: 'Server Stripe mode is unknown' };
  }
  
  if (clientMode && clientMode !== serverMode) {
    return { 
      valid: false, 
      error: `Mode mismatch: server=${serverMode}, client=${clientMode}` 
    };
  }
  
  return { valid: true };
}