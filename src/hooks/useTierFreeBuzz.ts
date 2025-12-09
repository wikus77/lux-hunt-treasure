// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Tier Free BUZZ Hook
// Gestisce i BUZZ gratuiti settimanali basati sul tier abbonamento

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { FREE_BUZZ_WEEKLY_BY_TIER, normalizeTier, UserTier } from '@/config/tierLimits';

interface TierFreeBuzzState {
  // Stato caricamento
  isLoading: boolean;
  error: string | null;
  
  // Dati tier
  userTier: UserTier;
  weekStart: string; // YYYY-MM-DD
  
  // Limiti e utilizzo
  weeklyLimit: number;
  freeBuzzUsed: number;
  freeBuzzRemaining: number;
  
  // Flags
  hasFreeBuzz: boolean;
  canUseFreeBuzz: boolean;
}

interface UseTierFreeBuzzReturn extends TierFreeBuzzState {
  // Actions
  consumeFreeBuzz: () => Promise<boolean>;
  refreshState: () => Promise<void>;
}

/**
 * Calcola l'inizio della settimana corrente (Lunedì)
 */
const getWeekStart = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunedì
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Hook per gestire i BUZZ gratuiti settimanali per tier
 * 
 * IMPORTANTE: Questo hook è SEPARATO da useBuzzGrants che gestisce
 * i BUZZ da premi (marker, XP, etc.)
 * 
 * Priorità BUZZ quando l'utente preme il tasto:
 * 1. useTierFreeBuzz (BUZZ gratuiti settimanali per tier) ← QUESTO HOOK
 * 2. useBuzzGrants (BUZZ da premi)
 * 3. Pricing progressivo (M1U)
 */
export const useTierFreeBuzz = (): UseTierFreeBuzzReturn => {
  const { user } = useUnifiedAuth();
  
  const [state, setState] = useState<TierFreeBuzzState>({
    isLoading: true,
    error: null,
    userTier: 'base',
    weekStart: getWeekStart(),
    weeklyLimit: 1,
    freeBuzzUsed: 0,
    freeBuzzRemaining: 1,
    hasFreeBuzz: true,
    canUseFreeBuzz: true,
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
      console.error('[useTierFreeBuzz] Error loading user tier:', err);
      return 'base';
    }
  }, [user?.id]);

  /**
   * Carica o crea il record settimanale dell'utente
   */
  const loadWeeklyState = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentWeekStart = getWeekStart();
      const userTier = await loadUserTier();
      const weeklyLimit = FREE_BUZZ_WEEKLY_BY_TIER[userTier];

      // Cerca record esistente per questa settimana
      const { data: existingRecord, error: selectError } = await supabase
        .from('user_buzz_weekly')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', currentWeekStart)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let freeBuzzUsed = 0;

      if (existingRecord) {
        freeBuzzUsed = existingRecord.free_buzz_used || 0;
      }
      // Se non esiste, verrà creato al primo utilizzo

      const freeBuzzRemaining = Math.max(0, weeklyLimit - freeBuzzUsed);
      const hasFreeBuzz = freeBuzzRemaining > 0;

      setState({
        isLoading: false,
        error: null,
        userTier,
        weekStart: currentWeekStart,
        weeklyLimit,
        freeBuzzUsed,
        freeBuzzRemaining,
        hasFreeBuzz,
        canUseFreeBuzz: hasFreeBuzz,
      });

      console.log('📊 [useTierFreeBuzz] State loaded:', {
        userTier,
        weekStart: currentWeekStart,
        weeklyLimit,
        freeBuzzUsed,
        freeBuzzRemaining,
        hasFreeBuzz,
      });

    } catch (err: any) {
      console.error('[useTierFreeBuzz] Error loading weekly state:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Errore caricamento stato BUZZ settimanale',
      }));
    }
  }, [user?.id, loadUserTier]);

  /**
   * Consuma un BUZZ gratuito settimanale
   * @returns true se consumato con successo, false altrimenti
   */
  const consumeFreeBuzz = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('[useTierFreeBuzz] No user ID');
      return false;
    }

    if (!state.canUseFreeBuzz || state.freeBuzzRemaining <= 0) {
      console.log('[useTierFreeBuzz] No free BUZZ available');
      return false;
    }

    try {
      const currentWeekStart = getWeekStart();
      const newFreeBuzzUsed = state.freeBuzzUsed + 1;

      // Upsert: crea o aggiorna il record
      const { error: upsertError } = await supabase
        .from('user_buzz_weekly')
        .upsert({
          user_id: user.id,
          week_start: currentWeekStart,
          free_buzz_used: newFreeBuzzUsed,
          tier_snapshot: state.userTier,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,week_start',
        });

      if (upsertError) {
        console.error('[useTierFreeBuzz] Upsert error:', upsertError);
        throw upsertError;
      }

      // Aggiorna stato locale
      const newRemaining = Math.max(0, state.weeklyLimit - newFreeBuzzUsed);
      setState(prev => ({
        ...prev,
        freeBuzzUsed: newFreeBuzzUsed,
        freeBuzzRemaining: newRemaining,
        hasFreeBuzz: newRemaining > 0,
        canUseFreeBuzz: newRemaining > 0,
      }));

      console.log('✅ [useTierFreeBuzz] Free BUZZ consumed:', {
        tier: state.userTier,
        used: newFreeBuzzUsed,
        remaining: newRemaining,
        weekStart: currentWeekStart,
      });

      return true;

    } catch (err: any) {
      console.error('[useTierFreeBuzz] Error consuming free BUZZ:', err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Errore consumo BUZZ gratuito',
      }));
      return false;
    }
  }, [user?.id, state]);

  /**
   * Refresh manuale dello stato
   */
  const refreshState = useCallback(async () => {
    await loadWeeklyState();
  }, [loadWeeklyState]);

  // Carica stato iniziale
  useEffect(() => {
    loadWeeklyState();
  }, [loadWeeklyState]);

  return {
    ...state,
    consumeFreeBuzz,
    refreshState,
  };
};

export default useTierFreeBuzz;


