
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
  
  // Use Zustand store for UI state only
  const { 
    areaCreated, 
    buzzCount, 
    isGenerating,
    isDeleting,
    setAreaCreated, 
    setBuzzCount, 
    incrementBuzzCount,
    setIsGenerating
  } = useMapStore();

  // Use unified map areas hook (SINGLE SOURCE OF TRUTH)
  const {
    currentWeekAreas,
    isLoading,
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteInvalidation
  } = useMapAreas(user?.id);

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

  // Get active area from current week areas
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return getActiveAreaFromList(currentWeekAreas);
  }, [currentWeekAreas, getActiveAreaFromList]);

  // Calculate progressive radius with extensive logging
  const calculateProgressiveRadius = useCallback((): number => {
    const buzzAreasCount = currentWeekAreas.filter(area => area.week === getCurrentWeek()).length;
    
    console.log('📏 PROGRESSIVE RADIUS: Calculating for areas:', {
      totalAreas: currentWeekAreas.length,
      currentWeekAreas: buzzAreasCount,
      currentWeek: getCurrentWeek()
    });
    
    const radius = calculateProgressiveRadiusFromCount(buzzAreasCount);
    
    console.log('📏 PROGRESSIVE RADIUS: Result:', {
      weeklyCount: buzzAreasCount,
      calculatedRadius: radius,
      formula: `100.0 * (0.95^${buzzAreasCount}) = ${radius.toFixed(2)}`
    });
    
    return radius;
  }, [currentWeekAreas, calculateProgressiveRadiusFromCount, getCurrentWeek]);

  // Determine precision mode
  const determinePrecisionMode = useCallback((): 'high' | 'low' => {
    return userCluesCount > dailyBuzzMapCounter ? 'high' : 'low';
  }, [userCluesCount, dailyBuzzMapCounter]);

  // Apply precision fuzz
  const applyPrecisionFuzz = useCallback((lat: number, lng: number, precision: 'high' | 'low') => {
    if (precision === 'high') {
      return { lat, lng };
    }
    
    const fuzzFactor = 0.01;
    const fuzzLat = (Math.random() - 0.5) * fuzzFactor;
    const fuzzLng = (Math.random() - 0.5) * fuzzFactor;
    
    return {
      lat: lat + fuzzLat,
      lng: lng + fuzzLng
    };
  }, []);

  // Enhanced BUZZ generation with unified state management
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.log('🚫 BUZZ GENERATION: Blocked - operation in progress');
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      const currentWeek = getCurrentWeek();
      
      console.log('🔥 BUZZ GENERATION: Starting with cleanup');
      
      // Force complete cleanup before generation
      await forceCompleteInvalidation();
      
      // Clear all existing areas
      const cleanupSuccess = await deleteAllUserAreas();
      if (!cleanupSuccess) {
        console.error('❌ BUZZ GENERATION: Cleanup failed');
        toast.error('Errore nel rimuovere le aree precedenti');
        return null;
      }
      
      console.log('✅ BUZZ GENERATION: Cleanup completed');
      
      // Calculate radius and pricing
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

      console.log('💰 BUZZ GENERATION: Price calculation:', {
        basePrice,
        finalPrice,
        precision,
        radiusKm
      });

      // Apply precision fuzz to coordinates
      const { lat: finalLat, lng: finalLng } = applyPrecisionFuzz(centerLat, centerLng, precision);

      console.log('🚀 BUZZ GENERATION: Creating new area');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ BUZZ GENERATION: Failed to create area');
        return null;
      }
      
      console.log('✅ BUZZ GENERATION: New area created:', newArea);
      
      // Update counters
      await updateDailyBuzzMapCounter(basePrice, precision);
      
      // Force cache invalidation and reload
      await forceCompleteInvalidation();
      await forceReload();
      
      // Update UI state
      setAreaCreated(true);
      incrementBuzzCount();
      
      // Show success toast
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(2)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      
      console.log('🎉 BUZZ GENERATION: Completed successfully');
      
      return newArea;
    } catch (err) {
      console.error('❌ BUZZ GENERATION: Error:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, getCurrentWeek, calculateProgressiveRadius, calculateBuzzMapPrice, 
    deleteAllUserAreas, createBuzzMapArea, updateDailyBuzzMapCounter, 
    setAreaCreated, incrementBuzzCount, determinePrecisionMode, 
    applyPrecisionFuzz, calculateProgressivePrice, calculateEscalatedPrice, 
    showUnder5kmWarning, isGenerating, isDeleting, setIsGenerating,
    forceCompleteInvalidation, forceReload
  ]);

  // Enhanced manual area deletion
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ HANDLE DELETE AREA: Requested for:', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ HANDLE DELETE AREA: Success');
      toast.success('Area eliminata definitivamente');
    } else {
      console.error('❌ HANDLE DELETE AREA: Failed');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea]);

  // Enhanced clear all areas
  const handleClearAllAreas = useCallback(async (): Promise<void> => {
    console.log('🧹 HANDLE CLEAR ALL: Requested');
    
    toast.dismiss();
    
    const success = await deleteAllUserAreas();
    
    if (success) {
      console.log('✅ HANDLE CLEAR ALL: Success');
      toast.success('Tutte le aree sono state eliminate definitivamente');
    } else {
      console.error('❌ HANDLE CLEAR ALL: Failed');
      toast.error('Errore nell\'eliminazione delle aree');
    }
  }, [deleteAllUserAreas]);

  // Debug function
  const debugCurrentState = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugData = createDebugReport(
        user,
        currentWeekAreas,
        userCluesCount,
        isGenerating,
        0, // forceUpdateCounter no longer needed
        dailyBuzzCounter,
        dailyBuzzMapCounter,
        getActiveArea,
        calculateProgressiveRadius,
        calculateBuzzMapPrice
      );
      
      console.log('🔍 DEBUG STATE: Complete report:', debugData);
      console.log('🔍 DEBUG STATE: Zustand state:', { areaCreated, buzzCount });
    }
  }, [
    user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, 
    calculateProgressiveRadius, calculateBuzzMapPrice, dailyBuzzCounter, 
    dailyBuzzMapCounter, createDebugReport, areaCreated, buzzCount
  ]);

  return {
    // Data from unified hook (single source of truth)
    currentWeekAreas,
    isLoading,
    
    // UI state
    isGenerating,
    isDeleting,
    userCluesCount,
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    precisionMode,
    areaCreated,
    buzzCount,
    
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
    forceCompleteInvalidation
  };
};
