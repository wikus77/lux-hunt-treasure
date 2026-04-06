/**
 * LIVE TARGET™ Phase 3.1 — direct tap on target to capture when in range; no external Capture CTA.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Map as MLMap } from 'maplibre-gl';
import { isHapticsAvailable, hapticSelection, hapticSuccess } from '@/utils/haptics';
import { LIVE_TARGET_ENABLED as FEATURE_FLAG_LIVE_TARGET } from '@/config/featureFlags';
import {
  effectiveVisualDebug,
  patchLiveTargetRuntimeGlobal,
  liveTarget13ELoggingActive,
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
import {
  LIVE_TARGET_CAPTURE_FEEDBACK_MS,
  LIVE_TARGET_CAPTURE_RADIUS_METERS,
  LIVE_TARGET_IN_RANGE_POLL_MS,
} from './liveTargetPhase3CaptureConfig';
import './LiveTargetGeoOverlay.css';

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
  const [captured, setCaptured] = useState(false);
  const [inRange, setInRange] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [capturedFeedback, setCapturedFeedback] = useState(false);
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
      setCaptured(false);
      setInRange(false);
      setCapturedFeedback(false);
      setTutorialDismissed(false);
      orbitPausedRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!capturedFeedback) return;
    const id = window.setTimeout(() => setCapturedFeedback(false), LIVE_TARGET_CAPTURE_FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [capturedFeedback]);

  useEffect(() => {
    if (!enabled || captured) return;
    const tick = () => {
      const eng = engineRef.current;
      if (!eng || !userPosition) {
        setInRange((prev) => (prev ? false : prev));
        return;
      }
      const d = haversineMeters(userPosition.lat, userPosition.lng, eng.currentLat, eng.currentLng);
      const next = d <= LIVE_TARGET_CAPTURE_RADIUS_METERS;
      setInRange((prev) => (prev === next ? prev : next));
    };
    tick();
    const id = window.setInterval(tick, LIVE_TARGET_IN_RANGE_POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, captured, userPosition]);

  const handleCapture = useCallback(() => {
    if (!inRange || captured) return;
    orbitPausedRef.current = true;
    setCaptured(true);
    setIsOpen(false);
    setTutorialDismissed(true);
    setCapturedFeedback(true);
  }, [inRange, captured]);

  const onHintDotClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (captured) return;
      if (inRange) {
        if (isHapticsAvailable()) hapticSuccess();
        handleCapture();
        return;
      }
      if (isHapticsAvailable()) hapticSelection();
      setIsOpen((o) => !o);
    },
    [captured, inRange, handleCapture]
  );

  const onHintDotPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || liveTarget20ModuleLogged) return;
    liveTarget20ModuleLogged = true;
    const payload = {
      kind: 'module',
      phase: '2.0',
      msg: 'LiveTargetGeoOverlay — Phase 2 geo orbit + project()',
      featureFlagLIVE_TARGET_ENABLED: FEATURE_FLAG_LIVE_TARGET,
      compiledLIVE_TARGET_DEBUG: COMPILED_LIVE_TARGET_DEBUG,
    };
    console.warn('[LiveTarget][2.0][module]', payload);
    if (liveTarget13ELoggingActive()) {
      console.warn('[LiveTarget][2.0][overlay]', payload);
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
            order:
              reason === 'rAF'
                ? 'advanceOrbit → engineRef → map.project → DOM'
                : 'engineRef → map.project → DOM (camera sync, no orbit advance)',
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
      next = advanceOrbitTick(
        eng,
        now,
        LIVE_TARGET_PHASE2_ORBIT_CENTER.lng,
        LIVE_TARGET_PHASE2_ORBIT_CENTER.lat
      );
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
            note: 'Enable via localStorage m1_live_target_debug=true or VITE_LIVE_TARGET_DEBUG; 1s samples below',
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
        lastRenderPhase: 'live_target_2_off',
      } as Record<string, unknown>);
      return;
    }

    orbitPausedRef.current = false;
    engineRef.current = createInitialEngineState(effectiveVisualDebug());
    if (!loggedStartRef.current) {
      loggedStartRef.current = true;
      console.warn('[LiveTarget][2.0][mounted]', {
        center: LIVE_TARGET_PHASE2_ORBIT_CENTER,
        phaseCode: engineRef.current.phaseCode,
      });
      console.warn('[LiveTarget][2.0][engine-start]', {
        orbitPeriodMs: LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS,
        radiusDegLat: LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT,
        speedMode: engineRef.current.speedMode,
      });
    }

    stopMovementLoop();
    movementRafRef.current = requestAnimationFrame(runFrame);

    patchLiveTargetRuntimeGlobal({
      mapMarkerMounted: true,
      markerMounted: true,
      mapHtmlProbeMounted: false,
      lastRenderPhase: 'live_target_2_engine_active',
      renderProbeMode: 'phase2_geo_orbit_overlay',
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
        lastRenderPhase: 'live_target_2_engine_cleanup',
      } as Record<string, unknown>);
    };
  }, [enabled, map, runFrame, stopMovementLoop]);

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
      console.warn('[LiveTarget][2.0][close]', { reason: 'outside' });
    };
    document.addEventListener('pointerdown', onDoc, true);
    return () => document.removeEventListener('pointerdown', onDoc, true);
  }, []);

  if (!enabled || !map) return null;

  const showTutorial = !captured && !tutorialDismissed;

  return (
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
            className={`hint ${isOpen ? 'hint--open' : ''}${inRange && !captured ? ' hint--in-range' : ''}${captured ? ' hint--captured' : ''}`}
            data-position="4"
          >
            <span className="hint-radius" aria-hidden />
            {inRange && !captured && (
              <span className="lt-phase3-in-range-badge">{t('liveTarget.in_range_badge')}</span>
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

      {showTutorial && (
        <div
          className="lt-phase3-tutorial"
          role="region"
          aria-label={t('liveTarget.tutorial_hint')}
        >
          <p className="lt-phase3-tutorial__text">
            {userPosition ? t('liveTarget.tutorial_hint') : t('liveTarget.tutorial_need_location')}
          </p>
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

      {capturedFeedback && (
        <div className="lt-phase3-captured-toast" role="status" aria-live="polite">
          {t('liveTarget.captured_feedback')}
        </div>
      )}

      {effectiveVisualDebug() && (
        <div className="live-target-geo-overlay-debug-badge" aria-hidden>
          LT 3.1
        </div>
      )}
    </div>
  );
}
