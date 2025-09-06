/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Hook - React Integration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/push/vapid';
import { subscribeWebPushAndSave, looksLikeWebPushEndpoint, WebPushSubscriptionPayload } from '@/lib/push/webpush';
import { UnifiedSubscription, detectPlatform } from '@/lib/push/types';
import { toast } from 'sonner';

interface UnifiedPushState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  subscription: PushSubscription | null;
  webPushSubscription: WebPushSubscriptionPayload | null;
  subscriptionType: 'fcm' | 'webpush' | null;
  canSubscribe: boolean;
}

export const useUnifiedPush = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UnifiedPushState>({
    isSupported: false,
    isSubscribed: false,
    permission: null,
    isLoading: false,
    error: null,
    token: null,
    subscription: null,
    webPushSubscription: null,
    subscriptionType: null,
    canSubscribe: false,
  });

  // Initialize push support detection
  useEffect(() => {
    console.log('🔧 [useUnifiedPush] Initializing...');
    
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const permission = 'Notification' in window ? Notification.permission : null;
    const canSubscribe = isSupported && permission === 'granted' && !!user;
    
    console.log('🔧 [useUnifiedPush] Support check:', {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      isSupported,
      permission,
      canSubscribe
    });
    
      setState(prev => ({
        ...prev,
        isSupported,
        permission,
        canSubscribe,
      }));
  }, [user]);

  // Request permission function
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('❌ Push notifications not supported');
      toast.error('Push notifications non supportate');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission, canSubscribe: permission === 'granted' && !!user }));
      
      if (permission === 'granted') {
        toast.success('✅ Permessi concessi!');
      } else {
        toast.error('❌ Permessi negati');
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Permission request failed';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      toast.error(`Errore: ${errorMessage}`);
      return false;
    }
  }, [state.isSupported, user]);

  const enableUnifiedPush = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔄 [UNIFIED-PUSH] Starting unified subscription process...');

    try {
      const vapidKey = VAPID_PUBLIC_KEY;
      const platform = detectPlatform();
      console.log('🔑 [UNIFIED-PUSH] VAPID key loaded:', vapidKey.slice(0, 20) + '...');
      console.log('📱 [UNIFIED-PUSH] Platform detected:', platform);

      // Check permission first
      if (Notification.permission !== 'granted') {
        console.log('🔧 [UNIFIED-PUSH] Permission not granted, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permission not granted');
        }
      }

      // Get service worker ready
      const swReg = await navigator.serviceWorker.ready;
      console.log('🛠️ [UNIFIED-PUSH] Service Worker ready');

      let unifiedSub: UnifiedSubscription;

      // iOS PWA or Safari always uses Web Push
      if (platform.isIOS || (platform.platform === 'web' && platform.isPWA) || platform.isSafari) {
        console.log('🍎 [UNIFIED-PUSH] Using Web Push for iOS/Safari/PWA');
        
        try {
          const applicationServerKey = urlBase64ToUint8Array(vapidKey);
          const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });

          const keys = subscription.toJSON().keys;
          if (!keys?.p256dh || !keys?.auth) {
            throw new Error('Invalid subscription keys');
          }

          unifiedSub = {
            kind: 'WEBPUSH',
            endpoint: subscription.endpoint,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth
            },
            platform: platform.platform
          };

          // Save to database
          await supabase.functions.invoke('webpush-upsert', {
            body: {
              user_id: user.id,
              subscription: unifiedSub
            }
          });

        } catch (error) {
          if (error instanceof TypeError && error.message.includes('applicationServerKey')) {
            throw new Error('VAPID key invalida: verifica conversione base64url→Uint8Array');
          }
          throw error;
        }
      } else {
        // Desktop/Android can try FCM first, fallback to Web Push
        let fcmSucceeded = false;
        
        try {
          // Try FCM if available
          const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
          const fcmSupported = await isSupported();
          
          if (fcmSupported && window.firebase) {
            console.log('🔥 [UNIFIED-PUSH] Attempting FCM...');
            const messaging = getMessaging();
            const token = await getToken(messaging, { 
              vapidKey: vapidKey,
              serviceWorkerRegistration: swReg 
            });

            if (token && !looksLikeWebPushEndpoint(token)) {
              unifiedSub = {
                kind: 'FCM',
                token,
                platform: platform.platform as 'android' | 'web'
              };

              // Save FCM token
              const { error } = await supabase.rpc('upsert_fcm_subscription', {
                p_user_id: user.id,
                p_token: token,
                p_platform: platform.platform,
                p_device_info: { type: 'fcm', platform: platform.platform }
              });

              if (error) throw error;
              fcmSucceeded = true;
              console.log('✅ [UNIFIED-PUSH] FCM subscription successful');
            }
          }
        } catch (fcmError) {
          console.warn('⚠️ [UNIFIED-PUSH] FCM failed, falling back to Web Push:', fcmError);
        }

        // Fallback to Web Push if FCM failed
        if (!fcmSucceeded) {
          console.log('🌐 [UNIFIED-PUSH] Using Web Push fallback');
          const webPushResult = await subscribeWebPushAndSave({
            userId: user.id,
            swReg,
            vapidPublicKey: vapidKey,
            platform: platform.platform
          });

          unifiedSub = {
            kind: 'WEBPUSH',
            endpoint: webPushResult.subscription.endpoint,
            keys: webPushResult.subscription.keys,
            platform: platform.platform
          };
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        webPushSubscription: unifiedSub.kind === 'WEBPUSH' ? unifiedSub : null,
        token: unifiedSub.kind === 'FCM' ? unifiedSub.token : null,
        subscriptionType: unifiedSub.kind.toLowerCase() as 'fcm' | 'webpush',
        isLoading: false
      }));

      console.log('✅ [UNIFIED-PUSH] Subscription successful:', unifiedSub.kind);
      toast.success(`🔔 Notifiche ${unifiedSub.kind} attivate!`);

    } catch (error) {
      console.error('❌ [UNIFIED-PUSH] Subscription failed:', error);
      
      let errorMessage = 'Subscription failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      
      toast.error(`Errore: ${errorMessage}`);
      throw error;
    }
  };

  // Keep backward compatibility
  const subscribe = enableUnifiedPush;

  // Unsubscribe function
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Clear both types of subscriptions
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          console.log('🗑️ Browser subscription removed');
        }
      }
      
      setState(prev => ({
        ...prev,
        token: null,
        subscription: null,
        webPushSubscription: null,
        subscriptionType: null,
        isSubscribed: false,
        isLoading: false,
        error: null
      }));

      toast.success('🔕 Notifiche push disattivate');
      return true;
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unsubscribe failed';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      toast.error(`Errore: ${errorMessage}`);
      return false;
    }
  }, []);

  // Check status function
  const checkStatus = useCallback(async () => {
    console.log('🔍 [UNIFIED-PUSH] Checking current status...');
    // This would check existing subscriptions in the database
    // Implementation depends on your specific needs
  }, []);

  return {
    ...state,
    subscribe,
    requestPermission,
    unsubscribe,
    checkStatus,
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */
