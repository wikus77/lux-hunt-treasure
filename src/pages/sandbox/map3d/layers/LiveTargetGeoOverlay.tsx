/**
 * LIVE TARGET™ Phase 4 — zoom gate + Engage CTA + engaged cyan + tap capture + success/fail WOW.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { Map as MLMap } from 'maplibre-gl';
import {
  isHapticsAvailable,
  hapticError,
  hapticMedium,
  hapticSelection,
  hapticSuccess,
} from '@/utils/haptics';
import { LIVE_TARGET_ENABLED as FEATURE_FLAG_LIVE_TARGET } from '@/config/featureFlags';
import {
  effectiveVisualDebug,
  patchLiveTargetRuntimeGlobal,
  liveTarget13ELoggingActive,
  liveTargetForensicLogsEnabled,
  COMPILED_LIVE_TARGET_DEBUG,
} from './liveTargetRuntimeGlobals';
import {
  LIVE_TARGET_PHASE2_ORBIT_CENTER,
  LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS,
  LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT,
  advanceOrbitTick,
  createInitialEngineState,
  type LiveTargetGeoEngineState,
} from './liveTargetPhase2Movement';
import {
  liveTargetApproxOrbitPxPerSec,
  liveTargetMercatorMetersPerPixel,
  liveTargetOrbitGroundSpeedMps,
} from './liveTargetPhase2Forensics';
import {
  projectLiveTargetToDom,
  type LiveTargetProjectReason,
} from './liveTargetMapProject';
import { haversineMeters } from './liveTargetHaversineMeters';
import { LIVE_TARGET_CAPTURE_FEEDBACK_MS, LIVE_TARGET_IN_RANGE_POLL_MS } from './liveTargetPhase3CaptureConfig';
import {
  getLiveTargetDifficultyProfile,
  LIVE_TARGET_PHASE4_DEFAULT_DIFFICULTY,
} from './liveTargetPhase4Difficulty';
import {
  getLiveTargetLevelPlan,
  getMaxLiveTargetLevelId,
  LIVE_TARGET_LEVEL_PLANS,
} from './liveTargetLevelPlan';
import { LiveTargetVictoryModal } from './LiveTargetVictoryModal';
import {
  deriveLiveTargetGameplayState,
  isEngageButtonVisible,
  isZoomInWindow,
  isZoomValidForEngagedCapture,
  type LiveTargetFailReason,
  type LiveTargetGameplayState,
  type LiveTargetTerminalOutcome,
} from './liveTargetGameplayMachine';
import './LiveTargetGeoOverlay.css';

const LT_PROFILE = getLiveTargetDifficultyProfile(LIVE_TARGET_PHASE4_DEFAULT_DIFFICULTY);

let liveTarget20ModuleLogged = false;

export interface LiveTargetGeoOverlayProps {
  map: MLMap | null;
  enabled: boolean;
  userPosition?: { lat: number; lng: number } | null;
}

export default function LiveTargetGeoOverlay({
  map,
  enabled,
  userPosition = null,
}: LiveTargetGeoOverlayProps) {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inRange, setInRange] = useState(false);
  const [mapZoom, setMapZoom] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [engagedAtMs, setEngagedAtMs] = useState<number | null>(null);
  const [terminal, setTerminal] = useState<LiveTargetTerminalOutcome>('none');
  const [failReason, setFailReason] = useState<LiveTargetFailReason>('none');
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [outcomeToast, setOutcomeToast] = useState<'none' | 'success' | 'fail'>('none');
  const movementRafRef = useRef(0);
  const openRef = useRef(false);
  openRef.current = isOpen;
  const engineRef = useRef<LiveTargetGeoEngineState | null>(null);
  const orbitPausedRef = useRef(false);
  const loggedStartRef = useRef(false);
  const loggedProjectedRef = useRef(false);
  const forensicBaselineLoggedRef = useRef(false);
  const forensicWindowRef = useRef<{
    lastLogAt: number;
    lastLng: number;
    lastLat: number;
    lastPx: number;
    lastPy: number;
  } | null>(null);
  const forensic21LastRef = useRef(0);
  const forensic21PrevPxRef = useRef({ x: 0, y: 0 });
  const forensic4LastRef = useRef(0);
  const wowOutcomeLoggedRef = useRef<LiveTargetTerminalOutcome>('none');
  /** Keeps last user orbit center when GPS drops (anchor profile only). */
  const lockedOrbitCenterRef = useRef<{ lng: number; lat: number } | null>(null);
  const [engageCtaPressed, setEngageCtaPressed] = useState(false);
  const [liveTargetLevelId, setLiveTargetLevelId] = useState(1);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);

  const terminalRef = useRef(terminal);
  const engagedRef = useRef(engaged);
  terminalRef.current = terminal;
  engagedRef.current = engaged;

  const hasUserPosition = Boolean(userPosition);

  const activeLevelPlan = useMemo(
    () => getLiveTargetLevelPlan(liveTargetLevelId) ?? LIVE_TARGET_LEVEL_PLANS[0],
    [liveTargetLevelId]
  );

  const gameplayState: LiveTargetGameplayState = useMemo(
    () =>
      deriveLiveTargetGameplayState({
        hasUserPosition,
        inRange,
        zoom: mapZoom,
        profile: LT_PROFILE,
        engaged,
        terminal,
      }),
    [hasUserPosition, inRange, mapZoom, engaged, terminal]
  );

  const engageVisible =
    hasUserPosition &&
    terminal === 'none' &&
    !engaged &&
    isEngageButtonVisible(gameplayState);

  const zoomEligible = useMemo(
    () =>
      hasUserPosition &&
      inRange &&
      isZoomInWindow(mapZoom, LT_PROFILE.engageZoomMin, LT_PROFILE.engageZoomMax),
    [hasUserPosition, inRange, mapZoom]
  );

  const engageEligible = engageVisible;

  const captureDeadlineMs =
    engaged && engagedAtMs != null ? engagedAtMs + LT_PROFILE.captureWindowMs : null;

  const stopMovementLoop = useCallback(() => {
    if (movementRafRef.current) {
      cancelAnimationFrame(movementRafRef.current);
      movementRafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    patchLiveTargetRuntimeGlobal({ componentMounted: Boolean(enabled && map) });
    return () => patchLiveTargetRuntimeGlobal({ componentMounted: false });
  }, [enabled, map]);

  useEffect(() => {
    if (!enabled) {
      lockedOrbitCenterRef.current = null;
      setInRange(false);
      setMapZoom(0);
      setEngaged(false);
      setEngagedAtMs(null);
      setTerminal('none');
      setFailReason('none');
      setTutorialDismissed(false);
      setOutcomeToast('none');
      setIsOpen(false);
      orbitPausedRef.current = false;
      setLiveTargetLevelId(1);
      setCompletedLevelIds([]);
      setVictoryModalOpen(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (outcomeToast === 'none') return;
    const id = window.setTimeout(() => setOutcomeToast('none'), LIVE_TARGET_CAPTURE_FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [outcomeToast]);

  useEffect(() => {
    if (!map || !enabled) return;
    const snap = () => {
      try {
        if (map.loaded()) setMapZoom(map.getZoom());
      } catch {
        /* */
      }
    };
    snap();
    map.on('zoom', snap);
    map.on('zoomend', snap);
    map.on('moveend', snap);
    map.on('load', snap);
    map.on('idle', snap);
    return () => {
      map.off('zoom', snap);
      map.off('zoomend', snap);
      map.off('moveend', snap);
      map.off('load', snap);
      map.off('idle', snap);
    };
  }, [map, enabled]);

  useEffect(() => {
    if (!enabled || terminal !== 'none') return;
    const tick = () => {
      const eng = engineRef.current;
      if (!eng || !userPosition) {
        setInRange((prev) => (prev ? false : prev));
        return;
      }
      const d = haversineMeters(userPosition.lat, userPosition.lng, eng.currentLat, eng.currentLng);
      const next = d <= LT_PROFILE.captureRadiusMeters;
      setInRange((prev) => (prev === next ? prev : next));
    };
    tick();
    const id = window.setInterval(tick, LIVE_TARGET_IN_RANGE_POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, terminal, userPosition]);

  useEffect(() => {
    if (!enabled || !engaged || terminal !== 'none' || engagedAtMs == null) return;
    const lp = getLiveTargetLevelPlan(liveTargetLevelId) ?? LIVE_TARGET_LEVEL_PLANS[0];
    const tick = () => {
      if (mapZoom <= 0) return;
      const elapsed = Date.now() - engagedAtMs;
      if (elapsed > lp.captureWindowMs) {
        orbitPausedRef.current = true;
        setFailReason('capture_timeout');
        setTerminal('fail');
        setOutcomeToast('fail');
        if (isHapticsAvailable()) hapticError();
        return;
      }
      if (lp.failOnRangeExit && !inRange) {
        orbitPausedRef.current = true;
        setFailReason('out_of_range');
        setTerminal('fail');
        setOutcomeToast('fail');
        if (isHapticsAvailable()) hapticError();
        return;
      }
      if (lp.failOnZoomExit && !isZoomValidForEngagedCapture(mapZoom, LT_PROFILE)) {
        orbitPausedRef.current = true;
        setFailReason('zoom_left_window');
        setTerminal('fail');
        setOutcomeToast('fail');
        if (isHapticsAvailable()) hapticError();
      }
    };
    const id = window.setInterval(tick, 280);
    return () => window.clearInterval(id);
  }, [enabled, engaged, engagedAtMs, terminal, inRange, mapZoom, liveTargetLevelId]);

  useEffect(() => {
    if (!map || !enabled) return;
    const lp = getLiveTargetLevelPlan(liveTargetLevelId) ?? LIVE_TARGET_LEVEL_PLANS[0];
    if (!lp.failOnMissTap || !engaged || terminal !== 'none') return;

    const onMapClick = () => {
      if (!engagedRef.current || terminalRef.current !== 'none') return;
      orbitPausedRef.current = true;
      setFailReason('miss_tap');
      setTerminal('fail');
      setOutcomeToast('fail');
      if (isHapticsAvailable()) hapticError();
      if (liveTargetForensicLogsEnabled()) {
        console.warn('[LiveTarget][4.3][miss]', {
          reason: 'map_click_miss',
          levelId: liveTargetLevelId,
        });
      }
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, enabled, engaged, terminal, liveTargetLevelId]);

  useEffect(() => {
    if (!enabled || !liveTargetForensicLogsEnabled()) return;
    const id = window.setInterval(() => {
      const t = performance.now();
      if (t - forensic4LastRef.current < 620) return;
      forensic4LastRef.current = t;
      const eng = engineRef.current;
      const distM =
        userPosition && eng
          ? haversineMeters(userPosition.lat, userPosition.lng, eng.currentLat, eng.currentLng)
          : null;
      console.warn('[LiveTarget][4.3][forensics]', {
        module: 'LT-4.3',
        difficulty: LT_PROFILE.code,
        anchorOrbitToUser: LT_PROFILE.anchorOrbitToUserWhenPositionAvailable,
        orbitCenter: eng ? { lng: eng.orbitCenterLng, lat: eng.orbitCenterLat } : null,
        gameplayState,
        mapZoom,
        engageZoom: [LT_PROFILE.engageZoomMin, LT_PROFILE.engageZoomMax],
        captureZoom: [LT_PROFILE.captureZoomMin, LT_PROFILE.captureZoomMax],
        zoomEligible,
        engageEligible,
        renderedEngageCta: engageVisible,
        hasUserPosition,
        tutorialDismissed,
        inRange,
        distToTargetM: distM,
        engaged,
        engagedAtMs,
        captureDeadlineMs,
        terminal,
        failReason,
        targetVisual:
          terminal === 'success' ? 'wow-success' : terminal === 'fail' ? 'wow-fail' : engaged ? 'cyan' : 'neutral',
        wowTerminalActive: terminal !== 'none',
        liveTargetLevelId,
        completedLevelIds,
        victoryModalOpen,
        failOnMissTap: activeLevelPlan.failOnMissTap,
      });
    }, 640);
    return () => window.clearInterval(id);
  }, [
    enabled,
    gameplayState,
    mapZoom,
    inRange,
    engaged,
    terminal,
    failReason,
    engageVisible,
    zoomEligible,
    engageEligible,
    userPosition,
    engagedAtMs,
    captureDeadlineMs,
    tutorialDismissed,
    liveTargetLevelId,
    completedLevelIds,
    victoryModalOpen,
    activeLevelPlan.failOnMissTap,
  ]);

  const victoryModalLoggedRef = useRef(false);
  useEffect(() => {
    if (!victoryModalOpen) {
      victoryModalLoggedRef.current = false;
      return;
    }
    if (!liveTargetForensicLogsEnabled() || victoryModalLoggedRef.current) return;
    victoryModalLoggedRef.current = true;
    console.warn('[LiveTarget][4.3][victory_modal]', {
      phase: 'opened',
      levelId: liveTargetLevelId,
    });
  }, [victoryModalOpen, liveTargetLevelId]);

  useEffect(() => {
    if (!enabled || !liveTargetForensicLogsEnabled()) return;
    if (terminal === 'none') {
      wowOutcomeLoggedRef.current = 'none';
      return;
    }
    if (wowOutcomeLoggedRef.current === terminal) return;
    wowOutcomeLoggedRef.current = terminal;
    console.warn('[LiveTarget][4.3][wow]', {
      outcome: terminal,
      phase: terminal === 'success' ? 'success_wow_entered' : 'fail_wow_entered',
    });
  }, [enabled, terminal]);

  const succeedSession = useCallback(() => {
    console.warn('[LiveTarget][victory-flow] success_reached', { levelId: liveTargetLevelId });
    orbitPausedRef.current = true;
    setTerminal('success');
    setOutcomeToast('success');
    setVictoryModalOpen(true);
    setTutorialDismissed(true);
    setIsOpen(false);
    if (isHapticsAvailable()) hapticSuccess();
  }, [liveTargetLevelId]);

  const onVictoryContinue = useCallback(() => {
    const maxL = getMaxLiveTargetLevelId();
    if (liveTargetForensicLogsEnabled()) {
      console.warn('[LiveTarget][4.3][level]', {
        action: 'continue_click',
        levelComplete: liveTargetLevelId,
        nextLevelId: Math.min(liveTargetLevelId + 1, maxL),
      });
    }
    setVictoryModalOpen(false);
    setCompletedLevelIds((c) => (c.includes(liveTargetLevelId) ? c : [...c, liveTargetLevelId]));
    setLiveTargetLevelId((cur) => Math.min(cur + 1, maxL));
    setTerminal('none');
    setEngaged(false);
    setEngagedAtMs(null);
    setFailReason('none');
    setOutcomeToast('none');
    orbitPausedRef.current = false;
    wowOutcomeLoggedRef.current = 'none';
  }, [liveTargetLevelId]);

  const onEngage = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!engageVisible || engaged || terminal !== 'none') return;
      if (isHapticsAvailable()) hapticMedium();
      setEngaged(true);
      setEngagedAtMs(Date.now());
      setTutorialDismissed(true);
      setIsOpen(false);
    },
    [engageVisible, engaged, terminal]
  );

  const onEngagePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEngageCtaPressed(true);
  }, []);

  const onEngagePointerUp = useCallback(() => {
    setEngageCtaPressed(false);
  }, []);

  const onHintDotClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (terminal !== 'none') return;
      if (!engaged) {
        if (isHapticsAvailable()) hapticSelection();
        setIsOpen((o) => !o);
        return;
      }
      if (inRange && isZoomValidForEngagedCapture(mapZoom, LT_PROFILE)) {
        succeedSession();
        return;
      }
      if (isHapticsAvailable()) hapticSelection();
    },
    [terminal, engaged, inRange, mapZoom, succeedSession]
  );

  const onHintDotPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || liveTarget20ModuleLogged) return;
    liveTarget20ModuleLogged = true;
    const payload = {
      kind: 'module',
      phase: '4.3',
      msg: 'LiveTargetGeoOverlay — Phase 4.3 miss-tap fail + level-complete modal',
      featureFlagLIVE_TARGET_ENABLED: FEATURE_FLAG_LIVE_TARGET,
      compiledLIVE_TARGET_DEBUG: COMPILED_LIVE_TARGET_DEBUG,
    };
    console.warn('[LiveTarget][4.3][module]', payload);
    if (liveTarget13ELoggingActive()) {
      console.warn('[LiveTarget][4.3][overlay]', payload);
    }
  }, []);

  const syncProjectToDom = useCallback(
    (reason: LiveTargetProjectReason) => {
      if (!map) return null;
      const p = projectLiveTargetToDom(map, engineRef.current, anchorRef.current);
      if (liveTarget13ELoggingActive() && p && map.loaded()) {
        const t = performance.now();
        if (t - forensic21LastRef.current >= 400) {
          forensic21LastRef.current = t;
          const prev = forensic21PrevPxRef.current;
          const deltaVsPrevLog = Math.hypot(p.x - prev.x, p.y - prev.y);
          forensic21PrevPxRef.current = { x: p.x, y: p.y };
          const eng = engineRef.current;
          console.warn('[LiveTarget][2.1][forensics]', {
            reason,
            currentLng: eng?.currentLng,
            currentLat: eng?.currentLat,
            projectedX: p.x,
            projectedY: p.y,
            deltaVsPrevLogPx: deltaVsPrevLog,
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch(),
          });
        }
      }
      return p;
    },
    [map]
  );

  const runFrame = useCallback(() => {
    if (!map || !enabled) {
      stopMovementLoop();
      return;
    }

    const eng = engineRef.current;
    if (!eng) {
      movementRafRef.current = requestAnimationFrame(runFrame);
      return;
    }

    const now = performance.now();
    eng.debugEnabled = effectiveVisualDebug();
    let next: LiveTargetGeoEngineState;
    if (orbitPausedRef.current) {
      next = eng;
    } else {
      next = advanceOrbitTick(eng, now);
      engineRef.current = next;
    }

    try {
      if (!map.loaded()) {
        movementRafRef.current = requestAnimationFrame(runFrame);
        return;
      }
      const p = syncProjectToDom('rAF');
      if (!loggedProjectedRef.current && p) {
        loggedProjectedRef.current = true;
        console.warn('[LiveTarget][2.0][geo-ready]', {
          lng: next.currentLng,
          lat: next.currentLat,
        });
        console.warn('[LiveTarget][2.0][projected]', { x: p.x, y: p.y });
      }

      if (liveTarget13ELoggingActive() && p) {
        const zoom = map.getZoom();
        const mpp = liveTargetMercatorMetersPerPixel(next.currentLat, zoom);
        const groundMps = liveTargetOrbitGroundSpeedMps(
          LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT,
          LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS
        );
        const theoryPxPerSec = liveTargetApproxOrbitPxPerSec(
          LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT,
          LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS,
          next.currentLat,
          zoom
        );
        if (!forensicBaselineLoggedRef.current) {
          forensicBaselineLoggedRef.current = true;
          console.warn('[LiveTarget][2.0A][forensics]', {
            kind: 'baseline_theory',
            periodMs: LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS,
            radiusDegLat: LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT,
            zoom,
            metersPerPixel: mpp,
            groundSpeedMps: groundMps,
            approxOrbitPxPerSec: theoryPxPerSec,
          });
        }
        const elapsedMs = now - next.startedAt;
        const angle = (elapsedMs / LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS) * Math.PI * 2;
        let w = forensicWindowRef.current;
        if (!w) {
          forensicWindowRef.current = {
            lastLogAt: now,
            lastLng: next.currentLng,
            lastLat: next.currentLat,
            lastPx: p.x,
            lastPy: p.y,
          };
        } else if (now - w.lastLogAt >= 1000) {
          const dt = now - w.lastLogAt;
          const dLng = next.currentLng - w.lastLng;
          const dLat = next.currentLat - w.lastLat;
          const dPx = p.x - w.lastPx;
          const dPy = p.y - w.lastPy;
          console.warn('[LiveTarget][2.0A][forensics]', {
            kind: 'sample_1s',
            dtMs: dt,
            dLng,
            dLat,
            projectedX: p.x,
            projectedY: p.y,
            deltaPx: dPx,
            deltaPy: dPy,
            distPx: Math.hypot(dPx, dPy),
            pxPerSec: (Math.hypot(dPx, dPy) / dt) * 1000,
            elapsedMs,
            angleRad: angle,
            frame: 'rAF',
            engineActive: true,
            lastTickAdvanced: next.lastTickAt === now,
          });
          w.lastLogAt = now;
          w.lastLng = next.currentLng;
          w.lastLat = next.currentLat;
          w.lastPx = p.x;
          w.lastPy = p.y;
        }
      }
    } catch {
      /* map not ready */
    }

    movementRafRef.current = requestAnimationFrame(runFrame);
  }, [map, enabled, stopMovementLoop, syncProjectToDom]);

  useEffect(() => {
    if (!enabled || !map) {
      lockedOrbitCenterRef.current = null;
      orbitPausedRef.current = false;
      engineRef.current = null;
      loggedStartRef.current = false;
      loggedProjectedRef.current = false;
      forensicBaselineLoggedRef.current = false;
      forensicWindowRef.current = null;
      stopMovementLoop();
      patchLiveTargetRuntimeGlobal({
        mapMarkerMounted: false,
        markerMounted: false,
        lastRenderPhase: 'live_target_4_off',
      } as Record<string, unknown>);
      return;
    }

    let orbitCenter = LIVE_TARGET_PHASE2_ORBIT_CENTER;
    if (LT_PROFILE.anchorOrbitToUserWhenPositionAvailable) {
      if (userPosition) {
        orbitCenter = { lng: userPosition.lng, lat: userPosition.lat };
        lockedOrbitCenterRef.current = orbitCenter;
      } else if (lockedOrbitCenterRef.current) {
        orbitCenter = lockedOrbitCenterRef.current;
      }
    }

    orbitPausedRef.current = false;
    engineRef.current = createInitialEngineState(effectiveVisualDebug(), orbitCenter);
    if (!loggedStartRef.current) {
      loggedStartRef.current = true;
      console.warn('[LiveTarget][4.3][mounted]', {
        orbitCenter,
        referenceCenter: LIVE_TARGET_PHASE2_ORBIT_CENTER,
        difficulty: LT_PROFILE.code,
        anchorOrbitToUser: LT_PROFILE.anchorOrbitToUserWhenPositionAvailable,
      });
    }

    stopMovementLoop();
    movementRafRef.current = requestAnimationFrame(runFrame);

    patchLiveTargetRuntimeGlobal({
      mapMarkerMounted: true,
      markerMounted: true,
      mapHtmlProbeMounted: false,
      lastRenderPhase: 'live_target_4_engine_active',
      renderProbeMode: 'phase4_1_portal_orbit_anchor',
    } as Record<string, unknown>);

    return () => {
      orbitPausedRef.current = false;
      engineRef.current = null;
      loggedStartRef.current = false;
      loggedProjectedRef.current = false;
      forensicBaselineLoggedRef.current = false;
      forensicWindowRef.current = null;
      stopMovementLoop();
      patchLiveTargetRuntimeGlobal({
        mapMarkerMounted: false,
        markerMounted: false,
        lastRenderPhase: 'live_target_4_engine_cleanup',
      } as Record<string, unknown>);
    };
  }, [enabled, map, runFrame, stopMovementLoop, userPosition ? 1 : 0]);

  useEffect(() => {
    if (!enabled || !map) return;

    const onRender = () => {
      syncProjectToDom('render');
    };
    const onResize = () => {
      syncProjectToDom('resize');
    };
    const onMove = () => {
      syncProjectToDom('move');
    };

    map.on('render', onRender);
    map.on('resize', onResize);
    map.on('move', onMove);

    return () => {
      map.off('render', onRender);
      map.off('resize', onResize);
      map.off('move', onMove);
    };
  }, [enabled, map, syncProjectToDom]);

  useEffect(() => {
    const onDoc = (e: PointerEvent) => {
      if (!openRef.current) return;
      const t = e.target;
      if (t instanceof Element && t.closest('[data-lt-hint-root="1"]')) return;
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', onDoc, true);
    return () => document.removeEventListener('pointerdown', onDoc, true);
  }, []);

  if (!enabled || !map) return null;

  const showTutorial = terminal === 'none' && !tutorialDismissed;

  const hintExtraClass =
    terminal === 'success'
      ? ' hint--wow-success'
      : terminal === 'fail'
        ? ` hint--wow-fail${failReason === 'miss_tap' ? ' hint--wow-fail--miss' : ''}`
        : engaged
          ? ' hint--engaged'
          : gameplayState === 'zoom_eligible'
            ? ' hint--engage-ready'
            : inRange
              ? ' hint--in-range'
              : '';

  const phase4Portal =
    typeof document !== 'undefined'
      ? createPortal(
          <div className="lt-phase4-portal-root" data-lt-phase4-portal="1">
            {engageVisible && (
              <div className="lt-phase4-engage-wrap">
                <button
                  type="button"
                  className={`lt-phase42-engage-cta${engageCtaPressed ? ' lt-phase42-engage-cta--pressed' : ''}`}
                  onPointerDown={onEngagePointerDown}
                  onPointerUp={onEngagePointerUp}
                  onPointerLeave={onEngagePointerUp}
                  onPointerCancel={onEngagePointerUp}
                  onClick={onEngage}
                >
                  <span className="lt-phase42-engage-cta__label">{t('liveTarget.engage_cta')}</span>
                  <svg
                    className="lt-phase42-engage-cta__svg"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 66 43"
                    aria-hidden
                  >
                    <polygon
                      className="lt-phase42-engage-cta__ch lt-phase42-engage-cta__ch--1"
                      points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5"
                    />
                    <polygon
                      className="lt-phase42-engage-cta__ch lt-phase42-engage-cta__ch--2"
                      points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5"
                    />
                    <polygon
                      className="lt-phase42-engage-cta__ch lt-phase42-engage-cta__ch--3"
                      points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5"
                    />
                  </svg>
                </button>
              </div>
            )}

            {showTutorial && (
              <div
                className="lt-phase3-tutorial lt-phase4-tutorial"
                role="region"
                aria-label={t('liveTarget.tutorial_phase4_title')}
              >
                <p className="lt-phase3-tutorial__text">{t('liveTarget.tutorial_phase4_body')}</p>
                <button
                  type="button"
                  className="lt-phase3-tutorial__dismiss"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTutorialDismissed(true);
                  }}
                >
                  {t('liveTarget.dismiss_tutorial')}
                </button>
              </div>
            )}

            {engaged && terminal === 'none' && (
              <div className="lt-phase4-engaged-hint" role="status">
                <p className="lt-phase4-engaged-hint__text">{t('liveTarget.tutorial_engaged_hint')}</p>
              </div>
            )}

            {outcomeToast === 'success' && (
              <div
                className="lt-phase4-outcome-toast lt-phase4-outcome-toast--success lt-phase42-outcome-toast--success"
                role="status"
                aria-live="polite"
              >
                {t('liveTarget.success_message')}
              </div>
            )}
            {outcomeToast === 'fail' && (
              <div
                className="lt-phase4-outcome-toast lt-phase4-outcome-toast--fail lt-phase42-outcome-toast--fail"
                role="status"
                aria-live="polite"
              >
                {failReason === 'miss_tap' ? t('liveTarget.fail_miss_tap') : t('liveTarget.failure_message')}
              </div>
            )}

            {effectiveVisualDebug() && (
              <div className="live-target-geo-overlay-debug-badge" aria-hidden>
                LT 4.3 · L{liveTargetLevelId} · {gameplayState} · z{mapZoom.toFixed(2)}
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
    <div className="live-target-geo-overlay-root" aria-hidden={false}>
      <div
        ref={anchorRef}
        className="lt-geo-anchor"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="item-hints" data-lt-geo-overlay="1">
          <div
            data-lt-hint-root="1"
            className={`hint ${isOpen ? 'hint--open' : ''}${hintExtraClass}`}
            data-position="4"
            data-lt-gameplay={gameplayState}
          >
            <span className="hint-radius" aria-hidden />
            {terminal === 'success' && (
              <span className="lt-wow-terminal-burst lt-wow-terminal-burst--success" aria-hidden>
                <span className="lt-wow-terminal-burst__wave" />
                <span className="lt-wow-terminal-burst__wave" />
                <span className="lt-wow-terminal-burst__wave" />
                <span className="lt-wow-terminal-burst__flash lt-wow-terminal-burst__flash--success" />
              </span>
            )}
            {terminal === 'fail' && (
              <span className="lt-wow-terminal-burst lt-wow-terminal-burst--fail" aria-hidden>
                <span className="lt-wow-terminal-burst__wave lt-wow-terminal-burst__wave--fail" />
                <span className="lt-wow-terminal-burst__wave lt-wow-terminal-burst__wave--fail" />
                <span className="lt-wow-terminal-burst__wave lt-wow-terminal-burst__wave--fail" />
                <span className="lt-wow-terminal-burst__flash lt-wow-terminal-burst__flash--fail" />
              </span>
            )}
            {inRange && terminal === 'none' && !engaged && (
              <span className="lt-phase3-in-range-badge">{t('liveTarget.in_range_badge')}</span>
            )}
            {gameplayState === 'zoom_eligible' && terminal === 'none' && !engaged && (
              <span className="lt-phase4-engage-ready-badge">{t('liveTarget.state_engage_ready')}</span>
            )}
            {engaged && terminal === 'none' && (
              <span className="lt-phase4-engaged-badge">{t('liveTarget.state_engaged')}</span>
            )}
            <button
              type="button"
              className="hint-dot"
              aria-label={t('liveTarget.dot_label')}
              aria-expanded={isOpen}
              onPointerDown={onHintDotPointerDown}
              onClick={onHintDotClick}
            >
              {t('liveTarget.dot_label')}
            </button>
            <div className="hint-content do--split-children" role="status">
              <p>{t('liveTarget.card_title')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {phase4Portal}
    <LiveTargetVictoryModal
      open={victoryModalOpen && terminal === 'success'}
      levelId={liveTargetLevelId}
      onContinue={onVictoryContinue}
      t={t}
    />
    </>
  );
}
