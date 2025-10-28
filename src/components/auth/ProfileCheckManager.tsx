
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { shouldShowQuizAfterSkip } from '@/utils/quizDailyGuard';

interface ProfileCheckManagerProps {
  userId: string;
  onProfileComplete: () => void;
  onProfileIncomplete: () => void;
}

export const ProfileCheckManager: React.FC<ProfileCheckManagerProps> = ({
  userId,
  onProfileComplete,
  onProfileIncomplete
}) => {
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!userId) {
        console.log("No user ID available for profile check");
        onProfileIncomplete();
        return;
      }

      // Daily local guard: if user skipped today, don't show quiz again today
      if (!shouldShowQuizAfterSkip(userId)) {
        console.log("Daily guard active - user skipped today, not showing quiz");
        onProfileComplete();
        return;
      }

      console.log("Checking profile status for user:", userId);
      
      try {
        // Query the profiles table to check if the user has completed the quiz
        const { data, error } = await supabase
          .from('profiles')
          .select('investigative_style, first_login_completed')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile data:", error);
          onProfileIncomplete();
          return;
        }
        
        // If investigative_style exists, the user has completed the quiz permanently
        if (data?.investigative_style) {
          console.log("User has completed profile setup with style:", data.investigative_style);
          onProfileComplete();
        } 
        // If user has skipped quiz before (first_login_completed but no investigative_style)
        else if (data?.first_login_completed) {
          // Check if a day has passed since last skip
          const shouldShow = shouldShowQuizAfterSkip(userId);
          if (shouldShow) {
            console.log("User skipped quiz before, but new day - showing quiz");
            onProfileIncomplete();
          } else {
            console.log("User skipped quiz today - not showing quiz");
            onProfileComplete();
          }
        }
        // First time user or no profile yet
        else {
          console.log("User has not completed profile setup - showing quiz");
          onProfileIncomplete();
        }
      } catch (error) {
        console.error("Unexpected error checking profile:", error);
        onProfileIncomplete();
      }
    };
    
    checkProfileStatus();
  }, [userId, onProfileComplete, onProfileIncomplete]);
  
  return null; // This is a logic component with no UI
};

export default ProfileCheckManager;
