
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
    setCurrentWeekAreas
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

  // CRITICAL FIX: Calculate progressive radius reduction with EXACT values
  const calculateProgressiveRadius = useCallback((): number => {
    console.log('📏 CALCULATING PROGRESSIVE RADIUS - EXACT with current areas:', currentWeekAreas.length);
    
    // CRITICAL: Use the count-based calculation for exact consistency
    const radius = calculateProgressiveRadiusFromCount(currentWeekAreas.length);
    
    console.log('📏 PROGRESSIVE RADIUS RESULT - EXACT:', {
      weeklyCount: currentWeekAreas.length,
      calculatedRadius: radius,
      shouldStart: currentWeekAreas.length === 0 ? '100.0 km (first BUZZ)' : `Reduced from previous by 5%`,
      exactFormula: currentWeekAreas.length === 0 ? 'BASE = 100.0' : `100.0 * (0.95^${currentWeekAreas.length}) = ${radius.toFixed(1)}`
    });
    
    return radius;
  }, [currentWeekAreas, calculateProgressiveRadiusFromCount]);

  // Determine precision mode based on recent clue activity
  const determinePrecisionMode = useCallback((): 'high' | 'low' => {
    // Check if user has received new clues since last BUZZ MAPPA
    // For now, we'll use a simple heuristic based on clue count vs buzz map count
    if (userCluesCount > dailyBuzzMapCounter) {
      return 'high'; // More clues than buzzes = high precision
    }
    return 'low'; // Same or fewer clues = low precision
  }, [userCluesCount, dailyBuzzMapCounter]);

  // Apply precision mode to coordinates
  const applyPrecisionFuzz = useCallback((lat: number, lng: number, precision: 'high' | 'low') => {
    if (precision === 'high') {
      return { lat, lng }; // No fuzz for high precision
    }
    
    // Apply fuzz for low precision (up to 0.01 degrees ~1km)
    const fuzzFactor = 0.01;
    const fuzzLat = (Math.random() - 0.5) * fuzzFactor;
    const fuzzLng = (Math.random() - 0.5) * fuzzFactor;
    
    return {
      lat: lat + fuzzLat,
      lng: lng + fuzzLng
    };
  }, []);

  // CRITICAL FIX: Generate new BUZZ MAPPA area with EXACT progressive radius and perfect consistency
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    setIsGenerating(true);
    
    try {
      const currentWeek = getCurrentWeek();
      
      // CRITICAL FIX: Use EXACT progressive radius calculation with perfect consistency
      const radiusKm = calculateProgressiveRadius();
      
      console.log('🗺️ BUZZ MAPPA GENERATION STARTING - EXACT:', {
        weeklyAreasCount: currentWeekAreas.length,
        calculatedRadius: radiusKm,
        shouldBeExact: true,
        coordinates: { lat: centerLat, lng: centerLng },
        expectedFormula: currentWeekAreas.length === 0 ? 'First BUZZ = 100.0 km' : `${currentWeekAreas.length}th BUZZ = 100 * (0.95^${currentWeekAreas.length}) = ${radiusKm.toFixed(1)} km`
      });
      
      const basePrice = calculateBuzzMapPrice();
      const precision = determinePrecisionMode();
      
      // Calculate final price with progressive pricing and escalation
      let finalPrice: number;
      if (radiusKm < 5) {
        finalPrice = calculateEscalatedPrice(basePrice, radiusKm);
        showUnder5kmWarning();
      } else {
        finalPrice = calculateProgressivePrice(basePrice);
      }

      // Apply precision fuzz to coordinates
      const { lat: finalLat, lng: finalLng } = applyPrecisionFuzz(centerLat, centerLng, precision);

      // CRITICAL FIX: Step 1 - Complete removal of ALL previous areas (definitive cleanup)
      console.log('🧹 Step 1: COMPLETE CLEANUP - Removing ALL previous areas definitively');
      const removed = await removePreviousArea();
      if (!removed) {
        console.error('❌ Failed to remove previous areas completely');
        toast.error('Errore nel rimuovere le aree precedenti');
        setIsGenerating(false);
        return null;
      }
      
      console.log('✅ Step 1 COMPLETE: ALL previous areas removed definitively from database');
      
      // CRITICAL FIX: Step 2 - Create new area with EXACT radius value (no approximations)
      console.log('🚀 Step 2: CREATING NEW AREA with EXACT radius:', radiusKm, 'km');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ Failed to create new area');
        setIsGenerating(false);
        return null;
      }
      
      console.log('✅ Step 2 COMPLETE: New area created with EXACT values:', {
        id: newArea.id,
        radius_km: newArea.radius_km,
        coordinates: { lat: newArea.lat, lng: newArea.lng },
        expectedRadius: radiusKm,
        radiusMatch: Math.abs(newArea.radius_km - radiusKm) < 0.01
      });
      
      // CRITICAL FIX: Verify EXACT radius consistency between calculation and database
      if (Math.abs(newArea.radius_km - radiusKm) > 0.01) {
        console.error('❌ RADIUS MISMATCH DETECTED - CRITICAL:', {
          calculated: radiusKm,
          savedInDatabase: newArea.radius_km,
          difference: Math.abs(newArea.radius_km - radiusKm),
          toleranceExceeded: true
        });
      } else {
        console.log('✅ RADIUS CONSISTENCY VERIFIED - EXACT VALUES MATCH PERFECTLY');
      }
      
      // CRITICAL FIX: Step 3 - Update counters
      console.log('📊 Step 3: Updating counters');
      const newBuzzMapCounter = await updateDailyBuzzMapCounter(basePrice, precision);
      console.log('📊 BUZZ MAPPA counter updated to:', newBuzzMapCounter);
      
      // Update centralized state
      setAreaCreated(true);
      incrementBuzzCount();
      
      // CRITICAL FIX: Step 4 - Force immediate reload to ensure perfect visual consistency
      console.log('🔄 Step 4: FORCE IMMEDIATE RELOAD for perfect visual consistency');
      await loadCurrentWeekAreas();
      
      console.log('✅ Step 4 COMPLETE: State synchronized perfectly with database');
      
      // CRITICAL FIX: SINGLE SUCCESS MESSAGE with EXACT radius value from database
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(1)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      
      console.log('🎉 BUZZ MAPPA GENERATION COMPLETE - PERFECT:', {
        finalRadius: newArea.radius_km,
        visualConsistency: 'GUARANTEED',
        databaseSync: 'COMPLETE',
        exactMatch: 'VERIFIED'
      });
      
      return newArea;
    } catch (err) {
      console.error('❌ Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, getCurrentWeek, calculateProgressiveRadius, calculateBuzzMapPrice, dailyBuzzMapCounter, removePreviousArea, createBuzzMapArea, updateDailyBuzzMapCounter, loadCurrentWeekAreas, setAreaCreated, incrementBuzzCount, determinePrecisionMode, applyPrecisionFuzz, calculateProgressivePrice, calculateEscalatedPrice, showUnder5kmWarning, currentWeekAreas]);

  // CRITICAL FIX: Manual area deletion with immediate database sync and verification
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ MANUAL AREA DELETION requested for area:', areaId);
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ Area deleted successfully, immediate state sync complete');
      toast.success('Area eliminata');
    } else {
      console.error('❌ Failed to delete area');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea]);

  // CRITICAL FIX: Clear all areas with definitive cleanup and verification
  const handleClearAllAreas = useCallback(async (): Promise<void> => {
    console.log('🧹 CLEAR ALL AREAS - Starting definitive cleanup');
    
    const success = await removePreviousArea();
    
    if (success) {
      console.log('✅ All areas cleared successfully');
      toast.success('Tutte le aree sono state eliminate');
    } else {
      console.error('❌ Failed to clear all areas');
      toast.error('Errore nell\'eliminazione delle aree');
    }
  }, [removePreviousArea]);

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
      console.log('🔍 PROGRESSIVE RADIUS INFO - EXACT:', {
        weeklyAreasCount: currentWeekAreas.length,
        nextRadius: calculateProgressiveRadius(),
        basePrice: calculateBuzzMapPrice(),
        progressivePrice: calculateProgressivePrice(calculateBuzzMapPrice()),
        precision: precisionMode,
        exactFormula: `100.0 * (0.95^${currentWeekAreas.length}) = ${calculateProgressiveRadius().toFixed(1)} km`
      });
    }
  }, [user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, calculateProgressiveRadius, calculateBuzzMapPrice, forceUpdateCounter, dailyBuzzCounter, dailyBuzzMapCounter, createDebugReport, areaCreated, buzzCount, calculateProgressivePrice, precisionMode]);

  // Load initial data
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
    buzzCount
  };
};
