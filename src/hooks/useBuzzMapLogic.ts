
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMapAreas } from './useMapAreas';
import { useBuzzApi } from './buzz/useBuzzApi';
import { useBuzzCounter } from './useBuzzCounter';
import { useBuzzMapCounter } from './useBuzzMapCounter';
import { useMapStore } from '@/stores/mapStore';
import { useGameRules } from './useGameRules';

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
  const { callBuzzApi } = useBuzzApi();
  const { getCurrentWeek, getMapRadius } = useGameRules();
  
  const { 
    isGenerating,
    isDeleting,
    setIsGenerating
  } = useMapStore();

  const {
    currentWeekAreas,
    isLoading,
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteSync,
    validateBuzzDeletion
  } = useMapAreas(user?.id);

  const {
    dailyBuzzCounter,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);

  const {
    dailyBuzzMapCounter,
    updateDailyBuzzMapCounter,
    precisionMode
  } = useBuzzMapCounter(user?.id);

  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return currentWeekAreas.length > 0 ? currentWeekAreas[0] : null;
  }, [currentWeekAreas]);

  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.error('❌ LANCIO BUZZ: No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    console.log('🚀 LANCIO 19 LUGLIO: BUZZ GENERATION START', {
      userId: user.id,
      centerLat,
      centerLng,
      currentWeek: getCurrentWeek()
    });

    if (isGenerating || isDeleting) {
      console.error('❌ Operation blocked - another operation in progress');
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      console.log('📡 LANCIO BACKEND: Calling with OFFICIAL RULES...');
      
      const response = await callBuzzApi({ 
        userId: user.id,
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      console.log('📊 LANCIO RESPONSE:', response);
      
      if (!response.success || response.error) {
        console.error('❌ Backend error:', response.errorMessage || response.error);
        toast.dismiss();
        toast.error(response.errorMessage || 'Errore durante la generazione dell\'area');
        return null;
      }

      // CRITICAL: FIXED GENERATION CALCULATION - Use persistent counter with proper update
      const currentWeek = getCurrentWeek();
      
      // Check if this is first launch
      const isFirstLaunch = sessionStorage.getItem('isFirstLaunch') === 'true';
      
      // FORCE: Calculate generation using buzz map counter (fixed parameter issue)
      let generation: number;
      try {
        const updatedCounter = await updateDailyBuzzMapCounter(0, 'high'); // Fix: providing required parameters
        generation = updatedCounter || 1;
      } catch (error) {
        console.error('❌ Error updating buzz map counter:', error);
        generation = (dailyBuzzMapCounter || 0) + 1;
      }
      
      let initialRadius: number;
      if (generation === 1 || isFirstLaunch) {
        initialRadius = 500000; // 500km in meters
        console.log('✅ BUZZ MAPPA PARTENZA DA 500km - FIRST GENERATION');
      } else {
        // PROGRESSIVE REDUCTION: 500km * 0.95^(generation-1)
        initialRadius = Math.max(5000, 500000 * Math.pow(0.95, generation - 1));
        console.log('✅ RADIUS REDUCTION: Generation', generation, '= ', initialRadius / 1000, 'km');
      }
      
      // Protect from underflow
      if (initialRadius < 5000) {
        initialRadius = 5000; // Minimum 5km
      }
      
      const finalRadius = initialRadius / 1000; // Convert to km for storage
      
      // DEBUG VISUAL MANDATORY
      console.log("▶️ generation:", generation);
      console.log("▶️ radius:", initialRadius, "meters =", finalRadius, "km");
      console.log("▶️ isFirstLaunch:", isFirstLaunch);
      console.log("▶️ dailyBuzzMapCounter:", dailyBuzzMapCounter);
      console.log("▶️ currentWeekAreas.length:", currentWeekAreas?.length || 0);
      
      console.log('🎯 LANCIO RADIUS CALCULATION:', {
        week: currentWeek,
        generation: generation,
        isFirstLaunch,
        originalRadius: response.radius_km,
        finalRadius: finalRadius,
        currentAreas: currentWeekAreas?.length || 0,
        dailyBuzzMapCounter: dailyBuzzMapCounter
      });

      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat || centerLat,
        lng: response.lng || centerLng,
        radius_km: finalRadius, // Use calculated radius with progressive reduction
        week: currentWeek,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      // Clear first launch flag after first generation
      if (isFirstLaunch) {
        sessionStorage.removeItem('isFirstLaunch');
        console.log('🔄 First launch flag cleared - next generation will use normal rules');
      }

      console.log('🎉 LANCIO SUCCESS: Area created', newArea);
      console.log("✅ Area creata con raggio:", finalRadius, "km, generazione:", generation);
      console.log("▶️ layer created:", true);

      await forceCompleteSync();
      await forceReload();
      
      toast.dismiss();
      toast.success(`✅ LANCIO M1SSION: Area ${finalRadius.toFixed(1)}km generata - Generazione ${generation} Settimana ${currentWeek}`);
      
      console.log("✅ BUZZ GENERATION COMPLETA", { gen: generation, radius: initialRadius });
      
      return newArea;
    } catch (err) {
      console.error('❌ LANCIO ERROR:', err);
      toast.dismiss();
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, callBuzzApi, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload,
    getCurrentWeek, getMapRadius, currentWeekAreas?.length,
    dailyBuzzMapCounter, updateDailyBuzzMapCounter
  ]);

  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ LANCIO DELETE: Starting area deletion', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ LANCIO DELETE: Success - validating removal');
      
      // VALIDAZIONE CRITICA: area NON deve più riapparire MAI
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ LANCIO WARNING: Area might reappear');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce');
      } else {
        toast.success('✅ Area eliminata definitivamente');
      }
      
      // FORCE COMPLETE SYNC: assicura che l'area non riappaia
      await forceCompleteSync();
      await forceReload();
    } else {
      console.error('❌ LANCIO DELETE: Failed');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, forceCompleteSync, validateBuzzDeletion, forceReload]);

  return {
    currentWeekAreas,
    isLoading,
    isGenerating,
    isDeleting,
    userCluesCount: 0, // LANCIO: Sempre 0 - dati resettati
    dailyBuzzCounter: 0, // LANCIO: Sempre 0 - dati resettati
    dailyBuzzMapCounter: 0, // LANCIO: Sempre 0 - dati resettati
    precisionMode,
    
    generateBuzzMapArea,
    handleDeleteArea,
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
