
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
      // 1. BACKEND RESET via Edge Function - CRITICAL: AWAIT COMPLETION
      console.log('📡 LANCIO RESET: Calling backend reset...');
      const { data, error } = await supabase.functions.invoke('reset-launch-data');
      
      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Backend reset failed');
      }

      console.log('✅ LANCIO RESET: Backend reset completed successfully');

      // 2. FRONTEND RESET - COMPLETE CACHE AND STORAGE CLEAR (ONLY AFTER BACKEND COMPLETION)
      console.log('💾 LANCIO RESET: Clearing ALL frontend data...');
      
      // Clear ALL localStorage
      localStorage.clear();
      
      // Clear ALL sessionStorage
      sessionStorage.clear();
      
      // Force clear React Query cache COMPLETELY
      queryClient.clear();
      queryClient.removeQueries();
      
      // Force reload all queries from backend
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries();
      
      // Additional specific cache invalidations
      await queryClient.invalidateQueries({ queryKey: ['user_clues'] });
      await queryClient.invalidateQueries({ queryKey: ['user_notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['user_map_areas'] });
      await queryClient.invalidateQueries({ queryKey: ['user_buzz_counter'] });
      await queryClient.invalidateQueries({ queryKey: ['user_buzz_map_counter'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly_buzz_allowances'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      // Set first launch flag for proper generation sequence
      sessionStorage.setItem('isFirstLaunch', 'true');
      
      console.log('✅ LANCIO RESET: Complete frontend cache cleared');
      setIsReset(true);
      
      toast.success('🚀 LANCIO RESET: Dati azzerati per test 19 luglio!', {
        description: 'Sistema completamente resetato e pronto per il lancio'
      });
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
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

  // CRITICAL: Auto-reset for developer ALWAYS on first access
  useEffect(() => {
    if (user?.email === 'wikus77@hotmail.it' && !isReset && !isResetting) {
      console.log('🔧 LANCIO AUTO-RESET: Developer detected, starting immediate reset...');
      
      // Immediate reset with no delay for testing
      const timer = setTimeout(() => {
        performCompleteLaunchReset();
      }, 1000);
      
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
