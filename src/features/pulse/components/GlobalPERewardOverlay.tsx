/**
 * Global PE Reward Overlay — Fullscreen cinematic reward on every PE credit.
 * Listens to pe-credit-event; shows modal with PulseBarReward (Energy Injection).
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
          className="fixed inset-0 flex items-center justify-center"
        style={{
          zIndex: 999998,
          padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          style={{ boxShadow: 'inset 0 0 120px rgba(0,231,255,0.06)' }}
          onClick={handleContinue}
          aria-hidden
        />
        <motion.div
          className="relative flex flex-col items-center justify-center px-6 py-10 rounded-2xl max-w-md w-full mx-4"
          style={{
            background: 'linear-gradient(180deg, rgba(10,20,35,0.97) 0%, rgba(5,12,22,0.98) 100%)',
            border: '1px solid rgba(0,231,255,0.25)',
            boxShadow: '0 0 60px rgba(0,231,255,0.15), 0 24px 48px rgba(0,0,0,0.5)',
          }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <PulseBarReward
            amount={payload.amount}
            source={payload.source}
            preValue={payload.preValue}
            postValue={payload.postValue}
            onAnimationComplete={handleAnimationComplete}
          />
          <motion.button
            type="button"
            className="mt-8 px-8 py-3 rounded-xl font-semibold text-white uppercase tracking-wider text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(0,231,255,0.25) 0%, rgba(0,180,220,0.3) 100%)',
              border: '1px solid rgba(0,231,255,0.5)',
              boxShadow: '0 0 20px rgba(0,231,255,0.2)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.25 }}
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
