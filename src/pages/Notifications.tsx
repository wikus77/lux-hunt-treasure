
import { useState } from "react";
import { Mail } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDialog from "@/components/notifications/NotificationDialog";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Notification } from "@/hooks/useNotifications";

const Notifications = () => {
  const { notifications, reloadNotifications } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  return (
    <div className="min-h-screen bg-black text-white pt-0 px-0 w-full">
      <div className="rounded-lg bg-projectx-deep-blue bg-opacity-80 p-8 text-center text-white w-full mt-4">
        <p className="mb-4 font-bold text-lg flex items-center justify-center gap-2">
          <Mail className="inline-block w-5 h-5 mr-2" />
          Le tue notifiche
        </p>
        {notifications.length === 0 ? (
          <p>🚧 Nessuna notifica disponibile per ora!</p>
        ) : (
          <ul className="space-y-4">
            {notifications
              .sort((a, b) => (b.date > a.date ? 1 : -1))
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onSelect={() => setSelectedNotification(notification)}
                />
              ))}
          </ul>
        )}
      </div>
      <NotificationDialog
        notification={selectedNotification}
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
};

export default Notifications;
