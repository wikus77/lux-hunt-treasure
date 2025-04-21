
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NotificationItem from "./NotificationItem";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDrawer = ({ open, onOpenChange }: NotificationsDrawerProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full bg-projectx-deep-blue p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-4 pb-1">
          <DialogTitle className="flex items-center gap-1 text-lg">
            <Bell className="h-5 w-5 mr-1" />
            Notifiche
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-projectx-pink rounded-full">
                {unreadCount}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tutte le notifiche ricevute di recente.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-5 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
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
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="text-center mt-6">
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                Segna tutte come lette
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDrawer;
