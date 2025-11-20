// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// @ts-nocheck
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

/**
 * Hook per ascoltare notifiche proattive di Norah AI
 * NON modifica pagine esistenti, solo aggiunge funzionalità background
 */
export const useNorahProactiveListener = () => {
  const { user } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user?.id || !('serviceWorker' in navigator)) return;

    console.log('🎧 [NORAH PROACTIVE] Listener attivo');

    // Listen to foreground messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'norah_proactive') {
        const { notification_type, title, body, deepLink } = event.data;

        console.log('📬 [NORAH PROACTIVE] Notifica ricevuta:', notification_type);

        // Show in-app toast
        toast(title, {
          description: body,
          duration: 8000,
          action: {
            label: 'Apri',
            onClick: () => {
              if (deepLink) {
                setLocation(deepLink);
              }
            }
          },
          style: {
            background: 'linear-gradient(135deg, #00FFFF 0%, #0084FF 100%)',
            color: 'white',
            fontWeight: 'bold'
          }
        });

        // Mark as clicked when user interacts
        if (event.data.notification_id) {
          supabase.rpc('mark_norah_notification_clicked', {
            p_notification_id: event.data.notification_id
          }).then(() => {
            console.log('✓ Notification marked as clicked');
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      console.log('🔇 [NORAH PROACTIVE] Listener disattivato');
    };
  }, [user?.id, setLocation]);
};
