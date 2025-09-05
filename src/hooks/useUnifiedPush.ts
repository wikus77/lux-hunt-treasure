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
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const permission = 'Notification' in window ? Notification.permission : null;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
    }));

    // Check existing subscription
    const existingSubscription = unifiedPushManager.getCurrentSubscription();
    if (existingSubscription) {
      setState(prev => ({
        ...prev,
        subscription: existingSubscription,
        isSubscribed: existingSubscription.success,
      }));
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
    
    if (!state.isSupported) {
      console.warn('❌ Push notifications not supported');
      toast.error('Push notifications non supportate');
      return false;
    }

    // Check permission first
    if (Notification.permission !== 'granted') {
      console.warn('❌ Permission not granted, requesting first');
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
      
      console.log('🔔 [useUnifiedPush] Subscription result:', subscription);
      
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
        console.error('❌ [useUnifiedPush] Manual subscription failed:', subscription.error);
        toast.error(`Errore: ${subscription.error || 'Subscription failed'}`);
      }

      return subscription.success;
    } catch (error) {
      console.error('❌ Manual subscription failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Push subscription failed';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      
      toast.error(`Errore: ${errorMessage}`);
      return false;
    }
  }, [state.isSupported, requestPermission]);

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