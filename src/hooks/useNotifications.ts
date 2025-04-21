
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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Carica le notifiche da localStorage
  const reloadNotifications = useCallback(() => {
    const stored = localStorage.getItem('notifications');
    const notifs: Notification[] = stored ? JSON.parse(stored) : [];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  }, []);

  // Segna tutte come lette
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    setNotifications(updated);
    setUnreadCount(0);
    // Notifica gli altri listener del cambiamento
    listeners.forEach(fn => fn());
  }, [notifications]);

  // Aggiorna in realtime se qualcuno chiama reload da altrove (es: altro tab o altra sezione)
  useEffect(() => {
    const listener = () => reloadNotifications();
    listeners.push(listener);

    // Eventuale cross-tab sync
    const storageEvent = (e: StorageEvent) => {
      if (e.key === 'notifications') {
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
    localStorage.setItem('notifications', JSON.stringify(updated));
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    listeners.forEach(fn => fn());
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    reloadNotifications,
    markAllAsRead,
    markAsRead,
  };
}
