/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Universal Subscription Sync Hook - FIXED VERSION
 * Single source of truth for ALL subscription data across the entire app
 */

import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export const useUniversalSubscriptionSync = () => {
  const { getCurrentUser } = useAuthContext();

  // Force sync across all components when subscription changes
  const triggerGlobalSync = useMemo(() => (newPlan: string) => {
    console.log('🔄 M1SSION™ UNIVERSAL SYNC TRIGGER:', newPlan);
    
    // Update localStorage for backwards compatibility
    localStorage.setItem('subscription_plan', newPlan);
    localStorage.setItem('userTier', newPlan);
    
    // Trigger storage event to notify all components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'subscription_plan',
      newValue: newPlan,
      storageArea: localStorage
    }));
    
    // Trigger custom event for immediate sync
    window.dispatchEvent(new CustomEvent('subscription-sync', {
      detail: { plan: newPlan, timestamp: Date.now() }
    }));
  }, []);

  // Listen for real-time subscription changes
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    console.log('🔄 M1SSION™ Setting up universal subscription sync for user:', user.id);

    // Subscribe to profiles table changes
    const profilesChannel = supabase
      .channel(`profiles-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 M1SSION™ REALTIME PROFILE UPDATE:', payload);
          const newTier = payload.new?.subscription_tier || payload.new?.tier;
          if (newTier) {
            triggerGlobalSync(newTier);
          }
        }
      )
      .subscribe();

    // Subscribe to subscriptions table changes
    const subscriptionsChannel = supabase
      .channel(`subscriptions-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 M1SSION™ REALTIME SUBSCRIPTION UPDATE:', payload);
          const newTier = (payload.new as any)?.tier;
          if (newTier) {
            triggerGlobalSync(newTier);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [getCurrentUser, triggerGlobalSync]);

  return { triggerGlobalSync };
};