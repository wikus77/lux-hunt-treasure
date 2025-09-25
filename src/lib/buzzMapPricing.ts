// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export interface BuzzMapPricing {
  generation: number;
  radiusKm: number;
  segment: string;
  priceEur: number;
  totalAccumulated: number;
}

// Official M1SSION™ BUZZ MAP pricing table (60 levels)
export const BUZZ_MAP_PRICING_TABLE: BuzzMapPricing[] = [
  { generation: 1, radiusKm: 500, segment: 'Entry', priceEur: 4.99, totalAccumulated: 4.99 },
  { generation: 2, radiusKm: 450, segment: 'Entry', priceEur: 5.99, totalAccumulated: 10.98 },
  { generation: 3, radiusKm: 405, segment: 'Entry', priceEur: 6.99, totalAccumulated: 17.97 },
  { generation: 4, radiusKm: 365, segment: 'Entry', priceEur: 7.99, totalAccumulated: 25.96 },
  { generation: 5, radiusKm: 328, segment: 'Entry', priceEur: 8.99, totalAccumulated: 34.95 },
  { generation: 6, radiusKm: 295, segment: 'Entry', priceEur: 9.99, totalAccumulated: 44.94 },
  { generation: 7, radiusKm: 266, segment: 'Entry', priceEur: 9.99, totalAccumulated: 54.93 },
  { generation: 8, radiusKm: 239, segment: 'Entry', priceEur: 9.99, totalAccumulated: 64.92 },
  { generation: 9, radiusKm: 215, segment: 'Entry', priceEur: 9.99, totalAccumulated: 74.91 },
  { generation: 10, radiusKm: 194, segment: 'Entry', priceEur: 9.99, totalAccumulated: 84.90 },
  { generation: 11, radiusKm: 174, segment: 'Mid', priceEur: 14.99, totalAccumulated: 99.89 },
  { generation: 12, radiusKm: 157, segment: 'Mid', priceEur: 15.99, totalAccumulated: 115.88 },
  { generation: 13, radiusKm: 141, segment: 'Mid', priceEur: 16.99, totalAccumulated: 132.87 },
  { generation: 14, radiusKm: 127, segment: 'Mid', priceEur: 17.99, totalAccumulated: 150.86 },
  { generation: 15, radiusKm: 114, segment: 'Mid', priceEur: 18.99, totalAccumulated: 169.85 },
  { generation: 16, radiusKm: 103, segment: 'Mid', priceEur: 19.99, totalAccumulated: 189.84 },
  { generation: 17, radiusKm: 93, segment: 'High', priceEur: 29.99, totalAccumulated: 219.83 },
  { generation: 18, radiusKm: 83, segment: 'High', priceEur: 30.99, totalAccumulated: 250.82 },
  { generation: 19, radiusKm: 75, segment: 'High', priceEur: 31.99, totalAccumulated: 282.81 },
  { generation: 20, radiusKm: 68, segment: 'High', priceEur: 32.99, totalAccumulated: 315.80 },
  { generation: 21, radiusKm: 61, segment: 'High', priceEur: 33.99, totalAccumulated: 349.79 },
  { generation: 22, radiusKm: 55, segment: 'High', priceEur: 34.99, totalAccumulated: 384.78 },
  { generation: 23, radiusKm: 49, segment: 'Premium', priceEur: 49.99, totalAccumulated: 434.77 },
  { generation: 24, radiusKm: 44, segment: 'Premium', priceEur: 50.99, totalAccumulated: 485.76 },
  { generation: 25, radiusKm: 40, segment: 'Premium', priceEur: 55.99, totalAccumulated: 541.75 },
  { generation: 26, radiusKm: 36, segment: 'Premium', priceEur: 59.99, totalAccumulated: 601.74 },
  { generation: 27, radiusKm: 32, segment: 'Premium', priceEur: 69.99, totalAccumulated: 671.73 },
  { generation: 28, radiusKm: 29, segment: 'Premium', priceEur: 79.99, totalAccumulated: 751.72 },
  { generation: 29, radiusKm: 26, segment: 'Premium', priceEur: 89.99, totalAccumulated: 841.71 },
  { generation: 30, radiusKm: 24, segment: 'Premium', priceEur: 99.99, totalAccumulated: 941.70 },
  { generation: 31, radiusKm: 21, segment: 'Elite', priceEur: 119.99, totalAccumulated: 1061.69 },
  { generation: 32, radiusKm: 19, segment: 'Elite', priceEur: 199.99, totalAccumulated: 1261.68 },
  { generation: 33, radiusKm: 17, segment: 'Elite', priceEur: 249.99, totalAccumulated: 1511.67 },
  { generation: 34, radiusKm: 15, segment: 'Elite', priceEur: 299.99, totalAccumulated: 1811.66 },
  { generation: 35, radiusKm: 14, segment: 'Elite', priceEur: 349.99, totalAccumulated: 2161.65 },
  { generation: 36, radiusKm: 13, segment: 'Elite', priceEur: 399.99, totalAccumulated: 2561.64 },
  { generation: 37, radiusKm: 11, segment: 'Elite', priceEur: 449.99, totalAccumulated: 3011.63 },
  { generation: 38, radiusKm: 10, segment: 'Elite', priceEur: 499.99, totalAccumulated: 3511.62 },
  { generation: 39, radiusKm: 9, segment: 'Elite', priceEur: 549.99, totalAccumulated: 4061.61 },
  { generation: 40, radiusKm: 8, segment: 'Elite', priceEur: 599.99, totalAccumulated: 4661.60 },
  { generation: 41, radiusKm: 6.5, segment: 'Ultra', priceEur: 699.99, totalAccumulated: 5361.59 },
  { generation: 42, radiusKm: 5.8, segment: 'Ultra', priceEur: 799.99, totalAccumulated: 6161.58 },
  { generation: 43, radiusKm: 5.25, segment: 'Ultra', priceEur: 899.99, totalAccumulated: 7061.57 },
  { generation: 44, radiusKm: 4.7, segment: 'Ultra', priceEur: 999.99, totalAccumulated: 8061.56 },
  { generation: 45, radiusKm: 4.25, segment: 'Ultra', priceEur: 1099.99, totalAccumulated: 9161.55 },
  { generation: 46, radiusKm: 3.8, segment: 'Ultra', priceEur: 1199.99, totalAccumulated: 10361.54 },
  { generation: 47, radiusKm: 3.45, segment: 'Ultra', priceEur: 1299.99, totalAccumulated: 11661.53 },
  { generation: 48, radiusKm: 3.1, segment: 'Ultra', priceEur: 1399.99, totalAccumulated: 13061.52 },
  { generation: 49, radiusKm: 2.8, segment: 'Ultra', priceEur: 1499.99, totalAccumulated: 14561.51 },
  { generation: 50, radiusKm: 2.5, segment: 'Ultra', priceEur: 1599.99, totalAccumulated: 16161.50 },
  { generation: 51, radiusKm: 2.25, segment: 'Legendary', priceEur: 1799.99, totalAccumulated: 17961.49 },
  { generation: 52, radiusKm: 2.0, segment: 'Legendary', priceEur: 1999.99, totalAccumulated: 19961.48 },
  { generation: 53, radiusKm: 1.8, segment: 'Legendary', priceEur: 2499.99, totalAccumulated: 22461.47 },
  { generation: 54, radiusKm: 1.65, segment: 'Legendary', priceEur: 2999.99, totalAccumulated: 25461.46 },
  { generation: 55, radiusKm: 1.5, segment: 'Legendary', priceEur: 3499.99, totalAccumulated: 28961.45 },
  { generation: 56, radiusKm: 1.3, segment: 'Legendary', priceEur: 3999.99, totalAccumulated: 32961.44 },
  { generation: 57, radiusKm: 1.2, segment: 'Legendary', priceEur: 4999.99, totalAccumulated: 37961.43 },
  { generation: 58, radiusKm: 1.08, segment: 'Legendary', priceEur: 6999.99, totalAccumulated: 44961.42 },
  { generation: 59, radiusKm: 1.0, segment: 'Legendary', priceEur: 8999.99, totalAccumulated: 53961.41 },
  { generation: 60, radiusKm: 0.5, segment: 'Legendary', priceEur: 14999.99, totalAccumulated: 68961.40 },
];

export const calculateBuzzMapPricing = (generation: number): BuzzMapPricing => {
  const index = Math.min(generation - 1, BUZZ_MAP_PRICING_TABLE.length - 1);
  return BUZZ_MAP_PRICING_TABLE[Math.max(0, index)];
};

export const calculateNextBuzzMapPrice = (currentGeneration: number): number => {
  const nextLevel = Math.min(currentGeneration + 1, 60);
  const pricing = calculateBuzzMapPricing(nextLevel);
  return pricing.priceEur;
};

export const calculateNextBuzzMapRadius = (currentGeneration: number): number => {
  const nextLevel = Math.min(currentGeneration + 1, 60);
  const pricing = calculateBuzzMapPricing(nextLevel);
  return Math.max(0.5, pricing.radiusKm);
};