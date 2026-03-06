/*
 * M1SSION™ PWA Stabilizer Hook - Manages PWA lifecycle and push subscriptions
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { useEffect } from 'react';
import { runPWACleanupOnce } from '@/lib/pwa/cleanup';
import { registerPush } from '@/lib/push/register-push';
import { useAuth } from './use-auth';

/** True when running inside Capacitor (iOS/Android native). PWA/Service Worker not used there. */
function isCapacitorNative(): boolean {
  const cap = (typeof window !== 'undefined' && (window as any).Capacitor);
  return !!(cap?.isNativePlatform?.());
}

/**
 * Stabilize PWA and handle push subscriptions
 * Note: SW updates now handled by silentAutoUpdate.ts
 * On Capacitor native, skips init (no SW) to avoid console errors.
 */
export const usePWAStabilizer = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (isCapacitorNative()) {
      return;
    }

    console.log('🚀 PWA Stabilizer: Initializing...');

    const initializePWA = async () => {
      try {
        // 1. Run cleanup once per version (prevents reload loops)
        await runPWACleanupOnce();
        console.log('✅ PWA Stabilizer: Cleanup completed');

        // 2. Basic SW registration (silent update system handles updates)
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none'
            });
            console.log('✅ PWA Stabilizer: SW registration completed');
          } catch (swError) {
            console.warn('⚠️ PWA Stabilizer: SW registration failed (non-critical):', swError);
          }
        }

        // 3. Handle push subscription if user is authenticated
        if (user && Notification.permission === 'granted') {
          console.log('🔔 PWA Stabilizer: Setting up push subscription...');
          
          try {
            const reg = await navigator.serviceWorker.ready;
            const result = await registerPush(reg);
            if (result) {
              console.log('✅ PWA Stabilizer: Push subscription established:', result);
            }
          } catch (error) {
            console.warn('⚠️ PWA Stabilizer: Push subscription failed:', error);
          }
        }

        console.log('✅ PWA Stabilizer: Initialization complete');
      } catch (error) {
        console.warn('⚠️ PWA Stabilizer: Initialization failed (non-critical):', error);
      }
    };

    initializePWA();
  }, [user]);

  // Note: SW updates are now handled by the silent auto-update system
};

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */