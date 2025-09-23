// © 2025 M1SSION™ – NIYVORA KFT™
// Universal Stripe fallback to prevent runtime ReferenceError and missing PK issues
// This module attaches a safe getStripe() to window and exports getStripeSafe

import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getStripe as coreGetStripe } from '@/lib/stripe/stripeClient';

let cachedPromise: Promise<Stripe | null> | null = null;

function resolvePublishableKey(): string | null {
  try {
    // Prefer Vite env if present
    const envPk = (import.meta as any)?.env?.VITE_STRIPE_PUBLISHABLE_KEY;
    if (envPk && typeof envPk === 'string' && envPk.startsWith('pk_')) return envPk;
  } catch (_) {}

  // Fallbacks from global/window to support Cloudflare Pages runtime quirks
  const w = typeof window !== 'undefined' ? (window as any) : undefined;
  if (w?.__STRIPE_PK__ && typeof w.__STRIPE_PK__ === 'string') return w.__STRIPE_PK__;
  if (w?.ENV?.VITE_STRIPE_PUBLISHABLE_KEY && typeof w.ENV.VITE_STRIPE_PUBLISHABLE_KEY === 'string') {
    return w.ENV.VITE_STRIPE_PUBLISHABLE_KEY;
  }
  return null;
}

export async function getStripeSafe(): Promise<Stripe | null> {
  // Use existing client utility first (will throw if PK truly missing)
  try {
    return await coreGetStripe();
  } catch (err) {
    console.warn('[StripeFallback] core getStripe failed, attempting fallback:', err);
  }

  if (!cachedPromise) {
    const pk = resolvePublishableKey();
    if (!pk) {
      console.warn('[StripeFallback] No publishable key detected. Returning null.');
      cachedPromise = Promise.resolve(null);
    } else {
      cachedPromise = loadStripe(pk);
    }
  }
  return cachedPromise;
}

// Attach a global to prevent "getStripe is not defined" in legacy or lazy modules
try {
  const w = typeof window !== 'undefined' ? (window as any) : undefined;
  if (w && typeof w.getStripe !== 'function') {
    w.getStripe = getStripeSafe;
    // Also expose for debugging if needed
    w.__getStripeSafe = getStripeSafe;
  }
} catch (_) {
  // no-op
}
