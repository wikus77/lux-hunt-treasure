
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

  // CRITICAL FIX: Progressive radius calculation with exact 5% reduction
  const calculateProgressiveRadiusFromCount = useCallback((weeklyBuzzCount: number): number => {
    const BASE_RADIUS = 100; // 100 km initial
    const MIN_RADIUS = 0.5; // 0.5 km minimum
    const REDUCTION_FACTOR = 0.95; // -5% each time
    
    console.log('📏 PROGRESSIVE RADIUS CALCULATION:', {
      weeklyBuzzCount,
      BASE_RADIUS,
      MIN_RADIUS,
      REDUCTION_FACTOR
    });
    
    if (weeklyBuzzCount === 0) {
      console.log('📏 First BUZZ of the week, using base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }
    
    // Apply reduction for each BUZZ used this week
    let radius = BASE_RADIUS;
    for (let i = 0; i < weeklyBuzzCount; i++) {
      radius = radius * REDUCTION_FACTOR;
    }
    
    const finalRadius = Math.max(MIN_RADIUS, radius);
    
    console.log('📏 CALCULATION RESULT:', {
      iterations: weeklyBuzzCount,
      calculatedRadius: radius,
      finalRadiusWithMinimum: finalRadius,
      reductionApplied: weeklyBuzzCount > 0 ? `${((1 - Math.pow(REDUCTION_FACTOR, weeklyBuzzCount)) * 100).toFixed(1)}%` : '0%'
    });
    
    // Round to 1 decimal place for consistency
    return Math.round(finalRadius * 10) / 10;
  }, []);

  // Enhanced progressive radius calculation with area-based approach
  const calculateNextRadiusFromArea = useCallback((activeArea: BuzzMapArea | null): number => {
    const BASE_RADIUS = 100; // 100 km initial
    const MIN_RADIUS = 0.5; // 0.5 km minimum
    const REDUCTION_FACTOR = 0.95; // -5% each time

    if (!activeArea) {
      console.log('📏 No active area, using base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }

    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 AREA-BASED RADIUS CALCULATION:', {
      previousRadius: activeArea.radius_km,
      calculatedNextRadius: nextRadius,
      finalRadiusWithMinimum: finalRadius,
      reductionPercentage: '5%'
    });
    
    // Round to 1 decimal place for consistency
    return Math.round(finalRadius * 10) / 10;
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
        shouldBeConsistent: true
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
