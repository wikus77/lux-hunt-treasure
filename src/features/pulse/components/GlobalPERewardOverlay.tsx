/**
 * Global PE Reward Overlay — True fullscreen cinematic reward on every PE credit.
 * Listens to pe-credit-event; shows full-viewport modal with PulseBarReward (Energy Injection).
 * Queue: events while modal is open are enqueued and shown one after another.
 * Dedupe: only by event id (same event fired twice); no time-window drop of legitimate events.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PE_CREDIT_EVENT, PECreditEventDetail } from '../peCreditEvent';
import { PulseBarReward } from './PulseBarReward';

const AUTO_CLOSE_MS = 3500;
/** Anti-bounce: same event id re-fired within this ms is ignored (duplicate dispatch). */
const SAME_ID_DEDUPE_MS = 300;

/** PE modal runtime tracing — always on for iOS forensics (remove after diagnosis). */
const po = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-OVERLAY]', msg, data ?? '');
};
const pr = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-RENDER]', msg, data ?? '');
};
const pc = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-CLOSE]', msg, data ?? '');
};

export const GlobalPERewardOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<PECreditEventDetail | null>(null);
  const showingRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);
  const lastIdTimeRef = useRef(0);
  const queueRef = useRef<PECreditEventDetail[]>([]);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  pr('RENDER', { hasPayload: !!payload, payloadId: payload?.id ?? null, payloadAmount: payload?.amount ?? null, showingRef: showingRef.current, queueLen: queueRef.current.length });

  useEffect(() => {
    po('MOUNT', { ts: Date.now() });
    return () => po('UNMOUNT cleanup');
  }, []);

  const close = () => {
    const queueLenBefore = queueRef.current.length;
    pc('ENTER', { queueLenBefore, showingRef: showingRef.current });
    setPayload(null);
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    const next = queueRef.current.shift();
    const queueLenAfter = queueRef.current.length;
    pc('AFTER shift', { hasNext: !!next, nextId: next?.id, queueLenAfter });
    if (next) {
      lastIdRef.current = next.id;
      setPayload(next);
      autoCloseRef.current = setTimeout(() => {
        autoCloseRef.current = null;
        close();
      }, AUTO_CLOSE_MS);
      po('close SCHEDULED next', { nextId: next.id });
    } else {
      showingRef.current = false;
      pc('DONE', 'showingRef=false');
    }
  };

  useEffect(() => {
    po('useEffect RUN listener registration');
    const handle = (e: Event) => {
      const ev = e as CustomEvent<PECreditEventDetail>;
      const detail = ev.detail;
      po('handle ENTER', { ts: Date.now() });
      if (typeof console !== 'undefined') {
        console.log('[PE-TRACE-OVERLAY] handle DUMP', {
          eType: ev.type,
          eDetail: ev.detail,
          typeOfDetail: typeof ev.detail,
          detailAmount: ev.detail?.amount,
          typeOfDetailAmount: typeof ev.detail?.amount,
          detailId: ev.detail?.id,
          detailSource: ev.detail?.source,
        });
      }
      if (!detail) {
        po('handle EXIT guard', 'detail assente');
        return;
      }
      const amountVal = detail.amount;
      if (amountVal == null || amountVal <= 0) {
        po('handle EXIT guard', { reason: 'amount falsy or <=0', amountVal, type: typeof amountVal });
        return;
      }
      const now = Date.now();
      if (lastIdRef.current === detail.id && now - lastIdTimeRef.current < SAME_ID_DEDUPE_MS) {
        po('handle EXIT guard', { reason: 'same-id dedupe', detailId: detail.id });
        return;
      }
      if (showingRef.current) {
        queueRef.current = [...queueRef.current, detail];
        po('handle ENQUEUED', { detailId: detail.id, queueLen: queueRef.current.length });
        return;
      }
      lastIdRef.current = detail.id;
      lastIdTimeRef.current = now;
      showingRef.current = true;
      po('handle ACCEPTED setPayload', { detailId: detail.id, amount: detail.amount, source: detail.source });
      setPayload(detail);
      autoCloseRef.current = setTimeout(() => {
        po('timer FIRED', { detailId: detail.id });
        autoCloseRef.current = null;
        close();
      }, AUTO_CLOSE_MS);
      po('timer STARTED', { detailId: detail.id });
    };

    const regTs = Date.now();
    window.addEventListener(PE_CREDIT_EVENT, handle);
    po('listener REGISTERED', { regTs });
    return () => {
      window.removeEventListener(PE_CREDIT_EVENT, handle);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      po('listener CLEANUP unmount');
    };
  }, []);

  const handleAnimationComplete = () => {
    // Optional: could keep modal open until user taps Continua
  };

  const handleContinue = () => {
    close();
  };

  if (payload) pr('RENDER BRANCH MODAL', { payloadId: payload.id, amount: payload.amount, source: payload.source });

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

  if (typeof document === 'undefined') {
    pr('SKIP PORTAL', 'no document');
    return null;
  }
  pr('createPortal CALL', { hasPayload: !!payload });
  return createPortal(modal, document.body);
};
