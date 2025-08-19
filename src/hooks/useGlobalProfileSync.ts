// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import { useEffect } from 'react';
import { useProfileRealtime } from '@/hooks/useProfileRealtime';

/**
 * Global profile synchronization hook
 * Ensures all components stay in sync with real-time profile updates
 */
export const useGlobalProfileSync = () => {
  const { profileData } = useProfileRealtime();

  useEffect(() => {
    if (profileData) {
      console.log('🌐 Global profile sync triggered:', profileData);
      
      // Trigger custom events for components to update
      const syncEvent = new CustomEvent('profile-sync', {
        detail: profileData
      });
      
      window.dispatchEvent(syncEvent);
      
      // Also update localStorage for immediate UI consistency
      if (profileData.full_name) {
        localStorage.setItem('profileName', profileData.full_name);
        localStorage.setItem('agentName', profileData.full_name);
        console.log('🌐 Global profile sync: Updated localStorage with name:', profileData.full_name);
      }
      if (profileData.bio) {
        localStorage.setItem('profileBio', profileData.bio);
      }
      if (profileData.agent_code) {
        localStorage.setItem('agentCode', profileData.agent_code);
      }
      if (profileData.avatar_url) {
        localStorage.setItem('profileImage', profileData.avatar_url);
      }
      
      // Force a storage event to update components that listen to localStorage
      window.dispatchEvent(new Event('storage'));
    }
  }, [profileData]);

  return profileData;
};