// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Realtime Context Updates - Debounced refresh on clues/notifications

import { supabase } from '@/integrations/supabase/client';
import { refreshContext } from './aiContext';

let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;

/**
 * Debounced context refresh
 */
function debouncedRefresh() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    refreshContext().catch(console.error);
  }, DEBOUNCE_MS);
}

/**
 * Subscribe to realtime updates on user_clues and user_notifications
 */
export function setupRealtimeSubscriptions() {
  let userId: string | undefined;
  
  // Get user ID first
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    userId = user.id;
    
    // Subscribe to clues changes
    const cluesChannel = supabase
      .channel('user_clues_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_clues',
          filter: `user_id=eq.${userId}`
        },
        () => {
          debouncedRefresh();
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('user_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          debouncedRefresh();
        }
      )
      .subscribe();

    // Store cleanup
    (window as any).__m1ssion_realtime_cleanup = () => {
      supabase.removeChannel(cluesChannel);
      supabase.removeChannel(notificationsChannel);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });

  // Return cleanup function
  return () => {
    if ((window as any).__m1ssion_realtime_cleanup) {
      (window as any).__m1ssion_realtime_cleanup();
    }
  };
}
