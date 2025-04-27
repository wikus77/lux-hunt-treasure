
import React from "react";
import { motion } from "framer-motion";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import HomeHeader from "@/components/home/HomeHeader";

type HomeLayoutProps = {
  children: React.ReactNode;
  profileImage: string | null;
  showNotificationsBanner: boolean;
  notifications: any[];
  unreadCount: number;
  onCloseNotifications: () => void;
  onMarkAllAsRead: () => void;
};

const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
  profileImage,
  showNotificationsBanner,
  notifications,
  unreadCount,
  onCloseNotifications,
  onMarkAllAsRead,
}) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <div className="relative z-20">
        {showNotificationsBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-0 z-[60] px-2 md:px-4 mt-16"
          >
            <NotificationsBanner
              notifications={notifications}
              onClose={onCloseNotifications}
              onMarkAllAsRead={onMarkAllAsRead}
            />
          </motion.div>
        )}
        {children}
      </div>
    </div>
  );
};

export default HomeLayout;
