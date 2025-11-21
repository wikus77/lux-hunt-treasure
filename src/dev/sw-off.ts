// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
if (typeof window !== 'undefined') {
  const disable = import.meta.env.VITE_DISABLE_SW === '1' || location.hostname === 'localhost';
  if (disable && 'serviceWorker' in navigator) {
    // Unregister all SW and wipe caches
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    // Best-effort cache wipe
    try {
      // @ts-ignore
      caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));
    } catch {}
    // Prevent future registrations
    // @ts-ignore
    navigator.serviceWorker.register = (() => Promise.resolve({})) as any;
    console.info('🧹 SW disabled for DEV and caches cleared');
  }
}
