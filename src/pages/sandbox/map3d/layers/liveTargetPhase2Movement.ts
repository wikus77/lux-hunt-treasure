/**
 * LIVE TARGET™ Phase 2 — geo movement (orbit). Degrees ≈ meters at mid-latitudes; no teleport.
 */

export const LIVE_TARGET_PHASE2_ORBIT_CENTER = { lng: 9.191926, lat: 45.464211 } as const;

/**
 * Orbit period (ms). Phase 2.0A: tuned so tangential motion is perceptible at phone zoom (~z14–16).
 * Prior 95s × R≈8m → ~0.5 m/s → ~0.15 px/s @ z15 (below perception). See liveTargetPhase2Forensics.
 */
export const LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS = 36_000;

/** ~22m orbit radius (deg × ~111km); with 36s period → ~3.9 m/s ground → ~1+ px/s @ z15 */
export const LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT = 0.0002;

export type LiveTargetGeoEngineState = {
  currentLng: number;
  currentLat: number;
  lastLng: number;
  lastLat: number;
  orbitCenterLng: number;
  orbitCenterLat: number;
  isMoving: boolean;
  startedAt: number;
  lastTickAt: number;
  speedMode: string;
  debugEnabled: boolean;
  phaseCode: string;
};

function initialOrbitPoint(center: { lng: number; lat: number }): { lng: number; lat: number } {
  const R = LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT;
  const cosLat = Math.cos((center.lat * Math.PI) / 180);
  const safeCos = Math.abs(cosLat) < 0.2 ? 0.2 : cosLat;
  const angle = 0;
  return {
    lng: center.lng + (R / safeCos) * Math.cos(angle),
    lat: center.lat + R * Math.sin(angle),
  };
}

export function createInitialEngineState(
  debugEnabled: boolean,
  orbitCenter: { lng: number; lat: number } = LIVE_TARGET_PHASE2_ORBIT_CENTER
): LiveTargetGeoEngineState {
  const p0 = initialOrbitPoint(orbitCenter);
  const now = performance.now();
  return {
    currentLng: p0.lng,
    currentLat: p0.lat,
    lastLng: p0.lng,
    lastLat: p0.lat,
    orbitCenterLng: orbitCenter.lng,
    orbitCenterLat: orbitCenter.lat,
    isMoving: true,
    startedAt: now,
    lastTickAt: now,
    speedMode: 'orbit_perceptible_2a',
    debugEnabled,
    phaseCode: 'LT_PHASE_2_BASE',
  };
}

/**
 * Small circular orbit in geographic space (clockwise when viewed from above north pole).
 */
export function advanceOrbitTick(state: LiveTargetGeoEngineState, nowMs: number): LiveTargetGeoEngineState {
  const centerLng = state.orbitCenterLng;
  const centerLat = state.orbitCenterLat;
  const elapsed = nowMs - state.startedAt;
  const angle = (elapsed / LIVE_TARGET_PHASE2_ORBIT_PERIOD_MS) * Math.PI * 2;
  const R = LIVE_TARGET_PHASE2_ORBIT_RADIUS_DEG_LAT;
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  const safeCos = Math.abs(cosLat) < 0.2 ? 0.2 : cosLat;
  const lng = centerLng + (R / safeCos) * Math.cos(angle);
  const lat = centerLat + R * Math.sin(angle);

  return {
    ...state,
    lastLng: state.currentLng,
    lastLat: state.currentLat,
    currentLng: lng,
    currentLat: lat,
    lastTickAt: nowMs,
    isMoving: true,
  };
}
