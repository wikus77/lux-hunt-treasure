/**
 * Global PE Reward Overlay — Fullscreen cinematic PE reward (presentation layer only).
 * Queue + dedupe + PE_REWARD_OVERLAY_SETTLED_EVENT unchanged for conductor.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PE_CREDIT_EVENT, PECreditEventDetail } from '../peCreditEvent';
import { PE_REWARD_OVERLAY_SETTLED_EVENT } from '@/features/victoryOrchestration/constants';
import { PulseBarReward } from './PulseBarReward';
import {
  armPeToM1uPresentationBridge,
  victoryPrefersReducedMotion,
} from '@/features/victoryPresentation/victoryPresentationBridge';
import { isHapticsAvailable, hapticLight, hapticMedium } from '@/utils/haptics';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import { playPESound, warmPERewardSound } from '@/utils/victoryRewardSounds';

const PE_EASE = [0.22, 1, 0.36, 1] as const;

const AUTO_CLOSE_AFTER_CTA_MS = 5200;
/** Anti-bounce: same event id re-fired within this ms is ignored (duplicate dispatch). */
const SAME_ID_DEDUPE_MS = 300;
const ANTICIPATION_MS = 420;
const HOLD_MS = 1700;
const ANTICIPATION_MS_REDUCED = 80;
const HOLD_MS_REDUCED = 400;

const po = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-OVERLAY]', msg, data ?? '');
};
const pr = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-RENDER]', msg, data ?? '');
};
const pc = (msg: string, data?: unknown) => {
  if (typeof console !== 'undefined') console.log('[PE-TRACE-CLOSE]', msg, data ?? '');
};

type UiPhase = 'anticipation' | 'energy' | 'hold' | 'cta';

export const GlobalPERewardOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<PECreditEventDetail | null>(null);
  const currentPayloadRef = useRef<PECreditEventDetail | null>(null);
  const showingRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);
  const lastIdTimeRef = useRef(0);
  const queueRef = useRef<PECreditEventDetail[]>([]);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [uiPhase, setUiPhase] = useState<UiPhase | null>(null);
  const reducedMotion = typeof window !== 'undefined' ? victoryPrefersReducedMotion() : false;

  const clearPhaseTimers = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
  }, []);

  const clearAutoClose = useCallback(() => {
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  }, []);

  pr('RENDER', {
    hasPayload: !!payload,
    payloadId: payload?.id ?? null,
    uiPhase,
    showingRef: showingRef.current,
    queueLen: queueRef.current.length,
  });

  useEffect(() => {
    po('MOUNT', { ts: Date.now() });
    return () => po('UNMOUNT cleanup');
  }, []);

  useEffect(() => {
    currentPayloadRef.current = payload;
  }, [payload]);

  const startAutoCloseAfterCta = useCallback(() => {
    clearAutoClose();
    autoCloseRef.current = setTimeout(() => {
      autoCloseRef.current = null;
      closeRef.current();
    }, AUTO_CLOSE_AFTER_CTA_MS);
  }, [clearAutoClose]);

  const closeRef = useRef<() => void>(() => {});

  const close = useCallback(() => {
    const settledId = currentPayloadRef.current?.id ?? null;
    const queueLenBefore = queueRef.current.length;
    pc('ENTER', { queueLenBefore, showingRef: showingRef.current, settledId });
    clearPhaseTimers();
    clearAutoClose();
    setUiPhase(null);
    setPayload(null);
    const next = queueRef.current.shift();
    const queueLenAfter = queueRef.current.length;
    pc('AFTER shift', { hasNext: !!next, nextId: next?.id, queueLenAfter });
    if (next) {
      lastIdRef.current = next.id;
      setPayload(next);
      po('close SCHEDULED next', { nextId: next.id });
    } else {
      showingRef.current = false;
      pc('DONE', 'showingRef=false');
    }
    if (settledId && typeof window !== 'undefined') {
      armPeToM1uPresentationBridge();
      window.dispatchEvent(
        new CustomEvent(PE_REWARD_OVERLAY_SETTLED_EVENT, { detail: { id: settledId } })
      );
    }
  }, [clearPhaseTimers, clearAutoClose]);

  closeRef.current = close;

  useEffect(() => {
    po('useEffect RUN listener registration');
    const handle = (e: Event) => {
      const ev = e as CustomEvent<PECreditEventDetail>;
      const detail = ev.detail;
      po('handle ENTER', { ts: Date.now() });
      if (!detail) {
        po('handle EXIT guard', 'detail assente');
        return;
      }
      const amountVal = detail.amount;
      if (amountVal == null || amountVal <= 0) {
        po('handle EXIT guard', { reason: 'amount falsy or <=0', amountVal });
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
      clearAutoClose();
      clearPhaseTimers();
      setUiPhase(null);
      setPayload(detail);
    };

    window.addEventListener(PE_CREDIT_EVENT, handle);
    po('listener REGISTERED', { regTs: Date.now() });
    return () => {
      window.removeEventListener(PE_CREDIT_EVENT, handle);
      clearAutoClose();
      po('listener CLEANUP unmount');
    };
  }, [clearAutoClose, clearPhaseTimers]);

  // Per-payload cinematic sequence (anticipation → bar → hold → CTA)
  useEffect(() => {
    if (!payload) return;

    const ant = reducedMotion ? ANTICIPATION_MS_REDUCED : ANTICIPATION_MS;
    const hold = reducedMotion ? HOLD_MS_REDUCED : HOLD_MS;

    setUiPhase('anticipation');

    const tAnt = window.setTimeout(() => {
      warmPERewardSound();
      if (isHapticsAvailable()) {
        try {
          hapticLight();
        } catch {
          /* dev web */
        }
      }
      setUiPhase('energy');
    }, ant);
    phaseTimersRef.current.push(tAnt);

    return () => {
      clearPhaseTimers();
    };
  }, [payload?.id, reducedMotion, clearPhaseTimers]);

  const onPulseBarComplete = useCallback(() => {
    setUiPhase('hold');
    const hold = reducedMotion ? HOLD_MS_REDUCED : HOLD_MS;
    const t = window.setTimeout(() => {
      setUiPhase('cta');
      startAutoCloseAfterCta();
    }, hold);
    phaseTimersRef.current.push(t);
  }, [reducedMotion, startAutoCloseAfterCta]);

  const onBurstPeak = useCallback(() => {
    playPESound();
    if (isHapticsAvailable()) {
      try {
        hapticMedium();
      } catch {
        /* dev web */
      }
    }
  }, []);

  const handleContinue = useCallback(() => {
    buttonClickFeedback();
    close();
  }, [close]);

  if (payload) pr('RENDER BRANCH MODAL', { payloadId: payload.id, amount: payload.amount, uiPhase });

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
          exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.32, ease: PE_EASE }}
        >
          <motion.div
            className="absolute inset-0 bg-black/92 backdrop-blur-md"
            aria-hidden
            onClick={handleContinue}
            initial={{ scale: 1 }}
            animate={
              uiPhase === 'anticipation' && !reducedMotion
                ? { scale: [1, 1.03, 1.01] }
                : { scale: 1 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{
              boxShadow: 'inset 0 0 160px rgba(0,231,255,0.12)',
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{
              opacity: uiPhase === 'anticipation' && !reducedMotion ? [0.2, 0.55, 0.35] : 0.25,
            }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,231,255,0.22) 0%, transparent 65%)',
            }}
          />

          <motion.div
            className="relative flex flex-col flex-1 min-h-0 w-full items-center justify-center px-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: PE_EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {uiPhase === 'anticipation' && (
              <motion.div
                className="text-center mb-4 max-w-md"
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reducedMotion ? 0.12 : 0.4, ease: PE_EASE }}
              >
                <h2
                  className="text-2xl sm:text-3xl font-black text-white/95 uppercase tracking-[0.2em]"
                  style={{
                    textShadow: '0 0 40px rgba(0,231,255,0.45), 0 0 80px rgba(0,231,255,0.2)',
                  }}
                >
                  {t('pe_reward.title')}
                </h2>
                <p className="mt-3 text-sm text-cyan-200/50 uppercase tracking-widest">
                  {t('pe_reward.anticipation_hint')}
                </p>
              </motion.div>
            )}

            {uiPhase != null && uiPhase !== 'anticipation' && (
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto min-h-0">
                <PulseBarReward
                  amount={payload.amount}
                  source={payload.source}
                  preValue={payload.preValue}
                  postValue={payload.postValue}
                  onAnimationComplete={onPulseBarComplete}
                  reducedMotion={reducedMotion}
                  onBurstPeak={onBurstPeak}
                  showFlowParticles={!reducedMotion}
                />
              </div>
            )}

            {uiPhase === 'cta' && (
              <motion.button
                type="button"
                className="mt-6 sm:mt-8 px-10 py-4 rounded-xl font-semibold text-white uppercase tracking-wider text-base"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,231,255,0.38) 0%, rgba(0,180,220,0.42) 100%)',
                  border: '1px solid rgba(0,231,255,0.75)',
                  boxShadow: '0 0 32px rgba(0,231,255,0.35), 0 4px 24px rgba(0,0,0,0.35)',
                }}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: PE_EASE }}
                onClick={handleContinue}
              >
                {t('pe_reward.cta_continue')}
              </motion.button>
            )}
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
