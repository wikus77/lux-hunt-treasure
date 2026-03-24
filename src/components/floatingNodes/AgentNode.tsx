/**
 * AgentNode — AI / agent identity module (M1SSION™). Violet glow when agent pipeline active (retention).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export interface AgentNodeProps {
  mcpActive: boolean;
  onTap: () => void;
  badge: string;
  label: string;
  ariaLabel: string;
}

export function AgentNode({ mcpActive, onTap, badge, label, ariaLabel }: AgentNodeProps) {
  const glowViolet = '0 0 22px rgba(139, 92, 246, 0.45), 0 0 40px rgba(88, 28, 135, 0.2)';
  const glowSoft = '0 0 12px rgba(255, 255, 255, 0.08), 0 4px 18px rgba(0,0,0,0.35)';

  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="pointer-events-auto relative flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border"
      style={{
        background: mcpActive
          ? 'radial-gradient(circle at 40% 35%, rgba(139, 92, 246, 0.22) 0%, rgba(14, 10, 22, 0.95) 65%)'
          : 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.06) 0%, rgba(12, 12, 16, 0.94) 65%)',
        borderColor: mcpActive ? 'rgba(167, 139, 250, 0.45)' : 'rgba(255, 255, 255, 0.12)',
        boxShadow: mcpActive ? glowViolet : glowSoft,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      animate={{
        boxShadow: mcpActive ? [glowViolet, glowSoft, glowViolet] : glowSoft,
        scale: mcpActive ? [1, 1.015, 1] : [1, 1.008, 1],
      }}
      transition={{
        duration: mcpActive ? 2.6 : 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
    >
      <span className="absolute -right-0.5 -top-0.5 z-10 max-w-[48px] truncate rounded-full border border-white/15 bg-black/50 px-1 py-0.5 text-[7px] font-bold text-white/90 shadow-md">
        {badge}
      </span>
      <Bot
        className="h-6 w-6"
        style={{
          color: mcpActive ? 'rgba(196, 181, 253, 0.95)' : 'rgba(200, 210, 225, 0.85)',
          filter: mcpActive ? 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' : undefined,
        }}
      />
      <span
        className="mt-0.5 max-w-[68px] px-1 text-center text-[7px] font-semibold text-white/88"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}
