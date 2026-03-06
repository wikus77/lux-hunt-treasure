/**
 * Auth single-flight: one in-flight getSession/getUser at a time to avoid
 * Navigator LockManager lock contention and 10s timeouts on iOS (Capacitor WKWebView).
 * Retries on lock timeout with backoff. No architectural change; drop-in for bootstrap callers.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';

const MAX_RETRIES = 1;
const BACKOFF_MS = [250];

function isLockTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = (error as { message?: string }).message ?? '';
  const isAcquire = (error as { isAcquireTimeout?: boolean }).isAcquireTimeout === true;
  return isAcquire || /timed out|LockManager lock|navigator\.locks/i.test(msg);
}

let getSessionInflight: Promise<{ data: { session: import('@supabase/supabase-js').Session | null }; error: import('@supabase/supabase-js').AuthError | null }> | null = null;

export async function getSessionSingleFlight(): Promise<{
  data: { session: import('@supabase/supabase-js').Session | null };
  error: import('@supabase/supabase-js').AuthError | null;
}> {
  if (getSessionInflight) return getSessionInflight;

  const run = async (attempt: number): Promise<{ data: { session: import('@supabase/supabase-js').Session | null }; error: import('@supabase/supabase-js').AuthError | null }> => {
    try {
      const result = await supabase.auth.getSession();
      if (result.error && attempt < MAX_RETRIES && isLockTimeoutError(result.error)) {
        const delay = BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
        if (import.meta.env.DEV) console.warn(`[authSingleFlight] getSession lock timeout, retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        return run(attempt + 1);
      }
      return result;
    } catch (err) {
      if (attempt < MAX_RETRIES && isLockTimeoutError(err)) {
        const delay = BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
        if (import.meta.env.DEV) console.warn(`[authSingleFlight] getSession exception (lock?), retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        return run(attempt + 1);
      }
      throw err;
    }
  };

  getSessionInflight = run(0).finally(() => { getSessionInflight = null; });
  return getSessionInflight;
}

let getUserInflight: Promise<{ data: { user: import('@supabase/supabase-js').User | null }; error: import('@supabase/supabase-js').AuthError | null }> | null = null;

export async function getUserSingleFlight(): Promise<{
  data: { user: import('@supabase/supabase-js').User | null };
  error: import('@supabase/supabase-js').AuthError | null;
}> {
  if (getUserInflight) return getUserInflight;

  const run = async (attempt: number): Promise<{ data: { user: import('@supabase/supabase-js').User | null }; error: import('@supabase/supabase-js').AuthError | null }> => {
    try {
      const result = await supabase.auth.getUser();
      if (result.error && attempt < MAX_RETRIES && isLockTimeoutError(result.error)) {
        const delay = BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
        if (import.meta.env.DEV) console.warn(`[authSingleFlight] getUser lock timeout, retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        return run(attempt + 1);
      }
      return result;
    } catch (err) {
      if (attempt < MAX_RETRIES && isLockTimeoutError(err)) {
        const delay = BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
        if (import.meta.env.DEV) console.warn(`[authSingleFlight] getUser exception (lock?), retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        return run(attempt + 1);
      }
      throw err;
    }
  };

  getUserInflight = run(0).finally(() => { getUserInflight = null; });
  return getUserInflight;
}
