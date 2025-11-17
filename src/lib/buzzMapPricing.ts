// © 2025 M1SSION™ – Buzz Map Pricing (Client Mirror)
// NOTE: Server authority is in supabase/functions/_shared/buzzMapPricing.ts

export interface BuzzMapLevel {
  level: number;
  radiusKm: number;
  priceCents: number;
  priceEur: number;
}

// Client mirror of server pricing table - SERVER IS THE AUTHORITY
// ⚠️ SYNC: Must match supabase/functions/_shared/buzzMapPricing.ts exactly
export const BUZZ_MAP_LEVELS: BuzzMapLevel[] = [
  { level: 1, radiusKm: 500, priceCents: 499, priceEur: 4.99 },
  { level: 2, radiusKm: 460, priceCents: 599, priceEur: 5.99 },
  { level: 3, radiusKm: 430, priceCents: 699, priceEur: 6.99 },
  { level: 4, radiusKm: 400, priceCents: 799, priceEur: 7.99 },
  { level: 5, radiusKm: 370, priceCents: 899, priceEur: 8.99 },
  { level: 6, radiusKm: 345, priceCents: 999, priceEur: 9.99 },
  { level: 7, radiusKm: 320, priceCents: 999, priceEur: 9.99 },
  { level: 8, radiusKm: 300, priceCents: 999, priceEur: 9.99 },
  { level: 9, radiusKm: 285, priceCents: 999, priceEur: 9.99 },
  { level:10, radiusKm: 270, priceCents: 999, priceEur: 9.99 },
  { level:11, radiusKm: 255, priceCents: 1499, priceEur: 14.99 },
  { level:12, radiusKm: 240, priceCents: 1599, priceEur: 15.99 },
  { level:13, radiusKm: 225, priceCents: 1699, priceEur: 16.99 },
  { level:14, radiusKm: 210, priceCents: 1799, priceEur: 17.99 },
  { level:15, radiusKm: 195, priceCents: 1899, priceEur: 18.99 },
  { level:16, radiusKm: 180, priceCents: 1999, priceEur: 19.99 },
  { level:17, radiusKm: 170, priceCents: 2999, priceEur: 29.99 },
  { level:18, radiusKm: 160, priceCents: 3099, priceEur: 30.99 },
  { level:19, radiusKm: 150, priceCents: 3199, priceEur: 31.99 },
  { level:20, radiusKm: 140, priceCents: 3299, priceEur: 32.99 },
  { level:21, radiusKm: 130, priceCents: 3399, priceEur: 33.99 },
  { level:22, radiusKm: 120, priceCents: 3499, priceEur: 34.99 },
  { level:23, radiusKm: 115, priceCents: 4999, priceEur: 49.99 },
  { level:24, radiusKm: 110, priceCents: 5099, priceEur: 50.99 },
  { level:25, radiusKm: 105, priceCents: 5599, priceEur: 55.99 },
  { level:26, radiusKm: 100, priceCents: 5999, priceEur: 59.99 },
  { level:27, radiusKm: 95, priceCents: 6999, priceEur: 69.99 },
  { level:28, radiusKm: 90, priceCents: 7999, priceEur: 79.99 },
  { level:29, radiusKm: 85, priceCents: 8999, priceEur: 89.99 },
  { level:30, radiusKm: 80, priceCents: 9999, priceEur: 99.99 },
  { level:31, radiusKm: 76, priceCents: 11999, priceEur: 119.99 },
  { level:32, radiusKm: 72, priceCents: 19999, priceEur: 199.99 },
  { level:33, radiusKm: 68, priceCents: 24999, priceEur: 249.99 },
  { level:34, radiusKm: 64, priceCents: 29999, priceEur: 299.99 },
  { level:35, radiusKm: 60, priceCents: 34999, priceEur: 349.99 },
  { level:36, radiusKm: 56, priceCents: 39999, priceEur: 399.99 },
  { level:37, radiusKm: 52, priceCents: 44999, priceEur: 449.99 },
  { level:38, radiusKm: 48, priceCents: 49999, priceEur: 499.99 },
  { level:39, radiusKm: 44, priceCents: 54999, priceEur: 549.99 },
  { level:40, radiusKm: 40, priceCents: 59999, priceEur: 599.99 },
  { level:41, radiusKm: 37, priceCents: 69999, priceEur: 699.99 },
  { level:42, radiusKm: 34, priceCents: 79999, priceEur: 799.99 },
  { level:43, radiusKm: 31, priceCents: 89999, priceEur: 899.99 },
  { level:44, radiusKm: 28, priceCents: 99999, priceEur: 999.99 },
  { level:45, radiusKm: 25, priceCents: 109999, priceEur: 1099.99 },
  { level:46, radiusKm: 22, priceCents: 119999, priceEur: 1199.99 },
  { level:47, radiusKm: 20, priceCents: 129999, priceEur: 1299.99 },
  { level:48, radiusKm: 18, priceCents: 139999, priceEur: 1399.99 },
  { level:49, radiusKm: 16, priceCents: 149999, priceEur: 1499.99 },
  { level:50, radiusKm: 14, priceCents: 159999, priceEur: 1599.99 },
  { level:51, radiusKm: 12, priceCents: 179999, priceEur: 1799.99 },
  { level:52, radiusKm: 11, priceCents: 199999, priceEur: 1999.99 },
  { level:53, radiusKm: 10, priceCents: 249999, priceEur: 2499.99 },
  { level:54, radiusKm: 9, priceCents: 299999, priceEur: 2999.99 },
  { level:55, radiusKm: 8, priceCents: 349999, priceEur: 3499.99 },
  { level:56, radiusKm: 7, priceCents: 399999, priceEur: 3999.99 },
  { level:57, radiusKm: 6, priceCents: 499999, priceEur: 4999.99 },
  { level:58, radiusKm: 5, priceCents: 699999, priceEur: 6999.99 },
  { level:59, radiusKm: 5, priceCents: 899999, priceEur: 8999.99 },
  { level:60, radiusKm: 5, priceCents: 1499999, priceEur: 14999.99 },
];

export function getBuzzMapPricing(level: number): BuzzMapLevel {
  const clampedLevel = Math.max(1, Math.min(level, 60));
  return BUZZ_MAP_LEVELS[clampedLevel - 1];
}

export function calculateNextBuzzMapPrice(currentAreaCount: number): { 
  level: number; 
  radiusKm: number; 
  priceCents: number; 
  priceEur: number 
} {
  const level = Math.min(currentAreaCount + 1, 60);
  const data = getBuzzMapPricing(level);
  
  return {
    level,
    radiusKm: Math.max(0.5, data.radiusKm), // Minimum 0.5km
    priceCents: data.priceCents,
    priceEur: data.priceEur
  };
}