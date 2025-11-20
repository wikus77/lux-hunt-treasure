/**
 * TRON BATTLE - Stats Component
 * Personal battle statistics and performance metrics
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, TrendingUp, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface BattleStatsData {
  total_battles: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_reaction_ms: number;
  best_reaction_ms: number;
  current_streak: number;
  longest_streak: number;
  total_stakes_won: Record<string, number>;
  total_stakes_lost: Record<string, number>;
  rank_position?: number;
  total_players?: number;
}

interface BattleStatsProps {
  userId?: string;
}

export function BattleStats({ userId: propUserId }: BattleStatsProps) {
  const [stats, setStats] = useState<BattleStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(propUserId || null);

  useEffect(() => {
    if (!propUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id);
      });
    }
  }, [propUserId]);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get all battles
      const { data: battles } = await supabase
        .from('battles')
        .select('*')
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .eq('status', 'resolved');

      if (!battles || battles.length === 0) {
        setStats({
          total_battles: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          avg_reaction_ms: 0,
          best_reaction_ms: 0,
          current_streak: 0,
          longest_streak: 0,
          total_stakes_won: {},
          total_stakes_lost: {},
        });
        setLoading(false);
        return;
      }

      const wins = battles.filter(b => b.winner_id === userId).length;
      const losses = battles.length - wins;
      const win_rate = (wins / battles.length) * 100;

      // Calculate reaction times
      const myReactions = battles.map(b => {
        if (b.creator_id === userId) return b.creator_reaction_ms;
        if (b.opponent_id === userId) return b.opponent_reaction_ms;
        return null;
      }).filter((r): r is number => r !== null);

      const avg_reaction_ms = myReactions.length > 0 
        ? Math.round(myReactions.reduce((a, b) => a + b, 0) / myReactions.length)
        : 0;
      const best_reaction_ms = myReactions.length > 0 ? Math.min(...myReactions) : 0;

      // Calculate streaks
      const sortedBattles = [...battles].sort((a, b) => 
        new Date(a.resolved_at || '').getTime() - new Date(b.resolved_at || '').getTime()
      );

      let current_streak = 0;
      let longest_streak = 0;
      let current_count = 0;

      for (let i = sortedBattles.length - 1; i >= 0; i--) {
        if (sortedBattles[i].winner_id === userId) {
          current_count++;
          if (i === sortedBattles.length - 1) {
            current_streak = current_count;
          }
        } else {
          longest_streak = Math.max(longest_streak, current_count);
          if (i === sortedBattles.length - 1) {
            current_streak = 0;
          }
          current_count = 0;
        }
      }
      longest_streak = Math.max(longest_streak, current_count, current_streak);

      // Calculate stakes
      const { data: transfers } = await supabase
        .from('battle_transfers')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

      const total_stakes_won: Record<string, number> = {};
      const total_stakes_lost: Record<string, number> = {};

      transfers?.forEach(t => {
        if (t.to_user_id === userId) {
          total_stakes_won[t.transfer_type] = (total_stakes_won[t.transfer_type] || 0) + t.amount;
        } else {
          total_stakes_lost[t.transfer_type] = (total_stakes_lost[t.transfer_type] || 0) + t.amount;
        }
      });

      // Get rank position
      const { data: allPlayers } = await supabase
        .from('battles')
        .select('winner_id')
        .eq('status', 'resolved');

      const winCounts = (allPlayers || []).reduce((acc: Record<string, number>, b) => {
        if (b.winner_id) {
          acc[b.winner_id] = (acc[b.winner_id] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedPlayers = Object.entries(winCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([id]) => id);

      const rank_position = sortedPlayers.indexOf(userId) + 1;

      setStats({
        total_battles: battles.length,
        wins,
        losses,
        win_rate,
        avg_reaction_ms,
        best_reaction_ms,
        current_streak,
        longest_streak,
        total_stakes_won,
        total_stakes_lost,
        rank_position: rank_position || undefined,
        total_players: sortedPlayers.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Wins</span>
              </div>
              <div className="text-3xl font-bold">{stats.wins}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.total_battles} total battles
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Win Rate</span>
              </div>
              <div className="text-3xl font-bold">{stats.win_rate.toFixed(1)}%</div>
              <Progress value={stats.win_rate} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Best Time</span>
              </div>
              <div className="text-3xl font-bold">{stats.best_reaction_ms}ms</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {stats.avg_reaction_ms}ms
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <div className="text-3xl font-bold">{stats.current_streak}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Best: {stats.longest_streak}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rank Card */}
      {stats.rank_position && stats.total_players && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Global Rank
              </CardTitle>
              <CardDescription>Your position among all battlers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary">#{stats.rank_position}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    out of {stats.total_players} players
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Top {Math.round((stats.rank_position / stats.total_players) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stakes Won/Lost */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Stakes Balance</CardTitle>
            <CardDescription>Total resources won and lost in battles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys({ ...stats.total_stakes_won, ...stats.total_stakes_lost }).map(type => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{type}</span>
                  <div className="flex gap-4">
                    <span className="text-green-500">+{stats.total_stakes_won[type] || 0}</span>
                    <span className="text-destructive">-{stats.total_stakes_lost[type] || 0}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Net: {(stats.total_stakes_won[type] || 0) - (stats.total_stakes_lost[type] || 0)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
