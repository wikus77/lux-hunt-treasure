// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export function assertPkMatchesMode(serverMode: 'live' | 'test' | 'unknown') {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const clientMode = pk.startsWith('pk_live_') ? 'live' : pk.startsWith('pk_test_') ? 'test' : 'unknown';

  console.log('[STRIPE GUARD] Mode check:', { clientMode, serverMode, pk: pk.substring(0, 12) });

  if (serverMode === 'unknown') {
    console.warn('Stripe server mode is unknown. Check STRIPE_SECRET_KEY on server.');
    throw new Error('Stripe mode non determinabile dal server');
  }

  if (clientMode !== serverMode) {
    console.warn(`⚠️ Stripe mode mismatch: client=${clientMode} server=${serverMode}`);
    
    // 🔧 DEV MODE: Allow mismatch in preview/dev but log warning
    if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
      console.warn('⚠️ DEV/PREVIEW MODE: Allowing Stripe mode mismatch for testing');
      console.warn('⚠️ In production, client and server modes MUST match!');
      return; // Allow to proceed in dev/preview
    }
    
    // Production: strict enforcement
    throw new Error('Stripe mode mismatch: contatta il supporto.');
  }
  
  console.log('[STRIPE GUARD] ✅ Mode check passed');
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
