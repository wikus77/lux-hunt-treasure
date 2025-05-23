
import { useState, useEffect, useCallback, useRef } from "react";
import { useProfileNotifications } from "@/hooks/profile/useProfileNotifications";
import { useNotifications, NOTIFICATION_CATEGORIES } from "@/hooks/useNotifications";
import { toast } from "sonner";

export function useNotificationManager() {
  const { showNotifications, setShowNotifications } = useProfileNotifications();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead, 
    addNotification, 
    deleteNotification,
    reloadNotifications 
  } = useNotifications();
  
  const [notificationsBannerOpen, setNotificationsBannerOpen] = useState(false);
  
  // Add a polling mechanism for notifications with debounce logic
  const pollingIntervalRef = useRef<number | null>(null);
  
  // Setup notification polling - check every 30 seconds for new notifications
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Poll every 30 seconds
      pollingIntervalRef.current = window.setInterval(() => {
        console.log('Polling for new notifications...');
        reloadNotifications();
      }, 30000) as unknown as number;
    };
    
    // Initial load
    reloadNotifications().then(() => {
      console.log('Initial notifications loaded');
      startPolling();
    });
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
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
    // Force reload notifications when drawer is opened
    reloadNotifications().then(() => {
      console.log('Notifications reloaded on drawer open');
    });
  }, [setShowNotifications, reloadNotifications]);

  // Handle closing notifications drawer
  const closeNotificationsDrawer = useCallback(() => {
    setShowNotifications(false);
    // Mark notifications as read when drawer is closed
    markAllAsRead().then(() => {
      console.log('All notifications marked as read on drawer close');
    });
  }, [setShowNotifications, markAllAsRead]);

  // Create notification with proper type checking and categorization
  const createNotification = useCallback(async (title: string, description: string, type = NOTIFICATION_CATEGORIES.GENERIC) => {
    console.log(`Creating notification of type ${type}: ${title}`);
    
    // Use sonner toast to show notification
    toast(title, {
      description
    });
    
    // Add to notification system
    try {
      const result = await addNotification({ 
        title, 
        description, 
        type 
      });
      
      if (!result) {
        console.error("Failed to create notification");
      }
      
      // Force reload notifications after creating a new one
      await reloadNotifications();
      return result;
    } catch (error) {
      console.error("Error creating notification:", error);
      return false;
    }
  }, [addNotification, reloadNotifications]);

  // Create BUZZ notification
  const createBuzzNotification = useCallback(async (title: string, description: string) => {
    return await createNotification(title, description, NOTIFICATION_CATEGORIES.BUZZ);
  }, [createNotification]);

  // Create Map BUZZ notification
  const createMapBuzzNotification = useCallback(async (title: string, description: string) => {
    return await createNotification(title, description, NOTIFICATION_CATEGORIES.MAP_BUZZ);
  }, [createNotification]);

  // Create Leaderboard notification
  const createLeaderboardNotification = useCallback(async (title: string, description: string) => {
    return await createNotification(title, description, NOTIFICATION_CATEGORIES.LEADERBOARD);
  }, [createNotification]);

  // Create Weekly notification
  const createWeeklyNotification = useCallback(async (title: string, description: string) => {
    return await createNotification(title, description, NOTIFICATION_CATEGORIES.WEEKLY);
  }, [createNotification]);

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
    deleteNotification,
    
    // Create notifications by category
    createNotification, // Generic
    createBuzzNotification,
    createMapBuzzNotification,
    createLeaderboardNotification,
    createWeeklyNotification,
    
    reloadNotifications
  };
}
