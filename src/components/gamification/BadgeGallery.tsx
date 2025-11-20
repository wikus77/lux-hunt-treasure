// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { Award, Lock, Trophy, Star, Zap, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  flame: Flame,
  award: Award
};

export const BadgeGallery: React.FC = () => {
  const { user } = useAuthContext();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchBadges = async () => {
      try {
        // Fetch all badges from catalog
        const { data: allBadges, error: badgesError } = await supabase
          .from('badges')
          .select('*');

        if (badgesError) throw badgesError;

        // Fetch user's unlocked badges
        const { data: userBadges, error: userBadgesError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id);

        if (userBadgesError) throw userBadgesError;

        // Merge data
        const unlockedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
        const mergedBadges = (allBadges || []).map(badge => ({
          id: badge.badge_id,
          name: badge.name,
          description: badge.description || '',
          icon: badge.icon || 'award',
          unlocked: unlockedBadgeIds.has(badge.badge_id),
          unlocked_at: userBadges?.find(ub => ub.badge_id === badge.badge_id)?.created_at
        }));

        setBadges(mergedBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();

    // Real-time subscription for badge updates
    const badgeChannel = supabase
      .channel('user_badges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchBadges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(badgeChannel);
    };
  }, [user?.id]);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="gradient-text">🏅 Galleria Badge</CardTitle>
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
        <CardTitle className="gradient-text flex items-center justify-between">
          <span>🏅 Galleria Badge</span>
          <span className="text-sm font-normal text-gray-400">
            {unlockedCount}/{totalCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {badges.map((badge, index) => {
            const IconComponent = ICON_MAP[badge.icon] || Award;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.12 }}
                className={`
                  relative p-4 rounded-lg border transition-all duration-300
                  ${badge.unlocked 
                    ? 'bg-gradient-to-br from-cyan-900/40 to-purple-900/40 border-cyan-500/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20' 
                    : 'bg-gray-900/40 border-gray-700/50 opacity-50'
                  }
                `}
              >
                {/* Lock Overlay for Locked Badges */}
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg backdrop-blur-sm">
                    <Lock className="w-8 h-8 text-gray-500" />
                  </div>
                )}

                {/* Badge Icon */}
                <div className={`flex justify-center mb-2 ${badge.unlocked ? 'text-yellow-400' : 'text-gray-600'}`}>
                  <IconComponent className="w-8 h-8" />
                </div>

                {/* Badge Name */}
                <p className={`text-xs font-semibold text-center mb-1 ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {badge.name}
                </p>

                {/* Badge Description */}
                <p className="text-[10px] text-center text-gray-400 line-clamp-2">
                  {badge.description}
                </p>

                {/* Unlocked Date */}
                {badge.unlocked && badge.unlocked_at && (
                  <p className="text-[9px] text-center text-cyan-500 mt-1">
                    {new Date(badge.unlocked_at).toLocaleDateString('it-IT')}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {badges.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            Nessun badge disponibile al momento
          </p>
        )}
      </CardContent>
    </Card>
  );
};