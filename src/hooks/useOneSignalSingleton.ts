// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Singleton hook to prevent multiple OneSignal initializations
import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = "50cb75f7-f065-4626-9a63-ce5692fa7e70";

// Global state to track initialization
let isInitializing = false;
let isInitialized = false;

export const useOneSignalSingleton = () => {
  const initAttempted = useRef(false);

  useEffect(() => {
    // Only run once per app lifecycle
    if (initAttempted.current || isInitializing || isInitialized) {
      return;
    }

    initAttempted.current = true;
    isInitializing = true;

    const initializeOneSignal = async () => {
      try {
        console.log('🔔 M1QR-TRACE: OneSignal singleton initialization started');

        // Check if already initialized by previous attempt
        if ((window as any).OneSignalInitialized) {
          console.log('🔔 OneSignal already initialized by previous instance');
          isInitialized = true;
          isInitializing = false;
          return;
        }

        // Initialize OneSignal
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
          safari_web_id: "web.onesignal.auto.50cb75f7-f065-4626-9a63-ce5692fa7e70",
        });

        // Mark as initialized globally
        (window as any).OneSignalInitialized = true;
        isInitialized = true;
        
        console.log('✅ M1QR-TRACE: OneSignal singleton initialized successfully');

        // Expose utils for debugging
        (window as any).OneSignalUtils = {
          async getPlayerId() {
            return await OneSignal.User.PushSubscription.id;
          },
          async isSubscribed() {
            const id = await OneSignal.User.PushSubscription.id;
            return !!id;
          },
          async requestPermission() {
            return await OneSignal.Notifications.requestPermission();
          },
          async sendTag(key: string, value: string) {
            return await OneSignal.User.addTag(key, value);
          }
        };

      } catch (error) {
        console.error('❌ OneSignal singleton initialization failed:', error);
        
        // Reset state on error to allow retry
        isInitialized = false;
        (window as any).OneSignalInitialized = false;
      } finally {
        isInitializing = false;
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeOneSignal, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    isInitialized,
    isInitializing
  };
};