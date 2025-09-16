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
      console.warn('Missing VITE_STRIPE_PUBLISHABLE_KEY');
    }
    stripePromise = loadStripe(pk as string);
  }
  return stripePromise;
}