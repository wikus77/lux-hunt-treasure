// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { getActiveSubscription } from '@/lib/subscriptions';

interface AccessControlState {
  canAccess: boolean;
  isLoading: boolean;
  accessStartDate: Date | null;
  subscriptionPlan: string;
  status: string;
  timeUntilAccess: number | null;
}

export const useAccessControl = (): AccessControlState => {
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const [state, setState] = useState<AccessControlState>({
    canAccess: false,
    isLoading: true,
    accessStartDate: null,
    subscriptionPlan: '',
    status: 'registered_pending',
    timeUntilAccess: null
  });

  useEffect(() => {
    const user = getCurrentUser();
    
    // 🚀 EMERGENCY ADMIN BYPASS - IMMEDIATE ACCESS
    if (user?.email === 'wikus77@hotmail.it') {
      console.log('🚀 useAccessControl - EMERGENCY ADMIN BYPASS');
      setState({
        canAccess: true,
        isLoading: false,
        accessStartDate: new Date(),
        subscriptionPlan: 'ADMIN',
        status: 'admin_emergency_access',
        timeUntilAccess: null
      });
      return;
    }
    
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, isLoading: false, canAccess: false }));
      return;
    }

    const checkAccess = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;

        // Get user profile with all necessary fields
        const { data: userProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('role, access_enabled, access_start_date, subscription_plan, status')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          return;
        }
        
        // Check for admin access using secure role check
        if (userProfile?.role === 'admin') {
          setState({
            canAccess: true,
            isLoading: false,
            accessStartDate: new Date(),
            subscriptionPlan: 'ADMIN',
            status: 'admin_access',
            timeUntilAccess: null
          });
          return;
        }

        // 🆓 FREE PLAN BYPASS - IMMEDIATE ACCESS (SOLUZIONE B)
        const rawPlan = userProfile.subscription_plan || '';
        const planLower = rawPlan.toLowerCase();
        if (!rawPlan || planLower.includes('free') || planLower.includes('base')) {
          console.log('🆓 useAccessControl - FREE/BASE/EMPTY PLAN BYPASS (Test mode)');
          setState({
            canAccess: true,
            isLoading: false,
            accessStartDate: new Date(),
            subscriptionPlan: rawPlan || 'free',
            status: 'free_access_enabled',
            timeUntilAccess: null
          });
          return;
        }

        // Fallback bypass: se la tabella subscriptions ha un FREE attivo → accesso immediato
        const activeSub = await getActiveSubscription(supabase, user.id);
        if (activeSub?.plan?.toLowerCase() === 'free') {
          console.log('🆓 useAccessControl - FREE BYPASS via subscriptions (Test mode)');
          setState({
            canAccess: true,
            isLoading: false,
            accessStartDate: new Date(),
            subscriptionPlan: 'free',
            status: 'free_access_enabled_subscriptions',
            timeUntilAccess: null
          });
          return;
        }

        // Check mission access via database function (solo per piani premium)
        const { data: canAccessData, error: accessError } = await supabase
          .rpc('can_user_access_mission', { user_id: user.id });

        if (accessError) {
          console.error('Error checking access:', accessError);
          return;
        }

        // Calculate access timing
        const accessStartDate = userProfile.access_start_date ? new Date(userProfile.access_start_date) : null;
        const now = new Date();
        const timeUntilAccess = accessStartDate ? Math.max(0, accessStartDate.getTime() - now.getTime()) : null;

        setState({
          canAccess: !!canAccessData,
          isLoading: false,
          accessStartDate,
          subscriptionPlan: userProfile.subscription_plan || '',
          status: userProfile.status || 'registered_pending',
          timeUntilAccess
        });

      } catch (error) {
        console.error('Access control error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAccess();
  }, [isAuthenticated, getCurrentUser]);

  return state;
};

export default useAccessControl;