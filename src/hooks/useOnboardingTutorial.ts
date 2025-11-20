// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hook per gestire lo stato del tutorial onboarding
// @ts-nocheck

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

const LOCALSTORAGE_KEY = 'm1_onboarding_hidden';

export const useOnboardingTutorial = () => {
  const { user } = useAuthContext();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        console.log('🔍 [TUTORIAL-DEBUG] Starting check, user.id:', user?.id);
        
        if (user?.id) {
          // User authenticated: check Supabase
          console.log('🔍 [TUTORIAL-DEBUG] Calling RPC get_user_flags for user:', user.id);
          const { data, error } = await supabase.rpc('get_user_flags');

          if (error) {
            console.warn('⚠️ [TUTORIAL] Error fetching flags, fallback to localStorage:', error);
            const hidden = localStorage.getItem(LOCALSTORAGE_KEY) === '1';
            console.log('🔍 [TUTORIAL-DEBUG] Fallback localStorage value:', hidden);
            setShowTutorial(!hidden);
          } else {
            const hideFlag = data?.[0]?.hide_tutorial ?? false;
            console.log('🔍 [TUTORIAL-DEBUG] RPC response data:', data);
            console.log('🔍 [TUTORIAL-DEBUG] hideFlag value:', hideFlag, 'type:', typeof hideFlag);
            setShowTutorial(!hideFlag);
            console.log('🎓 [TUTORIAL] Supabase flag:', hideFlag, 'Show:', !hideFlag);
          }
        } else {
          // User not authenticated: check localStorage
          const hidden = localStorage.getItem(LOCALSTORAGE_KEY) === '1';
          console.log('🔍 [TUTORIAL-DEBUG] No user, localStorage value:', hidden);
          setShowTutorial(!hidden);
          console.log('🎓 [TUTORIAL] LocalStorage flag:', hidden, 'Show:', !hidden);
        }
      } catch (err) {
        console.error('❌ [TUTORIAL] Unexpected error:', err);
        setShowTutorial(false);
      } finally {
        setIsLoading(false);
        console.log('🔍 [TUTORIAL-DEBUG] Check complete, isLoading set to false');
      }
    };

    checkTutorialStatus();
  }, [user?.id]);

  const hideTutorialForever = async () => {
    try {
      if (user?.id) {
        // Save to Supabase
        const { error } = await supabase.rpc('set_hide_tutorial', { p_hide: true });
        if (error) {
          console.error('❌ [TUTORIAL] Error setting flag in Supabase:', error);
        } else {
          console.log('✅ [TUTORIAL] Flag saved to Supabase');
        }
      }

      // Always save to localStorage as fallback
      localStorage.setItem(LOCALSTORAGE_KEY, '1');
      setShowTutorial(false);
      console.log('✅ [TUTORIAL] Hidden forever');
    } catch (err) {
      console.error('❌ [TUTORIAL] Error hiding tutorial:', err);
    }
  };

  return {
    showTutorial,
    isLoading,
    hideTutorialForever,
  };
};
