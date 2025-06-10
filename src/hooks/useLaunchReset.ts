
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';

export const useLaunchReset = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [isReset, setIsReset] = useState(false);

  const performLaunchReset = async () => {
    if (!user?.id) return;

    console.log('🚀 LANCIO 19 LUGLIO: Performing complete UI reset for user', user.id);

    try {
      // Reset localStorage data
      localStorage.removeItem('buzz-clues-unlocked');
      localStorage.removeItem('buzz-clues-used');
      localStorage.removeItem('map-search-areas');
      localStorage.removeItem('user-notifications');
      localStorage.removeItem('leaderboard-data');
      
      // Force clear React Query cache using proper hook
      queryClient.clear();
      
      console.log('✅ LANCIO RESET: LocalStorage and cache cleared');
      setIsReset(true);
      
    } catch (error) {
      console.error('❌ LANCIO RESET ERROR:', error);
    }
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

  useEffect(() => {
    if (user?.id && !isReset) {
      performLaunchReset();
    }
  }, [user?.id]);

  return {
    isReset,
    performLaunchReset,
    getResetStats
  };
};
