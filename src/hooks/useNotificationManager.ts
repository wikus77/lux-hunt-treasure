
import { useState, useCallback } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function useNotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsBannerOpen, setNotificationsBannerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner
  };
}
