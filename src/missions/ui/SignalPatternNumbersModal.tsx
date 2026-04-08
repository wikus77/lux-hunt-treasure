/**
 * Signal Pattern Numbers (Daily #3) — Server-real
 * Phase 1: show sequence, memorize → complete_phase1 (0 M1U)
 * Phase 2 (tomorrow): input next number → complete_phase2 → WIN +10 M1U (slot animation) / FAIL 0
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { claimDailyPhase } from '@/missions/serverReal/claimDailyPhase';
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

const MISSION_ID = 'signal_pattern_numbers_v1';
const PHASE2_REWARD = 10;

type Step =
  | 'loading'
  | 'phase1'
  | 'phase1_done'
  | 'phase2'
  | 'phase2_win'
  | 'phase2_fail'
  | 'return_tomorrow'
  | 'error';

export const SignalPatternNumbersModal: React.FC<ShellGameProps> = ({ onClose, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('loading');
  const [sequence, setSequence] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const tryPhase2ThenPhase1 = useCallback(async () => {
    setErrorMsg('');
    const res2 = await claimDailyPhase('start_phase2', MISSION_ID);
    if (res2.ok && res2.phase === 2) {
      setStep('phase2');
      return;
    }
    const res1 = await claimDailyPhase('start_phase1', MISSION_ID);
    if (!res1.ok) {
      setErrorMsg(res1.error || t('daily.signal_pattern.error_network'));
      setStep('error');
      return;
    }
    const progress = res1.progress as { sequence_shown?: number[] } | undefined;
    const seq = progress?.sequence_shown ?? [];
    if (seq.length === 0) {
      setStep('return_tomorrow');
      return;
    }
    startMission(MISSION_ID);
    setSequence(seq);
    setStep('phase1');
  }, [t]);

  useEffect(() => {
    tryPhase2ThenPhase1();
  }, [tryPhase2ThenPhase1]);

  const handleCompletePhase1 = async () => {
    setStep('loading');
    const res = await claimDailyPhase('complete_phase1', MISSION_ID);
    if (!res.ok) {
      setErrorMsg(res.error || t('daily.signal_pattern.error_network'));
      setStep('error');
      return;
    }
    completePhase1();
    markPhase1Credited();
    setStep('phase1_done');
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2000);
  };

  const handlePhase2Submit = async () => {
    const trimmed = nextNumber.trim();
    const num = /^-?\d+$/.test(trimmed) ? parseInt(trimmed, 10) : NaN;
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      setErrorMsg(t('daily.signal_pattern.error_invalid_number'));
      return;
    }
    setStep('loading');
    const res = await claimDailyPhase('complete_phase2', MISSION_ID, { answer: num });
    if (!res.ok) {
      setErrorMsg(res.error || t('daily.signal_pattern.error_network'));
      setStep('error');
      return;
    }
    completePhase2();
    markPhase2Credited();
    if (res.result === 'win') {
      setStep('phase2_win');
      const amount = res.amount ?? PHASE2_REWARD;
      if (amount > 0) {
        emitM1UCreditEvent(amount, 'mission');
      }
      if ((res as { amount_pe?: number }).amount_pe) {
        const pe = (res as { amount_pe: number }).amount_pe;
        window.dispatchEvent(new CustomEvent('pe:awarded', { detail: { delta: pe } }));
        emitPECreditEvent(pe, 'daily_mission', {});
      }
    } else {
      setStep('phase2_fail');
    }
    setTimeout(() => {
      onComplete();
      onClose();
    }, res.result === 'win' ? 2500 : 3000);
  };

  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
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
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('daily.signal_pattern.loading')}</p>
          </motion.div>
        )}

        {step === 'phase1' && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
              {t('daily.signal_pattern.phase1.instruction')}
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              {sequence.map((n, i) => (
                <span
                  key={i}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    background: 'rgba(0,255,136,0.15)',
                    color: '#00FF88',
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCompletePhase1}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
                color: '#000',
                fontWeight: 700,
                border: 'none',
              }}
            >
              {t('daily.signal_pattern.phase1.cta_complete')}
            </button>
          </motion.div>
        )}

        {step === 'phase1_done' && (
          <motion.div
            key="phase1_done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 20, fontWeight: 700 }}>{t('daily.signal_pattern.win_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{t('daily.signal_pattern.return_tomorrow')}</p>
          </motion.div>
        )}

        {step === 'phase2' && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 16 }}>
              {t('daily.signal_pattern.phase2.instruction')}
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={nextNumber}
              onChange={(e) => setNextNumber(e.target.value.replace(/[^\d-]/g, ''))}
              placeholder={t('daily.signal_pattern.phase2.placeholder')}
              style={{
                width: '100%',
                maxWidth: 200,
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 20,
                marginBottom: 24,
                textAlign: 'center',
              }}
            />
            <button
              type="button"
              onClick={handlePhase2Submit}
              disabled={!nextNumber.trim()}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: nextNumber.trim() ? 'linear-gradient(135deg, #00FF88, #00D1FF)' : 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
              }}
            >
              {t('daily.signal_pattern.phase2.cta_submit')}
            </button>
          </motion.div>
        )}

        {step === 'phase2_win' && (
          <motion.div
            key="phase2_win"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 24, fontWeight: 700 }}>{t('daily.signal_pattern.win_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>{t('daily.signal_pattern.reward')}</p>
          </motion.div>
        )}

        {step === 'phase2_fail' && (
          <motion.div
            key="phase2_fail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 24, fontWeight: 700 }}>{t('daily.signal_pattern.fail_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{t('daily.signal_pattern.return_tomorrow')}</p>
          </motion.div>
        )}

        {step === 'return_tomorrow' && (
          <motion.div
            key="return_tomorrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('daily.signal_pattern.return_tomorrow')}</p>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 16 }}>{errorMsg || t('daily.signal_pattern.error_network')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
