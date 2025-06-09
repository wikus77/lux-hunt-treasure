
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
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

  // UNIFIED BUZZ generation - BACKEND ONLY - COMPLETELY STATELESS FRONTEND
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.debug('🚫 BUZZ GENERATION - No user ID');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (!centerLat || !centerLng || isNaN(centerLat) || isNaN(centerLng)) {
      console.debug('🚫 BUZZ GENERATION - Invalid coordinates');
      toast.dismiss();
      toast.error('Coordinate della mappa non valide');
      return null;
    }

    // Prevent concurrent operations
    if (isGenerating || isDeleting) {
      console.debug('🚫 BUZZ GENERATION - Blocked - operation in progress', { isGenerating, isDeleting });
      return null;
    }

    setIsGenerating(true);
    toast.dismiss(); // Clear any existing toasts
    
    try {
      console.debug('🔥 BUZZ GENERATION START - PURE BACKEND CALL:', {
        centerLat,
        centerLng,
        userId: user.id,
        mode: 'pure-backend-only'
      });
      
      // STEP 1: Complete cleanup with FORCED sync sequence
      console.debug('🧹 STEP 1 - Complete cleanup with FORCED sync...');
      await forceCompleteSync();
      
      // STEP 2: Clear all existing areas SILENTLY
      console.debug('🗑️ STEP 2 - Clear all existing areas SILENTLY...');
      if (currentWeekAreas.length > 0) {
        const cleanupSuccess = await deleteAllUserAreas();
        if (!cleanupSuccess) {
          console.error('❌ BUZZ GENERATION - Cleanup failed');
          toast.dismiss();
          toast.error('Errore nel rimuovere le aree precedenti');
          return null;
        }
      }
      
      console.debug('✅ STEP 2 - Cleanup completed');
      
      // STEP 3: CRITICAL - Call backend with generateMap: true and coordinates - PURE BACKEND LOGIC
      console.debug('🚀 STEP 3 - Calling PURE BACKEND handle-buzz-press with generateMap: true...');
      
      const response = await callBuzzApi({ 
        userId: user.id, 
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      if (!response.success) {
        console.error('❌ BUZZ GENERATION - Backend call failed:', response.error);
        toast.dismiss();
        toast.error(response.error || 'Errore durante la generazione dell\'area');
        return null;
      }

      // STEP 4: Extract area data from backend response - NO FRONTEND CALCULATION EVER
      const mapArea = response.map_area;
      if (!mapArea) {
        console.error('❌ BUZZ GENERATION - No map area returned from backend');
        toast.dismiss();
        toast.error('Backend non ha restituito area mappa');
        return null;
      }

      console.debug('✅ STEP 4 - Backend returned REAL area with CALCULATED radius:', mapArea);

      // STEP 5: Create BuzzMapArea object from backend response - PURE BACKEND DATA
      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(), // Generate frontend ID
        lat: mapArea.lat,
        lng: mapArea.lng,
        radius_km: mapArea.radius_km, // PURE BACKEND CALCULATION WITH 5% REDUCTION
        week: mapArea.week,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      // STEP 6: Force complete sync after creation
      console.debug('🔄 STEP 6 - Force complete sync after creation...');
      await forceCompleteSync();
      await forceReload();
      
      // STEP 7: Show SINGLE success toast with REAL backend data ONLY
      toast.dismiss(); // Ensure no other toasts
      const precision = response.precision || 'standard';
      const precisionText = precision === 'high' ? 'ALTA PRECISIONE' : 'PRECISIONE RIDOTTA';
      
      // ONLY SHOW TOAST WITH REAL DATA FROM BACKEND - NO FRONTEND CALCULATION
      toast.success(`Area BUZZ MAPPA generata! Raggio: ${mapArea.radius_km.toFixed(1)} km - ${precisionText} - Prezzo: €${response.buzz_cost?.toFixed(2) || '0.00'}`);
      
      console.debug('🎉 BUZZ GENERATION - Completed successfully with PURE backend data:', {
        radius_km: mapArea.radius_km, // REAL VALUE WITH 5% REDUCTION
        cost: response.buzz_cost,
        precision: precision,
        source: 'pure-backend-calculation'
      });
      
      return newArea;
    } catch (err) {
      console.error('❌ BUZZ GENERATION - Error:', err);
      toast.dismiss();
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, deleteAllUserAreas, callBuzzApi, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload, currentWeekAreas
  ]);

  // UNIFIED DELETE AREA - Same logic as trash icon
  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.debug('🗑️ HANDLE DELETE AREA START (UNIFIED LOGIC):', areaId);
    
    toast.dismiss(); // Clear existing toasts
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.debug('✅ HANDLE DELETE AREA - Success with UNIFIED LOGIC, performing database validation...');
      
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
    
    // Functions - PURE BACKEND ONLY
    generateBuzzMapArea, // Now uses pure backend exclusively with 5% reduction
    handleDeleteArea, // Uses UNIFIED logic
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
