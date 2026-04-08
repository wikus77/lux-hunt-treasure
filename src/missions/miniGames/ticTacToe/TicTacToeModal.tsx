/**
 * Tactical Tic-Tac-Toe (Daily) — server-real, single move per phase.
 * Phase 1: board today → pick cell → complete_phase1 (retry on fail).
 * Phase 2: next UTC day → pick cell → complete_phase2 (reward / streak).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  claimDailyPhase,
  MISSION_ID_TACTICAL_TIC_TAC_TOE,
} from '@/missions/serverReal/claimDailyPhase';
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
import type { TttBoard } from './ticTacToeTypes';
import { parseBoardFromProgress } from './ticTacToeLogic';
import { TicTacToeBoard } from './TicTacToeBoard';

const P2_REWARD = 10;

type Step =
  | 'loading'
  | 'phase1'
  | 'phase1_done'
  | 'phase2'
  | 'phase2_win'
  | 'phase2_fail'
  | 'return_tomorrow'
  | 'error';

export const TicTacToeModal: React.FC<ShellGameProps> = ({ onClose, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('loading');
  const [board, setBoard] = useState<TttBoard | null>(null);
  const [activePhase, setActivePhase] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [winHighlight, setWinHighlight] = useState<number | null>(null);
  const [showFailHint, setShowFailHint] = useState(false);

  const tryPhase2ThenPhase1 = useCallback(async () => {
    setErrorMsg('');
    const res2 = await claimDailyPhase('start_phase2', MISSION_ID_TACTICAL_TIC_TAC_TOE);
    const p2Board = parseBoardFromProgress(res2.progress?.board);
    if (res2.ok && res2.phase === 2 && p2Board) {
      startMission(MISSION_ID_TACTICAL_TIC_TAC_TOE);
      setBoard(p2Board);
      setActivePhase(2);
      setSelected(null);
      setStep('phase2');
      return;
    }

    const res1 = await claimDailyPhase('start_phase1', MISSION_ID_TACTICAL_TIC_TAC_TOE);
    if (!res1.ok) {
      setErrorMsg(res1.error || t('daily_ttt.error_network'));
      setStep('error');
      return;
    }

    const p1Board = parseBoardFromProgress(res1.progress?.board);
    const ph = res1.phase ?? 1;

    if (ph >= 2 && ph < 3) {
      setStep('return_tomorrow');
      return;
    }
    if (ph >= 3) {
      setStep('return_tomorrow');
      return;
    }

    if (!p1Board) {
      setErrorMsg(t('daily_ttt.error_network'));
      setStep('error');
      return;
    }

    startMission(MISSION_ID_TACTICAL_TIC_TAC_TOE);
    setBoard(p1Board);
    setActivePhase(1);
    setSelected(null);
    setStep('phase1');
  }, [t]);

  useEffect(() => {
    void tryPhase2ThenPhase1();
  }, [tryPhase2ThenPhase1]);

  useEffect(() => {
    if (!showFailHint) return;
    const t = window.setTimeout(() => setShowFailHint(false), 1400);
    return () => window.clearTimeout(t);
  }, [showFailHint]);

  const handleConfirmPhase1 = async () => {
    if (selected === null || board === null || submitting) return;
    setSubmitting(true);
    const res = await claimDailyPhase('complete_phase1', MISSION_ID_TACTICAL_TIC_TAC_TOE, {
      cell: selected,
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || t('daily_ttt.error_network'));
      setStep('error');
      return;
    }
    if (res.result === 'fail') {
      setShakeKey((k) => k + 1);
      setSelected(null);
      setShowFailHint(true);
      return;
    }
    completePhase1();
    markPhase1Credited();
    const amount = res.amount ?? 0;
    if (amount > 0) {
      emitM1UCreditEvent(amount, 'mission');
    }
    setWinHighlight(selected);
    setStep('phase1_done');
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2200);
  };

  const handleConfirmPhase2 = async () => {
    if (selected === null || board === null || submitting) return;
    setSubmitting(true);
    const res = await claimDailyPhase('complete_phase2', MISSION_ID_TACTICAL_TIC_TAC_TOE, {
      cell: selected,
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || t('daily_ttt.error_network'));
      setStep('error');
      return;
    }
    completePhase2();
    markPhase2Credited();
    if (res.result === 'win') {
      setWinHighlight(selected);
      setStep('phase2_win');
      const amount = res.amount ?? P2_REWARD;
      if (amount > 0) {
        emitM1UCreditEvent(amount, 'mission');
      }
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

        {(step === 'phase1' || step === 'phase2') && board && (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 20,
            }}
          >
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, textAlign: 'center' }}>
              {t('daily_ttt.title')}
            </h2>
            <p style={{ color: 'rgba(0, 209, 255, 0.85)', fontSize: 13, margin: 0, textAlign: 'center' }}>
              {t('daily_ttt.subtitle')}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, margin: 0, textAlign: 'center', maxWidth: 320 }}>
              {t('daily_ttt.instruction')}
            </p>
            <TicTacToeBoard
              board={board}
              selectedIndex={selected}
              disabled={submitting}
              shakeKey={shakeKey}
              highlightIndex={winHighlight}
              onSelect={setSelected}
            />
            {showFailHint && activePhase === 1 && (
              <p style={{ color: '#ff6b6b', fontSize: 14, margin: 0, minHeight: 20 }}>{t('daily_ttt.fail')}</p>
            )}
            <button
              type="button"
              disabled={selected === null || submitting}
              onClick={() => (activePhase === 1 ? void handleConfirmPhase1() : void handleConfirmPhase2())}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background:
                  selected !== null && !submitting
                    ? 'linear-gradient(135deg, rgba(0, 209, 255, 0.9), rgba(0, 255, 200, 0.75))'
                    : 'rgba(255,255,255,0.2)',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                marginTop: 8,
              }}
            >
              {t('daily_ttt.cta_confirm')}
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
            <p style={{ color: '#00FF88', fontSize: 22, fontWeight: 700 }}>{t('daily_ttt.success')}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center' }}>
              {t('daily.signal_pattern.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'phase2_win' && (
          <motion.div
            key="phase2_win"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#00FF88', fontSize: 24, fontWeight: 700 }}>{t('daily_ttt.success')}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>{t('daily.signal_pattern.reward')}</p>
          </motion.div>
        )}

        {step === 'phase2_fail' && (
          <motion.div
            key="phase2_fail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 22, fontWeight: 700 }}>{t('daily_ttt.fail')}</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, textAlign: 'center' }}>
              {t('daily.signal_pattern.return_tomorrow')}
            </p>
          </motion.div>
        )}

        {step === 'return_tomorrow' && (
          <motion.div
            key="return_tomorrow"
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
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <p style={{ color: '#ff6b6b', fontSize: 16 }}>{errorMsg || t('daily_ttt.error_network')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
