// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🏪 STORE COMPLIANCE: Stripe Platform Guards

import { isCapacitorNative, isCapacitorIOS, getCapacitorPlatform } from '@/utils/capacitor';
import { STRIPE_NATIVE_DISABLED } from '@/config/featureFlags';

/**
 * 🛡️ STORE COMPLIANCE GUARD
 * 
 * CRITICAL: iOS App Store requires ALL digital purchases to use Apple IAP.
 * Using Stripe on iOS native = INSTANT REJECTION.
 * 
 * This guard MUST be called before ANY Stripe operation on native platforms.
 */
export class StoreComplianceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreComplianceError';
  }
}

/**
 * 🚫 ASSERT: Stripe NOT allowed on iOS native
 * Throws StoreComplianceError if called on iOS Capacitor
 * 
 * Call this at the START of any Stripe payment flow.
 */
export function assertStripeAllowedOnPlatform(): void {
  const platform = getCapacitorPlatform();
  const isNative = isCapacitorNative();
  const isIOS = isCapacitorIOS();
  
  // Log check in DEV
  if (import.meta.env.DEV) {
    console.log('[STRIPE GUARD] Platform check:', { platform, isNative, isIOS, STRIPE_NATIVE_DISABLED });
  }
  
  // 🛡️ CRITICAL: Block Stripe on iOS native
  if (isIOS && isNative) {
    console.error('[STRIPE GUARD] ❌ BLOCKED: Stripe payment attempted on iOS native');
    console.error('[STRIPE GUARD] Use Apple IAP (StoreKit) for iOS purchases');
    throw new StoreComplianceError(
      'Su iOS i pagamenti sono gestiti tramite acquisti in-app Apple (StoreKit).'
    );
  }
  
  // 🛡️ If STRIPE_NATIVE_DISABLED flag is set, block on ANY native platform
  if (STRIPE_NATIVE_DISABLED && isNative) {
    console.error('[STRIPE GUARD] ❌ BLOCKED: Stripe disabled on native platform:', platform);
    throw new StoreComplianceError(
      'Pagamenti Stripe non disponibili nell\'app nativa. Usa la versione web.'
    );
  }
}

/**
 * 🔍 CHECK: Is Stripe allowed on current platform?
 * Non-throwing version for conditional rendering
 */
export function isStripeAllowedOnPlatform(): boolean {
  const isNative = isCapacitorNative();
  const isIOS = isCapacitorIOS();
  
  // Block on iOS native (App Store compliance)
  if (isIOS && isNative) {
    return false;
  }
  
  // Block on all native if flag is set
  if (STRIPE_NATIVE_DISABLED && isNative) {
    return false;
  }
  
  return true;
}

/**
 * 🔍 CHECK: Should show Apple Pay / Google Pay buttons?
 * Only on web/PWA, never on iOS native
 */
export function isWalletPaymentAllowed(): boolean {
  const isNative = isCapacitorNative();
  const isIOS = isCapacitorIOS();
  
  // Never on iOS native (must use IAP)
  if (isIOS && isNative) {
    return false;
  }
  
  // OK on web, PWA, Android web
  return !STRIPE_NATIVE_DISABLED || !isNative;
}

/**
 * 🔐 ASSERT: Stripe PK matches server mode
 */
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
