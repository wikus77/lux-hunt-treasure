// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ProfileData {
  id: string;
  full_name?: string;
  bio?: string;
  agent_code?: string;
  agent_title?: string;
  avatar_url?: string;
  email?: string;
  updated_at?: string;
}

export const useProfileRealtime = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Load initial profile data and setup realtime subscription
  useEffect(() => {
    let mounted = true;
    let realtimeChannel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        // Load initial data
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, bio, agent_code, agent_title, avatar_url, email, updated_at')
          .eq('id', session.user.id)
          .single();

        if (mounted && data && !error) {
          setProfileData(data);
        }

        // Setup realtime subscription for the current user's profile
        realtimeChannel = supabase
          .channel(`profile_changes_${session.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${session.user.id}`
            },
            (payload) => {
              console.log('Profile realtime update:', payload);
              if (mounted && payload.new) {
                const newData = payload.new as ProfileData;
                setProfileData(newData);
                
                // Update localStorage for immediate UI sync
                if (newData.full_name) {
                  localStorage.setItem('profileName', newData.full_name);
                }
                if (newData.bio) {
                  localStorage.setItem('profileBio', newData.bio);
                }
                if (newData.agent_code) {
                  localStorage.setItem('agentCode', newData.agent_code);
                }
                if (newData.avatar_url) {
                  localStorage.setItem('profileImage', newData.avatar_url);
                }
              }
            }
          )
          .subscribe((status) => {
            console.log('Profile realtime subscription status:', status);
          });

        setChannel(realtimeChannel);
        setIsLoading(false);

      } catch (error) {
        console.error('Error setting up profile realtime:', error);
        setIsLoading(false);
      }
    };

    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  // Update profile function that immediately updates local state
  const updateProfile = async (updates: Partial<ProfileData>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return null;

      // Immediately update local state for instant UI feedback
      setProfileData(prev => prev ? { ...prev, ...updates } : null);

      // Update Supabase (this will trigger realtime update)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        // Revert local state on error
        const { data: currentData } = await supabase
          .from('profiles')
          .select('id, full_name, bio, agent_code, agent_title, avatar_url, email, updated_at')
          .eq('id', session.user.id)
          .single();
        
        if (currentData) {
          setProfileData(currentData);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    profileData,
    isLoading,
    updateProfile,
    channel
  };
};