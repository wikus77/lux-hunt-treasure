
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

  // CRITICAL FIX: Progressive radius calculation with EXACT 5% reduction and proper base handling - PERFECT PRECISION
  const calculateProgressiveRadiusFromCount = useCallback((weeklyBuzzCount: number): number => {
    const BASE_RADIUS = 100.0; // Exactly 100.0 km initial
    const MIN_RADIUS = 0.5; // Exactly 0.5 km minimum
    const REDUCTION_FACTOR = 0.95; // Exactly -5% each time
    
    console.log('📏 PROGRESSIVE RADIUS CALCULATION - EXACT PERFECT PRECISION:', {
      weeklyBuzzCount,
      BASE_RADIUS,
      MIN_RADIUS,
      REDUCTION_FACTOR
    });
    
    // CRITICAL: For first BUZZ (count 0), return base radius exactly
    if (weeklyBuzzCount === 0) {
      console.log('📏 FIRST BUZZ - Using exact base radius PERFECT:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }
    
    // CRITICAL: Apply EXACT reduction for each BUZZ used this week - PERFECT PRECISION
    let radius = BASE_RADIUS;
    for (let i = 0; i < weeklyBuzzCount; i++) {
      radius = radius * REDUCTION_FACTOR;
      console.log(`📏 Iteration ${i + 1}: ${radius.toFixed(3)} km PERFECT`);
    }
    
    const finalRadius = Math.max(MIN_RADIUS, radius);
    
    console.log('📏 CALCULATION RESULT - EXACT PERFECT PRECISION:', {
      iterations: weeklyBuzzCount,
      calculatedRadius: radius,
      finalRadiusWithMinimum: finalRadius,
      reductionApplied: weeklyBuzzCount > 0 ? `${((1 - Math.pow(REDUCTION_FACTOR, weeklyBuzzCount)) * 100).toFixed(1)}%` : '0%',
      shouldBe: weeklyBuzzCount === 0 ? '100.0 km' : `${(100 * Math.pow(0.95, weeklyBuzzCount)).toFixed(1)} km`,
      perfectPrecision: true
    });
    
    // CRITICAL: Round to exactly 1 decimal place for consistency PERFECT PRECISION
    return Math.round(finalRadius * 10) / 10;
  }, []);

  // Enhanced progressive radius calculation with area-based approach PERFECT PRECISION
  const calculateNextRadiusFromArea = useCallback((activeArea: BuzzMapArea | null): number => {
    const BASE_RADIUS = 100.0; // Exactly 100.0 km initial
    const MIN_RADIUS = 0.5; // Exactly 0.5 km minimum
    const REDUCTION_FACTOR = 0.95; // Exactly -5% each time

    if (!activeArea) {
      console.log('📏 No active area, using exact base radius PERFECT:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }

    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 AREA-BASED RADIUS CALCULATION - EXACT PERFECT PRECISION:', {
      previousRadius: activeArea.radius_km,
      calculatedNextRadius: nextRadius,
      finalRadiusWithMinimum: finalRadius,
      reductionPercentage: '5%',
      exactCalculation: `${activeArea.radius_km} * 0.95 = ${nextRadius.toFixed(3)}`,
      perfectPrecision: true
    });
    
    // CRITICAL: Round to exactly 1 decimal place for consistency PERFECT PRECISION
    return Math.round(finalRadius * 10) / 10;
  }, []);

  // Debug function helper PERFECT
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
        perfectPrecision: true
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
