// FILE CREATO — BY JOSEPH MULE
import { useEffect } from 'react';
import { useDynamicIsland } from './useDynamicIsland';
import { useMissionManager } from './useMissionManager';
import { Notification } from './useNotifications';

export const useNotificationsDynamicIsland = (notifications: Notification[]) => {
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();

  // Dynamic Island integration for NOTIFICATIONS
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length > 0) {
      console.log('📨 NOTIFICATIONS: Starting Dynamic Island for unread messages:', unreadNotifications.length);
      startActivity({
        missionId: `notifications-${Date.now()}`,
        title: "📨 Nuove notifiche",
        status: `${unreadNotifications.length} messaggi da HQ`,
        progress: 0,
        timeLeft: 0,
      });
    } else {
      console.log('📨 NOTIFICATIONS: All read, closing Dynamic Island');
      endActivity();
    }
  }, [notifications, startActivity, endActivity]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (currentMission?.name?.includes('Nuove notifiche') || currentMission?.name?.includes('📨')) {
        console.log('📨 NOTIFICATIONS: Cleaning up notification-related Live Activity');
        endActivity();
      }
    };
  }, [endActivity, currentMission]);

  const updateDynamicIslandOnRead = (notificationId: string) => {
    const remainingUnread = notifications.filter(n => !n.read && n.id !== notificationId).length;
    if (remainingUnread > 0) {
      updateActivity({
        status: `${remainingUnread} messaggi da HQ`,
      });
    } else {
      endActivity();
    }
  };

  const closeDynamicIsland = () => {
    endActivity();
  };

  return {
    updateDynamicIslandOnRead,
    closeDynamicIsland
  };
};