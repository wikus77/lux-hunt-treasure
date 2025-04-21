
import React, { useEffect } from "react";
import NotificationItem from "./NotificationItem";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

interface NotificationsBannerProps {
  open: boolean;
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

const NotificationsBanner: React.FC<NotificationsBannerProps> = ({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllAsRead
}) => {
  useEffect(() => {
    if (open) {
      // Chiudi automaticamente il banner dopo 5s
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [open, onClose]);

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-[9999] flex justify-center transition-all duration-500 ${
        open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"
      }`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div className="relative w-full max-w-lg mx-auto bg-black border border-projectx-blue rounded-b-2xl shadow-2xl mt-2 px-4 py-4 animate-fade-in">
        <div className="flex items-center mb-2">
          <Bell className="w-5 h-5 text-projectx-neon-blue mr-2" />
          <span className="font-bold text-lg flex-1">Notifiche</span>
          <button
            className="text-projectx-neon-blue hover:text-projectx-pink rounded-full p-1 transition-colors"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Non hai notifiche.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="text-center mt-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs px-3 py-1 rounded-lg border border-projectx-neon-blue hover:bg-projectx-neon-blue/10 transition active:scale-95"
            >
              Segna tutte come lette
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsBanner;

