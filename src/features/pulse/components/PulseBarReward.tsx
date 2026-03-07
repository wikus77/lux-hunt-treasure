/**
 * THE PULSE™ — Reward Pulse Bar (Energy Injection)
 * Fullscreen reward: animation based on DELTA so +5 / +10 are always visibly impactful.
 * Phases: orb emerge → inject beam → fill bar → final pulse → CTA.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const REWARD_COLOR = '#00e7ff';
const BAR_WIDTH = 320;
const SPHERE_SIZE = 40;

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

type Phase = 'orb' | 'inject' | 'fill' | 'pulse' | 'done';

export const PulseBarReward: React.FC<PulseBarRewardProps> = ({
  amount,
  source,
  preValue = 0,
  postValue,
  onAnimationComplete,
}) => {
  const { t } = useTranslation();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [phase, setPhase] = useState<Phase>('orb');

  const postDisplay = postValue ?? preValue + amount;

  // Display amount steps 0 → amount (for +N PE text)
  useEffect(() => {
    let cancelled = false;
    const steps = Math.min(Math.max(amount, 1), 40);
    const stepValue = amount / steps;
    const interval = 320 / steps;
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

  // Phase sequence: orb (0–400ms) → inject (400–900ms) → fill (900–2200ms) → pulse (2200–2600ms) → done
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('inject'), 400);
    const t2 = setTimeout(() => setPhase('fill'), 900);
    const t3 = setTimeout(() => setPhase('pulse'), 2200);
    const t4 = setTimeout(() => {
      setPhase('done');
      onAnimationComplete?.();
    }, 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onAnimationComplete]);

  // Fill is based on DELTA only: 0% → 100% as displayAmount goes 0 → amount. Always visually full for any +N.
  const rewardFillPercent = amount <= 0 ? 0 : Math.min(100, (displayAmount / amount) * 100);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Title */}
      <motion.div
        className="text-lg font-medium text-white/90 uppercase tracking-wider"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {t('pe_reward.title')}
      </motion.div>

      {/* Bar container with beam sweep + glow */}
      <div className="relative w-full flex flex-col items-center" style={{ width: BAR_WIDTH }}>
        {/* Light sweep / beam (during fill phase) */}
        {phase !== 'orb' && phase !== 'done' && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{ width: BAR_WIDTH, height: 36 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'pulse' ? 0 : 0.4 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute top-0 bottom-0 w-24"
              style={{
                background: `linear-gradient(90deg, transparent, ${REWARD_COLOR}55, transparent)`,
                boxShadow: `0 0 40px ${REWARD_COLOR}80`,
              }}
              animate={{ x: [0, BAR_WIDTH + 48] }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], repeat: phase === 'fill' ? 0 : 0 }}
            />
          </motion.div>
        )}

        <div className="relative w-full" style={{ width: BAR_WIDTH, height: 32 }}>
          {/* Track */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `2px solid ${REWARD_COLOR}40`,
              boxShadow: `inset 0 0 28px ${REWARD_COLOR}12`,
            }}
          >
            {/* Fill — delta-only: 0 to 100% of bar for the reward */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 rounded-full origin-left"
              style={{
                width: '100%',
                background: `linear-gradient(90deg, ${REWARD_COLOR}88, ${REWARD_COLOR})`,
                boxShadow: `0 0 28px ${REWARD_COLOR}99, 0 0 56px ${REWARD_COLOR}44`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: rewardFillPercent / 100 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Orb — enters from right, travels with fill */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: SPHERE_SIZE,
              height: SPHERE_SIZE,
              left: 0,
              top: '50%',
              marginTop: -SPHERE_SIZE / 2,
              background: `radial-gradient(circle at 30% 30%, #fff, ${REWARD_COLOR})`,
              boxShadow: `0 0 32px ${REWARD_COLOR}, 0 0 64px ${REWARD_COLOR}70`,
            }}
            initial={{ x: BAR_WIDTH + SPHERE_SIZE, opacity: 0.6, scale: 0.8 }}
            animate={{
              x: (rewardFillPercent / 100) * BAR_WIDTH - SPHERE_SIZE / 2,
              opacity: phase === 'done' ? 0.4 : 1,
              scale: phase === 'pulse' ? 1.2 : phase === 'done' ? 0.9 : 1.1,
            }}
            transition={{
              x: { duration: 1, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.25 },
              scale: { duration: 0.2 },
            }}
          />

          {/* Final pulse glow */}
          {phase === 'pulse' && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: `0 0 48px ${REWARD_COLOR}60, 0 0 96px ${REWARD_COLOR}30`,
                background: 'transparent',
              }}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.5 }}
            />
          )}
          {phase === 'done' && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `0 0 32px ${REWARD_COLOR}30` }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </div>
      </div>

      {/* +N PE — primary message */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      >
        <span
          className="text-4xl sm:text-5xl font-black tabular-nums"
          style={{
            color: REWARD_COLOR,
            textShadow: `0 0 32px ${REWARD_COLOR}99, 0 0 64px ${REWARD_COLOR}66, 0 2px 4px rgba(0,0,0,0.8)`,
          }}
        >
          +{formatPE(displayAmount)} PE
        </span>
        {postValue != null && (
          <span className="text-sm text-white/60 font-mono tabular-nums">
            {t('pe_reward.new_total')} {formatPE(postDisplay)} PE
          </span>
        )}
      </motion.div>

      {/* Source label */}
      {source && (
        <motion.span
          className="text-xs text-white/50 uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.25 }}
        >
          {t(`pe_reward.source_${source}`) || source}
        </motion.span>
      )}
    </div>
  );
};
