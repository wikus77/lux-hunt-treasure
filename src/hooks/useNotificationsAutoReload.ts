// FILE CREATO — BY JOSEPH MULE
import { useEffect } from 'react';

export const useNotificationsAutoReload = (reloadNotifications: () => void) => {
  // Force reload on component mount
  useEffect(() => {
    console.log('📱 NOTIFICATIONS: Page mounted, forcing reload');
    reloadNotifications();
  }, [reloadNotifications]);

  // Auto-reload every 5 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 NOTIFICATIONS: Auto-refreshing notifications');
        reloadNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reloadNotifications]);
};