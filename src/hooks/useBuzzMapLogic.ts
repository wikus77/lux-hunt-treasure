
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
      console.error('❌ BUZZ GENERATION - No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    console.log('🔥 STARTING BUZZ GENERATION - LANCIO 19 LUGLIO:', {
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
      console.log('🚀 CALLING BACKEND with STRICT LAUNCH RULES...');
      
      const response = await callBuzzApi({ 
        userId: user.id,
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      console.log('📡 BACKEND RESPONSE - LANCIO REGOLE:', response);
      
      if (!response.success || response.error) {
        console.error('❌ Backend error:', response.errorMessage || response.error);
        toast.dismiss();
        toast.error(response.errorMessage || 'Errore durante la generazione dell\'area');
        return null;
      }

      // APPLICA REGOLE LANCIO UFFICIALE
      const currentWeek = getCurrentWeek();
      const currentGeneration = (currentWeekAreas.length || 0) + 1;
      const correctRadius = getMapRadius(currentWeek, currentGeneration);
      
      console.log('✅ REGOLE LANCIO 19 LUGLIO APPLICATE:', {
        week: currentWeek,
        generation: currentGeneration,
        radiusFromRules: correctRadius,
        radiusFromBackend: response.radius_km,
        launchDay: '19 LUGLIO 2025'
      });

      // VALIDAZIONE: Prima generazione DEVE essere 500km
      const finalRadius = currentGeneration === 1 ? 500 : correctRadius;

      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat || centerLat,
        lng: response.lng || centerLng,
        radius_km: finalRadius, // GARANTITO: 500km per prima generazione
        week: currentWeek,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      await forceCompleteSync();
      await forceReload();
      
      toast.dismiss();
      toast.success(`✅ BUZZ MAPPA LANCIO: ${finalRadius} km - Settimana ${currentWeek}, Gen ${currentGeneration} - REGOLE UFFICIALI`);
      
      console.log('🎉 BUZZ GENERATION COMPLETE - LANCIO 19 LUGLIO:', newArea);
      
      return newArea;
    } catch (err) {
      console.error('❌ BUZZ GENERATION ERROR:', err);
      toast.dismiss();
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, callBuzzApi, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload,
    currentWeekAreas.length, getCurrentWeek, getMapRadius
  ]);

  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ HANDLE DELETE AREA START:', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ HANDLE DELETE AREA - Success');
      
      // VALIDAZIONE POST-DELETE: area NON deve più riapparire
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ DATABASE VALIDATION WARNING after specific delete');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce nel database');
      } else {
        toast.success('Area eliminata definitivamente');
      }
      
      // FORCE SYNC: assicura che l'area non riappaia mai più
      await forceCompleteSync();
      await forceReload();
    } else {
      console.error('❌ HANDLE DELETE AREA - Failed');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, forceCompleteSync, validateBuzzDeletion, forceReload]);

  return {
    currentWeekAreas,
    isLoading,
    isGenerating,
    isDeleting,
    userCluesCount: 0,
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    precisionMode,
    
    generateBuzzMapArea,
    handleDeleteArea,
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
