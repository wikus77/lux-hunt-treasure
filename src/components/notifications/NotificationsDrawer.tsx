
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NotificationItem from "./NotificationItem";
import NotificationDialog from "./NotificationDialog";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDrawer = ({ open, onOpenChange }: NotificationsDrawerProps) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  return (
    <>
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
                    onSelect={() => handleSelectNotification(notification)}
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

      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
};

export default NotificationsDrawer;
