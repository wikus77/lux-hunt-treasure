// M1SSION™ - Push Notifications Setup Hook for iOS Capacitor
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  hasPermission: boolean;
  isRegistered: boolean;
  token: string | null;
  error: string | null;
}

export const usePushNotificationSetup = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    hasPermission: false,
    isRegistered: false,
    token: null,
    error: null
  });

  useEffect(() => {
    const setupPushNotifications = async () => {
      const isCapacitor = typeof window !== 'undefined' && 
        (!!(window as any).Capacitor || window.location.protocol === 'capacitor:');

      if (!isCapacitor) {
        console.log('📱 Web environment - Push notifications not available');
        setState(prev => ({ ...prev, isSupported: false }));
        return;
      }

      try {
        const { PushNotifications } = (window as any).Capacitor;
        
        if (!PushNotifications) {
          console.warn('⚠️ Push Notifications plugin not available');
          setState(prev => ({ ...prev, isSupported: false }));
          return;
        }

        console.log('📱 Setting up push notifications for iOS...');
        setState(prev => ({ ...prev, isSupported: true }));

        // Check current permission status
        const permissionStatus = await PushNotifications.checkPermissions();
        console.log('📱 Current permission status:', permissionStatus.receive);

        if (permissionStatus.receive === 'prompt') {
          console.log('📱 Requesting push notification permissions...');
          const permission = await PushNotifications.requestPermissions();
          
          if (permission.receive === 'granted') {
            setState(prev => ({ ...prev, hasPermission: true }));
            console.log('✅ Push notification permissions granted');
          } else {
            setState(prev => ({ 
              ...prev, 
              hasPermission: false,
              error: 'Push notification permissions denied'
            }));
            console.log('❌ Push notification permissions denied');
            return;
          }
        } else if (permissionStatus.receive === 'granted') {
          setState(prev => ({ ...prev, hasPermission: true }));
          console.log('✅ Push notification permissions already granted');
        } else {
          setState(prev => ({ 
            ...prev, 
            hasPermission: false,
            error: 'Push notification permissions denied'
          }));
          console.log('❌ Push notification permissions denied');
          return;
        }

        // Register for push notifications
        try {
          await PushNotifications.register();
          setState(prev => ({ ...prev, isRegistered: true }));
          console.log('✅ Push notifications registered successfully');
        } catch (regError) {
          console.error('❌ Push notification registration failed:', regError);
          setState(prev => ({ 
            ...prev, 
            error: 'Push notification registration failed'
          }));
        }

        // Set up listeners
        PushNotifications.addListener('registration', (token: any) => {
          console.log('📱 Push registration token:', token.value);
          setState(prev => ({ ...prev, token: token.value }));
          
          toast({
            title: "Notifiche attivate",
            description: "Riceverai aggiornamenti importanti",
            duration: 3000
          });
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('❌ Push registration error:', error);
          setState(prev => ({ 
            ...prev, 
            error: `Registration error: ${error.error}`
          }));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
          console.log('📱 Push notification received:', notification);
          
          toast({
            title: notification.title || "Nuova notifica",
            description: notification.body || "Hai ricevuto una nuova notifica",
            duration: 5000
          });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
          console.log('📱 Push notification action performed:', notification);
          
          // Handle notification tap actions here
          if (notification.notification.data?.route) {
            // Navigate to specific route if provided
            const route = notification.notification.data.route;
            console.log('📱 Navigating to route from notification:', route);
            // Navigation logic would go here
          }
        });

      } catch (error) {
        console.error('❌ Push notification setup error:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Setup failed'
        }));
      }
    };

    setupPushNotifications();
  }, [toast]);

  const requestPermissions = async () => {
    try {
      const { PushNotifications } = (window as any).Capacitor;
      if (!PushNotifications) return false;

      const permission = await PushNotifications.requestPermissions();
      const granted = permission.receive === 'granted';
      
      setState(prev => ({ ...prev, hasPermission: granted }));
      return granted;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  };

  return {
    ...state,
    requestPermissions
  };
};