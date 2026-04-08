/**
 * Pulse Breaker — fullscreen step when no real PE credit modal is shown (limit / delta 0 / award edge).
 * Visual language aligned with Global PE reward flow; not Progress Feedback legacy modals.
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';

const PE_EASE = [0.22, 1, 0.36, 1] as const;

export type PulseBreakerPeFallbackReason = 'limit' | 'nocredit' | 'generic';
export type PulseBreakerPeFallbackMoment = 'play' | 'win';

export interface PulseBreakerPeFallbackLayerProps {
  reason: PulseBreakerPeFallbackReason;
  moment: PulseBreakerPeFallbackMoment;
  onContinue: () => void;
}

export const PulseBreakerPeFallbackLayer: React.FC<PulseBreakerPeFallbackLayerProps> = ({
  reason,
  moment,
  onContinue,
}) => {
  const { t } = useTranslation();

  const bodyKey =
    reason === 'limit'
      ? 'pulseBreaker.peFallback.bodyLimit'
      : reason === 'nocredit'
        ? 'pulseBreaker.peFallback.bodyNoCredit'
        : 'pulseBreaker.peFallback.bodyGeneric';

  const handleCta = () => {
    buttonClickFeedback();
    onContinue();
  };

  return (
    <motion.div
      className="absolute inset-0 z-[118] flex flex-col"
      style={{
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: PE_EASE }}
    >
      <motion.div
        className="absolute inset-0 bg-black/92 backdrop-blur-md"
        aria-hidden
        initial={{ opacity: 0.96 }}
        animate={{ opacity: 1 }}
        style={{ boxShadow: 'inset 0 0 160px rgba(0,231,255,0.12)' }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background:
            'radial-gradient(ellipse 85% 55% at 50% 38%, rgba(0,231,255,0.18) 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/25 bg-white/[0.06] shadow-[0_0_48px_rgba(0,231,255,0.28)]"
        >
          <Zap className="h-10 w-10 text-cyan-300" strokeWidth={2.2} />
        </motion.div>

        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
          {moment === 'play' ? t('pulseBreaker.peFallback.momentPlay') : t('pulseBreaker.peFallback.momentWin')}
        </p>

        <motion.h2
          className="mb-3 max-w-md text-xl font-bold tracking-tight text-white sm:text-2xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: PE_EASE }}
        >
          {t('pulseBreaker.peFallback.title')}
        </motion.h2>

        <motion.p
          className="mb-10 max-w-sm text-[15px] leading-relaxed text-white/75"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35, ease: PE_EASE }}
        >
          {t(bodyKey)}
        </motion.p>

        <motion.button
          type="button"
          onClick={handleCta}
          className="min-h-[52px] w-full max-w-sm rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3.5 text-base font-bold tracking-wide text-white shadow-[0_12px_40px_rgba(0,180,255,0.35)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35, ease: PE_EASE }}
          whileTap={{ scale: 0.98 }}
        >
          {t('pulseBreaker.peFallback.cta')}
        </motion.button>
      </div>
    </motion.div>
  );
};
