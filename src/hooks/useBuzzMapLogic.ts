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
    if (!user?.id || isGenerating || isDeleting) return null;

    console.log('🚀 LANCIO 19 LUGLIO: BUZZ GENERATION START', {
      userId: user.id,
      centerLat,
      centerLng,
      currentWeek: getCurrentWeek(),
      currentAreas: currentWeekAreas.length
    });

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

      // CRITICAL FIX: FORCE GENERATION = 1 if first launch after reset
      const isFirstLaunchAfterReset = sessionStorage.getItem('isFirstLaunchAfterReset') === 'true';
      const currentWeek = getCurrentWeek();
      
      let currentGeneration;
      let finalRadius;
      
      if (isFirstLaunchAfterReset) {
        // FORCE: ALWAYS generation 1 for first launch after reset
        currentGeneration = 1;
        finalRadius = 500; // FORCED: 500km for launch
        
        console.log('🎯 LANCIO FIRST LAUNCH DETECTED - FORCING:', {
          generation: currentGeneration,
          radius: finalRadius,
          FORCED_GENERATION_1: true,
          FORCED_500KM: true
        });
        
        // Clear the flag after use
        sessionStorage.removeItem('isFirstLaunchAfterReset');
      } else {
        // Normal logic for subsequent generations
        currentGeneration = (currentWeekAreas.length || 0) + 1;
        finalRadius = getMapRadius(currentWeek, currentGeneration);
        
        console.log('🎯 LANCIO NORMAL GENERATION:', {
          week: currentWeek,
          areasLength: currentWeekAreas.length,
          generation: currentGeneration,
          calculatedRadius: finalRadius
        });
      }

      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat || centerLat,
        lng: response.lng || centerLng,
        radius_km: finalRadius,
        week: currentWeek,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      console.log('🎉 LANCIO SUCCESS: Area created', {
        ...newArea,
        FINAL_RADIUS: finalRadius,
        GENERATION: currentGeneration
      });

      await forceCompleteSync();
      await forceReload();
      
      toast.dismiss();
      toast.success(`✅ LANCIO M1SSION: Area ${finalRadius}km generata - Generazione ${currentGeneration} Settimana ${currentWeek}`);
      
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
    getCurrentWeek, currentWeekAreas, getMapRadius
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
