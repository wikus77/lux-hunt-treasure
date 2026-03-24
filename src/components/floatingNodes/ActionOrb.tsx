/**
 * ActionOrb — Prossima Azione as floating circular node (M1SSION™).
 * UI only; tap wired by parent.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export interface ActionOrbProps {
  active: boolean;
  onTap: () => void;
  badge: React.ReactNode;
  label: string;
  ariaLabel: string;
}

export function ActionOrb({ active, onTap, badge, label, ariaLabel }: ActionOrbProps) {
  const glowStrong =
    '0 0 32px rgba(0, 209, 255, 0.55), 0 0 56px rgba(0, 140, 220, 0.2), inset 0 0 20px rgba(0, 209, 255, 0.12)';
  const glowSoft =
    '0 0 18px rgba(0, 209, 255, 0.28), 0 0 36px rgba(0, 100, 180, 0.08), inset 0 0 12px rgba(0, 209, 255, 0.06)';

  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="pointer-events-auto relative flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border border-cyan-400/45"
      style={{
        background:
          'radial-gradient(circle at 35% 30%, rgba(0, 229, 255, 0.18) 0%, rgba(6, 18, 32, 0.96) 55%, rgba(4, 10, 20, 0.98) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      animate={{
        boxShadow: active ? [glowStrong, glowSoft, glowStrong] : [glowSoft, glowStrong, glowSoft],
        scale: [1, 1.02, 1],
      }}
      transition={{
        boxShadow: { duration: active ? 2.8 : 4, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: active ? 2.8 : 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileTap={{ scale: 0.94 }}
      aria-label={ariaLabel}
    >
      <span className="absolute -right-0.5 -top-0.5 z-10 max-w-[56px] truncate rounded-full border border-cyan-400/35 bg-cyan-950/80 px-1 py-0.5 text-[7px] font-bold leading-none text-cyan-100 shadow-lg">
        {badge}
      </span>
      <motion.span
        className="absolute inset-[10px] rounded-full border border-cyan-400/20"
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1, 0.92] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <Target
        className="relative z-[1] h-7 w-7"
        style={{ color: 'rgba(0, 235, 255, 0.98)', filter: 'drop-shadow(0 0 10px rgba(0,209,255,0.6))' }}
      />
      <span
        className="relative z-[1] mt-0.5 max-w-[72px] px-1 text-center text-[8px] font-extrabold leading-tight text-white/95"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}
