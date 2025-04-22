
import { useState } from "react";
import { Mail, MoreVertical } from "lucide-react";
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import { useNotifications } from "@/hooks/useNotifications";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    reloadNotifications
  } = useNotifications();

  const handleShowNotifications = () => {
    reloadNotifications();
    setShowNotificationsBanner(true);
  };

  const handleCloseNotifications = () => {
    setShowNotificationsBanner(false);
  };

  return (
    <div className="min-h-screen bg-black w-full">
      <NotificationsBanner
        open={showNotificationsBanner}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={handleCloseNotifications}
        onMarkAllAsRead={markAllAsRead}
      />

      <div className="max-w-screen-xl mx-auto">
        <div className="w-full space-y-8 pt-6 px-4">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-2/3">
              <CurrentEventSection />
            </div>
            <div className="w-full sm:w-1/3">
              <MysteryPrizesSection />
            </div>
          </div>
          
          <CluesSection />
        </div>
      </div>

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileImage={localStorage.getItem('profileImage')}
      />
    </div>
  );
};

export default Home;
