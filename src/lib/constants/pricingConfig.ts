// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// CENTRALE PREZZI UFFICIALI - FONTE UNICA DI VERITÀ

/**
 * Configurazione prezzi M1SSION™ - SINCRONIZZAZIONE TOTALE
 * Questi sono i prezzi UFFICIALI che devono essere rispettati ovunque
 */
export const PRICING_CONFIG = {
  Silver: {
    priceEur: 3.99,
    priceCents: 399,
    displayPrice: "€3.99",
    label: "Piano Silver"
  },
  Gold: {
    priceEur: 6.99,
    priceCents: 699,
    displayPrice: "€6.99",
    label: "Piano Gold"
  },
  Black: {
    priceEur: 9.99,
    priceCents: 999,
    displayPrice: "€9.99",
    label: "Piano Black"
  },
  Titanium: {
    priceEur: 29.99,
    priceCents: 2999,
    displayPrice: "€29.99",
    label: "Piano Titanium"
  }
} as const;

/**
 * Ottieni prezzo in centesimi per Stripe
 */
export const getPriceCents = (plan: string): number => {
  const planData = PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG];
  return planData?.priceCents || 0;
};

/**
 * Ottieni prezzo formattato per display
 */
export const getDisplayPrice = (plan: string): string => {
  const planData = PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG];
  return planData?.displayPrice || "€0.00";
};

/**
 * Ottieni prezzo in euro (numero)
 */
export const getPriceEur = (plan: string): number => {
  const planData = PRICING_CONFIG[plan as keyof typeof PRICING_CONFIG];
  return planData?.priceEur || 0;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™