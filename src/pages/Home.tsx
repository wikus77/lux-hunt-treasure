
import { useState } from "react";
import HomeLayout from "@/components/home/HomeLayout";
import HomeContent from "@/components/home/HomeContent";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileImage } from "@/hooks/useProfileImage";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);
  const navigate = useNavigate();
  const { profileImage } = useProfileImage();

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
    <>
      <HomeLayout 
        profileImage={profileImage}
        showNotificationsBanner={showNotificationsBanner}
        notifications={notifications}
        unreadCount={unreadCount}
        onCloseNotifications={handleCloseNotifications}
        onMarkAllAsRead={markAllAsRead}
      >
        <HomeContent />
      </HomeLayout>

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileImage={profileImage}
      />
    </>
  );
};

export default Home;
