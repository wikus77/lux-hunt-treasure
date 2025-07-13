
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
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

      // Update profile with new avatar URL
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

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
