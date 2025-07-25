/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ iOS Push Notifications Hook - Production Ready
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  setupMessageListener,
  getMessagingInstance
} from '@/integrations/firebase/firebase-client';
import { useNotificationManager } from '@/hooks/useNotificationManager';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createNotification } = useNotificationManager();

  // Check if notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      setIsSupported('Notification' in window);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      
        setIsSupported(true);
      }

      // Check if messaging is supported
      const messaging = await getMessagingInstance();
      if (!messaging) {
        setIsSupported(false);
      } else {
        console.log('🔥 Firebase messaging initialized successfully');
      }
    };
    
    checkSupport();
  }, []);

  // Setup message listener
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      setupMessageListener((payload) => {
        console.log('📨 Foreground message received:', payload);
        
        // Create an in-app notification
        if (payload.notification) {
          const { title, body } = payload.notification;
          createNotification(title || 'M1SSION™', body || 'Nuova notifica');
          
          // Show toast with M1SSION™ branding
          toast(title || 'M1SSION™', {
            description: body || 'Nuova notifica ricevuta',
            duration: 5000,
          });
        }
      });
    }
  }, [isSupported, permission, createNotification]);

  // Request permission with iOS native support
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Le notifiche push non sono supportate su questo dispositivo');
      return { success: false };
    }
    
    setLoading(true);
    
    try {

        console.log('🍎 Requesting iOS native push permission...');
        
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications');
          
          const permResult = await PushNotifications.requestPermissions();
          console.log('📱 iOS permission result:', permResult);
          
          if (permResult.receive === 'granted') {
            setPermission('granted');
            
            // Register for push notifications
            await PushNotifications.register();
            
            toast.success('✅ Notifiche push attivate!', {
              description: 'Riceverai aggiornamenti su missioni e premi',
            });
            
            setLoading(false);
            return { success: true };
          } else {
            setPermission('denied');
            toast.error('❌ Permesso notifiche negato');
            setLoading(false);
            return { success: false, reason: 'permission-denied' };
          }
        } catch (capacitorError) {
        }
      }

      // Fallback to web notification API
      const result = await requestNotificationPermission();
      
      if (result.success) {
        setPermission('granted');
        // Only set token if it exists in the result
        if (result.token) {
          setToken(result.token);
        }
        
        toast.success('✅ Notifiche push attivate!', {
          description: 'Riceverai aggiornamenti su missioni e premi',
        });
      } else {
        if (result.reason === 'permission-denied') {
          setPermission('denied');
          toast.error('❌ Permesso notifiche negato', {
            description: 'Puoi attivare le notifiche dalle impostazioni del browser'
          });
        } else {
          toast.error('Non è stato possibile attivare le notifiche');
        }
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error in requestPermission:', error);
      toast.error('Errore durante l\'attivazione delle notifiche');
      setLoading(false);
      return { success: false, error };
    }
  }, [isSupported, createNotification]);

  // iOS Dynamic Island integration
  const startLiveActivity = useCallback(async (activityData: {
    missionId: string;
    timeLeft: number;
    progress: number;
    status: string;
  }) => {
    try {

        console.log('🏝️ Starting Dynamic Island live activity...', activityData);
        
        // Call native Dynamic Island plugin if available
        const { DynamicIsland } = await import('@/plugins/DynamicIslandPlugin');
        
        if (DynamicIsland) {
          await DynamicIsland.startMissionActivity(activityData);
          console.log('✅ Dynamic Island activity started');
        }
      }
    } catch (error) {
      console.warn('Dynamic Island not available:', error);
    }
  }, []);

  return {
    isSupported,
    permission,
    token,
    loading,
    requestPermission,
    startLiveActivity,
    // iOS-specific features
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */