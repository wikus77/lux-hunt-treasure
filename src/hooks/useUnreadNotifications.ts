// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import '@/types/global';

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
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  // Badge API feature detection and management
  const [badgeApiSupported, setBadgeApiSupported] = useState(false);

  useEffect(() => {
    // Feature detect Badge API
    const isSupported = 'setAppBadge' in navigator;
    setBadgeApiSupported(isSupported);
    
    if (isDev) {
      log('Badge API supported:', isSupported);
    }
  }, []);

  // Update app badge (where supported)
  const updateAppBadge = useCallback(async (count: number) => {
    if (!badgeApiSupported) return;

    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
        if (isDev) {
          log(`BadgeAPI: set ${count}`);
          if (window.__M1_DIAG__) {
            window.__M1_DIAG__.lastBadgeUpdate = { count, timestamp: Date.now() };
          }
        }
      } else {
        await navigator.clearAppBadge();
        if (isDev) {
          log('BadgeAPI: clear');
          if (window.__M1_DIAG__) {
            window.__M1_DIAG__.lastBadgeUpdate = { count: 0, timestamp: Date.now() };
          }
        }
      }
    } catch (err) {
      // Silent fail with dev logging
      if (isDev) {
        log('BadgeAPI error:', err);
        if (window.__M1_DIAG__) {
          window.__M1_DIAG__.badgeApiError = { error: String(err), timestamp: Date.now() };
        }
      }
    }
  }, [badgeApiSupported]);

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
      
      log('Fetched unread count:', count);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log('Fetch error:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, persistCount, updateAppBadge]);

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
            setUnreadCount(newCount);
            persistCount(newCount);
            updateAppBadge(newCount);
            
            log(`Realtime: unread_count -> ${newCount}`);
            
            if (isDev && window.__M1_DIAG__) {
              window.__M1_DIAG__.lastRealtimeUpdate = {
                count: newCount,
                timestamp: Date.now(),
                payload
              };
            }
          }
        }
      )
      .subscribe((status) => {
        log('Realtime subscription status:', status);
        
        if (isDev && window.__M1_DIAG__) {
          window.__M1_DIAG__.realtimeStatus = status;
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, userId, persistCount, updateAppBadge]);

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

  // Manual refresh function
  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Development diagnostics
  useEffect(() => {
    if (isDev && window.__M1_DIAG__) {
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
  }, [unreadCount, isLoading, error, badgeApiSupported, userId, refreshCount]);

  return {
    unreadCount,
    isLoading,
    error,
    badgeApiSupported,
    refreshCount
  };
};