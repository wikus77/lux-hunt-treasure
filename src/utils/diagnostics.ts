/**
 * © 2025 Joseph MULÉ – M1SSION™ Development Diagnostics
 * Funzioni diagnostic per debug preferenze e notifiche (solo se ?M1_DIAG=1)
 * NON TOCCA PUSH CHAIN
 */

import { 
  getCurrentPreferencesState, 
  resolveTagsForCurrentUser 
} from '@/interest/resolveUserInterests';
import { supabase } from '@/integrations/supabase/client';

// Interfaccia globale diagnostics (solo dev)
interface M1DiagPrefs {
  get(): Promise<Record<string, boolean>>;
  tags(): Promise<string[]>;
  refresh(): Promise<void>;
}

interface M1DiagNotifTest {
  triggerPrefFallback(): Promise<any>;
  checkQuota(): Promise<any>;
  testCandidates(): Promise<any>;
}

declare global {
  interface Window {
    __M1_PREFS__?: M1DiagPrefs;
    __M1_NOTIF_TEST__?: M1DiagNotifTest;
  }
}

/**
 * Inizializza diagnostics globali (solo se dev mode)
 */
export function initDiagnostics(): void {
  const isDev = window.location.search.includes('M1_DIAG=1') || 
                window.location.search.includes('M1_DIAG=true');
  
  if (!isDev) {
    return;
  }

  console.log('🔍 M1SSION™ Diagnostics enabled - use window.__M1_PREFS__ and window.__M1_NOTIF_TEST__');

  // M1_PREFS diagnostics
  window.__M1_PREFS__ = {
    async get() {
      try {
        const prefs = await getCurrentPreferencesState();
        console.log('🔍 PREFS: Current preferences:', prefs);
        return prefs;
      } catch (error) {
        console.error('🔍 PREFS: Error getting preferences:', error);
        return {};
      }
    },

    async tags() {
      try {
        const tags = await resolveTagsForCurrentUser();
        console.log('🔍 PREFS: Resolved tags:', tags);
        return tags;
      } catch (error) {
        console.error('🔍 PREFS: Error resolving tags:', error);
        return [];
      }
    },

    async refresh() {
      try {
        const [prefs, tags] = await Promise.all([
          getCurrentPreferencesState(),
          resolveTagsForCurrentUser()
        ]);
        console.log('🔍 PREFS: Refreshed - Preferences:', prefs, 'Tags:', tags);
      } catch (error) {
        console.error('🔍 PREFS: Error refreshing:', error);
      }
    }
  };

  // M1_NOTIF_TEST diagnostics
  window.__M1_NOTIF_TEST__ = {
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
}

/**
 * Cleanup diagnostics (chiamato su unmount)
 */
export function cleanupDiagnostics(): void {
  if (window.__M1_PREFS__) {
    delete window.__M1_PREFS__;
  }
  if (window.__M1_NOTIF_TEST__) {
    delete window.__M1_NOTIF_TEST__;
  }
}