// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Global Real-Time Synchronization Hook
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

/**
 * Global real-time synchronization hook
 * Syncs ALL critical app data in real-time across components
 */
export const useGlobalRealTimeSync = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.id) return;

    console.log('🌐 GLOBAL SYNC: Setting up real-time subscriptions for user:', user.id);

    // Create multiple channels for different data types
    const notificationsChannel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 GLOBAL SYNC: Notifications updated', payload);
          // Dispatch custom event for components to listen
          window.dispatchEvent(new CustomEvent('notificationsUpdated', { 
            detail: payload 
          }));
        }
      )
      .subscribe();

    const buzzMapChannel = supabase
      .channel(`buzz_map_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_map_areas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🗺️ GLOBAL SYNC: Map areas updated', payload);
          window.dispatchEvent(new CustomEvent('mapAreasUpdated', { 
            detail: payload 
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buzz_map_actions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('⚡ GLOBAL SYNC: BUZZ actions updated', payload);
          window.dispatchEvent(new CustomEvent('buzzActionsUpdated', { 
            detail: payload 
          }));
        }
      )
      .subscribe();

    const xpChannel = supabase
      .channel(`xp_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_xp',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🏆 GLOBAL SYNC: XP updated', payload);
          window.dispatchEvent(new CustomEvent('xpUpdated', { 
            detail: payload 
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💳 GLOBAL SYNC: Credits updated', payload);
          window.dispatchEvent(new CustomEvent('creditsUpdated', { 
            detail: payload 
          }));
        }
      )
      .subscribe();

    const markerChannel = supabase
      .channel(`markers_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marker_claims',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🎯 GLOBAL SYNC: Marker claims updated', payload);
          window.dispatchEvent(new CustomEvent('markerClaimsUpdated', { 
            detail: payload 
          }));
        }
      )
      .subscribe();

    return () => {
      console.log('🌐 GLOBAL SYNC: Unsubscribing from real-time channels');
      notificationsChannel.unsubscribe();
      buzzMapChannel.unsubscribe();
      xpChannel.unsubscribe();
      markerChannel.unsubscribe();
    };
  }, [user?.id]);

  // Manual sync trigger function
  const triggerManualSync = () => {
    console.log('🔄 GLOBAL SYNC: Manual sync triggered');
    window.dispatchEvent(new CustomEvent('manualSyncTriggered'));
  };

  return {
    triggerManualSync,
    isConnected: true // For now, always true
  };
};