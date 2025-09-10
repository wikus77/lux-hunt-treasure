// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { setAppBadgeSafe, isBadgeAPISupported } from '@/utils/appBadge';
import { updateDiagnostics, logDiagnosticError } from '@/utils/notificationDiagnostics';
// Import badge test utilities for development
import '@/utils/badgeTestUtils';
import '@/utils/consoleBadgeHelpers';

interface NotificationCounter {
  user_id: string;
  unread_count: number;
  updated_at: string;
}

// Debug logging for development
const isDev = import.meta.env.DEV;
const log = (message: string, data?: any) => {
  if (isDev) {
    console.log(`🔔 [UnreadNotifications] ${message}`, data || '');
  }
};

// Diagnostic interface for development
if (isDev && typeof window !== 'undefined') {
  window.__M1_DIAG__ = window.__M1_DIAG__ || {};
}

export const useUnreadNotifications = () => {
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const channelRef = useRef<any>(null);
  const pollingRef = useRef<number | null>(null);
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  // Badge API feature detection and management
  const [badgeApiSupported, setBadgeApiSupported] = useState(false);

  useEffect(() => {
    // Feature detect Badge API
    const isSupported = isBadgeAPISupported();
    setBadgeApiSupported(isSupported);
    
    // Update diagnostics
    updateDiagnostics({
      badgeApiSupported: isSupported,
      lastSyncAt: Date.now()
    });
    
    if (isDev) {
      log('Badge API supported:', isSupported);
    }
  }, []);

  // Update app badge (where supported)
  const updateAppBadge = useCallback(async (count: number) => {
    try {
      const success = await setAppBadgeSafe(count);
      
      // Update diagnostics
      updateDiagnostics({
        lastBadgeUpdate: { count, timestamp: Date.now() }
      });
      
      if (isDev) {
        log(`BadgeAPI: ${success ? 'success' : 'failed'} - ${count}`);
      }
      
      return success;
    } catch (err) {
      logDiagnosticError(`Badge update failed: ${String(err)}`, 'updateAppBadge');
      return false;
    }
  }, []);

  // Persist count to localStorage for quick render
  const persistCount = useCallback((count: number) => {
    try {
      localStorage.setItem('m1_unread_count', count.toString());
    } catch (err) {
      // Silent fail
    }
  }, []);

  // Load persisted count
  const loadPersistedCount = useCallback(() => {
    try {
      const saved = localStorage.getItem('m1_unread_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }, []);

  // Fetch current unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get count from notification_counters first
      const { data: counterData, error: counterError } = await supabase
        .from('notification_counters')
        .select('unread_count')
        .eq('user_id', userId)
        .maybeSingle();

      if (counterError) {
        log('Error fetching counter:', counterError);
        setError(counterError.message);
        return;
      }

      const count = counterData?.unread_count || 0;
      setUnreadCount(count);
      persistCount(count);
      await updateAppBadge(count);
      
      // Update diagnostics
      updateDiagnostics({
        unreadCount: count,
        lastSyncAt: Date.now()
      });
      
      log('Fetched unread count:', count);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log('Fetch error:', err);
      setError(message);
      logDiagnosticError(message, 'fetchUnreadCount');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, persistCount, updateAppBadge]);

  // Debounced count setter to prevent flicker
  const debounceTimerRef = useRef<number | null>(null);
  
  const debouncedSetCount = useCallback((count: number) => {
    // 250ms debounce to prevent rapid updates from causing flicker
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      setUnreadCount(count);
      persistCount(count);
      updateAppBadge(count);
      
      // Update diagnostics
      updateDiagnostics({
        unreadCount: count,
        lastSyncAt: Date.now()
      });
      
      debounceTimerRef.current = null;
    }, 250);
  }, [persistCount, updateAppBadge]);

  // Set up realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      // Clean up subscription if not authenticated
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Create realtime subscription for notification counter changes
    const channel = supabase
      .channel(`notification_counter_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notification_counters',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          log('Realtime update received:', payload);
          
          const newData = payload.new as NotificationCounter;
          if (newData) {
            const newCount = newData.unread_count || 0;
            
            // Use debounced setter to prevent flicker
            debouncedSetCount(newCount);
            
            // Update diagnostics with realtime info
            updateDiagnostics({
              lastRealtimeUpdate: {
                count: newCount,
                timestamp: Date.now(),
                payload
              },
              realtimeConnected: true
            });
            
            log(`Realtime: unread_count -> ${newCount}`);
          }
        }
      )
      .subscribe((status) => {
        log('Realtime subscription status:', status);
        
        // Update diagnostics with connection status
        updateDiagnostics({
          realtimeConnected: status === 'SUBSCRIBED'
        });
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          logDiagnosticError(`Realtime error: ${status}`, 'subscription');
          // Start fallback polling on realtime failure
          if (!pollingRef.current) {
            pollingRef.current = window.setInterval(() => {
              if (document.visibilityState === 'visible') {
                log('Realtime failed, using fallback polling');
                fetchUnreadCount();
              }
            }, 30000); // More frequent polling when realtime fails
          }
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, userId, debouncedSetCount]);

  // Initial load and app lifecycle management
  useEffect(() => {
    // Load persisted count immediately for quick render
    const persistedCount = loadPersistedCount();
    if (persistedCount > 0) {
      setUnreadCount(persistedCount);
    }

    // Fetch fresh count
    fetchUnreadCount();

    // Handle app visibility changes (resume from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        log('App became visible, fetching fresh count');
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, fetchUnreadCount, loadPersistedCount]);

  // Fallback polling mechanism (60s interval) in case realtime fails
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Start polling as fallback
    pollingRef.current = window.setInterval(() => {
      // Only poll if document is visible to save resources
      if (document.visibilityState === 'visible') {
        log('Fallback polling: fetching count');
        fetchUnreadCount();
      }
    }, 60000); // 60 seconds

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isAuthenticated, userId, fetchUnreadCount]);

  // Manual refresh function
  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Enhanced development diagnostics
  useEffect(() => {
    if (isDev && typeof window !== 'undefined') {
      window.__M1_BADGE__ = window.__M1_BADGE__ || {};
      window.__M1_BADGE__.get = () => ({
        unreadCount,
        lastUpdate: Date.now(),
        supportsIconBadge: badgeApiSupported,
        platform: navigator.userAgent.includes('iPhone') && window.navigator.standalone ? 'iosPWA' : 
                 navigator.userAgent.includes('Android') ? 'android' : 'desktop',
        isLoading,
        error,
        realtimeConnected: channelRef.current !== null,
        userId: userId?.slice(-8) + '...'
      });
      
      window.__M1_BADGE__.test = (n: number) => {
        log(`Manual test: setting count to ${n}`);
        setUnreadCount(n);
        persistCount(n);
        updateAppBadge(n);
        return `Set badge to ${n}`;
      };

      // Legacy diagnostic object for compatibility
      window.__M1_DIAG__ = window.__M1_DIAG__ || {};
      window.__M1_DIAG__.unreadNotifications = {
        currentCount: unreadCount,
        isLoading,
        error,
        badgeApiSupported,
        userId,
        refreshCount,
        getState: () => ({
          unreadCount,
          isLoading,
          error,
          badgeApiSupported,
          userId,
          realtimeConnected: channelRef.current !== null
        })
      };
    }
  }, [unreadCount, isLoading, error, badgeApiSupported, userId, refreshCount, persistCount, updateAppBadge]);

  return {
    unreadCount,
    isLoading,
    error,
    badgeApiSupported,
    refreshCount
  };
};