/**
 * LIVE TARGET™ Phase 2.1 — single-path geo → screen → DOM (map.project).
 * Called from rAF (after orbit advance) and from map 'render' / 'resize' for camera lock.
 */

import type { Map as MLMap } from 'maplibre-gl';
import type { LiveTargetGeoEngineState } from './liveTargetPhase2Movement';

export type LiveTargetProjectReason = 'rAF' | 'render' | 'resize' | 'move';

export function projectLiveTargetToDom(
  map: MLMap,
  engine: LiveTargetGeoEngineState | null,
  anchorEl: HTMLDivElement | null
): { x: number; y: number } | null {
  if (!engine || !anchorEl) return null;
  try {
    if (!map.loaded()) return null;
    const p = map.project([engine.currentLng, engine.currentLat]);
    anchorEl.style.left = `${p.x}px`;
    anchorEl.style.top = `${p.y}px`;
    return { x: p.x, y: p.y };
  } catch {
    return null;
  }
}
