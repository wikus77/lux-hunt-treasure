/**
 * Daily Engine V2 — Phase 1 MVP card. Server-driven daily mission.
 * Shows today's mission, run state, countdown to UTC midnight. No legacy UI.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, ChevronRight, Gift } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useDailyEngineV2 } from './useDailyEngineV2';
import { getSecondsUntilNextUtcMidnight } from './getNextUtcMidnight';
import { consumeSundayReward } from '@/missions/serverReal/consumeSundayReward';
import { resolveMiniGameModal, isShellMiniGameSupported } from '@/missions/dailyMiniGames/miniGameRegistry';
import { isDailyMiniGamePilotUser } from '@/missions/dailyMiniGames/dmgPilotAllowlist';
import {
  GAME_TYPE_PIN_ROTATOR_TIMING,
  MISSION_ID_DMG_V1_D01_PIN_ROTATOR,
} from '@/missions/serverReal/claimDailyPhase';
import { getTodayKey } from '@/missions/missionState';
import { PinRotatorTimingModal } from '@/missions/miniGames/pinRotatorTiming/PinRotatorTimingModal';
import { SundaySuperRewardModal } from './SundaySuperRewardModal';

/** Dev-only: local Pin Rotator UX lab (replayTestMode — zero claimDailyPhase / no DB writes). */
function useDevPinRotatorLabEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('m1_dev_pin_rotator_lab') === 'true';
  } catch {
    return false;
  }
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DailyEngineV2Card() {
  const { t } = useTranslation();
  const { user } = useUnifiedAuth();
  const { dayKey, missionId, templateKey, gameType, run, retention, loading, error, refetch } = useDailyEngineV2();
  const devPinRotatorLab = useDevPinRotatorLabEnabled();
  const [showDevPinLabModal, setShowDevPinLabModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSundayModal, setShowSundayModal] = useState(false);
  const [sundayConsuming, setSundayConsuming] = useState(false);
  const [countdownSec, setCountdownSec] = useState(getSecondsUntilNextUtcMidnight());

  useEffect(() => {
    const tick = () => setCountdownSec(getSecondsUntilNextUtcMidnight());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    refetch();
  }, [refetch]);

  const handleComplete = useCallback(() => {
    setShowModal(false);
    refetch();
  }, [refetch]);

  const handleSundayClaim = useCallback(async (sundayDayKey: string) => {
    if (!sundayDayKey || sundayConsuming) return;
    setSundayConsuming(true);
    try {
      const res = await consumeSundayReward(sundayDayKey);
      if (res.ok && (res.consumed || res.already_consumed)) {
        setShowSundayModal(true);
        refetch();
      }
    } finally {
      setSundayConsuming(false);
    }
  }, [sundayConsuming, refetch]);

  const handleSundayClose = useCallback(() => {
    setShowSundayModal(false);
    refetch();
  }, [refetch]);

  const canOpenMission = missionId != null && isShellMiniGameSupported(missionId, gameType);
  const isCompleted = run != null && run.phase === 3 && run.status === 'completed';

  const isPinRotatorPilotMission =
    gameType === GAME_TYPE_PIN_ROTATOR_TIMING || missionId === MISSION_ID_DMG_V1_D01_PIN_ROTATOR;

  const allowPilotReplay =
    isCompleted &&
    isPinRotatorPilotMission &&
    isDailyMiniGamePilotUser(user?.email) &&
    dayKey != null &&
    missionId != null &&
    user?.id != null;

  const canOpenModal = !isCompleted || allowPilotReplay;

  const statusLabel =
    run == null
      ? t('daily_engine.status_not_started')
      : isCompleted
        ? t('daily_engine.status_completed')
        : run.phase === 1
          ? t('daily_engine.status_phase1')
          : run.phase === 2
            ? t('daily_engine.status_phase2')
            : t('daily_engine.status_not_started');

  const ctaLabel =
    run == null
      ? t('daily_engine.cta_start')
      : isCompleted
        ? t('daily_engine.cta_completed')
        : run.phase === 1
          ? t('daily_engine.cta_continue')
          : t('daily_engine.cta_phase2');

  const formatCountdown = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const devPinLabBlock =
    devPinRotatorLab && user?.id ? (
      <>
        <div style={{ marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setShowDevPinLabModal(true)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px dashed rgba(0, 209, 255, 0.45)',
              background: 'rgba(0, 209, 255, 0.06)',
              color: 'rgba(0, 209, 255, 0.9)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Dev: Pin Rotator lab (no server claims)
          </button>
        </div>
        {showDevPinLabModal && (
          <PinRotatorTimingModal
            key="dev-pin-rotator-lab"
            onClose={() => setShowDevPinLabModal(false)}
            onComplete={() => setShowDevPinLabModal(false)}
            replayTestMode
            pinRotatorReplayContext={{
              dayKey: dayKey ?? getTodayKey(),
              missionId: MISSION_ID_DMG_V1_D01_PIN_ROTATOR,
              userId: user.id,
              progressJson: null,
            }}
          />
        )}
      </>
    ) : null;

  if (loading) {
    return (
      <>
        <div
          style={{
            marginBottom: '12px',
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(0, 209, 255, 0.08)',
            border: '1px solid rgba(0, 209, 255, 0.2)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{t('daily_engine.loading')}</p>
        </div>
        {devPinLabBlock}
      </>
    );
  }

  if (error || !dayKey || !missionId) {
    return (
      <>
        <div
          style={{
            marginBottom: '12px',
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{t('daily_engine.unavailable')}</p>
        </div>
        {devPinLabBlock}
      </>
    );
  }

  if (!canOpenMission) {
    return (
      <>
        <div
          style={{
            marginBottom: '12px',
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{t('daily_engine.unavailable_mission')}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>{t('daily_engine.reset_utc')}</p>
        </div>
        {devPinLabBlock}
      </>
    );
  }

  const MiniGameModal = resolveMiniGameModal(missionId, gameType);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => canOpenModal && setShowModal(true)}
        onKeyDown={(e) => e.key === 'Enter' && canOpenModal && setShowModal(true)}
        style={{
          marginBottom: '12px',
          padding: '14px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.15) 0%, rgba(0, 209, 255, 0.06) 100%)',
          border: '1px solid rgba(0, 209, 255, 0.3)',
          cursor: canOpenModal ? 'pointer' : 'default',
          boxShadow: '0 2px 12px rgba(0, 209, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.3), rgba(0, 209, 255, 0.1))',
              border: '1px solid rgba(0, 209, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Target style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
              {templateKey
                ? t('daily_engine.title') + ' — ' + t(`daily_engine.template_${templateKey}`)
                : t('daily_engine.title')}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              {statusLabel}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>
              {t('daily_engine.reset_utc')} · {t('daily_engine.next_in', { time: formatCountdown(countdownSec) })}
            </p>
          </div>
          {canOpenModal && (
            <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(0, 209, 255, 0.6)', flexShrink: 0 }} />
          )}
        </div>
        {isCompleted && (
          <div style={{ marginTop: '8px' }}>
            <p style={{ color: 'rgba(0, 255, 136, 0.9)', fontSize: '12px', margin: 0 }}>{ctaLabel}</p>
            {allowPilotReplay && (
              <p style={{ color: 'rgba(0, 209, 255, 0.75)', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>
                {t('daily_engine.replay_test_hint')}
              </p>
            )}
          </div>
        )}

        {/* Phase 3 — Retention: streak, weekly tracker, agent status */}
        {retention && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0, 209, 255, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                {t('daily_engine.streak_label')}: <strong style={{ color: '#00D1FF' }}>{retention.streak}</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                {retention.agentStatus === 'ACTIVE'
                  ? t('daily_engine.agent_active')
                  : t('daily_engine.agent_inactive')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', alignItems: 'center' }}>
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  title={retention.weeklyCompletion[i] ? t('daily_engine.weekly_done') : t('daily_engine.weekly_not_done')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: retention.weeklyCompletion[i] ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${retention.weeklyCompletion[i] ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255,255,255,0.15)'}`,
                    fontSize: '9px',
                    color: retention.weeklyCompletion[i] ? '#fff' : 'rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {label[0]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3 — Sunday Super Reward CTA (claimable Monday with Sunday's day_key) */}
        {retention?.sundayRewardAvailable && retention.sundayRewardDayKey && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleSundayClaim(retention.sundayRewardDayKey!);
            }}
            disabled={sundayConsuming}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.06))',
              color: '#FFD700',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: sundayConsuming ? 'wait' : 'pointer',
            }}
          >
            <Gift style={{ width: '18px', height: '18px' }} />
            {sundayConsuming ? t('daily_engine.sunday_claiming') : t('daily_engine.sunday_reward_cta')}
          </button>
        )}
      </div>

      {showModal && MiniGameModal != null && (
        <MiniGameModal
          key={`${missionId}${allowPilotReplay && isCompleted ? '-replay' : ''}`}
          onClose={handleClose}
          onComplete={handleComplete}
          replayTestMode={Boolean(allowPilotReplay && isCompleted)}
          pinRotatorReplayContext={
            allowPilotReplay && isCompleted && dayKey && missionId && user?.id
              ? {
                  dayKey,
                  missionId,
                  userId: user.id,
                  progressJson: run?.progress_json ?? null,
                }
              : null
          }
        />
      )}
      {devPinLabBlock}
      {showSundayModal && (
        <SundaySuperRewardModal onClose={handleSundayClose} />
      )}
    </>
  );
}
