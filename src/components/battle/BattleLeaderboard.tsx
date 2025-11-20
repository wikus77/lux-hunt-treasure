/**
 * TRON BATTLE - Leaderboard Component
 * Global rankings for battle champions
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, Target, TrendingUp, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  user_id: string;
  agent_code: string;
  avatar_url?: string;
  total_battles: number;
  wins: number;
  win_rate: number;
  avg_reaction_ms: number;
  best_reaction_ms: number;
  current_streak: number;
  rank: number;
}

type LeaderboardType = 'wins' | 'win_rate' | 'reaction' | 'streak';

export function BattleLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeaderboardType>('wins');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Get all resolved battles
      const { data: battles } = await supabase
        .from('battles')
        .select('*')
        .eq('status', 'resolved');

      if (!battles || battles.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Calculate stats per user
      const userStats: Record<string, {
        total: number;
        wins: number;
        reactions: number[];
        streak_current: number;
        streak_longest: number;
        last_result: 'win' | 'loss';
      }> = {};

      battles.forEach(b => {
        // Creator stats
        if (!userStats[b.creator_id]) {
          userStats[b.creator_id] = { total: 0, wins: 0, reactions: [], streak_current: 0, streak_longest: 0, last_result: 'loss' };
        }
        userStats[b.creator_id].total++;
        if (b.winner_id === b.creator_id) {
          userStats[b.creator_id].wins++;
          userStats[b.creator_id].last_result = 'win';
        } else {
          userStats[b.creator_id].last_result = 'loss';
        }
        if (b.creator_reaction_ms) {
          userStats[b.creator_id].reactions.push(b.creator_reaction_ms);
        }

        // Opponent stats
        if (b.opponent_id) {
          if (!userStats[b.opponent_id]) {
            userStats[b.opponent_id] = { total: 0, wins: 0, reactions: [], streak_current: 0, streak_longest: 0, last_result: 'loss' };
          }
          userStats[b.opponent_id].total++;
          if (b.winner_id === b.opponent_id) {
            userStats[b.opponent_id].wins++;
            userStats[b.opponent_id].last_result = 'win';
          } else {
            userStats[b.opponent_id].last_result = 'loss';
          }
          if (b.opponent_reaction_ms) {
            userStats[b.opponent_id].reactions.push(b.opponent_reaction_ms);
          }
        }
      });

      // Calculate streaks (simplified - based on last result for now)
      Object.keys(userStats).forEach(uid => {
        // In a real implementation, you'd sort battles by date and calculate actual streaks
        userStats[uid].streak_current = userStats[uid].last_result === 'win' ? 1 : 0;
        userStats[uid].streak_longest = userStats[uid].streak_current;
      });

      // Get profiles
      const userIds = Object.keys(userStats);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, agent_code, avatar_url')
        .in('id', userIds);

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = (profiles || []).map(p => {
        const stats = userStats[p.id];
        const avgReaction = stats.reactions.length > 0
          ? Math.round(stats.reactions.reduce((a, b) => a + b, 0) / stats.reactions.length)
          : 0;
        const bestReaction = stats.reactions.length > 0 ? Math.min(...stats.reactions) : 0;

        return {
          user_id: p.id,
          agent_code: p.agent_code || 'Unknown',
          avatar_url: p.avatar_url,
          total_battles: stats.total,
          wins: stats.wins,
          win_rate: (stats.wins / stats.total) * 100,
          avg_reaction_ms: avgReaction,
          best_reaction_ms: bestReaction,
          current_streak: stats.streak_current,
          rank: 0, // Will be set after sorting
        };
      });

      // Sort based on active tab
      let sorted: LeaderboardEntry[] = [];
      switch (activeTab) {
        case 'wins':
          sorted = entries.sort((a, b) => b.wins - a.wins);
          break;
        case 'win_rate':
          sorted = entries
            .filter(e => e.total_battles >= 5) // Min 5 battles for win rate ranking
            .sort((a, b) => b.win_rate - a.win_rate);
          break;
        case 'reaction':
          sorted = entries
            .filter(e => e.best_reaction_ms > 0)
            .sort((a, b) => a.best_reaction_ms - b.best_reaction_ms);
          break;
        case 'streak':
          sorted = entries.sort((a, b) => b.current_streak - a.current_streak);
          break;
      }

      // Assign ranks
      sorted.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(sorted.slice(0, 50)); // Top 50
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const renderEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.user_id === userId;

    return (
      <motion.div
        key={entry.user_id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
          isCurrentUser 
            ? 'bg-primary/10 border-2 border-primary' 
            : 'bg-card/50 border border-border/50 hover:bg-card/80'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getRankIcon(entry.rank)}
          <Avatar className="w-10 h-10">
            <AvatarImage src={entry.avatar_url} />
            <AvatarFallback>{entry.agent_code.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{entry.agent_code}</div>
            <div className="text-xs text-muted-foreground">
              {entry.total_battles} battles
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {activeTab === 'wins' && (
            <div className="text-center">
              <div className="font-bold text-lg">{entry.wins}</div>
              <div className="text-xs text-muted-foreground">wins</div>
            </div>
          )}
          {activeTab === 'win_rate' && (
            <div className="text-center">
              <div className="font-bold text-lg">{entry.win_rate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">rate</div>
            </div>
          )}
          {activeTab === 'reaction' && (
            <div className="text-center">
              <div className="font-bold text-lg">{entry.best_reaction_ms}ms</div>
              <div className="text-xs text-muted-foreground">fastest</div>
            </div>
          )}
          {activeTab === 'streak' && (
            <div className="text-center">
              <div className="font-bold text-lg">{entry.current_streak}</div>
              <div className="text-xs text-muted-foreground">streak</div>
            </div>
          )}
        </div>

        {isCurrentUser && (
          <Badge variant="default" className="ml-2">You</Badge>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Battle Leaderboard
        </CardTitle>
        <CardDescription>Top battlers across all categories</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeaderboardType)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="wins" className="gap-1">
              <Trophy className="w-4 h-4" />
              Wins
            </TabsTrigger>
            <TabsTrigger value="win_rate" className="gap-1">
              <Target className="w-4 h-4" />
              Rate
            </TabsTrigger>
            <TabsTrigger value="reaction" className="gap-1">
              <Zap className="w-4 h-4" />
              Speed
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-1">
              <TrendingUp className="w-4 h-4" />
              Streak
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No battles yet. Be the first to compete!
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {leaderboard.map(renderEntry)}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
