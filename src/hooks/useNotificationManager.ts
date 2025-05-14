
import { useState, useEffect, useCallback } from "react";
import { useProfileNotifications } from "@/hooks/profile/useProfileNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner"; // Use sonner toast consistently

export function useNotificationManager() {
  const { showNotifications, setShowNotifications } = useProfileNotifications();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead, 
    addNotification, 
    reloadNotifications 
  } = useNotifications();
  
  const [notificationsBannerOpen, setNotificationsBannerOpen] = useState(false);

  // Update notifications on mount and when showNotifications changes
  useEffect(() => {
    reloadNotifications();
  }, [reloadNotifications]);

  // Handle opening notifications banner
  const openNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(true);
    reloadNotifications();
  }, [reloadNotifications]);

  // Handle closing notifications banner
  const closeNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(false);
  }, []);

  // Handle opening notifications drawer
  const openNotificationsDrawer = useCallback(() => {
    setShowNotifications(true);
    reloadNotifications();
  }, [setShowNotifications, reloadNotifications]);

  // Handle closing notifications drawer
  const closeNotificationsDrawer = useCallback(() => {
    setShowNotifications(false);
  }, [setShowNotifications]);

  // Create notification with proper type checking
  const createNotification = useCallback((title: string, description: string) => {
    // Use sonner toast instead of any potential custom toast implementation
    toast(title, {
      description
    });
    
    return addNotification({ title, description });
  }, [addNotification]);

  return {
    // Notification data
    notifications,
    unreadCount,
    
    // Banner controls
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner,
    
    // Drawer controls
    notificationsDrawerOpen: showNotifications,
    openNotificationsDrawer,
    closeNotificationsDrawer,
    
    // Actions
    markAllAsRead,
    markAsRead,
    createNotification,
    reloadNotifications
  };
}
