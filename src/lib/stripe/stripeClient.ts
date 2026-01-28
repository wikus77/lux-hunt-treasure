// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { isCapacitorNative } from '@/utils/capacitor';
import { STRIPE_NATIVE_DISABLED } from '@/config/featureFlags';

let stripePromise: Promise<Stripe | null>;

/**
 * 🏪 STORE COMPLIANCE: Check if Stripe is available
 * Returns false on native platforms when STRIPE_NATIVE_DISABLED is true
 */
export function isStripeAvailable(): boolean {
  // If native Stripe disabled and running on Capacitor, block
  if (STRIPE_NATIVE_DISABLED && isCapacitorNative()) {
    console.log('[Stripe] ❌ Disabled on native platform (iOS/Android)');
    return false;
  }
  return true;
}

/**
 * Get Stripe instance for live payments
 * Reads publishable key from environment variables
 * 
 * 🏪 STORE COMPLIANCE: Returns null on native platforms
 * iOS/Android MUST use Apple IAP / Google Play Billing
 */
export function getStripe(): Promise<Stripe | null> {
  // 🏪 STORE COMPLIANCE: Block Stripe on native platforms
  if (!isStripeAvailable()) {
    console.log('[Stripe] ❌ Native platform detected - Stripe disabled');
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