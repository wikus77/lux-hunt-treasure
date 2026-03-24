/**
 * Floating Pills V3 — UI layout tokens only (no mission/commit/battle state).
 * Vertical stack origin: `stackTopOffsetPx` + safe-area (mirrored left/right in FloatingPillLayerV3).
 */

import { useMemo } from 'react';
import { FLOATING_PILLS_V3_Z_INDEX } from './floating-pills-v3';

/**
 * Radial satellites use ~radius 70px + half button (~22–26px) ≈ 96px left of hub center.
 * Left-rail pill center ≈ max(16,safe-left) + 36 → without bias, min x ≈ center − 96 can be &lt; inset (clipped).
 * Shifting all slot `x` by this amount (inward / toward screen center) keeps the same ring geometry, viewport-safe.
 */
const LEFT_RAIL_RADIAL_SATELLITE_BIAS_X_PX = 60;

export function useFloatingPillsV3() {
  return useMemo(
    () => ({
      zIndex: FLOATING_PILLS_V3_Z_INDEX,
      /** First rail row: matches Map 3D M1U slot (`MapTiler3D` — top = safe + 96px). */
      stackTopOffsetPx: 96,
      /** Added to each radial slot `x` for Action/Commit hubs on the left rail only (embedded V3). */
      leftRailRadialSatelliteBiasXPx: LEFT_RAIL_RADIAL_SATELLITE_BIAS_X_PX,
    }),
    []
  );
}
