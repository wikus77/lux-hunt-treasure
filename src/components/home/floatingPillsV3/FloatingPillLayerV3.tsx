/**
 * FloatingPillLayerV3 — viewport-fixed overlay via React Portal (outside .m1-single-scroll-root).
 * Launchers only — no scroll-into-view fallbacks (per V3 spec).
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
import { cn } from '@/lib/utils';
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
import { HOME_PLAY_SURFACE_BACKDROP_CLASS, useHomePlaySurface } from '@/contexts/HomePlaySurfaceContext';
import { usePillInfoOverlay, type PillInfoPillId } from '@/contexts/PillInfoOverlayContext';
import { APP_HOME_PLAY_MODAL_SHELL_ENABLED } from '@/config/appHomeUiHide';
import { PlayModalGiochaModalGroup } from '@/components/home/playModal/PlayModalGiochaLayers';

function openTimeModalDirect(): void {
  try {
    window.dispatchEvent(new CustomEvent('openMissionModal', { detail: 'time' }));
  } catch {
    /* ignore */
  }
}

/** DEV / opt-in layout probe: `import.meta.env.DEV` or `localStorage m1_debug_pill_layout=1`. No UI/UX change. */
function isFloatingPillLayoutDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return import.meta.env.DEV || localStorage.getItem('m1_debug_pill_layout') === '1';
  } catch {
    return import.meta.env.DEV;
  }
}

type PillLayoutRow = {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  note?: string;
};

/**
 * Measures `[data-m1-pill-layout-measure]` and `[data-m1-home-layout-measure]`.
 * Call from Safari console: `window.__M1_HOME_PILL_LAYOUT_MEASURE__()` after Home is visible.
 */
export function measureM1HomeFloatingPillLayout(): void {
  const rows: PillLayoutRow[] = [];

  const pushRow = (id: string, el: Element | null | undefined) => {
    if (!el || !(el instanceof HTMLElement)) {
      rows.push({
        id,
        left: NaN,
        right: NaN,
        top: NaN,
        bottom: NaN,
        width: NaN,
        height: NaN,
        centerX: NaN,
        centerY: NaN,
        note: 'element missing',
      });
      return;
    }
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    let note: string | undefined;
    if (id === 'prize-outer') {
      const pl = parseFloat(cs.paddingLeft) || 0;
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      note = `innerContentLeft≈${(r.left + bl + pl).toFixed(2)} (border+padding)`;
    }
    rows.push({
      id,
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
      centerX: r.left + r.width / 2,
      centerY: r.top + r.height / 2,
      note,
    });
  };

  document.querySelectorAll<HTMLElement>('[data-m1-pill-layout-measure]').forEach((el) => {
    pushRow(el.getAttribute('data-m1-pill-layout-measure') || 'pill-unknown', el);
  });
  document.querySelectorAll<HTMLElement>('[data-m1-home-layout-measure]').forEach((el) => {
    pushRow(el.getAttribute('data-m1-home-layout-measure') || 'home-unknown', el);
  });

  const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(2)) : n);

  console.log('[M1 pill layout] snapshot', new Date().toISOString());
  console.table(
    rows.map((x) => ({
      id: x.id,
      left: fmt(x.left),
      right: fmt(x.right),
      top: fmt(x.top),
      bottom: fmt(x.bottom),
      width: fmt(x.width),
      height: fmt(x.height),
      centerX: fmt(x.centerX),
      centerY: fmt(x.centerY),
      note: x.note ?? '',
    }))
  );

  const leftRailIds = ['prossima-azione', 'commit', 'agent'];
  const left = rows.filter((x) => leftRailIds.includes(x.id) && Number.isFinite(x.left));
  if (left.length >= 2) {
    const dL = Math.max(...left.map((x) => x.left)) - Math.min(...left.map((x) => x.left));
    const dCx = Math.max(...left.map((x) => x.centerX)) - Math.min(...left.map((x) => x.centerX));
    const dW = Math.max(...left.map((x) => x.width)) - Math.min(...left.map((x) => x.width));
    console.log(
      '[M1 pill layout] left rail max−min (present:',
      left.map((x) => x.id).join(', '),
      ') Δleft=',
      dL.toFixed(2),
      'ΔcenterX=',
      dCx.toFixed(2),
      'Δwidth=',
      dW.toFixed(2),
      '— ~0 ⇒ layout aligned; else runtime layout bug'
    );
  }

  try {
    console.log('[M1 pill layout] JSON', JSON.stringify(rows, null, 2));
  } catch {
    /* ignore */
  }
}

export interface FloatingPillLayerV3Props {
  /** AppHome-only: omit floating M1SSION Agent pill; other rails unchanged. */
  hideAgentPill?: boolean;
}

const PILL_IN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const PILL_OUT_EASE: [number, number, number, number] = [0.4, 0, 1, 1];

/** Play-surface pill hint: same 72×72 measurement footprint as M1SSION Battle anchor (FloatingBattlePillV3). */
const PLAY_PILL_INFO_ANCHOR_BOX: React.CSSProperties = { width: 72, height: 72 };

export const FloatingPillLayerV3: React.FC<FloatingPillLayerV3Props> = ({ hideAgentPill = false }) => {
  const { zIndex, stackTopOffsetPx } = useFloatingPillsV3();
  const { playGateEnabled, surfaceActive, closeSurface } = useHomePlaySurface();
  const showPlayPills = !playGateEnabled || surfaceActive;
  /** Five-point play grid only while GIOCA surface is open. */
  const usePlayCrossLayout = playGateEnabled && surfaceActive;
  const showPlayModalShell = APP_HOME_PLAY_MODAL_SHELL_ENABLED && usePlayCrossLayout;
  const { activePillId, openPill, closePill } = usePillInfoOverlay();
  const reduce = useReducedMotion();
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

  useEffect(() => {
    if (!playGateEnabled || !surfaceActive) closePill();
  }, [playGateEnabled, surfaceActive, closePill]);

  const wrapPlaySurfaceTap = useCallback(
    (pillId: PillInfoPillId, action: () => void) => () => {
      if (!usePlayCrossLayout) {
        action();
        return;
      }
      if (activePillId !== pillId) {
        openPill(pillId);
        return;
      }
      closePill();
      action();
    },
    [usePlayCrossLayout, activePillId, openPill, closePill]
  );

  const onPlayRadialPointerDownCapture = useCallback(
    (pillId: PillInfoPillId) => (e: React.PointerEvent) => {
      if (!usePlayCrossLayout || !showPlayPills) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (activePillId !== pillId) {
        e.stopPropagation();
        openPill(pillId);
      } else {
        closePill();
      }
    },
    [usePlayCrossLayout, showPlayPills, activePillId, openPill, closePill]
  );

  useEffect(() => {
    if (!isFloatingPillLayoutDebugEnabled()) return;
    const w = window as Window & { __M1_HOME_PILL_LAYOUT_MEASURE__?: () => void };
    w.__M1_HOME_PILL_LAYOUT_MEASURE__ = () => measureM1HomeFloatingPillLayout();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => measureM1HomeFloatingPillLayout());
    });
    console.info(
      '[M1 pill layout] probe armed. Re-run: __M1_HOME_PILL_LAYOUT_MEASURE__(). Release build: localStorage.setItem("m1_debug_pill_layout","1") then reload.'
    );
    return () => {
      cancelAnimationFrame(raf);
      delete w.__M1_HOME_PILL_LAYOUT_MEASURE__;
    };
  }, []);

  /** Staggered fade-up + soft scale when play gate opens; fast fade out on close. */
  const playPillMotionProps = (staggerIndex: number) => {
    if (!playGateEnabled) {
      return {
        initial: false,
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      } as const;
    }
    return {
      initial: false,
      animate: showPlayPills
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y: 12, scale: 0.97 },
      transition: reduce
        ? { duration: 0.14 }
        : showPlayPills
          ? {
              duration: 0.44,
              ease: PILL_IN_EASE,
              delay: 0.09 + staggerIndex * 0.074,
            }
          : { duration: 0.22, ease: PILL_OUT_EASE },
    } as const;
  };

  const playSurfaceGridStyle = useMemo(
    () =>
      ({
        position: 'absolute' as const,
        left: 'max(16px, env(safe-area-inset-left, 0px))',
        right: 'max(16px, env(safe-area-inset-right, 0px))',
        top: `calc(env(safe-area-inset-top, 0px) + ${stackTopOffsetPx}px)`,
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 10px)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        gridTemplateRows: 'min-content 1fr min-content',
        columnGap: 12,
        rowGap: 12,
        zIndex: 1,
        pointerEvents: 'none' as const,
      }),
    [stackTopOffsetPx]
  );

  const commitPillBlock =
    ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor() && COMMIT_PILL_V3_RADIAL_HUB ? (
      <CommitRadialHubPill />
    ) : !(ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor()) ? (
      <FloatingCommitPillV3
        done={commit_done}
        badgeDone={t('home_side_pill_commit_done')}
        badgePending={t('home_float_badge_pending')}
        label={t('home_side_pill_commit')}
        ariaLabel={t('home_side_pill_commit')}
        onTap={wrapPlaySurfaceTap('commit', handleCommit)}
      />
    ) : null;

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
      <AnimatePresence>
        {playGateEnabled && surfaceActive && (
          <motion.button
            key="m1-home-play-surface-backdrop"
            type="button"
            aria-label={t('home_play_surface_dismiss')}
            className={cn(
              HOME_PLAY_SURFACE_BACKDROP_CLASS,
              showPlayModalShell && 'bg-black/45 backdrop-blur-[4px]'
            )}
            style={{
              zIndex: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: showPlayModalShell ? 0.16 : 0.2,
                delay: showPlayModalShell ? 0.42 : 0,
                ease: [0, 0, 0.55, 1],
              },
            }}
            transition={{
              duration: showPlayModalShell ? 0.14 : 0.2,
              ease: showPlayModalShell ? ([0, 0, 0.55, 1] as const) : ([0.4, 0, 1, 1] as const),
            }}
            onClick={closeSurface}
          />
        )}
      </AnimatePresence>

      {/*
        Play surface (GIOCA attivo): griglia 3×3 — TL Prossima azione, TR Tempo, centro Agent, BL Commit, BR Battle.
        Altrimenti: due binari legacy (sinistra azione→commit→agent, destra tempo→battle).
      */}
      {usePlayCrossLayout ? (
        <>
        <div
          style={{
            ...playSurfaceGridStyle,
            opacity: showPlayModalShell ? 0 : 1,
            visibility: showPlayModalShell ? 'hidden' : 'visible',
          }}
          className={showPlayModalShell ? '[&_*]:pointer-events-none' : undefined}
          aria-hidden={showPlayModalShell ? true : undefined}
        >
          <motion.div
            data-m1-pill-layout-measure="prossima-azione"
            style={{ gridColumn: 1, gridRow: 1, justifySelf: 'start', alignSelf: 'start' }}
            className={showPlayPills ? '' : 'pointer-events-none'}
            {...playPillMotionProps(0)}
          >
            <div
              data-pill-info-anchor="action"
              onPointerDownCapture={onPlayRadialPointerDownCapture('action')}
              className="relative shrink-0 overflow-visible"
              style={PLAY_PILL_INFO_ANCHOR_BOX}
            >
              <ActionRadialHubPill />
            </div>
          </motion.div>
          <motion.div
            data-m1-pill-layout-measure="time"
            style={{ gridColumn: 3, gridRow: 1, justifySelf: 'end', alignSelf: 'start' }}
            className={showPlayPills ? '' : 'pointer-events-none'}
            {...playPillMotionProps(1)}
          >
            <div className="relative shrink-0 overflow-visible" style={{ width: 96, height: 96 }}>
              <div
                data-pill-info-anchor="timer"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                style={PLAY_PILL_INFO_ANCHOR_BOX}
              >
                <div
                  className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: 96, height: 96 }}
                >
                  <FloatingTimeRingPillV3
                    remainingDays={remainingDays}
                    totalDays={totalDays}
                    badge={timeBadge}
                    caption={t('home_side_pill_time')}
                    ariaLabel={t('home_side_pill_time')}
                    onTap={wrapPlaySurfaceTap('timer', handleTime)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
          {/*
            Play surface: Agent must always occupy the center cell (product spec). `hideAgentPill` only
            applies to the legacy two-rail layout — otherwise APP_HOME_HIDE_FLOATING_AGENT_PILL=true skips
            this entire block and only 4 pills render on device.
          */}
          <motion.div
            data-m1-pill-layout-measure="agent"
            style={{ gridColumn: 2, gridRow: 2, justifySelf: 'center', alignSelf: 'center' }}
            className={showPlayPills ? '' : 'pointer-events-none'}
            {...playPillMotionProps(2)}
          >
            <div data-pill-info-anchor="agent">
              <FloatingAgentPillV3
                mcpActive={mcpActive}
                badge={agentBadge}
                label={t('home_side_pill_agent')}
                ariaLabel={t('home_side_pill_agent')}
                onTap={wrapPlaySurfaceTap('agent', handleAgent)}
              />
            </div>
          </motion.div>
          {commitPillBlock != null && (
            <motion.div
              data-m1-pill-layout-measure="commit"
              style={{ gridColumn: 1, gridRow: 3, justifySelf: 'start', alignSelf: 'end' }}
              className={showPlayPills ? '' : 'pointer-events-none'}
              {...playPillMotionProps(3)}
            >
              {ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor() && COMMIT_PILL_V3_RADIAL_HUB ? (
                <div
                  data-pill-info-anchor="commit"
                  onPointerDownCapture={onPlayRadialPointerDownCapture('commit')}
                  className="relative shrink-0 overflow-visible"
                  style={PLAY_PILL_INFO_ANCHOR_BOX}
                >
                  {commitPillBlock}
                </div>
              ) : (
                <div className="relative shrink-0 overflow-visible" style={{ width: 74, height: 74 }}>
                  <div
                    data-pill-info-anchor="commit"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                    style={PLAY_PILL_INFO_ANCHOR_BOX}
                  >
                    <div
                      className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ width: 74, height: 74 }}
                    >
                      {commitPillBlock}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          <motion.div
            data-m1-pill-layout-measure="battle"
            style={{ gridColumn: 3, gridRow: 3, justifySelf: 'end', alignSelf: 'end' }}
            className={showPlayPills ? '' : 'pointer-events-none'}
            {...playPillMotionProps(4)}
          >
            <div data-pill-info-anchor="battle">
              <FloatingBattlePillV3
                live={battleLive}
                labelLobby={t('home_float_node_battle_lobby')}
                labelLive={t('home_float_node_battle_live')}
                title={t('home_side_pill_battle')}
                ariaLabel={t('home_side_pill_battle')}
                onTap={wrapPlaySurfaceTap('battle', handleBattle)}
              />
            </div>
          </motion.div>
        </div>
        <AnimatePresence>
          {showPlayModalShell && (
            <PlayModalGiochaModalGroup
              key="m1-giocha-group"
              reduce={reduce}
              statusLine={nextBadge}
              onDismiss={closeSurface}
              onPrimary={handleNext}
              onTime={handleTime}
              onAgent={handleAgent}
              onCommit={handleCommit}
              onBattle={handleBattle}
              showCommitTile={commitPillBlock != null}
            />
          )}
        </AnimatePresence>
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute flex flex-col items-end gap-3 overflow-visible"
            style={{
              right: '16px',
              top: `calc(env(safe-area-inset-top, 0px) + ${stackTopOffsetPx}px)`,
              zIndex: 1,
            }}
            aria-hidden={playGateEnabled ? !showPlayPills : undefined}
          >
            <div className="flex w-max max-w-none flex-col items-end gap-3 self-end overflow-visible">
              <motion.div
                data-m1-pill-layout-measure="time"
                className={`w-max shrink-0 self-end ${showPlayPills || !playGateEnabled ? '' : 'pointer-events-none'}`}
                {...playPillMotionProps(0)}
              >
                <FloatingTimeRingPillV3
                  remainingDays={remainingDays}
                  totalDays={totalDays}
                  badge={timeBadge}
                  caption={t('home_side_pill_time')}
                  ariaLabel={t('home_side_pill_time')}
                  onTap={handleTime}
                />
              </motion.div>
              <motion.div
                data-m1-pill-layout-measure="battle"
                className={`w-max shrink-0 self-end ${showPlayPills || !playGateEnabled ? '' : 'pointer-events-none'}`}
                {...playPillMotionProps(1)}
              >
                <FloatingBattlePillV3
                  live={battleLive}
                  labelLobby={t('home_float_node_battle_lobby')}
                  labelLive={t('home_float_node_battle_live')}
                  title={t('home_side_pill_battle')}
                  ariaLabel={t('home_side_pill_battle')}
                  onTap={handleBattle}
                />
              </motion.div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute flex flex-col items-start gap-3 overflow-visible"
            style={{
              left: '16px',
              top: `calc(env(safe-area-inset-top, 0px) + ${stackTopOffsetPx}px)`,
              zIndex: 1,
            }}
          >
            <div
              className="flex w-max max-w-none flex-col items-start gap-3 self-start overflow-visible"
              aria-hidden={playGateEnabled ? !showPlayPills : undefined}
            >
              <motion.div
                className={showPlayPills || !playGateEnabled ? '' : 'pointer-events-none'}
                {...playPillMotionProps(0)}
              >
                <ActionRadialHubPill />
              </motion.div>
              {ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor() && COMMIT_PILL_V3_RADIAL_HUB && (
                <motion.div
                  className={showPlayPills || !playGateEnabled ? '' : 'pointer-events-none'}
                  {...playPillMotionProps(1)}
                >
                  <CommitRadialHubPill />
                </motion.div>
              )}
              {!(ENABLE_COMMIT_PILL_V3 && isCommitPillV3IosCapacitor()) && (
                <motion.div
                  data-m1-pill-layout-measure="commit"
                  className={`w-max shrink-0 self-start ${showPlayPills || !playGateEnabled ? '' : 'pointer-events-none'}`}
                  {...playPillMotionProps(1)}
                >
                  <FloatingCommitPillV3
                    done={commit_done}
                    badgeDone={t('home_side_pill_commit_done')}
                    badgePending={t('home_float_badge_pending')}
                    label={t('home_side_pill_commit')}
                    ariaLabel={t('home_side_pill_commit')}
                    onTap={handleCommit}
                  />
                </motion.div>
              )}
            </div>
            {!hideAgentPill && (
              <FloatingAgentPillV3
                mcpActive={mcpActive}
                badge={agentBadge}
                label={t('home_side_pill_agent')}
                ariaLabel={t('home_side_pill_agent')}
                onTap={handleAgent}
              />
            )}
          </div>
        </>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(layer, document.body);
};
