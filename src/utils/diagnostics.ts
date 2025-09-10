/**
 * © 2025 Joseph MULÉ – M1SSION™ Development Diagnostics
 * Enhanced diagnostics for notification testing (only if ?M1_DIAG=1)
 * DOES NOT TOUCH PUSH CHAIN
 */

import { 
  getCurrentPreferencesState, 
  resolveTagsForCurrentUser 
} from '@/interest/resolveUserInterests';
import { supabase } from '@/integrations/supabase/client';

// Enhanced interface for notification testing
interface M1DiagNotifTest {
  triggerPrefFallback(): Promise<any>;
  checkQuota(): Promise<any>;
  testCandidates(): Promise<any>;
  dryRunPref(userId?: string): Promise<any>;
}

declare global {
  interface Window {
    __M1_NOTIF_TEST__?: M1DiagNotifTest;
  }
}

/**
 * Test notification preferences flow without sending
 */
const dryRunPreferences = async (userId?: string): Promise<any> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      throw new Error('No user ID provided');
    }
    
    console.log(`🔍 [M1_NOTIF_TEST] Testing preferences for user ${targetUserId}...`);
    
    // Manual dry-run endpoint call (to be exposed by notifier-engine)
    const url = new URL(`https://vkjrqirvdvjbemsfzxof.functions.supabase.co/notifier-engine/dry-run`);
    url.searchParams.set('user_id', targetUserId);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('🔍 [M1_NOTIF_TEST] Dry-run result:', data);
    return data;
    
  } catch (error) {
    console.error('🔍 [M1_NOTIF_TEST] Exception:', error);
    return { error: error.message };
  }
};

/**
 * Initialize enhanced diagnostics helpers
 */
export const initDiagnostics = () => {
  const isDev = import.meta.env.DEV || location.search.includes('M1_DIAG=1');
  
  if (!isDev) return;

  console.log('🔍 M1SSION™ Enhanced Diagnostics enabled');

  // Enhanced M1_NOTIF_TEST with dry-run
  (window as any).__M1_NOTIF_TEST__ = {
    ...(window as any).__M1_NOTIF_TEST__,
    
    async dryRunPref(userId: string, max=5, cooldownHours?: number) {
      const qs = new URLSearchParams({ user_id:userId, max:String(max) });
      if (cooldownHours != null) qs.set('cooldown', String(cooldownHours));
      const res = await fetch('/functions/v1/notifier-engine/dry-run?' + qs.toString(), { method:'POST' });
      const json = await res.json();
      if (Array.isArray(json?.candidates)) {
        console.table(json.candidates.map((c:any)=>({id:c.id, score:c.score, locale:c.locale})));
      }
      return json;
    },
    
    async triggerPrefFallback() {
      try {
        console.log('🔍 TEST: Triggering preferences fallback test...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user');
        }

        // Test call to fn_candidates_for_user
        const { data: candidates, error } = await supabase
          .rpc('fn_candidates_for_user', {
            p_user_id: user.id,
            p_limit: 3
          });

        if (error) {
          console.error('🔍 TEST: Error getting candidates:', error);
          return { error: error.message };
        }

        console.log('🔍 TEST: Found', candidates?.length || 0, 'candidates:');
        console.table(candidates);

        return {
          success: true,
          user_id: user.id,
          candidates_count: candidates?.length || 0,
          candidates: candidates || []
        };
      } catch (error) {
        console.error('🔍 TEST: Error in triggerPrefFallback:', error);
        return { error: error.message };
      }
    },

    async checkQuota() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user');
        }

        const { data: quota, error } = await supabase
          .from('notification_quota')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const result = {
          user_id: user.id,
          quota: quota || 'No quota record',
          error: error?.message
        };

        console.log('🔍 TEST: User quota:', result);
        return result;
      } catch (error) {
        console.error('🔍 TEST: Error checking quota:', error);
        return { error: error.message };
      }
    },

    async testCandidates(userId?: string) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const targetUserId = userId || user?.id;
        
        if (!targetUserId) {
          throw new Error('No user ID provided');
        }

        console.log('🔍 TEST: Testing candidates for user:', targetUserId);

        // Check user resolved tags
        const { data: userTags, error: tagsError } = await supabase
          .from('v_user_resolved_tags')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        // Get recent feed items
        const { data: feedItems, error: feedError } = await supabase
          .from('external_feed_items')
          .select('id, title, tags, score, published_at')
          .gte('published_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
          .gte('score', 0.72)
          .order('published_at', { ascending: false })
          .limit(10);

        // Test the candidates function directly
        const { data: candidates, error: candidatesError } = await supabase
          .rpc('fn_candidates_for_user', {
            p_user_id: targetUserId,
            p_limit: 5
          });

        const result = {
          user_id: targetUserId,
          user_tags: userTags || 'No tags resolved',
          tags_error: tagsError?.message,
          feed_items_count: feedItems?.length || 0,
          feed_error: feedError?.message,
          recent_items: feedItems || [],
          candidates_count: candidates?.length || 0,
          candidates_error: candidatesError?.message,
          candidates: candidates || []
        };

        console.log('🔍 TEST: Candidates test result:', result);
        console.table(candidates);
        return result;
      } catch (error) {
        console.error('🔍 TEST: Error in testCandidates:', error);
        return { error: error.message };
      }
    }
  };
  
  console.log('🔍 [M1SSION DIAGNOSTICS] Available commands:');
  console.log('  - __M1_NOTIF_TEST__.dryRunPref("user-id") - Test notification preferences');
  console.log('  - __M1_NOTIF_TEST__.testCandidates() - Test candidates function');
  console.log('  - __M1_PUSH_TOGGLE__.refresh() - Refresh push toggle state');
  console.log('  - __M1_PUSH_TOGGLE__.get() - Get real push subscription status');
};

/**
 * Cleanup diagnostics (called on unmount)
 */
export function cleanupDiagnostics(): void {
  if (window.__M1_NOTIF_TEST__) {
    delete window.__M1_NOTIF_TEST__;
  }
}

export { dryRunPreferences };