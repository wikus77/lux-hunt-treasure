
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

  console.debug('🧠 BUZZ LOGIC STATE:', {
    userId: user?.id,
    areasCount: currentWeekAreas.length,
    isGenerating,
    isDeleting,
    currentRadius: currentWeekAreas[0]?.radius_km || 500
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

  // CRITICAL: Progressive radius reduction - BUZZ MAPPA core logic
  const calculateNewRadius = useCallback((currentRadius: number): number => {
    // Formula: reduce by 5% each generation, minimum 5km
    const newRadius = Math.max(5, currentRadius * 0.95);
    console.log(`📏 Radius calculation: ${currentRadius}km → ${newRadius.toFixed(1)}km`);
    return newRadius;
  }, []);

  // Payment validation for non-developer users
  const requireBuzzPayment = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ No user ID for payment validation');
      return false;
    }

    // Developer bypass for wikus77@hotmail.it
    if (user.email === 'wikus77@hotmail.it') {
      console.log('🔓 Developer bypass - payment not required');
      return true;
    }

    console.log('💳 Payment validation required for non-developer user');
    return false; // Force payment for all non-developer users
  }, [user]);

  // BUZZ MAPPA generation with progressive radius reduction
  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    // CRITICAL: Validate user ID first
    if (!user?.id) {
      console.error('❌ BUZZ GENERATION - No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    console.log('🔥 STARTING BUZZ MAPPA GENERATION:', {
      userId: user.id,
      centerLat,
      centerLng,
      currentAreas: currentWeekAreas.length
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

    // CRITICAL: Payment validation for non-developers
    const canProceed = await requireBuzzPayment();
    if (!canProceed) {
      console.log('💳 Payment required - blocking generation');
      toast.dismiss();
      toast.error('Pagamento richiesto per utilizzare BUZZ MAPPA');
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      // Calculate progressive radius reduction
      const currentArea = getActiveArea();
      const currentRadius = currentArea?.radius_km || 500;
      const newRadius = calculateNewRadius(currentRadius);
      
      console.log('🚀 CALLING BACKEND with progressive radius:', {
        currentRadius,
        newRadius,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      // Call backend API with progressive radius
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
        radius_km: newRadius, // Use calculated progressive radius
        week: 1,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      // Force reload areas from database
      await forceCompleteSync();
      await forceReload();
      
      // Show success toast with progressive radius
      toast.dismiss();
      toast.success(`✅ Area BUZZ MAPPA attiva: ${newRadius.toFixed(1)} km – Gen: ${response.generation_number || 1}`);
      
      console.log('🎉 BUZZ GENERATION COMPLETE:', {
        userId: user.id,
        radius_km: newRadius,
        generation: response.generation_number,
        progressiveReduction: true
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
    setIsGenerating, forceCompleteSync, forceReload,
    currentWeekAreas, getActiveArea, calculateNewRadius, requireBuzzPayment
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
    userCluesCount: 0,
    dailyBuzzCounter,
    dailyBuzzMapCounter,
    precisionMode,
    
    // Functions - Progressive radius reduction with payment validation
    generateBuzzMapArea,
    handleDeleteArea,
    getActiveArea,
    reloadAreas: forceReload,
    forceCompleteInvalidation: forceCompleteSync,
    validateBuzzDeletion
  };
};
