// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  rank: number;
  agent_code: string;
  avatar_url?: string;
}

export function WeeklyLeaderboard() {
  const { user } = useAuthContext();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const currentWeek = getWeekNumber(new Date());
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('weekly_leaderboard')
        .select('user_id, total_xp, rank')
        .eq('week_number', currentWeek)
        .eq('year', currentYear)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch agent codes separately
      const enrichedData = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('agent_code, avatar_url')
            .eq('id', entry.user_id)
            .single();

          return {
            ...entry,
            agent_code: profile?.agent_code || 'AG-????',
            avatar_url: profile?.avatar_url
          };
        })
      );

      setLeaderboard(enrichedData);

      // Get current user rank
      if (user) {
        const { data: myData } = await supabase
          .from('weekly_leaderboard')
          .select('rank')
          .eq('user_id', user.id)
          .eq('week_number', currentWeek)
          .eq('year', currentYear)
          .single();

        if (myData) {
          setMyRank(myData.rank);
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7));
    nextMonday.setHours(0, 0, 0, 0);

    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    setTimeUntilReset(`${days}g ${hours}h ${minutes}m`);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-700" />;
      default: return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🏆 Classifica Settimanale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Caricamento...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🏆 Classifica Settimanale</CardTitle>
          <div className="text-sm text-muted-foreground">
            Reset tra: <span className="font-bold text-primary">{timeUntilReset}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02, duration: 0.15 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.rank <= 3 ? 'bg-primary/10' : 'bg-secondary/50'
              } ${entry.user_id === user?.id ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <p className="font-semibold">
                    {entry.agent_code || 'Agente Segreto'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.total_xp.toLocaleString()} XP
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {myRank && myRank > 10 && (
            <div className="mt-4 pt-4 border-t">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-accent ring-2 ring-primary"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                    <span className="text-muted-foreground font-bold">#{myRank}</span>
                  </div>
                  <div>
                    <p className="font-semibold">La tua posizione</p>
                    <p className="text-xs text-muted-foreground">Continua a guadagnare XP!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
