// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ BUZZ Pricing Logic - PROGRESSIVE PRICING SYSTEM

/**
 * M1SSION™ BUZZ Progressive Pricing Configuration
 * Implementa il sistema di pricing dinamico per il tasto BUZZ
 */
export const BUZZ_PRICING_TIERS = [
  // Click 1-10: €1.99 ciascuno
  { minClick: 1, maxClick: 10, priceEur: 1.99, priceCents: 199 },
  // Click 11-20: €3.99 ciascuno  
  { minClick: 11, maxClick: 20, priceEur: 3.99, priceCents: 399 },
  // Click 21-30: €5.99 ciascuno
  { minClick: 21, maxClick: 30, priceEur: 5.99, priceCents: 599 },
  // Click 31-40: €7.99 ciascuno
  { minClick: 31, maxClick: 40, priceEur: 7.99, priceCents: 799 },
  // Click 41-50: €9.99 ciascuno
  { minClick: 41, maxClick: 50, priceEur: 9.99, priceCents: 999 },
  // Click 51+: €10.99 ciascuno
  { minClick: 51, maxClick: 9999, priceEur: 10.99, priceCents: 1099 }
] as const;

/**
 * Calcola il prezzo BUZZ basato sul numero di click giornalieri
 */
export const calculateBuzzPrice = (dailyClickCount: number): { priceEur: number; priceCents: number } => {
  const nextClick = dailyClickCount + 1;
  
  const tier = BUZZ_PRICING_TIERS.find(
    tier => nextClick >= tier.minClick && nextClick <= tier.maxClick
  );
  
  if (!tier) {
    // Default al tier più alto se non trovato
    const highestTier = BUZZ_PRICING_TIERS[BUZZ_PRICING_TIERS.length - 1];
    return {
      priceEur: highestTier.priceEur,
      priceCents: highestTier.priceCents
    };
  }
  
  return {
    priceEur: tier.priceEur,
    priceCents: tier.priceCents
  };
};

/**
 * Ottieni il prezzo formattato per display
 */
export const getBuzzDisplayPrice = (dailyClickCount: number): string => {
  const { priceEur } = calculateBuzzPrice(dailyClickCount);
  return `€${priceEur.toFixed(2)}`;
};

/**
 * Ottieni i centesimi per Stripe
 */
export const getBuzzPriceCents = (dailyClickCount: number): number => {
  const { priceCents } = calculateBuzzPrice(dailyClickCount);
  return priceCents;
};

/**
 * Valida che il prezzo richiesto corrisponda al tier corretto
 */
export const validateBuzzPrice = (dailyClickCount: number, requestedPriceCents: number): boolean => {
  const expectedPriceCents = getBuzzPriceCents(dailyClickCount);
  return requestedPriceCents === expectedPriceCents;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™