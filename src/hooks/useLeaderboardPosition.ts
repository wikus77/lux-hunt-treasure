
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useNotifications } from './useNotifications';

interface LeaderboardEntry {
  user_id: string;
  position: number;
  score: number;
  email: string;
  change?: 'up' | 'down' | 'same';
}

export const useLeaderboardPosition = () => {
  const [position, setPosition] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentUser } = useAuthContext();
  const { addNotification } = useNotifications();

  const fetchLeaderboard = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id && !localStorage.getItem('developer_access')) {
      return;
    }

    setIsLoading(true);
    try {
      // FIXED: Use existing tables instead of non-existent 'leaderboard' table
      // Create mock leaderboard data from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, credits')
        .order('credits', { ascending: false })
        .limit(100);

      if (profilesError) {
        console.error('Error fetching profiles data:', profilesError);
        return;
      }

      // Transform profiles data into leaderboard format
      const mockLeaderboard: LeaderboardEntry[] = (profilesData || []).map((profile, index) => ({
        user_id: profile.id,
        position: index + 1,
        score: profile.credits || 0,
        email: profile.email || 'unknown@example.com',
        change: 'same' as const
      }));

      setLeaderboard(mockLeaderboard);

      // Find current user position
      const userEntry = mockLeaderboard.find(entry => entry.user_id === currentUser?.id);
      if (userEntry) {
        setPosition(userEntry.position);
      } else {
        setPosition(null);
      }

      setTotalUsers(mockLeaderboard.length);

      // Send notifications using the correct format
      if (userEntry && userEntry.position <= 10) {
        await addNotification(
          'Posizione Top 10!', 
          `Sei nella Top 10 con la posizione ${userEntry.position}!`, 
          'leaderboard'
        );
      }
      
      if (userEntry && userEntry.position === 1) {
        await addNotification(
          'Primo Posto!', 
          'Congratulazioni! Sei al primo posto nella classifica!', 
          'leaderboard'
        );
      }
      
      if (userEntry && userEntry.change === 'up') {
        await addNotification(
          'Posizione Migliorata!', 
          `La tua posizione è migliorata alla ${userEntry.position}°!`, 
          'leaderboard'
        );
      }

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser, addNotification]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const reloadLeaderboard = useCallback(async () => {
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    position,
    totalUsers,
    leaderboard,
    isLoading,
    fetchLeaderboard
  };
};
