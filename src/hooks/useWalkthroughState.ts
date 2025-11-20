// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export type WalkthroughType = 'buzz' | 'buzz_map';

interface WalkthroughState {
  buzzCompleted: boolean;
  buzzMapCompleted: boolean;
  buzzStep: number;
  buzzMapStep: number;
  loading: boolean;
}

export function useWalkthroughState() {
  const { user } = useAuthContext();
  const [state, setState] = useState<WalkthroughState>({
    buzzCompleted: false,
    buzzMapCompleted: false,
    buzzStep: 0,
    buzzMapStep: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user?.id) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    loadWalkthroughState();
  }, [user?.id]);

  const loadWalkthroughState = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('buzz_walkthrough_completed, buzz_map_walkthrough_completed, walkthrough_step_buzz, walkthrough_step_buzz_map')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setState({
        buzzCompleted: data?.buzz_walkthrough_completed || false,
        buzzMapCompleted: data?.buzz_map_walkthrough_completed || false,
        buzzStep: data?.walkthrough_step_buzz || 0,
        buzzMapStep: data?.walkthrough_step_buzz_map || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading walkthrough state:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateStep = async (type: WalkthroughType, step: number) => {
    if (!user?.id) return;

    const column = type === 'buzz' ? 'walkthrough_step_buzz' : 'walkthrough_step_buzz_map';

    try {
      await supabase
        .from('profiles')
        .update({ [column]: step })
        .eq('id', user.id);

      setState(prev => ({
        ...prev,
        [type === 'buzz' ? 'buzzStep' : 'buzzMapStep']: step,
      }));
    } catch (error) {
      console.error('Error updating walkthrough step:', error);
    }
  };

  const completeWalkthrough = async (type: WalkthroughType) => {
    if (!user?.id) return;

    const completedColumn = type === 'buzz' ? 'buzz_walkthrough_completed' : 'buzz_map_walkthrough_completed';
    const stepColumn = type === 'buzz' ? 'walkthrough_step_buzz' : 'walkthrough_step_buzz_map';

    try {
      await supabase
        .from('profiles')
        .update({ 
          [completedColumn]: true,
          [stepColumn]: 5 
        })
        .eq('id', user.id);

      setState(prev => ({
        ...prev,
        [type === 'buzz' ? 'buzzCompleted' : 'buzzMapCompleted']: true,
        [type === 'buzz' ? 'buzzStep' : 'buzzMapStep']: 5,
      }));
    } catch (error) {
      console.error('Error completing walkthrough:', error);
    }
  };

  const skipWalkthrough = async (type: WalkthroughType) => {
    await completeWalkthrough(type);
  };

  return {
    ...state,
    updateStep,
    completeWalkthrough,
    skipWalkthrough,
    refresh: loadWalkthroughState,
  };
}
