// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// iOS Push Notifications Hook

import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IOSPushState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  isLoading: boolean;
  error: string | null;
}

export const useIOSPushNotifications = () => {
  const [state, setState] = useState<IOSPushState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: null,
    isLoading: false,
    error: null
  });

  const isIOS = Capacitor.getPlatform() === 'ios';

  useEffect(() => {
    const initializeIOSPush = async () => {
      if (!isIOS) {
        setState(prev => ({ ...prev, isSupported: false }));
        return;
      }

      setState(prev => ({ ...prev, isSupported: true, isLoading: true }));

      try {
        // Check permission status
        const permResult = await PushNotifications.checkPermissions();
        setState(prev => ({ 
          ...prev, 
          permission: permResult.receive as 'granted' | 'denied' | 'prompt'
        }));

        // Setup listeners
        await PushNotifications.addListener('registration', (token) => {
          console.log('🍎 iOS Push token received:', token.value);
          setState(prev => ({ 
            ...prev, 
            token: token.value, 
            isRegistered: true,
            isLoading: false 
          }));
          saveTokenToSupabase(token.value);
        });

        await PushNotifications.addListener('registrationError', (error) => {
          console.error('❌ iOS Push registration error:', error);
          setState(prev => ({ 
            ...prev, 
            error: error.error, 
            isLoading: false 
          }));
          toast.error('Errore registrazione notifiche iOS');
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📱 iOS Push notification received:', notification);
          toast.success(notification.body || 'Nuova notifica M1SSION');
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('👆 iOS Push notification action performed:', notification);
          // Handle notification tap
        });

        // If permission already granted, register immediately
        if (permResult.receive === 'granted') {
          await PushNotifications.register();
        }

      } catch (error: any) {
        console.error('❌ iOS push initialization error:', error);
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
      }
    };

    initializeIOSPush();
  }, [isIOS]);

  const requestPermissionAndRegister = async () => {
    if (!isIOS) {
      toast.error('Notifiche push disponibili solo su iOS');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      setState(prev => ({ 
        ...prev, 
        permission: permResult.receive as 'granted' | 'denied' | 'prompt'
      }));

      if (permResult.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        toast.success('✅ Notifiche push iOS attivate!');
        return true;
      } else {
        toast.error('❌ Permessi notifiche negati');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error: any) {
      console.error('❌ iOS Permission request error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
      toast.error('Errore richiesta permessi iOS');
      return false;
    }
  };

  const saveTokenToSupabase = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          platform: 'ios',
          endpoint_type: 'apns',
          device_info: {
            platform: Capacitor.getPlatform(),
            userAgent: navigator.userAgent
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving iOS push token:', error);
      } else {
        console.log('✅ iOS Push token saved to Supabase');
      }
    } catch (error) {
      console.error('❌ Error in saveTokenToSupabase (iOS):', error);
    }
  };

  return {
    ...state,
    isIOS,
    requestPermissionAndRegister
  };
};