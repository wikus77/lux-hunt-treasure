/**
 * TimeRing — SVG temporal ring (M1SSION™). Color tiers: >72h blue, ≤72h purple, ≤24h red (from days→hours approx).
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface TimeRingProps {
  remainingDays: number;
  totalDays: number;
  onTap: () => void;
  badge: React.ReactNode;
  caption: string;
  ariaLabel: string;
}

const R = 22;
const CIRC = 2 * Math.PI * R;

function tierFromDays(remainingDays: number): 'calm' | 'mid' | 'critical' {
  const h = Math.max(0, remainingDays) * 24;
  if (h > 72) return 'calm';
  if (h > 24) return 'mid';
  return 'critical';
}

export function TimeRing({ remainingDays, totalDays, onTap, badge, caption, ariaLabel }: TimeRingProps) {
  const progress = useMemo(() => {
    const t = totalDays > 0 ? totalDays : 30;
    return Math.min(1, Math.max(0, (t - remainingDays) / t));
  }, [remainingDays, totalDays]);

  const tier = tierFromDays(remainingDays);
  const stroke =
    tier === 'calm'
      ? 'rgba(56, 189, 248, 0.95)'
      : tier === 'mid'
        ? 'rgba(167, 139, 250, 0.95)'
        : 'rgba(248, 113, 113, 0.98)';
  const glow =
    tier === 'calm'
      ? '0 0 20px rgba(56, 189, 248, 0.35)'
      : tier === 'mid'
        ? '0 0 22px rgba(139, 92, 246, 0.4)'
        : '0 0 24px rgba(239, 68, 68, 0.45)';

  const urgentPulse = tier === 'critical';

  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="pointer-events-auto relative flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border border-white/12"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(20, 18, 28, 0.95) 0%, rgba(8, 8, 14, 0.98) 100%)',
        boxShadow: glow,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      animate={urgentPulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={urgentPulse ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
    >
      <span className="absolute -right-0.5 -top-0.5 z-10 max-w-[52px] truncate rounded-full border border-white/20 bg-black/55 px-1 py-0.5 text-[7px] font-bold leading-none text-white/95 shadow-md">
        {badge}
      </span>
      <motion.div
        className="relative flex h-[58px] w-[58px] items-center justify-center"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="58" height="58" viewBox="0 0 58 58" className="absolute" aria-hidden>
          <circle cx="29" cy="29" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
          <circle
            cx="29"
            cy="29"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform="rotate(-90 29 29)"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.5))' }}
          />
        </svg>
        <span
          className="relative text-lg font-black tabular-nums leading-none"
          style={{ color: stroke, textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}
        >
          {remainingDays}
        </span>
      </motion.div>
      <span
        className="mt-0.5 max-w-[76px] px-1 text-center text-[7px] font-semibold text-white/80"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {caption}
      </span>
    </motion.button>
  );
}
