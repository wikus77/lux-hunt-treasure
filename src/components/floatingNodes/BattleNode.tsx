/**
 * BattleNode — tactical battle entry (M1SSION™).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';

export interface BattleNodeProps {
  pendingInvites: number;
  onTap: () => void;
  labelLobby: string;
  labelLive: string;
  title: string;
  ariaLabel: string;
}

export function BattleNode({ pendingInvites, onTap, labelLobby, labelLive, title, ariaLabel }: BattleNodeProps) {
  const live = pendingInvites > 0;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="pointer-events-auto relative flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full border"
      style={{
        background: 'radial-gradient(circle at 35% 30%, rgba(139, 92, 246, 0.2) 0%, rgba(18, 10, 28, 0.96) 55%)',
        borderColor: live ? 'rgba(192, 132, 252, 0.55)' : 'rgba(139, 92, 246, 0.35)',
        boxShadow: live
          ? '0 0 26px rgba(168, 85, 250, 0.45), 0 0 44px rgba(88, 28, 135, 0.25)'
          : '0 0 16px rgba(88, 28, 135, 0.28)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      animate={
        live
          ? { boxShadow: ['0 0 26px rgba(168,85,250,0.45)', '0 0 18px rgba(88,28,135,0.35)', '0 0 26px rgba(168,85,250,0.45)'] }
          : {}
      }
      transition={live ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
      whileTap={{ scale: 0.94 }}
      aria-label={ariaLabel}
    >
      <span
        className={`absolute -right-0.5 -top-0.5 z-10 max-w-[52px] truncate rounded-full border px-1 py-0.5 text-[7px] font-bold leading-none shadow-md ${
          live
            ? 'border-fuchsia-400/45 bg-fuchsia-950/85 text-fuchsia-100'
            : 'border-violet-400/35 bg-violet-950/80 text-violet-100'
        }`}
      >
        {live ? labelLive : labelLobby}
      </span>
      <Swords className="h-6 w-6" style={{ color: 'rgba(216, 180, 254, 0.95)', filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.45))' }} />
      <span
        className="mt-0.5 max-w-[70px] px-1 text-center text-[8px] font-bold text-white/92"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
      >
        {title}
      </span>
    </motion.button>
  );
}
