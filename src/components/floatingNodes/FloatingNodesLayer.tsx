/**
 * FloatingNodesLayer — composes ActionOrb, TimeRing, CommitBlob, AgentNode, BattleNode.
 * Same launchers / data as legacy side pills; UI-only rebuild.
 */

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
import { ENABLE_COMMIT_PILL_V3, isCommitPillV3IosCapacitor } from '@/components/home/commitPillV3/commitPillV3.config';
import { ActionOrb } from './ActionOrb';
import { TimeRing } from './TimeRing';
import { CommitBlob } from './CommitBlob';
import { AgentNode } from './AgentNode';
import { BattleNode } from './BattleNode';

const SCROLL_OPTS: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };

function safeScroll(sel: string) {
  try {
    document.querySelector(sel)?.scrollIntoView(SCROLL_OPTS);
  } catch {
    /* ignore */
  }
}

function openTimeModalDirect(): boolean {
  try {
    window.dispatchEvent(new CustomEvent('openMissionModal', { detail: 'time' }));
    return true;
  } catch {
    return false;
  }
}

const FLOAT_Y = { y: [0, -6, 0] };
const FLOAT_TR = { duration: 5.5, repeat: Infinity, ease: 'easeInOut' as const };

export const FloatingNodesLayer: React.FC = () => {
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

  const handleNext = useCallback(() => {
    try {
      buttonClickFeedback();
      if (!openMission()) safeScroll('#home-daily-mission');
    } catch {
      safeScroll('#home-daily-mission');
    }
  }, [openMission]);

  const handleCommit = useCallback(() => {
    try {
      buttonClickFeedback();
      if (!openCommit()) safeScroll('#home-daily-commit');
    } catch {
      safeScroll('#home-daily-commit');
    }
  }, [openCommit]);

  const handleAgent = useCallback(() => {
    try {
      buttonClickFeedback();
      if (!openAgent()) safeScroll('[data-section="agent"]');
    } catch {
      safeScroll('[data-section="agent"]');
    }
  }, [openAgent]);

  const handleTime = useCallback(() => {
    try {
      buttonClickFeedback();
      if (!openTimeModalDirect()) safeScroll('[data-section="status"]');
    } catch {
      safeScroll('[data-section="status"]');
    }
  }, []);

  const handleBattle = useCallback(() => {
    try {
      buttonClickFeedback();
      if (!openBattle()) safeScroll('[data-section="battle"]');
    } catch {
      safeScroll('[data-section="battle"]');
    }
  }, [openBattle]);

  return (
    <motion.div
      className="fixed inset-0 z-[58] pointer-events-none"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="pointer-events-none absolute flex flex-col items-start gap-4"
        style={{
          left: 'max(6px, env(safe-area-inset-left, 0px))',
          top: 'calc(env(safe-area-inset-top, 0px) + 188px)',
        }}
        animate={FLOAT_Y}
        transition={FLOAT_TR}
      >
        <ActionOrb
          active={orbActive}
          onTap={handleNext}
          badge={nextBadge}
          label={t('home_side_pill_next_action')}
          ariaLabel={t('home_side_pill_next_action')}
        />
        {!(ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor()) && (
          <CommitBlob
            done={commit_done}
            onTap={handleCommit}
            badgeDone={t('home_side_pill_commit_done')}
            badgePending={t('home_float_badge_pending')}
            label={t('home_side_pill_commit')}
            ariaLabel={t('home_side_pill_commit')}
          />
        )}
        <AgentNode
          mcpActive={mcpActive}
          onTap={handleAgent}
          badge={agentBadge}
          label={t('home_side_pill_agent')}
          ariaLabel={t('home_side_pill_agent')}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute flex flex-col items-end gap-4"
        style={{
          right: 'max(6px, env(safe-area-inset-right, 0px))',
          top: 'calc(env(safe-area-inset-top, 0px) + 188px)',
        }}
        animate={FLOAT_Y}
        transition={{ ...FLOAT_TR, delay: 0.55 }}
      >
        <TimeRing
          remainingDays={remainingDays}
          totalDays={totalDays}
          onTap={handleTime}
          badge={timeBadge}
          caption={t('home_side_pill_time')}
          ariaLabel={t('home_side_pill_time')}
        />
        <BattleNode
          pendingInvites={battlePending}
          onTap={handleBattle}
          labelLobby={t('home_float_node_battle_lobby')}
          labelLive={t('home_float_node_battle_live')}
          title={t('home_side_pill_battle')}
          ariaLabel={t('home_side_pill_battle')}
        />
      </motion.div>
    </motion.div>
  );
};
