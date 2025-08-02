// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useEffect } from 'react';
import { useProfileRealtime } from '@/hooks/useProfileRealtime';
import { supabase } from '@/integrations/supabase/client';

/**
 * Global real-time synchronization hook
 * Manages real-time updates for all user data changes
 */
export const useGlobalRealTimeSync = () => {
  const { profileData } = useProfileRealtime();

  useEffect(() => {
    console.log('🌐 Global Real-Time Sync: Setting up channels');

    // Setup real-time subscription for profile updates
    const profileChannel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileData?.id}`
        },
        (payload) => {
          console.log('📡 Real-time profile update received:', payload);
          
          // Dispatch custom event for profile sync
          const syncEvent = new CustomEvent('profile-sync', {
            detail: payload.new || payload.old
          });
          window.dispatchEvent(syncEvent);
          
          // Update localStorage for immediate consistency
          if (payload.new) {
            const newData = payload.new as any;
            if (newData?.full_name) {
              localStorage.setItem('profileName', newData.full_name);
              localStorage.setItem('agentName', newData.full_name);
            }
            if (newData?.avatar_url) {
              localStorage.setItem('profileImage', newData.avatar_url);
            }
            if (newData?.agent_code) {
              localStorage.setItem('agentCode', newData.agent_code);
            }
          }
          
          // Trigger storage event for localStorage listeners
          window.dispatchEvent(new Event('storage'));
        }
      )
      .subscribe();

    // Setup real-time subscription for settings updates
    const settingsChannel = supabase
      .channel('settings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${profileData?.id}`
        },
        (payload) => {
          console.log('📡 Real-time settings update received:', payload);
          
          // Dispatch custom event for settings sync
          const settingsEvent = new CustomEvent('settings-sync', {
            detail: payload.new || payload.old
          });
          window.dispatchEvent(settingsEvent);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('🌐 Global Real-Time Sync: Cleaning up channels');
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [profileData?.id]);

  // Utility function to trigger manual sync
  const triggerManualSync = () => {
    console.log('🔄 Manual sync triggered');
    window.dispatchEvent(new Event('storage'));
    
    const manualSyncEvent = new CustomEvent('manual-sync', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(manualSyncEvent);
  };

  return {
    triggerManualSync,
    isConnected: true // Always return true since we're using Supabase realtime
  };
};