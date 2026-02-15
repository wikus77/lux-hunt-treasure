// IPHONE-REGRESSION-FORENSIC: Sanitized auth/route logging for iPhone regression diagnosis
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NO token/email logging - only PRESENT/ABSENT + lengths

const PREFIX = '[AUTH-FORENSIC]';

function getStorageSnapshot(): Record<string, { present: boolean; len?: number }> {
  const out: Record<string, { present: boolean; len?: number }> = {};
  try {
    // sb-*-auth-token (Supabase)
    const sbKeys = Object.keys(localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    out['sb-*-auth-token'] = sbKeys.length
      ? { present: true, len: localStorage.getItem(sbKeys[0])?.length ?? 0 }
      : { present: false };
    // m1ssion_session_cache
    const cache = localStorage.getItem('m1ssion_session_cache');
    out['m1ssion_session_cache'] = cache ? { present: true, len: cache.length } : { present: false };
    // m1_just_signed_in_at (sessionStorage)
    const justSigned = sessionStorage.getItem('m1_just_signed_in_at');
    out['m1_just_signed_in_at'] = justSigned ? { present: true, len: justSigned.length } : { present: false };
  } catch {
    out['error'] = { present: true };
  }
  return out;
}

export function logAuthForensic(
  event: string,
  payload: {
    isLoading?: boolean;
    authHydrated?: boolean;
    isAuthenticated?: boolean;
    justSignedInAt?: number | null;
    currentRoute?: string;
    reason?: string;
    deltaMs?: number;
  }
): void {
  if (typeof window === 'undefined') return;
  const storage = getStorageSnapshot();
  const line = `${PREFIX} ${event} | isLoading=${payload.isLoading ?? '?'} authHydrated=${payload.authHydrated ?? '?'} isAuthenticated=${payload.isAuthenticated ?? '?'} justSignedInAt=${payload.justSignedInAt ?? 'null'} route=${payload.currentRoute ?? window?.location?.pathname ?? '?'} | storage=${JSON.stringify(storage)}${payload.reason ? ` | reason=${payload.reason}` : ''}${payload.deltaMs != null ? ` deltaMs=${payload.deltaMs}` : ''}`;
  console.log(line);
}

export function logForensicTimeline(
  event: 'T0_launch' | 'T1_login_submit' | 'T2_SIGNED_IN' | 'T3_route_change' | 'T4_redirect_or_loading',
  state?: { isLoading?: boolean; authHydrated?: boolean; isAuthenticated?: boolean; justSignedInAt?: number | null }
): void {
  logAuthForensic(event, {
    ...state,
    currentRoute: typeof window !== 'undefined' ? window.location.pathname : undefined
  });
}
