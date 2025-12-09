// © 2025 M1SSION™ – Buzz Map Pricing (Client Mirror)
// M1SSION™ – BUZZ MAP Strategy A (Mass Market Boost)
// NOTE: Server authority is in supabase/functions/_shared/buzzMapPricing.ts
// 
// Range generazioni:
// 1–16:  Entry           €4.99–€29.99     (500km → 110km)
// 17–22: Mid High-Spender €39.99–€149.99  (100km → 64km)
// 23–30: High-Spender    €199.99–€699.99  (58km → 31km)
// 31–42: ELITE           €999.99–€1,999.99 (28km → 5km)

export interface BuzzMapLevel {
  level: number;
  radiusKm: number;
  priceCents: number;
  priceEur: number;
}

// Client mirror of server pricing table - SERVER IS THE AUTHORITY
// ⚠️ SYNC: Must match supabase/functions/_shared/buzzMapPricing.ts exactly
// Strategy A – Mass Market Boost – 42 Levels
export const BUZZ_MAP_LEVELS: BuzzMapLevel[] = [
  // Entry (1-16): €4.99 → €29.99, 500km → 110km
  { level: 1,  radiusKm: 500, priceCents: 499,   priceEur: 4.99 },
  { level: 2,  radiusKm: 450, priceCents: 699,   priceEur: 6.99 },
  { level: 3,  radiusKm: 400, priceCents: 899,   priceEur: 8.99 },
  { level: 4,  radiusKm: 360, priceCents: 1099,  priceEur: 10.99 },
  { level: 5,  radiusKm: 320, priceCents: 1299,  priceEur: 12.99 },
  { level: 6,  radiusKm: 290, priceCents: 1499,  priceEur: 14.99 },
  { level: 7,  radiusKm: 260, priceCents: 1699,  priceEur: 16.99 },
  { level: 8,  radiusKm: 230, priceCents: 1899,  priceEur: 18.99 },
  { level: 9,  radiusKm: 210, priceCents: 1999,  priceEur: 19.99 },
  { level: 10, radiusKm: 190, priceCents: 2199,  priceEur: 21.99 },
  { level: 11, radiusKm: 175, priceCents: 2399,  priceEur: 23.99 },
  { level: 12, radiusKm: 160, priceCents: 2499,  priceEur: 24.99 },
  { level: 13, radiusKm: 145, priceCents: 2699,  priceEur: 26.99 },
  { level: 14, radiusKm: 130, priceCents: 2799,  priceEur: 27.99 },
  { level: 15, radiusKm: 120, priceCents: 2899,  priceEur: 28.99 },
  { level: 16, radiusKm: 110, priceCents: 2999,  priceEur: 29.99 },
  // Mid High-Spender (17-22): €39.99 → €149.99, 100km → 64km
  { level: 17, radiusKm: 100, priceCents: 3999,  priceEur: 39.99 },
  { level: 18, radiusKm: 92,  priceCents: 5499,  priceEur: 54.99 },
  { level: 19, radiusKm: 84,  priceCents: 6999,  priceEur: 69.99 },
  { level: 20, radiusKm: 77,  priceCents: 8999,  priceEur: 89.99 },
  { level: 21, radiusKm: 70,  priceCents: 10999, priceEur: 109.99 },
  { level: 22, radiusKm: 64,  priceCents: 14999, priceEur: 149.99 },
  // High-Spender (23-30): €199.99 → €699.99, 58km → 31km
  { level: 23, radiusKm: 58,  priceCents: 19999, priceEur: 199.99 },
  { level: 24, radiusKm: 53,  priceCents: 24999, priceEur: 249.99 },
  { level: 25, radiusKm: 48,  priceCents: 29999, priceEur: 299.99 },
  { level: 26, radiusKm: 44,  priceCents: 34999, priceEur: 349.99 },
  { level: 27, radiusKm: 40,  priceCents: 39999, priceEur: 399.99 },
  { level: 28, radiusKm: 37,  priceCents: 44999, priceEur: 449.99 },
  { level: 29, radiusKm: 34,  priceCents: 54999, priceEur: 549.99 },
  { level: 30, radiusKm: 31,  priceCents: 69999, priceEur: 699.99 },
  // ELITE (31-42): €999.99 → €1,999.99, 28km → 5km
  { level: 31, radiusKm: 28,  priceCents: 99999,  priceEur: 999.99 },
  { level: 32, radiusKm: 26,  priceCents: 109999, priceEur: 1099.99 },
  { level: 33, radiusKm: 24,  priceCents: 119999, priceEur: 1199.99 },
  { level: 34, radiusKm: 22,  priceCents: 129999, priceEur: 1299.99 },
  { level: 35, radiusKm: 20,  priceCents: 139999, priceEur: 1399.99 },
  { level: 36, radiusKm: 18,  priceCents: 149999, priceEur: 1499.99 },
  { level: 37, radiusKm: 16,  priceCents: 159999, priceEur: 1599.99 },
  { level: 38, radiusKm: 14,  priceCents: 169999, priceEur: 1699.99 },
  { level: 39, radiusKm: 12,  priceCents: 179999, priceEur: 1799.99 },
  { level: 40, radiusKm: 10,  priceCents: 189999, priceEur: 1899.99 },
  { level: 41, radiusKm: 8,   priceCents: 194999, priceEur: 1949.99 },
  { level: 42, radiusKm: 5,   priceCents: 199999, priceEur: 1999.99 },
];

// Maximum level constant
export const MAX_BUZZ_MAP_LEVEL = 42;

export function getBuzzMapPricing(level: number): BuzzMapLevel {
  // Clamp to valid range: 1-42, cap at 42 for any higher value
  const clampedLevel = Math.max(1, Math.min(level, MAX_BUZZ_MAP_LEVEL));
  return BUZZ_MAP_LEVELS[clampedLevel - 1];
}

export function calculateNextBuzzMapPrice(currentAreaCount: number): { 
  level: number; 
  radiusKm: number; 
  priceCents: number; 
  priceEur: number 
} {
  // Cap at level 42
  const level = Math.min(currentAreaCount + 1, MAX_BUZZ_MAP_LEVEL);
  const data = getBuzzMapPricing(level);
  
  return {
    level,
    radiusKm: Math.max(0.5, data.radiusKm), // Minimum 0.5km
    priceCents: data.priceCents,
    priceEur: data.priceEur
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
