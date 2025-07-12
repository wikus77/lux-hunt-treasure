
// ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useLocalStorage<string | null>('profileImage', null);
  
  // Load avatar from Supabase on mount
  useEffect(() => {
    const loadAvatarFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', session.user.id)
            .single();
            
          if (data?.avatar_url && !error) {
            setProfileImage(data.avatar_url);
          }
        }
      } catch (error) {
        console.error("Error loading avatar from Supabase:", error);
      }
    };
    
    loadAvatarFromSupabase();
  }, [setProfileImage]);
  
  return { 
    profileImage,
    setProfileImage
  };
};
