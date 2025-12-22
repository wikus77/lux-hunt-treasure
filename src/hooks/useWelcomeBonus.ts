// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hook: useWelcomeBonus
// Gestisce il bonus di benvenuto 500 M1U al primo login

import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';

export interface WelcomeBonusState {
  isLoading: boolean;
  needsBonus: boolean;
  isClaiming: boolean;
  claimed: boolean;
  error: string | null;
  amount: number;
  newBalance: number | null;
}

const WELCOME_BONUS_AMOUNT = 500;
const LOCAL_STORAGE_KEY = 'm1ssion_welcome_bonus_shown';

export const useWelcomeBonus = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [state, setState] = useState<WelcomeBonusState>({
    isLoading: true,
    needsBonus: false,
    isClaiming: false,
    claimed: false,
    error: null,
    amount: WELCOME_BONUS_AMOUNT,
    newBalance: null
  });

  // Check if user needs to receive the welcome bonus
  useEffect(() => {
    const checkBonusStatus = async () => {
      if (!isAuthenticated || !user?.id) {
        setState(prev => ({ ...prev, isLoading: false, needsBonus: false }));
        return;
      }

      try {
        // First check localStorage to avoid unnecessary DB calls
        const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
        const locallyShown = localStorage.getItem(localKey);
        
        if (locallyShown === 'claimed') {
          setState(prev => ({ ...prev, isLoading: false, needsBonus: false, claimed: true }));
          return;
        }

        // Check database for welcome_bonus_claimed status
        // Nota: la colonna potrebbe non esistere ancora, gestiamo gracefully
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('welcome_bonus_claimed, first_login_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn('[WelcomeBonus] Error fetching profile (colonna potrebbe non esistere):', error);
          // Se la colonna non esiste, assume che l'utente debba ricevere il bonus
          // La colonna sarà creata al primo claim
          if (locallyShown !== 'shown' && locallyShown !== 'claimed') {
            setState(prev => ({ ...prev, isLoading: false, needsBonus: true }));
            return;
          }
          setState(prev => ({ ...prev, isLoading: false, needsBonus: false }));
          return;
        }

        // User needs bonus if:
        // 1. welcome_bonus_claimed is false/null
        // 2. They haven't seen it this session (localStorage)
        const needsBonus = (profile?.welcome_bonus_claimed !== true) && locallyShown !== 'shown' && locallyShown !== 'claimed';
        
        console.log('[WelcomeBonus] Status check:', {
          userId: user.id.substring(0, 8) + '...',
          welcomeBonusClaimed: profile?.welcome_bonus_claimed,
          needsBonus
        });

        setState(prev => ({
          ...prev,
          isLoading: false,
          needsBonus,
          claimed: !!profile?.welcome_bonus_claimed
        }));

      } catch (err) {
        console.error('[WelcomeBonus] Unexpected error:', err);
        setState(prev => ({ ...prev, isLoading: false, needsBonus: false }));
      }
    };

    checkBonusStatus();
  }, [isAuthenticated, user?.id]);

  // Claim the welcome bonus
  const claimBonus = useCallback(async (): Promise<boolean> => {
    if (!user?.id || state.claimed || state.isClaiming) {
      return false;
    }

    setState(prev => ({ ...prev, isClaiming: true, error: null }));

    try {
      console.log('[WelcomeBonus] 🎁 Claiming welcome bonus...');
      
      // Call Edge Function to claim bonus
      const { data, error } = await supabase.functions.invoke('claim-welcome-bonus', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) {
        console.error('[WelcomeBonus] ❌ Claim error (Edge Function potrebbe non esistere):', error);
        // Anche in caso di errore, salviamo in localStorage per evitare loop
        const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
        localStorage.setItem(localKey, 'shown');
        
        setState(prev => ({
          ...prev,
          isClaiming: false,
          needsBonus: false,
          error: 'Bonus temporaneamente non disponibile'
        }));
        return true; // Return true comunque per permettere la chiusura del modal
      }

      if (!data?.success) {
        // Check if already claimed (not an error, just skip)
        if (data?.alreadyClaimed) {
          console.log('[WelcomeBonus] ⚠️ Already claimed');
          const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
          localStorage.setItem(localKey, 'claimed');
          setState(prev => ({
            ...prev,
            isClaiming: false,
            claimed: true,
            needsBonus: false
          }));
          return true; // Still return true to close modal
        }
        
        // Anche in caso di errore, salviamo in localStorage per evitare loop
        console.warn('[WelcomeBonus] ⚠️ Claim failed but marking as shown locally:', data?.message);
        const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
        localStorage.setItem(localKey, 'shown');
        
        setState(prev => ({
          ...prev,
          isClaiming: false,
          needsBonus: false,
          error: data?.message || 'Errore sconosciuto'
        }));
        return true; // Return true comunque per chiudere il modal
      }

      console.log('[WelcomeBonus] ✅ Bonus claimed successfully!', data);

      // Mark as claimed locally
      const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
      localStorage.setItem(localKey, 'claimed');

      // Dispatch event for slot machine animation in M1UPill
      window.dispatchEvent(new CustomEvent('m1u-credited', {
        detail: { amount: WELCOME_BONUS_AMOUNT }
      }));

      setState(prev => ({
        ...prev,
        isClaiming: false,
        claimed: true,
        needsBonus: false,
        newBalance: data.newBalance
      }));

      return true;

    } catch (err) {
      console.error('[WelcomeBonus] ❌ Unexpected error:', err);
      setState(prev => ({
        ...prev,
        isClaiming: false,
        error: 'Errore di connessione'
      }));
      return false;
    }
  }, [user?.id, state.claimed, state.isClaiming]);

  // Dismiss without claiming (for testing or skip)
  const dismiss = useCallback(() => {
    if (user?.id) {
      const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
      localStorage.setItem(localKey, 'shown');
    }
    setState(prev => ({ ...prev, needsBonus: false }));
  }, [user?.id]);

  // Reset for testing
  const resetForTesting = useCallback(() => {
    if (user?.id) {
      const localKey = `${LOCAL_STORAGE_KEY}:${user.id}`;
      localStorage.removeItem(localKey);
    }
    setState({
      isLoading: false,
      needsBonus: true,
      isClaiming: false,
      claimed: false,
      error: null,
      amount: WELCOME_BONUS_AMOUNT,
      newBalance: null
    });
  }, [user?.id]);

  return {
    ...state,
    claimBonus,
    dismiss,
    resetForTesting,
    WELCOME_BONUS_AMOUNT
  };
};

export default useWelcomeBonus;

