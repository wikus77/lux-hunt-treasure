/**
 * THE PULSE™ — Reward Pulse Bar (Energy Injection)
 * Fullscreen reward variant: sphere/impulse enters bar, glow, PE value increment.
 * No side-effects (Buzz/PulseBreaker); for use inside GlobalPERewardOverlay only.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const REWARD_COLOR = '#00e7ff';
const BAR_WIDTH = 280;
const SPHERE_SIZE = 32;

export interface PulseBarRewardProps {
  amount: number;
  source: string;
  preValue?: number;
  postValue?: number;
  onAnimationComplete?: () => void;
}

function formatPE(pe: number): string {
  if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
  if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
  return pe.toString();
}

export const PulseBarReward: React.FC<PulseBarRewardProps> = ({
  amount,
  source,
  preValue = 0,
  postValue,
  onAnimationComplete,
}) => {
  const { t } = useTranslation();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [phase, setPhase] = useState<'inject' | 'fill' | 'done'>('inject');

  const targetDisplay = postValue ?? preValue + amount;

  useEffect(() => {
    let cancelled = false;
    const steps = Math.min(Math.max(amount, 1), 40);
    const stepValue = amount / steps;
    const interval = 350 / steps;
    let current = 0;
    const id = setInterval(() => {
      if (cancelled) return;
      current += stepValue;
      if (current >= amount) {
        setDisplayAmount(amount);
        clearInterval(id);
      } else {
        setDisplayAmount(Math.round(current));
      }
    }, interval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [amount]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fill'), 650);
    const t2 = setTimeout(() => {
      setPhase('done');
      onAnimationComplete?.();
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onAnimationComplete]);

  const fillPercent = Math.min(100, (displayAmount / Math.max(1, targetDisplay)) * 100);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <motion.div
        className="text-lg font-medium text-white/90 uppercase tracking-wider"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {t('pe_reward.title')}
      </motion.div>

      <div className="relative w-full" style={{ width: BAR_WIDTH, height: 28 }}>
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${REWARD_COLOR}50`,
            boxShadow: `inset 0 0 24px ${REWARD_COLOR}15`,
          }}
        >
          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full origin-left"
            style={{
              width: '100%',
              background: `linear-gradient(90deg, ${REWARD_COLOR}70, ${REWARD_COLOR})`,
              boxShadow: `0 0 24px ${REWARD_COLOR}90`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: fillPercent / 100 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: SPHERE_SIZE,
            height: SPHERE_SIZE,
            left: 0,
            top: '50%',
            marginTop: -SPHERE_SIZE / 2,
            background: `radial-gradient(circle at 30% 30%, #fff, ${REWARD_COLOR})`,
            boxShadow: `0 0 28px ${REWARD_COLOR}, 0 0 56px ${REWARD_COLOR}60`,
          }}
          initial={{ x: BAR_WIDTH + SPHERE_SIZE, opacity: 0.7, scale: 0.85 }}
          animate={{
            x: phase === 'inject' ? -SPHERE_SIZE / 2 : (fillPercent / 100) * BAR_WIDTH - SPHERE_SIZE / 2,
            opacity: phase === 'done' ? 0.35 : 1,
            scale: phase === 'done' ? 0.85 : 1.1,
          }}
          transition={{
            x: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3 },
            scale: { duration: 0.25 },
          }}
        />
        {phase === 'done' && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 40px ${REWARD_COLOR}40` }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>

      <motion.div
        className="flex items-baseline gap-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <span
          className="text-4xl font-black tabular-nums"
          style={{ color: REWARD_COLOR, textShadow: `0 0 24px ${REWARD_COLOR}80` }}
        >
          +{formatPE(amount)} PE
        </span>
      </motion.div>

      {source && (
        <motion.span
          className="text-xs text-white/50 uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {t(`pe_reward.source_${source}`) || source}
        </motion.span>
      )}
    </div>
  );
};
