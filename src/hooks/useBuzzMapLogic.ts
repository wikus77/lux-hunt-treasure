
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useMapAreas } from './useMapAreas';
import { useBuzzPricing } from './useBuzzPricing';
import { useBuzzCounter } from './useBuzzCounter';
import { useBuzzDatabase } from './useBuzzDatabase';
import { useBuzzMapCounter } from './useBuzzMapCounter';
import { useBuzzMapUtils } from './buzz/useBuzzMapUtils';
import { useMapStore } from '@/stores/mapStore';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  week: number;
  created_at: string;
  user_id?: string;
}

export const useBuzzMapLogic = () => {
  const { user } = useAuth();
  
  // LOCAL state only for UI feedback (NO React Query duplicates)
  const [localBuzzCount, setLocalBuzzCount] = useState(0);
  
  // Use Zustand store ONLY for operation locks - NO AREA DATA
  const { 
    isGenerating,
    isDeleting,
    setIsGenerating
  } = useMapStore();

  // SINGLE SOURCE OF TRUTH: React Query via useMapAreas
  const {
    currentWeekAreas,
    isLoading,
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteSync
  } = useMapAreas(user?.id);

  console.debug('🧠 DIAGNOSTIC: BUZZ LOGIC STATE:', {
    userId: user?.id,
    areasCount: currentWeekAreas.length,
    areasDetail: currentWeekAreas.map(a => ({ id: a.id, radius_km: a.radius_km })),
    isGenerating,
    isDeleting,
    localBuzzCount,
    reactQueryLoading: isLoading,
    data_source: 'react-query-only'
  });

  // DIAGNOSTIC: Log when areas data changes from React Query
  console.debug('🔍 DIAGNOSTIC: AREAS FROM REACT QUERY:', {
    source: 'react-query',
    areas_length: currentWeekAreas.length,
    areas_content: currentWeekAreas,
    areas_isArray: Array.isArray(currentWeekAreas),
    first_area: currentWeekAreas[0] || 'No areas',
    is_empty_after_delete: currentWeekAreas.length === 0
  });

  // Use utility functions
  const { 
    getCurrentWeek, 
    getActiveAreaFromList, 
    calculateProgressiveRadiusFromCount,
    createDebugReport 
  } = useBuzzMapUtils();

  // Use specialized hooks
  const {
    userCluesCount,
    calculateBuzzMapPrice,
    testCalculationLogic
  } = useBuzzPricing(user?.id);

  const {
    dailyBuzzCounter,
    loadDailyBuzzCounter,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);

  const {
    dailyBuzzMapCounter,
    updateDailyBuzzMapCounter,
    calculateProgressivePrice,
    calculateEscalatedPrice,
    showUnder5kmWarning,
    precisionMode
  } = useBuzzMapCounter(user?.id);

  const { createBuzzMapArea } = useBuzzDatabase();

  // Get active area from current week areas (React Query only)
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    const active = getActiveAreaFromList(currentWeekAreas);
    console.debug('🎯 DIAGNOSTIC: GET ACTIVE AREA from React Query:', active);
    return active;
  }, [currentWeekAreas, getActiveAreaFromList]);

  // Calculate progressive radius with extensive logging
  const calculateProgressiveRadius = useCallback((): number => {
    const buzzAreasCount = currentWeekAreas.filter(area => area.week === getCurrentWeek()).length;
    
    console.debug('📏 DIAGNOSTIC: PROGRESSIVE RADIUS - Calculating for areas:', {
      totalAreas: currentWeekAreas.length,
      currentWeekAreas: buzzAreasCount,
      currentWeek: getCurrentWeek(),
      data_source: 'react-query'
    });
    
    const radius = calculateProgressiveRadiusFromCount(buzzAreasCount);
    
    console.debug('📏 DIAGNOSTIC: PROGRESSIVE RADIUS - Result:', {
      weeklyCount: buzzAreasCount,
      calculatedRadius: radius,
      formula: `100.0 * (0.95^${buzzAreasCount}) = ${radius.toFixed(2)}`
    });
    
    return radius;
  }, [currentWeekAreas, calculateProgressiveRadiusFromCount, getCurrentWeek]);

  // Determine precision mode
  const determinePrecisionMode = useCallback((): 'high' | 'low' => {
    const mode = userCluesCount > dailyBuzzMapCounter ? 'high' : 'low';
    console.debug('🔍 DIAGNOSTIC: PRECISION MODE:', mode, { userCluesCount, dailyBuzzMapCounter });
    return mode;
  }, [userCluesCount, dailyBuzzMapCounter]);

  // Apply precision fuzz
  const applyPrecisionFuzz = useCallback((lat: number, lng: number, precision: 'high' | 'low') => {
    if (precision === 'high') {
      console.debug('🎯 DIAGNOSTIC: HIGH PRECISION - No fuzz applied');
      return { lat, lng };
    }
    
    const fuzzFactor = 0.01;
    const fuzzLat = (Math.random() - 0.5) * fuzzFactor;
    const fuzzLng = (Math.random() - 0.5) * fuzzFactor;
    
    const result = {
      lat: lat + fuzzLat,
      lng: lng + fuzzLng
    };
    
    console.debug('🌀 DIAGNOSTIC: LOW PRECISION - Fuzz applied:', { original: { lat, lng }, fuzzed: result });
    return result;
  }, []);

  // ENHANCED BUZZ generation with STRICT validation and BLOCKING
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.debug('🚫 DIAGNOSTIC: BUZZ GENERATION - No user ID');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      console.debug('🚫 DIAGNOSTIC: BUZZ GENERATION - Invalid coordinates');
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.debug('🚫 DIAGNOSTIC: BUZZ GENERATION - Blocked - operation in progress', { isGenerating, isDeleting });
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      const currentWeek = getCurrentWeek();
      
      console.debug('🔥 DIAGNOSTIC: BUZZ GENERATION START:', {
        centerLat,
        centerLng,
        currentWeek,
        existingAreas: currentWeekAreas.length
      });
      
      // STEP 1: Complete cleanup with FORCED sync sequence
      console.debug('🧹 DIAGNOSTIC: STEP 1 - Complete cleanup with FORCED sync...');
      await forceCompleteSync();
      
      // STEP 2: Clear all existing areas with STRICT VALIDATION
      console.debug('🗑️ DIAGNOSTIC: STEP 2 - Clear all existing areas with STRICT validation...');
      const cleanupSuccess = await deleteAllUserAreas();
      if (!cleanupSuccess) {
        console.error('❌ DIAGNOSTIC: BUZZ GENERATION - Cleanup failed');
        toast.error('Errore nel rimuovere le aree precedenti');
        return null;
      }
      
      console.debug('✅ DIAGNOSTIC: STEP 2 - Cleanup completed with STRICT validation');
      
      // STEP 3: Calculate radius and pricing
      console.debug('💰 DIAGNOSTIC: STEP 3 - Calculate radius and pricing...');
      const radiusKm = calculateProgressiveRadius();
      const basePrice = calculateBuzzMapPrice();
      const precision = determinePrecisionMode();
      
      // Calculate final price
      let finalPrice: number;
      if (radiusKm < 5) {
        finalPrice = calculateEscalatedPrice(basePrice, radiusKm);
        showUnder5kmWarning();
      } else {
        finalPrice = calculateProgressivePrice(basePrice);
      }

      console.debug('💰 DIAGNOSTIC: STEP 3 - Price calculation complete:', {
        basePrice,
        finalPrice,
        precision,
        radiusKm
      });

      // STEP 4: Apply precision fuzz to coordinates
      console.debug('🎯 DIAGNOSTIC: STEP 4 - Apply precision fuzz...');
      const { lat: finalLat, lng: finalLng } = applyPrecisionFuzz(centerLat, centerLng, precision);

      // STEP 5: Create new area
      console.debug('🚀 DIAGNOSTIC: STEP 5 - Creating new area...');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ DIAGNOSTIC: BUZZ GENERATION - Failed to create area');
        return null;
      }
      
      console.debug('✅ DIAGNOSTIC: STEP 5 - New area created:', newArea);
      
      // STEP 6: Update counters
      console.debug('🔢 DIAGNOSTIC: STEP 6 - Update counters...');
      await updateDailyBuzzMapCounter(basePrice, precision);
      
      // STEP 7: CRITICAL - Force complete sync after creation with STRICT validation
      console.debug('🔄 DIAGNOSTIC: STEP 7 - Force complete sync after creation with STRICT validation...');
      await forceCompleteSync();
      await forceReload();
      
      // STEP 8: Update local UI state
      console.debug('🎨 DIAGNOSTIC: STEP 8 - Update local UI state...');
      setLocalBuzzCount(prev => prev + 1);
      
      // STEP 9: Show success toast
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(2)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      
      console.debug('🎉 DIAGNOSTIC: BUZZ GENERATION - Completed successfully');
      
      return newArea;
    } catch (err) {
      console.error('❌ DIAGNOSTIC: BUZZ GENERATION - Error:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, getCurrentWeek, calculateProgressiveRadius, calculateBuzzMapPrice, 
    deleteAllUserAreas, createBuzzMapArea, updateDailyBuzzMapCounter, 
    determinePrecisionMode, applyPrecisionFuzz, calculateProgressivePrice, 
    calculateEscalatedPrice, showUnder5kmWarning, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload, currentWeekAreas
  ]);

  // Enhanced manual area deletion with STRICT validation
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.debug('🗑️ DIAGNOSTIC: HANDLE DELETE AREA START:', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.debug('✅ DIAGNOSTIC: HANDLE DELETE AREA - Success, forcing complete sync with STRICT validation...');
      // Force complete sync after deletion
      await forceCompleteSync();
      toast.success('Area eliminata definitivamente');
    } else {
      console.error('❌ DIAGNOSTIC: HANDLE DELETE AREA - Failed');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, forceCompleteSync]);

  // Enhanced clear all areas with STRICT validation
  const handleClearAllAreas = useCallback(async (): Promise<void> => {
    console.debug('🧹 DIAGNOSTIC: HANDLE CLEAR ALL START');
    
    toast.dismiss();
    
    const success = await deleteAllUserAreas();
    
    if (success) {
      console.debug('✅ DIAGNOSTIC: HANDLE CLEAR ALL - Success, forcing complete sync with STRICT validation...');
      // Force complete sync after deletion
      await forceCompleteSync();
      toast.success('Tutte le aree sono state eliminate definitivamente');
    } else {
      console.error('❌ DIAGNOSTIC: HANDLE CLEAR ALL - Failed');
      toast.error('Errore nell\'eliminazione delle aree');
    }
  }, [deleteAllUserAreas, forceCompleteSync]);

  // Debug function
  const debugCurrentState = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugData = createDebugReport(
        user,
        currentWeekAreas,
        userCluesCount,
        isGenerating,
        0, // No more forceUpdateCounter
        dailyBuzzCounter,
        dailyBuzzMapCounter,
        getActiveArea,
        calculateProgressiveRadius,
        calculateBuzzMapPrice
      );
      
      console.debug('🔍 DIAGNOSTIC: DEBUG STATE - Complete report:', debugData);
      console.debug('🔍 DIAGNOSTIC: DEBUG STATE - Local state:', { 
        localBuzzCount,
        currentWeekAreas: currentWeekAreas.length,
        reactQueryData: currentWeekAreas,
        data_source: 'react-query-only'
      });
    }
  }, [
    user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, 
    calculateProgressiveRadius, calculateBuzzMapPrice, dailyBuzzCounter, 
    dailyBuzzMapCounter, createDebugReport, localBuzzCount
  ]);

  return {
    // Data from React Query (SINGLE SOURCE OF TRUTH)
    currentWeekAreas,
    isLoading,
    
    // UI state
    isGenerating,
    isDeleting,
    userCluesCount,
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    precisionMode,
    buzzCount: localBuzzCount, // ONLY LOCAL UI STATE
    
    // Functions
    calculateNextRadius: calculateProgressiveRadius,
    calculateBuzzMapPrice: useCallback(() => {
      const basePrice = calculateBuzzMapPrice();
      const radius = calculateProgressiveRadius();
      if (radius < 5) {
        return calculateEscalatedPrice(basePrice, radius);
      }
      return calculateProgressivePrice(basePrice);
    }, [calculateBuzzMapPrice, calculateProgressiveRadius, calculateEscalatedPrice, calculateProgressivePrice]),
    
    generateBuzzMapArea,
    handleDeleteArea,
    handleClearAllAreas,
    getActiveArea,
    reloadAreas: forceReload,
    testCalculationLogic,
    debugCurrentState,
    forceCompleteInvalidation: forceCompleteSync
  };
};
