/**
 * Prossima azione — capsule-orb / dashboard metaphor (M1SSION cyan, premium).
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Target } from 'lucide-react';

export interface FloatingActionPillV3Props {
  active: boolean;
  badge: React.ReactNode;
  label: string;
  ariaLabel: string;
  onTap: () => void;
}

export function FloatingActionPillV3({ active, badge, label, ariaLabel, onTap }: FloatingActionPillV3Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onTap}
      className="pointer-events-auto relative flex h-[102px] w-[76px] flex-col items-center justify-center rounded-[38px] border border-cyan-400/40"
      style={{
        background:
          'linear-gradient(165deg, rgba(0, 40, 55, 0.92) 0%, rgba(4, 14, 26, 0.96) 45%, rgba(2, 8, 18, 0.98) 100%)',
        boxShadow: active
          ? '0 0 28px rgba(0, 209, 255, 0.42), 0 0 48px rgba(0, 120, 200, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 0 16px rgba(0, 209, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      animate={
        reduce
          ? {}
          : {
              boxShadow: active
                ? [
                    '0 0 28px rgba(0, 209, 255, 0.45), 0 0 52px rgba(0, 140, 220, 0.14), inset 0 1px 0 rgba(255,255,255,0.12)',
                    '0 0 20px rgba(0, 209, 255, 0.28), 0 0 36px rgba(0, 100, 180, 0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
                    '0 0 28px rgba(0, 209, 255, 0.45), 0 0 52px rgba(0, 140, 220, 0.14), inset 0 1px 0 rgba(255,255,255,0.12)',
                  ]
                : [
                    '0 0 16px rgba(0, 209, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
                    '0 0 22px rgba(0, 209, 255, 0.32), inset 0 1px 0 rgba(255,255,255,0.08)',
                    '0 0 16px rgba(0, 209, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
                  ],
              scale: [1, 1.012, 1],
            }
      }
      transition={{
        duration: active ? 3.2 : 4.2,
        repeat: reduce ? 0 : Infinity,
        ease: 'easeInOut',
      }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="absolute -right-1 -top-1 z-10 max-w-[58px] truncate rounded-full border border-cyan-400/35 bg-black/70 px-1.5 py-0.5 text-[7px] font-bold text-cyan-100 shadow-md">
        {badge}
      </span>
      {/* Inner micro “report” bars — abstract, not cartoon */}
      <svg width="36" height="14" viewBox="0 0 36 14" className="mb-1 opacity-80" aria-hidden>
        <rect x="2" y="8" width="5" height="6" rx="1" fill="rgba(0, 209, 255, 0.55)" />
        <rect x="10" y="4" width="5" height="10" rx="1" fill="rgba(56, 189, 248, 0.45)" />
        <rect x="18" y="6" width="5" height="8" rx="1" fill="rgba(0, 209, 255, 0.5)" />
        <rect x="26" y="2" width="5" height="12" rx="1" fill="rgba(125, 211, 252, 0.4)" />
      </svg>
      <div
        className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/25"
        style={{
          background: 'radial-gradient(circle at 40% 35%, rgba(0, 229, 255, 0.2) 0%, transparent 65%)',
        }}
      >
        <Target className="h-5 w-5 text-cyan-300" style={{ filter: 'drop-shadow(0 0 6px rgba(0,209,255,0.55))' }} />
      </div>
      <span
        className="max-w-[68px] px-1 text-center text-[8px] font-extrabold leading-tight text-white/95"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}
