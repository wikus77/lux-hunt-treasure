// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Tier BUZZ MAP Monthly Limits Hook
// Gestisce i limiti BUZZ MAP mensili basati sul tier abbonamento

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { BUZZMAP_MONTHLY_LIMIT_BY_TIER, normalizeTier, UserTier, canUseBuzzMap } from '@/config/tierLimits';

interface TierBuzzMapState {
  // Stato caricamento
  isLoading: boolean;
  error: string | null;
  
  // Dati tier
  userTier: UserTier;
  monthStart: string; // YYYY-MM-DD
  
  // Limiti e utilizzo
  monthlyLimit: number;
  buzzMapUsed: number;
  buzzMapRemaining: number;
  
  // Flags
  canUseTierBuzzMap: boolean;
  hasRemainingBuzzMap: boolean;
}

interface UseTierBuzzMapReturn extends TierBuzzMapState {
  // Actions
  consumeBuzzMap: () => Promise<boolean>;
  refreshState: () => Promise<void>;
}

/**
 * Calcola l'inizio del mese corrente
 */
const getMonthStart = (date: Date = new Date()): string => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Hook per gestire i BUZZ MAP mensili per tier
 * 
 * Limiti per tier:
 * - Free/Silver/Gold: 0 (non hanno BUZZ MAP incluso, devono pagare)
 * - Black: 1/mese
 * - Titanium: 2/mese
 */
export const useTierBuzzMapMonthly = (): UseTierBuzzMapReturn => {
  const { user } = useUnifiedAuth();
  
  const [state, setState] = useState<TierBuzzMapState>({
    isLoading: true,
    error: null,
    userTier: 'base',
    monthStart: getMonthStart(),
    monthlyLimit: 0,
    buzzMapUsed: 0,
    buzzMapRemaining: 0,
    canUseTierBuzzMap: false,
    hasRemainingBuzzMap: false,
  });

  /**
   * Carica il tier dell'utente dal profilo
   */
  const loadUserTier = useCallback(async (): Promise<UserTier> => {
    if (!user?.id) return 'base';
    
    try {
      // Prima prova subscriptions attive
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subData?.tier) {
        return normalizeTier(subData.tier);
      }
      
      // Fallback a profilo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_tier, tier')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileData?.subscription_tier) {
        return normalizeTier(profileData.subscription_tier);
      }
      if (profileData?.tier) {
        return normalizeTier(profileData.tier);
      }
      
      return 'base';
    } catch (err) {
      console.error('[useTierBuzzMapMonthly] Error loading user tier:', err);
      return 'base';
    }
  }, [user?.id]);

  /**
   * Carica o crea il record mensile dell'utente
   */
  const loadMonthlyState = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentMonthStart = getMonthStart();
      const userTier = await loadUserTier();
      const monthlyLimit = BUZZMAP_MONTHLY_LIMIT_BY_TIER[userTier];

      // Cerca record esistente per questo mese
      const { data: existingRecord, error: selectError } = await supabase
        .from('user_buzzmap_monthly')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_start', currentMonthStart)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let buzzMapUsed = 0;

      if (existingRecord) {
        buzzMapUsed = existingRecord.buzzmap_used || 0;
      }
      // Se non esiste, verrà creato al primo utilizzo

      const buzzMapRemaining = Math.max(0, monthlyLimit - buzzMapUsed);
      const canUseTierBuzzMap_ = canUseBuzzMap(userTier);
      const hasRemainingBuzzMap = buzzMapRemaining > 0;

      setState({
        isLoading: false,
        error: null,
        userTier,
        monthStart: currentMonthStart,
        monthlyLimit,
        buzzMapUsed,
        buzzMapRemaining,
        canUseTierBuzzMap: canUseTierBuzzMap_,
        hasRemainingBuzzMap,
      });

      console.log('📊 [useTierBuzzMapMonthly] State loaded:', {
        userTier,
        monthStart: currentMonthStart,
        monthlyLimit,
        buzzMapUsed,
        buzzMapRemaining,
        canUseTierBuzzMap: canUseTierBuzzMap_,
        hasRemainingBuzzMap,
      });

    } catch (err: any) {
      console.error('[useTierBuzzMapMonthly] Error loading monthly state:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Errore caricamento stato BUZZ MAP mensile',
      }));
    }
  }, [user?.id, loadUserTier]);

  /**
   * Consuma un BUZZ MAP mensile incluso nel tier
   * @returns true se consumato con successo, false altrimenti
   */
  const consumeBuzzMap = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('[useTierBuzzMapMonthly] No user ID');
      return false;
    }

    if (!state.canUseTierBuzzMap) {
      console.log('[useTierBuzzMapMonthly] Tier does not include BUZZ MAP:', state.userTier);
      return false;
    }

    if (!state.hasRemainingBuzzMap || state.buzzMapRemaining <= 0) {
      console.log('[useTierBuzzMapMonthly] No BUZZ MAP remaining this month');
      return false;
    }

    try {
      const currentMonthStart = getMonthStart();
      const newBuzzMapUsed = state.buzzMapUsed + 1;

      // Upsert: crea o aggiorna il record
      const { error: upsertError } = await supabase
        .from('user_buzzmap_monthly')
        .upsert({
          user_id: user.id,
          month_start: currentMonthStart,
          buzzmap_used: newBuzzMapUsed,
          tier_snapshot: state.userTier,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,month_start',
        });

      if (upsertError) {
        console.error('[useTierBuzzMapMonthly] Upsert error:', upsertError);
        throw upsertError;
      }

      // Aggiorna stato locale
      const newRemaining = Math.max(0, state.monthlyLimit - newBuzzMapUsed);
      setState(prev => ({
        ...prev,
        buzzMapUsed: newBuzzMapUsed,
        buzzMapRemaining: newRemaining,
        hasRemainingBuzzMap: newRemaining > 0,
      }));

      console.log('✅ [useTierBuzzMapMonthly] BUZZ MAP consumed:', {
        tier: state.userTier,
        used: newBuzzMapUsed,
        remaining: newRemaining,
        monthStart: currentMonthStart,
      });

      return true;

    } catch (err: any) {
      console.error('[useTierBuzzMapMonthly] Error consuming BUZZ MAP:', err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Errore consumo BUZZ MAP',
      }));
      return false;
    }
  }, [user?.id, state]);

  /**
   * Refresh manuale dello stato
   */
  const refreshState = useCallback(async () => {
    await loadMonthlyState();
  }, [loadMonthlyState]);

  // Carica stato iniziale
  useEffect(() => {
    loadMonthlyState();
  }, [loadMonthlyState]);

  return {
    ...state,
    consumeBuzzMap,
    refreshState,
  };
};

export default useTierBuzzMapMonthly;

