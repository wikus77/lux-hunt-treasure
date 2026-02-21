
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfileRealtime } from "@/hooks/useProfileRealtime";

const PROFILE_IMAGE_KEY = 'profileImage';

/** Safe read: profileImage is stored as plain URL string (no JSON). Handles corrupted or JSON-backed values. */
function safeGetProfileImage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_IMAGE_KEY);
    if (raw == null || raw === '') return null;
    // Plain URL written by ProfileInfo / others
    if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://')))
      return raw;
    // Backwards compat: some code may have written JSON string
    if (typeof raw === 'string' && (raw.startsWith('"') || raw.startsWith('{'))) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string' && parsed.startsWith('http')) return parsed;
    }
    window.localStorage.removeItem(PROFILE_IMAGE_KEY);
    console.warn('[AvatarSync] corrupted_value_removed key=', PROFILE_IMAGE_KEY);
    return null;
  } catch (e) {
    try { window.localStorage.removeItem(PROFILE_IMAGE_KEY); } catch (_) {}
    console.warn('[AvatarSync] safeGet failed', e);
    return null;
  }
}

/** Safe write: store as plain string URL. Do not use JSON. */
export function safeSetProfileImage(value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value == null || value === '') {
      window.localStorage.removeItem(PROFILE_IMAGE_KEY);
    } else {
      window.localStorage.setItem(PROFILE_IMAGE_KEY, value);
    }
  } catch (e) {
    console.warn('[AvatarSync] localStorage_write_failed', e);
  }
}

export const useProfileImage = () => {
  const [profileImage, setProfileImageState] = useState<string | null>(safeGetProfileImage);
  const { profileData: realtimeProfile } = useProfileRealtime();

  const setProfileImage = (value: string | null) => {
    setProfileImageState(value);
    safeSetProfileImage(value);
  };

  // Sync with realtime profile image updates
  useEffect(() => {
    if (realtimeProfile?.avatar_url) {
      setProfileImageState(realtimeProfile.avatar_url);
      safeSetProfileImage(realtimeProfile.avatar_url);
    }
  }, [realtimeProfile?.avatar_url]);

  // Cache-bust for UI only (no querystring in DB)
  const avatarDisplayUrl = profileImage
    ? `${profileImage}${profileImage.includes('?') ? '&' : '?'}v=${realtimeProfile?.updated_at ?? ''}`
    : null;

  const saveImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const fileName = `${session.user.id}.jpg`;
      const filePath = `profiles/${fileName}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error("Error saving image to storage:", error);
      return null;
    }
  };

  return {
    profileImage,
    avatarDisplayUrl,
    setProfileImage,
    saveImageToStorage
  };
};
