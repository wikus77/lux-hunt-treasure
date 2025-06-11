
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMapAreas } from './useMapAreas';
import { useBuzzApi } from './useBuzzApi';
import { useMapStore } from '@/stores/mapStore';
import { useGameRules } from './useGameRules';
import { supabase } from '@/integrations/supabase/client';

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

  // FIX 2 - Get current generation from database
  const getCurrentGeneration = useCallback(async (): Promise<number> => {
    if (!user?.id) return 1;

    try {
      console.log(`🔥 FIX 2 – GETTING GENERATION FROM DB for user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ FIX 2 ERROR - Error getting generation count:', error);
        return 1;
      }

      const currentCount = data?.buzz_map_count || 0;
      const nextGeneration = currentCount + 1;
      
      console.log(`🔥 FIX 2 – GENERATION FROM DB: current=${currentCount}, next=${nextGeneration}`);
      return nextGeneration;
    } catch (error) {
      console.error('❌ FIX 2 ERROR - Exception getting generation count:', error);
      return 1;
    }
  }, [user?.id]);

  // FIX 2 - Correct radius calculation: max(500 * 0.95^(generation-1), 5)
  const calculateBuzzRadius = useCallback(async (): Promise<{ radius: number; generation: number }> => {
    const generation = await getCurrentGeneration();
    
    let radius;
    if (generation === 1) {
      radius = 500;
      console.log("🔥 FIX 2 – FIRST GENERATION: 500km");
    } else {
      radius = Math.max(5, 500 * Math.pow(0.95, generation - 1));
      console.log(`🔥 FIX 2 – RADIUS CALCULATION: Generation ${generation} = ${radius}km`);
    }
    
    return { radius, generation };
  }, [getCurrentGeneration]);

  // Payment verification before BUZZ
  const verifyPaymentStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ FIX 5 ERROR - No user ID for payment verification');
      return false;
    }

    try {
      console.log(`🔥 FIX 5 – VERIFYING PAYMENT for user: ${user.id}`);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ FIX 5 ERROR - Error fetching profile:', profileError);
        return false;
      }

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, end_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const hasActiveSubscription = subscription && 
        new Date(subscription.end_date || '') > new Date();

      if (!hasActiveSubscription && (!profile?.stripe_customer_id || profile?.subscription_tier === 'Free')) {
        console.warn('❌ FIX 5 ERROR - Payment verification failed: no active subscription');
        toast.error('Pagamento Richiesto', {
          description: 'Devi avere un abbonamento attivo per usare BUZZ MAPPA.'
        });
        return false;
      }

      console.log('✅ FIX 5 SUCCESS - Payment verification passed');
      return true;
    } catch (error) {
      console.error('❌ FIX 5 ERROR - Payment verification error:', error);
      return false;
    }
  }, [user?.id]);

  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.error('❌ FIX 4 ERROR - No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    // FIX 2 - Pre-calculate radius with generation logging
    const { radius: radiusKm, generation } = await calculateBuzzRadius();
    
    console.log('🔥 FIX 2 – BUZZ GENERATION START', {
      userId: user.id,
      centerLat,
      centerLng,
      currentWeek: getCurrentWeek(),
      generation,
      radiusKm
    });

    if (isGenerating || isDeleting) {
      console.error('❌ Operation blocked - another operation in progress');
      return null;
    }

    // FIX 5 - Verify payment first
    const hasValidPayment = await verifyPaymentStatus();
    if (!hasValidPayment) {
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      console.log('📡 BUZZ API CALL - Starting with payment verification...');
      
      const response = await callBuzzApi({ 
        userId: user.id,
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      console.log('📊 BUZZ API RESPONSE:', response);
      
      if (!response.success || response.error) {
        console.error('❌ Backend error:', response.errorMessage || response.error);
        toast.dismiss();
        toast.error(response.errorMessage || 'Errore durante la generazione dell\'area');
        return null;
      }

      const currentWeek = getCurrentWeek();
      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat || centerLat,
        lng: response.lng || centerLng,
        radius_km: response.radius_km || radiusKm,
        week: currentWeek,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      console.log('🎉 BUZZ SUCCESS: Area created', newArea);
      console.log(`✅ BUZZ #${generation} – Raggio: ${newArea.radius_km}km – ID area: ${newArea.id} – user: ${user.email || user.id}`);

      // Force complete sync and reload
      await forceCompleteSync();
      await forceReload();
      
      toast.success(`Area generata correttamente – Raggio: ${newArea.radius_km}km`);
      
      return newArea;
    } catch (err) {
      console.error('❌ BUZZ ERROR:', err);
      
      // Log failure to abuse_logs
      try {
        await supabase.from('abuse_logs').insert({
          user_id: user.id,
          event_type: 'buzz_fail',
          meta: {
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error('❌ Failed to log abuse:', logError);
      }
      
      toast.dismiss();
      toast.error('Errore durante la generazione dell\'area');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, callBuzzApi, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload,
    getCurrentWeek, calculateBuzzRadius, verifyPaymentStatus
  ]);

  const handleDeleteArea = useCallback(async (areaId: string): Promise<boolean> => {
    console.log('🗑️ DELETE: Starting area deletion', areaId);
    
    toast.dismiss();
    
    const success = await deleteSpecificArea(areaId);
    
    if (success) {
      console.log('✅ DELETE: Success - validating removal');
      
      const isValidated = await validateBuzzDeletion();
      
      if (!isValidated) {
        console.error('❌ DELETE WARNING: Area might reappear');
        toast.warning('Area eliminata, ma potrebbero rimanere tracce');
      } else {
        toast.success('✅ Area eliminata definitivamente');
      }
      
      await forceCompleteSync();
      await forceReload();
    } else {
      console.error('❌ DELETE: Failed');
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
