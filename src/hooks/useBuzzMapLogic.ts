
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

  // Get current generation from database
  const getCurrentGeneration = useCallback(async (): Promise<number> => {
    if (!user?.id) return 1;

    try {
      console.log(`🔥 BUZZ MAPPA: Getting generation from DB for user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ BUZZ MAPPA ERROR - Error getting generation count:', error);
        return 1;
      }

      const currentCount = data?.buzz_map_count || 0;
      const nextGeneration = currentCount + 1;
      
      console.log(`🔥 BUZZ MAPPA: Generation from DB: current=${currentCount}, next=${nextGeneration}`);
      return nextGeneration;
    } catch (error) {
      console.error('❌ BUZZ MAPPA ERROR - Exception getting generation count:', error);
      return 1;
    }
  }, [user?.id]);

  // Calculate radius: max(500 * 0.95^(generation-1), 5)
  const calculateBuzzRadius = useCallback(async (): Promise<{ radius: number; generation: number }> => {
    const generation = await getCurrentGeneration();
    
    let radius;
    if (generation === 1) {
      radius = 500;
      console.log("🔥 BUZZ MAPPA: First generation = 500km");
    } else {
      radius = Math.max(5, 500 * Math.pow(0.95, generation - 1));
      console.log(`🔥 BUZZ MAPPA: Radius calculation: Generation ${generation} = ${radius}km`);
    }
    
    return { radius, generation };
  }, [getCurrentGeneration]);

  // 1. Verify subscription status
  const verifySubscriptionStatus = useCallback(async (): Promise<{ hasActive: boolean; plan: string }> => {
    if (!user?.id) {
      console.error('❌ ERRORE: Nessun utente rilevato');
      return { hasActive: false, plan: 'Free' };
    }

    try {
      console.log(`🔥 BUZZ MAPPA: Verifying subscription for user: ${user.id}`);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ ERRORE: Error fetching profile:', profileError);
        return { hasActive: false, plan: 'Free' };
      }

      // Developer bypass
      if (profile?.email === 'wikus77@hotmail.it') {
        console.log('🔧 BUZZ MAPPA: Developer user - bypassing subscription check');
        return { hasActive: true, plan: 'Black' };
      }

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('status, tier, end_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const hasActiveSubscription = subscription && 
        new Date(subscription.end_date || '') > new Date();

      if (!hasActiveSubscription && (!profile?.stripe_customer_id || profile?.subscription_tier === 'Free')) {
        console.error('❌ ERRORE: Nessun piano attivo');
        return { hasActive: false, plan: profile?.subscription_tier || 'Free' };
      }

      console.log('✅ BUZZ MAPPA: Subscription verified');
      return { hasActive: true, plan: subscription?.tier || profile?.subscription_tier || 'Free' };
    } catch (error) {
      console.error('❌ ERRORE: Subscription verification failed:', error);
      return { hasActive: false, plan: 'Free' };
    }
  }, [user?.id]);

  // 2. Check BUZZ limits
  const checkBuzzLimits = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      console.log(`🔥 BUZZ MAPPA: Checking BUZZ limits for user: ${user.id}`);
      
      // Check daily counter
      const { data: dailyCounter, error: dailyError } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      const dailyBuzzCount = dailyCounter?.buzz_count || 0;
      
      // Check weekly allowance
      const { data: weeklyAllowance, error: weeklyError } = await supabase
        .from('weekly_buzz_allowances')
        .select('max_buzz_count, used_buzz_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const weeklyLimit = weeklyAllowance?.max_buzz_count || 1;
      const weeklyUsed = weeklyAllowance?.used_buzz_count || 0;

      console.log(`🔥 BUZZ MAPPA: Daily: ${dailyBuzzCount}/50, Weekly: ${weeklyUsed}/${weeklyLimit}`);

      if (dailyBuzzCount >= 50) {
        console.error('❌ ERRORE: Limite giornaliero BUZZ raggiunto');
        toast.error('Limite giornaliero BUZZ raggiunto');
        return false;
      }

      if (weeklyUsed >= weeklyLimit) {
        console.error('❌ ERRORE: Limite settimanale BUZZ raggiunto');
        toast.error('Limite settimanale BUZZ raggiunto');
        return false;
      }

      console.log('✅ BUZZ MAPPA: BUZZ limits OK');
      return true;
    } catch (error) {
      console.error('❌ ERRORE: BUZZ limits check failed:', error);
      return false;
    }
  }, [user?.id]);

  const generateBuzzMapArea = useCallback(async (centerLat: number, centerLng: number): Promise<BuzzMapArea | null> => {
    console.log('🔥 BUZZ START');
    console.log(`USER: ${user?.id}`);
    
    if (!user?.id) {
      console.error('❌ ERRORE: Nessun utente rilevato');
      toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
      return null;
    }

    if (isGenerating || isDeleting) {
      console.error('❌ ERRORE: Operation blocked - another operation in progress');
      return null;
    }

    setIsGenerating(true);
    toast.dismiss();
    
    try {
      // 1. Verify subscription
      const { hasActive, plan } = await verifySubscriptionStatus();
      console.log(`PLAN: ${plan}`);
      
      if (!hasActive) {
        console.error('❌ ERRORE: Nessun piano attivo');
        toast.error('Abbonamento richiesto per BUZZ MAPPA');
        return null;
      }

      // 2. Check BUZZ limits
      const canUseBuzz = await checkBuzzLimits();
      if (!canUseBuzz) {
        return null; // Error already toasted
      }

      // 3. Calculate radius
      const { radius: radiusKm, generation } = await calculateBuzzRadius();
      console.log(`RAGGIO USATO: ${radiusKm}km`);

      // 4. Generate area via backend
      console.log('📡 BUZZ MAPPA: Calling backend for area generation...');
      
      const response = await callBuzzApi({ 
        userId: user.id,
        generateMap: true,
        coordinates: { lat: centerLat, lng: centerLng }
      });
      
      console.log('📊 BUZZ MAPPA: Backend response:', response);
      
      if (!response.success || response.error) {
        console.error('❌ ERRORE GENERAZIONE:', response.errorMessage || response.error);
        console.log('INSERIMENTO AREA: FAIL');
        toast.error(`Errore generazione area BUZZ: ${response.errorMessage || 'Errore sconosciuto'}`);
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

      console.log('INSERIMENTO AREA: SUCCESS');
      console.log(`✅ BUZZ #${generation} – Raggio: ${newArea.radius_km}km – ID area: ${newArea.id} – user: ${user.email || user.id}`);

      // 5. Send notification
      try {
        console.log('📬 BUZZ MAPPA: Sending notification...');
        
        const { data: notificationData, error: notificationError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            title: "Area BUZZ generata",
            message: "Hai sbloccato una nuova zona di ricerca.",
            type: "buzz",
            is_read: false
          })
          .select('id')
          .single();

        if (notificationError) {
          console.error('❌ BUZZ MAPPA: Notification error:', notificationError);
          console.log('INSERIMENTO NOTIFICA: FAIL');
        } else {
          console.log('NOTIFICA INSERITA');
          console.log('INSERIMENTO NOTIFICA: SUCCESS');
        }
      } catch (notifError) {
        console.error('❌ ERRORE: Notification failed:', notifError);
        console.log('INSERIMENTO NOTIFICA: FAIL');
      }

      // Force reload areas to sync with database
      await forceCompleteSync();
      await forceReload();
      
      toast.success(`Area generata correttamente – Raggio: ${newArea.radius_km}km`);
      
      return newArea;
    } catch (err) {
      console.error('❌ ERRORE GENERAZIONE:', err instanceof Error ? err.message : String(err));
      console.log('INSERIMENTO AREA: FAIL');
      console.log('INSERIMENTO NOTIFICA: FAIL');
      
      toast.error(`Errore generazione area BUZZ: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [
    user, callBuzzApi, isGenerating, isDeleting, 
    setIsGenerating, forceCompleteSync, forceReload,
    getCurrentWeek, calculateBuzzRadius, verifySubscriptionStatus, checkBuzzLimits
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
