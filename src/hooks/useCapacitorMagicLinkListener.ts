
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
        console.log('📲 appUrlOpen triggered with URL:', url);
        try {
          const parsed = new URL(url);
          const token = parsed.searchParams.get('token');
          const type = parsed.searchParams.get('type');

          if (token && type === 'magiclink') {
            console.log('🔐 Verifying token...');
            const { error } = await supabase.auth.verifyOtp({
              type: 'magiclink',
              token,
              email: 'wikus77@hotmail.it', // Required for magiclink verification
            });

            if (error) {
              console.error('❌ Errore Supabase.verifyOtp:', error.message);
            } else {
              console.log('✅ Login automatico completato');
              window.location.href = '/home';
            }
          } else {
            console.warn('⚠️ URL senza token valido');
          }
        } catch (err) {
          console.error('❌ Errore parsing URL:', err);
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
