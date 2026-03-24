/**
 * HomeSidePillsLayerLegacy — Capsule-style floating pills (pre–Floating Nodes V2).
 * Same launchers as v2; kept for ENABLE_FLOATING_NODES_V2 rollback.
 * © 2026 Joseph MULÉ – M1SSION™
 */

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Swords, Sparkles, Target, Bot } from 'lucide-react';
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

/** Aligned with ActiveMissionBox: final day = 0, urgent ≤5, else steady. */
function getTimeVisual(remainingDays: number, totalDays: number) {
  const isFinal = remainingDays === 0;
  const isUrgent = remainingDays <= 5;
  const progress =
    totalDays > 0 ? Math.min(1, Math.max(0, (totalDays - remainingDays) / totalDays)) : 0;
  let ring = 'rgba(245, 158, 11, 0.85)';
  let glow = '0 0 16px rgba(245, 158, 11, 0.25)';
  let border = 'rgba(245, 158, 11, 0.4)';
  if (isFinal) {
    ring = 'rgba(248, 113, 113, 0.95)';
    glow = '0 0 18px rgba(239, 68, 68, 0.4)';
    border = 'rgba(239, 68, 68, 0.5)';
  } else if (isUrgent) {
    ring = 'rgba(251, 146, 60, 0.9)';
    glow = '0 0 14px rgba(249, 115, 22, 0.35)';
    border = 'rgba(249, 115, 22, 0.45)';
  }
  return { isFinal, isUrgent, progress, ring, glow, border };
}

const FLOAT_ANIMATE = { y: [0, -5, 0] };
const FLOAT_TRANSITION = { duration: 5, repeat: Infinity, ease: 'easeInOut' as const };

function PillBadge({ children, tone }: { children: React.ReactNode; tone: 'cyan' | 'green' | 'amber' | 'red' | 'violet' | 'neutral' }) {
  const map = {
    cyan: 'bg-cyan-500/25 text-cyan-100 border-cyan-400/40',
    green: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/35',
    amber: 'bg-amber-500/20 text-amber-100 border-amber-400/35',
    red: 'bg-red-500/25 text-red-100 border-red-400/40',
    violet: 'bg-violet-500/20 text-violet-100 border-violet-400/35',
    neutral: 'bg-white/10 text-white/90 border-white/15',
  };
  return (
    <span
      className={`absolute -top-0.5 -right-0.5 z-10 max-w-[52px] truncate rounded-full border px-1 py-0.5 text-[7px] font-bold leading-none shadow-md ${map[tone]}`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {children}
    </span>
  );
}

export const HomeSidePillsLayerLegacy: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUnifiedAuth();
  const { openCommit, openMission } = useDclLauncher();
  const { openAgent, openBattle } = useHomeSectionLauncher();
  const { missionStatus } = useMissionStatus();
  const { commit_done } = useTodayDailyState();
  const { run, missionId, loading: dailyLoading } = useDailyEngineV2();
  const { agentCode } = useAgentCode();
  const battlePending = useBattlePendingCount(user?.id);

  const remainingDays = missionStatus?.daysRemaining ?? 0;
  const totalDays = missionStatus?.totalDays ?? 30;
  const timeVis = getTimeVisual(remainingDays, totalDays);
  const ringCirc = 2 * Math.PI * 20;

  const nextBadge = useMemo(() => {
    if (!DAILY_ENGINE_V2_ENABLED) {
      return { text: t('home_float_badge_ready'), tone: 'cyan' as const };
    }
    if (dailyLoading) {
      return { text: t('home_float_badge_loading'), tone: 'neutral' as const };
    }
    if (run?.phase === 3 && run?.status === 'completed') {
      return { text: t('home_float_badge_mission_done'), tone: 'green' as const };
    }
    if (missionId && run) {
      return {
        text: t('home_float_badge_phase', { n: run.phase }),
        tone: 'amber' as const,
      };
    }
    if (missionId) {
      return { text: t('home_float_badge_ready'), tone: 'cyan' as const };
    }
    return { text: t('home_float_badge_ready'), tone: 'neutral' as const };
  }, [dailyLoading, missionId, run, t]);

  const timeBadgeText = useMemo(() => {
    if (timeVis.isFinal) return t('home_float_badge_last_day');
    if (timeVis.isUrgent) return t('home_float_badge_urgent');
    return t('home_float_badge_days', { n: remainingDays });
  }, [remainingDays, timeVis.isFinal, timeVis.isUrgent, t]);

  const battleBadge = useMemo(() => {
    if (battlePending > 0) {
      return { text: t('home_float_badge_invites', { n: battlePending }), tone: 'violet' as const };
    }
    return { text: t('home_float_badge_battle_ready'), tone: 'neutral' as const };
  }, [battlePending, t]);

  const agentBadgeText = agentCode && agentCode.length > 0 ? agentCode.slice(0, 6) : t('home_float_badge_agent');

  const handleNextAction = useCallback(() => {
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

  const textShadow = '0 1px 2px rgba(0,0,0,0.55)';

  const shellBase =
    'pointer-events-auto relative flex flex-col items-center justify-center border backdrop-blur-xl transition-shadow active:scale-[0.97]';

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
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="absolute flex flex-col gap-3 items-start pointer-events-none"
        style={{
          left: 'max(6px, env(safe-area-inset-left, 0px))',
          top: 'calc(env(safe-area-inset-top, 0px) + 192px)',
        }}
        animate={FLOAT_ANIMATE}
        transition={FLOAT_TRANSITION}
      >
        <motion.button
          type="button"
          onClick={handleNextAction}
          className={`${shellBase} rounded-full px-3 py-4 w-[80px]`}
          style={{
            background:
              'linear-gradient(165deg, rgba(6, 20, 32, 0.95) 0%, rgba(4, 12, 22, 0.92) 100%)',
            borderColor: 'rgba(0, 209, 255, 0.55)',
            boxShadow:
              '0 0 28px rgba(0, 209, 255, 0.45), 0 0 48px rgba(0, 120, 200, 0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
          whileTap={{ scale: 0.96 }}
          aria-label={t('home_side_pill_next_action')}
        >
          <PillBadge tone={nextBadge.tone}>{nextBadge.text}</PillBadge>
          <Target className="w-6 h-6 mb-1" style={{ color: 'rgba(0, 235, 255, 0.98)', filter: 'drop-shadow(0 0 8px rgba(0,209,255,0.5))' }} />
          <span className="text-[9px] font-extrabold leading-tight text-center" style={{ color: 'rgba(255,255,255,0.98)', textShadow }}>
            {t('home_side_pill_next_action')}
          </span>
          <ChevronRight className="w-3.5 h-3.5 mt-0.5 opacity-90" style={{ color: 'rgba(0, 229, 255, 0.95)' }} />
        </motion.button>

        {!(ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor()) && (
        <motion.button
          type="button"
          onClick={handleCommit}
          className={`${shellBase} rounded-full px-2.5 py-3 w-[72px]`}
          style={{
            background: 'linear-gradient(165deg, rgba(10, 16, 26, 0.94) 0%, rgba(6, 12, 20, 0.9) 100%)',
            borderColor: commit_done ? 'rgba(52, 211, 153, 0.45)' : 'rgba(0, 209, 255, 0.38)',
            boxShadow: commit_done
              ? '0 0 14px rgba(52, 211, 153, 0.2)'
              : '0 0 12px rgba(0, 209, 255, 0.18)',
          }}
          whileTap={{ scale: 0.97 }}
          aria-label={t('home_side_pill_commit')}
        >
          <PillBadge tone={commit_done ? 'green' : 'amber'}>
            {commit_done ? t('home_side_pill_commit_done') : t('home_float_badge_pending')}
          </PillBadge>
          {commit_done ? (
            <Check className="w-5 h-5 mb-0.5" style={{ color: 'rgba(110, 231, 183, 0.95)' }} />
          ) : (
            <Sparkles className="w-5 h-5 mb-0.5" style={{ color: 'rgba(0, 229, 255, 0.88)' }} />
          )}
          <span className="text-[8px] font-bold leading-tight text-center" style={{ color: 'rgba(255,255,255,0.94)', textShadow }}>
            {t('home_side_pill_commit')}
          </span>
        </motion.button>
        )}

        <motion.button
          type="button"
          onClick={handleAgent}
          className={`${shellBase} rounded-full px-2.5 py-2.5 w-[68px]`}
          style={{
            background: 'linear-gradient(165deg, rgba(14, 14, 18, 0.93) 0%, rgba(8, 8, 12, 0.9) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.14)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
          whileTap={{ scale: 0.97 }}
          aria-label={t('home_side_pill_agent')}
        >
          <PillBadge tone="neutral">{agentBadgeText}</PillBadge>
          <Bot className="w-4 h-4 mb-0.5" style={{ color: 'rgba(200, 210, 225, 0.9)' }} />
          <span className="text-[7px] font-semibold leading-tight text-center" style={{ color: 'rgba(255,255,255,0.88)', textShadow }}>
            {t('home_side_pill_agent')}
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute flex flex-col gap-3 items-end pointer-events-none"
        style={{
          right: 'max(6px, env(safe-area-inset-right, 0px))',
          top: 'calc(env(safe-area-inset-top, 0px) + 192px)',
        }}
        animate={FLOAT_ANIMATE}
        transition={{ ...FLOAT_TRANSITION, delay: 0.5 }}
      >
        <motion.button
          type="button"
          onClick={handleTime}
          className={`${shellBase} rounded-full w-[76px] h-[76px] p-0`}
          style={{
            background: 'linear-gradient(165deg, rgba(12, 10, 10, 0.94) 0%, rgba(8, 8, 10, 0.9) 100%)',
            borderColor: timeVis.border,
            boxShadow: timeVis.glow,
          }}
          whileTap={{ scale: 0.96 }}
          aria-label={t('home_side_pill_time')}
        >
          <PillBadge tone={timeVis.isFinal ? 'red' : timeVis.isUrgent ? 'amber' : 'amber'}>{timeBadgeText}</PillBadge>
          <div className="relative w-[52px] h-[52px] flex items-center justify-center">
            <svg width="52" height="52" className="absolute" aria-hidden>
              <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke={timeVis.ring}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringCirc * (1 - timeVis.progress)}
                transform="rotate(-90 26 26)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))' }}
              />
            </svg>
            <span
              className="relative text-xl font-black tabular-nums leading-none"
              style={{ color: timeVis.ring, textShadow }}
            >
              {remainingDays}
            </span>
          </div>
          <span className="text-[7px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.82)', textShadow }}>
            {t('home_side_pill_time')}
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={handleBattle}
          className={`${shellBase} rounded-full px-2.5 py-3 w-[70px]`}
          style={{
            background: 'linear-gradient(165deg, rgba(16, 12, 24, 0.93) 0%, rgba(10, 8, 16, 0.9) 100%)',
            borderColor: 'rgba(167, 139, 250, 0.35)',
            boxShadow: '0 0 14px rgba(139, 92, 246, 0.18)',
          }}
          whileTap={{ scale: 0.97 }}
          aria-label={t('home_side_pill_battle')}
        >
          <PillBadge tone={battleBadge.tone}>{battleBadge.text}</PillBadge>
          <Swords className="w-5 h-5 mb-0.5" style={{ color: 'rgba(196, 181, 253, 0.92)' }} />
          <span className="text-[8px] font-bold leading-tight text-center" style={{ color: 'rgba(255,255,255,0.9)', textShadow }}>
            {t('home_side_pill_battle')}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
