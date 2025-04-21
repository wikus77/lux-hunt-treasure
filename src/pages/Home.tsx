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

  // Notifiche centralizzate
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    reloadNotifications
  } = useNotifications();

  // Rende il banner immediatamente up-to-date ad apertura
  const handleShowNotifications = () => {
    reloadNotifications();
    setShowNotificationsBanner(true);
  };

  const handleCloseNotifications = () => {
    setShowNotificationsBanner(false);
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      {/* Notifications Banner */}
      <NotificationsBanner
        open={showNotificationsBanner}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={handleCloseNotifications}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Header: tolta la scritta doppia "M1" qui, già presente nella MainLayout */}

      {/* Header controls moved to the right side */}
      <div className="fixed top-0 right-4 z-50 h-[72px] flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="p-2 relative rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors cursor-pointer"
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
          className="p-2 rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
          onClick={() => navigate("/settings")}
          aria-label="Impostazioni"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
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
