/**
 * FloatingPillLayerV3 — viewport-fixed overlay via React Portal (outside .m1-single-scroll-root).
 * Launchers only — no scroll-into-view fallbacks (per V3 spec).
 */

import React, { useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDclLauncher } from '@/contexts/DclLauncherContext';
import { useHomeSectionLauncher } from '@/contexts/HomeSectionLauncherContext';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useTodayDailyState } from '@/hooks/useTodayDailyState';
import { useDailyEngineV2 } from '@/missions/dailyEngineV2/useDailyEngineV2';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAgentCode } from '@/hooks/useAgentCode';
import { useBattlePendingCount } from '@/hooks/useBattlePendingCount';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import { DAILY_ENGINE_V2_ENABLED } from '@/config/featureFlags';
import { FLOATING_PILLS_V3_PORTAL_ID } from './floating-pills-v3';
import {
  ENABLE_COMMIT_PILL_V3,
  COMMIT_PILL_V3_RADIAL_HUB,
  isCommitPillV3IosCapacitor,
} from '@/components/home/commitPillV3/commitPillV3.config';
import { CommitRadialHubPill } from '@/components/home/commitPillV3/CommitRadialHubPill';
import { useFloatingPillsV3 } from './useFloatingPillsV3';
import { FloatingCommitPillV3 } from './FloatingCommitPillV3';
import { FloatingAgentPillV3 } from './FloatingAgentPillV3';
import { FloatingTimeRingPillV3 } from './FloatingTimeRingPillV3';
import { FloatingBattlePillV3 } from './FloatingBattlePillV3';
import { ActionRadialHubPill } from './ActionRadialHubPill';

function openTimeModalDirect(): void {
  try {
    window.dispatchEvent(new CustomEvent('openMissionModal', { detail: 'time' }));
  } catch {
    /* ignore */
  }
}

export const FloatingPillLayerV3: React.FC = () => {
  const { zIndex, stackTopOffsetPx } = useFloatingPillsV3();
  const { t } = useTranslation();
  const { user } = useUnifiedAuth();
  const { openCommit, openMission } = useDclLauncher();
  const { openAgent, openBattle } = useHomeSectionLauncher();
  const { missionStatus } = useMissionStatus();
  const { commit_done } = useTodayDailyState();
  const { run, missionId, loading: dailyLoading, retention } = useDailyEngineV2();
  const { agentCode } = useAgentCode();
  const battlePending = useBattlePendingCount(user?.id);

  const remainingDays = missionStatus?.daysRemaining ?? 0;
  const totalDays = missionStatus?.totalDays ?? 30;

  const nextBadge = useMemo(() => {
    if (!DAILY_ENGINE_V2_ENABLED) return t('home_float_badge_ready');
    if (dailyLoading) return t('home_float_badge_loading');
    if (run?.phase === 3 && run?.status === 'completed') return t('home_float_badge_mission_done');
    if (missionId && run) return t('home_float_badge_phase', { n: run.phase });
    if (missionId) return t('home_float_badge_ready');
    return t('home_float_badge_ready');
  }, [dailyLoading, missionId, run, t]);

  const orbActive = useMemo(() => {
    if (!DAILY_ENGINE_V2_ENABLED) return true;
    if (dailyLoading) return false;
    return !(run?.phase === 3 && run?.status === 'completed');
  }, [dailyLoading, run]);

  const timeBadge = useMemo(() => {
    const h = Math.max(0, remainingDays) * 24;
    if (h <= 24) return t('home_float_node_time_critical');
    if (h <= 72) return t('home_float_node_time_watch');
    return t('home_float_badge_days', { n: remainingDays });
  }, [remainingDays, t]);

  const mcpActive = retention?.agentStatus === 'ACTIVE';
  const agentBadge = agentCode && agentCode.length > 0 ? agentCode.slice(0, 6) : t('home_float_badge_agent');
  const battleLive = battlePending > 0;

  const handleNext = useCallback(() => {
    buttonClickFeedback();
    openMission();
  }, [openMission]);

  const handleCommit = useCallback(() => {
    buttonClickFeedback();
    openCommit();
  }, [openCommit]);

  const handleAgent = useCallback(() => {
    buttonClickFeedback();
    openAgent();
  }, [openAgent]);

  const handleTime = useCallback(() => {
    buttonClickFeedback();
    openTimeModalDirect();
  }, []);

  const handleBattle = useCallback(() => {
    buttonClickFeedback();
    openBattle();
  }, [openBattle]);

  const layer = (
    <div
      id={FLOATING_PILLS_V3_PORTAL_ID}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        overflow: 'visible',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/*
        Two rails, one geometric system: right = Tempo + Battle only (w-max + items-end + gap-3);
        left = Prossima azione → Commit → Agent (w-max + items-start + gap-3). No 200px spacer / second Commit portal.
      */}
      <div
        className="pointer-events-none absolute flex flex-col items-end gap-3 overflow-visible"
        style={{
          right: 'max(16px, env(safe-area-inset-right, 0px))',
          top: `calc(env(safe-area-inset-top, 0px) + ${stackTopOffsetPx}px)`,
        }}
      >
        <div className="flex w-max max-w-none flex-col items-end gap-3 self-end overflow-visible">
          <FloatingTimeRingPillV3
            remainingDays={remainingDays}
            totalDays={totalDays}
            badge={timeBadge}
            caption={t('home_side_pill_time')}
            ariaLabel={t('home_side_pill_time')}
            onTap={handleTime}
          />
          <FloatingBattlePillV3
            live={battleLive}
            labelLobby={t('home_float_node_battle_lobby')}
            labelLive={t('home_float_node_battle_live')}
            title={t('home_side_pill_battle')}
            ariaLabel={t('home_side_pill_battle')}
            onTap={handleBattle}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute flex flex-col items-start gap-3 overflow-visible"
        style={{
          left: 'max(16px, env(safe-area-inset-left, 0px))',
          top: `calc(env(safe-area-inset-top, 0px) + ${stackTopOffsetPx}px)`,
        }}
      >
        <div className="flex w-max max-w-none flex-col items-start gap-3 self-start overflow-visible">
          <ActionRadialHubPill />
          {ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor() && COMMIT_PILL_V3_RADIAL_HUB && (
            <CommitRadialHubPill />
          )}
          {!(ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor()) && (
            <FloatingCommitPillV3
              done={commit_done}
              badgeDone={t('home_side_pill_commit_done')}
              badgePending={t('home_float_badge_pending')}
              label={t('home_side_pill_commit')}
              ariaLabel={t('home_side_pill_commit')}
              onTap={handleCommit}
            />
          )}
          <FloatingAgentPillV3
            mcpActive={mcpActive}
            badge={agentBadge}
            label={t('home_side_pill_agent')}
            ariaLabel={t('home_side_pill_agent')}
            onTap={handleAgent}
          />
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(layer, document.body);
};
