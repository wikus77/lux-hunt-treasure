const LOG_PREFIX = '[VictoryOrch]';

export function orchLog(msg: string, data?: unknown): void {
  if (typeof console === 'undefined') return;
  if (import.meta.env.DEV) {
    console.log(LOG_PREFIX, msg, data ?? '');
    return;
  }
  try {
    if (localStorage.getItem('m1_victory_orch_debug') === 'true') {
      console.log(LOG_PREFIX, msg, data ?? '');
    }
  } catch {
    /* no-op */
  }
}
