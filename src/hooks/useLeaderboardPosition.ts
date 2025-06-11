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
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('user_id, position, score, email, change')
        .order('position', { ascending: true });

      if (leaderboardError) {
        console.error('Error fetching leaderboard data:', leaderboardError);
        return;
      }

      setLeaderboard(leaderboardData || []);

      const { data: userPositionData, error: userPositionError } = await supabase
        .from('leaderboard')
        .select('position')
        .eq('user_id', currentUser.id)
        .single();

      if (userPositionError && userPositionError.code !== 'PGRST116') {
        console.error('Error fetching user position:', userPositionError);
        return;
      }

      if (userPositionData) {
        setPosition(userPositionData.position);
      } else {
        setPosition(null);
      }

      const { count, error: countError } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching leaderboard count:', countError);
        return;
      }

      setTotalUsers(count || 0);

      const userEntry = leaderboardData?.find(entry => entry.user_id === currentUser.id);
      
      // When updating notifications, use the correct signature
      if (userEntry && userEntry.position <= 10) {
        await addNotification('Posizione Top 10!', `Sei nella Top 10 con la posizione ${userEntry.position}!`, 'leaderboard');
      }
      
      if (userEntry && userEntry.position === 1) {
        await addNotification('Primo Posto!', 'Congratulazioni! Sei al primo posto nella classifica!', 'leaderboard');
      }
      
      if (userEntry && userEntry.change === 'up') {
        await addNotification('Posizione Migliorata!', `La tua posizione è migliorata alla ${userEntry.position}°!`, 'leaderboard');
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
