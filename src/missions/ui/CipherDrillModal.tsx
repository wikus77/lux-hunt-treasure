/**
 * Cipher Drill (Anagram) — Server-real daily mission UI
 * Phase 1: anagram + 60s timer → complete_phase1
 * Phase 2: input answer → complete_phase2 → win/fail
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { claimDailyPhase, MISSION_ID_CIPHER_DRILL } from '@/missions/serverReal/claimDailyPhase';
import {
  startMission,
  completePhase1,
  completePhase2,
  markPhase1Credited,
  markPhase2Credited,
} from '@/missions/missionState';
import { calculatePhaseRewards } from '@/missions/missionsRegistry';
import { emitM1UCreditEvent } from '@/features/m1u/m1uCreditEvent';
import { emitPECreditEvent } from '@/features/pulse/peCreditEvent';
import type { ShellGameProps } from '@/missions/dailyMiniGames/shellGameProps';

const PHASE1_REWARD = 10;
const PHASE2_REWARD = 10;
const TIMER_SECONDS = 60;

type Step = 'loading' | 'phase1' | 'phase1_done' | 'phase2' | 'phase2_win' | 'phase2_fail' | 'error' | 'return_tomorrow';

export const CipherDrillModal: React.FC<ShellGameProps> = ({ onClose, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('loading');
  const [anagram, setAnagram] = useState<string>('');
  const [answer, setAnswer] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const tryPhase2ThenPhase1 = useCallback(async () => {
    setErrorMsg('');
    const res2 = await claimDailyPhase('start_phase2', MISSION_ID_CIPHER_DRILL);
    if (res2.ok && res2.phase === 2) {
      setStep('phase2');
      return;
    }
    const res1 = await claimDailyPhase('start_phase1', MISSION_ID_CIPHER_DRILL);
    if (!res1.ok) {
      setErrorMsg(res1.error || t('cipher_drill.error'));
      setStep('error');
      return;
    }
    if (res1.phase === 2 && !res1.progress?.anagram) {
      setStep('return_tomorrow');
      return;
    }
    if (res1.progress?.anagram) {
      startMission(MISSION_ID_CIPHER_DRILL);
      setAnagram(res1.progress.anagram);
      setSecondsLeft(TIMER_SECONDS);
      setStep('phase1');
    } else {
      setStep('return_tomorrow');
    }
  }, [t]);

  useEffect(() => {
    tryPhase2ThenPhase1();
  }, [tryPhase2ThenPhase1]);

  useEffect(() => {
    if (step !== 'phase1' || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, secondsLeft]);

  const handleMemorized = async () => {
    setStep('loading');
    const res = await claimDailyPhase('complete_phase1', MISSION_ID_CIPHER_DRILL);
    if (res.ok) {
      completePhase1();
      markPhase1Credited();
      const amount = res.amount ?? PHASE1_REWARD;
      setRewardAmount(amount);
      setStep('phase1_done');
      if (amount > 0) {
        emitM1UCreditEvent(amount, 'mission');
      }
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } else {
      setErrorMsg(res.error || t('cipher_drill.error'));
      setStep('error');
    }
  };

  const handleSubmitPhase2 = async () => {
    if (!answer.trim()) return;
    setStep('loading');
    const res = await claimDailyPhase('complete_phase2', MISSION_ID_CIPHER_DRILL, { answer: answer.trim() });
    if (res.ok) {
      if (res.result === 'win') {
        completePhase2();
        markPhase2Credited();
        const amount = res.amount ?? PHASE2_REWARD;
        setRewardAmount(amount);
        setStep('phase2_win');
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
    } else {
      setErrorMsg(res.error || t('cipher_drill.error'));
      setStep('error');
    }
  };

  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
    paddingLeft: '16px',
    paddingRight: '16px',
  };

  return (
    <div style={fullScreenStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('mission.popup.close')}
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
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('cipher_drill.loading')}</p>
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
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24 }}>
              {t('cipher_drill.phase1_instruction')}
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: 8, color: '#00FF88', marginBottom: 16 }}>
              {anagram}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 32 }}>
              {t('cipher_drill.timer_label', { seconds: secondsLeft })}
            </p>
            <button
              type="button"
              onClick={handleMemorized}
              disabled={secondsLeft > 0}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: secondsLeft > 0 ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #00FF88, #00D1FF)',
                color: '#fff',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {t('cipher_drill.cta_memorized')}
            </button>
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
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
              {t('cipher_drill.phase2_instruction')}
            </p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('cipher_drill.phase2_placeholder')}
              autoCapitalize="characters"
              autoCorrect="off"
              style={{
                width: '100%',
                maxWidth: 280,
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 18,
                marginBottom: 24,
              }}
            />
            <button
              type="button"
              onClick={handleSubmitPhase2}
              disabled={!answer.trim()}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: answer.trim() ? 'linear-gradient(135deg, #00FF88, #00D1FF)' : 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: answer.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {t('cipher_drill.cta_confirm')}
            </button>
          </motion.div>
        )}

        {step === 'phase1_done' && (
          <motion.div
            key="phase1_done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 22, fontWeight: 700 }}>{t('cipher_drill.success_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
              {t('cipher_drill.success_reward', { amount: rewardAmount })}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 16 }}>
              {t('cipher_drill.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'phase2_win' && (
          <motion.div
            key="phase2_win"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 24, fontWeight: 700 }}>{t('cipher_drill.success_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
              {t('cipher_drill.success_reward', { amount: rewardAmount })}
            </p>
          </motion.div>
        )}

        {step === 'phase2_fail' && (
          <motion.div
            key="phase2_fail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 22, fontWeight: 700 }}>{t('cipher_drill.fail_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginTop: 12 }}>
              {t('cipher_drill.fail_copy')}
            </p>
          </motion.div>
        )}

        {step === 'return_tomorrow' && (
          <motion.div
            key="return_tomorrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center' }}>
              {t('cipher_drill.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 16 }}>{errorMsg || t('cipher_drill.error')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
