/**
 * PULSE REWARD NOTIFICATION
 * Mostra notifiche animate quando si raggiungono soglie e si ricevono M1U
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Gift, Trophy, Sparkles, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface ThresholdReward {
  threshold: number;
  baseReward: number;
  bonusReward: number;
  totalReward: number;
  isContributor: boolean;
  cycleReset?: boolean;
  newCycleId?: number;
}

const THRESHOLD_CONFIG = {
  25: { icon: Zap, color: '#ff6b6b', label: '25%' },
  50: { icon: Gift, color: '#ffd93d', label: '50%' },
  75: { icon: Trophy, color: '#6bcb77', label: '75%' },
  100: { icon: Crown, color: '#4d96ff', label: '100% 🎉' },
};

export const PulseRewardNotification = () => {
  const { user } = useAuth();
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState<ThresholdReward | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for pulse threshold events
    const channel = supabase
      .channel('pulse_rewards')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pulse_rewards_log',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const reward = payload.new as any;
        console.log('[PULSE REWARD] 🎁 New reward received:', reward);
        
        // Show notification
        setCurrentReward({
          threshold: reward.threshold,
          baseReward: reward.base_reward,
          bonusReward: reward.bonus_reward,
          totalReward: reward.total_reward,
          isContributor: reward.is_contributor,
        });
        setShowReward(true);
        
        // Also show toast
        const config = THRESHOLD_CONFIG[reward.threshold as keyof typeof THRESHOLD_CONFIG];
        toast.success(
          `🎁 PULSE ${config.label} raggiunto! +${reward.total_reward} M1U${reward.is_contributor ? ' (con bonus contributore!)' : ''}`,
          {
            duration: 5000,
            style: {
              background: `linear-gradient(135deg, ${config.color}22 0%, #1a1a2e 100%)`,
              border: `2px solid ${config.color}`,
              color: 'white',
            },
          }
        );
      })
      .subscribe();

    // Also listen for cycle reset
    const pulseChannel = supabase
      .channel('pulse_cycle_reset')
      .on('broadcast', { event: 'pulse_cycle_reset' }, (payload) => {
        console.log('[PULSE] 🔄 Cycle reset:', payload);
        toast.info('⚡ PULSE Reset! Nuovo ciclo iniziato!', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #4d96ff22 0%, #1a1a2e 100%)',
            border: '2px solid #4d96ff',
            color: 'white',
          },
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(pulseChannel);
    };
  }, [user]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  if (!currentReward) return null;

  const config = THRESHOLD_CONFIG[currentReward.threshold as keyof typeof THRESHOLD_CONFIG];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {showReward && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Reward card */}
          <motion.div
            className="relative flex flex-col items-center p-8 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${config.color}33 0%, rgba(26, 26, 46, 0.95) 100%)`,
              border: `3px solid ${config.color}`,
              boxShadow: `0 0 60px ${config.color}66, 0 0 120px ${config.color}33`,
            }}
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              transition: { type: 'spring', damping: 15, stiffness: 200 }
            }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
          >
            {/* Sparkles animation */}
            <motion.div
              className="absolute -top-4 -left-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={32} style={{ color: config.color }} />
            </motion.div>
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={32} style={{ color: config.color }} />
            </motion.div>

            {/* Icon */}
            <motion.div
              className="mb-4 p-4 rounded-full"
              style={{ 
                background: `${config.color}33`,
                boxShadow: `0 0 30px ${config.color}66`,
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 30px ${config.color}66`,
                  `0 0 50px ${config.color}88`,
                  `0 0 30px ${config.color}66`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon size={48} style={{ color: config.color }} />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold mb-2 text-white text-center"
              style={{ textShadow: `0 0 20px ${config.color}` }}
            >
              PULSE {config.label} Raggiunto!
            </motion.h2>

            {/* Reward amount */}
            <motion.div
              className="flex items-center gap-2 text-4xl font-bold mb-4"
              style={{ color: config.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <span>+{currentReward.totalReward}</span>
              <span className="text-2xl">M1U</span>
            </motion.div>

            {/* Breakdown */}
            <div className="text-sm text-white/80 text-center space-y-1">
              <p>Ricompensa base: +{currentReward.baseReward} M1U</p>
              {currentReward.isContributor && currentReward.bonusReward > 0 && (
                <motion.p
                  className="font-semibold"
                  style={{ color: config.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  ⭐ Bonus Contributore: +{currentReward.bonusReward} M1U
                </motion.p>
              )}
            </div>

            {/* Cycle reset notice */}
            {currentReward.threshold === 100 && (
              <motion.p
                className="mt-4 text-xs text-cyan-400 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                🔄 Nuovo ciclo PULSE iniziato!
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


