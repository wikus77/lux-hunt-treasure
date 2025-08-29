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

// VAPID public key for iOS PWA
const VAPID_PUBLIC_KEY = 'BHd3xsKYGQMx7MnLF4-jYK9x7Q_wX8VFqM6q2TzK3B0PnF4F-O6qZ3RrDJGJT1VfOoZ_j4O8GXJT0qX8X8F-J4Y';

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

  // Convert base64url to Uint8Array for VAPID
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
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
        // Desktop: Try Firebase first, fallback to VAPID
        console.log('🖥️ Desktop: trying Firebase FCM subscription');
        try {
          // Try to use Firebase messaging if available
          if (window.firebase?.messaging) {
            const messaging = window.firebase.messaging();
            const token = await messaging.getToken({
              vapidKey: VAPID_PUBLIC_KEY,
              serviceWorkerRegistration: registration
            });
            console.log('✅ Firebase FCM token obtained:', token);
            
            // Convert FCM token to subscription format for compatibility
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
          } else {
            throw new Error('Firebase not available, using VAPID');
          }
        } catch (fcmError) {
          console.warn('Firebase FCM failed, falling back to VAPID:', fcmError);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
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