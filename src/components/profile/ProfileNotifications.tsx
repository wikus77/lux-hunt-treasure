
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationItem from "@/components/notifications/NotificationItem";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

interface ProfileNotificationsProps {
  notifications: Notification[];
  markAllAsRead: () => void;
  unreadCount: number;
}

const ProfileNotifications = ({
  notifications,
  markAllAsRead,
  unreadCount
}: ProfileNotificationsProps) => {
  return (
    <div className="glass-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <Bell className="mr-2 h-5 w-5" /> Notifiche
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-projectx-pink rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
          >
            Segna tutte come lette
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Non hai notifiche.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileNotifications;
