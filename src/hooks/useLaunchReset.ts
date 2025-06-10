
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
      console.log('📡 LANCIO RESET: Calling backend reset with AWAIT...');
      const { data, error } = await supabase.functions.invoke('reset-launch-data');
      
      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Backend reset failed');
      }

      console.log('✅ LANCIO RESET: Backend reset completed successfully');

      // 2. WAIT FOR BACKEND PROPAGATION - CRITICAL TIMING FIX
      console.log('⏳ LANCIO RESET: Waiting for backend propagation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. FRONTEND RESET - COMPLETE CACHE AND STORAGE CLEAR - ONLY AFTER BACKEND
      console.log('💾 LANCIO RESET: Clearing ALL frontend data AFTER backend completion...');
      
      // Clear ALL localStorage
      localStorage.clear();
      
      // Clear ALL sessionStorage
      sessionStorage.clear();
      
      // Force clear React Query cache COMPLETELY
      queryClient.clear();
      queryClient.removeQueries();
      
      // CRITICAL: Set first launch flag for generation override
      sessionStorage.setItem('isFirstLaunchAfterReset', 'true');
      
      // Force reload all queries from backend - AFTER backend completion
      await queryClient.invalidateQueries();
      
      // Additional specific cache invalidations with EXACT queryKeys
      await queryClient.invalidateQueries({ queryKey: ['user_clues'] });
      await queryClient.invalidateQueries({ queryKey: ['user_notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['user_map_areas'] });
      await queryClient.invalidateQueries({ queryKey: ['user_buzz_counter'] });
      await queryClient.invalidateQueries({ queryKey: ['user_buzz_map_counter'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly_buzz_allowances'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      // CRITICAL: Force refetch with fresh data
      await queryClient.refetchQueries();
      
      console.log('✅ LANCIO RESET: Complete frontend cache cleared AFTER backend');
      setIsReset(true);
      
      toast.success('🚀 LANCIO RESET: Dati azzerati per test 19 luglio!', {
        description: 'Sistema completamente resetato e pronto per il lancio - BUZZ MAPPA a 500km'
      });
      
      // Force page reload to ensure clean state - DELAYED for cache clear
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
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

  // CRITICAL: Auto-reset for developer ALWAYS on first access - WITH PROPER AWAIT
  useEffect(() => {
    if (user?.email === 'wikus77@hotmail.it' && !isReset && !isResetting) {
      console.log('🔧 LANCIO AUTO-RESET: Developer detected, starting immediate reset with AWAIT...');
      
      // Immediate reset with proper timing
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
