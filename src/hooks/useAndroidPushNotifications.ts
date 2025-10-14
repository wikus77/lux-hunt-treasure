// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// PWA Push Notifications Hook (replaces Android Capacitor implementation)

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PWAPushState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'granted' | 'denied' | 'default' | null;
  isLoading: boolean;
  error: string | null;
}

export const useAndroidPushNotifications = () => {
  const [state, setState] = useState<PWAPushState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: null,
    isLoading: false,
    error: null
  });

  const isAndroid = /Android/i.test(navigator.userAgent);

  useEffect(() => {
    const initializePWAPush = async () => {
      // Check if service worker and push manager are supported
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      setState(prev => ({ ...prev, isSupported }));
      
      if (!isSupported) {
        console.log('❌ Push notifications not supported in this browser');
        return;
      }

      setState(prev => ({ ...prev, isLoading: true }));

      try {
        // Check current permission status
        const permission = await Notification.requestPermission();
        setState(prev => ({ 
          ...prev, 
          permission: permission as 'granted' | 'denied' | 'default',
          isLoading: false
        }));

        console.log('📱 PWA Push permission status:', permission);
      } catch (error: any) {
        console.error('❌ PWA push initialization error:', error);
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
      }
    };

    initializePWAPush();
  }, []);

  const requestPermissionAndRegister = async () => {
    if (!state.isSupported) {
      toast.error('❌ Push notifications not supported');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ 
        ...prev, 
        permission: permission as 'granted' | 'denied' | 'default'
      }));

      if (permission === 'granted') {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications (unified source)
        const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
        const vapidKey = await loadVAPIDPublicKey();
        if (!vapidKey) {
          throw new Error('VAPID public key not configured');
        }

        // Convert VAPID key to proper format using canonical converter
        const vapidKeyArray = urlBase64ToUint8Array(vapidKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKeyArray as unknown as BufferSource
        });

        // Save subscription to Supabase
        await saveSubscriptionToSupabase(subscription);
        
        setState(prev => ({ 
          ...prev, 
          isRegistered: true,
          token: JSON.stringify(subscription),
          isLoading: false 
        }));
        
        toast.success('✅ Push notifications enabled!');
        return true;
      } else {
        toast.error('❌ Push notification permission denied');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error: any) {
      console.error('❌ Permission request error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      toast.error('❌ Error enabling push notifications');
      return false;
    }
  };

  const saveSubscriptionToSupabase = async (subscription: PushSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: JSON.stringify(subscription),
          platform: isAndroid ? 'android' : 'web',
          endpoint_type: 'web_push',
          device_info: {
            platform: 'web',
            userAgent: navigator.userAgent,
            endpoint: subscription.endpoint
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving push subscription:', error);
      } else {
        console.log('✅ Push subscription saved to Supabase');
      }
    } catch (error) {
      console.error('❌ Error in saveSubscriptionToSupabase:', error);
    }
  };

  return {
    ...state,
    isAndroid,
    requestPermissionAndRegister
  };
};