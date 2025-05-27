
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

  // Calculate next radius with -5% reduction
  const calculateNextRadiusFromArea = useCallback((activeArea: BuzzMapArea | null): number => {
    const BASE_RADIUS = 100; // 100 km initial
    const MIN_RADIUS = 5; // 5 km minimum
    const REDUCTION_FACTOR = 0.95; // -5% each time

    if (!activeArea) {
      console.log('📏 No active area, using base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }

    const nextRadius = activeArea.radius_km * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 Previous radius:', activeArea.radius_km, 'km');
    console.log('📏 Calculated next radius:', nextRadius, 'km');
    console.log('📏 Final radius (with minimum):', finalRadius, 'km');
    
    return finalRadius;
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
      price: calculateBuzzMapPrice(),
      forceUpdateCounter: forceUpdateCounter,
      dailyBuzzCounter: dailyBuzzCounter,
      dailyBuzzMapCounter: dailyBuzzMapCounter,
      stateTimestamp: new Date().toISOString()
    };
  }, []);

  return {
    getCurrentWeek,
    getActiveAreaFromList,
    calculateNextRadiusFromArea,
    createDebugReport
  };
};
