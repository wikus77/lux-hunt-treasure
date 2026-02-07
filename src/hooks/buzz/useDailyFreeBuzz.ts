// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// useDailyFreeBuzz - Unified daily free BUZZ gate
// 1 FREE BUZZ PER DAY regardless of tier/grants source

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface DailyFreeBuzzState {
  isLoading: boolean;
  error: string | null;
  dailyFreeAvailable: boolean;
  dateLocal: string; // YYYY-MM-DD Europe/Rome
}

interface UseDailyFreeBuzzReturn extends DailyFreeBuzzState {
  checkDailyFree: () => Promise<boolean>;
  markDailyFreeUsed: (source: 'tier' | 'grant') => Promise<boolean>;
  refreshState: () => Promise<void>;
}

/**
 * Get today's date in Europe/Rome timezone (YYYY-MM-DD)
 */
const getTodayRome = (): string => {
  const now = new Date();
  // Use Intl API for accurate timezone conversion
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // Returns YYYY-MM-DD
};

/**
 * Hook for managing unified daily free BUZZ gate
 * 
 * RULE: 1 FREE BUZZ PER DAY, regardless of source (tier or grants)
 * 
 * After the first free BUZZ of the day (from any source), 
 * all subsequent BUZZ require M1U payment.
 */
export const useDailyFreeBuzz = (): UseDailyFreeBuzzReturn => {
  const { user } = useUnifiedAuth();
  
  // In-flight guards
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 2000;
  
  const [state, setState] = useState<DailyFreeBuzzState>({
    isLoading: true,
    error: null,
    dailyFreeAvailable: true, // Default optimistic
    dateLocal: getTodayRome()
  });

  /**
   * Check if daily free is available (via RPC or direct query)
   */
  const checkDailyFree = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.log('[useDailyFreeBuzz] No user, assuming free available');
      return true;
    }

    try {
      const today = getTodayRome();
      
      // Try RPC first (more efficient)
      const { data: available, error: rpcError } = await supabase.rpc(
        'has_daily_free_buzz_available',
        { p_user_id: user.id }
      );

      if (!rpcError && typeof available === 'boolean') {
        console.log('[useDailyFreeBuzz] RPC check:', { today, available });
        return available;
      }

      // Fallback to direct query
      console.log('[useDailyFreeBuzz] RPC failed, using direct query');
      const { data: record, error: queryError } = await supabase
        .from('user_daily_free_buzz')
        .select('free_used')
        .eq('user_id', user.id)
        .eq('date_local', today)
        .maybeSingle();

      if (queryError && queryError.code !== 'PGRST116') {
        console.error('[useDailyFreeBuzz] Query error:', queryError);
        return true; // Fail open
      }

      // If no record exists → free available
      // If record exists with free_used=true → NOT available
      const freeAvailable = !record || !record.free_used;
      console.log('[useDailyFreeBuzz] Direct query result:', { today, record, freeAvailable });
      return freeAvailable;

    } catch (err) {
      console.error('[useDailyFreeBuzz] checkDailyFree error:', err);
      return true; // Fail open to avoid blocking users
    }
  }, [user?.id]);

  /**
   * Mark daily free as used
   * Called AFTER successful consumption of a free BUZZ
   */
  const markDailyFreeUsed = useCallback(async (source: 'tier' | 'grant'): Promise<boolean> => {
    if (!user?.id) {
      console.error('[useDailyFreeBuzz] Cannot mark used: no user');
      return false;
    }

    try {
      const today = getTodayRome();

      // Try RPC first
      const { data: success, error: rpcError } = await supabase.rpc(
        'mark_daily_free_buzz_used',
        { p_user_id: user.id, p_source: source }
      );

      if (!rpcError && success === true) {
        console.log('[useDailyFreeBuzz] ✅ Marked daily free as used (RPC)', { today, source });
        setState(prev => ({ ...prev, dailyFreeAvailable: false }));
        return true;
      }

      // Fallback to direct upsert
      console.log('[useDailyFreeBuzz] RPC failed, using direct upsert');
      const { error: upsertError } = await supabase
        .from('user_daily_free_buzz')
        .upsert({
          user_id: user.id,
          date_local: today,
          free_used: true,
          source,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date_local'
        });

      if (upsertError) {
        console.error('[useDailyFreeBuzz] Upsert error:', upsertError);
        // Don't fail the BUZZ - just log
        if (import.meta.env.DEV) {
          console.warn('⚠️ [DEV] Failed to mark daily free used, but proceeding');
        }
        return false;
      }

      console.log('[useDailyFreeBuzz] ✅ Marked daily free as used (direct)', { today, source });
      setState(prev => ({ ...prev, dailyFreeAvailable: false }));
      return true;

    } catch (err) {
      console.error('[useDailyFreeBuzz] markDailyFreeUsed error:', err);
      // Don't fail the BUZZ flow - just log
      return false;
    }
  }, [user?.id]);

  /**
   * Refresh state from DB
   */
  const loadState = useCallback(async () => {
    const now = Date.now();
    if (isFetchingRef.current || now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const today = getTodayRome();
      const available = await checkDailyFree();

      setState({
        isLoading: false,
        error: null,
        dailyFreeAvailable: available,
        dateLocal: today
      });

      console.log('[useDailyFreeBuzz] State loaded:', { today, available });

    } catch (err: any) {
      console.error('[useDailyFreeBuzz] loadState error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Error loading daily free state'
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [checkDailyFree]);

  // Load on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadState();
    }
  }, [user?.id, loadState]);

  return {
    ...state,
    checkDailyFree,
    markDailyFreeUsed,
    refreshState: loadState
  };
};

export default useDailyFreeBuzz;
