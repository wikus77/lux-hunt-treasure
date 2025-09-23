// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export function assertPkMatchesMode(serverMode: 'live' | 'test' | 'unknown') {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const clientMode = pk.startsWith('pk_live_') ? 'live' : pk.startsWith('pk_test_') ? 'test' : 'unknown';

  if (serverMode === 'unknown') {
    console.warn('Stripe server mode is unknown. Check STRIPE_SECRET_KEY on server.');
    throw new Error('Stripe mode non determinabile dal server');
  }

  if (clientMode !== serverMode) {
    console.warn(`Stripe mode mismatch: client=${clientMode} server=${serverMode}`);
    throw new Error('Stripe mode mismatch: contatta il supporto.');
  }
}
