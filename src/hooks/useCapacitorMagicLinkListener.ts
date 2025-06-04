
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function useCapacitorMagicLinkListener() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    const isIOS = Capacitor.getPlatform() === 'ios';
    if (isIOS) {
      console.log("🔗 Magic link listener attivo su iOS WebView");
    }

    let listenerHandle: any = null;

    const setupListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        console.log('📲 appUrlOpen triggered with URL:', url);
        try {
          const parsed = new URL(url);
          const token = parsed.searchParams.get('token');
          const type = parsed.searchParams.get('type');
          const email = parsed.searchParams.get('email') || 'wikus77@hotmail.it';

          if (token && type === 'magiclink') {
            console.log('🔐 Verifying token...');
            const { data, error } = await supabase.auth.verifyOtp({
              type: 'magiclink',
              token,
              email: email,
            });

            if (error) {
              console.error('❌ Errore Supabase.verifyOtp:', error.message);
            } else {
              console.log('✅ Login automatico completato');
              
              // Salva esplicitamente la sessione per iOS
              if (isIOS && data.session) {
                try {
                  localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
                  console.log("📦 Sessione salvata in localStorage dopo magic link per iOS");
                } catch (err) {
                  console.error("❌ Errore salvataggio sessione:", err);
                }
              }
              
              // Redirect forzato a /home invece di modificare window.location
              navigate('/home', { replace: true });
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
  }, [navigate]);
}
