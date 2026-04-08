/**
 * Word Duel Memory (Daily #2) — Server-real
 * Phase 1: 5 rounds (choose correct word) → saved words → 60s memorize
 * Phase 2 (tomorrow): input sequence → win/fail
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

const MISSION_ID = 'word_duel_memory_v1';
const TIMER_MEMORIZE = 60;
const PHASE1_REWARD = 10;
const PHASE2_REWARD = 10;

type Step =
  | 'loading'
  | 'rounds'
  | 'memorize'
  | 'phase1_done'
  | 'phase2'
  | 'phase2_win'
  | 'phase2_fail'
  | 'return_tomorrow'
  | 'error';

interface RoundPayload {
  round: number;
  left: string;
  right: string;
}

export const WordDuelMemoryModal: React.FC<ShellGameProps> = ({ onClose, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('loading');
  const [rounds, setRounds] = useState<RoundPayload[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [choices, setChoices] = useState<{ round: number; choice: 'left' | 'right' }[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_MEMORIZE);
  const [phase2Answer, setPhase2Answer] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
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
      setErrorMsg(res1.error || t('daily.word_duel.error'));
      setStep('error');
      return;
    }
    const progress = res1.progress as { rounds?: RoundPayload[] } | undefined;
    const r = progress?.rounds ?? [];
    if (r.length === 0) {
      setStep('return_tomorrow');
      return;
    }
    startMission(MISSION_ID);
    setRounds(r);
    setCurrentRoundIndex(0);
    setChoices([]);
    setStep('rounds');
  }, [t]);

  useEffect(() => {
    tryPhase2ThenPhase1();
  }, [tryPhase2ThenPhase1]);

  useEffect(() => {
    if (step !== 'memorize' || secondsLeft <= 0) return;
    const tick = setInterval(() => setSecondsLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(tick);
  }, [step, secondsLeft]);

  const handleRoundChoice = (side: 'left' | 'right') => {
    const round = rounds[currentRoundIndex];
    if (!round) return;
    const newChoices = [...choices, { round: round.round, choice: side }];
    setChoices(newChoices);
    if (currentRoundIndex >= rounds.length - 1) {
      setStep('loading');
      completePhase1Payload(newChoices);
    } else {
      setCurrentRoundIndex((i) => i + 1);
    }
  };

  const completePhase1Payload = async (finalChoices: { round: number; choice: 'left' | 'right' }[]) => {
    const res = await claimDailyPhase('complete_phase1', MISSION_ID, { choices: finalChoices });
    if (!res.ok) {
      setErrorMsg(res.error || t('daily.word_duel.error'));
      setStep('error');
      return;
    }
    markPhase1Credited();
    setSavedWords(res.savedWords ?? []);
    setSecondsLeft(TIMER_MEMORIZE);
    setStep('memorize');
    const amount = res.amount ?? PHASE1_REWARD;
    if (amount > 0) {
      emitM1UCreditEvent(amount, 'mission');
    }
  };

  const handleMemorizeDone = () => {
    if (secondsLeft > 0) return;
    setStep('phase1_done');
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (step === 'memorize' && secondsLeft === 0) {
      handleMemorizeDone();
    }
  }, [step, secondsLeft]);

  const handlePhase2Submit = async () => {
    setStep('loading');
    const res = await claimDailyPhase('complete_phase2', MISSION_ID, { answer: phase2Answer.trim() });
    if (!res.ok) {
      setErrorMsg(res.error || t('daily.word_duel.error'));
      setStep('error');
      return;
    }
    completePhase2();
    markPhase2Credited();
    const amount = res.amount ?? PHASE2_REWARD;
    setRewardAmount(amount);
    if (res.result === 'win') {
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

  const round = rounds[currentRoundIndex];

  return (
    <div style={fullScreenStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('daily.word_duel.close')}
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
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('daily.word_duel.loading')}</p>
          </motion.div>
        )}

        {step === 'rounds' && round && (
          <motion.div
            key="rounds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24 }}>
              {t('daily.word_duel.phase1.title', { current: round.round })}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32 }}>{t('daily.word_duel.choose_prompt')}</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleRoundChoice('left')}
                style={{
                  padding: '20px 32px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 18,
                  border: 'none',
                }}
              >
                {round.left}
              </button>
              <button
                type="button"
                onClick={() => handleRoundChoice('right')}
                style={{
                  padding: '20px 32px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 18,
                  border: 'none',
                }}
              >
                {round.right}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'memorize' && (
          <motion.div
            key="memorize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 16 }}>{t('daily.word_duel.memorize_now')}</p>
            <p style={{ color: '#00FF88', fontSize: 14, marginBottom: 24 }}>{t('daily.word_duel.saved_words')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
              {savedWords.map((w, i) => (
                <span
                  key={i}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: 'rgba(0,255,136,0.2)',
                    color: '#00FF88',
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('daily.word_duel.timer_label', { seconds: secondsLeft })}</p>
            {secondsLeft === 0 && (
              <p style={{ color: '#00FF88', fontSize: 16, marginTop: 16 }}>{t('daily.word_duel.return_tomorrow')}</p>
            )}
          </motion.div>
        )}

        {step === 'phase1_done' && (
          <motion.div
            key="phase1_done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 22, fontWeight: 700 }}>{t('daily.word_duel.win_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{t('daily.word_duel.success_reward', { amount: PHASE1_REWARD })}</p>
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
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 16 }}>{t('daily.word_duel.phase2.title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
              {t('daily.word_duel.phase2_prompt')}
            </p>
            <input
              type="text"
              value={phase2Answer}
              onChange={(e) => setPhase2Answer(e.target.value)}
              placeholder={t('daily.word_duel.input_placeholder')}
              style={{
                width: '100%',
                maxWidth: 320,
                padding: '14px 18px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 16,
                marginBottom: 24,
              }}
            />
            <button
              type="button"
              onClick={handlePhase2Submit}
              disabled={!phase2Answer.trim()}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: phase2Answer.trim() ? 'linear-gradient(135deg, #00FF88, #00D1FF)' : 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
              }}
            >
              {t('daily.word_duel.cta_complete_phase2')}
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
            <p style={{ color: '#00FF88', fontSize: 24, fontWeight: 700 }}>{t('daily.word_duel.win_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>{t('daily.word_duel.success_reward', { amount: rewardAmount })}</p>
          </motion.div>
        )}

        {step === 'phase2_fail' && (
          <motion.div
            key="phase2_fail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 24, fontWeight: 700 }}>{t('daily.word_duel.fail_title')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{t('daily.word_duel.return_tomorrow')}</p>
          </motion.div>
        )}

        {step === 'return_tomorrow' && (
          <motion.div
            key="return_tomorrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{t('daily.word_duel.return_tomorrow')}</p>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 16 }}>{errorMsg || t('daily.word_duel.error')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
