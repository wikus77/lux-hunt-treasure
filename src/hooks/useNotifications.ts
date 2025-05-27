import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tipizzazione
export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type?: string;
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

  // Carica le notifiche da Supabase con rate limiting migliorato
  const reloadNotifications = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastReloadTimeRef.current < 3000 && !isInitialLoadRef.current) {
      console.log("⏱️ Skipping reload due to rate limiting");
      return true;
    }
    
    try {
      console.log("🔄 Reloading notifications UNIVOCHE...");
      
      if (isInitialLoadRef.current || now - lastReloadTimeRef.current > 3000) {
        setIsLoading(true);
      }
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Carica da localStorage come fallback
      const stored = localStorage.getItem(STORAGE_KEY);
      let notifs: Notification[] = stored ? JSON.parse(stored) : [];
      
      // Se l'utente è autenticato, carica da Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("👤 Utente autenticato, caricamento da Supabase...");
        const { data: supabaseNotifs, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('is_deleted', false)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("❌ Error fetching notifications from Supabase:", error);
        } else if (supabaseNotifs && supabaseNotifs.length > 0) {
          console.log("✅ Loaded UNIQUE notifications from Supabase:", supabaseNotifs.length);
          
          // Converti notifiche Supabase al nostro formato, ordinando per timestamp
          notifs = supabaseNotifs
            .map(n => ({
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
      console.log("📊 Loaded notifications:", notifs.length, "Unread:", unreadCount);
      console.log("🔍 Checking for unique content...");
      
      // Log dei contenuti per verificare unicità
      notifs.slice(0, 3).forEach((n, i) => {
        console.log(`📝 Notifica ${i + 1}:`, n.description.substring(0, 50) + "...");
      });
      
      setNotifications(notifs);
      setUnreadCount(unreadCount);
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 200);
      
      lastReloadTimeRef.current = now;
      isInitialLoadRef.current = false;
      
      return true;
    } catch (e) {
      console.error("❌ Errore nel caricamento delle notifiche:", e);
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
      const { data: { user } } = await supabase.auth.getUser();
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
        listeners.forEach(fn => fn());
        console.log("✅ Stato locale aggiornato");
      }
    } catch (error) {
      console.error("❌ Error in markAllAsRead:", error);
    }
  }, [notifications, saveNotifications]);

  // Aggiorna in realtime se qualcuno chiama reload da altrove (es: altro tab o altra sezione)
  // But limit how often we update to prevent flickering
  useEffect(() => {
    const listener = () => {
      const now = Date.now();
      if (now - lastReloadTimeRef.current > 3000 || isInitialLoadRef.current) {
        reloadNotifications();
      }
    };
    listeners.push(listener);

    const storageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const now = Date.now();
        if (now - lastReloadTimeRef.current > 3000 || isInitialLoadRef.current) {
          reloadNotifications();
        }
      }
    };
    window.addEventListener('storage', storageEvent);

    if (isInitialLoadRef.current) {
      reloadNotifications();
    }

    return () => {
      listeners = listeners.filter(fn => fn !== listener);
      window.removeEventListener('storage', storageEvent);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [reloadNotifications]);

  // Setup Supabase realtime subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
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
              console.log('Realtime notification update:', payload);
              const now = Date.now();
              if (now - lastReloadTimeRef.current > 3000) {
                reloadNotifications(true);
              } else {
                setTimeout(() => {
                  reloadNotifications(true);
                }, 3000 - (now - lastReloadTimeRef.current));
              }
            }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    setupRealtimeSubscription();
  }, [reloadNotifications]);

  // Singola notifica come letta
  const markAsRead = useCallback(async (id: string) => {
    console.log("📖 Marcando notifica come letta:", id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
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
      const { data: { user } } = await supabase.auth.getUser();
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
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
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
      
      const { data: { user } } = await supabase.auth.getUser();
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
          .select()
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
        setNotifications(updated);
        setUnreadCount(prev => prev + 1);
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

  return {
    notifications,
    unreadCount,
    isLoading,
    reloadNotifications,
    markAllAsRead,
    markAsRead,
    addNotification,
    deleteNotification,
    getNotificationsByCategory
  };
}
