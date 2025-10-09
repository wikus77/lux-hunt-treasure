import React, { useState } from "react";
import { motion } from "framer-motion";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import HomeHeader from "@/components/home/HomeHeader";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import BottomNavigation from "@/components/layout/BottomNavigation";
import TutorialOverlay from "@/components/tutorial/TutorialOverlay";
import { ActivateBanner } from "@/components/notifications/ActivateBanner";
import { FEATURE_FLAGS } from "@/config/features";
import { useUnifiedPushSubscription } from "@/hooks/useUnifiedPushSubscription";
import { useAuth } from "@/hooks/useAuth";

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

  const { isAuthenticated } = useAuth();
  const { isSubscribed } = useUnifiedPushSubscription();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Show activation banner if: feature flag ON, user authenticated, no active subscription, not dismissed
  const showActivateBanner = 
    FEATURE_FLAGS.PUSH_ACTIVATE_UI && 
    isAuthenticated && 
    !isSubscribed && 
    !bannerDismissed;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden pb-16">
      <CookiebotInit />
      <TutorialOverlay />
      
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
        
        {/* Push Activation Banner - Feature Flagged */}
        {showActivateBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-4 pt-20"
          >
            <ActivateBanner onDismiss={() => setBannerDismissed(true)} />
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
