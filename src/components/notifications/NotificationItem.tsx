
import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    description: string;
    date: string;
    read: boolean;
  };
  onSelect: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onSelect }) => {
  const { markAsRead } = useNotifications();
  const [isRead, setIsRead] = useState(notification.read);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleLongPress = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleClick = useCallback(() => {
    if (isRead) return;
    setIsRead(true);
    markAsRead(notification.id);
  }, [isRead, notification.id, markAsRead]);

  const startLongPress = useCallback(() => {
    const timer = setTimeout(() => {
      handleLongPress();
    }, 500);
    setLongPressTimer(timer);
  }, [handleLongPress]);

  const endLongPress = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const formattedDate = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: it
  });

  return (
    <div
      className={`p-3 rounded-md transition-colors cursor-pointer ${
        isRead ? 'bg-projectx-deep-blue bg-opacity-30' : 'bg-projectx-deep-blue'
      }`}
      onClick={handleClick}
      onMouseDown={startLongPress}
      onMouseUp={endLongPress}
      onMouseLeave={endLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={endLongPress}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${
          isRead ? 'bg-gray-700' : 'bg-projectx-pink'
        }`}>
          <Bell className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
          <span className="text-xs text-muted-foreground mt-2 block">{formattedDate}</span>
        </div>

        {!isRead && (
          <div className="w-2 h-2 rounded-full bg-red-600"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
