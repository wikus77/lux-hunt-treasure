// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ BUZZ Progressive Pricing in M1U (1 M1U = €0.10)

/**
 * M1SSION™ BUZZ Progressive Pricing in M1U
 * Conversione da € a M1U basata su 1 M1U = €0.10
 */
export const BUZZ_M1U_COST = [
  // Click 1-10: €1.99 → 20 M1U
  { minClick: 1, maxClick: 10, m1u: 20 },
  // Click 11-20: €3.99 → 40 M1U  
  { minClick: 11, maxClick: 20, m1u: 40 },
  // Click 21-30: €5.99 → 60 M1U
  { minClick: 21, maxClick: 30, m1u: 60 },
  // Click 31-40: €7.99 → 80 M1U
  { minClick: 31, maxClick: 40, m1u: 80 },
  // Click 41-50: €9.99 → 100 M1U
  { minClick: 41, maxClick: 50, m1u: 100 },
  // Click 51+: €10.99 → 110 M1U
  { minClick: 51, maxClick: 9999, m1u: 110 }
] as const;

/**
 * Calcola il costo BUZZ in M1U basato sul numero di click giornalieri
 */
export const calculateBuzzCostM1U = (dailyClickCount: number): number => {
  const nextClick = dailyClickCount + 1;
  
  const tier = BUZZ_M1U_COST.find(
    tier => nextClick >= tier.minClick && nextClick <= tier.maxClick
  );
  
  if (!tier) {
    // Default al tier più alto se non trovato
    const highestTier = BUZZ_M1U_COST[BUZZ_M1U_COST.length - 1];
    return highestTier.m1u;
  }
  
  return tier.m1u;
};

/**
 * Ottieni il costo formattato per display
 */
export const getBuzzDisplayCostM1U = (dailyClickCount: number): string => {
  const costM1U = calculateBuzzCostM1U(dailyClickCount);
  return `${costM1U} M1U`;
};

/**
 * Valida che il costo richiesto corrisponda al tier corretto
 */
export const validateBuzzCostM1U = (dailyClickCount: number, requestedCostM1U: number): boolean => {
  const expectedCostM1U = calculateBuzzCostM1U(dailyClickCount);
  return requestedCostM1U === expectedCostM1U;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
