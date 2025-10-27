/*
 * M1SSION™ Service Worker Auto-Registration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { ensureSWAnyHost } from './sw-register-anyhost';

/**
 * Auto-register service worker on import
 * This ensures SW is ready BEFORE any push subscribe attempts
 */
(async () => {
  try {
    await ensureSWAnyHost();
  } catch (error) {
    console.warn('[SW-AUTORUN] Auto-registration failed (non-critical):', error);
  }
})();

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */
