/**
 * Pulse Breaker — fullscreen outcome after PE reward flow (win / lose).
 * Not the Progress Feedback CelebrationModal (legacy green/red — filtered separately).
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, Zap } from 'lucide-react';
import type { BetCurrency } from '../hooks/usePulseBreaker';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';

const PE_EASE = [0.22, 1, 0.36, 1] as const;

export interface PulseBreakerPremiumOutcomeProps {
  win: boolean;
  payout: number;
  betCurrency: BetCurrency;
  crashPoint: number;
  cashoutMultiplier: number | null;
  betAmount: number;
  showNearMiss: boolean;
  potentialWinAtCrash: number | null;
  onContinue: () => void;
}

export const PulseBreakerPremiumOutcome: React.FC<PulseBreakerPremiumOutcomeProps> = ({
  win,
  payout,
  betCurrency,
  crashPoint,
  cashoutMultiplier,
  betAmount,
  showNearMiss,
  potentialWinAtCrash,
  onContinue,
}) => {
  const { t } = useTranslation();

  const handleCta = () => {
    buttonClickFeedback();
    onContinue();
  };

  const multLabel = win && cashoutMultiplier != null ? cashoutMultiplier.toFixed(2) : crashPoint.toFixed(2);

  return (
    <motion.div
      className="absolute inset-0 z-[120] flex flex-col"
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
        style={{
          boxShadow: win
            ? 'inset 0 0 160px rgba(0,231,255,0.14)'
            : 'inset 0 0 160px rgba(255,60,100,0.1)',
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: win
            ? 'radial-gradient(ellipse 85% 55% at 50% 38%, rgba(0,231,255,0.2) 0%, transparent 62%)'
            : 'radial-gradient(ellipse 85% 55% at 50% 38%, rgba(255,80,120,0.14) 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5 shadow-[0_0_40px_rgba(0,231,255,0.25)]"
          style={{
            boxShadow: win
              ? '0 0 48px rgba(0,231,255,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'
              : '0 0 40px rgba(255,80,100,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {win ? (
            <TrendingUp className="h-10 w-10 text-cyan-300" strokeWidth={2.2} />
          ) : (
            <TrendingDown className="h-10 w-10 text-rose-300" strokeWidth={2.2} />
          )}
        </motion.div>

        <motion.h2
          className="mb-2 max-w-md text-2xl font-bold tracking-tight text-white sm:text-3xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35, ease: PE_EASE }}
        >
          {win ? t('pulseBreaker.outcome.winTitle') : t('pulseBreaker.outcome.loseTitle')}
        </motion.h2>

        <motion.p
          className="mb-8 max-w-sm text-[15px] leading-relaxed text-white/72"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35, ease: PE_EASE }}
        >
          {win ? t('pulseBreaker.outcome.winBody') : t('pulseBreaker.outcome.loseBody')}
        </motion.p>

        <motion.div
          className="mb-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35, ease: PE_EASE }}
        >
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            <Zap className="h-3.5 w-3.5 text-cyan-400/90" />
            {t('pulseBreaker.outcome.sessionLabel')}
          </div>
          {win ? (
            <>
              <div className="flex justify-between border-b border-white/10 py-2 text-sm text-white/85">
                <span className="text-white/55">{t('pulseBreaker.outcome.multiplier')}</span>
                <span className="font-mono font-semibold text-cyan-200">{multLabel}×</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-white/85">
                <span className="text-white/55">{t('pulseBreaker.outcome.credited')}</span>
                <span className="font-mono font-semibold text-emerald-200/95">
                  +{Math.floor(payout)} {betCurrency}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between border-b border-white/10 py-2 text-sm text-white/85">
                <span className="text-white/55">{t('pulseBreaker.outcome.crashAt')}</span>
                <span className="font-mono font-semibold text-rose-200/90">{crashPoint.toFixed(2)}×</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-white/85">
                <span className="text-white/55">{t('pulseBreaker.outcome.stake')}</span>
                <span className="font-mono text-white/75">
                  −{betAmount} {betCurrency}
                </span>
              </div>
            </>
          )}
          {win && showNearMiss && potentialWinAtCrash != null && (
            <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-snug text-amber-200/85">
              {t('pulseBreaker.outcome.nearMiss', {
                mult: crashPoint.toFixed(2),
                amount: Math.floor(potentialWinAtCrash),
              })}
            </p>
          )}
        </motion.div>

        <motion.button
          type="button"
          onClick={handleCta}
          className="min-h-[52px] w-full max-w-sm rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3.5 text-base font-bold tracking-wide text-white shadow-[0_12px_40px_rgba(0,180,255,0.35)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35, ease: PE_EASE }}
          whileTap={{ scale: 0.98 }}
        >
          {t('pulseBreaker.outcome.cta')}
        </motion.button>
      </div>
    </motion.div>
  );
};
