/**
 * M1SSION™ Store Compliance Utilities
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - Controls feature availability based on platform
 * - Ensures Apple App Store + Google Play compliance
 * - Hides gambling-like features on native platforms
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { isCapacitorNative, getCapacitorPlatform } from '@/utils/capacitor';
import { 
  PULSE_BREAKER_ENABLED, 
  STORE_COMPLIANCE_MODE,
  NATIVE_IAP_ENABLED,
  STRIPE_NATIVE_DISABLED
} from '@/config/featureFlags';

/**
 * 🏪 STORE COMPLIANCE: Check if PulseBreaker is enabled
 * 
 * PulseBreaker is a Crash/Aviator-style game that:
 * - Uses random crash points
 * - Has betting/payout mechanics
 * - Displays crash history (gambler's fallacy)
 * - Has near-miss psychological manipulation
 * 
 * This WILL be rejected by Apple and Google as simulated gambling.
 * 
 * @returns false on native platforms (iOS/Android), respects flag on web
 */
export function isPulseBreakerEnabled(): boolean {
  // Native platforms: ALWAYS disabled for store compliance
  if (isCapacitorNative()) {
    console.log('[StoreCompliance] ❌ PulseBreaker disabled on native platform');
    return false;
  }
  
  // Web: respect the feature flag
  return PULSE_BREAKER_ENABLED;
}

/**
 * 🏪 STORE COMPLIANCE: Check if native IAP should be used
 * 
 * @returns true on native platforms when IAP is enabled
 */
export function shouldUseNativeIAP(): boolean {
  if (!isCapacitorNative()) {
    return false; // Web uses Stripe
  }
  
  return NATIVE_IAP_ENABLED;
}

/**
 * 🏪 STORE COMPLIANCE: Check if Stripe is available
 * 
 * @returns false on native when Stripe is disabled, true on web
 */
export function isStripeCheckoutAvailable(): boolean {
  if (isCapacitorNative() && STRIPE_NATIVE_DISABLED) {
    return false;
  }
  return true;
}

/**
 * 🏪 STORE COMPLIANCE: Get payment method for current platform
 * 
 * @returns 'native_iap' for iOS/Android, 'stripe' for web
 */
export function getPaymentMethod(): 'native_iap' | 'stripe' | 'none' {
  if (isCapacitorNative()) {
    if (NATIVE_IAP_ENABLED) {
      return 'native_iap';
    }
    // Native without IAP = no payment method
    return 'none';
  }
  
  // Web uses Stripe
  return 'stripe';
}

/**
 * 🏪 STORE COMPLIANCE: Get platform-specific store name
 */
export function getStoreName(): string {
  const platform = getCapacitorPlatform();
  switch (platform) {
    case 'ios':
      return 'App Store';
    case 'android':
      return 'Google Play';
    default:
      return 'Web';
  }
}

/**
 * 🏪 STORE COMPLIANCE: Check if deterministic progress mode is active
 */
export function isDeterministicProgressEnabled(): boolean {
  return STORE_COMPLIANCE_MODE;
}

/**
 * 🏪 STORE COMPLIANCE: Log compliance event
 */
export function logComplianceEvent(event: string, details?: Record<string, unknown>): void {
  const platform = getCapacitorPlatform();
  console.log(`[StoreCompliance] ${event}`, {
    platform,
    native: isCapacitorNative(),
    ...details
  });
}
