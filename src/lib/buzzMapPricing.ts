// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export interface BuzzMapPricing {
  generation: number;
  radiusKm: number;
  segment: string;
  priceEur: number;
  totalAccumulated: number;
}

// Official BUZZ MAP pricing table from requirements
export const BUZZ_MAP_PRICING_TABLE: BuzzMapPricing[] = [
  { generation: 0, radiusKm: 500, segment: 'Entry', priceEur: 4.99, totalAccumulated: 4.99 },
  { generation: 1, radiusKm: 450, segment: 'Entry', priceEur: 8.99, totalAccumulated: 13.98 },
  { generation: 2, radiusKm: 405, segment: 'Entry', priceEur: 8.99, totalAccumulated: 22.97 },
  { generation: 3, radiusKm: 365, segment: 'Entry', priceEur: 10.99, totalAccumulated: 33.96 },
  { generation: 4, radiusKm: 329, segment: 'Entry', priceEur: 12.99, totalAccumulated: 46.95 },
  { generation: 5, radiusKm: 295, segment: 'Entry', priceEur: 14.99, totalAccumulated: 61.94 },
  { generation: 6, radiusKm: 265, segment: 'Entry', priceEur: 16.99, totalAccumulated: 78.93 },
  { generation: 7, radiusKm: 240, segment: 'Transizione', priceEur: 19.99, totalAccumulated: 98.92 },
  { generation: 8, radiusKm: 216, segment: 'High-Spender', priceEur: 29.99, totalAccumulated: 128.91 },
  { generation: 9, radiusKm: 195, segment: 'High-Spender', priceEur: 44.99, totalAccumulated: 173.90 },
  { generation: 10, radiusKm: 175, segment: 'High-Spender', priceEur: 69.99, totalAccumulated: 243.89 },
  { generation: 11, radiusKm: 155, segment: 'High-Spender', priceEur: 99.99, totalAccumulated: 343.88 },
  { generation: 12, radiusKm: 140, segment: 'High-Spender', priceEur: 129.99, totalAccumulated: 473.87 },
  { generation: 13, radiusKm: 126, segment: 'High-Spender', priceEur: 149.99, totalAccumulated: 623.86 },
];

export const calculateBuzzMapPricing = (generation: number): BuzzMapPricing => {
  // If generation exceeds table, use the last entry (cap)
  if (generation >= BUZZ_MAP_PRICING_TABLE.length) {
    return BUZZ_MAP_PRICING_TABLE[BUZZ_MAP_PRICING_TABLE.length - 1];
  }
  
  return BUZZ_MAP_PRICING_TABLE[generation];
};

export const calculateNextBuzzMapPrice = (currentGeneration: number): number => {
  const pricing = calculateBuzzMapPricing(currentGeneration);
  return pricing.priceEur;
};

export const calculateNextBuzzMapRadius = (currentGeneration: number): number => {
  const pricing = calculateBuzzMapPricing(currentGeneration);
  // Ensure minimum 5km radius
  return Math.max(5, pricing.radiusKm);
};