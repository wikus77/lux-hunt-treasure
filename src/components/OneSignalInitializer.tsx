// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA Push Notifications Fix - OneSignal Initializer

import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const ONESIGNAL_APP_ID = "50cb75f7-f065-4626-9a63-ce5692fa7e70";

// Global initialization state to prevent multiple initializations
let globalInitializationState = {
  isInitialized: false,
  isInitializing: false,
  initPromise: null as Promise<void> | null
};

export const OneSignalInitializer = () => {
  const { user } = useAuth();
  const initAttempted = useRef(false);
  const userRegistered = useRef(false);

  useEffect(() => {
    if (initAttempted.current) return;
    initAttempted.current = true;

    const initializeOneSignal = async () => {
      // Prevent multiple simultaneous initializations
      if (globalInitializationState.isInitializing && globalInitializationState.initPromise) {
        console.log('🔔 WAITING: OneSignal initialization already in progress...');
        await globalInitializationState.initPromise;
        return;
      }

      if (globalInitializationState.isInitialized) {
        console.log('🔔 ALREADY: OneSignal already initialized globally');
        return;
      }

      // Start initialization
      globalInitializationState.isInitializing = true;
      globalInitializationState.initPromise = performInitialization();
      
      try {
        await globalInitializationState.initPromise;
      } catch (error) {
        console.error('❌ CRITICAL: OneSignal initialization failed:', error);
        // Reset state on failure to allow retry
        globalInitializationState.isInitialized = false;
        globalInitializationState.isInitializing = false;
        globalInitializationState.initPromise = null;
      }
    };

    const performInitialization = async () => {
      try {
        console.log('🔔 CRITICAL iOS PWA: Starting OneSignal initialization...', {
          url: window.location.href,
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          userAgent: navigator.userAgent,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isPWA: window.navigator.standalone === true,
          serviceWorkerSupported: 'serviceWorker' in navigator,
          notificationSupported: 'Notification' in window
        });

        // Check if we're in a supported environment
        if (!('serviceWorker' in navigator)) {
          throw new Error('Service Workers not supported - required for push notifications');
        }

        if (!('Notification' in window)) {
          throw new Error('Notifications not supported in this browser');
        }

        // CRITICAL iOS PWA: Initialize OneSignal with Cloudflare optimized config
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
          safari_web_id: "web.onesignal.auto.50cb75f7-f065-4626-9a63-ce5692fa7e70",
          // iOS PWA specific settings for Cloudflare deployment
          autoResubscribe: true,
          persistNotification: true, // CRITICAL: Set to true for iOS PWA
          showCredit: false,
          // Enhanced notification settings for iOS Safari PWA
          notificationClickHandlerMatch: 'origin',
          notificationClickHandlerAction: 'focus',
          // CRITICAL: Cloudflare Pages specific settings  
          path: "/"
        });

        // Mark as successfully initialized
        globalInitializationState.isInitialized = true;
        globalInitializationState.isInitializing = false;
        
        console.log('✅ CRITICAL iOS PWA: OneSignal initialized successfully!');

        // Setup global debugging utils for iOS testing
        (window as any).M1SSIONOneSignalDebug = {
          async getPlayerId() {
            try {
              const id = await OneSignal.User.PushSubscription.id;
              console.log('🔍 DEBUG: Current Player ID:', id);
              return id;
            } catch (error) {
              console.error('🔍 DEBUG: Failed to get Player ID:', error);
              return null;
            }
          },
          async checkPermission() {
            try {
              const permission = await OneSignal.Notifications.permission;
              console.log('🔍 DEBUG: Current permission:', permission);
              return permission;
            } catch (error) {
              console.error('🔍 DEBUG: Failed to check permission:', error);
              return null;
            }
          },
          async forceRequestPermission() {
            try {
              console.log('🔍 DEBUG: Forcing permission request...');
              const result = await OneSignal.Notifications.requestPermission();
              console.log('🔍 DEBUG: Permission request result:', result);
              return result;
            } catch (error) {
              console.error('🔍 DEBUG: Permission request failed:', error);
              return false;
            }
          },
          async testNotification() {
            try {
              console.log('🔍 DEBUG: Testing local notification...');
              // This is just for debugging - in production we use the backend
              if ('serviceWorker' in navigator && 'PushManager' in window) {
                console.log('🔍 DEBUG: Push messaging supported');
              }
              return 'Debug notification attempted - check console';
            } catch (error) {
              console.error('🔍 DEBUG: Test notification failed:', error);
              return null;
            }
          }
        };

        // Log successful initialization for debugging
        await logToSupabase('onesignal_initialized', null, {
          userAgent: navigator.userAgent,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isPWA: window.navigator.standalone === true,
          hostname: window.location.hostname,
          protocol: window.location.protocol
        });

      } catch (error) {
        console.error('❌ CRITICAL iOS PWA: OneSignal initialization failed:', error);
        
        // Log initialization failure
        await logToSupabase('onesignal_init_failed', null, {
          error: error.message,
          userAgent: navigator.userAgent,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isPWA: window.navigator.standalone === true
        });
        
        throw error;
      }
    };

    initializeOneSignal();
  }, []);

  // Handle user registration for push notifications
  useEffect(() => {
    if (user && globalInitializationState.isInitialized && !userRegistered.current) {
      userRegistered.current = true;
      registerUserForPushNotifications(user.id);
    }
  }, [user]);

  return null; // This is a utility component, renders nothing
};

// CRITICAL iOS PWA: Enhanced user registration function
const registerUserForPushNotifications = async (userId: string) => {
  try {
    console.log('🔔 CRITICAL iOS PWA: Registering user for push notifications:', userId);

    // Wait for OneSignal to be ready
    if (!globalInitializationState.isInitialized) {
      console.log('🔔 WAITING: OneSignal not ready yet, waiting...');
      // Wait up to 10 seconds for initialization
      let attempts = 0;
      while (!globalInitializationState.isInitialized && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      if (!globalInitializationState.isInitialized) {
        throw new Error('OneSignal initialization timeout');
      }
    }

    // Check current permission status with enhanced iOS handling
    let permission;
    try {
      permission = await OneSignal.Notifications.permission;
      console.log('🔔 iOS PWA: Current notification permission:', permission);
    } catch (error) {
      console.error('🔔 iOS PWA: Failed to check permission:', error);
      permission = false;
    }

    // iOS PWA specific permission handling
    if (permission === false) {
      console.log('🔔 iOS PWA: Push notifications permission denied');
      toast.error('❌ Notifiche push bloccate. Abilita nelle impostazioni Safari.');
      
      await logToSupabase('push_permission_denied', userId, {
        reason: 'user_denied',
        userAgent: navigator.userAgent,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
      });
      return;
    }

    // Request permission if not granted - CRITICAL for iOS PWA
    if (permission !== true) {
      console.log('🔔 iOS PWA: Requesting notification permission...');
      
      try {
        // iOS requires explicit user interaction for permission request
        const permissionResult = await OneSignal.Notifications.requestPermission();
        console.log('🔔 iOS PWA: Permission request result:', permissionResult);
        
        // Check permission again after request
        const newPermission = await OneSignal.Notifications.permission;
        console.log('🔔 iOS PWA: New permission status:', newPermission);
        
        if (newPermission !== true) {
          console.log('🔔 iOS PWA: Permission denied by user after request');
          toast.error('❌ Notifiche rifiutate. Puoi abilitarle nelle impostazioni Safari.');
          
          await logToSupabase('push_permission_denied_after_request', userId, {
            requestResult: permissionResult,
            finalPermission: newPermission,
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
          });
          return;
        }
      } catch (permError) {
        console.error('🔔 iOS PWA: Permission request failed:', permError);
        toast.error('❌ Errore nella richiesta permessi notifiche');
        
        await logToSupabase('push_permission_request_error', userId, {
          error: permError.message,
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
        });
        return;
      }
    }

    // CRITICAL: Get the OneSignal Player ID with enhanced error handling
    let playerId;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!playerId && attempts < maxAttempts) {
      try {
        playerId = await OneSignal.User.PushSubscription.id;
        if (playerId) {
          console.log('🔔 CRITICAL iOS PWA: OneSignal Player ID obtained:', playerId);
          break;
        }
      } catch (error) {
        console.error(`🔔 iOS PWA: Attempt ${attempts + 1} to get Player ID failed:`, error);
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`🔔 iOS PWA: Retrying to get Player ID (attempt ${attempts + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!playerId) {
      console.error('🔔 CRITICAL iOS PWA: No OneSignal Player ID received after all attempts');
      toast.error('❌ Errore nella registrazione delle notifiche push (iOS)');
      
      await logToSupabase('push_player_id_failed', userId, {
        attempts: maxAttempts,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        userAgent: navigator.userAgent
      });
      return;
    }

    // Set external user ID and tags for better targeting
    try {
      await OneSignal.User.addAlias('external_id', userId);
      console.log('🔔 CRITICAL iOS PWA: External ID set for user:', userId);
      
      // Enhanced tags for M1SSION™ notifications
      await OneSignal.User.addTag('marker_discovery_enabled', 'true');
      await OneSignal.User.addTag('user_type', 'm1ssion_player');
      await OneSignal.User.addTag('platform', /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios_pwa' : 'web_pwa');
      await OneSignal.User.addTag('registration_date', new Date().toISOString().split('T')[0]);
      
      console.log('🔔 CRITICAL iOS PWA: OneSignal tags set successfully');
    } catch (aliasError) {
      console.warn('🔔 WARNING iOS PWA: Failed to set external ID or tags:', aliasError);
    }

    // CRITICAL: Save to Supabase device_tokens table with enhanced conflict resolution
    console.log('🔐 CRITICAL iOS PWA: Saving OneSignal Player ID to database...');
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
      console.error('❌ CRITICAL iOS PWA: Error saving OneSignal Player ID:', error);
      toast.error('❌ Errore nel salvataggio token notifiche');
      
      await logToSupabase('push_token_save_error', userId, {
        error: error.message,
        playerId: playerId,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
      });
    } else {
      console.log('✅ CRITICAL iOS PWA: OneSignal Player ID saved successfully:', playerId);
      toast.success('✅ Notifiche push attivate per iOS!', {
        description: 'Riceverai aggiornamenti su missioni e premi',
        duration: 5000
      });
      
      await logToSupabase('push_token_registered_success', userId, {
        playerId: playerId,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isPWA: window.navigator.standalone === true,
        userAgent: navigator.userAgent
      });
    }

  } catch (error) {
    console.error('❌ CRITICAL iOS PWA: Push registration failed:', error);
    toast.error('❌ Errore nell\'attivazione delle notifiche push iOS');
    
    await logToSupabase('push_registration_critical_error', userId, {
      error: error.message,
      stack: error.stack,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    });
  }
};

// Enhanced logging function for debugging
const logToSupabase = async (eventType: string, userId: string | null, details: any) => {
  try {
    await supabase
      .from('admin_logs')
      .insert({
        event_type: eventType,
        user_id: userId,
        note: `iOS PWA OneSignal: ${eventType}`,
        context: 'ios_pwa_push_notifications',
        details: details
      });
  } catch (error) {
    console.error('Failed to log to Supabase:', error);
  }
};

export { registerUserForPushNotifications };