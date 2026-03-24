/**
 * M1SSION Agent — identity / intelligence metaphor (eye + device halo).
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye } from 'lucide-react';

export interface FloatingAgentPillV3Props {
  mcpActive: boolean;
  badge: string;
  label: string;
  ariaLabel: string;
  onTap: () => void;
}

export function FloatingAgentPillV3({ mcpActive, badge, label, ariaLabel, onTap }: FloatingAgentPillV3Props) {
  const reduce = useReducedMotion();

  /** Same 72×72 flex shell as ActionRadialHubPill / Commit wrappers → one rail axis (no loose button box). */
  return (
    <div className="relative h-[72px] w-[72px] shrink-0 self-start overflow-visible">
      <motion.button
        type="button"
        aria-label={ariaLabel}
        onClick={onTap}
        className="pointer-events-auto relative flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border"
        style={{
          borderColor: mcpActive ? 'rgba(167, 139, 250, 0.48)' : 'rgba(0, 209, 255, 0.22)',
          background: mcpActive
            ? 'radial-gradient(circle at 45% 35%, rgba(139, 92, 246, 0.28) 0%, rgba(10, 8, 22, 0.95) 62%)'
            : 'radial-gradient(circle at 45% 35%, rgba(0, 209, 255, 0.12) 0%, rgba(10, 12, 20, 0.94) 62%)',
          boxShadow: mcpActive
            ? '0 0 20px rgba(139, 92, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 0 12px rgba(0, 209, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        animate={
          reduce
            ? {}
            : {
                boxShadow: mcpActive
                  ? [
                      '0 0 22px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                      '0 0 14px rgba(88, 28, 135, 0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
                      '0 0 22px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    ]
                  : [
                      '0 0 12px rgba(0, 209, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                      '0 0 16px rgba(0, 209, 255, 0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
                      '0 0 12px rgba(0, 209, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                    ],
              }
        }
        transition={{ duration: mcpActive ? 2.8 : 4, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="absolute -right-0.5 -top-0.5 z-10 max-w-[44px] truncate rounded-full border border-white/15 bg-black/55 px-1 py-0.5 text-[6px] font-bold text-white/90">
          {badge}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.25) 100%)',
          }}
        >
          <Eye
            className="h-[18px] w-[18px] text-cyan-200/95"
            style={{
              filter: mcpActive ? 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' : 'drop-shadow(0 0 5px rgba(0,209,255,0.35))',
            }}
          />
        </div>
        <span
          className="mt-0.5 max-w-[60px] px-0.5 text-center text-[6.5px] font-semibold text-white/88"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {label}
        </span>
      </motion.button>
    </div>
  );
}
