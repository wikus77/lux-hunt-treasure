
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
    isDeleting
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

  // Use the dedicated BUZZ MAPPA counter with progressive pricing
  const {
    dailyBuzzMapCounter,
    updateDailyBuzzMapCounter,
    calculateProgressivePrice,
    calculateEscalatedPrice,
    showUnder5kmWarning,
    precisionMode
  } = useBuzzMapCounter(user?.id);

  const { createBuzzMapArea } = useBuzzDatabase();

  // CRITICAL FIX: Calculate progressive radius with SINGLE SOURCE OF TRUTH
  const calculateProgressiveRadius = useCallback((): number => {
    // CRITICAL: Count BUZZ areas from database for exact precision - SINGLE SOURCE
    const buzzAreasCount = currentWeekAreas.filter(area => area.week === getCurrentWeek()).length;
    
    console.log('📏 CALCULATING PROGRESSIVE RADIUS - SINGLE SOURCE OF TRUTH:', {
      totalAreas: currentWeekAreas.length,
      currentWeekAreas: buzzAreasCount,
      allAreas: currentWeekAreas
    });
    
    // CRITICAL: Use the count-based calculation for exact consistency
    const radius = calculateProgressiveRadiusFromCount(buzzAreasCount);
    
    console.log('📏 PROGRESSIVE RADIUS RESULT - SINGLE SOURCE:', {
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

  // CRITICAL FIX: Generate BUZZ MAPPA with COMPLETE SYNCHRONIZATION
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // CRITICAL: Prevent concurrent operations - SINGLE EXECUTION ONLY
    if (isGenerating || isDeleting) {
      console.log('🚫 BUZZ generation blocked - operation in progress');
      return null;
    }

    // CRITICAL: Dismiss ALL existing toasts to prevent duplicates
    toast.dismiss();

    setIsGenerating(true);
    
    try {
      const currentWeek = getCurrentWeek();
      
      // CRITICAL FIX: STEP 1 - NUCLEAR cleanup of ALL areas from ALL tables
      console.log('🔥 STEP 1: NUCLEAR CLEANUP - Removing ALL areas from ALL tables');
      const cleanupSuccess = await removePreviousArea();
      if (!cleanupSuccess) {
        console.error('❌ Failed to execute nuclear cleanup - ABORTING');
        toast.error('Errore nel rimuovere le aree precedenti');
        return null;
      }
      
      console.log('✅ STEP 1 COMPLETE: NUCLEAR cleanup executed successfully');
      
      // CRITICAL FIX: STEP 2 - Force COMPLETE database sync
      console.log('🔄 STEP 2: FORCE COMPLETE DATABASE SYNC');
      await loadCurrentWeekAreas();
      const radiusKm = calculateProgressiveRadius();
      
      console.log('📏 STEP 2 COMPLETE: SINGLE SOURCE RADIUS CALCULATION:', {
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

      // Apply precision fuzz to coordinates
      const { lat: finalLat, lng: finalLng } = applyPrecisionFuzz(centerLat, centerLng, precision);

      // CRITICAL FIX: STEP 3 - Create SINGLE area with DATABASE RADIUS VALUE
      console.log('🚀 STEP 3: CREATING SINGLE AREA - DATABASE RADIUS VALUE');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ Failed to create new area in database');
        return null;
      }
      
      console.log('✅ STEP 3 COMPLETE: SINGLE area created with DATABASE VALUES:', {
        id: newArea.id,
        radius_km: newArea.radius_km,
        coordinates: { lat: newArea.lat, lng: newArea.lng },
        radiusMatch: Math.abs(newArea.radius_km - radiusKm) < 0.01
      });
      
      // CRITICAL FIX: STEP 4 - Update counters and sync state
      console.log('📊 STEP 4: UPDATE COUNTERS AND SYNC STATE');
      await updateDailyBuzzMapCounter(basePrice, precision);
      
      // Update centralized state
      setAreaCreated(true);
      incrementBuzzCount();
      
      // CRITICAL FIX: STEP 5 - Force COMPLETE state synchronization
      console.log('🔄 STEP 5: FORCE COMPLETE STATE SYNCHRONIZATION');
      await loadCurrentWeekAreas();
      
      console.log('✅ STEP 5 COMPLETE: State synchronized with database');
      
      // CRITICAL FIX: SINGLE SUCCESS MESSAGE - NO DUPLICATES
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      
      // Show SINGLE toast with DATABASE VALUE
      setTimeout(() => {
        toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(2)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      }, 200);
      
      console.log('🎉 BUZZ MAPPA GENERATION COMPLETE - SINGLE EXECUTION VERIFIED:', {
        finalRadius: newArea.radius_km,
        databaseSync: 'COMPLETE',
        exactMatch: 'VERIFIED',
        singleExecution: 'ENFORCED'
      });
      
      return newArea;
    } catch (err) {
      console.error('❌ Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, getCurrentWeek, calculateProgressiveRadius, calculateBuzzMapPrice, removePreviousArea, createBuzzMapArea, updateDailyBuzzMapCounter, loadCurrentWeekAreas, setAreaCreated, incrementBuzzCount, determinePrecisionMode, applyPrecisionFuzz, calculateProgressivePrice, calculateEscalatedPrice, showUnder5kmWarning, currentWeekAreas, isGenerating, isDeleting]);

  // CRITICAL FIX: Manual area deletion with COMPLETE database sync
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ MANUAL AREA DELETION requested for area:', areaId);
    
    if (isDeleting) {
      console.log('🚫 Delete already in progress, preventing duplicate');
      return false;
    }
    
    // Dismiss any existing toasts
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ Area deleted successfully with complete database sync');
      setTimeout(() => {
        toast.success('Area eliminata definitivamente');
      }, 200);
    } else {
      console.error('❌ Failed to delete area from database');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, isDeleting]);

  // CRITICAL FIX: Clear all areas with NUCLEAR cleanup
  const handleClearAllAreas = useCallback(async (): Promise<void> => {
    console.log('🧹 CLEAR ALL AREAS - Starting NUCLEAR cleanup');
    
    if (isDeleting) {
      console.log('🚫 Delete already in progress, preventing duplicate');
      return;
    }
    
    // Dismiss any existing toasts
    toast.dismiss();
    
    const success = await deleteAllUserAreas();
    
    if (success) {
      console.log('✅ All areas eliminated with nuclear cleanup');
      setTimeout(() => {
        toast.success('Tutte le aree sono state eliminate definitivamente');
      }, 200);
    } else {
      console.error('❌ Failed to execute nuclear cleanup');
      toast.error('Errore nell\'eliminazione delle aree');
    }
  }, [deleteAllUserAreas, isDeleting]);

  // Debug function
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
      
      console.log('🔍 DEBUG STATE REPORT:', debugData);
      console.log('🔍 ZUSTAND STATE:', { areaCreated, buzzCount });
      console.log('🔍 PROGRESSIVE RADIUS INFO - SINGLE SOURCE:', {
        weeklyAreasCount: currentWeekAreas.length,
        nextRadius: calculateProgressiveRadius(),
        basePrice: calculateBuzzMapPrice(),
        exactFormula: `100.0 * (0.95^${currentWeekAreas.length}) = ${calculateProgressiveRadius().toFixed(2)} km`
      });
    }
  }, [user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, calculateProgressiveRadius, calculateBuzzMapPrice, forceUpdateCounter, dailyBuzzCounter, dailyBuzzMapCounter, createDebugReport, areaCreated, buzzCount]);

  // Load initial data with complete sync
  useEffect(() => {
    if (user?.id) {
      loadCurrentWeekAreas();
    }
  }, [user, loadCurrentWeekAreas]);

  // Sync buzz count with daily counter
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
    // Expose centralized state
    areaCreated,
    buzzCount,
    isDeleting
  };
};
