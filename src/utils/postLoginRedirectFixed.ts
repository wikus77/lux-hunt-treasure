// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Post-Login Redirect Helper (stable across PWA/iOS/Safari)

export const KEY = 'post_login_redirect';
/** Set after first post-login intro is completed; ensures intro shows once per install. */
export const KEY_FIRST_LOGIN_DONE = 'm1_first_login_done';

export function consumePostLoginRedirect(): string | null {
  try {
    const target = localStorage.getItem(KEY);
    if (target) localStorage.removeItem(KEY);
    return target;
  } catch {
    return null;
  }
}

/** True if user has already completed the post-login intro (mission-intro) once. */
export function isFirstLoginDone(): boolean {
  try {
    return localStorage.getItem(KEY_FIRST_LOGIN_DONE) === 'true';
  } catch {
    return false;
  }
}

export function postLoginRedirectFixed(navigate: (path: string) => void) {
  // 🔧 iPad intro fix: first login after install → show mission-intro, then home/map
  if (!isFirstLoginDone()) {
    console.log('🚀 postLoginRedirectFixed → /mission-intro (first login)');
    try {
      navigate('/mission-intro');
    } catch {
      window.location.href = '/mission-intro';
    }
    return;
  }
  // 🔥 FIX 16/01/2026: Redirect alla MAPPA invece che alla Home
  const target = consumePostLoginRedirect() || '/map-3d-tiler';
  console.log('🚀 postLoginRedirectFixed →', target);
  try {
    navigate(target);
  } catch {
    window.location.href = target;
  }
}
