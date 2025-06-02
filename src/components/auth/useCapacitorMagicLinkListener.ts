
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCapacitorMagicLinkListener() {
  useEffect(() => {
    let listenerHandle: any = null;

    const setupListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        try {
          const parsed = new URL(url);
          const token = parsed.searchParams.get('token');
          const type = parsed.searchParams.get('type');

          if (token && type === 'magiclink') {
            const { error } = await supabase.auth.verifyOtp({
              type: 'magiclink',
              token,
              email: 'wikus77@hotmail.it', // Required for magiclink verification
            });

            if (error) {
              console.error('Errore durante il login automatico:', error);
            } else {
              console.log('✅ Login automatico completato');
              window.location.href = '/home';
            }
          }
        } catch (err) {
          console.error('Errore parsing URL:', err);
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
