// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Badge Testing Utilities for Development

import { supabase } from '@/integrations/supabase/client';

// Test utilities for badge functionality
export const badgeTestUtils = {
  // Simulate adding a notification to increment badge
  async incrementBadge(userId: string, delta: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'increment', delta }
      });
      
      if (error) {
        console.error('Increment badge error:', error);
        return false;
      }
      
      console.log('Badge incremented:', data);
      return true;
    } catch (err) {
      console.error('Badge increment failed:', err);
      return false;
    }
  },

  // Simulate reading notifications to decrement badge
  async decrementBadge(userId: string, delta: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'decrement', delta }
      });
      
      if (error) {
        console.error('Decrement badge error:', error);
        return false;
      }
      
      console.log('Badge decremented:', data);
      return true;
    } catch (err) {
      console.error('Badge decrement failed:', err);
      return false;
    }
  },

  // Clear all unread notifications
  async clearBadge(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_counters')
        .upsert({ 
          user_id: userId, 
          unread_count: 0,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Clear badge error:', error);
        return false;
      }
      
      console.log('Badge cleared');
      return true;
    } catch (err) {
      console.error('Badge clear failed:', err);
      return false;
    }
  },

  // Get current diagnostics
  getDiagnostics() {
    if (typeof window !== 'undefined') {
      return {
        badge: window.__M1_BADGE__?.get?.() || {},
        notifications: window.__M1_NOTIFICATIONS_DIAG__ || {},
        general: window.__M1_DIAG__ || {}
      };
    }
    return null;
  }
};

// Expose to window for development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__M1_BADGE_TEST__ = badgeTestUtils;
}

declare global {
  interface Window {
    __M1_BADGE_TEST__?: typeof badgeTestUtils;
  }
}