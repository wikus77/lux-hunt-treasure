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
    console.log('[SPIN-STATUS] Starting check', { hasUser: !!user, hasSession: !!session });
    
    if (!user || !session) {
      console.log('[SPIN-STATUS] No user/session - setting safe defaults');
      setSpinStatus({ hasPlayedToday: false, canPlay: false });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 🔥 CONTROLLO IMMEDIATO localStorage per prevenire race conditions
      const today = new Date().toISOString().split('T')[0];
      const localSpinKey = `daily_spin_${user.id}_${today}`;
      const hasPlayedLocalStorage = localStorage.getItem(localSpinKey);
      
      console.log('[SPIN-STATUS] localStorage check:', { key: localSpinKey, hasPlayed: !!hasPlayedLocalStorage });

      // 🔥 DOPPIO CONTROLLO: Database + Edge Function con TIMEOUT
      let dbSpinLog = null;
      let edgeFunctionResult = null;

      // Controllo database diretto
      const { data: spinLog, error: dbError } = await supabase
        .from('daily_spin_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (!dbError) {
        dbSpinLog = spinLog;
        console.log('[SPIN-STATUS] Database check:', { hasSpinLog: !!dbSpinLog });
      }

      // Edge function con timeout gestito tramite Promise.race
      try {
        const edgeFunctionPromise = supabase.functions.invoke(
          'check-daily-spin',
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          }
        );

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Edge function timeout')), 3000)
        );

        const { data: edgeData, error: functionError } = await Promise.race([
          edgeFunctionPromise,
          timeoutPromise
        ]) as any;
        
        if (!functionError) {
          edgeFunctionResult = edgeData;
          console.log('[SPIN-STATUS] Edge function result:', edgeFunctionResult);
        }
      } catch (edgeError) {
        console.warn('[SPIN-STATUS] Edge function failed/timeout:', edgeError);
      }

      // 🔥 LOGICA DETERMINISTICA: Se uno qualsiasi dice che ha giocato, allora ha giocato
      const hasPlayedToday = !!hasPlayedLocalStorage || !!dbSpinLog || !!edgeFunctionResult?.hasPlayedToday;
      const canPlay = !hasPlayedToday && !!user && !!session;

      const result: DailySpinStatus = {
        hasPlayedToday,
        canPlay,
        todaysResult: dbSpinLog ? {
          prize: dbSpinLog.prize,
          rotation_deg: dbSpinLog.rotation_deg,
          played_at: dbSpinLog.created_at
        } : edgeFunctionResult?.todaysResult || null
      };

      console.log('[SPIN-STATUS] Final result:', result);
      setSpinStatus(result);

    } catch (err) {
      console.error('[SPIN-STATUS] Error:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      
      // 🔥 EMERGENCY FALLBACK - SEMPRE valori sicuri per prevenire loop infinito
      const emergencyResult = { hasPlayedToday: false, canPlay: false };
      console.log('[SPIN-STATUS] Emergency fallback:', emergencyResult);
      setSpinStatus(emergencyResult);
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