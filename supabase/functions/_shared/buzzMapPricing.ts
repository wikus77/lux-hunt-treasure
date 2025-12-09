/**
 * © 2025 M1SSION™ — BUZZ MAP pricing shared (Deno)
 * M1SSION™ – BUZZ MAP Strategy A (Mass Market Boost)
 * 
 * Range generazioni:
 * 1–16:  Entry           €4.99–€29.99     (500km → 110km)
 * 17–22: Mid High-Spender €39.99–€149.99  (100km → 64km)
 * 23–30: High-Spender    €199.99–€699.99  (58km → 31km)
 * 31–42: ELITE           €999.99–€1,999.99 (28km → 5km)
 * 
 * ⚠️ SYNC: Must match src/lib/buzzMapPricing.ts exactly
 */

export type BuzzLevel = { level: number; radiusKm: number; priceCents: number };

// Strategy A – Mass Market Boost – 42 Levels
export const BUZZ_MAP_LEVELS: BuzzLevel[] = [
  // Entry (1-16): €4.99 → €29.99, 500km → 110km
  { level: 1,  radiusKm: 500, priceCents: 499 },
  { level: 2,  radiusKm: 450, priceCents: 699 },
  { level: 3,  radiusKm: 400, priceCents: 899 },
  { level: 4,  radiusKm: 360, priceCents: 1099 },
  { level: 5,  radiusKm: 320, priceCents: 1299 },
  { level: 6,  radiusKm: 290, priceCents: 1499 },
  { level: 7,  radiusKm: 260, priceCents: 1699 },
  { level: 8,  radiusKm: 230, priceCents: 1899 },
  { level: 9,  radiusKm: 210, priceCents: 1999 },
  { level: 10, radiusKm: 190, priceCents: 2199 },
  { level: 11, radiusKm: 175, priceCents: 2399 },
  { level: 12, radiusKm: 160, priceCents: 2499 },
  { level: 13, radiusKm: 145, priceCents: 2699 },
  { level: 14, radiusKm: 130, priceCents: 2799 },
  { level: 15, radiusKm: 120, priceCents: 2899 },
  { level: 16, radiusKm: 110, priceCents: 2999 },
  // Mid High-Spender (17-22): €39.99 → €149.99, 100km → 64km
  { level: 17, radiusKm: 100, priceCents: 3999 },
  { level: 18, radiusKm: 92,  priceCents: 5499 },
  { level: 19, radiusKm: 84,  priceCents: 6999 },
  { level: 20, radiusKm: 77,  priceCents: 8999 },
  { level: 21, radiusKm: 70,  priceCents: 10999 },
  { level: 22, radiusKm: 64,  priceCents: 14999 },
  // High-Spender (23-30): €199.99 → €699.99, 58km → 31km
  { level: 23, radiusKm: 58,  priceCents: 19999 },
  { level: 24, radiusKm: 53,  priceCents: 24999 },
  { level: 25, radiusKm: 48,  priceCents: 29999 },
  { level: 26, radiusKm: 44,  priceCents: 34999 },
  { level: 27, radiusKm: 40,  priceCents: 39999 },
  { level: 28, radiusKm: 37,  priceCents: 44999 },
  { level: 29, radiusKm: 34,  priceCents: 54999 },
  { level: 30, radiusKm: 31,  priceCents: 69999 },
  // ELITE (31-42): €999.99 → €1,999.99, 28km → 5km
  { level: 31, radiusKm: 28,  priceCents: 99999 },
  { level: 32, radiusKm: 26,  priceCents: 109999 },
  { level: 33, radiusKm: 24,  priceCents: 119999 },
  { level: 34, radiusKm: 22,  priceCents: 129999 },
  { level: 35, radiusKm: 20,  priceCents: 139999 },
  { level: 36, radiusKm: 18,  priceCents: 149999 },
  { level: 37, radiusKm: 16,  priceCents: 159999 },
  { level: 38, radiusKm: 14,  priceCents: 169999 },
  { level: 39, radiusKm: 12,  priceCents: 179999 },
  { level: 40, radiusKm: 10,  priceCents: 189999 },
  { level: 41, radiusKm: 8,   priceCents: 194999 },
  { level: 42, radiusKm: 5,   priceCents: 199999 },
];

// Maximum level constant
export const MAX_BUZZ_MAP_LEVEL = 42;

export function getBuzzLevelFromCount(count: number): BuzzLevel {
  // count == aree già create; prossimo livello = count
  // Cap at level 42 (index 41)
  const idx = Math.min(Math.max(count, 0), MAX_BUZZ_MAP_LEVEL - 1);
  return BUZZ_MAP_LEVELS[idx];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
