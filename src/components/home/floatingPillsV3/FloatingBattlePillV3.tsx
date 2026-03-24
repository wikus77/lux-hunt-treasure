/**
 * M1SSION Battle — combat-tech node (violet / red accent, strong silhouette).
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Swords } from 'lucide-react';

export interface FloatingBattlePillV3Props {
  live: boolean;
  labelLobby: string;
  labelLive: string;
  title: string;
  ariaLabel: string;
  onTap: () => void;
}

export function FloatingBattlePillV3({
  live,
  labelLobby,
  labelLive,
  title,
  ariaLabel,
  onTap,
}: FloatingBattlePillV3Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onTap}
      className="pointer-events-auto relative flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border-2"
      style={{
        borderColor: live ? 'rgba(248, 113, 113, 0.45)' : 'rgba(139, 92, 246, 0.42)',
        background: live
          ? 'radial-gradient(circle at 38% 30%, rgba(248, 113, 113, 0.22) 0%, rgba(24, 8, 18, 0.96) 55%)'
          : 'radial-gradient(circle at 38% 30%, rgba(139, 92, 246, 0.24) 0%, rgba(14, 8, 24, 0.96) 55%)',
        boxShadow: live
          ? '0 0 24px rgba(248, 113, 113, 0.32), 0 0 40px rgba(88, 28, 135, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 0 18px rgba(88, 28, 135, 0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      animate={
        reduce || !live
          ? {}
          : {
              boxShadow: [
                '0 0 24px rgba(248, 113, 113, 0.35), 0 0 42px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                '0 0 16px rgba(88, 28, 135, 0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
                '0 0 24px rgba(248, 113, 113, 0.35), 0 0 42px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              ],
            }
      }
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      whileTap={{ scale: 0.94 }}
    >
      <span
        className={`absolute -right-0.5 -top-0.5 z-10 max-w-[52px] truncate rounded-full border px-1 py-0.5 text-[7px] font-bold leading-none shadow-md ${
          live
            ? 'border-red-400/45 bg-red-950/85 text-red-100'
            : 'border-violet-400/35 bg-violet-950/85 text-violet-100'
        }`}
      >
        {live ? labelLive : labelLobby}
      </span>
      <Swords
        className="h-7 w-7"
        style={{
          color: live ? 'rgba(252, 165, 165, 0.95)' : 'rgba(196, 181, 253, 0.92)',
          filter: live
            ? 'drop-shadow(0 0 8px rgba(248,113,113,0.5))'
            : 'drop-shadow(0 0 6px rgba(139,92,246,0.45))',
        }}
      />
      <span
        className="mt-0.5 max-w-[68px] px-1 text-center text-[7.5px] font-extrabold text-white/92"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        {title}
      </span>
    </motion.button>
  );
}
