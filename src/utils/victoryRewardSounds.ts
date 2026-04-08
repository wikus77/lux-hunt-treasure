/**
 * M1SSION™ — Victory reward SFX (M1U / PE / rank-up)
 * HTMLAudioElement pools; iOS: play().catch silent fail; M1U/rank use a short MIN_GAP_MS (PE does not).
 * Presentation-only — no conductor / server coupling.
 */

const M1U_URL = '/sounds/victory/m1u-coins.mp3';
const PE_URL = '/sounds/victory/pe-reward.mp3';
const RANK_URL = '/sounds/victory/rank-up.mp3';

const VOL_M1U = 0.42;
const VOL_PE = 0.42;
const VOL_RANK = 0.46;

/**
 * In-file start (seconds). Tuned with `PulseBarReward` bar-end anchor (not CTA) + `PE_EFFECTIVE_SOUND_WINDOW_MS`.
 */
const PE_SOUND_START_S = 0.55;

const MIN_GAP_MS = 320;

/** If metadata still missing after this from `playPESound`, play from t=0 once (still inside climax; never 700ms late). */
const PE_PLAY_DEGRADED_DEADLINE_MS = 140;

let poolM1u: HTMLAudioElement | null = null;
let poolPe: HTMLAudioElement | null = null;
let poolRank: HTMLAudioElement | null = null;

/** Opt-in: `VITE_PE_SYNC_DEBUG=true` and/or `localStorage m1_pe_sync_debug=true`. */
export function isPeSyncDebugEnabled(): boolean {
  if (import.meta.env.VITE_PE_SYNC_DEBUG === 'true') return true;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('m1_pe_sync_debug') === 'true';
  } catch {
    return false;
  }
}

export function peSyncLog(msg: string, data?: Record<string, unknown>): void {
  if (!isPeSyncDebugEnabled()) return;
  if (typeof console !== 'undefined') {
    console.log(`[PE-SYNC] ${msg}`, data ?? '');
  }
}

function ensurePool(url: string, pool: HTMLAudioElement | null): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (pool) return pool;
  try {
    const a = new Audio(url);
    a.preload = 'auto';
    return a;
  } catch {
    return null;
  }
}

/** Seek offset in seconds; if duration unknown or clip shorter than requested, clamp to safe range. */
function resolveVictorySoundStart(requestedStartS: number, duration: number): number {
  if (requestedStartS <= 0) return 0;
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(requestedStartS, Math.max(0, duration - 0.02));
}

function playUrl(
  url: string,
  getPool: () => HTMLAudioElement | null,
  setPool: (a: HTMLAudioElement | null) => void,
  volume: number,
  lastAt: { current: number },
  startSeconds = 0
): void {
  const now = Date.now();
  if (now - lastAt.current < MIN_GAP_MS) return;
  lastAt.current = now;

  let a = getPool();
  if (!a) {
    a = ensurePool(url, null);
    setPool(a);
  }
  if (!a) return;

  try {
    a.volume = volume;
    const t = resolveVictorySoundStart(startSeconds, a.duration);
    a.currentTime = t;
    void a.play().catch(() => {});
  } catch {
    /* silent */
  }
}

const lastM1u = { current: 0 };
const lastRank = { current: 0 };

/** Cancels in-flight async PE metadata wait so rapid retriggers do not stack listeners + `load()` races. */
let pePlayAsyncCleanup: (() => void) | null = null;

export function playM1USound(): void {
  playUrl(
    M1U_URL,
    () => poolM1u,
    (a) => {
      poolM1u = a;
    },
    VOL_M1U,
    lastM1u
  );
}

/**
 * Start loading PE clip early (e.g. when PE bar mounts) so metadata/decode is ready before burst — avoids late SFX on WKWebView.
 */
export function warmPERewardSound(): void {
  if (typeof window === 'undefined') return;
  let a = poolPe;
  if (!a) {
    a = ensurePool(PE_URL, null);
    poolPe = a;
  }
  if (!a) return;
  try {
    if (
      a.readyState >= HTMLMediaElement.HAVE_METADATA &&
      Number.isFinite(a.duration) &&
      a.duration > 0
    ) {
      peSyncLog('warm skip (already ready)', {
        readyState: a.readyState,
        duration: a.duration,
      });
      return;
    }
    peSyncLog('warm load()', { readyState: a.readyState, networkState: a.networkState });
    a.load();
  } catch {
    /* silent */
  }
}

function finiteDuration(a: HTMLAudioElement): boolean {
  return (
    a.readyState >= HTMLMediaElement.HAVE_METADATA &&
    Number.isFinite(a.duration) &&
    a.duration > 0
  );
}

export function playPESound(): void {
  if (typeof window === 'undefined') return;
  const tEnter = typeof performance !== 'undefined' ? performance.now() : Date.now();

  if (pePlayAsyncCleanup) {
    peSyncLog('aborting previous PE async wait (retrigger / overlapping playPESound)', {});
    pePlayAsyncCleanup();
    pePlayAsyncCleanup = null;
  }

  peSyncLog('trigger requested (PE)', {
    performanceNow: tEnter,
    minGapGuard: 'none',
    note: 'PE does not use MIN_GAP_MS; M1U/rank still do',
  });

  let a = poolPe;
  if (!a) {
    a = ensurePool(PE_URL, null);
    poolPe = a;
  }
  if (!a) return;

  peSyncLog('actualPlayStart (JS playPESound enter)', {
    performanceNow: tEnter,
    dateNow: Date.now(),
    readyState: a.readyState,
    duration: a.duration,
    networkState: a.networkState,
    peSeekStartS: PE_SOUND_START_S,
    playbackPath: 'pending',
  });

  let ran = false;
  let deadlineId: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    a!.removeEventListener('loadedmetadata', onSignal);
    a!.removeEventListener('durationchange', onSignal);
    a!.removeEventListener('canplay', onSignal);
    if (deadlineId != null) {
      clearTimeout(deadlineId);
      deadlineId = null;
    }
  };

  const runOnce = (path: string, degraded: boolean) => {
    if (ran) return;
    ran = true;
    pePlayAsyncCleanup = null;
    cleanup();
    try {
      const previousPlaybackActive = !a!.paused;
      a!.pause();
      a!.volume = VOL_PE;
      const requestedStart = degraded ? 0 : PE_SOUND_START_S;
      const t = resolveVictorySoundStart(requestedStart, a!.duration);
      peSyncLog('play commit', {
        playbackPath: path,
        degraded,
        requestedStart,
        resolvedCurrentTime: t,
        duration: a!.duration,
        readyState: a!.readyState,
        previousPlaybackActive,
        guardBlockedPlayback: false,
      });
      a!.currentTime = t;
      const p = a!.play();
      p.then(() => {
        peSyncLog('play() promise resolved', { path });
      }).catch(() => {
        peSyncLog('play() promise rejected', { path });
      });
      a!.addEventListener(
        'playing',
        () => {
          const after =
            typeof performance !== 'undefined' ? performance.now() - tEnter : undefined;
          peSyncLog('actualPlayStart (playing event — audible)', {
            playbackPath: path,
            msSincePlayPESoundEnter: after,
          });
        },
        { once: true }
      );
    } catch (e) {
      peSyncLog('play commit threw', { path, error: String(e) });
    }
  };

  const tryMetaPath = (path: string) => {
    if (ran) return;
    if (finiteDuration(a!)) {
      peSyncLog('metadata ready', {
        path,
        readyState: a!.readyState,
        duration: a!.duration,
      });
      runOnce(path, false);
    }
  };

  const onSignal = () => {
    tryMetaPath('event:loadedmetadata|durationchange|canplay');
  };

  if (finiteDuration(a)) {
    peSyncLog('fast path (meta ready at enter)', {
      duration: a.duration,
      readyState: a.readyState,
    });
    runOnce('fast-path-enter', false);
    return;
  }

  peSyncLog('async path (waiting for finite duration)', {
    readyState: a.readyState,
    duration: a.duration,
  });

  a.addEventListener('loadedmetadata', onSignal);
  a.addEventListener('durationchange', onSignal);
  a.addEventListener('canplay', onSignal);
  pePlayAsyncCleanup = () => {
    cleanup();
  };
  try {
    a.load();
  } catch {
    /* silent */
  }

  deadlineId = window.setTimeout(() => {
    deadlineId = null;
    if (ran) return;
    peSyncLog('deadline: degraded play (no finite duration yet)', {
      ms: PE_PLAY_DEGRADED_DEADLINE_MS,
      readyState: a!.readyState,
      duration: a!.duration,
    });
    runOnce('deadline-degraded', true);
  }, PE_PLAY_DEGRADED_DEADLINE_MS);
}

export function playRankUpSound(): void {
  playUrl(
    RANK_URL,
    () => poolRank,
    (a) => {
      poolRank = a;
    },
    VOL_RANK,
    lastRank
  );
}

/**
 * Warm decode paths after a real user gesture (helps some iOS WKWebView builds).
 * Call once from app root; idempotent.
 */
let primed = false;
export function primeVictorySoundsOnUserGesture(): void {
  if (typeof window === 'undefined' || primed) return;
  primed = true;
  const touch = () => {
    try {
      poolM1u = ensurePool(M1U_URL, poolM1u);
      poolPe = ensurePool(PE_URL, poolPe);
      poolRank = ensurePool(RANK_URL, poolRank);
      poolM1u?.load();
      poolPe?.load();
      poolRank?.load();
    } catch {
      /* silent */
    }
    document.removeEventListener('pointerdown', touch, true);
    document.removeEventListener('touchstart', touch, true);
  };
  document.addEventListener('pointerdown', touch, { capture: true, passive: true });
  document.addEventListener('touchstart', touch, { capture: true, passive: true });
}
