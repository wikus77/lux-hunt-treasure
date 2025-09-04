// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Android Push Notifications Hook

import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AndroidPushState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  isLoading: boolean;
  error: string | null;
}

export const useAndroidPushNotifications = () => {
  const [state, setState] = useState<AndroidPushState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: null,
    isLoading: false,
    error: null
  });

  const isAndroid = Capacitor.getPlatform() === 'android';

  useEffect(() => {
    const initializeAndroidPush = async () => {
      if (!isAndroid) {
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
          console.log('🔔 Android Push token received:', token.value);
          setState(prev => ({ 
            ...prev, 
            token: token.value, 
            isRegistered: true,
            isLoading: false 
          }));
          saveTokenToSupabase(token.value);
        });

        await PushNotifications.addListener('registrationError', (error) => {
          console.error('❌ Android Push registration error:', error);
          setState(prev => ({ 
            ...prev, 
            error: error.error, 
            isLoading: false 
          }));
          toast.error('Errore registrazione notifiche Android');
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📱 Push notification received:', notification);
          toast.success(notification.body || 'Nuova notifica M1SSION');
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('👆 Push notification action performed:', notification);
          // Handle notification tap
        });

        // If permission already granted, register immediately
        if (permResult.receive === 'granted') {
          await PushNotifications.register();
        }

      } catch (error: any) {
        console.error('❌ Android push initialization error:', error);
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
      }
    };

    initializeAndroidPush();
  }, [isAndroid]);

  const requestPermissionAndRegister = async () => {
    if (!isAndroid) {
      toast.error('Notifiche push disponibili solo su Android');
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
        toast.success('✅ Notifiche push Android attivate!');
        return true;
      } else {
        toast.error('❌ Permessi notifiche negati');
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
      toast.error('Errore richiesta permessi');
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
          platform: 'android',
          device_info: {
            platform: Capacitor.getPlatform(),
            userAgent: navigator.userAgent
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error saving push token:', error);
      } else {
        console.log('✅ Push token saved to Supabase');
      }
    } catch (error) {
      console.error('❌ Error in saveTokenToSupabase:', error);
    }
  };

  return {
    ...state,
    isAndroid,
    requestPermissionAndRegister
  };
};