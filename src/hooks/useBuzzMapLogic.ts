import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useBuzzAreaManagement } from './useBuzzAreaManagement';
import { useBuzzPricing } from './useBuzzPricing';
import { useBuzzCounter } from './useBuzzCounter';
import { useBuzzDatabase } from './useBuzzDatabase';

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

  // Use specialized hooks
  const {
    currentWeekAreas,
    forceUpdateCounter,
    getActiveArea,
    calculateNextRadius,
    loadCurrentWeekAreas,
    removePreviousArea,
    getCurrentWeek,
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

      console.log('🗺️ CRITICAL RADIUS - Generating BUZZ MAPPA area:', {
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek,
        price: price,
        currentBuzzCounter: dailyBuzzCounter
      });

      // Remove previous area
      console.log('🗑️ CRITICAL RADIUS - Removing previous area...');
      const removed = await removePreviousArea();
      if (!removed) {
        toast.error('Errore nel rimuovere l\'area precedente');
        return null;
      }

      // Clear local state
      console.log('🧹 CRITICAL RADIUS - Clearing local state...');
      setCurrentWeekAreas([]);
      
      // Create new area
      const newArea = await createBuzzMapArea(user.id, centerLat, centerLng, radiusKm, currentWeek);
      if (!newArea) {
        return null;
      }
      
      // Update buzz counter
      const newBuzzCounter = await updateDailyBuzzCounter();
      
      // Update local state
      console.log('🔄 CRITICAL RADIUS - FORCE updating local state immediately with new area:', newArea);
      setCurrentWeekAreas([newArea]);
      
      // Force reload for safety
      setTimeout(async () => {
        console.log('🔄 CRITICAL RADIUS - Double-check reload after area creation...');
        await loadCurrentWeekAreas(true);
        await loadDailyBuzzCounter();
      }, 200);
      
      // Success message
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${newArea.radius_km.toFixed(1)} km - Colore: AZZURRO NEON - Prezzo: ${price.toFixed(2)}€`);
      
      return newArea;
    } catch (err) {
      console.error('❌ Exception generating map area:', err);
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, getCurrentWeek, calculateNextRadius, calculateBuzzMapPrice, dailyBuzzCounter, removePreviousArea, createBuzzMapArea, updateDailyBuzzCounter, setCurrentWeekAreas, loadCurrentWeekAreas, loadDailyBuzzCounter]);

  // Debug function
  const debugCurrentState = useCallback(() => {
    console.log('🔍 DEBUG STATE REPORT:', {
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
      stateTimestamp: new Date().toISOString()
    });
    
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
  }, [user, currentWeekAreas, userCluesCount, isGenerating, getActiveArea, calculateNextRadius, calculateBuzzMapPrice, forceUpdateCounter, dailyBuzzCounter]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 CRITICAL - Loading initial BUZZ MAPPA data for user:', user.id);
      loadCurrentWeekAreas();
    }
  }, [user, loadCurrentWeekAreas]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🗺️ CRITICAL - Current week areas state updated:', {
      areas: currentWeekAreas,
      count: currentWeekAreas.length,
      forceUpdateCounter: forceUpdateCounter,
      dailyBuzzCounter: dailyBuzzCounter,
      timestamp: new Date().toISOString()
    });
    
    if (currentWeekAreas.length > 0) {
      console.log('🎯 CRITICAL - AREA READY FOR RENDERING:', {
        ...currentWeekAreas[0],
        forceUpdateCounter: forceUpdateCounter,
        buzzCounterForColor: dailyBuzzCounter
      });
    }
  }, [currentWeekAreas, forceUpdateCounter, dailyBuzzCounter]);

  return {
    currentWeekAreas,
    isGenerating,
    userCluesCount,
    dailyBuzzCounter,
    calculateNextRadius,
    calculateBuzzMapPrice,
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas: () => loadCurrentWeekAreas(true),
    testCalculationLogic,
    debugCurrentState,
    forceUpdateCounter
  };
};
