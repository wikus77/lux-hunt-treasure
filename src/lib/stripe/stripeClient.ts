// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance for live payments
 * Reads publishable key from environment variables
 */
export function getStripe(): Promise<Stripe | null> {
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