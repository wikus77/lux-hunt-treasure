
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  // LANCIO: Connect to real Supabase tables
  const fetchRealLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Get real user data from profiles
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
        // Fallback to empty array for reset state
        setPlayers([]);
        return;
      }

      // Transform real data to Player format
      const realPlayers: Player[] = (profiles || []).map((profile, index) => ({
        id: profile.id,
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

      console.log('📊 LANCIO: Real leaderboard loaded:', realPlayers.length, 'players');
      setPlayers(realPlayers);

    } catch (error) {
      console.error('❌ LANCIO: Error in fetchRealLeaderboard:', error);
      setPlayers([]); // Reset state for launch
    } finally {
      setIsLoading(false);
    }
  };

  // Load real data on mount
  useEffect(() => {
    fetchRealLeaderboard();
  }, []);

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
    setIsLoading(true);
    setTimeout(() => {
      setVisiblePlayers(prev => Math.min(prev + 15, players.length));
      setIsLoading(false);
    }, 800);
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
    refreshLeaderboard: fetchRealLeaderboard
  };
};
