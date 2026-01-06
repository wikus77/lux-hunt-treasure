/**
 * STREAK MODAL™ - Futuristic M1SSION Style
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Zap, Gift, X, Check, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInComplete?: () => void;
}

interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  next_milestone: number | null;
  days_to_next_milestone: number;
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

export function StreakModal({ isOpen, onClose, onCheckInComplete }: StreakModalProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) loadStreakInfo();
  }, [isOpen, user]);

  const loadStreakInfo = async () => {
    if (!user) return;
    setLoading(true);

    try {
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
        });

        const today = new Date().toISOString().split('T')[0];
        setCanCheckIn(profile.last_check_in_date !== today);
      }
    } catch (err) {
      console.error('Error loading streak:', err);
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
      }

      // Calculate PE with multiplier
      const basePE = 10;
      const multiplier = Math.min(1 + newStreak * 0.05, 1.5);
      const peAwarded = Math.round(basePE * multiplier);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak_days: newStreak,
          longest_streak_days: Math.max(newStreak, streakInfo?.longest_streak || 0),
          last_check_in_date: today
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp_amount: peAwarded,
        p_source: 'daily_checkin'
      });

      hapticSuccess();
      setShowSuccess(true);
      setCanCheckIn(false);
      
      setTimeout(() => {
        setShowSuccess(false);
        onCheckInComplete?.();
        loadStreakInfo();
      }, 2000);

      if (streakBroken) {
        toast.warning('⚠️ Streak resettata! Ricomincia da 1');
      } else {
        const milestone = MILESTONES.find(m => m.days === newStreak);
        if (milestone) {
          toast.success(`🎉 Badge sbloccato: ${milestone.name}!`);
        } else {
          toast.success(`🔥 Streak: ${newStreak} giorni! +${peAwarded} PE`);
        }
      }

    } catch (err) {
      console.error('Check-in error:', err);
      toast.error('Errore durante il check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  const streak = streakInfo?.current_streak || 0;
  const progress = streakInfo?.next_milestone 
    ? ((streak / streakInfo.next_milestone) * 100)
    : 100;
  const peMultiplier = Math.min(1 + streak * 0.05, 1.5);
  const m1uBonus = Math.min(streak * 2, 30);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 bg-transparent border-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
            border: '2px solid rgba(0, 255, 136, 0.5)',
            boxShadow: '0 0 60px rgba(0, 255, 136, 0.3), 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Ambient Glow - Green */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.2) 0%, transparent 60%)',
              borderRadius: '24px',
            }}
          />

          {/* Content */}
          <div className="relative p-6">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Success Animation Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 1 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <p className="text-xl font-bold text-white">Check-in Completato!</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative inline-block mb-4"
              >
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                    boxShadow: '0 8px 30px rgba(0, 255, 136, 0.5)',
                  }}
                >
                  <Flame className="w-10 h-10 text-black" />
                </div>
                <motion.div
                  className="absolute -inset-3 rounded-2xl"
                  style={{ border: '2px solid rgba(0, 255, 136, 0.4)' }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h2 
                className="text-2xl font-orbitron font-bold mb-2"
                style={{ 
                  color: '#00FF88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
                }}
              >
                🔥 STREAK SYSTEM
              </h2>
              <p className="text-white/70 text-sm">Accedi ogni giorno per bonus esclusivi</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    className="p-5 rounded-xl text-center"
                    style={{
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                    }}
                  >
                    <p 
                      className="text-4xl font-orbitron font-bold"
                      style={{ 
                        color: '#00FF88',
                        textShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
                      }}
                    >
                      {streak}
                    </p>
                    <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Giorni Streak</p>
                  </div>
                  <div 
                    className="p-5 rounded-xl text-center"
                    style={{
                      background: 'rgba(0, 209, 255, 0.1)',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                    }}
                  >
                    <p 
                      className="text-4xl font-orbitron font-bold"
                      style={{ 
                        color: '#00D1FF',
                        textShadow: '0 0 15px rgba(0, 209, 255, 0.5)',
                      }}
                    >
                      {streakInfo?.longest_streak || 0}
                    </p>
                    <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Record</p>
                  </div>
                </div>

                {/* Progress to Next Badge */}
                {streakInfo?.next_milestone && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Prossimo badge: {MILESTONES.find(m => m.days === streakInfo.next_milestone)?.name}</span>
                      <span>{streakInfo.days_to_next_milestone} giorni</span>
                    </div>
                    <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  </div>
                )}

                {/* Bonus Section */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.div 
                    className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">PE Bonus</span>
                    </div>
                    <p className="text-lg font-bold text-purple-300">
                      +{Math.round((peMultiplier - 1) * 100)}%
                    </p>
                  </motion.div>
                  <motion.div 
                    className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-gray-400">M1U Bonus</span>
                    </div>
                    <p className="text-lg font-bold text-cyan-300">+{m1uBonus}%</p>
                  </motion.div>
                </div>

                {/* Milestones */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Badge Streak</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {MILESTONES.slice(0, 5).map((m) => (
                      <motion.div
                        key={m.days}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                          streak >= m.days
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40'
                            : 'bg-gray-800/30 border border-gray-700/30'
                        }`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span className={`text-[10px] font-bold ${streak >= m.days ? 'text-green-400' : 'text-gray-500'}`}>
                          {m.days}g
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Check-in Button */}
                <motion.button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn || checkingIn}
                  whileHover={canCheckIn ? { scale: 1.02, boxShadow: '0 6px 35px rgba(0, 255, 136, 0.6)' } : {}}
                  whileTap={canCheckIn ? { scale: 0.98 } : {}}
                  className="w-full h-14 text-lg font-orbitron font-bold rounded-xl transition-all flex items-center justify-center gap-3"
                  style={{
                    background: canCheckIn 
                      ? 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)' 
                      : 'rgba(100,100,100,0.3)',
                    border: 'none',
                    color: canCheckIn ? '#000' : 'rgba(255,255,255,0.4)',
                    boxShadow: canCheckIn ? '0 4px 25px rgba(0, 255, 136, 0.4)' : 'none',
                    cursor: canCheckIn ? 'pointer' : 'not-allowed',
                  }}
                >
                  {checkingIn ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : canCheckIn ? (
                    <>
                      <Flame className="w-5 h-5" />
                      CHECK-IN GIORNALIERO
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      COMPLETATO OGGI
                    </>
                  )}
                </motion.button>

                {!canCheckIn && (
                  <p className="text-center text-xs text-white/50 mt-4">
                    Torna domani per continuare la streak!
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default StreakModal;

