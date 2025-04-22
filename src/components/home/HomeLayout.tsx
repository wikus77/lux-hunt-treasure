
import { ReactNode } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";

interface HomeLayoutProps {
  children: ReactNode;
  profileImage: string | null;
  showNotificationsBanner: boolean;
  notifications: any[];
  unreadCount: number;
  onCloseNotifications: () => void;
  onMarkAllAsRead: () => void;
}

const HomeLayout = ({
  children,
  profileImage,
  showNotificationsBanner,
  notifications,
  unreadCount,
  onCloseNotifications,
  onMarkAllAsRead
}: HomeLayoutProps) => {
  return (
    <div className="min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      
      <NotificationsBanner
        open={showNotificationsBanner}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={onCloseNotifications}
        onMarkAllAsRead={onMarkAllAsRead}
      />

      <div className="h-[72px] w-full" />

      <div className="max-w-screen-xl mx-auto">
        <div className="w-full space-y-8 pt-6 px-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
