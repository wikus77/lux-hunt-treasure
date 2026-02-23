/**
 * MISSION PROFILE ENGINE™ — Ring gauge (gradient, pulse 51%+).
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React from 'react';
import { motion } from 'framer-motion';

interface MissionProfileEngineRingProps {
  percentage: number; // 5–95
  size?: number;
  strokeWidth?: number;
}

function interpolateColor(pct: number): string {
  if (pct <= 15) return 'rgb(239, 68, 68)';
  if (pct <= 30) return 'rgb(249, 115, 22)';
  if (pct <= 50) return 'rgb(234, 179, 8)';
  if (pct <= 70) return 'rgb(34, 197, 94)';
  return 'rgb(22, 163, 74)';
}

export const MissionProfileEngineRing: React.FC<MissionProfileEngineRingProps> = ({
  percentage,
  size = 200,
  strokeWidth = 12,
}) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(5, Math.min(95, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  const color = interpolateColor(clamped);
  const shouldPulse = clamped >= 51;
  const pulseIntensity = shouldPulse ? Math.min(1, (clamped - 50) / 45) : 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="mpe-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="mpe-ring-glow">
            <feGaussianBlur stdDeviation={2} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#mpe-ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: shouldPulse ? 'url(#mpe-ring-glow)' : undefined }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={shouldPulse ? { scale: [1, 1 + 0.01 * pulseIntensity, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-4xl font-bold tabular-nums text-white drop-shadow-lg">
          {Math.round(clamped)}%
        </span>
      </motion.div>
    </div>
  );
};
