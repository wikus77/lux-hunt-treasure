// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Post-Login Redirect Helper (stable across PWA/iOS/Safari)

export const KEY = 'post_login_redirect';

export function consumePostLoginRedirect(): string | null {
  try {
    const target = localStorage.getItem(KEY);
    if (target) localStorage.removeItem(KEY);
    return target;
  } catch {
    return null;
  }
}

export function postLoginRedirectFixed(navigate: (path: string) => void) {
  // 🔥 FIX 16/01/2026: Redirect alla MAPPA invece che alla Home
  // Così le MicroMissions partono subito dopo il login
  const target = consumePostLoginRedirect() || '/map-3d-tiler';
  console.log('🚀 postLoginRedirectFixed →', target);
  try {
    navigate(target);
  } catch {
    window.location.href = target;
  }
}
