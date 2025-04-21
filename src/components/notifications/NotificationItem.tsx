
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNotifications } from "@/hooks/useNotifications";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();
  const [isRead, setIsRead] = useState(notification.read);

  const handleMarkAsRead = () => {
    if (isRead) return;
    setIsRead(true);
    // Usa la funzione centralizzata se possibile (cross-widget sync)
    markAsRead(notification.id);
  };

  const formattedDate = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: it
  });

  return (
    <div
      className={`p-3 rounded-md transition-colors ${
        isRead ? 'bg-projectx-deep-blue bg-opacity-30' : 'bg-projectx-deep-blue'
      }`}
      onClick={handleMarkAsRead}
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
          <div className="w-2 h-2 rounded-full bg-projectx-pink"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
