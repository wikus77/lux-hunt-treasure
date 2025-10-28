// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { 
  shouldShowQuizAfterSkip, 
  recordQuizSkip, 
  recordQuizShown,
  recordQuizCompleted 
} from '@/utils/quizDailyGuard';

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

        const userId = user.id;

        // Client-side daily guard: if user skipped today, don't show quiz
        if (!shouldShowQuizAfterSkip(userId)) {
          setNeedsQuiz(false);
          setIsLoading(false);
          console.info('[AgentQuiz] Blocked by daily guard', { userId, route: '/home' });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_login_completed, investigative_style')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('[AgentQuiz] Error checking quiz status:', error);
          setNeedsQuiz(false);
        } else if (!profile) {
          // Profile doesn't exist yet, show quiz
          console.info('[AgentQuiz] Profile not found, showing quiz', { userId });
          setNeedsQuiz(true);
          recordQuizShown(userId);
        } else {
          // If user has completed quiz with investigative_style, never show again
          if (profile?.investigative_style) {
            console.info('[AgentQuiz] Quiz already completed', { 
              userId, 
              style: profile.investigative_style 
            });
            setNeedsQuiz(false);
            // Ensure completion is recorded in new system
            recordQuizCompleted(userId);
          } 
          // If user has skipped quiz (first_login_completed but no investigative_style)
          else if (profile?.first_login_completed) {
            // Check if a day has passed since last skip
            const shouldShow = shouldShowQuizAfterSkip(userId);
            setNeedsQuiz(shouldShow);
            if (shouldShow) {
              recordQuizShown(userId);
            }
            console.info('[AgentQuiz] Previously skipped, daily check', { 
              userId, 
              shouldShow: shouldShow ? 'SHOW (new day)' : 'SKIP (same day)',
              route: '/home'
            });
          }
          // First time user, always show
          else {
            console.info('[AgentQuiz] First time user, showing quiz', { userId });
            setNeedsQuiz(true);
            recordQuizShown(userId);
          }
        }
      } catch (error) {
        console.error('[AgentQuiz] Error in checkQuizStatus:', error);
        setNeedsQuiz(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkQuizStatus();
  }, [isAuthenticated, getCurrentUser]);

  const markQuizCompleted = () => {
    const user = getCurrentUser();
    if (user) {
      recordQuizCompleted(user.id);
    }
    setNeedsQuiz(false);
  };

  const markQuizSkipped = () => {
    const user = getCurrentUser();
    if (user) {
      recordQuizSkip(user.id);
    }
    setNeedsQuiz(false);
  };

  return {
    needsQuiz,
    isLoading,
    markQuizCompleted,
    markQuizSkipped
  };
};