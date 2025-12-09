// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ BUZZ MAP Progressive Pricing in M1U (1 M1U = €0.10)
// M1SSION™ – BUZZ MAP Strategy A (Mass Market Boost)
//
// Range generazioni:
// 1–16:  Entry           50–300 M1U     (€4.99–€29.99)
// 17–22: Mid High-Spender 400–1500 M1U  (€39.99–€149.99)
// 23–30: High-Spender    2000–7000 M1U  (€199.99–€699.99)
// 31–42: ELITE           10000–20000 M1U (€999.99–€1,999.99)

/**
 * BUZZ MAP Pricing Table - Conversione da € a M1U (1 M1U = €0.10)
 * 42 livelli progressivi con raggio decrescente - Strategy A
 */
export const BUZZ_MAP_M1U_PRICING = [
  // Entry (1-16): 50 → 300 M1U
  { level: 1,  radiusKm: 500, priceEur: 4.99,    m1u: 50 },
  { level: 2,  radiusKm: 450, priceEur: 6.99,    m1u: 70 },
  { level: 3,  radiusKm: 400, priceEur: 8.99,    m1u: 90 },
  { level: 4,  radiusKm: 360, priceEur: 10.99,   m1u: 110 },
  { level: 5,  radiusKm: 320, priceEur: 12.99,   m1u: 130 },
  { level: 6,  radiusKm: 290, priceEur: 14.99,   m1u: 150 },
  { level: 7,  radiusKm: 260, priceEur: 16.99,   m1u: 170 },
  { level: 8,  radiusKm: 230, priceEur: 18.99,   m1u: 190 },
  { level: 9,  radiusKm: 210, priceEur: 19.99,   m1u: 200 },
  { level: 10, radiusKm: 190, priceEur: 21.99,   m1u: 220 },
  { level: 11, radiusKm: 175, priceEur: 23.99,   m1u: 240 },
  { level: 12, radiusKm: 160, priceEur: 24.99,   m1u: 250 },
  { level: 13, radiusKm: 145, priceEur: 26.99,   m1u: 270 },
  { level: 14, radiusKm: 130, priceEur: 27.99,   m1u: 280 },
  { level: 15, radiusKm: 120, priceEur: 28.99,   m1u: 290 },
  { level: 16, radiusKm: 110, priceEur: 29.99,   m1u: 300 },
  // Mid High-Spender (17-22): 400 → 1500 M1U
  { level: 17, radiusKm: 100, priceEur: 39.99,   m1u: 400 },
  { level: 18, radiusKm: 92,  priceEur: 54.99,   m1u: 550 },
  { level: 19, radiusKm: 84,  priceEur: 69.99,   m1u: 700 },
  { level: 20, radiusKm: 77,  priceEur: 89.99,   m1u: 900 },
  { level: 21, radiusKm: 70,  priceEur: 109.99,  m1u: 1100 },
  { level: 22, radiusKm: 64,  priceEur: 149.99,  m1u: 1500 },
  // High-Spender (23-30): 2000 → 7000 M1U
  { level: 23, radiusKm: 58,  priceEur: 199.99,  m1u: 2000 },
  { level: 24, radiusKm: 53,  priceEur: 249.99,  m1u: 2500 },
  { level: 25, radiusKm: 48,  priceEur: 299.99,  m1u: 3000 },
  { level: 26, radiusKm: 44,  priceEur: 349.99,  m1u: 3500 },
  { level: 27, radiusKm: 40,  priceEur: 399.99,  m1u: 4000 },
  { level: 28, radiusKm: 37,  priceEur: 449.99,  m1u: 4500 },
  { level: 29, radiusKm: 34,  priceEur: 549.99,  m1u: 5500 },
  { level: 30, radiusKm: 31,  priceEur: 699.99,  m1u: 7000 },
  // ELITE (31-42): 10000 → 20000 M1U
  { level: 31, radiusKm: 28,  priceEur: 999.99,  m1u: 10000 },
  { level: 32, radiusKm: 26,  priceEur: 1099.99, m1u: 11000 },
  { level: 33, radiusKm: 24,  priceEur: 1199.99, m1u: 12000 },
  { level: 34, radiusKm: 22,  priceEur: 1299.99, m1u: 13000 },
  { level: 35, radiusKm: 20,  priceEur: 1399.99, m1u: 14000 },
  { level: 36, radiusKm: 18,  priceEur: 1499.99, m1u: 15000 },
  { level: 37, radiusKm: 16,  priceEur: 1599.99, m1u: 16000 },
  { level: 38, radiusKm: 14,  priceEur: 1699.99, m1u: 17000 },
  { level: 39, radiusKm: 12,  priceEur: 1799.99, m1u: 18000 },
  { level: 40, radiusKm: 10,  priceEur: 1899.99, m1u: 19000 },
  { level: 41, radiusKm: 8,   priceEur: 1949.99, m1u: 19500 },
  { level: 42, radiusKm: 5,   priceEur: 1999.99, m1u: 20000 },
] as const;

// Maximum level constant
export const MAX_BUZZ_MAP_LEVEL = 42;

/**
 * Ottieni il pricing per un determinato livello
 */
export const getBuzzMapPricingM1U = (level: number) => {
  // Clamp to valid range: 1-42
  const clampedLevel = Math.max(1, Math.min(level, MAX_BUZZ_MAP_LEVEL));
  const pricing = BUZZ_MAP_M1U_PRICING.find(p => p.level === clampedLevel);
  
  if (!pricing) {
    // Fallback al primo livello
    return BUZZ_MAP_M1U_PRICING[0];
  }
  
  return pricing;
};

/**
 * Ottieni solo il costo in M1U per un livello
 */
export const getBuzzMapCostM1U = (level: number): number => {
  const pricing = getBuzzMapPricingM1U(level);
  return pricing.m1u;
};

/**
 * Ottieni il costo formattato per display
 */
export const getBuzzMapDisplayCostM1U = (level: number): string => {
  const costM1U = getBuzzMapCostM1U(level);
  return `${costM1U.toLocaleString()} M1U`;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
