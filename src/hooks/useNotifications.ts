import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { syncFromNotice } from "@/utils/appBadge";
import { updateBadgeState } from "@/utils/badgeDiagnostics";
import { testBadgeAPI } from "@/utils/pwaBadgeAudit";
import { syncAppIconBadge } from "@/utils/appIconBadgeSync";
import type { User } from "@supabase/supabase-js";

// 🔧 v4: Global cached user to prevent repeated auth.getUser() calls
let cachedUser: User | null = null;
let cachedUserTimestamp = 0;
const CACHE_TTL_MS = 30000; // Cache user for 30 seconds

async function getCachedUser(): Promise<User | null> {
  const now = Date.now();
  // Return cached user if valid
  if (cachedUser && (now - cachedUserTimestamp) < CACHE_TTL_MS) {
    return cachedUser;
  }
  // Fetch fresh user
  try {
    const { data } = await supabase.auth.getUser();
    cachedUser = data?.user || null;
    cachedUserTimestamp = now;
    return cachedUser;
  } catch (err) {
    console.warn('⚠️ getCachedUser failed:', err);
    return cachedUser; // Return stale cache on error
  }
}

// Tipizzazione
export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type?: string;
}

// Interfacce tipizzate per Supabase
interface UserNotificationRow {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
  user_id: string;
  is_deleted: boolean;
}

// Listener globale per sincronizzazione istantanea tra component
let listeners: (() => void)[] = [];

// Costanti per la gestione dello storage
const MAX_NOTIFICATIONS = 100;
const STORAGE_KEY = 'notifications';

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  LEADERBOARD: 'leaderboard_update',
  BUZZ: 'buzz',
  MAP_BUZZ: 'map_buzz',
  WEEKLY: 'weekly_summary',
  GENERIC: 'generic'
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReloadTimeRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Funzione sicura per salvare le notifiche
  const saveNotifications = useCallback((notifs: Notification[]) => {
    try {
      const limitedNotifs = notifs.slice(-MAX_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifs));
      return true;
    } catch (error) {
      console.error("Errore nel salvataggio delle notifiche:", error);
      return false;
    }
  }, []);

  // FIXED: Carica le notifiche da Supabase con polling più frequente (5s) e controlli migliorati
  const reloadNotifications = useCallback(async (force = false) => {
    // Controlla se la pagina è visibile - ottimizzazione polling
    if (!force && document.visibilityState !== 'visible') {
      console.log("⏸️ NOTIFICATIONS: Skipping reload - page not visible");
      return true;
    }

    const now = Date.now();
    // FIXED: Ridotto rate limiting da 3s a 1s per maggiore responsività
    if (!force && now - lastReloadTimeRef.current < 1000 && !isInitialLoadRef.current) {
      console.log("⏱️ NOTIFICATIONS: Skipping reload due to rate limiting");
      return true;
    }
    
    try {
      console.log("🔄 NOTIFICATIONS: Reloading notifications from Supabase...");
      
      if (isInitialLoadRef.current || now - lastReloadTimeRef.current > 1000) {
        setIsLoading(true);
      }
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // by Joseph Mulé – M1SSION™ – RESET_LOCALSTORAGE_110725
      // CRITICAL: Clear localStorage on reset - don't load old cached data
      console.log("🧹 NOTIFICATIONS: Clearing localStorage cache after DB reset");
      localStorage.removeItem(STORAGE_KEY);
      let notifs: Notification[] = [];
      
      // 🔧 v4: Use cached user to prevent request storms
      const user = await getCachedUser();
      if (user) {
        console.log("👤 NOTIFICATIONS: User authenticated, loading from Supabase...");
        const { data: supabaseNotifs, error } = await supabase
          .from('user_notifications')
          .select<'*', UserNotificationRow>('*')
          .eq('is_deleted', false)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("❌ NOTIFICATIONS: Error fetching from Supabase:", error);
        } else if (supabaseNotifs && supabaseNotifs.length > 0) {
          console.log("✅ NOTIFICATIONS: Loaded from Supabase:", supabaseNotifs.length);
          
          // Converti notifiche Supabase al nostro formato, ordinando per timestamp
          notifs = supabaseNotifs
            .map((n: UserNotificationRow) => ({
              id: n.id,
              title: n.title,
              description: n.message,
              date: n.created_at,
              read: n.is_read === true,
              type: n.type
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Aggiorna localStorage con dati server
          saveNotifications(notifs);
        }
      }
      
      const unreadCount = notifs.filter(n => !n.read).length;
      console.log("📊 NOTIFICATIONS: Total:", notifs.length, "Unread:", unreadCount);
      
      // PHASE 1 AUDIT: Log unread count changes for tracing
      if (import.meta.env.VITE_BADGE_DEBUG === '1') {
        console.log('🔍 UNREAD COUNT CHANGE:', { 
          prev: unreadCount, 
          next: unreadCount,
          source: 'reloadNotifications'
        });
      }
      
      setNotifications(notifs);
      setUnreadCount(unreadCount);
      
      // Sync PWA app badge with real-time updates
      try {
        await syncAppIconBadge(unreadCount);
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.log('🔍 BADGE SYNC: Updated from Notice counter', unreadCount);
        }
      } catch (badgeError) {
        // Fail silently, don't impact UI
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.warn('🔍 BADGE SYNC: Failed', badgeError);
        }
      }
      
      // Legacy sync functions (keep existing behavior)
      syncFromNotice(unreadCount);
      updateBadgeState(unreadCount);
      
      // PHASE 1 AUDIT: Test Badge API when unreadCount > 0
      if (unreadCount > 0 && import.meta.env.VITE_BADGE_DEBUG === '1') {
        testBadgeAPI(unreadCount).catch(console.warn);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 200);
      
      lastReloadTimeRef.current = now;
      isInitialLoadRef.current = false;
      
      return true;
    } catch (e) {
      console.error("❌ NOTIFICATIONS: Error loading:", e);
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return false;
    }
  }, [saveNotifications]);

  // Segna tutte come lette
  const markAllAsRead = useCallback(async () => {
    if (notifications.length === 0) return;
    
    console.log("📖 Marcando tutte le notifiche come lette...");
    try {
      const user = await getCachedUser();
      if (user) {
        // Aggiorna su Supabase
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_deleted', false);
          
        if (error) {
          console.error("❌ Error marking notifications as read in Supabase:", error);
          return;
        } else {
          console.log("✅ Tutte le notifiche marcate come lette su Supabase");
        }
      }
      
      // Aggiorna localmente
      const updated = notifications.map(n => ({ ...n, read: true }));
      const saved = saveNotifications(updated);
      
      if (saved) {
        setNotifications(updated);
        setUnreadCount(0);
        
        // Sync PWA app badge
        try {
          await syncAppIconBadge(0);
        } catch (badgeError) {
          // Fail silently
        }
        syncFromNotice(0);
        updateBadgeState(0);
        
        listeners.forEach(fn => fn());
        console.log("✅ Stato locale aggiornato");
      }
    } catch (error) {
      console.error("❌ Error in markAllAsRead:", error);
    }
  }, [notifications, saveNotifications]);

  // FIXED: Setup Supabase realtime subscription con maggiore responsività
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const user = await getCachedUser();
      if (!user) return;
      
      console.log('🔔 NOTIFICATIONS: Setting up real-time subscription for user:', user.id);
      
      const channel = supabase
        .channel('notification-changes')
        .on('postgres_changes', 
            {
              event: '*', 
              schema: 'public', 
              table: 'user_notifications',
              filter: `user_id=eq.${user.id}`
            }, 
            (payload) => {
              console.log('🔔 NOTIFICATIONS: Real-time update received:', payload);
              // FIXED: Reload immediato per eventi INSERT/UPDATE
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                console.log('🔔 NOTIFICATIONS: New notification detected, forcing reload');
                reloadNotifications(true);
              }
            }
        )
        .subscribe();
      
      return () => {
        console.log('🔔 NOTIFICATIONS: Unsubscribing from real-time');
        supabase.removeChannel(channel);
      };
    };
    
    setupRealtimeSubscription();
  }, [reloadNotifications]);

  // 🔧 v3: Reduced polling frequency to prevent ERR_INSUFFICIENT_RESOURCES
  // Realtime subscription is the primary mechanism - polling is fallback only
  useEffect(() => {
    const startPolling = () => {
      // 🔧 v3: Poll every 60 seconds (was 5s which caused massive request storms!)
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          // Only log in DEV to avoid console spam
          if (import.meta.env.DEV) {
            console.log('🔄 NOTIFICATIONS: Periodic sync...');
          }
          reloadNotifications();
        }
      }, 60000); // 60 seconds (was 5s - too aggressive!)
      
      return interval;
    };
    
    // Initial load
    if (!isInitialLoadRef.current) {
      reloadNotifications().then(() => {
        console.log('📱 NOTIFICATIONS: Initial load completed');
        isInitialLoadRef.current = true;
      });
    }
    
    const pollingInterval = startPolling();
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [reloadNotifications]);

  // FIXED: Aggiorna quando la pagina diventa visibile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialLoadRef.current) {
        console.log("👁️ NOTIFICATIONS: Page visible, checking for updates...");
        reloadNotifications(true);
      }
    };
    
    const handleFocus = () => {
      if (!isInitialLoadRef.current) {
        console.log("🎯 NOTIFICATIONS: Window focused, syncing badge...");
        // Re-sync badge on focus in case of inconsistency
        syncFromNotice(unreadCount);
        syncAppIconBadge(unreadCount);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reloadNotifications, unreadCount]);

  // Singola notifica come letta
  const markAsRead = useCallback(async (id: string) => {
    console.log("📖 Marcando notifica come letta:", id);
    try {
      const user = await getCachedUser();
      if (user) {
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_read: true })
          .eq('id', id);
          
        if (error) {
          console.error("❌ Error marking notification as read in Supabase:", error);
        } else {
          console.log("✅ Notifica marcata come letta su Supabase");
        }
      }
      
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      const saved = saveNotifications(updated);
      
      if (saved) {
        const newUnreadCount = updated.filter(n => !n.read).length;
        
        // PHASE 1 AUDIT: Log unread count changes
        if (import.meta.env.VITE_BADGE_DEBUG === '1') {
          console.log('🔍 UNREAD COUNT CHANGE:', { 
            prev: unreadCount, 
            next: newUnreadCount,
            source: 'markAsRead',
            notificationId: id
          });
        }
        
        setNotifications(updated);
        setUnreadCount(newUnreadCount);
        
        // Sync PWA app badge
        try {
          await syncAppIconBadge(newUnreadCount);
        } catch (badgeError) {
          // Fail silently
        }
        syncFromNotice(newUnreadCount);
        updateBadgeState(newUnreadCount);
        
        listeners.forEach(fn => fn());
        console.log("✅ Stato locale aggiornato per notifica:", id);
      }
      return saved;
    } catch (error) {
      console.error("❌ Error in markAsRead:", error);
      return false;
    }
  }, [notifications, saveNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      console.log("Deleting notification:", id);
      const user = await getCachedUser();
      if (user) {
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_deleted: true })
          .eq('id', id);
          
        if (error) {
          console.error("Error deleting notification in Supabase:", error);
        }
      }
      
      const updated = notifications.filter(n => n.id !== id);
      const saved = saveNotifications(updated);
      
      if (saved) {
        const newUnreadCount = updated.filter(n => !n.read).length;
        setNotifications(updated);
        setUnreadCount(newUnreadCount);
        
        // Sync PWA app badge
        try {
          await syncAppIconBadge(newUnreadCount);
        } catch (badgeError) {
          // Fail silently
        }
        syncFromNotice(newUnreadCount);
        updateBadgeState(newUnreadCount);
        
        listeners.forEach(fn => fn());
      }
      return saved;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }, [notifications, saveNotifications]);

  // Aggiungi una nuova notifica UNIVOCA
  const addNotification = useCallback(async (notification: {title: string, description: string, type?: string}) => {
    const type = notification.type || NOTIFICATION_CATEGORIES.GENERIC;
    
    try {
      console.log("Adding UNIQUE notification:", notification);
      
      // Genera ID temporaneo con timestamp per garantire unicità
      let tempId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let newNotification = {
        id: tempId,
        title: notification.title,
        description: notification.description,
        date: new Date().toISOString(),
        read: false,
        type
      };
      
      const user = await getCachedUser();
      if (user) {
        const { error, data } = await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            type,
            title: notification.title,
            message: notification.description,
            is_read: false
          })
          .select<'*', UserNotificationRow>()
          .single();
          
        if (error) {
          console.error("Error saving notification to Supabase:", error);
        } 
        else if (data) {
          newNotification.id = data.id;
          console.log("✅ UNIQUE Notification saved to Supabase with ID:", data.id);
        }
      }
      
      const stored = localStorage.getItem(STORAGE_KEY);
      const currentNotifs: Notification[] = stored ? JSON.parse(stored) : [];
      
      // Aggiungi la nuova notifica in cima alla lista
      const updated = [newNotification, ...currentNotifs];
      const saved = saveNotifications(updated);
      
      if (saved) {
        const newUnreadCount = updated.filter(n => !n.read).length;
        setNotifications(updated);
        setUnreadCount(newUnreadCount);
        
        // Sync PWA app badge
        try {
          await syncAppIconBadge(newUnreadCount);
        } catch (badgeError) {
          // Fail silently
        }
        syncFromNotice(newUnreadCount);
        updateBadgeState(newUnreadCount);
        
        listeners.forEach(fn => fn());
        console.log("✅ UNIQUE Notification added successfully:", newNotification);
      }
      
      return saved;
    } catch (error) {
      console.error("Error adding notification:", error);
      return false;
    }
  }, [saveNotifications]);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.type === category);
  }, [notifications]);

  // FIXED: Manual reload function con force flag
  const manualReload = useCallback(async () => {
    console.log("🔄 NOTIFICATIONS: Manual reload requested");
    return await reloadNotifications(true);
  }, [reloadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    reloadNotifications: manualReload,
    markAllAsRead,
    markAsRead,
    addNotification,
    deleteNotification,
    getNotificationsByCategory
  };
}
