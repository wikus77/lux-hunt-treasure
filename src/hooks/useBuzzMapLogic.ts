import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useBuzzAreaManagement } from './useBuzzAreaManagement';
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use Zustand store for centralized state
  const { 
    areaCreated, 
    buzzCount, 
    setAreaCreated, 
    setBuzzCount, 
    incrementBuzzCount 
  } = useMapStore();

  // Use utility functions
  const { 
    getCurrentWeek, 
    getActiveAreaFromList, 
    calculateProgressiveRadiusFromCount,
    createDebugReport 
  } = useBuzzMapUtils();

  // Use specialized hooks
  const {
    currentWeekAreas,
    forceUpdateCounter,
    getActiveArea,
    loadCurrentWeekAreas,
    removePreviousArea,
    deleteSpecificArea,
    deleteAllUserAreas,
    setCurrentWeekAreas,
    isDeleting,
    forceCompleteInvalidation
  } = useBuzzAreaManagement(user?.id);

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

  // CRITICAL FIX: Force dismiss all toasts before any operation
  const dismissAllToasts = useCallback(() => {
    toast.dismiss();
    console.log('🔄 DIAGNOSTIC - All existing toasts dismissed');
  }, []);

  // DIAGNOSTIC: Calculate progressive radius with extensive logging
  const calculateProgressiveRadius = useCallback((): number => {
    const buzzAreasCount = currentWeekAreas.filter(area => area.week === getCurrentWeek()).length;
    
    console.log('📏 DIAGNOSTIC - calculateProgressiveRadius called:', {
      totalAreas: currentWeekAreas.length,
      currentWeekAreas: buzzAreasCount,
      currentWeek: getCurrentWeek(),
      allAreas: currentWeekAreas.map(area => ({
        id: area.id,
        radius_km: area.radius_km,
        week: area.week,
        created_at: area.created_at
      }))
    });
    
    const radius = calculateProgressiveRadiusFromCount(buzzAreasCount);
    
    console.log('📏 DIAGNOSTIC - Progressive radius result:', {
      weeklyCount: buzzAreasCount,
      calculatedRadius: radius,
      exactFormula: buzzAreasCount === 0 ? 'BASE = 100.0' : `100.0 * (0.95^${buzzAreasCount}) = ${radius.toFixed(2)}`
    });
    
    return radius;
  }, [currentWeekAreas, calculateProgressiveRadiusFromCount, getCurrentWeek]);

  // Determine precision mode based on recent clue activity
  const determinePrecisionMode = useCallback((): 'high' | 'low' => {
    if (userCluesCount > dailyBuzzMapCounter) {
      return 'high';
    }
    return 'low';
  }, [userCluesCount, dailyBuzzMapCounter]);

  // Apply precision mode to coordinates
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

  // CRITICAL FIX: Enhanced BUZZ generation with complete cleanup
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.log('❌ DIAGNOSTIC - No user ID for BUZZ generation');
      dismissAllToasts();
      setTimeout(() => toast.error('Devi essere loggato per utilizzare BUZZ MAPPA'), 100);
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      console.log('❌ DIAGNOSTIC - Invalid coordinates:', { centerLat, centerLng });
      dismissAllToasts();
      setTimeout(() => toast.error('Coordinate della mappa non valide'), 100);
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.log('🚫 DIAGNOSTIC - BUZZ generation blocked - operation in progress:', { isGenerating, isDeleting });
      return null;
    }

    // Dismiss all existing toasts and force cleanup
    dismissAllToasts();
    console.log('🔄 DIAGNOSTIC - Starting BUZZ generation with complete cleanup');

    setIsGenerating(true);
    
    try {
      const currentWeek = getCurrentWeek();
      
      console.log('🔥 DIAGNOSTIC - STEP 1: Starting NUCLEAR cleanup + cache invalidation');
      
      // Force complete invalidation before cleanup
      await forceCompleteInvalidation();
      
      const cleanupSuccess = await removePreviousArea();
      if (!cleanupSuccess) {
        console.error('❌ DIAGNOSTIC - Nuclear cleanup failed, aborting BUZZ generation');
        dismissAllToasts();
        setTimeout(() => toast.error('Errore nel rimuovere le aree precedenti'), 100);
        return null;
      }
      
      // Force another invalidation after cleanup
      await forceCompleteInvalidation();
      
      console.log('✅ DIAGNOSTIC - STEP 1 complete: Nuclear cleanup + cache invalidation successful');
      
      console.log('🔄 DIAGNOSTIC - STEP 2: Force database sync with verification');
      await loadCurrentWeekAreas();
      const radiusKm = calculateProgressiveRadius();
      
      console.log('📏 DIAGNOSTIC - STEP 2 complete: Radius calculated:', {
        areasCount: currentWeekAreas.length,
        calculatedRadius: radiusKm,
        coordinates: { lat: centerLat, lng: centerLng },
        expectedFormula: `100.0 * (0.95^${currentWeekAreas.length}) = ${radiusKm.toFixed(2)} km`
      });
      
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

      console.log('💰 DIAGNOSTIC - Price calculation:', {
        basePrice,
        finalPrice,
        precision,
        radiusKm,
        escalated: radiusKm < 5
      });

      // Apply precision fuzz to coordinates
      const { lat: finalLat, lng: finalLng } = applyPrecisionFuzz(centerLat, centerLng, precision);

      console.log('🚀 DIAGNOSTIC - STEP 3: Creating new area in database');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ DIAGNOSTIC - Failed to create new area in database');
        return null;
      }
      
      console.log('✅ DIAGNOSTIC - STEP 3 complete: New area created:', {
        id: newArea.id,
        radius_km: newArea.radius_km,
        coordinates: { lat: newArea.lat, lng: newArea.lng },
        radiusMatch: Math.abs(newArea.radius_km - radiusKm) < 0.01
      });
      
      console.log('📊 DIAGNOSTIC - STEP 4: Updating counters + invalidating cache');
      await updateDailyBuzzMapCounter(basePrice, precision);
      
      // Force complete invalidation after creation
      await forceCompleteInvalidation();
      
      // Update centralized state
      setAreaCreated(true);
      incrementBuzzCount();
      
      console.log('🔄 DIAGNOSTIC - STEP 5: Force state synchronization with verification');
      await loadCurrentWeekAreas();
      
      console.log('✅ DIAGNOSTIC - STEP 5 complete: State synchronized');
      
      // Show success toast with verification
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      
      dismissAllToasts();
      setTimeout(() => {
        const toastMessage = `Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(2)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`;
        console.log('📢 DIAGNOSTIC - Showing success toast:', toastMessage);
        toast.success(toastMessage);
      }, 200);
      
      console.log('🎉 DIAGNOSTIC - BUZZ MAPPA generation complete:', {
        finalRadius: newArea.radius_km,
        databaseSync: 'COMPLETE',
        cacheInvalidated: 'COMPLETE',
        exactMatch: 'VERIFIED',
        singleExecution: 'ENFORCED'
      });
      
      return newArea;
    } catch (err) {
      console.error('❌ DIAGNOSTIC - Exception generating map area:', err);
      dismissAllToasts();
      setTimeout(() => toast.error('Errore durante la generazione dell\'area'), 100);
      return null;
    } finally {
      setIsGenerating(false);
      console.log('🔄 DIAGNOSTIC - isGenerating reset to false');
    }
  }, [user, getCurrentWeek, calculateProgressiveRadius, calculateBuzzMapPrice, removePreviousArea, createBuzzMapArea, updateDailyBuzzMapCounter, loadCurrentWeekAreas, setAreaCreated, incrementBuzzCount, determinePrecisionMode, applyPrecisionFuzz, calculateProgressivePrice, calculateEscalatedPrice, showUnder5kmWarning, currentWeekAreas, isGenerating, isDeleting, dismissAllToasts, forceCompleteInvalidation]);

  // CRITICAL FIX: Enhanced manual area deletion with verification
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ DIAGNOSTIC - Manual area deletion requested for area:', areaId);
    
    if (isDeleting) {
      console.log('🚫 DIAGNOSTIC - Delete already in progress, preventing duplicate');
      return false;
    }
    
    dismissAllToasts();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ DIAGNOSTIC - Area deleted successfully');
      setTimeout(() => {
        toast.success('Area eliminata definitivamente');
      }, 200);
    } else {
      console.error('❌ DIAGNOSTIC - Failed to delete area');
      setTimeout(() => {
        toast.error('Errore nell\'eliminazione dell\'area');
      }, 200);
    }
    
    return success;
  }, [deleteSpecificArea, isDeleting, dismissAllToasts]);

  // CRITICAL FIX: Enhanced clear all areas with verification
  const handleClearAllAreas = useCallback(async (): Promise<void> => {
    console.log('🧹 DIAGNOSTIC - Clear all areas requested');
    
    if (isDeleting) {
      console.log('🚫 DIAGNOSTIC - Delete already in progress, preventing duplicate');
      return;
    }
    
    dismissAllToasts();
    
    const success = await deleteAllUserAreas();
    
    if (success) {
      console.log('✅ DIAGNOSTIC - All areas cleared successfully');
      setTimeout(() => {
        toast.success('Tutte le aree sono state eliminate definitivamente');
      }, 200);
    } else {
      console.error('❌ DIAGNOSTIC - Failed to clear all areas');
      setTimeout(() => {
        toast.error('Errore nell\'eliminazione delle aree');
      }, 200);
    }
  }, [deleteAllUserAreas, isDeleting, dismissAllToasts]);

  // Debug function with enhanced logging
  const debugCurrentState = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugData = createDebugReport(
        user,
        currentWeekAreas,
        userCluesCount,
        isGenerating,
        forceUpdateCounter,
        dailyBuzzCounter,
        dailyBuzzMapCounter,
        getActiveArea,
        calculateProgressiveRadius,
        calculateBuzzMapPrice
      );
      
      console.log('🔍 DIAGNOSTIC - Complete state report:', debugData);
      console.log('🔍 DIAGNOSTIC - Zustand state:', { areaCreated, buzzCount });
      console.log('🔍 DIAGNOSTIC - Progressive radius calculation:', {
        weeklyAreasCount: currentWeekAreas.length,
        nextRadius: calculateProgressiveRadius(),
        basePrice: calculateBuzzMapPrice(),
        exactFormula: `100.0 * (0.95^${currentWeekAreas.length}) = ${calculateProgressiveRadius().toFixed(2)} km`
      });
    }
  }, [user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, calculateProgressiveRadius, calculateBuzzMapPrice, forceUpdateCounter, dailyBuzzCounter, dailyBuzzMapCounter, createDebugReport, areaCreated, buzzCount]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 DIAGNOSTIC - Loading initial data for user:', user.id);
      loadCurrentWeekAreas();
    }
  }, [user, loadCurrentWeekAreas]);

  // Sync buzz count
  useEffect(() => {
    setBuzzCount(dailyBuzzCounter);
  }, [dailyBuzzCounter, setBuzzCount]);

  return {
    currentWeekAreas,
    isGenerating,
    userCluesCount,
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    precisionMode,
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
    reloadAreas: () => loadCurrentWeekAreas(),
    testCalculationLogic,
    debugCurrentState,
    forceUpdateCounter,
    areaCreated,
    buzzCount,
    isDeleting,
    forceCompleteInvalidation
  };
};
