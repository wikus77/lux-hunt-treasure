// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Subscription Sync Hook - Real-time State Management

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
      console.log('🔄 M1SSION™ SUBSCRIPTION SYNC: Starting sync...');
      
      // Check active subscription first
      const { data: activeSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      // Fallback to profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_tier, tier')
        .eq('id', user.id)
        .single();

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

      console.log('✅ M1SSION™ SUBSCRIPTION SYNC: Plan synced to', finalPlan);
      
    } catch (error) {
      console.error('❌ M1SSION™ SUBSCRIPTION SYNC ERROR:', error);
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        lastUpdate: new Date()
      }));
    }
  }, [user]);

  // Auto-sync every 15 seconds + realtime updates
  useEffect(() => {
    if (!user) return;

    // Initial sync
    syncSubscriptionState();

    // Polling every 15 seconds
    const interval = setInterval(syncSubscriptionState, 15000);

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