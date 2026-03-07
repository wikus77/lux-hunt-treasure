/**
 * Global PE Reward Overlay — True fullscreen cinematic reward on every PE credit.
 * Listens to pe-credit-event; shows full-viewport modal with PulseBarReward (Energy Injection).
 * Dedupe/lock: one modal at a time; ignore events while open or within DEDUPE_MS.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PE_CREDIT_EVENT, PECreditEventDetail } from '../peCreditEvent';
import { PulseBarReward } from './PulseBarReward';

const DEDUPE_MS = 2500;
const AUTO_CLOSE_MS = 3500;

export const GlobalPERewardOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<PECreditEventDetail | null>(null);
  const animatingRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);
  const lastTimeRef = useRef(0);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = () => {
    setPayload(null);
    animatingRef.current = false;
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  };

  useEffect(() => {
    const handle = (e: Event) => {
      const detail = (e as CustomEvent<PECreditEventDetail>).detail;
      if (!detail?.amount || detail.amount <= 0) return;
      if (animatingRef.current) return;
      const now = Date.now();
      if (lastIdRef.current === detail.id) return;
      if (now - lastTimeRef.current < DEDUPE_MS) return;

      lastIdRef.current = detail.id;
      lastTimeRef.current = now;
      animatingRef.current = true;
      setPayload(detail);

      autoCloseRef.current = setTimeout(() => {
        autoCloseRef.current = null;
        close();
      }, AUTO_CLOSE_MS);
    };

    window.addEventListener(PE_CREDIT_EVENT, handle);
    return () => {
      window.removeEventListener(PE_CREDIT_EVENT, handle);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, []);

  const handleAnimationComplete = () => {
    // Optional: could keep modal open until user taps Continua
  };

  const handleContinue = () => {
    close();
  };

  const modal = (
    <AnimatePresence>
      {payload && (
        <motion.div
          key={payload.id}
          className="fixed inset-0 flex flex-col"
          style={{
            zIndex: 999998,
            padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop — fullscreen, premium */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            style={{ boxShadow: 'inset 0 0 160px rgba(0,231,255,0.08)' }}
            onClick={handleContinue}
            aria-hidden
          />

          {/* Content — full viewport height/width within safe area, no max-w card */}
          <motion.div
            className="relative flex flex-col flex-1 min-h-0 w-full items-center justify-center px-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / title */}
            <motion.div
              className="text-center mb-6 sm:mb-8"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white/95 uppercase tracking-widest">
                {t('pe_reward.title')}
              </h2>
            </motion.div>

            {/* Central animation zone — PulseBarReward */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto">
              <PulseBarReward
                amount={payload.amount}
                source={payload.source}
                preValue={payload.preValue}
                postValue={payload.postValue}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>

            {/* CTA */}
            <motion.button
              type="button"
              className="mt-6 sm:mt-8 px-10 py-4 rounded-xl font-semibold text-white uppercase tracking-wider text-base"
              style={{
                background: 'linear-gradient(135deg, rgba(0,231,255,0.3) 0%, rgba(0,180,220,0.35) 100%)',
                border: '1px solid rgba(0,231,255,0.6)',
                boxShadow: '0 0 24px rgba(0,231,255,0.25)',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              onClick={handleContinue}
            >
              {t('pe_reward.cta_continue')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};
