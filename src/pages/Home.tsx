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
    <div className="pb-20 min-h-screen bg-black w-full">
      <NotificationsBanner
        open={showNotificationsBanner}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={handleCloseNotifications}
        onMarkAllAsRead={markAllAsRead}
      />

      <div className="fixed top-0 right-4 z-50 h-[72px] flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="p-2.5 relative rounded-full bg-black/40 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          onClick={handleShowNotifications}
        >
          <Mail className="w-5 h-5" />
          <span className={`absolute -top-1 -right-1 font-bold border-2 border-black w-5 h-5 flex items-center justify-center rounded-full text-xs ${
            unreadCount > 0
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}>
            {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : ""}
          </span>
        </button>
        <button
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors"
          onClick={() => navigate("/settings")}
          aria-label="Impostazioni"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full space-y-6 pt-[72px]">
        <CurrentEventSection />
        <MysteryPrizesSection />
        <CluesSection />
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
