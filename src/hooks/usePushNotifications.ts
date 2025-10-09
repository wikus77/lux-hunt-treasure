// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  ua: string;
  platform: string;
  endpoint_type: string;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  loading: boolean;
  platform: string;
  endpointShort: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [endpointShort, setEndpointShort] = useState<string | null>(null);

  // Detect platform with enhanced logic
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSPWA = isIOS && isPWA;
  
  const platform = isIOSPWA ? 'ios_pwa' : 'desktop';

  // Check support and current state
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        checkCurrentSubscription();
      }
    };

    checkSupport();
  }, []);

  // Check if already subscribed and get endpoint info
  const checkCurrentSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setIsSubscribed(true);
        setEndpointShort(subscription.endpoint.substring(0, 50) + '...');
      } else {
        setIsSubscribed(false);
        setEndpointShort(null);
      }
    } catch (error) {
      console.warn('Error checking subscription:', error);
      setIsSubscribed(false);
      setEndpointShort(null);
    }
  };

  // Convert Uint8Array to base64url
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Detect endpoint type from URL
  const detectEndpointType = (endpoint: string): string => {
    if (endpoint.includes('web.push.apple.com')) return 'apns';
    if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
    if (endpoint.includes('wns.notify.windows.com')) return 'wns';
    return 'unknown';
  };

  // Validate subscription keys (65 bytes p256dh, 16 bytes auth)
  const validateSubscriptionKeys = (p256dh: string, auth: string): boolean => {
    try {
      const pad = (str: string) => str + '='.repeat((4 - str.length % 4) % 4);
      const p256dhBytes = atob(pad(p256dh).replace(/-/g, '+').replace(/_/g, '/'));
      const authBytes = atob(pad(auth).replace(/-/g, '+').replace(/_/g, '/'));
      
      const p256dhValid = p256dhBytes.length === 65;
      const authValid = authBytes.length === 16;
      
      console.log('🔍 Key validation:', { 
        p256dh: { length: p256dhBytes.length, valid: p256dhValid },
        auth: { length: authBytes.length, valid: authValid }
      });
      
      return p256dhValid && authValid;
    } catch (error) {
      console.error('❌ Key validation error:', error);
      return false;
    }
  };

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Errore richiesta permessi notifiche');
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    setLoading(true);
    try {
      // Pre-validate VAPID key before any subscription attempt
      console.log('🔑 Pre-subscription VAPID validation...');
      const vapidKey = await loadVAPIDPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidKey); // Throws if invalid
      console.log('✅ VAPID pre-validation passed');

      // P0 FIX: Ensure unified SW registration
      console.log('🔄 Ensuring unified SW registration...');
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Unregister any firebase-messaging-sw to prevent conflicts
      for (const reg of registrations) {
        if (reg.scope.includes('firebase-messaging-sw') || 
            (reg.active?.scriptURL && reg.active.scriptURL.includes('firebase-messaging-sw'))) {
          console.log('🧹 Removing conflicting Firebase SW:', reg.scope);
          await reg.unregister();
        }
      }
      
      // Register unified SW if needed
      let registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe existing subscription first to avoid duplicates
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      let subscription: PushSubscription;
      
      if (isIOSPWA) {
        // iOS PWA: Use VAPID Web Push standard
        console.log('🍎 iOS PWA: subscribing with VAPID Web Push');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as unknown as BufferSource
        });
      } else {
        // Desktop: Try Firebase first, fallback to W3C
        if (window.firebase && window.firebase.messaging) {
          console.log('🔥 Desktop: attempting Firebase + W3C hybrid');
          try {
            const messaging = window.firebase.messaging();
            const token = await messaging.getToken({
              vapidKey,
              serviceWorkerRegistration: registration
            });
            
            if (token) {
              // Also create W3C subscription for consistency
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey as unknown as BufferSource
            });
              console.log('🔥 Firebase + W3C subscription created');
            } else {
              throw new Error('Firebase token generation failed');
            }
          } catch (firebaseError) {
            console.warn('🔥 Firebase failed, using W3C fallback:', firebaseError);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as unknown as BufferSource
          });
          }
        } else {
          // W3C Push API (standard)
          console.log('📱 Desktop: using W3C Push API');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as unknown as BufferSource
        });
        }
      }

      // Extract and validate subscription data
      const p256dh = arrayBufferToBase64(subscription.getKey('p256dh')!);
      const auth = arrayBufferToBase64(subscription.getKey('auth')!);
      const endpoint_type = detectEndpointType(subscription.endpoint);
      
      // Validate byte lengths before saving
      if (!validateSubscriptionKeys(p256dh, auth)) {
        throw new Error('Invalid subscription key lengths (expected: p256dh=65B, auth=16B)');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        ua: navigator.userAgent,
        platform,
        endpoint_type
      };

      console.log('📤 Subscription data prepared:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        endpoint_type,
        platform,
        p256dh_length: p256dh.length,
        auth_length: auth.length
      });

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user?.id || null, // Support guest subscriptions
          ...subscriptionData
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

      setIsSubscribed(true);
      setEndpointShort(subscription.endpoint.substring(0, 50) + '...');
      toast.success('🔔 Notifiche push attivate!');
      console.log('✅ Push subscription saved successfully');
      return true;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error(`Errore attivazione notifiche: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission, isIOSPWA, platform]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
      }

      setIsSubscribed(false);
      setEndpointShort(null);
      toast.success('🔕 Notifiche push disattivate');
      return true;

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Errore disattivazione notifiche push');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    platform,
    endpointShort,
    requestPermission,
    subscribe,
    unsubscribe
  };
};