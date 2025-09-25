// © 2025 M1SSION™ – NIYVORA KFT™
// M1SSION™ BUZZ MAP 60-Level Official Pricing Table

export type BuzzMapLevel = { 
  level: number; 
  radiusKm: number; 
  priceEur: number;
};

export const BUZZ_MAP_LEVELS: BuzzMapLevel[] = [
  {level: 1, radiusKm: 500, priceEur: 4.99},
  {level: 2, radiusKm: 450, priceEur: 5.99},
  {level: 3, radiusKm: 405, priceEur: 6.99},
  {level: 4, radiusKm: 365, priceEur: 7.99},
  {level: 5, radiusKm: 328, priceEur: 8.99},
  {level: 6, radiusKm: 295, priceEur: 9.99},
  {level: 7, radiusKm: 266, priceEur: 9.99},
  {level: 8, radiusKm: 239, priceEur: 9.99},
  {level: 9, radiusKm: 215, priceEur: 9.99},
  {level: 10, radiusKm: 194, priceEur: 9.99},
  {level: 11, radiusKm: 174, priceEur: 14.99},
  {level: 12, radiusKm: 157, priceEur: 15.99},
  {level: 13, radiusKm: 141, priceEur: 16.99},
  {level: 14, radiusKm: 127, priceEur: 17.99},
  {level: 15, radiusKm: 114, priceEur: 18.99},
  {level: 16, radiusKm: 103, priceEur: 19.99},
  {level: 17, radiusKm: 93, priceEur: 29.99},
  {level: 18, radiusKm: 83, priceEur: 30.99},
  {level: 19, radiusKm: 75, priceEur: 31.99},
  {level: 20, radiusKm: 68, priceEur: 32.99},
  {level: 21, radiusKm: 61, priceEur: 33.99},
  {level: 22, radiusKm: 55, priceEur: 34.99},
  {level: 23, radiusKm: 49, priceEur: 49.99},
  {level: 24, radiusKm: 44, priceEur: 50.99},
  {level: 25, radiusKm: 40, priceEur: 55.99},
  {level: 26, radiusKm: 36, priceEur: 59.99},
  {level: 27, radiusKm: 32, priceEur: 69.99},
  {level: 28, radiusKm: 29, priceEur: 79.99},
  {level: 29, radiusKm: 26, priceEur: 89.99},
  {level: 30, radiusKm: 24, priceEur: 99.99},
  {level: 31, radiusKm: 21, priceEur: 119.99},
  {level: 32, radiusKm: 19, priceEur: 199.99},
  {level: 33, radiusKm: 17, priceEur: 249.99},
  {level: 34, radiusKm: 15, priceEur: 299.99},
  {level: 35, radiusKm: 14, priceEur: 349.99},
  {level: 36, radiusKm: 13, priceEur: 399.99},
  {level: 37, radiusKm: 11, priceEur: 449.99},
  {level: 38, radiusKm: 10, priceEur: 499.99},
  {level: 39, radiusKm: 9, priceEur: 549.99},
  {level: 40, radiusKm: 8, priceEur: 599.99},
  {level: 41, radiusKm: 6.5, priceEur: 699.99},
  {level: 42, radiusKm: 5.8, priceEur: 799.99},
  {level: 43, radiusKm: 5.25, priceEur: 899.99},
  {level: 44, radiusKm: 4.7, priceEur: 999.99},
  {level: 45, radiusKm: 4.25, priceEur: 1099.99},
  {level: 46, radiusKm: 3.8, priceEur: 1199.99},
  {level: 47, radiusKm: 3.45, priceEur: 1299.99},
  {level: 48, radiusKm: 3.1, priceEur: 1399.99},
  {level: 49, radiusKm: 2.8, priceEur: 1499.99},
  {level: 50, radiusKm: 2.5, priceEur: 1599.99},
  {level: 51, radiusKm: 2.25, priceEur: 1799.99},
  {level: 52, radiusKm: 2.0, priceEur: 1999.99},
  {level: 53, radiusKm: 1.8, priceEur: 2499.99},
  {level: 54, radiusKm: 1.65, priceEur: 2999.99},
  {level: 55, radiusKm: 1.5, priceEur: 3499.99},
  {level: 56, radiusKm: 1.3, priceEur: 3999.99},
  {level: 57, radiusKm: 1.2, priceEur: 4999.99},
  {level: 58, radiusKm: 1.08, priceEur: 6999.99},
  {level: 59, radiusKm: 1.0, priceEur: 8999.99},
  {level: 60, radiusKm: 0.5, priceEur: 14999.99},
];

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
export function calculateNextBuzzMapPrice(currentAreaCount: number): { 
  level: number; 
  radiusKm: number; 
  priceCents: number; 
  priceEur: number 
} {
  const nextLevel = Math.min(currentAreaCount + 1, 60);
  const pricing = getBuzzMapPricing(nextLevel);
  
  return {
    level: nextLevel,
    radiusKm: Math.max(0.5, pricing.radiusKm), // Enforce minimum 0.5km radius
    priceCents: Math.round(pricing.priceEur * 100),
    priceEur: pricing.priceEur
  };
}

/**
 * Calculate next level radius based on map generation count
 */
export function calculateNextBuzzMapRadius(mapGenerationCount: number): number {
  const nextLevel = Math.min(mapGenerationCount + 1, 60);
  const pricing = getBuzzMapPricing(nextLevel);
  return Math.max(0.5, pricing.radiusKm); // Enforce minimum 0.5km radius
}