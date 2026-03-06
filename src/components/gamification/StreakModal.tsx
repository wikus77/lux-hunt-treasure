/**
 * STREAK MODAL™ - Note-style fullscreen (MapPillFlipOverlay)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Gift, X, Check, Sparkles } from 'lucide-react';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { emitM1UCreditEvent } from '@/features/m1u/m1uCreditEvent';

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

// 🆕 FIX 16/01/2026: Aggiunto m1uReward per ogni milestone (names via i18n)
const MILESTONES = [
  { days: 5, icon: '🔥', key: 'streak_milestone_5', color: '#FF6B35', m1uReward: 25 },
  { days: 10, icon: '🔥', key: 'streak_milestone_10', color: '#FF4500', m1uReward: 25 },
  { days: 15, icon: '🌋', key: 'streak_milestone_15', color: '#DC143C', m1uReward: 50 },
  { days: 25, icon: '⚡', key: 'streak_milestone_25', color: '#FFD700', m1uReward: 75 },
  { days: 30, icon: '🏆', key: 'streak_milestone_30', color: '#00D1FF', m1uReward: 100 },
  { days: 50, icon: '💎', key: 'streak_milestone_50', color: '#00BFFF', m1uReward: 150 },
  { days: 100, icon: '👑', key: 'streak_milestone_100', color: '#9B59B6', m1uReward: 300 },
];

// 🆕 FIX 16/01/2026: M1U giornalieri per check-in
const DAILY_M1U_REWARD = 2;

// Glass card — matches Note modal (DevNotesPanel)
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(25, 25, 35, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
    ...style
  }}>{children}</div>
);

export function StreakModal({ isOpen, onClose, onCheckInComplete }: StreakModalProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🆕 FIX 07/02/2026: Funzione per award M1U - FIXED parameter name
  const awardM1U = async (amount: number, reason: string): Promise<boolean> => {
    if (!user || amount <= 0) return false;
    
    try {
      // 🔧 FIX: Il parametro è p_reason, non p_source!
      const { error } = await supabase.rpc('admin_credit_m1u', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason
      });
      
      if (error) {
        console.warn('[StreakModal] M1U award failed:', error);
        // Fallback: prova direct update
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('m1_units')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ m1_units: (profile.m1_units || 0) + amount })
              .eq('id', user.id);
            
            if (!updateError) {
              console.log(`[StreakModal] ✅ +${amount} M1U awarded via fallback (${reason})`);
              return true;
            }
          }
        } catch (fallbackErr) {
          console.error('[StreakModal] Fallback M1U award failed:', fallbackErr);
        }
        return false;
      }
      
      console.log(`[StreakModal] ✅ +${amount} M1U awarded (${reason})`);
      return true;
    } catch (err) {
      console.error('[StreakModal] M1U award error:', err);
      return false;
    }
  };

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

      // 🆕 FIX 16/01/2026: Award daily M1U (+2 M1U)
      await awardM1U(DAILY_M1U_REWARD, 'streak_daily_checkin');
      
      hapticSuccess();
      setShowSuccess(true);
      setCanCheckIn(false);
      
      // 🆕 FIX 16/01/2026: Check milestone e award M1U bonus
      const milestone = MILESTONES.find(m => m.days === newStreak);
      let totalM1U = DAILY_M1U_REWARD;
      
      if (milestone) {
        const milestoneAwarded = await awardM1U(milestone.m1uReward, `streak_milestone_${milestone.days}`);
        if (milestoneAwarded) {
          totalM1U += milestone.m1uReward;
          toast.success(`🎉 ${t(milestone.key)}! +${milestone.m1uReward} M1U!`, { duration: 5000 });
        } else {
          toast.success(`🎉 ${t('streak_toast_badge')}: ${t(milestone.key)}!`);
        }
      } else if (streakBroken) {
        toast.warning(`⚠️ ${t('streak_toast_reset')}`);
      } else {
        toast.success(`🔥 ${t('streak_toast_days')}: ${newStreak} ${t('streak_days_label')}! +${DAILY_M1U_REWARD} M1U`, { duration: 3000 });
      }
      
      emitM1UCreditEvent(totalM1U, 'streak');
      
      setTimeout(() => {
        setShowSuccess(false);
        onCheckInComplete?.();
        loadStreakInfo();
      }, 2000);

    } catch (err) {
      console.error('Check-in error:', err);
      toast.error(t('streak_error_checkin'));
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
    <>
      <MapPillFlipOverlay open={isOpen} originRect={null} onClose={onClose}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {/* HEADER — same as Note modal */}
          <div style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.8) 0%, rgba(0, 100, 150, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>
                  🔥 {t('streak_title')}
                </h1>
              </div>
              <div style={{ width: '40px' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', textAlign: 'center' }}>{t('streak_subtitle')}</p>
          </div>

          {/* CONTENT — scrollable, same as Note modal */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}>
            {loading ? (
              <GlassCard style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '28px', height: '28px', border: '2px solid rgba(0, 209, 255, 0.3)', borderTopColor: '#00D1FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Loading…</p>
              </GlassCard>
            ) : (
              <>
                {/* Main Stats */}
                <GlassCard style={{ marginBottom: '16px' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <p className="text-4xl font-orbitron font-bold" style={{ color: '#00FF88' }}>{streak}</p>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{t('streak_days')}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <p className="text-4xl font-orbitron font-bold" style={{ color: '#00D1FF' }}>{streakInfo?.longest_streak || 0}</p>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{t('streak_record')}</p>
                  </div>
                </div>
                </GlassCard>

                {/* Progress to Next Badge */}
                {streakInfo?.next_milestone && (
                  <GlassCard style={{ marginBottom: '16px' }}>
                    <div className="flex justify-between text-sm mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      <span>{t('streak_next_badge')}: {MILESTONES.find(m => m.days === streakInfo.next_milestone) && t(MILESTONES.find(m => m.days === streakInfo.next_milestone)!.key)}</span>
                      <span>{streakInfo.days_to_next_milestone} {t('streak_days_label')}</span>
                    </div>
                    <div className="h-3 bg-black/30 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      />
                    </div>
                  </GlassCard>
                )}

                {/* Bonus Section */}
                <GlassCard style={{ marginBottom: '16px' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div style={{ padding: 12, borderRadius: 12, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4" style={{ color: '#c084fc' }} />
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.95)' }}>{t('streak_pe_bonus')}</span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: '#e9d5ff' }}>+{Math.round((peMultiplier - 1) * 100)}%</p>
                  </div>
                  <div style={{ padding: 12, borderRadius: 12, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4" style={{ color: '#22d3ee' }} />
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.95)' }}>{t('streak_m1u_bonus')}</span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: '#67e8f9' }}>+{m1uBonus}%</p>
                  </div>
                </div>
                </GlassCard>

                {/* Milestones */}
                <GlassCard style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.95)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{t('streak_badge_title')}</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {MILESTONES.slice(0, 5).map((m) => (
                      <div
                        key={m.days}
                        className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                          streak >= m.days
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40'
                            : 'bg-black/20 border border-white/10'
                        }`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: streak >= m.days ? '#4ade80' : 'rgba(255,255,255,0.7)' }}>{m.days}g</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Check-in Button */}
                <motion.button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn || checkingIn}
                  whileHover={canCheckIn ? { scale: 1.02 } : {}}
                  whileTap={canCheckIn ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%',
                    height: 56,
                    fontSize: '16px',
                    fontWeight: 700,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    background: canCheckIn ? 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)' : 'rgba(100,100,100,0.3)',
                    border: 'none',
                    color: canCheckIn ? '#000' : 'rgba(255,255,255,0.6)',
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
                      {t('streak_checkin_cta')}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {t('streak_completed_today')}
                    </>
                  )}
                </motion.button>

                {!canCheckIn && (
                  <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginTop: 16 }}>
                    {t('streak_tomorrow_hint')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </MapPillFlipOverlay>

      {/* Success overlay: portal to body — z-index above MapPillFlipOverlay (99999), no clipping */}
      {typeof document !== 'undefined' && isOpen && createPortal(
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(10, 10, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                paddingTop: 'env(safe-area-inset-top, 0)',
                paddingBottom: 'env(safe-area-inset-bottom, 0)',
                paddingLeft: 'env(safe-area-inset-left, 0)',
                paddingRight: 'env(safe-area-inset-right, 0)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.1, 1] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1 }}
                  style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <Check style={{ width: 40, height: 40, color: '#FFFFFF' }} />
                </motion.div>
                <p style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, opacity: 0.95 }}>
                  {t('streak_success_title')}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default StreakModal;

