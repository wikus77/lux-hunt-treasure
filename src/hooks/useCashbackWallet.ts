// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION Cashback Vault™ - React Hook
// Gestisce il wallet cashback dell'utente

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { 
  M1SSION_ENABLE_CASHBACK, 
  CASHBACK_RATES_BY_TIER,
  calculateCashbackM1U 
} from '@/config/cashbackConfig';
import { normalizeTier, UserTier } from '@/config/tierLimits';

interface CashbackWallet {
  accumulatedM1U: number;
  lifetimeEarnedM1U: number;
  canClaim: boolean;
  nextClaimAvailable: Date | null;
  isLoading: boolean;
  error: string | null;
  accrueFromBuzz: (params: { costEur: number; tier?: UserTier }) => Promise<void>;
  accrueFromBuzzMap: (params: { costEur: number; tier?: UserTier }) => Promise<void>;
  accrueFromAion: (params: { costEur: number; tier?: UserTier }) => Promise<void>;
  claimCashback: () => Promise<{ credited_m1u: number; new_balance: number } | null>;
  refresh: () => Promise<void>;
}

/**
 * Hook per gestire il M1SSION Cashback Vault™
 * 
 * Se M1SSION_ENABLE_CASHBACK è false, restituisce una versione no-op
 * che non effettua chiamate al backend.
 */
export function useCashbackWallet(): CashbackWallet {
  const { user, isLoading: authLoading } = useAuthContext();
  const [accumulatedM1U, setAccumulatedM1U] = useState(0);
  const [lifetimeEarnedM1U, setLifetimeEarnedM1U] = useState(0);
  const [lastClaimAt, setLastClaimAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🔥 FIX: Start as loading
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<UserTier>('base');

  // ========================================================================
  // NO-OP MODE: Se cashback è disabilitato, restituisci stub vuoti
  // ========================================================================
  if (!M1SSION_ENABLE_CASHBACK) {
    return {
      accumulatedM1U: 0,
      lifetimeEarnedM1U: 0,
      canClaim: false,
      nextClaimAvailable: null,
      isLoading: false,
      error: null,
      accrueFromBuzz: async () => { /* no-op */ },
      accrueFromBuzzMap: async () => { /* no-op */ },
      accrueFromAion: async () => { /* no-op */ },
      claimCashback: async () => null,
      refresh: async () => { /* no-op */ },
    };
  }

  // ========================================================================
  // ACTIVE MODE: Logica reale quando cashback è abilitato
  // ========================================================================

  // 🔥 FIX: Claim disponibile SOLO LA DOMENICA (1 volta a settimana)
  const now = new Date();
  const isSunday = now.getDay() === 0; // 0 = Domenica
  
  // Calcola se può fare claim:
  // 1. Deve avere cashback accumulato
  // 2. Deve essere DOMENICA
  // 3. Non deve aver già fatto claim questa settimana (7 giorni dall'ultimo)
  const canClaim = accumulatedM1U > 0 && isSunday && (
    lastClaimAt === null || 
    now.getTime() - lastClaimAt.getTime() >= 7 * 24 * 60 * 60 * 1000
  );

  // Calcola prossima domenica disponibile per claim
  const getNextSunday = (): Date => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; // Se oggi è domenica, prossima è tra 7 giorni
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday;
  };

  // Se ha già fatto claim questa settimana, prossima domenica
  // Altrimenti, se non è domenica, prossima domenica
  const nextClaimAvailable = lastClaimAt && (now.getTime() - lastClaimAt.getTime() < 7 * 24 * 60 * 60 * 1000)
    ? getNextSunday()
    : !isSunday 
      ? getNextSunday()
      : null;

  // Carica dati wallet
  const loadWallet = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Carica wallet
      const { data: wallet, error: walletError } = await supabase
        .from('user_cashback_wallet')
        .select('accumulated_m1u, lifetime_earned_m1u, last_claim_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError && walletError.code !== 'PGRST116') {
        console.error('[useCashbackWallet] Error loading wallet:', walletError);
        setError('Errore caricamento wallet');
        return;
      }

      if (wallet) {
        setAccumulatedM1U(wallet.accumulated_m1u || 0);
        setLifetimeEarnedM1U(wallet.lifetime_earned_m1u || 0);
        setLastClaimAt(wallet.last_claim_at ? new Date(wallet.last_claim_at) : null);
      }

      // Carica tier utente
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subData?.tier) {
        setUserTier(normalizeTier(subData.tier));
      }

    } catch (err: any) {
      console.error('[useCashbackWallet] Exception:', err);
      setError('Errore imprevisto');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Carica wallet al mount
  // 🔥 FIX: Wait for auth to finish loading before fetching
  useEffect(() => {
    if (authLoading) {
      console.log('[useCashbackWallet] Waiting for auth...');
      return;
    }
    
    if (M1SSION_ENABLE_CASHBACK && user?.id) {
      console.log('[useCashbackWallet] User available, loading wallet...');
      loadWallet();
    } else if (!authLoading) {
      // Auth finished but no user - stop loading state
      setIsLoading(false);
    }
  }, [user?.id, authLoading, loadWallet]);

  // Accrue cashback generico
  const accrueInternal = useCallback(async (
    sourceType: 'buzz' | 'buzz_map' | 'aion',
    costEur: number,
    tier: UserTier
  ) => {
    if (!user?.id || costEur <= 0) return;

    const cashbackM1U = calculateCashbackM1U(costEur, tier);
    if (cashbackM1U <= 0) return;

    try {
      // Chiama RPC per accumulare cashback
      const { error: rpcError } = await supabase.rpc('accrue_cashback', {
        p_user_id: user.id,
        p_source_type: sourceType,
        p_source_cost_eur: costEur,
        p_cashback_m1u: cashbackM1U,
        p_tier_at_time: tier
      });

      if (rpcError) {
        console.error(`[useCashbackWallet] accrue ${sourceType} error:`, rpcError);
        return;
      }

      // Aggiorna stato locale
      setAccumulatedM1U(prev => prev + cashbackM1U);
      setLifetimeEarnedM1U(prev => prev + cashbackM1U);

      console.log(`[useCashbackWallet] ✅ Accrued ${cashbackM1U} M1U from ${sourceType}`);

      // 🔥 Emetti evento per aggiornare il pill cashback con animazione
      window.dispatchEvent(new CustomEvent('cashbackUpdated', {
        detail: { amount: cashbackM1U, source: sourceType }
      }));

    } catch (err: any) {
      console.error(`[useCashbackWallet] accrue ${sourceType} exception:`, err);
    }
  }, [user?.id]);

  // Accrue da BUZZ
  const accrueFromBuzz = useCallback(async (params: { costEur: number; tier?: UserTier }) => {
    await accrueInternal('buzz', params.costEur, params.tier || userTier);
  }, [accrueInternal, userTier]);

  // Accrue da BUZZ MAP
  const accrueFromBuzzMap = useCallback(async (params: { costEur: number; tier?: UserTier }) => {
    await accrueInternal('buzz_map', params.costEur, params.tier || userTier);
  }, [accrueInternal, userTier]);

  // Accrue da AION
  const accrueFromAion = useCallback(async (params: { costEur: number; tier?: UserTier }) => {
    await accrueInternal('aion', params.costEur, params.tier || userTier);
  }, [accrueInternal, userTier]);

  // Claim cashback
  const claimCashback = useCallback(async (): Promise<{ credited_m1u: number; new_balance: number } | null> => {
    if (!user?.id || !canClaim) return null;

    setIsLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        setError('Sessione scaduta');
        return null;
      }

      const response = await supabase.functions.invoke('cashback-claim', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.error) {
        console.error('[useCashbackWallet] Claim error:', response.error);
        setError(response.error.message || 'Errore nel claim');
        return null;
      }

      const result = response.data;

      // Aggiorna stato locale
      setAccumulatedM1U(0);
      setLastClaimAt(new Date());

      // Trigger refresh M1U pill
      window.dispatchEvent(new CustomEvent('m1u-balance-updated'));

      console.log(`[useCashbackWallet] ✅ Claimed ${result.credited_m1u} M1U`);

      return {
        credited_m1u: result.credited_m1u,
        new_balance: result.new_balance
      };

    } catch (err: any) {
      console.error('[useCashbackWallet] Claim exception:', err);
      setError('Errore imprevisto nel claim');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, canClaim]);

  return {
    accumulatedM1U,
    lifetimeEarnedM1U,
    canClaim,
    nextClaimAvailable,
    isLoading,
    error,
    accrueFromBuzz,
    accrueFromBuzzMap,
    accrueFromAion,
    claimCashback,
    refresh: loadWallet,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

