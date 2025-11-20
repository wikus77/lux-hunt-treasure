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

        // Get user profile with only existing fields
        const { data: userProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, role, created_at')
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

        // Default: grant access (simplified logic)
        setState({
          canAccess: true,
          isLoading: false,
          accessStartDate: new Date(),
          subscriptionPlan: 'free',
          status: 'active',
          timeUntilAccess: null
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