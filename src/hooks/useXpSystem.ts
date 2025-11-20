// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface XpStatus {
  total_xp: number;
  buzz_xp_progress: number;
  map_xp_progress: number;
  free_buzz_credit: number;
  free_buzz_map_credit: number;
  next_buzz_reward: number;
  next_map_reward: number;
}

export const useXpSystem = () => {
  const { user } = useAuthContext();
  const [xpStatus, setXpStatus] = useState<XpStatus>({
    total_xp: 0,
    buzz_xp_progress: 0,
    map_xp_progress: 0,
    free_buzz_credit: 0,
    free_buzz_map_credit: 0,
    next_buzz_reward: 100,
    next_map_reward: 250
  });
  const [loading, setLoading] = useState(true);
  const [hasNewRewards, setHasNewRewards] = useState(false);
  const [newBadge, setNewBadge] = useState<{ name: string; description: string } | null>(null);

  // Fetch user XP status
  const fetchXpStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_user_xp_status', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching XP status:', error);
        return;
      }

      if (data) {
        const newStatus = data as unknown as XpStatus;
        
        // Check for new rewards
        const hadNewBuzzCredit = newStatus.free_buzz_credit > xpStatus.free_buzz_credit;
        const hadNewMapCredit = newStatus.free_buzz_map_credit > xpStatus.free_buzz_map_credit;
        
        if (hadNewBuzzCredit || hadNewMapCredit) {
          setHasNewRewards(true);
        }

        // Check for new badges (when free credits are earned)
        if (hadNewBuzzCredit) {
          setNewBadge({
            name: 'BUZZ Gratuito Sbloccato!',
            description: `Hai guadagnato un BUZZ gratuito! (${newStatus.free_buzz_credit} disponibili)`
          });
        } else if (hadNewMapCredit) {
          setNewBadge({
            name: 'BUZZ MAP Gratuito Sbloccato!',
            description: `Hai guadagnato un BUZZ MAP gratuito! (${newStatus.free_buzz_map_credit} disponibili)`
          });
        }
        
        setXpStatus(newStatus);
      }
    } catch (error) {
      console.error('Exception fetching XP status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Consume a credit
  const consumeCredit = async (creditType: 'buzz' | 'buzz_map'): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('consume_credit', {
        p_user_id: user.id,
        p_credit_type: creditType
      });

      if (error) {
        console.error('Error consuming credit:', error);
        return false;
      }

      if (data) {
        // Refresh XP status
        await fetchXpStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Exception consuming credit:', error);
      return false;
    }
  };

  // Mark rewards as seen
  const markRewardsAsSeen = () => {
    setHasNewRewards(false);
  };

  // Set up realtime subscription for XP updates
  useEffect(() => {
    if (!user?.id) return;

    fetchXpStatus();

    // Subscribe to XP changes
    const xpChannel = supabase
      .channel('user_xp_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_xp',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchXpStatus();
        }
      )
      .subscribe();

    // Subscribe to credits changes
    const creditsChannel = supabase
      .channel('user_credits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchXpStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(xpChannel);
      supabase.removeChannel(creditsChannel);
    };
  }, [user?.id]);

  // Close badge notification
  const closeBadgeNotification = () => {
    setNewBadge(null);
  };

  return {
    xpStatus,
    loading,
    hasNewRewards,
    newBadge,
    consumeCredit,
    markRewardsAsSeen,
    closeBadgeNotification,
    refreshXpStatus: fetchXpStatus
  };
};