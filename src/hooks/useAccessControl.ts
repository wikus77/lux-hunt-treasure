// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

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
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, isLoading: false, canAccess: false }));
      return;
    }

    const checkAccess = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;

        // Verifica con la funzione del database
        const { data: canAccessData, error: accessError } = await supabase
          .rpc('can_user_access_mission', { user_id: user.id });

        if (accessError) {
          console.error('Error checking access:', accessError);
          return;
        }

        // Ottieni i dettagli del profilo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('access_enabled, access_start_date, subscription_plan, status')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        const accessStartDate = profile.access_start_date ? new Date(profile.access_start_date) : null;
        const now = new Date();
        const timeUntilAccess = accessStartDate ? Math.max(0, accessStartDate.getTime() - now.getTime()) : null;

        setState({
          canAccess: !!canAccessData,
          isLoading: false,
          accessStartDate,
          subscriptionPlan: profile.subscription_plan || '',
          status: profile.status || 'registered_pending',
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