
import { useState, useEffect } from 'react';

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

export const useLeaderboardData = (initialPlayers: Player[]) => {
  const [filter, setFilter] = useState<'all' | 'team' | 'country' | '7days'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePlayers, setVisiblePlayers] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPlayers = initialPlayers.filter(player => {
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filter === 'team' && !player.team) return false;
    if (filter === 'country' && player.country !== "🇮🇹") return false;
    if (filter === '7days') {
      return player.cluesFound > 10;
    }
    
    return true;
  }).slice(0, visiblePlayers);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisiblePlayers(prev => Math.min(prev + 15, initialPlayers.length));
      setIsLoading(false);
    }, 800);
  };

  const hasMorePlayers = visiblePlayers < initialPlayers.length;

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredPlayers,
    isLoading,
    handleLoadMore,
    hasMorePlayers
  };
};
