// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging React Hook

import { useState, useEffect, useCallback } from 'react';
import { getFCMToken, setupFCMMessageListener, isFCMSupported } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MessagePayload } from 'firebase/messaging';

interface FCMPushNotificationsState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  token: string | null;
  loading: boolean;
  isIOSCapacitor: boolean;
}

export const useFCMPushNotifications = () => {
  const [state, setState] = useState<FCMPushNotificationsState>({
    isSupported: false,
    permission: null,
    token: null,
    loading: false,
    isIOSCapacitor: false
  });

  // Check browser support and permission on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = isFCMSupported();
      const permission = typeof window !== 'undefined' ? Notification.permission : 'default';
      const isIOSCapacitor = typeof window !== 'undefined' && 
                           !!(window as any).Capacitor && 
                           (window as any).Capacitor.getPlatform() === 'ios';

      setState(prev => ({
        ...prev,
        isSupported: supported,
        permission: permission as NotificationPermission,
        isIOSCapacitor
      }));

      console.log('🔥 FCM Support Check:', { supported, permission, isIOSCapacitor });
    };

    checkSupport();
  }, []);

  // Setup FCM message listener
  useEffect(() => {
    if (state.isSupported && state.permission === 'granted') {
      const unsubscribe = setupFCMMessageListener((payload: MessagePayload) => {
        console.log('📨 FCM Message received:', payload);
        
        // Show toast notification for foreground messages
        if (payload.notification) {
          toast.success(payload.notification.title || 'M1SSION™', {
            description: payload.notification.body || 'Nuova notifica',
            duration: 5000,
          });
        }
      });

      return unsubscribe;
    }
  }, [state.isSupported, state.permission]);

  // Request permission and get FCM token
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.error('❌ FCM not supported in this browser');
      toast.error('Notifiche push non supportate in questo browser');
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🔥 Requesting FCM permission...');
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ FCM Permission granted');
        
        // Get FCM token
        const token = await getFCMToken();
        
        if (token) {
          console.log('✅ FCM Token retrieved successfully');
          
          // Save token to Supabase
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from('user_push_tokens')
              .upsert({
                user_id: user.id,
                fcm_token: token,
                device_info: {
                  userAgent: navigator.userAgent,
                  platform: navigator.platform,
                  timestamp: new Date().toISOString()
                },
                is_active: true
              }, {
                onConflict: 'user_id,fcm_token'
              });

            if (error) {
              console.error('❌ Error saving FCM token to Supabase:', error);
              toast.error('Errore nel salvare il token di notifica');
            } else {
              console.log('✅ FCM Token saved to Supabase successfully');
              toast.success('Notifiche push attivate con successo!');
            }
          }

          setState(prev => ({
            ...prev,
            permission: 'granted',
            token,
            loading: false
          }));

          return true;
        } else {
          console.error('❌ Failed to retrieve FCM token');
          toast.error('Errore nel recuperare il token di notifica');
          setState(prev => ({ ...prev, loading: false }));
          return false;
        }
      } else {
        console.warn('⚠️ FCM Permission denied');
        toast.error('Permesso per le notifiche negato');
        setState(prev => ({
          ...prev,
          permission: 'denied',
          loading: false
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting FCM permission:', error);
      toast.error('Errore nella richiesta di permesso per le notifiche');
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [state.isSupported]);

  // Start live activity (iOS specific - fallback to standard notification)
  const startLiveActivity = useCallback(async () => {
    if (state.isIOSCapacitor) {
      console.log('🍎 iOS Capacitor detected - using native notification');
      // In a real Capacitor environment, you would use native plugins here
      // For now, fallback to standard web notification
    }
    
    return requestPermission();
  }, [state.isIOSCapacitor, requestPermission]);

  return {
    isSupported: state.isSupported,
    permission: state.permission,
    token: state.token,
    loading: state.loading,
    requestPermission,
    startLiveActivity,
    isIOSCapacitor: state.isIOSCapacitor
  };
};