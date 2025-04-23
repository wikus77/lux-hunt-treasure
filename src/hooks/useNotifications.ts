
import { useState, useCallback, useEffect } from "react";

// Tipizzazione
export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

// Listener globale per sincronizzazione istantanea tra component
let listeners: (() => void)[] = [];

// Costanti per la gestione dello storage
const MAX_NOTIFICATIONS = 50;
const STORAGE_KEY = 'notifications';

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
  const reloadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const notifs: Notification[] = stored ? JSON.parse(stored) : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (e) {
      console.error("Errore nel caricamento delle notifiche:", e);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  // Segna tutte come lette
  const markAllAsRead = useCallback(() => {
    if (notifications.length === 0) return;
    
    const updated = notifications.map(n => ({ ...n, read: true }));
    const saved = saveNotifications(updated);
    
    if (saved) {
      setNotifications(updated);
      setUnreadCount(0);
      // Notifica gli altri listener del cambiamento
      listeners.forEach(fn => fn());
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
  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    const saved = saveNotifications(updated);
    
    if (saved) {
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read).length);
      listeners.forEach(fn => fn());
    }
  }, [notifications, saveNotifications]);

  // Aggiungi una nuova notifica
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title,
      description: notification.description,
      date: new Date().toISOString(),
      read: false
    };
    
    const updated = [...notifications, newNotification];
    const saved = saveNotifications(updated);
    
    if (saved) {
      setNotifications(updated);
      setUnreadCount(unreadCount + 1);
      listeners.forEach(fn => fn());
    }
    
    return saved;
  }, [notifications, unreadCount, saveNotifications]);

  return {
    notifications,
    unreadCount,
    reloadNotifications,
    markAllAsRead,
    markAsRead,
    addNotification
  };
}
