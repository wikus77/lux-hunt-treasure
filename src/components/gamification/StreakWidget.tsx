// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Streak Widget with M1SSION Premium Design

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Zap, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  next_milestone: number | null;
  days_to_next_milestone: number;
  xp_multiplier: number;
  m1u_bonus_percent: number;
}

interface StreakWidgetProps {
  compact?: boolean;
  onCheckIn?: () => void;
}

const MILESTONES = [
  { days: 5, icon: '🔥', name: 'Fiamma Nascente', color: '#FF6B35' },
  { days: 10, icon: '🔥', name: 'Fiamma Ardente', color: '#FF4500' },
  { days: 15, icon: '🌋', name: 'Inferno', color: '#DC143C' },
  { days: 25, icon: '⚡', name: 'Leggenda Streak', color: '#FFD700' },
  { days: 30, icon: '🏆', name: 'Campione Missione', color: '#00D1FF' },
  { days: 50, icon: '💎', name: 'Diamante', color: '#00BFFF' },
  { days: 100, icon: '👑', name: 'Re della Streak', color: '#9B59B6' },
];

export function StreakWidget({ compact = false, onCheckIn }: StreakWidgetProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState<typeof MILESTONES[0] | null>(null);

  useEffect(() => {
    if (user) {
      loadStreakInfo();
    }
  }, [user]);

  const loadStreakInfo = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get streak info from RPC function
      const { data, error } = await supabase.rpc('get_user_streak_info', {
        p_user_id: user.id
      });

      if (error) {
        // Fallback to direct query if RPC doesn't exist yet
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_streak_days, longest_streak_days, last_check_in_date')
          .eq('id', user.id)
          .single();

        if (profile) {
          const streak = profile.current_streak_days || 0;
          const nextMilestone = MILESTONES.find(m => streak < m.days)?.days || null;
          
          setStreakInfo({
            current_streak: streak,
            longest_streak: profile.longest_streak_days || 0,
            last_check_in: profile.last_check_in_date,
            next_milestone: nextMilestone,
            days_to_next_milestone: nextMilestone ? nextMilestone - streak : 0,
            xp_multiplier: Math.min(1 + streak * 0.05, 1.5),
            m1u_bonus_percent: Math.min(streak * 2, 30)
          });

          // Check if already checked in today
          const today = new Date().toISOString().split('T')[0];
          setCanCheckIn(profile.last_check_in_date !== today);
        }
      } else if (data) {
        setStreakInfo(data as StreakInfo);
        const today = new Date().toISOString().split('T')[0];
        setCanCheckIn(data.last_check_in !== today);
      }
    } catch (err) {
      console.error('Error loading streak info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user || !canCheckIn || checkingIn) return;
    
    hapticLight();
    setCheckingIn(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const currentStreak = streakInfo?.current_streak || 0;
      const lastCheckIn = streakInfo?.last_check_in;
      
      let newStreak = 1;
      let streakBroken = false;
      
      if (lastCheckIn === yesterday) {
        newStreak = currentStreak + 1;
      } else if (lastCheckIn && lastCheckIn !== today) {
        streakBroken = true;
        newStreak = 1;
      } else if (!lastCheckIn) {
        newStreak = 1;
      }

      // Calculate XP with multiplier
      const baseXP = 10;
      const multiplier = Math.min(1 + newStreak * 0.05, 1.5);
      const xpAwarded = Math.round(baseXP * multiplier);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak_days: newStreak,
          longest_streak_days: Math.max(newStreak, streakInfo?.longest_streak || 0),
          last_check_in_date: today
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Award XP
      await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp_amount: xpAwarded,
        p_source: 'daily_checkin'
      });

      hapticSuccess();
      
      // Check if milestone reached
      const milestone = MILESTONES.find(m => m.days === newStreak);
      if (milestone) {
        setShowBadgeAnimation(milestone);
        setTimeout(() => setShowBadgeAnimation(null), 3000);
        toast.success(`🎉 Nuovo badge sbloccato: ${milestone.name}!`);
      } else if (streakBroken) {
        toast.warning('⚠️ Streak resettata! Ricomincia da 1 giorno');
      } else {
        toast.success(`🔥 Streak: ${newStreak} giorni! +${xpAwarded} PE`);
      }

      setCanCheckIn(false);
      onCheckIn?.();
      
      // Reload streak info
      await loadStreakInfo();

    } catch (err) {
      console.error('Error during check-in:', err);
      toast.error('Errore durante il check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="animate-pulse bg-gray-800/50 rounded-xl h-24" />
    );
  }

  const streak = streakInfo?.current_streak || 0;
  const progress = streakInfo?.next_milestone 
    ? ((streak / streakInfo.next_milestone) * 100)
    : 100;

  // Compact version for header/sidebar
  if (compact) {
    return (
      <motion.button
        onClick={canCheckIn ? handleCheckIn : undefined}
        disabled={checkingIn || !canCheckIn}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          canCheckIn 
            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 cursor-pointer'
            : 'bg-gray-800/50 border border-gray-700/30'
        }`}
      >
        <motion.div
          animate={canCheckIn ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className={`w-5 h-5 ${canCheckIn ? 'text-orange-400' : 'text-gray-500'}`} />
        </motion.div>
        <span className={`font-bold ${canCheckIn ? 'text-orange-300' : 'text-gray-400'}`}>
          {streak}
        </span>
        {canCheckIn && (
          <span className="text-xs text-orange-400/60">Check-in!</span>
        )}
      </motion.button>
    );
  }

  // Full widget version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Badge unlock animation overlay */}
      <AnimatePresence>
        {showBadgeAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-2"
              >
                {showBadgeAnimation.icon}
              </motion.div>
              <p className="text-xl font-bold text-white">{showBadgeAnimation.name}</p>
              <p className="text-sm text-gray-400">Badge Sbloccato!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main container */}
      <div className="relative bg-gradient-to-br from-[#1a1525] via-[#1a1a2e] to-[#0f172a] rounded-2xl border border-orange-500/20 p-4 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              {streak >= 5 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-xs"
                >
                  🔥
                </motion.div>
              )}
            </motion.div>
            <div>
              <p className="text-sm text-gray-400">Streak Corrente</p>
              <p className="text-2xl font-bold text-white">
                {streak} <span className="text-sm text-orange-400">giorni</span>
              </p>
            </div>
          </div>

          {/* Check-in button */}
          <Button
            onClick={handleCheckIn}
            disabled={!canCheckIn || checkingIn}
            size="sm"
            className={`${
              canCheckIn
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {checkingIn ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                ⏳
              </motion.div>
            ) : canCheckIn ? (
              '✓ Check-in'
            ) : (
              '✓ Fatto'
            )}
          </Button>
        </div>

        {/* Progress bar */}
        {streakInfo?.next_milestone && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Prossimo badge</span>
              <span>{streakInfo.days_to_next_milestone} giorni</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-orange-400">{streak} giorni</span>
              <span className="text-gray-500">{streakInfo.next_milestone} giorni</span>
            </div>
          </div>
        )}

        {/* Bonuses */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Zap className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">PE Bonus</p>
              <p className="text-sm font-bold text-purple-300">
                +{Math.round((streakInfo?.xp_multiplier || 1) * 100 - 100)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Gift className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-xs text-gray-400">M1U Bonus</p>
              <p className="text-sm font-bold text-cyan-300">
                +{streakInfo?.m1u_bonus_percent || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Milestones preview */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Prossimi Badge</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MILESTONES.filter(m => m.days > streak).slice(0, 4).map((milestone) => (
              <motion.div
                key={milestone.days}
                whileHover={{ scale: 1.05 }}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg ${
                  streak >= milestone.days
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-gray-800/50 border border-gray-700/30'
                }`}
              >
                <span className="text-lg">{milestone.icon}</span>
                <span className="text-xs text-gray-300">{milestone.days}g</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Longest streak */}
        {(streakInfo?.longest_streak || 0) > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Trophy className="w-3 h-3" />
            <span>Record: {streakInfo?.longest_streak} giorni</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StreakWidget;


