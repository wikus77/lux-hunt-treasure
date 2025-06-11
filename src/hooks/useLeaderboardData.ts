
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Player {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  cluesFound: number;
  areasExplored: number;
  team: string | null;
  country: string;
  badges: string[];
  dailyChange: number;
}

export const useLeaderboardData = () => {
  const [filter, setFilter] = useState<'all' | 'team' | 'country' | '7days'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePlayers, setVisiblePlayers] = useState(50);
  const [players, setPlayers] = useState<Player[]>([]);

  // Check if this is first launch for faster refresh
  const isFirstLaunch = sessionStorage.getItem('isFirstLaunch') === 'true';

  // LANCIO: Connect to real Supabase tables with auto-refresh
  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard_data'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          credits,
          subscription_tier,
          country,
          created_at
        `)
        .order('credits', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ LANCIO: Error fetching leaderboard:', error);
        return [];
      }

      return profiles || [];
    },
    refetchInterval: isFirstLaunch ? 5000 : 30000, // CRITICAL: Auto-refresh every 5s if first launch, 30s otherwise
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Transform real data to Player format
  useEffect(() => {
    if (profiles) {
      const realPlayers: Player[] = profiles.map((profile, index) => ({
        id: index + 1, // Use numeric ID for compatibility
        name: profile.full_name || `Agente ${profile.id.slice(0, 8)}`,
        avatar: profile.avatar_url || `https://avatar.vercel.sh/${profile.id}`,
        points: profile.credits || 0,
        rank: index + 1,
        cluesFound: 0, // LANCIO: Reset to 0
        areasExplored: 0, // LANCIO: Reset to 0
        team: null,
        country: profile.country || "🇮🇹",
        badges: profile.subscription_tier === 'Black' ? ["top"] : [],
        dailyChange: 0 // LANCIO: Reset to 0
      }));

      console.log('📊 LANCIO: Real leaderboard updated:', realPlayers.length, 'players');
      setPlayers(realPlayers);
    }
  }, [profiles]);

  // Force immediate refetch if first launch
  useEffect(() => {
    if (isFirstLaunch) {
      console.log('🔄 LANCIO: First launch detected, forcing immediate leaderboard refresh');
      refetch();
    }
  }, [isFirstLaunch, refetch]);

  const filteredPlayers = players.filter(player => {
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filter === 'team' && !player.team) return false;
    if (filter === 'country' && player.country !== "🇮🇹") return false;
    if (filter === '7days') {
      return player.cluesFound > 0; // LANCIO: After reset, will be 0
    }
    
    return true;
  }).slice(0, visiblePlayers);

  const handleLoadMore = () => {
    setVisiblePlayers(prev => Math.min(prev + 15, players.length));
  };

  const hasMorePlayers = visiblePlayers < players.length;

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredPlayers,
    isLoading,
    handleLoadMore,
    hasMorePlayers,
    refreshLeaderboard: refetch
  };
};
