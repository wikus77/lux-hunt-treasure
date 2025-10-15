// © 2025 Joseph MULÉ – M1SSION™ – Supabase Singleton Diagnostics

let _instanceCount = 0;
let _lastInitStack = '';

/**
 * Increment the Supabase client instance counter.
 * In dev mode, warns if multiple instances are created.
 */
export function incSupabaseInstanceCount() {
  _instanceCount += 1;
  if (import.meta.env.DEV && _instanceCount > 1) {
    // Capture stack trace of second initialization
    _lastInitStack = new Error('Supabase client re-initialized').stack ?? '';
    // Warn in console
    // eslint-disable-next-line no-console
    console.warn(
      '[SUPABASE-DIAG] ⚠️ Multiple Supabase client instances detected!',
      { count: _instanceCount, stack: _lastInitStack }
    );
  }
}

/**
 * Get diagnostics info about Supabase client instances
 */
export function getSupabaseDiag() {
  return {
    count: _instanceCount,
    lastInitStack: _lastInitStack,
    env: {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
    },
  };
}
