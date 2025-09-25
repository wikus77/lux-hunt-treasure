// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// iOS Push Notifications Hook (PWA Compatible)

import { useState, useEffect } from 'react';
import { PushNotifications, Capacitor } from '@/lib/capacitor-compat';
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

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    // PWA environment - iOS push notifications not available
    if (typeof window !== 'undefined') {
      setState(prev => ({ ...prev, isSupported: false }));
    }
  }, []);

  const requestPermissionAndRegister = async () => {
    if (!isIOS) {
      toast.error('Notifiche push disponibili solo su iOS');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission (stub in PWA)
      const permResult = await PushNotifications.requestPermissions();
      setState(prev => ({ 
        ...prev, 
        permission: permResult.receive as 'granted' | 'denied' | 'prompt'
      }));

      if (permResult.receive === 'granted') {
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
            platform: 'web',
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