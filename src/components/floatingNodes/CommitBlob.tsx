/**
 * CommitBlob — soft organic blob + commit state (M1SSION™).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export interface CommitBlobProps {
  done: boolean;
  onTap: () => void;
  badgeDone: string;
  badgePending: string;
  label: string;
  ariaLabel: string;
}

const blobMorph = [
  '58% 42% 62% 38% / 48% 52% 48% 52%',
  '48% 52% 48% 52% / 58% 42% 58% 42%',
  '52% 48% 52% 48% / 42% 58% 42% 58%',
];

export function CommitBlob({ done, onTap, badgeDone, badgePending, label, ariaLabel }: CommitBlobProps) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="pointer-events-auto relative flex h-[76px] w-[76px] flex-col items-center justify-center border"
      style={{
        background: done
          ? 'radial-gradient(ellipse at 40% 35%, rgba(52, 211, 153, 0.2) 0%, rgba(8, 22, 18, 0.94) 60%)'
          : 'radial-gradient(ellipse at 40% 35%, rgba(0, 209, 255, 0.16) 0%, rgba(8, 16, 28, 0.94) 60%)',
        borderColor: done ? 'rgba(52, 211, 153, 0.45)' : 'rgba(0, 209, 255, 0.38)',
        boxShadow: done
          ? '0 0 20px rgba(52, 211, 153, 0.25)'
          : '0 0 16px rgba(0, 209, 255, 0.22)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      animate={{
        borderRadius: blobMorph,
      }}
      transition={{
        borderRadius: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
    >
      <span
        className={`absolute -right-0.5 -top-0.5 z-10 max-w-[52px] truncate rounded-full border px-1 py-0.5 text-[7px] font-bold leading-none shadow-md ${
          done
            ? 'border-emerald-400/40 bg-emerald-950/80 text-emerald-100'
            : 'border-amber-400/35 bg-amber-950/75 text-amber-100'
        }`}
      >
        {done ? badgeDone : badgePending}
      </span>
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {done ? (
          <Check className="h-6 w-6" style={{ color: 'rgba(110, 231, 183, 0.96)' }} />
        ) : (
          <Sparkles className="h-6 w-6" style={{ color: 'rgba(0, 229, 255, 0.9)' }} />
        )}
      </motion.div>
      <span
        className="mt-0.5 max-w-[70px] px-1 text-center text-[8px] font-bold text-white/92"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}
