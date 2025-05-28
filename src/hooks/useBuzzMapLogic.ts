
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

  // NEW: Use the dedicated BUZZ MAPPA counter
  const {
    dailyBuzzMapCounter,
    updateDailyBuzzMapCounter
  } = useBuzzMapCounter(user?.id);

  const { createBuzzMapArea } = useBuzzDatabase();

  // Generate new BUZZ MAPPA area
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
      const price = calculateBuzzMapPrice();

      if (process.env.NODE_ENV === 'development') {
        console.log('🗺️ Generating BUZZ MAPPA area:', {
          lat: centerLat,
          lng: centerLng,
          radius_km: radiusKm,
          week: currentWeek,
          price: price
        });
      }

      // Remove previous area
      const removed = await removePreviousArea();
      if (!removed) {
        toast.error('Errore nel rimuovere l\'area precedente');
        return null;
      }

      // Clear local state
      setCurrentWeekAreas([]);
      
      // Create new area
      const newArea = await createBuzzMapArea(user.id, centerLat, centerLng, radiusKm, currentWeek);
      if (!newArea) {
        return null;
      }
      
      // Update BUZZ MAPPA counter (NEW - separate from regular buzz counter)
      const newBuzzMapCounter = await updateDailyBuzzMapCounter();
      
      // Update centralized state
      setAreaCreated(true);
      incrementBuzzCount();
      
      // Update local state
      setCurrentWeekAreas([newArea]);
      
      // Force reload for safety
      setTimeout(async () => {
        await loadCurrentWeekAreas();
        await loadDailyBuzzCounter();
      }, 200);
      
      // Success message
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(1)} km - Colore: AZZURRO NEON - Prezzo: ${price.toFixed(2)}€`);
      
      return newArea;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Exception generating map area:', err);
      }
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, getCurrentWeek, calculateNextRadius, calculateBuzzMapPrice, removePreviousArea, createBuzzMapArea, updateDailyBuzzMapCounter, setCurrentWeekAreas, loadCurrentWeekAreas, loadDailyBuzzCounter, setAreaCreated, incrementBuzzCount]);

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
      
      if (currentWeekAreas.length > 0) {
        currentWeekAreas.forEach((area, index) => {
          console.log(`🔍 Area ${index}:`, {
            id: area.id,
            coordinates: `${area.lat}, ${area.lng}`,
            radius: area.radius_km,
            valid: !!(area.lat && area.lng && area.radius_km),
            forceUpdateCounter: forceUpdateCounter,
            buzzCounterForColor: dailyBuzzCounter
          });
        });
      }
    }
  }, [user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, calculateNextRadius, calculateBuzzMapPrice, forceUpdateCounter, dailyBuzzCounter, dailyBuzzMapCounter, createDebugReport, areaCreated, buzzCount]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Loading initial BUZZ MAPPA data for user:', user.id);
      }
      loadCurrentWeekAreas();
    }
  }, [user, loadCurrentWeekAreas]);

  // Sync buzz count with daily counter
  useEffect(() => {
    setBuzzCount(dailyBuzzCounter);
  }, [dailyBuzzCounter, setBuzzCount]);

  // Debug logging for state changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🗺️ Current week areas state updated:', {
        areas: currentWeekAreas,
        count: currentWeekAreas.length,
        forceUpdateCounter: forceUpdateCounter,
        dailyBuzzCounter: dailyBuzzCounter,
        dailyBuzzMapCounter: dailyBuzzMapCounter,
        areaCreated: areaCreated,
        buzzCount: buzzCount,
        timestamp: new Date().toISOString()
      });
      
      if (currentWeekAreas.length > 0) {
        console.log('🎯 AREA READY FOR RENDERING:', {
          ...currentWeekAreas[0],
          forceUpdateCounter: forceUpdateCounter,
          buzzCounterForColor: dailyBuzzCounter
        });
      }
    }
  }, [currentWeekAreas, forceUpdateCounter, dailyBuzzCounter, dailyBuzzMapCounter, areaCreated, buzzCount]);

  return {
    currentWeekAreas,
    isGenerating,
    userCluesCount,
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    calculateNextRadius,
    calculateBuzzMapPrice,
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
