
import { useState, useCallback } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'buzz' | 'map' | 'leaderboard' | 'weekly' | 'general';
}

export function useNotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsBannerOpen, setNotificationsBannerOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const createNotification = useCallback((title: string, message: string, type: Notification['type'] = 'general') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const createBuzzNotification = useCallback((message: string) => {
    createNotification("Buzz Attivato", message, "buzz");
  }, [createNotification]);

  const createMapBuzzNotification = useCallback((location: string) => {
    createNotification("Buzz Mappa", `Nuovo buzz in ${location}`, "map");
  }, [createNotification]);

  const createLeaderboardNotification = useCallback((position: number) => {
    createNotification("Classifica", `Sei salito al ${position}º posto!`, "leaderboard");
  }, [createNotification]);

  const createWeeklyNotification = useCallback((reward: string) => {
    createNotification("Ricompensa Settimanale", `Hai ricevuto: ${reward}`, "weekly");
  }, [createNotification]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const openNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(true);
  }, []);

  const closeNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(false);
  }, []);

  const openNotificationsDrawer = useCallback(() => {
    setNotificationsDrawerOpen(true);
  }, []);

  const closeNotificationsDrawer = useCallback(() => {
    setNotificationsDrawerOpen(false);
  }, []);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner,
    notificationsDrawerOpen,
    openNotificationsDrawer,
    closeNotificationsDrawer,
    createNotification,
    createBuzzNotification,
    createMapBuzzNotification,
    createLeaderboardNotification,
    createWeeklyNotification
  };
}
