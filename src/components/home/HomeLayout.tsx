
import React from "react";
import { motion } from "framer-motion";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import HomeHeader from "@/components/home/HomeHeader";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import BottomNavigation from "@/components/layout/BottomNavigation";

type HomeLayoutProps = {
  children: React.ReactNode;
  profileImage: string | null;
};

const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
  profileImage,
}) => {
  const {
    notifications,
    unreadCount,
    notificationsBannerOpen,
    closeNotificationsBanner,
    markAllAsRead,
    deleteNotification
  } = useNotificationManager();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden pb-16">
      <CookiebotInit />
      <div className="relative z-20">
        {notificationsBannerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-0 z-[60] px-2 md:px-4 mt-16"
          >
            <NotificationsBanner
              notifications={notifications}
              open={notificationsBannerOpen}
              unreadCount={unreadCount}
              onClose={closeNotificationsBanner}
              onMarkAllAsRead={markAllAsRead}
              onDeleteNotification={deleteNotification}
            />
          </motion.div>
        )}
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HomeLayout;
