// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Subscription Sync Hook - Real-time State Management
// @ts-nocheck

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

interface SubscriptionState {
  plan: string;
  isLoading: boolean;
  lastUpdate: Date | null;
}

export const useSubscriptionSync = () => {
  const { user } = useAuthContext();
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    plan: 'Base',
    isLoading: true,
    lastUpdate: null
  });

  const syncSubscriptionState = useCallback(async () => {
    if (!user) {
      setSubscriptionState({
        plan: 'Base',
        isLoading: false,
        lastUpdate: new Date()
      });
      return;
    }

    try {
      // Silent sync - no verbose logging to reduce console noise
      
      // Check active subscription first (with error handling)
      const { data: activeSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      // Ignore subscription errors silently - table might not exist for all users
      if (subError) {
        // Silently skip subscription check, rely on profile
      }

      // Fallback to profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, tier')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        // Profile error is more critical, but still handle gracefully
        setSubscriptionState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      let finalPlan = 'Base';
      
      if (activeSubscription && activeSubscription.length > 0) {
        const sub = activeSubscription[0];
        const isExpired = sub.end_date && new Date(sub.end_date) < new Date();
        
        if (!isExpired) {
          finalPlan = sub.tier;
        }
      } else if (profileData?.subscription_tier) {
        finalPlan = profileData.subscription_tier;
      }
      
      // Developer override (NON-BLOCKING for downgrade testing)
      if (user?.email === 'wikus77@hotmail.it' && finalPlan === 'Base') {
        // Allow developer to downgrade for testing - no override to Titanium
        console.log('🔧 M1SSION™ DEV: Allowing downgrade to Base for testing');
      } else if (user?.email === 'wikus77@hotmail.it') {
        finalPlan = 'Titanium';
      }

      setSubscriptionState({
        plan: finalPlan,
        isLoading: false,
        lastUpdate: new Date()
      });
      
    } catch (error) {
      // Silent error handling - don't flood console
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        lastUpdate: new Date()
      }));
    }
  }, [user]);

  // Auto-sync every 60 seconds + realtime updates (reduced from 15s to prevent API overload)
  useEffect(() => {
    if (!user) return;

    // Initial sync with small delay to batch with other initial loads
    const initialTimeout = setTimeout(syncSubscriptionState, 500);

    // Polling every 60 seconds (reduced to prevent ERR_INSUFFICIENT_RESOURCES)
    const interval = setInterval(syncSubscriptionState, 60000);

    // Realtime subscription to subscriptions table
    const subscription = supabase
      .channel('subscription-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 M1SSION™ REALTIME: Subscription change detected, syncing...');
          syncSubscriptionState();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          console.log('🔄 M1SSION™ REALTIME: Profile change detected, syncing...');
          syncSubscriptionState();
        }
      )
      .subscribe();

    // Storage event listener for cross-tab sync
    const handleStorageChange = () => {
      syncSubscriptionState();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      supabase.removeChannel(subscription);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, syncSubscriptionState]);

  return {
    currentPlan: subscriptionState.plan,
    isLoading: subscriptionState.isLoading,
    lastUpdate: subscriptionState.lastUpdate,
    forceSync: syncSubscriptionState
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™