
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCapacitorMagicLinkListener() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: any = null;

    const setupListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        console.log('📲 Capacitor appUrlOpen triggered with URL:', url);
        try {
          const parsed = new URL(url);
          const token = parsed.searchParams.get('token');
          const type = parsed.searchParams.get('type');

          if (token && type === 'magiclink') {
            console.log('🔐 Processing magic link token...');
            const { error } = await supabase.auth.verifyOtp({
              type: 'magiclink',
              token,
              email: 'wikus77@hotmail.it', // Required for magiclink verification
            });

            if (error) {
              console.error('❌ Supabase magic link error:', error.message);
            } else {
              console.log('✅ Magic link login successful, redirecting to /home');
              // Force redirect to /home after successful authentication
              window.location.href = '/home';
            }
          } else {
            console.warn('⚠️ URL without valid magic link token');
          }
        } catch (err) {
          console.error('❌ Error parsing Capacitor URL:', err);
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);
}
