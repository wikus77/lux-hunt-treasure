// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1U Currency Formatter - Unified display currency for M1SSION™

/**
 * Conversion rate: 1 EUR = 100 M1U
 * This keeps numbers clean and easy to understand
 */
const EUR_TO_M1U_RATE = 100;

/**
 * Format a price in M1U currency
 * @param eurPrice - Price in EUR (e.g., 3.99)
 * @returns Formatted M1U string (e.g., "399 M1U")
 */
export function formatM1U(eurPrice: number): string {
  const m1uValue = Math.round(eurPrice * EUR_TO_M1U_RATE);
  
  // Format with thousands separator for large values
  const formatted = new Intl.NumberFormat('it-IT').format(m1uValue);
  
  return `${formatted} M1U`;
}

/**
 * Convert M1U back to EUR for backend/Stripe
 * @param m1uValue - Value in M1U (e.g., 399)
 * @returns EUR value (e.g., 3.99)
 */
export function m1uToEur(m1uValue: number): number {
  return m1uValue / EUR_TO_M1U_RATE;
}

/**
 * Convert EUR to M1U value (number only, no formatting)
 * @param eurPrice - Price in EUR (e.g., 3.99)
 * @returns M1U value (e.g., 399)
 */
export function eurToM1U(eurPrice: number): number {
  return Math.round(eurPrice * EUR_TO_M1U_RATE);
}

/**
 * Format M1U with short notation for large values
 * @param m1uValue - Value in M1U
 * @returns Formatted string (e.g., "1.5k M1U", "2M M1U")
 */
export function formatM1UShort(m1uValue: number): string {
  if (m1uValue >= 1000000) {
    return `${(m1uValue / 1000000).toFixed(1)}M M1U`;
  }
  if (m1uValue >= 1000) {
    return `${(m1uValue / 1000).toFixed(1)}k M1U`;
  }
  return `${m1uValue} M1U`;
}

/**
 * Get M1U symbol
 */
export const M1U_SYMBOL = 'M1U';

/**
 * Get conversion rate info
 */
export function getConversionRate(): { eurToM1U: number; m1uToEur: number } {
  return {
    eurToM1U: EUR_TO_M1U_RATE,
    m1uToEur: 1 / EUR_TO_M1U_RATE
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
