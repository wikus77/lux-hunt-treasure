
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMapAreas } from './useMapAreas';
import { useBuzzApi } from './buzz/useBuzzApi';
import { useBuzzCounter } from './useBuzzCounter';
import { useBuzzMapCounter } from './useBuzzMapCounter';
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
  const { callBuzzApi } = useBuzzApi();
  
  // Use Zustand store for operation locks
  const { 
    isGenerating,
    isDeleting,
    setIsGenerating
  } = useMapStore();

  // SINGLE SOURCE OF TRUTH: React Query via useMapAreas
  const {
    currentWeekAreas,
    isLoading,
    deleteAllUserAreas,
    deleteSpecificArea,
    forceReload,
    forceCompleteSync,
    validateBuzzDeletion
  } = useMapAreas(user?.id);

  console.debug('🧠 BUZZ LOGIC STATE (BACKEND ONLY):', {
    userId: user?.id,
    areasCount: currentWeekAreas.length,
    isGenerating,
    isDeleting,
    data_source: 'backend-only'
  });

  // Use specialized hooks (only for UI display)
  const {
    dailyBuzzCounter,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);

  const {
    dailyBuzzMapCounter,
    updateDailyBuzzMapCounter,
    precisionMode
  } = useBuzzMapCounter(user?.id);

  // Get active area from current week areas
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return currentWeekAreas.length > 0 ? currentWeekAreas[0] : null;
  }, [currentWeekAreas]);

  // SIMPLIFIED BACKEND-ONLY BUZZ generation
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    // CRITICAL: Validate user ID first
    if (!user?.id) {
      console.error('❌ BUZZ GENERATION - No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    console.log('🔥 STARTING BACKEND-ONLY BUZZ GENERATION:', {
      userId: user.id,
      centerLat,
      centerLng
    });

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      console.error('❌ Invalid coordinates');
      toast.dismiss();
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.error('❌ Operation blocked - another operation in progress', { isGenerating, isDeleting });
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      console.log('🚀 CALLING BACKEND with generateMap: true...');
      
      // Call backend API with FORCED map generation
      const response = await callBuzzApi({ 
        userId: user.id,
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      console.log('📡 BACKEND RESPONSE:', response);
      
      if (!response.success || response.error) {
        console.error('❌ Backend error:', response.errorMessage || response.error);
        toast.dismiss();
        toast.error(response.errorMessage || 'Errore durante la generazione dell\'area');
        return null;
      }

      // Check if we got area data from backend
      if (!response.radius_km || !response.lat || !response.lng) {
        console.error('❌ Backend did not return complete area data');
        toast.dismiss();
        toast.error('Backend non ha restituito dati area completi');
        return null;
      }

      console.log('✅ BACKEND SUCCESS - Area data received:', {
        radius_km: response.radius_km,
        lat: response.lat,
        lng: response.lng,
        generation: response.generation_number
      });

      // Create area object from backend response
      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat,
        lng: response.lng,
        radius_km: response.radius_km,
        week: 1, // Will be set by backend
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      // Force reload areas from database
      await forceCompleteSync();
      await forceReload();
      
      // Show success toast with BACKEND VERIFIED data
      toast.dismiss();
      toast.success(`Area BUZZ generata! Raggio: ${response.radius_km.toFixed(1)} km - Gen: ${response.generation_number || 1} - BACKEND VERIFIED`);
      
      console.log('🎉 BUZZ GENERATION COMPLETE:', {
        userId: user.id,
        radius_km: response.radius_km,
        generation: response.generation_number,
        source: 'backend-verified'
      });
      
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
    setIsGenerating, forceCompleteSync, forceReload
  ]);

  // Delete area functionality
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ HANDLE DELETE AREA START:', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ HANDLE DELETE AREA - Success, performing database validation...');
      
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ DATABASE VALIDATION WARNING after specific delete');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce nel database');
      } else {
        toast.success('Area eliminata definitivamente');
      }
      
      await forceCompleteSync();
    } else {
      console.error('❌ HANDLE DELETE AREA - Failed');
      toast.error('Errore nell\'eliminazione dell\'area');
    }
    
    return success;
  }, [deleteSpecificArea, forceCompleteSync, validateBuzzDeletion]);

  return {
    // Data from React Query (SINGLE SOURCE OF TRUTH)
    currentWeekAreas,
    isLoading,
    
    // UI state
    isGenerating,
    isDeleting,
    userCluesCount: 0, // Not calculated locally - backend only
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    precisionMode,
    
    // Functions - BACKEND ONLY
    generateBuzzMapArea, // Simplified backend-only generation
    handleDeleteArea,
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
