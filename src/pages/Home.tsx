
import { useState, useEffect } from "react";
import { User, Mail, MoreVertical } from "lucide-react";
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load profile image from localStorage
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Load notifications from localStorage
  const reloadNotifications = () => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: any) => !n.read).length);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    reloadNotifications();
    const interval = setInterval(reloadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShowNotifications = () => {
    reloadNotifications();
    setShowNotificationsBanner(true);
  };

  const handleCloseNotifications = () => {
    setShowNotificationsBanner(false);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((n: any) => ({
      ...n,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      {/* Notifications Banner */}
      <NotificationsBanner
        open={showNotificationsBanner}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={handleCloseNotifications}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Header controls moved to the fixed header area */}
      <div className="fixed top-0 left-0 z-50 h-[72px] flex items-center px-4">
        <button
          className="flex items-center"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-projectx-neon-blue bg-projectx-deep-blue flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-projectx-neon-blue" />
            )}
          </div>
        </button>
      </div>

      {/* Header controls moved to the right side */}
      <div className="fixed top-0 right-4 z-50 h-[72px] flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="p-2 relative rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors cursor-pointer"
          onClick={handleShowNotifications}
        >
          <Mail className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-projectx-pink text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
        profileImage={profileImage}
      />
    </div>
  );
};

export default Home;
