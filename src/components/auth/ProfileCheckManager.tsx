
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      console.log("Checking profile status for user:", userId);
      
      try {
        // Query the profiles table to check if the user has completed the quiz
        const { data, error } = await supabase
          .from('profiles')
          .select('investigative_style')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error("Error fetching profile data:", error);
          onProfileIncomplete();
          return;
        }
        
        // If investigative_style exists, the user has completed the quiz
        if (data && data.investigative_style) {
          console.log("User has completed profile setup with style:", data.investigative_style);
          onProfileComplete();
        } else {
          console.log("User has not completed profile setup");
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
