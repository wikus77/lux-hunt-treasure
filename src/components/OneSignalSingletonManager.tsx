// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA OneSignal Singleton Manager - Final Solution

import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const ONESIGNAL_APP_ID = "50cb75f7-f065-4626-9a63-ce5692fa7e70";

// Global singleton state - prevents multiple initializations across all components
const OneSignalSingleton = {
  isInitialized: false,
  isInitializing: false,
  initPromise: null as Promise<void> | null,
  initAttempts: 0,
  maxAttempts: 3,
  
  // Reset state for development hot reload
  reset() {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initPromise = null;
    this.initAttempts = 0;
    delete (window as any).OneSignalInitialized;
    delete (window as any).M1SSIONOneSignalDebug;
  }
};

// iOS Safari PWA detection utilities
const iOSUtils = {
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  isPWA: () => window.navigator.standalone === true,
  isSafariIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent),
  shouldUseSlidedown: () => iOSUtils.isPWA() && iOSUtils.isSafariIOS()
};

export const OneSignalSingletonManager = () => {
  const { user } = useAuth();
  const componentInitialized = useRef(false);
  const permissionRequested = useRef(false);

  const initializeOneSignal = async (): Promise<void> => {
    // Prevent component re-initialization
    if (componentInitialized.current) return;
    componentInitialized.current = true;

    // Check if already initializing or initialized
    if (OneSignalSingleton.isInitializing && OneSignalSingleton.initPromise) {
      console.debug('🔔 M1SSION™: OneSignal initialization in progress, waiting...');
      await OneSignalSingleton.initPromise;
      return;
    }

    if (OneSignalSingleton.isInitialized || (window as any).OneSignalInitialized) {
      console.debug('🔔 M1SSION™: OneSignal already initialized, skipping');
      return;
    }

    // Prevent multiple attempts
    if (OneSignalSingleton.initAttempts >= OneSignalSingleton.maxAttempts) {
      console.error('❌ M1SSION™: OneSignal max initialization attempts reached');
      return;
    }

    OneSignalSingleton.isInitializing = true;
    OneSignalSingleton.initAttempts++;
    OneSignalSingleton.initPromise = performInitialization();

    try {
      await OneSignalSingleton.initPromise;
    } catch (error) {
      console.error('❌ M1SSION™: OneSignal initialization failed:', error);
      OneSignalSingleton.isInitialized = false;
      OneSignalSingleton.isInitializing = false;
      OneSignalSingleton.initPromise = null;
      throw error;
    }
  };

  const performInitialization = async (): Promise<void> => {
    try {
      const env = {
        isIOS: iOSUtils.isIOS(),
        isPWA: iOSUtils.isPWA(),
        isSafariIOS: iOSUtils.isSafariIOS(),
        hostname: window.location.hostname,
        protocol: window.location.protocol
      };

      console.log('🔔 M1SSION™: Starting OneSignal initialization', env);

      // Validate environment
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers not supported');
      }

      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      // Initialize OneSignal with iOS PWA optimizations
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
        safari_web_id: "web.onesignal.auto.50cb75f7-f065-4626-9a63-ce5692fa7e70",
        // iOS PWA specific settings
        autoResubscribe: true,
        persistNotification: true,
        showCredit: false,
        notificationClickHandlerMatch: 'origin',
        notificationClickHandlerAction: 'focus'
      });

      // Mark as initialized
      OneSignalSingleton.isInitialized = true;
      OneSignalSingleton.isInitializing = false;
      (window as any).OneSignalInitialized = true;

      console.log('✅ M1SSION™: OneSignal singleton initialized successfully');

      // Setup debug utilities
      (window as any).M1SSIONOneSignalDebug = {
        async getPlayerId() {
          try {
            return await OneSignal.User.PushSubscription.id;
          } catch (error) {
            console.error('Error getting Player ID:', error);
            return null;
          }
        },
        async checkPermission() {
          try {
            return await OneSignal.Notifications.permission;
          } catch (error) {
            console.error('Error checking permission:', error);
            return null;
          }
        },
        async forceRequestPermission() {
          return await requestIOSPermissions();
        },
        resetSingleton() {
          OneSignalSingleton.reset();
          componentInitialized.current = false;
          permissionRequested.current = false;
        }
      };

      // Log successful initialization
      await logToSupabase('onesignal_singleton_initialized', null, {
        environment: env,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ M1SSION™: OneSignal initialization error:', error);
      await logToSupabase('onesignal_singleton_init_failed', null, {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const requestIOSPermissions = async (): Promise<boolean> => {
    if (permissionRequested.current) {
      console.debug('🔔 M1SSION™: Permission already requested, skipping');
      return false;
    }

    if (!OneSignalSingleton.isInitialized) {
      console.log('🔔 M1SSION™: OneSignal not ready for permission request');
      return false;
    }

    try {
      permissionRequested.current = true;
      console.log('🔔 M1SSION™: Requesting iOS PWA permissions...');

      // iOS PWA specific permission flow
      if (iOSUtils.shouldUseSlidedown()) {
        console.log('🔔 M1SSION™: Using iOS PWA slidedown prompt');
        
        // Use slidedown for iOS PWA
        try {
          await OneSignal.Slidedown.promptPush();
          console.log('✅ M1SSION™: iOS slidedown prompt shown');
        } catch (slidedownError) {
          console.warn('⚠️ M1SSION™: Slidedown failed, falling back to direct permission');
          await OneSignal.Notifications.requestPermission();
        }
      } else {
        // Standard permission request
        await OneSignal.Notifications.requestPermission();
      }

      // Check permission result
      const permission = await OneSignal.Notifications.permission;
      const isOptedIn = await OneSignal.User.PushSubscription.optedIn;

      console.log('🔔 M1SSION™: Permission result:', { permission, isOptedIn });

      if (permission && isOptedIn) {
        toast.success('✅ Notifiche push attivate!', {
          description: 'Riceverai aggiornamenti per M1SSION™'
        });
        return true;
      } else {
        toast.error('❌ Permessi notifiche negati', {
          description: 'Puoi abilitarli nelle impostazioni Safari'
        });
        return false;
      }

    } catch (error) {
      console.error('❌ M1SSION™: Permission request error:', error);
      toast.error('❌ Errore richiesta permessi notifiche');
      return false;
    }
  };

  const registerUserToken = async (userId: string): Promise<void> => {
    try {
      console.log('🔔 M1SSION™: Registering user token for:', userId);

      // Wait for OneSignal to be ready
      if (!OneSignalSingleton.isInitialized) {
        console.log('🔔 M1SSION™: Waiting for OneSignal to be ready...');
        let attempts = 0;
        while (!OneSignalSingleton.isInitialized && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        
        if (!OneSignalSingleton.isInitialized) {
          throw new Error('OneSignal initialization timeout');
        }
      }

      // Check if user is opted in
      const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
      if (!isOptedIn) {
        console.log('🔔 M1SSION™: User not opted in, requesting permissions...');
        const permissionGranted = await requestIOSPermissions();
        if (!permissionGranted) {
          return;
        }
      }

      // Get Player ID with retry logic
      let playerId = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!playerId && attempts < maxAttempts) {
        try {
          playerId = await OneSignal.User.PushSubscription.id;
          if (playerId && playerId !== 'undefined' && playerId.length > 10) {
            break;
          }
        } catch (error) {
          console.error(`🔔 M1SSION™: Player ID attempt ${attempts + 1} failed:`, error);
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!playerId) {
        throw new Error('Failed to obtain OneSignal Player ID');
      }

      console.log('🔔 M1SSION™: Player ID obtained:', playerId.substring(0, 20) + '...');

      // Set user alias and tags
      try {
        await OneSignal.User.addAlias('external_id', userId);
        await OneSignal.User.addTag('user_type', 'm1ssion_player');
        await OneSignal.User.addTag('platform', iOSUtils.isIOS() ? 'ios_pwa' : 'web_pwa');
        await OneSignal.User.addTag('singleton_version', '2.0');
        console.log('✅ M1SSION™: User configuration complete');
      } catch (configError) {
        console.warn('⚠️ M1SSION™: User configuration warning:', configError);
      }

      // Save to Supabase with enhanced error handling
      console.log('🔐 M1SSION™: Saving token to Supabase...');
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          token: playerId,
          device_type: 'onesignal',
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_type'
        });

      if (error) {
        console.error('❌ M1SSION™: Database save error:', error);
        throw error;
      }

      console.log('✅ M1SSION™: Token saved successfully');
      toast.success('✅ Token push registrato!');

      // Log success
      await logToSupabase('push_token_registered_singleton', userId, {
        playerId: playerId.substring(0, 20) + '...',
        platform: iOSUtils.isIOS() ? 'ios_pwa' : 'web_pwa',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ M1SSION™: Token registration error:', error);
      await logToSupabase('push_token_registration_error', userId, {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const logToSupabase = async (eventType: string, userId: string | null, details: any) => {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          event_type: eventType,
          user_id: userId,
          note: `M1SSION™ OneSignal Singleton: ${eventType}`,
          context: 'onesignal_singleton',
          details: details
        });
    } catch (error) {
      console.debug('Failed to log to Supabase:', error);
    }
  };

  // Initialize OneSignal on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeOneSignal().catch(error => {
        console.error('❌ M1SSION™: Initialization failed:', error);
      });
    }, 200); // Small delay to ensure DOM readiness

    return () => clearTimeout(timer);
  }, []);

  // Handle user registration when user is available
  useEffect(() => {
    if (user && OneSignalSingleton.isInitialized) {
      const timer = setTimeout(() => {
        registerUserToken(user.id).catch(error => {
          console.error('❌ M1SSION™: User registration failed:', error);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  return null; // This component renders nothing
};