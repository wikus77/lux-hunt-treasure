/**
 * LIVE TARGET™ — runtime global `window.__LIVE_TARGET_RUNTIME__` (no body-level UI).
 * Map-only debug lives in MapTiler3D / LiveTargetLayer3D.
 */

import { LIVE_TARGET_ENABLED } from '@/config/featureFlags';

/** Runtime-only visual debug (reload after set). Compile-time: VITE_LIVE_TARGET_DEBUG=true */
export const LIVE_TARGET_LS_DEBUG_KEY = 'm1_live_target_debug';

export const COMPILED_LIVE_TARGET_DEBUG = import.meta.env.VITE_LIVE_TARGET_DEBUG === 'true';

export const COMPILED_LIVE_TARGET_LOG =
  COMPILED_LIVE_TARGET_DEBUG ||
  import.meta.env.DEV ||
  import.meta.env.VITE_LIVE_TARGET_LOG === 'true';

export function readRuntimeDebugFromStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(LIVE_TARGET_LS_DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
}

/** True if extreme debug visuals should apply (Vite env OR localStorage fallback). */
export function effectiveVisualDebug(): boolean {
  return COMPILED_LIVE_TARGET_DEBUG || readRuntimeDebugFromStorage();
}

/** True when user asked forensic logs via LS or compile. */
export function liveTarget13ELoggingActive(): boolean {
  return readRuntimeDebugFromStorage() || COMPILED_LIVE_TARGET_DEBUG;
}

export function liveTargetForensicLogsEnabled(): boolean {
  return COMPILED_LIVE_TARGET_LOG || effectiveVisualDebug();
}

export function isLiveTargetProbeElementVisible(el: HTMLElement | null): boolean {
  if (!el?.isConnected) return false;
  const cs = window.getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  if (Number.parseFloat(cs.opacity || '1') < 0.05) return false;
  const r = el.getBoundingClientRect();
  return r.width > 2 && r.height > 2;
}

export interface LiveTargetRuntimeGlobal {
  importMetaEnv: {
    VITE_LIVE_TARGET: string;
    VITE_LIVE_TARGET_DEBUG: string;
    VITE_LIVE_TARGET_LOG: string;
    MODE: string;
    DEV: boolean;
  };
  compiledLIVE_TARGET_DEBUG: boolean;
  compiledLIVE_TARGET_LOG: boolean;
  runtimeLocalStorageDebugKey: string;
  runtimeLocalStorageDebugActive: boolean;
  effectiveVisualDebug: boolean;
  featureFlagLIVE_TARGET_ENABLED: boolean;
  liveTargetBuildStamp: {
    liveTargetModuleCode: string;
    viteBuildId: string;
    vitePwaVersion: string;
    bundleEvaluatedAtIso: string;
    baselineSetAtMs: number;
  };
  moduleLoaded: boolean;
  componentMounted: boolean;
  effectBranch: string;
  mapPresent: boolean;
  markerMounted: boolean;
  bodyProbeMounted: boolean;
  bodyProbeVisible: boolean;
  mapHtmlProbeMounted: boolean;
  mapHtmlProbeVisible: boolean;
  mapMarkerMounted: boolean;
  renderProbeMode: string;
  lastRenderPhase: string;
  updatedAt: number;
}

function readImportMetaEnvSnapshot() {
  return {
    VITE_LIVE_TARGET: String(import.meta.env.VITE_LIVE_TARGET ?? ''),
    VITE_LIVE_TARGET_DEBUG: String(import.meta.env.VITE_LIVE_TARGET_DEBUG ?? ''),
    VITE_LIVE_TARGET_LOG: String(import.meta.env.VITE_LIVE_TARGET_LOG ?? ''),
    MODE: String(import.meta.env.MODE),
    DEV: import.meta.env.DEV,
  };
}

const LEGACY_BODY_PROBE_ID = 'live-target-body-debug-probe';

export function createLiveTargetRuntimeState(
  overrides: Partial<LiveTargetRuntimeGlobal> & Record<string, unknown> = {}
): LiveTargetRuntimeGlobal {
  const now = Date.now();
  const base: LiveTargetRuntimeGlobal = {
    importMetaEnv: readImportMetaEnvSnapshot(),
    compiledLIVE_TARGET_DEBUG: COMPILED_LIVE_TARGET_DEBUG,
    compiledLIVE_TARGET_LOG: COMPILED_LIVE_TARGET_LOG,
    runtimeLocalStorageDebugKey: LIVE_TARGET_LS_DEBUG_KEY,
    runtimeLocalStorageDebugActive: readRuntimeDebugFromStorage(),
    effectiveVisualDebug: effectiveVisualDebug(),
    featureFlagLIVE_TARGET_ENABLED: LIVE_TARGET_ENABLED,
    liveTargetBuildStamp: {
      liveTargetModuleCode: 'LT-2.1',
      viteBuildId: String(import.meta.env.VITE_BUILD_ID ?? ''),
      vitePwaVersion: String(import.meta.env.VITE_PWA_VERSION ?? ''),
      bundleEvaluatedAtIso: new Date().toISOString(),
      baselineSetAtMs: now,
    },
    moduleLoaded: true,
    componentMounted: false,
    effectBranch: 'globals_init',
    mapPresent: false,
    markerMounted: false,
    bodyProbeMounted: false,
    bodyProbeVisible: false,
    mapHtmlProbeMounted: false,
    mapHtmlProbeVisible: false,
    mapMarkerMounted: false,
    renderProbeMode: 'off',
    lastRenderPhase: 'globals_baseline',
    updatedAt: now,
  };
  return { ...base, ...overrides, updatedAt: Date.now() } as LiveTargetRuntimeGlobal;
}

/** Full refresh of derived flags from env + localStorage, then shallow merge patch. */
export function patchLiveTargetRuntimeGlobal(
  patch: Partial<LiveTargetRuntimeGlobal> & Record<string, unknown> = {}
): LiveTargetRuntimeGlobal {
  if (typeof window === 'undefined') {
    return createLiveTargetRuntimeState(patch);
  }
  const w = window as Window & { __LIVE_TARGET_RUNTIME__?: LiveTargetRuntimeGlobal };
  const prev = w.__LIVE_TARGET_RUNTIME__ ?? createLiveTargetRuntimeState({});
  const next = {
    ...prev,
    ...patch,
    importMetaEnv: readImportMetaEnvSnapshot(),
    compiledLIVE_TARGET_DEBUG: COMPILED_LIVE_TARGET_DEBUG,
    compiledLIVE_TARGET_LOG: COMPILED_LIVE_TARGET_LOG,
    runtimeLocalStorageDebugActive: readRuntimeDebugFromStorage(),
    effectiveVisualDebug: effectiveVisualDebug(),
    featureFlagLIVE_TARGET_ENABLED: LIVE_TARGET_ENABLED,
    updatedAt: Date.now(),
  } as LiveTargetRuntimeGlobal;
  w.__LIVE_TARGET_RUNTIME__ = next;
  return next;
}

export function installLiveTargetRuntimeGlobalBaseline(): void {
  if (typeof window === 'undefined') return;
  if (typeof document !== 'undefined') {
    document.getElementById(LEGACY_BODY_PROBE_ID)?.remove();
  }
  const w = window as Window & { __LIVE_TARGET_RUNTIME__?: LiveTargetRuntimeGlobal };
  w.__LIVE_TARGET_RUNTIME__ = createLiveTargetRuntimeState({
    effectBranch: 'baseline_live_target_globals_module',
    bodyProbeMounted: false,
    bodyProbeVisible: false,
    lastRenderPhase: 'globals_1.3h_no_body_probe',
  });
}

/** Console + global — always refreshes env/LS-derived fields into __LIVE_TARGET_RUNTIME__. */
export function emitLiveTargetRuntimeLine(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const merged = patchLiveTargetRuntimeGlobal(payload as Partial<LiveTargetRuntimeGlobal>);
  const line = `[LiveTarget][Runtime] ${JSON.stringify({ ...merged, ...payload })}`;
  console.warn(line, { ...merged, ...payload });
  console.log(line);
}

installLiveTargetRuntimeGlobalBaseline();
