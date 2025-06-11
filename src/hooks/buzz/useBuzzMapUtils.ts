
import { useCallback } from 'react';
import { BuzzMapArea } from '../useBuzzMapLogic';

export const useBuzzMapUtils = () => {
  // Calculate current week
  const getCurrentWeek = useCallback((): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }, []);

  // Get active area
  const getActiveAreaFromList = useCallback((areas: BuzzMapArea[]): BuzzMapArea | null => {
    if (areas.length === 0) return null;
    return areas[0];
  }, []);

  // CRITICAL FIX: EXACT Progressive radius calculation with GUARANTEED precision
  const calculateProgressiveRadiusFromCount = useCallback((weeklyBuzzCount: number): number => {
    const BASE_RADIUS = 100.0; // EXACTLY 100.0 km initial
    const MIN_RADIUS = 0.5; // EXACTLY 0.5 km minimum
    const REDUCTION_FACTOR = 0.95; // EXACTLY -5% each time
    
    console.log('📏 EXACT PROGRESSIVE RADIUS CALCULATION:', {
      weeklyBuzzCount,
      BASE_RADIUS,
      MIN_RADIUS,
      REDUCTION_FACTOR
    });
    
    // CRITICAL: For first BUZZ (count 0), return base radius EXACTLY
    if (weeklyBuzzCount === 0) {
      console.log('📏 FIRST BUZZ - Using exact base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }
    
    // CRITICAL: Apply EXACT formula: radius = BASE * (REDUCTION_FACTOR ^ count)
    const radius = BASE_RADIUS * Math.pow(REDUCTION_FACTOR, weeklyBuzzCount);
    console.log(`📏 EXACT FORMULA: ${BASE_RADIUS} * (${REDUCTION_FACTOR}^${weeklyBuzzCount}) = ${radius.toFixed(2)} km`);
    
    const finalRadius = Math.max(MIN_RADIUS, radius);
    
    console.log('📏 EXACT CALCULATION RESULT:', {
      iterations: weeklyBuzzCount,
      calculatedRadius: radius,
      finalRadiusWithMinimum: finalRadius,
      reductionApplied: weeklyBuzzCount > 0 ? `${((1 - Math.pow(REDUCTION_FACTOR, weeklyBuzzCount)) * 100).toFixed(1)}%` : '0%',
      expectedValue: weeklyBuzzCount === 0 ? '100.0 km' : `${(100 * Math.pow(0.95, weeklyBuzzCount)).toFixed(2)} km`,
      exactFormula: `100.0 * (0.95^${weeklyBuzzCount})`
    });
    
    // CRITICAL: Round to exactly 2 decimal places for consistency
    return Math.round(finalRadius * 100) / 100;
  }, []);

  // Enhanced progressive radius calculation with area-based approach
  const calculateNextRadiusFromArea = useCallback((activeArea: BuzzMapArea | null): number => {
    const BASE_RADIUS = 100.0;
    const MIN_RADIUS = 0.5;
    const REDUCTION_FACTOR = 0.95;

    if (!activeArea) {
      console.log('📏 No active area, using exact base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }

    // Use radius_km property from the corrected interface
    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 AREA-BASED RADIUS CALCULATION:', {
      previousRadius: activeArea.radius_km,
      calculatedNextRadius: nextRadius,
      finalRadiusWithMinimum: finalRadius,
      reductionPercentage: '5%',
      exactCalculation: `${activeArea.radius_km} * 0.95 = ${nextRadius.toFixed(2)}`
    });
    
    // CRITICAL: Round to exactly 2 decimal places for consistency
    return Math.round(finalRadius * 100) / 100;
  }, []);

  // Debug function helper
  const createDebugReport = useCallback((
    user: any,
    currentWeekAreas: BuzzMapArea[],
    userCluesCount: number,
    isGenerating: boolean,
    forceUpdateCounter: number,
    dailyBuzzCounter: number,
    dailyBuzzMapCounter: number,
    getActiveArea: () => BuzzMapArea | null,
    calculateNextRadius: () => number,
    calculateBuzzMapPrice: () => number
  ) => {
    return {
      user: user?.id,
      currentWeekAreas,
      areasCount: currentWeekAreas.length,
      userCluesCount,
      isGenerating,
      activeArea: getActiveArea(),
      nextRadius: calculateNextRadius(),
      progressiveRadiusFromCount: calculateProgressiveRadiusFromCount(currentWeekAreas.length),
      price: calculateBuzzMapPrice(),
      forceUpdateCounter: forceUpdateCounter,
      dailyBuzzCounter: dailyBuzzCounter,
      dailyBuzzMapCounter: dailyBuzzMapCounter,
      stateTimestamp: new Date().toISOString(),
      radiusConsistencyCheck: {
        activeAreaRadius: getActiveArea()?.radius_km,
        calculatedNextRadius: calculateNextRadius(),
        weeklyCount: currentWeekAreas.length,
        shouldBeConsistent: true,
        exactExpectedRadius: calculateProgressiveRadiusFromCount(currentWeekAreas.length),
        exactFormula: `100.0 * (0.95^${currentWeekAreas.length})`
      }
    };
  }, [calculateProgressiveRadiusFromCount]);

  return {
    getCurrentWeek,
    getActiveAreaFromList,
    calculateNextRadiusFromArea,
    calculateProgressiveRadiusFromCount,
    createDebugReport
  };
};
