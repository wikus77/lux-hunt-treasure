
import React from "react";
import { motion } from "framer-motion";
import { X, Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsBannerProps {
  notifications: Notification[];
  open: boolean;
  unreadCount: number;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationsBanner: React.FC<NotificationsBannerProps> = ({
  notifications,
  open,
  unreadCount,
  onClose,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-black/90 backdrop-blur-xl border border-cyan-400/30 rounded-lg p-4 mx-4"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-orbitron">Notifiche ({unreadCount})</h3>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {notifications.length === 0 ? (
        <p className="text-white/60 text-center py-4">Nessuna notifica</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg ${
                notification.read ? "bg-white/5" : "bg-cyan-400/10"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{notification.title}</h4>
                  <p className="text-white/70 text-sm">{notification.message}</p>
                  <span className="text-white/50 text-xs">{notification.timestamp}</span>
                </div>
                <button
                  onClick={() => onDeleteNotification(notification.id)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="w-full mt-4 py-2 bg-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/30 transition-colors"
        >
          Segna tutto come letto
        </button>
      )}
    </motion.div>
  );
};

export default NotificationsBanner;
