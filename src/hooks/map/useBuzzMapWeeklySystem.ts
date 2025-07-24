// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Map Weekly System Hook - Replaces 3-hour cooldown

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface WeeklyBuzzStatus {
  buzz_count: number;
  max_allowed: number;
  week_number: number;
  next_reset: string;
  remaining: number;
  can_buzz: boolean;
  week_start: string;
  last_buzz_at?: string;
}

export const useBuzzMapWeeklySystem = () => {
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyBuzzStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();

  // Load user's weekly BUZZ status
  const loadWeeklyStatus = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_user_weekly_buzz_status', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error loading weekly BUZZ status:', error);
        return;
      }

      console.log('📊 BUZZ MAPPA Weekly Status:', data);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setWeeklyStatus(data as unknown as WeeklyBuzzStatus);
      }
      
    } catch (err) {
      console.error('❌ Exception loading weekly BUZZ status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Check if user can use BUZZ MAPPA
  const canUserBuzzMappa = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase.rpc('can_user_buzz_mappa', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error checking BUZZ eligibility:', error);
        return false;
      }

      return data;
    } catch (err) {
      console.error('❌ Exception checking BUZZ eligibility:', err);
      return false;
    }
  }, [user?.id]);

  // Consume a BUZZ MAPPA attempt
  const consumeBuzzMappa = useCallback(async (): Promise<WeeklyBuzzStatus | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('consume_buzz_mappa', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error consuming BUZZ attempt:', error);
        toast.error('Errore nell\'aggiornamento del contatore settimanale');
        return null;
      }

      console.log('✅ BUZZ MAPPA consumed:', data);
      
      // Update local status
      await loadWeeklyStatus();
      
      return data as unknown as WeeklyBuzzStatus;
    } catch (err) {
      console.error('❌ Exception consuming BUZZ attempt:', err);
      toast.error('Errore nell\'aggiornamento del contatore settimanale');
      return null;
    }
  }, [user?.id, loadWeeklyStatus]);

  // Get next reset time formatted
  const getNextResetFormatted = useCallback((): string => {
    if (!weeklyStatus?.next_reset) return '';
    
    const resetDate = new Date(weeklyStatus.next_reset);
    return resetDate.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [weeklyStatus]);

  // Get week description
  const getWeekDescription = useCallback((): string => {
    if (!weeklyStatus) return '';
    
    const weekNames = {
      1: 'Prima settimana',
      2: 'Seconda settimana', 
      3: 'Terza settimana',
      4: 'Quarta settimana'
    };
    
    return weekNames[weeklyStatus.week_number as keyof typeof weekNames] || `Settimana ${weeklyStatus.week_number}`;
  }, [weeklyStatus]);

  // Check if limit reached
  const isLimitReached = useCallback((): boolean => {
    return weeklyStatus ? weeklyStatus.remaining <= 0 : false;
  }, [weeklyStatus]);

  // Get limit message
  const getLimitMessage = useCallback((): string => {
    if (!weeklyStatus) return '';
    
    if (weeklyStatus.remaining <= 0) {
      return `⚠️ Hai raggiunto il limite massimo settimanale di BUZZ MAPPA.\nRiprova da: ${getNextResetFormatted()}`;
    }
    
    return `${weeklyStatus.remaining} BUZZ MAPPA rimanenti questa settimana`;
  }, [weeklyStatus, getNextResetFormatted]);

  // Load status on mount and user change
  useEffect(() => {
    if (user?.id) {
      loadWeeklyStatus();
    }
  }, [user?.id, loadWeeklyStatus]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('weekly_buzz_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_weekly_buzz_limits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 BUZZ MAPPA: Weekly limits change detected, reloading...');
          loadWeeklyStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, loadWeeklyStatus]);

  return {
    weeklyStatus,
    isLoading,
    canUserBuzzMappa,
    consumeBuzzMappa,
    loadWeeklyStatus,
    getNextResetFormatted,
    getWeekDescription,
    isLimitReached,
    getLimitMessage,
    // Quick access properties
    canBuzz: weeklyStatus?.can_buzz ?? false,
    remaining: weeklyStatus?.remaining ?? 0,
    buzzCount: weeklyStatus?.buzz_count ?? 0,
    maxAllowed: weeklyStatus?.max_allowed ?? 10,
    weekNumber: weeklyStatus?.week_number ?? 1
  };
};