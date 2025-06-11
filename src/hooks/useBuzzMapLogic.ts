import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMapAreas } from './useMapAreas';
import { useBuzzApi } from './buzz/useBuzzApi';
import { useBuzzMapRadius } from './buzz/useBuzzMapRadius';
import { useBuzzMapCounter } from './buzz/useBuzzMapCounter';
import { useBuzzMapNotifications } from './buzz/useBuzzMapNotifications';
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
  const { getCurrentWeek } = useGameRules();
  const { calculateRadius } = useBuzzMapRadius();
  const { incrementCounter } = useBuzzMapCounter(user?.id);
  const { sendAreaGeneratedNotification } = useBuzzMapNotifications();
  
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

      // FIXED: Use simple counter increment
      const generation = await incrementCounter();
      console.log("▶️ generation:", generation);
      
      // FIXED: Use simple radius calculation
      const radiusInMeters = calculateRadius(generation);
      const finalRadius = radiusInMeters / 1000; // Convert to km for storage
      
      console.log("▶️ radius:", radiusInMeters, "meters =", finalRadius, "km");

      const currentWeek = getCurrentWeek();
      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat || centerLat,
        lng: response.lng || centerLng,
        radius_km: finalRadius,
        week: currentWeek,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      console.log('🎉 LANCIO SUCCESS: Area created', newArea);
      console.log("✅ Area creata con raggio:", finalRadius, "km, generazione:", generation);
      console.log("▶️ layer created:", true);

      // Send notification
      await sendAreaGeneratedNotification(user.id, finalRadius, generation);

      await forceCompleteSync();
      await forceReload();
      
      console.log("✅ BUZZ GENERATION COMPLETA", { gen: generation, radius: radiusInMeters });
      
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
    getCurrentWeek, calculateRadius, incrementCounter, sendAreaGeneratedNotification
  ]);

  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ LANCIO DELETE: Starting area deletion', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ LANCIO DELETE: Success - validating removal');
      
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ LANCIO WARNING: Area might reappear');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce');
      } else {
        toast.success('✅ Area eliminata definitivamente');
      }
      
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
    userCluesCount: 0,
    dailyBuzzCounter: 0,
    dailyBuzzMapCounter: 0,
    precisionMode: 'high',
    
    generateBuzzMapArea,
    handleDeleteArea,
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
