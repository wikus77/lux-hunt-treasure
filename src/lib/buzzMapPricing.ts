// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ BUZZ MAP 60-Level Pricing Table

export const BUZZ_MAP_LEVELS = [
  { level: 1, radiusKm: 500, priceCents: 499 },
  { level: 2, radiusKm: 450, priceCents: 599 },
  { level: 3, radiusKm: 405, priceCents: 699 },
  { level: 4, radiusKm: 365, priceCents: 799 },
  { level: 5, radiusKm: 328, priceCents: 899 },
  { level: 6, radiusKm: 295, priceCents: 999 },
  { level: 7, radiusKm: 266, priceCents: 999 },
  { level: 8, radiusKm: 239, priceCents: 999 },
  { level: 9, radiusKm: 215, priceCents: 999 },
  { level: 10, radiusKm: 194, priceCents: 999 },
  { level: 11, radiusKm: 174, priceCents: 1499 },
  { level: 12, radiusKm: 157, priceCents: 1599 },
  { level: 13, radiusKm: 141, priceCents: 1699 },
  { level: 14, radiusKm: 127, priceCents: 1799 },
  { level: 15, radiusKm: 114, priceCents: 1899 },
  { level: 16, radiusKm: 103, priceCents: 1999 },
  { level: 17, radiusKm: 93, priceCents: 2999 },
  { level: 18, radiusKm: 83, priceCents: 3099 },
  { level: 19, radiusKm: 75, priceCents: 3199 },
  { level: 20, radiusKm: 68, priceCents: 3299 },
  { level: 21, radiusKm: 61, priceCents: 3399 },
  { level: 22, radiusKm: 55, priceCents: 3499 },
  { level: 23, radiusKm: 49, priceCents: 4999 },
  { level: 24, radiusKm: 44, priceCents: 5099 },
  { level: 25, radiusKm: 40, priceCents: 5599 },
  { level: 26, radiusKm: 36, priceCents: 5999 },
  { level: 27, radiusKm: 32, priceCents: 6999 },
  { level: 28, radiusKm: 29, priceCents: 7999 },
  { level: 29, radiusKm: 26, priceCents: 8999 },
  { level: 30, radiusKm: 24, priceCents: 9999 },
  { level: 31, radiusKm: 21, priceCents: 11999 },
  { level: 32, radiusKm: 19, priceCents: 19999 },
  { level: 33, radiusKm: 17, priceCents: 24999 },
  { level: 34, radiusKm: 15, priceCents: 29999 },
  { level: 35, radiusKm: 14, priceCents: 34999 },
  { level: 36, radiusKm: 13, priceCents: 39999 },
  { level: 37, radiusKm: 11, priceCents: 44999 },
  { level: 38, radiusKm: 10, priceCents: 49999 },
  { level: 39, radiusKm: 9, priceCents: 54999 },
  { level: 40, radiusKm: 8, priceCents: 59999 },
  { level: 41, radiusKm: 6.5, priceCents: 69999 },
  { level: 42, radiusKm: 5.8, priceCents: 79999 },
  { level: 43, radiusKm: 5.25, priceCents: 89999 },
  { level: 44, radiusKm: 4.7, priceCents: 99999 },
  { level: 45, radiusKm: 4.25, priceCents: 109999 },
  { level: 46, radiusKm: 3.8, priceCents: 119999 },
  { level: 47, radiusKm: 3.45, priceCents: 129999 },
  { level: 48, radiusKm: 3.1, priceCents: 139999 },
  { level: 49, radiusKm: 2.8, priceCents: 149999 },
  { level: 50, radiusKm: 2.5, priceCents: 159999 },
  { level: 51, radiusKm: 2.25, priceCents: 179999 },
  { level: 52, radiusKm: 2.0, priceCents: 199999 },
  { level: 53, radiusKm: 1.8, priceCents: 249999 },
  { level: 54, radiusKm: 1.65, priceCents: 299999 },
  { level: 55, radiusKm: 1.5, priceCents: 349999 },
  { level: 56, radiusKm: 1.3, priceCents: 399999 },
  { level: 57, radiusKm: 1.2, priceCents: 499999 },
  { level: 58, radiusKm: 1.08, priceCents: 699999 },
  { level: 59, radiusKm: 1.0, priceCents: 899999 },
  { level: 60, radiusKm: 0.5, priceCents: 1499999 }, // Maximum level
] as const;

export type BuzzMapLevel = typeof BUZZ_MAP_LEVELS[number];

/**
 * Get pricing and radius for a given level (1-60)
 */
export function getBuzzMapPricing(level: number): BuzzMapLevel {
  const clampedLevel = Math.min(Math.max(level, 1), 60);
  return BUZZ_MAP_LEVELS[clampedLevel - 1];
}

/**
 * Calculate next level pricing based on current area count
 */
export function calculateNextBuzzMapPrice(currentAreaCount: number): { level: number; radiusKm: number; priceCents: number; priceEur: number } {
  const nextLevel = Math.min(currentAreaCount + 1, 60);
  const pricing = getBuzzMapPricing(nextLevel);
  
  return {
    level: nextLevel,
    radiusKm: pricing.radiusKm,
    priceCents: pricing.priceCents,
    priceEur: pricing.priceCents / 100
  };
}

/**
 * Calculate next level radius based on map generation count
 */
export function calculateNextBuzzMapRadius(mapGenerationCount: number): number {
  const nextLevel = Math.min(mapGenerationCount + 1, 60);
  return getBuzzMapPricing(nextLevel).radiusKm;
}