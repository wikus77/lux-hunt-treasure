/**
 * LIVE TARGET™ Phase 2.0A — read-only forensics helpers (no UI).
 * Used to quantify orbit → screen motion; logs gated in LiveTargetGeoOverlay.
 */

/** Ground speed (m/s) along circular orbit: circumference / period. */
export function liveTargetOrbitGroundSpeedMps(radiusDegLat: number, periodMs: number): number {
  const Rm = Math.abs(radiusDegLat) * 111_320;
  const Tsec = Math.max(periodMs, 1) / 1000;
  return (2 * Math.PI * Rm) / Tsec;
}

/** Web Mercator scale — meters per pixel at latitude and zoom (MapLibre-compatible). */
export function liveTargetMercatorMetersPerPixel(latDeg: number, zoom: number): number {
  return (156543.03392 * Math.cos((latDeg * Math.PI) / 180)) / 2 ** zoom;
}

/** Order-of-magnitude screen speed: ground tangential speed / meters-per-pixel (orbit-scale proxy). */
export function liveTargetApproxOrbitPxPerSec(
  radiusDegLat: number,
  periodMs: number,
  latDeg: number,
  zoom: number
): number {
  const mps = liveTargetOrbitGroundSpeedMps(radiusDegLat, periodMs);
  const mpp = liveTargetMercatorMetersPerPixel(latDeg, zoom);
  if (mpp < 1e-6) return 0;
  return mps / mpp;
}
