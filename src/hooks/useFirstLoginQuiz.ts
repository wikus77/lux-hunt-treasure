// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { shouldShowQuizAfterSkip, recordQuizSkip } from '@/utils/quizDailyGuard';

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

      // Client-side daily guard: if user skipped today, don't show quiz
      if (!shouldShowQuizAfterSkip()) {
        setNeedsQuiz(false);
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
          .maybeSingle();

        if (error) {
          console.error('Error checking quiz status:', error);
          setNeedsQuiz(false);
        } else if (!profile) {
          // Profile doesn't exist yet, show quiz
          setNeedsQuiz(true);
        } else {
          // If user has completed quiz with investigative_style, never show again
          if (profile?.investigative_style) {
            setNeedsQuiz(false);
          } 
          // If user has skipped quiz (first_login_completed but no investigative_style)
          else if (profile?.first_login_completed) {
            // Check if a day has passed since last skip
            const shouldShow = shouldShowQuizAfterSkip();
            setNeedsQuiz(shouldShow);
            console.log('📊 Quiz daily check:', shouldShow ? 'SHOW (new day)' : 'SKIP (same day)');
          }
          // First time user, always show
          else {
            setNeedsQuiz(true);
          }
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

  const markQuizSkipped = () => {
    recordQuizSkip();
    setNeedsQuiz(false);
  };

  return {
    needsQuiz,
    isLoading,
    markQuizCompleted,
    markQuizSkipped
  };
};