
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onSelect: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onSelect, 
  onDelete 
}) => {
  const formattedDate = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: it,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-4 rounded-lg cursor-pointer backdrop-blur-md relative ${
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
      
      {/* Delete button */}
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
      >
        <Trash2 size={16} className="text-red-400 hover:text-red-300" />
      </button>
    </motion.div>
  );
};

export default NotificationItem;
