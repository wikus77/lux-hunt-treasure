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
  
  // FIXED: Reduced polling interval to 5 seconds for better responsiveness
  const pollingIntervalRef = useRef<number | null>(null);
  const isInitialLoadDone = useRef<boolean>(false);
  
  // © 2025 Joseph MULÉ – M1SSION™ – Optimized notification polling
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Poll every 30 seconds for production optimization
      pollingIntervalRef.current = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          reloadNotifications();
        }
      }, 30000) as unknown as number; // 30 seconds - production optimized
    };
    
    // Initial load
    if (!isInitialLoadDone.current) {
      reloadNotifications().then(() => {
        isInitialLoadDone.current = true;
        startPolling();
      });
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [reloadNotifications]);

  // Handle opening notifications banner
  const openNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(true);
  }, []);

  // Handle closing notifications banner
  const closeNotificationsBanner = useCallback(() => {
    setNotificationsBannerOpen(false);
  }, []);

  // Handle opening notifications drawer
  const openNotificationsDrawer = useCallback(() => {
    setShowNotifications(true);
    // Reload when drawer opens for fresh data
    reloadNotifications();
  }, [setShowNotifications, reloadNotifications]);

  // Handle closing notifications drawer
  const closeNotificationsDrawer = useCallback(() => {
    setShowNotifications(false);
    // Mark notifications as read when drawer is closed
    markAllAsRead();
  }, [setShowNotifications, markAllAsRead]);

  // © 2025 Joseph MULÉ – M1SSION™ – Optimized notification creation
  const createNotification = useCallback(async (title: string, description: string, type = NOTIFICATION_CATEGORIES.GENERIC) => {
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
      
      if (result) {
        // Reload after successful creation
        setTimeout(() => {
          reloadNotifications();
        }, 500);
      }
      
      return result;
    } catch (error) {
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

  // Manual reload function
  const manualReload = useCallback(async () => {
    return await reloadNotifications();
  }, [reloadNotifications]);

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
    
    reloadNotifications: manualReload
  };
}
