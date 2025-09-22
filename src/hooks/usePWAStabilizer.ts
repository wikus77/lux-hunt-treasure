/*
 * M1SSION™ PWA Stabilizer Hook - Prevents Reload Loops
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { useEffect } from 'react';
import { runPWACleanupOnce } from '@/lib/pwa/cleanup';
import { initializePWARegistration } from '@/lib/pwa/registerSW';
import { ensureWebPushSubscription } from '@/lib/push/subscribe';
import { useAuth } from './use-auth';

/**
 * Stabilize PWA and handle push subscriptions without reload loops
 * Runs cleanup once per version and manages service worker registration
 */
export const usePWAStabilizer = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('🚀 PWA Stabilizer: Initializing...');

    const initializePWA = async () => {
      try {
        // 1. Run cleanup once per version (prevents reload loops)
        await runPWACleanupOnce();

        // 2. Initialize PWA registration with controlled updates
        await initializePWARegistration();
        console.log('✅ PWA Stabilizer: Registration initialized');

        // 3. Handle push subscription if user is authenticated
        if (user && Notification.permission === 'granted') {
          console.log('🔔 PWA Stabilizer: Setting up push subscription...');
          
          try {
            const subscription = await ensureWebPushSubscription();
            if (subscription) {
              console.log('✅ PWA Stabilizer: Push subscription established');
            }
          } catch (error) {
            console.error('❌ PWA Stabilizer: Push subscription failed:', error);
          }
        }

        console.log('✅ PWA Stabilizer: Initialization complete');
      } catch (error) {
        console.error('❌ PWA Stabilizer: Initialization failed:', error);
      }
    };

    initializePWA();
  }, [user]);

  // No additional SW update listeners needed - handled by registerSW
};

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */