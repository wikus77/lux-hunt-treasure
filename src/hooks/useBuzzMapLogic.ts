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
  
  // Use Zustand store ONLY for operation locks
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

  // Get active area from current week areas (React Query only)
  const getActiveArea = useCallback((): BuzzMapArea | null => {
    return currentWeekAreas.length > 0 ? currentWeekAreas[0] : null;
  }, [currentWeekAreas]);

  // FORCED BACKEND BUZZ generation - GUARANTEED MAP_AREA RETURN
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    // CRITICAL: Validate user ID first
    if (!user?.id) {
      console.error('🚫 BUZZ GENERATION - No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    console.log('🔥 DEBUG: Using valid user ID for FORCED BUZZ generation:', user.id);

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      console.error('🚫 BUZZ GENERATION - Invalid coordinates');
      toast.dismiss();
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.error('🚫 BUZZ GENERATION - Blocked - operation in progress', { isGenerating, isDeleting });
      return null;
    }

    setIsGenerating(true);
    toast.dismiss(); // Clear any existing toasts
    
    try {
      console.log('🔥 FORCED BUZZ GENERATION START - BACKEND ONLY with VALID USER ID:', {
        centerLat,
        centerLng,
        userId: user.id,
        mode: 'forced-backend-only-guaranteed-map-area'
      });
      
      // STEP 1: Complete cleanup with FORCED sync sequence
      console.log('🧹 STEP 1 - Complete cleanup with FORCED sync...');
      await forceCompleteSync();
      
      // STEP 2: FORCED BACKEND CALL - generateMap: true and coordinates
      console.log('🚀 STEP 2 - Calling FORCED BACKEND handle-buzz-press with generateMap: true...');
      
      const response = await callBuzzApi({ 
        userId: user.id,
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      if (!response.success) {
        console.error('❌ FORCED BUZZ GENERATION - Backend call failed:', response.error);
        toast.dismiss();
        toast.error(response.error || 'Errore durante la generazione dell\'area');
        return null;
      }

      // STEP 3: GUARANTEED MAP_AREA extraction from backend response
      const mapArea = response.map_area;
      if (!mapArea) {
        console.error('❌ FORCED BUZZ GENERATION - Backend did not return map_area despite forced generation');
        toast.dismiss();
        toast.error('Backend non ha restituito area mappa');
        return null;
      }

      console.log('✅ STEP 3 - FORCED BACKEND returned GUARANTEED map_area:', mapArea);

      // STEP 4: Create BuzzMapArea object from GUARANTEED backend response
      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: mapArea.lat,
        lng: mapArea.lng,
        radius_km: mapArea.radius_km, // GUARANTEED FROM BACKEND WITH 5% REDUCTION
        week: mapArea.week,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      // STEP 5: Force complete sync after creation
      console.log('🔄 STEP 5 - Force complete sync after GUARANTEED creation...');
      await forceCompleteSync();
      await forceReload();
      
      // STEP 6: Show SINGLE success toast with GUARANTEED backend data
      toast.dismiss();
      const precision = response.precision || 'standard';
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      
      // GUARANTEED TOAST WITH REAL BACKEND DATA
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${mapArea.radius_km.toFixed(1)} km - ${precisionText} - Prezzo: €${response.buzz_cost?.toFixed(2) || '0.00'} - BACKEND VERIFIED`);
      
      console.log('🎉 FORCED BUZZ GENERATION - GUARANTEED SUCCESS with backend data:', {
        userId: user.id,
        radius_km: mapArea.radius_km,
        cost: response.buzz_cost,
        precision: precision,
        source: 'forced-backend-guaranteed-map-area'
      });
      
      return newArea;
    } catch (err) {
      console.error('❌ FORCED BUZZ GENERATION - Error:', err);
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

  // UNIFIED DELETE AREA - Same logic as trash icon
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ HANDLE DELETE AREA START (UNIFIED LOGIC):', areaId);
    
    toast.dismiss(); // Clear existing toasts
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ HANDLE DELETE AREA - Success with UNIFIED LOGIC, performing database validation...');
      
      // CRITICAL: Validate deletion at database level
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ DATABASE VALIDATION WARNING after specific delete');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce nel database');
      } else {
        toast.success('Area eliminata definitivamente');
      }
      
      // Force complete sync after deletion
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
    
    // Functions - FORCED BACKEND ONLY with GUARANTEED MAP_AREA
    generateBuzzMapArea, // Now FORCES backend with GUARANTEED map_area return
    handleDeleteArea, // Uses UNIFIED logic
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
