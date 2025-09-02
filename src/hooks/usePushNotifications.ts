// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  ua: string;
  platform: string;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

import { VAPID_PUBLIC_KEY, validateAndDecodeVAPIDKey } from '@/lib/constants/vapid';

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSPWA = isIOS && isPWA;

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

  // Check if already subscribed
  const checkCurrentSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.warn('Error checking subscription:', error);
      setIsSubscribed(false);
    }
  };

  // Use unified VAPID validation from constants
  const urlBase64ToUint8Array = validateAndDecodeVAPIDKey;

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
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe existing subscription first
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      // Subscribe with appropriate method based on platform
      let subscription: PushSubscription;
      
      if (isIOSPWA) {
        // iOS PWA: Use VAPID directly
        console.log('🍎 iOS PWA: subscribing with VAPID');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      } else {
        // VAPID key validation BEFORE subscribe
        console.log('🔑 Validating VAPID key before subscription...');
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        console.log('✅ VAPID validation passed, creating subscription...');

        // Use Firebase messaging if available, otherwise fallback to W3C
        if (window.firebase && window.firebase.messaging) {
          console.log('🔥 Using Firebase for subscription...');
          try {
            const messaging = window.firebase.messaging();
            const token = await messaging.getToken({
              vapidKey: VAPID_PUBLIC_KEY,
              serviceWorkerRegistration: registration
            });
            
            if (token) {
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
              });
              
              console.log('🔥 Firebase + W3C subscription created');
            } else {
              throw new Error('Firebase token generation failed');
            }
          } catch (firebaseError) {
            console.warn('🔥 Firebase failed, using W3C fallback:', firebaseError);
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey
            });
          }
        } else {
          // W3C Push API (standard)
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });
        }
      }

      // Prepare subscription data
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
        ua: navigator.userAgent,
        platform: isIOSPWA ? 'ios_pwa' : 'desktop'
      };

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          ...subscriptionData
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('🔔 Notifiche push attivate!');
      console.log('✅ Push subscription saved successfully');
      return true;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Errore attivazione notifiche push');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission, isIOSPWA]);

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
    requestPermission,
    subscribe,
    unsubscribe
  };
};