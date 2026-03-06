// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Streak Widget with M1SSION Premium Design
// 🔒 AAA+ Analytics Integration (17/01/2026)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Zap, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { useAwardPE } from '@/features/pulse/hooks/useAwardPE';
import { trackStreak } from '@/lib/analytics';
import { emitM1UCreditEvent } from '@/features/m1u/m1uCreditEvent';

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

// 🆕 M1U REWARDS per milestone
const MILESTONES = [
  { days: 5, icon: '🔥', name: 'Fiamma Nascente', color: '#FF6B35', m1uReward: 25 },
  { days: 10, icon: '🔥', name: 'Fiamma Ardente', color: '#FF4500', m1uReward: 25 },
  { days: 15, icon: '🌋', name: 'Inferno', color: '#DC143C', m1uReward: 50 },
  { days: 25, icon: '⚡', name: 'Leggenda Streak', color: '#FFD700', m1uReward: 75 },
  { days: 30, icon: '🏆', name: 'Campione Missione', color: '#00D1FF', m1uReward: 100 },
  { days: 50, icon: '💎', name: 'Diamante', color: '#00BFFF', m1uReward: 150 },
  { days: 100, icon: '👑', name: 'Re della Streak', color: '#9B59B6', m1uReward: 300 },
];

// 🆕 M1U giornalieri per check-in
const DAILY_M1U_REWARD = 2;

export function StreakWidget({ compact = false, onCheckIn }: StreakWidgetProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState<typeof MILESTONES[0] | null>(null);
  const [showM1UReward, setShowM1UReward] = useState<{ amount: number; isMilestone: boolean } | null>(null);
  
  // 🔋 PE System Hook
  const { awardPE } = useAwardPE();
  
  // 🆕 Award M1U function
  const awardM1U = async (amount: number, source: string) => {
    if (!user || amount <= 0) return;
    
    try {
      const { data, error } = await supabase.rpc('admin_credit_m1u', {
        p_user_id: user.id,
        p_amount: amount,
        p_source: source
      });
      
      if (error) {
        console.warn('[Streak] M1U award failed:', error);
        return false;
      }
      
      console.log(`[Streak] ✅ +${amount} M1U awarded (${source})`);
      return true;
    } catch (err) {
      console.error('[Streak] M1U award error:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadStreakInfo();
    }
  }, [user]);

  // 🔒 Track streak viewed when widget mounts with data
  useEffect(() => {
    if (streakInfo && user) {
      trackStreak('daily_streak_viewed', {
        streak_day: streakInfo.current_streak,
        source: 'widget',
        last_completed_at: streakInfo.last_check_in || undefined,
      });
    }
  }, [streakInfo, user]);

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

      // 🔋 Award PE for Daily Login (+5 PE)
      awardPE('DAILY_LOGIN', undefined, {
        streakDays: newStreak,
        streakBroken,
      }).catch(err => console.warn('[PE] Daily login award failed:', err));

      // 🔒 AAA+ Analytics: Track streak event
      if (streakBroken) {
        trackStreak('daily_streak_broken', {
          streak_day: newStreak,
          source: 'widget',
          last_completed_at: lastCheckIn || undefined,
        });
      } else if (newStreak === 1) {
        trackStreak('daily_streak_started', {
          streak_day: 1,
          source: 'widget',
        });
      } else {
        trackStreak('daily_streak_incremented', {
          streak_day: newStreak,
          source: 'widget',
          last_completed_at: yesterday,
        });
      }

      // 🆕 Award daily M1U (+2 M1U)
      await awardM1U(DAILY_M1U_REWARD, 'streak_daily_checkin');
      
      hapticSuccess();
      
      // Check if milestone reached
      const milestone = MILESTONES.find(m => m.days === newStreak);
      if (milestone) {
        // 🆕 Award milestone M1U bonus!
        const milestoneAwarded = await awardM1U(milestone.m1uReward, `streak_milestone_${milestone.days}`);
        
        setShowBadgeAnimation(milestone);
        setTimeout(() => setShowBadgeAnimation(null), 3000);
        
        // 🆕 Show M1U reward popup
        if (milestoneAwarded) {
          setShowM1UReward({ amount: milestone.m1uReward, isMilestone: true });
          setTimeout(() => setShowM1UReward(null), 4000);
          toast.success(`🎉 ${milestone.name}! +${milestone.m1uReward} M1U!`, { duration: 5000 });
        } else {
          toast.success(`🎉 Nuovo badge sbloccato: ${milestone.name}!`);
        }
        
        emitM1UCreditEvent(milestone.m1uReward + DAILY_M1U_REWARD, 'streak');

        // 🔒 AAA+ Analytics: Track milestone reached
        trackStreak('daily_streak_incremented', {
          streak_day: newStreak,
          source: 'widget',
          milestone_name: milestone.name,
          milestone_reward: milestone.m1uReward,
        });
      } else if (streakBroken) {
        toast.warning('⚠️ Streak resettata! Ricomincia da 1 giorno');
        // Still give daily M1U
        setShowM1UReward({ amount: DAILY_M1U_REWARD, isMilestone: false });
        setTimeout(() => setShowM1UReward(null), 3000);
      } else {
        toast.success(`🔥 Streak: ${newStreak} giorni! +${DAILY_M1U_REWARD} M1U`, { duration: 3000 });
        setShowM1UReward({ amount: DAILY_M1U_REWARD, isMilestone: false });
        setTimeout(() => setShowM1UReward(null), 3000);
        
        emitM1UCreditEvent(DAILY_M1U_REWARD, 'streak');
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
              {/* 🆕 M1U Reward display */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg"
              >
                <p className="text-lg font-bold text-green-400">+{showBadgeAnimation.m1uReward} M1U</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 🆕 M1U Reward Popup (Green style) */}
      <AnimatePresence>
        {showM1UReward && !showBadgeAnimation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-0 left-0 right-0 z-40 flex justify-center"
          >
            <div className={`px-4 py-2 rounded-xl border ${
              showM1UReward.isMilestone 
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-500/50'
                : 'bg-green-500/20 border-green-500/40'
            } backdrop-blur-sm shadow-lg shadow-green-500/20`}>
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-lg font-bold text-green-400 flex items-center gap-2"
              >
                💰 +{showM1UReward.amount} M1U
                {showM1UReward.isMilestone && <span className="text-yellow-400">🎉</span>}
              </motion.p>
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


