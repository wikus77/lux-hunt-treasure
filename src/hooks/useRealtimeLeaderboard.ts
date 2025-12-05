/**
 * REALTIME LEADERBOARD HOOK
 * Live updates, geographic filters, overtake notifications
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { hapticWarning } from '@/utils/haptics';

export interface LeaderboardUser {
  id: string;
  agent_code: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  region?: string;
  country?: string;
  subscription_plan?: string;
  streak_days: number;
  pulse_energy: number;
  m1_units: number;
  clues_unlocked: number;
  buzz_used: number;
  total_score: number;
  rank: number;
  change?: number;
  isCurrentUser?: boolean;
}

export type LeaderboardScope = 'global' | 'country' | 'region' | 'city';

interface UseRealtimeLeaderboardOptions {
  scope?: LeaderboardScope;
  filterValue?: string;
  limit?: number;
  enableNotifications?: boolean;
}

export function useRealtimeLeaderboard(options: UseRealtimeLeaderboardOptions = {}) {
  const {
    scope = 'global',
    filterValue,
    limit = 50,
    enableNotifications = true
  } = options;

  const { user } = useAuthContext();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [lastOvertake, setLastOvertake] = useState<{ name: string; rank: number } | null>(null);
  
  const previousRankRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try RPC function first, fallback to direct query
      let data: any[] = [];
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_leaderboard', {
        p_scope: scope,
        p_filter_value: filterValue || null,
        p_limit: limit
      });

      if (rpcError) {
        // Fallback to direct profiles query
        console.log('RPC not available, using fallback query');
        
        let query = supabase
          .from('profiles')
          .select(`
            id,
            agent_code,
            full_name,
            avatar_url,
            city,
            region,
            country,
            subscription_plan,
            current_streak_days,
            pulse_energy,
            m1_units
          `)
          .not('agent_code', 'is', null)
          .order('pulse_energy', { ascending: false })
          .limit(limit);

        if (scope === 'city' && filterValue) {
          query = query.eq('city', filterValue);
        } else if (scope === 'region' && filterValue) {
          query = query.eq('region', filterValue);
        } else if (scope === 'country' && filterValue) {
          query = query.eq('country', filterValue);
        }

        const { data: profiles, error: profilesError } = await query;
        
        if (profilesError) throw profilesError;

        // Get clues count
        const userIds = profiles?.map(p => p.id) || [];
        const { data: cluesData } = await supabase
          .from('user_clues')
          .select('user_id')
          .in('user_id', userIds);

        const cluesCount: Record<string, number> = {};
        cluesData?.forEach(c => {
          cluesCount[c.user_id] = (cluesCount[c.user_id] || 0) + 1;
        });

        // Get buzz count
        const { data: buzzData } = await supabase
          .from('user_buzz_counter')
          .select('user_id, buzz_count')
          .in('user_id', userIds);

        const buzzCount: Record<string, number> = {};
        buzzData?.forEach(b => {
          buzzCount[b.user_id] = (buzzCount[b.user_id] || 0) + (b.buzz_count || 0);
        });

        // Calculate scores and ranks
        data = (profiles || []).map((profile, index) => {
          const clues = cluesCount[profile.id] || 0;
          const buzz = buzzCount[profile.id] || 0;
          const score = (profile.pulse_energy || 0) * 2 + clues * 10 + buzz * 5 + (profile.current_streak_days || 0) * 3;
          
          return {
            id: profile.id,
            agent_code: profile.agent_code,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            city: profile.city,
            region: profile.region,
            country: profile.country,
            subscription_plan: profile.subscription_plan,
            streak_days: profile.current_streak_days || 0,
            pulse_energy: profile.pulse_energy || 0,
            m1_units: profile.m1_units || 0,
            clues_unlocked: clues,
            buzz_used: buzz,
            total_score: score,
            rank: index + 1
          };
        }).sort((a, b) => b.total_score - a.total_score)
          .map((u, i) => ({ ...u, rank: i + 1 }));
      } else {
        data = rpcData || [];
      }

      // Mark current user and calculate changes
      // Note: change is set to 0 as we don't track historical position changes yet
      // This is better than showing random/fake numbers to users
      const enrichedData = data.map(u => ({
        ...u,
        isCurrentUser: u.id === user?.id,
        change: 0 // Real change tracking would require storing position history
      }));

      setLeaderboard(enrichedData);

      // Update current user rank
      if (user) {
        const currentUser = enrichedData.find(u => u.id === user.id);
        if (currentUser) {
          setCurrentUserRank(currentUser);
          
          // Check for overtake
          if (previousRankRef.current !== null && 
              currentUser.rank > previousRankRef.current && 
              enableNotifications) {
            // User got overtaken
            const overtaker = enrichedData.find(u => u.rank === previousRankRef.current);
            if (overtaker && !overtaker.isCurrentUser) {
              hapticWarning();
              setLastOvertake({ name: overtaker.full_name || overtaker.agent_code, rank: overtaker.rank });
              toast.warning(`⚠️ ${overtaker.full_name || overtaker.agent_code} ti ha superato!`, {
                description: `Ora sei #${currentUser.rank} in classifica`,
                duration: 5000
              });
            }
          }
          previousRankRef.current = currentUser.rank;
        }
      }

    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, [scope, filterValue, limit, user, enableNotifications]);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchLeaderboard();

    // Set up realtime subscription
    channelRef.current = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        // Debounce refresh
        setTimeout(fetchLeaderboard, 1000);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_clues'
      }, () => {
        setTimeout(fetchLeaderboard, 1000);
      })
      .subscribe();

    // Refresh every 30 seconds for live feel
    const refreshInterval = setInterval(fetchLeaderboard, 30000);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(refreshInterval);
    };
  }, [fetchLeaderboard]);

  // Get available filter options
  const getFilterOptions = useCallback(async (type: 'city' | 'region' | 'country') => {
    const { data, error } = await supabase
      .from('profiles')
      .select(type)
      .not(type, 'is', null)
      .limit(100);

    if (error) return [];
    
    const unique = [...new Set(data?.map(d => d[type]).filter(Boolean))];
    return unique.sort();
  }, []);

  return {
    leaderboard,
    loading,
    error,
    currentUserRank,
    lastOvertake,
    refetch: fetchLeaderboard,
    getFilterOptions
  };
}

export default useRealtimeLeaderboard;

