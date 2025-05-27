
export const getCurrentWeek = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
};

export const calculateNextRadius = (currentWeekAreas: any[], userCluesCount: number): number => {
  const baseRadius = 35;
  const hasExistingArea = currentWeekAreas.length > 0;
  
  if (hasExistingArea) {
    const previousRadius = currentWeekAreas[0].radius_km;
    return Math.max(1, previousRadius * 0.95);
  }
  
  const clueBonus = Math.min(userCluesCount * 0.5, 10);
  return baseRadius + clueBonus;
};

export const calculateBuzzMapPrice = (dailyBuzzMapCounter: number): number => {
  const basePrice = 1.99;
  const increment = 0.99;
  const maxPrice = 9.99;
  
  const price = basePrice + (dailyBuzzMapCounter * increment);
  return Math.min(price, maxPrice);
};
