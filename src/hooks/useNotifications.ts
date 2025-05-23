
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tipizzazione
export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type?: string; // Added type for categorization
}

// Listener globale per sincronizzazione istantanea tra component
let listeners: (() => void)[] = [];

// Costanti per la gestione dello storage
const MAX_NOTIFICATIONS = 50;
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

  // Funzione sicura per salvare le notifiche
  const saveNotifications = useCallback((notifs: Notification[]) => {
    try {
      // Limita il numero di notifiche salvate
      const limitedNotifs = notifs.slice(-MAX_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifs));
      return true;
    } catch (error) {
      console.error("Errore nel salvataggio delle notifiche:", error);
      return false;
    }
  }, []);

  // Carica le notifiche da localStorage
  const reloadNotifications = useCallback(async () => {
    try {
      // First try to get from local storage (for offline support)
      const stored = localStorage.getItem(STORAGE_KEY);
      let notifs: Notification[] = stored ? JSON.parse(stored) : [];
      
      // If user is authenticated, fetch notifications from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: supabaseNotifs, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching notifications from Supabase:", error);
        } else if (supabaseNotifs && supabaseNotifs.length > 0) {
          // Convert Supabase notifications to our format
          notifs = supabaseNotifs.map(n => ({
            id: n.id,
            title: n.title,
            description: n.message,
            date: n.created_at,
            read: n.is_read,
            type: n.type
          }));
          
          // Update local storage with server data
          saveNotifications(notifs);
        }
      }
      
      console.log("Loaded notifications:", notifs);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (e) {
      console.error("Errore nel caricamento delle notifiche:", e);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [saveNotifications]);

  // Segna tutte come lette
  const markAllAsRead = useCallback(async () => {
    if (notifications.length === 0) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update in Supabase
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_read: true })
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error marking notifications as read in Supabase:", error);
          return;
        }
      }
      
      // Update locally
      const updated = notifications.map(n => ({ ...n, read: true }));
      const saved = saveNotifications(updated);
      
      if (saved) {
        setNotifications(updated);
        setUnreadCount(0);
        // Notifica gli altri listener del cambiamento
        listeners.forEach(fn => fn());
      }
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
    }
  }, [notifications, saveNotifications]);

  // Aggiorna in realtime se qualcuno chiama reload da altrove (es: altro tab o altra sezione)
  useEffect(() => {
    const listener = () => reloadNotifications();
    listeners.push(listener);

    // Eventuale cross-tab sync
    const storageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        reloadNotifications();
      }
    };
    window.addEventListener('storage', storageEvent);

    // Iniziale
    reloadNotifications();

    return () => {
      listeners = listeners.filter(fn => fn !== listener);
      window.removeEventListener('storage', storageEvent);
    };
  }, [reloadNotifications]);

  // Singola notifica come letta
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Update in Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_notifications')
          .update({ is_read: true })
          .eq('id', id);
          
        if (error) {
          console.error("Error marking notification as read in Supabase:", error);
        }
      }
      
      // Update locally regardless of Supabase result
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      const saved = saveNotifications(updated);
      
      if (saved) {
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
        listeners.forEach(fn => fn());
      }
      return saved;
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return false;
    }
  }, [notifications, saveNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      // Try to delete from Supabase if user is authenticated
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
      
      // Delete locally regardless of Supabase result
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

  // Aggiungi una nuova notifica
  const addNotification = useCallback(async (notification: {title: string, description: string, type?: string}) => {
    // Determine notification type
    const type = notification.type || NOTIFICATION_CATEGORIES.GENERIC;
    
    // Crea un nuovo oggetto notifica con ID, data e stato di lettura
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title,
      description: notification.description,
      date: new Date().toISOString(),
      read: false,
      type
    };
    
    try {
      console.log("Adding new notification:", newNotification);
      
      // Try to save to Supabase if user is authenticated
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
          // Use the Supabase-generated ID instead
          newNotification.id = data.id;
        }
      }
      
      // Ottieni prima le notifiche attuali per assicurarci di avere i dati più recenti
      const stored = localStorage.getItem(STORAGE_KEY);
      const currentNotifs: Notification[] = stored ? JSON.parse(stored) : [];
      
      // Aggiungi la nuova notifica
      const updated = [...currentNotifs, newNotification];
      const saved = saveNotifications(updated);
      
      if (saved) {
        // Aggiorna lo stato locale
        setNotifications(updated);
        setUnreadCount(prev => prev + 1);
        
        // Notifica altri listener
        listeners.forEach(fn => fn());
        console.log("Notification added successfully:", newNotification);
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
    reloadNotifications,
    markAllAsRead,
    markAsRead,
    addNotification,
    deleteNotification,
    getNotificationsByCategory
  };
}
