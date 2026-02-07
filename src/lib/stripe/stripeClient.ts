// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { isCapacitorNative, isCapacitorIOS, getCapacitorPlatform } from '@/utils/capacitor';
import { STRIPE_NATIVE_DISABLED } from '@/config/featureFlags';

let stripePromise: Promise<Stripe | null>;

/**
 * 🏪 STORE COMPLIANCE: Check if Stripe is available
 * 
 * CRITICAL RULES:
 * - iOS Native: ALWAYS blocked (Apple IAP required)
 * - Android Native: Blocked if STRIPE_NATIVE_DISABLED
 * - Web/PWA: Always allowed
 * 
 * Returns false on native platforms when STRIPE_NATIVE_DISABLED is true
 */
export function isStripeAvailable(): boolean {
  const platform = getCapacitorPlatform();
  const isNative = isCapacitorNative();
  const isIOS = isCapacitorIOS();
  
  // 🛡️ CRITICAL: iOS native = ALWAYS blocked (App Store compliance)
  if (isIOS && isNative) {
    console.log('[Stripe] ❌ BLOCKED on iOS native - Use Apple IAP');
    return false;
  }
  
  // If native Stripe disabled and running on Capacitor, block
  if (STRIPE_NATIVE_DISABLED && isNative) {
    console.log('[Stripe] ❌ Disabled on native platform:', platform);
    return false;
  }
  
  return true;
}

/**
 * 🛡️ ASSERT: Stripe must be available
 * Throws if called on iOS native or blocked platform
 */
export function assertStripeAvailable(): void {
  if (!isStripeAvailable()) {
    const platform = getCapacitorPlatform();
    const isIOS = isCapacitorIOS();
    
    if (isIOS) {
      throw new Error('🏪 Store Compliance: Stripe non disponibile su iOS. Usa acquisti in-app.');
    }
    throw new Error(`Stripe non disponibile su questa piattaforma (${platform})`);
  }
}

/**
 * Get Stripe instance for live payments
 * Reads publishable key from environment variables
 * 
 * 🏪 STORE COMPLIANCE: Returns null on native platforms
 * iOS MUST use Apple IAP (StoreKit)
 * Android MUST use Google Play Billing (when flag enabled)
 */
export function getStripe(): Promise<Stripe | null> {
  // 🏪 STORE COMPLIANCE: Block Stripe on native platforms
  if (!isStripeAvailable()) {
    const platform = getCapacitorPlatform();
    console.log(`[Stripe] ❌ Platform ${platform} - Stripe disabled, use native IAP`);
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY');
    }
    
    // Ensure we're using LIVE key (pk_live_...)
    if (!pk.startsWith('pk_live_')) {
      console.warn('⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not a LIVE key:', pk.substring(0, 10) + '...');
    }
    
    // 🔐 Stripe key log removed for security
    stripePromise = loadStripe(pk as string);
  }
  return stripePromise;
}