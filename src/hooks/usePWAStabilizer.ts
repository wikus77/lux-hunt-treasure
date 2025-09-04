/*
 * M1SSION™ PWA Stabilizer Hook - Prevents Reload Loops
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { useEffect } from 'react';
import { runPWACleanupOnce } from '@/lib/pwa/cleanup';
import { registerServiceWorker } from '@/lib/pwa/serviceWorker';
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

        // 2. Register service worker cleanly
        const registration = await registerServiceWorker();
        
        if (registration) {
          console.log('✅ PWA Stabilizer: Service worker registered');
        }

        // 3. Handle push subscription if user is authenticated
        if (user && Notification.permission === 'granted') {
          const PUSH_KEY = 'm1_push_bound';
          
          // Only subscribe once per session to prevent loops
          if (!localStorage.getItem(PUSH_KEY)) {
            console.log('🔔 PWA Stabilizer: Setting up push subscription...');
            
            try {
              const subscription = await ensureWebPushSubscription();
              if (subscription) {
                localStorage.setItem(PUSH_KEY, '1');
                console.log('✅ PWA Stabilizer: Push subscription established');
              }
            } catch (error) {
              console.error('❌ PWA Stabilizer: Push subscription failed:', error);
            }
          }
        }

        console.log('✅ PWA Stabilizer: Initialization complete');
      } catch (error) {
        console.error('❌ PWA Stabilizer: Initialization failed:', error);
      }
    };

    initializePWA();
  }, [user]);

  // Listen for SW updates
  useEffect(() => {
    const handleSWUpdate = (event: CustomEvent) => {
      console.log('🔄 PWA Stabilizer: Service worker update available');
      
      // Show update notification (optional)
      if (window.confirm('New version available. Update now?')) {
        window.location.reload();
      }
    };

    window.addEventListener('sw-update-available', handleSWUpdate as EventListener);
    
    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate as EventListener);
    };
  }, []);
};

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */