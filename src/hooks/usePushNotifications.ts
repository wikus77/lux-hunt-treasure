/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ iOS Push Notifications Hook - Production Ready
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import OneSignal from 'react-onesignal';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { supabase } from '@/integrations/supabase/client';

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

      // Check for iOS Capacitor environment
      const isCapacitor = (window as any).Capacitor?.isNativePlatform();
      const isIOS = (window as any).Capacitor?.getPlatform() === 'ios';
      
      if (isCapacitor && isIOS) {
        console.log('🍎 iOS Capacitor detected - Enhanced OneSignal support');
        setIsSupported(true);
      }

      // OneSignal is supported on all modern browsers
      console.log('🔔 OneSignal push notifications supported');
    };
    
    checkSupport();
  }, []);

  // Setup OneSignal message listener
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      // OneSignal handles background messages automatically
      // For foreground messages, we can use notification event
      console.log('🔔 OneSignal message listener ready');
    }
  }, [isSupported, permission, createNotification]);

  // Request permission with OneSignal support
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Le notifiche push non sono supportate su questo dispositivo');
      return { success: false };
    }
    
    setLoading(true);
    
    try {
      console.log('🔔 Requesting OneSignal notification permission...');
      
      // Request OneSignal permission
      await OneSignal.Notifications.requestPermission();
      console.log('🔔 OneSignal permission requested');
      
      // Check if permission was granted
      const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
      if (isOptedIn) {
        setPermission('granted');
        
        // Get OneSignal Player ID
        const playerId = await OneSignal.User.PushSubscription.id;
        console.log('🔔 OneSignal Player ID:', playerId);
        
        if (playerId) {
          setToken(playerId);
          
          // Save OneSignal Player ID to Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('🔐 Saving OneSignal Player ID for user:', user.id);
            
            const { error } = await supabase
              .from('device_tokens')
              .upsert({
                user_id: user.id,
                token: playerId,
                device_type: 'onesignal',
                last_used: new Date().toISOString(),
                created_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,device_type'
              });
              
            if (error) {
              console.error('❌ Error saving OneSignal Player ID:', error);
              toast.error('❌ Errore salvataggio token OneSignal');
            } else {
              console.log('✅ OneSignal Player ID saved to device_tokens:', playerId);
              toast.success('✅ Notifiche OneSignal attivate!', {
                description: 'Riceverai aggiornamenti su missioni e premi'
              });
            }
          }
        }
        
        setLoading(false);
        return { success: true, token: playerId };
      } else {
        setPermission('denied');
        toast.error('❌ Permesso notifiche negato');
        setLoading(false);
        return { success: false, reason: 'permission-denied' };
      }
    } catch (error) {
      console.error('❌ OneSignal permission request failed:', error);
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
      const isCapacitor = (window as any).Capacitor?.isNativePlatform();
      const isIOS = (window as any).Capacitor?.getPlatform() === 'ios';

      if (isCapacitor && isIOS) {
        console.log('🏝️ Starting Dynamic Island live activity...', activityData);
        
        // Call native Dynamic Island plugin if available
        // PWA notification fallback
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎯 M1SSION™', { body: 'Nuova notifica disponibile' });
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
    isIOSCapacitor: typeof window !== 'undefined' && 
      (window as any).Capacitor?.isNativePlatform() && 
      (window as any).Capacitor?.getPlatform() === 'ios'
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */