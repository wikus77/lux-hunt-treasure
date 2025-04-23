
import { useState, useEffect } from "react";
import HomeLayout from "@/components/home/HomeLayout";
import HomeContent from "@/components/home/HomeContent";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileImage } from "@/hooks/useProfileImage";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsBanner, setShowNotificationsBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profileImage } = useProfileImage();

  // Use try/catch to handle any potential errors in the notifications hook
  let notifications = [];
  let unreadCount = 0;
  let markAllAsRead = () => {};
  let reloadNotifications = () => {};

  try {
    const notificationsData = useNotifications();
    notifications = notificationsData.notifications;
    unreadCount = notificationsData.unreadCount;
    markAllAsRead = notificationsData.markAllAsRead;
    reloadNotifications = notificationsData.reloadNotifications;
  } catch (e) {
    console.error("Error loading notifications:", e);
    // Continue with empty notifications rather than crashing
  }

  const handleShowNotifications = () => {
    try {
      reloadNotifications();
      setShowNotificationsBanner(true);
    } catch (e) {
      console.error("Error showing notifications:", e);
    }
  };

  const handleCloseNotifications = () => {
    setShowNotificationsBanner(false);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="p-8 bg-red-800/30 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Errore</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-900 rounded-md">
            Riprova
          </button>
        </div>
      </div>
    );
  }

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
