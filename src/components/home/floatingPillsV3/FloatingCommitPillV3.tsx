/**
 * Commit — organic energy seal / blob (M1SSION).
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export interface FloatingCommitPillV3Props {
  done: boolean;
  badgeDone: string;
  badgePending: string;
  label: string;
  ariaLabel: string;
  onTap: () => void;
}

const morphA = '52% 48% 58% 42% / 46% 54% 44% 56%';
const morphB = '46% 54% 44% 56% / 52% 48% 56% 44%';

export function FloatingCommitPillV3({
  done,
  badgeDone,
  badgePending,
  label,
  ariaLabel,
  onTap,
}: FloatingCommitPillV3Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onTap}
      className="pointer-events-auto relative flex h-[74px] w-[74px] flex-col items-center justify-center border"
      style={{
        borderColor: done ? 'rgba(52, 211, 153, 0.42)' : 'rgba(0, 209, 255, 0.36)',
        background: done
          ? 'radial-gradient(ellipse at 42% 32%, rgba(52, 211, 153, 0.22) 0%, rgba(6, 22, 18, 0.94) 58%)'
          : 'radial-gradient(ellipse at 42% 32%, rgba(0, 209, 255, 0.18) 0%, rgba(6, 16, 28, 0.94) 58%)',
        boxShadow: done
          ? '0 0 18px rgba(52, 211, 153, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 0 16px rgba(0, 209, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      animate={reduce ? {} : { borderRadius: [morphA, morphB, morphA] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      whileTap={{ scale: 0.96 }}
    >
      <span
        className={`absolute -right-0.5 -top-0.5 z-10 max-w-[52px] truncate rounded-full border px-1 py-0.5 text-[7px] font-bold leading-none shadow-md ${
          done
            ? 'border-emerald-400/40 bg-emerald-950/85 text-emerald-100'
            : 'border-cyan-400/35 bg-cyan-950/80 text-cyan-100'
        }`}
      >
        {done ? badgeDone : badgePending}
      </span>
      {done ? (
        <Check className="h-6 w-6 text-emerald-300" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.45))' }} />
      ) : (
        <Sparkles className="h-6 w-6 text-cyan-300" style={{ filter: 'drop-shadow(0 0 6px rgba(0,209,255,0.45))' }} />
      )}
      <span
        className="mt-0.5 max-w-[64px] px-1 text-center text-[7px] font-bold text-white/92"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}
