// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Achievement {
  id: string;
  type: 'xp' | 'badge' | 'streak' | 'podium';
  title: string;
  description: string;
  xp_amount?: number;
  created_at: string;
  icon: React.ReactNode;
}

export const AchievementTimeline: React.FC = () => {
  const { user } = useAuthContext();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAchievements = async () => {
      try {
        const timeline: Achievement[] = [];

        // Fetch unlocked badges
        const { data: badgeData, error: badgeError } = await supabase
          .from('user_badges')
          .select('id, badge_id, user_id, created_at, source')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!badgeError && badgeData) {
          // Fetch badge details for each user badge
          for (const userBadge of badgeData) {
            const { data: badgeInfo } = await supabase
              .from('badges')
              .select('name, description')
              .eq('badge_id', userBadge.badge_id)
              .single();

            timeline.push({
              id: userBadge.id,
              type: 'badge',
              title: 'Badge Sbloccato!',
              description: badgeInfo?.name || 'Nuovo badge',
              created_at: userBadge.created_at,
              icon: <Trophy className="w-4 h-4 text-purple-400" />
            });
          }
        }

        // Sort by date
        timeline.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setAchievements(timeline.slice(0, 15));
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();

    // Real-time subscription for badge updates
    const badgeChannel = supabase
      .channel('user_badges_timeline')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(badgeChannel);
    };
  }, [user?.id]);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="gradient-text">📜 Timeline Progressi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">Caricamento...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Timeline Progressi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02, duration: 0.12 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-900/40 to-gray-800/40 border border-gray-700/30 hover:border-cyan-500/30 transition-all"
            >
              {/* Icon */}
              <div className="flex-shrink-0 p-2 bg-gray-800/50 rounded-full">
                {achievement.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {achievement.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <p className="text-[10px] text-gray-500">
                    {format(new Date(achievement.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                  </p>
                </div>
              </div>

              {/* XP Badge */}
              {achievement.xp_amount && (
                <div className="flex-shrink-0 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
                  <p className="text-xs font-bold text-yellow-400">
                    +{achievement.xp_amount}
                  </p>
                </div>
              )}
            </motion.div>
          ))}

          {achievements.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              Nessun achievement ancora. Inizia a giocare!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};