// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PUSH SYNC HOOK - Sincronizza push subscription automaticamente al login
// NOTA: Hook separato, NON modifica logiche esistenti

import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { syncExistingSubscription, startServiceWorkerKeepAlive } from '@/lib/push/sync-subscription';

/**
 * Hook che sincronizza automaticamente la push subscription
 * quando l'utente fa login o quando l'app si apre con utente già loggato
 */
export const usePushSync = () => {
  const { user } = useAuth();
  const lastUserId = useRef<string | null>(null);
  const keepAliveCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Avvia keep-alive per il Service Worker (sempre, anche senza login)
    if (!keepAliveCleanup.current) {
      keepAliveCleanup.current = startServiceWorkerKeepAlive();
    }

    // Cleanup al unmount
    return () => {
      if (keepAliveCleanup.current) {
        keepAliveCleanup.current();
        keepAliveCleanup.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Sincronizza solo quando l'utente cambia (login/logout)
    const currentUserId = user?.id || null;

    // Skip se l'utente non è cambiato
    if (currentUserId === lastUserId.current) {
      return;
    }

    lastUserId.current = currentUserId;

    // Se l'utente ha fatto login, sincronizza la subscription
    if (currentUserId) {
      // Delay per permettere al sistema di stabilizzarsi
      const timeoutId = setTimeout(async () => {
        const synced = await syncExistingSubscription();
        if (synced) {
          console.log('🔔 [usePushSync] Subscription sincronizzata al login');
        }
      }, 2000); // 2 secondi dopo il login

      return () => clearTimeout(timeoutId);
    }
  }, [user?.id]);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™



