// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

interface DailySpinStatus {
  hasPlayedToday: boolean;
  canPlay: boolean;
  todaysResult?: {
    prize: string;
    rotation_deg: number;
    played_at: string;
  } | null;
}

export const useDailySpinCheck = () => {
  const [spinStatus, setSpinStatus] = useState<DailySpinStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useUnifiedAuth();

  const checkDailySpinStatus = async () => {
    if (!user || !session) {
      setIsLoading(false);
      setSpinStatus({ hasPlayedToday: false, canPlay: false });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 🔥 FALLBACK DIRETTO AL DATABASE - No Edge Function per prevenire loop
      const today = new Date().toISOString().split('T')[0];
      
      // Check localStorage first for immediate response
      const localSpinKey = `daily_spin_${user.id}_${today}`;
      const hasPlayedLocalStorage = localStorage.getItem(localSpinKey);
      
      // Check database for today's spin
      const { data: spinLogs, error: dbError } = await supabase
        .from('daily_spin_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw dbError;
      }

      const hasPlayedToday = !!spinLogs || !!hasPlayedLocalStorage;
      const canPlay = user && session && !hasPlayedToday;

      const result: DailySpinStatus = {
        hasPlayedToday,
        canPlay,
        todaysResult: spinLogs ? {
          prize: spinLogs.prize,
          rotation_deg: spinLogs.rotation_deg,
          played_at: spinLogs.created_at
        } : null
      };

      setSpinStatus(result);
      console.log('🎰 Daily Spin Status (Direct DB):', result);

    } catch (err) {
      console.error('❌ Errore check daily spin:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      
      // 🔥 EMERGENCY FALLBACK - Set safe defaults to prevent infinite loop
      setSpinStatus({ hasPlayedToday: false, canPlay: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDailySpinStatus();
  }, [user, session]);

  return {
    spinStatus,
    isLoading,
    error,
    refetch: checkDailySpinStatus,
  };
};