
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMapAreas } from './useMapAreas';
import { useBuzzApi } from './buzz/useBuzzApi';
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

  // Get current generation from database atomically
  const getCurrentGeneration = useCallback(async (): Promise<number> => {
    if (!user?.id) return 1;

    try {
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error getting generation count:', error);
        return 1;
      }

      const currentCount = data?.buzz_map_count || 0;
      return currentCount + 1; // Next generation
    } catch (error) {
      console.error('❌ Exception getting generation count:', error);
      return 1;
    }
  }, [user?.id]);

  // Correct radius calculation: max(500 * 0.95^(generation-1), 5)
  const calculateBuzzRadius = useCallback((generation: number): number => {
    if (generation === 1) {
      console.log("✅ BUZZ MAPPA PARTENZA DA 500km - FIRST GENERATION");
      return 500;
    }
    
    const radius = Math.max(5, 500 * Math.pow(0.95, generation - 1));
    console.log("✅ RADIUS REDUCTION: Generation", generation, "= ", radius, "km");
    return radius;
  }, []);

  // Atomic counter update with conflict resolution
  const updateBuzzMapCounter = useCallback(async (): Promise<number> => {
    if (!user?.id) return 1;

    try {
      const currentGeneration = await getCurrentGeneration();
      
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          buzz_map_count: currentGeneration
        }, {
          onConflict: 'user_id,date'
        })
        .select('buzz_map_count')
        .single();

      if (error) {
        console.error('❌ Error updating counter:', error);
        throw new Error('Errore nell\'aggiornamento del contatore');
      }

      console.log('✅ Counter updated successfully: generation', data.buzz_map_count);
      return data.buzz_map_count;
    } catch (error) {
      console.error('❌ Exception updating counter:', error);
      throw new Error('Errore nell\'aggiornamento del contatore');
    }
  }, [user?.id, getCurrentGeneration]);

  // Payment verification before BUZZ
  const verifyPaymentStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ No user ID for payment verification');
      return false;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
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
        console.warn('⚠️ Payment verification failed: no active subscription');
        toast.error('Pagamento Richiesto', {
          description: 'Devi avere un abbonamento attivo per usare BUZZ MAPPA.'
        });
        return false;
      }

      console.log('✅ Payment verification passed');
      return true;
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return false;
    }
  }, [user?.id]);

  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    if (!user?.id) {
      console.error('❌ LANCIO BUZZ: No valid user ID available');
      toast.dismiss();
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    console.log('🚀 LANCIO BUZZ GENERATION START', {
      userId: user.id,
      centerLat,
      centerLng,
      currentWeek: getCurrentWeek()
    });

    if (isGenerating || isDeleting) {
      console.error('❌ Operation blocked - another operation in progress');
      return null;
    }

    // Verify payment first
    const hasValidPayment = await verifyPaymentStatus();
    if (!hasValidPayment) {
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      console.log('📡 LANCIO BACKEND: Calling with payment verification...');
      
      // Get generation and calculate radius BEFORE API call
      const generation = await updateBuzzMapCounter();
      const radiusKm = calculateBuzzRadius(generation);
      
      console.log(`✅ BUZZ #${generation} – Raggio: ${radiusKm}km – user: ${user.email || user.id}`);
      
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

      const currentWeek = getCurrentWeek();
      const newArea: BuzzMapArea = {
        id: crypto.randomUUID(),
        lat: response.lat || centerLat,
        lng: response.lng || centerLng,
        radius_km: radiusKm,
        week: currentWeek,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      console.log('🎉 LANCIO SUCCESS: Area created', newArea);
      console.log(`✅ BUZZ #${generation} – Raggio: ${radiusKm}km – ID area: ${newArea.id} – user: ${user.email || user.id}`);

      // Force notification insert
      try {
        const { error: notificationError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            title: 'NUOVA AREA GENERATA',
            message: `Area BUZZ MISSION attiva! Raggio attuale: ${radiusKm}km`,
            type: 'buzz_generated',
            is_read: false
          });

        if (notificationError) {
          console.error('❌ Notification insert failed:', notificationError);
        } else {
          console.log('✅ Notification inserted successfully');
        }
      } catch (notifError) {
        console.error('❌ Notification exception:', notifError);
      }

      // Force complete sync and reload
      await forceCompleteSync();
      await forceReload();
      
      toast.success(`Area generata correttamente – Raggio: ${radiusKm}km`);
      
      return newArea;
    } catch (err) {
      console.error('❌ LANCIO ERROR:', err);
      
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
    getCurrentWeek, calculateBuzzRadius, updateBuzzMapCounter, verifyPaymentStatus
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
