/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Hook - React Integration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { unifiedPushManager, UnifiedPushSubscription } from '@/lib/push/unified';
import { toast } from 'sonner';

interface UnifiedPushState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: UnifiedPushSubscription | null;
  isLoading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

export const useUnifiedPush = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UnifiedPushState>({
    isSupported: false,
    permission: null,
    subscription: null,
    isLoading: false,
    error: null,
    isSubscribed: false,
  });

  // Initialize push support detection
  useEffect(() => {
    console.log('🔧 [useUnifiedPush] Initializing...');
    
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const permission = 'Notification' in window ? Notification.permission : null;
    
    console.log('🔧 [useUnifiedPush] Support check:', {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      isSupported,
      permission
    });
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
    }));

    // Check existing subscription
    const existingSubscription = unifiedPushManager.getCurrentSubscription();
    if (existingSubscription) {
      console.log('🔧 [useUnifiedPush] Found existing subscription:', existingSubscription);
      setState(prev => ({
        ...prev,
        subscription: existingSubscription,
        isSubscribed: existingSubscription.success,
      }));
    } else {
      console.log('🔧 [useUnifiedPush] No existing subscription found');
    }
  }, []);

  // Auto-subscribe when user is authenticated and permission is granted
  useEffect(() => {
    if (!user || !state.isSupported || state.permission !== 'granted' || state.isSubscribed) {
      return;
    }

    const autoSubscribe = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        console.log('🔔 [useUnifiedPush] Auto-subscribing for authenticated user...');
        const subscription = await unifiedPushManager.subscribe();
        
        setState(prev => ({
          ...prev,
          subscription,
          isSubscribed: subscription.success,
          isLoading: false,
          error: subscription.success ? null : subscription.error || 'Subscription failed'
        }));
        
        if (subscription.success) {
          console.log('✅ [useUnifiedPush] Auto-subscription successful');
          toast.success('🔔 Notifiche push attivate!');
        } else {
          console.warn('⚠️ [useUnifiedPush] Auto-subscription failed:', subscription.error);
        }
      } catch (error) {
        console.error('❌ [useUnifiedPush] Auto-subscription error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Auto-subscription failed',
          isLoading: false,
        }));
      }
    };

    autoSubscribe();
  }, [user, state.isSupported, state.permission, state.isSubscribed]);

  // Request permission function
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('❌ Push notifications not supported');
      toast.error('Push notifications non supportate');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
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
  }, [state.isSupported]);

  // Manual subscription function
  const subscribe = useCallback(async (): Promise<boolean> => {
    console.log('🔔 [useUnifiedPush] Manual subscription started...');
    console.log('🔧 [useUnifiedPush] Current state:', {
      isSupported: state.isSupported,
      permission: Notification.permission,
      user: !!user,
      isSubscribed: state.isSubscribed
    });
    
    if (!state.isSupported) {
      const errorMsg = 'Browser non supporta push notifications';
      console.warn('❌', errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (!user) {
      const errorMsg = 'Utente non autenticato';
      console.warn('❌', errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // Check permission first
    if (Notification.permission !== 'granted') {
      console.log('🔧 [useUnifiedPush] Permission not granted, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔔 [useUnifiedPush] Calling unifiedPushManager.subscribe()...');
      const subscription = await unifiedPushManager.subscribe();
      const permission = Notification.permission;
      
      console.log('🔔 [useUnifiedPush] Subscription result:', {
        success: subscription.success,
        type: subscription.type,
        platform: subscription.platform,
        error: subscription.error,
        hasSubscription: !!subscription.subscription,
        subscriptionEndpoint: subscription.subscription && typeof subscription.subscription === 'object' 
          ? subscription.subscription.endpoint?.substring(0, 50) + '...' 
          : typeof subscription.subscription === 'string' 
            ? subscription.subscription.substring(0, 30) + '...'
            : 'null'
      });
      
      setState(prev => ({
        ...prev,
        subscription,
        permission,
        isSubscribed: subscription.success,
        isLoading: false,
        error: subscription.success ? null : subscription.error || 'Subscription failed'
      }));

      if (subscription.success) {
        console.log('✅ [useUnifiedPush] Manual subscription successful');
        toast.success('🔔 Notifiche push attivate!');
      } else {
        const specificError = subscription.error || 'Subscription failed';
        console.error('❌ [useUnifiedPush] Manual subscription failed:', specificError);
        toast.error(`Errore specifico: ${specificError}`);
      }

      return subscription.success;
    } catch (error) {
      console.error('❌ [useUnifiedPush] Manual subscription exception:', error);
      let errorMessage = 'Errore sconosciuto';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      toast.error(`Errore catch: ${errorMessage}`);
      return false;
    }
  }, [state.isSupported, requestPermission, user]);

  // Unsubscribe function
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await unifiedPushManager.unsubscribe();
      
      setState(prev => ({
        ...prev,
        subscription: null,
        isSubscribed: false,
        isLoading: false,
        error: success ? null : 'Unsubscribe failed'
      }));

      if (success) {
        toast.success('🔕 Notifiche push disattivate');
      } else {
        toast.error('Errore durante la disattivazione');
      }

      return success;
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

  return {
    ...state,
    subscribe,
    requestPermission,
    unsubscribe,
    canSubscribe: state.isSupported && state.permission === 'granted' && user,
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */