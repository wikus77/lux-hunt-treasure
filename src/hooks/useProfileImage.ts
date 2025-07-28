
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfileRealtime } from "@/hooks/useProfileRealtime";

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useLocalStorage<string | null>('profileImage', null);
  const { profileData: realtimeProfile } = useProfileRealtime();
  
  // Sync with realtime profile image updates
  useEffect(() => {
    if (realtimeProfile?.avatar_url) {
      setProfileImage(realtimeProfile.avatar_url);
    }
  }, [realtimeProfile?.avatar_url, setProfileImage]);

  // Save image to Supabase Storage
  const saveImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const fileName = `${session.user.id}.jpg`;
      const filePath = `profiles/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL (handled via realtime in calling component)
      // This function is kept for backwards compatibility

      return publicUrl;
    } catch (error) {
      console.error("Error saving image to storage:", error);
      return null;
    }
  };
  
  return { 
    profileImage,
    setProfileImage,
    saveImageToStorage
  };
};
