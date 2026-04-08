/**
 * Tempo rimasto — circular progress ring (like MissionProfileEngineRing).
 * Shows remaining days, circular progress bar with pulse effect (like ActiveMissionBox).
 * Tier colors: >72h calm (blue), ≤72h mid (violet), ≤24h critical (red).
 */

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { TimeTierV3 } from './floatingPillsV3.types';

export interface FloatingTimeRingPillV3Props {
  remainingDays: number;
  totalDays: number;
  badge: React.ReactNode;
  caption: string;
  ariaLabel: string;
  onTap: () => void;
}

const SIZE = 72;
const STROKE_WIDTH = 6;
const R = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function tierFromRemainingDays(remainingDays: number): TimeTierV3 {
  const h = Math.max(0, remainingDays) * 24;
  if (h > 72) return 'calm';
  if (h > 24) return 'mid';
  return 'critical';
}

function tierColor(tier: TimeTierV3): string {
  if (tier === 'calm') return 'rgba(56, 189, 248, 0.95)';
  if (tier === 'mid') return 'rgba(167, 139, 250, 0.95)';
  return 'rgba(248, 113, 113, 0.98)';
}

function tierGradient(tier: TimeTierV3): { from: string; to: string } {
  if (tier === 'calm') return { from: '#38bdf8', to: '#0ea5e9' };
  if (tier === 'mid') return { from: '#a78bfa', to: '#8b5cf6' };
  return { from: '#f87171', to: '#ef4444' };
}

export function FloatingTimeRingPillV3({
  remainingDays,
  totalDays,
  badge,
  caption,
  ariaLabel,
  onTap,
}: FloatingTimeRingPillV3Props) {
  const reduce = useReducedMotion();
  const progress = useMemo(() => {
    const t = totalDays > 0 ? totalDays : 30;
    return Math.min(1, Math.max(0, (t - remainingDays) / t));
  }, [remainingDays, totalDays]);

  const progressPercent = useMemo(() => Math.round(progress * 100), [progress]);
  const tier = tierFromRemainingDays(remainingDays);
  const color = tierColor(tier);
  const gradient = tierGradient(tier);
  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  // Pulse logic like ActiveMissionBox: urgent when remainingDays <= 5, final when <= 0
  const isFinalDay = remainingDays <= 0;
  const isUrgent = remainingDays <= 5 && remainingDays > 0;
  const showPulse = isFinalDay || isUrgent;
  const pulseIntensity = useMemo(() => {
    if (isFinalDay) return 1;
    if (isUrgent) return Math.max(0.3, 1 - (remainingDays / 5) * 0.7);
    return 0;
  }, [isFinalDay, isUrgent, remainingDays]);

  const glow =
    tier === 'calm'
      ? '0 0 22px rgba(56, 189, 248, 0.32)'
      : tier === 'mid'
        ? '0 0 24px rgba(139, 92, 246, 0.38)'
        : '0 0 26px rgba(239, 68, 68, 0.42)';

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onTap}
      className="pointer-events-auto relative flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full border border-white/12"
      style={{
        background: 'radial-gradient(circle at 48% 38%, rgba(22, 20, 32, 0.96) 0%, rgba(6, 6, 12, 0.99) 100%)',
        boxShadow: showPulse
          ? [
              `0 0 ${10 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
              `0 0 ${25 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.8)'}`,
              `0 0 ${10 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
            ]
          : glow,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      animate={
        showPulse && !reduce
          ? {
              boxShadow: [
                `0 0 ${10 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                `0 0 ${25 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.8)'}`,
                `0 0 ${10 * pulseIntensity}px ${isFinalDay ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
              ],
            }
          : {}
      }
      transition={
        showPulse
          ? {
              duration: Math.max(0.5, 2 - pulseIntensity * 0.5),
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
      whileTap={{ scale: 0.95 }}
    >
      <span
        className="absolute -right-1 -top-1 z-20 min-h-[32px] min-w-[32px] max-w-[118px] truncate rounded-full border-[2.5px] border-white/70 bg-neutral-950/95 px-3 py-2 text-[13px] font-extrabold leading-snug tracking-wide text-white shadow-[0_6px_18px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)_inset]"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95)' }}
      >
        {badge}
      </span>

      {/* Circular progress ring (like MissionProfileEngineRing) */}
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="transform -rotate-90" style={{ overflow: 'visible' }} aria-hidden>
          <defs>
            <linearGradient id={`time-ring-gradient-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="50%" stopColor={gradient.to} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
            <filter id={`time-ring-glow-${tier}`}>
              <feGaussianBlur stdDeviation={2} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress ring */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={`url(#time-ring-gradient-${tier})`}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              filter: showPulse ? `url(#time-ring-glow-${tier})` : undefined,
            }}
          />
        </svg>
        {/* Center: remaining days */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={
            showPulse && !reduce
              ? {
                  scale: [1, 1 + 0.01 * pulseIntensity, 1],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className="text-lg font-black tabular-nums leading-none"
            style={{
              color,
              textShadow: '0 1px 4px rgba(0,0,0,0.65)',
            }}
          >
            {remainingDays}
          </span>
        </motion.div>
      </div>
      <span
        className="mt-0.5 max-w-[80px] px-1 text-center text-[7px] font-semibold text-white/82"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
      >
        {caption}
      </span>
    </motion.button>
  );
}
