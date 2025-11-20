
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import NotificationItem from "./NotificationItem";
import type { Notification } from "@/hooks/useNotifications";
import { getCategoryInfo } from "@/utils/notificationCategories";

interface NotificationCategoryProps {
  category: string;
  notifications: Notification[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCategory: React.FC<NotificationCategoryProps> = ({
  category,
  notifications,
  onSelect,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryInfo = getCategoryInfo(category);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      className="rounded-[24px] transition-all duration-300 hover:shadow-lg mb-4 relative overflow-hidden"
      style={{
        background: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
      
      {/* Category Header */}
      <div
        onClick={handleToggle}
        className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 rounded-[20px] transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-lg font-semibold text-white font-orbitron">
              {categoryInfo.title}
            </h3>
            <p className="text-sm text-white/60">
              {notifications.length} {notifications.length === 1 ? 'notifica' : 'notifiche'}
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white text-xs rounded-full">
                  {unreadCount} nuove
                </span>
              )}
            </p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </div>

      {/* Notifications List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <NotificationItem
                    notification={notification}
                    onSelect={() => onSelect(notification.id)}
                    onDelete={() => onDelete(notification.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationCategory;
