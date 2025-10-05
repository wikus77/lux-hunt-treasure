// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Web Push Notifications Hook (replaces FCM)

import { useState, useEffect, useCallback } from 'react';
import { webPushManager } from '@/lib/push/webPushManager';
import { toast } from 'sonner';

interface WebPushNotificationsState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  loading: boolean;
  isIOSCapacitor: boolean;
}

export const useFCMPushNotifications = () => {
  const [state, setState] = useState<WebPushNotificationsState>({
    isSupported: false,
    permission: null,
    subscription: null,
    loading: false,
    isIOSCapacitor: false
  });

  // Check browser support and permission on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = webPushManager.isSupported();
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

      console.log('🔔 Web Push Support Check:', { supported, permission, isIOSCapacitor });
    };

    checkSupport();
  }, []);

  // Request permission and subscribe to web push
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.error('❌ Web Push not supported in this browser');
      toast.error('Notifiche push non supportate in questo browser');
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🔔 Requesting Web Push subscription...');
      
      const subscription = await webPushManager.subscribe();
      
      console.log('✅ Web Push subscription successful');
      toast.success('Notifiche push attivate con successo!');

      setState(prev => ({
        ...prev,
        permission: 'granted',
        subscription,
        loading: false
      }));

      return true;
    } catch (error: any) {
      console.error('❌ Error requesting Web Push subscription:', error);
      
      let errorMessage = 'Errore nell\'attivare le notifiche push';
      if (error.message.includes('home screen')) {
        errorMessage = 'Su iOS, aggiungi l\'app alla home screen prima';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permesso per le notifiche negato';
      }
      
      toast.error(errorMessage);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  }, [state.isSupported]);

  // Start live activity (iOS specific - fallback to standard notification)
  const startLiveActivity = useCallback(async () => {
    if (state.isIOSCapacitor) {
      console.log('🍎 iOS Capacitor detected - using Web Push');
    }
    
    return requestPermission();
  }, [state.isIOSCapacitor, requestPermission]);

  return {
    isSupported: state.isSupported,
    permission: state.permission,
    token: state.subscription?.endpoint || null,
    loading: state.loading,
    requestPermission,
    startLiveActivity,
    isIOSCapacitor: state.isIOSCapacitor
  };
};
