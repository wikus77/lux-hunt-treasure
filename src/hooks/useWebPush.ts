// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* React Hook for Web Push Notifications */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushTestOptions {
  endpoint?: string;
  user_id?: string;
  title?: string;
  body?: string;
  url?: string;
}

export interface UseWebPushResult {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  ensureServiceWorker: () => Promise<ServiceWorkerRegistration>;
  subscribe: (vapidPublicKey: string) => Promise<WebPushSubscription>;
  saveSubscription: (subscription: WebPushSubscription, extra?: Record<string, any>) => Promise<any>;
  testPush: (options: PushTestOptions) => Promise<any>;
  requestPermission: () => Promise<NotificationPermission>;
  checkSubscription: () => Promise<WebPushSubscription | null>;
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush(): UseWebPushResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window;

  const ensureServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration> => {
    console.log('[useWebPush] Ensuring service worker...');
    
    if (!isSupported) {
      throw new Error('Service Worker o Push Manager non supportati');
    }

    // Register service worker if not already registered
    let registration = await navigator.serviceWorker.getRegistration('/');
    
    if (!registration) {
      console.log('[useWebPush] Registering new service worker...');
      registration = await navigator.serviceWorker.register('/sw.js', { 
        scope: '/' 
      });
      console.log('[useWebPush] Service worker registered:', registration.scope);
    }

    // Wait for service worker to be ready
    const readyRegistration = await navigator.serviceWorker.ready;
    console.log('[useWebPush] Service worker ready');
    
    return readyRegistration;
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    console.log('[useWebPush] Requesting notification permission...');
    
    if (!isSupported) {
      throw new Error('Notifiche non supportate in questo browser');
    }

    const result = await Notification.requestPermission();
    console.log('[useWebPush] Permission result:', result);
    setPermission(result);
    
    if (result !== 'granted') {
      throw new Error('Permesso per le notifiche negato');
    }
    
    return result;
  }, [isSupported]);

  const subscribe = useCallback(async (vapidPublicKey: string): Promise<WebPushSubscription> => {
    console.log('[useWebPush] Subscribing to push notifications...');
    setIsLoading(true);

    try {
      // Ensure permission is granted
      if (permission !== 'granted') {
        await requestPermission();
      }

      // Get service worker registration
      const registration = await ensureServiceWorker();

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('[useWebPush] Already subscribed, using existing subscription');
        const subscriptionData = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(existingSubscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(existingSubscription.getKey('auth')!)))
          }
        };
        setIsSubscribed(true);
        return subscriptionData;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
      });

      console.log('[useWebPush] Push subscription created:', subscription.endpoint);

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      setIsSubscribed(true);
      return subscriptionData;

    } catch (error) {
      console.error('[useWebPush] Subscription failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [permission, requestPermission, ensureServiceWorker]);

  const saveSubscription = useCallback(async (
    subscription: WebPushSubscription, 
    extra: Record<string, any> = {}
  ): Promise<any> => {
    console.log('[useWebPush] Saving subscription to server...');
    setIsLoading(true);

    try {
      const payload = {
        subscription: {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        platform: navigator.platform || 'unknown',
        ua: navigator.userAgent,
        app_version: 'web-app',
        ...extra
      };

      console.log('[useWebPush] Sending payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke('push_subscribe', {
        body: payload
      });

      if (error) {
        console.error('[useWebPush] Save subscription error:', error);
        throw new Error(`Errore nel salvare la sottoscrizione: ${error.message}`);
      }

      console.log('[useWebPush] Subscription saved successfully:', data);
      return data;

    } catch (error) {
      console.error('[useWebPush] Save subscription failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testPush = useCallback(async (options: PushTestOptions): Promise<any> => {
    console.log('[useWebPush] Sending test push...', options);
    setIsLoading(true);

    try {
      const payload = {
        title: options.title || 'M1SSION™ Test',
        body: options.body || 'Test push notification',
        url: options.url || '/',
        ...options
      };

      console.log('[useWebPush] Test push payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke('push_send', {
        body: payload
      });

      if (error) {
        console.error('[useWebPush] Test push error:', error);
        throw new Error(`Errore nell'invio della notifica: ${error.message}`);
      }

      console.log('[useWebPush] Test push sent successfully:', data);
      return data;

    } catch (error) {
      console.error('[useWebPush] Test push failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = useCallback(async (): Promise<WebPushSubscription | null> => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) return null;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return null;

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      setIsSubscribed(true);
      return subscriptionData;

    } catch (error) {
      console.error('[useWebPush] Check subscription failed:', error);
      return null;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    ensureServiceWorker,
    subscribe,
    saveSubscription,
    testPush,
    requestPermission,
    checkSubscription
  };
}