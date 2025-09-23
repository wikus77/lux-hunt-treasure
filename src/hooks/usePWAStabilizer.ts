/*
 * M1SSION™ PWA Stabilizer Hook - Manages PWA lifecycle and push subscriptions
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { useEffect } from 'react';
import { runPWACleanupOnce } from '@/lib/pwa/cleanup';
import { registerPush } from '@/lib/push/register-push';
import { useAuth } from './use-auth';

/**
 * Stabilize PWA and handle push subscriptions
 * Note: SW updates now handled by silentAutoUpdate.ts
 */
export const usePWAStabilizer = () => {
  const { user } = useAuth();

  useEffect(() => {
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
            const result = await registerPush(user.id);
            if (result) {
              console.log('✅ PWA Stabilizer: Push subscription established:', result);
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

  // Note: SW updates are now handled by the silent auto-update system
};

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */