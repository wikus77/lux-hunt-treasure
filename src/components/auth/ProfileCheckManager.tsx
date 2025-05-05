
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCheckManagerProps {
  userId: string | null;
  onProfileComplete: () => void;
  onProfileIncomplete: () => void;
}

export const ProfileCheckManager: React.FC<ProfileCheckManagerProps> = ({
  userId,
  onProfileComplete,
  onProfileIncomplete
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) return;
      
      try {
        // Check in database if the user has already an investigative style
        const { data, error } = await supabase
          .from('profiles')
          .select('investigative_style')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error("Errore nel recuperare il profilo:", error);
        }
        
        // If the user has an investigative style in the database, mark quiz as completed
        if (data?.investigative_style) {
          localStorage.setItem("userProfileType", data.investigative_style);
          onProfileComplete();
          navigate("/home");
        } else {
          // Check in localStorage as fallback
          const storedProfile = localStorage.getItem("userProfileType");
          if (storedProfile) {
            onProfileComplete();
            navigate("/home");
          } else {
            onProfileIncomplete();
          }
        }
      } catch (error) {
        console.error("Errore nel controllo del profilo:", error);
        onProfileIncomplete();
      }
    };
    
    if (userId) {
      checkProfile();
    }
  }, [userId, onProfileComplete, onProfileIncomplete, navigate]);

  return null; // This is a logic component, it doesn't render anything
};

export default ProfileCheckManager;
