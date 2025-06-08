
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
    calculateNextRadiusFromArea, 
    createDebugReport 
  } = useBuzzMapUtils();

  // Use specialized hooks
  const {
    currentWeekAreas,
    forceUpdateCounter,
    getActiveArea,
    calculateNextRadius,
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

  // CRITICAL FIX: Calculate progressive radius reduction based on weekly BUZZ count
  const calculateProgressiveRadius = useCallback((): number => {
    const BASE_RADIUS = 100; // 100 km initial radius
    const MIN_RADIUS = 0.5; // 0.5 km (500m) minimum radius
    const REDUCTION_FACTOR = 0.95; // -5% each time
    
    console.log('📏 Calculating progressive radius:');
    console.log('📊 Current week areas count:', currentWeekAreas.length);
    
    // If no previous areas this week, start with base radius
    if (currentWeekAreas.length === 0) {
      console.log('📏 No previous areas, using base radius:', BASE_RADIUS, 'km');
      return BASE_RADIUS;
    }
    
    // Get the most recent area's radius and apply reduction
    const latestArea = currentWeekAreas[0]; // Areas are sorted by created_at desc
    const previousRadius = latestArea.radius_km;
    const nextRadius = previousRadius * REDUCTION_FACTOR;
    const finalRadius = Math.max(MIN_RADIUS, nextRadius);
    
    console.log('📏 Progressive radius calculation:');
    console.log('📏 Previous radius:', previousRadius, 'km');
    console.log('📏 Calculated next radius (5% reduction):', nextRadius, 'km');
    console.log('📏 Final radius (with 0.5km minimum):', finalRadius, 'km');
    
    return finalRadius;
  }, [currentWeekAreas]);

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

  // CRITICAL FIX: Generate new BUZZ MAPPA area with progressive radius and perfect visual consistency
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
      
      // CRITICAL FIX: Use progressive radius calculation instead of calculateNextRadius
      const radiusKm = calculateProgressiveRadius();
      
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

      console.log('🗺️ BUZZ MAPPA - Starting generation with PROGRESSIVE RADIUS:', {
        originalCoords: { lat: centerLat, lng: centerLng },
        finalCoords: { lat: finalLat, lng: finalLng },
        radius_km: radiusKm,
        week: currentWeek,
        basePrice: basePrice,
        finalPrice: finalPrice,
        precision: precision,
        currentBuzzMapCounter: dailyBuzzMapCounter,
        weeklyAreasCount: currentWeekAreas.length
      });

      // CRITICAL FIX: Step 1 - Atomic removal of ALL previous areas with verification
      console.log('🧹 Step 1: Removing previous areas...');
      const removed = await removePreviousArea();
      if (!removed) {
        console.error('❌ Failed to remove previous area');
        toast.error('Errore nel rimuovere l\'area precedente');
        return null;
      }
      
      console.log('✅ Step 1 completed: Previous areas removed');
      
      // CRITICAL FIX: Step 2 - Create new area with EXACT radius value
      console.log('🚀 Step 2: Creating new area with EXACT radius:', radiusKm, 'km');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ Failed to create new area');
        return null;
      }
      
      console.log('✅ Step 2 completed: New area created with radius:', newArea.radius_km, 'km');
      
      // CRITICAL FIX: Verify radius consistency
      if (Math.abs(newArea.radius_km - radiusKm) > 0.01) {
        console.error('❌ RADIUS MISMATCH:', {
          expected: radiusKm,
          actual: newArea.radius_km,
          difference: Math.abs(newArea.radius_km - radiusKm)
        });
      } else {
        console.log('✅ RADIUS CONSISTENCY VERIFIED:', newArea.radius_km, 'km');
      }
      
      // CRITICAL FIX: Step 3 - Update counters
      console.log('📊 Step 3: Updating counters...');
      const newBuzzMapCounter = await updateDailyBuzzMapCounter(basePrice, precision);
      console.log('📊 BUZZ MAPPA counter updated to:', newBuzzMapCounter);
      
      // Update centralized state
      setAreaCreated(true);
      incrementBuzzCount();
      
      // CRITICAL FIX: Step 4 - Force immediate reload to ensure visual consistency
      console.log('🔄 Step 4: Force reloading for visual consistency...');
      await loadCurrentWeekAreas();
      
      console.log('✅ Step 4 completed: State synchronized with database');
      
      // CRITICAL FIX: Success message with EXACT radius value from database
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(1)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      
      console.log('🎉 BUZZ MAPPA generation completed with EXACT radius consistency');
      return newArea;
    } catch (err) {
      console.error('❌ Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, getCurrentWeek, calculateProgressiveRadius, calculateBuzzMapPrice, dailyBuzzMapCounter, removePreviousArea, createBuzzMapArea, updateDailyBuzzMapCounter, loadCurrentWeekAreas, setAreaCreated, incrementBuzzCount, determinePrecisionMode, applyPrecisionFuzz, calculateProgressivePrice, calculateEscalatedPrice, showUnder5kmWarning, currentWeekAreas]);

  // CRITICAL FIX: Manual area deletion with immediate database sync
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ Manual deletion requested for area:', areaId);
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ Area deleted successfully, forcing immediate state sync');
      // Force immediate reload to ensure state consistency
      await loadCurrentWeekAreas();
    } else {
      console.error('❌ Failed to delete area');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, loadCurrentWeekAreas]);

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
        calculateProgressiveRadius, // Use progressive radius instead
        calculateBuzzMapPrice
      );
      
      console.log('🔍 DEBUG STATE REPORT:', debugData);
      console.log('🔍 ZUSTAND STATE:', { areaCreated, buzzCount });
      console.log('🔍 PROGRESSIVE RADIUS INFO:', {
        weeklyAreasCount: currentWeekAreas.length,
        nextRadius: calculateProgressiveRadius(),
        basePrice: calculateBuzzMapPrice(),
        progressivePrice: calculateProgressivePrice(calculateBuzzMapPrice()),
        precision: precisionMode
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
    calculateNextRadius: calculateProgressiveRadius, // Use progressive radius calculation
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
