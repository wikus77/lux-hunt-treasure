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
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'check-daily-spin',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      setSpinStatus(data);
      console.log('🎰 Daily Spin Status:', data);

    } catch (err) {
      console.error('❌ Errore check daily spin:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
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