// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Unified Subscription Pricing - Single Source of Truth

/**
 * Official M1SSION™ subscription prices - CENTRALIZED
 * All prices in EUR - converted to cents for Stripe
 */
export const SUBSCRIPTION_PRICES = {
  silver: {
    id: 'silver',
    label: 'Piano Silver',
    priceEur: 3.99,
    priceCents: 399,
    cluesPerWeek: 3,
    accessHoursAdvance: 2,
    support: 'chat'
  },
  gold: {
    id: 'gold', 
    label: 'Piano Gold',
    priceEur: 6.99,
    priceCents: 699,
    cluesPerWeek: 5,
    accessHoursAdvance: 6,
    support: 'prioritario'
  },
  black: {
    id: 'black',
    label: 'Piano Black', 
    priceEur: 9.99,
    priceCents: 999,
    cluesPerWeek: 7,
    accessHoursAdvance: 12,
    support: 'vip'
  },
  titanium: {
    id: 'titanium',
    label: 'Piano Titanium',
    priceEur: 29.99,
    priceCents: 2999,
    cluesPerWeek: 9,
    accessHoursAdvance: 24,
    support: 'ultra'
  }
} as const;

/**
 * Get price in cents for Stripe by plan ID
 */
export const getPriceCents = (planId: string): number => {
  const plan = SUBSCRIPTION_PRICES[planId as keyof typeof SUBSCRIPTION_PRICES];
  return plan?.priceCents || 0;
};

/**
 * Get price in EUR for display by plan ID
 */
export const getPriceEur = (planId: string): number => {
  const plan = SUBSCRIPTION_PRICES[planId as keyof typeof SUBSCRIPTION_PRICES];
  return plan?.priceEur || 0;
};

/**
 * Format price for display (€X.XX)
 */
export const formatPrice = (planId: string): string => {
  const price = getPriceEur(planId);
  return `€${price.toFixed(2)}`;
};

/**
 * Get all plan IDs
 */
export const getPlanIds = (): string[] => {
  return Object.keys(SUBSCRIPTION_PRICES);
};

/**
 * Validate if plan exists
 */
export const isValidPlan = (planId: string): boolean => {
  return planId in SUBSCRIPTION_PRICES;
};

// Export individual prices for backward compatibility
export const SILVER_PRICE_CENTS = SUBSCRIPTION_PRICES.silver.priceCents;
export const GOLD_PRICE_CENTS = SUBSCRIPTION_PRICES.gold.priceCents;
export const BLACK_PRICE_CENTS = SUBSCRIPTION_PRICES.black.priceCents;
export const TITANIUM_PRICE_CENTS = SUBSCRIPTION_PRICES.titanium.priceCents;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™