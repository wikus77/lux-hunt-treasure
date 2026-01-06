// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export function assertPkMatchesMode(serverMode: 'live' | 'test' | 'unknown') {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const clientMode = pk.startsWith('pk_live_') ? 'live' : pk.startsWith('pk_test_') ? 'test' : 'unknown';

  // 🔐 Mode check log removed for security - only log in DEV
  if (import.meta.env.DEV) {
    console.log('[STRIPE GUARD] Mode check:', { clientMode, serverMode });
  }

  if (serverMode === 'unknown') {
    console.warn('[STRIPE GUARD] Server mode unknown');
    throw new Error('Stripe mode non determinabile dal server');
  }

  if (clientMode !== serverMode) {
    // 🔧 DEV MODE: Allow mismatch in preview/dev but log warning
    if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
      console.warn('[STRIPE GUARD] DEV MODE: Allowing mode mismatch');
      return; // Allow to proceed in dev/preview
    }
    
    // Production: strict enforcement
    throw new Error('Stripe mode mismatch: contatta il supporto.');
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
