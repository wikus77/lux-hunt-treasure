// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const useFirstLoginQuiz = () => {
  const [needsQuiz, setNeedsQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();

  useEffect(() => {
    const checkQuizStatus = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const user = getCurrentUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_login_completed, investigative_style')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking quiz status:', error);
          setNeedsQuiz(false);
        } else {
          // User needs quiz if they haven't completed first login or don't have an investigative style
          setNeedsQuiz(!profile?.first_login_completed || !profile?.investigative_style);
        }
      } catch (error) {
        console.error('Error in checkQuizStatus:', error);
        setNeedsQuiz(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkQuizStatus();
  }, [isAuthenticated, getCurrentUser]);

  const markQuizCompleted = () => {
    setNeedsQuiz(false);
  };

  return {
    needsQuiz,
    isLoading,
    markQuizCompleted
  };
};