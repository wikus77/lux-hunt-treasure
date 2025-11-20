// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, Award } from 'lucide-react';

export const RankHighlight: React.FC = () => {
  const { user } = useAuthContext();
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [weeklyXp, setWeeklyXp] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRank = async () => {
      try {
        const { data, error } = await supabase
          .from('weekly_leaderboard')
          .select('*')
          .order('total_xp', { ascending: false });

        if (error) throw error;

        if (data) {
          const userIndex = data.findIndex(entry => entry.user_id === user.id);
          if (userIndex !== -1) {
            setRank(userIndex + 1);
            setWeeklyXp(data[userIndex].total_xp || 0);
          }
          setTotalPlayers(data.length);
        }
      } catch (error) {
        console.error('Error fetching rank:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRank();

    // Real-time subscription
    const rankChannel = supabase
      .channel('weekly_leaderboard_rank')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_leaderboard'
        },
        () => {
          fetchRank();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rankChannel);
    };
  }, [user?.id]);

  if (loading || rank === null) {
    return null;
  }

  const isPodium = rank <= 3;
  const medalColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-orange-400' : 'text-cyan-400';
  const bgGradient = isPodium 
    ? 'from-yellow-900/40 via-orange-900/40 to-purple-900/40' 
    : 'from-cyan-900/40 to-purple-900/40';

  return (
    <Card className={`glass-card bg-gradient-to-r ${bgGradient} border-2 ${isPodium ? 'border-yellow-500/50' : 'border-cyan-500/30'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Rank */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={isPodium ? { scale: [1, 1.05, 1] } : {}}
              transition={isPodium ? { duration: 0.4, ease: "easeOut" } : {}}
              className={`p-3 ${isPodium ? 'bg-yellow-500/20' : 'bg-cyan-500/20'} rounded-full`}
            >
              {isPodium ? (
                <Trophy className={`w-8 h-8 ${medalColor}`} />
              ) : (
                <Award className={`w-8 h-8 ${medalColor}`} />
              )}
            </motion.div>
            
            <div>
              <p className="text-sm text-gray-400">Posizione Classifica</p>
              <p className={`text-3xl font-bold ${medalColor}`}>
                #{rank}
              </p>
            </div>
          </div>

          {/* Right Side - Stats */}
          <div className="text-right">
            <p className="text-sm text-gray-400">XP Settimanale</p>
            <div className="flex items-center gap-1 justify-end">
              <p className="text-2xl font-bold text-cyan-400">
                {weeklyXp.toLocaleString()}
              </p>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              su {totalPlayers} agenti
            </p>
          </div>
        </div>

        {/* Podium Message */}
        {isPodium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center"
          >
            <p className="text-xs text-yellow-300 font-semibold">
              🎉 Sei sul podio questa settimana! Continua così!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};