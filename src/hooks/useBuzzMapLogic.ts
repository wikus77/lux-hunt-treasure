
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
    forceCompleteSync,
    validateBuzzDeletion
  } = useMapAreas(user?.id);

  console.debug('🧠 BUZZ LOGIC STATE:', {
    userId: user?.id,
    areasCount: currentWeekAreas.length,
    isGenerating,
    isDeleting,
    localBuzzCount,
    reactQueryLoading: isLoading,
    data_source: 'react-query-only'
  });

  // DIAGNOSTIC: Log when areas data changes from React Query
  console.debug('🔍 AREAS FROM REACT QUERY:', {
    source: 'react-query',
    areas_length: currentWeekAreas.length,
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
    console.debug('🎯 GET ACTIVE AREA from React Query:', active);
    return active;
  }, [currentWeekAreas, getActiveAreaFromList]);

  // CORRECTED: Dynamic radius calculation based on user clues and BUZZ count
  const calculateDynamicRadius = useCallback((): number => {
    const currentWeek = getCurrentWeek();
    const buzzAreasCount = currentWeekAreas.filter(area => area.week === currentWeek).length;
    
    console.debug('📏 DYNAMIC RADIUS CALCULATION:', {
      userCluesCount,
      buzzAreasCount,
      currentWeek
    });

    // CORRECTED SCHEMA: Based on user clues count with progressive reduction
    let baseRadius: number;
    
    if (userCluesCount >= 1 && userCluesCount <= 10) {
      baseRadius = 100.0; // 100km for 1-10 clues
    } else if (userCluesCount >= 11 && userCluesCount <= 20) {
      baseRadius = 90.0; // 90km for 11-20 clues  
    } else if (userCluesCount >= 21 && userCluesCount <= 30) {
      baseRadius = 80.0; // 80km for 21-30 clues
    } else if (userCluesCount >= 31) {
      baseRadius = 70.0; // 70km for 31+ clues
    } else {
      baseRadius = 100.0; // Default for 0 clues
    }

    // Apply progressive reduction: -5% for each previous BUZZ area
    const reductionFactor = Math.pow(0.95, buzzAreasCount);
    const finalRadius = Math.max(5.0, baseRadius * reductionFactor); // Minimum 5km
    
    console.debug('📏 DYNAMIC RADIUS RESULT:', {
      baseRadius,
      reductionFactor,
      finalRadius: finalRadius.toFixed(2),
      minimumEnforced: finalRadius === 5.0
    });
    
    return Math.round(finalRadius * 100) / 100; // Round to 2 decimals
  }, [userCluesCount, currentWeekAreas, getCurrentWeek]);

  // CORRECTED: Dynamic pricing based on user clues
  const calculateDynamicPrice = useCallback((): number => {
    console.debug('💰 DYNAMIC PRICE CALCULATION:', { userCluesCount });

    if (userCluesCount >= 1 && userCluesCount <= 10) {
      return 7.99;
    } else if (userCluesCount >= 11 && userCluesCount <= 20) {
      return 9.99;
    } else if (userCluesCount >= 21 && userCluesCount <= 30) {
      return 13.99;
    } else if (userCluesCount >= 31) {
      return 15.99;
    } else {
      return 7.99; // Default for 0 clues
    }
  }, [userCluesCount]);

  // Determine precision mode
  const determinePrecisionMode = useCallback((): 'high' | 'low' => {
    const mode = userCluesCount > dailyBuzzMapCounter ? 'high' : 'low';
    console.debug('🔍 PRECISION MODE:', mode, { userCluesCount, dailyBuzzMapCounter });
    return mode;
  }, [userCluesCount, dailyBuzzMapCounter]);

  // Apply precision fuzz
  const applyPrecisionFuzz = useCallback((lat: number, lng: number, precision: 'high' | 'low') => {
    if (precision === 'high') {
      console.debug('🎯 HIGH PRECISION - No fuzz applied');
      return { lat, lng };
    }
    
    const fuzzFactor = 0.01;
    const fuzzLat = (Math.random() - 0.5) * fuzzFactor;
    const fuzzLng = (Math.random() - 0.5) * fuzzFactor;
    
    const result = {
      lat: lat + fuzzLat,
      lng: lng + fuzzLng
    };
    
    console.debug('🌀 LOW PRECISION - Fuzz applied:', { original: { lat, lng }, fuzzed: result });
    return result;
  }, []);

  // ENHANCED BUZZ generation with CORRECTED logic and single toast management
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.debug('🚫 BUZZ GENERATION - No user ID');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      console.debug('🚫 BUZZ GENERATION - Invalid coordinates');
      toast.dismiss();
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.debug('🚫 BUZZ GENERATION - Blocked - operation in progress', { isGenerating, isDeleting });
      return null;
    }

    // Check if area already exists
    const existingArea = getActiveArea();
    if (existingArea) {
      console.debug('🔄 BUZZ GENERATION - Area already exists');
      toast.dismiss();
      toast.success('Area BUZZ MAPPA già attiva');
      return existingArea;
    }

    setIsGenerating(true);
    toast.dismiss(); // Clear any existing toasts
    
    try {
      const currentWeek = getCurrentWeek();
      
      console.debug('🔥 BUZZ GENERATION START:', {
        centerLat,
        centerLng,
        currentWeek,
        existingAreas: currentWeekAreas.length
      });
      
      // STEP 1: Complete cleanup with FORCED sync sequence
      console.debug('🧹 STEP 1 - Complete cleanup with FORCED sync...');
      await forceCompleteSync();
      
      // STEP 2: Clear all existing areas SILENTLY
      console.debug('🗑️ STEP 2 - Clear all existing areas SILENTLY...');
      if (currentWeekAreas.length > 0) {
        const cleanupSuccess = await deleteAllUserAreas();
        if (!cleanupSuccess) {
          console.error('❌ BUZZ GENERATION - Cleanup failed');
          toast.dismiss();
          toast.error('Errore nel rimuovere le aree precedenti');
          return null;
        }
      }
      
      console.debug('✅ STEP 2 - Cleanup completed');
      
      // STEP 3: Calculate CORRECTED radius and pricing
      console.debug('💰 STEP 3 - Calculate CORRECTED radius and pricing...');
      const radiusKm = calculateDynamicRadius();
      const finalPrice = calculateDynamicPrice();
      const precision = determinePrecisionMode();
      
      console.debug('💰 STEP 3 - CORRECTED calculation complete:', {
        radiusKm,
        finalPrice,
        precision,
        userCluesCount
      });

      // STEP 4: Apply precision fuzz to coordinates
      console.debug('🎯 STEP 4 - Apply precision fuzz...');
      const { lat: finalLat, lng: finalLng } = applyPrecisionFuzz(centerLat, centerLng, precision);

      // STEP 5: Create new area
      console.debug('🚀 STEP 5 - Creating new area...');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ BUZZ GENERATION - Failed to create area');
        toast.dismiss();
        toast.error('Errore durante la creazione dell\'area');
        return null;
      }
      
      console.debug('✅ STEP 5 - New area created:', newArea);
      
      // STEP 6: Update counters
      console.debug('🔢 STEP 6 - Update counters...');
      await updateDailyBuzzMapCounter(finalPrice, precision);
      
      // STEP 7: Force complete sync after creation
      console.debug('🔄 STEP 7 - Force complete sync after creation...');
      await forceCompleteSync();
      await forceReload();
      
      // STEP 8: Update local UI state
      console.debug('🎨 STEP 8 - Update local UI state...');
      setLocalBuzzCount(prev => prev + 1);
      
      // STEP 9: Show SINGLE success toast
      toast.dismiss(); // Ensure no other toasts
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${radiusKm.toFixed(2)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      
      console.debug('🎉 BUZZ GENERATION - Completed successfully');
      
      return newArea;
    } catch (err) {
      console.error('❌ BUZZ GENERATION - Error:', err);
      toast.dismiss();
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, getCurrentWeek, calculateDynamicRadius, calculateDynamicPrice, 
    deleteAllUserAreas, createBuzzMapArea, updateDailyBuzzMapCounter, 
    determinePrecisionMode, applyPrecisionFuzz, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload, currentWeekAreas, getActiveArea
  ]);

  // UNIFIED DELETE AREA - Same logic as trash icon
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.debug('🗑️ HANDLE DELETE AREA START (UNIFIED LOGIC):', areaId);
    
    toast.dismiss(); // Clear existing toasts
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.debug('✅ HANDLE DELETE AREA - Success with UNIFIED LOGIC, performing database validation...');
      
      // CRITICAL: Validate deletion at database level
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ DATABASE VALIDATION WARNING after specific delete');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce nel database');
      } else {
        toast.success('Area eliminata definitivamente');
      }
      
      // Force complete sync after deletion
      await forceCompleteSync();
    } else {
      console.error('❌ HANDLE DELETE AREA - Failed');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, forceCompleteSync, validateBuzzDeletion]);

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
        calculateDynamicRadius,
        calculateDynamicPrice
      );
      
      console.debug('🔍 DEBUG STATE - Complete report:', debugData);
      console.debug('🔍 DEBUG STATE - Local state:', { 
        localBuzzCount,
        currentWeekAreas: currentWeekAreas.length,
        data_source: 'react-query-only'
      });
    }
  }, [
    user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, 
    calculateDynamicRadius, calculateDynamicPrice, dailyBuzzCounter, 
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
    calculateNextRadius: calculateDynamicRadius,
    calculateBuzzMapPrice: calculateDynamicPrice,
    
    generateBuzzMapArea,
    handleDeleteArea, // Uses UNIFIED logic
    getActiveArea,
    reloadAreas: forceReload,
    testCalculationLogic,
    debugCurrentState,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
