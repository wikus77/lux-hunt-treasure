// FILE CREATO — BY JOSEPH MULE
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Notification } from '@/hooks/useNotifications';
import NotificationCategory from './NotificationCategory';
import { NotificationsEmptyState } from './NotificationsEmptyState';

interface NotificationsListProps {
  notifications: Notification[];
  filter: 'all' | 'unread' | 'important';
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onReload: () => void;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  filter,
  onMarkAsRead,
  onDelete,
  onReload
}) => {
  const filteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read);
      case 'important':
        return notifications.filter(notification => notification.type === 'alert' || notification.type === 'critical');
      default:
        return notifications;
    }
  };

  const groupedNotifications = () => {
    const filtered = filteredNotifications();
    const grouped = filtered.reduce((acc, notification) => {
      const category = notification.type || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category] = [...acc[category], notification];
      return acc;
    }, {} as Record<string, typeof notifications>);
    
    return grouped;
  };

  return (
    <AnimatePresence>
      {Object.keys(groupedNotifications()).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedNotifications()).map(([category, categoryNotifications]) => (
            <NotificationCategory
              key={category}
              category={category}
              notifications={categoryNotifications}
              onSelect={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <NotificationsEmptyState onReload={onReload} />
      )}
    </AnimatePresence>
  );
};