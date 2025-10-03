// © 2025 M1SSION™ – Stripe Configuration Shared Utilities

export type StripeMode = 'live' | 'test' | 'unknown';

export function getStripeModeFromKey(key?: string): StripeMode {
  if (!key) return 'unknown';
  return key.startsWith('sk_live_') ? 'live' : key.startsWith('sk_test_') ? 'test' : 'unknown';
}

export function normalizeMode(mode?: string): StripeMode {
  return mode === 'live' || mode === 'test' ? mode : 'unknown';
}

export function getPublishableKeyForMode(mode: StripeMode): string {
  const testKey = Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY_TEST') || '';
  const liveKey = Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY_LIVE') || '';
  
  switch (mode) {
    case 'live':
      return liveKey;
    case 'test':
      return testKey;
    default:
      // Fallback to test for safety
      return testKey;
  }
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