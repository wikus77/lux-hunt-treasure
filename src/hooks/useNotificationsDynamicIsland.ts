// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Notifications Dynamic Island Integration - FIXED for new Context

import { useEffect, useRef } from 'react';
import { useDynamicIsland } from '@/contexts/DynamicIslandContext';
import { Notification } from './useNotifications';

export const useNotificationsDynamicIsland = (notifications: Notification[]) => {
  const { updateData, setPage } = useDynamicIsland();
  const prevUnreadRef = useRef<number>(-1);

  // Update Dynamic Island when unread count changes
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Only update if count actually changed
    if (unreadCount === prevUnreadRef.current) return;
    prevUnreadRef.current = unreadCount;
    
    console.log('📨 NOTIFICATIONS: Updating Dynamic Island unread count:', unreadCount);
    
    updateData({ unreadCount });
  }, [notifications, updateData]);

  // Set page to notifications when component mounts
  useEffect(() => {
    setPage('notifications');
    return () => {
      // Reset to default when leaving notifications page
      setPage('default');
    };
  }, [setPage]);

  const updateDynamicIslandOnRead = (notificationId: string) => {
    const remainingUnread = notifications.filter(n => !n.read && n.id !== notificationId).length;
    console.log('📨 NOTIFICATIONS: Marked as read, remaining:', remainingUnread);
    updateData({ unreadCount: remainingUnread });
  };

  const closeDynamicIsland = () => {
    // No-op - Dynamic Island is managed globally now
    console.log('📨 NOTIFICATIONS: closeDynamicIsland called (no-op)');
  };

  return {
    updateDynamicIslandOnRead,
    closeDynamicIsland
  };
};
