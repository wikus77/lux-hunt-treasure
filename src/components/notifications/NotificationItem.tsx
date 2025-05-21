
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "@/hooks/useNotifications";
import { motion } from "framer-motion";

interface NotificationItemProps {
  notification: Notification;
  onSelect: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onSelect }) => {
  const formattedDate = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: it,
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-4 rounded-lg cursor-pointer backdrop-blur-md ${
        notification.read ? "bg-[#131524]/30" : "bg-gradient-to-r from-[#131524]/40 to-[#0a0a1a]/40 border-l-4 border-[#00D1FF]"
      }`}
      style={{
        boxShadow: notification.read 
          ? "0 4px 12px rgba(0, 0, 0, 0.1)" 
          : "0 6px 16px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 209, 255, 0.1)"
      }}
    >
      <div className="flex justify-between items-start">
        <h3 
          className={`text-base font-medium ${notification.read ? "text-white/70" : "text-[#00D1FF]"}`}
          style={!notification.read ? { textShadow: "0 0 5px rgba(0, 209, 255, 0.3)" } : {}}
        >
          {notification.title}
        </h3>
        <span className="text-xs text-white/40">{formattedDate}</span>
      </div>
      <p className="mt-2 text-sm text-white/60 line-clamp-2">{notification.description}</p>
    </motion.div>
  );
};

export default NotificationItem;
