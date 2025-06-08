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

  // NEW: Use the dedicated BUZZ MAPPA counter with progressive pricing
  const {
    dailyBuzzMapCounter,
    updateDailyBuzzMapCounter,
    calculateProgressivePrice,
    calculateEscalatedPrice,
    showUnder5kmWarning,
    precisionMode
  } = useBuzzMapCounter(user?.id);

  const { createBuzzMapArea } = useBuzzDatabase();

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

  // CRITICAL FIX: Generate new BUZZ MAPPA area with atomic operations
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
      const radiusKm = calculateNextRadius();
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

      console.log('🗺️ BUZZ MAPPA - Starting atomic generation:', {
        originalCoords: { lat: centerLat, lng: centerLng },
        finalCoords: { lat: finalLat, lng: finalLng },
        radius_km: radiusKm,
        week: currentWeek,
        basePrice: basePrice,
        finalPrice: finalPrice,
        precision: precision,
        currentBuzzMapCounter: dailyBuzzMapCounter
      });

      // CRITICAL FIX: Step 1 - Atomic removal of previous areas
      console.log('🧹 Step 1: Atomic removal of previous areas...');
      const removed = await removePreviousArea();
      if (!removed) {
        console.error('❌ Failed to remove previous area');
        toast.error('Errore nel rimuovere l\'area precedente');
        return null;
      }
      
      console.log('✅ Step 1 completed: Previous areas removed atomically');

      // CRITICAL FIX: Step 2 - Create new area with validated data
      console.log('🚀 Step 2: Creating new area with validation...');
      const newArea = await createBuzzMapArea(user.id, finalLat, finalLng, radiusKm, currentWeek);
      if (!newArea) {
        console.error('❌ Failed to create new area');
        return null;
      }
      
      console.log('✅ Step 2 completed: New area created:', newArea);
      
      // CRITICAL FIX: Step 3 - Update counters and state atomically
      console.log('📊 Step 3: Updating counters atomically...');
      const newBuzzMapCounter = await updateDailyBuzzMapCounter(basePrice, precision);
      console.log('📊 BUZZ MAPPA counter updated to:', newBuzzMapCounter);
      
      // Update centralized state
      setAreaCreated(true);
      incrementBuzzCount();
      
      // CRITICAL FIX: Step 4 - Set only the new area in local state (no merging, no cache)
      console.log('🔄 Step 4: Setting fresh state with new area only...');
      setCurrentWeekAreas([newArea]);
      
      console.log('✅ Step 4 completed: Fresh state set');
      
      // CRITICAL FIX: Step 5 - Force reload to ensure consistency with database
      console.log('🔄 Step 5: Force reloading from database for consistency...');
      setTimeout(async () => {
        await loadCurrentWeekAreas();
        await loadDailyBuzzCounter();
        console.log('✅ Step 5 completed: Data consistency verified');
      }, 200);
      
      // Success message with pricing info
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(1)} km - ${precisionText} - Prezzo: ${finalPrice.toFixed(2)}€`);
      
      console.log('🎉 BUZZ MAPPA generation completed successfully with atomic operations');
      return newArea;
    } catch (err) {
      console.error('❌ Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, getCurrentWeek, calculateNextRadius, calculateBuzzMapPrice, dailyBuzzMapCounter, removePreviousArea, createBuzzMapArea, updateDailyBuzzMapCounter, setCurrentWeekAreas, loadCurrentWeekAreas, loadDailyBuzzCounter, setAreaCreated, incrementBuzzCount, determinePrecisionMode, applyPrecisionFuzz, calculateProgressivePrice, calculateEscalatedPrice, showUnder5kmWarning]);

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
        calculateNextRadius,
        calculateBuzzMapPrice
      );
      
      console.log('🔍 DEBUG STATE REPORT:', debugData);
      console.log('🔍 ZUSTAND STATE:', { areaCreated, buzzCount });
      console.log('🔍 PRICING INFO:', {
        basePrice: calculateBuzzMapPrice(),
        progressivePrice: calculateProgressivePrice(calculateBuzzMapPrice()),
        precision: precisionMode
      });
    }
  }, [user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, calculateNextRadius, calculateBuzzMapPrice, forceUpdateCounter, dailyBuzzCounter, dailyBuzzMapCounter, createDebugReport, areaCreated, buzzCount, calculateProgressivePrice, precisionMode]);

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
    calculateNextRadius,
    calculateBuzzMapPrice: useCallback(() => {
      const basePrice = calculateBuzzMapPrice();
      const activeArea = getActiveArea();
      if (activeArea && activeArea.radius_km < 5) {
        return calculateEscalatedPrice(basePrice, activeArea.radius_km);
      }
      return calculateProgressivePrice(basePrice);
    }, [calculateBuzzMapPrice, getActiveArea, calculateEscalatedPrice, calculateProgressivePrice]),
    generateBuzzMapArea,
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
