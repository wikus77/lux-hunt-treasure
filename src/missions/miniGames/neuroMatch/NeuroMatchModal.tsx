/**
 * Neuromatch Memory (Daily) — server-real board, two-phase daily flow.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { claimDailyPhase, MISSION_ID_NEUROMATCH_MEMORY_V1 } from '@/missions/serverReal/claimDailyPhase';
import {
  startMission,
  completePhase1,
  completePhase2,
  markPhase1Credited,
  markPhase2Credited,
} from '@/missions/missionState';
import { emitM1UCreditEvent } from '@/features/m1u/m1uCreditEvent';
import { emitPECreditEvent } from '@/features/pulse/peCreditEvent';
import type { ShellGameProps } from '@/missions/dailyMiniGames/shellGameProps';
import type { NeuroMatchOutcomePayload } from './neuroMatchTypes';
import { parseNeuroMatchParams } from './neuroMatchProgression';
import { NeuroMatchBoard } from './NeuroMatchBoard';

const P2_REWARD = 10;

type Step =
  | 'loading'
  | 'playing'
  | 'fail_round'
  | 'phase1_done'
  | 'playing_p2'
  | 'phase2_win'
  | 'phase2_fail'
  | 'return_tomorrow'
  | 'error';

export const NeuroMatchModal: React.FC<ShellGameProps> = ({ onClose, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('loading');
  const [params, setParams] = useState<ReturnType<typeof parseNeuroMatchParams>>(null);
  const [activePhase, setActivePhase] = useState<1 | 2>(1);
  const [roundKey, setRoundKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const activePhaseRef = useRef(activePhase);
  activePhaseRef.current = activePhase;

  const tryPhase2ThenPhase1 = useCallback(async () => {
    setErrorMsg('');
    const res2 = await claimDailyPhase('start_phase2', MISSION_ID_NEUROMATCH_MEMORY_V1);
    const p2 = parseNeuroMatchParams(res2.progress);
    if (res2.ok && res2.phase === 2 && p2) {
      startMission(MISSION_ID_NEUROMATCH_MEMORY_V1);
      setParams(p2);
      setActivePhase(2);
      setRoundKey((k) => k + 1);
      setStep('playing_p2');
      return;
    }

    const res1 = await claimDailyPhase('start_phase1', MISSION_ID_NEUROMATCH_MEMORY_V1);
    if (!res1.ok) {
      setErrorMsg(res1.error || t('daily_neuromatch.error_network'));
      setStep('error');
      return;
    }

    const p1 = parseNeuroMatchParams(res1.progress);
    const ph = res1.phase ?? 1;

    if (ph >= 2 && ph < 3) {
      setStep('return_tomorrow');
      return;
    }
    if (ph >= 3) {
      setStep('return_tomorrow');
      return;
    }

    if (!p1) {
      setErrorMsg(t('daily_neuromatch.error_network'));
      setStep('error');
      return;
    }

    startMission(MISSION_ID_NEUROMATCH_MEMORY_V1);
    setParams(p1);
    setActivePhase(1);
    setRoundKey((k) => k + 1);
    setStep('playing');
  }, [t]);

  useEffect(() => {
    void tryPhase2ThenPhase1();
  }, [tryPhase2ThenPhase1]);

  const submitRound = useCallback(
    async (payload: NeuroMatchOutcomePayload, phase: 1 | 2) => {
      setSubmitting(true);
      const action = phase === 1 ? 'complete_phase1' : 'complete_phase2';
      const res = await claimDailyPhase(action, MISSION_ID_NEUROMATCH_MEMORY_V1, payload as unknown as Record<string, unknown>);
      setSubmitting(false);

      if (!res.ok) {
        setErrorMsg(res.error || t('daily_neuromatch.error_network'));
        setStep('error');
        return;
      }

      if (phase === 1) {
        if (res.result === 'fail') {
          setStep('fail_round');
          return;
        }
        completePhase1();
        markPhase1Credited();
        const amount = res.amount ?? 0;
        if (amount > 0) emitM1UCreditEvent(amount, 'mission');
        setStep('phase1_done');
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2200);
        return;
      }

      completePhase2();
      markPhase2Credited();
      if (res.result === 'win') {
        setStep('phase2_win');
        const amount = res.amount ?? P2_REWARD;
        if (amount > 0) emitM1UCreditEvent(amount, 'mission');
        if (res.amount_pe) {
          window.dispatchEvent(new CustomEvent('pe:awarded', { detail: { delta: res.amount_pe } }));
          emitPECreditEvent(res.amount_pe, 'daily_mission', {});
        }
      } else {
        setStep('phase2_fail');
      }
      setTimeout(() => {
        onComplete();
        onClose();
      }, res.result === 'win' ? 2400 : 2800);
    },
    [onClose, onComplete, t]
  );

  const handleRoundComplete = useCallback(
    (payload: NeuroMatchOutcomePayload) => {
      if (submitting) return;
      void submitRound(payload, activePhaseRef.current);
    },
    [submitRound, submitting]
  );

  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(180deg, #080a10 0%, #121a2a 100%)',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
    paddingLeft: 16,
    paddingRight: 16,
  };

  return (
    <div style={fullScreenStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('daily.signal_pattern.close')}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <X size={22} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('daily.signal_pattern.loading')}</p>
          </motion.div>
        )}

        {(step === 'playing' || step === 'playing_p2') && params && (
          <motion.div
            key={step + roundKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 0 }}
          >
            <h2 style={{ color: '#fff', fontSize: 21, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>
              {t('daily_neuromatch.title')}
            </h2>
            <p style={{ color: 'rgba(0, 209, 255, 0.88)', fontSize: 13, margin: '0 0 8px', textAlign: 'center' }}>
              {t('daily_neuromatch.subtitle')}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: 14,
                margin: '0 0 12px',
                textAlign: 'center',
                maxWidth: 420,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.35,
              }}
            >
              {t('daily_neuromatch.instruction', {
                penalty: params.mismatch_penalty_sec,
                seconds: params.time_limit_sec,
              })}
            </p>
            <NeuroMatchBoard params={params} roundKey={roundKey} onRoundComplete={handleRoundComplete} />
          </motion.div>
        )}

        {step === 'fail_round' && (
          <motion.div
            key="fail"
            initial={{ opacity: 0, x: [-8, 8, -6, 6, 0] }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 22, fontWeight: 700, textAlign: 'center' }}>{t('daily_neuromatch.fail')}</p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setStep(activePhase === 1 ? 'playing' : 'playing_p2');
                setRoundKey((k) => k + 1);
              }}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.9), rgba(0, 200, 160, 0.75))',
                color: '#000',
                fontWeight: 700,
                border: 'none',
              }}
            >
              {t('daily_neuromatch.restart')}
            </button>
          </motion.div>
        )}

        {step === 'phase1_done' && (
          <motion.div
            key="p1done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 22, fontWeight: 700 }}>{t('daily_neuromatch.success')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center' }}>
              {t('daily.signal_pattern.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'phase2_win' && (
          <motion.div
            key="p2w"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 24, fontWeight: 700 }}>{t('daily_neuromatch.success')}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>{t('daily.signal_pattern.reward')}</p>
          </motion.div>
        )}

        {step === 'phase2_fail' && (
          <motion.div
            key="p2f"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 22, fontWeight: 700 }}>{t('daily_neuromatch.fail')}</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, textAlign: 'center' }}>
              {t('daily.signal_pattern.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'return_tomorrow' && (
          <motion.div
            key="rt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, textAlign: 'center' }}>
              {t('daily.signal_pattern.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="err"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 16 }}>{errorMsg || t('daily_neuromatch.error_network')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
