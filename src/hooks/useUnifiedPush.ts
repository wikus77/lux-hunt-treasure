/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Hook - React Integration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
// import { subscribeToWebPush } from '@/lib/push/subscribe';
import { getVAPIDPublicKey } from '@/lib/push/vapid';
import { subscribeWebPushAndSave, looksLikeWebPushEndpoint, WebPushSubscriptionPayload } from '@/lib/push/webpush';
import { toast } from 'sonner';

interface UnifiedPushState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  subscription: PushSubscription | null;
  webPushSubscription: WebPushSubscriptionPayload | null;
  subscriptionType: 'fcm' | 'webpush' | null;
  canSubscribe: boolean;
}

export const useUnifiedPush = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UnifiedPushState>({
    isSupported: false,
    isSubscribed: false,
    permission: null,
    isLoading: false,
    error: null,
    token: null,
    subscription: null,
    webPushSubscription: null,
    subscriptionType: null,
    canSubscribe: false,
  });

  // Initialize push support detection
  useEffect(() => {
    console.log('🔧 [useUnifiedPush] Initializing...');
    
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const permission = 'Notification' in window ? Notification.permission : null;
    const canSubscribe = isSupported && permission === 'granted' && !!user;
    
    console.log('🔧 [useUnifiedPush] Support check:', {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      isSupported,
      permission,
      canSubscribe
    });
    
      setState(prev => ({
        ...prev,
        isSupported,
        permission,
        canSubscribe,
      }));
  }, [user]);

  // Request permission function
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('❌ Push notifications not supported');
      toast.error('Push notifications non supportate');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission, canSubscribe: permission === 'granted' && !!user }));
      
      if (permission === 'granted') {
        toast.success('✅ Permessi concessi!');
      } else {
        toast.error('❌ Permessi negati');
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Permission request failed';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      toast.error(`Errore: ${errorMessage}`);
      return false;
    }
  }, [state.isSupported, user]);

  const enableUnifiedPush = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔄 [UNIFIED-PUSH] Starting unified subscription process...');

    try {
      const vapidKey = getVAPIDPublicKey();
      console.log('🔑 [UNIFIED-PUSH] VAPID key loaded:', vapidKey.slice(0, 20) + '...');

      // Check permission first
      if (Notification.permission !== 'granted') {
        console.log('🔧 [UNIFIED-PUSH] Permission not granted, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permission not granted');
        }
      }

      // 1) SW pronto
      const swReg = await navigator.serviceWorker.ready;
      console.log('🛠️ [UNIFIED-PUSH] Service Worker ready');

      // 2) Prova FCM se disponibile
      let canUseFCM = false;
      try {
        // Check if Firebase messaging is available
        if (window.firebase || (window as any).firebaseConfig) {
          canUseFCM = true;
          console.log('🔥 [UNIFIED-PUSH] Firebase available, attempting FCM...');
        }
      } catch (e) {
        console.log('🔥 [UNIFIED-PUSH] Firebase not available, using Web Push');
      }

      if (canUseFCM) {
        try {
          // For now, skip FCM and go straight to Web Push
          // This section can be implemented later with proper Firebase integration
          console.log('🔥 [UNIFIED-PUSH] FCM path detected but using Web Push for now');
          
        } catch (e) {
          console.warn('⚠️ [UNIFIED-PUSH] FCM failed; trying Web Push fallback', e);
        }
      }

      // 3) Fallback to Web Push
      console.log('🌐 [UNIFIED-PUSH] Using Web Push protocol');
      const webPushResult = await subscribeWebPushAndSave({
        userId: user.id,
        swReg,
        vapidPublicKey: vapidKey,
        platform: 'desktop'
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        webPushSubscription: webPushResult.subscription,
        subscriptionType: 'webpush',
        isLoading: false
      }));

      console.log('✅ [UNIFIED-PUSH] Web Push subscription successful');
      toast.success('🔔 Notifiche Web Push attivate!');

    } catch (error) {
      console.error('❌ [UNIFIED-PUSH] Subscription failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Subscription failed',
        isLoading: false 
      }));
      toast.error(`Errore: ${error instanceof Error ? error.message : 'Subscription failed'}`);
      throw error;
    }
  };

  // Keep backward compatibility
  const subscribe = enableUnifiedPush;

  // Unsubscribe function
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Clear both types of subscriptions
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          console.log('🗑️ Browser subscription removed');
        }
      }
      
      setState(prev => ({
        ...prev,
        token: null,
        subscription: null,
        webPushSubscription: null,
        subscriptionType: null,
        isSubscribed: false,
        isLoading: false,
        error: null
      }));

      toast.success('🔕 Notifiche push disattivate');
      return true;
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unsubscribe failed';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      toast.error(`Errore: ${errorMessage}`);
      return false;
    }
  }, []);

  // Check status function
  const checkStatus = useCallback(async () => {
    console.log('🔍 [UNIFIED-PUSH] Checking current status...');
    // This would check existing subscriptions in the database
    // Implementation depends on your specific needs
  }, []);

  return {
    ...state,
    subscribe,
    requestPermission,
    unsubscribe,
    checkStatus,
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */
