/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Subscription Hook
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { registerPush } from '@/lib/push/register-push';

interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Unified hook for managing push notifications across all platforms
 * Automatically subscribes when user is authenticated and permission is granted
 */
export const useUnifiedPushSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    permission: null,
    subscription: null,
    isLoading: false,
    error: null,
  });

  // Initialize push support detection
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = 'Notification' in window ? Notification.permission : null;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
    }));
  }, []);

  // Auto-subscribe when user is authenticated and permission is granted
  useEffect(() => {
    if (!user || !state.isSupported || state.permission !== 'granted' || state.subscription) {
      return;
    }

    const subscribe = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        console.log('🔔 [useUnifiedPushSubscription] Auto-subscribing for authenticated user...');
        const result = await registerPush(user.id);
        
        // Get the actual subscription after registration
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          subscription,
          isLoading: false,
        }));
        
        if (result) {
          console.log('✅ [useUnifiedPushSubscription] Subscription successful:', result);
        }
      } catch (error) {
        console.error('❌ [useUnifiedPushSubscription] Subscription failed:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Push subscription failed',
          isLoading: false,
        }));
      }
    };

    subscribe();
  }, [user, state.isSupported, state.permission, state.subscription]);

  // Manual subscription function
  const subscribe = async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('❌ Push notifications not supported');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const result = await registerPush(user.id);
      const permission = Notification.permission;
      
      // Get the actual subscription after registration
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        subscription,
        permission,
        isLoading: false,
      }));

      return subscription !== null;
    } catch (error) {
      console.error('❌ Manual subscription failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Push subscription failed',
        isLoading: false,
      }));
      return false;
    }
  };

  // Request permission function
  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('❌ Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      // Auto-subscribe if permission granted and user is authenticated
      if (permission === 'granted' && user) {
        return await subscribe();
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Permission request failed',
      }));
      return false;
    }
  };

  return {
    ...state,
    subscribe,
    requestPermission,
    isSubscribed: state.subscription !== null,
    canSubscribe: state.isSupported && state.permission === 'granted' && user,
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */