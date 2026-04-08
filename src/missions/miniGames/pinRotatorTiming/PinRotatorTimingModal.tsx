/**
 * Pin Rotator Timing — pilot daily mini game (dmg_v1_d01).
 * UX: one challenge per daily (weekly pin count). Server: phase1+2 chain completed invisibly after win.
 * Replay: allowlist local simulation (no claims).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import {
  claimDailyPhase,
  MISSION_ID_DMG_V1_D01_PIN_ROTATOR,
} from '@/missions/serverReal/claimDailyPhase';
import { fetchDailyMissionToday } from '@/missions/serverReal/dailyMissionToday';
import type { PinRotatorReplayContext } from '@/missions/dailyMiniGames/pinRotatorReplayTypes';
import { emitM1UCreditEvent } from '@/features/m1u/m1uCreditEvent';
import { emitPECreditEvent } from '@/features/pulse/peCreditEvent';
import { PinRotatorGameCanvas } from './PinRotatorGameCanvas';
import { normalizeDegrees } from './pinRotatorAngles';
import { resolvePinRotatorReplayTargets } from './pinRotatorReplaySeed';
import { getWeeklyPinsTarget, weekIndexFromCycleDayIndex } from './pinRotatorProgression';

type Step = 'loading' | 'playing' | 'done_win' | 'done_fail' | 'error';

interface PinRotatorTimingModalProps {
  onClose: () => void;
  onComplete: () => void;
  replayTestMode?: boolean;
  pinRotatorReplayContext?: PinRotatorReplayContext | null;
}

const MISSION_ID = MISSION_ID_DMG_V1_D01_PIN_ROTATOR;

function angularDistanceDeg(a: number, b: number): number {
  const na = normalizeDegrees(a);
  const nb = normalizeDegrees(b);
  let d = Math.abs(na - nb);
  if (d > 180) d = 360 - d;
  return d;
}

export const PinRotatorTimingModal: React.FC<PinRotatorTimingModalProps> = ({
  onClose,
  onComplete,
  replayTestMode = false,
  pinRotatorReplayContext = null,
}) => {
  const { t } = useTranslation();
  const replaySnapshot = useMemo(
    () => (replayTestMode ? resolvePinRotatorReplayTargets(pinRotatorReplayContext) : null),
    [replayTestMode, pinRotatorReplayContext]
  );

  const [weekIndex, setWeekIndex] = useState(1);
  const [step, setStep] = useState<Step>(() => {
    if (!replayTestMode) return 'loading';
    return replaySnapshot ? 'playing' : 'error';
  });
  const [errorMsg, setErrorMsg] = useState('');
  const claimBusyRef = useRef(false);
  /** Server already has phase1 done; user only completes phase2 with this session's angle. */
  const resumePhase2OnlyRef = useRef(false);
  /** Phase 1 server target from start_phase1 (must match complete_phase1; gameplay angle often differs). */
  const serverP1Ref = useRef<number | null>(null);
  /** After boot reaches `playing`, keep canvas mounted during claim `loading` (pinsTarget must stay > 0). */
  const gameplayStartedRef = useRef(Boolean(replayTestMode && replaySnapshot));
  const onCompleteRef = useRef(onComplete);
  const onCloseRef = useRef(onClose);
  const tRef = useRef(t);
  onCompleteRef.current = onComplete;
  onCloseRef.current = onClose;
  tRef.current = t;

  useEffect(() => {
    let cancelled = false;
    void fetchDailyMissionToday().then((r) => {
      if (cancelled || !r.ok) return;
      setWeekIndex(weekIndexFromCycleDayIndex(r.cycle_day_index));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (replayTestMode && !replaySnapshot) {
      setErrorMsg(t('daily_pin_rotator.replay_unavailable'));
      setStep('error');
    }
  }, [replayTestMode, replaySnapshot, t]);

  const weekPins = getWeeklyPinsTarget(weekIndex);
  const pinsTarget =
    step === 'playing' || (step === 'loading' && gameplayStartedRef.current) ? weekPins : 0;

  useEffect(() => {
    if (replayTestMode) return;
    let cancelled = false;
    void (async () => {
      setErrorMsg('');
      const res = await claimDailyPhase('start_phase1', MISSION_ID);
      if (cancelled) return;
      if (!res.ok) {
        setErrorMsg(res.error || tRef.current('daily_pin_rotator.error'));
        setStep('error');
        return;
      }
      if (res.phase === 3) {
        setStep(res.status === 'completed' ? 'done_win' : 'done_fail');
        setTimeout(() => {
          onCompleteRef.current();
          onCloseRef.current();
        }, 900);
        return;
      }
      if (res.phase === 2 && res.status === 'active') {
        resumePhase2OnlyRef.current = true;
      } else {
        resumePhase2OnlyRef.current = false;
      }
      if (typeof res.progress?.target_angle === 'number' && Number.isFinite(res.progress.target_angle)) {
        serverP1Ref.current = res.progress.target_angle;
      }
      gameplayStartedRef.current = true;
      setStep('playing');
    })();
    return () => {
      cancelled = true;
    };
  }, [replayTestMode]);

  const applyPhase2Outcome = useCallback(
    (res: { ok: boolean; error?: string; result?: 'win' | 'fail'; amount?: number; amount_pe?: number }) => {
      if (!res.ok) {
        claimBusyRef.current = false;
        setErrorMsg(res.error || t('daily_pin_rotator.error'));
        setStep('error');
        return;
      }
      if (res.result === 'win') {
        if ((res.amount ?? 0) > 0) emitM1UCreditEvent(res.amount!, 'mission');
        const pe = (res as { amount_pe?: number }).amount_pe;
        if (pe) {
          window.dispatchEvent(new CustomEvent('pe:awarded', { detail: { delta: pe } }));
          emitPECreditEvent(pe, 'daily_mission', {});
        }
        setStep('done_win');
      } else {
        setStep('done_fail');
      }
      setTimeout(() => {
        claimBusyRef.current = false;
        onCompleteRef.current();
        onCloseRef.current();
      }, res.result === 'win' ? 2200 : 2800);
    },
    [t]
  );

  const handleGameplayWin = useCallback(
    async (angleDeg: number) => {
      if (replayTestMode && replaySnapshot) {
        if (claimBusyRef.current) return;
        claimBusyRef.current = true;
        if (angularDistanceDeg(angleDeg, replaySnapshot.p1) > replaySnapshot.t1) {
          claimBusyRef.current = false;
          return;
        }
        setStep('done_win');
        setTimeout(() => {
          claimBusyRef.current = false;
          onComplete();
          onClose();
        }, 1800);
        return;
      }

      if (claimBusyRef.current) return;
      claimBusyRef.current = true;
      setStep('loading');

      if (resumePhase2OnlyRef.current) {
        const r2 = await claimDailyPhase('start_phase2', MISSION_ID);
        if (!r2.ok || r2.phase !== 2 || typeof r2.progress?.target_angle !== 'number') {
          claimBusyRef.current = false;
          setErrorMsg(r2.error || t('daily_pin_rotator.error'));
          setStep('error');
          return;
        }
        const t2r = r2.progress.target_angle;
        const res = await claimDailyPhase('complete_phase2', MISSION_ID, {
          angle_deg: Math.round(t2r),
        });
        applyPhase2Outcome(res);
        return;
      }

      const p1 = serverP1Ref.current;
      if (p1 == null || !Number.isFinite(p1)) {
        claimBusyRef.current = false;
        setErrorMsg(t('daily_pin_rotator.error'));
        setStep('error');
        return;
      }
      const res1 = await claimDailyPhase('complete_phase1', MISSION_ID, {
        angle_deg: Math.round(p1),
      });
      if (!res1.ok) {
        claimBusyRef.current = false;
        setErrorMsg(res1.error || t('daily_pin_rotator.error'));
        setStep('error');
        return;
      }
      if ((res1.amount ?? 0) > 0) {
        emitM1UCreditEvent(res1.amount!, 'mission');
      }

      const res2 = await claimDailyPhase('start_phase2', MISSION_ID);
      if (!res2.ok || res2.phase !== 2 || typeof res2.progress?.target_angle !== 'number') {
        claimBusyRef.current = false;
        setErrorMsg(res2.error || t('daily_pin_rotator.error'));
        setStep('error');
        return;
      }

      const t2 = res2.progress.target_angle;
      const res3 = await claimDailyPhase('complete_phase2', MISSION_ID, {
        angle_deg: Math.round(t2),
      });
      applyPhase2Outcome(res3);
    },
    [t, replayTestMode, replaySnapshot, applyPhase2Outcome, onComplete, onClose]
  );

  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(180deg, #0a0a12 0%, #0f1824 50%, #0a1218 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: 'max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))',
  };

  const showGame =
    (step === 'playing' || (step === 'loading' && gameplayStartedRef.current)) &&
    pinsTarget > 0 &&
    (!replayTestMode || replaySnapshot != null);

  return (
    <div style={fullScreenStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
        }}
      >
        {replayTestMode && replaySnapshot ? (
          <div
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: 'rgba(0, 209, 255, 0.95)',
              background: 'rgba(0, 209, 255, 0.08)',
              border: '1px solid rgba(0, 209, 255, 0.32)',
              boxShadow: '0 0 20px rgba(0, 209, 255, 0.1)',
              lineHeight: 1.35,
            }}
          >
            {t('daily_pin_rotator.test_mode_banner')}
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label={t('daily_pin_rotator.close')}
          style={{
            flexShrink: 0,
            position: 'relative',
            zIndex: 2,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(0, 209, 255, 0.25)',
            borderRadius: 12,
            padding: 10,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <X size={22} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {step === 'loading' && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{t('daily_pin_rotator.loading')}</p>
        )}

        {showGame && (
          <>
            <h2 style={{ color: '#00D1FF', fontSize: 18, fontWeight: 700, textAlign: 'center', margin: 0 }}>
              {t('daily_pin_rotator.title_daily')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', maxWidth: 320, margin: 0 }}>
              {t('daily_pin_rotator.goal_short')}
            </p>
            <p style={{ color: 'rgba(0,209,255,0.7)', fontSize: 12, textAlign: 'center', maxWidth: 320, margin: 0 }}>
              {t('daily_pin_rotator.subtitle_cycle')}
            </p>
            <PinRotatorGameCanvas
              key={`play-${weekIndex}-${replayTestMode ? 'r' : 'l'}`}
              phase={1}
              pinsTarget={pinsTarget}
              paused={step === 'loading'}
              onRoundSuccess={handleGameplayWin}
            />
          </>
        )}

        {step === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <p style={{ color: '#ff6b6b', fontSize: 14 }}>{errorMsg || t('daily_pin_rotator.error')}</p>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 16,
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {t('daily_pin_rotator.close')}
            </button>
          </div>
        )}

        {step === 'done_win' && (
          <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 600 }}>
            {replayTestMode ? t('daily_pin_rotator.replay_session_complete') : t('daily_pin_rotator.win')}
          </p>
        )}
        {step === 'done_fail' && !replayTestMode && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{t('daily_pin_rotator.fail')}</p>
        )}
        {step === 'done_fail' && replayTestMode && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{t('daily_pin_rotator.replay_session_fail')}</p>
        )}
      </div>
    </div>
  );
};
