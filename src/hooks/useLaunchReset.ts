
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useLaunchReset = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [isReset, setIsReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const performCompleteLaunchReset = async () => {
    if (!user?.id || isResetting) return;

    console.log('🚀 LANCIO 19 LUGLIO: Starting COMPLETE reset for user', user.id);
    setIsResetting(true);

    try {
      // 1. BACKEND RESET via Edge Function
      console.log('📡 LANCIO RESET: Calling backend reset...');
      const { data, error } = await supabase.functions.invoke('reset-launch-data');
      
      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Backend reset failed');
      }

      // 2. FRONTEND RESET
      console.log('💾 LANCIO RESET: Clearing frontend data...');
      
      // Clear localStorage
      localStorage.removeItem('buzz-clues-unlocked');
      localStorage.removeItem('buzz-clues-used');
      localStorage.removeItem('map-search-areas');
      localStorage.removeItem('user-notifications');
      localStorage.removeItem('leaderboard-data');
      
      // Force clear React Query cache
      queryClient.clear();
      
      // Force reload all queries
      await queryClient.invalidateQueries();
      
      console.log('✅ LANCIO RESET: Complete reset successful');
      setIsReset(true);
      
      toast.success('🚀 LANCIO RESET: Dati azzerati per test 19 luglio!', {
        description: 'Sistema completamente resetato e pronto per il lancio'
      });
      
    } catch (error) {
      console.error('❌ LANCIO RESET ERROR:', error);
      toast.error('❌ Errore reset dati', {
        description: 'Impossibile completare il reset'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const performLaunchReset = async () => {
    // Legacy method - redirect to complete reset
    await performCompleteLaunchReset();
  };

  const getResetStats = () => {
    // LANCIO: Return fresh stats for launch day
    return {
      unlockedClues: 0,
      dailyBuzzCount: 0,
      weeklyBuzzCount: 0,
      generatedAreas: 0,
      notifications: 0,
      leaderboardRank: null,
      totalPoints: 0
    };
  };

  // Auto-reset for developer in development
  useEffect(() => {
    if (user?.email === 'wikus77@hotmail.it' && !isReset && !isResetting) {
      // Delay to avoid multiple calls
      const timer = setTimeout(() => {
        performCompleteLaunchReset();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user?.email, isReset, isResetting]);

  return {
    isReset,
    isResetting,
    performLaunchReset,
    performCompleteLaunchReset,
    getResetStats
  };
};
