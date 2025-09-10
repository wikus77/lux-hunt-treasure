// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Badge Testing Utilities for Development

import { supabase } from '@/integrations/supabase/client';

// Test utilities for badge functionality
export const badgeTestUtils = {
  // Quick increment badge for testing (gets current user automatically)
  async incrementBadge(delta: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'increment', delta }
      });
      
      if (error) {
        console.error('🔴 Increment badge error:', error);
        return false;
      }
      
      console.log('✅ Badge incremented:', data);
      return true;
    } catch (err) {
      console.error('❌ Badge increment failed:', err);
      return false;
    }
  },

  // Quick decrement badge for testing (gets current user automatically)
  async decrementBadge(delta: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'decrement', delta }
      });
      
      if (error) {
        console.error('🔴 Decrement badge error:', error);
        return false;
      }
      
      console.log('✅ Badge decremented:', data);
      return true;
    } catch (err) {
      console.error('❌ Badge decrement failed:', err);
      return false;
    }
  },

  // Clear all unread notifications (gets current user automatically)
  async clearBadge(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user');
        return false;
      }

      const { error } = await supabase
        .from('notification_counters')
        .upsert({ 
          user_id: user.id, 
          unread_count: 0,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('🔴 Clear badge error:', error);
        return false;
      }
      
      console.log('✅ Badge cleared');
      return true;
    } catch (err) {
      console.error('❌ Badge clear failed:', err);
      return false;
    }
  },

  // Test app icon badge directly (bypasses database)
  async testIconBadge(count: number = 5): Promise<string> {
    try {
      const canBadge = !!(navigator as any).setAppBadge;
      
      if (!canBadge) {
        return `❌ Badge API not supported on this platform`;
      }
      
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
        return `✅ App icon badge set to ${count}`;
      } else {
        await (navigator as any).clearAppBadge();
        return `✅ App icon badge cleared`;
      }
    } catch (err) {
      return `❌ Failed to set app icon badge: ${err}`;
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